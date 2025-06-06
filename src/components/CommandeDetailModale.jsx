import { useEffect, useState } from 'react';
import { FiX, FiUser, FiList, FiDollarSign, FiEdit2, FiTrash2, FiCreditCard, FiPocket } from 'react-icons/fi';
import axios from 'axios';

import toast from 'react-hot-toast';





export default function CommandeDetailModale({ commande, onClose ,onPayer, onModifier, setCommandes }) {
   if (!commande) return null;



// ⏱ Fonction pour l'heure actuelle en Guadeloupe
function getDateInGuadeloupe() {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('fr-CA', {
    timeZone: 'America/Guadeloupe',
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const parts = formatter.formatToParts(now);
  const obj = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return new Date(`${obj.year}-${obj.month}-${obj.day}T${obj.hour}:${obj.minute}:${obj.second}`);
}


 const [autoriserModif, setAutoriserModif] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!commande?.creneau) return;

    const now = getDateInGuadeloupe();
    const [h, m] = commande.creneau.split(':');
    const creneauDate = new Date(now);
    creneauDate.setHours(parseInt(h), parseInt(m), 0, 0);

    const diffMinutes = (creneauDate - now) / 60000;
    setAutoriserModif(diffMinutes >= 15);
    
  }, [commande]);

  if (!commande) return null;
  const marquerCommePaye = async (mode) => {
    try {
      setIsUpdating(true);
    
     await axios.put(`http://localhost:3001/api/commandes/${commande.numeroCommande}/payer`, {
        modePaiement: mode,
      }); 
  toast.success(`📦 Envoi encaissement de la commande ${commande.numeroCommande} en mode ${mode}`);
  
      onPayer?.(mode);
    } catch (err) {
      console.error("Erreur encaissement :", err);
      alert("Échec de l'encaissement.");
    } finally {
      setIsUpdating(false);
    }
  };
const supprimerCommande = async (commande) => {
  const confirmation = confirm(`❗ Es-tu sûr de vouloir supprimer la commande N°${commande.numeroCommande} ?`);
  if (!confirmation) return;

  try {
    // Suppression en base
    await axios.delete(`/api/commandes/${commande.numeroCommande}`);

    // Création du log
    const logTexte = `🗑️ Suppression commande

🧾 N° : ${commande.numeroCommande}
👤 Client : ${commande.nomClient || 'Anonyme'}
🥐 Quantité : ${commande.pizzas?.length || 0} pizza(s)
📅 Date : ${new Date().toISOString()}
`;

     // 📒 Journalisation
  await fetch('http://localhost:3001/api/logs/internes', {
      method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: logTexte,
      utilisateur: 'système'
    
    }),
  });
    // Mise à jour locale de l’état
    setCommandes((prev) => {
      const nouveau = { ...prev };
      if (nouveau[commande.creneau]) {
        nouveau[commande.creneau] = nouveau[commande.creneau].filter(c => c.numeroCommande !== commande.numeroCommande);
      }
      return nouveau;
    });

    // Fermeture et confirmation
    onClose();
    toast.success(`Commande N°${commande.numeroCommande} supprimée avec succès`);
  } catch (err) {
    console.error("Erreur lors de la suppression :", err);
    alert("La commande n'a pas pu être supprimée.");
  }
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
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl p-8 relative text-gray-800">
        {/* Bouton fermeture */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black"
        >
          <FiX size={28} />
        </button>

        {/* Titre */}
        <h2 className="text-3xl font-bold text-orange-600 mb-2">
          🍕 Commande N°{commande.numeroCommande}
        </h2>

        <p className="text-sm text-gray-500 mb-6">
          📅 {formatDateFrUTC(commande.date)}
        </p>

        {/* Client */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold flex items-center gap-2 mb-1">
            <FiUser /> Informations Client
          </h3>
          <div className="ml-6">
            {commande.nomClient ? (
              <>
                <p>👤 Nom : <span className="font-medium">{commande.nomClient || 'Inconnu'}</span></p>
                <p>📞 Téléphone : <span className="font-medium">{commande.telephone || 'Non renseigné'}</span></p>
              </>
            ) : (
              <p className="text-red-500">⚠️ Informations client manquantes</p>
            )}
          </div>
        </div>

        {/* Pizzas */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold flex items-center gap-2 mb-1">
            <FiList /> Pizzas commandées
          </h3>
          <ul className="ml-6 list-disc space-y-2">
            {commande.pizzas.map((pizza, i) => (
              <li key={i}>
                <strong>{pizza.nom ?? 'Pizza'}</strong> – {pizza.taille}, {pizza.base}
                {pizza.option && `, option : ${pizza.option}`}
                {pizza.cuisson && `, cuisson : ${pizza.cuisson}`}
               {pizza.supplements?.length > 0 && (
  `, Suppléments : ${pizza.supplements.map(s => `${s.nom} (${s.portion})`).join(', ')}`
)}{pizza.sousAliments?.length > 0 && `, sans : ${pizza.sousAliments.join(', ')}`}
              </li>
            ))}
          </ul>
        </div>

        {/* Total */}
        <div className="text-right text-xl font-bold text-green-600 mb-4">
          <FiDollarSign className="inline-block mr-1" />
          Total estimé : {commande.total?.toFixed(2) ?? '...'} €
        </div>

        {/* Boutons d'action */}
        <div className="border-t pt-5 mt-6 flex flex-wrap justify-between gap-3">
          {commande.modePaiement?.trim()=='non' && autoriserModif && (
 
            <>
              <button
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-800 hover:bg-gray-200 rounded-md font-semibold"
                             onClick={() => onModifier?.(commande)}
               >
                <FiEdit2 /> Modifier
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-md font-semibold"
               onClick={() => supprimerCommande(commande)}
               >
                <FiTrash2 /> Supprimer
              </button>
            </>
          )}
{commande.modePaiement?.trim()=='non' && (
   <>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-md font-semibold"
           disabled={isUpdating}  onClick={async () => {
  //await marquerCommePaye('carte');
// 👉 Envoi vers Hiboutik
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/commandes/versHiboutik`, {
        
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ numeroCommande: commande.numeroCommande })

      });

      const data = await res.json();

      if (data.success) {
        toast.success("✅ Commande envoyée à Hiboutik !");
      } else {
        toast.error("❌ Erreur lors de l'envoi à Hiboutik");
        console.error(data);
      }

      onClose(); // 🔚 Ferme la modale

}}>
            <FiCreditCard /> Hiboutik
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 hover:bg-yellow-200 rounded-md font-semibold"
        disabled={isUpdating} onClick={async () => {
  await marquerCommePaye('especes');
  onClose();
}}
>
            <FiPocket /> Facturer
          </button>
           </>
          )}
        </div>
      </div>
    </div>
  );
}
