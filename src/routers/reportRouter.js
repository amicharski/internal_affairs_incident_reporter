const express = require('express');
const debug = require('debug')('app:reportRouter');
const axios = require('axios');
const authRouter = require('./authRouter');
const { MongoClient, ObjectId } = require('mongodb');
const { getUsernameFromID } = require('../services/user_services');
require('dotenv').config();
const url = process.env.DB_URL;
const dbName = process.env.DB_NAME;

const reportRouter = express.Router();
reportRouter.use((req, res, next) => {
	if(req.user){
    	next();
  	} else {
    	res.redirect('/')
  	}
});

reportRouter.route('/').post(authRouter.checkAuthenticated, async (req, res) => {
    let client;
    const { offending_staff_member, incident_type, description, reporter } = req.body;
    try {
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

reportRouter.route('/').get(authRouter.checkIA, async (req, res) => {
    let client;
    try {
        client = await MongoClient.connect(url);
        debug('Connected to mongoDB');
      
        const db = client.db(dbName);
      
        const response = await db
            .collection('Reports')
            .find().toArray();
          
        res.render('reports', { user: req.user, response });
    } catch (error) {
        debug(error.stack);
    }

    client.close();
});

reportRouter.route('/put').post(authRouter.checkIA, async (req, res) => {
    let client;
    try {
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
    } catch(error){
    	debug(error.stack);
    }
    client.close();
    res.redirect('/reports');
});

reportRouter.route('/:id').get(authRouter.checkIA, async (req, res) => {
    const id = req.params.id;
    let client;
    try {
        client = await MongoClient.connect(url);
        debug('Connected to mongoDB');
        
        const db = client.db(dbName);
        
        const report = await db
            .collection('Reports')
            .findOne({_id: new ObjectId(id)});
            
        const reported_by = await getUsernameFromID(report.reporter_id);

        res.render('view_report', { report: report, reporter_name: reported_by, user: req.user });
    } catch(error){
        debug(error.stack);
    }
    client.close();
});

module.exports = reportRouter;