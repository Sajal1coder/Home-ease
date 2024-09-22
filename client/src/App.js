import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';

import HomePages from "./pages/HomePages";
import RegisterPage from "./pages/RegisterPage";
import LoginPages from "./pages/LoginPages";
import CreateListing from "./pages/CreateListing"
import ListingDetails from "./pages/ListingDetails";
import TripList from "./pages/TripList";
import WishList from "./pages/WishList";
import PropertyList from "./pages/PropertyList";
import ReservationList from "./pages/ReservationList";

function App() {
  return (
    <div>
     <BrowserRouter>
     <Routes>
      <Route path="/" element={<HomePages/>}/>
      <Route path="/register" element={<RegisterPage/>}/>
      <Route path="/login" element={<LoginPages/>}/>
      <Route path="/create-listing" element={<CreateListing/>}/>
      <Route path="/properties/:listingId" element={<ListingDetails/>}/>
      <Route path="/:userId/trips" element={<TripList/>}/>
      <Route path="/:userId/wishList" element={<WishList/>}/>
      <Route path="/:userId/properties" element={<PropertyList/>}/>
      <Route path="/:userId/reservations" element={<ReservationList/>}/>
     </Routes> 
     </BrowserRouter>
    </div>
  );
}

export default App;
