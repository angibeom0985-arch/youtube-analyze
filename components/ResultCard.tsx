
import React from 'react';

interface ResultCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  contentToCopy: string;
  downloadFileName: string;
}

const ResultCard: React.FC<ResultCardProps> = ({ title, children, className, contentToCopy, downloadFileName }) => {

  const handleDownload = () => {
    const blob = new Blob([contentToCopy], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${downloadFileName}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6 mb-6 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-red-500 bg-clip-text text-transparent">{title}</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="text-xs bg-zinc-700 hover:bg-zinc-600 text-neutral-300 font-semibold py-1 px-3 rounded-md transition-colors"
            title="Download as .txt"
          >
            다운로드
          </button>
        </div>
      </div>
      <div className="text-white">
        {children}
      </div>
    </div>
  );
};

export default ResultCard;
