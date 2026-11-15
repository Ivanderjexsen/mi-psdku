
const fs = require('fs');
const path = require('path');
const db = require('./config/db');

const products = [
    { id: 1, image: 'catalog/keyboard.jpg' },
    { id: 2, image: 'catalog/mouse-final.jpg' },
    { id: 3, image: 'catalog/monitor.jpg' },
    { id: 4, image: 'catalog/ssd.jpg' },
    { id: 5, image: 'catalog/stand-laptop.jpg' },
    { id: 6, image: 'catalog/laptop.jpg' },
];

async function updateImages() {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        for (const product of products) {
            const imagePath = path.join(
                __dirname,
                'assets',
                product.image
            );

            if (!fs.existsSync(imagePath)) {
                throw new Error(`File tidak ditemukan: ${product.image}`);
            }

            const imageBuffer = fs.readFileSync(imagePath);

            if (imageBuffer.length > 2 * 1024 * 1024) {
                throw new Error(`Gambar terlalu besar: ${product.image}`);
            }

            const base64 = imageBuffer.toString('base64');

            await connection.execute(
                'UPDATE products SET image = ? WHERE id = ?',
                [base64, product.id]
            );

            console.log(`Produk ID ${product.id}: ${product.image} berhasil diperbarui`);
        }

        await connection.commit();
        console.log('\nSemua gambar berhasil diperbarui.');
    } catch (error) {
        await connection.rollback();
        console.error('Pembaruan gagal:', error.message);
        process.exitCode = 1;
    } finally {
        connection.release();
        await db.end();
    }
}

updateImages();
    