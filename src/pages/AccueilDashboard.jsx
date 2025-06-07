import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import DashboardLayout from '../components/DashboardLayout';
import {
  FiCalendar,
  FiDollarSign,
  FiCpu,
  FiSettings,
  FiActivity,
} from 'react-icons/fi';

export default function AccueilDashboard() {
  const navigate = useNavigate();

  const shortcuts = [
    {
      title: 'Suivi jour',
      color: 'from-yellow-400 to-yellow-600',
      path: '/suivi-jour',
      icon: <FiCalendar size={32} />,
    },
    // {
    //   title: 'Suivi Financier',
    //   color: 'from-green-400 to-green-600',
    //   path: '/suivi-financier',
    //   icon: <FiDollarSign size={32} />,
    // },
    {
      title: 'Diagnostic API',
      color: 'from-blue-400 to-blue-600',
      path: '/diagnostic-api',
      icon: <FiCpu size={32} />,
    },
    // {
    //   title: 'Journalisation',
    //   color: 'from-gray-400 to-gray-600',
    //   path: '/journalisation',
    //   icon: <FiActivity size={32} />,
    // },
    {
      title: 'Paramètres',
      color: 'from-purple-400 to-purple-600',
      path: '/admin-settings',
      icon: <FiSettings size={32} />,
    },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-4">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl font-extrabold mb-10 text-center bg-gradient-to-r from-orange-400 via-pink-500 to-yellow-500 bg-clip-text text-transparent drop-shadow-lg"
        >
          Bienvenue sur Racoon Pizza 🐾
        </motion.h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {shortcuts.map((item, idx) => (
            <motion.div
              key={idx}
              onClick={() => navigate(item.path)}
              whileTap={{ scale: 0.97 }}
              animate={{ opacity: 1, scale: [1, 1.02, 1] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className={`cursor-pointer p-6 rounded-2xl shadow-xl text-white bg-gradient-to-br ${item.color} relative overflow-hidden active:scale-95 transition-all`}
            >
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white opacity-10 rounded-full blur-3xl"></div>
              <div className="flex items-center gap-4 mb-3">
                <div className="bg-white/10 p-3 rounded-full">{item.icon}</div>
                <h2 className="text-xl sm:text-2xl font-semibold">{item.title}</h2>
              </div>
              <p className="text-sm opacity-80">Accédez à la gestion des {item.title.toLowerCase()}.</p>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
