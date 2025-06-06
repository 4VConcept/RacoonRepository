const express = require('express');
const db = require('../db.js'); // ← Assure-toi que ce chemin est correct

const router = express.Router();// Enregistrement d'un log interne
router.post('/internes', (req, res) => {
  const { action, utilisateur } = req.body;

  if (!action || !utilisateur) {
    return res.status(400).json({ error: 'Champ manquant (action ou utilisateur)' });
  }

  const query = `INSERT INTO logs_internes (action, utilisateur) VALUES (?, ?)`;
  db.run(query, [action, utilisateur], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Erreur lors de l\'insertion du log interne' });
    }
    res.status(201).json({ message: 'Log enregistré', id: this.lastID });
  });
});

router.get('/internes', (req, res) => {
  db.all('SELECT * FROM logs_internes ORDER BY id DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows); // ✅ Important : retourne directement un tableau
  });
});

router.delete('/internes/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM logs_internes WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Log non trouvé' });
    res.json({ message: 'Log supprimé' });
  });
});
router.delete('/internes', (req, res) => {
  db.run('DELETE FROM logs_internes', function (err) {
    if (err) {
      return res.status(500).json({ error: "Erreur lors de la suppression des logs." });
    }
    res.status(200).json({ message: "Tous les logs supprimés." });
  });
});


module.exports = router; // ← OBLIGATOIRE
