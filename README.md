# GrowthCamp AX Tools

GrowthCamp의 다양한 도구들을 한 곳에서 관리하고 접근할 수 있는 웹 애플리케이션입니다.

## 🚀 주요 기능

- **🔐 관리자 인증**: Supabase Auth를 통한 안전한 관리자 로그인
- **🛠️ 도구 관리**: 관리자가 도구를 추가/수정/삭제
- **🎯 드래그 앤 드롭**: 관리자가 도구 순서를 자유롭게 조정
- **📱 반응형 디자인**: 데스크톱, 태블릿, 모바일 최적화
- **⚡ 실시간 동기화**: 순서 변경이 모든 사용자에게 즉시 반영
- **🎨 모던 UI/UX**: 글래스모피즘 효과와 부드러운 애니메이션
- **🔄 자동 배포**: GitHub Actions를 통한 CI/CD 파이프라인

## 🛠️ 기술 스택

### Frontend
- **React 19**: 최신 React 기능 활용
- **TypeScript**: 타입 안전성 보장
- **Vite**: 빠른 개발 및 빌드 도구
- **React Bootstrap**: 반응형 UI 컴포넌트
- **@dnd-kit**: 고성능 드래그 앤 드롭

### Backend & Database
- **Supabase**: PostgreSQL + Auth + Real-time
- **Row Level Security (RLS)**: 데이터 보안
- **JWT 토큰**: 안전한 인증

### DevOps & Deployment
- **Docker**: 컨테이너화
- **Nginx**: 정적 파일 서빙
- **Google Cloud Run**: 서버리스 배포
- **GitHub Actions**: 자동화된 CI/CD
- **Artifact Registry**: Docker 이미지 저장소

## 📦 설치 및 실행

### 로컬 개발

```bash
# 저장소 클론
git clone https://github.com/bartshim75/tools.git
cd tools

# 클라이언트 디렉토리로 이동
cd client

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

### 환경 변수 설정

`.env.local` 파일을 생성하고 다음 변수들을 설정하세요:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**⚠️ 중요**: `.env.local` 파일은 Git에서 추적되지 않습니다.

## 🚀 배포

### 자동 배포 (권장)

main 브랜치에 코드를 푸시하면 GitHub Actions가 자동으로 Google Cloud Run에 배포합니다.

### GitHub Secrets 설정

GitHub 저장소의 **Settings > Secrets and variables > Actions**에서 다음 시크릿을 설정하세요:

| Secret | 설명 | 예시 |
|--------|------|------|
| `GCP_PROJECT_ID` | Google Cloud 프로젝트 ID | `r3-poob` |
| `GCP_SA_KEY` | 서비스 계정 키 (JSON) | `{"type": "service_account", ...}` |
| `VITE_SUPABASE_URL` | Supabase URL | `https://xxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase Anonymous Key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

### 수동 배포

```bash
# Docker 이미지 빌드 (환경 변수 포함)
docker build \
  --build-arg VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
  --build-arg VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY \
  -t ax-tools-app .

# 컨테이너 실행
docker run -p 8080:8080 ax-tools-app
```

## 📊 데이터베이스 설정

### Supabase SQL 실행

```sql
-- tools 테이블에 order_index 컬럼 추가
ALTER TABLE tools ADD COLUMN order_index INTEGER DEFAULT 0;

-- 기존 데이터에 순서 인덱스 부여
WITH ordered_tools AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS rn
  FROM tools
)
UPDATE tools
SET order_index = ordered_tools.rn
FROM ordered_tools
WHERE tools.id = ordered_tools.id;

-- 인덱스 생성
CREATE INDEX idx_tools_order_index ON tools(order_index);

-- RLS 정책 설정
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON tools
FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to manage tools" ON tools
FOR ALL USING (auth.role() = 'authenticated');
```

## 🎨 디자인 시스템

### 색상 팔레트
- **Primary**: #CBE9FF (배경)
- **Secondary**: #FFFFFF (카드 배경)
- **Accent**: #007BFF (버튼)
- **Text**: #333333 (기본 텍스트)

