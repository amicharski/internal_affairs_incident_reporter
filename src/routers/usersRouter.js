const express = require('express');
const debug = require('debug')('app:usersRouter');
const { MongoClient, ObjectID } = require('mongodb');

const usersRouter = express.Router();
usersRouter.use((req, res, next) => {
  if(req.user){
    next();
  } else {
    res.redirect('/')
  }
});

usersRouter.route('/').get(async (req, res) => {
    (async function mongo(){
        let client;
        try {
            const url = 'mongodb://127.0.0.1:27017'; // process.env.DBURL
            const dbName = 'political_debate_dev';
            
            client = await MongoClient.connect(url);
            debug('Connected to mongoDB');
        
            const db = client.db(dbName);
        
            const response = await db.collection('Users')
                .find().toArray();
            
            res.render('users', { response });
          } catch (error) {
            debug(error.stack);
          }
          client.close();
    })();
});

usersRouter.route('/:id').get((req, res) => {
    const id = req.params.id;
    (async function mongo(){
        let client;
        try {
            const url = 'mongodb://127.0.0.1:27017'; // process.env.DBURL
            const dbName = 'political_debate_dev';
            
            client = await MongoClient.connect(url);
            debug('Connected to mongoDB');
        
            const db = client.db(dbName);
        
            const user = await db
                .collection('Users')
                .findOne({_id: new ObjectID(id)});

            res.render('user', { user });
          } catch (error) {
            debug(error.stack);
          }
          client.close();
    })();
});

module.exports = usersRouter;