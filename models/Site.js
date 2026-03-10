const mongoose = require('mongoose');

const siteSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Site name is required'],
        trim: true
    },
    billingItems: [
        {
            name: String,
            length: Number,
            width: Number,
            rate: Number,
            totalFoot: Number,
            totalAmount: Number
        }
    ],
    grandTotal: {
        type: Number,
        default: 0
    },
    workers: [
        {
            name: String,
            payments: [
                {
                    date: { type: Date, default: Date.now },
                    amount: Number,
                    description: String
                }
            ],
            totalPaid: { type: Number, default: 0 }
        }
    ],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, {
    timestamps: true
});

siteSchema.pre('save', async function () {
    let grandTotal = 0;

    // 1. Calculate Billing Items Totals
    if (this.billingItems && Array.isArray(this.billingItems)) {
        for (let item of this.billingItems) {
            const l = item.length || 0;
            const w = item.width || 0;
            const r = item.rate || 0;

            item.totalFoot = parseFloat((l * w).toFixed(2));
            item.totalAmount = parseFloat((item.totalFoot * r).toFixed(2));

            grandTotal += item.totalAmount;
        }
    }
    this.grandTotal = parseFloat(grandTotal.toFixed(2));

    // 2. Calculate Worker Payment Totals
    if (this.workers && Array.isArray(this.workers)) {
        for (let worker of this.workers) {
            let workerTotal = 0;
            if (worker.payments && Array.isArray(worker.payments)) {
                for (let payment of worker.payments) {
                    workerTotal += payment.amount || 0;
                }
            }
            worker.totalPaid = parseFloat(workerTotal.toFixed(2));
        }
    }
});

module.exports = mongoose.model('Site', siteSchema);
