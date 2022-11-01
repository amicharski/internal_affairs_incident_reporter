const passport = require('passport');
const bcrypt = require('bcrypt');
const { Strategy } = require('passport-local');
const { MongoClient } = require('mongodb');
const debug = require('debug')('app:localStrategy');
require('dotenv').config();
const url = process.env.DB_URL;
const dbName = process.env.DB_NAME;

module.exports = function localStrategy(){
    passport.use(new Strategy({
        usernameField: 'username',
        passwordField: 'password'
    }, async (username, password, done) => {
        let client;
        
        try {
            client = await MongoClient.connect(url);

            const db = client.db(dbName);
            const user = await db.collection('Users')
                .findOne({ username });

            if(user === null){
                done(null, false);
            }
            
            const correctPassword = await bcrypt.compare(password, user.password);

            if(correctPassword){
                if(user.role > 0){
                    debug('password correct');
                    done(null, user);
                } else {
                    debug('user is suspended');
                    done(null, false);
                }
            } else {
                done(null, false);
            }
            client.close();
                    
        } catch(error){
            done(error, false);
        }
    }));
};