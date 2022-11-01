const express = require('express');
const debug = require('debug')('app:adminRouter');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const url = process.env.DB_URL;
const dbName = process.env.DB_NAME;

const adminRouter = express.Router();

adminRouter.route('/').get(async (req, res) => {
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
});

module.exports = adminRouter;