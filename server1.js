const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const {v4: gen} = require('uuid');
const bcrypt = require('bcrypt');
const app = express();
const port = 3000;
async function cryptMw(req, res, next) {
    req.body.password = bcrypt.hashSync(req.body.password, 5)
    next();
}
const users =
    [{id: gen(), email: 'ewef@gmail.com', password: 're45fea'},
    {id: gen(), email: 'lk@gmail.com', password: 're45090a'},
    {id: gen(), email: 'cs@gmail.com', password: '8885fea'}];
app.use(cors());
app.use(morgan('tiny'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.get('/:id', (req, res) => {
    const user = users.find(user => user.id === req.params.id);
    if (user) {
        res.status(200).json(user);
    }else{
        res.status(400).send('user not found');
    }
})
app.get('/', (req, res) => {
    res.status(200).json(users);
})
app.post("/", cryptMw, (req, res) => {
    req.body.id = gen();
    users.push(req.body);
    res.status(200).json(users);
})
app.put('/:id', cryptMw, (req, res) => {
    const user = users.find(user => user.id === req.params.id);
    if (req.body.email) user.email = req.body.email;
    if (req.body.password) user.password = req.body.password;
    res.status(200).json(user);
})
app.delete('/:id', (req, res) => {
    users.splice(req.params.id, 1);
    res.status(200).json(users);
})
app.post("/login", (req, res) => {
    let found = false;
    users.forEach(user => {
        if (req.body.email === user.email && bcrypt.compareSync(req.body.password, user.password)) {
            found = true;
            return res.status(200).send(`User is connected`);
        }
    })
    if (!found) res.status(400).send(`wrong credentials`);
})
app.listen(port, () => {
    console.log(`Server is up and running on port:${port}`);
})