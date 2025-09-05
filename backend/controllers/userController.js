const bcrypt = require('bcrypt');
const userModel = require('../model/userModel');
const generateToken = require('../utils/generateToken');

async function registerUser(req,res) {
    const {email,password} = req.body;
    try {
        const existingUser = await userModel.getUserByEmail(email);
        if(existingUser) return res.status(400).json({message:'Email already exists'});
        const hashedPassword = await bcrypt.hash(password,10);
        const newUser = await userModel.createUser({
            username,
            email,
            password: hashedPassword
        });
        res.status(201).json({message:'Registration Successful'});
    } catch (error) {
        console.error('Registiration error:',error);
        res.status(500).json({message:'Server error'})
    }
};

async function loginUser(req,res) {
    try {
        const {email,password} = req.body;
        const user = await userModel.getUserByEmail(email);
        if(!user) return res.status(401).json({message:"Email or password wrong"});
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) return res.status(401).json({message:"Email or password wrong"});
        console.log("User role from DB:", user.role,user.id,user.email);
        const token = generateToken({id:user.id, email:user.email, role:user.role});
        res.json({
            message:"Login succesful",
            token: token,
            user: {
                id:user.id,
                username: user.username,
                email:user.email,
                role:user.role
            }
        });
    } catch (error) {
        console.error('Error while login:', error);
        res.status(500).json({message:'Login unsuccesful'});
    }
};


module.exports = {
    registerUser,
    loginUser,
}