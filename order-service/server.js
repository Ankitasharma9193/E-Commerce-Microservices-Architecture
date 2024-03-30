const express = require('express');
const app = express();
const mongoose = require('mongoose');
const orderModel = require( './models/Order' );

const PORT = 3002;

mongoose.connect("mongodb://localhost:27017/order-service", 
    {
    useNewUrlParser: true,
    useUnifiedTopology:true
    })
    .then(() => console.log(`Order service DB connected`));

const createChannel =  async() => {
    const connection = await amqp.connect(config.rabbitMQ.url);
    const channel = await connection.createChannel();
    
    await channel.assertQueue("OrderQueue");
    return {channel};
}
const channel = createChannel();

app.listen(PORT, () => {
    console.log(`Order Server  is running on port ${PORT}`)})