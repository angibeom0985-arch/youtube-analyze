

import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, NewPlan } from '../types';

const createAI = (apiKey: string) => {
  return new GoogleGenAI({ apiKey });
};

const structuredContentSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "The title of the section." },
      description: { type: Type.STRING, description: "The detailed content of the section. To ensure high readability, create clear separation between points using double line breaks instead of Markdown lists. Use `**bold text**` to emphasize important keywords or subheadings." }
    },
    required: ["title", "description"]
  }
};

const baseAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    keywords: {
      type: Type.ARRAY,
      description: "A list of 5-10 core keywords from the video, in Korean.",
      items: { type: Type.STRING }
    },
    intent: {
      ...structuredContentSchema,
      description: "영상의 기획 의도를 '목표 시청자', '핵심 메시지', '기대 효과' 등의 섹션으로 나누어 구조적으로 분석합니다. 각 설명은 가독성을 높이기 위해, 글머리 기호(-) 대신 문단 사이에 두 번의 줄바꿈을 사용해 공백을 확보하고, 중요한 키워드는 **굵은 글씨**로 강조해주세요.",
    },
    viewPrediction: {
      ...structuredContentSchema,
      description: "이 영상의 조회수가 높은 이유를 '감정적 연결', '사회적 공감대', '콘텐츠 구조' 등의 섹션으로 나누어 구조적으로 분석합니다. 여러 항목을 나열할 때는 반드시 글머리 기호(-) 대신 문단 사이에 두 번의 줄바꿈을 사용하여 가독성을 극대화하고, 중요한 소제목은 **굵은 글씨**로 강조해주세요.",
    },
  },
  required: ["keywords", "intent", "viewPrediction"],
};

const storyChannelAnalysisSchema = {
    ...baseAnalysisSchema.properties,
    scriptStructure: {
      type: Type.ARRAY,
      description: "A step-by-step breakdown of the script's structure. Each step should have a title, purpose, and example quotes from the transcript, in Korean.",
      items: {
        type: Type.OBJECT,
        properties: {
          stage: { type: Type.STRING, description: "The stage of the script (e.g., '1단계: 시선 끌기 및 문제/기회 제기')." },
          purpose: { type: Type.STRING, description: "The goal of this stage (e.g., '목적 (무엇을 판단/생산할지)')." },
          quotes: {
            type: Type.ARRAY,
            description: "스크립트에서 이 단계를 가장 잘 보여주는 직접적인 인용구입니다. 각 인용구에는 대사가 나오는 시간(타임스탬프, 예: '01:23')을 반드시 포함해야 합니다. 스크립트에 타임스탬프가 없다면, 영상의 전체 길이를 고려하여 예상 시간을 MM:SS 형식으로 기재해주세요.",
            items: {
                type: Type.OBJECT,
                properties: {
                    timestamp: { type: Type.STRING, description: "인용구의 타임스탬프 (MM:SS 형식)." },
                    text: { type: Type.STRING, description: "인용구의 내용." }
                },
                required: ["timestamp", "text"]
            }
          }
        },
        required: ["stage", "purpose", "quotes"],
      }
    }
};

const newPlanBaseSchema = {
  newIntent: {
    ...structuredContentSchema,
    description: "새로운 영상의 기획 의도를 '목표', '핵심 컨셉', '시청자에게 줄 가치' 등의 섹션으로 나누어 구조적으로 작성합니다. 각 설명은 가독성을 높이기 위해, 글머리 기호(-) 대신 문단 사이에 두 번의 줄바꿈을 사용해 공백을 확보하고, 중요한 키워드는 **굵은 글씨**로 강조해주세요."
  },
};

const storyChannelNewPlanSchema = {
  type: Type.OBJECT,
  properties: {
    ...newPlanBaseSchema,
    characters: {
      type: Type.ARRAY,
      description: "대본에 등장하는 모든 인물 또는 화자의 목록입니다. (예: '나레이터', '출연자 A')",
      items: { type: Type.STRING }
    },
    scriptWithCharacters: {
      type: Type.ARRAY,
      description: "새로운 영상에 대한 상세한, 한 줄 한 줄의 대본입니다. 각 객체는 화자, 대사, 그리고 해당 장면에 대한 이미지 생성 프롬프트를 포함해야 합니다.",
      items: {
        type: Type.OBJECT,
        properties: {
          character: { type: Type.STRING, description: "이 대사를 말하는 인물 또는 화자입니다." },
          line: { type: Type.STRING, description: "이 대사의 대화 또는 행동입니다. 마크다운 사용이 가능합니다." },
          imagePrompt: { type: Type.STRING, description: "이 대사와 장면에 어울리는 이미지를 생성하기 위한 상세한 프롬프트입니다. DALL-E 또는 Midjourney와 같은 이미지 생성 AI에 사용할 수 있도록 영어로 작성해주세요." }
        },
        required: ["character", "line", "imagePrompt"]
      }
    }
  },
  required: ["newIntent", "characters", "scriptWithCharacters"],
};

