import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';

import HomePages from "./pages/HomePages";
import RegisterPage from "./pages/RegisterPage";
import LoginPages from "./pages/LoginPages";
import CreateListing from "./pages/CreateListing"

function App() {
  return (
    <div>
     <BrowserRouter>
     <Routes>
      <Route path="/" element={<HomePages/>}/>
      <Route path="/register" element={<RegisterPage/>}/>
      <Route path="/login" element={<LoginPages/>}/>
      <Route path="/create-listing" element={<CreateListing/>}/>
     </Routes> 
     </BrowserRouter>
    </div>
  );
}

export default App;
