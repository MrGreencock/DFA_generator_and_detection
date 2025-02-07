const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors"); 
const multer = require("multer");
const { spawn } = require("child_process");
const path = require("path");

const app = express();
app.use(cors()); 
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const storage = multer.diskStorage({
    destination: "uploads/",  // Store files in "uploads/" directory
    filename: (req, file, cb) => {
        cb(null, file.originalname); 
    }
});
const upload = multer({ storage: storage });

app.post("/upload-dfa", upload.single("dfa_image"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No image uploaded" });
    }

    console.log("Processing uploaded image:", req.file.path);

    // Call Python script with the filename
    const pythonProcess = spawn("python", ["dfa_image_to_regex.py", req.file.path]);

    let output = "";
    let errorOutput = "";

    pythonProcess.stdout.on("data", (data) => {
        output += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
        console.error("Python Error Output:", data.toString());
        errorOutput += data.toString();
    });

    pythonProcess.on("close", (code) => {
        if (code === 0) {
            res.json({ regex: output.trim() });
        } else {
            res.status(500).json({ error: "Failed to process image", details: errorOutput });
        }
    });
});

app.post("/generate-dfa", (req, res) => {
    const regex = req.body.regex;

    if (!regex) {
        return res.status(400).json({ error: "No regex provided" });
    }

    const pythonProcess = spawn("python", ["dfa.py"], { cwd: __dirname });

    let output = "";
    let errorOutput = "";

    pythonProcess.stdin.write(regex);
    pythonProcess.stdin.end();

    pythonProcess.stdout.on("data", (data) => {
        output += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
        console.error("Python Error Output:", data.toString());
        errorOutput += data.toString();
    });

    pythonProcess.on("close", (code) => {
        if (code === 0) {
            const imagePath = path.join(__dirname, "dfa_graph.png");
            res.sendFile(imagePath);
        } else {
            console.error("Python script error:", errorOutput);
            res.status(500).json({ error: "Failed to generate DFA graph", details: errorOutput });
        }
    });
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
