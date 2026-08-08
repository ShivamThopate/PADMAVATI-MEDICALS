/* ── MedStore · Product Catalog ── */

const CATEGORIES = [
  { id: 'medicines',     name: 'Medicines',          icon: '💊', color: '#3b82f6', gradient: 'linear-gradient(135deg,#dbeafe,#93c5fd)' },
  { id: 'supplements',   name: 'Supplements',        icon: '🌿', color: '#10b981', gradient: 'linear-gradient(135deg,#d1fae5,#6ee7b7)' },
  { id: 'personal-care', name: 'Personal Care',      icon: '🧴', color: '#ec4899', gradient: 'linear-gradient(135deg,#fce7f3,#f9a8d4)' },
  { id: 'devices',       name: 'Medical Devices',    icon: '🩺', color: '#6366f1', gradient: 'linear-gradient(135deg,#e0e7ff,#a5b4fc)' },
  { id: 'baby-care',     name: 'Baby Care',          icon: '🍼', color: '#38bdf8', gradient: 'linear-gradient(135deg,#e0f2fe,#7dd3fc)' },
  { id: 'wellness',      name: 'Health & Wellness',  icon: '🍯', color: '#f59e0b', gradient: 'linear-gradient(135deg,#fef3c7,#fcd34d)' },
];

let PRODUCTS = [];

async function fetchProducts() {
  try {
    const { dbOps, db } = window.firebaseClient;
    const q = dbOps.query(dbOps.collection(db, 'products'));
    const querySnapshot = await dbOps.getDocs(q);
    
    PRODUCTS = [];
    querySnapshot.forEach((doc) => {
      PRODUCTS.push({ id: doc.id, ...doc.data() });
    });
    
    // Sort by a field or just keep as is, we'll keep as is for now
  } catch (err) {
    console.error("Error fetching products from Firestore:", err);
  }
}

async function addProduct(productData) {
  try {
    const { dbOps, db } = window.firebaseClient;

    if (productData.imageFile) {
      if (window.uploadProductImage) {
        productData.image = await window.uploadProductImage(productData.imageFile);
      } else {
        console.warn("Supabase upload function not available. Image ignored.");
      }
      delete productData.imageFile; // Remove the file object before saving to Firestore
    }

    await dbOps.addDoc(dbOps.collection(db, 'products'), productData);
    await fetchProducts();
    EventBus?.emit('products:updated');
  } catch (err) {
    console.error("Error adding product to Firestore:", err);
    throw err;
  }
}

async function removeProduct(id) {
  try {
    const { dbOps, db } = window.firebaseClient;
    const docRef = dbOps.doc(db, 'products', String(id));
    await dbOps.deleteDoc(docRef);
    await fetchProducts();
    EventBus?.emit('products:updated');
  } catch (err) {
    console.error("Error removing product from Firestore:", err);
    throw err;
  }
}

async function loadDummyProducts() {
  try {
    const dummy = [
      { name:'Paracetamol 500mg', brand:'HealthCare Plus', category:'medicines', mrp:50, price:35, icon:'💊', inStock:true, featured:true, rating:4.5, reviews:234, tags:['fever','pain'], desc:'Effective relief from mild to moderate pain and fever.', image: '' },
      { name:'Vitamin D3 2000 IU', brand:'Sunvita', category:'supplements', mrp:500, price:350, icon:'☀️', inStock:true, featured:true, rating:4.5, reviews:345, tags:['vitamin d','bones'], desc:'High-potency Vitamin D3 supplement for bone health.', image: '' },
      { name:'Digital BP Monitor', brand:'OmniHealth', category:'devices', mrp:2800, price:1850, icon:'🩺', inStock:true, featured:true, rating:4.7, reviews:456, tags:['bp monitor','blood pressure'], desc:'Fully automatic upper-arm blood pressure monitor.', image: '' },
      { name:'Premium Diapers (30)', brand:'DryComfort', category:'baby-care', mrp:700, price:550, icon:'🩲', inStock:true, featured:true, rating:4.5, reviews:876, tags:['diapers','baby'], desc:'Ultra-absorbent diapers with wetness indicator.', image: '' },
      { name:'Organic Honey 500g', brand:'PureNectar', category:'wellness', mrp:500, price:350, icon:'🍯', inStock:true, featured:true, rating:4.7, reviews:654, tags:['honey','organic'], desc:'100% pure organic honey sourced from wild forest flowers.', image: '' },
    ];
    
    const { dbOps, db } = window.firebaseClient;
    for (const p of dummy) {
      await dbOps.addDoc(dbOps.collection(db, 'products'), p);
    }
    
    await fetchProducts();
    EventBus?.emit('products:updated');
  } catch (err) {
    console.error("Error seeding dummy data:", err);
  }
}

/* ── Order API ── */
async function createOrder(cartItems, total) {
  if (!Auth.user) throw new Error("Must be logged in");
  const { dbOps, db } = window.firebaseClient;
  
  const orderData = {
    userId: Auth.user.uid,
    userName: Auth.user.name,
    userEmail: Auth.user.email,
    userPhone: Auth.user.phone || '',
    userAddress: [Auth.user.address1, Auth.user.address2, Auth.user.address3, Auth.user.pincode].filter(Boolean).join(', '),
    items: cartItems,
    total: total,
    status: 'Placed',
    createdAt: new Date().toISOString()
  };
  
  await dbOps.addDoc(dbOps.collection(db, 'orders'), orderData);
}

