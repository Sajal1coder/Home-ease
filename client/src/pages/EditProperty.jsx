import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  RemoveCircleOutline, 
  AddCircleOutline,
  CloudUpload,
  Delete,
  Save
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import API_BASE_URL from '../config';
import '../styles/CreateListing.scss';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { categories, types, facilities } from '../data';

const EditProperty = () => {
  const navigate = useNavigate();
  const { listingId } = useParams();
  const user = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);

  // Form state
  const [formData, setFormData] = useState({
    category: '',
    type: '',
    streetAddress: '',
    aptSuite: '',
    city: '',
    province: '',
    country: '',
    guestCount: 1,
    bedroomCount: 1,
    bedCount: 1,
    bathroomCount: 1,
    amenities: [],
    title: '',
    description: '',
    highlight: '',
    highlightDesc: '',
    price: 0
  });

  const [photos, setPhotos] = useState([]);
  const [govtIdPhotos, setGovtIdPhotos] = useState([]);
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [existingGovtIdPhotos, setExistingGovtIdPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fetch existing property data
  useEffect(() => {
    if (!user || !token) {
      navigate('/login');
      return;
    }

    fetchPropertyData();
  }, [listingId, user, token, navigate]);

  const fetchPropertyData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/listings/${listingId}/edit`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const propertyData = await response.json();
        
        // Populate form with existing data
        setFormData({
          category: propertyData.category || '',
          type: propertyData.type || '',
          streetAddress: propertyData.streetAddress || '',
          aptSuite: propertyData.aptSuite || '',
          city: propertyData.city || '',
          province: propertyData.province || '',
          country: propertyData.country || '',
          guestCount: propertyData.guestCount || 1,
          bedroomCount: propertyData.bedroomCount || 1,
          bedCount: propertyData.bedCount || 1,
          bathroomCount: propertyData.bathroomCount || 1,
          amenities: propertyData.amenities || [],
          title: propertyData.title || '',
          description: propertyData.description || '',
          highlight: propertyData.highlight || '',
          highlightDesc: propertyData.highlightDesc || '',
          price: propertyData.price || 0
        });

        setExistingPhotos(propertyData.listingPhotoPaths || []);
        setExistingGovtIdPhotos(propertyData.govtIdPath || []);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to fetch property data');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error fetching property:', error);
      toast.error('Failed to load property data');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCountChange = (field, increment) => {
    setFormData(prev => ({
      ...prev,
      [field]: Math.max(1, prev[field] + increment)
    }));
  };

  const handleAmenityToggle = (facility) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(facility)
        ? prev.amenities.filter(item => item !== facility)
        : [...prev.amenities, facility]
    }));
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    setPhotos(prev => [...prev, ...files]);
  };

  const handleGovtIdUpload = (e) => {
    const files = Array.from(e.target.files);
    setGovtIdPhotos(prev => [...prev, ...files]);
  };

  const removePhoto = (index, isNew = true) => {
    if (isNew) {
      setPhotos(prev => prev.filter((_, i) => i !== index));
    } else {
      setExistingPhotos(prev => prev.filter((_, i) => i !== index));
    }
  };

  const removeGovtIdPhoto = (index, isNew = true) => {
    if (isNew) {
      setGovtIdPhotos(prev => prev.filter((_, i) => i !== index));
    } else {
      setExistingGovtIdPhotos(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.category || !formData.type || !formData.city || !formData.title) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (existingPhotos.length === 0 && photos.length === 0) {
      toast.error('Please upload at least one property photo');
      return;
    }

    try {
      setSubmitting(true);

      const submitData = new FormData();
      
      // Add form data
      Object.keys(formData).forEach(key => {
        if (key === 'amenities') {
          submitData.append(key, JSON.stringify(formData[key]));
        } else {
          submitData.append(key, formData[key]);
        }
      });

      // Add new photos
      photos.forEach(photo => {
        submitData.append('listingPhotos', photo);
      });

      // Add new government ID photos
      govtIdPhotos.forEach(photo => {
        submitData.append('govtIdPhotos', photo);
      });

      // If no new photos are uploaded, keep existing ones
      if (photos.length === 0 && existingPhotos.length > 0) {
        submitData.append('keepExistingPhotos', 'true');
      }

      if (govtIdPhotos.length === 0 && existingGovtIdPhotos.length > 0) {
        submitData.append('keepExistingGovtId', 'true');
      }

      const response = await fetch(`${API_BASE_URL}/listings/${listingId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submitData
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Property updated successfully! It will be reviewed by admin.');
        navigate('/dashboard');
      } else {
        toast.error(data.message || 'Failed to update property');
      }
    } catch (error) {
      console.error('Error updating property:', error);
      toast.error('Failed to update property');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading-container">
          <div className="loading-spinner">Loading property data...</div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="create-listing">
        <div className="create-listing-header">
          <h1>Edit Your Property</h1>
          <p>Update your property details and photos</p>
        </div>

        <form onSubmit={handleSubmit} className="create-listing-form">
          {/* Category Selection */}
          <div className="form-section">
            <h3>Property Category</h3>
            <div className="category-grid">
              {categories.map((category) => (
                <div
                  key={category.label}
                  className={`category-card ${formData.category === category.label ? 'selected' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, category: category.label }))}
                >
                  <div className="category-icon">{category.icon}</div>
                  <span>{category.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Property Type */}
          <div className="form-section">
            <h3>Property Type</h3>
            <div className="type-grid">
              {types.map((type) => (
                <div
                  key={type.name}
                  className={`type-card ${formData.type === type.name ? 'selected' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, type: type.name }))}
                >
                  <div className="type-icon">{type.icon}</div>
                  <div className="type-info">
                    <h4>{type.name}</h4>
                    <p>{type.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Location */}
          <div className="form-section">
            <h3>Property Location</h3>
            <div className="input-grid">
              <input
                type="text"
                name="streetAddress"
                placeholder="Street Address"
                value={formData.streetAddress}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="aptSuite"
                placeholder="Apt, Suite, etc. (optional)"
                value={formData.aptSuite}
                onChange={handleInputChange}
              />
              <input
                type="text"
                name="city"
                placeholder="City"
                value={formData.city}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="province"
                placeholder="State/Province"
                value={formData.province}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="country"
                placeholder="Country"
                value={formData.country}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          {/* Property Details */}
          <div className="form-section">
            <h3>Property Details</h3>
            <div className="counter-grid">
              <div className="counter-item">
                <span>Guests</span>
                <div className="counter-controls">
                  <button type="button" onClick={() => handleCountChange('guestCount', -1)}>
                    <RemoveCircleOutline />
                  </button>
                  <span>{formData.guestCount}</span>
                  <button type="button" onClick={() => handleCountChange('guestCount', 1)}>
                    <AddCircleOutline />
                  </button>
                </div>
              </div>
              <div className="counter-item">
                <span>Bedrooms</span>
                <div className="counter-controls">
                  <button type="button" onClick={() => handleCountChange('bedroomCount', -1)}>
                    <RemoveCircleOutline />
                  </button>
                  <span>{formData.bedroomCount}</span>
                  <button type="button" onClick={() => handleCountChange('bedroomCount', 1)}>
                    <AddCircleOutline />
                  </button>
                </div>
              </div>
              <div className="counter-item">
                <span>Beds</span>
                <div className="counter-controls">
                  <button type="button" onClick={() => handleCountChange('bedCount', -1)}>
                    <RemoveCircleOutline />
                  </button>
                  <span>{formData.bedCount}</span>
                  <button type="button" onClick={() => handleCountChange('bedCount', 1)}>
                    <AddCircleOutline />
                  </button>
                </div>
              </div>
              <div className="counter-item">
                <span>Bathrooms</span>
                <div className="counter-controls">
                  <button type="button" onClick={() => handleCountChange('bathroomCount', -1)}>
                    <RemoveCircleOutline />
                  </button>
                  <span>{formData.bathroomCount}</span>
                  <button type="button" onClick={() => handleCountChange('bathroomCount', 1)}>
                    <AddCircleOutline />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="form-section">
            <h3>Amenities</h3>
            <div className="amenities-grid">
              {facilities.map((facility) => (
                <div
                  key={facility.name}
                  className={`amenity-card ${formData.amenities.includes(facility.name) ? 'selected' : ''}`}
                  onClick={() => handleAmenityToggle(facility.name)}
                >
                  <div className="amenity-icon">{facility.icon}</div>
                  <span>{facility.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Property Photos */}
          <div className="form-section">
            <h3>Property Photos</h3>
            
            {/* Existing Photos */}
            {existingPhotos.length > 0 && (
              <div className="existing-photos">
                <h4>Current Photos</h4>
                <div className="photo-grid">
                  {existingPhotos.map((photo, index) => (
                    <div key={index} className="photo-item">
                      <img 
                        src={`${API_BASE_URL}/${photo.replace("public", "")}`} 
                        alt={`Property ${index + 1}`} 
                      />
                      <button
                        type="button"
                        className="remove-photo"
                        onClick={() => removePhoto(index, false)}
                      >
                        <Delete />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Photos */}
            {photos.length > 0 && (
              <div className="new-photos">
                <h4>New Photos</h4>
                <div className="photo-grid">
                  {photos.map((photo, index) => (
                    <div key={index} className="photo-item">
                      <img src={URL.createObjectURL(photo)} alt={`New ${index + 1}`} />
                      <button
                        type="button"
                        className="remove-photo"
                        onClick={() => removePhoto(index, true)}
                      >
                        <Delete />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="upload-section">
              <input
                type="file"
                id="property-photos"
                multiple
                accept="image/*"
                onChange={handlePhotoUpload}
                style={{ display: 'none' }}
              />
              <label htmlFor="property-photos" className="upload-btn">
                <CloudUpload />
                Add New Photos
              </label>
            </div>
          </div>

          {/* Property Information */}
          <div className="form-section">
            <h3>Property Information</h3>
            <div className="input-group">
              <input
                type="text"
                name="title"
                placeholder="Property Title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
              <textarea
                name="description"
                placeholder="Property Description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                required
              />
              <input
                type="text"
                name="highlight"
                placeholder="Property Highlight"
                value={formData.highlight}
                onChange={handleInputChange}
                required
              />
              <textarea
                name="highlightDesc"
                placeholder="Highlight Description"
                value={formData.highlightDesc}
                onChange={handleInputChange}
                rows="3"
                required
              />
              <input
                type="number"
                name="price"
                placeholder="Price per night (₹)"
                value={formData.price}
                onChange={handleInputChange}
                min="0"
                required
              />
            </div>
          </div>

          {/* Government ID Photos */}
          <div className="form-section">
            <h3>Government ID Verification</h3>
            
            {/* Existing Govt ID Photos */}
            {existingGovtIdPhotos.length > 0 && (
              <div className="existing-photos">
                <h4>Current ID Documents</h4>
                <div className="photo-grid">
                  {existingGovtIdPhotos.map((photo, index) => (
                    <div key={index} className="photo-item">
                      <img 
                        src={`${API_BASE_URL}/${photo.replace("public", "")}`} 
                        alt={`ID Document ${index + 1}`} 
                      />
                      <button
                        type="button"
                        className="remove-photo"
                        onClick={() => removeGovtIdPhoto(index, false)}
                      >
                        <Delete />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Govt ID Photos */}
            {govtIdPhotos.length > 0 && (
              <div className="new-photos">
                <h4>New ID Documents</h4>
                <div className="photo-grid">
                  {govtIdPhotos.map((photo, index) => (
                    <div key={index} className="photo-item">
                      <img src={URL.createObjectURL(photo)} alt={`New ID ${index + 1}`} />
                      <button
                        type="button"
                        className="remove-photo"
                        onClick={() => removeGovtIdPhoto(index, true)}
                      >
                        <Delete />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="upload-section">
              <input
                type="file"
                id="govt-id-photos"
                multiple
                accept="image/*"
                onChange={handleGovtIdUpload}
                style={{ display: 'none' }}
              />
              <label htmlFor="govt-id-photos" className="upload-btn">
                <CloudUpload />
                Update ID Documents
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="form-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate('/dashboard')}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-btn"
              disabled={submitting}
            >
              <Save />
              {submitting ? 'Updating...' : 'Update Property'}
            </button>
          </div>
        </form>
      </div>
      <Footer />
    </>
  );
};

export default EditProperty;
