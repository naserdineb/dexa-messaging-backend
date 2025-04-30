const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../db');

// ✅ Route d'inscription
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Tous les champs sont obligatoires' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

    if (existingUser.length > 0) {
      return res.status(409).json({ message: 'Email déjà utilisé' });
    }

    await db.query(
      'INSERT INTO users (username, email, password, status) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, 'offline']
    );

    res.status(201).json({ message: 'Utilisateur inscrit avec succès ✅' });

  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// ✅ Exporte bien le routeur
module.exports = router;
