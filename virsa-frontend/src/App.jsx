
import { useState } from "react";
import "./App.css";
import brideImage from "./assets/bride.png";

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const switchMode = () => {
    setIsLogin((previous) => !previous);

    setFormData({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!isLogin && formData.password !== formData.confirmPassword) {
      alert("Your passwords do not match.");
      return;
    }

    // Connect this form to your backend authentication API later.
    alert(
      isLogin
        ? "Login submitted. Backend integration is still needed."
        : "Registration submitted. Backend integration is still needed."
    );
  };

  return (
    <main className="auth-page">
      {/* LEFT PAINTING */}
      <div className="painting painting-left" aria-hidden="true">
        <img src={brideImage} alt="" />
      </div>

      {/* RIGHT MIRRORED PAINTING */}
      <div className="painting painting-right" aria-hidden="true">
        <img src={brideImage} alt="" />
      </div>

      {/* CENTRE LOGIN / REGISTER CARD */}
      <section className="auth-card">
        <a className="brand-name" href="/">
          VIRSA
        </a>

        <p className="brand-tagline">
          WHERE HERITAGE FINDS A HOME
        </p>

        <div className="heading-block">
          <p className="eyebrow">
            {isLogin ? "YOUR JOURNEY CONTINUES" : "BECOME PART OF OUR STORY"}
          </p>

          <h1>
            {isLogin ? (
              <>
                Welcome <em>back</em>
              </>
            ) : (
              <>
                Join the <em>legacy</em>
              </>
            )}
          </h1>

          <p className="form-description">
            {isLogin
              ? "Discover stories woven into every creation"
              : "Create an account and celebrate Indian craftsmanship"}
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                placeholder="Enter your username"
                value={formData.username}
                onChange={handleChange}
                autoComplete="username"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              autoComplete={isLogin ? "current-password" : "new-password"}
              required
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                required
              />
            </div>
          )}

          {isLogin && (
            <div className="form-options">
              <label className="remember-option">
                <input type="checkbox" name="remember" />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                className="text-button"
                onClick={() =>
                  alert("Password recovery will be added with backend integration.")
                }
              >
                Forgot password?
              </button>
            </div>
          )}

          <button type="submit" className="submit-button">
            {isLogin ? "Sign In" : "Create Account"}
            <span aria-hidden="true">↗</span>
          </button>
        </form>

        <p className="switch-mode">
          {isLogin ? "New to Virsa?" : "Already have an account?"}{" "}
          <button
            type="button"
            className="text-button switch-button"
            onClick={switchMode}
          >
            {isLogin ? "Create an account" : "Sign in"}
          </button>
        </p>

        <div className="bottom-ornament" aria-hidden="true">
          <span />
          <span className="ornament-diamond">◆</span>
          <span />
        </div>
      </section>
    </main>
  );
}

export default App;
