const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

//Middleware
app.use(cors());
app.use(express.json());

const verifyJWT = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res
      .status(401)
      .send({ error: true, message: "Unauthorized access" });
  }
  const token = authorization.split(" ")[1];
  jwt.verify(token, process.env.SECRET_KEY, (error, decode) => {
    if (error) {
      return res
        .status(401)
        .send({ error: true, message: "Unauthorized access" });
    }
    req.decode = decode;
    next();
  });
};

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9a4nghi.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection

    const userCollection = client
      .db("multiVendorECommerce")
      .collection("users");

    const productsCollection = client
      .db("multiVendorECommerce")
      .collection("products");

    /* Json web token */
    app.post("/jwt", (req, res) => {
      const email = req.body;
      const token = jwt.sign(email, process.env.SECRET_KEY, {
        expiresIn: "1h",
      });
      res.send({ token });
    });

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

    /* Create user to admin */
    app.patch("/users/:email", async (req, res) => {
      const email = req.params.email;
      const { role } = req.body;
      const query = { email: email };
      const updatedDoc = {
        $set: {
          role: role,
        },
      };
      const result = await userCollection.updateOne(query, updatedDoc);
      res.send(result);
    });

    /* Get Admin */
    app.get("/users/admin/:email", verifyJWT, async (req, res) => {
      const email = req.params.email;
      if (req.decode.email !== email) {
        return res.send({ admin: false });
      }
      const query = { email: email };
      const user = await userCollection.findOne(query);
      const result = { admin: user?.role === "admin" };
      res.send(result);
    });

    /* Become seller */
    app.put("/users/seller/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const query = { email: email };
      const option = { upsert: true };
      const updatedDoc = {
        $set: {
          shopName: user.shopName,
          phoneNumber: user.phoneNumber,
          address: user.address,
          zipCode: user.zipCode,
        },
      };
      const result = await userCollection.updateOne(query, updatedDoc, option);
      res.send(result);
    });

     /* Get seller */
     app.get("/users/seller/:email", verifyJWT, async (req, res) => {
      const email = req.params.email;
      if (req.decode.email !== email) {
        return res.send({ seller: false });
      }
      const query = { email: email };
      const user = await userCollection.findOne(query);
      const result = { seller: user?.role === "seller" };
      res.send(result);
    });

    /* Get all user for admin */
    app.get("/users", verifyJWT, async (req, res) => {
      const users = await userCollection.find().toArray();
      res.send(users);
    });

    /* Get AllProducts */
    app.get('/products',async(req,res)=>{
      const result = await productsCollection.find().toArray();
      res.send(result)
    })

    /* Get single products */
    app.get('/products/:id',async(req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await productsCollection.findOne(query)
      res.send(result)
    })

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send(`The server is running on port ${process.env.PORT}`);
});

app.listen(process.env.PORT, () => {
  console.log(`The server is running on port ${process.env.PORT}`);
});
