import { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import TopHeader from '../components/TopHeader';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import CommandeModale from '../components/CommandeModale';
import { FiShoppingCart } from 'react-icons/fi';
import pizzaList from '../data/pizzas';
import CommandeDetailModale from '../components/CommandeDetailModale';
import Commande from '../components/Commande';
import { MdLocalShipping } from 'react-icons/md';
import { useParametres } from '../context/ParametresContext';



// 🧠 Fonction utilitaire locale
function getPizzaLabel(pizza, cmdId, nomPizza,nomClient) {
const supplementText = (pizza.supplements || [])
  .map(s => `${s.ingredient} (${s.portion})`)
  .join(', ');




  const sousAlimentText = (pizza.sousAliments || [])
    .map(s => `${s.ingredient} (${s.portion})`)
    .join(', ');


const idCourt = cmdId.toString().slice(-3); // les 3 derniers chiffres de la commande

  return `${nomClient?.toUpperCase() ?? 'CLIENT'} #${idCourt}  ${nomPizza}\n` +
    `- ${pizza.taille}, base ${pizza.base}\n` +
    `- ${pizza.cuisson}, ${pizza.option}` +
    (supplementText ? `\n- Supp: ${supplementText}` : '') +
    (sousAlimentText ? `\n- Sans: ${sousAlimentText}` : '');
}

export default function SuiviJour() {
const { parametres, refreshParametres } = useParametres();



//f (!parametres) return <p>Chargement des paramètres...</p>;
const mettreAJourPaiementLocal = (numeroCommande, modePaiement) => {
  setCommandes((prev) => {
    const nouveau = { ...prev };
    for (const creneau in nouveau) {
      nouveau[creneau] = nouveau[creneau].map((cmd) =>
        cmd.numeroCommande === numeroCommande
          ? { ...cmd, modePaiement }
          : cmd
      );
    }
    return nouveau;
  });
};

const [dateAffichee, setDateAffichee] = useState(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
});
const changerJour = (delta) => {
  setDateAffichee(prev => {
    const nouvelleDate = new Date(prev);
    nouvelleDate.setDate(nouvelleDate.getDate() + delta);
    return nouvelleDate;
  });
};

const formatterDate = (date) => {
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};
useEffect(() => {
  const isoDate = dateAffichee.toISOString().split('T')[0]; // yyyy-mm-dd
  fetch(`${import.meta.env.VITE_API_BASE}/api/commandes?date=${isoDate}`)
    .then(res => res.json())
    .then(data => {
      setCommandes(data);
    });
}, [dateAffichee]);



  function DropZone({ id, children, isOverLimit, commandes, setCommandes }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const [highlight, setHighlight] = useState(false);

  useEffect(() => {
    if (isOver && !isOverLimit) {
      setHighlight(true);
      const timeout = setTimeout(() => setHighlight(false), 1000);
      return () => clearTimeout(timeout);
    }
  }, [isOver, isOverLimit]);

  const handleDrop = async (event) => {
    const { active } = event;
    const draggedPizzaGlobalId = active.id;
    const [datePart, numPart] = draggedPizzaGlobalId.split('-');
    const draggedCmdId = `${datePart}-${numPart}`;

    const fromCreneau = Object.entries(commandes).find(([_, cmds]) =>
      cmds.some(cmd => cmd.numeroCommande === draggedCmdId)
    );

    if (!fromCreneau || fromCreneau[0] === id) return;

    const draggedCommande = fromCreneau[1].find(cmd => cmd.numeroCommande === draggedCmdId);

    // MAJ local
    setCommandes(prev => {
      const newState = { ...prev };
      newState[fromCreneau[0]] = newState[fromCreneau[0]].filter(cmd => cmd.numeroCommande !== draggedCmdId);
      newState[id] = [...(newState[id] || []), draggedCommande];
      return newState;
    });

    // MAJ distant
    try {
      await fetch(`http://localhost:3001/api/commandes/${draggedCmdId}/creneau`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nouveauCreneau: id }),
      });
    } catch (err) {
      console.error('❌ Erreur MAJ en base :', err);
    }
  };

  return (
    <div
      ref={setNodeRef}
      data-creneau={id}
      className={`min-h-[40px] p-2 rounded transition-all duration-300 ${
        highlight ? 'ring ring-green-400 ring-4' : ''
      } ${isOverLimit ? 'bg-gray-700 opacity-50' : 'bg-gray-900'}`}
    >
      {children}
    </div>
  );
}

