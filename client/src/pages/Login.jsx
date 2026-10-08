import { API_URL } from "../config/api";
import { useState } from "react";
import { useAuth } from "../context/useAuth";
import welcomeHome from "../assets/welcome-home.png";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate();

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch(`${API_URL}/api/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed.");
      }

      login(data.token);

      setSuccessMessage("Login successful!");

      setTimeout(() => {
        navigate("/home", { replace: true });
      }, 1000);

    } catch (error) {
      console.error("Login error:", error.message);
      setErrorMessage(error.message);
    }
  }

  return (
    <main className="registration-page">
      <section className="registration-image relative">
        <img
          src={welcomeHome}
          alt="Watercolor Kitchen"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute bottom-10 left-10 right-10 text-white">
          <h2
            className="text-4xl font-semibold text-[#fff3a6]"
            style={{ textShadow: "2px 2px 4px #0d5686" }}
          >
            Your kitchen. Your recipes.
          </h2>

          <p
            className="mt-2 text-lg"
            style={{ textShadow: "2px 2px 4px #0d5686" }}
          >
            Your week, made easier.
          </p>
        </div>
      </section>
      <section className="registration-form-panel flex items-center justify-center px-8 py-12 bg-[#fffdf7]">
        <div className="registration-card">
          <p className="registration-eyebrow">THE RECIPE BOX</p>
          <h1 className="registration-title">Login</h1>
          <p className="registration-intro"></p>
          <form className="registration-form" onSubmit={handleSubmit}>
            {errorMessage && (
              <p
                role="alert"
                className="registration-message registration-error"
              >
                {errorMessage}
              </p>
            )}
            {successMessage && (
              <p
                role="status"
                className="registration-message registration-success"
              >
                {successMessage}
              </p>
            )}
            <div className="registration-field">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="registration-field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
              />
            </div>

            <button className="btn btn-primary btn-block" type="submit">
              Log In <span aria-hidden="true">→</span>
            </button>
            {errorMessage && (
              <p
                role="alert"
                className="registration-message registration-error"
              >
                {errorMessage}
              </p>
            )}

            {successMessage && (
              <p
                role="status"
                className="registration-message registration-success"
              >
                {successMessage}
              </p>
            )}
          </form>
          <p className="registration-login">
            Do you need to create an account?{" "}
            <Link to="/register">Create an account</Link>
          </p>
        </div>
      </section>
    </main>
  );
}

export default Login;
