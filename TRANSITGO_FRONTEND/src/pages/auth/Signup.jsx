import React from "react";
import { FcGoogle } from "react-icons/fc";
import SignupImage from "../../assets/img.png";

const Signup = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#b9f3f4] px-4 py-10">
      <div className="w-full max-w-5xl max-h-[640px] flex flex-col md:flex-row rounded-3xl overflow-hidden shadow-2xl bg-white">
        {/* Illustration / Left panel */}
        {/* <div className="hidden md:flex flex-[0.8] items-center justify-center bg-[#ffe6a7] px-8 py-10"> */}
          <img
            src={SignupImage}
            alt="Signup illustration"
            className="max-h-[480px] w-auto object-contain rounded-2xl shadow-2xl"
          />
        {/* </div> */}

        {/* Form / Right panel */}
        <div
          className="flex flex-col px-8 sm:px-10 py-10"
          style={{ flex: 1.2 }}
        >
          <h2 className="text-3xl font-bold text-teal-800 mb-6">Get Started</h2>

          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="text"
              placeholder="Username"
              className="w-full px-4 py-2.5 rounded-full border border-slate-200 text-slate-800 text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
            />
            <input
              type="email"
              placeholder="Email Address"
              className="w-full px-4 py-2.5 rounded-full border border-slate-200 text-slate-800 text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-2.5 rounded-full border border-slate-200 text-slate-800 text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
            />
            <input
              type="password"
              placeholder="Confirm Password"
              className="w-full px-4 py-2.5 rounded-full border border-slate-200 text-slate-800 text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
            />

            <button
              type="submit"
              className="mt-3 ml-16 w-85 inline-flex items-center justify-center px-6 py-3 rounded-full bg-teal-600 text-white text-base font-semibold shadow-lg hover:bg-teal-700 hover:shadow-xl transform hover:-translate-y-0.5 transition cursor-pointer"
            >
              Sign Up
            </button>
          </form>

          <p className="mt-8 text-xs sm:text-sm text-slate-500">
            Already have an account?{" "}
            <button
              type="button"
              className="text-teal-600 font-medium hover:underline cursor-pointer"
            >
              Sign in
            </button>
          </p>

          <div className="mt-11 flex items-center gap-3 text-xs sm:text-sm text-slate-400">
            <div className="flex-1 h-px bg-slate-200" />
            <span>Or sign up with</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <div className="mt-4 flex gap-4">
            <button
              type="button"
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full border border-slate-200 bg-white text-sm text-slate-700 hover:bg-slate-50 transition cursor-pointer"
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

export default Signup;

