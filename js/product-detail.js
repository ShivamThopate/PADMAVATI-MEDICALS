/* ── Product Detail Page ── */

const ProductDetailPage = {
  activeTab: 0,

  render(params) {
    const p = getProduct(params.id);
    if (!p) {
      document.getElementById('app').innerHTML = `
        <div class="container" style="padding:80px 16px;text-align:center">
          <div style="font-size:64px;margin-bottom:16px">😕</div>
          <h2 style="font-family:var(--fh);margin-bottom:8px">Product Not Found</h2>
          <p style="color:var(--t2);margin-bottom:24px">The product you're looking for doesn't exist.</p>
          <a href="#/" class="btn btn--primary">Go Home</a>
        </div>`;
      return;
    }

    Store.addRecent(p);
    const cat = getCategoryMeta(p.category);
    const discount = Math.round((1 - p.price / p.mrp) * 100);
    const related = PRODUCTS.filter(r => r.category === p.category && r.id !== p.id).slice(0, 6);
    this.activeTab = 0;

    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="container">
        <div class="pdp fade-in">
          <!-- Breadcrumb -->
          <nav class="pdp__breadcrumb">
            <a href="#/">Home</a> <span>›</span>
            <a href="#/products/${p.category}">${cat?.name || p.category}</a> <span>›</span>
            <span>${p.name}</span>
          </nav>

          <!-- Main -->
          <div class="pdp__main">
            <!-- Gallery -->
            <div class="pdp__gallery">
              <div class="pdp-img" style="background:${cat?.gradient || '#f5f5f5'};position:relative;">
                ${p.image ? `<img src="${p.image}" style="width:100%;height:100%;object-fit:cover;border-radius:16px;position:absolute;top:0;left:0;">` : `<div class="pdp-icon">${p.icon || '📦'}</div>`}
              </div>
              <div class="pdp__img-thumbs">
                <button class="pdp__thumb pdp__thumb--active" style="background:${cat?.gradient || '#f5f5f5'};position:relative;overflow:hidden;">
                  ${p.image ? `<img src="${p.image}" style="width:100%;height:100%;object-fit:cover;position:absolute;top:0;left:0;">` : p.icon}
                </button>
                <button class="pdp__thumb" style="background:linear-gradient(135deg,#f0f0f0,#e0e0e0)">
                  📦
                </button>
                <button class="pdp__thumb" style="background:linear-gradient(135deg,#f0f0f0,#e0e0e0)">
                  📋
                </button>
              </div>
            </div>

            <!-- Info -->
            <div class="pdp__info">
              <a href="#/products/${p.category}" class="pdp__brand">${p.brand}</a>
              <h1 class="pdp__name">${p.name}</h1>

              <div class="pdp__rating">
                ${starsHTML(p.rating, p.reviews)}
              </div>

              <div class="pdp__divider"></div>

              <div class="pdp__price-block">
                ${discount >= 10 ? `<span class="pdp__deal-tag">-${discount}%</span>` : ''}
                <span class="pdp__price"><span class="sym">₹</span>${p.price.toLocaleString()}</span>
                <span class="pdp__mrp">M.R.P.: <s>₹${p.mrp.toLocaleString()}</s> (${discount}% off)</span>
              </div>

              <p style="font-size:13px;color:var(--t2)">Inclusive of all taxes</p>

              <div class="pdp__divider"></div>

              <p class="pdp__stock ${p.inStock ? 'pdp__stock--in' : 'pdp__stock--out'}">
                ${p.inStock ? '✓ In Stock' : '✕ Out of Stock'}
              </p>

              <div class="pdp__qty">
                <label>Quantity:</label>
                <div class="qty" id="pdp-qty">
                  <button onclick="ProductDetailPage.updateQty(-1)">−</button>
                  <span id="pdp-qty-val">1</span>
                  <button onclick="ProductDetailPage.updateQty(1)">+</button>
                </div>
              </div>

              <div class="pdp__actions">
                <button class="btn btn--cart btn--lg" onclick="ProductDetailPage.addToCart('${p.id}')" ${!p.inStock ? 'disabled style="opacity:.5;cursor:not-allowed"' : ''}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM7.17 14.75l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1 1 0 0020 4H5.21l-.94-2H1v2h2l3.6 7.59-1.35 2.44C4.52 15.37 5.48 17 7 17h12v-2H7.42c-.14 0-.25-.11-.25-.25z"/></svg>
                  Add to Cart
                </button>
                <button class="btn btn--primary btn--lg" onclick="Toast.show('Order functionality coming soon!','info')">
                  Buy Now
                </button>
              </div>



              <p class="pdp__desc" style="font-size:14px;color:var(--t2);line-height:1.7">${p.desc}</p>
            </div>
          </div>

          <!-- Tabs -->
          <div class="pdp__tabs">
            <div class="pdp__tab-nav" id="pdp-tab-nav">
              ${['Description', 'Uses', 'Side Effects', 'Dosage'].map((t, i) => `
                <button class="pdp__tab-btn ${i === 0 ? 'pdp__tab-btn--active' : ''}"
                        onclick="ProductDetailPage.switchTab(${i})">${t}</button>
              `).join('')}
            </div>
            <div class="pdp__tab-panel" id="pdp-tab-panel">
              ${p.desc}
            </div>
          </div>

          <!-- Related -->
          ${related.length > 0 ? `
          <div class="pdp__related">
            <h2 class="pdp__related__title">Customers Who Bought This Also Bought</h2>
            <div class="hscroll">
              ${related.map(r => productCardHTML(r)).join('')}
            </div>
          </div>` : ''}
        </div>
      </div>
    `;

    this._product = p;
    this._qty = 1;
    window.scrollTo({ top: 0 });
  },

  _product: null,
  _qty: 1,

  updateQty(delta) {
    this._qty = Math.max(1, Math.min(this._qty + delta, 10));
    const el = document.getElementById('pdp-qty-val');
    if (el) el.textContent = this._qty;
  },

  addToCart(id) {
    const p = getProduct(id);
    if (p) {
      if (Store.addToCart(p, this._qty)) {
        Toast.show(`${p.name} added to cart!`);
      }
    }
  },

  switchTab(i) {
    this.activeTab = i;
    const p = this._product;
    if (!p) return;
    const content = [p.desc, p.uses, p.sideEffects, p.dosage];
    const panel = document.getElementById('pdp-tab-panel');
    if (panel) panel.textContent = content[i];

    document.querySelectorAll('.pdp__tab-btn').forEach((btn, idx) => {
      btn.classList.toggle('pdp__tab-btn--active', idx === i);
    });
  }
};
