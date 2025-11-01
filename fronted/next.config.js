/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... other configs
  // Yeh line Next.js ko bata degi ki main root folder kaunsa hai
  experimental: {
    turbopack: {
      // Relative path to your main project directory
      root: '../', 
    },
  },
};

module.exports = nextConfig;