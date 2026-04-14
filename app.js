/**
 * app.js - ATTIRE E-Commerce Vanilla JS SPA Logic
 */

// ==========================================
// STATE MANAGEMENT & LOCAL STORAGE
// ==========================================
const state = {
  products: [],
  cart: JSON.parse(localStorage.getItem('attire_cart')) || [],
  wishlist: JSON.parse(localStorage.getItem('attire_wishlist')) || [],
  user: JSON.parse(localStorage.getItem('attire_user')) || null,
  currentRoute: window.location.hash || '#/',
  searchQuery: '',
  filters: { categories: [], price: 'All' }
};

function saveState() {
  localStorage.setItem('attire_cart', JSON.stringify(state.cart));
  localStorage.setItem('attire_wishlist', JSON.stringify(state.wishlist));
  localStorage.setItem('attire_user', JSON.stringify(state.user));
  updateBadges();
}

// Local state handling equivalent to old db
const db = {
  getProducts: () => state.products,
  getProductById: (id) => state.products.find(p => p.id == id), // loose equality as id might be string or number
  getFeatured: () => state.products.filter(p => p.featured),
  getNewCollection: () => state.products.filter(p => p.newCollection),
  searchProducts: (query) => {
    return state.products.filter(p => 
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.category.toLowerCase().includes(query.toLowerCase())
    );
  }
};

// ==========================================
// DOM ELEMENTS
// ==========================================
const mainContent = document.getElementById('main-content');
const cartCount = document.getElementById('cart-count');
const wishlistCount = document.getElementById('wishlist-count');
const cartDrawer = document.getElementById('cart-drawer');
const cartOverlay = document.getElementById('cart-overlay');
const cartToggle = document.getElementById('cart-toggle');
const closeCart = document.getElementById('close-cart');
const cartItemsContainer = document.getElementById('cart-items-container');
const cartSubtotal = document.getElementById('cart-subtotal');
const searchToggle = document.getElementById('search-toggle');
const searchBox = document.getElementById('search-box');
const searchInput = document.getElementById('search-input');
const searchSubmit = document.getElementById('search-submit');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const closeMenuBtn = document.getElementById('close-menu-btn');
const navLinks = document.getElementById('nav-links');
const toastContainer = document.getElementById('toast-container');
const checkoutBtn = document.getElementById('checkout-btn');
const continueShoppingBtn = document.getElementById('continue-shopping');

