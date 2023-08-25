const express = require('express');
const cors = require('cors');
const app = express()
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');

//Middleware
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9a4nghi.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection

    const userCollection = client.db('multiVendorECommerce').collection('users')


       /*all users Save to mongoDB  */
       app.put("/users/:email", async (req, res) => {
        const email = req.params.email;
        const user = req.body;
        const query = { email: email };
        const option = { upsert: true };
        const updatedDoc = {
          $set: user,
        };
        const result = await userCollection.updateOne(query, updatedDoc, option);
        res.send(result);
      });

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/',(req,res)=>{
  res.send(`The server is running on port ${process.env.PORT}`)
})



app.listen(process.env.PORT, ()=>{
    console.log(`The server is running on port ${process.env.PORT}`);
})
