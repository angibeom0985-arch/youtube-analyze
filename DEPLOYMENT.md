# 배포 가이드

YouTube 분석 AI 웹사이트를 GitHub와 Vercel을 통해 배포하는 방법입니다.

## 📋 준비사항

- GitHub 계정
- Vercel 계정
- Git 설치 (로컬)

## 🚀 1단계: GitHub 저장소 생성 및 푸시

### 1. GitHub에 새 저장소 생성

1. https://github.com 접속 후 로그인
2. 우측 상단의 `+` 버튼 클릭 → `New repository` 선택
3. 저장소 설정:
   - **Repository name**: `youtube-analyze` (원하는 이름)
   - **Description**: "AI-powered YouTube video analysis tool"
   - **Public** 또는 **Private** 선택
   - **Initialize this repository** 옵션들은 체크하지 않음
4. `Create repository` 클릭

### 2. 로컬 저장소를 GitHub에 연결

PowerShell 또는 터미널에서 다음 명령어를 실행하세요:

```powershell
# 현재 프로젝트 폴더로 이동
cd "c:\Users\삼성\OneDrive\Desktop\Website\Youtuebe-analyze"

# GitHub 저장소를 원격 저장소로 추가 (본인의 GitHub 사용자명으로 변경)
git remote add origin https://github.com/YOUR_USERNAME/youtube-analyze.git

# main 브랜치로 이름 변경 (선택사항)
git branch -M main

# GitHub에 푸시
git push -u origin main
```

**참고**: `YOUR_USERNAME`을 본인의 GitHub 사용자명으로 변경하세요.

### 3. GitHub Personal Access Token 생성 (HTTPS 사용 시)

만약 push할 때 비밀번호를 요구하면:

1. GitHub 웹사이트 → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. `Generate new token (classic)` 클릭
3. Note: "Vercel Deploy"
4. Expiration: 원하는 만료 기간
5. Scopes: `repo` 전체 선택
6. `Generate token` 클릭
7. 생성된 토큰을 복사하여 비밀번호 대신 사용

---

## 🌐 2단계: Vercel에 배포

### 1. Vercel 계정 생성 및 로그인

1. https://vercel.com 접속
2. GitHub 계정으로 로그인 (Sign Up with GitHub)
3. Vercel이 GitHub 저장소에 접근할 수 있도록 권한 부여

### 2. 프로젝트 Import

1. Vercel 대시보드에서 `Add New...` → `Project` 클릭
2. GitHub 저장소 목록에서 `youtube-analyze` 찾기
3. `Import` 클릭

### 3. 프로젝트 설정

**Build & Development Settings:**
- Framework Preset: `Vite`
- Build Command: `npm run build` (자동 감지됨)
- Output Directory: `dist` (자동 감지됨)
- Install Command: `npm install` (자동 감지됨)

**Environment Variables:** (선택사항)
- 환경 변수가 필요한 경우 여기서 추가
- 이 프로젝트는 클라이언트 사이드에서 API 키를 입력받으므로 불필요

`Deploy` 버튼 클릭!

### 4. 배포 완료

- 몇 분 후 배포가 완료됩니다
- Vercel이 자동으로 도메인을 할당합니다 (예: `youtube-analyze.vercel.app`)
- `Visit` 버튼을 클릭하여 사이트를 확인하세요

---

## 🔗 3단계: 커스텀 도메인 연결

### 1. Vercel에서 도메인 추가

1. Vercel 프로젝트 대시보드 → `Settings` → `Domains`
2. `Add` 버튼 클릭
3. 커스텀 도메인 입력: `youtube-analyze.money-hotissue.com`
4. `Add` 클릭

### 2. DNS 설정

Vercel이 제공하는 DNS 설정 정보를 확인합니다:

**A Record (루트 도메인용):**
- Type: `A`
- Name: `youtube-analyze` 또는 `@`
- Value: Vercel이 제공하는 IP 주소

**CNAME Record (서브도메인용):**
- Type: `CNAME`
- Name: `youtube-analyze`
- Value: `cname.vercel-dns.com`

### 3. 도메인 등록업체 설정

1. 도메인을 구매한 사이트(예: GoDaddy, Namecheap, Cloudflare)에 로그인
2. DNS 관리 페이지로 이동
3. 위에서 확인한 DNS 레코드 추가
4. 변경사항 저장

### 4. SSL 인증서 자동 발급

- Vercel은 Let's Encrypt를 통해 자동으로 SSL 인증서를 발급합니다
- DNS 전파 후 몇 분~몇 시간 내에 HTTPS가 활성화됩니다

---

## 🔄 4단계: 자동 배포 설정

### Git Push로 자동 배포

Vercel은 GitHub와 연동되어 있어, 코드를 push하면 자동으로 배포됩니다:

```powershell
# 코드 수정 후
git add .
git commit -m "업데이트 내용"
git push
```

푸시 후 Vercel이 자동으로:
1. 새 코드를 감지
2. 빌드 시작
3. 프로덕션 배포
4. 이전 버전 백업

### 배포 상태 확인

- Vercel 대시보드에서 실시간 배포 로그 확인 가능
- 이메일 또는 Slack으로 배포 알림 받기 가능

---

## ✅ 완료 체크리스트

- [ ] GitHub 저장소 생성 완료
- [ ] 코드 푸시 완료
- [ ] Vercel 프로젝트 생성 완료
- [ ] 첫 배포 성공
- [ ] 커스텀 도메인 연결 완료
- [ ] HTTPS 활성화 확인
- [ ] 자동 배포 테스트 완료

---

## 🛠️ 문제 해결

### 빌드 실패 시

1. Vercel 대시보드에서 빌드 로그 확인
2. 로컬에서 `npm run build` 실행하여 오류 확인
3. `package.json`의 의존성 확인

### 도메인 연결 안 됨

1. DNS 전파 확인 (최대 48시간 소요)
2. DNS 레코드 설정 재확인
3. Vercel 도메인 상태 확인

### 404 에러 발생

- `vercel.json` 파일이 올바르게 설정되어 있는지 확인
- React Router 설정 확인

---

## 📞 추가 도움말

- Vercel 공식 문서: https://vercel.com/docs
- Vite 배포 가이드: https://vitejs.dev/guide/static-deploy.html
- GitHub 도움말: https://docs.github.com

---

**축하합니다! 🎉**

이제 여러분의 YouTube 분석 AI가 `youtube-analyze.money-hotissue.com`에서 운영됩니다!
