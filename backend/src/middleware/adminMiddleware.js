const adminMiddleware = (req, res, next) => {
  const user = req.user || {};
  const isAdmin = user.admin === true || user.role === 'admin' || user.email === 'admin@batchfund.com';

  if (!isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  return next();
};

export default adminMiddleware;