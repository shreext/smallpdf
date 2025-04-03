
const express = require("express");
const multer = require("multer");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 8080; // Use Railway’s assigned port


const UPLOAD_FOLDER = "uploads";
const CONVERTED_FOLDER = "converted";

// Ensure folders exist
fs.mkdirSync(UPLOAD_FOLDER, { recursive: true });
fs.mkdirSync(CONVERTED_FOLDER, { recursive: true });

app.use(express.static("public"));
app.set("view engine", "ejs");

// Configure file upload
const storage = multer.diskStorage({
  destination: UPLOAD_FOLDER,
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

// Home route with file upload form
app.get("/", (req, res) => {
  res.render("index");
});

// Handle file upload and conversion
app.post("/convert", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).send("No file uploaded.");

  const inputPath = path.join(__dirname, UPLOAD_FOLDER, req.file.filename);
  const outputFilename = req.file.filename.replace(".docx", ".pdf");
  const outputPath = path.join(__dirname, CONVERTED_FOLDER, outputFilename);

  // Run LibreOffice conversion command
  exec(`soffice --headless --convert-to pdf "${inputPath}" --outdir "${CONVERTED_FOLDER}"`, (error, stdout, stderr) => {
    if (error) return res.status(500).send("Conversion failed.");

    // Delete the DOCX file after conversion
    fs.unlink(inputPath, (err) => {
      if (err) {
        console.error("Error deleting file:", err);
      } else {
        console.log(`Deleted: ${inputPath}`);
      }
    });

    res.download(outputPath, (err) => {
      if (err) {
        console.error("Error sending file:", err);
      } else {
        fs.unlink(outputPath, (err) => {
          if (err) console.error("Error deleting converted PDF:", err);
          else console.log(`Deleted: ${outputPath}`);
        });
      }
    });

  });
});


// Start the server
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on http://localhost:${PORT}`));

// C:\Program Files\Docker\Docker\resources\bin