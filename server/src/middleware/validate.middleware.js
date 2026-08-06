export function validateRequest(schema) {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err.errors) {
        const errorMessages = err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
        return res.status(400).json({ error: `Validation error: ${errorMessages}` });
      }
      return res.status(400).json({ error: 'Invalid request payload' });
    }
  };
}
