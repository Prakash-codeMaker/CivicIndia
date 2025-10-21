import React from 'react';
import Link from '../routing/Link';

const Footer: React.FC = () => {
    return (
        <footer className="bg-primary-dark text-white border-t border-white/10">
            <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="font-bold text-xl mb-2 text-white">CivicIndia</h3>
                        <p className="text-sm text-gray-400">Empowering Citizens, Improving Cities.</p>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-3 text-gray-200">Quick Links</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><Link to="/report" className="hover:text-glow-blue transition-colors">Report an Issue</Link></li>
                            <li><Link to="/services" className="hover:text-glow-blue transition-colors">Find Services</Link></li>
                            <li><Link to="/engage" className="hover:text-glow-blue transition-colors">Join Discussions</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-3 text-gray-200">Legal</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><Link to="/" className="hover:text-glow-blue transition-colors">Privacy Policy</Link></li>
                            <li><Link to="/" className="hover:text-glow-blue transition-colors">Terms of Service</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-3 text-gray-200">Connect</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><Link to="/" className="hover:text-glow-blue transition-colors">Contact Us</Link></li>
                            <li><Link to="/" className="hover:text-glow-blue transition-colors">About Us</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-12 border-t border-white/10 pt-8 text-center text-sm text-gray-500">
                    <p>&copy; {new Date().getFullYear()} CivicIndia. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;