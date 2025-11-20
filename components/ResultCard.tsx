import React, { useState } from "react";
import DownloadModal, { DownloadOptions } from "./DownloadModal";

interface ResultCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  contentToCopy: string;
  downloadFileName: string;
  imagePrompts?: string; // 이미지 프롬프트 추가
}

const ResultCard: React.FC<ResultCardProps> = ({
  title,
  children,
  className,
  contentToCopy,
  downloadFileName,
  imagePrompts,
}) => {
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  const handleDownload = (options: DownloadOptions) => {
    // 새 창 열기 (다운로드 진행 상황 표시)
    const downloadWindow = window.open(
      "/download-progress",
      "downloadProgress",
      "width=500,height=600,left=100,top=100"
    );

    // 다운로드 실행 (약간의 지연 후)
    setTimeout(() => {
      let content = "";
      
      // 다운로드 타입에 따라 content 결정
      if (options.downloadType === "script") {
        content = contentToCopy;
      } else if (options.downloadType === "imagePrompts" && imagePrompts) {
        content = imagePrompts;
      } else if (options.downloadType === "both") {
        content = contentToCopy + "\n\n" + "=".repeat(50) + "\n\n이미지 생성 프롬프트\n" + "=".repeat(50) + "\n\n" + (imagePrompts || "");
      }
      
      const now = new Date();
      const timestamp = now.toLocaleString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      // 메타데이터 추가
      if (options.includeMetadata) {
        content = `제목: ${title}\n${"=".repeat(50)}\n\n${content}`;
      }

      // 타임스탬프 추가
      if (options.includeTimestamp) {
        content = `생성 일시: ${timestamp}\n\n${content}`;
      }

      // 파일 확장자에 따른 다운로드
      const blob = new Blob([content], {
        type:
          options.format === "md"
            ? "text/markdown;charset=utf-8"
            : "text/plain;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${downloadFileName}.${options.format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // 새 창이 열려있으면 다운로드 완료 메시지 전송
      if (downloadWindow && !downloadWindow.closed) {
        downloadWindow.postMessage({ type: "DOWNLOAD_COMPLETE" }, "*");
      }
    }, 500);
  };

  // 드래그 방지 핸들러
  const preventSelection = (e: React.MouseEvent | React.DragEvent) => {
    e.preventDefault();
    return false;
  };

  // 우클릭 방지
  const preventContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    return false;
  };

  // 키보드 복사 방지 (Ctrl+C, Cmd+C)
  const preventKeyboardCopy = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === "c" || e.key === "C")) {
      e.preventDefault();
      return false;
    }
  };

  return (
    <>
      <DownloadModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        onDownload={handleDownload}
        title={title}
      />
      
      <div
        className={`bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6 mb-6 ${className} relative`}
      >
        {/* Sticky 헤더 영역 */}
        <div className="sticky top-0 bg-[#1A1A1A] z-10 -mx-6 -mt-6 px-6 pt-6 pb-4 rounded-t-xl border-b border-[#2A2A2A]">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-red-500 bg-clip-text text-transparent">
              {title}
            </h2>
            <button
              onClick={() => setShowDownloadModal(true)}
              className="group relative px-6 py-3 bg-gradient-to-br from-[#D90000] to-[#FF2B2B] text-white font-bold rounded-lg shadow-[0_0_20px_rgba(255,43,43,0.5)] hover:shadow-[0_0_30px_rgba(255,43,43,0.8)] transition-all transform hover:scale-[1.05] hover:-translate-y-0.5 active:scale-[0.98]"
              title="다운로드 옵션 설정"
            >
              <span className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 animate-bounce"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                💾 다운로드
              </span>
              <div className="absolute inset-0 rounded-lg bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
            </button>
          </div>
        </div>

        {/* 컨텐츠 영역 */}
        <div
          className="text-white mt-4"
          onMouseDown={preventSelection}
          onDragStart={preventSelection}
          onContextMenu={preventContextMenu}
          onCopy={(e) => {
            e.preventDefault();
          }}
          onCut={(e) => {
            e.preventDefault();
          }}
          onKeyDown={preventKeyboardCopy}
          style={{
            userSelect: "none",
            WebkitUserSelect: "none",
            MozUserSelect: "none",
            msUserSelect: "none",
            cursor: "default",
          }}
          tabIndex={0}
        >
          {children}
        </div>
      </div>
    </>
  );
};

export default ResultCard;
