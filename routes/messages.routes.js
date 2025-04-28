const express = require('express');
const router = express.Router();
const db = require('../db');
const path = require('path');
const fs = require('fs');

// Liste des utilisateurs
router.get('/users', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT user_id, username, status FROM users');
    res.json(rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs :', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// Envoyer un message
router.post('/send', async (req, res) => {
  try {
    const { user_id, content } = req.body;
    let file_path = null;

    if (req.files && req.files.file) {
      const file = req.files.file;
      const uploadPath = path.join(__dirname, '../public/uploads', file.name);
      await file.mv(uploadPath);
      file_path = '/uploads/' + file.name;
    }

    await db.query(
      'INSERT INTO messages (user_id, content, file_path) VALUES (?, ?, ?)',
      [user_id, content, file_path]
    );

    res.json({ message: 'Message envoyé ✅' });
  } catch (error) {
    console.error('Erreur lors de l\'envoi du message :', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// Récupérer tous les messages
router.get('/all', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT m.*, u.username
      FROM messages m
      JOIN users u ON m.user_id = u.user_id
      ORDER BY m.created_at ASC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des messages :', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

module.exports = router;
