// backend/shared/utils/matchmaking.service.js
exports.matchLawyers = (keywords = []) => {
    // Basic regex-based matching for now
    // Returns a MongoDB query object
    if (!keywords || keywords.length === 0) return {};

    return {
        specialization: {
            $in: keywords.map(k => new RegExp(k, 'i'))
        }
    };
};
