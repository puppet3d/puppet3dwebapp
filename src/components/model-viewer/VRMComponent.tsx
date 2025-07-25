import type { VRM } from "@pixiv/three-vrm";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect } from "react";
import * as THREE from "three";

interface VRMComponentProps {
  vrm: VRM;
  enableBoneAnimation?: boolean;
}

export const VRMComponent: React.FC<VRMComponentProps> = ({
  vrm,
  enableBoneAnimation = false,
}) => {
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

  useFrame((_, delta) => {
    if (vrm) {
      if (enableBoneAnimation) {
        const s = 0.25 * Math.PI * Math.sin(Math.PI * clock.elapsedTime);

        const neck = vrm.humanoid.getNormalizedBoneNode("neck");
        const leftUpperArm = vrm.humanoid.getNormalizedBoneNode("leftUpperArm");
        const rightUpperArm =
          vrm.humanoid.getNormalizedBoneNode("rightUpperArm");

        if (neck) neck.rotation.y = s;
        if (leftUpperArm) leftUpperArm.rotation.z = s;
        if (rightUpperArm) rightUpperArm.rotation.x = s;
      }

      vrm.update(delta);
    }
  });

  return null;
};
