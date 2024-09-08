const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/book');

// Middleware
app.use(bodyParser.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);

// Error handling
app.use((req, res) => {
    res.status(404).send('Not Found');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});