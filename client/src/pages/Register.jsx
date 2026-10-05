import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import welcomeHome from "../assets/welcome-home.png";

function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
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

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed.");
      }

      localStorage.setItem("token", data.token);
      navigate("/login", { replace: true });

      setSuccessMessage("Account created successfully! You can now log in.");
    } catch (error) {
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
          <h1 className="registration-title">Create an Account</h1>
          <p className="registration-intro">Start building your Recipe Box.</p>
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
              <label htmlFor="username">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                placeholder="Choose a username"
                autoComplete="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
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
                placeholder="Create a password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
              />
            </div>
            <div className="registration-field">
              <label htmlFor="confirmPassword">Confirm password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Repeat your password"
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
            <button className="registration-submit" type="submit">
              Create Account <span aria-hidden="true">→</span>
            </button>
          </form>
          <p className="registration-login">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </section>
    </main>
  );
}

export default Register;
