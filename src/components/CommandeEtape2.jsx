
import { useState, useEffect } from 'react';
import { FiArrowLeft, FiShoppingCart, FiPlus, FiCheckCircle } from 'react-icons/fi';
import pizzaList from '../data/pizzas';
import { motion } from 'framer-motion';
import baseList from '../data/bases';
import cuissonList from '../data/cuisson';
import optionList from '../data/options';
import sousAlimentList from '../data/sousAliments';
import supplementList from '../data/supplements';
  import { useRef } from 'react';

export default function CommandeEtape2({ onNext, onBack, data, onUpdate, onAddPizza, nombrePizzas = 1,pizzaAModifier ,estModification = false,pizza}) {
  const [pizzaId, setPizzaId] = useState('');
  const [selectedCreneau, setSelectedCreneau] = useState('');
  const [taille, setTaille] = useState('moyenne');
  const [base, setBase] = useState('Base tomate');
 const [option, setOption] = useState([]);

  const [cuisson, setCuisson] = useState('');
  const [supplements, setSupplements] = useState([]);
  const [sousAliments, setSousAliments] = useState([]);
const [pizzasDisponibles, setPizzasDisponibles] = useState([]);
const [nomPizza, setNomPizza] = useState('');
const [categorieIds, setCategorieIds] = useState({ moyenne: 1, grande: 8 });
const [produits, setProduits] = useState([]);
const [coutPizza, setCoutPizza] = useState(0);
useEffect(() => {
  const chargerProduits = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/pizzas/all`);
      const data = await res.json();
      if (data.success && Array.isArray(data.pizzas)) {
        setProduits(data.pizzas);
      }
    } catch (err) {
      console.error('Erreur chargement produits initiaux', err);
    }
  };

  chargerProduits();
}, []);

useEffect(() => {
  const fetchCategories = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/pizzas/categories`);
      const data = await res.json();
      if (data.success) {
        const ids = {};

        for (const c of data.categories) {
         const nom = c.nom.trim().toLowerCase();

if (nom === 'moy') ids.moyenne = c.id;
if (nom === 'maxi') ids.grande = c.id;
if (nom === 'suppléments moyens') ids['Suppléments moyens'] = c.id;
if (nom === 'suppléments maxis') ids['Suppléments maxis'] = c.id;

}

        setCategorieIds(ids);
     }
    } catch (err) {
      console.error('❌ Erreur chargement des catégories :', err);
    }
  };

  fetchCategories();
}, []);


useEffect(() => {
  const chargerPizzas = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/pizzas`);
      const data = await res.json();
       if (data.success && Array.isArray(data.pizzas)) {

        // Extraire noms distincts
        const nomsUniques = [...new Set(data.pizzas.map(p => p.nom))];
        setPizzasDisponibles(nomsUniques);
      }
    } catch (error) {
      console.error("Erreur de chargement des produits :", error);
    }
  };
  chargerPizzas();
}, []);


useEffect(() => {
  if (!nomPizza && pizzaId && pizzasDisponibles.length > 0) {
   console.log('patrice2',nomPizza,'-',pizzaId);
    const chargerNomDepuisId = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/pizzas`);
       
        const data = await res.json();
         console.log('list pizza',data);
        if (data.success) {
          const pizzaTrouvee = data.pizzas.find(p => p.id == pizzaId);
          console.log('patrice',pizzaTrouvee);
          if (pizzaTrouvee) {
            setNomPizza(pizzaTrouvee.nom);
          }
        }
      } catch (err) {
        console.error("Erreur récupération nom pizza :", err);
      }
    };
    chargerNomDepuisId();
  }
}, [pizzaId, pizzasDisponibles]);


const [supplementsDisponibles, setSupplementsDisponibles] = useState([]);

useEffect(() => {
  if (!taille || !categorieIds['Suppléments moyens'] || !categorieIds['Suppléments maxis']) return;

  const cleCategorie = taille === 'grande' ? 'Suppléments maxis' : 'Suppléments moyens';
  const idCategorieSupplements = categorieIds[cleCategorie];

  const filtres = produits.filter(p => p.categorie_id === idCategorieSupplements);


setSupplementsDisponibles(
  [...filtres].sort((a, b) => a.nom.localeCompare(b.nom))
);
}, [taille, produits, categorieIds]);