const [commandeSelectionnee, setCommandeSelectionnee] = useState(null);

const ajouterCommande = (creneauId, commande) => {


  setCommandes(prev => {
    const updated = {
      ...prev,
      [creneauId]: [...(prev[creneauId] || []), commande]
    };
 
    return updated;
  });
};


  const [showPlusOne, setShowPlusOne] = useState(false);
  const [totalPizzas, setTotalPizzas] = useState(0);
  const [creneaux, setCreneaux] = useState([]);
  const [showModale, setShowModale] = useState(false);
  const [selectedTime, setSelectedTime] = useState(null);
  const [commandes, setCommandes] = useState({});

  useEffect(() => {
  const fetchCommandes = async () => {
    try {
      const dateStr = new Date(dateAffichee).toISOString().split('T')[0];
  
      const response = await fetch(`http://localhost:3001/api/commandes?date=${dateStr}`);
      const data = await response.json();

      const commandesDuJour = data.filter(cmd => cmd.date?.startsWith(dateStr));
 
      const regroupement = {};
      commandesDuJour.forEach(cmd => {
        const creneau = cmd.creneau?.slice(0, 5); // ← On garde HH:mm
        if (!regroupement[creneau]) {
          regroupement[creneau] = [];
        }
        regroupement[creneau].push(cmd);
      });

     setCommandes(regroupement);
    } catch (error) {
      console.error('❌ Erreur chargement commandes :', error);
    }
  };

  fetchCommandes();
}, [dateAffichee]); // ← attention à dépendre de la date affichée si tu as les boutons jour précédent / suivant


  // const heureDebut = '18:00';
  // const heureFin = '22:00';
  // const pizzasParQuart = 6;
  // const pizzaDeltaMax = 3;

if (!parametres) {
  return <p className="text-white p-4">Chargement des paramètres...</p>;
}
const heureDebut = parametres.heureDebut;
const heureFin = parametres.heureFin;
const pizzasParQuart = parametres.maxPizza;
const pizzaDeltaMax = parametres.delta;




  const genererCouleurDepuisTexte = (texte) => {
  const paletteHue = [0, 30, 60, 120, 180, 210, 270, 330]; // 8 teintes bien distinctes
  let hash = 0;
  for (let i = 0; i < texte.length; i++) {
    hash = texte.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % paletteHue.length;
  const hue = paletteHue[index];
  return `hsl(${hue}, 100%, 50%)`;
};



/*ici*/
  const [numeroCommande, setNumeroCommande] = useState('');
const [prioriserHoraire, setPrioriserHoraire] = useState(false);

  // useEffect(() => {
  //   const numero = getNumeroCommande();
  //   setNumeroCommande(numero);
  // }, []);
const ouvrirModale = (time) => {
  // const numero = getNumeroCommande();
  // setNumeroCommande(numero);
  setSelectedTime(time || null);
  console.log('heurechoisi', time);
  setPrioriserHoraire(!!time); // true si on a cliqué sur un créneau
  setShowModale(true);
};
const [modaleType, setModaleType] = useState(null); // "especes" ou "hiboutik"


// LISTE CRÉNEAUX GÉNÉRÉE ICI
  const [listeCreneaux, setListeCreneaux] = useState([]);


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
          time: start.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        });
        start.setTime(next.getTime());
      }
      return blocks;
    };

 setCreneaux(generateCreneaux());
}, [heureDebut, heureFin]);

  useEffect(() => {
 const newTotal = Object.values(commandes)
  .flat()
  .reduce((total, cmd) => total + (cmd.pizzas?.length || 0), 0);

    if (newTotal > totalPizzas) {
      setShowPlusOne(true);
      setTimeout(() => setShowPlusOne(false), 1000);
    }
    setTotalPizzas(newTotal);
  }, [commandes]);

//   const handleDragEnd = async (event) => {
//     const { active, over } = event;
//   if (!over) return;

//   const draggedPizzaGlobalId = active.id; // ex: "20250530-001-0"
//   const [datePart, numPart] = draggedPizzaGlobalId.split('-');
//   const draggedCmdId = `${datePart}-${numPart}`;

//   const fromCreneau = Object.entries(commandes).find(([_, cmds]) =>
//     cmds.some(cmd => cmd.id === draggedCmdId)
//   );

//   if (!fromCreneau) return;

//   const [fromTime, fromList] = fromCreneau;
//   const draggedCommande = fromList.find(cmd => cmd.id === draggedCmdId);

