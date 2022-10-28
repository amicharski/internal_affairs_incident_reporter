const express = require('express');
const debug = require('debug')('app:reportRouter');
const axios = require('axios');
const { MongoClient, ObjectID } = require('mongodb');

const reportRouter = express.Router();
reportRouter.use((req, res, next) => {
  if(req.user){
    next();
  } else {
    res.redirect('/')
  }
});

reportRouter.route('/').post(async (req, res) => {
    let client;
    const { date, time, offending_staff_member, incident_type, description } = req.body;
    try {
        const url = 'mongodb://127.0.0.1:27017';
        const dbName = 'political_debate_dev';

        client = await MongoClient.connect(url);

        const db = client.db(dbName);

        const report = { date: date, time: time, offending_staff_member: offending_staff_member,
            incident_type: incident_type, description: description,
            status: 0, resolution_description: '', handledBy: '',
            reporter: axios.get('http://localhost:8080/auth/profile').username };

        const results = await db.collection('Reports')
            .insertOne(report);
        debug(results);
    } catch(err) {
        debug(err.stack);
    }
    client.close();
    res.redirect('/');
});

reportRouter.route('/').get(async (req, res) => {
    (async function mongo(){
        let client;
        try {
            const url = 'mongodb://127.0.0.1:27017'; // process.env.DBURL
            const dbName = 'political_debate_dev';
            
            client = await MongoClient.connect(url);
            debug('Connected to mongoDB');
        
            const db = client.db(dbName);
        
            const response = await db
                .collection('Reports')
                .find().toArray();
            
            res.render('reports', { response });
          } catch (error) {
            debug(error.stack);
          }
          client.close();
    })();
});

reportRouter.route('/:id').get((req, res) => {
    const id = req.params.id;
    (async function mongo(){
        let client;
        try {
            const url = 'mongodb://127.0.0.1:27017'; // process.env.DBURL
            const dbName = 'political_debate_dev';
            
            client = await MongoClient.connect(url);
            debug('Connected to mongoDB');
        
            const db = client.db(dbName);
        
            const report = await db
                .collection('Reports')
                .findOne({_id: new ObjectID(id)});

            res.render('view_report', { report });
          } catch (error) {
            debug(error.stack);
          }
          client.close();
    })();
});

module.exports = reportRouter;