require('dotenv').config()
const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { query } = require('express');
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
        const serviceCollection = client.db("autoCar").collection("services");
        const adminCollection = client.db("autoCar").collection("admin");

        app.get("/products", async (req, res) => {
            const query = {}
            const result = productCollection.find(query);
            const product = await result.toArray();
            res.send(product)
        })

        app.post("/admin/addProduct", async (req, res) => {
            const product = req.body
            const result = await productCollection.insertOne(product)
            res.send(result)
        })

        app.put("/productUpdate/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const product = req.body;
            const option = { upsert: true };
            const updateProduct = {
                $set: {
                    name: product.name,
                    price: product.price,
                    photo: product.photo
                }
            }
            const result = await productCollection.updateOne(filter, updateProduct, option)
            res.send(result);
        })

        app.delete("/product/delete/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await productCollection.deleteOne(filter);
            res.send(result);
        })

        // -------------------------- service -----------------------------------------

        app.get("/services", async (req, res) => {
            const query = {}
            const result = serviceCollection.find(query);
            const product = await result.toArray();
            res.send(product)
        })

        app.post("/admin/addServices", async (req, res) => {
            const product = req.body
            const result = await serviceCollection.insertOne(product)
            res.send(result)
        })

        // app.put("/productUpdate/:id", async (req, res) => {
        //     const id = req.params.id;
        //     const filter = { _id: ObjectId(id) };
        //     const product = req.body;
        //     const option = { upsert: true };
        //     const updateProduct = {
        //         $set: {
        //             name: product.name,
        //             price: product.price,
        //             photo: product.photo
        //         }
        //     }
        //     const result = await productCollection.updateOne(filter, updateProduct, option)
        //     res.send(result);
        // })

        // app.delete("/delete/:id", async (req, res) => {
        //     const id = req.params.id;
        //     const filter = { _id: ObjectId(id) };
        //     const result = await productCollection.deleteOne(filter);
        //     res.send(result);
        // })



        // -------------------------- Admin section -----------------------------------

        app.get("/admin", async (req, res) => {
            const findAdmin = { email: req.query.email }
            const result = adminCollection.find(findAdmin);
            const product = await result.toArray();
            res.send(product)
        })

        app.post("/admin/addAdmin", async (req, res) => {
            const admin = req.body
            const result = await adminCollection.insertOne(admin)
            res.send(result)
        })

        app.delete("/admin/delete/:id", async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const filter = { _id: ObjectId(id) };
            const result = await adminCollection.deleteOne(filter);
            res.send(result);
        })

    }
    finally { }
}
run().catch(err => { console.log(err) })

app.listen(PORT, () => {
    console.log(`server is running at http://localhost:${PORT}`);
})