// ==========================================
// INITIAL SETUP
// ==========================================
async function init() {
  setupEventListeners();
  updateBadges();
  
  // Loading State
  mainContent.innerHTML = `<div style="text-align:center; padding: 100px 20px;">
      <i class="fas fa-spinner fa-spin" style="font-size: 3rem; color: var(--primary-color);"></i>
      <h3 style="margin-top: 20px; color: var(--text-color);">Loading latest collections...</h3>
  </div>`;
  
  try {
      const response = await fetch('api.php');
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      state.products = data;
  } catch (error) {
      console.warn("Local PHP server not running, falling back to direct API fetch...", error);
      try {
          const directRes = await fetch('https://fakestoreapi.com/products');
          const rawData = await directRes.json();
          const filtered = rawData.filter(p => p.category.includes('clothing'));
          
          const fallbackProducts = [
                {
                    id: 101, name: "Boy's Striped Cotton T-Shirt", price: 15.99, category: "Kids' Clothing", subCategory: "T-Shirts", description: "Comfortable and breathable striped t-shirt for kids.", image: "https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=80&w=600&auto=format&fit=crop", rating: 4.8, reviews: 45, featured: true, newCollection: true, sizes: ['2Y', '4Y', '6Y', '8Y'], colors: ['Blue', 'Red', 'White']
                },
                {
                    id: 102, name: "Girl's Summer Floral Dress", price: 24.50, category: "Kids' Clothing", subCategory: "Dresses", description: "A cute floral print dress perfect for warm summer days.", image: "https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?q=80&w=600&auto=format&fit=crop", rating: 4.7, reviews: 80, featured: false, newCollection: true, sizes: ['3Y', '5Y', '7Y'], colors: ['Pink', 'Yellow']
                },
                {
                    id: 103, name: "Kids' Winter Puffer Jacket", price: 45.00, category: "Kids' Clothing", subCategory: "Outerwear", description: "Warm, water-resistant puffer jacket to keep your child cozy.", image: "https://images.unsplash.com/photo-1549062572-544a64fb0c56?q=80&w=600&auto=format&fit=crop", rating: 4.9, reviews: 150, featured: true, newCollection: false, sizes: ['4Y', '6Y', '8Y', '10Y'], colors: ['Black', 'Navy', 'Olive']
                },
                {
                    id: 104, name: "Boy's Classic Denim Jeans", price: 22.00, category: "Kids' Clothing", subCategory: "Pants", description: "Durable kids denim jeans for everyday play.", image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?q=80&w=600&auto=format&fit=crop", rating: 4.6, reviews: 40, featured: false, newCollection: true, sizes: ['2Y', '4Y', '6Y', '8Y'], colors: ['Blue']
                },
                {
                    id: 105, name: "Men's Classic Chinos", price: 35.50, category: "Men's Clothing", subCategory: "Pants", description: "Versatile chinos for a smart casual look.", image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=600&auto=format&fit=crop", rating: 4.5, reviews: 110, featured: true, newCollection: false, sizes: ['S', 'M', 'L', 'XL'], colors: ['Beige', 'Navy', 'Olive']
                },
                {
                    id: 106, name: "Women's Elegant Evening Dress", price: 89.99, category: "Women's Clothing", subCategory: "Dresses", description: "A stunning dress perfect for formal events.", image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600&auto=format&fit=crop", rating: 4.9, reviews: 200, featured: true, newCollection: true, sizes: ['S', 'M', 'L'], colors: ['Black', 'Red']
                },
                {
                    id: 107, name: "Men's Windbreaker Jacket", price: 55.00, category: "Men's Clothing", subCategory: "Outerwear", description: "Lightweight windbreaker for active days.", image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=600&auto=format&fit=crop", rating: 4.4, reviews: 85, featured: false, newCollection: true, sizes: ['M', 'L', 'XL'], colors: ['Grey', 'Black']
                },
                {
                    id: 108, name: "Girl's Cute Print T-Shirt", price: 12.99, category: "Kids' Clothing", subCategory: "T-Shirts", description: "Soft cotton t-shirt with a fun print.", image: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=600&auto=format&fit=crop", rating: 4.8, reviews: 60, featured: false, newCollection: false, sizes: ['3Y', '5Y', '7Y'], colors: ['White', 'Pink']
                },
                {
                    id: 109, name: "Women's Cozy Outerwear Coat", price: 110.00, category: "Women's Clothing", subCategory: "Outerwear", description: "Stay warm and stylish this season.", image: "https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?q=80&w=600&auto=format&fit=crop", rating: 4.7, reviews: 140, featured: true, newCollection: false, sizes: ['S', 'M', 'L'], colors: ['Camel', 'Black']
                }
          ];
          
          const mappedProducts = filtered.map(p => {
              let subCat = 'T-Shirts';
              let tl = p.title.toLowerCase();
              if (tl.includes('jacket') || tl.includes('coat') || tl.includes('outerwear') || tl.includes('windbreaker')) subCat = 'Outerwear';
              else if (tl.includes('pants') || tl.includes('jeans')) subCat = 'Pants';
              else if (tl.includes('dress')) subCat = 'Dresses';
              else if (tl.includes('shirt') || tl.includes('top') || tl.includes('sleeve')) subCat = 'T-Shirts';
              
              return {
                  id: p.id,
                  name: p.title,
                  price: p.price,
                  category: p.category.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
                  subCategory: subCat,
                  description: p.description,
                  image: p.image,
                  rating: p.rating?.rate || 4.5,
                  reviews: p.rating?.count || 120,
                  featured: (p.rating?.rate > 4.5),
                  newCollection: (p.id % 2 !== 0),
                  sizes: ['S', 'M', 'L', 'XL'],
                  colors: ['Beige', 'Black', 'White', 'Navy']
              };
          });
          
          state.products = [...mappedProducts, ...fallbackProducts];
      } catch (fallbackError) {
          console.error("Fallback failed:", fallbackError);
          mainContent.innerHTML = `<div style="text-align:center; padding: 100px 20px;">
              <h3 style="color: var(--error);">Error loading products. Please check your internet connection.</h3>
          </div>`;
          return;
      }
  }

  handleRoute();
  
  if(window.location.hash === '') {
      window.location.hash = '#/';
  }
}

// ==========================================
// EVENT LISTENERS
// ==========================================
function setupEventListeners() {
  window.addEventListener('hashchange', () => {
      state.currentRoute = window.location.hash;
      handleRoute();
  });

  // Cart Drawer
  cartToggle.addEventListener('click', toggleCart);
  closeCart.addEventListener('click', toggleCart);
  cartOverlay.addEventListener('click', toggleCart);
  continueShoppingBtn.addEventListener('click', toggleCart);
  
  checkoutBtn.addEventListener('click', () => {
    toggleCart();
    window.location.hash = '#/checkout';
  });

  // Mobile Menu
  mobileMenuBtn.addEventListener('click', () => navLinks.classList.add('active'));
  closeMenuBtn.addEventListener('click', () => navLinks.classList.remove('active'));
  
  // Close menu when clicking a link
  navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => navLinks.classList.remove('active'));
  });

  // Search
  searchToggle.addEventListener('click', () => {
      searchBox.classList.toggle('active');
      if(searchBox.classList.contains('active')) searchInput.focus();
  });

  searchSubmit.addEventListener('click', performSearch);
  searchInput.addEventListener('keypress', (e) => {
      if(e.key === 'Enter') performSearch();
  });
}

