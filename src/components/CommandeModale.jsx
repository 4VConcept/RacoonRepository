import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiArrowLeft, FiX, FiPlus, FiShoppingCart } from 'react-icons/fi';
import CommandeEtape1 from './CommandeEtape1';
import CommandeEtape2 from './CommandeEtape2';
import CommandeEtape3 from './CommandeEtape3';
import pizzaList from '../data/pizzas';
import ValidationAnimation from '../components/ValidationAnimation';
import baseList from '../data/bases';
import supplementList from '../data/supplements';
import optionList  from '../data/options';
import { useParametres } from '../context/ParametresContext';

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
  
  // Crée un objet Date en fuseau Guadeloupe, puis le convertit en UTC via toISOString()
  const localDate = new Date(`${obj.year}-${obj.month}-${obj.day}T${obj.hour}:${obj.minute}:${obj.second}`);
  
  return new Date(localDate.getTime() - (localDate.getTimezoneOffset() * 60000)).toISOString();
}



export default function CommandeModale({ isOpen, onClose, pizzaInitiale = null, numeroCommande, selectedTime, commandes, onAddCommande, quotas,
  delta, listeCreneaux,prioriserHoraire }) {


    const parametres = useParametres();
const [pizzasCommandees, setPizzasCommandees] = useState([]);
const [pizzaTemp, setPizzaTemp] = useState({});
const [editIndex, setEditIndex] = useState(null);
const [data, setData] = useState({});
const [heureCommande, setHeureCommande] = useState('');
const [indexPizzaAModifier, setIndexPizzaAModifier] = useState(null); // 👈 pour savoir si on modifie
  const [etape, setEtape] = useState(1);
  const [commandeData, setCommandeData] = useState({});
 const [showSuccess, setShowSuccess] = useState(false);
const [showConfirmationEtape2, setShowConfirmationEtape2] = useState(false);
const handleEditPizza = (index) => {
  const pizza = pizzasCommandees[index];
  setData(pizza);                  // on transmet la pizza à modifier à CommandeEtape2
  setIndexPizzaAModifier(index);  // on se met en mode édition
  setEtape(2);  
                     // retour à l’étape de config
};

const handleDeletePizza = (index) => {
  setPizzasCommandees(pizzasCommandees.filter((_, i) => i !== index));
};
const [hidePrecedent, setHidePrecedent] = useState(false);

 const handleSuivant = () => {
  if (etape === 2) {
    if (editIndex !== null) {
      const copy = [...pizzasCommandees];
      copy[editIndex] = pizzaTemp;
      setPizzasCommandees(copy);
      setEditIndex(null);
    } else {
      setPizzasCommandees([...pizzasCommandees, pizzaTemp]);
    }
    setPizzaTemp({});
  }
  setEtape((prev) => Math.min(prev + 1, 3));
}; const handlePrecedent = () => setEtape((prev) => Math.max(prev - 1, 1));

  // const handleUpdate = (newData) => {
  //   if (etape === 1) {
  //     setCommandeData({ ...commandeData, ...newData });
  //   } else if (etape === 2) {
  //     setPizzaTemp({ ...pizzaTemp, ...newData });
  //   }
  //   else
  //   {
  //     setCommandeData((prev) => ({ ...prev, ...newData }));
    
  //   }
  // };

const handleUpdate = (newData) => {
  if (newData?.total !== undefined) {
    // Total = données de CommandeEtape3
    setCommandeData((prev) => ({ ...prev, ...newData }));
  } else if (etape === 2) {
    // Étape configuration pizza
    setPizzaTemp((prev) => ({ ...prev, ...newData }));
  } else {
    // Étape 1 : infos client
    setCommandeData((prev) => ({ ...prev, ...newData }));
  }
};



const handleAddPizzaFromEtape3 = () => {
  
  setData({}); // réinitialise les champs pour une nouvelle pizza
  setIndexPizzaAModifier(null); // on n’est pas en mode modification
  setEtape(1); // aller à l’étape de configuration
   setCommandeData(prev => ({ ...prev, pizzaId: null })); // 🧼 on efface la sélection précédente
  
  setHidePrecedent(true);
};


// 💡 Comparer l’heure de commande et l’heure de remise
const [hCommande, mCommande] = heureCommande.split(':').map(Number);
const [hRemise, mRemise] = '17:00'.split(':').map(Number);


const dateCommande = new Date();
dateCommande.setHours(hCommande, mCommande, 0, 0);

const dateLimiteRemise = new Date();
dateLimiteRemise.setHours(hRemise, mRemise, 0, 0);

const appliqueRemise = dateCommande < dateLimiteRemise;

  const handleValidation = () => {


  if (pizzasCommandees.length === 0) {
    alert("❌ Vous devez ajouter au moins une pizza pour valider la commande.");
    return;
  }

  if (!commandeData.nomClient || !commandeData.telephone) {
    alert("❌ Veuillez renseigner le nom et le téléphone du client.");
    return;
  }
  const creneauFinal = commandeData.creneau || selectedTime;

  if (!creneauFinal) {
    alert("❌ Aucun créneau de livraison sélectionné.");
    return;
  }


  
// 📦 Objet final
const commandeFinale = {

  numeroCommande: numeroCommande,
  nomClient: commandeData.nomClient, // 👈 ajouter cette ligne
  telephone: commandeData.telephone,
  client: {
    nom: commandeData.nomClient,
    telephone: commandeData.telephone,
  },
  pizzas: pizzasCommandees,
  total: commandeData.totalFinal,
  date: getDateInGuadeloupe(),
  creneau: creneauFinal,
 modePaiement: commandeData.modePaiement?.trim() || 'non',
  appliqueRemise: appliqueRemise ? 1 : 0 // ← booléen encodé pour SQLite

};
console.log('comm', commandeFinale);

fetch('http://localhost:3001/api/commandes', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(commandeFinale),
})
.then(res => res.json())
.then(data => { console.log('✅ Commande enregistrée en base');
  onAddCommande(creneauFinal, commandeFinale)})
.catch(err => console.error('❌ Erreur sauvegarde commande', err));



  setShowSuccess(true);
  setTimeout(() => {
    setShowSuccess(false);
    onClose();
    reinitCommande();
  }, 3500);



};
const [resetPizzaForm, setResetPizzaForm] = useState(false);
const handleAddPizza = (nouvellePizza, resterSurEtape2 = false) => {
  const pizzaFinale = {
    ...nouvellePizza,
    nom: nouvellePizza.nom?.toUpperCase() ?? 'PIZZA',
    prixTotal: Number(nouvellePizza.prixTotal).toFixed(2)
  };

  if (indexPizzaAModifier !== null) {
    const copie = [...pizzasCommandees];
    copie[indexPizzaAModifier] = pizzaFinale;
    console.log("📝 Pizza modifiée :", pizzaFinale);
    setPizzasCommandees(copie);
    setIndexPizzaAModifier(null);
    setEtape(3);
  } else {
    console.log("🍕 Nouvelle pizza ajoutée :", pizzaFinale);
    setPizzasCommandees([...pizzasCommandees, pizzaFinale]);
    setCommandeData(prev => ({ ...prev, pizzaId: null }));
    setEtape(resterSurEtape2 ? 2 : 3);
  }

  setPizzaTemp({});
};

