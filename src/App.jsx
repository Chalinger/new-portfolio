import './App.css'

//Import components
import FluidBackground from './components/FluidBackground';

// Import pages
import Home from './pages/home';
// La page "Work in progress" est conservée pour une utilisation future
// import WIP from './pages/wip';

function App() {
  return (
    <div className="app">
        <FluidBackground />
        <Home />
    </div>
  )
}

export default App
