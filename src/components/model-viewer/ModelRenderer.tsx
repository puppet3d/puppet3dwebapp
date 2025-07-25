import { useVRM } from "@/hooks/useVRM";
import { VRM } from "@pixiv/three-vrm";
import { Environment, Grid, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import React, { Suspense, useEffect, useRef } from "react";
import { VRMComponent } from "./VRMComponent";

interface ModelViewerProps {
  vrmUrl?: string;
  vrmFile?: File;
  onLoad?: (vrm: VRM) => void;
  onError?: (error: Error) => void;
  enableControls?: boolean;
  enableExpressionControls?: boolean;
  enableBoneAnimation?: boolean;
}

export const ModelRenderer: React.FC<ModelViewerProps> = ({
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
    updateExpression(expression, 1.0);
  };

  return (
    <div className="relative h-full w-full">
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

            {vrm && (
              <VRMComponent
                vrm={vrm}
                enableBoneAnimation={enableBoneAnimation}
              />
            )}

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
        <div className="bg-opacity-50 absolute inset-0 flex items-center justify-center bg-black">
          <div className="rounded-lg bg-white p-6 shadow-lg">
            <p className="mb-2 text-lg font-medium">Loading VRM Model...</p>
            <div className="h-2 w-full rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                style={{ width: `${loadingState.progress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {enableExpressionControls && vrm && (
        <div className="absolute right-4 bottom-4 left-4">
          <div className="rounded-lg bg-white p-4 shadow-lg">
            <h3 className="mb-2 text-sm font-medium">Expressions</h3>
            <div className="flex flex-wrap gap-2">
              {["happy", "angry", "sad", "relaxed", "surprised", "neutral"].map(
                (expression) => (
                  <button
                    key={expression}
                    onClick={() =>
                      handleExpressionClick(expression as VRMExpressionPreset)
                    }
                    className="rounded bg-blue-500 px-3 py-1 text-sm text-white transition-colors hover:bg-blue-600"
                  >
                    {expression}
                  </button>
                ),
              )}
              <button
                onClick={resetExpressions}
                className="rounded bg-gray-500 px-3 py-1 text-sm text-white transition-colors hover:bg-gray-600"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {loadingState.error && (
        <div className="absolute top-4 right-4 left-4">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-red-600">Error: {loadingState.error}</p>
          </div>
        </div>
      )}
    </div>
  );
};
