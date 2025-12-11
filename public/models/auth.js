// public/auth.js
const signupForm = document.getElementById("signupForm");
const loginForm = document.getElementById("loginForm");

const signupError = document.getElementById("signupError");
const loginError = document.getElementById("loginError");

// ----------------------
// Signup
signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("signupUsername").value.trim();
  const password = document.getElementById("signupPassword").value;

  try {
    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    if (!res.ok) {
      const { error } = await res.json();
      throw new Error(error || "Signup failed");
    }

    // Redirect to user dashboard after signup
    window.location.href = "/user.html";

  } catch (err) {
    signupError.textContent = err.message;
  }
});

// ----------------------
// Login
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value;

  try {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    if (!res.ok) {
      const { error } = await res.json();
      throw new Error(error || "Login failed");
    }

    // Redirect to user dashboard after login
    window.location.href = "/user.html";

  } catch (err) {
    loginError.textContent = err.message;
  }
});