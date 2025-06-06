const mysql = require('mysql2/promise');

const pool = mysql.createPool({
host: 'auth-db1057.hstgr.io',
  user: 'u744567837_racoon',
  password: '%10^bD0hlc1ZOdyP',
  database: 'u744567837_racoonpizza',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Fonction d'initialisation
async function initDatabase() {
  const db = await pool.getConnection();

  try {
    // Création des tables
    await db.query(`CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) UNIQUE,
      password TEXT
    )`);

    await db.query(`CREATE TABLE IF NOT EXISTS logs_internes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      action TEXT NOT NULL,
      utilisateur TEXT NOT NULL,
      date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    await db.query(`CREATE TABLE IF NOT EXISTS commandes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      numeroCommande VARCHAR(50),
      nomClient TEXT,
      telephone TEXT,
      creneau TEXT,
      pizzas TEXT,
      total DECIMAL(10,2),
      date TEXT,
      modePaiement TEXT,
      appliqueRemise TINYINT DEFAULT 0
    )`);

    await db.query(`CREATE TABLE IF NOT EXISTS commandeToHiboutik (
      id INT AUTO_INCREMENT PRIMARY KEY,
      idProduit INT NOT NULL,
      produit TEXT NOT NULL,
      sizeId INT DEFAULT 1,
      quantity INT DEFAULT 1,
      price DECIMAL(10,2) NOT NULL,
      numCommande VARCHAR(50) NOT NULL
    )`);

    await db.query(`CREATE TABLE IF NOT EXISTS compteurCommande (
      date VARCHAR(20) PRIMARY KEY,
      compteur INT DEFAULT 0
    )`);

    await db.query(`CREATE TABLE IF NOT EXISTS pizzas_commande (
      id INT AUTO_INCREMENT PRIMARY KEY,
      commandeId INT,
      nom TEXT,
      taille TEXT,
      base TEXT,
      cuisson TEXT,
      FOREIGN KEY (commandeId) REFERENCES commandes(id)
    )`);

    await db.query(`CREATE TABLE IF NOT EXISTS parametres (
      id INT AUTO_INCREMENT PRIMARY KEY,
      heureDebut TEXT,
      heureFin TEXT,
      maxPizza INT,
      delta INT,
      heureRemise TEXT,
      txRemise INT
    )`);

    await db.query(`CREATE TABLE IF NOT EXISTS produits (
      id INT PRIMARY KEY,
      nom TEXT,
      prix DECIMAL(10,2),
      categorie_id INT,
      image_url TEXT,
      description TEXT
    )`);

    await db.query(`CREATE TABLE IF NOT EXISTS categories (
      id INT PRIMARY KEY,
      nom TEXT,
      parent_id INT,
      enabled TINYINT,
      couleur_fond TEXT,
      couleur_texte TEXT,
      position INT
    )`);

    // Insertion valeurs par défaut dans parametres
    const [rows] = await db.query(`SELECT COUNT(*) AS count FROM parametres`);
    if (rows[0].count === 0) {
      await db.query(`
        INSERT INTO parametres (heureDebut, heureFin, maxPizza, delta, heureRemise, txRemise)
        VALUES ('18:00', '23:30', 6, 1, '17:00', 5)
      `);
      console.log('✅ Valeurs par défaut insérées dans parametres');
    }
  } catch (err) {
    console.error('❌ Erreur lors de l\'initialisation MySQL :', err);
  } finally {
    db.release();
  }
}

// Appel au démarrage
initDatabase();

module.exports = pool;
