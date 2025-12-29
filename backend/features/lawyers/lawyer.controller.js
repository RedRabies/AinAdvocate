const Lawyer = require('./lawyer.model');
const User = require('../users/user.model');
const { matchLawyers } = require('../../shared/utils/matchmaking.service');

exports.createOrUpdateProfile = async (req, res) => {
    // Lawyer can update details BUT NOT licenseNumber directly (Assigned by Admin)
    const { bio, experienceYears, location, languages, specialization } = req.body;
    try {
        let lawyer = await Lawyer.findById(req.user.id);
        if (lawyer) {
            // Update
            lawyer.bio = bio || lawyer.bio;
            lawyer.experienceYears = experienceYears || lawyer.experienceYears;
            lawyer.location = location || lawyer.location;
            lawyer.languages = languages || lawyer.languages;
            lawyer.specialization = specialization || lawyer.specialization;
            // lawyer.licenseNumber = licenseNumber; // REMOVED: Lawyers cannot self-assign/edit license
            await lawyer.save();
            return res.json(lawyer);
        }

        return res.status(404).json({ message: 'Profile not found (Auth Error)' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const lawyer = await Lawyer.findById(req.user.id);
        if (!lawyer) return res.status(404).json({ message: 'Profile not found' });
        res.json(lawyer);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getLawyerById = async (req, res) => {
    try {
        const lawyer = await Lawyer.findById(req.params.id);
        if (!lawyer) return res.status(404).json({ message: 'Lawyer not found' });
        res.json(lawyer);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getAllLawyers = async (req, res) => {
    try {
        const { search, location, specialization } = req.query;

        // Base query: Only show Verified lawyers to the public
        let query = { isVerified: true, isBanned: false };

        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        if (location) {
            query.location = { $regex: location, $options: 'i' };
        }

        if (specialization) {
            query.specialization = { $in: [specialization] };
        }

        const lawyers = await Lawyer.find(query);
        res.json(lawyers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.verifyLawyer = async (req, res) => {
    const { licenseNumber } = req.body; // Admin passes this
    if (!licenseNumber) return res.status(400).json({ message: 'License Number is required for verification' });

    try {
        const lawyer = await Lawyer.findById(req.params.id);
        if (!lawyer) return res.status(404).json({ message: 'Lawyer not found' });

        lawyer.isVerified = true;
        lawyer.licenseNumber = licenseNumber; // Assigned by Admin
        await lawyer.save();
        res.json({ message: 'Lawyer verified and license assigned', lawyer });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getAllLawyersAdmin = async (req, res) => {
    try {
        // Return ALL lawyers, regardless of verification status
        const lawyers = await Lawyer.find();
        res.json(lawyers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
