// Auth Frontend Logic
class AuthManager {
  constructor() {
    this.token = localStorage.getItem("authToken");
    this.user = localStorage.getItem("authUser") ? JSON.parse(localStorage.getItem("authUser")) : null;
  }

  isLoggedIn() {
    return !!this.token;
  }

  async register(username, password, confirmPassword, securityQuestion, securityAnswer) {
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
          confirmPassword,
          securityQuestion,
          securityAnswer,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      this.setAuth(data.token, data.user);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async requestSecurityQuestion(username, password) {
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      if (!data.requiresSecurityQuestion) {
        throw new Error("Security question challenge was not returned");
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async loginWithSecurityAnswer(username, password, securityAnswer) {
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, securityAnswer }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      this.setAuth(data.token, data.user);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  setAuth(token, user) {
    this.token = token;
    this.user = user;
    localStorage.setItem("authToken", token);
    localStorage.setItem("authUser", JSON.stringify(user));
  }

  logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
  }

  getAuthHeader() {
    return { Authorization: `Bearer ${this.token}` };
  }
}

const auth = new AuthManager();

// Export for use in other scripts
if (typeof module !== "undefined" && module.exports) {
  module.exports = auth;
}
