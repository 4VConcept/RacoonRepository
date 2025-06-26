const bcrypt = require('bcrypt');
const db = require('./db');

async function createUser(email, password) {
  const hashed = await bcrypt.hash(password, 10);
  return new Promise((resolve, reject) => {
    db.run(`INSERT INTO users (email, password) VALUES (?, ?)`, [email, hashed], function(err) {
      if (err) reject(err);
      else resolve(this.lastID);
    });
  });
}

async function validateUser(email, password) {
  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, row) => {
      if (err) {
        return reject(err); // 🚨 Erreur SQL
      }
      if (!row) {
        return resolve(false); // ❌ Utilisateur non trouvé
      }

      try {
         
        const match = await bcrypt.compare(password, row.password);
        resolve(match); // ✅ true si ok, false sinon
      } catch (compareError) {
        reject(compareError); // 🚨 Erreur de bcrypt
      }
    });
  });
}


async function updateUser(email, newPassword) {
  const hashed = await bcrypt.hash(newPassword, 10);
  return new Promise((resolve, reject) => {
    db.run(`UPDATE users SET password = ? WHERE email = ?`, [hashed, email], function(err) {
      if (err) reject(err);
      else resolve(this.changes > 0);
    });
  });
}
// eslint-disable-next-line no-undef
module.exports =  { createUser, validateUser, updateUser };
