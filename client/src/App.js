import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { ToastContainer } from 'react-toastify';
import { ErrorBoundary } from 'react-error-boundary';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import Loader from "./components/Loader";
import ScrollToTop from "./components/ScrollToTop";
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import MessagingPage from './pages/MessagingPage';

// Lazy load all pages for code splitting
const HomePages = lazy(() => import("./pages/HomePages"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const LoginPages = lazy(() => import("./pages/LoginPages"));
const CreateListing = lazy(() => import("./pages/CreateListing"));
const EditProperty = lazy(() => import("./pages/EditProperty"));
const ListingDetails = lazy(() => import("./pages/ListingDetails"));
// Deprecated pages removed: TripList, WishList, PropertyList, ReservationList
const CategoryPage = lazy(() => import("./pages/CategoryPage"));
const SearchPage = lazy(() => import("./pages/SearchPage"));

// Error Fallback Component
function ErrorFallback({error, resetErrorBoundary}) {
  return (
    <div role="alert" style={{
      padding: '40px',
      textAlign: 'center',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <h1 style={{color: '#F8395A', marginBottom: '20px'}}>Oops! Something went wrong</h1>
      <p style={{marginBottom: '20px', color: '#666'}}>We're sorry for the inconvenience.</p>
      <pre style={{color: 'red', padding: '20px', background: '#f5f5f5', borderRadius: '10px', marginBottom: '20px'}}>
        {error.message}
      </pre>
      <button 
        onClick={resetErrorBoundary}
        style={{
          padding: '10px 20px',
          backgroundColor: '#F8395A',
          color: 'white',
          border: 'none',
          borderRadius: '10px',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: '600'
        }}
      >
        Try again
      </button>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => window.location.reload()}
    >
      <div>
        <BrowserRouter>
          <Suspense fallback={<Loader />}>
            <Routes>
              <Route path="/" element={<HomePages/>}/>
              <Route path="/register" element={<RegisterPage/>}/>
              <Route path="/login" element={<LoginPages/>}/>
              <Route path="/create-listing" element={<CreateListing/>}/>
              <Route path="/edit-property/:listingId" element={<EditProperty/>}/>
              <Route path="/properties/:listingId" element={<ListingDetails/>}/>
              <Route path="/properties/category/:category" element={<CategoryPage/>}/>
              <Route path="/properties/search/:search" element={<SearchPage/>}/>
              {/* Redirect legacy routes to unified /dashboard for backward compatibility */}
              <Route path=":userId/trips" element={<Navigate to="/dashboard" replace />} />
              <Route path=":userId/wishList" element={<Navigate to="/dashboard" replace />} />
              <Route path=":userId/properties" element={<Navigate to="/dashboard" replace />} />
              <Route path=":userId/reservations" element={<Navigate to="/dashboard" replace />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/dashboard" element={<UserDashboard />} />
              <Route path="/messages" element={<MessagingPage />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        <ScrollToTop />
      </div>
    </ErrorBoundary>
  );
}

export default App;
