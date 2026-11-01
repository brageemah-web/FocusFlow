const jwt = require("jsonwebtoken");

const protect = (req,res,next) => {
    let token;

    //check if request provides a bearer toekn
    if(req.headers.authorization && 
        req.headers.authorization.startsWith("Bearer ")){
        try{
            token = req.headers.authorization.split(" ")[1];

            //verify token
            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET
            );

            //attach users id to the request
            req.user = {id:decoded.id};
            next();
        }
        catch(e){
            //401 Unauthorized
            return res.status(401).json({
                message : "Not authorized, invalid token"
            });
        }
    }

    else{
        // 401 Unauthorized
        return res.status(401).json({
            message : "Not authorized, no token provided"
        });
    }
};

module.exports = protect;