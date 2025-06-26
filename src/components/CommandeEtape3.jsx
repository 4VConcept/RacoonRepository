import { FiEdit2, FiTrash2,FiPlus } from 'react-icons/fi';
import { useState, useEffect } from 'react';
// import pizzaList from '../data/pizzas';
// import baseList from '../data/bases';
import cuissonList from '../data/cuisson';
import optionList from '../data/options';
// import sousAlimentList from '../data/sousAliments';
// import supplementList from '../data/supplements';
import { getCreneauxDisponibles } from '../utils/creneauUtils';

export default function CommandeEtape3({
  data,
  numeroCommande,
  pizzasCommandees,
   heureCommande,
  onBack,
  onClose,
  onEdit,
  onDelete, onAddPizza,onUpdate, commandes,
  listeCreneaux,
  pizzasParQuart,
  delta,prioriserHoraire,selectedTime
}) {
  useEffect(() => {
  console.log("🧾 pizzasCommandees reçues dans Etape3 :", pizzasCommandees);
}, [pizzasCommandees]);

const [creneauxDisponibles, setCreneauxDisponibles] = useState([]);

const heureActuelle = new Date().toLocaleTimeString('fr-FR', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false
});
console.log("listeCreneaux =", listeCreneaux);
console.log("commandes =", commandes);
useEffect(() => {
  console.log('🧪 PRIORISATION ACTIVÉE ?', prioriserHoraire);
  console.log('🧪 selectedTime reçu :', selectedTime);

  const result = getCreneauxDisponibles(
    commandes,
    listeCreneaux,
    pizzasCommandees.length,
    pizzasParQuart,
    delta,
    heureActuelle
  );

  if (prioriserHoraire && selectedTime && result.find(c => c.time === selectedTime)) {
    setCreneauxDisponibles(result);
    setCreneau(selectedTime);
    console.log('✅ Créneau priorisé sélectionné :', selectedTime);
  } else {
    setCreneauxDisponibles(result);
    const defaultTime = result[0]?.time || '';
    setCreneau(defaultTime);
    console.log('🕒 Créneau par défaut sélectionné :', defaultTime);
  }
}, [commandes, listeCreneaux, pizzasCommandees.length, selectedTime, prioriserHoraire]);


const [creneauSelectionne, setCreneauSelectionne] = useState(creneauxDisponibles[0]?.time || '');


  const [commandeData, setCommandeData] = useState({
  nomClient: '',
  telephone: '',
 creneau: '',
 commentaire: '',
 });


const heureRemise = '17:00'; // 👈 À rendre dynamique plus tard depuis les paramètres
const isBefore = (heure1, heure2) => {
  const [h1, m1] = heure1.split(':').map(Number);
  const [h2, m2] = heure2.split(':').map(Number);
  return h1 < h2 || (h1 === h2 && m1 < m2);
};
const [nomClient, setNomClient] = useState(data.nomClient || '');
  const [telephone, setTelephone] = useState(data.telephone || '');
const [creneau, setCreneau] = useState('');
  const [commentaire, setCommentaire] = useState(data.commentaire || '');


useEffect(() => {
  console.log('🧭 Créneau actuellement sélectionné :', creneau);
}, [creneau]);


  useEffect(() => {

  }, [data, pizzasCommandees]);

  const getHeureActuelle = () => {
    const now = new Date();
    return now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };
// const getPrixBase = (baseNom) => {
//   const base = baseList.find(b => b.nom === baseNom);
//   return base ? base.prixSupp || 0 : 0;
// };
// const calculerPrix = (pizza) => {
//   const base = pizza.prixBase || 0;
//   const baseSupp = pizza.prixBaseCreme || 0;

//   const supplementsPrix = (pizza.supplements ?? []).reduce((total, s) => {
//     const supp = supplementList.find(i => i.nom === s.ingredient);
//     return total + (pizza.taille === 'grande' ? supp?.prixGrande || 0 : supp?.prixMoyenne || 0);
//   }, 0);

//   const optionPrix = optionList.find(o => o.nom === pizza.option)?.prix || 0;

//   return base + baseSupp + supplementsPrix + optionPrix;
// };

const [totalFinal, setTotalFinal] = useState(0);
const [appliqueRemise, setAppliqueRemise] = useState(false);
useEffect(() => {
 const totalSansRemise = pizzasCommandees.reduce((acc, pizza) => {
  return acc + parseFloat(pizza.prixTotal || 0);
}, 0);

const appliqueRemise = isBefore(heureCommande, heureRemise);
const totalFinal = appliqueRemise ? totalSansRemise * 0.95 : totalSansRemise;

  setTotalFinal(totalFinal);
  setAppliqueRemise(appliqueRemise);

  console.log("✅ Envoi des infos vers CommandeModale :", {
    nomClient,
    telephone,
    creneau,
    totalFinal, commentaire
  });

  onUpdate({ nomClient, telephone, creneau, totalFinal,commentaire: commentaire.trim() || '' });
}, [nomClient, telephone, creneau, pizzasCommandees, heureCommande, commentaire]);

