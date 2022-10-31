const express = require('express');
const debug = require('debug')('app:reportRouter');
const axios = require('axios');
const authRouter = require('./authRouter');
const { MongoClient, ObjectId } = require('mongodb');
const { getUsernameFromID } = require('../services/user_services');

// Date: <%=new Date(parseInt(report._id.substring(0, 8), 16)*1000)%> <br />
{/* <div>
<label for="incidentDate" class="text-white">Date of Incident:</label>
<input id="incidentDate" name="date" type="date" required />
</div>
<div>
<label for="incidentTime" class="text-white">Approximate Time of Incident:</label>
<input id="incidentTime" name="time" type="time" required />
</div> */}

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
    const { offending_staff_member, incident_type, description, reporter } = req.body;
    try {
        const url = 'mongodb://127.0.0.1:27017';
        const dbName = 'political_debate_dev';

        client = await MongoClient.connect(url);

        const db = client.db(dbName);

        const name = await getUsernameFromID(reporter);

        const report = { offending_staff_member: offending_staff_member,
            incident_type: incident_type, description: description,
            status: 0, resolution_description: '', handled_by: '',
            reporter_id: reporter, reporter_name: name };

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

reportRouter.route('/put').post(async (req, res) => {
  (async function mongo(){
    let client;
    try {
        debug('heya buddy');
        const url = 'mongodb://127.0.0.1:27017'; // process.env.DBURL
        const dbName = 'political_debate_dev';
        
        client = await MongoClient.connect(url);
        debug('Connected to mongoDB');
    
        const db = client.db(dbName);

        switch(req.body.status){
          case '0':
            const investigatePut = await db
              .collection('Reports')
              .findOneAndUpdate({_id: new ObjectId(req.body.id)}, {$set: {
                status: 1,
                handled_by: req.body.investigator
              }});
			debug(investigatePut);
            break;
          case '1':
            const resolvePut = await db
              .collection('Reports')
              .findOneAndUpdate({_id: new ObjectId(req.body.id)}, {$set: {
                status: 2,
                resolution_description: req.body.resolution_description
              }});
			debug(resolvePut);
            break;
        }
      } catch (error) {
        debug(error.stack);
      }
      client.close();
      res.redirect('/reports');
  })();
});

reportRouter.route('/:id').get(authRouter.checkAuthenticated, (req, res) => {
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
                .findOne({_id: new ObjectId(id)});
            
            const reported_by = await getUsernameFromID(report.reporter_id);

            res.render('view_report', { report: report, reporter_name: reported_by, user: req.user });
        } catch (error) {
            debug(error.stack);
        }
        client.close();
    })();
});

module.exports = reportRouter;