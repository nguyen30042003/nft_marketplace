/* eslint-disable react/jsx-no-undef */
/* eslint-disable @next/next/no-img-element */
import React, { useState } from 'react';

const NavbarVerifier: React.FC = () => {
  const [search, setSearch] = useState('');

  return (
    <nav className="bg-white dark:bg-gray-800 shadow pt-4 pb-4">
      <div className="max-w-7xl mx-auto flex items-center">
        {/* Left - Logo */}
        <div className="text-xl font-bold text-gray-900 dark:text-white">
          
        </div>

        {/* Right - Search and Avatar */}
        <div className="ml-auto flex items-center space-x-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-64 px-4 py-2 rounded-md border border-black dark:border-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring focus:border-black"
          />

          <button className="bg-black text-white px-5 py-2 rounded-md hover:bg-gray-900 focus:outline-none focus:ring focus:border-gray-300">
            Search
          </button>

          <img
            src="/images/icon/user.png"
            alt="Avatar"
            width={36}
            height={36}
            className="rounded-full cursor-pointer"
          />
        </div>
      </div>
    </nav>
  );
};

export default NavbarVerifier;
