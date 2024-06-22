/* import { MongoClient } from "mongodb";

const connection_string =
  "mongodb+srv://test:test@clustertest.kimvepl.mongodb.net/?retryWrites=true&w=majority&appName=ClusterTest";
const client = new MongoClient(connection_string);
let conn = null;
try {
  console.log("Trying to establish connection...");
  conn = await client.connect();
  //console.log(conn);
} catch (e) {
  console.error(e);
}
debugger;
let db = client.db("testDB");
export default db; */
