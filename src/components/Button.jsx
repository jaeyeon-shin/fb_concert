import React from "react";

const Button = ({ icon, label, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center space-y-2 focus:outline-none transition-transform duration-200"
    >
      <img
        src={icon}
        alt={label}
        className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 object-contain"
      />
      <span className="text-gray-800 text-base sm:text-lg md:text-xl font-semibold tracking-wide">
        {label}
      </span>
    </button>
  );
};

export default Button;