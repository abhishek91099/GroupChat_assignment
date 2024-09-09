export function authorizeAdmin(req, res, next) {
    const { role } = req.user;
    console.log(role)
    if (role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }
    next();
  } 