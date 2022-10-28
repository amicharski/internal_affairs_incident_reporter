const express = require('express');
const debug = require('debug')('app:adminRouter');
const { MongoClient } = require('mongodb');

const adminRouter = express.Router();

adminRouter.route('/').get(async (req, res) => {
  const url = 'mongodb://127.0.0.1:27017'; // process.env.DBURL
  const dbName = 'political_debate_dev';

  (async function mongo(){
      let client;
      try {
          client = await MongoClient.connect(url);
          debug('Connected to mongoDB');
      
          const db = client.db(dbName);
      
          const response = await db.collection('Users')
              .insertMany();
          
          res.render('users', { response });
        } catch (error){
          debug(error.stack);
        }
        client.close();
  })();
});

module.exports = adminRouter;