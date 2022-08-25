const jwt = require('jsonwebtoken');
const User = require('../models/user'); 

const auth = async(req,res,next) => {
    try{
        const token = req.header('Authorization').replace("Bearer ", '');
        const decoded = jwt.verify(token, process.env.JSON_WEB_TOKEN);
        const user = await User.findOne({_id: decoded._id, 'tokens.token': token});

        if(!user){
            throw new Error("Authentication Failed !!");
        }

        //send the retrieved user to user router so they dont have to fetch it again
        req.user = user;
        req.token = token;
        next();
    }catch(e){
      res.status(401).send({error: "Please Authenticate!"});  
    }
};

module.exports = auth;