(function () {
  const API_BASE = window.NOVACART_API_BASE || "https://ecommerce-backend-mdcr.onrender.com/api";
  const TOKEN_KEY = "novacart-token";
  const USER_KEY = "novacart-user";
  const GUEST_CART_KEY = "novacart-cart-guest";

  const fallbackProducts = [
    { productId: 1, name: "Aero Sneakers", category: "Fashion", price: 2499, rating: 4.7, stock: "In stock", tag: "Best Seller", img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80", description: "Lightweight everyday sneakers with cushioned comfort and a bold streetwear finish." },
    { productId: 2, name: "Studio Tee", category: "Fashion", price: 799, rating: 4.3, stock: "In stock", tag: "Everyday", img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80", description: "A soft oversized T-shirt made for easy layering and all-day comfort." },
    { productId: 3, name: "Luna Denim Jacket", category: "Fashion", price: 3299, rating: 4.6, stock: "In stock", tag: "Seasonal", img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80", description: "A structured denim layer with a modern fit and durable premium stitching." },
    { productId: 4, name: "Pulse Smart Watch", category: "Electronics", price: 3999, rating: 4.8, stock: "Limited stock", tag: "New", img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80", description: "Fitness tracking, call alerts, and a sleek AMOLED face for modern routines." },
    { productId: 5, name: "Wave Headphones", category: "Electronics", price: 2899, rating: 4.6, stock: "In stock", tag: "Popular", img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80", description: "Wireless over-ear headphones with immersive sound and long battery life." },
    { productId: 6, name: "Orbit Tablet", category: "Electronics", price: 18499, rating: 4.5, stock: "In stock", tag: "Work Ready", img: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=900&q=80", description: "A slim entertainment and productivity tablet with vivid display and all-day power." },
    { productId: 7, name: "Terra Backpack", category: "Accessories", price: 1599, rating: 4.5, stock: "In stock", tag: "Travel Pick", img: "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&w=900&q=80", description: "A spacious daily backpack with clean styling, laptop storage, and soft straps." },
    { productId: 8, name: "Solstice Sunglasses", category: "Accessories", price: 999, rating: 4.4, stock: "In stock", tag: "Summer Edit", img: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=900&q=80", description: "Sharp unisex frames with UV protection and a premium matte finish." },
    { productId: 9, name: "Leather Card Holder", category: "Accessories", price: 1199, rating: 4.4, stock: "In stock", tag: "Compact", img: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=900&q=80", description: "A slim leather wallet with dedicated card slots for minimalist everyday carry." },
    { productId: 10, name: "Glow Desk Lamp", category: "Home", price: 1899, rating: 4.6, stock: "In stock", tag: "Home Upgrade", img: "https://m.media-amazon.com/images/I/51adSLdjWGL._AC_UF1000,1000_QL80_.jpg", description: "Minimal desk lighting with warm tone control for study corners and work setups." },
    { productId: 11, name: "Ceramic Brew Mug", category: "Home", price: 649, rating: 4.2, stock: "In stock", tag: "Fresh Pick", img: "https://imgmediagumlet.lbb.in/media/2020/12/5fe037822416f11927233b3e_1608529794919.jpg" },
    { productId: 12, name: "Cloud Cushion Set", category: "Home", price: 1499, rating: 4.5, stock: "In stock", tag: "Cozy", img: "https://m.media-amazon.com/images/I/51JO8R6bCAL._AC_UF1000,1000_QL80_.jpg", description: "Soft decorative cushions that add warmth and texture to sofas, beds, and reading nooks." },
    { productId: 13, name: "Active Yoga Mat", category: "Fitness", price: 1299, rating: 4.6, stock: "In stock", tag: "Wellness", img: "https://m.media-amazon.com/images/I/81WBh2ulPBL._AC_UF894,1000_QL80_.jpg", description: "A grippy fitness mat built for yoga flows, stretching, and home workouts." },
    { productId: 14, name: "Core Kettlebell", category: "Fitness", price: 2199, rating: 4.5, stock: "In stock", tag: "Strength", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRcEOzGMv8XN-vnPt5ree_C7BsOV7lgKAGyuw&s", description: "Durable iron kettlebell for strength sessions and compact home gym setups." },
    { productId: 15, name: "Trail Runner Bottle", category: "Fitness", price: 699, rating: 4.3, stock: "In stock", tag: "Hydration", img: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=80", description: "An insulated training bottle that keeps water cool through long workouts and commutes." },
    { productId: 16, name: "Storybound Novel", category: "Books", price: 499, rating: 4.7, stock: "In stock", tag: "Reader Favorite", img: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=80", description: "A beautifully bound modern novel with immersive storytelling and collector appeal." },
    { productId: 17, name: "Focus Planner", category: "Books", price: 899, rating: 4.5, stock: "In stock", tag: "Productivity", img: "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=900&q=80", description: "A guided planner for weekly goals, habit tracking, and structured daily planning." },
    { productId: 18, name: "Design Thinking Guide", category: "Books", price: 1099, rating: 4.6, stock: "In stock", tag: "Insight", img: "https://m.media-amazon.com/images/I/61raFNWcinL._UF1000,1000_QL80_.jpg", description: "A practical reference book full of creative problem-solving methods and case studies." },
    { productId: 19, name: "HydraGlow Serum", category: "Beauty", price: 1399, rating: 4.5, stock: "In stock", tag: "Skin Care", img: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=900&q=80", description: "A lightweight face serum formulated to hydrate, smooth, and brighten your routine." },
    { productId: 20, name: "Velvet Matte Lipstick", category: "Beauty", price: 799, rating: 4.4, stock: "In stock", tag: "Makeup", img: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=900&q=80", description: "A long-wear lipstick with rich pigment and a soft matte finish." },
    { productId: 21, name: "Botanical Hand Cream", category: "Beauty", price: 549, rating: 4.3, stock: "In stock", tag: "Self Care", img: "https://images.unsplash.com/photo-1619451334792-150fd785ee74?auto=format&fit=crop&w=900&q=80", description: "Nourishing daily hand cream with a clean botanical scent and fast-absorbing texture." },
    { productId: 22, name: "Chef's Fry Pan", category: "Kitchen", price: 2499, rating: 4.6, stock: "In stock", tag: "Top Rated", img: "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcSuhprm7v8097OX28d4Ky-1LOhQZliYiS6EjsbRzYCSD2XNPJe5mWMWdJAeysaBho3KYAtz7_5xIIfHpwZcgk1YfVOpmonVJqGriY11SkDXHPSrQh_JqhRILl7wt7n-UNIqNs-0mYc&usqp=CAc", description: "A non-stick fry pan designed for everyday cooking with even heat distribution." },
    { productId: 23, name: "Steel Knife Set", category: "Kitchen", price: 3199, rating: 4.5, stock: "In stock", tag: "Chef Pick", img: "https://images.unsplash.com/photo-1593618998160-e34014e67546?auto=format&fit=crop&w=900&q=80", description: "Essential kitchen knives with balanced handles and precision-forged steel blades." },
    { productId: 24, name: "Pour Over Kettle", category: "Kitchen", price: 1799, rating: 4.4, stock: "In stock", tag: "Brew Bar", img: "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcSeBgXXbCjvvlAjmEaqkctapld5UGDqqh2sJWq3RbyyTGWxA3HeLFfXfxmYIdZbr-l1RTmFInx-Es15-xkufLhUd4nqpD93Br8qHF6PHtNUmXLINHiaX4pSKc8s79UHis9fXCwG-g&usqp=CAc", description: "A gooseneck kettle for controlled pours and better home coffee rituals." },
    { productId: 25, name: "Maple Study Desk", category: "Furniture", price: 12499, rating: 4.7, stock: "In stock", tag: "Workspace", img: "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcSYI_zZ_wdtHw9lY94M2Ladpt5a79EvAGCNnXUqj41oEiZHiOsUybPytgeFVtCJD35tqTv3-SbPxalDiWGC5kHgiiKvZbxKYc1D3wF17lY&usqp=CAc", description: "A clean-lined wooden desk with generous workspace for study and home offices." },
    { productId: 26, name: "Lounge Accent Chair", category: "Furniture", price: 15499, rating: 4.5, stock: "Limited stock", tag: "Statement", img: "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcSVRQ9tjbHaUMdxXLDHkM8SGMBvd3w54BMh8Hlu-lqSgf7aNClQhh98z_Fbeb0YOxxvBeHJ2f3RJMQSLot6f5fquiWtfWPiz9RLbveYnzLu7Bu5fbJb3NN6Q2t_PV7bHyGeQiPh4A&usqp=CAc", description: "A comfortable accent chair that brings sculptural seating into your living room." },
    { productId: 27, name: "Floating Wall Shelf", category: "Furniture", price: 2299, rating: 4.4, stock: "In stock", tag: "Storage", img: "https://m.media-amazon.com/images/I/61yBq-iGOVL._AC_UF894,1000_QL80_.jpg", description: "A sturdy floating shelf for books, decor, and compact room organization." },
    { productId: 28, name: "Aroma Soy Candle", category: "Lifestyle", price: 699, rating: 4.5, stock: "In stock", tag: "Calm Living", img: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=900&q=80", description: "A hand-poured soy candle with warm notes designed to reset your space." },
    { productId: 29, name: "Travel Journal", category: "Lifestyle", price: 599, rating: 4.4, stock: "In stock", tag: "Creative", img: "https://i.etsystatic.com/42593573/r/il/62466c/4966663965/il_fullxfull.4966663965_fol8.jpg", description: "A premium journal for documenting trips, reflections, and everyday ideas." },
    { productId: 30, name: "Desk Plant Pot", category: "Lifestyle", price: 849, rating: 4.3, stock: "In stock", tag: "Fresh Space", img: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=900&q=80", description: "A minimalist ceramic planter that adds a fresh natural accent to desks and shelves." }
  ];

  async function request(path, options) {
    const token = localStorage.getItem(TOKEN_KEY);
    const headers = {
      "Content-Type": "application/json",
      ...(options && options.headers ? options.headers : {})
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || "Request failed.");
    }

    return data;
  }

  function getCartKey() {
    const user = getUser();
    if (user && user.id) {
      return `novacart-cart-user-${user.id}`;
    }

    return GUEST_CART_KEY;
  }

  function readCart(key) {
    try {
      return JSON.parse(localStorage.getItem(key)) || [];
    } catch (error) {
      return [];
    }
  }

  function getCartRefs() {
    return readCart(getCartKey());
  }

  function setCartRefs(cart) {
    localStorage.setItem(getCartKey(), JSON.stringify(cart));
  }

  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function getUser() {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY)) || null;
    } catch (error) {
      return null;
    }
  }

  function persistSession(payload) {
    if (payload.token) {
      localStorage.setItem(TOKEN_KEY, payload.token);
    }
    if (payload.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(payload.user));
    }
  }

  async function fetchCurrentUser() {
    if (!getToken()) {
      return null;
    }

    const data = await request("/auth/me");
    persistSession({ user: data.user });
    if (Array.isArray(data.cart)) {
      setCartRefs(data.cart);
    }
    return data.user;
  }

  function absorbGuestCart() {
    const guestCart = readCart(GUEST_CART_KEY);
    const userCart = getCartRefs();

    if (!guestCart.length || userCart.length) {
      return userCart;
    }

    setCartRefs(guestCart);
    localStorage.removeItem(GUEST_CART_KEY);
    return guestCart;
  }

  async function getProducts() {
    try {
      return await request("/products");
    } catch (error) {
      return fallbackProducts;
    }
  }

  function hydrateCart(cartRefs, products) {
    return cartRefs
      .map((item) => {
        const product = products.find((entry) => entry.productId === item.productId);
        return product ? { ...product, qty: item.qty } : null;
      })
      .filter(Boolean);
  }

  async function ensureAuth(customer) {
    if (getToken()) {
      return getUser();
    }

    const registerPayload = {
      name: customer.name,
      email: customer.email,
      password: customer.password,
      shippingAddress: customer.shippingAddress,
      cityPostal: customer.cityPostal
    };

    try {
      const registerData = await request("/auth/register", {
        method: "POST",
        body: JSON.stringify(registerPayload)
      });
      persistSession(registerData);
      return registerData.user;
    } catch (error) {
      const loginData = await request("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: customer.email,
          password: customer.password
        })
      });
      persistSession(loginData);
      return loginData.user;
    }
  }

  async function syncCart(cartRefs) {
    if (!getToken()) {
      return cartRefs;
    }

    const data = await request("/cart", {
      method: "PUT",
      body: JSON.stringify({ cart: cartRefs })
    });
    setCartRefs(data.cart || []);
    return data.cart || [];
  }

  async function loadServerCart() {
    if (!getToken()) {
      return getCartRefs();
    }

    try {
      const data = await request("/cart");
      setCartRefs(data.cart || []);
      return data.cart || [];
    } catch (error) {
      return getCartRefs();
    }
  }

  async function createPaymentOrder(amount) {
    return request("/payments/create-order", {
      method: "POST",
      body: JSON.stringify({ amount })
    });
  }

  async function verifyPayment(payload) {
    return request("/payments/verify", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  }

  async function createOrder(orderPayload) {
    return request("/orders", {
      method: "POST",
      body: JSON.stringify(orderPayload)
    });
  }

  function clearCart() {
    setCartRefs([]);
  }

  window.NovaCartApi = {
    API_BASE,
    fallbackProducts,
    getCartRefs,
    setCartRefs,
    absorbGuestCart,
    getProducts,
    hydrateCart,
    ensureAuth,
    fetchCurrentUser,
    syncCart,
    loadServerCart,
    createPaymentOrder,
    verifyPayment,
    createOrder,
    clearCart,
    getToken,
    getUser
  };
})();
