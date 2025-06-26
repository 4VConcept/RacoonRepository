import { useState, useMemo, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { motion } from 'framer-motion';
import { FaPizzaSlice, FaGlassCheers, FaEuroSign } from 'react-icons/fa';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';



export default function SuiviFinancier() {
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [ventes, setVentes] = useState([]);

  const resetDates = () => {
    setStartDate(today);
    setEndDate(today);
  };

  useEffect(() => {
    const fetchCommandes = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/commandes/suivi-financier`);
        const data = await res.json();

       const regroupées = {};

data
  .filter((cmd) => cmd.modePaiement && cmd.modePaiement.toLowerCase() !== 'non')
  .forEach((cmd) => {

  const date = cmd.date?.split('T')[0] ?? today;
  if (!regroupées[date]) {
    regroupées[date] = {
      pizzas: 0,
      boissons: 0,
      montant: 0
    };
  }

  const pizzas = typeof cmd.pizzas === 'string' ? JSON.parse(cmd.pizzas) : cmd.pizzas ?? [];

  const nbPizzas = pizzas.length;
  const nbBoissons = pizzas.filter(p => p?.pizzaId === 'BOISSON').length;
  const total = parseFloat(cmd.total) || 0;

  regroupées[date].pizzas += nbPizzas;
  regroupées[date].boissons += nbBoissons;
  regroupées[date].montant += total;
});


       const result = Object.entries(regroupées).map(([date, v], i) => ({
  id: i + 1,
  date,
  pizzas: v.pizzas,
  boissons: v.boissons,
  montant: v.montant
}));


        setVentes(result);
      } catch (err) {
        console.error('Erreur de chargement des commandes :', err);
      }
    };

    fetchCommandes();
  }, []);

  const ventesFiltrees = useMemo(() => {
    return ventes.filter((v) => {
      return v.date >= startDate && v.date <= endDate;
    });
  }, [startDate, endDate, ventes]);

  const total = ventesFiltrees.reduce(
    (acc, v) => {
      acc.pizzas += v.pizzas;
      acc.boissons += v.boissons;
      acc.ca += v.montant;
      return acc;
    },
    { pizzas: 0, boissons: 0, ca: 0 }
  );

  return (
    <DashboardLayout>
      <div className="p-6 text-white">
        <h1 className="text-3xl font-bold mb-6">💰 Suivi Financier</h1>

        <div className="mb-6 flex flex-col md:flex-row items-start md:items-center gap-4">
          <label className="text-sm text-gray-300">📅 Plage de dates :</label>
          <div className="flex gap-4">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-4 py-2 rounded bg-gray-800 text-white border border-gray-600"
            />
            <span className="text-gray-400">→</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-4 py-2 rounded bg-gray-800 text-white border border-gray-600"
            />
            <button
              onClick={resetDates}
              className="ml-4 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded"
            >
              🔄 Réinitialiser
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-4 rounded-xl bg-gray-800 shadow-md flex items-center gap-4"
          >
            <FaPizzaSlice className="text-orange-500 text-3xl" />
            <div>
              <div className="text-sm text-gray-400">Pizzas vendues</div>
              <div className="text-2xl font-bold text-white">{total.pizzas}</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-4 rounded-xl bg-gray-800 shadow-md flex items-center gap-4"
          >
            <FaGlassCheers className="text-blue-400 text-3xl" />
            <div>
              <div className="text-sm text-gray-400">Boissons vendues</div>
              <div className="text-2xl font-bold text-white">{total.boissons}</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-4 rounded-xl bg-gray-800 shadow-md flex items-center gap-4"
          >
            <FaEuroSign className="text-green-400 text-3xl" />
            <div>
              <div className="text-sm text-gray-400">Chiffre d'affaires</div>
              <div className="text-2xl font-bold text-white">{total.ca.toFixed(2)} €</div>
            </div>
          </motion.div>
        </div>

        <div className="overflow-x-auto rounded-xl shadow border border-gray-700">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-800 text-left">
              <tr>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Pizzas</th>
                <th className="px-4 py-2">Boissons</th>
                <th className="px-4 py-2">Montant (€)</th>
              </tr>
            </thead>
            <tbody>
              {ventesFiltrees.map((v) => (
                <tr key={v.id} className="border-t border-gray-700 hover:bg-gray-800">
                  <td className="px-4 py-2">{v.date}</td>
                  <td className="px-4 py-2">{v.pizzas}</td>
                  <td className="px-4 py-2">{v.boissons}</td>
                  <td className="px-4 py-2">{v.montant.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {ventesFiltrees.length > 0 && (
          <div className="mt-10 h-72 bg-gray-900 p-4 rounded-xl shadow">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ventesFiltrees}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="date" stroke="#ccc" />
                <YAxis stroke="#ccc" />
                <Tooltip />
                <Legend />
                <Bar dataKey="pizzas" fill="#f97316" name="Pizzas" />
                <Bar dataKey="boissons" fill="#3b82f6" name="Boissons" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
