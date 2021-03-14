const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const app = express();
const dcard = require('./dcard');

// app.use(cookieParser('MY SECRET'));
app.use(cookieParser('MY SECRET'));
app.use(bodyParser.json());
app.get('/', function (req, res) {
    res.sendFile('login.html', { root: __dirname });
});
app.get('/logout', dcard.logout);

app.post('/service/sessions', dcard.login);

app.get('/service/api/v2/dcard', dcard.middleware);
app.get('/service/api/v2/dcard', dcard.getDcard);

const port = 3000;
app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`)
})