import React, { useState } from 'react';
import Link from '../routing/Link';
import { UserButton, useUser } from '@clerk/clerk-react';
import NotificationBell from './NotificationBell';

const Header: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user } = useUser();

    const closeMenu = () => setIsMenuOpen(false);

    return (
        <header className="sticky top-0 bg-dark-navy/80 backdrop-blur-lg border-b border-white/10 z-40">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex-shrink-0">
                        <Link to="/" className="text-2xl font-bold text-white">
                            Civic<span className="text-glow-blue">India</span>
                        </Link>
                    </div>
                    
                    <div className="hidden md:flex md:items-center md:space-x-8">
                        <Link to="/report" className="text-sm font-medium text-gray-300 hover:text-glow-blue transition-colors">Report Issue</Link>
                        <Link to="/track" className="text-sm font-medium text-gray-300 hover:text-glow-blue transition-colors">Track Complaint</Link>
                        <Link to="/services" className="text-sm font-medium text-gray-300 hover:text-glow-blue transition-colors">Services</Link>
                        <Link to="/engage" className="text-sm font-medium text-gray-300 hover:text-glow-blue transition-colors">Engage</Link>
                        <Link to="/profile" className="text-sm font-medium text-gray-300 hover:text-glow-blue transition-colors">My Profile</Link>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="hidden md:flex items-center space-x-4">
                             {user && <NotificationBell userId={user.id} />}
                             <UserButton afterSignOutUrl="/" />
                        </div>
                        <div className="md:hidden">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                type="button"
                                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                                aria-controls="mobile-menu"
                                aria-expanded="false"
                            >
                                <span className="sr-only">Open main menu</span>
                                {!isMenuOpen ? (
                                    <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                ) : (
                                    <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            {isMenuOpen && (
                <div className="md:hidden" id="mobile-menu">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <Link to="/report" onClick={closeMenu} className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Report Issue</Link>
                        <Link to="/track" onClick={closeMenu} className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Track Complaint</Link>
                        <Link to="/services" onClick={closeMenu} className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Services</Link>
                        <Link to="/engage" onClick={closeMenu} className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Engage</Link>
                        <Link to="/profile" onClick={closeMenu} className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium">My Profile</Link>
                    </div>
                     <div className="pt-4 pb-3 border-t border-gray-700">
                       <div className="flex justify-center px-5 py-2">
                          <UserButton afterSignOutUrl="/" />
                       </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;