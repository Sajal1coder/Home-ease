// components/LazyImage.jsx
import React from "react";

const LazyImage = ({ 
  src, 
  alt, 
  className = "", 
  style = {}, 
  priority = false,
  width,
  height,
  ...props 
}) => {
  return (
    <img
      src={src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      className={className}
      style={style}
      width={width}
      height={height}
      {...props}
    />
  );
};

export default LazyImage;
