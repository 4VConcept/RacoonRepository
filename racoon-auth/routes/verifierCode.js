// racoon-auth/routes/verifierCode.js

const express = require('express');
const router = express.Router();
require('dotenv').config();

router.post('/', (req, res) => {
  const { code } = req.body;

  // console.log('📥 Code reçu :', code);
  // console.log('🔐 Code attendu (env) :', process.env.CODE_SECRET);

  if (!code) {
    return res.status(400).json({ success: false, message: 'Code manquant' });
  }

    const isValid = code.trim() === (process.env.CODE_SECRET || '').trim();

  return res.json({ success: isValid });
});
module.exports = router;