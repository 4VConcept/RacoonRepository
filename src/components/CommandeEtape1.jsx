import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function CommandeEtape1({ onNext, numeroCommande, data, onUpdate }) {
  const [selectedPizza, setSelectedPizza] = useState(data.pizzaId || null);
  const [pizzasUniques, setPizzasUniques] = useState([]);

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
  };

  useEffect(() => {
    setSelectedPizza(data.pizzaId || null);
  }, [data]);

  return (
    <div className="px-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {pizzasUniques.map((pizza) => (
          <motion.div
            key={pizza.id}
            onClick={() => handleSelection(pizza.id)}
            whileHover={{ scale: 1.05 }}
            className={`rounded-xl overflow-hidden border cursor-pointer transition-all shadow-md hover:shadow-lg ${
              selectedPizza === pizza.id
                ? 'border-orange-500 ring-2 ring-orange-400'
                : 'border-gray-300'
            }`}
          >
            <img
              src={
                pizza.image_url?.trim()
                  ? pizza.image_url
                  : "https://cdn.pixabay.com/photo/2017/12/09/08/18/pizza-3007395_960_720.jpg"
              }
              alt={pizza.nom}
              className="w-full h-32 object-cover"
              onError={(e) => {
                e.target.src =
                  "https://cdn.pixabay.com/photo/2017/12/09/08/18/pizza-3007395_960_720.jpg";
              }}
            />
            <div className="p-2 text-center font-semibold text-sm bg-white text-gray-800">
              {pizza.nom}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
