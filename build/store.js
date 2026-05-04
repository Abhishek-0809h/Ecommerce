(function () {
  const api = window.NovaCartApi;
  const TOKEN_KEY = "novacart-token";
  const USER_KEY = "novacart-user";

  let products = [];
  let categories = ["All"];
  let selectedCategory = "All";
  let searchTerm = "";
  let sortBy = "featured";
  let cartRefs = api.getCartRefs();
  let cartOpen = false;

  const currency = (value) => `Rs ${value.toLocaleString("en-IN")}`;

  function getDetailedCart() {
    return api.hydrateCart(cartRefs, products);
  }

  function filteredProducts() {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const result = products.filter((product) => {
      const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
      const matchesSearch =
        product.name.toLowerCase().includes(normalizedSearch) ||
        product.category.toLowerCase().includes(normalizedSearch) ||
        product.description.toLowerCase().includes(normalizedSearch);
      return matchesCategory && matchesSearch;
    });

    if (sortBy === "price-low") result.sort((a, b) => a.price - b.price);
    if (sortBy === "price-high") result.sort((a, b) => b.price - a.price);
    if (sortBy === "rating") result.sort((a, b) => b.rating - a.rating);
    if (sortBy === "name") result.sort((a, b) => a.name.localeCompare(b.name));

    return result;
  }

  function renderCategoryChips() {
    const container = document.getElementById("categoryChips");
    container.innerHTML = "";

    categories.forEach((category) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `chip${category === selectedCategory ? " active" : ""}`;
      button.textContent = category;
      button.addEventListener("click", () => {
        selectedCategory = category;
        renderCatalog();
      });
      container.appendChild(button);
    });
  }

  function renderProducts() {
    const container = document.getElementById("products");
    const result = filteredProducts();
    container.innerHTML = "";

    if (!result.length) {
      container.innerHTML = `
        <div class="empty-state">
          <h3>No matching products found</h3>
          <p>Try another category or change your search keywords.</p>
        </div>
      `;
      return;
    }

    result.forEach((product) => {
      const card = document.createElement("article");
      card.className = "card";
      card.innerHTML = `
        <div class="card-media">
          <img src="${product.img}" alt="${product.name}">
          <div class="badge-row">
            <span class="badge">${product.tag}</span>
            <span class="rating">${product.rating} &#9733;</span>
          </div>
        </div>
        <div class="card-content">
          <div class="card-title">
            <div>
              <h4>${product.name}</h4>
              <small>${product.category}</small>
            </div>
          </div>
          <p>${product.description}</p>
          <div class="meta-row">
            <div class="price">${currency(product.price)}</div>
            <div class="stock">${product.stock}</div>
          </div>
          <div class="card-actions">
            <button class="btn" type="button" onclick="addToCart(${product.productId})">Add to Cart</button>
            <button class="btn-secondary" type="button" onclick="selectCategory('${product.category}')">More Like This</button>
          </div>
        </div>
      `;
      container.appendChild(card);
    });
  }

  function renderResultsMeta() {
    const result = filteredProducts();
    const label = selectedCategory === "All" ? "all categories" : selectedCategory;
    document.getElementById("resultsMeta").textContent =
      `Showing ${result.length} product${result.length === 1 ? "" : "s"} in ${label}.`;
  }

  function renderCatalog() {
    renderCategoryChips();
    renderProducts();
    renderResultsMeta();
  }

  window.selectCategory = function selectCategory(category) {
    selectedCategory = category;
    renderCatalog();
  };

  async function saveCart() {
    api.setCartRefs(cartRefs);
    if (api.getToken()) {
      try {
        await api.syncCart(cartRefs);
      } catch (error) {
        console.warn(error.message);
      }
    }
  }

  function showToast(message) {
    if (window.Toastify) {
      window.Toastify({
        text: message,
        duration: 2200,
        gravity: "top",
        position: "right",
        stopOnFocus: true,
        style: {
          background: "linear-gradient(135deg, #1f2937, #db6a2c)",
          color: "#fff",
          borderRadius: "14px",
          boxShadow: "0 14px 30px rgba(17, 24, 39, 0.18)"
        }
      }).showToast();
      return;
    }

    window.alert(message);
  }

  function showLoginRequiredToast() {
    if (window.Toastify) {
      window.Toastify({
        text: "Please login first. Tap this message to open the login page.",
        duration: 5000,
        gravity: "top",
        position: "right",
        stopOnFocus: true,
        close: true,
        destination: "./login.html",
        newWindow: false,
        style: {
          background: "linear-gradient(135deg, #b94f15, #1f2937)",
          color: "#fff",
          borderRadius: "14px",
          boxShadow: "0 14px 30px rgba(17, 24, 39, 0.18)"
        }
      }).showToast();
      return;
    }

    window.alert("Please login first.");
  }

  function setCartOpen(nextState) {
    cartOpen = nextState;

    const cartPanel = document.getElementById("cartPanel");
    const cartBackdrop = document.getElementById("cartBackdrop");
    const mobileCartButton = document.getElementById("mobileCartButton");
    const isDrawerViewport = window.innerWidth <= 1120;
    if (!cartPanel || !cartBackdrop) return;

    cartPanel.classList.toggle("open", cartOpen && isDrawerViewport);
    cartBackdrop.classList.toggle("active", cartOpen && isDrawerViewport);
    cartPanel.setAttribute("aria-hidden", String(!(cartOpen && isDrawerViewport)));
    if (mobileCartButton) {
      mobileCartButton.setAttribute("aria-expanded", String(cartOpen && isDrawerViewport));
    }
    document.body.style.overflow = cartOpen && isDrawerViewport ? "hidden" : "";
  }

  window.addToCart = async function addToCart(id) {
    if (!api.getToken()) {
      showLoginRequiredToast();
      return;
    }

    const product = products.find((item) => item.productId === id);
    const existing = cartRefs.find((item) => item.productId === id);

    if (existing) {
      existing.qty += 1;
    } else {
      cartRefs.push({ productId: id, qty: 1 });
    }

    await saveCart();
    renderCart();
    showToast(product ? `${product.name} added to cart` : "Item added to cart");
  };

  window.changeQty = async function changeQty(id, delta) {
    if (!api.getToken()) {
      showLoginRequiredToast();
      return;
    }

    const item = cartRefs.find((entry) => entry.productId === id);
    if (!item) return;

    item.qty += delta;
    if (item.qty <= 0) {
      cartRefs = cartRefs.filter((entry) => entry.productId !== id);
    }

    await saveCart();
    renderCart();
  };

  window.removeItem = async function removeItem(id) {
    if (!api.getToken()) {
      showLoginRequiredToast();
      return;
    }

    cartRefs = cartRefs.filter((entry) => entry.productId !== id);
    await saveCart();
    renderCart();
    showToast("Item removed from cart");
  };

  function renderCart() {
    const cartItems = document.getElementById("cartItems");
    const cart = getDetailedCart();
    cartItems.innerHTML = "";

    let itemCount = 0;
    let subtotal = 0;

    if (!cart.length) {
      cartItems.innerHTML = `<div class="cart-empty">Your cart is empty. Add a few products to see your order summary here.</div>`;
    } else {
      cart.forEach((item) => {
        itemCount += item.qty;
        subtotal += item.price * item.qty;

        const card = document.createElement("div");
        card.className = "cart-item";
        card.innerHTML = `
          <div class="cart-item-top">
            <div>
              <h4>${item.name}</h4>
              <p>${item.category}</p>
            </div>
            <strong>${currency(item.price * item.qty)}</strong>
          </div>
          <div class="qty">
            <div class="qty-controls">
              <button type="button" onclick="changeQty(${item.productId}, -1)">-</button>
              <span>${item.qty}</span>
              <button type="button" onclick="changeQty(${item.productId}, 1)">+</button>
            </div>
            <button class="remove" type="button" onclick="removeItem(${item.productId})">Remove</button>
          </div>
        `;
        cartItems.appendChild(card);
      });
    }

    const shipping = subtotal > 0 ? 149 : 0;
    const tax = Math.round(subtotal * 0.08);
    const total = subtotal + shipping + tax;

    document.getElementById("count").textContent = itemCount;
    document.getElementById("subtotal").textContent = currency(subtotal);
    document.getElementById("shipping").textContent = currency(shipping);
    document.getElementById("tax").textContent = currency(tax);
    document.getElementById("total").textContent = currency(total);
    document.getElementById("cartItemSummary").textContent = `${itemCount} item${itemCount === 1 ? "" : "s"}`;
    document.getElementById("cartTotalSummary").textContent = currency(total);
    document.getElementById("mobileCartCount").textContent = `${itemCount} item${itemCount === 1 ? "" : "s"} in cart`;
    document.getElementById("mobileCartTotal").textContent = currency(total);
  }

  function wireControls() {
    document.getElementById("searchInput").addEventListener("input", (event) => {
      searchTerm = event.target.value;
      renderCatalog();
    });

    document.getElementById("sortSelect").addEventListener("change", (event) => {
      sortBy = event.target.value;
      renderCatalog();
    });
  }

  function wireCheckoutButton() {
    const checkoutButton = document.getElementById("checkoutButton");
    if (!checkoutButton) return;

    checkoutButton.addEventListener("click", () => {
      if (!api.getToken()) {
        showLoginRequiredToast();
        return;
      }

      const cartItems = api.getCartRefs();
      if (!cartItems.length) {
        window.alert("Your cart is empty. Add products before proceeding to checkout.");
        return;
      }

      window.location.href = "./checkout.html";
    });
  }

  function renderStats() {
    document.getElementById("productCount").textContent = products.length;
    document.getElementById("categoryCount").textContent = categories.length - 1;
    document.getElementById("heroCategoryCount").textContent = categories.length - 1;
  }

  function renderAuthState() {
    const guestActions = document.getElementById("guestActions");
    const userActions = document.getElementById("userActions");
    const userName = document.getElementById("userName");
    const mobileCartButton = document.getElementById("mobileCartButton");
    const cartPanel = document.getElementById("cartPanel");
    const cartShell = document.querySelector(".cart-shell");
    const layout = document.querySelector(".layout");
    const currentUser = api.getUser();

    if (!guestActions || !userActions || !userName) {
      return;
    }

    const isLoggedIn = Boolean(api.getToken());
    const isDesktopViewport = window.innerWidth > 1120;

    document.body.classList.toggle("auth-logged-in", isLoggedIn);
    document.body.classList.toggle("auth-logged-out", !isLoggedIn);

    if (mobileCartButton) {
      mobileCartButton.hidden = !isLoggedIn;
    }

    if (cartPanel) {
      const shouldHideDesktopCart = !isLoggedIn && isDesktopViewport;
      cartPanel.hidden = shouldHideDesktopCart;
      if (shouldHideDesktopCart) {
        setCartOpen(false);
      }
    }

    if (cartShell) {
      cartShell.hidden = !isLoggedIn && isDesktopViewport;
    }

    if (layout) {
      layout.classList.toggle("desktop-cart-hidden", !isLoggedIn && isDesktopViewport);
    }

    if (isLoggedIn) {
      guestActions.hidden = true;
      userActions.hidden = false;
      userName.textContent = currentUser.name || currentUser.email || "Customer";
      return;
    }

    guestActions.hidden = false;
    userActions.hidden = true;
    userName.textContent = "Customer";
  }

  function wireAuthControls() {
    const logoutButton = document.getElementById("logoutButton");
    if (!logoutButton) return;

    logoutButton.addEventListener("click", () => {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      renderAuthState();
      window.location.href = "./index.html";
    });
  }

  function wireCartControls() {
    const mobileCartButton = document.getElementById("mobileCartButton");
    const cartCloseButton = document.getElementById("cartCloseButton");
    const cartBackdrop = document.getElementById("cartBackdrop");

    if (mobileCartButton) {
      mobileCartButton.addEventListener("click", () => {
        setCartOpen(true);
      });
    }

    if (cartCloseButton) {
      cartCloseButton.addEventListener("click", () => {
        setCartOpen(false);
      });
    }

    if (cartBackdrop) {
      cartBackdrop.addEventListener("click", () => {
        setCartOpen(false);
      });
    }

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        setCartOpen(false);
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 1120) {
        setCartOpen(false);
      }
      renderAuthState();
    });
  }

  async function init() {
    products = await api.getProducts();
    categories = ["All", ...new Set(products.map((product) => product.category))];
    if (api.getToken()) {
      cartRefs = await api.loadServerCart();
    } else {
      cartRefs = [];
      api.setCartRefs([]);
    }

    renderAuthState();
    wireAuthControls();
    wireCartControls();
    wireControls();
    wireCheckoutButton();
    renderStats();
    renderCatalog();
    renderCart();
  }

  init();
})();