//   const overCount = (commandes[over.id]?.length || 0);
//   if (overCount >= pizzasParQuart + pizzaDeltaMax) {
//     toast.error('❌ Ce créneau a atteint sa capacité maximale');
//     return;
//   }

//   // Ne pas dupliquer la commande
//   if (fromTime === over.id) return;

//   setCommandes(prev => {
//     const newState = { ...prev };
//     newState[fromTime] = newState[fromTime].filter(cmd => cmd.id !== draggedCmdId);
//     newState[over.id] = [...(newState[over.id] || []), draggedCommande];
//     return newState;
//   });

//   // MAJ en base du créneau de la commande déplacée
// try {
//   await fetch(`http://localhost:3001/api/commandes/${draggedCmdId}/creneau`, {
//     method: 'PATCH',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ nouveauCreneau: over.id }),
//   });
// } catch (err) {
//   console.error('❌ Erreur MAJ en base :', err);
// }

// };


const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over) return;
    const [datePart, numPart, indexPizza] = active.id.split('-');
    const draggedCmdId = `${datePart}-${numPart}`;
    const fromCreneau = Object.entries(commandes).find(([_, cmds]) => cmds.some(cmd => cmd.numeroCommande === draggedCmdId));
    if (!fromCreneau) return;
    const draggedCommande = fromCreneau[1].find(cmd => cmd.numeroCommande === draggedCmdId);
    const pizzasDemandees = draggedCommande?.pizzas?.length || 0;
   // const pizzasExistantes = (commandes[over.id] || []).flatMap(c => c.pizzas).length;
 // Compter le nombre de pizzas déjà dans le créneau cible
const pizzasExistantes = (commandes[over.id] || []).reduce((total, cmd) => total + (cmd.pizzas?.length || 0), 0);

// Nombre de pizzas qu’on essaie d’ajouter
const pizzasDeplacees = draggedCommande.pizzas?.length || 0;

// Si ça dépasse le quota autorisé (quotas + delta)
if (pizzasExistantes + pizzasDeplacees > pizzasParQuart + pizzaDeltaMax) {
  toast.error('❌ Ce créneau ne peut pas accueillir toutes les pizzas de cette commande');

  // Vibration carte
  const targetCard = document.querySelector(`[data-creneau="${over.id}"]`);
  if (targetCard) {
    targetCard.classList.add('shake');
    setTimeout(() => targetCard.classList.remove('shake'), 500);
  }

  return;
}


    
    if (fromCreneau[0] === over.id) return;
    setCommandes(prev => {
      const newState = { ...prev };
      newState[fromCreneau[0]] = newState[fromCreneau[0]].filter(cmd => cmd.numeroCommande !== draggedCmdId);
      newState[over.id] = [...(newState[over.id] || []), draggedCommande];
      return newState;
    });
  try {
  await fetch(`http://localhost:3001/api/commandes/${draggedCmdId}/creneau`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nouveauCreneau: over.id }),
  });

  // 🔢 Total des pizzas
  const total = draggedCommande.pizzas.reduce((acc, pizza) => {
    return acc + (pizza.prix ?? 0);
  }, 0);

const nouvelleHeure = over.id;
const now = new Date();
const dateGuadeloupe = new Date(now.toLocaleString("en-US", { timeZone: "America/Guadeloupe" }));
function formatDateLocale(date) {
  const jour = String(date.getDate()).padStart(2, '0');
  const mois = String(date.getMonth() + 1).padStart(2, '0');
  const annee = date.getFullYear();
  const heures = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const secondes = String(date.getSeconds()).padStart(2, '0');

  return `${jour}/${mois}/${annee} à ${heures}:${minutes}:${secondes}`;
}

const logTexte = `📝 Modification commande

🧾 N° : ${draggedCmdId}
🕒 Nouveau créneau : ${nouvelleHeure}
👤 Client : ${draggedCommande.nomClient || 'Anonyme'}
🥐 Quantité : ${draggedCommande.pizzas?.length || 0} pizza(s)
📅 Date : ${formatDateLocale(dateGuadeloupe)}
`;
console.log(now, ' ', dateGuadeloupe,'  ',formatDateLocale(dateGuadeloupe));



  // 📒 Journalisation
  await fetch('http://localhost:3001/api/logs/internes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: logTexte,
      utilisateur: 'système'
    
    }),
  });

} catch (err) {
  console.error('❌ Erreur MAJ ou log :', err);
  toast.error('Erreur lors du déplacement');
}

  };

  const handleAddCommande = (time) => {
    setSelectedTime(time);
    setShowModale(true);
  };
