// src/pages/SuiviJour.jsx

import { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import TopHeader from '../components/TopHeader';
import { motion } from 'framer-motion';
export default function SuiviJour() {
  const [creneaux, setCreneaux] = useState([]);

  const heureDebut = '11:00';
  const heureFin = '22:00';
  const pizzasParQuart = 20;

  useEffect(() => {
    const generateCreneaux = () => {
      const blocks = [];
      const start = new Date();
      const [h1, m1] = heureDebut.split(':').map(Number);
      const [h2, m2] = heureFin.split(':').map(Number);

      start.setHours(h1, m1, 0, 0);
      const end = new Date();
      end.setHours(h2, m2, 0, 0);

      while (start < end) {
        const next = new Date(start.getTime() + 15 * 60 * 1000);
        blocks.push({
          time: start.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          commandes: [],
        });
        start.setTime(next.getTime());
      }
      return blocks;
    };

    setCreneaux(generateCreneaux());
  }, []);

  return (
    <DashboardLayout>
  topHeader={<TopHeader total={Object.values(commandes).flat().length} />}>

      <div className="text-white">
      <motion.div
  key={Object.values(commandes).flat().length}
  initial={{ scale: 0.9, opacity: 0.7 }}
  animate={{ scale: 1, opacity: 1 }}
  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
  className="flex justify-end mb-4"
>
  <div className="bg-orange-600 text-white px-5 py-2 rounded-full shadow-xl text-sm font-semibold">
    🍕 Total pizzas : {Object.values(commandes).flat().length}
  </div>
</motion.div>
<div className="text-white mb-4">Total2 pizzas : {Object.values(commandes).flat().length}</div>

<h1 className="text-3xl font-bold mb-6">📅 Suivi2 journalier des commandes</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {creneaux.map((creneau, idx) => (
            <div key={idx} className="bg-gray-800 rounded-xl p-4 shadow hover:shadow-lg transition-all">
              <div className="text-sm font-bold text-orange-400 mb-2">{creneau.time}</div>
              <div className="text-gray-300 text-xs">Commandes : {creneau.commandes.length} / {pizzasParQuart}</div>
              <div className="mt-2 min-h-[40px] bg-gray-900 rounded p-2">{/* commandes ici */}</div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}