const express = require("express");
const multer = require("multer");
const PDFMerger = require("pdf-merger-js").default;
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(express.static("public"));

const upload = multer({
    dest: "uploads/"
});

app.post("/merge", upload.array("pdfs"), async (req, res) => {

    try {

        let merger = new PDFMerger();

        for (const file of req.files) {
            await merger.add(file.path);
        }

        const outputFile =
            `merged/${uuidv4()}.pdf`;

        await merger.save(outputFile);

        res.download(outputFile, "merged.pdf", () => {

            req.files.forEach(file => {
                fs.unlinkSync(file.path);
            });

            setTimeout(() => {

                if(fs.existsSync(outputFile)){
                    fs.unlinkSync(outputFile);
                }

            }, 5000);

        });

    } catch (error) {

        console.error(error);

        res.status(500).send("Merge failed.");

    }

});

app.listen(3000, () => {

    console.log(
        "Server running on http://localhost:3000"
    );

});