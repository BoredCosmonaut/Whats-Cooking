const db = require('../config/db');


async function createUser(user) {
    try {
        const {username,password,email} = user;
        const result = await db.query(
            `INSERT INTO users (username,password,email)
            VALUES($1,$2,$3) RETURNING *`,
            [username,password,email]
        );
    return result.rows[0];
    } catch (error) {
        console.error('Error while creating user:', error);
    }
};

async function getUserById(id) {
    try {
        const result = await db.query(`SELECT * FROM users WHERE id = $1`,[id]);
        return result.rows[0];
    } catch (error) {
        console.error('Error while getting user by id:',error);
    }
}

async function getUserByEmail(email) {
    try {
        const result = await db.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        const user = result.rows[0];
        if (!user) return null;
        return {
            id: user.user_id,   
            username:user.username, 
            email: user.email,
            password: user.password,
            role: user.role
        };
    } catch (error) {
        console.error('Error while getting user via email:', error);
        return null;
    }
}


module.exports = {
    createUser,
    getUserByEmail,
    getUserById
}