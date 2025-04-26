// components/LazyImage.jsx
import React from "react";

const LazyImage = ({ src, alt, className = "", style = {}, ...props }) => {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={className}
      style={style}
      {...props}
    />
  );
};

export default LazyImage;
