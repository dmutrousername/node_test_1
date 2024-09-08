const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');

// User methods
const registerUser = (username, password, callback) => {
    const stmt = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)');
    stmt.run(username, password, function (err) {
        callback(err, this.lastID);
    });
    stmt.finalize();
};

const findUserByUsername = (username, callback) => {
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
        callback(err, row);
    });
};

// Review methods
const addReview = (bookTitle, reviewText, userId, callback) => {
    const stmt = db.prepare('INSERT INTO reviews (book_title, review_text, user_id) VALUES (?, ?, ?)');
    stmt.run(bookTitle, reviewText, userId, function (err) {
        callback(err, this.lastID);
    });
    stmt.finalize();
};

const deleteReview = (reviewId, callback) => {
    const stmt = db.prepare('DELETE FROM reviews WHERE id = ?');
    stmt.run(reviewId, function (err) {
        callback(err, this.changes);
    });
    stmt.finalize();
};

const updateReview = (reviewId, reviewText, callback) => {
    const stmt = db.prepare('UPDATE reviews SET review_text = ? WHERE id = ?');
    stmt.run(reviewText, reviewId, function (err) {
        callback(err, this.changes);
    });
    stmt.finalize();
};

module.exports = {
    registerUser,
    findUserByUsername,
    addReview,
    updateReview,
    deleteReview
};
