const jwt = require('jsonwebtoken');
require('dotenv').config();

function generateToken({ id, email, role }) {
  return jwt.sign({ id, email, role }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });
}

module.exports = generateToken;
