const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./users.db');
const { promisify } = require('util');

// Promisifier get et run
db.getAsync = promisify(db.get).bind(db);
db.runAsync = promisify(db.run).bind(db);
db.allAsync = promisify(db.all).bind(db);


db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT
  )`);


db.run(`CREATE TABLE IF NOT EXISTS logs_internes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action TEXT NOT NULL,
    utilisateur TEXT NOT NULL,
    date TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS commandes (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
  numeroCommande TEXT,
  nomClient TEXT,
  telephone TEXT,
  creneau TEXT,
  pizzas TEXT,
  total REAL,
  date TEXT,
  modePaiement TEXT,
  appliqueRemise INTEGER DEFAULT 0,
  commentaire TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS commandeToHiboutik (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  idProduit INTEGER NOT NULL,
  produit TEXT NOT NULL,
  sizeId INTEGER DEFAULT 1,
  quantity INTEGER DEFAULT 1,
  price REAL NOT NULL,
  numCommande TEXT NOT NULL
 )`);


  
  db.run(`CREATE TABLE IF NOT EXISTS compteurCommande (
  date TEXT PRIMARY KEY,
  compteur INTEGER DEFAULT 0
 )`);

  db.run(`CREATE TABLE IF NOT EXISTS pizzas_commande (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    commandeId INTEGER,
    nom TEXT,
    taille TEXT,
    base TEXT,
    cuisson TEXT,
    FOREIGN KEY (commandeId) REFERENCES commandes(id)
  )`);
  
db.run(`CREATE TABLE IF NOT EXISTS parametres (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  heureDebut TEXT,
  heureFin TEXT,
  maxPizza INTEGER,
  delta INTEGER,
  heureRemise TEXT,
  txRemise INTEGER,
  MaxMoy INTEGER,
  MaxGrd INTEGER
)`);

db.run(`CREATE TABLE IF NOT EXISTS produits (
  id INTEGER PRIMARY KEY,
  nom TEXT,
  prix REAL,
  categorie_id INTEGER,
  image_url TEXT,
  description TEXT
)`);
db.run(`CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY,
  nom TEXT,
  parent_id INTEGER,
  enabled INTEGER,
  couleur_fond TEXT,
  couleur_texte TEXT,
  position INTEGER
)`);

// Insertion seulement s'il n'existe aucune ligne
  db.get('SELECT COUNT(*) AS count FROM parametres', (err, row) => {
    if (err) {
      console.error('Erreur lors de la vérification de la table parametres', err);
    } else if (row.count === 0) {
      db.run(`
        INSERT INTO parametres (heureDebut, heureFin, maxPizza, delta, heureRemise, txRemise, MaxMoy, MaxGrd)
        VALUES ('18:00', '23:30', 6, 1, '17:00', 5, 30, 30)
      `, (err) => {
        if (err) console.error('Erreur lors de l’insertion par défaut dans parametres', err);
        else console.log('✅ Valeurs par défaut insérées dans parametres');
      });
    }
  });
});




module.exports = db;
