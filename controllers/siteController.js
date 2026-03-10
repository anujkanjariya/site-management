const Site = require('../models/Site');

// Create a new site
exports.createSite = async (req, res) => {
    try {
        const { name, billingItems, workers } = req.body;
        const newSite = new Site({
            name,
            billingItems,
            workers,
            user: req.user._id // Assign logged in user
        });
        const savedSite = await newSite.save();
        res.status(201).json(savedSite);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all sites (Filtered by User)
exports.getSites = async (req, res) => {
    try {
        const sites = await Site.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json(sites);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a single site by ID
exports.getSiteById = async (req, res) => {
    try {
        const { id } = req.params;
        const site = await Site.findOne({ _id: id, user: req.user._id });
        if (!site) {
            return res.status(404).json({ message: 'Site not found or not authorized' });
        }
        res.status(200).json(site);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a site
exports.updateSite = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, billingItems, workers } = req.body;

        const site = await Site.findOne({ _id: id, user: req.user._id });
        if (!site) {
            return res.status(404).json({ message: 'Site not found or not authorized' });
        }

        if (name !== undefined) site.name = name;
        if (billingItems !== undefined) site.billingItems = billingItems;
        if (workers !== undefined) site.workers = workers;

        const updatedSite = await site.save();
        res.status(200).json(updatedSite);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a site
exports.deleteSite = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedSite = await Site.findOneAndDelete({ _id: id, user: req.user._id });
        if (!deletedSite) {
            return res.status(404).json({ message: 'Site not found or not authorized' });
        }
        res.status(200).json({ message: 'Site deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add payment to a specific worker
exports.addWorkerPayment = async (req, res) => {
    try {
        const { id, workerId } = req.params;
        const { amount, description, date } = req.body;

        const site = await Site.findOne({ _id: id, user: req.user._id });
        if (!site) {
            return res.status(404).json({ message: 'Site not found or not authorized' });
        }

        const worker = site.workers.id(workerId);
        if (!worker) {
            return res.status(404).json({ message: 'Worker not found' });
        }

        worker.payments.push({
            amount,
            description,
            date: date || Date.now()
        });

        const updatedSite = await site.save();
        res.status(200).json(updatedSite);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update a specific worker payment
exports.updateWorkerPayment = async (req, res) => {
    try {
        const { id, workerId, paymentId } = req.params;
        const { amount, description, date } = req.body;

        const site = await Site.findOne({ _id: id, user: req.user._id });
        if (!site) {
            return res.status(404).json({ message: 'Site not found or not authorized' });
        }

        const worker = site.workers.id(workerId);
        if (!worker) {
            return res.status(404).json({ message: 'Worker not found' });
        }

        const payment = worker.payments.id(paymentId);
        if (!payment) {
            return res.status(404).json({ message: 'Payment record not found' });
        }

        if (amount !== undefined) payment.amount = amount;
        if (description !== undefined) payment.description = description;
        if (date !== undefined) payment.date = date;

        const updatedSite = await site.save();
        res.status(200).json(updatedSite);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a specific worker payment
exports.deleteWorkerPayment = async (req, res) => {
    try {
        const { id, workerId, paymentId } = req.params;

        const site = await Site.findOne({ _id: id, user: req.user._id });
        if (!site) {
            return res.status(404).json({ message: 'Site not found or not authorized' });
        }

        const worker = site.workers.id(workerId);
        if (!worker) {
            return res.status(404).json({ message: 'Worker not found' });
        }

        worker.payments.pull(paymentId);
        const updatedSite = await site.save();
        res.status(200).json(updatedSite);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all workers for a site
exports.getWorkers = async (req, res) => {
    try {
        const { id } = req.params;
        const site = await Site.findOne({ _id: id, user: req.user._id });
        if (!site) {
            return res.status(404).json({ message: 'Site not found or not authorized' });
        }
        res.status(200).json(site.workers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add a new worker to a site
exports.addWorker = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        const site = await Site.findOne({ _id: id, user: req.user._id });
        if (!site) {
            return res.status(404).json({ message: 'Site not found or not authorized' });
        }

        site.workers.push({ name, payments: [], totalPaid: 0 });
        const updatedSite = await site.save();
        res.status(201).json(updatedSite.workers[updatedSite.workers.length - 1]);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update a worker's details
exports.updateWorker = async (req, res) => {
    try {
        const { id, workerId } = req.params;
        const { name } = req.body;

        const site = await Site.findOne({ _id: id, user: req.user._id });
        if (!site) {
            return res.status(404).json({ message: 'Site not found or not authorized' });
        }

        const worker = site.workers.id(workerId);
        if (!worker) {
            return res.status(404).json({ message: 'Worker not found' });
        }

        if (name !== undefined) worker.name = name;

        const updatedSite = await site.save();
        res.status(200).json(worker);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a worker from a site
exports.deleteWorker = async (req, res) => {
    try {
        const { id, workerId } = req.params;

        const site = await Site.findOne({ _id: id, user: req.user._id });
        if (!site) {
            return res.status(404).json({ message: 'Site not found or not authorized' });
        }

        site.workers.pull(workerId);
        await site.save();
        res.status(200).json({ message: 'Worker removed successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all billing items for a site
exports.getBillingItems = async (req, res) => {
    try {
        const { id } = req.params;
        const site = await Site.findOne({ _id: id, user: req.user._id });
        if (!site) {
            return res.status(404).json({ message: 'Site not found or not authorized' });
        }
        res.status(200).json(site.billingItems);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add a new billing item to a site
exports.addBillingItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, length, width, rate } = req.body;

        const site = await Site.findOne({ _id: id, user: req.user._id });
        if (!site) {
            return res.status(404).json({ message: 'Site not found or not authorized' });
        }

        site.billingItems.push({ name, length, width, rate });
        const updatedSite = await site.save();
        res.status(201).json(updatedSite.billingItems[updatedSite.billingItems.length - 1]);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update a billing item
exports.updateBillingItem = async (req, res) => {
    try {
        const { id, billingId } = req.params;
        const { name, length, width, rate } = req.body;

        const site = await Site.findOne({ _id: id, user: req.user._id });
        if (!site) {
            return res.status(404).json({ message: 'Site not found or not authorized' });
        }

        const item = site.billingItems.id(billingId);
        if (!item) {
            return res.status(404).json({ message: 'Billing item not found' });
        }

        if (name !== undefined) item.name = name;
        if (length !== undefined) item.length = length;
        if (width !== undefined) item.width = width;
        if (rate !== undefined) item.rate = rate;

        const updatedSite = await site.save();
        res.status(200).json(item);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a billing item
exports.deleteBillingItem = async (req, res) => {
    try {
        const { id, billingId } = req.params;

        const site = await Site.findOne({ _id: id, user: req.user._id });
        if (!site) {
            return res.status(404).json({ message: 'Site not found or not authorized' });
        }

        site.billingItems.pull(billingId);
        await site.save();
        res.status(200).json({ message: 'Billing item removed successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
