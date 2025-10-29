import React from 'react';
import { SignInButton, SignUpButton } from '@clerk/clerk-react';

const GoogleIcon = () => (
    <svg className="h-5 w-5 mr-3" role="img" aria-label="Google icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
);


const AuthPage: React.FC = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-dark-navy">
            <div className="text-center p-8 bg-primary-dark rounded-lg border border-white/10 shadow-2xl max-w-sm w-full mx-4">
                <h1 className="text-3xl font-bold text-white">
                    Join Civic<span className="text-glow-blue">India</span>
                </h1>
                <p className="mt-3 text-light-slate">
                    Create an account or sign in to get started.
                </p>
                <div className="mt-8 space-y-4">
                    <SignInButton mode="modal">
                        <button className="w-full flex justify-center items-center bg-white text-gray-800 px-4 py-2.5 rounded-md text-base font-semibold hover:bg-gray-200 transition-colors shadow-md">
                            <GoogleIcon />
                            Continue with Google
                        </button>
                    </SignInButton>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="w-full border-t border-gray-600" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="bg-primary-dark px-2 text-gray-400">
                                Or
                            </span>
                        </div>
                    </div>
                    
                    <SignUpButton mode="modal">
                         <button className="w-full text-white px-8 py-3 rounded-md text-base font-semibold ring-1 ring-inset ring-white/20 hover:ring-white/40 transition-shadow">
                            Sign up with Email
                        </button>
                    </SignUpButton>
                    
                    <div className="mt-4 text-xs text-yellow-200">
                        Note: Phone/SMS-based verification via Clerk is not currently supported for India. Please use Email or Google sign-in to create an account.
                    </div>
                </div>
                 <p className="mt-8 text-xs text-gray-500">
                    By continuing, you agree to our Terms of Service and Privacy Policy.
                </p>
            </div>
        </div>
    );
};

export default AuthPage;