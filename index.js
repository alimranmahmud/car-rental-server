const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express')
const cors = require('cors')
// require('dotenv').config()
const port = 3000

const app = express()
app.use(cors())
app.use(express.json())


const uri = "mongodb+srv://car_rental:sq1YxPIXsnhwEntk@cluster0.wlngie2.mongodb.net/?appName=Cluster0";

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

        const db = client.db('car_rental')
        const carCollection = db.collection('cars')
        const bookingCollection = db.collection('booking')

        app.get('/cars', async (req, res) => {
            const result = await carCollection.find().toArray()
            res.send(result)
        })

        app.get('/cars/:id', async (req, res) => {
            const id = req.params.id;
            const result = await carCollection.findOne({ _id: new ObjectId(id) });
            res.send(result);
        });

        app.post('/cars', async (req, res) => {
            const data = req.body;
            const result = await carCollection.insertOne(data);
            res.send(result)

        })

        app.get('/cars/provider/:email', async (req, res) => {
            const email = req.params.email;
            const result = await carCollection.find({ providerEmail: email }).toArray();
            res.send(result);
        });

        app.delete('/cars/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await carCollection.deleteOne(query)
            res.send(result)
        });

        app.patch("/cars/:id", async (req, res) => {
            const id = req.params.id;
            const updateData = req.body;

            const result = await carCollection.updateOne(
                { _id: new ObjectId(id) },
                { $set: updateData }
            );

            res.send(result);
        });


        // app.post("/bookings", async (req, res) => {
        //     const data = req.body;
        //     const result = await bookingCollection.insertOne(data);
        //     res.send(result);
        // });
        app.post("/bookings", async (req, res) => {
            const data = req.body;

            try {
                const bookingResult = await bookingCollection.insertOne(data);

                await carCollection.updateOne(
                    { _id: new ObjectId(data.carId) },
                    { $set: { status: "unavailable" } }
                );

                res.send({ success: true,  bookingResult });

            } catch (err) {
                res.send({ error: true });
            }
        });


        app.get("/bookings/:email", async (req, res) => {
            const result = await bookingCollection.find({ userEmail: req.params.email }).toArray();
            res.send(result);
        });

        app.delete("/bookings/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await bookingCollection.deleteOne(query)
            res.send(result)
        });













        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
