// 텍스트 강조를 위한 유틸리티 함수
// 마크다운을 사용하지 않고 중요 키워드에 밑줄을 추가

export const highlightImportantText = (text: string): string => {
  // 중요한 키워드 패턴들
  const importantPatterns = [
    // 목표/타겟 관련
    /목표\s*시청자/g,
    /핵심\s*메시지/g,
    /기대\s*효과/g,
    /타겟\s*층/g,
    
    // 감정/효과 관련
    /감정적\s*연결/g,
    /공감대/g,
    /흥미\s*유발/g,
    /호기심/g,
    /궁금증/g,
    
    // 구조/전략 관련
    /콘텐츠\s*구조/g,
    /스토리텔링/g,
    /시선\s*끌기/g,
    /문제\s*제기/g,
    /해결책/g,
    /클라이맥스/g,
    /반전/g,
    
    // 중요도 표시
    /중요한/g,
    /핵심적인/g,
    /필수적인/g,
    /결정적인/g,
    
    // 특징
    /특징/g,
    /장점/g,
    /강점/g,
    /차별점/g,
  ];

  let result = text;
  
  // 각 패턴에 대해 밑줄 스타일 적용
  importantPatterns.forEach(pattern => {
    result = result.replace(pattern, (match) => {
      return `<span class="underline decoration-2 decoration-orange-400 underline-offset-4">${match}</span>`;
    });
  });
  
  return result;
};

// ReactMarkdown에서 사용할 수 있도록 HTML을 렌더링하는 컴포넌트
export const HighlightedText: React.FC<{ text: string }> = ({ text }) => {
  const highlightedText = highlightImportantText(text);
  return <span dangerouslySetInnerHTML={{ __html: highlightedText }} />;
};
