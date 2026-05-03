fetch('/data/product.json')
.then(res => res.json())
.then(product => {
    const container = document.getElementById('student-container');
    const featured = product.slice(0, 6);
    container.innerHTML = featured.map(p => `
        <div class="room1">
        <img src="${p.image.replace('./', '')}" alt="${p.title}" height="200"
             onerror="this.src='assets/images/Image.png'">
        <div class="room1-info" style="padding: 0 15px;">
          <h3 style="font-size: 1.2em; margin: 0 0 5px 0; display: block; text-align: left;">${p.title}</h3>
          <p style="font-size: 0.9em; color: #666; margin: 0 0 5px 0;">$${p.price}/month</p>

          <p style="font-size: 0.9em; color: #666; margin: 0 0 10px 0;">
            <i class="fa-solid fa-location-dot"></i> ${p.location}
          </p>

          <hr style="border: none; border-top: 1px solid #eee; margin: 10px 0;">

          <div style="display: flex; gap: 12px; color: #666; overflow: hidden; white-space: nowrap;">
            ${p.features.slice(0, 2).map(f => `
              <span style="display: flex; align-items: center; gap: 4px; font-size: 0.85em;">
                <span class="material-symbols-outlined" style="font-size:16px">${f.icon}</span>
                ${f.label}
              </span>
            `).join('')}
          </div>

          <hr style="border: none; border-top: 1px solid #eee; margin: 10px 0;">

          <a href="/component/partials/Property-Detai.html?id=${p.id}" style="text-decoration: none;">
            <button class="btn" style="margin-top: 0; margin-bottom: 15px;">View Details</button>
          </a>
        </div>
      </div>
    `).join('');
});

    const container = document.getElementById('dest-container');
    const leftBtn = document.getElementById('dest-left');
    const rightBtn = document.getElementById('dest-right');
    const scrollStep = 320;

    leftBtn.addEventListener('click', () => {
      container.scrollBy({ left: -scrollStep, behavior: 'smooth' });
    });

    rightBtn.addEventListener('click', () => {
      container.scrollBy({ left: scrollStep, behavior: 'smooth' });
    });

    const studentContainer = document.getElementById('student-container');
    const studentLeftBtn = document.getElementById('student-left');
    const studentRightBtn = document.getElementById('student-right');

    studentLeftBtn.addEventListener('click', () => {
      studentContainer.scrollBy({ left: -scrollStep, behavior: 'smooth' });
    });

    studentRightBtn.addEventListener('click', () => {
      studentContainer.scrollBy({ left: scrollStep, behavior: 'smooth' });
    });

    const topContainer = document.getElementById('top-container');
    const topLeftBtn = document.getElementById('top-left');
    const topRightBtn = document.getElementById('top-right');

    topLeftBtn.addEventListener('click', () => {
      topContainer.scrollBy({ left: -scrollStep, behavior: 'smooth' });
    });

    topRightBtn.addEventListener('click', () => {
      topContainer.scrollBy({ left: scrollStep, behavior: 'smooth' });
    });