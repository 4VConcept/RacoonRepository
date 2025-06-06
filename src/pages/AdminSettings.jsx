
import DashboardLayout from '../components/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useParametres } from '../context/ParametresContext';

export default function AdminSettings() {
  const navigate = useNavigate();
  const CODE_SECRET = import.meta.env.VITE_PARAM_ACCESS_CODE;
const { refreshParametres } = useParametres();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [error, setError] = useState(false);
  const [codeInput, setCodeInput] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const [settings, setSettings] = useState({
    heureDebut: '',
    heureFin: '',
    maxPizza: '',
    delta: '',
    heureRemise: '',
    txRemise: ''
  });

  const handleUnlock = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/api/verifier-code-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codeInput })
      });

      const result = await response.json();

      if (result.success) {
        setIsUnlocked(true);
        setError(false);

        // Charger les paramètres depuis l'API
       // Appel séparé pour charger les paramètres
      const paramResponse = await fetch(`${import.meta.env.VITE_API_BASE}/api/parametres`);
      const paramData = await paramResponse.json();

if (paramData.success && paramData.data) {
  setSettings({
    heureDebut: paramData.data.heureDebut || '',
    heureFin: paramData.data.heureFin || '',
    maxPizza: paramData.data.maxPizza ?? '',
    delta: paramData.data.delta ?? '',
    heureRemise: paramData.data.heureRemise || '',
    txRemise: paramData.data.txRemise || ''
  });
}


      } else {
        setError(true);
      }
    } catch (err) {
      console.error('Erreur de vérification :', err);
      setError(true);
    }
  };

  const handleCancel = () => {
    setCodeInput('');
    setError(false);
    navigate('/dashboard');
  };

  const handleChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/api/parametres`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
         toast.success('Paramètres enregistrés avec succès !');
   // ✅ Recharge les paramètres globalement
      await refreshParametres(); // <--- ici
        } else {
          toast.error('❌ Erreur lors de l’enregistrement des paramètres.');
    }
    } catch (err) {
      console.error('Erreur API :', err);
      toast.error('❌ Erreur réseau');
  }
  };
useEffect(() => {
  if (isUnlocked) {
    fetch(`${import.meta.env.VITE_API_BASE}/api/parametres`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setSettings({
            heureDebut: data.data.heureDebut || '',
            heureFin: data.data.heureFin || '',
            maxPizza: data.data.maxPizza ?? '',
            delta: data.data.delta ?? '',
            heureRemise: data.data.heureRemise || '',
            txRemise: data.data.txRemise || ''
          });
        }
      });
  }
}, [isUnlocked]);

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto text-white">
        <AnimatePresence>
          {!isUnlocked && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
            >
              <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-96 text-center">
                <h2 className="text-xl font-bold mb-4">🔐 Accès Administrateur</h2>
                <input
                  type="password"
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  className="w-full px-4 py-2 rounded-md mb-4 text-black"
                  placeholder="Entrez le code"
                />
                {error && (
                  <p className="text-red-600 text-sm mb-4">
                    Code incorrect. Veuillez réessayer.
                  </p>
                )}
                <div className="flex gap-4">
                  <button
                    onClick={handleUnlock}
                    className="w-full py-2 bg-orange-600 hover:bg-orange-700 rounded-md font-semibold"
                  >
                    Déverrouiller
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-gray-300 hover:bg-gray-400 text-black font-semibold px-4 py-2 rounded"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isUnlocked && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-10 bg-gray-800 p-8 rounded-xl shadow-xl"
          >
            <h1 className="text-2xl font-bold mb-6">🛠 Paramètres Administrateur</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm mb-1">Heure de début de service</label>
               <input
  type="time"
  name="heureDebut"
  value={settings.heureDebut || ''}
  onChange={handleChange}
  className="w-full px-3 py-2 rounded-md text-black"
/>
              </div>
              <div>
                <label className="block text-sm mb-1">Heure de fin de service</label>
               <input
  type="time"
  name="heureFin"
  value={settings.heureFin || ''}
  onChange={handleChange}
  className="w-full px-3 py-2 rounded-md text-black"
/>
              </div>
              <div>
                <label className="block text-sm mb-1">Nombre max de pizzas par quart</label>
              <input
  type="number"
  name="maxPizza"
  value={settings.maxPizza !== undefined ? settings.maxPizza : ''}
  onChange={handleChange}
  className="w-full px-3 py-2 rounded-md text-black"
/>
              </div>
              <div>
                <label className="block text-sm mb-1">Delta supplémentaire</label>
                <input
  type="number"
  name="delta"
  value={settings.delta !== undefined ? settings.delta : ''}
  onChange={handleChange}
  className="w-full px-3 py-2 rounded-md text-black"
/>

              </div>
              <div>
                <label className="block text-sm mb-1">Heure limite pour remise</label>
              <input
  type="time"
  name="heureRemise"
  value={settings.heureRemise || ''}
  onChange={handleChange}
  className="w-full px-3 py-2 rounded-md text-black"
/>
              </div>
              <div>
  <label className="block text-sm mb-1">Taux de remise (%)</label>
  <input
    type="number"
    name="txRemise"
    value={settings.txRemise || ''}
    onChange={handleChange}
    className="w-full px-3 py-2 rounded-md text-black"
  />
</div>

              <div className="col-span-2 mt-6 flex flex-col gap-4">
  <button
    onClick={handleSave}
    className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-lg"
  >
    💾 Enregistrer les modifications
  </button>

  <button
    onClick={async () => {
      if (!confirm('⚠️ Cette action va réinitialiser tout le système. Confirmer ?')) return;
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/commandes/reset-system`, {
          method: 'POST',
        });
        if (res.ok) {
          setResetSuccess(true);
          setTimeout(() => setResetSuccess(false), 4000);
        } else {
          alert('❌ Échec de la réinitialisation.');
        }
      } catch (err) {
        console.error(err);
        alert('❌ Erreur réseau lors de la réinitialisation.');
      }
    }}
    className="w-full py-3 bg-red-700 hover:bg-red-800 text-white font-bold rounded-lg shadow-lg"
  >
    ♻️ Réinitialiser le système
  </button>

  <AnimatePresence>
    {resetSuccess && (
      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-center gap-3 mt-2 p-4 bg-green-700 rounded-lg text-white text-center shadow-xl"
      >
        <FiCheckCircle className="text-2xl text-white animate-ping-once" />
        <span className="text-sm font-medium">Le système a été réinitialisé avec succès !</span>
      </motion.div>
    )}
  </AnimatePresence>
</div>
              
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
