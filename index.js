const express = require('express');
const pool = require('./db');
const cors = require('cors');
const app = express();
const port = process.env.PORT  || 3000 || 5000;


app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000', // or '*' for any origin (not recommended for production)
}));

app.get('/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM users');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({error: err.message});
    }
});

app.post('/users', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
            [name, email, password]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({error: err.message});
    }
});

app.post('/login', async (request, response) => {

    const { email, password } = request.body;

    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (result.rows.length === 0){
            return response.status(401).json({message: 'Nieprawidłowy email lub hasło.'});
        }

        const user = result.rows[0];

        if (user.password !== password) {
            return response.status(401).json({message: 'Nieprawidłowy email lub hasło.'});
        }

        response.json({
            message: 'Zalogowano pomyślnie',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        console.error('Błąd podczas logowania: ', error);
        response.status(500).json({message: 'Błąd serwera'});
    }
    
});

app.get('/', (req, res) => {
    res.json({message: "Działa Render.com!"});
});

app.listen(port, () => {
    console.log(`Serwer działa na porcie ${port}`); 
});