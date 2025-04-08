const express = require('express');
const path = require('path');
const app = express();
const { spawn } = require('child_process');
const multer = require("multer");
const { exec } = require("child_process");
const fs = require("fs");
const { createServer } = require("http");

const PORT = process.env.PORT || 3000; // Use Railway’s assigned port

const UPLOAD_FOLDER = "uploads";
const CONVERTED_FOLDER = "converted";

// Ensure folders exist
fs.mkdirSync(UPLOAD_FOLDER, { recursive: true });
fs.mkdirSync(CONVERTED_FOLDER, { recursive: true });

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configure file upload
const storage = multer.diskStorage({
    destination: UPLOAD_FOLDER,
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});
const upload = multer({ storage });

// Render HTML files as templates (allows variables)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/views/index.html'));
});

// Doc Index Html File
app.get("/docIndex", (req, res) => {
    res.sendFile(path.join(__dirname, 'public/views/docIndex.html'));
});

// Doc Index Handle file upload and conversion
app.post("/docConvert", upload.single("file"), (req, res) => {
    if (!req.file) return res.status(400).send("No file uploaded.");

    const inputPath = path.join(__dirname, UPLOAD_FOLDER, req.file.filename);
    const outputFilename = req.file.filename.replace(/\.docx?$/, ".pdf");
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

// Excel Index Html File
app.get("/excelIndex", (req, res) => {
    res.sendFile(path.join(__dirname, 'public/views/excelIndex.html'));
});

// Excel Index Handle file upload and conversion

app.post("/excelConvert", upload.single("excel"), (req, res) => {
    if (!req.file) return res.status(400).send("No file uploaded.");

    const inputPath = path.join(__dirname, UPLOAD_FOLDER, req.file.filename);
    const outputFilename = req.file.filename.replace(/\.(xls|xlsx)$/, ".pdf");
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



// PPT Index Html File
app.get("/pptIndex", (req, res) => {
    res.sendFile(path.join(__dirname, 'public/views/pptIndex.html'));
});

// Ppt Index Handle file upload and conversion
app.post("/pptConvert", upload.single("ppt"), (req, res) => {
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



app.listen(PORT, '0.0.0.0', () => console.log(`Server running on http://localhost:${PORT}`));
