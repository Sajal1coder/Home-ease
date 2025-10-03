import "../styles/SkeletonCard.scss";

const SkeletonCard = () => {
  return (
    <div className="skeleton-card">
      <div className="skeleton-image skeleton-shimmer"></div>
      <div className="skeleton-content">
        <div className="skeleton-title skeleton-shimmer"></div>
        <div className="skeleton-text skeleton-shimmer"></div>
        <div className="skeleton-text skeleton-shimmer short"></div>
        <div className="skeleton-price skeleton-shimmer"></div>
      </div>
    </div>
  );
};

export default SkeletonCard;
