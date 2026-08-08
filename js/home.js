/* ── Home Page ── */

const HomePage = {
  heroIndex: 0,
  heroTimer: null,

  render() {
    const app = document.getElementById('app');
    const featured  = getFeatured();
    const recent    = Store.recent;

    app.innerHTML = `
      <div class="container" style="margin-top: 2rem;">
        <!-- Categories -->
        <section class="home-section fade-in">
          <h2 class="home-section__title">Shop by Category</h2>
          <div class="cat-grid stagger">
            ${CATEGORIES.map(c => `
              <a href="#/products/${c.id}" class="cat-card">
                <span class="cat-card__icon">${c.icon}</span>
                <span class="cat-card__name">${c.name}</span>
              </a>
            `).join('')}
          </div>
        </section>



        <!-- Trending Products -->
        <section class="home-section fade-in">
          <h2 class="home-section__title">Trending Products</h2>
          <div class="hscroll">
            ${PRODUCTS.sort((a, b) => b.reviews - a.reviews).slice(0, 10).map(p => productCardHTML(p)).join('')}
          </div>
        </section>

        <!-- Shop by Health Concern -->
        <section class="home-section fade-in">
          <h2 class="home-section__title">Shop by Health Concern</h2>
          <div class="concern-grid stagger">
            ${this.healthConcerns().map(c => `
              <a href="#/search/${encodeURIComponent(c.query)}" class="concern-card">
                <span class="concern-card__icon">${c.icon}</span>
                <span class="concern-card__name">${c.name}</span>
              </a>
            `).join('')}
          </div>
        </section>

        <!-- Featured / Bestsellers -->
        <section class="home-section fade-in">
          <h2 class="home-section__title">Bestsellers</h2>
          <div class="home-grid stagger">
            ${featured.map(p => productCardHTML(p)).join('')}
          </div>
        </section>

        ${recent.length > 0 ? `
        <!-- Recently Viewed -->
        <section class="recent-section fade-in">
          <h2 class="home-section__title" style="margin-top:0">Recently Viewed</h2>
          <div class="hscroll">
            ${recent.map(p => productCardHTML(p)).join('')}
          </div>
        </section>
        ` : ''}
      </div>
    `;


    window.scrollTo({ top: 0 });
  },



  healthConcerns() {
    return [
      { icon: '❤️',  name: 'Heart Health',      query: 'heart' },
      { icon: '🦴',  name: 'Bone & Joint',      query: 'bones' },
      { icon: '🛡️',  name: 'Immunity',           query: 'immunity' },
      { icon: '🧠',  name: 'Brain Health',       query: 'brain' },
      { icon: '🫁',  name: 'Respiratory',        query: 'respiratory' },
      { icon: '💪',  name: 'Fitness & Energy',   query: 'fitness' },
      { icon: '👁️',  name: 'Skin & Hair',        query: 'skin' },
      { icon: '🍎',  name: 'Diabetes Care',      query: 'diabetes' },
      { icon: '😴',  name: 'Sleep & Stress',     query: 'stress' },
      { icon: '👶',  name: 'Baby & Mother',      query: 'baby' },
    ];
  },

};
