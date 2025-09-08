import React from "react";

const AuthLayout = ({ children }) => {
  return <div className="flex">
      <div className="w-screen h-screen md:w-[60vw] px-12 pt-8 pb-12">
        <h2 className="text-lg font-medium text-black">Task Manager</h2>
        {children}
      </div>

      <div className="hidden md:flex w-[40vw] h-screen items-center justify-center bg-blue-50 bg-[url('/bg-img.png')] bg-cover bg-no-repeat bg-center overflow-hidden p-8">
        <svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" fill="none" viewBox="0 0 160 160">
  <rect width="160" height="160" rx="32" fill="#E5EDFE"/>
  <g>
    <circle cx="80" cy="80" r="56" fill="#6366F1"/>
    <path d="M80 60a20 20 0 0 1 20 20v10h-8v-10a12 12 0 1 0-24 0v10h-8v-10a20 20 0 0 1 20-20z" fill="#fff"/>
    <rect x="68" y="90" width="24" height="32" rx="8" fill="#fff"/>
    <circle cx="80" cy="100" r="4" fill="#6366F1"/>
  </g>
</svg>

      </div>
    </div>
};

export default AuthLayout;
