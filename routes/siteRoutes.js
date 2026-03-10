const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    createSite,
    getSites,
    getSiteById,
    updateSite,
    deleteSite,
    addWorkerPayment,
    updateWorkerPayment,
    deleteWorkerPayment,
    getWorkers,
    addWorker,
    updateWorker,
    deleteWorker,
    getBillingItems,
    addBillingItem,
    updateBillingItem,
    deleteBillingItem
} = require('../controllers/siteController');

// All site routes are protected
router.use(protect);

router.post('/', createSite);
router.get('/', getSites);
router.get('/:id', getSiteById);
router.put('/:id', updateSite);
router.delete('/:id', deleteSite);

// Worker specific routes
router.get('/:id/workers', getWorkers);
router.post('/:id/workers', addWorker);
router.put('/:id/workers/:workerId', updateWorker);
router.delete('/:id/workers/:workerId', deleteWorker);
router.post('/:id/workers/:workerId/payments', addWorkerPayment);
router.put('/:id/workers/:workerId/payments/:paymentId', updateWorkerPayment);
router.delete('/:id/workers/:workerId/payments/:paymentId', deleteWorkerPayment);

// Billing Item specific routes
router.get('/:id/billing', getBillingItems);
router.post('/:id/billing', addBillingItem);
router.put('/:id/billing/:billingId', updateBillingItem);
router.delete('/:id/billing/:billingId', deleteBillingItem);

module.exports = router;