// const handleAddPizza = (nouvellePizza, resterSurEtape2 = false) => {

//  const selectedPizza = pizzaList.find(p => p.id === parseInt(nouvellePizza.pizzaId));
// const nomPizzaFinal = selectedPizza?.nom?.toUpperCase() ?? 'PIZZA';

//   // On calcule ici un prix total pour rappel dans la fiche (facultatif)
//   const basePrix = nouvellePizza.prixBase ?? 0;
//   const baseCremePrix = nouvellePizza.prixBaseCreme ?? 0;

//   const supplementsPrix = (nouvellePizza.supplements ?? []).reduce((total, s) => {
//     const supp = supplementList.find(i => i.nom === s.ingredient);
//     const prixSupp = nouvellePizza.taille === 'grande' ? supp?.prixGrande || 0 : supp?.prixMoyenne || 0;
//     return total + prixSupp;
//   }, 0);

//   const optionPrix = optionList.find(o => o.nom === nouvellePizza.option)?.prix || 0;

//   const prixTotal = basePrix + baseCremePrix + supplementsPrix + optionPrix;

//   const pizzaFinale = {
//     ...nouvellePizza,
//     nom: nomPizzaFinal,
//     prixTotal: prixTotal.toFixed(2)
//   };

//   if (indexPizzaAModifier !== null) {
//     const copie = [...pizzasCommandees];
//     copie[indexPizzaAModifier] = pizzaFinale;
//     console.log("🍕 Nouvelle pizza ajoutée :", pizzaFinale);

//     setPizzasCommandees(copie);
//     console.log("📦 pizzasCommandees après ajout :", [...pizzasCommandees, pizzaFinale]);

//     setIndexPizzaAModifier(null);
//     setEtape(3);
//   } else {
//       console.log("🍕 Nouvelle pizza ajoutée :", pizzaFinale);

//     setPizzasCommandees([...pizzasCommandees, pizzaFinale]);
//     console.log("📦 pizzasCommandees après ajout :", [...pizzasCommandees, pizzaFinale]);

//     setEtape(1);
//     setCommandeData(prev => ({ ...prev, pizzaId: null }));
//     if (!resterSurEtape2) {
//       setEtape(3);
//     }
//   }
// };

const handleResetHandled = () => {
  setResetPizzaForm(false);
};
const resetCommande = () => {
  setCommandeData({});
  setPizzaTemp({});
  setPizzasCommandees([]);
  setEditIndex(null);
  setEtape(1);
  annulerDernierNumero();
};
const reinitCommande = () => {
  setCommandeData({});
  setPizzaTemp({});
  setPizzasCommandees([]);
  setEditIndex(null);
  setEtape(1);
};
const annulerDernierNumero = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/commandes/annuler-dernier-numero', {
      method: 'POST',
    });
    const data = await response.json();
    if (data.success) {
      console.log('Numéro annulé avec succès');
    } else {
      console.error(data.error || 'Erreur lors de l’annulation');
    }
  } catch (err) {
    console.error('Erreur réseau :', err);
  }
};

