VRM 모델을 React 컴포넌트로 구성할 때 `scene`, `camera`, `mesh` 세 가지 Three.js의 3요소에 맞추어 분리하는 방식도 가능하지만, VRM 모델의 특성을 고려하고 React Three Fiber(R3F)의 장점을 극대화한다면 유지보수 및 확장성 측면에서 더욱 효과적인 계층 구조를 구성할 수 있습니다.

이전 논의에서 제안드렸듯이, AI 연애 시뮬레이터 프로젝트는 **Three.js**와 **pixiv/three-vrm**을 활용하며, 프론트엔드는 **React Three Fiber (R3F)**를 통합하여 선언적인 3D 씬 관리, 컴포넌트 재사용성, React 생태계와의 원활한 통합, 그리고 자동 메모리 관리를 이점으로 가집니다.

VRM 모델의 다양한 기능(표정, 뼈대, 물리 효과 등)을 분리하여 관리하는 것이 유지보수에 유리합니다. 다음은 추천하는 계층 구조와 각 컴포넌트의 역할입니다.

### React 컴포넌트 아키텍처

#### 상태 관리

**Zustand**를 사용하여 VRM 상태를 전역으로 관리합니다:

- **`useVRMStore`**: VRM 모델, 표정 관리자, 표정 맵 등을 전역 상태로 관리
- **기능**: VRM 파일 로딩(`loadVRM`), 상태 초기화, 이전 모델 정리(`disposeVRM`)

#### 컴포넌트 구조

1. **`AppCanvas` (최상위 캔버스/씬 설정)**
   - **역할**: R3F의 `<Canvas>` 컴포넌트를 사용하여 Three.js의 렌더링 환경을 설정하는 최상위 컴포넌트입니다. 전역적인 조명(lights), 카메라 설정, OrbitControls를 포함합니다.
   - **특징**: 모바일 최적화된 카메라 위치, 적절한 조명 설정, 사용자 인터랙션 제한

2. **`VRMModelLoader` (VRM 파일 로딩 및 씬 관리)**
   - **역할**:
     - Zustand store의 `loadVRM`을 호출하여 VRM 파일을 로딩합니다
     - 로딩된 VRM 모델을 Three.js 씬에 추가합니다
     - VRM 모델의 동적인 부분(표정, 시선, 물리 효과 등)이 자연스럽게 움직이도록 **`vrm.update()` 메서드를 매 프레임마다 호출**합니다
     - 컴포넌트 언마운트 시 `disposeVRM` 유틸을 사용해 리소스를 정리합니다

3. **VRM 기능별 하위 컴포넌트**
   `VRMModelLoader`의 자식으로 배치되며, 각각 특정 VRM 기능을 제어하는 독립적인 컴포넌트들입니다. 이들은 **`useVRMStore` 훅을 통해 Zustand store에서 필요한 VRM 객체와 상태를 직접 가져와 사용**합니다. 이러한 구조는 불필요한 prop drilling을 방지하고 각 컴포넌트가 필요한 경우에만 VRM 상태에 접근할 수 있도록 합니다.
   - **`VRMHumanoidControl`**: 아바타의 뼈대(`humanoid`)를 제어하고 T-포즈를 기준으로 애니메이션 및 포즈를 적용합니다. `getRawBone`을 통해 특정 뼈를 가져오거나 포즈를 변경하는 기능을 제공할 수 있습니다.
   - **`VRMExpressionControl`** (현재 구현됨): 아바타의 감정 표정(`expressionManager`)을 관리합니다. `setValue` 메서드를 사용하여 감정 표현을 조절하고, 자동 눈 깜빡임 애니메이션을 제공합니다. 개발 모드에서는 랜덤 표정 테스트 기능도 포함합니다. `useVRMStore`에서 `expressionManager`와 `expressionMap`을 가져와 사용합니다.
   - **`VRMLipSyncControl`**: 아바타의 립싱크(`expressionManager`)를 담당합니다. TTS(Text-to-Speech) 및 음성 입력과 연동하여 음소별 입 모양(aa, ih, ou, ee, oh)을 실시간으로 동기화합니다. Web Audio API를 통한 오디오 분석, 음소 매핑, 부드러운 전환 애니메이션 등의 기능을 제공합니다.
   - **`VRMLookAtControl`**: 아바타의 시선(`lookAt`)을 특정 대상이나 위치로 유도합니다. 뼈대 방식과 표정 방식 두 가지 시선 추적 방식을 지원하며, 시선 범위를 조절하여 자연스러운 움직임을 만들 수 있습니다.
   - **`VRMSpringBonePhysics`**: 머리카락, 옷자락 등 아바타의 특정 부분에 자연스러운 물리 효과(`springBoneManager`)를 시뮬레이션하고, 강도, 중력, 저항력 등 물리 설정을 조정하는 기능을 제공합니다.
   - **`VRMAnimationPlayer`**: `gltf.animations`에서 애니메이션 클립을 가져와 `AnimationMixer`를 통해 재생하고 제어합니다. 재생 속도, 반복 설정, 애니메이션 전환(블렌딩) 등의 기능을 포함할 수 있습니다.
   - **`VRMNodeConstraintManager`**: 아바타 뼈대 간의 복잡한 움직임 연결을 위한 조준 제약(Aim Constraint) 및 회전 제약(Rotation Constraint)을 설정하고 관리합니다.
   - **`VRMToonMaterialSettings`**: MToonMaterial의 그림자 색상, 위치, 선명도, 윤곽선 효과, 림 라이트 효과 등 애니메이션 스타일 렌더링을 위한 재질 설정을 제어합니다.

### 컴포넌트 구조

```
AppCanvas (R3F Canvas + 조명 + 카메라 + OrbitControls)
└── VRMModelLoader (Zustand store 사용, 씬 관리, VRM 업데이트)
    └── VRMExpressionControl (useVRMStore 훅 사용, 구현 완료)

// 향후 추가 예정:
    ├── VRMLipSyncControl (useVRMStore 훅 사용)
    ├── VRMHumanoidControl (useVRMStore 훅 사용)
    ├── VRMLookAtControl (useVRMStore 훅 사용)
    ├── VRMSpringBonePhysics (useVRMStore 훅 사용)
    ├── VRMAnimationPlayer (useVRMStore 훅 사용)
    ├── VRMNodeConstraintManager (useVRMStore 훅 사용)
    └── VRMToonMaterialSettings (useVRMStore 훅 사용)
```

MCP 서버에서 LLM이 "웃는 표정을 지어라"는 도구 호출 지시(tool_use)를 내리면, 프론트엔드의 `VRMExpressionControl` 컴포넌트가 `useVRMStore` 훅을 통해 전역 상태에 접근하여 표정을 변경하게 됩니다.
