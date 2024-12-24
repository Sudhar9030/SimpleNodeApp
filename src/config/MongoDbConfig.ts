import { MongoClient, ServerApiVersion } from "mongodb";
import dotenv from'dotenv'

dotenv.config()
const uri = process.env.MONGO_URL!;


const mongoClient = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true
    }
})


export default mongoClient;