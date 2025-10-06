import Categories from "../components/Categories"
import Navbar from "../components/Navbar"
import Slide from '../components/Slide'
import Footer from "../components/Footer"
import Listings from "../components/Listings"
import SEO from "../components/SEO"


const HomePage = () => {
  return (
    <>
      <SEO 
        title="Homease - Find Your Perfect Home Rental"
        description="Discover and book amazing homes, apartments, and properties for rent across India. Browse thousands of verified listings with photos, reviews, and instant booking."
        keywords="home rental, apartment rental, property rental, rent house, rent apartment, real estate, India property rental"
      />
      
      <Navbar />
      <Slide />
      <Categories/>
      <Listings/>
      <Footer />
    </>
  )
}

export default HomePage
