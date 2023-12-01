'use client'

import { useState, useEffect } from 'react'
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
import { Input } from './ui/input';
import { Button } from './ui/button';

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

interface TableEntry {
    id: Int8Array;
    updated_at: TimeRanges;
    barcode: string;
    scan_mode: string;
}

export default function InventoryTable() {
  const [inventory, setInventory] = useState<any[] | []>([]);
  const [showIngredients, setShowIngredients] = useState(false);
  const [expandedRows, setExpandedRows] = useState<any[]>([]);
  const [statusMessage, setStatusMessage] = useState("Checking for new entries...");
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let isMounted = true;
    const inventoryTimeout = setTimeout(() => {
      if(isMounted) {
        fetchInventory();
      }
    }, 100)

    const subscription = supabase
      .channel('esp32_barcodes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'esp32_barcodes' }, handleInserts)
      .subscribe()

    return () => {
      isMounted = false;
      clearTimeout(inventoryTimeout);
      supabase.removeChannel(subscription);
    };
  }, [])

  const handleInserts = (payload: any): any => {
    console.log('Change received! 1', payload)
    console.log(payload.new);
    updateInventory(payload.new);
  }

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

  async function updateInventory(tableEntries: TableEntry) {
    try {
      console.log(tableEntries.barcode + tableEntries.scan_mode); 
      let { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('barcode', tableEntries.barcode);
      if (error) { throw error; }
      if (data) {
        if (data.length == 0) {
          // CASE 1: Removing scanned barcode that does not exist in products table
          if (tableEntries.scan_mode === "remove") {
            console.log("Tried to remove non-existing inventory, no action taken.");
          }
          // CASE 2: Adding scanned barcode that does not exist in products table
          else {
            try {
            console.log("Product not found in table, retrieving name from food API");
            let foodInfo = await fetch("https://world.openfoodfacts.org/api/v2/product/" + tableEntries.barcode).then(res => res.json());
            console.log(foodInfo)
            console.log("Adding product to table...");
            // Add product with scanned barcode to table along with its fetched info from API
            let food_name = foodInfo.product.product_name;
            let ingredient_text = foodInfo.product.ingredients_text;
            if (food_name == null) food_name = "Unnamed Product";
            if (ingredient_text == null) ingredient_text = "Unavailable";
            try {
              let { data, error } = await supabase
                  .from('products')
                  .insert({
                    name: food_name,
                    barcode: foodInfo.product.code,
                    quantity: 1,
                    inserted_at: new Date(),
                    ingredients: ingredient_text
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
          catch (error) {
            alert((error as Error).message);
          }
        }
        }
        else {
          // CASE 3: Removing scanned barcode that exists in products table
          if (tableEntries.scan_mode === "remove") {
            let newQuantity = data[0].quantity - 1;
            console.log("New Quantity after remove: " + newQuantity)
            if (newQuantity == 0) {
              // Remove product with scanned barcode from table
            console.log("Removing product from table...");
            try {
              let { error } = await supabase 
                  .from('products')
                  .delete()
                  .eq('barcode', tableEntries.barcode);
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
                    .eq('barcode', tableEntries.barcode);
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
                  .eq('barcode', tableEntries.barcode);
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
      }
    } catch (error) {
      alert((error as Error).message);
    }
    fetchInventory();
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
      return text.substring(0, maxLength) + '';
    }
  };

  const filteredInventory = inventory.filter((item: any) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  return (
    <div>
      <span>{statusMessage}</span>
      <Input
        type="text"
        placeholder="Search by name..."
        value={searchQuery}
        onChange={handleSearch}
        className="mt-2 mb-2"
      />
      {
        filteredInventory && (
          <Table className="w-full">
            <TableCaption>A list of your products.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[12rem]">Name</TableHead>
                <TableHead>Barcode</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead className="text-right w-[24rem]">Ingredients</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {
                filteredInventory.map((row: any, index: number) => {
                  const isExpanded = expandedRows.includes(index);
                  return (
                    <TableRow className="h-12 max-h-full" key={row.barcode}>
                      <TableCell className="font-medium">{row.name}</TableCell>
                      <TableCell>{row.barcode}</TableCell>
                      <TableCell>{row.quantity}</TableCell>
                      <TableCell className="text-right">
                        {isExpanded ? row.ingredients : truncateText(row.ingredients, 75)}
                        {row.ingredients.length > 75 && (
                          <Button className="ml-2 h-5" onClick={() => handleRowExpand(index)}>
                            {isExpanded ? <p>Collapse</p> : <p>...</p>}
                          </Button>
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