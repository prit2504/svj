const multer = require("multer");

// store file temporarily in memory
const storage = multer.memoryStorage();

const upload = multer({ storage });

module.exports = upload;
