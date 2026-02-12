#!/usr/bin/env python3
"""
Guide to Safe Scouting PDF Generator (Polished Handbook Edition)

Upgrades:
- Book-style margins + better typography
- Running header + page numbers
- Real Table of Contents with page numbers
- PDF bookmarks / outline
- Improved list rendering and spacing
"""

import sys
import re
from datetime import datetime
from pathlib import Path

try:
    import requests
    from bs4 import BeautifulSoup, Tag

    from reportlab.lib.pagesizes import letter
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch
    from reportlab.lib.enums import TA_CENTER, TA_LEFT
    from reportlab.lib import colors

    from reportlab.platypus import (
        BaseDocTemplate,
        PageTemplate,
        Frame,
        Paragraph,
        Spacer,
        PageBreak,
        ListFlowable,
        ListItem,
        NextPageTemplate,
    )
    from reportlab.platypus.tableofcontents import TableOfContents
except ImportError as e:
    print(f"Error: Missing required package: {e}")
    print("Install with: pip install requests beautifulsoup4 reportlab")
    sys.exit(1)


GSS_SECTIONS = [
    ("Scouting America Scouter Code of Conduct",
     "https://www.scouting.org/health-and-safety/gss/bsa-scouter-code-of-conduct/"),
    ("Preface",
     "https://www.scouting.org/health-and-safety/gss/"),
    ("Youth Protection and Adult Leadership",
     "https://www.scouting.org/health-and-safety/gss/gss01/"),
    ("Aquatics Safety",
     "https://www.scouting.org/health-and-safety/gss/gss02/"),
    ("Camping",
     "https://www.scouting.org/health-and-safety/gss/gss03/"),
    ("Alcohol, Tobacco, and Drug Use and Abuse",
     "https://www.scouting.org/health-and-safety/gss/gss04/"),
    ("Medical Information and First Aid",
     "https://www.scouting.org/health-and-safety/gss/gss05/"),
    ("Chemical Fuels and Equipment",
     "https://www.scouting.org/health-and-safety/gss/gss06/"),
    ("Activity Planning and Risk Assessment",
     "https://www.scouting.org/health-and-safety/gss/gss07/"),
    ("Sports and Activities",
     "https://www.scouting.org/health-and-safety/gss/gss08/"),
    ("Insurance",
     "https://www.scouting.org/health-and-safety/gss/gss10/"),
    ("Transportation",
     "https://www.scouting.org/health-and-safety/gss/gss11/"),
    ("Winter Activities",
     "https://www.scouting.org/health-and-safety/gss/gss12/"),
    ("Animal and Insect Hazards",
     "https://www.scouting.org/health-and-safety/gss/gss13/"),
    ("Incident Reporting",
     "https://www.scouting.org/health-and-safety/gss/gss14/"),
    ("Exploring Program",
     "https://www.scouting.org/health-and-safety/gss/exploring-program/"),
]


def clean_text(text: str) -> str:
    text = text.replace("\u00a0", " ")
    text = re.sub(r"\s+", " ", text).strip()
    return text


def setup_styles():
    styles = getSampleStyleSheet()

    # Use built-in Helvetica for better legibility on phone/tablet PDF viewers.
    body_font = "Helvetica"
    body_bold = "Helvetica-Bold"

    # Title styles
    styles.add(ParagraphStyle(
        name="TitlePage",
        parent=styles["Heading1"],
        fontName=body_bold,
        fontSize=28,
        textColor=colors.HexColor("#CE1126"),
        alignment=TA_CENTER,
        spaceAfter=18,
    ))
    styles.add(ParagraphStyle(
        name="Subtitle",
        parent=styles["Normal"],
        fontName=body_font,
        fontSize=12,
        textColor=colors.grey,
        alignment=TA_CENTER,
        spaceAfter=8,
    ))

    # Section title style (our “H1” for PDF)
    styles.add(ParagraphStyle(
        name="SectionTitle",
        parent=styles["Heading1"],
        fontName=body_bold,
        fontSize=19,
        textColor=colors.HexColor("#003F87"),
        spaceBefore=18,
        spaceAfter=12,
        keepWithNext=True,
    ))

    # “H2” style used when HTML has h2/h3
    styles.add(ParagraphStyle(
        name="Subheading",
        parent=styles["Heading2"],
        fontName=body_bold,
        fontSize=15,
        textColor=colors.HexColor("#003F87"),
        spaceBefore=12,
        spaceAfter=8,
        keepWithNext=True,
    ))

    # Body
    styles["BodyText"].fontName = body_font
    styles["BodyText"].fontSize = 12
    styles["BodyText"].leading = 18
    styles["BodyText"].alignment = TA_LEFT
    styles["BodyText"].spaceBefore = 2
    styles["BodyText"].spaceAfter = 12

    # TOC styles
    styles.add(ParagraphStyle(
        name="TOCTitle",
        parent=styles["Heading1"],
        fontName=body_bold,
        fontSize=18,
        spaceAfter=12,
    ))
    styles.add(ParagraphStyle(
        name="TOCLevel1",
        parent=styles["Normal"],
        fontName=body_font,
        fontSize=12,
        leading=16,
        leftIndent=0,
        firstLineIndent=0,
        spaceBefore=3,
        spaceAfter=3,
    ))

    return styles


