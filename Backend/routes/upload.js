// const express = require("express");
// const router = express.Router();
// const multer = require("multer");
// const Note = require("../models/Note");

// // storage
// const storage = multer.diskStorage({
//   destination: "./uploads",
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + ".pdf");
//   }
// });

// const upload = multer({ storage });

// router.post("/", upload.single("file"), async (req, res) => {
//   const filePath = `http://10.131.96.240:5000/uploads/${req.file.filename}`;

//   // DB में save
//   const note = await Note.create({
//     title: req.file.originalname,
//     fileUrl: filePath
//   });

//   res.json(note);
// });

// module.exports = router;




const express = require("express");
const router = express.Router();
const multer = require("multer");
const bucket = require("../firebase");
const Note = require("../models/Note");

const upload = multer({ storage: multer.memoryStorage() });

router.post("/", upload.single("file"), async (req, res) => {
  try {
    const fileName = Date.now() + ".pdf";
    const file = bucket.file(fileName);

    await file.save(req.file.buffer, {
      metadata: {
        contentType: req.file.mimetype
      }
    });

    const fileUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;

    // MongoDB में save
    const note = await Note.create({
      title: req.file.originalname,
      fileUrl
    });

    res.json(note);

  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Upload failed" });
  }
});

module.exports = router;