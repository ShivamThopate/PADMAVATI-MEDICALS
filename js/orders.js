/* ── Orders Page ── */

const OrdersPage = {
  async render() {
    const app = document.getElementById('app');
    
    if (!Auth.user) {
      app.innerHTML = `
        <div class="container" style="padding:80px 16px;text-align:center">
          <div style="font-size:64px;margin-bottom:16px">🔒</div>
          <h2 style="font-family:var(--fh);margin-bottom:8px">Sign in to view orders</h2>
          <p style="color:var(--t2);margin-bottom:24px">You need to be logged in to see your past orders.</p>
          <button class="btn btn--primary" onclick="Auth.openModal()">Sign In</button>
        </div>`;
      return;
    }

    app.innerHTML = `
      <div class="container" style="padding:40px 16px; min-height: 50vh;">
        <h1 style="font-family:var(--fh);font-size:32px;margin-bottom:24px">Your Orders</h1>
        <div id="orders-list">
          <div style="text-align:center;padding:40px;color:var(--t2)">
            <p>Loading orders...</p>
          </div>
        </div>
      </div>
    `;

    try {
      const orders = await fetchUserOrders();
      const listEl = document.getElementById('orders-list');
      
      if (orders.length === 0) {
        listEl.innerHTML = `
          <div style="text-align:center;padding:40px;background:#fff;border-radius:12px;border:1px solid var(--b1)">
            <div style="font-size:48px;margin-bottom:16px">📦</div>
            <h3 style="margin-bottom:8px">No orders found</h3>
            <p style="color:var(--t2);margin-bottom:24px">You haven't placed any orders yet.</p>
            <button class="btn btn--primary" onclick="Router.go('#/products')">Start Shopping</button>
          </div>
        `;
        return;
      }

      listEl.innerHTML = orders.map(order => {
        const date = new Date(order.createdAt).toLocaleDateString(undefined, {
          year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
        
        return `
          <div class="order-card">
            <div class="order-card__header">
              <div>
                <span style="color:var(--t2);font-size:13px">Order Placed</span>
                <div style="font-weight:600;margin-top:4px">${date}</div>
              </div>
              <div>
                <span style="color:var(--t2);font-size:13px">Total</span>
                <div style="font-weight:600;margin-top:4px">₹${order.total.toLocaleString()}</div>
              </div>
              <div>
                <span style="color:var(--t2);font-size:13px">Status</span>
                <div style="font-weight:600;margin-top:4px;color:${order.status === 'Completed' ? 'var(--ok)' : order.status === 'Cancelled' ? 'var(--danger)' : 'var(--accent)'}">${order.status || 'Placed'}</div>
              </div>
              ${(order.status === 'Placed' || !order.status) ? `
              <div style="margin-left: auto;">
                <button class="btn btn--outline" onclick="OrdersPage.cancelOrder('${order.id}')" style="padding: 6px 12px; font-size: 13px; color: var(--danger); border-color: var(--danger)">Request Cancel</button>
              </div>
              ` : ''}
            </div>
            <div class="order-card__items">
              ${(order.items || []).map(item => {
                const cat = getCategoryMeta(item.category);
                return `
                  <div class="order-item">
                    <div class="order-item__img" style="background:${cat?.gradient || '#f5f5f5'}; cursor:pointer" onclick="Router.go('#/product/${item.id}')">
                      ${item.image ? `<img src="${item.image}">` : `<span style="font-size:24px">${item.icon || '📦'}</span>`}
                    </div>
                    <div class="order-item__details">
                      <a href="#/product/${item.id}" class="order-item__name">${item.name}</a>
                      <div class="order-item__brand">${item.brand}</div>
                      <div class="order-item__meta">
                        <span>Qty: ${item.qty}</span>
                        <span style="font-weight:600">₹${(item.price * item.qty).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `;
      }).join('');
    } catch (err) {
      console.error(err);
      document.getElementById('orders-list').innerHTML = `
        <div style="text-align:center;padding:40px;color:var(--err)">
          <p>Failed to load orders. Please try again.</p>
        </div>
      `;
    }
  },

  async cancelOrder(orderId) {
    if (confirm('Are you sure you want to request cancellation for this order?')) {
      try {
        await requestOrderCancellation(orderId);
        Toast.show('Cancellation requested successfully.', 'info');
        this.render(); // Re-render to show updated status
      } catch (err) {
        console.error(err);
        Toast.show('Error requesting cancellation', 'error');
      }
    }
  }
};
