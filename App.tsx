import React, { useState, useCallback, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FiSettings, FiTrash2 } from "react-icons/fi";
import {
  analyzeTranscript,
  generateNewPlan,
  generateIdeas,
} from "./services/geminiService";
import { getVideoDetails } from "./services/youtubeService";
import type { VideoDetails } from "./services/youtubeService";
import type {
  AnalysisResult,
  NewPlan,
  ScriptStage,
  OutlineStage,
  StructuredContent,
  ScriptQuote,
} from "./types";
import ResultCard from "./components/ResultCard";
import KeywordPill from "./components/KeywordPill";
import Loader from "./components/Loader";
import ApiKeyModal from "./components/ApiKeyModal";
import AdSense from "./components/AdSense";
import Footer from "./components/Footer";
import AdBlockDetector from "./components/AdBlockDetector";
import AdBlockWarningModal from "./components/AdBlockWarningModal";
import FloatingAnchorAd from "./components/FloatingAnchorAd";
import SidebarAds from "./components/SidebarAds";
import { getStoredApiKey, saveApiKey } from "./utils/apiKeyStorage";
import { highlightImportantText } from "./utils/textHighlight.tsx";

const categories = [
  "썰 채널",
  "정보 전달",
  "쇼핑 리뷰",
  "IT/테크",
  "요리/쿡방",
  "뷰티",
  "게임",
  "건강",
  "미스터리",
  "브이로그",
  "야담",
  "먹방",
  "49금",
  "국뽕",
];
const lengthOptions = ["8분", "30분", "1시간"];
const contentTypes = ["숏폼", "롱폼"];
const vlogTypes = [
  "모닝 루틴",
  "다이어트",
  "여행",
  "언박싱",
  "패션",
  "공부",
  "운동",
  "일상",
  "데이트",
  "요리",
];
const characterColors = [
  "text-red-400",
  "text-cyan-400",
  "text-green-400",
  "text-yellow-400",
  "text-purple-400",
  "text-orange-400",
];

// 쿠팡파트너스 링크 배열
const coupangLinks = [
  "https://link.coupang.com/a/cUJcDz",
  "https://link.coupang.com/a/cUJcJa",
  "https://link.coupang.com/a/cUJcNB",
  "https://link.coupang.com/a/cUJcSB",
  "https://link.coupang.com/a/cUJcU8",
  "https://link.coupang.com/a/cUJc0a",
];

// 랜덤 쿠팡 링크 선택 함수
const getRandomCoupangLink = (): string => {
  return coupangLinks[Math.floor(Math.random() * coupangLinks.length)];
};

