# GrowthCamp AX Tools

GrowthCamp의 다양한 도구들을 한 곳에서 관리하고 접근할 수 있는 웹 애플리케이션입니다.

## 🚀 주요 기능

- **도구 관리**: 관리자가 도구를 추가/수정/삭제
- **드래그 앤 드롭**: 관리자가 도구 순서를 자유롭게 조정
- **반응형 디자인**: 데스크톱, 태블릿, 모바일 최적화
- **실시간 동기화**: 순서 변경이 모든 사용자에게 즉시 반영

## 🛠️ 기술 스택

- **Frontend**: React 19 + TypeScript + Vite
- **UI Library**: React Bootstrap
- **Drag & Drop**: @dnd-kit/core, @dnd-kit/sortable
- **Backend**: Supabase (PostgreSQL + Auth)
- **Deployment**: Google Cloud Run + GitHub Actions

## 📦 설치 및 실행

### 로컬 개발

```bash
# 의존성 설치
cd client
npm install

# 개발 서버 실행
npm run dev
```

### 환경 변수 설정

`.env` 파일을 생성하고 다음 변수들을 설정하세요:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🚀 배포

### Google Cloud 설정

1. **Google Cloud 프로젝트 생성**
2. **Cloud Run API 활성화**
3. **서비스 계정 생성 및 키 다운로드**
4. **Container Registry API 활성화**

### GitHub Secrets 설정

GitHub 저장소의 Settings > Secrets and variables > Actions에서 다음 시크릿을 설정하세요:

- `GCP_PROJECT_ID`: Google Cloud 프로젝트 ID
- `GCP_SA_KEY`: 서비스 계정 키 (JSON)
- `VITE_SUPABASE_URL`: Supabase URL
- `VITE_SUPABASE_ANON_KEY`: Supabase Anonymous Key

### 자동 배포

main 브랜치에 코드를 푸시하면 자동으로 Google Cloud Run에 배포됩니다.

### 수동 배포

```bash
# Docker 이미지 빌드
docker build -t gcr.io/PROJECT_ID/ax-tools-app .

# Container Registry에 푸시
docker push gcr.io/PROJECT_ID/ax-tools-app

# Cloud Run에 배포
gcloud run deploy ax-tools-app \
  --image gcr.io/PROJECT_ID/ax-tools-app \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080
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

- **색상**: #CBE9FF (배경), 글래스모피즘 효과
- **폰트**: Inter
- **반응형**: 576px, 768px, 996px 브레이크포인트
- **애니메이션**: 부드러운 호버 효과 및 드래그 피드백

## 📱 반응형 지원

- **데스크톱 (997px+)**: 3열 그리드
- **태블릿 (768px-996px)**: 2열 그리드
- **모바일 (576px-767px)**: 1열 그리드
- **소형 모바일 (<576px)**: 최적화된 버튼 배치

## 🔐 보안

- **인증**: Supabase Auth
- **권한**: 관리자만 도구 관리 기능 접근
- **RLS**: Row Level Security 적용
- **HTTPS**: 모든 통신 암호화

## 📈 성능 최적화

- **컨테이너화**: Docker를 통한 일관된 배포
- **Nginx**: 정적 파일 서빙 최적화
- **Gzip 압축**: 전송 크기 최소화
- **캐싱**: 브라우저 캐시 활용
- **Auto-scaling**: Cloud Run 자동 스케일링

## 🐳 Docker

### 로컬에서 Docker 실행

```bash
# 이미지 빌드
docker build -t ax-tools-app .

# 컨테이너 실행
docker run -p 8080:8080 ax-tools-app
```

### Docker 이미지 구조

- **Multi-stage build**: 빌드와 런타임 분리
- **Nginx**: 정적 파일 서빙
- **최적화된 크기**: Alpine Linux 기반

## 🤝 기여

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

© AX Leading by GrowthCamp. All rights reserved.

## 📞 지원

문제가 발생하거나 기능 요청이 있으시면 GitHub Issues를 통해 연락해주세요. 