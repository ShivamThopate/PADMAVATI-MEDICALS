/* ── MedStore Core · Event Bus + Store + Router + Toast ── */

const EventBus = {
  _e: {},
  on(e, fn)  { (this._e[e] ??= []).push(fn); },
  off(e, fn) { this._e[e] = (this._e[e] || []).filter(f => f !== fn); },
  emit(e, d) { (this._e[e] || []).forEach(fn => fn(d)); }
};

/* ── Persistent Store ── */
const Store = {
  cart:    JSON.parse(localStorage.getItem('ms_cart')   || '[]'),
  recent:  JSON.parse(localStorage.getItem('ms_recent') || '[]'),
  query:   '',
  filters: { category: '', minPrice: 0, maxPrice: 50000, rating: 0, inStock: false },
  sort:    'relevance',

  /* Cart helpers */
  addToCart(p, qty = 1) {
    if (!Auth.user) {
      Auth.openModal();
      return false;
    }
    const it = this.cart.find(i => i.id === p.id);
    if (it) it.qty = Math.min(it.qty + qty, 10);
    else    this.cart.push({ ...p, qty });
    this._persist('cart');
    return true;
  },
  updateQty(id, qty) {
    const it = this.cart.find(i => i.id === id);
    if (it) { it.qty = Math.max(1, Math.min(qty, 10)); this._persist('cart'); }
  },
  removeFromCart(id) {
    this.cart = this.cart.filter(i => i.id !== id);
    this._persist('cart');
  },
  cartCount() { return this.cart.reduce((s, i) => s + i.qty, 0); },
  cartTotal() { return this.cart.reduce((s, i) => s + i.price * i.qty, 0); },

  /* Recently viewed */
  addRecent(p) {
    this.recent = [p, ...this.recent.filter(i => i.id !== p.id)].slice(0, 10);
    this._persist('recent');
  },

  _persist(key) {
    localStorage.setItem('ms_' + key, JSON.stringify(this[key]));
    EventBus.emit(key + ':changed');
  }
};

/* ── Hash Router ── */
const Router = {
  _routes: [],
  add(pattern, handler) { this._routes.push({ pattern, handler }); },
  go(hash) { location.hash = hash; },

  _match(p, h) {
    const pp = p.split('/'), hp = h.split('/');
    if (pp.length !== hp.length) return null;
    const params = {};
    for (let i = 0; i < pp.length; i++) {
      if (pp[i][0] === ':') params[pp[i].slice(1)] = decodeURIComponent(hp[i]);
      else if (pp[i] !== hp[i]) return null;
    }
    return params;
  },

  resolve() {
    window.scrollTo(0, 0);
    const path = location.hash.slice(1) || '/';
    for (const r of this._routes) {
      const m = this._match(r.pattern, path);
      if (m) { r.handler(m); return; }
    }
    this._routes[0]?.handler({});          // fallback → home
  },

  init() {
    window.addEventListener('hashchange', () => this.resolve());
    this.resolve();
  }
};

/* ── Toast ── */
const Toast = {
  show(msg, type = 'success') {
    const el = document.createElement('div');
    el.className = `toast toast--${type}`;
    el.textContent = msg;
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add('toast--visible'));
    setTimeout(() => {
      el.classList.remove('toast--visible');
      setTimeout(() => el.remove(), 300);
    }, 2500);
  }
};
