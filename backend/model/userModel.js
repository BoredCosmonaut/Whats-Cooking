const db = require('../config/db');


async function createUser(user) {
  try {

    const { username, password, email } = user;

    const userResult = await db.query(
      `INSERT INTO users (username, password, email)
       VALUES ($1, $2, $3) RETURNING *`,
      [username, password, email]
    );
    const newUser = userResult.rows[0];

    await db.query(
      `INSERT INTO user_gallery (user_id) VALUES ($1)`,
      [newUser.user_id] // use the PK from users
    );

    return newUser;

  } catch (error) {
    console.error('Error while creating user with gallery:', error);
    throw error;
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

async function getUserInfoById(user_id) {
    try {
        const user_info = await db.query(`
                SELECT u.username,u.email,u.password,ug.image_name,ug.image_url 
                FROM users u LEFT JOIN user_gallery ug 
                ON  ug.user_id = u.user_id WHERE u.user_id = $1`, [user_id]);
        
        return user_info.rows[0];

    } catch (error) {
        console.error('Error while getting user info:',error);
    }
};

async function updateProfilePicture(user_id, image_name, image_url) {
  try {
    const result = await db.query(
      `UPDATE user_gallery
       SET image_name = $2, image_url = $3
       WHERE user_id = $1
       RETURNING *`,
      [user_id, image_name, image_url]
    );

    return result.rows[0];
  } catch (error) {
    console.error('Error while updating the image:', error);
    throw error;
  }
}

async function updateUserInfo(user_id, username, email) {
  try {

    const fields = [];
    const values = [];
    let id = 1;

    if (username) {
      fields.push(`username = $${id++}`);
      values.push(username);
    }
    if (email) {
      fields.push(`email = $${id++}`);
      values.push(email);
    }

    if (fields.length === 0) return null;

    values.push(user_id);

    const result = await db.query(
      `UPDATE users 
       SET ${fields.join(', ')} 
       WHERE user_id = $${id} 
       RETURNING *`,
      values
    );

    return result.rows[0];
  } catch (error) {
    console.error('Error while updating profile info:', error);
    throw error;
  }
}


async function updatePassword(user_id,hashedPassword) {
  try {
    const result = await db.query(`
                UPDATE users
                SET password = $1 
                WHERE user_id = $2 `,[hashedPassword,user_id]);
  } catch (error) {
    console.error('Error while updating password:',error);
  }
};

async function updatePoints(user_id,action,pointsChange) {
  try {
    
    await db.query(`INSERT INTO user_points (user_id,action,points_change) VALUES ($1,$2,$3)`, [user_id,action,pointsChange]);

    const result = await db.query(`UPDATE users SET points = points + $1 WHERE user_id = $2 RETURNING points`,[pointsChange,user_id]);

    return result.rows[0];

  } catch (error) {
    console.error('Error while updating points:',error);
  }
};

async function getPoints(user_id) {
  try {
    const result = await db.query('SELECT points FROM users WHERE user_id = $1', [user_id]);

    const history = await db.query('SELECT action,points_change,created_at FROM user_points WHERE user_id = $1 ORDER BY created_at DESC', [user_id]);

    return {
      total: result.rows[0]?.points || 0,
      history:history.rows
    };

  } catch (error) {
    console.error('Error while getting point data:',error);
  }
};

async function adjustUserPoints(user_id,points_change,action) {
  return updatePoints(user_id,action,points_change);
};

async function getTopChefs() {
  try {
    const result = await db.query(`
                SELECT u.username,u.points,u.user_id,ug.image_name 
                FROM users u 
                LEFT JOIN user_gallery ug ON ug.user_id = u.user_id ORDER BY u.points DESC LIMIT 5`);
    return result.rows;
  } catch (error) {
    console.error('Error while getting users:',error);
  }
}



module.exports = {
    createUser,
    getUserByEmail,
    getUserInfoById,
    updateProfilePicture,
    updateUserInfo,
    updatePassword,
    updatePoints,
    getPoints,
    adjustUserPoints,
    getTopChefs,
}