const structuredOutlinePlanSchema = {
  type: Type.OBJECT,
  properties: {
    ...newPlanBaseSchema,
    scriptOutline: {
      type: Type.ARRAY,
      description: "A step-by-step breakdown of the new video's outline. Each step should have a title, purpose, and detailed content, in Korean. Use markdown for the details.",
      items: {
        type: Type.OBJECT,
        properties: {
          stage: { type: Type.STRING, description: "The stage of the outline (e.g., '1단계: 도입부')." },
          purpose: { type: Type.STRING, description: "The goal of this stage." },
          details: { type: Type.STRING, description: "Detailed content for this stage. To ensure high readability, create clear separation between points using double line breaks instead of Markdown lists. Use `**bold text**` to emphasize important keywords or subheadings." }
        },
        required: ["stage", "purpose", "details"],
      }
    }
  },
  required: ["newIntent", "scriptOutline"]
};

const ideaSchema = {
  type: Type.OBJECT,
  properties: {
    ideas: {
      type: Type.ARRAY,
      description: "A list of 5 new video topic ideas or product recommendations, in Korean.",
      items: { type: Type.STRING }
    }
  },
  required: ["ideas"],
};

export const analyzeTranscript = async (transcript: string, category: string, apiKey: string, videoTitle?: string): Promise<AnalysisResult> => {
  try {
    const ai = createAI(apiKey);
    
    const fullAnalysisSchema = {
      type: Type.OBJECT,
      properties: storyChannelAnalysisSchema,
      required: [...baseAnalysisSchema.required, "scriptStructure"]
    };
    
    const analysisContext = videoTitle
      ? `다음은 제목이 "${videoTitle}"인 성공적인 '${category}' 카테고리 YouTube 동영상입니다. 영상의 제목과 스크립트를 종합적으로 고려하여 심층적으로 분석하고, 각 항목을 지정된 구조에 맞춰 JSON 형식으로 제공해주세요:`
      : `다음은 성공적인 '${category}' 카테고리 YouTube 동영상의 스크립트입니다. 이 카테고리의 특성을 고려하여 심층적으로 분석하고, 각 항목을 지정된 구조에 맞춰 JSON 형식으로 제공해주세요:`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `${analysisContext}\n\n스크립트:\n---\n${transcript}\n---`,
      config: {
        systemInstruction: `당신은 '${category}' 전문 YouTube 콘텐츠 전략가입니다. 당신의 임무는 비디오 스크립트를 분석하고 벤치마킹을 위해 핵심 요소에 대한 구조화된 분석을 제공하는 것입니다. 모든 텍스트 설명은 가독성을 위해 **굵은 글씨**를 활용하고, 글머리 기호(-) 대신 문단 사이에 두 번의 줄바꿈을 사용하여 명확하게 구분해주세요.`,
        responseMimeType: "application/json",
        responseSchema: fullAnalysisSchema,
      },
    });
    
    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as AnalysisResult;
  } catch (error) {
    console.error("Error analyzing transcript:", error);
    throw new Error("Failed to analyze transcript. Please check the console for details.");
  }
};

