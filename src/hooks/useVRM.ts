import { useState, useCallback, useRef, useEffect } from 'react';
import { VRM, VRMUtils, VRMLoaderPlugin } from '@pixiv/three-vrm';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { VRMModel, VRMLoadingState } from '../types/vrm';

export const useVRM = () => {
  const [vrmModel, setVrmModel] = useState<VRMModel>({
    vrm: null,
    url: '',
    name: '',
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
      throw new Error('GLTFLoader not initialized');
    }

    setLoadingState({ isLoading: true, progress: 0 });
    
    try {
      const gltf = await loaderRef.current.loadAsync(
        url,
        (progress) => {
          const percent = (progress.loaded / progress.total) * 100;
          setLoadingState(prev => ({ ...prev, progress: percent }));
        }
      );
      
      const vrm = gltf.userData.vrm as VRM;
      
      if (!vrm) {
        throw new Error('VRM data not found in loaded GLTF');
      }
      
      VRMUtils.removeUnnecessaryVertices(gltf.scene);
      VRMUtils.combineSkeletons(gltf.scene);
      VRMUtils.combineMorphs(vrm);
      
      setVrmModel({
        vrm,
        url,
        name: name || 'Untitled Model',
      });
      
      setLoadingState({ isLoading: false, progress: 100 });
      
      return vrm;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load VRM';
      setVrmModel(prev => ({ ...prev, error: errorMessage }));
      setLoadingState({ isLoading: false, progress: 0, error: errorMessage });
      throw error;
    }
  }, []);

  const loadVRMFromFile = useCallback(async (file: File) => {
    const url = URL.createObjectURL(file);
    
    try {
      const vrm = await loadVRMFromUrl(url, file.name);
      return vrm;
    } catch (error) {
      URL.revokeObjectURL(url);
      throw error;
    }
  }, [loadVRMFromUrl]);

  const updateExpression = useCallback((expressionName: string, value: number) => {
    if (!vrmModel.vrm) return;
    
    const expression = vrmModel.vrm.expressionManager;
    if (!expression) return;
    
    expression.setValue(expressionName, value);
    expression.update();
  }, [vrmModel.vrm]);

  const resetExpressions = useCallback(() => {
    if (!vrmModel.vrm) return;
    
    const expression = vrmModel.vrm.expressionManager;
    if (!expression) return;
    
    expression.expressions.forEach((_, name) => {
      expression.setValue(name, 0);
    });
    expression.update();
  }, [vrmModel.vrm]);

  const dispose = useCallback(() => {
    if (vrmModel.vrm) {
      VRM.deepDispose(vrmModel.vrm.scene);
      if (vrmModel.url.startsWith('blob:')) {
        URL.revokeObjectURL(vrmModel.url);
      }
    }
    
    setVrmModel({
      vrm: null,
      url: '',
      name: '',
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