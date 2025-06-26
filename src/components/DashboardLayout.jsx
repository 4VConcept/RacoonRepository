// src/components/DashboardLayout.jsx

import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import TopHeader from './TopHeader';
import {
  FiSettings,
  FiClock,
  FiWifi,
  FiFileText,
  FiDollarSign
} from 'react-icons/fi';
import logo from '../assets/racoon-logo.png';
import { useState } from 'react';

export default function DashboardLayout({ children }) {
  const navigate = useNavigate();
const location = useLocation();
const [menuOuvert, setMenuOuvert] = useState(false);

const currentPath = location.pathname;
  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    navigate('/');
  };

  return (

    
    <div className="min-h-screen flex bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white font-sans">
       {/* Menu latéral */}
      <aside className={`p-6 bg-gray-950 shadow-xl flex-col justify-between transition-all duration-300 
        ${menuOuvert ? 'w-64 flex' : 'w-20 flex'}`}>

        <div className="flex flex-col items-center">
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
  className="w-32 mx-auto mb-6"
/><button
  onClick={() => setMenuOuvert(!menuOuvert)}
  className="text-white text-xl mb-6 bg-transparent hover:bg-orange-600 p-2 rounded transition"
>
  ☰
</button>
  <nav className="space-y-4">
            <motion.a
              onClick={() => { navigate('/dashboard'); setMenuOuvert(false); }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all cursor-pointer 
    ${currentPath === '/dashboard' ? 'bg-orange-600 text-white font-semibold' : 'text-white hover:bg-orange-600 hover:text-white'}`}
 >
              🏠 {menuOuvert && 'Tableau de bord'}
            </motion.a>

            <motion.a onClick={() => { navigate('/suivi-jour'); setMenuOuvert(false); }} whileHover={{ scale: 1.05 }}
                     className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all cursor-pointer 
    ${currentPath === '/suivi-jour' ? 'bg-orange-600 text-white font-semibold' : 'text-white hover:bg-orange-600 hover:text-white'}`}
 >  📅 {menuOuvert && 'Suivi jour'}
            </motion.a>

            

      

            {/* <motion.a onClick={() => { navigate('/suivi-financier'); setMenuOuvert(false); }} whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-orange-600 transition-all cursor-pointer">
              💰 {menuOuvert && 'Suivi Financier'}
            </motion.a> */}
                  <motion.a onClick={() => { navigate('/diagnostic-api'); setMenuOuvert(false); }} whileHover={{ scale: 1.05 }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all cursor-pointer 
    ${currentPath === '/diagnostic-api' ? 'bg-orange-600 text-white font-semibold' : 'text-white hover:bg-orange-600 hover:text-white'}`}
 >🧪 {menuOuvert && 'Diagnostic API'}
            </motion.a>

            <motion.a onClick={() => { navigate('/journalisation'); setMenuOuvert(false); }} whileHover={{ scale: 1.05 }}
                       className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all cursor-pointer 
    ${currentPath === '/journalisation' ? 'bg-orange-600 text-white font-semibold' : 'text-white hover:bg-orange-600 hover:text-white'}`}
 > 🧾 {menuOuvert && 'Journalisation'}
            </motion.a>
            <motion.a onClick={() => { navigate('/admin-settings'); setMenuOuvert(false); }} whileHover={{ scale: 1.05 }}
                       className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all cursor-pointer 
    ${currentPath === '/admin-settings' ? 'bg-orange-600 text-white font-semibold' : 'text-white hover:bg-orange-600 hover:text-white'}`}
 > ⚙️ {menuOuvert && 'Paramètres'}
            </motion.a>
          </nav>
            <motion.button
  onClick={() => {
    localStorage.clear();
    navigate('/');
  }}
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.97 }}
  className="w-full mt-10 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md font-semibold flex items-center justify-center gap-2 transition-all focus:outline-none focus:ring-2 focus:ring-red-400"
>
  🔓 {menuOuvert && 'Se déconnecter'}
</motion.button>

        </div>

 
      </aside>

      {/* Contenu principal */}
      <main className="flex-1 p-10 overflow-auto">
        <TopHeader></TopHeader>
        {children}
      </main>
    </div>
  );
}