def fetch_page(url, timeout=30):
    try:
        print(f"  Fetching: {url}")
        headers = {"User-Agent": "Mozilla/5.0 (Scouting America Guide Archiver)"}
        resp = requests.get(url, headers=headers, timeout=timeout)
        resp.raise_for_status()
        return resp.content
    except requests.RequestException as e:
        print(f"  Error fetching {url}: {e}")
        return None


def extract_main_content(html):
    """Extractor tuned for WP/Elementor + common article layouts."""
    soup = BeautifulSoup(html, "html.parser")

    for el in soup.find_all(["nav", "header", "footer", "script", "style", "form", "noscript"]):
        el.decompose()

    selectors = [
        "article",
        ".entry-content",
        ".post-content",
        ".elementor-widget-theme-post-content",  # key for Elementor posts
        ".elementor-location-single",
        "main",
        "#main-content",
        "body",
    ]

    for sel in selectors:
        content = soup.select_one(sel)
        if content and content.get_text(" ", strip=True):
            return content

    return soup


def html_element_to_flowables(element, styles):
    """Convert HTML elements to ReportLab flowables (print-friendly)."""
    flowables = []

    # Only recurse over real Tag nodes; NavigableString has no .children.
    if not isinstance(element, Tag):
        return flowables

    if element.name in ["script", "style", "nav", "header", "footer", "noscript"]:
        return flowables

    # Headings: map to Subheading (keep hierarchy simple for print)
    if element.name in ["h2", "h3", "h4", "h5", "h6"]:
        text = clean_text(element.get_text(" ", strip=True))
        if len(text) > 1:
            flowables.append(Spacer(1, 0.08 * inch))
            flowables.append(Paragraph(text, styles["Subheading"]))
        return flowables

    # Paragraphs
    if element.name == "p":
        text = clean_text(element.get_text(" ", strip=True))
        if len(text) > 1 and not element.find_parent(["ul", "ol"]):
            flowables.append(Paragraph(text, styles["BodyText"]))
        return flowables

    # Lists
    if element.name in ["ul", "ol"]:
        items = []
        for li in element.find_all("li", recursive=False):
            text = clean_text(li.get_text(" ", strip=True))
            if text:
                items.append(ListItem(Paragraph(text, styles["BodyText"])))

        if items:
            bullet_type = "bullet" if element.name == "ul" else "1"
            flowables.append(ListFlowable(
                items,
                bulletType=bullet_type,
                leftIndent=16,
                rightIndent=6,
                bulletFontSize=10,
            ))
            flowables.append(Spacer(1, 0.06 * inch))
        return flowables

    if element.name == "br":
        flowables.append(Spacer(1, 0.04 * inch))
        return flowables

    # Default recursion for anything else (div/main/body/etc.)
    for child in element.children:
        if isinstance(child, Tag):
            flowables.extend(html_element_to_flowables(child, styles))

    return flowables


class HandbookDoc(BaseDocTemplate):
    """DocTemplate that builds a real TOC + bookmarks."""
    def __init__(self, filename, **kwargs):
        super().__init__(filename, **kwargs)
        self._section_count = 0

    def beforeDocument(self):
        # multiBuild runs multiple passes; reset counters so TOC keys stay stable.
        self._section_count = 0

    def afterFlowable(self, flowable):
        # Capture our custom section headings for TOC and PDF outline
        if isinstance(flowable, Paragraph) and flowable.style.name == "SectionTitle":
            self._section_count += 1
            title = flowable.getPlainText()

            key = f"sec_{self._section_count}"
            self.canv.bookmarkPage(key)
            self.canv.addOutlineEntry(title, key, level=0, closed=False)

            # Notify TableOfContents (level 0) with bookmark key so entries are clickable.
            page_num = self.page
            self.notify("TOCEntry", (0, title, page_num, key))


def draw_header_footer(canvas, doc, header_text="Guide to Safe Scouting"):
    canvas.saveState()

    # Header
    canvas.setFont("Times-Italic", 9)
    canvas.setFillGray(0.35)
    canvas.drawString(doc.leftMargin, letter[1] - 0.75 * inch, header_text)

    # Footer: page number
    canvas.setFont("Times-Roman", 9)
    canvas.setFillGray(0.35)
    canvas.drawRightString(letter[0] - doc.rightMargin, 0.65 * inch, f"{doc.page}")

    canvas.restoreState()


