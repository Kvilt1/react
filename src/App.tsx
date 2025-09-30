import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DailyView from './routes/DailyView';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DailyView />} />
        <Route path="/day/:date" element={<DailyView />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
