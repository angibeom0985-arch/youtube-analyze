import React, { useEffect, useState } from 'react';

interface FloatingSideAdProps {
  position: 'left' | 'right';
}

const FloatingSideAd: React.FC<FloatingSideAdProps> = ({ position }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    // AdSense 스크립트 로드
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleToggle = () => {
    setIsMinimized(!isMinimized);
  };

  if (!isVisible) return null;

  const positionClasses = position === 'left' 
    ? 'left-0' 
    : 'right-0';

  const translateClass = isMinimized
    ? position === 'left' ? '-translate-x-full' : 'translate-x-full'
    : 'translate-x-0';

  const controlButtonPosition = position === 'left'
    ? 'right-0 translate-x-full'
    : 'left-0 -translate-x-full';

  return (
    <div 
      className={`fixed top-1/2 -translate-y-1/2 ${positionClasses} z-[90] transition-all duration-300 ${translateClass}`}
      style={{ 
        width: '160px',
        maxHeight: '600px',
      }}
    >
      {/* 광고 컨테이너 */}
      <div 
        className={`bg-gradient-to-b from-gray-900 via-black to-gray-900 border-2 ${
          position === 'left' ? 'border-l-0 rounded-r-xl' : 'border-r-0 rounded-l-xl'
        } border-red-500 shadow-2xl overflow-hidden`}
      >
        {/* 컨트롤 버튼 */}
        <div className={`absolute top-4 ${controlButtonPosition} flex flex-col gap-2`}>
          <button
            onClick={handleToggle}
            className={`bg-gray-800 hover:bg-gray-700 text-white p-2 ${
              position === 'left' ? 'rounded-r-lg' : 'rounded-l-lg'
            } text-xs font-semibold transition-colors border border-gray-600 ${
              position === 'left' ? 'border-l-0' : 'border-r-0'
            } shadow-lg`}
            title={isMinimized ? "광고 보기" : "광고 숨기기"}
          >
            {position === 'left' 
              ? (isMinimized ? '◀' : '▶') 
              : (isMinimized ? '▶' : '◀')
            }
          </button>
          <button
            onClick={handleClose}
            className={`bg-red-600 hover:bg-red-700 text-white p-2 ${
              position === 'left' ? 'rounded-r-lg' : 'rounded-l-lg'
            } text-xs font-semibold transition-colors border border-red-500 ${
              position === 'left' ? 'border-l-0' : 'border-r-0'
            } shadow-lg`}
            title="광고 닫기"
          >
            ✕
          </button>
        </div>

        {/* 광고 영역 */}
        <div className="p-2">
          <div className="text-center mb-2">
            <p className="text-[10px] text-gray-400">광고</p>
          </div>
          <div className="bg-black rounded-lg overflow-hidden">
            <ins 
              className="adsbygoogle"
              style={{ 
                display: 'block',
                minHeight: '400px'
              }}
              data-ad-client="ca-pub-2686975437928535"
              data-ad-slot="1369780468"
              data-ad-format="auto"
              data-full-width-responsive="true"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloatingSideAd;
