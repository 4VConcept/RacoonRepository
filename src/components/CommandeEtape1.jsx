import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function CommandeEtape1({ onNext, numeroCommande, data, onUpdate }) {
  const [selectedPizza, setSelectedPizza] = useState(data.pizzaId || null);
  const [pizzasUniques, setPizzasUniques] = useState([]);
const couleursPizza = {
  Margarita: '#70d466',
  Champignon: '#70d466',
  Végétarienne: '#70d466',

  Reine: '#f490e5',
  Jambon: '#f490e5',
  'Jambon champi': '#f490e5',
  Racoon: '#f490e5',
  Roma: '#f490e5',

  Sarrazine: '#f23e6e',
  Buffalo: '#f23e6e',
  Bolognaise: '#f23e6e',
  Merguez: '#f23e6e',
  Orientale: '#f23e6e',
  Chorizo: '#f23e6e',

  Saumon: '#27a5ef',
  Napolitaine: '#27a5ef',
  'Royal thon': '#27a5ef',
  'Fruits de mer': '#27a5ef',

  Poulet: '#d7b84b',

  '4 délices': '#fbf441',
  'Chèvre miel': '#fbf441',

  'Pizza du mois': '#d65dee',
};

function getCouleurPizza(nom) {
  return couleursPizza[nom] || '#ffffff'; // Blanc par défaut si non défini
}

  useEffect(() => {
    const fetchPizzas = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/pizzas`);
        const data = await res.json();
console.log("✅ Pizzas récupérées :", data.pizzas);

        if (data.success && Array.isArray(data.pizzas)) {

          const uniqueMap = new Map();

          for (const pizza of data.pizzas) {
            const nomKey = pizza.nom.trim().toLowerCase();
            if (!uniqueMap.has(nomKey)) {
              uniqueMap.set(nomKey, pizza);
            } else {
              const current = uniqueMap.get(nomKey);
              // Prioriser celui qui a une description ou un prix plus haut
              if (
                (pizza.description && !current.description) ||
                pizza.prix > current.prix
              ) {
                uniqueMap.set(nomKey, pizza);
              }
            }
          }

         const nomsExclus = ['base crème']; // noms à exclure (minuscule pour comparaison)

const uniqueSorted = Array.from(uniqueMap.values())
  .filter(p => !nomsExclus.includes(p.nom.trim().toLowerCase()))
  .sort((a, b) =>
    a.nom.localeCompare(b.nom, 'fr', { sensitivity: 'base' })
  );

          setPizzasUniques(uniqueSorted);
        }
      } catch (err) {
        console.error("Erreur chargement pizzas :", err);
      }
    };

    fetchPizzas();
  }, []);

  const handleSelection = (pizzaId) => {
    setSelectedPizza(pizzaId);
    onUpdate({ pizzaId });
    onNext();
  };

  useEffect(() => {
    setSelectedPizza(data.pizzaId || null);
  }, [data]);

  return (
    <div className="px-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {pizzasUniques.map((pizza) => (
          <motion.div
            key={pizza.id}
            onClick={() => handleSelection(pizza.id)}
            whileHover={{ scale: 1.05 }}
             style={{
      backgroundColor: getCouleurPizza(pizza.nom),
      color: 'black',
      minHeight: '90px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
            className={`rounded-xl overflow-hidden border cursor-pointer transition-all shadow-md hover:shadow-lg ${
              selectedPizza === pizza.id
                ? 'border-orange-500 ring-2 ring-orange-400'
                : 'border-gray-300'
            }`}
          >
          
            <div className="p-1 text-center font-semibold text-lg text-black">
              {pizza.nom}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
