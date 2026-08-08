/* ── Admin Dashboard Component ── */

const AdminPage = {
  async render() {
    const app = document.getElementById('app');
    
    app.innerHTML = `<div class="container" style="padding:40px;text-align:center;">Loading admin dashboard...</div>`;
    
    let allOrders = [];
    try {
      allOrders = await fetchAllOrders();
    } catch (e) {
      console.error("Failed to fetch orders for admin", e);
    }

    app.innerHTML = `
      <div class="container">
        <div class="admin-page fade-in">
          <div class="admin-header">
            <h1>Admin Dashboard</h1>
            <button class="btn btn--outline" onclick="AdminPage.loadDummy()">
              Seed Dummy Data
            </button>
          </div>

          <div class="admin-grid">
            <!-- Add Product Form -->
            <div class="admin-card">
              <h2>Add New Product</h2>
              <form id="admin-add-form" class="admin-form" onsubmit="AdminPage.handleAdd(event)">
                <div class="form-group">
                  <label>Product Name</label>
                  <input type="text" id="add-name" required placeholder="e.g. Paracetamol 500mg">
                </div>
                
                <div class="form-group">
                  <label>Brand</label>
                  <input type="text" id="add-brand" required placeholder="e.g. HealthCare Plus">
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>Category</label>
                    <select id="add-category" required>
                      ${CATEGORIES.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Icon (Emoji Fallback)</label>
                    <input type="text" id="add-icon" placeholder="e.g. 💊" maxlength="2">
                  </div>
                </div>

                <div class="form-group">
                  <label>Product Image</label>
                  <input type="file" id="add-image" accept="image/*">
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>MRP (₹)</label>
                    <input type="number" id="add-mrp" required min="1" step="1" oninput="AdminPage.updatePreview()">
                  </div>
                  <div class="form-group">
                    <label>Discount (%)</label>
                    <input type="number" id="add-discount" required min="0" max="100" value="0" oninput="AdminPage.updatePreview()">
                  </div>
                </div>

                <div class="price-preview">
                  <span>Final Selling Price:</span>
                  <strong id="add-preview-price">₹0</strong>
                </div>

                <div class="form-group" style="margin-top:var(--s3)">
                  <label>Description</label>
                  <textarea id="add-desc" required placeholder="Brief product description..."></textarea>
                </div>

                <div class="form-group">
                  <label>
                    <input type="checkbox" id="add-featured"> Featured Product (Shows on Home)
                  </label>
                </div>

                <button type="submit" class="btn btn--primary btn--block">Add Product</button>
              </form>
            </div>

            <!-- Product List -->
            <div class="admin-card">
              <h2>Manage Products (${PRODUCTS.length})</h2>
              ${PRODUCTS.length === 0 ? `
                <div style="padding:var(--s6) 0;text-align:center;color:var(--t2)">
                  <div style="font-size:48px;margin-bottom:16px;opacity:0.5">📦</div>
                  <p>No products found in the store.</p>
                  <p>Add a product or click "Seed Dummy Data" to populate.</p>
                </div>
              ` : `
                <div class="admin-table-container">
                  <table class="admin-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Category</th>
                        <th>MRP</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${PRODUCTS.map(p => {
                        const cat = getCategoryMeta(p.category);
                        return `
                        <tr>
                          <td>
                            <div style="display:flex;align-items:center;gap:12px">
                              <div class="admin-table__img" style="background:${cat?.gradient || '#f5f5f5'}">
                                ${p.image ? `<img src="${p.image}" style="width:100%;height:100%;object-fit:cover;border-radius:4px;">` : (p.icon || '📦')}
                              </div>
                              <div>
                                <div class="admin-table__name">${p.name}</div>
                                <div class="admin-table__brand">${p.brand}</div>
                              </div>
                            </div>
                          </td>
                          <td>${cat?.name || p.category}</td>
                          <td style="text-decoration:line-through;color:var(--t2)">₹${p.mrp}</td>
                          <td style="font-weight:600">₹${p.price}</td>
                          <td>
                            <span style="color:${p.inStock ? 'var(--ok)' : 'var(--err)'};font-weight:600">
                              ${p.inStock ? 'In Stock' : 'Out of Stock'}
                            </span>
                          </td>
                          <td>
                            <button class="admin-table__del" onclick="AdminPage.deleteProduct('${p.id}')">Delete</button>
                          </td>
                        </tr>
                        `;
                      }).reverse().join('')}
                    </tbody>
                  </table>
                </div>
              `}
            </div>

            <!-- Manage Orders -->
            <div class="admin-card" style="grid-column: 1 / -1;">
              <h2>Manage Orders (${allOrders.length})</h2>
              ${allOrders.length === 0 ? `
                <div style="padding:var(--s6) 0;text-align:center;color:var(--t2)">
                  <p>No orders placed yet.</p>
                </div>
              ` : `
                <div class="admin-table-container">
                  <table class="admin-table">
                    <thead>
                      <tr>
                        <th>Items</th>
                        <th>User</th>
                        <th>Date</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${allOrders.map(o => {
                        const date = new Date(o.createdAt).toLocaleDateString();
                        const isCancelReq = o.status === 'Cancellation Requested';
                        return `
                        <tr style="${isCancelReq ? 'background-color: #fffbeb;' : ''}">
                          <td style="font-size:13px; max-width: 200px; white-space: normal;">
                            ${o.items ? o.items.map(i => `<div style="margin-bottom:2px">• ${i.name} (x${i.qty})</div>`).join('') : 'Unknown Item'}
                          </td>
                          <td style="font-size:13px;">
                            <div style="font-weight: 600;">${o.userName || 'User ' + o.userId.slice(0, 5)}</div>
                            ${o.userAddress ? `
                              <details style="margin-top: 4px; color: var(--t2);">
                                <summary style="cursor: pointer; font-weight: 600; font-size: 12px; color: var(--primary);">View Address</summary>
                                <div style="padding-top: 4px; line-height: 1.4; font-size: 12px;">
                                  ${o.userPhone ? `<div>📞 ${o.userPhone}</div>` : ''}
                                  <div>📍 ${o.userAddress}</div>
                                </div>
                              </details>
                            ` : ''}
                          </td>
                          <td>${date}</td>
                          <td style="font-weight:600">₹${o.total.toLocaleString()}</td>
                          <td>
                            <span style="color:${isCancelReq ? 'var(--warn)' : o.status === 'Cancelled' ? 'var(--danger)' : 'var(--ok)'};font-weight:600">
                              ${o.status || 'Placed'}
                            </span>
                          </td>
                          <td>
                            ${isCancelReq ? `
                              <button class="btn btn--outline" style="color:var(--danger); border-color:var(--danger); padding:4px 8px; font-size:12px;" onclick="AdminPage.handleApproveCancel('${o.id}')">Approve</button>
                              <button class="btn btn--outline" style="color:var(--ok); border-color:var(--ok); padding:4px 8px; font-size:12px; margin-left: 4px;" onclick="AdminPage.handleRejectCancel('${o.id}')">Reject</button>
                            ` : (o.status === 'Placed' || !o.status) ? `
                              <button class="btn btn--outline" style="color:var(--primary); border-color:var(--primary); padding:4px 8px; font-size:12px;" onclick="AdminPage.handleSatisfyOrder('${o.id}')">Satisfied</button>
                            ` : '-'}
                          </td>
                        </tr>
                        `;
                      }).join('')}
                    </tbody>
                  </table>
                </div>
              `}
            </div>

          </div>
        </div>
      </div>
    `;
  },

  updatePreview() {
    const mrp = Number(document.getElementById('add-mrp').value) || 0;
    const discount = Number(document.getElementById('add-discount').value) || 0;
    const price = Math.round(mrp - (mrp * discount / 100));
    document.getElementById('add-preview-price').textContent = `₹${price.toLocaleString()}`;
  },

  async handleAdd(e) {
    e.preventDefault();
    
    const mrp = Number(document.getElementById('add-mrp').value);
    const discount = Number(document.getElementById('add-discount').value);
    const price = Math.round(mrp - (mrp * discount / 100));

    const productData = {
      name: document.getElementById('add-name').value.trim(),
      brand: document.getElementById('add-brand').value.trim(),
      category: document.getElementById('add-category').value,
      icon: document.getElementById('add-icon').value.trim(),
      mrp: mrp,
      price: price,
      desc: document.getElementById('add-desc').value.trim(),
      featured: document.getElementById('add-featured').checked,
      inStock: true,
      rating: 0,
      reviews: 0
    };

    const imageFile = document.getElementById('add-image').files[0];
    if (imageFile) {
      productData.imageFile = imageFile;
    }

    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Adding...';

    try {
      await addProduct(productData);
      Toast.show('Product added successfully!', 'success');
      this.render(); // Re-render to show updated list
    } catch (e) {
      Toast.show('Failed to add product. Check console.', 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Add Product';
    }
  },

  async deleteProduct(id) {
    if (confirm('Are you sure you want to delete this product?')) {
      await removeProduct(id);
      Toast.show('Product removed!', 'info');
      this.render();
    }
  },

  async loadDummy() {
    if (confirm('This will load 5 sample products. Continue?')) {
      await loadDummyProducts();
      Toast.show('Dummy data loaded!', 'success');
      this.render();
    }
  },

  async handleApproveCancel(orderId) {
    if (confirm('Approve this cancellation request?')) {
      try {
        await updateOrderStatus(orderId, 'Cancelled');
        Toast.show('Order cancelled successfully', 'success');
        this.render();
      } catch(e) {
        console.error(e);
        Toast.show('Failed to cancel order', 'error');
      }
    }
  },

  async handleRejectCancel(orderId) {
    if (confirm('Reject this cancellation request and keep the order Placed?')) {
      try {
        await updateOrderStatus(orderId, 'Placed');
        Toast.show('Cancellation rejected', 'info');
        this.render();
      } catch(e) {
        console.error(e);
        Toast.show('Failed to reject cancellation', 'error');
      }
    }
  },

  async handleSatisfyOrder(orderId) {
    if (confirm('Mark this order as Satisfied/Completed?')) {
      try {
        await updateOrderStatus(orderId, 'Completed');
        Toast.show('Order marked as Satisfied', 'success');
        this.render();
      } catch(e) {
        console.error(e);
        Toast.show('Failed to update order status', 'error');
      }
    }
  }
};
