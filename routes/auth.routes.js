const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../db');

// Inscription
router.post('/register', async (req, res) => {
  try {
    console.log('💬 Requête reçue pour /register');
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

    res.status(201).json({ message: "Utilisateur inscrit avec succès ✅" });

  } catch (error) {
    console.error('❌ Erreur serveur (register) :', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// Connexion
router.post('/login', async (req, res) => {
  try {
    console.log('💬 Requête reçue pour /login');
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe sont requis' });
    }

    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

    if (users.length === 0) {
      return res.status(401).json({ message: 'Email incorrect ou inexistant ❌' });
    }

    const user = users[0];
    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return res.status(401).json({ message: 'Mot de passe incorrect ❌' });
    }

    await db.query('UPDATE users SET status = ? WHERE user_id = ?', ['online', user.user_id]);
    res.status(200).json({ message: `Bienvenue ${user.username} ✅`, user_id: user.user_id });

  } catch (error) {
    console.error('❌ Erreur serveur (login) :', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// Déconnexion
router.post('/logout', async (req, res) => {
  try {
    console.log('💬 Requête reçue pour /logout');
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({ message: 'ID utilisateur manquant' });
    }

    await db.query('UPDATE users SET status = ? WHERE user_id = ?', ['offline', user_id]);
    res.status(200).json({ message: 'Utilisateur déconnecté avec succès ✅' });

  } catch (error) {
    console.error('❌ Erreur serveur (logout) :', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

module.exports = router;
