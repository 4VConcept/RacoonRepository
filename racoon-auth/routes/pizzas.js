const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/all', (req, res) => {
  db.all(`SELECT * FROM produits`, (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: 'Erreur base de données' });
    res.json({ success: true, pizzas: rows });
  });
});

router.get('/', (req, res) => {
  db.all(`SELECT * FROM produits WHERE categorie_id IN (?, ?) ORDER BY nom`, [1, 8], (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: 'Erreur base de données' });
    res.json({ success: true, pizzas: rows });
  });
});
router.get('/small', (req, res) => {
  db.all(`SELECT * FROM produits WHERE categorie_id =1 ORDER BY nom`, (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: 'Erreur base de données' });
    res.json({ success: true, pizzas: rows });
  });
});
router.get('/categories', (req, res) => {
  db.all(`SELECT id, nom FROM categories`, (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: 'Erreur base de données' });
    res.json({ success: true, categories: rows });
  });
});

module.exports = router;
