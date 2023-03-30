const jwt = require("jsonwebtoken");
const jwt_secret = "535354";

const fetchUser = (req, res, next)=>{
    const token = req.header('auth-token');
    if(!token){
        res.status(401).send({error: 'please authenticate using a valid token'});
    }
    try{
        const data = jwt.verify(token, jwt_secret);
        req.user = data.user;
        next();
    }catch{
        res.status(401).send({error: 'please authenticate using a valid token'});
    }
    
}

module.exports = fetchUser;