const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    try {
        const token = req.headers['authorization'];

        if (!token){
            return res.status(401).json({ message:"Unauthorized. Token missing"});
        }

        const decrypted = jwt.verify(token, process.env.JWT_SECRET);

        req.userId = decrypted.userId;

        next();
    } catch (error) {
        console.error(error);
        return res.status(401).json({message:"Unauthorized. Invalid token"});
    }
}

module.exports = {authenticate};