const App: React.FC = () => {
  const [youtubeUrl, setYoutubeUrl] = useState<string>("");
  const [transcript, setTranscript] = useState<string>("");
  const [newKeyword, setNewKeyword] = useState<string>("");
  const [userIdeaKeyword, setUserIdeaKeyword] = useState<string>("");

  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );
  const [newPlan, setNewPlan] = useState<NewPlan | null>(null);
  const [suggestedIdeas, setSuggestedIdeas] = useState<string[]>([]);

  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState<boolean>(false);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  // API 키 검증 로직 제거됨
  const [error, setError] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>(
    categories[0]
  );
  const [selectedVlogType, setSelectedVlogType] = useState<string>(
    vlogTypes[0]
  );
  const [contentType, setContentType] = useState<string>("롱폼");
  const [lengthMode, setLengthMode] = useState<string>("8분");
  const [customLength, setCustomLength] = useState<string>("8분");

  const [videoDetails, setVideoDetails] = useState<VideoDetails | null>(null);
  const [characterColorMap, setCharacterColorMap] = useState(
    new Map<string, string>()
  );
  const [copiedPromptIndex, setCopiedPromptIndex] = useState<number | null>(
    null
  );

  // API 키 관리
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [showApiKeyModal, setShowApiKeyModal] = useState<boolean>(false);

  // 애드블럭 감지
  const [adBlockDetected, setAdBlockDetected] = useState<boolean>(false);

  const handleAdBlockDetected = () => {
    setAdBlockDetected(true);
  };

  // API 키 로드
  useEffect(() => {
    const storedKey = getStoredApiKey();
    if (storedKey) {
      setApiKey(storedKey);
    }
  }, []);

  // 분석 결과 저장 (localStorage)
  useEffect(() => {
    if (analysisResult) {
      localStorage.setItem(
        "lastAnalysisResult",
        JSON.stringify(analysisResult)
      );
      localStorage.setItem("lastAnalysisTimestamp", Date.now().toString());
    }
  }, [analysisResult]);

  useEffect(() => {
    if (newPlan) {
      localStorage.setItem("lastNewPlan", JSON.stringify(newPlan));
      localStorage.setItem("lastNewPlanTimestamp", Date.now().toString());
    }
  }, [newPlan]);

  useEffect(() => {
    if (suggestedIdeas.length > 0) {
      localStorage.setItem(
        "lastSuggestedIdeas",
        JSON.stringify(suggestedIdeas)
      );
    }
  }, [suggestedIdeas]);

  useEffect(() => {
    if (transcript) {
      localStorage.setItem("lastTranscript", transcript);
    }
  }, [transcript]);

  useEffect(() => {
    if (youtubeUrl) {
      localStorage.setItem("lastYoutubeUrl", youtubeUrl);
    }
  }, [youtubeUrl]);

  useEffect(() => {
    if (newKeyword) {
      localStorage.setItem("lastNewKeyword", newKeyword);
    }
  }, [newKeyword]);

  // 페이지 로드 시 저장된 데이터 복원 (24시간 이내)
  useEffect(() => {
    const restoreData = () => {
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24시간

      // 분석 결과 복원
      const savedAnalysis = localStorage.getItem("lastAnalysisResult");
      const analysisTimestamp = localStorage.getItem("lastAnalysisTimestamp");
      if (savedAnalysis && analysisTimestamp) {
        const age = now - parseInt(analysisTimestamp);
        if (age < maxAge) {
          try {
            setAnalysisResult(JSON.parse(savedAnalysis));
          } catch (e) {
            console.error("Failed to restore analysis result:", e);
          }
        }
      }

      // 새 기획안 복원
      const savedPlan = localStorage.getItem("lastNewPlan");
      const planTimestamp = localStorage.getItem("lastNewPlanTimestamp");
      if (savedPlan && planTimestamp) {
        const age = now - parseInt(planTimestamp);
        if (age < maxAge) {
          try {
            setNewPlan(JSON.parse(savedPlan));
          } catch (e) {
            console.error("Failed to restore new plan:", e);
          }
        }
      }

      // 아이디어 복원
      const savedIdeas = localStorage.getItem("lastSuggestedIdeas");
      if (savedIdeas) {
        try {
          setSuggestedIdeas(JSON.parse(savedIdeas));
        } catch (e) {
          console.error("Failed to restore ideas:", e);
        }
      }

      // 입력값 복원
      const savedTranscript = localStorage.getItem("lastTranscript");
      if (savedTranscript) {
        setTranscript(savedTranscript);
      }

      const savedUrl = localStorage.getItem("lastYoutubeUrl");
      if (savedUrl) {
        setYoutubeUrl(savedUrl);
      }

      const savedKeyword = localStorage.getItem("lastNewKeyword");
      if (savedKeyword) {
        setNewKeyword(savedKeyword);
      }
    };

    restoreData();
  }, []); // 최초 한 번만 실행

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
        setError(
          "유효하지 않은 YouTube URL이거나 영상 정보를 가져올 수 없습니다."
        );
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
    if (lengthMode !== "custom") {
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

  // 강력한 복사/드래그/우클릭 방지 시스템
  useEffect(() => {
    // API 키 모달이 열려있으면 선택 해제 기능 비활성화
    if (showApiKeyModal) {
      return;
    }
    // 다층 방어 함수들
    const preventAction = (e: Event) => {
      // API 키 모달, 유튜브 URL 입력, 대본 입력 내부는 허용
      const target = e.target as HTMLElement;
      if (
        target?.closest(".api-key-modal") ||
        target?.closest(".youtube-url-input") ||
        target?.closest(".transcript-input")
      ) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    const preventCopy = (e: ClipboardEvent) => {
      // API 키 모달, 유튜브 URL 입력, 대본 입력 내부는 허용
      const target = e.target as HTMLElement;
      if (
        target?.closest(".api-key-modal") ||
        target?.closest(".youtube-url-input") ||
        target?.closest(".transcript-input")
      ) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      e.clipboardData?.clearData();
      return false;
    };

    const preventDrag = (e: DragEvent) => {
      // API 키 모달, 유튜브 URL 입력, 대본 입력 내부는 허용
      const target = e.target as HTMLElement;
      if (
        target?.closest(".api-key-modal") ||
        target?.closest(".youtube-url-input") ||
        target?.closest(".transcript-input")
      ) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    const preventSelect = (e: Event) => {
      // API 키 모달, 유튜브 URL 입력, 대본 입력 내부는 허용
      const target = e.target as HTMLElement;
      if (
        target?.closest(".api-key-modal") ||
        target?.closest(".youtube-url-input") ||
        target?.closest(".transcript-input")
      ) {
        return;
      }
      e.preventDefault();
      return false;
    };

    const preventPaste = (e: ClipboardEvent) => {
      // API 키 모달, 유튜브 URL 입력, 대본 입력 내부는 허용
      const target = e.target as HTMLElement;
      if (
        target?.closest(".api-key-modal") ||
        target?.closest(".youtube-url-input") ||
        target?.closest(".transcript-input")
      ) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    const disableTextSelection = () => {
      document.body.style.userSelect = "none";
      document.body.style.webkitUserSelect = "none";
      (document.body.style as any).msUserSelect = "none";
      (document.body.style as any).MozUserSelect = "none";
    };

    const preventKeyboardShortcuts = (e: KeyboardEvent) => {
      // API 키 모달, 유튜브 URL 입력, 대본 입력 내부는 허용
      const target = e.target as HTMLElement;
      if (
        target?.closest(".api-key-modal") ||
        target?.closest(".youtube-url-input") ||
        target?.closest(".transcript-input")
      ) {
        return;
      }

      // Ctrl+C, Ctrl+X, Ctrl+A, Ctrl+U, Ctrl+S, Ctrl+P, F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+Shift+S, PrintScreen, Win+Shift+S
      // 알캡처(ALCapture) 단축키: Ctrl+Shift+C/W/D/A/S/F
      // Ctrl+Shift+R은 새로고침을 위해 허용
      if (
        (e.ctrlKey && (e.key === "c" || e.key === "C")) ||
        (e.ctrlKey && (e.key === "x" || e.key === "X")) ||
        (e.ctrlKey && (e.key === "a" || e.key === "A")) ||
        (e.ctrlKey && (e.key === "u" || e.key === "U")) ||
        (e.ctrlKey && (e.key === "s" || e.key === "S")) || // 페이지 저장 차단
        (e.ctrlKey && (e.key === "p" || e.key === "P")) || // 인쇄 차단
        (e.ctrlKey && e.shiftKey && (e.key === "i" || e.key === "I")) ||
        (e.ctrlKey && e.shiftKey && (e.key === "j" || e.key === "J")) ||
        (e.ctrlKey && e.shiftKey && (e.key === "c" || e.key === "C")) || // 알캡처: 직접 시작 캡처
        (e.ctrlKey && e.shiftKey && (e.key === "w" || e.key === "W")) || // 알캡처: 창 캡처
        (e.ctrlKey && e.shiftKey && (e.key === "d" || e.key === "D")) || // 알캡처: 단일영역 캡처
        (e.ctrlKey && e.shiftKey && (e.key === "a" || e.key === "A")) || // 알캡처: 전체캡처
        (e.ctrlKey && e.shiftKey && (e.key === "s" || e.key === "S")) || // 알캡처: 스크롤 캡처 / Ctrl+Shift+S 페이지 저장
        (e.ctrlKey && e.shiftKey && (e.key === "f" || e.key === "F")) || // 알캡처: 지정사이즈 캡처
        (e.metaKey && e.shiftKey && (e.key === "s" || e.key === "S")) || // Win+Shift+S 스크린샷 도구 차단
        e.key === "F12" ||
        e.key === "PrintScreen" || // Print Screen 키 차단
        e.keyCode === 44 // Print Screen keyCode
      ) {
        // Ctrl+Shift+R은 허용 (새로고침)
        if (e.ctrlKey && e.shiftKey && (e.key === "r" || e.key === "R")) {
          return; // 이벤트를 차단하지 않음
        }
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // CSS로 선택 방지
    disableTextSelection();

    // 이벤트 리스너 등록 (capture phase에서 차단)
    const events = [
      { type: "contextmenu", handler: preventAction },
      { type: "copy", handler: preventCopy },
      { type: "cut", handler: preventCopy },
      { type: "paste", handler: preventPaste },
      { type: "selectstart", handler: preventSelect },
      { type: "dragstart", handler: preventDrag },
      { type: "drag", handler: preventDrag },
      { type: "dragover", handler: preventDrag },
      { type: "drop", handler: preventDrag },
      { type: "mousedown", handler: preventSelect },
      { type: "keydown", handler: preventKeyboardShortcuts },
    ];

    events.forEach(({ type, handler }) => {
      document.addEventListener(type, handler as EventListener, {
        capture: true,
        passive: false,
      });
    });

    // 주기적으로 스타일 재적용 (우회 방지, API 키 모달, 유튜브 URL 입력, 대본 입력 제외)
    const styleInterval = setInterval(() => {
      // API 키 모달, 유튜브 URL 입력, 대본 입력이 열려있으면 스킵
      const modal = document.querySelector(".api-key-modal");
      const youtubeInput = document.querySelector(".youtube-url-input");
      const transcriptInput = document.querySelector(".transcript-input");
      if (!modal && !youtubeInput && !transcriptInput) {
        disableTextSelection();
      }
    }, 1000);

    // Selection API 감시 및 차단 (API 키 모달, 유튜브 URL 입력, 대본 입력 제외)
    const clearSelection = () => {
      // API 키 모달, 유튜브 URL 입력, 대본 입력이 열려있으면 선택 해제하지 않음
      const modal = document.querySelector(".api-key-modal");
      const youtubeInput = document.querySelector(".youtube-url-input");
      const transcriptInput = document.querySelector(".transcript-input");
      if (modal || youtubeInput || transcriptInput) {
        return;
      }

      if (window.getSelection) {
        const selection = window.getSelection();
        if (selection && selection.toString().length > 0) {
          // 선택된 요소가 API 키 모달, 유튜브 URL 입력, 대본 입력 내부인지 확인
          try {
            const range = selection.getRangeAt(0);
            const container = range.commonAncestorContainer;
            const element = (
              container.nodeType === 1 ? container : container.parentElement
            ) as HTMLElement;
            if (
              element?.closest(".api-key-modal") ||
              element?.closest(".youtube-url-input") ||
              element?.closest(".transcript-input")
            ) {
              return;
            }
          } catch (e) {
            // selection이 없는 경우 무시
          }
          selection.removeAllRanges();
        }
      }
    };

    const selectionInterval = setInterval(clearSelection, 100);

    // DevTools 감지 및 경고
    const detectDevTools = () => {
      const threshold = 160;
      if (
        window.outerWidth - window.innerWidth > threshold ||
        window.outerHeight - window.innerHeight > threshold
      ) {
        console.clear();
      }
    };

    const devToolsInterval = setInterval(detectDevTools, 1000);

    // Cleanup
    return () => {
      events.forEach(({ type, handler }) => {
        document.removeEventListener(type, handler as EventListener, {
          capture: true,
        });
      });
      clearInterval(styleInterval);
      clearInterval(selectionInterval);
      clearInterval(devToolsInterval);

      // 스타일 복원
      document.body.style.userSelect = "";
      document.body.style.webkitUserSelect = "";
      (document.body.style as any).msUserSelect = "";
      (document.body.style as any).MozUserSelect = "";
    };
  }, [showApiKeyModal]);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setYoutubeUrl(newUrl);
    setAnalysisResult(null);
    setNewPlan(null);
    setSuggestedIdeas([]);
  };

  const handleRemoveUrl = () => {
    setYoutubeUrl("");
    setAnalysisResult(null);
    setNewPlan(null);
    setSuggestedIdeas([]);
    setError(null);
  };

  // 이미지 프롬프트 개별 복사
  const handleCopyPrompt = (prompt: string, index: number) => {
    // 클립보드에 복사
    navigator.clipboard
      .writeText(prompt)
      .then(() => {
        setCopiedPromptIndex(index);
        setTimeout(() => setCopiedPromptIndex(null), 2000);
        alert("✅ 이미지 프롬프트가 복사되었습니다!");

        // 1초 후 쿠팡 파트너스 링크 새창으로 열기
        setTimeout(() => {
          const coupangLink = getRandomCoupangLink();
          window.open(coupangLink, "_blank");
        }, 1000);
      })
      .catch((err) => {
        console.error("복사 실패:", err);
        alert("❌ 복사에 실패했습니다.");
      });
  };

  // 전체 초기화 함수
  const handleReset = () => {
    const confirmed = window.confirm(
      "모든 분석 내용과 입력값이 초기화됩니다. 계속하시겠습니까?"
    );
    if (!confirmed) return;

    // 상태 초기화
    setYoutubeUrl("");
    setTranscript("");
    setNewKeyword("");
    setAnalysisResult(null);
    setNewPlan(null);
    setSuggestedIdeas([]);
    setVideoDetails(null);
    setError(null);

    // localStorage 초기화
    localStorage.removeItem("lastAnalysisResult");
    localStorage.removeItem("lastAnalysisTimestamp");
    localStorage.removeItem("lastNewPlan");
    localStorage.removeItem("lastNewPlanTimestamp");
    localStorage.removeItem("lastSuggestedIdeas");
    localStorage.removeItem("lastTranscript");
    localStorage.removeItem("lastYoutubeUrl");
    localStorage.removeItem("lastNewKeyword");

    alert("✅ 모든 내용이 초기화되었습니다!");
  };

  const handleSaveApiKey = async (key: string) => {
    saveApiKey(key);
    setApiKey(key);
    setShowApiKeyModal(false);
    alert("✅ API 키가 성공적으로 설정되었습니다!");
  };

  const handleDeleteApiKey = (e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmed = window.confirm(
      "API 키 연결을 해제하시겠습니까?\n다시 사용하려면 API 키를 재입력해야 합니다."
    );
    if (confirmed) {
      localStorage.removeItem("gemini_api_key");
      setApiKey(null);
      alert("✅ API 키가 삭제되었습니다. 다시 API 키를 입력해주세요.");
    }
  };

  const handleAnalyze = useCallback(async () => {
    if (!apiKey) {
      setShowApiKeyModal(true);
      setError("API 키를 먼저 설정해주세요.");
      return;
    }
    if (!transcript) {
      setError("분석할 스크립트를 입력해주세요.");
      return;
    }
    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);
    setNewPlan(null);
    setSuggestedIdeas([]);

    try {
      const result = await analyzeTranscript(
        transcript,
        selectedCategory,
        apiKey,
        videoDetails?.title
      );
      setAnalysisResult(result);

      setIsGeneratingIdeas(true);
      try {
        const ideas = await generateIdeas(
          result,
          selectedCategory,
          apiKey,
          userIdeaKeyword
        );
        setSuggestedIdeas(ideas);
      } catch (e: any) {
        setError(e.message || "아이디어 생성 중 오류가 발생했습니다.");
      } finally {
        setIsGeneratingIdeas(false);
      }
    } catch (e: any) {
      setError(e.message || "분석 중 오류가 발생했습니다.");
    } finally {
      setIsAnalyzing(false);
    }
  }, [transcript, selectedCategory, videoDetails, apiKey]);

  const handleRefreshIdeas = useCallback(async () => {
    if (!analysisResult || !apiKey) return;
    setIsGeneratingIdeas(true);
    setError(null);
    try {
      const ideas = await generateIdeas(
        analysisResult,
        selectedCategory,
        apiKey,
        userIdeaKeyword
      );
      setSuggestedIdeas(ideas);
    } catch (e: any) {
      setError(e.message || "아이디어 재생성 중 오류가 발생했습니다.");
    } finally {
      setIsGeneratingIdeas(false);
    }
  }, [analysisResult, selectedCategory, apiKey, userIdeaKeyword]);

  const handleGenerate = useCallback(async () => {
    if (!apiKey) {
      setShowApiKeyModal(true);
      setError("API 키를 먼저 설정해주세요.");
      return;
    }
    if (!analysisResult || !newKeyword) {
      setError("분석 결과와 새로운 키워드가 모두 필요합니다.");
      return;
    }
    setIsGenerating(true);
    setError(null);
    setNewPlan(null);

    try {
      const result = await generateNewPlan(
        analysisResult,
        newKeyword,
        customLength,
        selectedCategory,
        apiKey,
        selectedCategory === "브이로그" ? selectedVlogType : undefined
      );
      setNewPlan(result);
    } catch (e: any) {
      setError(e.message || "기획안 생성 중 오류가 발생했습니다.");
    } finally {
      setIsGenerating(false);
    }
  }, [analysisResult, newKeyword, customLength, selectedCategory, apiKey]);

  // --- Text Formatting Helpers for Download ---
  const formatKeywordsToText = (keywords: string[]): string =>
    keywords.join(", ");

  const formatStructuredContentToText = (
    content: StructuredContent[]
  ): string => {
    return content
      .map(
        (item) => `[${item.title}]\n${item.description.replace(/\*\*/g, "")}`
      )
      .join("\n\n---\n\n");
  };

  const formatScriptStructureToText = (stages: ScriptStage[]): string => {
    return stages
      .map(
        (stage) =>
          `[${stage.stage}]\n` +
          `목적: ${stage.purpose}\n\n` +
          `주요 인용구:\n${stage.quotes
            .map((q) => `[${q.timestamp}] "${q.text}"`)
            .join("\n")}`
      )
      .join("\n\n---\n\n");
  };

  const formatOutlineToText = (stages: OutlineStage[]): string => {
    return stages
      .map(
        (stage) =>
          `[${stage.stage}]\n` +
          `목적: ${stage.purpose}\n\n` +
          `상세 내용:\n${stage.details.replace(/\*\*/g, "")}`
      )
      .join("\n\n---\n\n");
  };

  const formatScriptWithCharactersToText = (
    script: { character: string; line: string }[]
  ): string => {
    return script.map((item) => `${item.character}: ${item.line}`).join("\n");
  };

  const ideasTitle =
    selectedCategory === "쇼핑 리뷰"
      ? "리뷰할 제품 추천"
      : "새로운 아이디어 제안";
  const newKeywordPlaceholder =
    selectedCategory === "쇼핑 리뷰"
      ? "리뷰할 제품명 입력"
      : "떡상할 제목을 입력하세요";

  return (
    <div className="min-h-screen bg-[#121212] text-white font-sans p-4 sm:p-8 pb-32">
      {/* 애드블럭 감지 */}
      <AdBlockDetector onAdBlockDetected={handleAdBlockDetected} />

      {/* 애드블럭 경고 모달 */}
      <AdBlockWarningModal isOpen={adBlockDetected} />

      <ApiKeyModal
        isOpen={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
        onSave={handleSaveApiKey}
        currentApiKey={apiKey}
      />

      {/* 애드블럭 감지 시 컨텐츠 흐림 처리 */}
      <div
        className={`max-w-4xl mx-auto ${
          adBlockDetected ? "filter blur-sm pointer-events-none" : ""
        }`}
      >
        <header className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-[#FF0000] to-[#FF2B2B] bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(255,0,0,0.6)] mb-4">
            유튜브 떡상 대본의 비밀 파헤치기+모방
          </h1>
          <p className="text-neutral-300 mb-4">
            당신만 "이것"을 모릅니다. 떡상 비밀 파헤치고, 나만의 새로운 대본을
            1분만에 작성해보세요!
          </p>
          <nav className="flex justify-center gap-3 flex-wrap">
            <a
              href="/guide"
              className="px-4 py-2 bg-gradient-to-br from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 text-white rounded-lg transition-all border border-purple-500/50 text-sm font-medium shadow-lg shadow-purple-500/30"
            >
              📖 사용법
            </a>
            <a
              href="/api-guide"
              className="px-4 py-2 bg-gradient-to-br from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 text-white rounded-lg transition-all border border-blue-500/50 text-sm font-medium shadow-lg shadow-blue-500/30"
            >
              🗝️ API 키 발급 방법
            </a>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowApiKeyModal(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-medium shadow-lg ${
                  apiKey
                    ? "bg-gradient-to-br from-green-600 to-green-800 hover:from-green-500 hover:to-green-700 border border-green-500/50 shadow-green-500/30"
                    : "bg-gradient-to-br from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 border border-red-500/50 shadow-red-500/30 animate-pulse"
                } text-white`}
              >
                {apiKey ? (
                  <>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                      <span>⚙️ API 키 설정됨</span>
                    </span>
                  </>
                ) : (
                  <>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                      <span>⚙️ API 키 입력 필요</span>
                    </span>
                  </>
                )}
              </button>
              {apiKey && (
                <button
                  onClick={handleDeleteApiKey}
                  className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow-lg"
                  title="API 키 삭제"
                >
                  <FiTrash2 size={16} />
                </button>
              )}
            </div>
          </nav>

          {!apiKey && (
            <div className="mt-4 p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-center">
              <p className="text-red-300 text-sm font-medium">
                ⚠️ AI 분석 기능을 사용하려면 먼저{" "}
                <span className="font-bold text-red-200">API 키를 입력</span>
                해주세요!
              </p>
            </div>
          )}
        </header>

        <main>
          {/* --- INPUT SECTION --- */}
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6 mb-8">
            <div className="mb-6">
              <label
                htmlFor="youtube-url"
                className="block text-2xl font-bold text-neutral-100 mb-3"
              >
                유튜브 URL 입력
              </label>
              {!videoDetails ? (
                <div className="relative mt-1 youtube-url-input">
                  <input
                    type="text"
                    id="youtube-url"
                    value={youtubeUrl}
                    onChange={handleUrlChange}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full bg-[#121212] border border-[#2A2A2A] rounded-md p-2 text-neutral-200 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                    style={
                      {
                        userSelect: "text",
                        WebkitUserSelect: "text",
                      } as React.CSSProperties
                    }
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
                    <a
                      href={youtubeUrl}
                      className="block hover:opacity-90 transition-opacity focus:outline-none"
                    >
                      <img
                        src={videoDetails.thumbnailUrl}
                        alt="YouTube Video Thumbnail"
                        className="w-full object-cover aspect-video"
                      />
                      <div className="p-4 border-t border-[#2A2A2A]">
                        <p
                          className="font-semibold text-white mb-1 truncate"
                          title={videoDetails.title}
                        >
                          {videoDetails.title}
                        </p>
                        <p className="text-xs text-neutral-400">
                          www.youtube.com
                        </p>
                      </div>
                    </a>
                    <button
                      onClick={handleRemoveUrl}
                      className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                      aria-label="링크 제거"
                      title="링크 제거"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-2xl font-bold text-neutral-100 mb-3">
                카테고리 선택
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                      selectedCategory === category
                        ? "bg-gradient-to-br from-[#D90000] to-[#FF2B2B] text-white shadow-[0_0_10px_rgba(255,43,43,0.5)]"
                        : "bg-[#2A2A2A] hover:bg-zinc-700 text-neutral-200"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* 브이로그 서브타입 선택 */}
            {selectedCategory === "브이로그" && (
              <div className="mb-6">
                <label className="block text-xl font-bold text-neutral-100 mb-3">
                  브이로그 타입
                </label>
                <div className="flex flex-wrap gap-2">
                  {vlogTypes.map((vlogType) => (
                    <button
                      key={vlogType}
                      onClick={() => setSelectedVlogType(vlogType)}
                      className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                        selectedVlogType === vlogType
                          ? "bg-gradient-to-br from-[#D90000] to-[#FF2B2B] text-white shadow-[0_0_10px_rgba(255,43,43,0.5)]"
                          : "bg-[#2A2A2A] hover:bg-zinc-700 text-neutral-200"
                      }`}
                    >
                      {vlogType}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label
                  htmlFor="transcript"
                  className="block text-2xl font-bold text-neutral-100"
                >
                  대본 입력
                </label>
                <div className="flex gap-2">
                  {contentTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => setContentType(type)}
                      className={`px-3 py-1 text-sm font-medium rounded-md transition-all duration-200 ${
                        contentType === type
                          ? "bg-gradient-to-br from-[#D90000] to-[#FF2B2B] text-white"
                          : "bg-[#2A2A2A] hover:bg-zinc-700 text-neutral-200"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              <div className="transcript-input">
                <textarea
                  id="transcript"
                  rows={10}
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="여기에 스크립트를 붙여넣어 주세요."
                  className="w-full bg-[#121212] border border-[#2A2A2A] rounded-md p-2 text-neutral-200 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                  style={
                    {
                      userSelect: "text",
                      WebkitUserSelect: "text",
                    } as React.CSSProperties
                  }
                />
              </div>
            </div>
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !transcript}
              className="w-full mt-4 bg-gradient-to-br from-[#D90000] to-[#FF2B2B] text-white font-bold py-3 px-4 rounded-lg hover:from-[#D90000]/90 hover:to-[#FF2B2B]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
            >
              {isAnalyzing ? "분석 중..." : "떡상 이유 분석하기"}
            </button>
          </div>

          {error && (
            <div className="bg-red-900 border border-red-700 text-red-200 p-4 rounded-lg my-6 text-center">
              {error}
            </div>
          )}

          <AdSense />

          {/* --- SEPARATOR --- */}
          <div className="my-12">
            <div className="relative">
              <div
                className="absolute inset-0 flex items-center"
                aria-hidden="true"
              >
                <div className="w-full border-t border-[#2A2A2A]"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-[#121212] px-4 text-sm font-semibold text-neutral-400">
                  결과 및 기획안
                </span>
              </div>
            </div>
          </div>

          {/* --- ANALYSIS RESULTS SECTION --- */}
          <div id="analysis-results" className="mb-12">
            <h2 className="text-3xl font-bold text-center mb-6 text-white">
              영상 분석 결과
            </h2>
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
                    {analysisResult.keywords.map((kw, i) => (
                      <KeywordPill key={i} keyword={kw} />
                    ))}
                  </div>
                </ResultCard>

                <ResultCard
                  title="2. 기획 의도"
                  contentToCopy={formatStructuredContentToText(
                    analysisResult.intent
                  )}
                  downloadFileName="intent-analysis"
                >
                  <div className="space-y-6">
                    {analysisResult.intent.map((item, index) => (
                      <div
                        key={index}
                        className="bg-zinc-900 p-4 rounded-lg border border-[#2A2A2A]"
                      >
                        <h3 className="font-bold text-red-500 mb-2">
                          {item.title}
                        </h3>
                        <div
                          className="prose prose-invert max-w-none prose-p:text-white prose-strong:text-red-500"
                          dangerouslySetInnerHTML={{
                            __html: highlightImportantText(
                              item.description.replace(/\*\*/g, "")
                            ),
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </ResultCard>

                <AdSense />

                <ResultCard
                  title="3. 조회수 예측 분석"
                  contentToCopy={formatStructuredContentToText(
                    analysisResult.viewPrediction
                  )}
                  downloadFileName="view-prediction-analysis"
                >
                  <div className="space-y-6">
                    {analysisResult.viewPrediction.map((item, index) => (
                      <div
                        key={index}
                        className="bg-zinc-900 p-4 rounded-lg border border-[#2A2A2A]"
                      >
                        <h3 className="font-bold text-red-500 mb-2">
                          {item.title}
                        </h3>
                        <div
                          className="prose prose-invert max-w-none prose-p:text-white prose-strong:text-red-500"
                          dangerouslySetInnerHTML={{
                            __html: highlightImportantText(
                              item.description.replace(/\*\*/g, "")
                            ),
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </ResultCard>

                <AdSense />

                {analysisResult.scriptStructure && (
                  <ResultCard
                    title="4. 대본 구조 분석"
                    contentToCopy={formatScriptStructureToText(
                      analysisResult.scriptStructure
                    )}
                    downloadFileName="script-structure-analysis"
                  >
                    <div className="space-y-6">
                      {analysisResult.scriptStructure.map(
                        (stage: ScriptStage, index: number) => (
                          <div
                            key={index}
                            className="bg-zinc-900 p-4 rounded-lg border border-[#2A2A2A]"
                          >
                            <h3 className="font-bold text-lg text-red-500 mb-3">
                              {stage.stage}
                            </h3>
                            <div
                              className="prose prose-invert max-w-none prose-p:text-white prose-strong:text-red-500 mb-4"
                              dangerouslySetInnerHTML={{
                                __html: highlightImportantText(
                                  stage.purpose.replace(/\*\*/g, "")
                                ),
                              }}
                            />
                            <ul className="space-y-3 text-white">
                              {stage.quotes.map(
                                (quote: ScriptQuote, qIndex: number) => (
                                  <li
                                    key={qIndex}
                                    className="text-base flex items-start"
                                  >
                                    <span className="font-mono text-red-500 mr-3 w-16 text-right flex-shrink-0">
                                      [{quote.timestamp}]
                                    </span>
                                    <span>"{quote.text}"</span>
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        )
                      )}
                    </div>
                  </ResultCard>
                )}
              </>
            ) : (
              <div className="bg-[#1A1A1A] border-2 border-dashed border-[#2A2A2A] rounded-xl p-8 text-center text-neutral-400">
                <p className="text-lg font-semibold">
                  분석 결과가 여기에 표시됩니다
                </p>
                <p className="mt-2 text-sm">
                  스크립트를 입력하고 분석 버튼을 눌러주세요.
                </p>
              </div>
            )}
          </div>

          <AdSense />

          {/* --- NEW PLAN GENERATION SECTION --- */}
          <div id="generation-section" className="mb-8">
            <h2 className="text-3xl font-bold text-center mb-6 text-white">
              나만의 떡상 대본 작성
            </h2>
            <div
              className={`bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6 space-y-6 transition-opacity ${
                !analysisResult && "opacity-50 pointer-events-none"
              }`}
            >
              <div>
                <label className="block text-xl font-bold text-neutral-100 mb-3">
                  예상 영상 길이
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {lengthOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => setLengthMode(option)}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                        lengthMode === option
                          ? "bg-gradient-to-br from-[#D90000] to-[#FF2B2B] text-white shadow-[0_0_10px_rgba(255,43,43,0.5)]"
                          : "bg-[#2A2A2A] hover:bg-zinc-700 text-neutral-200"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                  <button
                    key="custom"
                    onClick={() => setLengthMode("custom")}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                      lengthMode === "custom"
                        ? "bg-gradient-to-br from-[#D90000] to-[#FF2B2B] text-white shadow-[0_0_10px_rgba(255,43,43,0.5)]"
                        : "bg-[#2A2A2A] hover:bg-zinc-700 text-neutral-200"
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
                    disabled={lengthMode !== "custom"}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xl font-bold text-neutral-100 mb-3">
                    {ideasTitle}
                  </label>
                  <button
                    onClick={handleRefreshIdeas}
                    disabled={isGeneratingIdeas || !analysisResult}
                    className="text-sm font-medium text-red-500 hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    새로고침
                  </button>
                </div>
                <div className="mb-3 user-idea-keyword-input">
                  <input
                    type="text"
                    value={userIdeaKeyword}
                    onChange={(e) => setUserIdeaKeyword(e.target.value)}
                    placeholder="원하는 키워드 입력 (선택사항) - 예: 다이어트, 여행, 게임"
                    className="w-full bg-[#121212] border border-[#2A2A2A] rounded-md p-2 text-sm text-neutral-200 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition new-idea-input"
                    style={
                      {
                        userSelect: "text",
                        WebkitUserSelect: "text",
                        cursor: "text",
                      } as React.CSSProperties
                    }
                  />
                  <p className="text-xs text-neutral-400 mt-1">
                    💡 특정 키워드를 입력하면 해당 키워드를 포함한 아이디어가
                    생성됩니다.
                  </p>
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
                    {analysisResult
                      ? "새로운 아이디어를 생성 중이거나 생성할 수 없습니다."
                      : "영상을 분석하면 아이디어가 제안됩니다."}
                  </div>
                )}
              </div>

              <div className="new-title-input">
                <label
                  htmlFor="new-keyword"
                  className="block text-xl font-bold text-neutral-100 mb-3"
                >
                  새로운 떡상 제목 (직접 입력 또는 아이디어 선택)
                </label>
                <input
                  id="new-keyword"
                  type="text"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  placeholder={newKeywordPlaceholder}
                  className="w-full bg-[#121212] border border-[#2A2A2A] rounded-md p-3 text-neutral-200 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                  style={
                    {
                      userSelect: "text",
                      WebkitUserSelect: "text",
                      cursor: "text",
                    } as React.CSSProperties
                  }
                />
              </div>
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !newKeyword || !analysisResult}
                className="w-full bg-gradient-to-br from-[#D90000] to-[#FF2B2B] text-white font-bold py-3 px-6 rounded-lg hover:from-[#D90000]/90 hover:to-[#FF2B2B]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
              >
                {isGenerating ? "생성 중..." : "기획안 생성"}
              </button>
            </div>
          </div>

          {/* --- NEW PLAN RESULTS SECTION --- */}
          <div id="new-plan-results">
            {isGenerating ? (
              <Loader />
            ) : newPlan ? (
              <>
                <AdSense />

                <ResultCard
                  title="5. 새로운 영상 기획 의도"
                  contentToCopy={formatStructuredContentToText(
                    newPlan.newIntent
                  )}
                  downloadFileName="new-plan-intent"
                >
                  <div className="space-y-6">
                    {newPlan.newIntent.map((item, index) => (
                      <div
                        key={index}
                        className="bg-zinc-900 p-4 rounded-lg border border-[#2A2A2A]"
                      >
                        <h3 className="font-bold text-red-500 mb-2">
                          {item.title}
                        </h3>
                        <div
                          className="prose prose-invert max-w-none prose-p:text-white prose-strong:text-red-500"
                          dangerouslySetInnerHTML={{
                            __html: highlightImportantText(
                              item.description.replace(/\*\*/g, "")
                            ),
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </ResultCard>

                <AdSense />

                {newPlan.scriptWithCharacters && newPlan.characters && (
                  <ResultCard
                    title="6. 생성된 대본"
                    contentToCopy={formatScriptWithCharactersToText(
                      newPlan.scriptWithCharacters
                    )}
                    downloadFileName="generated-script"
                  >
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-red-500 mb-3">
                          등장인물
                        </h3>
                        <div className="flex flex-wrap gap-2 p-4 bg-zinc-900 rounded-lg border border-[#2A2A2A]">
                          {newPlan.characters.map((character, index) => (
                            <span
                              key={index}
                              className={`font-medium px-3 py-1 rounded-full text-sm ${characterColorMap
                                .get(character)
                                ?.replace(
                                  "text-",
                                  "bg-"
                                )}/20 ${characterColorMap.get(character)}`}
                            >
                              {character}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-red-500 mb-3">
                          대본 내용
                        </h3>
                        <div className="space-y-4 max-h-[600px] overflow-y-auto p-4 bg-zinc-900 rounded-lg border border-[#2A2A2A]">
                          {newPlan.scriptWithCharacters.map((item, index) => (
                            <div key={index}>
                              <div className="flex items-start gap-4">
                                <div className="w-28 flex-shrink-0 pt-1">
                                  <span
                                    className={`font-bold text-sm ${
                                      characterColorMap.get(item.character) ||
                                      "text-red-500"
                                    }`}
                                  >
                                    {item.character}
                                  </span>
                                  {item.timestamp && (
                                    <div className="text-xs text-neutral-500 font-mono mt-1">
                                      [{item.timestamp}]
                                    </div>
                                  )}
                                </div>
                                <div className="flex-grow text-white whitespace-pre-wrap">
                                  {item.line}
                                </div>
                              </div>
                              {item.imagePrompt && (
                                <div className="mt-3 ml-[128px] p-3 rounded-md border bg-zinc-950 border-zinc-700/50 relative">
                                  <p className="text-xs font-semibold text-neutral-400 mb-1">
                                    🎨 이미지 생성 프롬프트
                                  </p>
                                  <p className="text-sm text-neutral-300 font-mono pr-16">
                                    {item.imagePrompt}
                                  </p>
                                  <button
                                    onClick={() =>
                                      handleCopyPrompt(item.imagePrompt, index)
                                    }
                                    className="absolute top-2 right-2 text-xs bg-gradient-to-br from-[#D90000] to-[#FF2B2B] hover:from-[#D90000]/90 hover:to-[#FF2B2B]/90 text-white font-bold py-1.5 px-3 rounded-md transition-all shadow-[0_0_10px_rgba(255,43,43,0.5)] hover:shadow-[0_0_15px_rgba(255,43,43,0.7)]"
                                    title="프롬프트 복사"
                                  >
                                    {copiedPromptIndex === index
                                      ? "✅ 복사됨!"
                                      : "📋 복사"}
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

                <AdSense />

                {/* 다른 사이트 소개 섹션 */}
                {newPlan.scriptWithCharacters && (
                  <div className="mt-8 bg-gradient-to-br from-purple-900/30 via-pink-900/30 to-blue-900/30 border-2 border-purple-500/50 rounded-xl p-8">
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold text-white mb-2">
                        🎬 더 많은 영상 제작 도구가 필요하신가요?
                      </h3>
                      <p className="text-lg text-neutral-200">
                        콘텐츠 자동화를 원하신다면 아래 도구들을 확인해보세요!
                      </p>
                      <p className="text-md text-purple-300 mt-2 font-semibold">
                        위에서 만든 대본을 토대로 AI 영상 1분컷 가능
                      </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      <a
                        href="https://youtube-image.money-hotissue.com"
                        className="bg-gradient-to-br from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 text-center shadow-lg"
                      >
                        <div className="text-3xl mb-2">📸</div>
                        <div className="text-lg">숏폼/롱폼 이미지 생성</div>
                      </a>
                      <a
                        href="https://aimusic.money-hotissue.com/"
                        className="bg-gradient-to-br from-pink-600 to-pink-700 hover:from-pink-500 hover:to-pink-600 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 text-center shadow-lg"
                      >
                        <div className="text-3xl mb-2">🎵</div>
                        <div className="text-lg">AI 음악 가사 1초 완성</div>
                      </a>
                      <a
                        href="https://aimusic.money-hotissue.com/"
                        className="bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 text-center shadow-lg"
                      >
                        <div className="text-3xl mb-2">🎨</div>
                        <div className="text-lg">AI 음악 썸네일 제작</div>
                      </a>
                    </div>
                  </div>
                )}

                {newPlan.scriptOutline && (
                  <ResultCard
                    title="6. 생성된 기획안 개요"
                    contentToCopy={formatOutlineToText(newPlan.scriptOutline)}
                    downloadFileName="plan-outline"
                  >
                    <div className="space-y-6">
                      {newPlan.scriptOutline.map(
                        (stage: OutlineStage, index: number) => (
                          <div
                            key={index}
                            className="bg-zinc-900 p-4 rounded-lg border border-[#2A2A2A]"
                          >
                            <h3 className="font-bold text-red-500 mb-2">
                              {stage.stage}
                            </h3>

                            <p className="text-sm text-neutral-200 mb-3">
                              {stage.purpose}
                            </p>
                            <div className="prose prose-invert max-w-none prose-p:text-white prose-strong:text-red-500 prose-strong:underline prose-strong:decoration-red-500/70 prose-strong:underline-offset-4">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {stage.details}
                              </ReactMarkdown>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </ResultCard>
                )}
              </>
            ) : (
              <div className="bg-[#1A1A1A] border-2 border-dashed border-[#2A2A2A] rounded-xl p-8 text-center text-neutral-400">
                <p className="text-lg font-semibold">
                  생성된 기획안이 여기에 표시됩니다
                </p>
                <p className="mt-2 text-sm">
                  {analysisResult
                    ? "새로운 영상의 키워드를 입력하고 기획안을 생성해주세요."
                    : "먼저 영상을 분석하여 기획안 생성 기능을 활성화하세요."}
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
      <Footer />

      {/* 플로팅 초기화 버튼 */}
      {(analysisResult || newPlan || transcript || youtubeUrl) && (
        <button
          onClick={handleReset}
          className="fixed bottom-24 right-6 bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 flex items-center gap-2 font-semibold z-50 border-2 border-red-400"
          title="모든 내용 초기화"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
              clipRule="evenodd"
            />
          </svg>
          <span>초기화</span>
        </button>
      )}

      {/* 사이드바 광고 - 애드블럭 감지 시 숨김 */}
      {!adBlockDetected && <SidebarAds />}

      {/* 플로팅 앵커 광고 - 애드블럭 감지 시 숨김 */}
      {!adBlockDetected && <FloatingAnchorAd />}
    </div>
  );
};

export default App;
