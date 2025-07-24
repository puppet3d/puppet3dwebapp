import type { VRM } from '@pixiv/three-vrm';

export interface VRMModel {
  vrm: VRM | null;
  url: string;
  name: string;
  error?: string;
}

export interface VRMExpression {
  name: string;
  value: number;
}

export interface VRMLoadingState {
  isLoading: boolean;
  progress: number;
  error?: string;
}

export interface VRMFileUploadProps {
  onFileSelect: (file: File) => void;
  onSampleModelSelect?: () => void;
  isLoading?: boolean;
  error?: string;
}

export interface ModelViewerProps {
  vrmUrl?: string;
  vrmFile?: File;
  onLoad?: (vrm: VRM) => void;
  onError?: (error: Error) => void;
  enableControls?: boolean;
  enableExpressionControls?: boolean;
  enableBoneAnimation?: boolean;
}

export type VRMExpressionPreset =
  | 'happy'
  | 'angry'
  | 'sad'
  | 'relaxed'
  | 'surprised'
  | 'aa'
  | 'ih'
  | 'ou'
  | 'ee'
  | 'oh'
  | 'blink'
  | 'blinkLeft'
  | 'blinkRight'
  | 'lookUp'
  | 'lookDown'
  | 'lookLeft'
  | 'lookRight'
  | 'neutral';