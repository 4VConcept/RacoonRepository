const { createUser } = require('./userService');

const email = 'admin@racoon.fr';
const password = 'secret123';

createUser(email, password)
  .then(id => {
    console.log(`✅ Utilisateur créé avec ID ${id}`);
  })
  .catch(err => {
    console.error('❌ Erreur lors de la création de l’utilisateur :', err.message);
  });
