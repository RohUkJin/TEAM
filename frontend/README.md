# Frontend

Next.js(App Router) + TypeScript UI.

프로젝트 전체 목표·스택 선택 이유·실행 방법·문서는 **저장소 루트**를 본다.

* [루트 README](../README.md)
* [설계·학습 문서](../docs/)

## 로컬 실행

```powershell
copy .env.example .env.local
npm install
npm run dev
```

`NEXT_PUBLIC_API_BASE_URL` 기본값: `http://localhost:4000/api`  
API는 Cookie(`credentials: "include"`)로 인증한다. 토큰을 localStorage에 두지 않는다.
