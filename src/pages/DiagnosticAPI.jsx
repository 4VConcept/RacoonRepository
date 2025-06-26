import DashboardLayout from '../components/DashboardLayout';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ImSpinner2 } from 'react-icons/im';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { FiRefreshCcw, FiActivity } from 'react-icons/fi';

function CustomButton({ onClick, loading, label, icon, color = 'bg-indigo-600', className = '' }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`flex items-center justify-center gap-2 ${color} hover:brightness-110 text-white font-medium px-5 py-2 rounded-xl shadow transition-all ${loading ? 'opacity-70 cursor-not-allowed' : ''} ${className}`}
    >
      {loading ? <ImSpinner2 className="animate-spin" /> : icon}
      {loading ? 'Chargement...' : label}
    </button>
  );
}

export default function DiagnosticAPI() {
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [details, setDetails] = useState('');
  const [progress, setProgress] = useState(0);
  const [launched, setLaunched] = useState(false);
  const [syncStatus, setSyncStatus] = useState('idle');
  const [syncMessage, setSyncMessage] = useState('');
  const [syncProgress, setSyncProgress] = useState(0);
  const [categoriesLocales, setCategoriesLocales] = useState([]);
  const [produitsLocaux, setProduitsLocaux] = useState([]);

  const chargerEtatLocal = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/diagnostic/etat-local`);
      
      const data = await res.json();
      if (data.success) {
        setCategoriesLocales(data.categories);
        setProduitsLocaux(data.produits);
      }
    } catch (err) {
      console.error('Erreur de chargement de l’état local');
    }
  };

  useEffect(() => {
    chargerEtatLocal();
  }, []);

  const simulateProgress = (setFn = setProgress) => {
    setFn(0);
    let value = 0;
    const interval = setInterval(() => {
      value += Math.floor(Math.random() * 10) + 5;
      if (value >= 100) {
        value = 100;
        clearInterval(interval);
      }
      setFn(value);
    }, 120);
  };

  const checkAPI = async () => {
    setStatus('loading');
    setMessage('');
    setDetails('');
    simulateProgress();

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/api/diagnostic`);
      const result = await response.json();

      if (!result.success) throw new Error(result.message);
      setStatus('ok');
      setMessage('Connexion réussie ✅');
      setDetails(`Clients : ${result.count}`);
    } catch (error) {
      setStatus('error');
      setMessage('Échec de connexion ❌');
      setDetails(error.message || 'Erreur inconnue');
    }
  };

  const synchroniserTous = async () => {
   /* setSyncStatus('syncing');
    setSyncMessage('');
    simulateProgress(setSyncProgress);*/

    try {
   /*   const response = await fetch(`${import.meta.env.VITE_API_BASE}/api/diagnostic/sync-all`);
      const result = await response.json();

      if (!result.success) throw new Error(result.message);
      setSyncStatus('success');
      setSyncMessage(`✅ ${result.total.categories} catégories et ${result.total.produits} produits synchronisés`);
      await chargerEtatLocal();*/
    } catch (error) {
      setSyncStatus('failure');
      setSyncMessage(`❌ Erreur : ${error.message}`);
    }
  };

  const renderStatusIcon = () => {
    switch (status) {
      case 'loading': return <ImSpinner2 className="animate-spin text-gray-500 text-3xl" />;
      case 'ok': return <FaCheckCircle className="text-green-600 text-3xl" />;
      case 'error': return <FaTimesCircle className="text-red-600 text-3xl" />;
      default: return null;
    }
  };

  const cardColor = {
    idle: 'bg-gray-100 text-gray-700',
    loading: 'bg-blue-100 text-blue-800',
    ok: 'bg-green-100 text-green-800',
    error: 'bg-red-100 text-red-800',
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <motion.h1 initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold mb-6 flex items-center gap-3">
              <FiActivity className="text-orange-500" /> Diagnostic API 
            </motion.h1>

            {launched && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, x: status === 'error' ? [0, -5, 5, -5, 5, 0] : 0 }} transition={{ duration: 0.5, type: 'spring' }} className={`p-4 rounded-xl shadow-md flex items-center gap-4 ${cardColor[status]}`}>
                {renderStatusIcon()}
                <div>
                  <div className="text-lg font-semibold">{message || 'Test en cours...'}</div>
                  {details && <div className="text-sm mt-1">{details}</div>}
                </div>
              </motion.div>
            )}

            {!launched && (
              <div className="mt-6">
                <CustomButton onClick={() => { setLaunched(true); checkAPI(); }} loading={false} label="Lancer API HIBOUTIK" icon={<FiActivity />} color="bg-orange-600" />
              </div>
            )}

            {status === 'error' && (
              <div className="mt-4">
                <CustomButton onClick={checkAPI} loading={false} label="Relancer le test" icon={<FiActivity />} color="bg-red-600" />
              </div>
            )}
          </div>

          <div>
           <motion.h1
  initial={{ opacity: 0, y: -15 }}
  animate={{ opacity: 1, y: 0 }}
  className="text-3xl font-bold mb-6 flex items-center gap-3"
>
  <FiRefreshCcw className="text-indigo-600" />
  Synchronisation API
</motion.h1>
            <CustomButton onClick={synchroniserTous} loading={syncStatus === 'syncing'} label="Synchroniser API HIBOUTIK" icon={<FiRefreshCcw />} color="bg-indigo-600" />

            {syncStatus === 'syncing' && (
              <div className="w-full bg-gray-200 rounded-full h-2 mt-4 overflow-hidden">
                <motion.div className="h-2 bg-blue-500 rounded-full" initial={{ width: 0 }} animate={{ width: `${syncProgress}%` }} transition={{ duration: 0.2 }} />
              </div>
            )}

            {(syncStatus === 'success' || syncStatus === 'failure') && (
              <div className={`mt-4 text-sm font-medium ${syncStatus === 'success' ? 'text-green-600' : 'text-red-600'}`}>{syncMessage}</div>
            )}
          </div>
        </div>

     <div className="mt-10">
  <h2 className="text-xl font-bold mb-4">📋 Base de données local</h2>

  {categoriesLocales.map((cat) => {
    const produitsDeCetteCategorie = produitsLocaux.filter(p => p.categorie_id === cat.id);

    return (
      <div key={cat.id} className="mb-8 border rounded-lg shadow overflow-hidden">
        <div className="bg-gray-200 px-4 py-2 font-semibold text-gray-800">
          📁 {cat.nom} ({produitsDeCetteCategorie.length} produit{produitsDeCetteCategorie.length > 1 ? 's' : ''})
        </div>

        <table className="w-full text-sm text-left text-gray-800 bg-white">
          <thead className="bg-gray-100 text-xs uppercase">
            <tr>
              <th className="px-4 py-2">Nom</th>
              <th className="px-4 py-2">Prix (€)</th>
              <th className="px-4 py-2">Description</th>
            </tr>
          </thead>
          <tbody>
            {produitsDeCetteCategorie.length === 0 ? (
              <tr>
                <td colSpan="3" className="px-4 py-2 italic text-gray-400">Aucun produit</td>
              </tr>
            ) : (
              produitsDeCetteCategorie.map((prod) => (
                <tr key={prod.id} className="border-t">
                  <td className="px-4 py-2">{prod.nom}</td>
                  <td className="px-4 py-2">{Number(prod.prix).toFixed(2)}</td>
                  <td className="px-4 py-2">{prod.description || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  })}
</div>

      </div>
    </DashboardLayout>
  );
}