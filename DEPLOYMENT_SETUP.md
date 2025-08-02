# 🚀 AX Tools 배포 설정 가이드

## ✅ **배포 성공!**

현재 AX Tools는 Google Cloud Run에서 성공적으로 배포되어 운영 중입니다.

### **배포 정보**
- **서비스**: ax-tools-app
- **리전**: us-central1
- **플랫폼**: Google Cloud Run
- **컨테이너**: Docker + Nginx
- **CI/CD**: GitHub Actions
- **환경 변수**: 빌드 시점 주입으로 보안 강화

## 📋 GitHub Secrets 설정

GitHub 저장소의 **Settings > Secrets and variables > Actions**에서 다음 Secrets를 설정하세요:

### 1. GCP_PROJECT_ID
- **설명**: Google Cloud 프로젝트 ID
- **값**: `r3-poob` (현재 프로젝트 ID)
- **확인 방법**: Google Cloud Console 상단에서 프로젝트 ID 확인

### 2. GCP_SA_KEY
- **설명**: 서비스 계정 키 JSON (base64 인코딩 권장)
- **값**: 서비스 계정 키 JSON을 base64로 인코딩한 값
- **생성 방법**: 아래 "서비스 계정 설정" 참조

### 3. VITE_SUPABASE_URL
- **설명**: Supabase 프로젝트 URL
- **값**: `https://your-project.supabase.co`
- **보안**: 빌드 시점에 주입되어 런타임에 안전하게 사용

### 4. VITE_SUPABASE_ANON_KEY
- **설명**: Supabase Anonymous Key
- **값**: Supabase 프로젝트 설정에서 확인
- **보안**: 빌드 시점에 주입되어 런타임에 안전하게 사용

## 🔧 Google Cloud 서비스 계정 설정

### 1. 전용 서비스 계정 생성
```bash
# Google Cloud Console에서 실행 (프로젝트: r3-poob)
gcloud iam service-accounts create ax-tools-deploy \
  --display-name="AX Tools Deployment Service Account" \
  --description="Service account for AX Tools deployment"
```

### 2. 필요한 권한 부여
```bash
# Artifact Registry 권한
gcloud projects add-iam-policy-binding r3-poob \
  --member="serviceAccount:ax-tools-deploy@r3-poob.iam.gserviceaccount.com" \
  --role="roles/artifactregistry.admin"

# Cloud Run 권한
gcloud projects add-iam-policy-binding r3-poob \
  --member="serviceAccount:ax-tools-deploy@r3-poob.iam.gserviceaccount.com" \
  --role="roles/run.admin"

# Service Account User 권한
gcloud projects add-iam-policy-binding r3-poob \
  --member="serviceAccount:ax-tools-deploy@r3-poob.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

# Storage 권한 (필요한 경우)
gcloud projects add-iam-policy-binding r3-poob \
  --member="serviceAccount:ax-tools-deploy@r3-poob.iam.gserviceaccount.com" \
  --role="roles/storage.admin"
```

### 3. 서비스 계정 키 생성
```bash
# JSON 키 파일 생성
gcloud iam service-accounts keys create ax-tools-deploy-key.json \
  --iam-account=ax-tools-deploy@r3-poob.iam.gserviceaccount.com
```

### 4. GitHub Secrets에 키 추가 (base64 인코딩 권장)

#### 방법 1: base64 인코딩 사용 (권장)
```bash
# JSON 파일을 base64로 인코딩
base64 -i ax-tools-deploy-key.json

# 또는 macOS에서
base64 -i ax-tools-deploy-key.json | pbcopy
```

1. 위 명령어의 출력을 복사
2. GitHub Secrets의 `GCP_SA_KEY`에 붙여넣기

#### 방법 2: 직접 JSON 사용
1. `ax-tools-deploy-key.json` 파일을 열기
2. 파일의 전체 내용을 복사 (Ctrl+A, Ctrl+C)
3. GitHub Secrets의 `GCP_SA_KEY`에 붙여넣기 (Ctrl+V)

## 🚀 자동 배포

### 배포 트리거
- **main 브랜치에 푸시** 시 자동 배포
- **Pull Request** 시 배포 테스트

### 배포 과정
1. **코드 체크아웃**: GitHub Actions가 최신 코드를 가져옴
2. **Google Cloud 인증**: 서비스 계정으로 인증
3. **Docker 이미지 빌드**: React 앱을 Docker 컨테이너로 빌드 (환경 변수 포함)
4. **Artifact Registry 푸시**: 이미지를 Google Artifact Registry에 업로드
5. **Cloud Run 배포**: 새 이미지로 Cloud Run 서비스 업데이트

