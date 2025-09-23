const express = require('express');
const { protect, requireRoles } = require('../middlewares/authMiddleware');
const {
  createJoiner,
  getJoiners,
  getJoinerById,
  updateJoiner,
  deleteJoiner,
  createUserAccount,
  getJoinerStats
} = require('../controllers/joinerController');
const {
  validateGoogleSheets,
  bulkUploadJoiners,
  testGoogleSheets
} = require('../controllers/bulkJoinerController');

const router = express.Router();

// All routes are protected
router.use(protect);

// Create a new joiner (BOA and Master Trainer only)
router.post('/', requireRoles(['boa', 'master_trainer']), createJoiner);

// Get all joiners with filtering and pagination (BOA and Master Trainer only)
router.get('/', requireRoles(['boa', 'master_trainer']), getJoiners);

// Get joiner statistics (BOA and Master Trainer only)
router.get('/stats', requireRoles(['boa', 'master_trainer']), getJoinerStats);

// Get joiner by ID (BOA and Master Trainer only)
router.get('/:id', requireRoles(['boa', 'master_trainer']), getJoinerById);

// Update joiner (BOA and Master Trainer only)
router.put('/:id', requireRoles(['boa', 'master_trainer']), updateJoiner);

// Delete joiner (BOA and Master Trainer only)
router.delete('/:id', requireRoles(['boa', 'master_trainer']), deleteJoiner);

// Create user account for joiner (BOA and Master Trainer only)
router.post('/:id/create-account', requireRoles(['boa', 'master_trainer']), createUserAccount);

// Bulk operations (BOA only)
router.get('/test-sheets', requireRoles(['boa']), testGoogleSheets);
router.post('/validate-sheets', requireRoles(['boa']), validateGoogleSheets);
router.post('/bulk-upload', requireRoles(['boa']), bulkUploadJoiners);

module.exports = router;
