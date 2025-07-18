require('dotenv').config({path:'./.env'});
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const apiRoutes=require('./routes/api');
const app = express();

// Middleware
app.use(cors({
      origin: ["http://localhost:5500", "https://your-netlify-site.netlify.app"],
    credentials: false,
}));
app.use(express.json());
app.use('/api',apiRoutes);
app.use('/auth', require('./routes/auth'));
// DB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

// Routes


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


