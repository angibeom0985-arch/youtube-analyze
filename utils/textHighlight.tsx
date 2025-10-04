// 텍스트 강조를 위한 유틸리티 함수
// 중요 키워드에 밑줄 추가

export const highlightImportantText = (text: string): string => {
  if (!text) return '';
  
  // 중요한 키워드 패턴들
  const patterns = [
    // 목표/타겟 관련
    '목표 시청자', '목표시청자', '핵심 메시지', '핵심메시지',
    '기대 효과', '기대효과', '타겟 층', '타겟층',
    
    // 감정/효과 관련
    '감정적 연결', '감정 유발', '공감대', '공감',
    '흥미 유발', '흥미', '호기심', '궁금증',
    '몰입감', '몰입도', '집중력',
    
    // 구조/전략 관련
    '콘텐츠 구조', '영상 구조', '스토리텔링',
    '시선 끌기', '주목도', '문제 제기', '해결책',
    '클라이맥스', '반전', '도입부', '전개부', '결말', '마무리',
    
    // 중요도 표시
    '중요한', '핵심적인', '필수적인', '결정적인',
    '주요 요소', '핵심 요소', '핵심 포인트', '주요 포인트',
    
    // 특징/강점
    '특징', '장점', '강점', '차별점', '독창성', '참신함',
    
    // 전략/기법
    '전략', '기법', '방법론', '테크닉', '구성 방식',
    
    // 효과/결과
    '효과적', '효과', '성공 요인', '핵심 전략',
    '조회수', '참여도', '클릭률', '구독', '좋아요',
    
    // 콘텐츠 요소
    '썸네일', '제목', '키워드', '해시태그', '태그',
    
    // 시청자 반응
    '시청자 반응', '시청 유지율', '시청 시간', '재생 시간',
    
    // 세부 용어
    '주요', '핵심', '필수', '활용', '구현', '적용',
    '연출', '표현', '예상 조회수', '예측 조회수',
    '성과 지표', '분석 결과', '인사이트',
    
    // 성질 표현
    '신뢰성', '전문성', '독창성', '일관성', '효율성',
    '현실성', '구체성', '명확성', '적절성', '실용성',
    
    // 추가 중요 표현
    '시청자층', '정보 전달', '엔터테인먼트', '교육적 가치',
    '스토리 구성', '영상 편집', '자막 활용', '음악 선택',
    '분위기', '템포', '리듬', '긴장감', '이완',
  ];
  
  let result = text;
  
  // 먼저 줄바꿈을 br 태그로 변환
  result = result.replace(/\n/g, '<br/>');
  
  // 각 패턴을 순회하며 강조 처리
  patterns.forEach(keyword => {
    // 특수 문자 이스케이프
    const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // 이미 span 태그 안에 있지 않은 경우에만 매칭
    const regex = new RegExp(`(?![^<]*>)(${escapedKeyword})(?![^<]*</)`, 'gi');
    
    result = result.replace(regex, (match) => {
      return `<span class="underline decoration-2 decoration-orange-400 underline-offset-4 font-semibold">${match}</span>`;
    });
  });
  
  // 숫자+단위 패턴도 강조
  result = result.replace(/(\d+)%/g, '<span class="underline decoration-2 decoration-orange-400 underline-offset-4 font-semibold">$1%</span>');
  result = result.replace(/(\d+)만 회/g, '<span class="underline decoration-2 decoration-orange-400 underline-offset-4 font-semibold">$1만 회</span>');
  result = result.replace(/(\d+)초/g, '<span class="underline decoration-2 decoration-orange-400 underline-offset-4 font-semibold">$1초</span>');
  result = result.replace(/(\d+)분/g, '<span class="underline decoration-2 decoration-orange-400 underline-offset-4 font-semibold">$1분</span>');
  
  return result;
};

// ReactMarkdown에서 사용할 수 있도록 HTML을 렌더링하는 컴포넌트
export const HighlightedText: React.FC<{ text: string }> = ({ text }) => {
  const highlightedText = highlightImportantText(text);
  return <span dangerouslySetInnerHTML={{ __html: highlightedText }} />;
};
