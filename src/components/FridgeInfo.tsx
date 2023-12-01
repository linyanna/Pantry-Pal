'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/utils/supabase/supabaseConnection';
import './FridgeInfo.css';

export default function FridgeInfo() {

  const [isOpen, setIsOpen] = useState<any | null>(true);

  const handleInserts = (payload: any): any => {
    console.log('Change received! 1', payload)
    console.log(payload.new.isOpen);
    let status = payload.new.isOpen;
    setIsOpen(status);
  }

  useEffect(() => {
    console.log('isOpen Status: ' + isOpen);
  }, [isOpen]); // Dependencies array ensures this runs only when isOpen changes


  //useEffect hook
  useEffect((): any => {
    const subscription = supabase
      .channel('door_status')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'door_status' }, handleInserts)
      .subscribe()

    return () => supabase.removeChannel(subscription);
  }, [])

  return (
    <div className="info-container">
      {isOpen
        ? (
          <div className='fridge-info-container'>
            <div className='fridge-info-header'>
              <div className='fridge-info-open'></div>
              <p className="fridge-info-text">the fridge is open.</p>
            </div>

          </div>)
        : (
          <div>
            <div className='fridge-info-closed' ></div>
            <p className="fridge-info-text">the fridge is closed.</p>
          </div>
        )
      }
    </div>
  )

}