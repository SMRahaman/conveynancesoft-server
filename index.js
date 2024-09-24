const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

//Middelware
app.use(cors());
app.use(express.json());

//DB Connection

const uri = `mongodb+srv://${process.env.DATABASE_USER}:${process.env.DATABASE_PASS}@cluster0.wwzrsnj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    const productCollection = client.db("conveynanceSoft").collection("conveynanceData");
    const userCollection=client.db('conveynanceSoft').collection('user')
    const historyCollection=client.db('conveynanceSoft').collection('history')
    //Product add,update,delete,view
    app.post("/api/conveynance", async (req, res) => {
      const product = req.body;
      const result = await productCollection.insertOne(product);
      res.send(result);
    });
    app.get("/api/conveynances", async (req, res) => {
      const result = await productCollection.find().toArray();
      res.send(result);
    });
    
    app.get("/api/conveynances/:email", async (req, res) => {
      const email=req.params.email;
      const filter={Email:email}
      const result = await productCollection.find(filter).toArray();
      res.send(result);
    });
    app.get("/api/conveynances/:id",async(req,res)=>{
     const id=req.params.id;
     const filter={_id:new ObjectId(id)};
     const result=await productCollection.findOne(filter);
     res.send(result)
    })
    app.put("/api/conveynances/:id",async(req,res)=>{
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateConveynance = req.body;
      console.log(updateConveynance);
      const conveynance = {
        $set: {
          Date: updateConveynance.Date,
          From: updateConveynance.From,
          To: updateConveynance.To,
          PurposeOfVisit:updateConveynance.PurposeOfVisit,
          MadeofTransport:updateConveynance.MadeofTransport,
          Amount:updateConveynance.Amount
        },
      };
      const result = await productCollection.updateOne(filter, conveynance);
      res.send(result);
    })
    app.delete("/api/conveynances/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await productCollection.deleteOne(filter);
      res.send(result);
    });

    app.post("/api/user", async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      res.send(result);
    });
    app.get("/api/users", async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });
    app.get("/api/users/:id",async(req,res)=>{
      const id=req.params.id;
      const filter={_id:new ObjectId(id)};
      const result=await userCollection.findOne(filter);
      res.send(result)
     })

     app.patch("/api/users/:id",async(req,res)=>{
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateUser = req.body;
      console.log(updateUser);
      const user = {
        $set: {
          userPermission:updateUser.userPermission,
        },
      };
      const result = await userCollection.updateOne(filter, user);
      res.send(result);
    })

     app.delete("/api/users/:id",async(req,res)=>{
      const id=req.params.id;
      const filter={_id:new ObjectId(id)};
      const result=await userCollection.deleteOne(filter);
      res.send(result)
     })

     app.post('/api/history',async(req,res)=>{
      const history=req.body;
      const result=await historyCollection.insertOne(history);
      res.send(result);
     })

     app.get('/api/historys',async(req,res)=>{
      const result=await historyCollection.find().toArray();
      res.send(result);
     })

     //aggregate 
     app.get('/api/filterd-conveynance-bill', async (req, res) => {
      const start = new Date(req.query.start);
      const end = new Date(req.query.end);
      const email = req.query.email;
  
      console.log(start, end, email);
  
      try {
        const result = await productCollection.aggregate([
          {
            $match: {
              Email: email,
              $expr: {
                $and: [
                  { $gte: [{ $dateFromString: { dateString: "$Date" } }, start] },
                  { $lte: [{ $dateFromString: { dateString: "$Date" } }, end] }
                ]
              }
            }
          }
        ]).toArray();
        res.send(result);
      } catch (err) {
        res.status(500).send({ message: 'Error fetching data', error: err });
      }
    });

   
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
