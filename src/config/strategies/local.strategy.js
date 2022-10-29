const passport = require('passport');
const bcrypt = require('bcrypt');
const { Strategy } = require('passport-local');
const { MongoClient } = require('mongodb');
const debug = require('debug')('app:localStrategy');

module.exports = function localStrategy(){
    passport.use(new Strategy({
        usernameField: 'username',
        passwordField: 'password'
    }, async (username, password, done) => {
        const url = 'mongodb://127.0.0.1:27017'; // process.env.DBURL
        const dbName = 'political_debate_dev';

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
                debug('password correct');
                done(null, user);
            } else {
                done(null, false);
            }
                    
        } catch(error){
            done(error, false);
        }
        client.close();
    }));
};