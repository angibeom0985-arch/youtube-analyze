const { createCanvas, registerFont } = require("canvas");
const fs = require("fs");
const path = require("path");

// 한글 폰트 등록
try {
  registerFont("C:/Windows/Fonts/malgunbd.ttf", {
    family: "Malgun Gothic Bold",
  });
  registerFont("C:/Windows/Fonts/malgun.ttf", { family: "Malgun Gothic" });
} catch (e) {
  console.warn("폰트 로드 실패:", e.message);
}

function createOgImage(outputPath, title, subtitle, colors, width, height) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // 그래디언트 배경
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, colors.start);
  gradient.addColorStop(1, colors.end);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // 장식 요소 - 반투명 원들
  ctx.globalAlpha = 0.1;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(width * 0.2, height * 0.3, width * 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(width * 0.8, height * 0.7, width * 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1.0;

  // 중앙 컨테이너 박스 (약간 투명)
  ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
  ctx.roundRect(width * 0.1, height * 0.25, width * 0.8, height * 0.5, 20);
  ctx.fill();

  // 상단 강조 라인
  ctx.fillStyle = colors.accent;
  ctx.roundRect(width * 0.1, height * 0.25, width * 0.8, 8, [8, 8, 0, 0]);
  ctx.fill();

  // 타이틀 텍스트
  const scale = Math.min(width, height) / 630;
  ctx.font = `bold ${Math.floor(
    85 * scale
  )}px "Malgun Gothic Bold", "Malgun Gothic", sans-serif`;
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(title, width / 2, height * 0.4);

  // 서브타이틀 텍스트
  ctx.font = `${Math.floor(42 * scale)}px "Malgun Gothic", sans-serif`;
  ctx.fillStyle = "#e0e0e0";
  ctx.fillText(subtitle, width / 2, height * 0.54);

  // 도메인 박스
  const domain = "youtube-analyze.money-hotissue.com";
  ctx.font = `${Math.floor(28 * scale)}px "Malgun Gothic", sans-serif`;
  const domainWidth = ctx.measureText(domain).width;
  const boxPadding = 25 * scale;
  const boxX = (width - domainWidth) / 2 - boxPadding;
  const boxY = height * 0.68;
  const boxWidth = domainWidth + boxPadding * 2;
  const boxHeight = 55 * scale;

  // 도메인 배경 박스
  ctx.fillStyle = "#ffffff";
  ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 10);
  ctx.fill();

  // 도메인 텍스트
  ctx.fillStyle = colors.domainText;
  ctx.fillText(domain, width / 2, boxY + boxHeight / 2);

  // 이미지 저장
  const buffer = canvas.toBuffer("image/png");
  fs.writeFileSync(outputPath, buffer);
  console.log(`✅ OG 이미지 생성 완료: ${path.basename(outputPath)}`);
}

// public 디렉토리 경로
const publicDir = path.join(__dirname, "../public");

console.log("🎨 OG 이미지 생성 시작...\n");

// 메인 페이지 (다크 레드 그래디언트)
createOgImage(
  path.join(publicDir, "og-image.png"),
  "유튜브 영상 분석 AI",
  "AI가 분석한 떡상 영상의 공식! 1분 만에",
  {
    start: "#8B0000",
    end: "#DC143C",
    accent: "#FF6B6B",
    domainText: "#8B0000",
  },
  1200,
  630
);

createOgImage(
  path.join(publicDir, "og-image-square.png"),
  "유튜브 영상 분석 AI",
  "AI가 분석한 떡상 영상의 공식! 1분 만에",
  {
    start: "#8B0000",
    end: "#DC143C",
    accent: "#FF6B6B",
    domainText: "#8B0000",
  },
  1200,
  1200
);

// 가이드 페이지 (블루 그래디언트)
createOgImage(
  path.join(publicDir, "og-image-guide.png"),
  "사용법 가이드",
  "AI 영상 분석 도구 완벽 사용법",
  {
    start: "#003366",
    end: "#0066CC",
    accent: "#4A9EFF",
    domainText: "#003366",
  },
  1200,
  630
);

createOgImage(
  path.join(publicDir, "og-image-guide-square.png"),
  "사용법 가이드",
  "AI 영상 분석 도구 완벽 사용법",
  {
    start: "#003366",
    end: "#0066CC",
    accent: "#4A9EFF",
    domainText: "#003366",
  },
  1200,
  1200
);

// API 가이드 페이지 (퍼플 그래디언트)
createOgImage(
  path.join(publicDir, "og-image-api-guide.png"),
  "API 키 발급 가이드",
  "Google AI Studio API 키 발급 방법",
  {
    start: "#4B0082",
    end: "#8A2BE2",
    accent: "#BA55D3",
    domainText: "#4B0082",
  },
  1200,
  630
);

createOgImage(
  path.join(publicDir, "og-image-api-guide-square.png"),
  "API 키 발급 가이드",
  "Google AI Studio API 키 발급 방법",
  {
    start: "#4B0082",
    end: "#8A2BE2",
    accent: "#BA55D3",
    domainText: "#4B0082",
  },
  1200,
  1200
);

console.log("\n🎉 모든 OG 이미지 생성 완료! (직사각형 + 정사각형)");
