const express = require('express');
const app = express();
const mongoose = require('mongoose');
const orderModel = require( './model/Order' );
const amqp = require('amqplib');
const config = require('../config');

const PORT = 3002;

mongoose.connect("mongodb://localhost:27017/order-service", 
    {
    useNewUrlParser: true,
    useUnifiedTopology:true
    })
    .then(() => console.log(`Order service DB connected`));

// creating rabbit mq channel
let channel
async function createChannel() {
    const connection = await amqp.connect(config.rabbitMQ.url);
    channel = await connection.createChannel();
    
    await channel.assertQueue("OrderQueue");
}

function createOrder(productList, userEmail){
    let total = 0;
    for(let prod of  productList) {
        total += prod.price
    }
    let newOrder =  new orderModel({
        "userEmail": userEmail,
        "products" : productList ,
        "totalCost": total
    })
    newOrder.save()
    return  newOrder;
}

createChannel().then(() => {
    channel.consume("OrderQueue", (msg) => {
        console.log('consuming order service ~~~~~~~~');
        if(!msg){
            console.log("Message not available")
            return ;
        }
        let { productList, userEmail } = JSON.parse(msg.content);

        console.log(`Received message ${ msg.content }`);

        const newOrder = createOrder(productList,userEmail);
        channel.ack(msg);
        channel.sendToQueue(
            "ProductQueue",
            Buffer.from(JSON.stringify({ newOrder }) )
        )  
    });
});

app.listen(PORT, () => {
    console.log(`Order Server  is running on port ${PORT}`)})