import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("Please set MONGODB_URI");
let client;
if (!global._mongoClient) {
  client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  global._mongoClient = client;
  global._mongoClientPromise = client.connect();
}
const clientPromise = global._mongoClientPromise;
export default clientPromise;
