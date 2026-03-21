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
    billingTotal: {
        type: Number,
        default: 0
    },
    withdrawals: [
        {
            date: { type: Date, default: Date.now },
            amount: { type: Number, required: true }
        }
    ],
    totalWithdrawal: {
        type: Number,
        default: 0
    },
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

    let billingTotal = 0;

    // 1. Calculate Billing Items Totals
    if (this.billingItems && Array.isArray(this.billingItems)) {
        for (let item of this.billingItems) {
            const l = item.length || 0;
            const w = item.width || 0;
            const r = item.rate || 0;

            item.totalFoot = parseFloat((l * w).toFixed(2));
            item.totalAmount = parseFloat((item.totalFoot * r).toFixed(2));

            billingTotal += item.totalAmount;
        }
    }
    this.billingTotal = parseFloat(billingTotal.toFixed(2));

    // 2. Calculate Withdrawal Totals
    let totalWithdrawal = 0;
    if (this.withdrawals && Array.isArray(this.withdrawals)) {
        for (let withdrawal of this.withdrawals) {
            totalWithdrawal += withdrawal.amount || 0;
        }
    }
    this.totalWithdrawal = parseFloat(totalWithdrawal.toFixed(2));

    // 3. Calculate Grand Total (Gross Total)
    this.grandTotal = parseFloat((this.billingTotal - this.totalWithdrawal).toFixed(2));

    // 4. Calculate Worker Payment Totals
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
