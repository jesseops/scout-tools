(() => {
  window.handoutApp = function handoutApp() {
    return {
      parentTitle: "Parent Handout",
      leaderTitle: "Leader Notes",
      denChiefTitle: "Den Chief Instructions",
      logoDataUrl: null,
      watermarkDataUrl: null,
      parentMarkdown: "## Meeting Focus\n- Overview of tonight's theme\n- Items to bring\n\n## Family Reminders\n- Upcoming events\n- Snacks and allergies",
      leaderMarkdown:
        "## Gathering (5 minutes)\n- Quick welcome activity\n- Review den code\n\n## Main Activity (20 minutes)\n- Key steps\n- Required materials\n\n## Closing (5 minutes)\n- Recap\n- Awards and reminders",
      denChiefMarkdown:
        "## Before the Meeting\n- Help set up stations\n- Greet new Scouts\n\n## During the Meeting\n- Lead the opening\n- Assist with activities\n\n## After the Meeting\n- Help clean up\n- Gather feedback",

      onLogoChange(event) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
          this.logoDataUrl = e.target.result;
        };
        reader.readAsDataURL(file);
      },

      onWatermarkChange(event) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
          this.watermarkDataUrl = e.target.result;
        };
        reader.readAsDataURL(file);
      },

      resetAll() {
        this.logoDataUrl = null;
        this.watermarkDataUrl = null;
        this.parentMarkdown =
          "## Meeting Focus\n- Overview of tonight's theme\n- Items to bring\n\n## Family Reminders\n- Upcoming events\n- Snacks and allergies";
        this.leaderMarkdown =
          "## Gathering (5 minutes)\n- Quick welcome activity\n- Review den code\n\n## Main Activity (20 minutes)\n- Key steps\n- Required materials\n\n## Closing (5 minutes)\n- Recap\n- Awards and reminders";
        this.denChiefMarkdown =
          "## Before the Meeting\n- Help set up stations\n- Greet new Scouts\n\n## During the Meeting\n- Lead the opening\n- Assist with activities\n\n## After the Meeting\n- Help clean up\n- Gather feedback";
      },

      renderSections(md) {
        if (!window.marked) return "";
        const raw = window.marked.parse(md || "", { breaks: true });
        const container = document.createElement("div");
        container.innerHTML = raw;
        const nodes = Array.from(container.childNodes);
        const sectioned = document.createElement("div");
        let current = null;

        nodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE && node.tagName === "H2") {
            if (current) sectioned.appendChild(current);
            current = document.createElement("section");
            current.className = "md-section";
            current.appendChild(node);
          } else {
            if (!current) {
              current = document.createElement("section");
              current.className = "md-section";
            }
            current.appendChild(node);
          }
        });

        if (current) sectioned.appendChild(current);
        return sectioned.innerHTML;
      },

      async ensureHtml2Pdf() {
        if (window.html2pdf) return;
        await new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "../../assets/js/html2pdf.bundle.min.js";
          script.onload = resolve;
          script.onerror = () => reject(new Error("Unable to load PDF library."));
          document.head.appendChild(script);
        });
      },

      async downloadPdf() {
        await this.ensureHtml2Pdf();

        const element = document.getElementById("print-root");
        const html = document.documentElement;
        const originalTheme = html.dataset.theme;
        const originalMode = html.dataset.themeMode;
        html.dataset.theme = "light";
        html.dataset.themeMode = "light";

        const opt = {
          margin: 0.25,
          filename: "den-meeting-plan.pdf",
          image: { type: "jpeg", quality: 0.95 },
          html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
          jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
          pagebreak: { mode: ["css", "legacy"] },
        };

        await this.$nextTick();
        await html2pdf().set(opt).from(element).save();

        html.dataset.theme = originalTheme || "light";
        html.dataset.themeMode = originalMode || "system";
      },
    };
  };
})();
