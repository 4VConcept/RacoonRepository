const express = require('express');
const router = express.Router();
require('dotenv').config();
const axios = require('axios');
const db = require('../db.js'); // ← Assure-toi que ce chemin est correct




router.get('/', async (req, res) => {
  
  const { HIBOUTIK_USERNAME, HIBOUTIK_PASSWORD, HIBOUTIK_ACCOUNT } = process.env;

  if (!HIBOUTIK_USERNAME || !HIBOUTIK_PASSWORD || !HIBOUTIK_ACCOUNT) {
    return res.status(400).json({ success: false, message: 'Identifiants Hiboutik manquants' });
  }

  try {
   const url = `https://${HIBOUTIK_ACCOUNT}.hiboutik.com/api/customers?p=1`;


    const headers = {
      'Authorization': 'Basic ' + Buffer.from(`${HIBOUTIK_USERNAME}:${HIBOUTIK_PASSWORD}`).toString('base64'),
      'Hiboutik-Account': HIBOUTIK_ACCOUNT,
      'Content-Type': 'application/json',
    };


    const response = await fetch(url, {
      method: 'GET',
      headers: headers,
    });

   const contentType = response.headers.get('content-type');
const responseText = await response.text();


    if (!contentType || !contentType.includes('application/json')) {
  return res.status(500).json({
    success: false,
    message: 'La réponse reçue n’est pas du JSON.',
    raw: responseText,
  });
}

const data = JSON.parse(responseText);

const isArray = Array.isArray(data);

res.json({
  success: true,
  count: isArray ? data.length : 0,
  sample: isArray ? data.slice(0, 3) : [],
  raw: isArray ? undefined : data, // pour inspecter le format inattendu
});

  } catch (error) {
    console.error('❌ Exception API :', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});


router.get('/sync-products', async (req, res) => {
  const { HIBOUTIK_USERNAME, HIBOUTIK_PASSWORD, HIBOUTIK_ACCOUNT } = process.env;

  if (!HIBOUTIK_USERNAME || !HIBOUTIK_PASSWORD || !HIBOUTIK_ACCOUNT) {
    return res.status(400).json({ success: false, message: 'Identifiants Hiboutik manquants' });
  }

  try {
    const url = `https://${HIBOUTIK_ACCOUNT}.hiboutik.com/api/products/`;

    const headers = {
      'Authorization': 'Basic ' + Buffer.from(`${HIBOUTIK_USERNAME}:${HIBOUTIK_PASSWORD}`).toString('base64'),
      'Hiboutik-Account': HIBOUTIK_ACCOUNT,
      'Content-Type': 'application/json',
    };

    const response = await axios.get(url, { headers });
    console.log('Réponse API Hiboutik brute :', response.data);

    const produits = response.data;
console.log('Exemple produit reçu :', produits[0]);

    if (!Array.isArray(produits)) {
      return res.status(500).json({
        success: false,
        message: "La réponse de l'API n'est pas un tableau.",
        raw: produits,
      });
    }

    // Nettoyage de la table locale
    await db.runAsync('DELETE FROM produits');

    // Préparation de l'insertion
    const insert = db.prepare(`
      INSERT INTO produits (id, nom, prix, categorie_id, image_url)
      VALUES (?, ?, ?, ?, ?)
    `);

    for (const produit of produits) {
     insert.run(
  produit.product_id,
  produit.product_model || '',
  parseFloat(produit.product_price) || 0,
  produit.product_category || null,
  '' // image_url : pas fourni par l’API → vide
);
    }
    insert.finalize();

    res.json({ success: true, message: 'Synchronisation terminée', count: produits.length });
  } catch (error) {
    console.error('❌ Erreur de synchronisation :', error.message);
    res.status(500).json({ success: false, message: 'Erreur API : ' + error.message });
  }
});

router.get('/sync-all', async (req, res) => {
  const { HIBOUTIK_USERNAME, HIBOUTIK_PASSWORD, HIBOUTIK_ACCOUNT } = process.env;

  if (!HIBOUTIK_USERNAME || !HIBOUTIK_PASSWORD || !HIBOUTIK_ACCOUNT) {
    return res.status(400).json({ success: false, message: 'Identifiants Hiboutik manquants' });
  }

  const headers = {
    'Authorization': 'Basic ' + Buffer.from(`${HIBOUTIK_USERNAME}:${HIBOUTIK_PASSWORD}`).toString('base64'),
    'Hiboutik-Account': HIBOUTIK_ACCOUNT,
    'Content-Type': 'application/json',
  };

  try {
    // 🔁 1. Synchronisation des catégories
    const catUrl = `https://${HIBOUTIK_ACCOUNT}.hiboutik.com/api/categories/`;
    const catResponse = await axios.get(catUrl, { headers });
    const categories = catResponse.data;
console.log('Exemple categories reçu :', categories[0]);

    if (!Array.isArray(categories)) throw new Error("Réponse catégories non valide");

    await db.runAsync('DELETE FROM categories');
    const insertCat = db.prepare(`
  INSERT INTO categories (
    id, nom, parent_id, enabled, couleur_fond, couleur_texte, position
  ) VALUES (?, ?, ?, ?, ?, ?, ?)
`);

for (const cat of categories) {
  insertCat.run(
    cat.category_id,
    cat.category_name || '',
    cat.category_id_parent || 0,
    cat.category_enabled || 0,
    cat.category_bck_color || '',
    cat.category_color || '',
    cat.category_position || 0
  );
}
insertCat.finalize();

    // 🍕 2. Synchronisation des produits
    const prodUrl = `https://${HIBOUTIK_ACCOUNT}.hiboutik.com/api/products/`;
    const prodResponse = await axios.get(prodUrl, { headers });
    const produits = prodResponse.data;

    if (!Array.isArray(produits)) throw new Error("Réponse produits non valide");

    await db.runAsync('DELETE FROM produits');
    const insertProd = db.prepare(`
      INSERT INTO produits (id, nom, prix, categorie_id, image_url, description)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    for (const p of produits) {
      insertProd.run(
        p.product_id,
        p.product_model || '',
        parseFloat(p.product_price) || 0,
        p.product_category || null,
        '', // image_url manquant
        p.products_desc  || ''
      );
    }
    insertProd.finalize();

    res.json({
      success: true,
      message: 'Catégories et produits synchronisés avec succès',
      total: {
        categories: categories.length,
        produits: produits.length
      }
    });
  } catch (error) {
    console.error('❌ Erreur dans sync-all :', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});
router.get('/etat-local', async (req, res) => {
  try {
    console.log('👉 Requête reçue sur /etat-local');
    
    const categories = await db.allAsync(`SELECT id, nom FROM categories`);
    const produits = await db.allAsync(`SELECT id, nom, prix, categorie_id,description FROM produits ORDER BY nom ASC`);

    console.log('📦 Catégories :', categories);
    console.log('🍕 Produits :', produits);
    res.json({ success: true, categories, produits });
  } catch (error) {
    console.error('Erreur /etat-local :', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});



module.exports = router;
