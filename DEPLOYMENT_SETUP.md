# 🚀 AX Tools 배포 설정 가이드

## 📋 GitHub Secrets 설정

GitHub 저장소의 **Settings > Secrets and variables > Actions**에서 다음 Secrets를 설정하세요:

### 1. GCP_PROJECT_ID
- **설명**: Google Cloud 프로젝트 ID
- **값**: `your-project-id-123456`
- **확인 방법**: Google Cloud Console 상단에서 프로젝트 ID 확인

### 2. GCP_SA_KEY
- **설명**: 서비스 계정 키 JSON
- **값**: 서비스 계정 키 JSON 파일의 전체 내용
- **생성 방법**: 아래 "서비스 계정 설정" 참조

### 3. VITE_SUPABASE_URL
- **설명**: Supabase 프로젝트 URL
- **값**: `https://your-project.supabase.co`

### 4. VITE_SUPABASE_ANON_KEY
- **설명**: Supabase Anonymous Key
- **값**: Supabase 프로젝트 설정에서 확인

## 🔧 Google Cloud 서비스 계정 설정

### 1. 서비스 계정 생성
```bash
# Google Cloud Console에서 실행
gcloud iam service-accounts create ax-tools-deploy \
  --display-name="AX Tools Deployment Service Account"
```

### 2. 필요한 권한 부여
```bash
# Artifact Registry 권한
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:ax-tools-deploy@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/artifactregistry.admin"

# Cloud Run 권한
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:ax-tools-deploy@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/run.admin"

# Service Account User 권한
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:ax-tools-deploy@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"
```

### 3. 서비스 계정 키 생성
```bash
# JSON 키 파일 생성
gcloud iam service-accounts keys create ax-tools-deploy-key.json \
  --iam-account=ax-tools-deploy@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

### 4. GitHub Secrets에 키 추가
1. 생성된 `ax-tools-deploy-key.json` 파일을 열기
2. 파일의 전체 내용을 복사
3. GitHub Secrets의 `GCP_SA_KEY`에 붙여넣기

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
  "project_id": "your-project-id",
  "private_key_id": "key-id",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n",
  "client_email": "ax-tools-deploy@your-project-id.iam.gserviceaccount.com",
  "client_id": "client-id",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/ax-tools-deploy%40your-project-id.iam.gserviceaccount.com"
}
```

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