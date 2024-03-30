const express = require('express');
const app = express();
const userModel = require( './models/User' );
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

app.use(express.json()); // to parse the incoming requests with JSON payloads
// Connecting to MongoDB database using Mongoose ODM (Object Data Mapping)
const PORT = 3000;
mongoose.connect("mongodb://localhost/auth-service", {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log(`DB is connected`));

// routes
app.post('/auth/login', async(req, res) => {
    const {email, password} = req.body;

    if( !email || !password ) return res.status(400).send({error: 'Missing data!'});
    
    const user = await userModel.findOne( {email } );
    console.log('user :>> ', user);
    if( !user ){
        return res.json({message: `User dosent exist`});
    }
    else{
    try{
        if(password !== user.password){
            return res.json({message: `Wrong password!`});
        }
        const payload = {
            email,
             password
        };

        jwt.sign(payload, "secret", (err, token) => {
                if( err ) console.log( err);
                else return res.json({token: token})
        });
        
    } catch(err){
        console.log(`Error in login ${err}`);
        return res.status(500)
    }}
});

// creating a new user
app.post('/auth/register', async(req, res) => {
    const {name, email, password} = req.body;
    if(!name || !email || !password){
        return res.status(400).send({error: 'Missing fields!'})
    }

    const userExist = await userModel.findOne( {'email': email} )
    if(userExist) {
        return res.json({ message: `User with email id ${email} already exists.` });
    } else {
        try{
           // let newUser = await userModel.create({ name, email, password });
           let newUser = new  userModel({ name, email, password });
            await newUser.save() ;
            res.send(newUser);
        }catch(err){
            console.log(`error:`, err);
        }
    }
});

app.listen(PORT, () => {
    console.log(`Server  is running on port ${PORT}`)
});