const jwt=require("jsonwebtoken");
const User=require("../models/UserModel");

const protect = async (req, res, next) => {
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            // Get token from header
            token = req.headers.authorization.split(" ")[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from the token
            req.user = await User.findById(decoded.id).select("-password");
            next();
        } catch (error) {
            res.status(401).json({ message: "Not authorized" });
        }
    }

    if (!token) {
        res.status(401).json({ message: "Not authorized, no token" });
    }
}

const isAdmin=async(req,res,next)=>{
    try{
        if(req.user && req.user.isAdmin){
            next();
        }else{
            res.status(403).json({message:'Not authorized as admin'});
        }
    }catch(error){
        res.status(401).json({message:"Not authorized"});
    }
}


module.exports={protect,isAdmin};