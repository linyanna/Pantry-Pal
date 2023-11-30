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
  const [showIngredients, setShowIngredients] = useState(false);
  const [expandedRows, setExpandedRows] = useState<any[]>([]);
  const [statusMessage, setStatusMessage] = useState("Checking for new entries...");
  useEffect(() => {
    let isMounted = true;
    const inventoryTimeout = setTimeout(() => {
      if(isMounted) {
        updateInventory();
        fetchInventory();
      }
    }, 5000)
    return () => {
      isMounted = false;
      clearTimeout(inventoryTimeout);
    };
  }, [])

  const toggleIngredients = () => {
    setShowIngredients(!showIngredients);
  };
  
  // Retrieve the products
  const fetchInventory = async () => {
    // Clear the products
    setInventory([]);
    setStatusMessage("");
    // Execute a Supabase query to fetch the inventory
    try {
        // Select all products
        let { data: storages, error } = await supabase
            .from('products')
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
    console.log("Checking esp32_barcodes table for any entries since last update...");
    try {
      let { data, error } = await supabase
          .from('esp32_barcodes')
          .select('*');
      if (error) { 
        alert('Error checking esp32_barcodes table: ' + error);
        throw error;
      }
      if (data) {
        if (data.length == 0) {
          console.log("No new entries found");
          setStatusMessage("Table up to date!")
        }
        else {
          let tableEntries: Array<{scan_mode: string, barcode: number}> = data;
          setStatusMessage("New entries found! Updating your table...");
          for (let i = 0; i < tableEntries.length ; i++) {
            try {
              console.log("Loop " + i + " - New entry: " + tableEntries[i].barcode + tableEntries[i].scan_mode); 
              let { data, error } = await supabase
                  .from('products')
                  .select('*')
                  .eq('barcode', tableEntries[i].barcode);
              if (error) { throw error; }
              if (data) {
                if (data.length == 0) {
                  // CASE 1: Removing scanned barcode that does not exist in products table
                  if (tableEntries[i].scan_mode === "remove") {
                    console.log("Tried to remove non-existing inventory, no action taken.");
                  }
                  // CASE 2: Adding scanned barcode that does not exist in products table
                  else {
                    console.log("Product not found in table, retrieving name from food API");
                    let foodInfo = await fetch("https://world.openfoodfacts.org/api/v2/product/" + tableEntries[i].barcode).then(res => res.json());
                    console.log(foodInfo);
                    console.log("Adding product to table...");
                    // Add product with scanned barcode to table along with its fetched info from API
                    try {
                      let { data, error } = await supabase
                          .from('products')
                          .insert({
                            name: foodInfo.product.product_name, 
                            barcode: foodInfo.product.code,
                            quantity: 1,
                            inserted_at: new Date(),
                            ingredients: foodInfo.product.ingredients_text,
                          });
                      if (error) { 
                        throw error 
                      } else {
                        console.log("   Successfully added product to table.");
                        console.log(data)
                      }
                    } catch (error) {
                      alert((error as Error).message);
                    }
                  }
                }
                else {
                  // CASE 3: Removing scanned barcode that exists in products table
                  if (tableEntries[i].scan_mode === "remove") {
                    let newQuantity = data[0].quantity - 1;
                    console.log("New Quantity after remove: " + newQuantity)
                    if (newQuantity == 0) {
                      // Remove product with scanned barcode from table
                    console.log("Removing product from table...");
                    try {
                      let { error } = await supabase 
                          .from('products')
                          .delete()
                          .eq('barcode', tableEntries[i].barcode);
                      if (error) { 
                        throw error 
                      } else {
                        console.log("   Successfully removed product from table.");
                      }
                    } catch (error) {
                      alert((error as Error).message);
                    }
                    }
                    else {
                      console.log("Decrementing quantity by one")
                      try {
                        let { error } = await supabase
                            .from('products')
                            .update({quantity: newQuantity})
                            .eq('barcode', tableEntries[i].barcode);
                        if (error) { 
                          throw error 
                        } else {
                          console.log("   Successfully updated quantity of product in table to " + newQuantity);
                        }
                      } catch (error) {
                      alert((error as Error).message);
                      }
                    }
                  }
                  // CASE 4: Adding scanned barcode that exists in products table
                  else {
                    console.log("Product found in table, raising quantity by one.");
                    let newQuantity = data[0].quantity + 1;
                    console.log("Adding quantity of product in table...");
                    try {
                      let { error } = await supabase
                          .from('products')
                          .update({quantity: newQuantity})
                          .eq('barcode', tableEntries[i].barcode);
                      if (error) { 
                        throw error 
                      } else {
                        console.log("   Successfully updated quantity of product in table.");
                      }
                    } catch (error) {
                    alert((error as Error).message);
                    }
                  }
                }
                /// TODO_AFTER_TESTING: delete from barcodes table
                
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
  fetchInventory();
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

const handleRowExpand = (index: number) => {
  if (expandedRows.includes(index)) {
    setExpandedRows(expandedRows.filter((rowIndex) => rowIndex !== index));
  } else {
    setExpandedRows([...expandedRows, index]);
  }
};

const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) {
    return text;
  } else {
    return text.substring(0, maxLength) + '...';
  }
};

  return (
    <div>
      <p>{statusMessage}</p>
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
                inventory.map((row: any, index: number) => {
                  const isExpanded = expandedRows.includes(index);
                  return (
                    <TableRow key={row.barcode}>
                      <TableCell className="font-medium">{row.name}</TableCell>
                      <TableCell>{row.barcode}</TableCell>
                      <TableCell>{row.quantity}</TableCell>
                      <TableCell className="text-right">
                        {isExpanded ? row.ingredients : truncateText(row.ingredients, 15)}
                        {row.ingredients.length > 15 && (
                          <button onClick={() => handleRowExpand(index)}>
                            {isExpanded ? '  (Collapse)' : '...'}
                          </button>
                        )}
                      </TableCell>
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