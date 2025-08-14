import { VRMModelContext } from "@/hooks/useVRMModel";
import { VRM, VRMLoaderPlugin } from "@pixiv/three-vrm";
import { useFrame, useThree } from "@react-three/fiber";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/Addons.js";

interface VRMModelLoaderProps {
  url: string;
  children?: ReactNode;
  onError?: (error: Error) => void;
}

export const VRMModelLoader: React.FC<VRMModelLoaderProps> = ({
  url,
  children,
  onError,
}) => {
  const { scene } = useThree();
  const [vrmModel, setVRMModel] = useState<VRM | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const vrmRef = useRef<VRM | null>(null);

  useFrame((_, delta) => {
    if (vrmModel) {
      vrmModel.update(delta);
    }
  });

  const disposeVRM = (vrm: VRM) => {
    // Remove from scene
    if (vrm.scene.parent) {
      vrm.scene.parent.remove(vrm.scene);
    }

    // Reset SpringBoneManager if exists
    if (vrm.springBoneManager) {
      vrm.springBoneManager.reset();
    }

    // Dispose all geometries, materials, and textures
    vrm.scene.traverse((object) => {
      if ((object as THREE.Mesh).isMesh) {
        const mesh = object as THREE.Mesh;

        // Dispose geometry
        if (mesh.geometry) {
          mesh.geometry.dispose();
        }

        // Dispose materials and their textures
        if (mesh.material) {
          const materials = Array.isArray(mesh.material)
            ? mesh.material
            : [mesh.material];

          materials.forEach((material) => {
            // Dispose all textures in the material
            Object.keys(material).forEach((property) => {
              const value = material[property as keyof typeof material];
              if (value && typeof value === "object" && "isTexture" in value) {
                (value as THREE.Texture).dispose();
              }
            });
            material.dispose();
          });
        }
      }
    });

    // Dispose VRM-specific textures from materials array
    if (vrm.materials) {
      vrm.materials.forEach((material) => {
        Object.keys(material).forEach((property) => {
          const value = material[property as keyof typeof material];
          if (value && typeof value === "object" && "isTexture" in value) {
            (value as THREE.Texture).dispose();
          }
        });
      });
    }
  };

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
  };

  const loadVRMFromUrl = useCallback(
    (modelUrl: string) => {
      // Clean up previous model
      if (vrmRef.current) {
        disposeVRM(vrmRef.current);
        vrmRef.current = null;
      }
      setVRMModel(null);

      const loader = new GLTFLoader();
      loader.register((parser) => {
        return new VRMLoaderPlugin(parser);
      });

      loader.load(
        modelUrl,
        (gltf) => {
          const vrm: VRM = gltf.userData.vrm;

          // Normalize model size and position
          normalizeVRMModel(vrm);

          vrmRef.current = vrm;
          setVRMModel(vrm);
          console.debug("vrm object", vrm);
          console.debug("vrm metadata", vrm.meta);
          scene.add(vrm.scene);
        },
        (error) => {
          console.error(error);
          if (error instanceof Error) {
            setError(error);
            onError?.(error);
          } else {
            return;
          }
        },
      );
    },
    [scene, onError],
  );

  const loadVRMModel = useCallback(
    async (url: string) => {
      loadVRMFromUrl(url);
    },
    [loadVRMFromUrl],
  );

  useEffect(() => {
    loadVRMFromUrl(url);

    return () => {
      // Cleanup on unmount
      if (vrmRef.current) {
        disposeVRM(vrmRef.current);
        vrmRef.current = null;
      }
    };
  }, [url, loadVRMFromUrl]);

  if (error) {
    throw error;
  }

  return (
    <VRMModelContext.Provider value={{ vrmModel, loadVRMModel }}>
      {children}
    </VRMModelContext.Provider>
  );
};
