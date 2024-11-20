import { MongoClient, ServerApiVersion } from "mongodb";

const uri = "mongo uri here";


const mongoClient = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true
    }
})


export default mongoClient;