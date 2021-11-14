const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;


// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jpgna.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();

        const database = client.db('bikeShop');
        const bikesCollection = database.collection('bikes');
        const ordersCollection = database.collection('orders');
        const usersCollection = database.collection('users');

        app.get('/bikes', async (req, res) => {
            const cursor = bikesCollection.find({});
            const result = await cursor.toArray();
            // console.log(result);
            res.send(result);
        });

        app.get('/bikes/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await bikesCollection.findOne(query);

            res.send(result);
        });

        app.get('/orders/:email', async (req, res) => {
            const email = req.params.email;
            const query = { userEmail: email };

            const cursor = ordersCollection.find(query);
            const orders = await cursor.toArray();
            res.send(orders)
        });

        app.post('/bikes', async (req, res) => {
            const newBike = req.body;
            // console.log(newBike);
            const addNewBike = newBike;
            const result = await bikesCollection.insertOne(addNewBike);
            console.log(result);
            res.json(result);
        })

        app.post('/orders', async (req, res) => {
            const order = req.body;
            const doc = order;
            const result = await ordersCollection.insertOne(doc);
            res.json(result);
        });

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
        });

        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });

        app.put('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const updateOrder = req.body;
            console.log(id);
            console.log(updateOrder);

            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };

            const updateDoc = {
                $set: {
                    serviceId: updateOrder.serviceId,
                    orderStatus: updateOrder.orderStatus,
                    userName: updateOrder.userName,
                    userPhoneNumber: updateOrder.userPhoneNumber,
                    userEmail: updateOrder.userEmail,
                    userAddress: updateOrder.userAddress,
                    bike_name: updateOrder.bike_name,
                    brand: updateOrder.brand,
                    price: updateOrder.price
                }
            }
            const result = await ordersCollection.updateOne(filter, updateDoc, options);

            res.send(result);
        })

        app.delete('/bikes/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await bikesCollection.deleteOne(query);
            console.log(result);
            res.json(result);
        })

        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await ordersCollection.deleteOne(query);
            res.json(result);
        })

    }
    finally {
        // await client.close()
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})