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
            { key: "class-a", label: "Class A Shirt", type: "per", points: 10, value: 0 },
            { key: "neckerchief", label: "Neckerchief", type: "per", points: 5, value: 0 },
            { key: "pants", label: "BSA Pants/Shorts", type: "per", points: 10, value: 0 },
            { key: "belt", label: "BSA Belt", type: "per", points: 5, value: 0 },
            { key: "socks", label: "BSA Socks", type: "per", points: 10, value: 0 },
            { key: "epaulets", label: "Shoulder Epaulets", type: "per", points: 5, value: 0 },
            { key: "flag", label: "Patrol Flag", type: "pass", points: 15, value: "no" },
          ],
        },
        {
          title: "Right Sleeve",
          items: [
            { key: "us-flag", label: "US Flag", type: "per", points: 5, value: 0 },
            { key: "patrol-emblem", label: "Patrol Emblem", type: "per", points: 5, value: 0 },
          ],
        },
        {
          title: "Left Sleeve",
          items: [
            { key: "csp", label: "Council Emblem (CSP)", type: "per", points: 5, value: 0 },
            { key: "troop-number", label: "Troop Number", type: "per", points: 5, value: 0 },
          ],
        },
        {
          title: "Left Pocket",
          items: [
            { key: "rank", label: "Current Rank", type: "per", points: 10, value: 0 },
            { key: "crest", label: "Scouting World Crest", type: "per", points: 10, value: 0 },
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
    const btnStart = main.querySelector("#btnStart");
    const btnReset = main.querySelector("#btnReset");

    if (!form || !btnPrint || !btnStart || !btnReset) return;

    if (btnPrint.dataset.bound !== "true") {
      btnPrint.dataset.bound = "true";
      btnPrint.addEventListener("click", () => {
        if (!form.reportValidity()) return;
        window.print();
      });
    }

    if (btnStart.dataset.bound !== "true") {
      btnStart.dataset.bound = "true";
      btnStart.addEventListener("click", () => {
        form.reportValidity();
      });
    }

    if (btnReset.dataset.bound !== "true") {
      btnReset.dataset.bound = "true";
      btnReset.addEventListener("click", () => {
        if (!confirm("Clear all fields?")) return;
        const alpineRoot = main.matches("[x-data]") ? main : main.querySelector("[x-data]");
        if (alpineRoot && alpineRoot.__x && alpineRoot.__x.$data) {
          const data = alpineRoot.__x.$data;
          data.patrolName = "";
          data.present = 0;
          data.inspector = "";
          data.sections.forEach((section) => {
            section.items.forEach((item) => {
              item.value = item.type === "pass" ? "no" : 0;
            });
          });
        }
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