def create_title_page(styles):
    story = []
    story.append(Spacer(1, 2.0 * inch))
    story.append(Paragraph("Guide to Safe Scouting", styles["TitlePage"]))
    story.append(Paragraph("Scouting America", styles["Subtitle"]))
    story.append(Spacer(1, 0.3 * inch))
    story.append(Paragraph(
        f"Captured: {datetime.now().strftime('%B %d, %Y at %I:%M %p')}",
        styles["Subtitle"],
    ))
    story.append(Spacer(1, 0.5 * inch))
    story.append(Paragraph(
        "Unofficial compilation of the online Guide to Safe Scouting.<br/>"
        "Always refer to the official, most current version at:<br/>"
        "<link href='https://www.scouting.org/health-and-safety/gss/'>"
        "scouting.org/health-and-safety/gss/</link>",
        styles["BodyText"],
    ))
    story.append(PageBreak())
    return story


def create_toc(styles):
    toc = TableOfContents()
    toc.levelStyles = [styles["TOCLevel1"]]

    story = []
    story.append(Paragraph("Table of Contents", styles["TOCTitle"]))
    story.append(Spacer(1, 0.15 * inch))
    story.append(toc)
    story.append(PageBreak())
    return story


def process_section(title, url, styles):
    print(f"\nProcessing: {title}")
    flowables = []

    # Section title (captured for TOC + outline)
    flowables.append(Paragraph(title, styles["SectionTitle"]))
    flowables.append(Spacer(1, 0.12 * inch))

    html = fetch_page(url)
    if html:
        content = extract_main_content(html)
        preview_text = clean_text(content.get_text(" ", strip=True))
        if preview_text:
            snippet = preview_text[:180]
            if len(preview_text) > 180:
                snippet += "..."
            print(f"  Preview: {snippet}")
        else:
            print("  Warning: no extractable text found for this section.")
        flowables.extend(html_element_to_flowables(content, styles))
        print(f"  Added {len(flowables)} flowables")
    else:
        flowables.append(Paragraph(f"Could not retrieve content from {url}", styles["BodyText"]))

    return flowables


def generate_pdf(output_filename="guide_to_safe_scouting.pdf"):
    print("=" * 60)
    print("Guide to Safe Scouting PDF Generator (Polished)")
    print("=" * 60)

    styles = setup_styles()
    story = []

    # Book-ish margins (big readability win)
    left = right = 1.1 * inch
    top = 1.0 * inch
    bottom = 1.0 * inch

    # Correct Frame signature: (x, y, width, height)
    frame = Frame(
        left,
        bottom,
        letter[0] - left - right,
        letter[1] - top - bottom,
        id="normal",
    )

    doc = HandbookDoc(
        output_filename,
        pagesize=letter,
        leftMargin=left,
        rightMargin=right,
        topMargin=top,
        bottomMargin=bottom,
        title="Guide to Safe Scouting",
        author="Scouting America (compiled)",
    )

    title_tmpl = PageTemplate(
        id="Title",
        frames=[frame],
        onPage=lambda c, d: None,
    )
    body_tmpl = PageTemplate(
        id="Body",
        frames=[frame],
        onPage=lambda c, d: draw_header_footer(c, d, header_text="Guide to Safe Scouting"),
    )

    doc.addPageTemplates([title_tmpl, body_tmpl])

    # Title + TOC (no header/footer)
    story.append(NextPageTemplate("Title"))
    story.extend(create_title_page(styles))
    story.extend(create_toc(styles))

    # Body starts here (header/footer on)
    story.append(NextPageTemplate("Body"))

    for idx, (title, url) in enumerate(GSS_SECTIONS, 1):
        story.extend(process_section(title, url, styles))
        if idx < len(GSS_SECTIONS):
            story.append(PageBreak())

    print(f"\nBuilding PDF: {output_filename}")
    try:
        # multiBuild is required for accurate TOC pagination and internal links.
        doc.multiBuild(story)
        print(f"\n✓ Success! PDF created: {output_filename}")
        print(f"  File size: {Path(output_filename).stat().st_size / 1024:.1f} KB")
        return True
    except Exception as e:
        print(f"\n✗ Error building PDF: {e}")
        import traceback
        traceback.print_exc()
        return False


def main():
    output_file = "guide_to_safe_scouting.pdf"
    if len(sys.argv) > 1:
        output_file = sys.argv[1]
    return 0 if generate_pdf(output_file) else 1


if __name__ == "__main__":
    sys.exit(main())
