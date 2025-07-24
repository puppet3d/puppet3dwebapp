import React, { useEffect, useRef, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Grid, Environment } from '@react-three/drei';
import { VRM } from '@pixiv/three-vrm';
import * as THREE from 'three';
import type { ModelViewerProps, VRMExpressionPreset } from '../types/vrm';
import { useVRM } from '../hooks/useVRM';

interface VRMComponentProps {
  vrm: VRM;
  enableBoneAnimation?: boolean;
}

const VRMComponent: React.FC<VRMComponentProps> = ({ vrm, enableBoneAnimation = false }) => {
  const { scene, clock } = useThree();
  
  useEffect(() => {
    if (vrm) {
      vrm.scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      scene.add(vrm.scene);
      
      return () => {
        scene.remove(vrm.scene);
      };
    }
  }, [vrm, scene]);

  useFrame((state, delta) => {
    if (vrm) {
      if (enableBoneAnimation) {
        const s = 0.25 * Math.PI * Math.sin(Math.PI * clock.elapsedTime);
        
        const neck = vrm.humanoid.getNormalizedBoneNode('neck');
        const leftUpperArm = vrm.humanoid.getNormalizedBoneNode('leftUpperArm');
        const rightUpperArm = vrm.humanoid.getNormalizedBoneNode('rightUpperArm');
        
        if (neck) neck.rotation.y = s;
        if (leftUpperArm) leftUpperArm.rotation.z = s;
        if (rightUpperArm) rightUpperArm.rotation.x = s;
      }
      
      vrm.update(delta);
    }
  });

  return null;
};

export const ModelViewer: React.FC<ModelViewerProps> = ({
  vrmUrl,
  vrmFile,
  onLoad,
  onError,
  enableControls = true,
  enableExpressionControls = true,
  enableBoneAnimation = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    vrm,
    loadingState,
    loadVRMFromUrl,
    loadVRMFromFile,
    updateExpression,
    resetExpressions,
  } = useVRM();

  useEffect(() => {
    const loadModel = async () => {
      try {
        let loadedVrm: VRM | null = null;
        
        if (vrmFile) {
          loadedVrm = await loadVRMFromFile(vrmFile);
        } else if (vrmUrl) {
          loadedVrm = await loadVRMFromUrl(vrmUrl);
        }
        
        if (loadedVrm && onLoad) {
          onLoad(loadedVrm);
        }
      } catch (error) {
        if (onError && error instanceof Error) {
          onError(error);
        }
      }
    };
    
    loadModel();
  }, [vrmUrl, vrmFile, loadVRMFromUrl, loadVRMFromFile, onLoad, onError]);

  const handleExpressionClick = (expression: VRMExpressionPreset) => {
    resetExpressions();
    updateExpression(expression, 1.0);
  };

  return (
    <div className="w-full h-full relative">
      <div className="absolute inset-0">
        <Canvas
          ref={canvasRef}
          camera={{ position: [0, 1.5, 3], fov: 30 }}
          shadows
        >
          <Suspense fallback={null}>
            <ambientLight intensity={0.6} />
            <directionalLight
              position={[1, 1, 1]}
              intensity={0.8}
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
            />
            
            {vrm && <VRMComponent vrm={vrm} enableBoneAnimation={enableBoneAnimation} />}
            
            <Grid
              args={[10, 10]}
              cellSize={0.5}
              cellThickness={0.5}
              cellColor="#6e6e6e"
              sectionSize={5}
              sectionThickness={1}
              sectionColor="#9d9d9d"
              fadeDistance={30}
              fadeStrength={1}
              followCamera={false}
            />
            
            {enableControls && (
              <OrbitControls
                target={[0, 1, 0]}
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
                maxPolarAngle={Math.PI * 0.9}
                minDistance={1}
                maxDistance={10}
              />
            )}
            
            <Environment preset="sunset" />
          </Suspense>
        </Canvas>
      </div>

      {loadingState.isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <p className="text-lg font-medium mb-2">Loading VRM Model...</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${loadingState.progress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {enableExpressionControls && vrm && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-white rounded-lg shadow-lg p-4">
            <h3 className="text-sm font-medium mb-2">Expressions</h3>
            <div className="flex flex-wrap gap-2">
              {['happy', 'angry', 'sad', 'relaxed', 'surprised', 'neutral'].map((expression) => (
                <button
                  key={expression}
                  onClick={() => handleExpressionClick(expression as VRMExpressionPreset)}
                  className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  {expression}
                </button>
              ))}
              <button
                onClick={resetExpressions}
                className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {loadingState.error && (
        <div className="absolute top-4 left-4 right-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">Error: {loadingState.error}</p>
          </div>
        </div>
      )}
    </div>
  );
};