const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const app = express();
const port = 3000;
const users =
    [{id: 0, email: 'ewef@gmail.com', password: 're45fea'},
    {id: 1, email: 'lk@gmail.com', password: 're45090a'},
    {id: 2, email: 'cs@gmail.com', password: '8885fea'}];
app.use(cors());
app.use(morgan('tiny'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.get('/:id', (req, res) => {
        res.send(users[req.params.id]);
})
app.get('/', (req, res) => {
    res.status(200).json(users);
})
app.post("/", (req, res) => {
    users.push(req.body);
    res.status(200).json(users);
})
app.put('/:id', (req, res) => {
    if (req.body.email) users[req.params.id].email = req.body.email;
    if (req.body.password) users[req.params.id].password = req.body.password;
    res.status(200).json(users);
})
app.delete('/:id', (req, res) => {
    users.splice(req.params.id, 1);
    res.status(200).json(users);
})
app.listen(port, () => {
    console.log(`Server is up and running on port:${port}`);
})