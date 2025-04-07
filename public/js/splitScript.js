const fileInput = document.getElementById('file');
const addButton = document.getElementById('addButton');
const splitButton = document.getElementById('splitButton');
const startPage = document.getElementById('startPage');
const endPage = document.getElementById('endPage');
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

let selectedFile = null;

// Handle file selection
addButton.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', async (e) => {
    selectedFile = e.target.files[0];
    if (selectedFile) {
        addButton.textContent = selectedFile.name;
        splitButton.disabled = false;
        
        // Load the PDF to get page count
        const arrayBuffer = await selectedFile.arrayBuffer();
        const pdf = await PDFLib.PDFDocument.load(arrayBuffer);
        const pageCount = pdf.getPageCount();
        
        // Update input max values
        startPage.max = pageCount;
        endPage.max = pageCount;
        
        // Set default values
        startPage.value = 1;
        endPage.value = pageCount;
    }
});

// Handle split operation
splitButton.addEventListener('click', async () => {
    if (!selectedFile) {
        alert('Please select a PDF file first.');
        return;
    }

    const start = parseInt(startPage.value);
    const end = parseInt(endPage.value);

    if (start > end) {
        alert('Start page cannot be greater than end page.');
        return;
    }

    progress.textContent = 'Splitting PDF...';

    try {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const pdf = await PDFLib.PDFDocument.load(arrayBuffer);
        const pageCount = pdf.getPageCount();

        if (start < 1 || end > pageCount) {
            alert(`Please enter page numbers between 1 and ${pageCount}`);
            return;
        }

        // Create new PDF with selected pages
        const newPdf = await PDFLib.PDFDocument.create();
        const pages = await newPdf.copyPages(pdf, Array.from({length: end - start + 1}, (_, i) => start - 1 + i));
        pages.forEach(page => newPdf.addPage(page));

        // Save the split PDF
        const newPdfBytes = await newPdf.save();
        const blob = new Blob([newPdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);

        // Create download link
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = `split_${selectedFile.name}`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(url);

        progress.textContent = 'PDF split successfully!';
        setTimeout(() => {
            progress.textContent = '';
        }, 3000);

    } catch (error) {
        console.error('Error splitting PDF:', error);
        progress.textContent = 'Error splitting PDF. Please try again.';
    }
});