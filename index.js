const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors')
const app = express()
const port = process.env.PORT || 3000

require('dotenv').config()



// middlewires

app.use(cors())
app.use(express.json())


// // verify token middleware

// async function verifyToken(req, res, next) {
//     try {
//         let token;
//         await admin.auth().verifyIdToken(token)
//         next()

//     } catch (error) {
//         return res.status(401).send({
//             message:'Unauthorized access'
//         })

//     }
// }





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.PASSWORD}@cluster0.kc2s7sf.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});


async function run() {
    try {

        // await client.connect();

        const db = client.db('models-db')
        const modelsCollection = db.collection('models')
        const purchaseCollection = db.collection('purchase')

        app.get('/models',async(req,res)=>{
            const result =await modelsCollection.find().toArray()
            res.send(result)
        })

        app.get('/models/:id' ,async(req,res)=>{

              const {id} = req.params

              const result = await modelsCollection.findOne({_id: new ObjectId(id)})

              res.send({
                success:true,
                result
              })
        })

        app.put('/models/:id' ,async(req,res)=>{
             const {id} = req.params
             const data = req.body
             const objectId = new ObjectId(id) 
             const filter = {_id : objectId}
             const update = {
                $set : data
             }
             

              const result = await modelsCollection.updateOne(filter,update)

              res.send({
                success:true,
                result
              })
        })
        app.delete('/models/:id' ,async(req,res)=>{
             const {id} = req.params
             
             const objectId = new ObjectId(id) 
             const filter = {_id : objectId}
           
            

              const result = await modelsCollection.deleteOne(filter)

              res.send({
                success:true,
                result
              })
        })


        app.post('/purchase/:id' ,async(req,res)=>{
           const data = req.body;
           const id = req.params.id
            const objectId = new ObjectId(id)
             const filter = {_id : objectId}

             const update = {
                $inc:{
                    purchased:1
                }
             }
           const result = await purchaseCollection.insertOne(data)
           const purchaseCount = await modelsCollection.updateOne(filter,update)
           res.send({
               success: true,
               result,
               purchaseCount
           })
        })

        app.post('/models' ,async(req,res)=>{
            const data = req.body;
            console.log(data)
            const result = await modelsCollection.insertOne(data)
            res.send({
                success:true,
                result
            })
        })

        // latest 6 models

        app.get('/latest-models', async (req,res)=>{
            const result = await modelsCollection.find().sort({createdAt: -1}).limit(6).toArray()
            res.send(result)
        })

        // my models api

        app.get('/my-models', async(req,res)=>{
           
           const email = req.query.email
           const result = await modelsCollection.find({createdBy:email}).toArray()
           res.send(result)
        })

        app.get('/my-purchase',  async(req,res)=>{
           
           const email = req.query.email
           const result = await purchaseCollection.find({purchasedBy:email}).toArray()
           res.send(result)
        })

        // search api
        app.get('/search', async(req,res)=>{
            const search_text = req.query.search;
            const result = await modelsCollection.find({name:{$regex:search_text,$options:'i'}}).toArray()
            res.send(result)
        })
    
        // filter api

        app.get('/search-filter', async (req, res) => {
    const search = req.query.search || "";
    const category = req.query.category || "";

    let filterQuery = {};

    // 🔍 Search by name
    if (search) {
        filterQuery.name = { $regex: search, $options: "i" };
    }

    // 🏷 Filter by category (framework)
    if (category) {
        filterQuery.framework = category;
    }

    const result = await modelsCollection.find(filterQuery).toArray();
    res.send(result);
});

        // // filter api
        // app.get('/filter', async(req,res)=>{
        //     const filter_text = req.query.filter;
        //     const result = await modelsCollection.find({framework:{$regex:search_text,$options:'i'}}).toArray()
        //     res.send(result)
        // })


        app.get('/', (req, res) => {
            res.send('Server is running properly')
        })

        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        
    }
}
run().catch(console.dir);



app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})