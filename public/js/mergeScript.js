const fileInput = document.getElementById('file');
const pdfList = document.getElementById('pdfList');
const addButton = document.getElementById('addButton');
const mergeButton = document.getElementById('mergeButton');
const progress = document.getElementById('progress');
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

// Hamburger menu functionality
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !navLinks.contains(e.target) && navLinks.classList.contains('active')) {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
    }
});

let pdfFiles = []; // Store uploaded PDF files

// Function to display uploaded PDFs
function displayPDFs() {
    pdfList.innerHTML = ''; // Clear the list
    pdfFiles.forEach((file, index) => {
        const pdfItem = document.createElement('div');
        pdfItem.className = 'pdf-item';

        // PDF header with name and remove button
        const pdfHeader = document.createElement('div');
        pdfHeader.className = 'pdf-item-header';
        pdfHeader.innerHTML = `
            <span>${file.name}</span>
            <button onclick="removePDF(${index})">×</button>
        `;

        // PDF viewer container
        const pdfViewer = document.createElement('div');
        pdfViewer.className = 'pdf-viewer';
        pdfViewer.id = `pdfViewer-${index}`;

        pdfItem.appendChild(pdfHeader);
        pdfItem.appendChild(pdfViewer);
        pdfList.appendChild(pdfItem);

        // Render the first page of the PDF
        renderFirstPage(file, pdfViewer);
    });

    // Enable/disable the merge button
    mergeButton.disabled = pdfFiles.length === 0;
}

// Function to render the first page of a PDF
async function renderFirstPage(file, container) {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    // Render only the first page
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 0.5 }); // Scale down the page
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    // Render the page into the canvas
    await page.render({ canvasContext: context, viewport }).promise;
    container.appendChild(canvas);
}

// Function to remove a PDF file
window.removePDF = (index) => {
    pdfFiles.splice(index, 1); // Remove the file from the array
    displayPDFs(); // Update the displayed list
};

// Function to add more PDF files
fileInput.addEventListener('change', () => {
    const files = Array.from(fileInput.files);
    pdfFiles = pdfFiles.concat(files); // Add new files to the array
    displayPDFs(); // Update the displayed list
});

addButton.addEventListener('click', () => {
    fileInput.click(); // Trigger the file input
});

// Function to merge PDFs
mergeButton.addEventListener('click', async () => {
    if (pdfFiles.length === 0) {
        alert('Please upload at least one PDF file.');
        return;
    }

    progress.textContent = 'Merging PDFs...';

    try {
        const mergedPdf = await PDFLib.PDFDocument.create();

        // Loop through each PDF file
        for (const file of pdfFiles) {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
            const pages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
            pages.forEach(page => mergedPdf.addPage(page));
        }

        // Save the merged PDF
        const mergedPdfBytes = await mergedPdf.save();

        // Download the merged PDF
        const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'merged.pdf';
        link.click();

        progress.textContent = 'PDFs merged and downloaded!';
    } catch (error) {
        progress.textContent = 'Error merging PDFs: ' + error.message;
    }
});

// Add drag and drop functionality
const uploadArea = document.getElementById('uploadArea');

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#4CAF50';
});

uploadArea.addEventListener('dragleave', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#e0e0e0';
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#e0e0e0';
    
    const files = Array.from(e.dataTransfer.files).filter(file => file.type === 'application/pdf');
    if (files.length > 0) {
        pdfFiles = pdfFiles.concat(files);
        displayPDFs();
    }
});