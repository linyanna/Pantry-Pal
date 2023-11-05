'use client'

import { useState } from 'react'
import { BarcodeDetector } from 'barcode-detector';
import { cn } from "@/src/lib/utils"
import { Button } from "@/src/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card"
import image from "@/public/images/phone_test1.jpg"

interface Food {
  code: string;
  product: {
    id: string;
    product_name: string;
    ingredients_text: string;
    selected_images: {
      front: {
        thumb: string;
      };
    };
  };
}

export default function FoodFactsCard() {
  const [food, setFood] = useState<Food | null>(null);


  // create new detector
  const barcodeDetector = new BarcodeDetector({
    formats: [
      'aztec', 'code_128', 'code_39', 'code_93', 'codabar', 'data_matrix', 'ean_13', 'ean_8', 'itf', 'pdf417', 'qr_code', 'upc_a', 'upc_e'
    ]
  });

  // set the image path
  const imageSrc = image.src;
  // const image = "https://www.carlisletechnology.com/wp-content/uploads/shutterstock_6238609.png";

  // get barcode value from image
  async function getImage(imageSrc: string) {
    console.log("Getting image...")
    let blob = await fetch(imageSrc).then((res) => res.blob());
    barcodeDetector
    .detect(blob)
    .then((barcodes) => {
      barcodes.forEach((barcode) => {
        console.log("Barcode fetched: " + barcode.rawValue)
        getFood(barcode.rawValue.toString());
      });
    })
    .catch((err) => {
      console.log(err);
    });
  }

  // open food facts api
  async function getFood(barcode: string) {
    console.log("Getting food info...");
    let foodInfo = await fetch("https://world.openfoodfacts.org/api/v2/product/" + barcode).then(res => res.json());
    console.log(foodInfo)
    setFood(foodInfo);
  }


  return (
    <div>
      <Button variant="outline" className="mb-4" onClick={() => getImage(imageSrc)}>Get Food Data</Button>

      {
        food && (
          <Card className={cn("w-[380px] mb-4")}>
            <CardHeader>
              <CardTitle>{food.product.product_name}</CardTitle>
              <CardDescription>Barcode: {food.code}</CardDescription>
            </CardHeader>
            <CardContent>
              <p>{food.product.ingredients_text}</p>
            </CardContent>
          </Card>
        )
      }
      

    </div>
  )
}