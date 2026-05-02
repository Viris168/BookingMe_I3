// Load aside dynamically
function loadAside(type) {
  const filename = type === "hotel" ? "/component/partials/aside-hotel.html" : "/component/partials/aside.html";
  
  fetch(filename)
    .then(res => res.text())
    .then(html => {
      // Parse the fetched HTML and extract just the <aside> element
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const newAside = doc.querySelector("aside");
   
      const asideContainer = document.getElementById("aside");
      if (asideContainer && newAside) {
        asideContainer.innerHTML = ''; // clear current aside
        asideContainer.appendChild(newAside);
        if (window.BookingMEI18n) {
          window.BookingMEI18n.apply(asideContainer);
        }
      }
   
      // Init price slider
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
   
      // Rating pills
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
   
      // Reset
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

// Load section dynamically
fetch("/component/partials/section.html")
  .then(res => res.text())
  .then(html => {
    document.getElementById("section").innerHTML = html;
    if (window.BookingMEI18n) {
      window.BookingMEI18n.apply(document.getElementById("section"));
    }

    // Initial aside load based on section's sort dropdown
    const sortSelectEl = document.getElementById("property-sort");
    if (sortSelectEl) {
        loadAside(sortSelectEl.value);
        
        // Add event listener to dynamically switch aside when selection changes
        sortSelectEl.addEventListener("change", (e) => {
            loadAside(e.target.value);
        });
    } else {
        loadAside("campus");
    }

    // Use event delegation — works for buttons created later by app.js
    document.getElementById("section").addEventListener("click", function(e) {
        const btn = e.target.closest("#btn_detail");
        if (btn) {
          const productId = btn.closest("article").dataset.productId;
          window.location.href = `/component/partials/Property-Detai.html?id=${productId}`;
        }
    });

    // Now dynamically load app.js so it can bind to the elements in section
    const script = document.createElement("script");
    script.src = "/js/components/app.js";
    document.body.appendChild(script);
  })
  .catch(err => console.error("Error loading section:", err));
