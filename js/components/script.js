// Load header
fetch("partials/header.html")
  .then(res => res.text())
  .then(html => {
    document.getElementById("header").innerHTML = html;

    // Init hamburger AFTER header is injected into the DOM
    const toggle = document.getElementById("menu-toggle");
    const menu = document.getElementById("mobile-menu");

    if (toggle && menu) {
      toggle.addEventListener("click", () => {
        const isOpen = menu.style.maxHeight && menu.style.maxHeight !== "0px";
        menu.style.maxHeight = isOpen ? "0px" : "400px";
        const icon = toggle.querySelector(".material-symbols-outlined");
        if (icon) icon.textContent = isOpen ? "menu" : "close";
      });
    }
  })
  .catch(err => console.error("Error loading header:", err));

// Load aside dynamically
function loadAside(type) {
  const filename = type === "hotel" ? "partials/aside-hotel.html" : "partials/aside.html";
  
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
            if (slider) {
                slider.value = 525;
                updateSlider();
            }
          }
          resetBtn.addEventListener("click", resetAll);
      }
   
      // Apply
      const applyBtn = document.getElementById("apply-btn");
      if (applyBtn) {
          applyBtn.addEventListener("click", () => {
            const checked = [...document.querySelectorAll('input[type="checkbox"]:checked')]
              .map(cb => cb.closest("label")?.querySelector("span:last-child")?.textContent)
              .filter(Boolean);
            const activeRating = document.querySelector(".rating-btn.bg-primary")?.dataset.rating;
            alert(
              `Filters applied!\nMax price: $${slider ? slider.value : 'N/A'}\nRating: ${activeRating ?? "any"}+\nSelected: ${checked.join(", ") || "none"}`
            );
          });
      }
    })
    .catch(err => console.error("Error loading aside:", err));
}

// Initial load
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



// Load footer
fetch("partials/footer.html")
  .then(res => res.text())
  .then(html => {
    document.getElementById("footer").innerHTML = html;
  })
  .catch(err => console.error("Error loading footer:", err));
