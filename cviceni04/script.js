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
                    var histCanvas = document.getElementById("histogram");
                    var histContext = histCanvas.getContext("2d");
                    histContext.fillstyle = "blue";

                    // Change size of canvas
                    srcCanvas.height = histCanvas.height = srcImg.height;
                    srcCanvas.width = histCanvas.width = srcImg.width;

                    srcContext.drawImage(srcImg, 0, 0);

                    var canvasHeight = srcCanvas.height;
                    var canvasWidth = srcCanvas.width;
                    var srcImageData = srcContext.getImageData(0, 0, canvasWidth, canvasHeight);

                    /*var histHeight = histCanvas.height;
                    var histWidth = histCanvas.width;
                    var histImageData = histContext.getImageData(0, 0, histWidth, histHeight);*/

                    convertImageData(srcImageData, histContext);

                    //histContext.putImageData(histImageData, 0, 0);
                }
            }
        })(files[i]);

        reader.readAsDataURL(files[i]);

        break;
    };
};


// Function for converting raw data of image
function convertImageData(srcImageData, histContext) {
    var srcData = srcImageData.data;
    //var histData = histImageData.data;

    histogram = [];

    // Go through the image using x,y coordinates
    var red, green, blue, gray;

    for (i = 0; i < 256; i++) {
        histogram[i] = 0;
    }

    for (var pixelIndex = 0; pixelIndex < srcData.length; pixelIndex += 4) {
        red = srcData[pixelIndex + 0];
        green = srcData[pixelIndex + 1];
        blue = srcData[pixelIndex + 2];
        gray = Math.round(0.299 * red + 0.587 * green + 0.114 * blue);
        histogram[gray] = histogram[gray] + 1;
    }

    histogramMax = Math.max(...histogram);

    // Draw histogram to canvas element as 512x512 pixels
    for (var i = 0; i < 256; i++) {
        histContext.beginPath();
        histContext.moveTo(2 * i, 512);
        histContext.lineTo(2 * i, 512 - Math.round(512 * histogram[i] / histogramMax));
        histContext.strokesStyle = "black";
        histContext.closePath();
        histContext.stroke();
    }
}