import { categories } from "../data";
import "../styles/Categories.scss"
import { Link } from "react-router-dom";

const Categories = () => {

  const includedCategories = ["Mumbai", "Delhi", "Bangalore","Kolkata","Lucknow","Hydrabad","Pune","Chennai","Ahmedabad","Chandigarh","Bhopal","Guwahati","Jaipur","Surat","Varanasi","Any Other"]; // Add the categories you want to include

  const filtered = categories.filter((category) => 
    includedCategories.includes(category.label)
  );
  return (
    <div className="categories">
      <h1>Explore Top Categories</h1>
      <p>
      Explore our wide range of home rentals that cater to all types of residents. Experience the comfort and convenience of living like a local, enjoy the familiar comforts of home, and create lasting memories in your perfect rental property.
      </p>

      <div className="categories_list">
        {filtered?.slice(0,7).map((category, index) => (
          <Link to={`/properties/category/${category.label}`}>
            <div className="category" key={index}>
              <LazyImage src={category.img} alt={category.label} />
              <div className="overlay"></div>
              <div className="category_text">
                <div className="category_text_icon">{category.icon}</div>
                <p>{category.label}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Categories;