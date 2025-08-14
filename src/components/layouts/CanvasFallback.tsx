import errorAnimation from "@/assets/lottie/error.json";
import loadingAnimation from "@/assets/lottie/loading.json";
import Lottie from "lottie-react";

type fallbackType = "error" | "loading";

interface CanvasFallbackProps {
  type: fallbackType;
}

export const CanvasFallback = ({ type }: CanvasFallbackProps) => {
  return (
    <Lottie
      animationData={type === "loading" ? loadingAnimation : errorAnimation}
      loop
    />
  );
};
