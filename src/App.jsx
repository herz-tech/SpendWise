
import { useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import API_BASE_URL from "./api";
import Dashboard from "./pages/Dashboard";
import MainLayout from "./components/MainLayout";
import TransactionsPage from "./pages/TransactionsPage";
import BudgetPage from "./pages/BudgetPage";
import ReportsPage from "./pages/ReportsPage";
import ProfilePage from "./pages/ProfilePage";
import girlIllustration from "./assets/spendwise-girl.png";
import { useEffect } from "react";
import "./App.css";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  return token ? children : <Navigate to="/" replace />;
}

function AuthPage() {
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setIsError(false);
    setLoading(true);

    try {
      const endpoint = isLogin ? "login" : "register";

      const response = await fetch(
        `${API_BASE_URL}/api/auth/${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/dashboard");
    } catch (error) {
      setIsError(true);
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const switchAuthMode = () => {
    setIsLogin(!isLogin);
    setShowPassword(false);
    setMessage("");
    setIsError(false);

    setFormData({
      name: "",
      email: "",
      password: "",
    });
  };

  return (
    <div className="app-container">
      <div className="auth-layout">

        {/* LEFT BRAND PANEL */}
        <section className="auth-visual">
          <div className="visual-top">
            <div className="visual-brand">
              <span className="brand-symbol">💰</span>
              <span>SpendWise<span className="brand-dot">.</span></span>
            </div>

            <span className="visual-tag">PERSONAL FINANCE</span>
          </div>

          <div className="visual-content">
            <span className="visual-eyebrow">
              YOUR MONEY. YOUR FUTURE.
            </span>

            <h1>
              Make every
              <br />
              rupee <span>count.</span>
            </h1>

            <p>
              Take charge of your finances, build better
              habits, and make smarter decisions with
              every transaction.
            </p>

           <div className="visual-illustration">
  <img
    src={girlIllustration}
    alt="Girl counting money"
  />
</div>
          </div>

          <div className="visual-footer">
            <span>Simple money management.</span>
            <span>Designed for you. ✦</span>
          </div>

          <div className="visual-decoration visual-decoration-one"></div>
          <div className="visual-decoration visual-decoration-two"></div>
        </section>

        {/* RIGHT AUTH PANEL */}
        <section className="auth-panel">
          <div className="auth-panel-top">
            <span className="secure-label">
              <span className="secure-dot"></span>
              YOUR FINANCES, SECURED
            </span>
          </div>

          <div className="auth-form-container">
            <div className="auth-heading">
              <span className="auth-eyebrow">
                {isLogin ? "WELCOME BACK" : "GET STARTED"}
              </span>

              <h2>
                {isLogin ? (
                  <>Welcome <span>back.</span></>
                ) : (
                  <>Create your <span>account.</span></>
                )}
              </h2>

              <p>
                {isLogin
                  ? "Sign in to continue managing your money."
                  : "Join SpendWise and take control of your finances."}
              </p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>

              {!isLogin && (
                <div className="form-group">
                  <label htmlFor="auth-name">Full name</label>

                  <input
                    id="auth-name"
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    autoComplete="name"
                    required
                  />
                </div>
              )}

              <div className="form-group">
                <label htmlFor="auth-email">Email address</label>

                <input
                  id="auth-email"
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="auth-password">Password</label>

                <div className="password-wrapper">
                  <input
                    id="auth-password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete={
                      isLogin ? "current-password" : "new-password"
                    }
                    minLength={6}
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="auth-button"
                disabled={loading}
              >
                <span>
                  {loading
                    ? "Please wait..."
                    : isLogin
                    ? "Sign in to SpendWise"
                    : "Create my account"}
                </span>

                {!loading && <span className="button-arrow">→</span>}
              </button>
            </form>

            {message && (
              <p className={isError ? "error-message" : "success-message"}>
                {message}
              </p>
            )}

            <div className="auth-divider">
              <span></span>
              <small>OR</small>
              <span></span>
            </div>

            <p className="toggle-text">
              {isLogin
                ? "New to SpendWise?"
                : "Already have an account?"}

              <button type="button" onClick={switchAuthMode}>
                {isLogin ? "Create an account" : "Sign in"}
              </button>
            </p>
          </div>

          <div className="auth-panel-footer">
            <span>© 2026 SpendWise</span>
            <span>Take control of your money.</span>
          </div>
        </section>

      </div>
    </div>
  );
}
function App() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("spendwise-theme") || "light"
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("spendwise-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((current) =>
      current === "light" ? "dark" : "light"
    );
  };

  return (
    <Routes>
      <Route path="/" element={<AuthPage />} />

      <Route
        element={
          <ProtectedRoute>
            <MainLayout
              theme={theme}
              toggleTheme={toggleTheme}
            />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/budgets" element={<BudgetPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
export default App;
