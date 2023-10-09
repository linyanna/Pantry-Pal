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

const ean = "/images/ean.jpg"

async function search(image) {
  let blob = await fetch(image).then(r => r.blob());
  barcodeDetector
  .detect(await createImageBitmap(blob))
  .then(console.log("detected"))
  .then((barcodes) => {
    console.log(barcodes)
    barcodes.forEach((barcode) => console.log(barcode.rawValue));
  })
  .catch((err) => {
    console.log(err);
  });
}

search(ean);