// ==========================================
// ROUTER
// ==========================================
function handleRoute() {
  const hash = state.currentRoute;
  mainContent.innerHTML = ''; // Clear current content
  window.scrollTo(0, 0); // Scroll to top

  if (hash === '#/' || hash === '#' || hash === '') {
      renderHome();
  } else if (hash.startsWith('#/shop')) {
      renderShop(hash);
  } else if (hash.startsWith('#/product/')) {
      const id = hash.split('/')[2];
      renderProductDetails(id);
  } else if (hash === '#/wishlist') {
      renderWishlist();
  } else if (hash === '#/checkout') {
      renderCheckout();
  } else if (hash === '#/auth') {
      renderAuth();
  } else if (hash === '#/contact') {
      renderContact();
  } else if (hash === '#/about') {
      renderAbout();
  } else {
      mainContent.innerHTML = `
          <div class="container section" style="text-align:center;">
              <h1 class="section-title">404 - Page Not Found</h1>
              <a href="#/" class="btn primary-btn">Return to Home</a>
          </div>
      `;
  }
}

// ==========================================
// RENDERERS
// ==========================================

function renderContact() {
  mainContent.innerHTML = `
      <div class="container section">
          <h2 class="section-title">Contact Us</h2>
          <div style="max-width: 600px; margin: 0 auto; padding: 40px; background: white; border-radius: var(--border-radius); box-shadow: var(--shadow-md);">
              <form onsubmit="event.preventDefault(); showToast('Message sent successfully!', 'success'); window.location.hash='#/';">
                  <div class="form-group" style="margin-bottom: 20px;">
                      <label style="display:block; margin-bottom: 8px;">Name</label>
                      <input type="text" required style="width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 4px;">
                  </div>
                  <div class="form-group" style="margin-bottom: 20px;">
                      <label style="display:block; margin-bottom: 8px;">Email</label>
                      <input type="email" required style="width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 4px;">
                  </div>
                  <div class="form-group" style="margin-bottom: 20px;">
                      <label style="display:block; margin-bottom: 8px;">Message</label>
                      <textarea required rows="5" style="width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 4px; font-family: inherit;"></textarea>
                  </div>
                  <button type="submit" class="btn primary-btn btn-block">Send Message</button>
              </form>
          </div>
      </div>
  `;
}

function renderAbout() {
  mainContent.innerHTML = `
      <div class="container section">
          <h2 class="section-title">About ATTIRE</h2>
          <div style="max-width: 800px; margin: 0 auto; text-align: center; color: var(--text-main); font-size: 1.1rem; line-height: 1.8;">
              <p style="margin-bottom: 20px;">At ATTIRE, we believe that modern elegance should be accessible and sustainable. Our mission is to provide high-quality clothing and jewelry that empower individuals to express their unique aesthetic without compromising on comfort.</p>
              <p>Founded with a passion for minimalistic and premium designs, we carefully curate our collections to ensure every piece fits beautifully into your wardrobe.</p>
          </div>
      </div>
  `;
}

function renderHome() {
  const featured = db.getFeatured();
  const newArrivals = db.getNewCollection();

  mainContent.innerHTML = `
      <!-- Hero Section -->
      <section class="hero">
          <div class="hero-content">
              <span class="hero-subtitle">New Collection 2026</span>
              <h1 class="hero-title">Elevate Your Everyday Style</h1>
              <a href="#/shop" class="btn primary-btn disabled" style="font-size: 1.1rem; padding: 15px 40px;">Shop Now</a>
          </div>
      </section>

      <!-- Featured Categories -->
      <section class="section container">
          <h2 class="section-title">Shop by Category</h2>
          <div class="product-grid" style="grid-template-columns: repeat(3, 1fr);">
              <div class="product-card" onclick="window.location.hash='#/shop?cat=Men'">
                  <div class="product-image-wrapper">
                      <img src="https://images.unsplash.com/photo-1617137968427-85924c800a22?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80" alt="Men's Collection">
                      <div class="product-actions-overlay" style="bottom: 0; background: rgba(0,0,0,0.4); height: 100%; align-items: center; justify-content: center;">
                          <h3 style="color: white; font-size: 2rem; margin: 0;">MEN</h3>
                      </div>
                  </div>
              </div>
              <div class="product-card" onclick="window.location.hash='#/shop?cat=Women'">
                  <div class="product-image-wrapper">
                      <img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80" alt="Women's Collection">
                      <div class="product-actions-overlay" style="bottom: 0; background: rgba(0,0,0,0.4); height: 100%; align-items: center; justify-content: center;">
                          <h3 style="color: white; font-size: 2rem; margin: 0;">WOMEN</h3>
                      </div>
                  </div>
              </div>
              <div class="product-card" onclick="window.location.hash='#/shop?cat=Kids'">
                  <div class="product-image-wrapper">
                      <img src="https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=80&w=600&auto=format&fit=crop" alt="Kids' Collection">
                      <div class="product-actions-overlay" style="bottom: 0; background: rgba(0,0,0,0.4); height: 100%; align-items: center; justify-content: center;">
                          <h3 style="color: white; font-size: 2rem; margin: 0;">KIDS</h3>
                      </div>
                  </div>
              </div>
          </div>
      </section>

      <!-- New Collection -->
      <section class="section bg-light">
          <div class="container">
              <h2 class="section-title">New Arrivals</h2>
              <div class="product-grid">
                  ${newArrivals.map(product => generateProductCard(product)).join('')}
              </div>
              <div style="text-align: center; margin-top: 40px;">
                  <a href="#/shop" class="btn secondary-btn">View All Products</a>
              </div>
          </div>
      </section>
  `;
}

