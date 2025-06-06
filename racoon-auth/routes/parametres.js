const express = require('express');
const router = express.Router();
const db = require('../db');

// GET : Lire les paramètres
router.get('/', async (req, res) => {
  try {
    const row = await db.getAsync('SELECT * FROM parametres LIMIT 1');
    res.json({ success: true, data: row });
  } catch (err) {
    console.error('Erreur lecture paramètres :', err);
    res.status(500).json({ success: false });
  }
});

// POST : Mettre à jour les paramètres
router.post('/', async (req, res) => {
  const { heureDebut, heureFin, maxPizza, delta, heureRemise, txRemise } = req.body;

  try {
    await db.runAsync(`
      UPDATE parametres SET
        heureDebut = ?, heureFin = ?, maxPizza = ?, delta = ?, heureRemise = ?, txRemise = ?
      WHERE id = 1
    `, [heureDebut, heureFin, maxPizza, delta, heureRemise, txRemise]);

    res.json({ success: true });
  } catch (err) {
    console.error('Erreur écriture paramètres :', err);
    res.status(500).json({ success: false });
  }
});

module.exports = router;
