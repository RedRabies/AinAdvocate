const Review = require('./review.model');
const Case = require('../cases/case.model');
const Lawyer = require('../lawyers/lawyer.model');

exports.createReview = async (req, res) => {
    const { caseId, rating, comment } = req.body;
    const clientId = req.user.id;

    try {
        // 1. Validate Case
        const caseDoc = await Case.findOne({ _id: caseId, clientId });
        if (!caseDoc) {
            return res.status(404).json({ message: 'Case not found or does not belong to you' });
        }

        if (caseDoc.status !== 'CLOSED') {
            return res.status(400).json({ message: 'You can only review closed cases' });
        }

        // 2. Check existing review
        const existing = await Review.findOne({ caseId });
        if (existing) {
            return res.status(400).json({ message: 'Review already exists for this case' });
        }

        // 3. Create Review
        const review = await Review.create({
            caseId,
            lawyerId: caseDoc.assignedLawyerId,
            clientId,
            rating,
            comment
        });

        // 4. Update Lawyer Average Rating
        const lawyerReviews = await Review.find({ lawyerId: caseDoc.assignedLawyerId });
        const avgRating = lawyerReviews.reduce((acc, r) => acc + r.rating, 0) / lawyerReviews.length;

        await Lawyer.findByIdAndUpdate(caseDoc.assignedLawyerId, { rating: avgRating });

        res.status(201).json(review);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getLawyerReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ lawyerId: req.params.lawyerId })
            .populate('clientId', 'name profileImage') // Show client info
            .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.find()
            .populate('clientId', 'name')
            .populate('lawyerId', 'name')
            .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
