const form = document.getElementById('upload-form');
const imageInput = document.getElementById('image'); // Get image input element
const formatSelect = document.getElementById('format');
const qualityGroup = document.getElementById('quality-group');
const qualityInput = document.getElementById('quality');
const qualityValueSpan = document.getElementById('quality-value');
const resultDiv = document.getElementById('result');
const convertedImage = document.getElementById('converted-image');
const downloadButton = document.getElementById('download-button');

const QUALITY_FORMATS = ['jpeg', 'webp', 'avif'];

// Show/hide quality slider based on format
formatSelect.addEventListener('change', () => {
    const selectedFormat = formatSelect.value;
    if (QUALITY_FORMATS.includes(selectedFormat)) {
        qualityGroup.classList.remove('hidden');
    } else {
        qualityGroup.classList.add('hidden');
    }
});

// Update quality value display
qualityInput.addEventListener('input', () => {
    qualityValueSpan.textContent = qualityInput.value;
});

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const imageFile = formData.get('image');
    const format = formData.get('format');

    if (!imageFile || imageFile.size === 0) {
        alert('画像ファイルを選択してください。');
        return;
    }

    // Append quality if applicable
    if (QUALITY_FORMATS.includes(format)) {
        formData.append('quality', qualityInput.value);
    }

    try {
        const response = await fetch('/convert', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('変換に失敗しました。');
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        // Create unique filename
        const originalFile = imageInput.files[0];
        const originalName = originalFile.name.split('.').slice(0, -1).join('.');
        const now = new Date();
        const timestamp = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}`;
        const newFilename = `${originalName}_${timestamp}.${format}`;

        convertedImage.src = url;
        downloadButton.href = url;
        downloadButton.download = newFilename;
        resultDiv.classList.remove('hidden');

    } catch (error) {
        console.error(error);
        alert(error.message);
    }
});