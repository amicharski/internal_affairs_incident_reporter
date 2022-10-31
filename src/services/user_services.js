const { MongoClient, ObjectId } = require('mongodb');
const debug = require('debug')('app:user_service');

async function getUsernameFromID(id){
  let client;
  try {
      const url = 'mongodb://127.0.0.1:27017'; // process.env.DBURL
      const dbName = 'political_debate_dev';
      
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