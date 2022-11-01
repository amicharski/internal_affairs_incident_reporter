const express = require('express');
const debug = require('debug')('app:authRouter');
const passport = require('passport');
const bcrypt = require('bcrypt');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();
const url = process.env.DB_URL;
const dbName = process.env.DB_NAME;

const authRouter = express.Router();

authRouter.route('/change_password').post(checkAuthenticated, async (req, res) => {
    const { id, password } = req.body;

    let client;
    try {
        client = await MongoClient.connect(url);
        const db = client.db(dbName);

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const query = await db.collection('Users')
            .findOneAndUpdate({_id: new ObjectId(id)}, {$set: {
                password: hashedPassword,
                role: 2
            }}).catch(err => {
                debug(err);
            });
        debug(query);
    } catch(error){
        debug("ERROR")
        debug(error);
    }
    client.close();
    res.redirect('/report');
});

authRouter.route('/register').post(async (req, res) => {
    const { username, password } = req.body;

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
    debug(req.body);
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/auth/login');
}


module.exports = {authRouter, checkAuthenticated};