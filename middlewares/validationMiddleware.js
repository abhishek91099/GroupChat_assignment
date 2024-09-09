import { body, validationResult } from 'express-validator';

export const validateRoomCreation = [
  body('room_name').notEmpty().withMessage('Room name is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

export const validateUserCreation = [
  body('username')
    .notEmpty()
    .withMessage('username is required'),

  body('password')
    .notEmpty()
    .withMessage('password is required'),

  (req, res, next) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];
