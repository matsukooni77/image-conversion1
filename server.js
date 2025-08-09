const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');

const app = express();
const port = 3001; // Port changed to 3001 to avoid conflict

// Multerのセットアップ（メモリ内にファイルを保存）
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10 MB limit
});

// 静的ファイルの提供
app.use(express.static(path.join(__dirname, 'public')));

// 画像変換のルート
app.post('/convert', upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('ファイルがアップロードされていません。');
    }

    const { format = 'jpeg', quality } = req.body;
    const originalBuffer = req.file.buffer;

    try {
        const qualityValue = quality ? parseInt(quality, 10) : 80;
        let converter = sharp(originalBuffer);

        // Use a switch to handle formats explicitly
        switch (format) {
            case 'jpeg':
                converter = converter.jpeg({ quality: qualityValue });
                break;
            case 'png':
                converter = converter.png();
                break;
            case 'webp':
                converter = converter.webp({ quality: qualityValue });
                break;
            case 'gif':
                converter = converter.gif();
                break;
            case 'avif':
                converter = converter.avif({ quality: qualityValue });
                break;
            default:
                // If format is not supported, send an error
                return res.status(400).send(`Unsupported format: ${format}`);
        }

        const convertedBuffer = await converter.toBuffer();

        res.set('Content-Type', `image/${format}`);
        res.send(convertedBuffer);
    } catch (error) {
        console.error(error);
        res.status(500).send('画像の変換中にエラーが発生しました。');
    }
});

// Multerのエラーハンドリング
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).send('ファイルが大きすぎます。10MBを上限にしてください。');
        }
    }
});

// サーバーの起動
module.exports = app;