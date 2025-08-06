import { VRM, VRMLoaderPlugin } from "@pixiv/three-vrm";
import { useFrame, useThree } from "@react-three/fiber";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import { VRMModelContext } from "../../hooks/useVRMModel";

interface VRMModelLoaderProps {
  url: string;
  children?: ReactNode;
}

/**
 * @todo url 파라미터 추가, 현재는 테스트용 모델 사용
 */
export const VRMModelLoader: React.FC<VRMModelLoaderProps> = ({ children }) => {
  const { scene } = useThree();
  const [vrmModel, setVRMModel] = useState<VRM | null>(null);

  useFrame((_, delta) => {
    if (vrmModel) {
      vrmModel.update(delta);
    }
  });

  const normalizeVRMModel = (vrm: VRM) => {
    // Calculate bounding box to get actual size
    const box = new THREE.Box3().setFromObject(vrm.scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    // Target height: 1.6m (standard human height in meters)
    const targetHeight = 1.6;
    const scale = targetHeight / size.y;

    // Apply scale
    vrm.scene.scale.multiplyScalar(scale);

    // Position model so feet (bottom of bounding box) are at Y=0
    vrm.scene.position.y = -box.min.y * scale;
    // Center X and Z
    vrm.scene.position.x = -center.x * scale;
    vrm.scene.position.z = -center.z * scale;

    console.debug("Model normalized:", {
      originalHeight: size.y,
      scale: scale,
      newHeight: targetHeight,
      minY: box.min.y,
      maxY: box.max.y,
      centerY: center.y,
      finalPosition: vrm.scene.position,
    });
  };

  const loadVRMModel = useCallback(
    async (url: string) => {
      if (vrmModel) {
        scene.remove(vrmModel.scene);
      }

      setVRMModel(null);
      const loader = new GLTFLoader();
      loader.register((parser) => {
        return new VRMLoaderPlugin(parser);
      });
      loader.load(url, (gltf) => {
        const vrm: VRM = gltf.userData.vrm;

        // Normalize model size and position
        normalizeVRMModel(vrm);

        setVRMModel(vrm);
        console.debug("vrm object", vrm);
        console.debug("vrm metadata", vrm.meta);
        scene.add(vrm.scene);
      });
    },
    [scene, vrmModel],
  );

  useEffect(() => {
    const loader = new GLTFLoader();
    loader.register((parser) => {
      return new VRMLoaderPlugin(parser);
    });
    loader.load("/VRM1_Constraint_Twist_Sample.vrm", (gltf) => {
      const vrm: VRM = gltf.userData.vrm;

      // Normalize model size and position
      normalizeVRMModel(vrm);

      setVRMModel(vrm);
      console.debug("vrm object", vrm);
      console.debug("vrm metadata", vrm.meta);
      scene.add(vrm.scene);
    });

    return () => {
      if (vrmModel) {
        scene.remove(vrmModel.scene);
      }
    };
  }, []);

  return (
    <VRMModelContext.Provider value={{ vrmModel, loadVRMModel }}>
      {children}
    </VRMModelContext.Provider>
  );
};