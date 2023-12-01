import DeployButton from '../components/DeployButton'
import AuthButton from '../components/AuthButton'
import FoodFactsCard from '../components/FoodFactsCard'
import InventoryTable from '../components/InventoryTable'
import FridgeInfo from '../components/FridgeInfo'

export default async function Index() {
  return (
    <div className="flex-1 w-full flex flex-col gap-20 items-center">
      <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
        <div className="w-full max-w-4xl flex justify-between items-center p-3 text-sm">
          <AuthButton />
        </div>
      </nav>
      <h1>Pantry Pal!!</h1>
     <InventoryTable />
      <footer className="w-full border-t border-t-foreground/10 p-8 flex justify-center text-center text-xs">
        <p>
          We love Pantry Pal.
        </p>
        <FridgeInfo />
      </footer>
    </div>
  )
}
