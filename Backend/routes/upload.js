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

const upload = multer({ storage: multer.memoryStorage() });

router.post("/", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;

    const fileName = Date.now() + "-" + file.originalname;

    const fileUpload = bucket.file("pdfs/" + fileName);

    const stream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });

    stream.on("error", (err) => {
      res.status(500).json({ error: err });
    });

    stream.on("finish", async () => {
      // Public URL generate
      await fileUpload.makePublic();

      const fileUrl = `https://storage.googleapis.com/${bucket.name}/pdfs/${fileName}`;

      // MongoDB me save karo
      // Example:
      // await Note.create({ title: req.body.title, fileUrl });

      res.json({ url: fileUrl });
    });

    stream.end(file.buffer);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;