window.updateFilter = function(type, value, isChecked) {
  if (type === 'category') {
      if (value === 'All') {
          state.filters.categories = [];
          document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
              if (cb.nextSibling.textContent.trim() !== 'All') cb.checked = false;
          });
      } else {
          let allCb = Array.from(document.querySelectorAll('input[type="checkbox"]')).find(cb => cb.nextSibling.textContent.trim() === 'All');
          if (isChecked) {
              if (allCb) allCb.checked = false;
              if (!state.filters.categories.includes(value)) state.filters.categories.push(value);
          } else {
              state.filters.categories = state.filters.categories.filter(c => c !== value);
              if (state.filters.categories.length === 0 && allCb) allCb.checked = true;
          }
      }
  } else if (type === 'price') {
      state.filters.price = value;
  }
  
  const hash = state.currentRoute;
  const q = hash.includes('?') ? new URLSearchParams(hash.split('?')[1]).get('q') : null;
  const cat = hash.includes('?') ? new URLSearchParams(hash.split('?')[1]).get('cat') : null;
  
  updateShopProductsUI(q, cat);
}

window.updateShopProductsUI = function(q, cat) {
  let productsToDisplay = db.getProducts();
  
  if (q) {
      productsToDisplay = db.searchProducts(q);
  }
  if (cat) {
      productsToDisplay = productsToDisplay.filter(p => p.category.toLowerCase().includes(cat.toLowerCase()));
  }

  // Filter specific sub-categories from checkboxes
  if (state.filters.categories.length > 0) {
      productsToDisplay = productsToDisplay.filter(p => state.filters.categories.includes(p.subCategory) || state.filters.categories.includes(p.category));
  }
  
  // Filter price ranges
  if (state.filters.price === 'Under $50') {
      productsToDisplay = productsToDisplay.filter(p => p.price < 50);
  } else if (state.filters.price === '$50 - $100') {
      productsToDisplay = productsToDisplay.filter(p => p.price >= 50 && p.price <= 100);
  } else if (state.filters.price === 'Over $100') {
      productsToDisplay = productsToDisplay.filter(p => p.price > 100);
  }
  
  const container = document.getElementById('shop-main-container');
  if (!container) return;
  
  container.innerHTML = `
      <div class="shop-header">
          <span>Showing ${productsToDisplay.length} results</span>
          <select style="padding: 5px 10px; border: 1px solid #ccc; outline: none; border-radius: 4px;">
              <option>Sort by: Featured</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Newest Arrivals</option>
          </select>
      </div>
      
      ${productsToDisplay.length > 0 ? `
          <div class="product-grid" style="grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));">
              ${productsToDisplay.map(product => generateProductCard(product)).join('')}
          </div>
      ` : `
          <div style="text-align:center; padding: 50px;">
              <h3>No products found.</h3>
              <p>Try adjusting your search or filters.</p>
          </div>
      `}
  `;
}

function renderShop(hash) {
  const query = hash.includes('?') ? hash.split('?')[1] : '';
  const searchParams = new URLSearchParams(query);
  const q = searchParams.get('q');
  const cat = searchParams.get('cat');
  
  const cats = state.filters.categories;
  const price = state.filters.price;
  const isAllCat = cats.length === 0;

  mainContent.innerHTML = `
      <div class="container section">
          <div class="shop-layout">
              <!-- Sidebar Filters -->
              <aside class="shop-sidebar">
                  <div class="filter-group">
                      <h3 class="filter-title">Categories</h3>
                      <ul class="filter-list">
                          <li><label><input type="checkbox" onchange="updateFilter('category', 'All', this.checked)" ${isAllCat ? 'checked' : ''}> All</label></li>
                          <li><label><input type="checkbox" onchange="updateFilter('category', 'T-Shirts', this.checked)" ${cats.includes('T-Shirts') ? 'checked' : ''}> T-Shirts</label></li>
                          <li><label><input type="checkbox" onchange="updateFilter('category', 'Outerwear', this.checked)" ${cats.includes('Outerwear') ? 'checked' : ''}> Outerwear</label></li>
                          <li><label><input type="checkbox" onchange="updateFilter('category', 'Pants', this.checked)" ${cats.includes('Pants') ? 'checked' : ''}> Pants</label></li>
                          <li><label><input type="checkbox" onchange="updateFilter('category', 'Dresses', this.checked)" ${cats.includes('Dresses') ? 'checked' : ''}> Dresses</label></li>
                          <li><label><input type="checkbox" onchange="updateFilter('category', 'Kids\\' Clothing', this.checked)" ${cats.includes("Kids' Clothing") ? 'checked' : ''}> Kids</label></li>
                      </ul>
                  </div>
                  <div class="filter-group">
                      <h3 class="filter-title">Price Range</h3>
                      <ul class="filter-list">
                          <li><label><input type="radio" name="price" onchange="updateFilter('price', 'All')" ${price === 'All' ? 'checked' : ''}> All</label></li>
                          <li><label><input type="radio" name="price" onchange="updateFilter('price', 'Under $50')" ${price === 'Under $50' ? 'checked' : ''}> Under $50</label></li>
                          <li><label><input type="radio" name="price" onchange="updateFilter('price', '$50 - $100')" ${price === '$50 - $100' ? 'checked' : ''}> $50 - $100</label></li>
                          <li><label><input type="radio" name="price" onchange="updateFilter('price', 'Over $100')" ${price === 'Over $100' ? 'checked' : ''}> Over $100</label></li>
                      </ul>
                  </div>
              </aside>

              <!-- Main Products -->
              <div class="shop-main" id="shop-main-container">
              </div>
          </div>
      </div>
  `;
  
  updateShopProductsUI(q, cat);
}

