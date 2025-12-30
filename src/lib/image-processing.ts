/**
 * Process an image file to improve OCR accuracy.
 * Applies grayscale, contrast increase, and binarization.
 */
export async function processImageForOcr(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                URL.revokeObjectURL(url);
                return reject(new Error("Could not get canvas context"));
            }

            // Set canvas dimensions
            canvas.width = img.width;
            canvas.height = img.height;

            // Draw original image
            ctx.drawImage(img, 0, 0);

            // Get image data
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            // Apply Grayscale & Contrast
            // Formula: factor = (259 * (contrast + 255)) / (255 * (259 - contrast))
            // Contrast value around 50-100 usually good for text
            const contrast = 50;
            const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

            for (let i = 0; i < data.length; i += 4) {
                // Grayscale
                const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;

                // Contrast
                let cValue = factor * (avg - 128) + 128;

                // Clamping
                if (cValue > 255) cValue = 255;
                if (cValue < 0) cValue = 0;

                // Binarization (Thresholding)
                // If distinct black/white is needed:
                // cValue = cValue > 128 ? 255 : 0;

                data[i] = cValue;     // R
                data[i + 1] = cValue; // G
                data[i + 2] = cValue; // B
            }

            ctx.putImageData(imageData, 0, 0);

            // Return as Base64
            const base64 = canvas.toDataURL('image/jpeg', 0.9);
            URL.revokeObjectURL(url);
            resolve(base64);
        };

        img.onerror = (err) => {
            URL.revokeObjectURL(url);
            reject(err);
        };

        img.src = url;
    });
}
