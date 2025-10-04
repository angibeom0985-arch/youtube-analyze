import React from 'react';
import { FiHome } from 'react-icons/fi';
import AdSense from '../components/AdSense';

const GuidePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#121212] text-white font-sans p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <a href="/" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-4">
            <FiHome size={20} />
            <span>홈으로 돌아가기</span>
          </a>
          <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-[#FF0000] to-[#FF2B2B] bg-clip-text text-transparent mb-4">
            사용 방법
          </h1>
          <p className="text-neutral-300">유튜브 영상 분석 AI 사용 가이드입니다.</p>
        </header>

        <main className="space-y-8">
          <section className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6">
            <h2 className="text-2xl font-bold text-red-500 mb-4">1. API 키 설정</h2>
            <div className="space-y-3 text-neutral-300">
              <p>서비스를 사용하려면 Google Gemini API 키가 필요합니다.</p>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>우측 상단의 "API 키" 버튼을 클릭합니다.</li>
                <li>발급받은 API 키를 입력하고 "저장하기"를 클릭합니다.</li>
                <li>API 키는 브라우저에만 저장되며 서버로 전송되지 않습니다.</li>
              </ol>
              <p className="mt-4">
                <a href="/api-guide" className="text-blue-400 hover:text-blue-300 underline">
                  API 키 발급 방법 자세히 보기 →
                </a>
              </p>
            </div>
          </section>

          <AdSense />

          <section className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6">
            <h2 className="text-2xl font-bold text-red-500 mb-4">2. 영상 분석하기</h2>
            <div className="space-y-3 text-neutral-300">
              <h3 className="font-semibold text-white">유튜브 URL 입력 (선택사항)</h3>
              <p>분석하고 싶은 유튜브 영상의 URL을 입력하면 썸네일과 제목을 자동으로 가져옵니다.</p>
              
              <h3 className="font-semibold text-white mt-4">카테고리 선택</h3>
              <p>분석할 영상의 카테고리를 선택합니다. 카테고리에 따라 분석 방식이 달라집니다.</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li><strong>정보 전달:</strong> 교육, 설명 중심의 영상</li>
                <li><strong>썰 채널:</strong> 스토리텔링, 에피소드 중심</li>
                <li><strong>쇼핑 리뷰:</strong> 제품 리뷰, 언박싱</li>
                <li><strong>IT/테크:</strong> 기술 리뷰, 설명</li>
                <li><strong>요리/쿡방:</strong> 요리 레시피, 먹방</li>
                <li><strong>뷰티:</strong> 화장품 리뷰, 메이크업 튜토리얼</li>
                <li><strong>게임:</strong> 게임 플레이, 공략</li>
              </ul>

              <h3 className="font-semibold text-white mt-4">대본 입력</h3>
              <p>분석할 영상의 대본을 입력합니다. 유튜브 자막을 복사하여 붙여넣으면 됩니다.</p>
              
              <h3 className="font-semibold text-white mt-4">분석 시작</h3>
              <p>"떡상 이유 분석하기" 버튼을 클릭하면 AI가 영상을 분석합니다.</p>
            </div>
          </section>

          <AdSense />

          <section className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6">
            <h2 className="text-2xl font-bold text-red-500 mb-4">3. 분석 결과 확인</h2>
            <div className="space-y-3 text-neutral-300">
              <p>AI가 다음 항목들을 분석하여 제공합니다:</p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li><strong>핵심 키워드:</strong> 영상의 주요 키워드 추출</li>
                <li><strong>기획 의도:</strong> 영상의 목적과 전략 분석</li>
                <li><strong>조회수 예측:</strong> 성공 요인 분석</li>
                <li><strong>대본 구조:</strong> 단계별 구성 분석 (썰 채널만)</li>
              </ul>
              <p className="mt-4">각 결과 카드에서 "복사" 또는 "다운로드" 버튼을 사용할 수 있습니다.</p>
            </div>
          </section>

          <section className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6">
            <h2 className="text-2xl font-bold text-red-500 mb-4">4. 새로운 영상 기획</h2>
            <div className="space-y-3 text-neutral-300">
              <h3 className="font-semibold text-white">예상 영상 길이 설정</h3>
              <p>생성할 영상의 목표 길이를 선택하거나 직접 입력합니다.</p>
              
              <h3 className="font-semibold text-white mt-4">키워드 선택</h3>
              <p>AI가 제안한 아이디어를 선택하거나 직접 키워드를 입력합니다.</p>
              
              <h3 className="font-semibold text-white mt-4">기획안 생성</h3>
              <p>"기획안 생성" 버튼을 클릭하면 새로운 영상 기획안과 대본이 생성됩니다.</p>
              
              <h3 className="font-semibold text-white mt-4">이미지 프롬프트 활용</h3>
              <p>썰 채널의 경우, 각 장면마다 이미지 생성 AI용 프롬프트가 제공됩니다. 이를 DALL-E, Midjourney 등에 활용할 수 있습니다.</p>
            </div>
          </section>

          <AdSense />

          <section className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6">
            <h2 className="text-2xl font-bold text-red-500 mb-4">5. 팁과 주의사항</h2>
            <div className="space-y-3 text-neutral-300">
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>정확한 분석을 위해 가능한 한 전체 대본을 입력하세요.</li>
                <li>카테고리는 영상의 성격에 맞게 선택하는 것이 중요합니다.</li>
                <li>생성된 기획안은 참고용이며, 창의적으로 수정하여 사용하세요.</li>
                <li>API 키는 사용량에 따라 과금될 수 있으니 주의하세요.</li>
                <li>분석 결과를 다운로드하여 보관할 수 있습니다.</li>
              </ul>
            </div>
          </section>

          <div className="text-center py-8">
            <a
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-[#D90000] to-[#FF2B2B] text-white font-bold rounded-lg hover:from-[#D90000]/90 hover:to-[#FF2B2B]/90 transition-all"
            >
              <FiHome size={20} />
              지금 시작하기
            </a>
          </div>
        </main>
      </div>
    </div>
  );
};

export default GuidePage;
