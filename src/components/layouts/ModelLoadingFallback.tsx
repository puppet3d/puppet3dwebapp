import loadingAnimation from "@/assets/lottie/loading.json";
import Lottie from "lottie-react";

export const ModelLoadingFallback = () => {
  return <Lottie animationData={loadingAnimation} loop />;
};
