# MCP 기반 3D 아바타 대화 앱 아키텍처 (Electron 기반)

## 애플리케이션 아키텍처 개요

이 애플리케이션은 사용자가 업로드한 3D 아바타를 렌더링하고, 사용자의 입력(텍스트)을 LLM(대규모 언어 모델)으로 전달하여 아바타의 행동(표정, 시선, 움직임 등)과 텍스트 응답을 받는 상호작용을 목표로 합니다.

@modelcontext/sdk가 Node.js 환경을 요구하므로, Electron을 사용하여 다음과 같이 구성합니다:

- **Electron Main Process**: Node.js 환경에서 MCP 호스트와 MCP 클라이언트 역할을 수행
- **Electron Renderer Process**: React 웹앱이 실행되며 3D 아바타 렌더링과 UI를 담당
- **MCP Server**: 아바타 제어 도구를 제공하는 별도의 Node.js 서버

## 주요 구성 요소 및 역할

### 1. Electron Main Process (Node.js 환경 - MCP 호스트 및 클라이언트 역할)

Node.js 환경에서 실행되며 MCP 프로토콜의 핵심 역할을 수행합니다.

**MCP 호스트 기능:**
• @modelcontext/sdk를 사용하여 MCP 서버와 연결 관리
• MCP 서버로부터 도구(tools) 목록 수신 및 관리
• LLM과 MCP 서버 간의 메시지 라우팅

**MCP 클라이언트 기능:**
• 외부 LLM API와의 통신 (사용자가 제공한 API 엔드포인트 사용)
• sampling/createMessage 요청을 통한 LLM 질의
• LLM 응답 처리 및 도구 호출 관리

**IPC 통신:**
• Electron IPC를 통해 Renderer Process와 양방향 통신
• 아바타 제어 명령을 Renderer로 전달
• 사용자 입력을 Renderer로부터 수신

### 2. Electron Renderer Process (React 웹앱 - UI 및 3D 렌더링)

브라우저 환경에서 실행되는 React 애플리케이션입니다.

**프론트엔드 UI:**
• 3D 아바타 뷰포트 (Three.js 캔버스)
• 채팅 인터페이스 (입력 필드 및 응답 표시)
• VRM 파일 업로드 인터페이스
• LLM API 설정 패널
• 인간 개입(human-in-the-loop) 승인 UI

**VRM 렌더링 시스템:**
• Three.js와 @pixiv/three-vrm을 사용한 VRM 모델 로딩 및 렌더링
• React Three Fiber를 통한 React 통합
• WebXR API를 통한 VR/AR 지원

**VRM 제어 시스템:**
• VRMExpressionManager: 표정 제어 (happy, angry, sad 등)
• VRMLookAt: 시선 추적 및 제어
• VRMHumanoid: 뼈대 기반 포즈 제어
• VRMSpringBone: 머리카락과 옷자락의 물리 시뮬레이션
• VRMAnimation: 애니메이션 재생 시스템

**Main Process와의 통신:**
• Electron IPC를 통해 아바타 제어 명령 수신
• 사용자 입력을 Main Process로 전달
• 도구 실행 승인/거부 응답 전송

### 3. MCP Server (Node.js 백엔드 - 아바타 제어 도구 제공)

별도의 Node.js 프로세스로 실행되며 아바타 제어 도구를 제공합니다.

**서버 구성:**
• Node.js 기반 MCP 서버 (stdio 또는 HTTP 전송 사용)
• @modelcontext/sdk를 사용한 MCP 프로토콜 구현
• JSON-RPC 2.0 메시지 처리

**VRM 파일 관리:**
• VRM 파일 업로드/다운로드 API
• 파일 시스템 또는 클라우드 스토리지 (AWS S3 등)
• 파일 메타데이터 관리

**아바타 제어 도구 (Tools):**
• `set_expression(expression_name, weight)`: 표정 설정
• `look_at(x, y, z)`: 시선 방향 제어
• `set_pose(bone_name, rotation_x, rotation_y, rotation_z)`: 포즈 제어
• `play_animation(animation_id)`: 애니메이션 재생
• `reset_avatar()`: 아바타 초기화
• 각 도구는 JSON Schema로 입출력 정의

**MCP 프로토콜 구현:**
• 초기화 시 tools capability 선언
• tools/list 요청 처리
• tools/call 요청 처리 및 결과 반환
• 구조화된 로깅 (MCP 로깅 프로토콜)

**Main Process와의 통신:**
• stdio 또는 HTTP를 통한 JSON-RPC 통신
• 도구 호출 요청 수신 및 처리
• 실행 결과를 Main Process로 반환

### 4. 외부 LLM 서비스 (사용자 제공 API)

애플리케이션 외부의 LLM 제공자 API입니다 (예: Anthropic Claude API, OpenAI API).

**통신 방식:**
• Electron Main Process의 MCP 클라이언트가 직접 HTTP 요청
• 사용자가 제공한 API 키와 엔드포인트 사용

