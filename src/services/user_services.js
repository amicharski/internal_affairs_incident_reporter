const { MongoClient, ObjectId } = require('mongodb');
const debug = require('debug')('app:user_service');
require('dotenv').config();
const url = process.env.DB_URL;
const dbName = process.env.DB_NAME;

async function getUsernameFromID(id){
  let client;
  try {
      
      client = await MongoClient.connect(url);
  
      const db = client.db(dbName);
  
      const user = await db
          .collection('Users')
          .findOne({_id: new ObjectId(id)});
      
      return user.username;

    } catch (error) {
      debug(error.stack);
    }
    client.close();
}

module.exports = { getUsernameFromID }