const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const {v4: gen} = require('uuid');
const bcrypt = require('bcrypt');
const {isEmail: validEmail} = require('validator');
const {isStrongPassword: validPassword} = require('validator');
const {readFile: read} = require('jsonfile');
const {writeFile: write} = require('jsonfile');
const app = express();
const port = 3000;
function cryptMw(req, res, next) {
    req.body.password = bcrypt.hashSync(req.body.password, 5)
    next();
}
function validate(req, res, next) {
    if (validEmail(req.body.email) && validPassword(req.body.password)) {
        next();
    }else{
        res.status(400).send(`invalid email or password`);
    }
}
app.use(cors());
app.use(morgan('tiny'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.get('/:id', async (req, res) => {
    const users = await read('./users.json');
    const user = users.find(user => user.id === req.params.id);
    if (user) {
        res.status(200).json(user);
    }else{
        res.status(400).send('user not found');
    }
})
app.get('/', async(req, res) => {
    const users = await read('./users.json');
    res.status(200).json(users);
})
app.post("/", validate, cryptMw, async (req, res) => {
    const users = await read('./users.json');
    console.log(users);
    req.body.id = gen();
    users.push(req.body);
    await write('./users.json', users);
    res.status(200).json(users);
})
app.put('/:id',validate, cryptMw, async (req, res) => {
    const users = await read('./users.json');
    const user = users.find(user => user.id === req.params.id);
    if (req.body.email) {
        user.email = req.body.email;
    }
    if (req.body.password) {
        user.password = req.body.password;
    }
    await write('./users.json', users);
    res.status(200).json(user);
})
app.delete('/:id', async (req, res) => {
    const users = await read('./users.json');
    const userIndex = users.findIndex(user => req.params.id === user.id);
    users.splice(userIndex, 1);
    res.status(200).json(users);
})
app.post("/login", async (req, res) => {
    const users = await read('./users.json');
    let user = users.find(user => req.body.email === user.email)
    if ( user && bcrypt.compareSync(req.body.password, user.password)) {
        res.status(200).send(`User is connected`);
    }else {
        res.status(400).send(`wrong credentials`);
    }
})
app.listen(port, () => {
    console.log(`Server is up and running on port:${port}`);
})