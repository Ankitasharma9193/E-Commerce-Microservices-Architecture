const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: String,
    description: String,
    price: Number,
    created_at: {
        type: Date,
        default: Date.now()
    }
});

module.exports = Product = mongoose.model( 'product', productSchema );  //creating a model called "Product" with the schema defined