import { disposeVRM, normalizeVRMModel } from "@/util/vrm-util";
import {
  VRMExpressionManager,
  VRMExpressionPresetName,
  VRMLoaderPlugin,
  type VRM,
  type VRMExpression,
} from "@pixiv/three-vrm";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import * as THREE from "three";
import { create } from "zustand";

interface VRMState {
  /**
   * VRM 모델 관리
   **/
  vrmModel?: VRM;
  loadVRM: (url: string, scene: THREE.Scene) => Promise<VRM>;

  /**
   * Expresison 관리
   **/
  expressionManager?: VRMExpressionManager;
  expressionMap?: Record<string, VRMExpression>;
  presetExpressionMap?: Partial<Record<VRMExpressionPresetName, VRMExpression>>;
  customExpressionMap?: Record<string, VRMExpression>;
}

export const useVRMStore = create<VRMState>()((set, get) => ({
  vrmModel: undefined,
  loadVRM: async (url: string, scene: THREE.Scene): Promise<VRM> => {
    const prevVRM = get().vrmModel;
    if (prevVRM) {
      set(() => ({
        vrmModel: undefined,
        expressionManager: undefined,
        expressionMap: undefined,
        presetExpressionMap: undefined,
        customExpressionMap: undefined,
      }));
      disposeVRM(prevVRM);
    }
    const loader = new GLTFLoader();
    loader.register((parser) => new VRMLoaderPlugin(parser));

    return new Promise((resolve, reject) => {
      loader.load(
        url,
        (gltf) => {
          const vrm: VRM = gltf.userData.vrm;
          normalizeVRMModel(vrm);
          scene.add(vrm.scene);
          const availableExpressionsList = Object.keys(
            vrm.expressionManager?.expressionMap || {},
          );
          console.debug(availableExpressionsList);
          set(() => ({
            vrmModel: vrm,
            expressionManager: vrm.expressionManager,
            expressionMap: vrm.expressionManager?.expressionMap,
            presetExpressionMap: vrm.expressionManager?.presetExpressionMap,
            customExpressionMap: vrm.expressionManager?.customExpressionMap,
          }));
          resolve(vrm);
        },
        (error) => {
          console.error(error);
          reject(error);
        },
      );
    });
  },
  expressionManager: undefined,
  expressionMap: undefined,
  presetExpressionMap: undefined,
  customExpressionMap: undefined,
}));
