const fileInput = document.getElementById('fileInput');
const addButton = document.getElementById('addButton');
const convertButton = document.getElementById('convertButton');
const progress = document.getElementById('progress');
const imageList = document.getElementById('imageList');
const uploadArea = document.getElementById('uploadArea');
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
    handleFiles(files);
});

fileInput.addEventListener('change', () => {
    handleFiles(fileInput.files);
});

function handleFiles(files) {
    if (files.length === 0) return;

    Array.from(files).forEach(file => {
        if (!file.type.startsWith('image/')) {
            alert('Please select only image files.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const imageItem = document.createElement('div');
            imageItem.className = 'image-item';

            const img = document.createElement('img');
            img.src = e.target.result;

            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-btn';
            removeBtn.innerHTML = '×';
            removeBtn.onclick = () => {
                imageItem.remove();
                updateConvertButton();
            };

            imageItem.appendChild(img);
            imageItem.appendChild(removeBtn);
            imageList.appendChild(imageItem);
            updateConvertButton();
        };
        reader.readAsDataURL(file);
    });
}

function updateConvertButton() {
    convertButton.disabled = imageList.children.length === 0;
}

async function getImageData(dataUrl) {
    const res = await fetch(dataUrl);
    return new Uint8Array(await res.arrayBuffer());
}

convertButton.addEventListener('click', async () => {
    if (imageList.children.length === 0) return;

    progress.textContent = 'Converting images to PDF...';
    convertButton.disabled = true;

    try {
        const pdfDoc = await PDFLib.PDFDocument.create();

        for (let i = 0; i < imageList.children.length; i++) {
            const img = imageList.children[i].querySelector('img');
            const imageBytes = await getImageData(img.src);

            let pdfImage;
            if (img.src.startsWith('data:image/jpeg')) {
                pdfImage = await pdfDoc.embedJpg(imageBytes);
            } else {
                pdfImage = await pdfDoc.embedPng(imageBytes);
            }

            const page = pdfDoc.addPage([pdfImage.width, pdfImage.height]);
            page.drawImage(pdfImage, {
                x: 0,
                y: 0,
                width: pdfImage.width,
                height: pdfImage.height,
            });

            progress.textContent = `Processing image ${i + 1} of ${imageList.children.length}...`;
        }

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = 'converted.pdf';
        link.click();

        progress.textContent = 'PDF created successfully!';
        setTimeout(() => {
            progress.textContent = '';
            URL.revokeObjectURL(url);
        }, 3000);

    } catch (error) {
        console.error('Error creating PDF:', error);
        progress.textContent = 'Error creating PDF. Please try again.';
    } finally {
        convertButton.disabled = false;
    }
});