useEffect(() => {
  const chargerPrixPizza = () => {
 
    if (!nomPizza || !taille || !categorieIds[taille]) return;

    const idCategorie = categorieIds[taille];
 
    const produit = produits.find(
      (p) =>
        p.nom.trim().toLowerCase() === nomPizza.trim().toLowerCase() &&
        p.categorie_id === idCategorie
    );

 let baseSupplement = null;
 let prixTotal = produit?.prix || 0;
// 👉 Ajouter prix de la base crème **uniquement si ce n’est pas celle incluse**
if (
  base.trim().toLowerCase() === 'base crème' &&
  baseIncluseRef.current !== 'crème'
) {
  const baseCreme = produits.find(
    (p) =>
      p.nom.trim().toLowerCase() === 'base crème' &&
      p.categorie_id === idCategorie
  );
  if (baseCreme) {
    prixTotal += baseCreme.prix;
    // 👉 ici, on marque la base crème comme supplément explicite
    baseSupplement = {
      ingredient_id: baseCreme.id,
      ingredient: 'Base crème',
      prix: baseCreme.prix,
      portion: 'entière'
    };
  } else {
    console.warn('⚠️ Base crème non trouvée pour cette catégorie');
  }
}
// ✅ Ajout suppléments
for (const sup of supplements) {
  const produitSupp = supplementsDisponibles.find(p => p.nom === sup.ingredient);
  if (produitSupp) {
    prixTotal += produitSupp.prix || 0;
  }
}
    setCoutPizza(prixTotal);

    // ✅ Création de l'objet maCommande
    const pizzasCommandees = {
      pizzaId: produit?.id ?? null,
      nom: produit?.nom ?? nomPizza,
      taille,
      base,
      cuisson,
      options : option,
      supplements: baseSupplement ? [...supplements, baseSupplement] : supplements, // <-- ✔️ ICI
  sousAliments,
      prixTotal: prixTotal.toFixed(2)
    };
  onUpdate({
   pizzaId: produit?.id ?? null,
      nom: produit?.nom ?? nomPizza,
      taille,
      base,
      cuisson,
      options :option,
      supplements: baseSupplement ? [...supplements, baseSupplement] : supplements,
  
      sousAliments,
      prixTotal: prixTotal.toFixed(2)
  });

  
    
    console.log('📦 Objet maCommande :', pizzasCommandees);

  };
  chargerPrixPizza();
}, [nomPizza, taille, base, cuisson, option, supplements, sousAliments, categorieIds, produits]);


//   useEffect(() => {
      
//     setPizzaId(data?.pizzaId || '');
//     setSelectedCreneau(data?.creneauId || '');
//     setTaille(data?.taille || 'moyenne');
//     setBase(data?.base || 'Base tomate');
//     setOption(data?.option || '');
//     setCuisson(data?.cuisson || '');
//     setSupplements(data?.supplements || []);
//     setSousAliments(data?.sousAliments || []);
//   }, [JSON.stringify(data)]);
// useEffect(() => {
//   if (pizzaAModifier) {
   
//     setPizzaId(pizzaAModifier.pizzaId || '');
//     setSelectedCreneau(pizzaAModifier.creneauId || '');
//     setTaille(pizzaAModifier.taille || 'moyenne');
//     setBase(pizzaAModifier.base || 'Base tomate');
//     setOption(pizzaAModifier.option || '');
//     setCuisson(pizzaAModifier.cuisson || '');
//     setSupplements(pizzaAModifier.supplements || []);
//     setSousAliments(pizzaAModifier.sousAliments || []);
//   }
// }, [JSON.stringify(pizzaAModifier)]);
//   useEffect(() => {
//     const supplementsFiltrés = supplements.filter(s => s.ingredient && s.ingredient.trim() !== '');
//   const sousAlimentsFiltrés = sousAliments.filter(s => s.ingredient && s.ingredient.trim() !== '');

//     onUpdate({
//       pizzaId,
//       creneauId: selectedCreneau,
//       taille,
//       base,
//       option,
//       cuisson,
//        supplements: supplementsFiltrés,
//     sousAliments: sousAlimentsFiltrés,
//     });
//   }, [pizzaId, selectedCreneau, taille, base, option, cuisson, supplements, sousAliments]);
// Initialisation si nouvelle pizza
useEffect(() => {
  if (data?.pizzaId !== undefined) {
    setPizzaId(data.pizzaId);
    setSelectedCreneau(data.creneauId || '');
    setTaille(data.taille || 'moyenne');
    setBase(data.base || 'Base tomate');
    setOption(data.option || []);
    setCuisson(data.cuisson || '');
    setSupplements(data.supplements || []);
    setSousAliments(data.sousAliments || []);
  }
}, [data?.pizzaId]); // ✅ stable

