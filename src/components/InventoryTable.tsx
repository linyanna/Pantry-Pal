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

// Import the Supabase client from utils.
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
  // Establish the state variables.
  const [newProduct, setNewProduct] = useState<any | null>(null);
  const [inventory, setInventory] = useState<any[] | []>([]);

  // Have the app fetch the inventory on load.
  useEffect(() => {
    fetchInventory();
  }, [])

  // Retrieve the shopping list items.
  const fetchInventory = async () => {
    // Clear the shopping list first.
    setInventory([]);

    // Execute a Supabase query to fetch the shopping list.
    try {
        // Select all products
        let { data: storages, error } = await supabase
            .from('inventory')
            .select('*')

        // Handle any errors.
        if (error) { throw error }

        // Upon a successful response, update the inventory.
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
        // Insert the new item, providing the item name. The rest gets
        // filled in automatically.
        let { data, error } = await supabase
            .from('inventory')
            .insert([{name:"hi", barcode: 123}]);

        // Handle any errors.
        if (error) { throw error }

        // Upon success, update the shopping list.
        if (data) {
            fetchInventory();
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