const express = require('express');
const router = express.Router();
const { enregistrerCommande, getCommandes,mettreAJourCreneauCommande } = require('../commandeService');
const db = require('../db.js'); // ← Assure-toi que ce chemin est correct

const axios = require('axios');

router.post('/', async (req, res) => {
  try {
    await enregistrerCommande(req.body);
   res.status(201).json({ message: 'Commande enregistrée avec succès' });
  } catch (error) {
    if (error) {
  console.error('❌ SQLite error:', error.message);

}
    res.status(500).json({ error: 'Erreur lors de l’enregistrement' });
  }
});
// Vérifier si un numéro de commande existe déjà
router.get('/verifier/:numeroCommande', async (req, res) => {
  const { numeroCommande } = req.params;

  try {
    const row = await db.getAsync(
      'SELECT 1 FROM commandes WHERE numeroCommande = ? LIMIT 1',
      [numeroCommande]
    );

    if (row) {
      return res.json({ existe: true });
    } else {
      return res.json({ existe: false });
    }
  } catch (err) {
    console.error('Erreur vérification numeroCommande :', err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});



router.get('/', async (req, res) => {
  try {
    const { date } = req.query; // "2025-06-02"
    const commandes = await getCommandes();
    const resultats = commandes.filter(c => c.date?.startsWith(date));
    res.json(resultats);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors du chargement des commandes' });
  }
});
router.get('/suivi-financier', async (req, res) => {
  try {
    
    const commandes = await getCommandes();
    res.json(commandes);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors du chargement des commandes' });
  }
});
// Exemple Express
router.put('/:numeroCommande/payer', async (req, res) => {
  const  id  = req.params.numeroCommande;
  const { modePaiement } = req.body;

  try {
    await db.run('UPDATE commandes SET modePaiement = ? WHERE numeroCommande = ?', [modePaiement, id]);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour du paiement' });
  }
});
// Suppression d'une commande
router.delete('/:numeroCommande', async (req, res) => {
  const id = req.params.numeroCommande;
  try {
   const result = await db.run('DELETE FROM commandes WHERE numeroCommande = ?', [id]);

    // 🔴 2. Supprime aussi dans la table commandeToHiboutik
    await db.run('DELETE FROM commandeToHiboutik WHERE numCommande = ?', [id]);

    if (result.changes === 0) {
      return res.status(404).json({ message: 'Commande non trouvée.' });
    }
// await db.run(
//   `INSERT INTO logs_internes (action, utilisateur) VALUES (?, ?)`,
//   [`🗑️ Suppression de la commande ${id} dans commandes et commandeToHiboutik`, 'système']
// );
    return res.status(200).json({ message: 'Commande supprimée avec succès dans toutes les tables.' });
  } catch (err) {
    console.error('Erreur suppression commande :', err);
    return res.status(500).json({ message: 'Erreur serveur lors de la suppression.' });
  }
});



router.patch('/:numeroCommande/creneau', async (req, res) => {
  try {
    const { numeroCommande } = req.params;
    const { nouveauCreneau } = req.body;

    await mettreAJourCreneauCommande(numeroCommande, nouveauCreneau);
    res.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du créneau :', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }


});
router.get('/nouveau-numero', async (req, res) => {
const now = new Date();
const formatter = new Intl.DateTimeFormat('fr-CA', {
  timeZone: 'America/Guadeloupe',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
});
const [year, month, day] = formatter.format(now).split('-');
const today = `${year}${month}${day}`;

  console.log('🕒 Requête numéro commande pour la date :', today);

  try {
  
    const row = await db.getAsync('SELECT * FROM compteurCommande WHERE date = ?', [today]);
console.log('🧪 Résultat brut SELECT * :', row);
    if (row) {
 
      console.log('🔢 Compteur existant trouvé :', row.compteur);
      const nouveauNumero = row.compteur + 1;
      await db.runAsync('UPDATE compteurCommande SET compteur = ? WHERE date = ?', [nouveauNumero, today]);
      const numeroCommande = `${today}-${nouveauNumero}`;
      console.log('✅ Nouveau numéro généré :', numeroCommande);
      return res.json({ numeroCommande });
    } else {
      const nouveauNumero = 1;
      await db.runAsync('INSERT INTO compteurCommande (date, compteur) VALUES (?, ?)', [today, nouveauNumero]);
      const numeroCommande =`${today}-${nouveauNumero}`;
      console.log('🆕 Nouvelle entrée compteur créée :', numeroCommande);
      return res.json({ numeroCommande });
    }
  } catch (err) {
    console.error('❌ Erreur génération numeroCommande :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.post('/annuler-dernier-numero', async (req, res) => {
  const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
  try {
    const row = await db.getAsync('SELECT compteur FROM compteurCommande WHERE date = ?', [today]);

    if (row && row.compteur > 1) {
      const nouveauCompteur = row.compteur - 1;
      await db.runAsync('UPDATE compteurCommande SET compteur = ? WHERE date = ?', [nouveauCompteur, today]);
      return res.json({ success: true, compteur: nouveauCompteur });
    } else if (row && row.compteur === 1) {
      await db.runAsync('DELETE FROM compteurCommande WHERE date = ?', [today]);
      return res.json({ success: true, deleted: true });
    } else {
      return res.status(404).json({ success: false, error: 'Aucun compteur à annuler.' });
    }
  } catch (err) {
    console.error('Erreur dans annulation du numéro :', err);
    return res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});



router.post('/reset-system', async (req, res) => {
  try {
    await db.run('DELETE FROM commandes');
    await db.run('DELETE FROM compteurCommande');
    await db.run('DELETE FROM commandeToHiboutik');
    
    res.json({ success: true, message: 'Système réinitialisé' });
  } catch (error) {
    console.error('Erreur reset système :', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

router.post('/versHiboutik', async (req, res) => {
  const { numeroCommande } = req.body;

  try {
    const { HIBOUTIK_USERNAME, HIBOUTIK_PASSWORD, HIBOUTIK_ACCOUNT } = process.env;

  if (!HIBOUTIK_USERNAME || !HIBOUTIK_PASSWORD || !HIBOUTIK_ACCOUNT) {
    return res.status(400).json({ success: false, message: 'Identifiants Hiboutik manquants' });
  }
    const commande = await db.getAsync(`SELECT * FROM commandes WHERE numeroCommande = ?`, [numeroCommande]);

    if (!commande) {
      return res.status(404).json({ success: false, message: 'Commande introuvable' });
    }

 const pizzas = JSON.parse(commande.pizzas || '[]');
console.log('🧾 Pizzas brutes de la commande :', pizzas);

const sales_lines = [];

// for (const pizza of pizzas) {
//   // ✅ Extraire correctement le prix total
//       const prixPizza = parseFloat(pizza.prixTotal);
//       sales_lines.push({
//         item_id: parseInt(pizza.pizzaId),
//         quantity: 1,
//         unit_price: prixPizza
//       });

//   if (pizza.supplements?.length) {
//     for (const s of pizza.supplements) {
//       if (s.ingredient_id) {
//         sales_lines.push({
//           item_id: parseInt(s.ingredient_id),
//           quantity: 1,
//           unit_price: parseFloat(s.prix || 0)
//         });
//       }
//     }
//   }
// }

console.log('📦 Lignes de vente générées pour Hiboutik :', sales_lines);
// ✅ Reconstruire une vraie date ISO
const dateFormatee = new Date().toLocaleDateString('fr-CA', {
  timeZone: 'America/Guadeloupe'
}); // Résultat : "2025-06-05"
 const authHeader = {
      Authorization: 'Basic ' + Buffer.from(`${HIBOUTIK_USERNAME}:${HIBOUTIK_PASSWORD}`).toString('base64')
    };
  // Étape 1 : Créer la vente vide
    const creationVente = await axios.post(`https://${HIBOUTIK_ACCOUNT}.hiboutik.com/api/sales`, {
      store_id: parseInt(process.env.HIBOUTIK_STORE_ID),
      currency_code: 'EUR',
      customer_id: 1,
  vendor_id:1,
 
    }, {
      headers: {
        'Content-Type': 'application/json',
        ...authHeader
      }
    });

const sale_id = creationVente.data.sale_id;
    if (!sale_id) throw new Error('Impossible de récupérer sale_id');

    console.log('🧾 Vente créée, ID :', sale_id);

  // Étape 2 : Ajouter les produits
   const commandeToHoutik = await db.allAsync(`SELECT * FROM commandeToHiboutik WHERE numCommande = ?`, [numeroCommande]);

    if (!commandeToHoutik) {
      return res.status(404).json({ success: false, message: 'Commande introuvable' });
    }
   for (const ligne of commandeToHoutik) {
  console.log(ligne.product_id, ligne.quantity, ligne.product_price);

    
      await axios.post(`https://${HIBOUTIK_ACCOUNT}.hiboutik.com/api/sales/add_product/`, {
        sale_id,
        product_id: parseInt(ligne.idProduit),
        size_id: 1,
        quantity:1,
        product_price: ligne.price
      }, { headers: { 'Content-Type': 'application/json', ...authHeader } });
 }

 console.log('📦 Lignes de vente générées pour Hiboutik :', sales_lines);

   
// if (!commande.appliqueRemise) {
// await axios.post(`https://${HIBOUTIK_ACCOUNT}.hiboutik.com/api/sales/add_global_discount`, {
//   sale_id,
//   type:2, 
// amount:5
// }, {
//   headers: {
//     'Content-Type': 'application/json',
//     Authorization: 'Basic ' + Buffer.from(`${HIBOUTIK_USERNAME}:${HIBOUTIK_PASSWORD}`).toString('base64')
//   }
// });
//   }
   
//  sales_lines,
//   comment: `Commande ${commande.numeroCommande} - ${commande.nomClient}`,
//        date: dateFormatee,
//  payment_mode_id: 1,
//  
   // ✅ Mise à jour en base
    await db.runAsync(
      `UPDATE commandes SET modePaiement = ? WHERE numeroCommande = ?`,
      ['hiboutik', numeroCommande]
    );

    res.json({
      success: true,
      message: 'Commande envoyée à Hiboutik avec succès',
      hiboutikId: sale_id
    });

  } catch (err) {
    console.error('❌ Erreur envoi Hiboutik', err?.response?.data || err);
    res.status(500).json({
      success: false,
      message: 'Erreur Hiboutik',
      detail: err?.response?.data || err.message
    });
  }
});

router.get('/produits/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const produit = await db.getAsync('SELECT description FROM produits WHERE id = ?', [id]);
    if (!produit) {
      return res.status(404).json({ message: 'Produit introuvable' });
    }
    res.json({ description: produit.description });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err });
  }
});

module.exports = router;
