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

async function updateUserInfo(req,res) {
    try {
        const user_id = parseInt(req.params.id);
        if(user_id !== req.user.id && req.user.role !== 'Admin') return res.status(403).json({message:'You can only update your own info'});

        const {username,email} = req.body;

        if (!username && !email) return res.status(400).json({message:'Username or email required'})

        const updatedUser = await userModel.updateUserInfo(user_id,username,email);

        res.status(200).json({message:'Updated info fetched', info:updatedUser});
    } catch (error) {
        console.error('Error while updating user info:',error);
        res.status(500).json({message:'Failed update info'});
    }
};

async function updatePassword(req,res) {
    try {
        const user_id = parseInt(req.params.id);

        if(user_id !== req.user.id && req.user.role !== 'Admin') return res.status(403).json({message:'You can only update your own password'});

        const {current_password,newPassword} = req.body;
        
        if(!newPassword) return res.status(400).json({message:'New password needed'});

        const user = await userModel.getUserInfoById(user_id);

        if(!user) return res.status(404).json({message:'User not found'});

        if(req.user.role !== 'Admin') {
            const isMatch = await bcrypt.compare(current_password,user.password);
            if(!isMatch) return res.status(400).json({message:'Current password is wrong'});
        };

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const updatedUser = await userModel.updatePassword(user_id,hashedPassword);

        res.status(200).json({message:'Password updated.'});
    } catch (error) {
        console.error('Error while updating passwrod:',error);
        res.status(500).json({message:'Failed to update password'});
    }
};

async function getUserPoınts(req,res) {
    try {
        const user_id = parseInt(req.params.id);

        const points = await userModel.getPoints(user_id);

        res.status(200).json({message:{message:'Points Fetched:',points}})

    } catch (error) {
        console.error('Error while getting points:',error)
        res.status(500).json({message:'Failed to get user points'});
    }
};

async function adjustUserPoints(req,res) {
    try {
        const user_id = parseInt(req.params.id);
        const {points_change,action} = req.body;
        
        if(req.user.role !== 'Admin') return res.status(201).json({message:'You must be an admin to use this'});

        if(typeof(points_change) !== 'number') return res.status(400).json(({message:'Points must be a numbers'}));

        const updated = await userModel.adjustUserPoints(user_id,points_change,action);

        res.status(200).json({message:'Points adjusted:',updated});
    } catch (error) {
        console.error('Error while adjusting points:',error);
        res.status(500).json({message:'Failed to adjust points'});
    }
};


module.exports = {
    registerUser,
    loginUser,
    getUserInfoById,
    updateProfilePicture,
    updateUserInfo,
    updatePassword,
    getUserPoınts,
    adjustUserPoints
}