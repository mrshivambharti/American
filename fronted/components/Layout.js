// // Overall layout, navbar, footer 
// // frontend/components/Layout.js

// import React from 'react';
// import Link from 'next/link';
// import { useRouter } from 'next/router';
// import { useAuth } from '../context/AuthContext';

// // --- Sub-Component: Navbar ---
// const Navbar = () => {
//     const { isAuthenticated, user, logout } = useAuth();
//     const router = useRouter();

//     // Navigation links array
//     const navLinks = [
//         { name: 'Dashboard', path: '/dashboard', requiresAuth: true },
//         { name: 'Wallet', path: '/wallet', requiresAuth: true },
//         { name: 'Profile', path: '/profile', requiresAuth: true },
//         // { name: 'Admin', path: '/admin', requiresAuth: true, isAdmin: true }, // Future use
//     ];

//     return (
//         <header className="bg-gray-900 shadow-md sticky top-0 z-10">
//             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-4">
//                 {/* Logo/Title */}
//                 <Link href="/" className="text-2xl font-bold text-yellow-500 tracking-wider">
//                     AMERICAN LOCUS
//                 </Link>

//                 {/* Navigation Links */}
//                 <nav className="hidden md:flex space-x-6 items-center">
//                     {isAuthenticated ? (
//                         <>
//                             {navLinks.filter(link => link.requiresAuth).map((link) => (
//                                 <Link 
//                                     key={link.name} 
//                                     href={link.path}
//                                     className={`text-sm font-medium transition duration-150 ease-in-out ${
//                                         router.pathname === link.path 
//                                             ? 'text-yellow-400 border-b-2 border-yellow-400' 
//                                             : 'text-gray-300 hover:text-white'
//                                     }`}
//                                 >
//                                     {link.name}
//                                 </Link>
//                             ))}

//                             {/* Balance Display */}
//                             <div className="bg-gray-700 text-green-400 text-sm font-semibold px-3 py-1.5 rounded-full shadow-inner">
//                                 Balance: ₹{user?.balance?.toFixed(2) || '0.00'}
//                             </div>

//                             {/* Logout Button */}
//                             <button
//                                 onClick={logout}
//                                 className="ml-4 px-4 py-1.5 border border-transparent text-sm font-medium rounded-md text-gray-900 bg-red-400 hover:bg-red-500 transition duration-150"
//                             >
//                                 Logout
//                             </button>
//                         </>
//                     ) : (
//                         <>
//                             <Link href="/login" className={`text-sm font-medium ${router.pathname === '/login' ? 'text-yellow-400' : 'text-gray-300 hover:text-white'}`}>
//                                 Login
//                             </Link>
//                             <Link href="/register" className="px-4 py-1.5 border border-transparent text-sm font-medium rounded-md text-gray-900 bg-yellow-400 hover:bg-yellow-500 transition duration-150">
//                                 Register
//                             </Link>
//                         </>
//                     )}
//                 </nav>

//                 {/* Mobile Menu Icon (We are skipping the complex mobile menu for brevity) */}
//                 <div className="md:hidden">
//                     {isAuthenticated && <span className="text-sm text-green-400">₹{user?.balance?.toFixed(0)}</span>}
//                     {/* Add hamburger menu icon here */}
//                 </div>
//             </div>
//         </header>
//     );
// };

// // --- Main Layout Component ---
// const Layout = ({ children }) => {
//     return (
//         <div className="min-h-screen bg-gray-100 dark:bg-gray-800 flex flex-col">
//             <Navbar />
            
//             {/* Main Content Area */}
//             <main className="flex-grow max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
//                 {children}
//             </main>

//             {/* Simple Footer */}
//             <footer className="bg-gray-900 mt-auto">
//                 <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-400">
//                     &copy; {new Date().getFullYear()} American Locus. All rights reserved.
//                 </div>
//             </footer>
//         </div>
//     );
// };

// export default Layout;


// Overall layout, navbar, footer 
// frontend/components/Layout.js

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

// --- Sub-Component: Navbar (Navigation Bar) ---
const Navbar = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const router = useRouter();

    // Navigation links array
    const navLinks = [
        { name: 'Dashboard', path: '/dashboard', requiresAuth: true },
        { name: 'Wallet', path: '/wallet', requiresAuth: true },
        { name: 'Profile', path: '/profile', requiresAuth: true },
    ];

    return (
        // Navbar ko z-50 aur shadow-xl diya hai taaki hamesha top par rahe
        <header className="bg-gray-800 shadow-xl sticky top-0 z-50 border-b border-gray-700/50"> 
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-4">
                {/* Logo/Title */}
                <Link href="/" className="text-2xl font-extrabold text-yellow-400 tracking-widest hover:text-yellow-300 transition duration-300">
                    AMERICAN LOCUS
                </Link>

                {/* Navigation Links */}
                <nav className="hidden md:flex space-x-6 items-center">
                    {isAuthenticated ? (
                        <>
                            {navLinks.filter(link => link.requiresAuth).map((link) => (
                                <Link 
                                    key={link.name} 
                                    href={link.path}
                                    className={`text-sm font-medium transition duration-150 ease-in-out py-1 ${
                                        router.pathname === link.path 
                                            ? 'text-yellow-400 border-b-2 border-yellow-400' 
                                            : 'text-gray-300 hover:text-white'
                                    }`}
                                >
                                    {link.name}
                                </Link>
                            ))}

                            {/* Balance Display */}
                            <div className="bg-green-600/20 text-green-400 text-sm font-bold px-3 py-1.5 rounded-full shadow-inner border border-green-500/30">
                                Balance: ₹{user?.balance?.toFixed(2) || '0.00'}
                            </div>

                            {/* Logout Button */}
                            <button
                                onClick={logout}
                                className="ml-4 px-4 py-1.5 border border-transparent text-sm font-medium rounded-md text-gray-900 bg-red-500 hover:bg-red-600 transition duration-150 shadow-lg"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link 
                                href="/login" 
                                className={`text-sm font-medium ${router.pathname === '/login' ? 'text-yellow-400' : 'text-gray-300 hover:text-white'}`}
                            >
                                Login
                            </Link>
                            {/* Register Button */}
                            <Link 
                                href="/register" 
                                className="px-4 py-1.5 border border-transparent text-sm font-bold rounded-md text-gray-900 bg-yellow-500 hover:bg-yellow-600 transition duration-150 shadow-md"
                            >
                                Register
                            </Link>
                        </>
                    )}
                </nav>

                {/* Mobile Menu Icon (Mobile devices par balance dikhane ke liye) */}
                <div className="md:hidden">
                    {isAuthenticated && <span className="text-sm text-green-400">₹{user?.balance?.toFixed(0)}</span>}
                    {/* Placeholder for Hamburger Icon */}
                </div>
            </div>
        </header>
    );
};

// --- Main Layout Component ---
const Layout = ({ children }) => {
    return (
        // min-h-screen aur flex-col set kiya
        <div className="min-h-screen flex flex-col bg-gray-900"> 
            <Navbar />
            
            {/* Main Content Area - 'page-container' utility use kiya for padding and centering */}
            <main className="flex-grow page-container">
                {children}
            </main>

            {/* Simple Footer */}
            <footer className="bg-gray-800 mt-auto border-t border-gray-700/50"> 
                <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-400">
                    &copy; {new Date().getFullYear()} American Locus. All rights reserved.
                </div>
            </footer>
        </div>
    );
};

export default Layout;
