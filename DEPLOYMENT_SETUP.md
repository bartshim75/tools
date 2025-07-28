# 🚀 AX Tools 배포 설정 가이드

## ✅ **배포 성공!**

현재 AX Tools는 Google Cloud Run에서 성공적으로 배포되어 운영 중입니다.

### **배포 정보**
- **서비스**: ax-tools-app
- **리전**: us-central1
- **플랫폼**: Google Cloud Run
- **컨테이너**: Docker + Nginx
- **CI/CD**: GitHub Actions

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

### 4. VITE_SUPABASE_ANON_KEY
- **설명**: Supabase Anonymous Key
- **값**: Supabase 프로젝트 설정에서 확인

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
3. **Docker 이미지 빌드**: React 앱을 Docker 컨테이너로 빌드
4. **Artifact Registry 푸시**: 이미지를 Google Artifact Registry에 업로드
5. **Cloud Run 배포**: 새 이미지로 Cloud Run 서비스 업데이트

### 배포 확인
- GitHub Actions 탭에서 배포 상태 확인
- Cloud Run 콘솔에서 서비스 상태 확인
- 배포된 URL로 접속하여 기능 테스트

## 🔍 문제 해결

### 인증 오류가 발생하는 경우:

#### 1. GitHub Secrets 확인
- GitHub 저장소 → Settings → Secrets and variables → Actions
- 모든 필수 Secrets가 설정되어 있는지 확인

#### 2. 서비스 계정 키 형식 확인
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

#### 3. 서비스 계정 권한 확인
Google Cloud Console → IAM & Admin → IAM에서 서비스 계정에 다음 권한이 있는지 확인:
- `Artifact Registry Repository Administrator`
- `Cloud Run Admin`
- `Service Account User`

#### 4. API 활성화 확인
Google Cloud Console에서 다음 API가 활성화되어 있는지 확인:
- Artifact Registry API
- Cloud Run API
- Cloud Build API

### 로그 확인:
- GitHub Actions 로그에서 "Manual Google Cloud Authentication" 단계 확인
- JSON 형식 오류나 인증 실패 메시지 확인

## 📞 지원

문제가 지속되면 다음을 확인하세요:
1. Google Cloud Console에서 서비스 계정 상태
2. GitHub Actions 로그의 상세 오류 메시지
3. Google Cloud 프로젝트의 API 활성화 상태
4. 서비스 계정 키의 JSON 형식이 올바른지 확인

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
- [ ] 로그인/로그아웃 기능
- [ ] 도구 추가/수정/삭제 기능
- [ ] 드래그 앤 드롭 순서 변경
- [ ] 반응형 디자인 (모바일/태블릿/데스크톱)
- [ ] SVG 로고 표시

### 2. 성능 확인
- [ ] 페이지 로딩 속도
- [ ] 이미지 로딩
- [ ] 데이터베이스 연결

### 3. 보안 확인
- [ ] HTTPS 연결
- [ ] 인증 토큰 관리
- [ ] API 키 보안

## 📈 모니터링

### Google Cloud Console
- Cloud Run 서비스 모니터링
- 로그 확인
- 리소스 사용량 확인

### GitHub Actions
- 배포 히스토리 확인
- 빌드 로그 분석
- 성공/실패 통계

## 🔄 업데이트 프로세스

### 코드 변경 시
1. 로컬에서 코드 수정
2. Git 커밋 및 푸시
3. GitHub Actions 자동 배포
4. 배포 완료 확인

### 환경 변수 변경 시
1. GitHub Secrets 업데이트
2. 수동 배포 트리거 또는 코드 푸시
3. 새 환경 변수 적용 확인 