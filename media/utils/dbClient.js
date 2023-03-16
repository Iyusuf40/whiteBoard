// const MongoClient = require('mongodb').MongoClient
// const ObjectId = require('mongodb').ObjectId

// const host = process.env.DB_HOST || 'localhost';
// const port = process.env.DB_PORT || 27017;
// const dbName = process.env.DB_DATABASE || 'whiteboard';
// const url = `mongodb://${host}:${port}`;

// class DBClient {
//   constructor() {
//     this.client = new MongoClient(url, { useUnifiedTopology: true });
//     this.connect();
//     this.connected = false;
//   }

//   async connect() {
//     await this.client.connect();
//     this.connected = true;
//     this.db = this.client.db(dbName);
//     this.canvasCollection = this.db.collection('canvas');
//     this.usersCollection = this.db.collection('users');
//   }

//   isAlive() {
//     return this.connected;
//   }

//   async findByColAndFilter(collection, key, value) {
//     let result = null;
//     let filter = null;
//     if (typeof(value) === 'object') {
//       filter = value
//     } else {
//       if (key === '_id') {
//         try {
//           filter = { _id: new ObjectId(value) };
//         } catch (err) {
//           console.log(err)
//           if (err) return null;
//         }
//       } else {
//         filter = JSON.parse(`{"${key}":"${value}"}`);
//       }
//     }

//     if (collection === 'users') {
//       result = await this.usersCollection.findOne(filter);
//     } else if (collection === 'canvas') {
//       result = await this.canvasCollection.findOne(filter);
//     }
//     return result;
//   }

//   async find(collection, key, value) {
//     let result = null;
//     let filter = JSON.parse(`{"${key}":"${value}"}`);
//     if (!key && !value) {
//       filter = {};
//     } else if (!key && value) {
//       filter = value;
//     }
//     if (key === '_id') {
//       try {
//         filter = { _id: new ObjectId(value) };
//       } catch (err) {
//         if (err) return [];
//       }
//     }
//     if (collection === 'users') {
//       result = await this.usersCollection.find(filter);
//     } else if (collection === 'canvas') {
//       result = await this.canvasCollection.find(filter);
//     }
//     const res = await result.toArray();
//     result.close(); // result === cursor
//     return res;
//   }

//   async updateOne(collection, filter, toSet, value) {
//     let set = {$set: {toSet: value}}
//     if (collection === 'canvas') {
//       if (typeof(toSet) !== 'string') {
//         throw new Error('wrong type toSet: should be string')
//       }
//       set = {$set: {[toSet]: value}}
//       const resp = await this.canvasCollection.updateOne(filter, set);
//       return resp;
//     }
//     const resp = await this.usersCollection.updateOne(filter, set);
//     return resp;
//   }

//   async deletePoint(collection, filter, toUnSet, value) {
//     let unset = {$unset: {toUnSet: value}}
//     if (collection === 'canvas') {
//       if (typeof(toUnSet) !== 'string') {
//         throw new Error('wrong type toUnSet: should be string')
//       }
//       unset = {$unset: {[toUnSet]: value}}
//       const resp = await this.canvasCollection.updateOne(filter, unset);
//       return resp;
//     }
//     return null;
//   }

//   async delete(collection, filter) {
//     if (collection === 'canvas') {
//       const resp = await this.canvasCollection.deleteMany(filter);
//       return resp;
//     }
//     const resp = await this.usersCollection.deleteMany(filter);
//     return resp;
//   }

//   async saveUser(user) {
//     const reply = await this.usersCollection.insertOne(user);
//     return reply.insertedId.toString(); // id of inserted user
//   }

//   async saveCanvas(canvasData) {
//     const reply = await this.canvasCollection.insertOne(canvasData);
//     return reply.insertedId.toString(); // id of file
//   }
// }

// const dbClient = new DBClient();
// module.exports = dbClient;
