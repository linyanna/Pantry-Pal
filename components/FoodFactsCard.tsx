'use client'

import { useState } from 'react'
import { BarcodeDetector } from 'barcode-detector';
import image from "../resources/images/phone_test1.jpg";

export default function FoodFactsCard() {
  // const [image, setImage] = useState("");


  // create new detector
  const barcodeDetector = new BarcodeDetector({
    formats: [
      'aztec', 'code_128', 'code_39', 'code_93', 'codabar', 'data_matrix', 'ean_13', 'ean_8', 'itf', 'pdf417', 'qr_code', 'upc_a', 'upc_e'
    ]
  });

  // set the image path
  // const image = "../resources/images/phone_test1.jpg";
  const image = "https://www.carlisletechnology.com/wp-content/uploads/shutterstock_6238609.png";

  // get barcode value from image
  async function getImage(image: string) {
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

  // open food facts api
  async function getFood(barcode: string) {
    let foodInfo = await fetch("https://world.openfoodfacts.org/api/v2/product/" + barcode).then(res => res.json());
    console.log(foodInfo)
  }

  getImage(image);

  return (
    <div>food facts card</div>
  )
}