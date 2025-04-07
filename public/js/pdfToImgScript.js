const fileInput = document.getElementById('file');
const addButton = document.getElementById('addButton');
const convertButton = document.getElementById('convertButton');
const progress = document.getElementById('progress');
const imageContainer = document.getElementById('imageContainer');
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

fileInput.addEventListener('change', (e) => {
    selectedFile = e.target.files[0];
    if (selectedFile) {
        addButton.textContent = selectedFile.name;
        convertButton.disabled = false;
    }
});

// Convert PDF to images
convertButton.addEventListener('click', async () => {
    if (!selectedFile) {
        alert('Please select a PDF file first.');
        return;
    }

    progress.textContent = 'Converting PDF to images...';
    imageContainer.innerHTML = '';
    convertButton.disabled = true;

    try {
        const pdf = await pdfjsLib.getDocument(URL.createObjectURL(selectedFile)).promise;
        const totalPages = pdf.numPages;

        for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
            progress.textContent = `Converting page ${pageNum} of ${totalPages}...`;

            const page = await pdf.getPage(pageNum);
            const viewport = page.getViewport({ scale: 1.5 });

            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({
                canvasContext: context,
                viewport: viewport
            }).promise;

            // Create image item container
            const imageItem = document.createElement('div');
            imageItem.className = 'image-item';

            // Convert canvas to image and add download button
            canvas.toBlob((blob) => {
                const img = document.createElement('img');
                const url = URL.createObjectURL(blob);
                img.src = url;

                const downloadBtn = document.createElement('a');
                downloadBtn.href = url;
                downloadBtn.download = `page_${pageNum}.png`;
                downloadBtn.className = 'download-btn';
                downloadBtn.textContent = 'Download Image';

                imageItem.appendChild(img);
                imageItem.appendChild(downloadBtn);
                imageContainer.appendChild(imageItem);
            }, 'image/png');
        }

        progress.textContent = 'Conversion completed! Click on each image to download.';
        convertButton.disabled = false;

    } catch (error) {
        console.error('Error converting PDF:', error);
        progress.textContent = 'Error converting PDF. Please try again.';
        convertButton.disabled = false;
    }
});