async function fetchUserOrders() {
  if (!Auth.user) return [];
  const { dbOps, db } = window.firebaseClient;
  
  const q = dbOps.query(
    dbOps.collection(db, 'orders'), 
    dbOps.where('userId', '==', Auth.user.uid),
    dbOps.orderBy('createdAt', 'desc')
  );
  
  const querySnapshot = await dbOps.getDocs(q);
  const orders = [];
  querySnapshot.forEach((doc) => {
    orders.push({ id: doc.id, ...doc.data() });
  });
  return orders;
}

async function fetchAllOrders() {
  const { dbOps, db } = window.firebaseClient;
  const q = dbOps.query(
    dbOps.collection(db, 'orders'),
    dbOps.orderBy('createdAt', 'desc')
  );
  
  const querySnapshot = await dbOps.getDocs(q);
  const orders = [];
  querySnapshot.forEach((doc) => {
    orders.push({ id: doc.id, ...doc.data() });
  });
  return orders;
}

async function updateOrderStatus(orderId, newStatus) {
  const { dbOps, db } = window.firebaseClient;
  const orderRef = dbOps.doc(db, 'orders', String(orderId));
  await dbOps.updateDoc(orderRef, { status: newStatus });
}

async function requestOrderCancellation(orderId) {
  await updateOrderStatus(orderId, 'Cancellation Requested');
}

/* ── Helpers ── */
function getProduct(id)     { return PRODUCTS.find(p => String(p.id) === String(id)); } // Convert IDs to string because Firestore uses string IDs
function getFeatured()      { return PRODUCTS.filter(p => p.featured); }
function getByCategory(cat) { return PRODUCTS.filter(p => p.category === cat); }
function getCategoryMeta(id){ return CATEGORIES.find(c => c.id === id); }

function searchProducts(query) {
  const q = query.toLowerCase().trim();
  if (!q) return PRODUCTS;
  return PRODUCTS.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.brand.toLowerCase().includes(q) ||
    p.category.toLowerCase().includes(q) ||
    (p.tags && p.tags.some(t => t.includes(q)))
  );
}

function filterAndSort(products, filters, sort) {
  let result = [...products];

  if (filters.category)  result = result.filter(p => p.category === filters.category);
  if (filters.minPrice)  result = result.filter(p => p.price >= filters.minPrice);
  if (filters.maxPrice && filters.maxPrice < 50000) result = result.filter(p => p.price <= filters.maxPrice);
  if (filters.rating)    result = result.filter(p => p.rating >= filters.rating);
  if (filters.inStock)   result = result.filter(p => p.inStock);

  switch (sort) {
    case 'price-asc':  result.sort((a, b) => a.price - b.price); break;
    case 'price-desc': result.sort((a, b) => b.price - a.price); break;
    case 'rating':     result.sort((a, b) => b.rating - a.rating); break;
    case 'newest':     result.sort((a, b) => (a.id > b.id ? -1 : 1)); break; // string comparison for IDs
    case 'discount':   result.sort((a, b) => (b.mrp - b.price) / b.mrp - (a.mrp - a.price) / a.mrp); break;
    default: /* relevance — featured first */
      result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || b.reviews - a.reviews);
  }

  return result;
}

/* ── Star HTML helper ── */
function starsHTML(rating, reviews) {
  const full  = Math.floor(rating);
  const half  = rating % 1 >= 0.3;
  const empty = 5 - full - (half ? 1 : 0);
  const starSvg = `<svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14 2 9.27l6.91-1.01z"/></svg>`;
  const halfSvg = `<svg viewBox="0 0 24 24"><defs><linearGradient id="hg"><stop offset="50%" stop-color="currentColor"/><stop offset="50%" stop-color="#ddd"/></linearGradient></defs><path fill="url(#hg)" d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14 2 9.27l6.91-1.01z"/></svg>`;
  const emptySvg = `<svg class="empty" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14 2 9.27l6.91-1.01z"/></svg>`;

  let html = `<span class="stars">`;
  for (let i = 0; i < full; i++)  html += starSvg;
  if (half)                        html += halfSvg;
  for (let i = 0; i < empty; i++) html += emptySvg;
  html += `</span>`;
  if (reviews != null) html += `<span class="review-count">(${reviews.toLocaleString()})</span>`;
  return html;
}

/* ── Product card HTML helper ── */
function productCardHTML(p) {
  const discount = Math.round((1 - p.price / p.mrp) * 100);
  const cat = getCategoryMeta(p.category);
  // Need quotes around string IDs in onclick handler
  return `
    <article class="product-card" onclick="Router.go('#/product/${p.id}')">
      ${p.featured ? '<span class="product-card__badge"><span class="badge badge--best">Bestseller</span></span>' : ''}
      <div class="product-card__img" style="background:${cat?.gradient || '#f5f5f5'};position:relative;">
        ${p.image ? `<img src="${p.image}" style="width:100%;height:100%;object-fit:cover;border-radius:12px 12px 0 0;position:absolute;top:0;left:0;">` : `<span style="font-size:48px">${p.icon || '📦'}</span>`}
      </div>
      <div class="product-card__body">
        <div class="product-card__brand">${p.brand}</div>
        <div class="product-card__name">${p.name}</div>
        <div class="product-card__rating">${starsHTML(p.rating, p.reviews)}</div>
        <div style="display:flex;align-items:baseline;flex-wrap:wrap;gap:4px">
          <span class="product-card__price"><span class="sym">₹</span>${p.price.toLocaleString()}</span>
          <span class="product-card__mrp">₹${p.mrp.toLocaleString()}</span>
          <span class="product-card__discount">${discount}% off</span>
        </div>
        <div class="product-card__action">
          <button class="btn btn--cart btn--block" onclick="event.stopPropagation();if(Store.addToCart(getProduct('${p.id}'))) Toast.show('Added to cart!')">Add to Cart</button>
        </div>
      </div>
    </article>`;
}