// Initialisation si on modifie une pizza existante
useEffect(() => {
  if (pizzaAModifier?.pizzaId !== undefined) {
    setPizzaId(pizzaAModifier.pizzaId);
    setSelectedCreneau(pizzaAModifier.creneauId || '');
    setTaille(pizzaAModifier.taille || 'moyenne');
    setBase(pizzaAModifier.base || 'Base tomate');
   setOption(pizzaAModifier.option || []);
setCuisson(pizzaAModifier.cuisson || '');
    setSupplements(pizzaAModifier.supplements || []);
    setSousAliments(pizzaAModifier.sousAliments || []);
  }
}, [pizzaAModifier?.pizzaId]); // ✅ stable



// Envoi des données vers le parent
useEffect(() => {
  // ⛔️ Si la pizzaId est vide, ne pas envoyer de données
  if (!pizzaId) return;

  const supplementsFiltrés = supplements.filter(s => s.ingredient && s.ingredient.trim() !== '');
  const sousAlimentsFiltrés = sousAliments.filter(s => s.ingredient && s.ingredient.trim() !== '');

  onUpdate({
    pizzaId,
    creneauId: selectedCreneau,
    taille,
    base,
    option,
    cuisson,
    supplements: supplementsFiltrés,
    sousAliments: sousAlimentsFiltrés,
  });
}, [pizzaId, selectedCreneau, taille, base, option, cuisson, supplements, sousAliments]);
  const tousLesCreneaux = [
    { id: 1, heure: '11:00', commandes: 4, max: 5, delta: 3 },
    { id: 2, heure: '11:30', commandes: 8, max: 8, delta: 3 },
    { id: 3, heure: '12:00', commandes: 5, max: 6, delta: 3 },
    { id: 4, heure: '12:30', commandes: 9, max: 9, delta: 3 },
    { id: 5, heure: '13:00', commandes: 6, max: 6, delta: 3 },
  ];

  const getCurrentTime = () => new Date().toTimeString().slice(0, 5);

  const isAfterNow = (h) => {
    const [h1, m1] = h.split(':').map(Number);
    const [h2, m2] = getCurrentTime().split(':').map(Number);
    return h1 > h2 || (h1 === h2 && m1 > m2);
  };

  const creneauxFiltres = tousLesCreneaux.filter(
    (c) => isAfterNow(c.heure) && c.commandes < (c.max + c.delta)
  );

  const radioButton = (selectedValue, currentValue, name, onChange) => (
  <label className={`cursor-pointer block w-full px-4 py-2 mb-2 rounded border text-center transition 
    ${selectedValue === currentValue ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-900'}`}>
    <input
      type="radio"
      name={name}
      value={currentValue}
      checked={selectedValue === currentValue}
      onChange={onChange}
      className="hidden"
    />
    {currentValue === '' ? 'Aucun' : currentValue}
  </label>
);


const baseIncluseRef = useRef('tomate'); // par défaut

useEffect(() => {
  
  if (!nomPizza || produits.length === 0) return;

  const produit = produits.find(p => 
    p.nom.trim().toLowerCase() === nomPizza.trim().toLowerCase()
  );

  
  const description = produit?.description?.toLowerCase() || '';
console.log('on est la',description);
  if (description.includes('bt')) {
     baseIncluseRef.current = 'tomate';
    setBase('Base tomate');
  } else if (description.includes('bc')) {
    baseIncluseRef.current = 'crème';
    setBase('Base crème');
  }else {
    baseIncluseRef.current = 'tomate';
  }
}, [nomPizza, produits]);
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-xl shadow">
          <label className="block font-semibold text-orange-600 mb-2">🍕 Pizza</label>
        <select
  className="w-full px-4 py-2 border rounded bg-gray-50 text-gray-900"
  value={nomPizza}
  onChange={(e) => setNomPizza(e.target.value)}
  disabled={estModification}
>
  {pizzasDisponibles.map((nom, index) => (
    <option key={index} value={nom}>{nom}</option>
  ))}
</select>
        </div>
       <div className="text-right mb-4">
  <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold shadow-sm">
    🍕 Pizzas ajoutées : {nombrePizzas}
  </span>

  <motion.div
      key={coutPizza} // Clé dynamique pour relancer l’animation à chaque changement
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="mt-2"
    >
      <span className="inline-block bg-orange-100 text-orange-700 font-semibold px-4 py-2 rounded-xl shadow">
        Coût pizza : {coutPizza.toFixed(2)} €
      </span>
    </motion.div>
