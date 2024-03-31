const jwt = require('jsonwebtoken');

async function isAuthenticated(req, res, next){
    console.log(`headers: ${req.headers["authorization"]}`);

    const token = req.headers["authorization"].split(" ")[1]; //Bearer <token>
    jwt.verify(token, "secret", (err, user) => {
        if(err){
            return res.json({Error: `Error verifying  token`})
        }else{
            req.user = user;
            next();
        }
    })
};

module.exports = isAuthenticated;