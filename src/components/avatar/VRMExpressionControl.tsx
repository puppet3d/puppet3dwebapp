import { useVRMStore } from "@/store/store";
import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";

interface VRMExpressionControlProps {
  autoAnimation?: boolean;
  blinkInterval?: number;
}

export const VRMExpressionControl: React.FC<VRMExpressionControlProps> = ({
  autoAnimation = true,
  blinkInterval = 4,
}) => {
  const expressionManager = useVRMStore((state) => state.expressionManager);
  const expressionMap = useVRMStore((state) => state.expressionMap);
  const timeRef = useRef(0);
  const nextBlinkRef = useRef(0);
  const nextRandomExpressionRef = useRef(0);
  const [isBlinking, setIsBlinking] = useState(false);
  const [currentRandomExpression, setCurrentRandomExpression] = useState<
    string | null
  >(null);

  // Test mode settings (only in development)
  const isTestMode = import.meta.env.MODE === "development";
  const randomExpressionInterval = 3; // seconds

  // Auto animations (blink and random expressions)
  useFrame((_, delta) => {
    if (!expressionManager || !expressionMap || !autoAnimation) return;

    timeRef.current += delta;

    // Blink logic - only if blink expression exists
    const blinkExpression = expressionMap["blink"];
    if (blinkExpression) {
      if (timeRef.current >= nextBlinkRef.current) {
        setIsBlinking(true);
        nextBlinkRef.current =
          timeRef.current + blinkInterval + Math.random() * 2;
      }

      // Apply blink animation
      if (isBlinking) {
        const blinkValue = Math.sin(
          (timeRef.current - nextBlinkRef.current + blinkInterval) * 10,
        );
        if (blinkValue > 0) {
          expressionManager.setValue("blink", blinkValue);
        } else {
          expressionManager.setValue("blink", 0);
          setIsBlinking(false);
        }
      }
    }

    // Random expression logic (only in test mode)
    if (isTestMode && expressionMap && Object.keys(expressionMap).length > 0) {
      if (timeRef.current >= nextRandomExpressionRef.current) {
        // Reset current random expression
        if (currentRandomExpression) {
          expressionManager.setValue(currentRandomExpression, 0);
        }

        // Select a new random expression (excluding blink expressions)
        const emotionExpressionNames = Object.keys(expressionMap).filter(
          (name) =>
            !name.includes("blink") &&
            !name.includes("look") &&
            name !== "neutral" &&
            name !== "aa" &&
            name !== "ih" &&
            name !== "ou" &&
            name !== "ee" &&
            name !== "oh",
        );

        if (emotionExpressionNames.length > 0) {
          const randomExpressionName =
            emotionExpressionNames[
              Math.floor(Math.random() * emotionExpressionNames.length)
            ];
          const randomIntensity = 0.3 + Math.random() * 0.7; // 0.3 to 1.0

          expressionManager.setValue(randomExpressionName, randomIntensity);
          setCurrentRandomExpression(randomExpressionName);
        }

        // Set next random expression time
        nextRandomExpressionRef.current =
          timeRef.current + randomExpressionInterval + Math.random() * 2;
      }
    }
  });

  return null;
};
