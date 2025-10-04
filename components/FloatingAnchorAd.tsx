import React, { useEffect, useState } from 'react';

const FloatingAnchorAd: React.FC = () => {
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

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 z-[100] transition-all duration-300 ${
        isMinimized ? 'translate-y-full' : 'translate-y-0'
      }`}
      style={{ 
        boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(10px)'
      }}
    >
      {/* 컨트롤 버튼 */}
      <div className="absolute -top-10 right-4 flex gap-2">
        <button
          onClick={handleToggle}
          className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-1 rounded-t-lg text-xs font-semibold transition-colors border border-gray-600 border-b-0 shadow-lg"
          title={isMinimized ? "광고 보기" : "광고 숨기기"}
        >
          {isMinimized ? '▲' : '▼'}
        </button>
        <button
          onClick={handleClose}
          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-t-lg text-xs font-semibold transition-colors border border-red-500 border-b-0 shadow-lg"
          title="광고 닫기"
        >
          ✕
        </button>
      </div>

      {/* 광고 컨테이너 */}
      <div className="bg-gradient-to-r from-gray-900 via-black to-gray-900 border-t-2 border-red-500 p-2 sm:p-3">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-1">
            <p className="text-xs text-gray-400">광고</p>
          </div>
          <div className="bg-black rounded-lg p-2 overflow-hidden">
            <center>
              <ins 
                className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client="ca-pub-2686975437928535"
                data-ad-slot="8116896499"
                data-ad-format="auto"
                data-full-width-responsive="true"
              />
            </center>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloatingAnchorAd;
