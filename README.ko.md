# 🏐 세종대학교 축제 부스용 피카츄 배구 (듀스 룰 포함 버전)

[_English_](README.md) | _✓_ _Korean(한국어)_

> ℹ️ **면책 조항:**  
> 이 프로젝트는 프리웨어 게임을 기반으로 하며, 서드파티 개발자가 리버스 엔지니어링한 코드를 활용합니다.  
> 우리는 해당 리버스 엔지니어로부터 **사용, 수정, 배포에 대한 명확한 허락**을 받았습니다.  
> 모든 수정 사항은 **원작 및 리버스 엔지니어링 저작물에 대한 존중을 바탕으로** 이루어졌습니다.

[gorisanson의 오리지널 프로젝트](https://github.com/gorisanson/pikachu-volleyball)에서 포크된 프로젝트입니다.  
본 버전은 **세종대학교 축제 부스**에서 사용하기 위해 기능 추가 및 커스터마이징이 이루어졌습니다.  


## ▶️ 로컬에서 실행하는 방법

1. 이 저장소를 클론한 후 디렉토리로 이동합니다.

```sh
git clone https://github.com/developowl/pikachu-volleyball
cd pikachu-volleyball
```

2. 의존성을 설치합니다. (에러가 발생할 경우 `node v16`, `npm v8`을 사용해보세요.)

```sh
npm install
```

3. `.env` 파일에 토큰을 추가합니다.
```sh
URL_TOKEN=your_url_token
```

4. 코드를 번들링합니다.

```sh
npm run build
```

5. 로컬 웹 서버를 실행합니다.

```sh
npx http-server dist
```

6. 웹 브라우저에서 로컬 웹 서버에 접속합니다. (대부분 `http://localhost:8080`으로 접속할 수 있으며, 정확한 주소는 터미널에 출력된 메시지에서 확인 가능합니다.)


## 🔧 리팩토링된 주요 기능

### 1. 🏆 승리 조건 & 듀스 룰
- 이제 게임은 한 플레이어가 **5점을 획득하면 종료**됩니다.
- 양쪽이 **4:4 동점**이 되면 **듀스(deuce) 모드**로 진입합니다:
  - **2점 차 이상**이 나야 승리할 수 있습니다.

### 2. 플레이어 역할 고정
- **플레이어 1** (왼쪽 피카츄): **부스 참가자**
- **플레이어 2** (오른쪽 피카츄): **그리디(Greedy) 운영진**
- 각 역할은 부스 진행을 위해 고정되었습니다.

### 3. 컨트롤 키 설정

| 플레이어 | 방향 | 키 |
|----------|------|----|
| 플레이어 1 (참가자) | 왼쪽 이동 | `← (ArrowLeft)` |
|                          | 오른쪽 이동 | `→ (ArrowRight)` |
|                          | 점프 | `↑ (ArrowUp)` |
|                          | 아래로 | `↓ (ArrowDown)` |
|                          | 파워 히트 | `Z` |
| 플레이어 2 (운영진) | 왼쪽 이동 | `K` |
|                          | 오른쪽 이동 | `;(세미콜론)` |
|                          | 점프 | `O` |
|                          | 아래로 | `L` |
|                          | 파워 히트 | `F` |

### 4. 점수 계산 로직
플레이어 1(참가자)의 점수 보상은 게임 결과에 따라 계산됩니다:

- 🟢 **듀스 전 승리** → `8점` (`winningScore + 3`)
- 🔴 **듀스 전 패배** → 실제 점수 (`0` ~ `winningScore - 2`)
- 🟢 **듀스 후 승리** → `6점` (`winningScore + 1`)
- 🔴 **듀스 후 패배** → `5점` (`winningScore`)

- ➕α 스킬 점수 (0.00 ~ 12.00점)
  > 자체 제작한 내부 점수 집계 로직을 통해 계산됩니다.

### 5. 점수 제출 모달
- 게임 종료 시 결과 모달이 표시됩니다.
- 참가자는 **ID를 입력하여 점수를 리더보드에 제출**할 수 있습니다.


## 스냅샷

(위에 있는 `한국어`를 클릭하세요)
<img width="1920" alt="Screenshot 2025-05-12 at 00 50 30" src="https://github.com/user-attachments/assets/bbeb250c-3ae6-43c8-b359-a738be471be1" />
<img width="1920" alt="Screenshot 2025-05-12 at 00 51 13" src="https://github.com/user-attachments/assets/56ba91f2-40e3-424b-94b0-2b7249aa7dee" />
<img width="1920" alt="Screenshot 2025-05-12 at 00 52 31" src="https://github.com/user-attachments/assets/3a40187f-a3d0-41c3-b1f1-e9a0c3675298" />


## ⚠️ 서버를 종료해도 localhost:8080이 계속 실행되나요?

`Ctrl + C`로 로컬 서버를 종료했음에도 브라우저가 이전 버전을 계속 보여주거나 `localhost:8080`으로의 요청을 가로채는 경우가 있습니다.

이는 브라우저의 **Service Worker와 캐시 데이터가 여전히 활성화**되어 있기 때문입니다.

### ✅ 해결 방법 1: 사이트 데이터 지우기 (권장)
1. 크롬 개발자 도구 열기 (`F12` 또는 `Cmd + Option + I`)
2. **Application** 탭으로 이동
3. 왼쪽 사이드바에서 **Storage** 선택
4. **Site data** 아래의 모든 항목 체크 (`Local storage`, `Cookies`, `Cache storage` 등)
5. **Clear site data** 버튼 클릭
<img width="1920" alt="Screenshot 2025-05-12 at 00 53 37" src="https://github.com/user-attachments/assets/023334c4-4424-459d-bf32-acf09f3d9c09" />
6. 페이지 새로고침

이 방법으로 대부분의 문제가 해결됩니다.

---

### ✅ 해결 방법 2: 서비스 워커 등록 해제
위 방법이 안 될 경우:

1. 크롬 개발자 도구 열기 (`F12` 또는 `Cmd + Option + I`)
2. **Application** 탭으로 이동
3. 왼쪽 사이드바에서 **Service Workers** 클릭
4. **See all registrations** 클릭
<img width="1920" alt="Screenshot 2025-05-12 at 03 19 04" src="https://github.com/user-attachments/assets/bd669cf5-faf8-4eb5-8548-939e2028170f" />
5. `localhost:8080`에 등록된 서비스 워커 확인
6. **Unregister** 클릭
<img width="1920" alt="Screenshot 2025-05-12 at 01 15 35" src="https://github.com/user-attachments/assets/ba586571-58d3-4a55-ae56-2066f8e4b5af" />
7. **강력 새로고침** (`Ctrl + Shift + R` 또는 `Cmd + Shift + R`) 수행
