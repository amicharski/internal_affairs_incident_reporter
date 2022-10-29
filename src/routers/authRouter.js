const express = require('express');
const debug = require('debug')('app:authRouter');
const passport = require('passport');
const bcrypt = require('bcrypt');
const { MongoClient, ObjectID } = require('mongodb');

const authRouter = express.Router();

authRouter.route('/change_password').put(async (req, res) => {
    const { password } = req.body;
    const url = 'mongodb://127.0.0.1:27017'; // process.env.DBURL
    const dbName = 'political_debate_dev';

    let client;
    try {
        const db = client.db(dbName);
        client = await MongoClient.connect(url);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const results = await db.collection('Users');
    } catch(error){
        debug(error);
    }
    client.close();
});

authRouter.route('/register').post((req, res) => {
    const { username, password } = req.body;
    const url = 'mongodb://127.0.0.1:27017'; // process.env.DBURL
    const dbName = 'political_debate_dev';

    (async function addUser(){
        let client;
        try {
            client = await MongoClient.connect(url);

            const db = client.db(dbName);

            let user;
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const duplicates = await db.collection('Users')
                .findOne({username: username});

            if(duplicates !== null){
                res.send("User already exists");
                return;
                // res.status(403).json({ message: "User already exists" });
            }

            user = {username: username, password: hashedPassword, role: 1};

            const results = await db.collection('Users')
                .insertOne(user);
            debug(results);
            
            const returnedUser = await db.collection('Users')
                .findOne({_id: results.insertedId});
            debug(returnedUser);

            req.login(returnedUser, () => {
                res.redirect('/register');
                // res.redirect('/auth/profile');
            });
        } catch(error){
            debug(error);
        }
        client.close();
    })();
});

authRouter.route('/login')
    .get((req, res) => {
        res.render('login');
    }).post(
        passport.authenticate('local', {
            successRedirect: '/',
            failureRedirect: '/auth/login',
            failureFlash: true
        })
    );

authRouter.route('/profile').get((req, res) => {
    res.json(req.user);
});

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/auth/login');
}


module.exports = {authRouter, checkAuthenticated};