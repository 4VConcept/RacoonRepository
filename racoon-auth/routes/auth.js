const express = require('express');
const { validateUser, updateUser } = require('../userService');
const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
 try {
    const isValid = await validateUser(email, password);
    if (isValid) {
      res.status(200).json({ message: 'Connexion réussie' });
    } else {
      res.status(401).json({ message: 'Identifiants incorrects' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.put('/update-user', async (req, res) => {
  const { email, newPassword } = req.body;
  const updated = await updateUser(email, newPassword);
  if (updated) {
    res.status(200).json({ message: 'Utilisateur mis à jour' });
  } else {
    res.status(400).json({ message: 'Erreur lors de la mise à jour' });
  }
});

// eslint-disable-next-line no-undef
module.exports = router;
