import { Helmet } from 'react-helmet-async';

const SEO = ({ 
  title = 'Homease - Find Your Perfect Home Rental',
  description = 'Discover and book amazing homes, apartments, and properties for rent. Trusted by thousands of renters and property owners.',
  keywords = 'home rental, apartment rental, property rental, rent house, rent apartment, real estate',
  ogImage = '/assets/logo.png',
  url = window.location.href
}) => {
  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={ogImage} />
      
      {/* Additional Meta Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <meta name="author" content="Homease" />
      <link rel="canonical" href={url} />
    </Helmet>
  );
};

export default SEO;
