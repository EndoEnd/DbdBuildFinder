import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Builds from './pages/Builds';
// import Maps from './pages/Maps';
// import Perks from './pages/Perks';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#050505] flex flex-col">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/builds" element={<Builds />} />
            {/* <Route path="/maps" element={<Maps />} />
            <Route path="/perks" element={<Perks />} /> */}
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
