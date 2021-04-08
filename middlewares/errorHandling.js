const errorHandler = (error, req, res, next) => {
  if (error) return res.status(500).json({ error });
  next();
};

module.exports = { errorHandler };
