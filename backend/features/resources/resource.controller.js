const Resource = require('./resource.model');

exports.createResource = async (req, res) => {
    try {
        const resource = await Resource.create({ ...req.body, addedBy: req.user.id });
        res.status(201).json(resource);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getAllResources = async (req, res) => {
    const { category, language } = req.query;
    const query = {};
    if (category) query.category = category;
    if (language) query.language = language;

    try {
        const resources = await Resource.find(query);
        res.json(resources);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getResourceById = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);
        if (!resource) return res.status(404).json({ message: 'Resource not found' });
        res.json(resource);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteResource = async (req, res) => {
    try {
        await Resource.findByIdAndDelete(req.params.id);
        res.json({ message: 'Resource deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
