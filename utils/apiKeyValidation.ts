const INVISIBLE_CHARS_RE = /[\u200B-\u200D\uFEFF]/g;
const API_KEY_ALLOWED_RE = /^[A-Za-z0-9_-]+$/;

export type ApiKeyValidationResult = {
  ok: boolean;
  normalized: string;
  reason?: string;
};

export const normalizeApiKey = (raw: string): string => {
  return raw.replace(INVISIBLE_CHARS_RE, "").trim();
};

export const validateApiKeyFormat = (raw: string): ApiKeyValidationResult => {
  const normalized = normalizeApiKey(raw);
  if (!normalized) {
    return { ok: false, normalized, reason: "API 키가 비어 있습니다." };
  }
  if (!API_KEY_ALLOWED_RE.test(normalized)) {
    return {
      ok: false,
      normalized,
      reason:
        "API 키에 허용되지 않는 문자가 있습니다. 공백/한글/이모지/특수문자를 제거해 주세요.",
    };
  }
  return { ok: true, normalized };
};
