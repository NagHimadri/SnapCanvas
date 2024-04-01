const multer = require('multer');
const {v4: uuidv4} = require("uuid");
const path = require("path");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/images/uploads') //The image should be save in this folder
    },
    filename: function (req, file, cb) {
      const unique = uuidv4(); //Generating a unique filename using uuid
      cb(null, unique + path.extname(file.originalname)); //Upload the unique filename after adding extension to the unique filename
    }
  })
  
const upload = multer({ storage: storage })

module.exports = upload;