function renderProductDetails(id) {
  const product = db.getProductById(id);
  if (!product) {
      window.location.hash = '#/shop';
      return;
  }

  // Find related properties
  const inWishlist = state.wishlist.some(p => p.id === product.id);

  mainContent.innerHTML = `
      <div class="container product-details-container">
          <!-- Gallery -->
          <div class="product-gallery">
              <img src="${product.image}" alt="${product.name}" class="main-image">
          </div>

          <!-- Info -->
          <div class="product-info-full">
              <span class="product-category">${product.category}</span>
              <h1 class="pd-title">${product.name}</h1>
              <div class="pd-rating">
                  <i class="fas fa-star"></i>
                  <i class="fas fa-star"></i>
                  <i class="fas fa-star"></i>
                  <i class="fas fa-star"></i>
                  <i class="fas fa-star-half-alt"></i>
                  <span style="color: #777; font-size: 0.9rem;">(${product.reviews} reviews)</span>
              </div>
              <div class="pd-price">$${product.price.toFixed(2)}</div>
              
              <p class="pd-desc">${product.description}</p>

              <div class="selector-group">
                  <div class="selector-title">Size</div>
                  <div class="size-options" id="pd-sizes">
                      ${product.sizes.map((s, i) => `
                          <button class="size-btn ${i === 0 ? 'selected' : ''}" onclick="selectSize(this)">${s}</button>
                      `).join('')}
                  </div>
              </div>

              <div class="selector-group">
                  <div class="selector-title">Color</div>
                  <div class="color-options" id="pd-colors">
                      ${product.colors.map((c, i) => `
                          <button class="color-btn ${i === 0 ? 'selected' : ''}" onclick="selectColor(this)">${c}</button>
                      `).join('')}
                  </div>
              </div>

              <div class="add-to-cart-wrapper">
                  <div class="qty-controls pd-qty">
                      <button class="qty-btn" onclick="updatePdQty(-1)">-</button>
                      <input type="number" value="1" min="1" class="qty-input" id="pd-qty-input">
                      <button class="qty-btn" onclick="updatePdQty(1)">+</button>
                  </div>
                  <button class="btn primary-btn btn-add-cart" onclick="addToCartFromPd(${product.id})">Add to Cart - $${product.price.toFixed(2)}</button>
                  <button class="btn secondary-btn" onclick="toggleWishlist(${product.id})" style="width: 50px; padding: 0;">
                      <i class="${inWishlist ? 'fas' : 'far'} fa-heart" ${inWishlist ? 'style="color: var(--error);"' : ''}></i>
                  </button>
              </div>

              <div style="border-top: 1px solid var(--border-color); padding-top: 20px; font-size: 0.9rem; color: var(--text-light);">
                  <p><i class="fas fa-truck" style="width: 20px;"></i> Free shipping on orders over $150</p>
                  <p><i class="fas fa-undo" style="width: 20px;"></i> 30 days return policy</p>
              </div>
          </div>
      </div>
  `;
}

function renderWishlist() {
  const products = state.wishlist;

  mainContent.innerHTML = `
      <div class="container section">
          <h2 class="section-title">Your Wishlist</h2>
          ${products.length > 0 ? `
              <div class="product-grid" style="grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));">
                  ${products.map(product => generateProductCard(product)).join('')}
              </div>
          ` : `
              <div style="text-align:center; padding: 50px;">
                  <i class="far fa-heart" style="font-size: 3rem; color: #ccc; margin-bottom: 20px;"></i>
                  <h3>Your wishlist is empty</h3>
                  <p style="margin-bottom: 20px;">Save items you love to your wishlist to buy them later.</p>
                  <a href="#/shop" class="btn primary-btn">Explore Shop</a>
              </div>
          `}
      </div>
  `;
}

