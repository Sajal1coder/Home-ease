import "../styles/slide.scss"

const Slide = () => {
  return (
    <div className="slide">
      <img 
        src="/assets/slide.jpg" 
        alt="Beautiful home rental property" 
        className="slide-image"
        fetchpriority="high"
        loading="eager"
      />
      <div className="slide-overlay">
        <h1>
          Find Your Perfect Home, Anywhere in India <br/> Simplified Rentals at Your Fingertips!
        </h1>
      </div>
    </div>
  );
};

export default Slide;