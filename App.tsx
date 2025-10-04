
import React, { useState, useCallback, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FiSettings } from 'react-icons/fi';
import { analyzeTranscript, generateNewPlan, generateIdeas } from './services/geminiService';
import { getVideoDetails } from './services/youtubeService';
import type { VideoDetails } from './services/youtubeService';
import type { AnalysisResult, NewPlan, ScriptStage, OutlineStage, StructuredContent, ScriptQuote } from './types';
import ResultCard from './components/ResultCard';
import KeywordPill from './components/KeywordPill';
import Loader from './components/Loader';
import ApiKeyModal from './components/ApiKeyModal';
import AdSense from './components/AdSense';
import { getStoredApiKey, saveApiKey } from './utils/apiKeyStorage';
import { highlightImportantText } from './utils/textHighlight';

const categories = ['썰 채널', '정보 전달', '쇼핑 리뷰', 'IT/테크', '요리/쿡방', '뷰티', '게임'];
const lengthOptions = ['8분', '30분', '1시간'];
const contentTypes = ['숏폼', '롱폼'];
const characterColors = ['text-red-400', 'text-cyan-400', 'text-green-400', 'text-yellow-400', 'text-purple-400', 'text-orange-400'];

const App: React.FC = () => {
  const [youtubeUrl, setYoutubeUrl] = useState<string>('');
  const [transcript, setTranscript] = useState<string>('');
  const [newKeyword, setNewKeyword] = useState<string>('');
  
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [newPlan, setNewPlan] = useState<NewPlan | null>(null);
  const [suggestedIdeas, setSuggestedIdeas] = useState<string[]>([]);
  
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState<boolean>(false);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0]);
  const [contentType, setContentType] = useState<string>('롱폼');
  const [lengthMode, setLengthMode] = useState<string>('8분');
  const [customLength, setCustomLength] = useState<string>('8분');
  
  const [videoDetails, setVideoDetails] = useState<VideoDetails | null>(null);
  const [characterColorMap, setCharacterColorMap] = useState(new Map<string, string>());
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);
  
  // API 키 관리
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [showApiKeyModal, setShowApiKeyModal] = useState<boolean>(false);

  // API 키 로드
  useEffect(() => {
    const storedKey = getStoredApiKey();
    if (storedKey) {
      setApiKey(storedKey);
    }
  }, []);

  useEffect(() => {
    const fetchVideoDetails = async () => {
      const trimmedUrl = youtubeUrl.trim();
      if (!trimmedUrl) {
        setVideoDetails(null);
        setError(null);
        return;
      }

      setIsFetchingDetails(true);
      setError(null);
      try {
        const details = await getVideoDetails(youtubeUrl);
        setVideoDetails(details);
      } catch (err) {
        setVideoDetails(null);
        setError('유효하지 않은 YouTube URL이거나 영상 정보를 가져올 수 없습니다.');
      } finally {
        setIsFetchingDetails(false);
      }
    };
    
    const timer = setTimeout(() => {
        fetchVideoDetails();
    }, 300);

    return () => clearTimeout(timer);
  }, [youtubeUrl]);
  
  useEffect(() => {
    if (lengthMode !== 'custom') {
      setCustomLength(lengthMode);
    }
  }, [lengthMode]);

  useEffect(() => {
    if (newPlan?.characters) {
        const newMap = new Map<string, string>();
        newPlan.characters.forEach((char, index) => {
            newMap.set(char, characterColors[index % characterColors.length]);
        });
        setCharacterColorMap(newMap);
    }
  }, [newPlan]);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setYoutubeUrl(newUrl);
    setAnalysisResult(null);
    setNewPlan(null);
    setSuggestedIdeas([]);
  };

  const handleRemoveUrl = () => {
    setYoutubeUrl('');
    setAnalysisResult(null);
    setNewPlan(null);
    setSuggestedIdeas([]);
    setError(null);
  };

  const handleSaveApiKey = (key: string) => {
    saveApiKey(key);
    setApiKey(key);
  };

  const handleAnalyze = useCallback(async () => {
    if (!apiKey) {
      setShowApiKeyModal(true);
      setError('API 키를 먼저 설정해주세요.');
      return;
    }
    if (!transcript) {
      setError('분석할 스크립트를 입력해주세요.');
      return;
    }
    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);
    setNewPlan(null);
    setSuggestedIdeas([]);

    try {
      const result = await analyzeTranscript(transcript, selectedCategory, apiKey, videoDetails?.title);
      setAnalysisResult(result);
      
      setIsGeneratingIdeas(true);
      try {
        const ideas = await generateIdeas(result, selectedCategory, apiKey);
        setSuggestedIdeas(ideas);
      } catch (e: any) {
        setError(e.message || '아이디어 생성 중 오류가 발생했습니다.');
      } finally {
        setIsGeneratingIdeas(false);
      }
    } catch (e: any) {
      setError(e.message || '분석 중 오류가 발생했습니다.');
    } finally {
      setIsAnalyzing(false);
    }
  }, [transcript, selectedCategory, videoDetails, apiKey]);

  const handleRefreshIdeas = useCallback(async () => {
    if (!analysisResult || !apiKey) return;
    setIsGeneratingIdeas(true);
    setError(null);
    try {
      const ideas = await generateIdeas(analysisResult, selectedCategory, apiKey);
      setSuggestedIdeas(ideas);
    } catch (e: any) {
      setError(e.message || '아이디어 재생성 중 오류가 발생했습니다.');
    } finally {
      setIsGeneratingIdeas(false);
    }
  }, [analysisResult, selectedCategory, apiKey]);

  const handleGenerate = useCallback(async () => {
    if (!apiKey) {
      setShowApiKeyModal(true);
      setError('API 키를 먼저 설정해주세요.');
      return;
    }
    if (!analysisResult || !newKeyword) {
      setError('분석 결과와 새로운 키워드가 모두 필요합니다.');
      return;
    }
    setIsGenerating(true);
    setError(null);
    setNewPlan(null);
    
    try {
      const result = await generateNewPlan(analysisResult, newKeyword, customLength, selectedCategory, apiKey);
      setNewPlan(result);
    } catch (e: any) {
      setError(e.message || '기획안 생성 중 오류가 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
  }, [analysisResult, newKeyword, customLength, selectedCategory, apiKey]);
  
  const handleCopyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    setCopiedPrompt(prompt);
    setTimeout(() => setCopiedPrompt(null), 2000);
  };

  // --- Text Formatting Helpers for Download ---
  const formatKeywordsToText = (keywords: string[]): string => keywords.join(', ');

  const formatStructuredContentToText = (content: StructuredContent[]): string => {
    return content.map(item => `[${item.title}]\n${item.description.replace(/\*\*/g, '')}`).join('\n\n---\n\n');
  };

  const formatScriptStructureToText = (stages: ScriptStage[]): string => {
    return stages.map(stage => 
      `[${stage.stage}]\n` +
      `목적: ${stage.purpose}\n\n` +
      `주요 인용구:\n${stage.quotes.map(q => `[${q.timestamp}] "${q.text}"`).join('\n')}`
    ).join('\n\n---\n\n');
  };
  
  const formatOutlineToText = (stages: OutlineStage[]): string => {
    return stages.map(stage =>
      `[${stage.stage}]\n` +
      `목적: ${stage.purpose}\n\n` +
      `상세 내용:\n${stage.details.replace(/\*\*/g, '')}`
    ).join('\n\n---\n\n');
  };

  const formatScriptWithCharactersToText = (script: { character: string; line: string }[]): string => {
    return script.map(item => `${item.character}: ${item.line}`).join('\n');
  };


  const ideasTitle = selectedCategory === '쇼핑 리뷰' ? '리뷰할 제품 추천' : '새로운 아이디어 제안';
  const newKeywordPlaceholder = selectedCategory === '쇼핑 리뷰' ? '리뷰할 제품명 입력' : '떡상할 제목을 입력하세요';

  return (
    <div className="min-h-screen bg-[#121212] text-white font-sans p-4 sm:p-8">
      <ApiKeyModal
        isOpen={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
        onSave={handleSaveApiKey}
        currentApiKey={apiKey}
      />
      
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-10">
          <div className="flex justify-between items-center mb-4">
            <div className="flex-1"></div>
            <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-[#FF0000] to-[#FF2B2B] bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(255,0,0,0.6)] whitespace-nowrap">
              유튜브 영상 분석 AI
            </h1>
            <div className="flex-1 flex justify-end">
              <button
                onClick={() => setShowApiKeyModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors border border-gray-700"
                title="API 키 설정"
              >
                <FiSettings size={20} />
                <span className="hidden sm:inline text-sm">API 키</span>
                {apiKey && <span className="w-2 h-2 bg-green-500 rounded-full"></span>}
              </button>
            </div>
          </div>
          <p className="text-neutral-300 mb-4">성공한 유튜브 영상의 비밀을 분석하고, 당신의 다음 대박 영상을 기획하세요.</p>
          <nav className="flex justify-center gap-3">
            <a 
              href="/guide" 
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors border border-zinc-700 text-sm font-medium"
            >
              📖 사용법
            </a>
            <a 
              href="/api-guide" 
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors border border-zinc-700 text-sm font-medium"
            >
              🔑 API 발급
            </a>
          </nav>
        </header>

        <AdSense />

        <main>
          {/* --- INPUT SECTION --- */}
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6 mb-8">
            <div className="mb-6">
              <label htmlFor="youtube-url" className="block text-2xl font-bold text-neutral-100 mb-3">유튜브 URL 입력</label>
              {!videoDetails ? (
                <div className="relative mt-1">
                  <input 
                    type="text" 
                    id="youtube-url"
                    value={youtubeUrl}
                    onChange={handleUrlChange}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full bg-[#121212] border border-[#2A2A2A] rounded-md p-2 text-neutral-200 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                  />
                  {isFetchingDetails && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-500"></div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative group mt-2">
                  <div className="border border-[#2A2A2A] rounded-lg overflow-hidden bg-zinc-900/50 focus-within:ring-2 focus-within:ring-red-500">
                    <a href={youtubeUrl} target="_blank" rel="noopener noreferrer" className="block hover:opacity-90 transition-opacity focus:outline-none">
                      <img src={videoDetails.thumbnailUrl} alt="YouTube Video Thumbnail" className="w-full object-cover aspect-video" />
                      <div className="p-4 border-t border-[#2A2A2A]">
                        <p className="font-semibold text-white mb-1 truncate" title={videoDetails.title}>{videoDetails.title}</p>
                        <p className="text-xs text-neutral-400">www.youtube.com</p>
                      </div>
                    </a>
                    <button
                      onClick={handleRemoveUrl}
                      className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                      aria-label="링크 제거"
                      title="링크 제거"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mb-6">
              <label className="block text-2xl font-bold text-neutral-100 mb-3">카테고리 선택</label>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                      selectedCategory === category
                        ? 'bg-gradient-to-br from-[#D90000] to-[#FF2B2B] text-white shadow-[0_0_10px_rgba(255,43,43,0.5)]'
                        : 'bg-[#2A2A2A] hover:bg-zinc-700 text-neutral-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-3">
                <label htmlFor="transcript" className="block text-2xl font-bold text-neutral-100">대본 입력</label>
                <div className="flex gap-2">
                  {contentTypes.map(type => (
                    <button
                      key={type}
                      onClick={() => setContentType(type)}
                      className={`px-3 py-1 text-sm font-medium rounded-md transition-all duration-200 ${
                        contentType === type
                          ? 'bg-gradient-to-br from-[#D90000] to-[#FF2B2B] text-white'
                          : 'bg-[#2A2A2A] hover:bg-zinc-700 text-neutral-200'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              <textarea 
                id="transcript"
                rows={10}
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="여기에 스크립트를 붙여넣어 주세요."
                className="w-full bg-[#121212] border border-[#2A2A2A] rounded-md p-2 text-neutral-200 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
              />
            </div>
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !transcript}
              className="w-full mt-4 bg-gradient-to-br from-[#D90000] to-[#FF2B2B] text-white font-bold py-3 px-4 rounded-lg hover:from-[#D90000]/90 hover:to-[#FF2B2B]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
            >
              {isAnalyzing ? '분석 중...' : '떡상 이유 분석하기'}
            </button>
          </div>
          
          {error && <div className="bg-red-900 border border-red-700 text-red-200 p-4 rounded-lg my-6 text-center">{error}</div>}

          {/* --- SEPARATOR --- */}
          <div className="my-12">
            <div className="relative">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-[#2A2A2A]"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-[#121212] px-4 text-sm font-semibold text-neutral-400">결과 및 기획안</span>
              </div>
            </div>
          </div>

          <AdSense />

          {/* --- ANALYSIS RESULTS SECTION --- */}
          <div id="analysis-results" className="mb-12">
            <h2 className="text-3xl font-bold text-center mb-6 text-white">영상 분석 결과</h2>
            {isAnalyzing ? (
              <Loader />
            ) : analysisResult ? (
              <>
                <ResultCard 
                  title="1. 영상의 핵심 키워드"
                  contentToCopy={formatKeywordsToText(analysisResult.keywords)}
                  downloadFileName="keywords-analysis"
                >
                  <div className="flex flex-wrap">
                    {analysisResult.keywords.map((kw, i) => <KeywordPill key={i} keyword={kw} />)}
                  </div>
                </ResultCard>

                <ResultCard 
                  title="2. 기획 의도"
                  contentToCopy={formatStructuredContentToText(analysisResult.intent)}
                  downloadFileName="intent-analysis"
                >
                  <div className="space-y-6">
                    {analysisResult.intent.map((item, index) => (
                      <div key={index} className="bg-zinc-900 p-4 rounded-lg border border-[#2A2A2A]">
                        <h3 className="font-bold text-red-500 mb-2">{item.title}</h3>
                        <div 
                          className="prose prose-invert max-w-none prose-p:text-white prose-strong:text-red-500"
                          dangerouslySetInnerHTML={{ __html: highlightImportantText(item.description.replace(/\*\*/g, '')) }}
                        />
                      </div>
                    ))}
                  </div>
                </ResultCard>

                <ResultCard 
                  title="3. 조회수 예측 분석"
                  contentToCopy={formatStructuredContentToText(analysisResult.viewPrediction)}
                  downloadFileName="view-prediction-analysis"
                >
                   <div className="space-y-6">
                    {analysisResult.viewPrediction.map((item, index) => (
                      <div key={index} className="bg-zinc-900 p-4 rounded-lg border border-[#2A2A2A]">
                        <h3 className="font-bold text-red-500 mb-2">{item.title}</h3>
                        <div 
                          className="prose prose-invert max-w-none prose-p:text-white prose-strong:text-red-500"
                          dangerouslySetInnerHTML={{ __html: highlightImportantText(item.description.replace(/\*\*/g, '')) }}
                        />
                      </div>
                    ))}
                  </div>
                </ResultCard>
              
                {analysisResult.scriptStructure && (
                  <ResultCard 
                    title="4. 대본 구조 분석"
                    contentToCopy={formatScriptStructureToText(analysisResult.scriptStructure)}
                    downloadFileName="script-structure-analysis"
                  >
                    <div className="space-y-6">
                      {analysisResult.scriptStructure.map((stage: ScriptStage, index: number) => (
                        <div key={index} className="bg-zinc-900 p-4 rounded-lg border border-[#2A2A2A]">
                          <h3 className="font-bold text-lg text-red-500 mb-3">{stage.stage}</h3>
                          <div 
                            className="prose prose-invert max-w-none prose-p:text-white prose-strong:text-red-500 mb-4"
                            dangerouslySetInnerHTML={{ __html: highlightImportantText(stage.purpose.replace(/\*\*/g, '')) }}
                          />
                          <ul className="space-y-3 text-white">
                            {stage.quotes.map((quote: ScriptQuote, qIndex: number) => (
                               <li key={qIndex} className="text-base flex items-start">
                                  <span className="font-mono text-red-500 mr-3 w-16 text-right flex-shrink-0">[{quote.timestamp}]</span>
                                  <span>"{quote.text}"</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </ResultCard>
                )}
              </>
            ) : (
              <div className="bg-[#1A1A1A] border-2 border-dashed border-[#2A2A2A] rounded-xl p-8 text-center text-neutral-400">
                <p className="text-lg font-semibold">분석 결과가 여기에 표시됩니다</p>
                <p className="mt-2 text-sm">스크립트를 입력하고 분석 버튼을 눌러주세요.</p>
              </div>
            )}
          </div>

          <AdSense />

          {/* --- NEW PLAN GENERATION SECTION --- */}
          <div id="generation-section" className="mb-8">
              <h2 className="text-3xl font-bold text-center mb-6 text-white">나만의 떡상 대본 작성</h2>
              <div className={`bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6 space-y-6 transition-opacity ${!analysisResult && 'opacity-50 pointer-events-none'}`}>
                 <div>
                  <label className="block text-xl font-bold text-neutral-100 mb-3">예상 영상 길이</label>
                  <div className="flex flex-wrap items-center gap-2">
                    {lengthOptions.map(option => (
                      <button
                        key={option}
                        onClick={() => setLengthMode(option)}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                          lengthMode === option
                            ? 'bg-gradient-to-br from-[#D90000] to-[#FF2B2B] text-white shadow-[0_0_10px_rgba(255,43,43,0.5)]'
                            : 'bg-[#2A2A2A] hover:bg-zinc-700 text-neutral-200'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                    <button
                      key="custom"
                      onClick={() => setLengthMode('custom')}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                        lengthMode === 'custom'
                         ? 'bg-gradient-to-br from-[#D90000] to-[#FF2B2B] text-white shadow-[0_0_10px_rgba(255,43,43,0.5)]'
                         : 'bg-[#2A2A2A] hover:bg-zinc-700 text-neutral-200'
                      }`}
                    >
                      사용자 입력
                    </button>
                    <input
                      id="video-length"
                      type="text"
                      value={customLength}
                      onChange={(e) => setCustomLength(e.target.value)}
                      placeholder="예: 15분 30초"
                      className="flex-grow bg-[#121212] border border-[#2A2A2A] rounded-md p-2 text-neutral-200 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={lengthMode !== 'custom'}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xl font-bold text-neutral-100 mb-3">{ideasTitle}</label>
                    <button
                      onClick={handleRefreshIdeas}
                      disabled={isGeneratingIdeas || !analysisResult}
                      className="text-sm font-medium text-red-500 hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      새로고침
                    </button>
                  </div>
                  {isGeneratingIdeas ? (
                    <div className="flex justify-center items-center h-24 rounded-lg bg-zinc-900">
                      <Loader />
                    </div>
                  ) : suggestedIdeas.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {suggestedIdeas.map((idea, index) => (
                        <button
                          key={index}
                          onClick={() => setNewKeyword(idea)}
                          className="bg-[#2A2A2A] hover:bg-zinc-700 text-neutral-200 text-left text-sm px-4 py-2 rounded-lg transition-colors flex-grow"
                        >
                          {idea}
                        </button>
                      ))}
                    </div>
                  ) : (
                     <div className="text-center p-4 rounded-lg bg-zinc-900 text-sm text-neutral-400">
                        {analysisResult ? "새로운 아이디어를 생성 중이거나 생성할 수 없습니다." : "영상을 분석하면 아이디어가 제안됩니다."}
                     </div>
                  )}
                </div>

                 <div>
                  <label htmlFor="new-keyword" className="block text-xl font-bold text-neutral-100 mb-3">새로운 떡상 제목 (직접 입력 또는 아이디어 선택)</label>
                  <input
                    id="new-keyword"
                    type="text"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    placeholder={newKeywordPlaceholder}
                    className="w-full bg-[#121212] border border-[#2A2A2A] rounded-md p-3 text-neutral-200 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                  />
                </div>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !newKeyword || !analysisResult}
                  className="w-full bg-gradient-to-br from-[#D90000] to-[#FF2B2B] text-white font-bold py-3 px-6 rounded-lg hover:from-[#D90000]/90 hover:to-[#FF2B2B]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
                >
                  {isGenerating ? '생성 중...' : '기획안 생성'}
                </button>
              </div>
          </div>
          
          {/* --- NEW PLAN RESULTS SECTION --- */}
          <div id="new-plan-results">
             {isGenerating ? (
              <Loader />
             ) : newPlan ? (
              <>
                <ResultCard 
                  title="5. 새로운 영상 기획 의도"
                  contentToCopy={formatStructuredContentToText(newPlan.newIntent)}
                  downloadFileName="new-plan-intent"
                >
                   <div className="space-y-6">
                    {newPlan.newIntent.map((item, index) => (
                      <div key={index} className="bg-zinc-900 p-4 rounded-lg border border-[#2A2A2A]">
                        <h3 className="font-bold text-red-500 mb-2">{item.title}</h3>
                        <div className="prose prose-invert max-w-none prose-p:text-white prose-strong:text-red-500 prose-strong:underline prose-strong:decoration-red-500/70 prose-strong:underline-offset-4">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.description}</ReactMarkdown>
                        </div>
                      </div>
                    ))}
                  </div>
                </ResultCard>

                {newPlan.scriptWithCharacters && newPlan.characters && (
                  <ResultCard 
                    title="6. 생성된 대본"
                    contentToCopy={formatScriptWithCharactersToText(newPlan.scriptWithCharacters)}
                    downloadFileName="generated-script"
                  >
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-red-500 mb-3">등장인물</h3>
                        <div className="flex flex-wrap gap-2 p-4 bg-zinc-900 rounded-lg border border-[#2A2A2A]">
                          {newPlan.characters.map((character, index) => (
                            <span key={index} className={`font-medium px-3 py-1 rounded-full text-sm ${characterColorMap.get(character)?.replace('text-', 'bg-')}/20 ${characterColorMap.get(character)}`}>
                              {character}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-red-500 mb-3">대본 내용</h3>
                        <div className="space-y-4 max-h-[600px] overflow-y-auto p-4 bg-zinc-900 rounded-lg border border-[#2A2A2A]">
                          {newPlan.scriptWithCharacters.map((item, index) => (
                            <div key={index}>
                              <div className="flex items-start gap-4">
                                <div className="w-28 flex-shrink-0 pt-1">
                                  <span className={`font-bold text-sm ${characterColorMap.get(item.character) || 'text-red-500'}`}>{item.character}</span>
                                </div>
                                <div className="flex-grow prose prose-invert max-w-none prose-p:my-0 prose-p:text-white prose-strong:text-red-500 prose-strong:underline prose-strong:decoration-red-500/70 prose-strong:underline-offset-4">
                                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.line}</ReactMarkdown>
                                </div>
                              </div>
                              {item.imagePrompt && (
                                <div className="mt-3 ml-[128px] p-3 rounded-md border bg-zinc-950 border-zinc-700/50 relative group">
                                  <p className="text-xs font-semibold text-neutral-400 mb-1">🎨 이미지 생성 프롬프트</p>
                                  <p className="text-sm text-neutral-300 font-mono pr-16">{item.imagePrompt}</p>
                                  <button
                                    onClick={() => handleCopyPrompt(item.imagePrompt)}
                                    className="absolute top-2 right-2 text-xs bg-zinc-700 hover:bg-zinc-600 text-neutral-300 font-semibold py-1 px-2 rounded-md transition-all opacity-0 group-hover:opacity-100"
                                    title="프롬프트 복사"
                                  >
                                    {copiedPrompt === item.imagePrompt ? '복사됨!' : '복사'}
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </ResultCard>
                )}

                {newPlan.scriptOutline && (
                  <ResultCard 
                    title="6. 생성된 기획안 개요"
                    contentToCopy={formatOutlineToText(newPlan.scriptOutline)}
                    downloadFileName="plan-outline"
                  >
                     <div className="space-y-6">
                      {newPlan.scriptOutline.map((stage: OutlineStage, index: number) => (
                        <div key={index} className="bg-zinc-900 p-4 rounded-lg border border-[#2A2A2A]">
                          <h3 className="font-bold text-red-500 mb-2">{stage.stage}</h3>

                          <p className="text-sm text-neutral-200 mb-3">{stage.purpose}</p>
                          <div className="prose prose-invert max-w-none prose-p:text-white prose-strong:text-red-500 prose-strong:underline prose-strong:decoration-red-500/70 prose-strong:underline-offset-4">
                             <ReactMarkdown remarkPlugins={[remarkGfm]}>{stage.details}</ReactMarkdown>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ResultCard>
                )}
              </>
             ) : (
                <div className="bg-[#1A1A1A] border-2 border-dashed border-[#2A2A2A] rounded-xl p-8 text-center text-neutral-400">
                  <p className="text-lg font-semibold">생성된 기획안이 여기에 표시됩니다</p>
                  <p className="mt-2 text-sm">{analysisResult ? '새로운 영상의 키워드를 입력하고 기획안을 생성해주세요.' : '먼저 영상을 분석하여 기획안 생성 기능을 활성화하세요.'}</p>
                </div>
             )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;