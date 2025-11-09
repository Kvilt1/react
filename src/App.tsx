import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './routes/Dashboard';
import DailyView from './routes/DailyView';
import ConversationFocusView from './routes/ConversationFocusView';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/day/:date" element={<DailyView />} />
        <Route path="/conversation/:conversationId" element={<ConversationFocusView />} />
        <Route path="/conversation/:conversationId/:date" element={<ConversationFocusView />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
