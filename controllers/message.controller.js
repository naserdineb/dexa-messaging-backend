const db = require('../db');

const sendMessage = (req, res) => {
  const { user_id, content } = req.body;
  const file_path = req.file ? '/uploads/' + req.file.filename : null;

  if (!user_id || (!content && !file_path)) {
    return res.status(400).json({ message: 'Champs manquants' });
  }

  db.query(
    'INSERT INTO messages (user_id, content, file_path) VALUES (?, ?, ?)',
    [user_id, content || '', file_path],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Erreur lors de l’envoi', error: err });
      res.status(201).json({ message: 'Message envoyé avec succès ✅' });
    }
  );
};

const getMessages = (req, res) => {
  const query = `
    SELECT messages.*, users.username
    FROM messages
    JOIN users ON messages.user_id = users.user_id
    ORDER BY messages.timestamp DESC
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: 'Erreur récupération messages', error: err });
    res.status(200).json(results);
  });
};

const getUsers = (req, res) => {
  db.query('SELECT user_id, username, email FROM users', (err, results) => {
    if (err) return res.status(500).json({ message: 'Erreur récupération utilisateurs', error: err });
    res.status(200).json(results);
  });
};

module.exports = { sendMessage, getMessages, getUsers };