### 환경 변수 처리
- **빌드 시점 주입**: Docker 빌드 시 `--build-arg`로 환경 변수 전달
- **보안 강화**: 런타임에 민감한 정보 노출 방지
- **Vite 최적화**: 빌드 시점에 환경 변수가 정적으로 포함됨

### 배포 확인
- GitHub Actions 탭에서 배포 상태 확인
- Cloud Run 콘솔에서 서비스 상태 확인
- 배포된 URL로 접속하여 기능 테스트

## 🔍 문제 해결

### 환경 변수 오류가 발생하는 경우:

#### 1. GitHub Secrets 확인
- GitHub 저장소 → Settings → Secrets and variables → Actions
- 모든 필수 Secrets가 설정되어 있는지 확인
- 특히 `VITE_SUPABASE_URL`과 `VITE_SUPABASE_ANON_KEY` 확인

#### 2. Docker 빌드 로그 확인
GitHub Actions 로그에서 다음을 확인:
```bash
# 빌드 시점에 환경 변수가 전달되는지 확인
docker build \
  --build-arg VITE_SUPABASE_URL=${{ secrets.VITE_SUPABASE_URL }} \
  --build-arg VITE_SUPABASE_ANON_KEY=${{ secrets.VITE_SUPABASE_ANON_KEY }} \
  -t ...
```

#### 3. 런타임 오류 확인
브라우저 콘솔에서 다음 오류 확인:
- `VITE_SUPABASE_URL 환경 변수가 설정되지 않았습니다`
- `VITE_SUPABASE_ANON_KEY 환경 변수가 설정되지 않았습니다`

### 인증 오류가 발생하는 경우:

#### 1. 서비스 계정 키 형식 확인
`GCP_SA_KEY`는 다음과 같은 형식이어야 합니다:
```json
{
  "type": "service_account",
  "project_id": "r3-poob",
  "private_key_id": "key-id",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n",
  "client_email": "ax-tools-deploy@r3-poob.iam.gserviceaccount.com",
  "client_id": "client-id",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/ax-tools-deploy%40r3-poob.iam.gserviceaccount.com"
}
```

**⚠️ 중요**: 
- `client_email`이 `ax-tools-deploy@r3-poob.iam.gserviceaccount.com`이어야 함
- Compute Engine 기본 서비스 계정(`260346172085-compute@developer.gserviceaccount.com`)이 아님

#### 2. 서비스 계정 권한 확인
Google Cloud Console → IAM & Admin → IAM에서 서비스 계정에 다음 권한이 있는지 확인:
- `Artifact Registry Repository Administrator`
- `Cloud Run Admin`
- `Service Account User`

#### 3. API 활성화 확인
Google Cloud Console에서 다음 API가 활성화되어 있는지 확인:
- Artifact Registry API
- Cloud Run API
- Cloud Build API

### 로그 확인:
- GitHub Actions 로그에서 "Manual Google Cloud Authentication" 단계 확인
- JSON 형식 오류나 인증 실패 메시지 확인
- Docker 빌드 로그에서 환경 변수 전달 확인

## 📞 지원

문제가 지속되면 다음을 확인하세요:
1. Google Cloud Console에서 서비스 계정 상태
2. GitHub Actions 로그의 상세 오류 메시지
3. Google Cloud 프로젝트의 API 활성화 상태
4. 서비스 계정 키의 JSON 형식이 올바른지 확인
5. GitHub Secrets의 환경 변수 값이 올바른지 확인

## 🧪 Secrets 테스트

GitHub Actions에서 "Test GitHub Secrets" 워크플로우를 실행하여 설정을 확인할 수 있습니다:
1. GitHub 저장소 → Actions 탭
2. "Test GitHub Secrets" 워크플로우 선택
3. "Run workflow" 버튼 클릭
4. 결과 확인

## 🔧 JSON 형식 문제 해결

### JSON 형식 오류가 발생하는 경우:

1. **서비스 계정 키 재생성**
   ```bash
   # 기존 키 삭제 (선택사항)
   gcloud iam service-accounts keys delete KEY_ID \
     --iam-account=ax-tools-deploy@r3-poob.iam.gserviceaccount.com
   
   # 새 키 생성
   gcloud iam service-accounts keys create ax-tools-deploy-key.json \
     --iam-account=ax-tools-deploy@r3-poob.iam.gserviceaccount.com
   ```

