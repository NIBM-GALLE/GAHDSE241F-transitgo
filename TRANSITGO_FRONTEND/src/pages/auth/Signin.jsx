import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import SignupImage from "../../assets/img.png";
import { signInWithEmail, signInWithGoogle } from "../../firebase/auth";

const Signin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(""); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const result = await signInWithEmail(formData.email, formData.password);

      if (result.success) {
        navigate("/home");
      } else {
        // Handle specific Firebase errors
        let errorMessage = result.error || "Failed to sign in";
        if (errorMessage.includes("user-not-found")) {
          errorMessage = "No account found with this email";
        } else if (errorMessage.includes("wrong-password")) {
          errorMessage = "Incorrect password";
        } else if (errorMessage.includes("invalid-email")) {
          errorMessage = "Invalid email address";
        }
        setError(errorMessage);
      }
    } catch (err) {
      setError(err.message || "An error occurred during signin");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);

    try {
      const result = await signInWithGoogle();

      if (result.success) {
        navigate("/home");
      } else {
        setError(result.error || "Failed to sign in with Google");
      }
    } catch (err) {
      setError(err.message || "An error occurred during Google signin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#b9f3f4] px-4 py-10">
      <div className="w-full max-w-5xl max-h-[640px] flex flex-col md:flex-row rounded-3xl overflow-hidden shadow-2xl bg-white">
        <img
          src={SignupImage}
          alt="Signin illustration"
          className="h-158 w-auto object-contain rounded-2xl shadow-2xl"
        />
        <div
          className="flex flex-col px-8 sm:px-10 py-10"
          style={{ flex: 1.2 }}
        >
          <h2 className="text-3xl font-bold text-teal-800 mb-6">Welcome Back</h2>

          {error && (
            <div className="mb-4 ml-10 px-4 py-2 bg-red-100 border border-red-400 text-red-700 rounded-full text-sm">
              {error}
            </div>
          )}

          <form className="mt-26 flex flex-col gap-4" onSubmit={handleSubmit}>
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              className="w-100 ml-10 px-4 py-2.5 rounded-full border border-slate-200 text-slate-800 text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
              disabled={loading}
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-100 ml-10 px-4 py-2.5 rounded-full border border-slate-200 text-slate-800 text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
              disabled={loading}
            />

            <button
              type="submit"
              disabled={loading}
              className="mt-3 ml-18 w-85 inline-flex items-center justify-center px-6 py-3 rounded-full bg-teal-600 text-white text-base font-semibold shadow-lg hover:bg-teal-700 hover:shadow-xl transform hover:-translate-y-0.5 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <p className="mt-8 ml-10 text-xs sm:text-sm text-slate-500">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/signup")}
              className="text-teal-600 font-medium hover:underline cursor-pointer"
            >
              Sign up
            </button>
          </p>

          <div className="mt-11 flex items-center gap-3 text-xs sm:text-sm text-slate-400">
            <div className="flex-1 h-px bg-slate-200" />
            <span>Or sign in with</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <div className="mt-4 flex gap-4">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full border border-slate-200 bg-white text-sm text-slate-700 hover:bg-slate-50 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FcGoogle size={18} />
              Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signin;
