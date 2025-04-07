const fileInput = document.getElementById('fileInput');
const addButton = document.getElementById('addButton');
const rotateLeft = document.getElementById('rotateLeft');
const rotateRight = document.getElementById('rotateRight');
const saveButton = document.getElementById('saveButton');
const progress = document.getElementById('progress');
const pageGrid = document.getElementById('pageGrid');
const uploadArea = document.getElementById('uploadArea');
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
  

// Initialize PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js';

let pdfDocument = null;
let pageRotations = {};

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

// File input handling
addButton.addEventListener('click', () => {
    fileInput.click();
});

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) handleFile(files[0]);
});

fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
        handleFile(fileInput.files[0]);
    }
});

async function handleFile(file) {
    if (!file.type.includes('pdf')) {
        alert('Please select a PDF file.');
        return;
    }

    progress.textContent = 'Loading PDF...';
    pageGrid.innerHTML = '';
    pageRotations = {};
    
    try {
        const arrayBuffer = await file.arrayBuffer();
        pdfDocument = await pdfjsLib.getDocument(arrayBuffer).promise;
        
        for (let i = 1; i <= pdfDocument.numPages; i++) {
            const page = await pdfDocument.getPage(i);
            const viewport = page.getViewport({ scale: 0.5 });
            
            const pageItem = document.createElement('div');
            pageItem.className = 'page-item';
            pageItem.dataset.pageNumber = i;
            
            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            
            const context = canvas.getContext('2d');
            await page.render({
                canvasContext: context,
                viewport: viewport
            }).promise;
            
            const pageNumber = document.createElement('div');
            pageNumber.className = 'page-number';
            pageNumber.textContent = i;
            
            pageItem.appendChild(canvas);
            pageItem.appendChild(pageNumber);
            pageGrid.appendChild(pageItem);
            
            pageRotations[i] = 0;
        }
        
        progress.textContent = '';
        rotateLeft.disabled = false;
        rotateRight.disabled = false;
        saveButton.disabled = false;
        
    } catch (error) {
        console.error('Error loading PDF:', error);
        progress.textContent = 'Error loading PDF. Please try again.';
    }
}

rotateLeft.addEventListener('click', () => rotatePages(-90));
rotateRight.addEventListener('click', () => rotatePages(90));

function rotatePages(angle) {
    const selectedPages = document.querySelectorAll('.page-item.selected');
    if (selectedPages.length === 0) {
        alert('Please select at least one page to rotate.');
        return;
    }

    selectedPages.forEach(pageItem => {
        const pageNumber = parseInt(pageItem.dataset.pageNumber);
        pageRotations[pageNumber] = (pageRotations[pageNumber] + angle + 360) % 360;
        
        const canvas = pageItem.querySelector('canvas');
        canvas.style.transform = `rotate(${pageRotations[pageNumber]}deg)`;
    });
}

pageGrid.addEventListener('click', (e) => {
    const pageItem = e.target.closest('.page-item');
    if (!pageItem) return;
    
    if (e.ctrlKey) {
        pageItem.classList.toggle('selected');
    } else {
        document.querySelectorAll('.page-item.selected').forEach(item => {
            item.classList.remove('selected');
        });
        pageItem.classList.add('selected');
    }
});

saveButton.addEventListener('click', async () => {
    if (!pdfDocument) return;

    progress.textContent = 'Creating modified PDF...';
    saveButton.disabled = true;

    try {
        const pdfDoc = await PDFLib.PDFDocument.create();
        const pages = await pdfDoc.copyPages(await PDFLib.PDFDocument.load(await fileInput.files[0].arrayBuffer()), Array.from({ length: pdfDocument.numPages }, (_, i) => i));

        for (let i = 0; i < pages.length; i++) {
            const page = pages[i];
            const rotation = pageRotations[i + 1] || 0;
            page.setRotation(PDFLib.degrees(rotation));
            pdfDoc.addPage(page);
        }

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = 'rotated.pdf';
        link.click();

        progress.textContent = 'PDF saved successfully!';
        setTimeout(() => {
            progress.textContent = '';
            URL.revokeObjectURL(url);
        }, 3000);
    } catch (error) {
        console.error('Error saving PDF:', error);
        progress.textContent = 'Error saving PDF. Please try again.';
    } finally {
        saveButton.disabled = false;
    }
});