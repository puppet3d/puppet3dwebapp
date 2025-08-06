import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";

interface AppCanvasProps {
  children: React.ReactNode;
}

export const AppCanvas: React.FC<AppCanvasProps> = ({ children }) => {
  return (
    <Canvas
      camera={{
        position: [0, 1.4, 1.0], // X: center, Y: face height (87% of 1.6m), Z: close for mobile
        fov: 45, // Field of view for mobile
        near: 0.1,
        far: 100,
      }}
      style={{ background: "#f0f0f0" }} // Neutral background
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[0, 10, 5]} intensity={0.8} />
        <directionalLight position={[0, -5, -5]} intensity={0.3} />{" "}
        {/* Fill light from below */}
        {children}
        <OrbitControls
          target={[0, 1.2, 0]} // Look at chest/neck area (75% of normalized 1.6m height)
          minDistance={0.5} // Don't get too close
          maxDistance={3} // Don't zoom out too far
          minPolarAngle={Math.PI / 4} // Limit vertical rotation (45 degrees from top)
          maxPolarAngle={Math.PI / 1.5} // Limit vertical rotation (120 degrees)
          enablePan={false} // Disable panning for simpler mobile UX
        />
      </Suspense>
    </Canvas>
  );
};
