import { createContext, useContext, useState, useEffect } from 'react';

const ParametresContext = createContext();

const ParametresProvider = ({ children }) => {
  const [parametres, setParametres] = useState(null);

  // Fonction partagée pour (re)charger les paramètres depuis l'API
  const fetchParametres = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/parametres`);
      const data = await res.json();
      if (data.success) {
        setParametres(data.data);
      } else {
        console.error('[ERROR] Chargement paramètres :', data.message || 'Inconnu');
      }
    } catch (err) {
      console.error('[ERROR] Problème lors du fetch des paramètres :', err);
    }
  };

  // Chargement initial
  useEffect(() => {
    fetchParametres();
  }, []);

  return (
    <ParametresContext.Provider value={{ parametres, refreshParametres: fetchParametres }}>
      {children}
    </ParametresContext.Provider>
  );
};

export default ParametresProvider;

// Hook d'utilisation
export const useParametres = () => useContext(ParametresContext);
