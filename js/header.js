/* ── Header Component ── */

const Header = {
  init() {
    this.renderCartCount();
    EventBus.on('cart:changed', () => this.renderCartCount());

    // Search
    const form = document.getElementById('hdr-search-form');
    form?.addEventListener('submit', e => {
      e.preventDefault();
      const q = document.getElementById('hdr-search-input').value.trim();
      if (q) {
        Store.query = q;
        Store.filters = { category: '', minPrice: 0, maxPrice: 50000, rating: 0, inStock: false };
        Router.go('#/search/' + encodeURIComponent(q));
      }
    });

    // Mobile menu
    document.getElementById('hdr-menu-btn')?.addEventListener('click', () => this.openMobileNav());

    // Sub-nav active state
    window.addEventListener('hashchange', () => this.updateSubNav());
    this.updateSubNav();
  },

  renderCartCount() {
    const el = document.getElementById('cart-count');
    if (el) {
      const c = Store.cartCount();
      el.textContent = c;
      el.style.display = c > 0 ? 'flex' : 'none';
    }
  },

  updateSubNav() {
    const hash = location.hash.slice(1) || '/';
    document.querySelectorAll('.hdr-sub__link').forEach(link => {
      const href = link.getAttribute('href')?.slice(1) || '/';
      link.classList.toggle('hdr-sub__link--active',
        hash === href || (href !== '/' && hash.startsWith(href)));
    });
  },

  openMobileNav() {
    const nav = document.getElementById('mobile-nav');
    nav?.classList.add('open');
    document.body.style.overflow = 'hidden';
  },

  closeMobileNav() {
    const nav = document.getElementById('mobile-nav');
    nav?.classList.remove('open');
    document.body.style.overflow = '';
  }
};
