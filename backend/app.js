const express = require('express');
const app = express();
require('dotenv').config();
const path = require('path');
const cors = require('cors');

app.use(express.json({limit:'10mb'}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));


const userRoutes = require('./routes/userRoutes');
const recipeRoutes = require('./routes/recipeRoutes');
app.use(cors({
  origin: (origin, callback) => {
    callback(null, true);
  },
  methods: "GET,POST,PUT,DELETE,OPTIONS",
  allowedHeaders: "Content-Type,Authorization",
  credentials: false
}));


app.use('/images', express.static(path.join(__dirname, '..', 'images')));

app.use('/api/users', userRoutes);
app.use('/api/recipes', recipeRoutes);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor`);
});
