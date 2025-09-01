import './App.css'
import { Header } from './components/layout/Header'
import GardenPlanner from './components/garden/GardenPlanner'

function App() {
  // For demonstration purposes, using a hardcoded garden ID
  const demoGardenId = 1;

  return (
    <div className="app">
      <Header />
      <main className="app-main">
        <GardenPlanner gardenId={demoGardenId} />
      </main>
    </div>
  )
}

export default App
