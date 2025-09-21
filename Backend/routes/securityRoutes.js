const express = require('express');
const router = express.Router();
const securityController = require('../controllers/securityController');
const { authMiddleware } = require('../middleware/auth');
const { adminAuthMiddleware: authenticateAdmin } = require('../middleware/adminAuth');

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Security Dashboard
router.get('/dashboard', authenticateAdmin, securityController.getSecurityDashboard);

// Security Logs
router.get('/logs', authenticateAdmin, securityController.getSecurityLogs);

// Security Settings
router.get('/settings', authenticateAdmin, securityController.getSecuritySettings);
router.put('/settings', authenticateAdmin, securityController.updateSecuritySetting);

// Security Incidents
router.get('/incidents', authenticateAdmin, securityController.getSecurityIncidents);
router.post('/incidents', authenticateAdmin, securityController.createSecurityIncident);
router.put('/incidents/:id', authenticateAdmin, securityController.updateSecurityIncident);

// Backup Management
router.get('/backups', authenticateAdmin, securityController.getBackupLogs);
router.post('/backup', authenticateAdmin, securityController.createBackup);

// Threat Intelligence
router.get('/threats', authenticateAdmin, securityController.getThreats);
router.post('/threats', authenticateAdmin, securityController.addThreatIntelligence);

// Compliance
router.get('/compliance', authenticateAdmin, securityController.getComplianceStatus);

module.exports = router;