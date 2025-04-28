const db = require('../db');
const bcrypt = require('bcrypt');

const register = (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: "Champs requis manquants." });
  }

  bcrypt.hash(password, 10, (err, hash) => {
    if (err) return res.status(500).json({ message: "Erreur de hashage", error: err });

    const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    db.query(query, [username, email, hash], (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Erreur lors de l'inscription", error: err });
      }
      res.status(201).json({ message: "Utilisateur inscrit avec succès ✅" });
    });
  });
};

const login = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email et mot de passe requis." });
  }

  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err || results.length === 0) {
      return res.status(401).json({ message: "Email incorrect ou utilisateur introuvable." });
    }

    const user = results[0];
    bcrypt.compare(password, user.password, (err, match) => {
      if (err || !match) {
        return res.status(401).json({ message: "Mot de passe incorrect." });
      }

      res.status(200).json({ message: "Connexion réussie ✅", user: { user_id: user.user_id, username: user.username, email: user.email } });
    });
  });
};

module.exports = { register, login };
