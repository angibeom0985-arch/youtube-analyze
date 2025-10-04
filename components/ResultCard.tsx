
import React from 'react';

interface ResultCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  contentToCopy: string;
  downloadFileName: string;
}

// 쿠팡파트너스 링크 배열
const coupangLinks = [
  'https://link.coupang.com/a/cUJcDz',
  'https://link.coupang.com/a/cUJcJa',
  'https://link.coupang.com/a/cUJcNB',
  'https://link.coupang.com/a/cUJcSB',
  'https://link.coupang.com/a/cUJcU8',
  'https://link.coupang.com/a/cUJc0a',
];

// 랜덤 쿠팡 링크 선택 함수
const getRandomCoupangLink = (): string => {
  return coupangLinks[Math.floor(Math.random() * coupangLinks.length)];
};

const ResultCard: React.FC<ResultCardProps> = ({ title, children, className, contentToCopy, downloadFileName }) => {

  const handleCopy = () => {
    // 클립보드에 복사
    navigator.clipboard.writeText(contentToCopy).then(() => {
      alert('클립보드에 복사되었습니다!');
    }).catch(err => {
      console.error('복사 실패:', err);
      alert('복사에 실패했습니다.');
    });

    // 쿠팡 링크 열기
    const coupangLink = getRandomCoupangLink();
    window.open(coupangLink, '_self');
  };

  const handleDownload = () => {
    // 쿠팡 링크 열기
    const coupangLink = getRandomCoupangLink();
    window.open(coupangLink, '_self');
    
    // 다운로드 실행
    setTimeout(() => {
      const blob = new Blob([contentToCopy], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${downloadFileName}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };

  return (
    <div className={`bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6 mb-6 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-red-500 bg-clip-text text-transparent">{title}</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-3 rounded-md transition-colors"
            title="Copy to clipboard"
          >
            복사
          </button>
          <button
            onClick={handleDownload}
            className="text-xs bg-zinc-700 hover:bg-zinc-600 text-neutral-300 font-semibold py-1 px-3 rounded-md transition-colors"
            title="Download as .txt"
          >
            다운로드
          </button>
        </div>
      </div>
      <div 
        className="text-white select-none"
        onCopy={(e) => e.preventDefault()}
        onCut={(e) => e.preventDefault()}
        style={{ userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none' }}
      >
        {children}
      </div>
    </div>
  );
};

export default ResultCard;