**기능:**
• 사용자 메시지와 대화 컨텍스트 기반 응답 생성
• MCP 서버가 제공하는 도구 목록을 인지하고 활용
• 도구 호출 지시를 포함한 구조화된 응답 반환

## 상호작용 흐름 (Electron 기반)

### 1. 초기 설정

1. **Electron 앱 시작**: Main Process와 Renderer Process 초기화
2. **MCP 서버 시작**: Node.js MCP 서버 프로세스 실행
3. **MCP 연결 설정**: Main Process가 MCP 서버와 stdio/HTTP 연결 확립
4. **도구 목록 수신**: Main Process가 MCP 서버로부터 사용 가능한 도구 목록 획득

### 2. 아바타 로딩

1. **VRM 파일 업로드**: 사용자가 Renderer Process UI에서 VRM 파일 선택
2. **파일 저장**: MCP 서버가 VRM 파일을 스토리지에 저장
3. **모델 로딩**: Renderer Process가 Three.js와 @pixiv/three-vrm으로 VRM 모델 렌더링

### 3. LLM 설정

1. **API 정보 입력**: 사용자가 LLM API 키와 엔드포인트 입력
2. **설정 전달**: Renderer → Main Process (IPC)
3. **클라이언트 구성**: Main Process가 LLM 연결 정보 저장

### 4. 대화 흐름

1. **사용자 입력**: Renderer Process에서 채팅 메시지 입력
2. **IPC 전송**: Renderer → Main Process로 메시지 전달
3. **LLM 요청 구성**: Main Process가 MCP 프로토콜에 따라 요청 생성
4. **LLM API 호출**: 외부 LLM 서비스로 HTTP 요청
5. **응답 수신**: LLM으로부터 텍스트 및 도구 호출 지시 수신

### 5. 도구 실행

1. **도구 호출 파싱**: Main Process가 LLM 응답에서 도구 호출 추출
2. **승인 요청**: Main → Renderer로 도구 실행 승인 요청 (human-in-the-loop)
3. **사용자 승인**: Renderer Process UI에서 사용자가 승인/거부
4. **MCP 서버 호출**: 승인 시 Main Process가 MCP 서버로 tools/call 요청
5. **도구 실행**: MCP 서버가 해당 도구 로직 실행
6. **결과 반환**: MCP 서버 → Main Process → Renderer Process

### 6. 아바타 업데이트

1. **제어 명령 수신**: Renderer Process가 IPC로 아바타 제어 데이터 수신
2. **VRM 제어 적용**:
   - VRMExpressionManager로 표정 변경
   - VRMLookAt으로 시선 조정
   - VRMHumanoid로 포즈 변경
3. **렌더링 업데이트**: Three.js가 변경사항을 실시간 렌더링
4. **텍스트 표시**: LLM 응답 텍스트를 채팅 UI에 표시

### 7. 에러 처리 및 재연결

1. **연결 모니터링**: Main Process가 MCP 서버 연결 상태 감시
2. **자동 재연결**: 연결 끊김 시 자동 재시도
3. **사용자 알림**: 연결 문제 발생 시 Renderer UI에 상태 표시

## 기술 스택 요약

### Electron 애플리케이션

- **Electron**: 데스크톱 앱 프레임워크
- **Main Process**: Node.js 환경, @modelcontext/sdk 실행
- **Renderer Process**: Chromium 기반 웹 환경, React 앱 실행
- **IPC**: Main-Renderer 간 통신

### MCP 구현

- **@modelcontext/sdk**: MCP 프로토콜 구현 라이브러리
- **JSON-RPC 2.0**: 메시지 프로토콜
- **stdio/HTTP**: 전송 메커니즘

### 3D 렌더링

- **Three.js**: 3D 그래픽 라이브러리
- **@pixiv/three-vrm**: VRM 모델 지원
- **React Three Fiber**: React 통합
- **WebXR API**: VR/AR 지원

### 프론트엔드

- **React**: UI 프레임워크
- **TypeScript**: 타입 안정성
- **Tailwind CSS**: 스타일링
- **Vite**: 빌드 도구

## 주요 차이점 (웹앱 vs Electron)

### 이전 아키텍처 (웹 브라우저 기반) - 불가능

- 웹 브라우저가 직접 MCP 호스트/클라이언트 역할 수행 시도
- @modelcontext/sdk가 브라우저 환경에서 실행 불가 (Node.js 전용)
- WebSocket/HTTP만으로는 완전한 MCP 프로토콜 구현 제한

### 현재 아키텍처 (Electron 기반) - 가능

- Electron Main Process가 Node.js 환경 제공
- @modelcontext/sdk를 Main Process에서 실행
- Renderer Process는 기존 React 웹앱 그대로 사용
- IPC를 통한 안정적인 Process 간 통신
- 데스크톱 앱으로 배포 (Windows, macOS, Linux)
