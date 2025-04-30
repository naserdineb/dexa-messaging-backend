// Modification test pour forcer un déploiement
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const path = require('path');
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(fileUpload());

// 🔥 Servir les fichiers statiques (uploads ET frontend)
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use('/frontend', express.static(path.join(__dirname, 'frontend')));

// Import des routes
const authRoutes = require('./routes/auth.routes');
const messageRoutes = require('./routes/messages.routes');

// 🔥 Brancher les routes API
app.use('/api', authRoutes);
app.use('/api/messages', messageRoutes);

// Page d'accueil (optionnelle, pour tester l'API)
app.get('/', (req, res) => {
  res.send('✅ Bienvenue sur l\'API Dexa Messaging');
});

// Démarrer le serveur
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ Serveur lancé sur http://localhost:${PORT}`);
});
