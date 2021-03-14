const https = require('https');
const crypto = require('crypto');
const mysql = require('mysql');
const conn_config = {
    host: '192.168.0.11',
    port: 3306,
    user: 'dcard',
    password: 'PeYBhn9rEMrF6mrd',
    database: 'dcard'
};
class Database {
    constructor(config) {
        this.connection = mysql.createConnection(config);
    }
    query(sql, args) {
        return new Promise((resolve, reject) => {
            this.connection.query(sql, args, (err, rows) => {
                if (err)
                    return reject(err);
                resolve(rows);
            });
        });
    }
    close() {
        return new Promise((resolve, reject) => {
            this.connection.end(err => {
                if (err)
                    return reject(err);
                resolve();
            });
        });
    }
}
function sendRes(type, res) {
    const data = new Object;
    res.setHeader('Content-Type', 'application/json');
    if (type === 0) {
        data.error = "unauthorized_client";
        data.error_description = "Too Many Requests";
        res.status(429);
    }

    res.send(data);

}
function setCookie(res, cookies) {
    cookies.forEach(function (cookie) {
        const cookie_s = cookie.split(';');
        const options = {};//signed: true
        /*for (let i = 1; i < cookie_s.length; i++) {
            const [key, value] = cookie_s[i].split('=');
            if (value === undefined)
                options[key] = true;
            else
                options[key] = value;
        }*/

        const [key, value] = cookie_s[0].split('=');
        if (value !== undefined)
            res.cookie(key, value, options);
    });

}
function clearAllCookie(res, cookies) {
    cookies.forEach(function (cookie) {
        const cookie_s = cookie.split(';');
        const [key, value] = cookie_s[0].split('=');
        if (key !== "")
            res.clearCookie(key);
    });

}
function getCookieFromRes(resCookie) {
    let cookies = "";
    resCookie.forEach(function (cookie) {
        cookies += cookie.split(';')[0] + ";";
    });
    return cookies;
}
function getCookieFromReq(reqCookie) {
    let cookies = "";
    if (typeof reqCookie === 'object') {
        for (const [key, value] of Object.entries(reqCookie)) {
            cookies += key + "=" + value + ";";
        }
    }
    return cookies;
}
function httpRequest(url, method, params) {
    const myURL = new URL(url);
    const postData = JSON.stringify(params.content);
    const options = {
        hostname: myURL.hostname,
        port: 443,
        path: myURL.pathname,
        method: method,
        headers: {
            'content-type': 'application/json',
            'Cookie': params.cookie,
            'x-csrf-token': 'D62tuUmS-TK9FFxkVnFGp0ySxILQiDtOJ5rk'
        }
    }

    // console.log('header', params.cookie);

    return new Promise(function (resolve, reject) {
        callback = function (response) {
            var data = ''
            response.on('data', function (chunk) {
                data += chunk;
            });

            response.on('end', function () {
                const result = new Object;
                result.statusCode = response.statusCode;
                if (response.headers['set-cookie'] !== undefined)
                    result.setCookie = response.headers['set-cookie'];
                try {
                    result.data = JSON.parse(data);
                } catch (e) {
                    result.data = data;
                }
                if (result.statusCode.toString().match(/2\d{2}|3\d{2}/))
                    resolve(result);
                else
                    reject(result);

            });


        }

        const req = https.request(options, callback)
            .on('error', (e) => {
                reject(e);
            });
        if (postData !== undefined)
            req.write(postData);
        req.end();
    });
}
exports.login = function (req, res) {
    const cookies = '__cfduid=d974ea19ee2ed5ca852f5c066a00859e71614956874; _ga_C3J49QFLW7=GS1.1.1614963160.2.1.1614963173.0; _ga=GA1.1.2005185950.1614956876; __auc=9d7dcdb717802ee52fdb5b01c10; dcsrd=eiixKGqZqXAdUILaJ_9iJ78A; dcsrd.sig=N4ygsAld3Z4QI4Ms9pcV0iQNZSk; G_ENABLED_IDPS=google; tabsGroup=v2; __asc=ec92a564178034e33b29ef1a1af; ' + getCookieFromReq(req.cookies);
    // res.cookie('__cfduid', 'd974ea19ee2ed5ca852f5c066a00859e71614956874', { /*signed: true*/ });
    // res.cookie('_ga_C3J49QFLW7', 'GS1.1.1614963160.2.1.1614963173.0', { /*signed: true*/ });
    // res.cookie('_ga', 'GA1.1.2005185950.1614956876', { /*signed: true*/ });
    // res.cookie('__auc', '9d7dcdb717802ee52fdb5b01c10', { /*signed: true*/ });
    // res.cookie('dcsrd', 'eiixKGqZqXAdUILaJ_9iJ78A', { /*signed: true*/ });
    // res.cookie('dcsrd.sig', 'N4ygsAld3Z4QI4Ms9pcV0iQNZSk', { /*signed: true*/ });
    // res.cookie('G_ENABLED_IDPS', 'google', { /*signed: true*/ });
    // res.cookie('tabsGroup', 'v2', { /*signed: true*/ });
    // res.cookie('__asc', 'ec92a564178034e33b29ef1a1af', { /*signed: true*/ });
    setCookie(res, cookies.split(';'));
    const form = {
        'email': req.body.email,
        'password': req.body.password
    };

    httpRequest("https://www.dcard.tw/service/sessions", "POST", { content: form, cookie: cookies })
        .then(function (result) {
            if (result.setCookie !== undefined)
                setCookie(res, result.setCookie);
            res.status(result.statusCode).send(result.data);
        }).catch((err) => {
            console.log(err);
            if (err.statusCode !== undefined && err.data !== undefined)
                res.status(err.statusCode).send(err.data);
            else
                res.status(500).send(err);
        });
}
exports.middleware = function (req, res, next) {
    const now = Date.now();
    const key = 'abcdeg';
    let sig = "";
    if (typeof req.header('X-RateLimit-Remaining') === "string" && typeof req.header('X-RateLimit-Reset') === "string") {
        sig = crypto.createHmac('sha256', key)
            .update(req.header('X-RateLimit-Remaining') + '' + req.header('X-RateLimit-Reset'))
            .digest('hex');
    }

    let remaining = parseInt(req.header('X-RateLimit-Remaining'), 10);
    let resetTime = parseInt(req.header('X-RateLimit-Reset'), 10);

    if (sig === req.header('X-RateLimit-Sig') && remaining <= 0 && now < resetTime)
        sendRes(0, res);
    else //進資料庫判斷
    {
        console.log(req.connection.remoteAddress);
        const clientIP =
            (req.headers["x-forwarded-for"] || "").split(",").pop().replace(/^.*:/, "") ||
            req.connection.remoteAddress.replace(/^.*:/, "") ||
            req.socket.remoteAddress.replace(/^.*:/, "") ||
            req.connection.socket.remoteAddress.replace(/^.*:/, "");

        const database = new Database(conn_config);
        database.query('SELECT * FROM ratelimit WHERE ip = ?', [clientIP])
            .then(rows => {
                if (rows.length === 0) {
                    const date = new Date(now);
                    const datetime = date.getFullYear().toString().padStart(4, "0") + "-" + (date.getMonth() + 1).toString().padStart(2, "0") + "-" + date.getDate().toString().padStart(2, "0") + " " + date.getHours().toString().padStart(2, "0") + ":" + date.getMinutes().toString().padStart(2, "0") + ":" + date.getSeconds().toString().padStart(2, "0");
                    return database.query('INSERT INTO ratelimit SET ? ', { ip: clientIP, remaining: 1000, resetT: datetime })
                        .then(() => {
                            return database.query('SELECT * FROM ratelimit WHERE ip = ?', [clientIP]);
                        }).catch(err => {
                            throw new Error(err);
                        })
                }
                else
                    return database.query('SELECT * FROM ratelimit WHERE ip = ?', [clientIP]);

            })
            .then(rows => {
                remaining = parseInt(rows[0].remaining, 10);
                resetTime = parseInt(Date.parse(rows[0].resetT), 10);
                if (now >= resetTime) {
                    remaining = 999;
                    resetTime = now + (60 * 60 * 1000);
                } else if (remaining > 0)
                    remaining = remaining - 1;
                sig = crypto.createHmac('sha256', key)
                    .update(remaining + '' + resetTime)
                    .digest('hex');

                res.setHeader('X-RateLimit-Remaining', remaining + '');
                res.setHeader('X-RateLimit-Reset', resetTime + '');
                res.setHeader('X-RateLimit-Sig', sig);



                const date = new Date(resetTime);
                const datetime = date.getFullYear().toString().padStart(4, "0") + "-" + (date.getMonth() + 1).toString().padStart(2, "0") + "-" + date.getDate().toString().padStart(2, "0") + " " + date.getHours().toString().padStart(2, "0") + ":" + date.getMinutes().toString().padStart(2, "0") + ":" + date.getSeconds().toString().padStart(2, "0");

                return database.query('UPDATE ratelimit SET ? WHERE ip = ?', [{ remaining: remaining, resetT: datetime }, clientIP])
                    .then(() => {
                        if (parseInt(rows[0].remaining, 10) <= 0 && now < parseInt(Date.parse(rows[0].resetT), 10)) // forbidden
                            return false;
                        else // authorized
                            return true;

                    }).catch(err => {
                        throw new Error(err);
                    })

            }).then(authorized => {
                database.close();

                if (authorized)
                    next();
                else
                    sendRes(0, res);
            })
            .catch(err => {
                console.log(err);
                res.status(500).send(err);
            });


    }
};
exports.logout = function (req, res) {
    clearAllCookie(res, getCookieFromReq(req.cookies).split(';'));
    res.status(200).send();
}

exports.getDcard = function (req, res) {
    // console.log('req', req.cookies);
    httpRequest("https://www.dcard.tw/service/api/v2/dcard", "GET", { cookie: getCookieFromReq(req.cookies) })/*req.signedCookies*/
        .then((result) => {
            if (result.setCookie !== undefined)
                setCookie(res, result.setCookie);
            res.status(result.statusCode).send(result.data);
        }).catch(err => {
            console.log(err);
            clearAllCookie(res, getCookieFromReq(req.cookies).split(';'));
            // res.location('back').sendStatus(500);
            if (err.statusCode !== undefined && err.data !== undefined)
                res.status(err.statusCode).send(err.data);
            else
                res.status(500).send(err);
        });

}