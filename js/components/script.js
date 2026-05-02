
function loadAside(type) {
  const filename = type === "hotel" ? "/component/partials/aside-hotel.html" : "/component/partials/aside.html";

  fetch(filename)
    .then(res => res.text())
    .then(html => {

      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const newAside = doc.querySelector("aside");

      const asideContainer = document.getElementById("aside");
      if (asideContainer && newAside) {
        asideContainer.innerHTML = '';
        asideContainer.appendChild(newAside);
        if (window.BookingMEI18n) {
          window.BookingMEI18n.apply(asideContainer);
        }
      }


      const slider = document.getElementById("price-range");
      const display = document.getElementById("price-display");

      if (slider && display) {
          function updateSlider() {
            const min = +slider.min, max = +slider.max, val = +slider.value;
            const pct = ((val - min) / (max - min)) * 100;
            slider.style.setProperty("--pct", pct + "%");
            display.textContent = val >= 1000 ? "$1000+" : `$${val}`;
          }
          slider.addEventListener("input", updateSlider);
          updateSlider();
      }


      const ratingBtns = document.querySelectorAll(".rating-btn");
      if (ratingBtns.length > 0) {
          ratingBtns.forEach(btn => {
            btn.addEventListener("click", () => {
              ratingBtns.forEach(b => {
                b.className =
                  "rating-btn px-3.5 py-1.5 rounded-full text-xs font-bold border border-slate-200 text-slate-500 bg-white hover:border-primary hover:text-primary transition-all";
              });
              btn.className =
                "rating-btn px-3.5 py-1.5 rounded-full text-xs font-bold border border-primary bg-primary text-white shadow-md shadow-primary/30";
            });
          });
      }


      const resetBtn = document.getElementById("reset-btn");
      if (resetBtn) {
          function resetAll() {
            document.querySelectorAll('input[type="checkbox"]').forEach(cb => (cb.checked = false));
            ratingBtns.forEach(b => {
              b.className =
                "rating-btn px-3.5 py-1.5 rounded-full text-xs font-bold border border-slate-200 text-slate-500 bg-white hover:border-primary hover:text-primary transition-all";
            });
            if (slider && display) {
                slider.value = 525;
                updateSlider();
            }
          }
          resetBtn.addEventListener("click", resetAll);
      }

      if (window.initProductFilterControls) {
        window.initProductFilterControls();
      }
      if (window.applyProductFilters) {
        window.applyProductFilters();
      }
    })
    .catch(err => console.error("Error loading aside:", err));
}


fetch("/component/partials/section.html")
  .then(res => res.text())
  .then(html => {
    document.getElementById("section").innerHTML = html;
    if (window.BookingMEI18n) {
      window.BookingMEI18n.apply(document.getElementById("section"));
    }


    const sortSelectEl = document.getElementById("property-sort");
    if (sortSelectEl) {
        loadAside(sortSelectEl.value);


        sortSelectEl.addEventListener("change", (e) => {
            loadAside(e.target.value);
        });
    } else {
        loadAside("campus");
    }


    document.getElementById("section").addEventListener("click", function(e) {
        const btn = e.target.closest("#btn_detail");
        if (btn) {
          const productId = btn.closest("article").dataset.productId;
          window.location.href = `/component/partials/Property-Detai.html?id=${productId}`;
        }
    });


    const script = document.createElement("script");
    script.src = "/js/components/app.js";
    document.body.appendChild(script);
  })
  .catch(err => console.error("Error loading section:", err));