</div>
        
      </motion.div>

     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {[{ label: '📏 Taille', name: 'taille', options: ['moyenne', 'grande'], value: taille, setter: setTaille },
    { label: '🧄 Base', name: 'base', options: baseList.map(b => b.nom), value: base, setter: setBase },
  ].map((group, index) => (
    <motion.div
      key={index}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white p-4 rounded-xl shadow w-full"
    >
      <label className="block font-semibold text-orange-600 mb-2">{group.label}</label>
      <div className="flex flex-wrap gap-2">
        {group.options.map(val => (
          <label key={val} className="flex-1 min-w-[100px]">
            {radioButton(group.value, val, group.name, (e) => group.setter(e.target.value))}
          </label>
        ))}
      </div>
    </motion.div>
  ))}
</div>



      {[{ label: '➕ Suppléments', data: supplements, setData: setSupplements },
        { label: '🚫 Sans aliments', data: sousAliments, setData: setSousAliments }
      ]
      .map((group, index) => (
  <motion.div key={index} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white p-4 rounded-xl shadow">
    <label className="block font-semibold text-orange-600 mb-2">{group.label}</label>
    {group.data.map((item, idx) => (
      <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2 items-center">
        <select
          className="px-2 py-1 border rounded bg-gray-50 w-full"
          value={item.ingredient}
          onChange={(e) => {
            const selectedNom = e.target.value;
            const next = [...group.data];

            const selected = supplementsDisponibles.find(s => s.nom === selectedNom);

            if (selected) {
              next[idx] = {
                ingredient: selected.nom,
                ingredient_id: selected.id,
                prix: selected.prix,
                portion: 'entière'
              };
            } else {
              next[idx] = {
                ingredient: selectedNom,
                portion: 'entière'
              };
            }

            group.setData(next);
          }}
        >
          <option value="">Choisir un ingrédient</option>
{supplementsDisponibles.map((s) => (
  <option key={s.id} value={s.nom}>
    {group.label === '🚫 Sans aliments' ? s.nom : `${s.nom} ${s.prix ? `( +${s.prix} €)` : ''}`}
  </option>
))}
        </select>

        <select
          value={item.portion}
          onChange={(e) => {
            const next = [...group.data];
            next[idx].portion = e.target.value;
            group.setData(next);
          }}
          className="px-2 py-1 border rounded bg-gray-50 w-full"
        >
          <option value=""></option>
          <option value="entière">Entière</option>
          <option value="moitié">Moitié</option>
        </select>

        <button
          onClick={() => {
            const removed = group.data[idx];
            const next = group.data.filter((_, i) => i !== idx);
            group.setData(next);

            if (group.label === '➕ Suppléments') {
              const selected = supplementsDisponibles.find(s => s.nom === removed.ingredient);
              if (selected) {
                setCoutPizza(prev => parseFloat((prev - selected.prix).toFixed(2)));
              }
            }
          }}
          className="text-red-600 hover:text-red-800 text-sm"
          title="Supprimer"
        >
          ❌
        </button>
      </div>
    ))}
    <button
      onClick={() => group.setData([...group.data, { ingredient: '', portion: 'entière' }])}
      className="text-sm text-blue-600 hover:underline mt-2"
    >
      + Ajouter
    </button>
  </motion.div>
))}

      {[  { label: '🧩 Options', name: 'option', options: optionList.map(o => o.nom), value: option, setter: setOption }
      ].map((group, index) => (
       <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white p-4 rounded-xl shadow">
  <label className="block font-semibold text-orange-600 mb-2">🧩 Options</label>
  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
    {optionList.map(({ nom }) => {
      const isActive = option.includes(nom);
      return (
        <button
          key={nom}
          type="button"
          onClick={() => {
            if (isActive) {
              setOption(option.filter((o) => o !== nom));
            } else {
              setOption([...option, nom]);
            }
          }}
          className={`w-full  px-4 py-2 rounded border text-center font-medium transition
            ${isActive ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-900'}`}
        >
          {nom}
        </button>
      );
    })}
  </div>
</motion.div>


      ))}
  {[  { label: '🔥 Cuisson', name: 'cuisson', options: cuissonList.map(c => c.nom), value: cuisson, setter: setCuisson }
      ].map((group, index) => (
        <motion.div key={index} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white p-4 rounded-xl shadow">
          <label className="block font-semibold text-orange-600 mb-2">{group.label}</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-1 gap-y-2">
            {group.options.map(val => (
              <div key={val} className="w-full">
                {radioButton(group.value, val, group.name, (e) => group.setter(e.target.value))}
              </div>
            ))}
          </div>
        </motion.div>
      ))}


    </div>
  );
}