'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/utils/supabase/supabaseConnection';
import { useTheme } from "next-themes";
import './FridgeInfo.css';
import chest_closed from '../images/chest_closed.png'
import chest_open from '../images/chest_open.png'

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

  //theme hook
  const { theme } = useTheme();

  return (
    <div className="info-container">
      {isOpen
        ? (
          <div className='fridge-info-container'>
            <div className='fridge-info-header'>
              <img src={chest_open.src} alt="Example" style={{ width: '50px', height: '50px', marginTop: '-15px', marginRight: '10px' }} />
              <p style={{
                color: theme === 'dark' ? 'white' : 'black',
                marginTop: '8px',
              }}>the door is open.</p>
            </div>
          </div>
        )
        : (
          <div className='fridge-info-container'>
            <div className='fridge-info-header'>
              <img src={chest_closed.src} alt="Example" style={{ width: '50px', height: '50px', marginTop: '-15px' }} />
              <p style={{
                color: theme === 'dark' ? 'white' : 'black',
                marginTop: '8px',
              }}>the door is closed.</p>
            </div>
          </div>
        )
      }
    </div>
  )

}