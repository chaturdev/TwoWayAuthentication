const express = require('express');
const mongoose = require("mongoose");
const logger = require('./utils/logger');
const url = require('url');
const { uuid } = require('uuidv4');
const log = logger();
const app = express();
const senderMailId = process.argv[2];
const passward = process.argv[3];

if (!senderMailId && !passward) {
    log.info(`sendar email and password is not passed can't run server`);
    process.exit(0);
}
const mailer = require('./utils/mailer')(senderMailId, passward, log);
require('./model/User');
mongoose.connect('mongodb://localhost:27017/twowayauth', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

mongoose.connection.on('error', (err) => {
    log.error("Mongoose Connection error" + err.message);
});

mongoose.connection.once('open', () => {
    log.info("MongoDB connected");
});
require('./model/User');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const User = mongoose.model('User');

app.post('/create', async (req, res, next) => {
    if (!req.body.email && !req.body.password) return next(new Error("email, password not provided"));
    const instance = new User({
        email: req.body.email,
        password: req.body.password
    });
    short = JSON.stringify(instance._id)
    const id = short.slice(short.length - 7, short.length - 1)
    instance.id = id;
    await instance.save()
    res.send({
        message: `user is  created`
    });

})
app.post('/login', async (req, res, next) => {
    if (!req.body.email && !req.body.password) return next(new Error("email, password not provided"));
    let usr = await User.findOne({ email: req.body.email });
    if (usr.password == req.body.password) {
        let token = uuid();
        usr.twoWayKey = token;
        await usr.save();
        await mailer(req.body.email ,token)
        res.send({
            message: `Please check your mail for two way authentication`
        });
    } else {
        return next(new Error("password not matched!!"));
    }
})


app.get('/verify', async (req, res, next) => {
    const queryObject = url.parse(req.url, true).query;
    if (!queryObject.token) return next(new Error("token is not passed"));
    let usr = await User.findOne({ twoWayKey: queryObject.token });
    if (usr) {
        log.info("Token is matched");
        res.send(usr);
    } else {
        log.info("Passed token is not matched");
        res.send("Passed token is not matched").status(403);
    }
})



app.use(function (req, res, next) {
    console.log(req.url)
    log.error("page not found:", req.url);
    res.status(404).send('page not found');
});

app.use(function (err, req, res, next) {
    if (typeof err == 'string') {
        var tempErr = err;
        err = {}
        err.status = 400;
        err.message = tempErr;
    }
    if (!err.status)
        err.status = 500;
    if (err.noStackTrace)
        log.error("handled server error: status: %d: ",
            err.status || 500, err.message);
    else
        log.error("handled server error: status: %d: ",
            err.status || 500, err.stack, err);
    res.status(err.status).send(err.message);
});

app.listen(process.env.PORT || 8000, () => {
    log.info('Listening on port 8000');
})