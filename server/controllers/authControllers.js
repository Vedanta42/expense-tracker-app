const User = require("../models/User");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const saltRounds = 10;

const addUser = async(req,res)=>{
    const {name,email,password} = req.body;

    try {
        const existingUser = await User.findOne({where:{email}});
        if(existingUser){
            return res.status(400).json({message:"User already exist"});
        }
        const hashPassword = await bcrypt.hash(password,saltRounds);
        const user = await User.create({name,email,password:hashPassword});
        res.status(201).json({message:"Success"});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const login = async(req,res)=>{
    const {email,password} = req.body;

    try {
        const user = await User.findOne({where:{email}});
        if(!user){
            return res.status(404).json({message:"User not found"})
        }
        if(!await bcrypt.compare(password,user.password)){
            return res.status(401).json({message:"Incorrect password"});
        }
        const token = jwt.sign(
            {
                userId: user.id,
                isPremiumUser: user.isPremiumUser                
            }, process.env.JWT_SECRET);
            
        // Explicitly send isPremiumUser to the frontend
        res.status(200).json({
            message:"Successful login",
            userId:user.id, 
            token:token, 
            isPremiumUser: user.isPremiumUser 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = {addUser,login};