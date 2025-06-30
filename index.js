const express = require('express');
const pool = require('./db');
const app = express();
const port = process.env.PORT  || 3000;


app.use(express.json());

app.get('/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM users');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({error: err.message});
    }
});

app.get('/', (req, res) => {
    res.json({message: "Działa Render.com!"});
});

app.listen(port, () => {
    console.log(`Serwer działa na porcie ${port}`); 
});