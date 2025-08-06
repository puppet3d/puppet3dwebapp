import { VRM, VRMLoaderPlugin } from "@pixiv/three-vrm";
import { useFrame, useThree } from "@react-three/fiber";
import { useCallback, useEffect, useState, type ReactNode } from "react";
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
        const vrm = gltf.userData.vrm;
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
      const vrm = gltf.userData.vrm;
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