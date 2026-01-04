const Case = require('../../features/cases/case.model');
const User = require('../../features/users/user.model');
const Lawyer = require('../../features/lawyers/lawyer.model');
const Client = require('../../features/users/client.model');
const Payment = require('../../features/payments/payment.model');

exports.getEarnings = async (req, res) => {
    try {
        const earnings = await Payment.aggregate([
            { $match: { status: 'COMPLETED' } },
            {
                $group: {
                    _id: null,
                    totalPlatformFees: { $sum: "$platformFee" },
                    totalVolume: { $sum: "$amount" }
                }
            }
        ]);

        res.json({
            totalEarnings: earnings[0]?.totalPlatformFees || 0,
            totalVolume: earnings[0]?.totalVolume || 0
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getAnalytics = async (req, res) => {
    try {
        // 1. Cases Overview
        const caseStats = await Case.aggregate([
            {
                $group: {
                    _id: null,
                    totalCases: { $sum: 1 },
                    activeCases: { $sum: { $cond: [{ $in: ["$status", ["ACCEPTED", "IN_PROGRESS"]] }, 1, 0] } },
                    closedCases: { $sum: { $cond: [{ $eq: ["$status", "CLOSED"] }, 1, 0] } },
                    pendingCases: { $sum: { $cond: [{ $eq: ["$status", "PENDING"] }, 1, 0] } }
                }
            }
        ]);

        // 2. Cases per Month (Last 6 Months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const casesPerMonth = await Case.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        // 3. User Stats
        const lawyerCount = await Lawyer.countDocuments();
        const clientCount = await Client.countDocuments();

        // 4. Categories
        const casesByCategory = await Case.aggregate([
            { $group: { _id: "$category", count: { $sum: 1 } } }
        ]);

        const stats = {
            overview: caseStats[0] || { totalCases: 0, activeCases: 0, closedCases: 0, pendingCases: 0 },
            growth: casesPerMonth,
            users: { lawyers: lawyerCount, clients: clientCount },
            categories: casesByCategory
        };

        res.json(stats);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.forceCloseCase = async (req, res) => {
    const { id } = req.params;
    try {
        const c = await Case.findById(id);
        if (!c) return res.status(404).json({ message: 'Case not found' });

        c.status = 'CLOSED';
        c.statusHistory.push({
            status: 'CLOSED',
            changedBy: req.user.id, // Admin ID
            changedAt: new Date()
        });

        await c.save();

        // TODO: Notify Lawyer and Client

        res.json({ message: 'Case force-closed by admin', case: c });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.suspendUser = async (req, res) => {
    const { id } = req.params;
    const { type } = req.body; // 'lawyer' or 'client'

    try {
        let user;
        if (type === 'lawyer') {
            user = await Lawyer.findById(id);
        } else if (type === 'client') {
            user = await Client.findById(id);
        } else {
            return res.status(400).json({ message: 'Invalid user type' });
        }

        if (!user) return res.status(404).json({ message: 'User not found' });

        // Toggle suspension/ban
        user.isBanned = !user.isBanned;
        await user.save();

        // TODO: Create Notification

        res.json({ message: `User ${user.isBanned ? 'suspended' : 'activated'} successfully`, isBanned: user.isBanned });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getReports = async (req, res) => {
    const { type } = req.query; // cases, payments
    try {
        let data;
        if (type === 'cases') {
            data = await Case.find().select('title category status createdAt urgency').lean();
        } else if (type === 'payments') {
            const payments = await Payment.find().populate('payerId', 'name').populate('payeeId', 'name').sort({ createdAt: -1 });
            data = payments.map(p => ({
                TransactionID: p.transactionId,
                Date: p.paidAt ? p.paidAt.toISOString().split('T')[0] : '',
                Amount: p.amount,
                PlatformFee: p.platformFee,
                LawyerEarning: p.lawyerEarn,
                Payer: p.payerId?.name || 'Unknown',
                Payee: p.payeeId?.name || 'Unknown',
                Status: p.status
            }));
        } else {
            return res.status(400).json({ message: 'Invalid report type' });
        }

        // Basic CSV Conversion
        if (data.length > 0) {
            const fields = Object.keys(data[0]);
            const csv = [
                fields.join(','),
                ...data.map(row => fields.map(field => JSON.stringify(row[field])).join(','))
            ].join('\n');

            res.header('Content-Type', 'text/csv');
            res.attachment(`${type}-report.csv`);
            return res.send(csv);
        }

        res.json({ message: 'No data to export' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
