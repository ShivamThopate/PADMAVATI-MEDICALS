/* ── Cart Component ── */

const Cart = {
  open() {
    document.getElementById('cart-drawer')?.classList.add('open');
    document.getElementById('cart-backdrop')?.classList.add('open');
    document.body.style.overflow = 'hidden';
    this.renderDrawer();
  },

  close() {
    document.getElementById('cart-drawer')?.classList.remove('open');
    document.getElementById('cart-backdrop')?.classList.remove('open');
    document.body.style.overflow = '';
  },

  init() {
    EventBus.on('cart:changed', () => this.renderDrawer());
  },

  renderDrawer() {
    const items = document.getElementById('cart-items');
    const footer = document.getElementById('cart-footer');
    if (!items || !footer) return;

    if (Store.cart.length === 0) {
      items.innerHTML = `
        <div class="cart-empty">
          <div class="cart-empty__icon">🛒</div>
          <h3>Your cart is empty</h3>
          <p>Looks like you haven't added anything yet.</p>
          <button class="btn btn--primary" onclick="Cart.close();Router.go('#/')">Continue Shopping</button>
        </div>`;
      footer.style.display = 'none';
      return;
    }

    footer.style.display = 'block';
    items.innerHTML = Store.cart.map(item => {
      const cat = getCategoryMeta(item.category);
      return `
        <div class="cart-item">
          <div class="cart-item__img" style="background:${cat?.gradient || '#f5f5f5'}">
            ${item.image ? `<img src="${item.image}" style="width:100%;height:100%;object-fit:cover;border-radius:4px;">` : (item.icon || '📦')}
          </div>
          <div class="cart-item__info">
            <div class="cart-item__name">${item.name}</div>
            <div class="cart-item__brand">${item.brand}</div>
            <div class="cart-item__bottom">
              <div class="qty">
                <button onclick="Store.updateQty('${item.id}',${item.qty - 1})${item.qty <= 1 ? `;Store.removeFromCart('${item.id}')` : ''}">−</button>
                <span>${item.qty}</span>
                <button onclick="Store.updateQty('${item.id}',${item.qty + 1})">+</button>
              </div>
              <span class="cart-item__price">₹${(item.price * item.qty).toLocaleString()}</span>
            </div>
            <button class="cart-item__remove" onclick="Store.removeFromCart('${item.id}')">Remove</button>
          </div>
        </div>`;
    }).join('');

    const subtotal = Store.cartTotal();
    const total = subtotal;

    footer.innerHTML = `
      <div class="cart-summary">
        <div class="cart-summary__row">
          <span>Subtotal (${Store.cartCount()} items)</span>
          <span>₹${subtotal.toLocaleString()}</span>
        </div>
        <div class="cart-summary__row cart-summary__row--total">
          <span>Total</span>
          <span>₹${total.toLocaleString()}</span>
        </div>
      </div>
      <button class="btn btn--primary btn--block btn--lg" onclick="Cart.handlePlaceOrder()">
        Place Order
      </button>
      <button class="btn btn--outline btn--block" style="margin-top:var(--s2)" onclick="Cart.close()">
        Continue Shopping
      </button>
    `;
  },

  /* Full cart page (route: #/cart) */
  renderPage() {
    const app = document.getElementById('app');
    const cartItems = Store.cart;

    if (cartItems.length === 0) {
      app.innerHTML = `
        <div class="container">
          <div class="cart-page fade-in" style="text-align:center;padding:80px 16px">
            <div style="font-size:80px;margin-bottom:24px;opacity:.6">🛒</div>
            <h2 style="font-family:var(--fh);font-size:28px;margin-bottom:8px">Your Cart is Empty</h2>
            <p style="color:var(--t2);margin-bottom:24px;max-width:400px;margin-left:auto;margin-right:auto">
              Your shopping cart is waiting. Fill it with medicines, supplements, and health essentials!
            </p>
            <a href="#/" class="btn btn--primary btn--lg">Start Shopping</a>
          </div>
        </div>`;
      return;
    }

    const subtotal = Store.cartTotal();
    const total = subtotal;
    const savings = cartItems.reduce((s, i) => s + (i.mrp - i.price) * i.qty, 0);

    app.innerHTML = `
      <div class="container">
        <div class="cart-page fade-in">
          <h1 class="cart-page__title">Shopping Cart</h1>
          <div class="cart-page__layout">
            <div class="cart-page__items">
              ${cartItems.map(item => {
                const cat = getCategoryMeta(item.category);
                const disc = Math.round((1 - item.price / item.mrp) * 100);
                return `
                <div class="cart-item" style="padding:var(--s4) 0">
                  <div class="cart-item__img" style="background:${cat?.gradient || '#f5f5f5'};width:100px;height:100px;font-size:44px;cursor:pointer;position:relative;"
                       onclick="Router.go('#/product/${item.id}')">
                    ${item.image ? `<img src="${item.image}" style="width:100%;height:100%;object-fit:cover;border-radius:4px;position:absolute;top:0;left:0;">` : (item.icon || '📦')}
                  </div>
                  <div class="cart-item__info">
                    <div class="cart-item__name" style="font-size:16px;cursor:pointer" onclick="Router.go('#/product/${item.id}')">${item.name}</div>
                    <div class="cart-item__brand">${item.brand}</div>
                    <div style="margin:var(--s2) 0">
                      <span style="font-size:18px;font-weight:700">₹${item.price.toLocaleString()}</span>
                      <span style="font-size:13px;color:var(--t2);text-decoration:line-through;margin-left:8px">₹${item.mrp.toLocaleString()}</span>
                      <span style="font-size:13px;color:var(--deal);font-weight:600;margin-left:8px">${disc}% off</span>
                    </div>
                    <div class="cart-item__bottom">
                      <div class="qty">
                        <button onclick="Store.updateQty('${item.id}',${item.qty - 1})${item.qty <= 1 ? `;Store.removeFromCart('${item.id}')` : ''};Cart.renderPage()">−</button>
                        <span>${item.qty}</span>
                        <button onclick="Store.updateQty('${item.id}',${item.qty + 1});Cart.renderPage()">+</button>
                      </div>
                      <span class="cart-item__price" style="font-size:18px">₹${(item.price * item.qty).toLocaleString()}</span>
                    </div>
                    <button class="cart-item__remove" onclick="Store.removeFromCart('${item.id}');Cart.renderPage()">
                      Remove
                    </button>
                  </div>
                </div>`;
              }).join('')}
            </div>

            <div class="cart-page__summary">
              <h3>Order Summary</h3>
              <div class="cart-summary">
                <div class="cart-summary__row">
                  <span>Subtotal (${Store.cartCount()} items)</span>
                  <span>₹${subtotal.toLocaleString()}</span>
                </div>
                ${savings > 0 ? `
                <div class="cart-summary__row" style="color:var(--ok)">
                  <span>You Save</span>
                  <span>−₹${savings.toLocaleString()}</span>
                </div>` : ''}
                <div class="cart-summary__row cart-summary__row--total">
                  <span>Total</span>
                  <span>₹${total.toLocaleString()}</span>
                </div>
              </div>
              <button class="btn btn--primary btn--block btn--lg" onclick="Cart.handlePlaceOrder()">
                Place Order
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    window.scrollTo({ top: 0 });
  },

  async handlePlaceOrder() {
    if (!Auth.user) {
      Auth.openModal();
      Toast.show('Please sign in to place an order', 'info');
      return;
    }

    if (!Auth.user.profileCompleted) {
      Toast.show('Please complete your profile (Phone, Address) before placing an order.', 'error');
      Router.go('#/profile');
      return;
    }
    const cartItems = Store.cart;
    if (cartItems.length === 0) return;
    const subtotal = Store.cartTotal();
    
    try {
      await createOrder(cartItems, subtotal);
      Store.cart = [];
      EventBus?.emit('cart:changed');
      Cart.close();
      Toast.show('Order placed successfully!');
      Router.go('#/orders');
    } catch (e) {
      Toast.show('Error placing order', 'error');
      console.error(e);
    }
  }
};
