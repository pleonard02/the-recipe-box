const multer = require("multer");

const storage = multer.memoryStorage();

const uploadImage = multer({
    storage, 
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter: (req, file, callback) => {
        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",   
        ];

        if (allowedTypes.includes(file.mimetype)) {
            callback(null, true);
        } else {
            callback(new Error("Only JPG, PNG, and WebP images are allowed."));
        }
    }
})

module.exports = uploadImage;