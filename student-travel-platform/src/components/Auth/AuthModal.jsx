import { useState, useEffect } from 'react';
import { signInWithGoogle, registerWithEmail, loginWithEmail, auth } from '../../firebase';

function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Reset form on open/close
  useEffect(() => {
    if (isOpen) {
      // Reset states when modal is opened
      setEmail('');
      setPassword('');
      setError('');
      setLoading(false);
    }
  }, [isOpen]);
  
  // Watch for authentication state changes to prevent hanging loading state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user && loading) {
        // If we're loading and user is authenticated, complete the process
        onAuthSuccess(user);
        onClose();
        setLoading(false);
      }
    });
    
    return () => unsubscribe();
  }, [loading, onAuthSuccess, onClose]);
  
  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    
    try {
      const user = await signInWithGoogle();
      if (user) {
        onAuthSuccess(user);
        onClose();
      }
    } catch (error) {
      console.error("Google sign in error:", error);
      setError(error.message || "Failed to sign in with Google. Please try again.");
      setLoading(false);
    }
  };
  
  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      let user;
      
      if (mode === 'login') {
        user = await loginWithEmail(email, password);
      } else {
        user = await registerWithEmail(email, password);
      }
      
      if (user) {
        onAuthSuccess(user);
        onClose();
      }
    } catch (error) {
      console.error("Email auth error:", error);
      
      // Provide more user-friendly error messages
      let errorMessage = `Failed to ${mode === 'login' ? 'sign in' : 'create account'}.`;
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = "Invalid email or password.";
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = "This email is already registered. Try signing in instead.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Password is too weak. Use at least 6 characters.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Invalid email format.";
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = "Network error. Please check your internet connection.";
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "Too many failed attempts. Try again later.";
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = "This sign-in method is not enabled. Please contact support.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };
  
  const handleClose = () => {
    setLoading(false);
    setError('');
    onClose();
  };
  
  // If modal is not open, don't render anything
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </h2>
          <button 
            onClick={handleClose}
            className="text-gray-600 hover:text-gray-800"
            disabled={loading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleEmailAuth} className="mb-4">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
              disabled={loading}
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
              disabled={loading}
              minLength={6}
            />
          </div>
          
          <div className="flex flex-col gap-4">
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
              disabled={loading}
            >
              {loading ? 'Loading...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
            
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="bg-white border border-gray-300 text-gray-700 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full flex items-center justify-center gap-2"
              disabled={loading}
            >
              <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
                <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
                <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
                <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
              </svg>
              Continue with Google
            </button>
          </div>
        </form>
        
        <div className="text-center">
          <button
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setError('');
            }}
            className="text-indigo-600 hover:text-indigo-800 font-semibold"
            disabled={loading}
          >
            {mode === 'login' ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AuthModal;