useEffect(() => {
  if (isOpen) {
    const now = new Date();
    const heure = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    setHeureCommande(heure);
  }
}, [isOpen]);
// const handleAddPizza = () => {
//   setPizzasCommandees([...pizzasCommandees, pizzaTemp]);
//   setPizzaTemp({});
// };

  console.log('Ajouter les noms aux pizzas :',pizzasCommandees);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center">
       <ValidationAnimation visible={showSuccess} onFinish={() => {}} numeroCommande={numeroCommande}/>
<div className="bg-white text-gray-900 w-full max-w-4xl h-[90vh] rounded-xl shadow-lg flex flex-col">

  {/* HEADER FIXE AVEC STYLE */}
  <div className="modal-header bg-orange-600 text-white px-6 py-4 text-xl font-bold rounded-t-xl shadow-md flex justify-between items-center">
  <div className="flex items-center gap-2">
    🍕 Nouvelle commande – 
    <span className="bg-gray-900 text-white px-3 py-1 rounded-md font-mono text-lg shadow-sm">
      {numeroCommande}
    </span>
  </div>

  <div className="text-sm text-white font-medium">
    Étape {etape} / 3
  </div>
</div>


    {/* CORPS SCROLLABLE */}
    <div className="modal-body flex-1 overflow-auto px-6 py-4">
    {etape === 1 && (
            <CommandeEtape1
              numeroCommande={numeroCommande}
              onNext={handleSuivant}
              data={commandeData}
              onUpdate={handleUpdate}
            />
          )}
          {etape === 2 && (
            <CommandeEtape2
            pizzaAModifier={pizzasCommandees[indexPizzaAModifier] || null}
              onNext={handleSuivant}
              onBack={handlePrecedent}
              data={commandeData}
              onUpdate={handleUpdate}
             onAddPizza={handleAddPizza}
             
  nombrePizzas={pizzasCommandees.length}
  resetPizzaForm={resetPizzaForm}
  onResetHandled={handleResetHandled}
  estModification={indexPizzaAModifier !== null}
            />
          )}
          {etape === 3 && (
          <CommandeEtape3
            prioriserHoraire={prioriserHoraire}
    data={commandeData} // client (nom, téléphone)
    numeroCommande={numeroCommande}
    pizzasCommandees={pizzasCommandees} // ← IMPORTANT !
     heureCommande={heureCommande} // 👈 ICI
    onBack={handlePrecedent}
    onClose={onClose}
    onEdit={handleEditPizza}
    onDelete={handleDeletePizza}
     onAddPizza={handleAddPizzaFromEtape3}
     onUpdate={handleUpdate}
commandes={commandes}
  listeCreneaux={listeCreneaux} // ✅ DOIT être bien passé
  pizzasParQuart={quotas} // ✅ pareil
  delta={delta} // ✅ idem
  
  />
          )}
        </div>

        <div className="modal-footer flex justify-between items-center px-6 py-3 border-t">
 {etape > 1 && etape < 3 && !hidePrecedent && (
  <button
    onClick={handlePrecedent}
    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 flex items-center gap-2"
  >
    <FiArrowLeft /> Précédent
  </button>
)}


  <button
    onClick={() => {
      resetCommande();
      onClose();
    }}
    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
  >
    <FiX /> Annuler la commande
  </button>




         {etape == 1 && (
            <button
              onClick={handleSuivant}
              className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 flex items-center gap-2"
            >
              Suivant <FiShoppingCart />
            </button>
          
          )}

           {etape == 2 && (
            // <button
            //   onClick={handleSuivant}
            //   className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 flex items-center gap-2"
            // >
            //   Suivant <FiShoppingCart />
            // </button>
            <button
           onClick={() => setShowConfirmationEtape2(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          <FiCheckCircle /> Valider
        </button>
          )}
          {etape == 3 && (
            
          <button
              onClick={handleValidation}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              disabled={showSuccess}
            >
              <FiCheckCircle /> Mettre en préparation
            </button>
          )}
        </div>
      </div>
      {showConfirmationEtape2 && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
    <div className="bg-white rounded-lg p-6 w-full max-w-md text-gray-900 shadow-xl">
      <h2 className="text-lg font-semibold mb-4">Valider la pizza</h2>
      <p className="mb-6">Souhaitez-vous ajouter une autre pizza ou passer à l'étape suivante ?</p>
      <div className="flex justify-end gap-3">
        <button
          onClick={() => {
            handleAddPizza(pizzaTemp, true); // rester sur étape 2
            setPizzaTemp({});
            setShowConfirmationEtape2(false);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          ➕ Ajouter une autre
        </button>
        <button
          onClick={() => {
            handleAddPizza(pizzaTemp, false); // aller à étape 3
            setPizzaTemp({});
            setShowConfirmationEtape2(false);
          }}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          ✅ Fin de commande
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}
