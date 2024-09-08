const express = require('express');
const axios = require('axios');
const User = require("../models/User");
const router = express.Router();

// Endpoint to get popular books
router.get('/', async (req, res) => {
    try {
        // Making a request to Open Library API to get popular books
        const response = await axios.get('https://openlibrary.org/subjects/popular.json?limit=10'); // Adding a limit to restrict the number of books

        if (response.data && response.data.works) {
            // Returning the list of books in JSON format
            const books = response.data.works.map((book) => ({
                title: book.title,
                author: book.authors ? book.authors.map(author => author.name).join(', ') : 'Author not specified',
                cover_id: book.cover_id ? `https://covers.openlibrary.org/b/id/${book.cover_id}-L.jpg` : 'Cover not available',
                first_publish_year: book.first_publish_year || 'Year not specified'
            }));
            res.json(books);
        } else {
            res.status(404).json({ message: 'Books not found' });
        }
    } catch (error) {
        // Handling error if API request fails
        res.status(500).json({ message: 'API request error', error: error.message });
    }
});

// Endpoint to search for books by query
router.get('/search/', async (req, res) => {
    const { query } = req.query; // Getting search parameter from query string

    if (!query) {
        return res.status(400).json({ message: 'Query parameter "query" is required' });
    }

    try {
        // Making a request to Open Library API to search for books
        const response = await axios.get(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`);

        if (response.data && response.data.docs) {
            // Returning the list of books in JSON format
            const books = response.data.docs.map((book) => ({
                title: book.title,
                author: book.author_name ? book.author_name.join(', ') : 'Author not specified',
                isbn: book.isbn ? book.isbn[0] : 'ISBN not specified',
                first_publish_year: book.first_publish_year || 'Year not specified'
            }));
            res.json(books);
        } else {
            res.status(404).json({ message: 'Books not found' });
        }
    } catch (error) {
        // Handling error if API request fails
        res.status(500).json({ message: 'API request error', error: error.message });
    }
});

// Endpoint to get a book by ISBN
router.get('/:isbn', async (req, res) => {
    const { isbn } = req.params; // Getting ISBN from URL parameters

    try {
        // Making a request to Open Library API
        const response = await axios.get(`https://openlibrary.org/isbn/${isbn}.json`);

        if (response.data) {
            // Returning book data in JSON format
            res.json(response.data);
        } else {
            res.status(404).json({ message: 'Book not found' });
        }
    } catch (error) {
        // Handling error if API request fails
        res.status(404).json({ message: 'Book not found or API request error', error: error.message });
    }
});

// Endpoint to get books by author
router.get('/author/:authorName', async (req, res) => {
    const { authorName } = req.params; // Getting author name from URL parameters

    try {
        // Making a request to Open Library API to search for books by author
        const response = await axios.get(`https://openlibrary.org/search.json?author=${encodeURIComponent(authorName)}`);

        if (response.data && response.data.docs) {
            // Returning the list of books in JSON format
            const books = response.data.docs.map((book) => ({
                title: book.title,
                author: book.author_name ? book.author_name.join(', ') : 'Author not specified',
                isbn: book.isbn ? book.isbn[0] : 'ISBN not specified',
                first_publish_year: book.first_publish_year || 'Year not specified'
            }));
            res.json(books);
        } else {
            res.status(404).json({ message: 'Books not found' });
        }
    } catch (error) {
        // Handling error if API request fails
        res.status(500).json({ message: 'API request error', error: error.message });
    }
});

// Endpoint to get books by title
router.get('/title/:title', async (req, res) => {
    const { title } = req.params; // Getting book title from URL parameters

    try {
        // Making a request to Open Library API to search for books by title
        const response = await axios.get(`https://openlibrary.org/search.json?title=${encodeURIComponent(title)}`);

        if (response.data && response.data.docs) {
            // Returning the list of books in JSON format
            const books = response.data.docs.map((book) => ({
                title: book.title,
                author: book.author_name ? book.author_name.join(', ') : 'Author not specified',
                isbn: book.isbn ? book.isbn[0] : 'ISBN not specified',
                first_publish_year: book.first_publish_year || 'Year not specified'
            }));
            res.json(books);
        } else {
            res.status(404).json({ message: 'Books not found' });
        }
    } catch (error) {
        // Handling error if API request fails
        res.status(500).json({ message: 'API request error', error: error.message });
    }
});

// Endpoint to get book review by ISBN
router.get('/review/:isbn', async (req, res) => {
    const { isbn } = req.params; // Getting ISBN from URL parameters

    try {
        // Making a request to Open Library API for book data
        const response = await axios.get(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`);

        const bookData = response.data[`ISBN:${isbn}`];

        if (bookData) {
            const bookInfo = {
                title: bookData.title || 'Title not specified',
                authors: bookData.authors ? bookData.authors.map(author => author.name).join(', ') : 'Author not specified',
                description: bookData.description ? bookData.description.value : 'Description not available',
                averageRating: bookData.ratings_average || 'Rating not available',
                ratingsCount: bookData.ratings_count || 0,
                // Open Library API does not provide reviews directly, so this field will be empty
                reviews: 'Reviews not available'
            };
            res.json(bookInfo);
        } else {
            res.status(404).json({ message: 'Book not found' });
        }
    } catch (error) {
        // Handling error if API request fails
        res.status(500).json({ message: 'API request error', error: error.message });
    }
});


// Add review endpoint
router.post('/review/add', (req, res) => {
    const { bookTitle, reviewText, username } = req.body;

    User.findUserByUsername(username, (err, user) => {
        if (err || !user) {
            return res.status(404).json({ error: 'User not found' });
        }

        User.addReview(bookTitle, reviewText, user.id, (err, reviewId) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to add review' });
            }
            res.status(201).json({ reviewId });
        });
    });
});

// Update review endpoint
router.put('/review/update/:id', (req, res) => {
    const reviewId = parseInt(req.params.id, 10);
    const { reviewText } = req.body;

    User.updateReview(reviewId, reviewText, (err, changes) => {
        if (err || changes === 0) {
            return res.status(500).json({ error: 'Failed to update review' });
        }
        res.status(200).json({ message: 'Review updated successfully' });
    });
});

// Delete review endpoint
router.delete('/review/delete/:id', (req, res) => {
    const reviewId = parseInt(req.params.id, 10);

    User.deleteReview(reviewId, (err, changes) => {
        if (err || changes === 0) {
            return res.status(500).json({ error: 'Failed to delete review' });
        }
        res.status(200).json({ message: 'Review deleted successfully' });
    });
});

module.exports = router;
