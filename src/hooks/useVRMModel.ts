import { VRM } from "@pixiv/three-vrm";
import { createContext, useContext } from "react";

interface VRMModelContextType {
  vrmModel: VRM | null;
  loadVRMModel: (url: string) => void;
}

export const VRMModelContext = createContext<VRMModelContextType | undefined>(
  undefined,
);

export const useVRMModel = () => {
  const context = useContext(VRMModelContext);
  if (context === undefined) {
    throw new Error("useVRMModel must be used within a VRMModelProvider");
  }
  return context;
};
