import { Environment, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";

interface AppCanvasProps {
  children: React.ReactNode;
}

export const AppCanvas: React.FC<AppCanvasProps> = ({ children }) => {
  return (
    <Canvas>
      <Suspense fallback={null}>
        {children}
        <OrbitControls />
        <Environment preset="sunset" background />
      </Suspense>
    </Canvas>
  );
};
