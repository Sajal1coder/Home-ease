import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';
import HomePages from "./pages/HomePages";
import RegisterPage from "./pages/RegisterPage";
import LoginPages from "./pages/LoginPages";

function App() {
  return (
    <div>
     <BrowserRouter>
     <Routes>
      <Route path="/" element={<HomePages/>}/>
      <Route path="/register" element={<RegisterPage/>}/>
      <Route path="/login" element={<LoginPages/>}/>
     </Routes> 
     </BrowserRouter>
    </div>
  );
}

export default App;
