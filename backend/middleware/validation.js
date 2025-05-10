// Created by Warnex04 : 16/03/25
// Modified 2 times by LimuleSempai : last 10/05/25
// Modified 1 time by Warnex04 : last 16/03/25

// Server side validation for registration

const { check, validationResult } = require("express-validator"); // Import validation functions and result handler from express-validator
// Define middleware array to validate user registration inputs
const validateUserRegistration = [
  check("name")
    .not().isEmpty().withMessage("Name is required") // Check that 'name' field is not empty
    .isAlphanumeric().withMessage("Name must be alphanumeric"), // Validate that the name contains only alphanumeric characters
  check("email")
    .isEmail().withMessage("Please include a valid email") // Check that 'email' is a valid email format
    .normalizeEmail(), // Normalize the email (e.g., trim and lowercase it)
  check("password")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters long") // Validate that 'password' has a minimum length of 8 characters
    .matches(/\d/).withMessage("Password must contain a number") // Ensure the password contains at least one number
    .matches(/[A-Z]/).withMessage("Password must contain an uppercase letter") // Ensure the password contains at least one uppercase letter
    .matches(/[a-z]/).withMessage("Password must contain a lowercase letter") // Ensure the password contains at least one lowercase letter
    .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage("Password must contain a special character"), // Ensure the password contains at least one special character
  (req, res, next) => {
    const errors = validationResult(req); // Custom middleware to check for any validation errors
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() }); // If there are errors, return a 400 response with the error array
    }
    next(); // If no errors, proceed to the next middleware or route handler
  },
];
// Export the validation middleware for use in registration routes
module.exports = { validateUserRegistration };
