'use client'
import { useState, useEffect } from 'react'

export default function FridgeInfo() {

    const [isOpen, setIsOpen] = useState<any | null>(true);


    return (
        <div className = "info-container">
        {isOpen 
          ? <p className = "fridge-info-text">the fridge is open.</p> 
          : <p className = 'fridge-info-text'>the fridge is closed.</p>
        }
        </div>
    )

}