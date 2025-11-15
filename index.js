const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors')
const app = express()
const port = process.env.PORT || 3000

// middlewires

app.use(cors())
app.use(express.json())


const uri = "mongodb+srv://aiUser:dHL8XwOacbX8RwQC@cluster0.kc2s7sf.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});


async function run() {
    try {

        await client.connect();

        const db = client.db('models-db')
        const modelsCollection = db.collection('models')

        app.get('/models',async(req,res)=>{
            const result =await modelsCollection.find().toArray()
            res.send(result)
        })

        app.get('/models/:id',async(req,res)=>{

              const {id} = req.params

              const result = await modelsCollection.findOne({_id: new ObjectId(id)})

              res.send({
                success:true,
                result
              })
        })

        app.post('/models',async(req,res)=>{
            const data = req.body;
            console.log(data)
            const result = await modelsCollection.insertOne(data)
            res.send({
                success:true,
                result
            })
        })


        app.get('/', (req, res) => {
            res.send('Hello World!')
        })

        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error

    }
}
run().catch(console.dir);



app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})