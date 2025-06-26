const db = require('./db.js');




async function enregistrerCommande(commande) {

const {
  id = '',
  numeroCommande = '',
  client = {},
  creneau = '',
  pizzas = [],
  total = 0,
  date = new Date().toISOString(),
  modePaiement = null,
  appliqueRemise = 0,
  commentaire = ''
} = commande;
console.log('📦 INSERT commande :', {
      id,
      numeroCommande,
      nomClient: client.nom,
      telephone: client.telephone,
      creneau,
      pizzas,
      total,
      date,
      modePaiement,
      appliqueRemise,
      commentaire
    });

console.log('comm',commande);
 const stmt = `
  INSERT INTO commandes (numeroCommande, nomClient, telephone, creneau, pizzas, total, date, modePaiement,appliqueRemise, commentaire)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;


     // Exécution de l'insertion principale
  await new Promise((resolve, reject) => {
    db.run(
      stmt,
      [
        
        numeroCommande,
        client.nom,
        client.telephone,
        creneau,
        JSON.stringify(pizzas),
        total,
        date,
        modePaiement,
        appliqueRemise, 
        commentaire
      ],
      function (err) {
       if (err) reject(err);
          else resolve();
      }
    );
  });

let totalCommande = 0;
  for (const pizza of pizzas) {
  const produit = await db.getAsync(`SELECT prix FROM produits WHERE id = ?`, [pizza.pizzaId]);

  if (!produit) {
    console.warn(`Produit non trouvé en base pour l’ID ${pizza.pizzaId}`);
    continue; // ou throw si tu veux bloquer
  }

const prixBase = parseFloat(produit.prix);
  totalCommande += prixBase;


  await db.runAsync(
    `INSERT INTO commandeToHiboutik (idProduit, produit, sizeId, quantity, price, numCommande)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      parseInt(pizza.pizzaId),
      pizza.nom || 'Pizza',
      1,
      1,
      prixBase,
      numeroCommande
    ]
  );
console.log('🧾 Supplément inséré :', pizza.supplements);

  // Insérer les suppléments
 if (pizza.supplements?.length) {
  for (const s of pizza.supplements) {
    console.log(s);
    if (!s.ingredient_id || !s.prix) {
      console.warn('❌ Supplément mal formé :', s);
      continue;
    }
const nomSupplement = s.nom || s.ingredient || 'Supplément inconnu';
 let prixSupp = parseFloat(s.prix);
      if (!prixSupp || isNaN(prixSupp)) {
        // ⚠️ fallback si prix manquant → on va chercher en base
        const produitSupp = await db.getAsync(`SELECT prix FROM produits WHERE id = ?`, [s.ingredient_id]);
        prixSupp = parseFloat(produitSupp?.prix) || 0;
      }
totalCommande += prixSupp;

    await db.runAsync(
      `INSERT INTO commandeToHiboutik (idProduit, produit, sizeId, quantity, price, numCommande)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        parseInt(s.ingredient_id),
        nomSupplement,
        1,
        1,
        prixSupp,
        numeroCommande
      ]
    );
  }
}
}
 // Journalisation
  const detailsPizzas = pizzas.map((p, i) => {
    return `🍕 Pizza ${i + 1} : ${p.nom} - ${p.taille}, base ${p.base}, cuisson ${p.cuisson}`;
  }).join('\n');

  const action = `🆕 Nouvelle commande\n🧑 Client : ${client.nom}\n🕒 Créneau : ${creneau}\n🧾 N° : ${numeroCommande}\n🥐 Quantité : ${pizzas.length} pizza(s)\n${detailsPizzas}\n💶 Total : ${totalCommande.toFixed(2)} €`;

  logInterne(action);
  console.log('✅ Journalisation envoyée');

  return { id };
}





function getCommandes() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM commandes', [], (err, rows) => {
      if (err) reject(err);
      else {
        const commandes = rows.map(row => ({
          ...row,
          pizzas: JSON.parse(row.pizzas),
        }));
        resolve(commandes);
      }
    });
  });
}



async function mettreAJourCreneauCommande(id, nouveauCreneau) {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE commandes SET creneau = ? WHERE numeroCommande = ?`,
      [nouveauCreneau, id],
      function (err) {
        if (err) return reject(err);
     
        resolve();
      }
    );
  });
}

function logInterne(action, utilisateur = 'système') {
  const date = new Date().toISOString();
  db.run(
    `INSERT INTO logs_internes (action, utilisateur, date) VALUES (?, ?, ?)`,
    [action, utilisateur, date],
    (err) => {
      if (err) console.error('Erreur log interne :', err.message);
    }
  );
}


module.exports = {
  enregistrerCommande,
  getCommandes,
  mettreAJourCreneauCommande,
  logInterne
};