import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/racoon-logo.png';
import { motion } from 'framer-motion';
export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
const [isLoading, setIsLoading] = useState(false);
const [erreur, setErreur] = useState('');
  const navigate = useNavigate();
const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);
   setErreur('');

 try { 
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });


      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('isLoggedIn', 'true');
navigate('/dashboard');

        
      } else {
        setErreur(data.message || 'Erreur inconnue');
      }
    } catch (err) {
      setErreur('Erreur de connexion au serveur');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 font-sans">
 <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 space-y-6">
        <div className="flex justify-center">
          <motion.img
  src={logo}
  alt="Racoon Pizza"
  animate={{
    scale: [1, 1.03, 1],
    rotate: [0, 1, -1, 0],
    filter: ['drop-shadow(0 0 0px #f97316)', 'drop-shadow(0 0 8px #f97316)', 'drop-shadow(0 0 0px #f97316)'],
  }}
  transition={{
    duration: 4,
    ease: 'easeInOut',
    repeat: Infinity,
  }}
  className="w-36 mx-auto mb-2"
/>
        </div>
        
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Adresse email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
               className="w-full px-3 py-2 !bg-white !text-black border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:text-black"
 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Mot de passe
            </label>
          <input
  type="password"
  required
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  className="w-full px-3 py-2 !bg-white !text-black border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"

 />
          </div>
    <button
  type="submit"
  disabled={isLoading}
  className={`h-12 w-full rounded-md text-white font-semibold bg-orange-600 ${
    isLoading ? 'opacity-70 cursor-not-allowed' : ''
  }`}
>
  {isLoading ? (
    <div className="flex items-center justify-center space-x-2">
      <svg
        className="animate-spin h-6 w-6 text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v8H4z"
        ></path>
      </svg>
      <span>Connexion...</span>
    </div>
  ) : (
    'Se connecter'
  )}
</button>
        </form>
      </div>
    </div>
  );
}
