import React, { memo } from 'react';

interface SkeletonCardProps {
  count?: number;
}

const SkeletonCard = memo<SkeletonCardProps>(({ count = 6 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="tool-card-wrapper">
          <div className="tool-card skeleton-card">
            <div className="tool-card-body">
              {/* 제목 스켈레톤 */}
              <div className="skeleton-title"></div>
              
              {/* 설명 스켈레톤 */}
              <div className="skeleton-description">
                <div className="skeleton-line"></div>
                <div className="skeleton-line"></div>
                <div className="skeleton-line short"></div>
              </div>
              
              {/* 버튼 스켈레톤 */}
              <div className="tool-actions">
                <div className="skeleton-button"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
});

SkeletonCard.displayName = 'SkeletonCard';

export default SkeletonCard; 