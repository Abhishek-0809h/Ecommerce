(function () {
  const api = window.NovaCartApi;

  function getMode() {
    const page = document.body.dataset.authPage;
    return page === "signup" ? "signup" : "login";
  }

  function setMessage(message, isError) {
    const status = document.getElementById("authStatus");
    if (!status) return;

    status.textContent = message;
    status.style.color = isError ? "#b42318" : "#1f6f5f";
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const mode = getMode();
    const nameField = document.getElementById("authName");
    const emailField = document.getElementById("authEmail");
    const passwordField = document.getElementById("authPassword");
    const confirmPasswordField = document.getElementById("authConfirmPassword");
    const shippingAddressField = document.getElementById("authShippingAddress");
    const cityPostalField = document.getElementById("authCityPostal");
    const submitButton = document.getElementById("authSubmit");

    const payload = {
      email: emailField.value.trim(),
      password: passwordField.value.trim()
    };

    if (mode === "signup") {
      payload.name = nameField.value.trim();
      payload.shippingAddress = shippingAddressField.value.trim();
      payload.cityPostal = cityPostalField.value.trim();

      if (payload.password !== confirmPasswordField.value.trim()) {
        setMessage("Password and confirm password must match.", true);
        return;
      }
    }

    if (
      !payload.email ||
      !payload.password ||
      (mode === "signup" && (!payload.name || !payload.shippingAddress || !payload.cityPostal))
    ) {
      setMessage("Please fill in all required fields.", true);
      return;
    }

    submitButton.disabled = true;
    setMessage(mode === "signup" ? "Creating your account..." : "Signing you in...", false);

    try {
      const endpoint = mode === "signup" ? "/auth/register" : "/auth/login";
      const response = await fetch(`${api.API_BASE}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || "Authentication failed.");
      }

      localStorage.setItem("novacart-token", data.token);
      localStorage.setItem("novacart-user", JSON.stringify(data.user));

      const cartRefs = api.absorbGuestCart();
      if (cartRefs.length) {
        try {
          await api.syncCart(cartRefs);
        } catch (error) {
          console.warn(error.message);
        }
      } else {
        try {
          await api.loadServerCart();
        } catch (error) {
          console.warn(error.message);
        }
      }

      setMessage(mode === "signup" ? "Account created. Redirecting to store..." : "Login successful. Redirecting to store...", false);
      window.setTimeout(() => {
        window.location.href = "./index.html";
      }, 700);
    } catch (error) {
      const isNetworkError = error instanceof TypeError;
      setMessage(
        isNetworkError
          ? "Could not reach the backend from the browser. Check that the API is running and CORS allows this page origin."
          : error.message,
        true
      );
      submitButton.disabled = false;
    }
  }

  function init() {
    const form = document.getElementById("authForm");
    if (!form) return;

    form.addEventListener("submit", handleSubmit);
  }

  init();
})();
