import { useVRMStore } from "@/store/store";
import { disposeVRM } from "@/util/vrm-util";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, type ReactNode } from "react";

interface VRMModelLoaderProps {
  url: string;
  children?: ReactNode;
}

export const VRMModelLoader: React.FC<VRMModelLoaderProps> = ({
  url,
  children,
}) => {
  const { scene } = useThree();
  const vrmModel = useVRMStore((state) => state.vrmModel);
  const loadVRM = useVRMStore((state) => state.loadVRM);

  useFrame((_, delta) => {
    if (vrmModel) {
      vrmModel.update(delta);
    }
  });

  useEffect(() => {
    loadVRM(url, scene)
      .then((vrm) => {
        console.debug(vrm);
      })
      .catch((error) => {
        console.error(error);
      });

    return () => {
      if (vrmModel) {
        disposeVRM(vrmModel);
      }
    };
  }, [url, loadVRM, scene]);

  return <>{children}</>;
};
