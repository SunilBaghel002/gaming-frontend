import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ResponseMode from './components/ResponseMode';
import ViewMode from './components/ViewMode';
import Stats from './components/Stats';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ResponseMode />} />
        <Route path="/view" element={<ViewMode />} />
        <Route path="/stats" element={<Stats />} />
      </Routes>
    </Router>
  );
}

export default App;