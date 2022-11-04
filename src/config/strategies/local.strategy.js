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
                    const message = 'Your account has been suspended. Please consult an administrator.';
                    debug(message)
                    done(null, false, { message: message });
                }
            } else {
                const message = 'Incorrect username & password combination.';
                debug(message)
                done(null, false, { message: message });
            }
            client.close();
                    
        } catch(error){
            const message = 'An unknown error has occurred. Report this immediately.';
            debug(message)
            done(error, false, { message: message });
        }
    }));
};