'use client'

import { useState, useEffect } from 'react'
import { cn } from "@/src/lib/utils"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table"

// Import the Supabase client from utils
import { supabase } from '../lib/utils/supabase/supabaseConnection';

interface Product {
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

export default function InventoryTable() {
  const [newProduct, setNewProduct] = useState<any | null>(null);
  const [inventory, setInventory] = useState<any[] | []>([]);

  useEffect(() => {
    updateInventory();
    fetchInventory();
  }, [])

  // Retrieve the products
  const fetchInventory = async () => {
    // Clear the products
    setInventory([]);

    // Execute a Supabase query to fetch the inventory
    try {
        // Select all products
        let { data: storages, error } = await supabase
            .from('products_duplicate')
            .select('*')
        if (error) { throw error }
        // Upon a successful response, update the inventory
        if (storages) {
            setInventory(storages);
        }
    } catch (error) {
      alert((error as Error).message);
    }
  }

  // Add a new product to storage
  const addProduct = async () => {
    try {
        // Insert the new item, providing the item name; the rest gets
        // filled in automatically
        let { data, error } = await supabase
            .from('products_duplicate')
            .insert([{name:"hi", barcode: 123}]);

        // Handle any errors.
        if (error) { throw error }
        // Upon success, update the inventory
        if (data) {
            fetchInventory();
        }
    } catch (error) {
        alert((error as Error).message);
    }
  }
  async function updateInventory() {
    console.log("Checking esp32_barcodes table for any entries since last update...")
    try {
      let { data, error } = await supabase
          .from('esp32_barcodes')
          .select('*');
      if (error) { 
        alert('Error checking esp32_barcodes table: ' + error);
        throw error;
      }
      if (data) {
        if (data.length == 0) console.log("No new entries found");
        else {
          let tableEntries: Array<{scan_mode: string, barcode: number}> = data;
          for (let i = 0; i < 1 ; i++) {
            try {
              console.log("New entry: " + tableEntries[i]); 
              let { data, error } = await supabase
                  .from('products')
                  .select('*')
                  .eq('barcode', tableEntries[i].barcode);
              if (error) { throw error; }
              if (data) {
                if (data.length == 0) {
                  if (tableEntries[i].scan_mode === "remove") {
                    console.log("Tried to remove non-existing inventory, no action taken")
                  }
                  else {
                    console.log("Product not found in table, retrieving name from food API")
                    let foodInfo = await fetch("https://world.openfoodfacts.org/api/v2/product/" + tableEntries[i].barcode).then(res => res.json());
                    console.log(foodInfo);
                    console.log("Adding product to table");
                    
                  }
                }
                else {
                  if (tableEntries[i].scan_mode === "remove") {

                  }
                  else {
                    console.log("Product found in table, raising quantity by one.")
                    let newQuantity = data[0].quantity + 1;
                    try {
                      let { error } = await supabase
                          .from('products')
                          .update([{quantity: newQuantity}])
                          .eq('barcode', tableEntries[i].barcode);
                      if (error) { throw error }
                    } catch (error) {
                    alert((error as Error).message);
                    }
                  }
                }
              }
          } catch (error) {
              alert((error as Error).message);
          }
          }
        }
      }
  } catch (error) {
      alert((error as Error).message);
  }
  }

  const addProductBarcode = async (barcode: string | number) => {
    try {
        // First try to fetch product information from the food info table

        // Insert the new item, providing the item name and barcode; the rest gets filled in automatically
        let { data, error } = await supabase
            .from('products_duplicate')
            .insert([{ name: "hi", barcode }]);

        // Handle any errors.
        if (error) { throw error; }
        
        // Upon success, update the inventory
        if (data) {
            await fetchInventory(); // Assuming fetchInventory is an async function, await it here
        }
    } catch (error) {
        alert((error as Error).message);
    }
}

  return (
    <div>
      {
        inventory && (
          <Table>
            <TableCaption>A list of your products.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Name</TableHead>
                <TableHead>Barcode</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead className="text-right">Ingredients</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {
                inventory.map((row: any) => {
                  return (
                    <TableRow key={row.barcode}>
                      <TableCell className="font-medium">{row.name}</TableCell>
                      <TableCell>{row.barcode}</TableCell>
                      <TableCell>{row.quantity}</TableCell>
                      <TableCell className="text-right">{row.ingredients}</TableCell>
                    </TableRow>
                  )
                })
              }
            </TableBody>
          </Table>
        )
      }
    </div>
  )
}