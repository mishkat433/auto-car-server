require('dotenv').config()
const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
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


function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET_KEY, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' });
        }
        req.decoded = decoded;
        next();
    })
}

const run = async () => {
    try {
        const productCollection = client.db("autoCar").collection("product");
        const serviceCollection = client.db("autoCar").collection("services");
        const appointmentCollection = client.db("autoCar").collection("appointment");
        const adminCollection = client.db("autoCar").collection("admin");

        // jwt token
        app.post('/jwt', (req, res) => {
            const user = req.body
            const token = jwt.sign(user, process.env.JWT_SECRET_KEY, { expiresIn: "1h" })
            res.send({ token })
        })

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
            let query = {}
            const result = serviceCollection.find(query);
            const product = await result.toArray();
            res.send(product)
        })

        app.get("/singleServices/:id", async (req, res) => {

            let query = { _id: ObjectId(req.params.id) }
            const result = serviceCollection.find(query);
            const service = await result.toArray();
            res.send(service)
        })

        app.post("/admin/addServices", async (req, res) => {
            const product = req.body
            const result = await serviceCollection.insertOne(product)
            res.send(result)
        })

        app.put("/servideUpdate/:id", async (req, res) => {
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
            const result = await serviceCollection.updateOne(filter, updateProduct, option)
            res.send(result);
        })

        app.delete("/services/delete/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await serviceCollection.deleteOne(filter);
            res.send(result);
        })

        // -------------------------- appoinment section -----------------------------------

        app.get("/appointment", verifyJWT, async (req, res) => {
            const decoded = req.decoded;
            if (req.query.email) {
                if (decoded.email !== req.query.email) {
                    res.status(403).send({ message: "unauthorized access" })
                }
            }

            let query = {}
            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }
            const cursor = appointmentCollection.find(query);
            const appointment = await cursor.toArray();
            res.send(appointment);
        })

        app.post("/postAppointment", async (req, res) => {
            const product = req.body
            const result = await appointmentCollection.insertOne(product)
            res.send(result)
        })

        app.patch("/appointmentStatus/:id", async (req, res) => {
            const id = req.params.id;
            const status = req.body.status;
            const query = { _id: ObjectId(id) }
            const updateDoc = {
                $set: {
                    status: status
                }
            }
            const cursor = await appointmentCollection.updateOne(query, updateDoc)
            res.send(cursor)
        })

        app.delete("/deleteAppointment/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const cursor = await appointmentCollection.deleteOne(query);
            res.send(cursor)
        })




        // -------------------------- Admin section -----------------------------------

        app.get("/admin", async (req, res) => {
            let query = {}
            if (req.query.email) {
                query = { email: req.query.email }
            }
            const result = adminCollection.find(query);
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