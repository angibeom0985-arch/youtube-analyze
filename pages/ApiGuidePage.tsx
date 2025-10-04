import React from 'react';
import { FiHome, FiExternalLink } from 'react-icons/fi';
import AdSense from '../components/AdSense';

const ApiGuidePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#121212] text-white font-sans p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <a href="/" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-4">
            <FiHome size={20} />
            <span>홈으로 돌아가기</span>
          </a>
          <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-[#FF0000] to-[#FF2B2B] bg-clip-text text-transparent mb-4">
            API 키 발급 방법
          </h1>
          <p className="text-neutral-300">Google Gemini API 키를 무료로 발급받는 방법을 안내합니다.</p>
        </header>

        <main className="space-y-8">
          <section className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6">
            <h2 className="text-2xl font-bold text-red-500 mb-4">Gemini API란?</h2>
            <div className="space-y-3 text-neutral-300">
              <p>Google Gemini는 구글의 최신 AI 모델로, 텍스트 생성과 분석에 뛰어난 성능을 보입니다.</p>
              <p>본 서비스는 Gemini API를 사용하여 유튜브 영상을 분석하고 새로운 콘텐츠를 기획합니다.</p>
              <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4 mt-4">
                <p className="text-blue-300 font-semibold">💡 무료 사용량</p>
                <p className="text-sm mt-2">Gemini API는 일정량까지 무료로 사용할 수 있습니다. 일반적인 사용에는 무료 한도로 충분합니다.</p>
              </div>
            </div>
          </section>

          <AdSense />

          <section className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6">
            <h2 className="text-2xl font-bold text-red-500 mb-4">발급 방법</h2>
            <div className="space-y-4 text-neutral-300">
              <div className="space-y-2">
                <h3 className="font-bold text-white text-lg">1단계: Google AI Studio 접속</h3>
                <p>아래 링크를 클릭하여 Google AI Studio에 접속합니다.</p>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  <span>Google AI Studio 열기</span>
                  <FiExternalLink size={16} />
                </a>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-white text-lg">2단계: Google 계정으로 로그인</h3>
                <p>Google 계정으로 로그인합니다. 계정이 없다면 새로 만들어야 합니다.</p>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-white text-lg">3단계: API 키 생성</h3>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>"Get API Key" 또는 "Create API Key" 버튼을 클릭합니다.</li>
                  <li>새 프로젝트를 생성하거나 기존 프로젝트를 선택합니다.</li>
                  <li>API 키가 생성되면 화면에 표시됩니다.</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-white text-lg">4단계: API 키 복사</h3>
                <p>생성된 API 키를 복사합니다. 이 키는 다시 확인할 수 없으므로 안전한 곳에 보관하세요.</p>
                <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4 mt-2">
                  <p className="text-yellow-300 font-semibold">⚠️ 보안 주의</p>
                  <p className="text-sm mt-1">API 키는 비밀번호처럼 안전하게 보관해야 합니다. 다른 사람과 공유하지 마세요.</p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-white text-lg">5단계: 웹사이트에 입력</h3>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>본 웹사이트 우측 상단의 "API 키" 버튼을 클릭합니다.</li>
                  <li>복사한 API 키를 입력란에 붙여넣습니다.</li>
                  <li>"저장하기" 버튼을 클릭하면 브라우저에 저장됩니다.</li>
                </ul>
              </div>
            </div>
          </section>

          <AdSense />

          <section className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6">
            <h2 className="text-2xl font-bold text-red-500 mb-4">자주 묻는 질문</h2>
            <div className="space-y-4 text-neutral-300">
              <div>
                <h3 className="font-semibold text-white">Q. API 키는 안전한가요?</h3>
                <p className="mt-1">네, API 키는 귀하의 브라우저에만 저장되며 서버로 전송되지 않습니다. localStorage에 안전하게 보관됩니다.</p>
              </div>

              <div>
                <h3 className="font-semibold text-white">Q. 무료로 얼마나 사용할 수 있나요?</h3>
                <p className="mt-1">Gemini API는 일정 요청 수까지 무료입니다. 자세한 내용은 Google AI Studio에서 확인할 수 있습니다.</p>
              </div>

              <div>
                <h3 className="font-semibold text-white">Q. API 키를 잃어버렸어요.</h3>
                <p className="mt-1">Google AI Studio에서 새 API 키를 생성할 수 있습니다. 이전 키는 삭제하고 새 키를 사용하세요.</p>
              </div>

              <div>
                <h3 className="font-semibold text-white">Q. 오류가 발생합니다.</h3>
                <p className="mt-1">API 키가 올바르게 입력되었는지 확인하세요. 키가 만료되었거나 사용량을 초과했을 수 있습니다.</p>
              </div>

              <div>
                <h3 className="font-semibold text-white">Q. API 키를 변경하고 싶어요.</h3>
                <p className="mt-1">우측 상단의 "API 키" 버튼을 클릭하여 언제든지 새 키로 변경할 수 있습니다.</p>
              </div>
            </div>
          </section>

          <AdSense />

          <section className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6">
            <h2 className="text-2xl font-bold text-red-500 mb-4">추가 자료</h2>
            <div className="space-y-3 text-neutral-300">
              <p>더 자세한 정보는 아래 공식 문서를 참고하세요:</p>
              <ul className="space-y-2">
                <li>
                  <a
                    href="https://ai.google.dev/tutorials/get_started_web"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 underline"
                  >
                    <span>Gemini API 시작 가이드</span>
                    <FiExternalLink size={14} />
                  </a>
                </li>
                <li>
                  <a
                    href="https://ai.google.dev/pricing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 underline"
                  >
                    <span>가격 정책 및 무료 할당량</span>
                    <FiExternalLink size={14} />
                  </a>
                </li>
              </ul>
            </div>
          </section>

          <div className="text-center py-8">
            <a
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-[#D90000] to-[#FF2B2B] text-white font-bold rounded-lg hover:from-[#D90000]/90 hover:to-[#FF2B2B]/90 transition-all"
            >
              <FiHome size={20} />
              분석 시작하기
            </a>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ApiGuidePage;
