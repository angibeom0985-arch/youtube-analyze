import React, { useEffect } from 'react';

const FloatingAnchorAd: React.FC = () => {
  useEffect(() => {
    // AdSense 스크립트 로드 (모바일 + 데스크톱 두 개)
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#1A1A1A] border-t-2 border-red-500 shadow-2xl">
      <div className="max-w-7xl mx-auto px-2 py-1">
        <center>
          {/* 모바일: 320x50px */}
          <ins 
            className="adsbygoogle block md:hidden"
            style={{ display: 'inline-block', width: '320px', height: '50px' }}
            data-ad-client="ca-pub-2686975437928535"
            data-ad-slot="8015079861"
          />
          {/* 데스크톱: 728x90px */}
          <ins 
            className="adsbygoogle hidden md:block"
            style={{ display: 'inline-block', width: '728px', height: '90px' }}
            data-ad-client="ca-pub-2686975437928535"
            data-ad-slot="8015079861"
          />
        </center>
      </div>
    </div>
  );
};

export default FloatingAnchorAd;
