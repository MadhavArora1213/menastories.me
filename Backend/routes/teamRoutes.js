const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const { check } = require('express-validator');
const { authMiddleware, authorize } = require('../middleware/adminAuth');

// Create team
router.post('/', [
  authMiddleware,
  check('name').notEmpty().withMessage('Team name is required'),
  check('description').optional()
], teamController.createTeam);

// Get all teams
router.get('/', authMiddleware, teamController.getAllTeams);

// Get team by ID
router.get('/:id', authMiddleware, teamController.getTeamById);

// Update team
router.put('/:id', [
  authMiddleware,
  check('name').optional(),
  check('description').optional(),
  check('leadId').optional().isUUID().withMessage('Lead ID must be a valid UUID')
], teamController.updateTeam);

// Add team member
router.post('/members', [
  authMiddleware,
  check('teamId').isUUID().withMessage('Team ID must be a valid UUID'),
  check('adminId').isUUID().withMessage('Admin ID must be a valid UUID'),
  check('role').optional()
], teamController.addTeamMember);

// Remove team member
router.delete('/members/:teamId/:adminId', authMiddleware, teamController.removeTeamMember);

module.exports = router;