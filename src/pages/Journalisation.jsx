import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import axios from 'axios';
import { FiActivity, FiEye } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function Journalisation() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [logDetail, setLogDetail] = useState(null);
const [logsAffiches, setLogsAffiches] = useState([]);
const [filtreRecherche, setFiltreRecherche] = useState('');
const [filtreUtilisateur, setFiltreUtilisateur] = useState('all');
const [filtreDateMin, setFiltreDateMin] = useState('');
const [filtreDateMax, setFiltreDateMax] = useState('');
const filtrerLogs = (recherche, utilisateur, dateMin, dateMax) => {
  const term = recherche.toLowerCase();

  const logsFiltres = logs.filter((log) => {
    const dateLog = new Date(log.date).toISOString().split('T')[0];

    const matchRecherche =
      log.action.toLowerCase().includes(term) ||
      log.utilisateur.toLowerCase().includes(term);

    const matchUtilisateur = utilisateur === 'all' || log.utilisateur === utilisateur;

    const matchDateMin = !dateMin || dateLog >= dateMin;
    const matchDateMax = !dateMax || dateLog <= dateMax;

    return matchRecherche && matchUtilisateur && matchDateMin && matchDateMax;
  });

  setLogsAffiches(logsFiltres);
};


  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/logs/internes');
      setLogs(Array.isArray(res.data) ? res.data : []);
      setLogsAffiches(Array.isArray(res.data) ? res.data : []);

    } catch (err) {
      console.error('Erreur chargement logs :', err);
      setLogs([]);
    }
    setLoading(false);
  };

  const extraireInfosLog = (log) => {
    const { action, date } = log;
const numero = action.match(/N°\s*:?[\s-]*([\w-]+)/)?.[1] ?? 'Inconnu';
const client = action.match(/Client ?: (.+)/)?.[1] ?? 'Anonyme';
    const total = action.match(/Total ?: ([\d.,]+) €/)?.[1] ?? '0.00';
    const dateCommande = action.match(/Date ?: (.+)/)?.[1]?.split('T')[0] ?? '';
    const heureCommande = action.match(/Date ?: .+T(.+?)Z/)?.[1]?.slice(0, 5) ?? '';
    const nouveauCreneau =
    action.match(/Nouveau créneau ?: ([\d:]+)/)?.[1] ??
    action.match(/-> ([\d:]+)/)?.[1] ??
    null;
    console.log(action); 
    console.log(numero); 
    return {
      numero,
      client,
      total,
      dateLog: new Date(date).toLocaleString(),
      dateCommande,
      heureCommande,
       nouveauCreneau,
    };
  };
