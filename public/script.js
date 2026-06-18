import { db, collection, addDoc } from "./firebase.js";

const fileInput = document.getElementById("pdfFiles");
const fileList = document.getElementById("fileList");
const stats = document.getElementById("stats");

const modal = document.getElementById("resultModal");
const mergeBtn = document.getElementById("mergeBtn");
const closeBtn = document.querySelector(".close-btn");

const downloadBtn = document.getElementById("downloadBtn");

const progressContainer =
document.getElementById(
    "progressContainer"
);

const progressBar =
document.getElementById(
    "progressBar"
);

const progressText =
document.getElementById(
    "progressText"
);

let selectedFiles = [];
let mergedPdfBlob = null;
let draggedIndex = null;

function updateProgress(
    value,
    text
){

    progressContainer.style.display =
        "block";

    progressText.style.display =
        "block";

    progressBar.style.width =
        value + "%";

    progressText.innerHTML =
        text;
}

// ==========================================
// FILE SELECTION
// ==========================================

fileInput.addEventListener("change", () => {

    selectedFiles = [...fileInput.files];

    renderFiles();

});

// ==========================================
// RENDER FILES
// ==========================================

function renderFiles() {

    fileList.innerHTML = "";

    let totalSize = 0;

    selectedFiles.forEach((file, index) => {

        totalSize += file.size;

        const card = document.createElement("div");

        card.className = "file-card";

        card.draggable = true;

        // DRAG START
        card.addEventListener("dragstart", () => {

            draggedIndex = index;

            card.classList.add("dragging");

        });

        // DRAG END
        card.addEventListener("dragend", () => {

            card.classList.remove("dragging");

        });

        // ALLOW DROP
        card.addEventListener("dragover", (e) => {

            e.preventDefault();

        });

        // DROP
        card.addEventListener("drop", () => {

            if (draggedIndex === null) return;

            const draggedFile =
                selectedFiles[draggedIndex];

            selectedFiles.splice(
                draggedIndex,
                1
            );

            selectedFiles.splice(
                index,
                0,
                draggedFile
            );

            draggedIndex = null;

            renderFiles();

        });

        card.innerHTML = `

        <div class="file-info">

            <div class="file-name">

                <span class="drag-handle">
                    ☰
                </span>

                📄 ${file.name}

            </div>

            <div class="file-size">
                ${(file.size / 1024).toFixed(1)} KB
            </div>

        </div>

        <div class="file-actions">

            <button
                class="action-btn up-btn"
                onclick="moveUp(${index})">
                ⬆️
            </button>

            <button
                class="action-btn down-btn"
                onclick="moveDown(${index})">
                ⬇️
            </button>

            <button
                class="action-btn remove-btn"
                onclick="removeFile(${index})">
                🗑️ Remove
            </button>

        </div>

        `;

        fileList.appendChild(card);

    });

    if (selectedFiles.length === 0) {

        stats.innerHTML =
            "No PDF files selected";

    } else {

        stats.innerHTML =
            `${selectedFiles.length} File(s) Selected | Total Size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`;

    }

}

// ==========================================
// FILE ACTIONS
// ==========================================

function removeFile(index) {

    selectedFiles.splice(index, 1);

    renderFiles();

}

function moveUp(index) {

    if (index === 0) return;

    [selectedFiles[index], selectedFiles[index - 1]] =
    [selectedFiles[index - 1], selectedFiles[index]];

    renderFiles();

}

function moveDown(index) {

    if (index === selectedFiles.length - 1) return;

    [selectedFiles[index], selectedFiles[index + 1]] =
    [selectedFiles[index + 1], selectedFiles[index]];

    renderFiles();

}

// Make available globally
window.removeFile = removeFile;
window.moveUp = moveUp;
window.moveDown = moveDown;

// ==========================================
// FIREBASE ANALYTICS
// ==========================================

function getBrowser() {

    const ua = navigator.userAgent;

    if (ua.includes("Edg"))
        return "Edge";

    if (ua.includes("Chrome"))
        return "Chrome";

    if (ua.includes("Firefox"))
        return "Firefox";

    if (ua.includes("Safari"))
        return "Safari";

    return "Unknown";

}

async function getCountry() {

    try {

        const response =
            await fetch(
                "https://ipapi.co/json/"
            );

        const data =
            await response.json();

        return data.country_name;

    } catch {

        return "Unknown";

    }

}

async function saveMergeStats() {

    try {

        const country =
            await getCountry();

        const browser =
            getBrowser();

        await addDoc(
            collection(
                db,
                "merges"
            ),
            {
                country,
                browser,
                pdfCount:
                    selectedFiles.length,

                timestamp:
                    new Date()
                    .toISOString()
            }
        );

        console.log(
            "Merge Logged"
        );

    } catch(error) {

        console.error(error);

    }

}

// ==========================================
// MERGE PDF
// ==========================================

mergeBtn.addEventListener(
    "click",
    async () => {

        if (
            selectedFiles.length < 2
        ) {

            alert(
                "Please select at least 2 PDF files."
            );

            return;

        }

        try {

            mergeBtn.innerHTML =
                "Merging PDFs...";

            mergeBtn.disabled =
                true;

            const formData =
                new FormData();

            selectedFiles.forEach(
                file => {

                    formData.append(
                        "pdfs",
                        file
                    );

                }
            );

            // SHOW PROGRESS BAR

            updateProgress(
                10,
                "Preparing PDFs..."
            );

            setTimeout(() => {

                updateProgress(
                    35,
                    "Uploading files..."
                );

            }, 500);

            setTimeout(() => {

                updateProgress(
                    60,
                    "Merging PDFs..."
                );

            }, 1000);

            setTimeout(() => {

                updateProgress(
                    85,
                    "Finalizing PDF..."
                );

            }, 1500);

            const response =
                await fetch(
                    "/merge",
                    {
                        method: "POST",
                        body: formData
                    }
                );

            if (!response.ok) {

                throw new Error(
                    "Merge failed"
                );

            }

            mergedPdfBlob =
                await response.blob();

            // Make the bar visible
            await new Promise(
                resolve =>
                    setTimeout(
                        resolve,
                        700
                    )
            );

            updateProgress(
                100,
                "Merge Complete!"
            );

            await saveMergeStats();

            modal.style.display =
                "flex";

            mergeBtn.innerHTML =
                "Merge PDFs";

            mergeBtn.disabled =
                false;

        } catch (error) {

            console.error(error);

            alert(
                "Error merging PDFs."
            );

            mergeBtn.innerHTML =
                "Merge PDFs";

            mergeBtn.disabled =
                false;

        }

    }
);

// ==========================================
// DOWNLOAD PDF
// ==========================================

downloadBtn.addEventListener(
    "click",
    () => {

        const url =
            URL.createObjectURL(
                mergedPdfBlob
            );

        const a =
            document.createElement(
                "a"
            );

        a.href = url;

        a.download =
            "merged.pdf";

        document.body.appendChild(
            a
        );

        a.click();

        a.remove();

        URL.revokeObjectURL(
            url
        );

        modal.style.display =
            "none";

        setTimeout(() => {

            progressBar.style.width =
                "0%";

            progressContainer.style.display =
                "none";

            progressText.style.display =
                "none";

            progressText.innerHTML =
                "";

        }, 1000);

    }
);

// ==========================================
// CLOSE MODAL
// ==========================================

closeBtn.addEventListener(
    "click",
    () => {

        modal.style.display =
            "none";

    }
);

window.addEventListener(
    "click",
    (e) => {

        if (
            e.target === modal
        ) {

            modal.style.display =
                "none";

        }

    }
);