export const generateIdeas = async (analysis: AnalysisResult, category: string, apiKey: string): Promise<string[]> => {
  try {
    const ai = createAI(apiKey);
    
    const analysisString = JSON.stringify({
      keywords: analysis.keywords,
      intent: analysis.intent,
    }, null, 2);

    const isShoppingReview = category === '쇼핑 리뷰';
    const prompt = isShoppingReview
      ? `다음은 성공적인 '쇼핑 리뷰' 영상 분석 결과입니다. 이 분석을 바탕으로, 한국의 이커머스 사이트 '쿠팡(Coupang)'에서 현재 판매량이 가장 많거나 후기가 많은 제품 중, 영상 리뷰 콘텐츠로 만들기에 적합한 제품 5가지를 추천해주세요. 아이디어는 한국어로 작성하고 JSON 형식의 배열로 제공해주세요.\n\n분석 내용:\n${analysisString}`
      : `다음은 성공적인 유튜브 영상 분석 결과입니다. 이 분석을 바탕으로, 비슷한 성공 가능성이 있는 새롭고 창의적인 영상 주제 아이디어 5가지를 제안해주세요. 아이디어는 한국어로 작성하고 JSON 형식의 배열로 제공해주세요.\n\n분석 내용:\n${analysisString}`;
    
    const systemInstruction = isShoppingReview
      ? "당신은 최신 트렌드에 밝은 쇼핑 전문가입니다. 성공적인 리뷰 영상을 분석하여, 다음 히트할 만한 리뷰 제품을 추천하는 역할을 합니다."
      : "당신은 트렌드를 잘 읽는 유튜브 콘텐츠 기획자입니다. 성공 사례를 분석하여 새로운 히트 아이디어를 제안하는 역할을 합니다.";

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: ideaSchema,
      },
    });
    
    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);
    return result.ideas as string[];
  } catch (error) {
    console.error("Error generating ideas:", error);
    throw new Error("Failed to generate ideas. Please check the console for details.");
  }
};

export const generateNewPlan = async (analysis: AnalysisResult, newKeyword: string, length: string, category: string, apiKey: string): Promise<NewPlan> => {
  try {
    const ai = createAI(apiKey);
    
    const analysisString = JSON.stringify({
      keywords: analysis.keywords,
      intent: analysis.intent,
      scriptStructure: analysis.scriptStructure,
    }, null, 2);

    const isStoryChannel = category === '썰 채널';
    const schema = isStoryChannel ? storyChannelNewPlanSchema : structuredOutlinePlanSchema;
    
    let contents;
    if (isStoryChannel) {
      contents = `이전 성공적인 동영상의 분석을 바탕으로, 키워드 "${newKeyword}"에 대한 새로운 동영상 기획안을 만들어 주세요. 목표 영상 길이는 약 ${length}입니다. 길이에 맞는 풍부한 내용으로 대본을 작성해주세요. 각 대사마다 해당 장면을 시각적으로 묘사하는 상세한 이미지 생성 프롬프트('imagePrompt')를 반드시 포함해야 합니다.\n\n성공적인 동영상 분석 내용:\n\n${analysisString}\n\n이제 위 분석된 성공 구조를 따르되 새로운 키워드에 초점을 맞춘 새로운 기획안을 생성해주세요. 모든 결과 항목을 지정된 구조에 맞춰 JSON 형식으로 제공해주세요.`;
    } else if (category === '쇼핑 리뷰') {
      contents = `성공적인 리뷰 영상의 분석을 바탕으로, "${newKeyword}" 제품에 대한 리뷰 영상 기획안을 만들어 주세요. 목표 영상 길이는 약 ${length}입니다. 영상은 '오프닝', '제품 소개', '주요 특징 시연', '장단점 분석', '총평 및 추천'으로 구성되어야 합니다. 이 구조에 맞춰 각 단계별 제목, 목적, 상세 내용이 포함된 구조적인 개요를 작성해주세요. 모든 결과 항목을 지정된 구조에 맞춰 JSON 형식으로 제공해주세요.\n\n참고용 분석 내용:\n${analysisString}`;
    } else {
      contents = `성공적인 정보성 영상의 분석을 바탕으로, "${newKeyword}" 주제에 대한 영상 기획안을 만들어 주세요. 목표 영상 길이는 약 ${length}입니다. 영상은 '도입(문제 제기)', '본론(핵심 정보 전달)', '결론(요약 및 제언)'의 구조를 가져야 합니다. 이 구조에 맞춰 각 단계별 제목, 목적, 상세 내용이 포함된 구조적인 개요를 작성해주세요. 모든 결과 항목을 지정된 구조에 맞춰 JSON 형식으로 제공해주세요.\n\n참고용 분석 내용:\n${analysisString}`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        systemInstruction: "당신은 창의적인 YouTube 스크립트 작가 겸 기획자입니다. 성공 공식을 바탕으로 새로운 주제에 대한 기획안을 생성합니다. 요청된 카테고리와 영상 길이에 맞춰 결과물의 형식과 분량을 조절해주세요. 모든 텍스트 설명은 가독성을 위해 **굵은 글씨**를 활용하고, 글머리 기호(-) 대신 문단 사이에 두 번의 줄바꿈을 사용하여 명확하게 구분해주세요.",
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });
    
    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as NewPlan;
  } catch (error) {
    console.error("Error generating new plan:", error);
    throw new Error("Failed to generate new plan. Please check the console for details.");
  }
};