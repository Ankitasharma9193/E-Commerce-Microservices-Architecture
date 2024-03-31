let express = require('express');
let app = express();
let jwt = require('jsonwebtoken');
let mongoose = require('mongoose');
let amqp = require('amqplib');
const config = require('../config.js');
const isAuthenticated  = require('../authentication');
const productModel = require('./models/Product.js');

app.use(express.json());
const PORT = 3001;

mongoose.connect("mongodb://localhost:27017/product-service", 
    {
    useNewUrlParser: true,
    useUnifiedTopology:true
    })
    .then(() => console.log(`Product service DB connected`));

let channel, order;
async function createChannel(){
    const connection = await amqp.connect();
    channel = await connection.createChannel();
    
    await channel.assertQueue("ProductQueue");
}
createChannel();
//~~~~~~~~~~~~~~~~~~ ROUTES ~~~~~~~~~~~~~~~~~~~~~~~~
// creating a product
app.post('/product/create', isAuthenticated, async (req, res) => {
    const { name, description, price } = req.body;

    if (!name || !description || !price ) {
        return res.status(400).send({ 
            error: "You must provide the fields: name, description and price" 
        });
    }
    try{
        // create  new product in MongoDB
        const newProduct = new productModel({
            name, description, price
        })
        //saving to database
        newProduct.save()
        res.send(newProduct);
    } catch(error) {
        console.log('Error on save new Product: ', error);
        res.status(500).send(error);
    }
})

app.post('/product/buy', isAuthenticated, async (req, res) => {
    console.log('~~~~~~~~~~~',req.body);
    const {ids} = req.body;
// list of product id's to buy
    const productList = await productModel.find({ _id: { $in:  ids} });
  
// send the list of product id to orderQueue
// in the case of consuming, channel.consume(queue, callback, options)
    channel.sendToQueue(
        "OrderQueue",
        Buffer.from(
            JSON.stringify({
                productList,
                userEmail: req.user.email
            })
        ),
    )

    channel.consume(
        "ProductQueue",
        (msg) => {
            if(!msg){
                console.log(`Message not available to consume in Product queue`);
            } else {
                console.log(`order data:  ${ msg.content }`);
                order = JSON.parse(msg.content);
                channel.ack(msg)
            }
        }
    )
    res.send(order);
})
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} in product service`);
})