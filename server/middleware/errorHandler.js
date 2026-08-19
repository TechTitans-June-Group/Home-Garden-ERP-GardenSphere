const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);

  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID' });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: Object.values(err.errors)
        .map((item) => item.message)
        .join(', '),
    });
  }

  if (err.code === 11000) {
    return res.status(400).json({ message: 'Email is already registered' });
  }

  res.status(statusCode).json({
    message: err.message || 'Server error',
  });
};

export default errorHandler;
