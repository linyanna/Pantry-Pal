/********* Barcode Detection API *********/

// check compatibility
if (!("BarcodeDetector" in window)) {
  console.log("Barcode Detector is not supported by this browser.");
} else {
  console.log("Barcode Detector supported!");
}

function checkCompatibility() {
  // check supported types
  BarcodeDetector.getSupportedFormats().then((supportedFormats) => {
    supportedFormats.forEach((format) => console.log(format));
  });
}

// create new detector
const barcodeDetector = new BarcodeDetector({
  formats: [
    'aztec',
    'code_128',
    'code_39',
    'code_93',
    'codabar',
    'data_matrix',
    'ean_13',
    'ean_8',
    'itf',
    'pdf417',
    'qr_code',
    'upc_a',
    'upc_e'
  ]
});

// set the image path
const image = "/resources/images/phone_test1.jpg"

// get barcode value from image
async function getImage(image) {
  let blob = await fetch(image).then((res) => res.blob());
  barcodeDetector
  .detect(await createImageBitmap(blob))
  .then((barcodes) => {
    barcodes.forEach((barcode) => {
      getFood(barcode.rawValue.toString());
    });
  })
  .catch((err) => {
    console.log(err);
  });
}

/********* Open Food Facts API *********/
async function getFood(barcode) {
  let foodInfo = await fetch("https://world.openfoodfacts.org/api/v2/product/" + barcode).then(res => res.json());
  console.log(foodInfo)
}

getImage(image);