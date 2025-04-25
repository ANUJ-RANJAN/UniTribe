import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './Pages/Home';
import Trips from './Pages/Trips';
import Events from './Pages/Events';
import Communities from './Pages/Communities';

function App() {
  return (
    <Router>
      <Navbar />
      <div className="content p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/trips" element={<Trips />} />
          <Route path="/events" element={<Events />} />
          <Route path="/communities" element={<Communities />} />
        </Routes>
      </div>
      <Footer />
    </Router>
  );
}

export default App;