const handlePayerEspeces = (pizza) => {
  setCommandeSelectionnee(pizza);
  setModaleType('especes');
};

const handlePayerHiboutik = (pizza) => {
  setCommandeSelectionnee(pizza);
  setModaleType('hiboutik');
};

const [commandeAModifier, setCommandeAModifier] = useState(null);

useEffect(() => {
  if (!showModale || commandeAModifier) return; // 👈 ne génère pas de numéro si modification

  fetch('http://localhost:3001/api/commandes/nouveau-numero')
    .then(res => res.json())
    .then(data => setNumeroCommande(data.numeroCommande))
    .catch(err => console.error('Erreur récupération numéro commande', err));
}, [showModale, commandeAModifier]);

  return (
    <DashboardLayout>
      {/* <div className="flex items-center justify-between mb-6 px-4">
  <button
    onClick={() => changerJour(-1)}
    className="hidden bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-full shadow-md transition"
  aria-label="Jour précédent"
  >
    <span className="text-lg">⬅️</span>
  </button>

  <div className="text-center text-white text-base font-semibold bg-gray-800 px-6 py-2 rounded-full shadow-inner">
    {formatterDate(dateAffichee)}
  </div>

  <button
    onClick={() => changerJour(1)}
    className="hidden bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-full shadow-md transition"
  
    aria-label="Jour suivant"
  >
    <span className="text-lg">➡️</span>
  </button>
</div> */}
<div className="flex items-center justify-between mb-6 px-4">
  <div className="w-12" /> {/* Espace gauche vide */}

  <div className="text-center text-white text-base font-semibold bg-gray-800 px-6 py-2 rounded-full shadow-inner">
    {formatterDate(dateAffichee)}
  </div>

  <div className="w-12" /> {/* Espace droite vide */}
</div>

      <div className="text-white w-full px-6">
        <div className="flex justify-end items-center gap-4 mb-4 relative h-10">
          {showPlusOne && (
            <motion.div
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8 }}
              className="absolute right-0 text-green-400 font-bold text-xl"
            >
              +1
            </motion.div>
          )}

          <div className="bg-orange-600 text-white px-5 py-2 rounded-full shadow-xl text-sm font-semibold">
            🍕 Total pizzas : {totalPizzas}
          </div>
        </div>

        <button onClick={() => ouvrirModale(null)} className="bg-blue-600 text-white px-4 py-2 rounded mb-4">
          <FiShoppingCart size={20} /> Nouvelle commande
        </button>

        <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {creneaux.map((creneau, idx) => {
            const count = (commandes[creneau.time] || []).reduce((total, cmd) => total + (cmd.pizzas?.length || 0), 0);
 const isOverLimit = count >= pizzasParQuart + pizzaDeltaMax;

              return (
                
                <div key={idx} className={`rounded-xl p-4 shadow hover:shadow-lg transition-all ${count > pizzasParQuart ? 'bg-red-800' : 'bg-gray-800'}`}>
                  <div className="flex justify-between items-center mb-2">
                  <div className="text-sm font-bold text-orange-400 flex items-center gap-1">
  <MdLocalShipping className="text-orange-400" />
  {creneau.time}
</div>  <button
                      disabled={isOverLimit}
                      onClick={() => ouvrirModale(creneau.time)}
                      className={`text-white text-xs rounded-full px-2 py-1 font-bold transition ${isOverLimit ? 'bg-gray-600 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                    >
                      ➕
                    </button>
                  </div>
                  <div className="text-gray-300 text-xs mb-2">
                    Pizza(s) : {count} / {pizzasParQuart}
                    {count > pizzasParQuart && (
                      <span className="text-red-400 font-bold"> ⚠️ Capacité dépassée</span>
                    )}
                    {isOverLimit && (
                      <div className="text-red-500 text-xs">❌ Dépassement maximal : drag & drop désactivé</div>
                    )}
                  </div>
                  
        <DropZone id={creneau.time} disabled={isOverLimit} commandes={commandes}
  setCommandes={setCommandes}>
   
  {(commandes[creneau.time] || []).flatMap((cmd, indexCmd) =>
  cmd.pizzas.map((pizza, index) => {
    const nomPizza = pizza.nom?.toUpperCase() ?? 'PIZZA';

    const key = `${cmd.numeroCommande}-${indexCmd}-${index}`;
console.log('nous',cmd);
    return (
      <div key={key}>
        <Commande
          key={key}
          id={`${cmd.numeroCommande}-${index}`}
          pizza={{ ...pizza, modePaiement: cmd.modePaiement }}
          cmdId={cmd.numeroCommande}
          nomClient={cmd.nomClient ?? 'Client'}
          heureCreneau={creneau.time}
          nomPizza={nomPizza}
          color={genererCouleurDepuisTexte(cmd.numeroCommande)}
          onClick={() => setCommandeSelectionnee(cmd)}
          onPayerEspeces={handlePayerEspeces}
          onPayerHiboutik={handlePayerHiboutik}
        />
        <button
          onClick={() => setCommandeSelectionnee(cmd)}
          className="ml-2 bg-white text-orange-600 font-bold px-2 py-1 rounded text-xs hover:bg-gray-100 transition"
        >
          Voir
        </button>
        
      </div>
    );
  })
)}

</DropZone>




                </div>
              );
            })}
          </div>
        </DndContext>
      </div>

      <CommandeModale
      prioriserHoraire={prioriserHoraire}
        isOpen={showModale}
        onClose={() => {
          setShowModale(false);
          setSelectedTime(null);
            setCommandeAModifier(null); // 🔁 reset si modification
        }}
      setCommandes={setCommandes}
        commandes={commandes}
  quotas={pizzasParQuart}
  delta={pizzaDeltaMax}
listeCreneaux={creneaux.map(c => c.time)}
        numeroCommande={numeroCommande}
        selectedTime={selectedTime}
         pizzaInitiale={null}
  commandeDataInitiale={commandeAModifier}
       onAddCommande={async (creneau, commande) => {
  try {
   console.log('✅ Objet final envoyé :', JSON.stringify(commande, null, 2));
/*
    const response = await fetch('http://localhost:3001/api/commandes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(commande),
    });

    if (response.ok) {*/
      // Ajout local après succès distant
      ajouterCommande(creneau, {
        ...commande,
        label: commande.numeroCommande,
        color: genererCouleurDepuisTexte(commande.numeroCommande)
      });
//       // ✨ Highlight temporaire
//       const carte = document.querySelector(`[data-creneau="${creneau}"]`);
//       if (carte) {
//         carte.classList.add('ring', 'ring-4', 'ring-green-400');
//         setTimeout(() => {
//           carte.classList.remove('ring', 'ring-4', 'ring-green-400');
//         }, 1500);
//       }
//     } else {
//      const errorText = await response.text(); // ⬅️ récupère l'erreur du serveur
//   console.error('❌ Erreur serveur lors de l’enregistrement de la commande', response.status, errorText);
//  }
  } catch (error) {
    console.error('❌ Erreur local lors de l’envoi de la commande', error);
  }
}}
      />
{commandeSelectionnee && (
  <CommandeDetailModale
    commande={commandeSelectionnee}
    onClose={() => setCommandeSelectionnee(null)}
   setCommandes={setCommandes}
    onPayer={(mode) => mettreAJourPaiementLocal(commandeSelectionnee.numeroCommande, mode)}
 onModifier={(cmd) => {
    setCommandeSelectionnee(null); // Ferme la modale actuelle
    setCommandeAModifier(cmd);     // Stocke la commande à modifier
    setShowModale(true);           // Ouvre la modale de commande
  }}
  />
)}

{modaleType === 'especes' && (
  <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-xl text-center max-w-xs">
      <p className="text-lg text-gray-800 mb-4">Confirmer l'encaissement en espèces ?</p>
      <button
        className="bg-green-600 text-white px-4 py-2 rounded mr-2"
        onClick={() => {
          // 💵 Logique de marquer comme payé ici
          setModaleType(null);
        }}
      >
        ✅ Oui
      </button>
      <button
        className="bg-gray-500 text-white px-4 py-2 rounded"
        onClick={() => setModaleType(null)}
      >
        ❌ Non
      </button>
    </div>
  </div>
)}

{modaleType === 'hiboutik' && (
  <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-xl text-center max-w-xs">
      <p className="text-lg text-gray-800 mb-4">Envoyer cette commande vers Hiboutik ?</p>
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded mr-2"
        onClick={() => {
          // 💳 Logique API Hiboutik ici
          setModaleType(null);
        }}
      >
        ✅ Envoyer
      </button>
      <button
        className="bg-gray-500 text-white px-4 py-2 rounded"
        onClick={() => setModaleType(null)}
      >
        ❌ Annuler
      </button>
    </div>
  </div>
)}

    </DashboardLayout>
  );
}