function renderCheckout() {
  if (state.cart.length === 0) {
      window.location.hash = '#/shop';
      showToast('Your cart is empty', 'error');
      return;
  }

  const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.1;
  const shipping = subtotal > 150 ? 0 : 15.00;
  const total = subtotal + tax + shipping;

  mainContent.innerHTML = `
      <div class="container section">
          <h2 class="section-title">Checkout</h2>
          
          <div class="checkout-container">
              <!-- Form -->
              <form id="checkout-form" onsubmit="handleCheckoutSubmit(event)">
                  <div class="checkout-section">
                      <h3 class="checkout-section-title">1. Contact Information</h3>
                      <div class="form-group">
                          <label>Email Address</label>
                          <input type="email" required placeholder="john@example.com" value="${state.user ? state.user.email : ''}">
                      </div>
                  </div>

                  <div class="checkout-section">
                      <h3 class="checkout-section-title">2. Shipping Address</h3>
                      <div class="form-row">
                          <div class="form-group">
                              <label>First Name</label>
                              <input type="text" required>
                          </div>
                          <div class="form-group">
                              <label>Last Name</label>
                              <input type="text" required>
                          </div>
                      </div>
                      <div class="form-group">
                          <label>Address</label>
                          <input type="text" required placeholder="123 Main St">
                      </div>
                      <div class="form-row">
                          <div class="form-group">
                              <label>City</label>
                              <input type="text" required>
                          </div>
                          <div class="form-group">
                              <label>Postal Code</label>
                              <input type="text" required>
                          </div>
                      </div>
                  </div>

                  <div class="checkout-section">
                      <h3 class="checkout-section-title">3. Payment Methods (Demo)</h3>
                      <div style="display: flex; gap: 15px; margin-bottom: 20px;">
                          <div style="border: 2px solid var(--primary-color); padding: 15px; border-radius: 4px; flex: 1; text-align: center; cursor: pointer;">
                              <i class="far fa-credit-card" style="font-size: 1.5rem; margin-bottom: 10px;"></i>
                              <div>Credit Card</div>
                          </div>
                          <div style="border: 1px solid var(--border-color); padding: 15px; border-radius: 4px; flex: 1; text-align: center; cursor: pointer; color: var(--text-light);">
                              <i class="fab fa-paypal" style="font-size: 1.5rem; margin-bottom: 10px;"></i>
                              <div>PayPal</div>
                          </div>
                      </div>
                      <div class="form-group">
                          <label>Card Number</label>
                          <input type="text" placeholder="0000 0000 0000 0000">
                      </div>
                      <div class="form-row">
                          <div class="form-group">
                              <label>Expiry (MM/YY)</label>
                              <input type="text" placeholder="12/25">
                          </div>
                          <div class="form-group">
                              <label>CVC</label>
                              <input type="text" placeholder="123">
                          </div>
                      </div>
                  </div>
                  
                  <button type="submit" class="btn primary-btn btn-block" style="font-size: 1.1rem; padding: 15px;">Complete Order - $${total.toFixed(2)}</button>
              </form>

              <!-- Summary Sidebar -->
              <div>
                  <div class="order-summary">
                      <h3 class="checkout-section-title">Order Summary</h3>
                      <div style="margin-bottom: 20px; border-bottom: 1px solid var(--border-color); padding-bottom: 15px;">
                          ${state.cart.map(item => `
                              <div style="display: flex; gap: 15px; margin-bottom: 15px;">
                                  <img src="${item.image}" alt="${item.name}" style="width: 60px; height: 80px; object-fit: cover; border-radius: 4px;">
                                  <div style="flex:1;">
                                      <div style="font-weight: 500; font-size: 0.9rem;">${item.name}</div>
                                      <div style="color: var(--text-light); font-size: 0.8rem;">${item.size} / ${item.color} - Qty: ${item.quantity}</div>
                                      <div style="font-weight: 600; margin-top: 5px;">$${(item.price * item.quantity).toFixed(2)}</div>
                                  </div>
                              </div>
                          `).join('')}
                      </div>

                      <div class="summary-item">
                          <span>Subtotal</span>
                          <span>$${subtotal.toFixed(2)}</span>
                      </div>
                      <div class="summary-item">
                          <span>Tax (10%)</span>
                          <span>$${tax.toFixed(2)}</span>
                      </div>
                      <div class="summary-item">
                          <span>Shipping</span>
                          <span>${shipping === 0 ? 'Free' : '$' + shipping.toFixed(2)}</span>
                      </div>
                      <div class="summary-total">
                          <span>Total</span>
                          <span>$${total.toFixed(2)}</span>
                      </div>
                  </div>
              </div>
          </div>
      </div>
  `;
}

