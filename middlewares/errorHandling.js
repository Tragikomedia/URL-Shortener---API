const errorHandler = (error, req, res, next) => {
  if (error) return res.render('error.html', { error });
  next();
};

module.exports = { errorHandler };
