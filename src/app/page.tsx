import AuthButton from '../components/AuthButton'
import InventoryTable from '../components/InventoryTable'
import FridgeInfo from '../components/FridgeInfo'
import { ModeToggle } from '../components/ModeToggle'

export default async function Index() {
  return (
    <div className="flex-1 w-full flex flex-col gap-20 items-center">
      <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
        <div className="w-full max-w-4xl flex justify-end items-center p-3 text-sm">
          <AuthButton />
        </div>
        <div className="flex justify-end items-center p-3 text-sm">
          <ModeToggle></ModeToggle>
        </div>
      </nav>
      <div className="flex justify-between w-[75%]">
        <div>
          <h1 className="scroll-m-20 text-4xl font-bold   tracking-tight lg:text-5xl">Pantry Pal</h1>
        </div>
        <div>
          <FridgeInfo />
        </div>
      </div>
     <InventoryTable />
      <footer className="w-full border-t border-t-foreground/10 p-8 flex justify-center text-center text-xs">
        <p>
          We love Pantry Pal.
        </p>
      </footer>
    </div>
  )
}
