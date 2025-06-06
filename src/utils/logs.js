import axios from 'axios';

export const enregistrerLog = async (action, utilisateur = 'admin') => {
  try {
    await axios.post('/api/logs/internes', { action, utilisateur });
  } catch (err) {
    console.error('Erreur journalisation :', err);
  }
};