function renderAuth() {
  if (state.user) {
      mainContent.innerHTML = `
          <div class="container section" style="text-align:center;">
              <h2 class="section-title">My Account</h2>
              <i class="far fa-user-circle" style="font-size: 5rem; color: var(--accent-color); margin-bottom: 20px;"></i>
              <h3>Welcome back, ${state.user.name}</h3>
              <p>${state.user.email}</p>
              <button class="btn secondary-btn" style="margin-top: 30px;" onclick="handleLogout()">Logout</button>
          </div>
      `;
      return;
  }

  mainContent.innerHTML = `
      <div class="container section">
          <div class="auth-container">
              <div class="auth-image"></div>
              <div class="auth-form-wrapper">
                  <div class="form-toggle">
                      <button class="toggle-btn active" id="btn-login" onclick="switchAuth('login')">Login</button>
                      <button class="toggle-btn" id="btn-register" onclick="switchAuth('register')">Register</button>
                  </div>

                  <!-- Login Form -->
                  <form id="form-login" onsubmit="handleLogin(event)">
                      <div class="form-group">
                          <label>Email Address</label>
                          <input type="email" id="login-email" required>
                      </div>
                      <div class="form-group">
                          <label>Password</label>
                          <input type="password" id="login-password" required>
                      </div>
                      <div style="text-align: right; margin-bottom: 20px;">
                          <a href="#" style="font-size: 0.85rem; color: var(--text-light);">Forgot password?</a>
                      </div>
                      <button type="submit" class="btn primary-btn btn-block">Sign In</button>
                  </form>

                  <!-- Register Form -->
                  <form id="form-register" style="display: none;" onsubmit="handleRegister(event)">
                      <div class="form-group">
                          <label>Full Name</label>
                          <input type="text" id="reg-name" required>
                      </div>
                      <div class="form-group">
                          <label>Email Address</label>
                          <input type="email" id="reg-email" required>
                      </div>
                      <div class="form-group">
                          <label>Password</label>
                          <input type="password" id="reg-password" required>
                      </div>
                      <button type="submit" class="btn primary-btn btn-block">Create Account</button>
                  </form>
              </div>
          </div>
      </div>
  `;
}

// ==========================================
// HELPERS & ACTIONS
// ==========================================
function generateProductCard(product) {
  const inWishlist = state.wishlist.some(p => p.id === product.id);
  const badges = [];
  if (product.newCollection) badges.push('<span class="product-badge badge-new">New</span>');
  if (product.price < 50) badges.push('<span class="product-badge badge-sale">-15%</span>');

  return `
      <div class="product-card">
          <div class="product-image-wrapper">
              ${badges.length > 0 ? `<div class="product-badges">${badges.join('')}</div>` : ''}
              <img src="${product.image}" alt="${product.name}" onclick="window.location.hash='#/product/${product.id}'" style="cursor:pointer">
              
              <div class="product-actions-overlay">
                  <button class="icon-btn ${inWishlist ? 'active' : ''}" onclick="toggleWishlist(${product.id})" title="Add to Wishlist">
                      <i class="${inWishlist ? 'fas' : 'far'} fa-heart"></i>
                  </button>
                  <button class="icon-btn" style="flex:1; border-radius: var(--border-radius); text-transform:uppercase; font-size:0.8rem; font-weight:600;" onclick="quickAddToCart(${product.id})">
                      Add to Cart
                  </button>
              </div>
          </div>
          <div class="product-info" onclick="window.location.hash='#/product/${product.id}'" style="cursor:pointer">
              <div class="product-category">${product.category}</div>
              <h3 class="product-title">${product.name}</h3>
              <div class="product-price">$${product.price.toFixed(2)}</div>
          </div>
      </div>
  `;
}

function updateBadges() {
  const cartQty = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = cartQty;
  if(cartQty > 0) {
      cartCount.style.display = 'flex';
  } else {
      cartCount.style.display = 'none';
  }

  wishlistCount.textContent = state.wishlist.length;
  if(state.wishlist.length > 0) {
      wishlistCount.style.display = 'flex';
  } else {
      wishlistCount.style.display = 'none';
  }
}

// ==========================================
// CART LOGIC
// ==========================================
function toggleCart() {
  cartDrawer.classList.toggle('active');
  cartOverlay.classList.toggle('active');
  if (cartDrawer.classList.contains('active')) {
      renderCartItems();
  }
}

function renderCartItems() {
  if (state.cart.length === 0) {
      cartItemsContainer.innerHTML = '<div class="empty-cart-msg">Your cart is currently empty.</div>';
      cartSubtotal.textContent = '$0.00';
      checkoutBtn.style.display = 'none';
      return;
  }
  
  checkoutBtn.style.display = 'block';

  cartItemsContainer.innerHTML = state.cart.map((item, index) => `
      <div class="cart-item">
          <img src="${item.image}" alt="${item.name}" class="cart-item-img">
          <div class="cart-item-info">
              <div>
                  <h4 class="cart-item-title">${item.name}</h4>
                  <p class="cart-item-meta">${item.size} / ${item.color}</p>
                  <div class="cart-item-price">$${item.price.toFixed(2)}</div>
              </div>
              <div class="cart-item-actions">
                  <div class="qty-controls">
                      <button class="qty-btn" onclick="updateCartQty(${index}, -1)">-</button>
                      <input type="text" value="${item.quantity}" class="qty-input" readonly>
                      <button class="qty-btn" onclick="updateCartQty(${index}, 1)">+</button>
                  </div>
                  <button class="remove-item-btn" onclick="removeFromCart(${index})">Remove</button>
              </div>
          </div>
      </div>
  `).join('');

  const total = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  cartSubtotal.textContent = `$${total.toFixed(2)}`;
}

function quickAddToCart(id) {
  const product = db.getProductById(id);
  const size = product.sizes[0];
  const color = product.colors[0];
  
  addToCart(product, size, color, 1);
  showToast(`${product.name} added to cart!`, 'success');
  toggleCart();
}

