function authorizeRoles(...roles) {
  return (req, res, next) => {
    console.log("Roles allowed:", roles);
    console.log("User role from token:", req.user.role,req.user.id);
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Unauthorized Access' });
    }
    next();
  };
}

module.exports = authorizeRoles;
