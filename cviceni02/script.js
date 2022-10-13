// Callback function called, when file is "opened"
function handleFileSelect(item) {
    var files = item.files;

    console.log(files);

    for (var i = 0; i < files.length; i++) {
        console.log(files[i], files[i].name, files[i].size, files[i].type);

        // Only process image files.
        if (!files[i].type.match('image.*')) {
            continue;
        }

        var reader = new FileReader();

        // Closure for loading image to memory
        reader.onload = (function(file) {
            return function(evt) {

                var srcImg = new Image();
                srcImg.src = evt.target.result;

                srcImg.onload = function() {
                    var srcCanvas = document.getElementById("src");
                    var srcContext = srcCanvas.getContext("2d");

                    // Change size of canvas
                    srcCanvas.height = srcImg.height;
                    srcCanvas.width = srcImg.width;

                    srcContext.drawImage(srcImg, 0, 0);

                    var convertButton = document.getElementById("convert");
                    // Enabled button
                    convertButton.disabled = false;
                    // Add callback
                    convertButton.addEventListener('click', convertImage, false);
                }
            }
        })(files[i]);

        reader.readAsDataURL(files[i]);

        break;
    }
}


// Callback function called, when clicked at Convert button
function convertImage() {
    var srcCanvas = document.getElementById("src");
    var srcContext = srcCanvas.getContext("2d");
    var canvasHeight = srcCanvas.height;
    var canvasWidth = srcCanvas.width;

    var srcImageData = srcContext.getImageData(0, 0, canvasWidth, canvasHeight);

    convertImageData(srcImageData);

    srcContext.putImageData(srcImageData, 0, 0);
}


// Function for converting raw data of image
function convertImageData(imgData) {
    var rawData = imgData.data;

    // Go through the image using x,y coordinates
    var pixelIndex, red, green, blue, alpha;
    for (var y = 0; y < imgData.height; y++) {
        for (var x = 0; x < imgData.width; x++) {
            pixelIndex = ((imgData.width * y) + x) * 4
            red = rawData[pixelIndex + 0];
            green = rawData[pixelIndex + 1];
            blue = rawData[pixelIndex + 2];
            alpha = rawData[pixelIndex + 3];

            // Convert to greyscale using the formula BT.601
            var grey = (red * 0.299) + (green * 0.587) + (blue * 0.114);

            // Set new values
            rawData[pixelIndex + 0] = grey;
            rawData[pixelIndex + 1] = grey;
            rawData[pixelIndex + 2] = grey;
            rawData[pixelIndex + 3] = alpha;

            // Matrix Bayer 4x4 for displays with 16 colors
            var ditheringMatrix = [
                [0, 12, 3, 15],
                [8, 4, 11, 7],
                [2, 14, 1, 13],
                [10, 6, 9, 5]
            ];

            // Dithering
            var ditheringValue = ditheringMatrix[x % 4][y % 4];
            var k = 16;
            var V_in = rawData[pixelIndex + 0];
            var V_out = 0;

            if (rawData[pixelIndex] > k * ditheringValue) {
                rawData[pixelIndex] = 255;
                rawData[pixelIndex + 1] = 255;
                rawData[pixelIndex + 2] = 255;
                V_out = 255;
            } else {
                rawData[pixelIndex] = 0;
                rawData[pixelIndex + 1] = 0;
                rawData[pixelIndex + 2] = 0;
                V_out = 0;
            }

            // Floyd-Steinberg dithering
            var error = V_in - V_out;

            if (x < imgData.width - 1) {
                rawData[(y * imgData.width + (x + 1)) * 4] += (7 / 16) * error;
            }
            if (x > 0 && y < imgData.height - 1) {
                rawData[((y + 1) * imgData.width + (x - 1)) * 4] += (3 / 16) * error;
            }
            if (y < imgData.height - 1) {
                rawData[((y + 1) * imgData.width + x) * 4] += (5 / 16) * error;
            }
            if (x < imgData.width - 1 && y < imgData.height - 1) {
                rawData[((y + 1) * imgData.width + (x + 1)) * 4] += (1 / 16) * error;
            }

        }
    }
}