/* ── Product Listing Page ── */

const ProductsPage = {
  page: 1,
  perPage: 12,

  render(params = {}) {
    const category = params.category || '';
    Store.filters.category = category;

    const app = document.getElementById('app');
    const catMeta = category ? getCategoryMeta(category) : null;
    const title = catMeta ? catMeta.name : 'All Products';

    const allProducts = filterAndSort(
      Store.query ? searchProducts(Store.query) : PRODUCTS,
      Store.filters,
      Store.sort
    );

    const totalPages = Math.ceil(allProducts.length / this.perPage);
    this.page = Math.min(this.page, totalPages || 1);
    const paged = allProducts.slice((this.page - 1) * this.perPage, this.page * this.perPage);

    app.innerHTML = `
      <div class="container">
        <div class="plp fade-in">
          <!-- Sidebar -->
          <aside class="plp__sidebar" id="plp-sidebar">
            <div class="filter-panel">
              <h3 class="filter-panel__title">Filters</h3>

              <!-- Category -->
              <div class="filter-group">
                <label class="filter-group__label">Category</label>
                <div class="filter-group__options">
                  ${CATEGORIES.map(c => `
                    <label class="filter-option">
                      <input type="radio" name="cat" value="${c.id}" ${Store.filters.category === c.id ? 'checked' : ''}
                             onchange="ProductsPage.setFilter('category','${c.id}')">
                      ${c.icon} ${c.name}
                      <span class="filter-option__count">${getByCategory(c.id).length}</span>
                    </label>
                  `).join('')}
                  <label class="filter-option">
                    <input type="radio" name="cat" value="" ${!Store.filters.category ? 'checked' : ''}
                           onchange="ProductsPage.setFilter('category','')">
                    All Categories
                  </label>
                </div>
              </div>

              <!-- Price -->
              <div class="filter-group">
                <label class="filter-group__label">Price Range</label>
                <div class="price-range">
                  <input type="range" min="0" max="5000" step="50" value="${Store.filters.maxPrice > 5000 ? 5000 : Store.filters.maxPrice}"
                         onchange="ProductsPage.setFilter('maxPrice',+this.value)"
                         oninput="document.getElementById('price-val').textContent='₹'+Number(this.value).toLocaleString()">
                  <div class="price-range__labels">
                    <span>₹0</span>
                    <span id="price-val">₹${Store.filters.maxPrice > 5000 ? '5,000+' : Store.filters.maxPrice.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <!-- Rating -->
              <div class="filter-group">
                <label class="filter-group__label">Customer Rating</label>
                <div class="filter-group__options">
                  ${[4, 3, 2, 1].map(r => `
                    <label class="filter-star" onclick="ProductsPage.setFilter('rating',${r})">
                      <input type="radio" name="rating" value="${r}" ${Store.filters.rating === r ? 'checked' : ''} style="display:none">
                      ${starsHTML(r)} <span style="font-size:13px;color:var(--t2)">& Up</span>
                    </label>
                  `).join('')}
                </div>
              </div>

              <!-- In stock -->
              <div class="filter-group">
                <label class="filter-option">
                  <input type="checkbox" ${Store.filters.inStock ? 'checked' : ''}
                         onchange="ProductsPage.setFilter('inStock',this.checked)">
                  In Stock Only
                </label>
              </div>

              <button class="filter-clear" onclick="ProductsPage.clearFilters()">Clear All Filters</button>
            </div>
          </aside>

          <!-- Main -->
          <div class="plp__main">
            <button class="plp__filter-toggle" onclick="document.getElementById('plp-sidebar').classList.toggle('open')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z"/></svg>
              Filters
            </button>

            <!-- Toolbar -->
            <div class="plp__toolbar">
              <div class="plp__result-count">
                ${Store.query ? `Results for "<strong>${Store.query}</strong>": ` : ''}
                <strong>${allProducts.length}</strong> ${title}
              </div>
              <div class="plp__sort">
                <label>Sort by:</label>
                <select onchange="ProductsPage.setSort(this.value)">
                  <option value="relevance" ${Store.sort === 'relevance' ? 'selected' : ''}>Relevance</option>
                  <option value="price-asc" ${Store.sort === 'price-asc' ? 'selected' : ''}>Price: Low to High</option>
                  <option value="price-desc" ${Store.sort === 'price-desc' ? 'selected' : ''}>Price: High to Low</option>
                  <option value="rating" ${Store.sort === 'rating' ? 'selected' : ''}>Avg. Customer Rating</option>
                  <option value="newest" ${Store.sort === 'newest' ? 'selected' : ''}>Newest Arrivals</option>
                  <option value="discount" ${Store.sort === 'discount' ? 'selected' : ''}>Discount</option>
                </select>
              </div>
            </div>

            <!-- Grid -->
            ${paged.length > 0 ? `
              <div class="plp__grid stagger">
                ${paged.map(p => productCardHTML(p)).join('')}
              </div>
              ${totalPages > 1 ? this.paginationHTML(totalPages) : ''}
            ` : `
              <div class="plp__empty">
                <div class="plp__empty__icon">🔍</div>
                <h3>No products found</h3>
                <p>Try adjusting your filters or search query.</p>
                <button class="btn btn--primary" onclick="ProductsPage.clearFilters()">Clear Filters</button>
              </div>
            `}
          </div>
        </div>
      </div>
    `;

    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  paginationHTML(total) {
    let html = '<div class="plp__pagination">';
    html += `<button class="plp__page ${this.page <= 1 ? 'plp__page--disabled' : ''}" onclick="ProductsPage.goPage(${this.page - 1})">‹</button>`;
    for (let i = 1; i <= total; i++) {
      if (total > 7 && i > 3 && i < total - 2 && Math.abs(i - this.page) > 1) {
        if (i === 4) html += `<span style="padding:0 4px">…</span>`;
        continue;
      }
      html += `<button class="plp__page ${i === this.page ? 'plp__page--active' : ''}" onclick="ProductsPage.goPage(${i})">${i}</button>`;
    }
    html += `<button class="plp__page ${this.page >= total ? 'plp__page--disabled' : ''}" onclick="ProductsPage.goPage(${this.page + 1})">›</button>`;
    html += '</div>';
    return html;
  },

  goPage(p) {
    this.page = p;
    this.render({ category: Store.filters.category });
  },

  setFilter(key, val) {
    Store.filters[key] = val;
    this.page = 1;
    if (key === 'category') Store.query = '';
    // Close mobile sidebar if open
    document.getElementById('plp-sidebar')?.classList.remove('open');
    this.render({ category: Store.filters.category });
  },

  setSort(val) {
    Store.sort = val;
    this.page = 1;
    this.render({ category: Store.filters.category });
  },

  clearFilters() {
    Store.filters = { category: '', minPrice: 0, maxPrice: 50000, rating: 0, inStock: false };
    Store.query = '';
    Store.sort = 'relevance';
    this.page = 1;
    document.getElementById('hdr-search-input').value = '';
    this.render({});
  }
};
