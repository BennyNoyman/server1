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
app.get('/user/:id', async (req, res) => {
    const users = await read('./users.json');
    const user = users.find(user => user.id === req.params.id);
    if (user) {
        res.status(200).json(user);
    }else{
        res.status(400).send('user not found');
    }
})
app.get('/users', async(req, res) => {
    const users = await read('./users.json');
    res.status(200).json(users);
})
app.post("/user", validate, cryptMw, async (req, res) => {
    const users = await read('./users.json');
    req.body.id = gen();
    users.push(req.body);
    await write('./users.json', users);
    res.status(200).json(users);
})
app.put('/email&password/:id',validate, cryptMw, async (req, res) => {
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
app.delete('/user/:id', async (req, res) => {
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
app.put('/product/:id', async (req, res) => {
    const users = await read('./users.json');
    const randProduct = Math.round(Math.random() * 101)
    const user = users.find(user => user.id === req.params.id);
    const productResponse = await fetch('https://dummyjson.com/products/' + randProduct);
    const updatedUser = { ...user};
    updatedUser.product = await productResponse.json();
    users.push(updatedUser);
    await write('./users.json', users);
    console.log(await fetch('https://jsonplaceholder.typicode.com/users', {method: 'post', body: JSON.stringify(updatedUser)}));
    res.status(200).send(updatedUser);
})
app.listen(port, () => {
    console.log(`Server is up and running on port:${port}`);
})