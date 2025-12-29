const multer = require('multer');
const path = require('path');

// Set storage engine
const storage = multer.diskStorage({
    destination: './uploads/', // Make sure this folder exists
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Check file type
function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    console.log('Checking file:', file.originalname, 'Mime:', file.mimetype);
    console.log('Ext match:', extname, 'Mime match:', mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error(`Error: File type not supported. Allowed: JPEG, JPG, PNG, GIF. Got: ${file.originalname}`));
    }
}

// Init upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 5000000 }, // 5MB limit
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
});

module.exports = upload;
