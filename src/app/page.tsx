import DeployButton from '../components/DeployButton'
import AuthButton from '../components/AuthButton'
import FoodFactsCard from '@/src/components/FoodFactsCard'

export default async function Index() {
  return (
    <div className="flex-1 w-full flex flex-col gap-20 items-center">
      <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
        <div className="w-full max-w-4xl flex justify-between items-center p-3 text-sm">
          <DeployButton />
          <AuthButton />
        </div>
      </nav>
     <FoodFactsCard />
      <footer className="w-full border-t border-t-foreground/10 p-8 flex justify-center text-center text-xs">
        <p>
          We love Pantry Pal.
        </p>
      </footer>
    </div>
  )
}
