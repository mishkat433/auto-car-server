require('dotenv').config()
const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require('mongodb');
const PORT = process.env.PORT || 5200;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DBNAME}:${process.env.DBPASSWORD}@cluster0.twfgu.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

app.get("/", (req, res) => {
    res.send("server is running")
})


const run = async () => {
    try {
        const productCollection = client.db("autoCar").collection("product");

        app.get("/products", async (req, res) => {
            const query = {}
            const result = productCollection.find(query);
            const product = await result.toArray();
            res.send(product)
        })

        app.post("/admin/addProduct", async (req, res) => {
            const product = req.body
            console.log(product);
            const result = await productCollection.insertOne(product)
            res.send(result)
        })



    }
    finally { }
}
run().catch(err => { console.log(err) })

app.listen(PORT, () => {
    console.log(`server is running at http://localhost:${PORT}`);
})