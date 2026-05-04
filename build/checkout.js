(function () {
  const api = window.NovaCartApi;
  const TOKEN_KEY = "novacart-token";
  const USER_KEY = "novacart-user";

  function formatCurrency(value) {
    return `Rs ${value.toLocaleString("en-IN")}`;
  }

  function getCheckoutSummary(cartItems) {
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
    const itemCount = cartItems.reduce((sum, item) => sum + item.qty, 0);
    const shipping = subtotal > 0 ? 149 : 0;
    const tax = Math.round(subtotal * 0.08);
    const total = subtotal + shipping + tax;

    return { itemCount, subtotal, shipping, tax, total };
  }

  function collectCustomerDetails() {
    return {
      name: document.getElementById("fullName").value.trim(),
      email: document.getElementById("emailAddress").value.trim(),
      address: document.getElementById("shippingAddress").value.trim(),
      cityPostal: document.getElementById("cityPostal").value.trim()
    };
  }

  function validateCustomer(customer) {
    if (!customer.name || !customer.email || !customer.address || !customer.cityPostal) {
      throw new Error("Please fill in all customer details before payment.");
    }
  }

  function getPaymentMethod() {
    return document.querySelector('input[name="paymentMethod"]:checked')?.value || "razorpay";
  }

  function setPlaceOrderButtonState(disabled, label) {
    const placeOrderButton = document.getElementById("placeOrderButton");
    if (!placeOrderButton) return;

    placeOrderButton.disabled = disabled;
    if (label) {
      placeOrderButton.textContent = label;
      return;
    }

    placeOrderButton.textContent = api.getToken() ? "Place Order" : "Login to Checkout";
  }

  function renderCheckoutAuthState(user) {
    const guestActions = document.getElementById("checkoutGuestActions");
    const userActions = document.getElementById("checkoutUserActions");
    const userName = document.getElementById("checkoutUserName");
    const authNote = document.getElementById("checkoutAuthNote");
    const placeOrderButton = document.getElementById("placeOrderButton");
    const formFields = [
      document.getElementById("fullName"),
      document.getElementById("emailAddress"),
      document.getElementById("shippingAddress"),
      document.getElementById("cityPostal")
    ];

    if (guestActions && userActions && userName) {
      guestActions.hidden = Boolean(user);
      userActions.hidden = !user;
      userName.textContent = user?.name || "Customer";
    }

    if (authNote) {
      authNote.hidden = Boolean(user);
    }

    formFields.forEach((field) => {
      if (!field) return;
      field.readOnly = !user;
    });

    if (placeOrderButton) {
      placeOrderButton.disabled = !user;
      placeOrderButton.textContent = user ? "Place Order" : "Login to Checkout";
    }
  }

  function wireCheckoutAuthControls() {
    const logoutButton = document.getElementById("checkoutLogoutButton");
    if (!logoutButton) return;

    logoutButton.addEventListener("click", () => {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      window.location.href = "./index.html";
    });
  }

  function prefillCustomerDetails(user) {
    if (!user) return;

    document.getElementById("fullName").value = user.name || "";
    document.getElementById("emailAddress").value = user.email || "";
    document.getElementById("shippingAddress").value = user.shippingAddress || "";
    document.getElementById("cityPostal").value = user.cityPostal || "";
  }

  function buildPaymentVerificationPayload(paymentResponse, demoMode) {
    return {
      razorpay_order_id: paymentResponse.razorpay_order_id,
      razorpay_payment_id: paymentResponse.razorpay_payment_id,
      razorpay_signature: paymentResponse.razorpay_signature,
      demoMode
    };
  }

  async function openPayment(summary, customer, cartItems) {
    const paymentMethod = getPaymentMethod();
    if (paymentMethod === "cod") {
      await finalizeOrder(summary, customer, cartItems, null, false, "cod");
      return;
    }

    const paymentSetup = await api.createPaymentOrder(summary.total);
    const placeOrderButton = document.getElementById("placeOrderButton");

    if (!window.Razorpay || paymentSetup.demoMode) {
      const confirmed = window.confirm(`Demo Razorpay payment for ${formatCurrency(summary.total)}. Click OK to simulate payment success.`);
      if (!confirmed) {
        setPlaceOrderButtonState(false);
        return;
      }

      const demoPayment = {
        razorpay_order_id: paymentSetup.order.id,
        razorpay_payment_id: `pay_demo_${Date.now()}`,
        razorpay_signature: `sig_demo_${Date.now()}`
      };

      await finalizeOrder(summary, customer, cartItems, demoPayment, true, "razorpay");
      return;
    }

    const options = {
      key: paymentSetup.key,
      amount: paymentSetup.order.amount,
      currency: paymentSetup.order.currency,
      name: "NovaCart",
      description: "Demo ecommerce checkout",
      order_id: paymentSetup.order.id,
      prefill: {
        name: customer.name,
        email: customer.email
      },
      modal: {
        ondismiss: function () {
          setPlaceOrderButtonState(false);
        }
      },
      theme: {
        color: "#db6a2c"
      },
      handler: async function (response) {
        setPlaceOrderButtonState(true, "Processing...");
        try {
          await finalizeOrder(summary, customer, cartItems, response, false, "razorpay");
        } catch (error) {
          setPlaceOrderButtonState(false);
          window.alert(error.message);
        }
      }
    };

    const razorpayCheckout = new window.Razorpay(options);
    razorpayCheckout.on("payment.failed", function () {
      setPlaceOrderButtonState(false);
      window.alert("Payment failed. Please try the demo payment again.");
    });
    razorpayCheckout.open();
  }

  async function finalizeOrder(summary, customer, cartItems, paymentResponse, demoMode, paymentMethod) {
    if (paymentMethod === "razorpay") {
      await api.verifyPayment(buildPaymentVerificationPayload(paymentResponse, demoMode));
    }

    const payment =
      paymentMethod === "cod"
        ? {
            provider: "Cash on Delivery",
            status: "pending",
            razorpayOrderId: "",
            razorpayPaymentId: "",
            razorpaySignature: "",
            demoMode: false
          }
        : {
            provider: "Razorpay",
            status: "paid",
            razorpayOrderId: paymentResponse.razorpay_order_id,
            razorpayPaymentId: paymentResponse.razorpay_payment_id,
            razorpaySignature: paymentResponse.razorpay_signature,
            demoMode
          };

    await api.createOrder({
      customer: {
        name: customer.name,
        email: customer.email,
        address: customer.address,
        cityPostal: customer.cityPostal
      },
      items: cartItems.map((item) => ({
        productId: item.productId,
        name: item.name,
        category: item.category,
        price: item.price,
        qty: item.qty,
        img: item.img
      })),
      pricing: summary,
      payment
    });

    api.clearCart();
    await api.syncCart([]);
    if (paymentMethod === "cod") {
      window.alert("Order placed successfully with Cash on Delivery.");
    } else {
      window.alert(
        demoMode
          ? "Order placed successfully with demo Razorpay payment."
          : "Order placed successfully with Razorpay payment."
      );
    }
    window.location.href = "./index.html";
  }

  async function renderCheckoutPage() {
    const checkoutPage = document.getElementById("checkoutPage");
    if (!checkoutPage) return;

    const products = await api.getProducts();
    const cartRefs = await api.loadServerCart();
    const cartItems = api.hydrateCart(cartRefs, products);
    const itemList = document.getElementById("checkoutItems");
    const emptyState = document.getElementById("checkoutEmpty");
    const summary = getCheckoutSummary(cartItems);
    let currentUser = api.getUser();

    if (api.getToken()) {
      try {
        currentUser = await api.fetchCurrentUser();
      } catch (error) {
        console.warn(error.message);
      }
    }

    itemList.innerHTML = "";

    if (!cartItems.length) {
      emptyState.hidden = false;
      document.getElementById("checkoutContent").hidden = true;
      return;
    }

    emptyState.hidden = true;
    document.getElementById("checkoutContent").hidden = false;
    wireCheckoutAuthControls();
    renderCheckoutAuthState(currentUser);
    prefillCustomerDetails(currentUser);

    cartItems.forEach((item) => {
      const row = document.createElement("article");
      row.className = "checkout-item";
      row.innerHTML = `
        <div class="checkout-item-copy">
          <h3>${item.name}</h3>
          <p>${item.category}</p>
        </div>
        <div class="checkout-item-meta">
          <span>Qty ${item.qty}</span>
          <strong>${formatCurrency(item.price * item.qty)}</strong>
        </div>
      `;
      itemList.appendChild(row);
    });

    document.getElementById("checkoutItemCount").textContent = summary.itemCount;
    document.getElementById("checkoutSubtotal").textContent = formatCurrency(summary.subtotal);
    document.getElementById("checkoutShipping").textContent = formatCurrency(summary.shipping);
    document.getElementById("checkoutTax").textContent = formatCurrency(summary.tax);
    document.getElementById("checkoutTotal").textContent = formatCurrency(summary.total);

    const placeOrderButton = document.getElementById("placeOrderButton");
    if (placeOrderButton) {
      placeOrderButton.addEventListener("click", async () => {
        if (!api.getToken()) {
          window.location.href = "./login.html";
          return;
        }

        setPlaceOrderButtonState(true, "Processing...");
        try {
          const customer = collectCustomerDetails();
          validateCustomer(customer);
          await api.syncCart(cartRefs);
          await openPayment(summary, customer, cartItems);
        } catch (error) {
          setPlaceOrderButtonState(false);
          window.alert(error.message);
          renderCheckoutAuthState(api.getUser());
        }
      });
    }
  }

  renderCheckoutPage();
})();
