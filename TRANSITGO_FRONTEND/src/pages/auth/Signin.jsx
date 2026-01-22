import React from "react";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import SignupImage from "../../assets/img.png";

const Signin = () => {
  const navigate = useNavigate();

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

          <form
            className="mt-26 flex flex-col gap-4"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              placeholder="Email Address"
              className="w-100 ml-10 px-4 py-2.5 rounded-full border border-slate-200 text-slate-800 text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
            />
            <input
              type="password"
              placeholder="Password"
              className="w-100 ml-10 px-4 py-2.5 rounded-full border border-slate-200 text-slate-800 text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
            />

            <button
              type="submit"
              className="mt-3 ml-18 w-85 inline-flex items-center justify-center px-6 py-3 rounded-full bg-teal-600 text-white text-base font-semibold shadow-lg hover:bg-teal-700 hover:shadow-xl transform hover:-translate-y-0.5 transition cursor-pointer"
            >
              Sign In
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
        </div>
      </div>
    </div>
  );
};

export default Signin;