const formatDateFrUTC = (isoDate) => {
  const date = new Date(isoDate);

  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(date.getUTCDate()).padStart(2, '0');
  const hh = String(date.getUTCHours()).padStart(2, '0');
  const min = String(date.getUTCMinutes()).padStart(2, '0');
  const ss = String(date.getUTCSeconds()).padStart(2, '0');

  return `${dd}/${mm}/${yyyy} à ${hh}:${min}:${ss}`;
};
  return (
    <DashboardLayout>
 <div className="p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-3 text-orange-400">
            <FiActivity className="text-xl" />
            Journalisation interne
            <span className="ml-2 text-sm text-gray-400">
              ({logsAffiches.length} log{logsAffiches.length > 1 ? 's' : ''})
            </span>
          </h2>
          {logsAffiches.length > 0 && (
            <button
              onClick={async () => {
                if (confirm("⚠️ Cette action supprimera tous les logs. Confirmer ?")) {
                  try {
                    await axios.delete('/api/logs/internes');
                    toast.success("Tous les logs ont été supprimés.");
                    setLogs([]);
                    setLogsAffiches([]);
                  } catch (err) {
                    console.error(err);
                    toast.error("Erreur lors de la suppression.");
                  }
                }
              }}
              className="mt-4 sm:mt-0 text-sm px-4 py-2 bg-red-700 text-white rounded hover:bg-red-800 transition"
            >
              🗑️ Vider les logs
            </button>
          )}
        </div>


        {loading ? (
          <p className="text-gray-300">⏳ Chargement des logs...</p>
        ) : logs.length === 0 ? (
          <p className="text-red-400">❌ Aucun log enregistré.</p>
        ) : (
          <ul className="space-y-3">
            {logsAffiches.map((log, index) => {
              const {
                numero,
                client,
                total,
                dateLog,
                
                heureCommande,
                nouveauCreneau
              } = extraireInfosLog(log);

              return (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="flex justify-between items-center bg-gray-800 rounded-lg px-4 py-4 shadow border border-gray-700 hover:border-orange-500 transition"
                >
                  <div className="flex-1 pr-4">
{nouveauCreneau ? (
  <>
    <p className="text-orange-400 font-bold text-base mb-1">
      🔄 Changement de créneau pour la commande <span className="underline">{numero}</span>
    </p>
    <p className="text-sm text-gray-300">🕒 Nouveau créneau : {nouveauCreneau}</p>
    
    <p className="text-sm text-gray-300">🧾 N° de commande : {numero}</p>
  </>
) : (
  <>
    <p className="text-orange-400 font-bold text-base mb-1">
      🆕 Nouvelle commande n° <span className="underline">{numero}</span> 🕒 à {heureCommande}
    </p>
    <p className="text-sm text-gray-300">👤 Client : {client}</p>
    <p className="text-sm text-gray-300">💶 Total : {total} €</p>
  </>
)}

{/* <p className="text-sm text-gray-300">📅 Log : {dateLog}</p> */}
               
                  </div>
                  <button
                    onClick={() => setLogDetail(log)}
                    className="flex-shrink-0 bg-orange-600 text-white px-3 py-1 rounded hover:bg-orange-700 transition"
                  >
                    <FiEye />
                  </button>
                </motion.li>
              );
            })}
          </ul>
        )}

      
        {/* MODALE DE DÉTAIL */}
<AnimatePresence>
  {logDetail && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center px-4"
    >
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        className="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden text-black relative"
      >
        {/* En-tête colorée */}
        <div className="bg-orange-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FiActivity className="text-white text-2xl" />
            <h3 className="text-white text-lg font-bold">Détail complet du log</h3>
          </div>
          <button
            onClick={() => setLogDetail(null)}
            className="text-white text-2xl hover:text-yellow-300 transition"
          >
            ×
          </button>
        </div>

        {/* Corps de la modale */}
        <div className="p-6 space-y-4 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-500 font-semibold mb-1">📅 Date du log :</p>
              <p>{new Date(logDetail.date).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-500 font-semibold mb-1">👤 Utilisateur :</p>
              <p>{logDetail.utilisateur}</p>
            </div>
          </div>

          <hr className="my-2 border-gray-300" />

          <div>
            <p className="text-gray-700 font-semibold mb-2 text-base">📝 Action enregistrée :</p>
            <div className="bg-gray-100 rounded-md p-4 whitespace-pre-wrap text-[15px] leading-relaxed border border-orange-300 shadow-inner">
              {logDetail.action}
            </div>
          </div>
        </div>

        {/* Pied de modale */}
        <div className="px-6 py-4 bg-gray-100 flex flex-col sm:flex-row justify-end gap-3">
          <button
            onClick={() => setLogDetail(null)}
            className="px-4 py-2 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition"
          >
            Fermer
          </button>
          <button
            onClick={async () => {
              if (confirm("Confirmer la suppression de ce log ?")) {
                try {
                  await axios.delete(`/api/logs/internes/${logDetail.id}`);
                  toast.success("Log supprimé !");
                  setLogs((prev) => prev.filter((l) => l.id !== logDetail.id));
                  setLogsAffiches((prev) => prev.filter((l) => l.id !== logDetail.id));
                  setLogDetail(null);
                } catch (err) {
                  toast.error("Erreur lors de la suppression du log.");
                }
              }
            }}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Supprimer
          </button>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>


      </div>
    </DashboardLayout>
  );
}