function addToCartFromPd(id) {
  const product = db.getProductById(id);
  
  // Get selected size
  const sizeBtns = document.getElementById('pd-sizes').getElementsByClassName('size-btn');
  let size = product.sizes[0];
  for (let btn of sizeBtns) { if(btn.classList.contains('selected')) size = btn.innerText; }
  
  // Get selected color
  const colorBtns = document.getElementById('pd-colors').getElementsByClassName('color-btn');
  let color = product.colors[0];
  for (let btn of colorBtns) { if(btn.classList.contains('selected')) color = btn.innerText; }

  // Get qty
  const qty = parseInt(document.getElementById('pd-qty-input').value);

  addToCart(product, size, color, qty);
  showToast(`${qty} x ${product.name} added to cart!`, 'success');
  toggleCart();
}

function addToCart(product, size, color, quantity) {
  // Check if already in cart
  const existingItemIndex = state.cart.findIndex(i => i.id === product.id && i.size === size && i.color === color);
  
  if (existingItemIndex > -1) {
      state.cart[existingItemIndex].quantity += quantity;
  } else {
      state.cart.push({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          size: size,
          color: color,
          quantity: quantity
      });
  }
  
  saveState();
}

function updateCartQty(index, change) {
  if (state.cart[index]) {
      state.cart[index].quantity += change;
      if (state.cart[index].quantity < 1) {
          removeFromCart(index);
          return;
      }
      saveState();
      renderCartItems();
  }
}

function removeFromCart(index) {
  if (state.cart[index]) {
      state.cart.splice(index, 1);
      saveState();
      renderCartItems();
      showToast('Item removed from cart', 'success');
  }
}

// Product detail selectors logic
window.selectSize = function(btn) {
  const btns = btn.parentElement.getElementsByClassName('size-btn');
  for (let b of btns) b.classList.remove('selected');
  btn.classList.add('selected');
}

window.selectColor = function(btn) {
  const btns = btn.parentElement.getElementsByClassName('color-btn');
  for (let b of btns) b.classList.remove('selected');
  btn.classList.add('selected');
}

window.updatePdQty = function(change) {
  const input = document.getElementById('pd-qty-input');
  let val = parseInt(input.value) + change;
  if(val < 1) val = 1;
  input.value = val;
}


// ==========================================
// WISHLIST LOGIC
// ==========================================
function toggleWishlist(id) {
  const product = db.getProductById(id);
  const index = state.wishlist.findIndex(p => p.id === id);
  
  if (index > -1) {
      state.wishlist.splice(index, 1);
      showToast('Removed from wishlist', 'success');
  } else {
      state.wishlist.push(product);
      showToast('Added to wishlist!', 'success');
  }
  
  saveState();
  if (window.location.hash.includes('#/wishlist') || window.location.hash.includes('#/product/')) {
      handleRoute(); // Re-render to update icons
  } else {
      // Re-render part of home/shop if needed or rely on user navigating
      handleRoute(); 
  }
}

// ==========================================
// SEARCH LOGIC
// ==========================================
function performSearch() {
  const q = searchInput.value.trim();
  if (q) {
      searchBox.classList.remove('active');
      window.location.hash = `#/shop?q=${encodeURIComponent(q)}`;
  }
}

// ==========================================
// AUTH LOGIC
// ==========================================
window.switchAuth = function(formType) {
  const loginForm = document.getElementById('form-login');
  const regForm = document.getElementById('form-register');
  const loginBtn = document.getElementById('btn-login');
  const regBtn = document.getElementById('btn-register');

  if (formType === 'login') {
      loginForm.style.display = 'block';
      regForm.style.display = 'none';
      loginBtn.classList.add('active');
      regBtn.classList.remove('active');
  } else {
      loginForm.style.display = 'none';
      regForm.style.display = 'block';
      loginBtn.classList.remove('active');
      regBtn.classList.add('active');
  }
}

window.handleLogin = function(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  // Mock login
  state.user = { name: "User", email: email };
  saveState();
  showToast('Logged in successfully', 'success');
  window.location.hash = '#/';
}

window.handleRegister = function(e) {
  e.preventDefault();
  const name = document.getElementById('reg-name').value;
  const email = document.getElementById('reg-email').value;
  // Mock registration
  state.user = { name: name, email: email };
  saveState();
  showToast('Account created successfully', 'success');
  window.location.hash = '#/';
}

window.handleLogout = function() {
  state.user = null;
  saveState();
  showToast('Logged out', 'success');
  handleRoute();
}

window.handleCheckoutSubmit = function(e) {
  e.preventDefault();
  // Clear cart upon successful order
  state.cart = [];
  saveState();
  showToast('Order placed successfully! Thank you.', 'success');
  window.location.hash = '#/';
}

// ==========================================
// TOAST NOTIFICATIONS
// ==========================================
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
      <i class="${type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'}"></i>
      <span>${message}</span>
  `;
  
  toastContainer.appendChild(toast);
  
  setTimeout(() => {
      toast.style.animation = 'slideOutRight 0.3s forwards';
      setTimeout(() => {
          toast.remove();
      }, 300);
  }, 3000);
}

// Initialize application
document.addEventListener('DOMContentLoaded', init);
