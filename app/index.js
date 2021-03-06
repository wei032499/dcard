const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const app = express();
const dcard = require('./dcard');

app.use(cookieParser('MY SECRET'));
app.use(bodyParser.json());
app.get('/', function (req, res) {
    res.sendFile('login.html', { root: __dirname });
});

app.post('/service/sessions', dcard.login);

app.get('/service/signout', dcard.logout);

app.get('/service/api/v2/me', dcard.middleware);
app.get('/service/api/v2/me', dcard.getMe);

app.get('/service/api/v2/dcard', dcard.middleware);
app.get('/service/api/v2/dcard', dcard.getDcard);

app.get('/service/api/v2/me/friends', dcard.middleware);
app.get('/service/api/v2/me/friends', dcard.getFriends);

app.get('/service/api/v2/me/messages', dcard.middleware);
app.get('/service/api/v2/me/messages', dcard.getMessages);

const port = 1130;
app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`)
})