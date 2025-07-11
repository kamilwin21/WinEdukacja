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
        const result = await pool.query(
            "SELECT u.email, u.created_at, u.first_name, u.last_name, u.is_active, c.name AS class_name, c.school_year, " +
            "r.name AS role_name " +
            "FROM users u JOIN student_class sc ON u.id = sc.user_id " +
            "JOIN user_roles ur ON u.id = ur.user_id " +
            "LEFT JOIN classes c ON sc.class_id = c.id " +
            "LEFT JOIN roles r ON ur.role_id = r.id"
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({error: err.message});
    }

//     SELECT
//   u.id,
//   u.first_name,
//   u.last_name,
//   u.email,
//   c.name AS class_name,
//   c.school_year
// FROM users u
// JOIN user_roles ur ON u.id = ur.user_id
// JOIN roles r ON ur.role_id = r.id
// LEFT JOIN student_class sc ON u.id = sc.user_id
// LEFT JOIN classes c ON sc.class_id = c.id
// WHERE r.name = 'Uczeń';
});

app.post('/users', async (req, res) => {
    const { email, password, first_name, last_name } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO users (email, password, first_name, last_name, is_active) VALUES ($1, $2, $3, $4, false) RETURNING *',
            [email, password, first_name, last_name]
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
                first_name: user.first_name,
                last_name: user.last_name
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