2. **JSON 형식 검증**
   ```bash
   # 로컬에서 JSON 형식 확인
   python3 -c "import json; json.load(open('ax-tools-deploy-key.json'))"
   ```

3. **GitHub Secrets 재설정**
   - 기존 `GCP_SA_KEY` 삭제
   - 새로 생성된 키 파일의 전체 내용을 복사
   - GitHub Secrets에 다시 추가

### base64 인코딩 사용 (권장)

JSON 형식 문제를 해결하기 위해 base64 인코딩을 사용하세요:

```bash
# JSON 파일을 base64로 인코딩
base64 -i ax-tools-deploy-key.json

# 또는 macOS에서
base64 -i ax-tools-deploy-key.json | pbcopy
```

이렇게 인코딩된 값을 GitHub Secrets의 `GCP_SA_KEY`에 붙여넣으면 형식 문제를 피할 수 있습니다.

## 🎯 성공적인 배포 후 확인사항

### 1. 기능 테스트
- [ ] 관리자 로그인/로그아웃 기능
- [ ] 도구 추가/수정/삭제 기능
- [ ] 드래그 앤 드롭 순서 변경
- [ ] 반응형 디자인 (모바일/태블릿/데스크톱)
- [ ] SVG 로고 표시
- [ ] 환경 변수 오류 없음

### 2. 성능 확인
- [ ] 페이지 로딩 속도
- [ ] 이미지 로딩
- [ ] 데이터베이스 연결
- [ ] 드래그 앤 드롭 성능

### 3. 보안 확인
- [ ] HTTPS 연결
- [ ] 인증 토큰 관리
- [ ] API 키 보안
- [ ] 환경 변수 노출 없음

### 4. 환경 변수 확인
- [ ] Supabase 연결 성공
- [ ] 관리자 인증 작동
- [ ] 데이터베이스 CRUD 작업
- [ ] 실시간 동기화

## 📈 모니터링

### Google Cloud Console
- Cloud Run 서비스 모니터링
- 로그 확인
- 리소스 사용량 확인
- 환경 변수 설정 확인

### GitHub Actions
- 배포 히스토리 확인
- 빌드 로그 분석
- 성공/실패 통계
- 환경 변수 전달 확인

### 브라우저 개발자 도구
- 콘솔 오류 확인
- 네트워크 요청 확인
- 환경 변수 노출 확인

## 🔄 업데이트 프로세스

### 코드 변경 시
1. 로컬에서 코드 수정
2. Git 커밋 및 푸시
3. GitHub Actions 자동 배포
4. 배포 완료 확인
5. 기능 테스트

### 환경 변수 변경 시
1. GitHub Secrets 업데이트
2. 수동 배포 트리거 또는 코드 푸시
3. 새 환경 변수 적용 확인
4. 기능 테스트

### 보안 업데이트 시
1. 서비스 계정 키 재생성 (필요시)
2. GitHub Secrets 업데이트
3. 배포 테스트
4. 보안 검증

## 🛡️ 보안 모범 사례

### 환경 변수 관리
- **GitHub Secrets 사용**: 민감한 정보는 절대 코드에 하드코딩하지 않음
- **빌드 시점 주입**: 런타임에 환경 변수 노출 방지
- **정기적 갱신**: API 키와 서비스 계정 키 정기 갱신

### 접근 제어
- **최소 권한 원칙**: 서비스 계정에 필요한 최소 권한만 부여
- **정기 감사**: 권한 설정 정기 검토
- **모니터링**: 비정상적인 접근 패턴 감지

### 데이터 보호
- **HTTPS 강제**: 모든 통신 암호화
- **RLS 적용**: 데이터베이스 레벨 보안
- **입력 검증**: XSS 및 SQL 인젝션 방지

## 📊 성능 최적화

### 빌드 최적화
- **Multi-stage Docker**: 빌드와 런타임 분리
- **환경 변수 최적화**: 빌드 시점에 정적 포함
- **이미지 최적화**: Alpine Linux 기반 경량 이미지

### 런타임 최적화
- **Nginx 설정**: 정적 파일 서빙 최적화
- **Gzip 압축**: 전송 크기 최소화
- **캐시 헤더**: 브라우저 캐시 활용

### 모니터링 최적화
- **Cloud Run 메트릭**: CPU, 메모리 사용량 모니터링
- **로그 분석**: 오류 패턴 분석
- **성능 추적**: 응답 시간 모니터링 