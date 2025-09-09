const bcrypt = require('bcrypt');
const userModel = require('../model/userModel');
const generateToken = require('../utils/generateToken');

async function registerUser(req,res) {
    const {email,password,username} = req.body;
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

async function getUserInfoById(req,res) {
    try {
        const user_id = req.params['userId'];

        if(!user_id) return res.status(401).json(({message:'User cant be found'}));

        const result = await userModel.getUserInfoById(user_id);

        res.status(201).json({message:'User info fetched', info:result});

    } catch (error) {
        console.error('Error while getting user info:',error);

        res.status(500).json({message:'Couldnt fetch user info'})
    }
};

async function updateProfilePicture(req,res) {
    try {
        const user_id = parseInt(req.params['userId'], 10);

        
        if(user_id !== req.user.id &&  req.user.role !== 'Admin') {
            return res.status(401).json({message:'You cant do that this is not your account'});
        }
        
        if(!req.file){
            return res.status(400).json({message:'No image uploaded'});
        };


        const image_name = req.file.filename;
        const image_url = `/images/profile/${image_name}`;

        const updatedProfile = await userModel.updateProfilePicture(user_id,image_name,image_url);
        
        res.status(200).json({
        message: "Profile picture updated successfully",
        profile: updatedProfile,
        });
        
    } catch (error) {
        console.error('Error while updating the image:',error);
        res.status(500).json({message:'Couldnt update profile image'});
    }
};


module.exports = {
    registerUser,
    loginUser,
    getUserInfoById,
    updateProfilePicture
}