### 타이포그래피
- **Font Family**: Inter
- **Font Weights**: 400, 500, 600, 700

### 반응형 브레이크포인트
- **Desktop (1057px+)**: 3열 그리드
- **Tablet (768px-1056px)**: 2열 그리드 (중앙 정렬)
- **Mobile (576px-767px)**: 1열 그리드
- **Small Mobile (<576px)**: 최적화된 버튼 배치

### 애니메이션
- **Duration**: 300ms
- **Easing**: ease-in-out
- **Hover Effects**: 부드러운 색상 전환
- **Drag Feedback**: 시각적 피드백

## 🔐 보안

### 인증 및 권한
- **Supabase Auth**: JWT 기반 인증
- **관리자 전용**: 도구 관리 기능은 인증된 사용자만 접근
- **Row Level Security (RLS)**: 데이터베이스 레벨 보안

### 환경 변수 관리
- **GitHub Secrets**: 민감한 정보는 GitHub Secrets에 저장
- **빌드 시점 전달**: Docker 빌드 시 환경 변수 주입
- **런타임 보안**: 클라이언트에 민감한 정보 노출 방지

### 데이터 보호
- **HTTPS**: 모든 통신 암호화
- **XSS 방지**: 입력값 검증 및 sanitization
- **CSRF 보호**: Supabase Auth 내장 보안

## 📈 성능 최적화

### 빌드 최적화
- **Code Splitting**: Vite의 자동 코드 분할
- **Tree Shaking**: 사용하지 않는 코드 제거
- **Image Optimization**: SVG 최적화

### 런타임 최적화
- **React.memo**: 불필요한 리렌더링 방지
- **useCallback/useMemo**: 메모이제이션
- **Lazy Loading**: 컴포넌트 지연 로딩

### 배포 최적화
- **Multi-stage Docker**: 빌드와 런타임 분리
- **Nginx**: 정적 파일 서빙 최적화
- **Gzip 압축**: 전송 크기 최소화
- **Browser Caching**: 캐시 헤더 설정

## 🐳 Docker

### 로컬에서 Docker 실행

```bash
# 이미지 빌드 (환경 변수 포함)
docker build \
  --build-arg VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
  --build-arg VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY \
  -t ax-tools-app .

# 컨테이너 실행
docker run -p 8080:8080 ax-tools-app
```

### Docker 이미지 구조

```
ax-tools-app/
├── Build Stage (Node.js 20 Alpine)
│   ├── Dependencies Installation
│   ├── Source Code Copy
│   └── Vite Build (with env vars)
└── Production Stage (Nginx Alpine)
    ├── Built Files Copy
    ├── Nginx Configuration
    └── Static File Serving
```

## 🧪 테스트

### 기능 테스트
- [ ] 관리자 로그인/로그아웃
- [ ] 도구 추가/수정/삭제
- [ ] 드래그 앤 드롭 순서 변경
- [ ] 반응형 디자인 확인
- [ ] 에러 처리 및 알림

### 성능 테스트
- [ ] 페이지 로딩 속도
- [ ] 이미지 로딩 최적화
- [ ] 데이터베이스 연결 성능

## 🤝 기여

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

© Better AX begins with GrowthCamp. All rights reserved.

## 📞 지원

문제가 발생하거나 기능 요청이 있으시면 GitHub Issues를 통해 연락해주세요.

## 🔄 최근 업데이트

### v1.0.0 (2024-08-02)
- ✅ React 19 업그레이드
- ✅ TypeScript 타입 안전성 강화
- ✅ 성능 최적화 (메모이제이션, 코드 분할)
- ✅ 보안 강화 (환경 변수 관리, XSS 방지)
- ✅ UI/UX 개선 (글래스모피즘, 애니메이션)
- ✅ 반응형 디자인 개선 (CSS Grid, 중앙 정렬)
- ✅ 자동 배포 파이프라인 구축
- ✅ Docker 최적화 (Multi-stage build) 