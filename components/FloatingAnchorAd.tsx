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

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#1A1A1A] shadow-lg">
      <div className="max-w-7xl mx-auto px-2 py-1">
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
  );
};

export default FloatingAnchorAd;
