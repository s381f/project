const {MongoClient, ServerApiVersion} = require("mongodb")
const mongoDBUrl = process.env.MONGODB_URI || "mongodb://localhost:27017"
const dbName = 'library';

let mongoDbClient = null; // MongoClient
let mongoDb = null; // Db

let enableLog = false

/**
 * Init MongoDB
 */
function initMongoDbConnection(_enableLog = false) {
  mongoDbClient = new MongoClient(mongoDBUrl, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });
  mongoDb = mongoDbClient.db(dbName);
  enableLog = _enableLog

  console.log("MongoDB Connected");
}

function insertOne(collectionName, document) {
  return new Promise(async (resolve, _) => {
    const collection = mongoDb.collection(collectionName);
    const result = await collection.insertOne(document);
    if (enableLog) {
      console.log("Insert One Document: ", JSON.stringify(result, null, 4));
    }
    resolve(result)
  })
}

function updateOne(collectionName, documentId, document) {
  return new Promise(async (resolve, _) => {
    const collection = mongoDb.collection(collectionName);
    const result = await collection.updateOne({
      _id: documentId,
    }, {
      $set: document
    });
    if (enableLog) {
      console.log("Update One Document: ", JSON.stringify(result, null, 4));
    }
    resolve(result)
  })
}

function updateMany(collectionName, criteria, payload) {
  return new Promise(async (resolve, _) => {
    const collection = mongoDb.collection(collectionName);
    const result = await collection.updateMany(criteria, {$set: payload});
    if (enableLog) {
      console.log("Update Many Document: ", JSON.stringify(result, null, 4));
    }
    resolve(result)
  })
}

function deleteOne(collectionName, documentId) {
  return new Promise(async (resolve, _) => {
    const collection = mongoDb.collection(collectionName);
    const result = await collection.deleteOne({_id: documentId});
    if (enableLog) {
      console.log("Delete One Document: ", JSON.stringify(result, null, 4));
    }
    resolve(result)
  })
}

function deleteMany(collectionName, criteria) {
  return new Promise(async (resolve, _) => {
    const collection = mongoDb.collection(collectionName);
    const result = await collection.deleteMany(criteria);
    if (enableLog) {
      console.log("Delete Many Document: ", JSON.stringify(result, null, 4));
    }
    resolve(result)
  })
}

module.exports = {
  initMongoDbConnection,
  insertOne,
  updateOne,
  updateMany,
  deleteOne,
  deleteMany,
}
