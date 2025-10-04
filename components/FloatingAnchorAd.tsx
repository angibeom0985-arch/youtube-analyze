import React, { useEffect } from 'react';

const FloatingAnchorAd: React.FC = () => {
  useEffect(() => {
    // AdSense 스크립트 로드
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }, []);

  // 화면 크기에 따른 광고 크기 결정
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const adWidth = isMobile ? '320px' : '728px';
  const adHeight = isMobile ? '50px' : '90px';

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40 bg-[#1A1A1A] shadow-lg rounded-lg overflow-hidden">
      <ins 
        className="adsbygoogle"
        style={{ display: 'inline-block', width: adWidth, height: adHeight }}
        data-ad-client="ca-pub-2686975437928535"
        data-ad-slot="8116896499"
      />
    </div>
  );
};

export default FloatingAnchorAd;
