const express = require('express');
const debug = require('debug')('app:usersRouter');
const { MongoClient, ObjectId } = require('mongodb');
const authRouter = require('./authRouter');
require('dotenv').config();
const url = process.env.DB_URL;
const dbName = process.env.DB_NAME;

const usersRouter = express.Router();
usersRouter.use((req, res, next) => {
  if(req.user){
    next();
  } else {
    res.redirect('/')
  }
});

usersRouter.route('/').get(authRouter.checkAuthenticated, async (req, res) => {
    (async function mongo(){
        let client;
        try {
            
            client = await MongoClient.connect(url);
            debug('Connected to mongoDB');
        
            const db = client.db(dbName);
        
            const response = await db.collection('Users')
                .find().toArray();
            
            res.render('users', { response, user: req.user });
          } catch (error) {
            debug(error.stack);
          }
          client.close();
    })();
});

usersRouter.route('/:id').get(authRouter.checkAuthenticated, (req, res) => {
    const id = req.params.id;

    (async function mongo(){
        let client;
        try {
            
            client = await MongoClient.connect(url);
            debug('Connected to mongoDB');
        
            const db = client.db(dbName);
        
            const userProfile = await db
                .collection('Users')
                .findOne({_id: ObjectId(id)});

            res.render('user', { user: userProfile, currentUser: req.user });
          } catch (error) {
            debug(error.stack);
          }
          client.close();
    })();
});

usersRouter.route('/change_role').post(authRouter.checkAuthenticated, async (req, res) => {
  debug('changing role');
  const { id, role } = req.body;

  let client;
  try {

    client = await MongoClient.connect(url);
    debug('Connected to mongoDB');

    const db = client.db(dbName);

    debug(role)
    debug(typeof role)

    const query = await db.collection('Users')
            .findOneAndUpdate({_id: ObjectId(id)}, {$set: {
                role: parseInt(role)
            }}).catch(err => {
                debug(err);
            });

    debug(query);
  } catch(err) {
    debug(err.stack);
  }
  client.close();
  res.redirect('/users');
});

module.exports = usersRouter;