// useEffect(() => {
//   if (creneauxDisponibles.length > 0 && !creneau) {
//     setCreneau(creneauxDisponibles[0].time);
//   }
// }, [creneauxDisponibles]);
 
  return (
    <div className="space-y-6 p-4 text-gray-800">
      <div className="flex justify-between items-start">
        <h2 className="text-xl font-bold">🧾 Récapitulatif de commande</h2>
        <div className="text-sm text-gray-600">🕒 Heure commande : {heureCommande}</div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="w-full md:w-1/2">
          <label className="block text-sm font-semibold mb-1">👤 Nom du client</label>
          <input
            required
            type="text"
       value={nomClient}
  onChange={(e) => setNomClient(e.target.value)}
      className={`w-full border-2 rounded px-3 py-2 text-black transition duration-300
      ${!nomClient ? 'bg-orange-100 border-orange-400' : 'bg-white border-gray-300'}`}
    placeholder="Entrez le nom du client"
           />
        </div>
        <div className="w-full md:w-1/2">
          <label className="block text-sm font-semibold mb-1">📞 Téléphone</label>
          <input
            required
            type="tel"
            pattern="[0-9]*"
           value={telephone}
   onChange={(e) => setTelephone(e.target.value)}
            className={`w-full border-2 rounded px-3 py-2 text-black transition duration-300
      ${!telephone ? 'bg-orange-100 border-orange-400' : 'bg-white border-gray-300'}`}
    placeholder="Entrez un numéro valide"
          />
        </div>
      </div>
<div className="w-full md:w-1/2">
  <label className="block text-sm font-semibold mb-1">🕓 Créneau de livraison</label>
 <select
  value={creneau}
  onChange={(e) => setCreneau(e.target.value)}
  className="w-full border rounded px-3 py-2  bg-white text-black"
>
  {creneauxDisponibles.map((c) => (
    <option key={c.time} value={c.time}>
      {c.time} ({c.placesRestantes} restantes)
    </option>
  ))}
</select>

</div>

      <div className="text-2xl font-bold text-orange-600">Total de pizzas : {pizzasCommandees.length}</div>
     <div className="flex justify-end">
  <button
    onClick={() => {
      if (window.confirm('Ajouter une nouvelle pizza à cette commande ?')) {
        onAddPizza(); // fonction déclenchée depuis le parent
      }
    }}
    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mb-4"
  >
    <FiPlus /> Ajouter une pizza
  </button>
</div>
      <div className="overflow-auto rounded-xl shadow border border-gray-300">
  
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-2 text-left">Actions</th>
              <th className="px-4 py-2 text-left">Pizza</th>
              <th className="px-4 py-2 text-left">Détails</th>
              <th className="px-4 py-2 text-right">Prix (€)</th>
            </tr>
          </thead>
        <tbody>
  {pizzasCommandees.map((pizza, index) => {
    console.log("🔍 Pizza affichée dans tableau :", pizza);
    const nomPizza = pizza.nom ? `${pizza.nom}` : 'Pizza';

    return (
      <tr key={index} className="border-t hover:bg-gray-50 align-top">
  <td className="px-4 py-2">
    <div className="flex gap-3">
      <button
        onClick={() => onEdit(index)}
        className="p-3 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded text-xl"
        aria-label="Modifier"
      >
        <FiEdit2 />
      </button>
      <button
        onClick={() => {
          if (pizzasCommandees.length <= 1) {
            alert("❌ La commande doit contenir au moins une pizza.");
            return;
          }
          if (confirm("Êtes-vous sûr de vouloir supprimer cette pizza ?")) {
            onDelete(index);
          }
        }}
        className="p-3 bg-red-100 hover:bg-red-200 text-red-600 rounded text-xl"
        aria-label="Supprimer"
      >
        <FiTrash2 />
      </button>
    </div>
  </td>

        <td className="px-4 py-2 font-medium">{nomPizza}</td>

        <td className="px-4 py-2 text-sm space-y-1">
          <div><strong>Taille :</strong> {pizza.taille}</div>
          <div><strong>Base :</strong> {pizza.base}</div>

   {Array.isArray(pizza.options) && pizza.options.length > 0 && (
  <div className="flex gap-1 flex-wrap">
    <strong className="mr-1">Options :</strong>
    {pizza.options.map((opt, i) => (
      <span key={i}>
        {opt }  {i < pizza.options.length - 1 && ','}
      </span>
    ))}
  </div>
)}



          {pizza.cuisson && (
            <div><strong>Cuisson :</strong> {pizza.cuisson}</div>
          )}
{/* 
          {pizza.supplements?.length > 0 && (
            <div>
              <strong>Suppléments :</strong>{' '}
              {pizza.supplements.map((s) => `${s.ingredient} (${s.portion})`).join(', ')}
            </div>
          )} */}
          {pizza.supplements
  ?.filter(s => s.ingredient && s.ingredient.trim() !== '')
  .map((s, idx) => (
    <p key={idx}><strong>Suppléments : </strong>{s.ingredient} ({s.portion})</p>
))}

          {pizza.sousAliments?.length > 0 && (
            <div>
              <strong>Sans aliments :</strong> {pizza.sousAliments.map(s => `${s.ingredient} (${s.portion})`).join(', ')}
            </div>
          )}
        </td>

        <td className="px-4 py-2 text-right font-semibold">{pizza.prixTotal} €</td>
      </tr>
    );
  })}
</tbody>

        </table>
      </div>

      <div className="flex justify-end mt-4">
  <div className="text-xl font-bold text-green-700 bg-green-100 px-6 py-3 rounded-xl shadow">
    Total : {totalFinal.toFixed(2)} €
    {appliqueRemise && <span className="text-sm text-red-600 ml-2">(Remise 5%)</span>}
  </div>
</div>
<div className="mt-6">
  <label htmlFor="commentaire" className="block text-sm font-semibold text-gray-700 mb-1">
    Commentaire spécial (facultatif)
  </label>
  <textarea
  id="commentaire"
  value={commentaire}
  onChange={(e) => setCommentaire(e.target.value)}
  rows={3}
  placeholder="Ex : Ne pas couper la pizza, sans fromage, allergie aux fruits de mer..."
  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
/>

</div>

    </div>
  );
}
