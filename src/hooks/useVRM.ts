import { VRM, VRMLoaderPlugin, VRMUtils } from "@pixiv/three-vrm";
import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { findBestExpressionMatch } from "../utils/vrmExpressionMapping";

interface VRMModel {
  vrm: VRM | null;
  url: string;
  name: string;
  error?: string;
}

interface VRMLoadingState {
  isLoading: boolean;
  progress: number;
  error?: string;
}

export const useVRM = () => {
  const [vrmModel, setVrmModel] = useState<VRMModel>({
    vrm: null,
    url: "",
    name: "",
  });

  const [loadingState, setLoadingState] = useState<VRMLoadingState>({
    isLoading: false,
    progress: 0,
  });

  const loaderRef = useRef<GLTFLoader | null>(null);

  useEffect(() => {
    const loader = new GLTFLoader();
    loader.register((parser) => new VRMLoaderPlugin(parser));
    loaderRef.current = loader;
  }, []);

  const loadVRMFromUrl = useCallback(async (url: string, name?: string) => {
    if (!loaderRef.current) {
      throw new Error("GLTFLoader not initialized");
    }

    setLoadingState({ isLoading: true, progress: 0 });

    try {
      const gltf = await loaderRef.current.loadAsync(url, (progress) => {
        const percent = (progress.loaded / progress.total) * 100;
        setLoadingState((prev) => ({ ...prev, progress: percent }));
      });

      const vrm = gltf.userData.vrm as VRM;

      if (!vrm) {
        throw new Error("VRM data not found in loaded GLTF");
      }

      VRMUtils.removeUnnecessaryVertices(gltf.scene);
      VRMUtils.combineSkeletons(gltf.scene);
      VRMUtils.combineMorphs(vrm);

      setVrmModel({
        vrm,
        url,
        name: name || "Untitled Model",
      });

      setLoadingState({ isLoading: false, progress: 100 });

      return vrm;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load VRM";
      setVrmModel((prev) => ({ ...prev, error: errorMessage }));
      setLoadingState({ isLoading: false, progress: 0, error: errorMessage });
      throw error;
    }
  }, []);

  const loadVRMFromFile = useCallback(
    async (file: File) => {
      const url = URL.createObjectURL(file);

      try {
        const vrm = await loadVRMFromUrl(url, file.name);
        return vrm;
      } catch (error) {
        URL.revokeObjectURL(url);
        throw error;
      }
    },
    [loadVRMFromUrl],
  );

  const updateExpression = useCallback(
    (expressionName: string, value: number) => {
      if (!vrmModel.vrm) return;

      const expressionManager = vrmModel.vrm.expressionManager;
      if (!expressionManager) return;

      // First reset all expressions to avoid overlapping
      if (
        expressionManager.expressions &&
        typeof expressionManager.expressions.keys === "function"
      ) {
        for (const existingExpressionName of expressionManager.expressions.keys()) {
          expressionManager.setValue(existingExpressionName.toString(), 0);
        }
      }

      // Get available expressions for matching
      const availableExpressions: string[] = [];
      const expressionNames: string[] = [];

      if (expressionManager.expressions) {
        // Handle both Map and array-like structures
        if (typeof expressionManager.expressions.entries === "function") {
          for (const [
            key,
            expression,
          ] of expressionManager.expressions.entries()) {
            const keyStr = key.toString();
            availableExpressions.push(keyStr);

            if (
              expression &&
              typeof expression === "object" &&
              "expressionName" in expression
            ) {
              const name = expression.expressionName || keyStr;
              expressionNames.push(name);
            }
          }
        } else if (Array.isArray(expressionManager.expressions)) {
          expressionManager.expressions.forEach((expression, index) => {
            const keyStr = index.toString();
            availableExpressions.push(keyStr);

            if (
              expression &&
              typeof expression === "object" &&
              "expressionName" in expression
            ) {
              const name = expression.expressionName || keyStr;
              expressionNames.push(name);
            }
          });
        }
      }

      // Try to find the best matching expression
      const matchingExpression = findBestExpressionMatch(expressionName, [
        ...availableExpressions,
        ...expressionNames,
      ]);

      if (matchingExpression) {
        // Try to set the expression using various approaches
        try {
          expressionManager.setValue(matchingExpression, value);
          console.log(
            `Expression '${expressionName}' mapped to '${matchingExpression}' and set to ${value}`,
          );
        } catch (error) {
          // If direct string fails, try the numeric expression as string
          if (/^\d+$/.test(matchingExpression)) {
            try {
              expressionManager.setValue(matchingExpression, value);
              console.log(
                `Expression '${expressionName}' mapped to index ${matchingExpression} and set to ${value}`,
              );
            } catch {
              console.warn(
                `Failed to set expression '${expressionName}':`,
                error,
              );
            }
          } else {
            console.warn(
              `Failed to set expression '${expressionName}':`,
              error,
            );
          }
        }
      } else {
        console.warn(`Expression '${expressionName}' not found. Available:`, {
          keys: availableExpressions,
          names: expressionNames,
        });
      }

      expressionManager.update();
    },
    [vrmModel.vrm],
  );

  const resetExpressions = useCallback(() => {
    if (!vrmModel.vrm) return;

    const expressionManager = vrmModel.vrm.expressionManager;
    if (!expressionManager) return;

    // Reset all existing expressions to 0
    if (expressionManager.expressions) {
      if (typeof expressionManager.expressions.keys === "function") {
        for (const expressionName of expressionManager.expressions.keys()) {
          try {
            expressionManager.setValue(expressionName.toString(), 0);
          } catch {
            // Ignore failed resets
          }
        }
      } else if (Array.isArray(expressionManager.expressions)) {
        expressionManager.expressions.forEach((_, index) => {
          expressionManager.setValue(index.toString(), 0);
        });
      }
    }
    expressionManager.update();
  }, [vrmModel.vrm]);

  const dispose = useCallback(() => {
    if (vrmModel.vrm) {
      // Manual cleanup for VRM resources
      vrmModel.vrm.scene.traverse((child) => {
        if ("geometry" in child && child.geometry) {
          (child.geometry as THREE.BufferGeometry).dispose();
        }
        if ("material" in child && child.material) {
          const material = child.material as THREE.Material | THREE.Material[];
          if (Array.isArray(material)) {
            material.forEach((mat: THREE.Material) => mat.dispose());
          } else {
            material.dispose();
          }
        }
      });

      if (vrmModel.url.startsWith("blob:")) {
        URL.revokeObjectURL(vrmModel.url);
      }
    }

    setVrmModel({
      vrm: null,
      url: "",
      name: "",
    });

    setLoadingState({
      isLoading: false,
      progress: 0,
    });
  }, [vrmModel.vrm, vrmModel.url]);

  return {
    vrm: vrmModel.vrm,
    vrmModel,
    loadingState,
    loadVRMFromUrl,
    loadVRMFromFile,
    updateExpression,
    resetExpressions,
    dispose,
  };
};
