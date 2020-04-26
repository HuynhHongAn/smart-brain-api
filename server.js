const express = require('express')
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt')
const cors = require('cors')
const knex = require('knex')

const app = express()
app.use(bodyParser.json())
app.use(cors())

const db = knex({
    client: 'pg',
    // version: '7.2',
    connection: {
        host : '127.0.0.1',
        user : 'postgres',
        password : '123456',
        database : 'smart-brain'
    }
});


const database = {
    users: [
        {
            id: "123",
            name: "John",
            email: "john@gmail.com",
            password: "123456",
            entries: 0,
            joined: new Date()
        },
        {
            id: "223",
            name: "Bunny",
            email: "bunny@gmail.com",
            password: "123",
            entries: 0,
            joined: new Date()
        }
    ]
}

const login = [
    {
        "id": "987",
        "hash": "",
        "email": "john@gmail.com"
    }
]

app.get('/', (req, res) => {
    res.json(database.users)
})

app.post('/signin', (req, res) => {
    let isFound = false
    database.users.forEach(user => {
        if (user.email === req.body.email && user.password === req.body.password) {
            isFound = true
            res.json(user)
        }
    })
    if (!isFound) {
        res.status(400).json('error loggin in')
    }
})

app.put('/signup', (req, res) => {
    const {name, email, password} = req.body
    db('users')
        .returning("*")
        .insert({
        name: name,
        email: email,
        joined: new Date(),

        })
        .then(users => {
            console.log(users[0])
        })
        .catch(err => res.status(400).json("unable to sign up"))
    res.json(database.users[database.users.length - 1])
})

app.get("/profile/:id", (req, res) => {
    const {id} = req.params
    let found = false
    db
        .select("*")
        .from("users")
        .where({
            id: id
        })
        .then(users => {
            if (users.length) {
                res.json(users[0])
            } else {
                res.status(400).json("not found")
            }
        })
        .catch(err => res.status(400).json("Error getting profile", err))
})

app.put('/image', (req, res) => {
    const {id} = req.body
    let found = false
    database.users.forEach(user => {
        if (user.id === id) {
            found = true
            user.entries++
            res.json(user.entries)
        }
    })
    db
        .table("users")
        .returning("*")
        .where('id', '=', id)
        .increment({
            entries: 1,
        })
        .then(users => {
            if (users.length) {
                res.json(users[0])
            } else {
                res.status(400).json("User not found")
            }
        })
})

app.listen(3000, ()=> {
    console.log("app is running on port 3000")
})

/*
/ --> res = this is working
/signin --> POST = success/fail
/register --> POST = user
/profile/:userId --> GET = user
/image --> PUT user
 */
