const express = require("express");
const multer = require("multer");
const path = require("path");
const { exec } = require("child_process");
const fs = require("fs");

const app = express();
const PPT_PORT = process.env.PPT_PORT || 9090;
// http://localhost:9090/

const UPLOAD_FOLDER = "uploads";
const CONVERTED_FOLDER = "converted";

// Ensure folders exist
fs.mkdirSync(UPLOAD_FOLDER, { recursive: true });
fs.mkdirSync(CONVERTED_FOLDER, { recursive: true });


app.set("view engine", "ejs");
app.use(express.static("public"));

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
  res.sendFile(path.join(__dirname, 'public/views/pptIndex.html'));
});

app.post("/convert", upload.single("ppt"), (req, res) => {
  if (!req.file) return res.status(400).send("No file uploaded.");

    const inputPath = path.join(__dirname, UPLOAD_FOLDER, req.file.filename);
    const outputFilename = req.file.filename.replace(/\.(pptx|ppt)$/i, ".pdf");
    const outputPath = path.join(__dirname, CONVERTED_FOLDER, outputFilename);


  exec(`soffice --headless --convert-to pdf "${inputPath}" --outdir "${CONVERTED_FOLDER}"`, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).send("Error converting file.");
    }

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
app.listen(PPT_PORT, '0.0.0.0', () => console.log(`Server running on http://localhost:${PPT_PORT}`));
