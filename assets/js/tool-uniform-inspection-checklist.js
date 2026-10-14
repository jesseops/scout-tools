(() => {
  window.inspectionSheet = function inspectionSheet() {
    return {
      patrolName: "",
      present: 0,
      date: "",
      inspector: "",
      sections: [
        {
          title: "Uniform Basics",
          items: [
            { key: "book", label: "Boy Scout Book (have to show it)", type: "per", points: 20, value: 0 },
            { key: "totin-chit", label: "Totin Chit (have to show it)", type: "per", points: 2.5, value: 0 },
            { key: "fire-chit", label: "Fire’n Chit (have to show it)", type: "per", points: 2.5, value: 0 },
            { key: "headgear", label: "Head Gear (Official Scout Hat/Beanie)*", type: "per", points: 5, value: 0 },
            { key: "class-a", label: "Shirt", type: "per", points: 5, value: 0 },
            { key: "neckerchief", label: "Neckwear*", type: "per", points: 5, value: 0 },
            { key: "pants", label: "Pants/Shorts", type: "per", points: 10, value: 0 },
            { key: "belt", label: "Belt", type: "per", points: 5, value: 0 },
            { key: "socks", label: "Socks", type: "per", points: 5, value: 0 },
            { key: "flag", label: "Patrol Flag", type: "pass", points: 10, value: "no" },
            { key: "epaulets", label: "Shoulder Epaulets", type: "per", points: 5, value: 0 },
          ],
        },
        {
          title: "Right Sleeve",
          items: [
            { key: "us-flag", label: "US Flag", type: "per", points: 2.5, value: 0 },
            { key: "patrol-emblem", label: "Patrol Emblem", type: "per", points: 7.5, value: 0 },
          ],
        },
        {
          title: "Left Sleeve",
          items: [
            { key: "csp", label: "Council Emblem (CSP)", type: "per", points: 2, value: 0 },
            { key: "troop-number", label: "Troop Number", type: "per", points: 3, value: 0 },
          ],
        },
        {
          title: "Left Pocket",
          items: [
            { key: "rank", label: "Rank", type: "per", points: 2, value: 0 },
            { key: "crest", label: "World Crest", type: "per", points: 2, value: 0 },
            { key: "name-tag", label: "Name Tag", type: "per", points: 6, value: 0 },
          ],
        },
      ],
      init() {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const dd = String(today.getDate()).padStart(2, "0");
        this.date = `${yyyy}-${mm}-${dd}`;
      },
      reset() {
        if (!confirm("Clear all fields?")) return;
        this.patrolName = "";
        this.present = 0;
        this.inspector = "";
        this.init();
        this.sections.forEach(section => section.items.forEach(item => {
          item.value = item.type === "pass" ? "no" : 0;
        }));
      },
      pointsFor(item) {
        if (item.type === "pass") {
          return item.value === "yes" ? item.points : 0;
        }
        if (!this.present || this.present <= 0) return 0;
        const count = Math.max(0, Math.min(this.present, Number(item.value) || 0));
        return (count / this.present) * item.points;
      },
      get maxPoints() {
        return this.sections.flatMap((section) => section.items).reduce((sum, item) => sum + item.points, 0);
      },
      get total() {
        return this.sections.flatMap((section) => section.items).reduce((sum, item) => sum + this.pointsFor(item), 0);
      },
      format(value) {
        return (Math.round(value * 100) / 100).toFixed(2);
      },
    };
  };

  const bindInspectionForm = (root = document) => {
    const main =
      root.id === "app-main"
        ? root
        : root.querySelector?.("#app-main") || root.closest?.("#app-main");

    if (!main) return;

    const form = main.querySelector("#inspectionForm");
    const btnPrint = main.querySelector("#btnPrint");

    if (!form || !btnPrint) return;

    if (btnPrint.dataset.bound !== "true") {
      btnPrint.dataset.bound = "true";
      btnPrint.addEventListener("click", () => {
        if (!form.reportValidity()) return;
        window.print();
      });
    }
  };

  document.addEventListener("DOMContentLoaded", () => {
    bindInspectionForm(document);
  });

  document.addEventListener("htmx:load", (event) => {
    bindInspectionForm(event.target);
  });
})();
