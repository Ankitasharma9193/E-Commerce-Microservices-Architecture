const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    products: [
        {
            product_id: String
        }
    ],
    userEmail: String,
    totalCost:  Number,
    created_at: {
        type: Date,
        default: Date.now()
    }
})

module.exports = Order =  mongoose.model("order", orderSchema);