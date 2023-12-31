require('dotenv').config()
const Shopify = require('shopify-node-api')
const express = require('express')
const app = express()
const request = require('request-promise')
let port = 8081

const shopify = new Shopify({
    shop: 'dev-demo-tcd', // replace with your shop name
    shopify_api_key: process.env.SHOPIFY_API_KEY,
    shopify_shared_secret: process.env.SHOPIFY_SECRET_KEY,
    shopify_scope: 'read_products',
    redirect_uri: 'http://localhost:8081/auth/callback',
    nonce: '' // you must provide a randomly selected value unique for each authorization request
})

app.get('/', (req, res) => {
    res.send("Hello world")
})

app.get('/redirect', (req, res) => {
    res.sendFile(__dirname + "/redirect/index.html")
})

app.get('/auth', (req, res) => {
    const authURL = shopify.buildAuthURL()
    res.redirect(authURL)
})

app.get('/auth/callback', (req, res) => {
    shopify.exchange_temporary_token(req.query, (err, data) => {
        res.send(data)
    })
})

const serverWithSocket = app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
    const io = require('socket.io')(serverWithSocket); //? invoking the func also something like func()
    io.on('connection', (socket) => {
        socket.on('conn', () => {
            fetch("https://checkip.amazonaws.com/").then(res => res.text()).then(data => {
                request('http://ip-api.io/api/json/' + data)
                .then(response => {
                    response = JSON.parse(response)
                    console.log(response)
                    socket.emit('result', response['country_name'], response['region_code'], response['region_name'])
                })
                .catch(err => console.log(err))
            })
        })
    })
})