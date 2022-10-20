// Callback function called, when file is "opened"
function handleFileSelect(item, elementName) {
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
                    var srcCanvas = document.getElementById(elementName);
                    var srcContext = srcCanvas.getContext("2d");

                    // Change size of canvas
                    srcCanvas.height = srcImg.height;
                    srcCanvas.width = srcImg.width;

                    srcContext.drawImage(srcImg, 0, 0);

                    var dstCanvas = document.getElementById("result");
                    dstCanvas.height = srcImg.height;
                    dstCanvas.width = srcImg.width;

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
    };
};

//HEX to RGB
function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}


// Callback function called, when clicked at Convert button
function convertImage() {
    var personCanvas = document.getElementById("person");
    var personContext = personCanvas.getContext("2d");
    var canvasHeight = personCanvas.height;
    var canvasWidth = personCanvas.width;

    var personImageData = personContext.getImageData(0, 0, canvasWidth, canvasHeight);
    var backgroundImageData = document.getElementById("background").getContext("2d").getImageData(0, 0, canvasWidth, canvasHeight);
    var logoImageData = document.getElementById("logo").getContext("2d").getImageData(0, 0, canvasWidth, canvasHeight);
    var resultImageData = document.getElementById("result").getContext("2d").getImageData(0, 0, canvasWidth, canvasHeight);

    convertImageData(personImageData, backgroundImageData, logoImageData, resultImageData);

    document.getElementById("result").getContext("2d").putImageData(resultImageData, 0, 0);
};

// Function for converting raw data of image
function convertImageData(personImageData, backgroundImageData, logoImageData, resultImageData) {
    var personData = personImageData.data;
    var backgroundData = backgroundImageData.data;
    var logoData = logoImageData.data;
    var resultData = resultImageData.data;

    var hex_colors = document.getElementById("colorpicker").value;
    console.log(redMin);

    var redMin = hexToRgb(hex_colors).r;
    var redMax = 255;
    var greenMin = hexToRgb(hex_colors).g;
    var greenMax = 255;
    var blueMin = hexToRgb(hex_colors).b;
    var blueMax = 255;

    for (var pixelIndex = 0; pixelIndex < personData.length; pixelIndex += 4) {

        // BACKGROUND
        if ((personData[pixelIndex] >= redMin && personData[pixelIndex] <= redMax) &&
            (personData[pixelIndex + 1] >= greenMin && personData[pixelIndex + 1] <= greenMax) &&
            (personData[pixelIndex + 2] >= blueMin && personData[pixelIndex + 2] <= blueMax)) {
            resultData[pixelIndex + 0] = (backgroundData[pixelIndex + 0]);
            resultData[pixelIndex + 1] = (backgroundData[pixelIndex + 1]);
            resultData[pixelIndex + 2] = (backgroundData[pixelIndex + 2]);
            resultData[pixelIndex + 3] = (backgroundData[pixelIndex + 3]);
        } else {
            resultData[pixelIndex + 0] = (personData[pixelIndex + 0]);
            resultData[pixelIndex + 1] = (personData[pixelIndex + 1]);
            resultData[pixelIndex + 2] = (personData[pixelIndex + 2]);
            resultData[pixelIndex + 3] = (personData[pixelIndex + 3]);
        }

        // LOGO
        var grey = logoData[pixelIndex] * 0.299 + logoData[pixelIndex + 1] * 0.587 + logoData[pixelIndex + 2] * 0.144;
        if (logoData[pixelIndex + 3] > 0) {
            resultData[pixelIndex + 0] = grey + 255;
            resultData[pixelIndex + 1] = grey + 255;
            resultData[pixelIndex + 2] = grey + 255;
        }
    }
}