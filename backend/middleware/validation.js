const { check, validationResult } = require("express-validator");

const validateUserRegistration = [
  check("name")
    .not().isEmpty().withMessage("Name is required")
    .isAlphanumeric().withMessage("Name must be alphanumeric"),
  check("email")
    .isEmail().withMessage("Please include a valid email")
    .normalizeEmail(),
  check("password")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters long")
    .matches(/\d/).withMessage("Password must contain a number")
    .matches(/[A-Z]/).withMessage("Password must contain an uppercase letter")
    .matches(/[a-z]/).withMessage("Password must contain a lowercase letter")
    .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage("Password must contain a special character"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

module.exports = { validateUserRegistration };
