import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import RoomPage from "./pages/RoomPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import { SocketProvider } from "./context/SocketContext.jsx";
import { GameProvider } from "./context/GameContext.jsx";
import { ToastProvider } from "./components/ui/Toast.jsx";
import "./App.css";

function App() {
  return (
    <ToastProvider>
      <SocketProvider>
        <GameProvider>
          <Router>
            <div className="App">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/room/:code" element={<RoomPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </div>
          </Router>
        </GameProvider>
      </SocketProvider>
    </ToastProvider>
  );
}

export default App;