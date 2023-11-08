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

// Import the Supabase client from utils.
import { supabase } from '../lib/utils/supabase/supabaseConnection';

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

  // get barcode value from image
  async function getBarcode(imageSrc: string) {
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
    console.log(foodInfo);
    setFood(foodInfo);
  }

  async function getImage(imageId: string) {
    // images is public so returns a public url
    const { data } = await supabase.storage.from('images').getPublicUrl(imageId);
    getBarcode(data.publicUrl.toString());
  }

  return (
    <div>
      <p>Read the barcode from an <a href="https://ninnntxqlfkxrtwsxtao.supabase.co/storage/v1/object/public/images/phone_test1.jpg" target="_blank" referrerPolicy="no-referrer"><u>image</u></a> in our database:</p>
      <Button variant="outline" className="mb-4" onClick={() => getImage("phone_test1.jpg")}>Read Barcode</Button>

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