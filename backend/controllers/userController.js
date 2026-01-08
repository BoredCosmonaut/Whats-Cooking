const bcrypt = require('bcrypt');
const userModel = require('../model/userModel');
const generateToken = require('../utils/generateToken');
const crypto = require('crypto')
const { get } = require('../routes/userRoutes');
const { sendVerificationEmail } = require('../utils/mail');
const {uploadToSupabase} = require(`../middleware/dynamicUploadMiddleware`)
async function registerUser(req,res) {
    const {email,password,username} = req.body;
    try {
        const usernameExists = await userModel.checkUsernameExists(username);
        if (usernameExists) {
            return res.status(409).json({ message: 'Username is already taken.' });
        }


        const emailExists = await userModel.checkEmailExists(email);
        if (emailExists) {
            return res.status(409).json({ message: 'Email is already registered.' });
        }
        const hashedPassword = await bcrypt.hash(password,10);

        const newUser = await userModel.createUser({
            username,
            email,
            password: hashedPassword,
            is_verified: true
        });

        const token = crypto.randomBytes(32).toString('hex');
        const expire = new Date()
        expire.setHours(expire.getHours() + 24);

        await userModel.saveVerificationToken(newUser.user_id,token,expire);

        return res.status(201).json({ message: 'Kayıt başarılı! Lütfen e-postanızı doğrulayın.' });
    } catch (error) {
        console.error('Registiration error:',error);
        res.status(500).json({message:'Server error'})
    }
};

async function verifyEmail(req,res) {
    const {token} = req.query
    try {
        const success = await userModel.verifyUserByToken(token);
        if(success) {
            return res.redirect(`${process.env.FRONTEND_URL}/login?verified=true`);
        }
        res.status(400).send('Geçersiz veya süresi dolmuş link.');
    } catch (error) {
        console.log('Doğrulama hatası:',error)
        res.status(500).send('Doğrulama hatası.');
    }
}

async function loginUser(req,res) {
    try {
        const {email,password} = req.body;
        const user = await userModel.getUserByEmail(email);
        if(!user) return res.status(401).json({message:"Email or password wrong"});
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) return res.status(401).json({message:"Email or password wrong"});
        console.log(user.is_verified)
        // if (!user.is_verified) {
        //     return res.status(401).json({ message: "Lütfen önce e-posta adresinizi doğrulayın." });
        // }
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
        const points = await userModel.getPoints(user_id);
        res.status(201).json({message:'User info fetched', info:result,points:points.total});

    } catch (error) {
        console.error('Error while getting user info:',error);

        res.status(500).json({message:'Couldnt fetch user info'})
    }
};

`async function updateProfilePicture(req,res) {
    try {
        const user_id = parseInt(req.params['userId'], 10);

        
        if(user_id !== req.user.id &&  req.user.role !== 'Admin') {
            return res.status(401).json({message:'You cant do that this is not your account'});
        }
        
        if(!req.file){
            return res.status(400).json({message:'No image uploaded'});
        };


        const image_name = req.file.filename;
        

        const updatedProfile = await userModel.updateProfilePicture(user_id,image_name,image_url);
        
        res.status(200).json({
        message: "Profile picture updated successfully",
        profile: updatedProfile,
        });
        
    } catch (error) {
        console.error('Error while updating the image:',error);
        res.status(500).json({message:'Couldnt update profile image'});
    }
};`

async function updateProfilePicture(req,res) {
    try {
        const user_id = parseInt(req.params['userId'], 10);

        
        if(user_id !== req.user.id &&  req.user.role !== 'Admin') {
            return res.status(401).json({message:'You cant do that this is not your account'});
        }
        
        if(!req.file){
            return res.status(400).json({message:'No image uploaded'});
        };

        const { image_name, image_url } = await uploadToSupabase(req.file, 'profile');
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

async function updateUserInfo(req, res) {
    const { username, email } = req.body;
    const user_id = parseInt(req.params.id);
    try {
        if (user_id !== req.user.id && req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'You can only update your own info.' });
        }

        if (!username && !email) {
            return res.status(400).json({ message: 'Username or email required.' });
        }
        
        const currentUser = await userModel.getUserInfoById(user_id); 
        if (!currentUser) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const checks = [];
        
        if (username && username !== currentUser.username) {
            checks.push(userModel.checkUsernameExists(username));
        } else {
            checks.push(Promise.resolve(false)); 
        }

        if (email && email !== currentUser.email) {
            checks.push(userModel.checkEmailExists(email));
        } else {
             checks.push(Promise.resolve(false)); 
        }

        const [usernameConflict, emailConflict] = await Promise.all(checks);
        
        if (usernameConflict) {
            return res.status(409).json({ message: 'This username is already taken by another account.' });
        }
        
        if (emailConflict) {
            return res.status(409).json({ message: 'This email is already registered to another account.' });
        }

        const updatedUser = await userModel.updateUserInfo(user_id, username, email);

        return res.status(200).json({ message: 'Profile information updated successfully.', info: updatedUser });

    } catch (error) {
        console.error('Error while updating user info:', error);
        return res.status(500).json({ message: 'Failed update info' });
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


async function getTopChefs(req,res) {
    try {
        const chefs = await userModel.getTopChefs();
        res.status(200).json({message:'Chefs fetched', chefs:chefs})
    } catch (error) {
        console.error('Error while fetching chefs:', error)
        res.status(500).json({message:'Couldnt fetch top chefs'});
    }
};

async function getClowns(req,res) {
    try {
        const clowns = await userModel.getClowns();
        res.status(200).json({message:'clowns fetched', clowns:clowns});
    } catch (error) {
        console.error('Error while fetching chefs:',error);
        res.status(500).json({message:'Couldnt fetch top chefs'});
    };
};


module.exports = {
    registerUser,
    loginUser,
    getUserInfoById,
    updateProfilePicture,
    updateUserInfo,
    updatePassword,
    getUserPoınts,
    adjustUserPoints,
    getTopChefs,
    getClowns,
    verifyEmail
}