import { useVRMModel } from "@/hooks/useVRMModel";
import { VRMExpression, VRMExpressionPresetName } from "@pixiv/three-vrm";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";

interface ExpressionInfo {
  name: string;
  type: "preset" | "custom";
  expression: VRMExpression;
}

interface ExpressionPreset {
  name: string;
  value: number;
}

interface VRMExpressionControlProps {
  autoAnimation?: boolean;
  blinkInterval?: number;
  expressions?: ExpressionPreset[];
  onExpressionsLoaded?: (expressions: ExpressionInfo[]) => void;
}

export const VRMExpressionControl: React.FC<VRMExpressionControlProps> = ({
  autoAnimation = true,
  blinkInterval = 4,
  expressions = [],
  onExpressionsLoaded,
}) => {
  const { vrmModel } = useVRMModel();
  const timeRef = useRef(0);
  const nextBlinkRef = useRef(0);
  const nextRandomExpressionRef = useRef(0);
  const [isBlinking, setIsBlinking] = useState(false);
  const [availableExpressions, setAvailableExpressions] = useState<ExpressionInfo[]>([]);
  const [currentRandomExpression, setCurrentRandomExpression] = useState<string | null>(null);

  // Test mode settings (only in development)
  const isTestMode = import.meta.env.MODE === 'development';
  const randomExpressionInterval = 3; // seconds

  // Query available expressions from the VRM model
  useEffect(() => {
    if (!vrmModel?.expressionManager) return;

    const expressionList: ExpressionInfo[] = [];
    
    // Get preset expressions
    const presetNames: VRMExpressionPresetName[] = [
      "happy", "angry", "sad", "relaxed", "surprised",
      "aa", "ih", "ou", "ee", "oh",
      "blink", "blinkLeft", "blinkRight",
      "lookUp", "lookDown", "lookLeft", "lookRight",
      "neutral"
    ];
    
    console.log("🎭 VRM Expression Manager Info:");
    console.log("Total expressions:", vrmModel.expressionManager.expressions?.length || 0);
    
    presetNames.forEach(name => {
      const expression = vrmModel.expressionManager?.getExpression(name);
      if (expression) {
        expressionList.push({
          name,
          type: "preset",
          expression
        });
        console.log(`✅ Preset expression found: ${name}`);
      } else {
        console.log(`❌ Preset expression NOT found: ${name}`);
      }
    });

    // Get custom expressions by iterating through all expression names
    const allExpressionNames = vrmModel.expressionManager?.expressions?.map(exp => exp.expressionName) || [];
    console.log("All expression names:", allExpressionNames);
    
    allExpressionNames.forEach((name: string) => {
      // Skip preset names as they're already added
      if (!presetNames.includes(name as VRMExpressionPresetName)) {
        const expression = vrmModel.expressionManager?.getExpression(name);
        if (expression) {
          expressionList.push({
            name,
            type: "custom",
            expression
          });
          console.log(`✅ Custom expression found: ${name}`);
        }
      }
    });

    setAvailableExpressions(expressionList);
    console.log(`🎭 Total available expressions: ${expressionList.length}`);
    console.log("Available expressions:", expressionList.map(exp => `${exp.name} (${exp.type})`));
    
    // Notify parent component about available expressions
    if (onExpressionsLoaded) {
      onExpressionsLoaded(expressionList);
    }
  }, [vrmModel, onExpressionsLoaded]);

  // Apply expression presets
  useEffect(() => {
    if (!vrmModel?.expressionManager) return;

    expressions.forEach(({ name, value }) => {
      // Check if the expression exists before setting
      const expression = vrmModel.expressionManager?.getExpression(name);
      if (expression) {
        vrmModel.expressionManager?.setValue(name, value);
      } else {
        console.warn(`Expression "${name}" not found in VRM model`);
      }
    });

    // Cleanup function to reset expressions
    return () => {
      if (!vrmModel?.expressionManager) return;
      
      expressions.forEach(({ name }) => {
        const expression = vrmModel.expressionManager?.getExpression(name);
        if (expression) {
          vrmModel.expressionManager?.setValue(name, 0);
        }
      });
    };
  }, [vrmModel, expressions]);

  // Auto animations (blink and random expressions)
  useFrame((_, delta) => {
    if (!vrmModel?.expressionManager || !autoAnimation) return;

    timeRef.current += delta;

    // Blink logic - only if blink expression exists
    const blinkExpression = vrmModel.expressionManager.getExpression("blink");
    if (blinkExpression) {
      if (timeRef.current >= nextBlinkRef.current) {
        setIsBlinking(true);
        nextBlinkRef.current = timeRef.current + blinkInterval + Math.random() * 2;
      }

      // Apply blink animation
      if (isBlinking) {
        const blinkValue = Math.sin((timeRef.current - nextBlinkRef.current + blinkInterval) * 10);
        if (blinkValue > 0) {
          vrmModel.expressionManager.setValue("blink", blinkValue);
        } else {
          vrmModel.expressionManager.setValue("blink", 0);
          setIsBlinking(false);
        }
      }
    }

    // Random expression logic (only in test mode)
    if (isTestMode && availableExpressions.length > 0) {
      if (timeRef.current >= nextRandomExpressionRef.current) {
        // Reset current random expression
        if (currentRandomExpression) {
          vrmModel.expressionManager.setValue(currentRandomExpression, 0);
        }

        // Select a new random expression (excluding blink expressions)
        const emotionExpressions = availableExpressions.filter(
          exp => !exp.name.includes("blink") && 
                 !exp.name.includes("look") && 
                 exp.name !== "neutral" &&
                 exp.name !== "aa" && exp.name !== "ih" && exp.name !== "ou" && exp.name !== "ee" && exp.name !== "oh"
        );

        if (emotionExpressions.length > 0) {
          const randomExpression = emotionExpressions[Math.floor(Math.random() * emotionExpressions.length)];
          const randomIntensity = 0.3 + Math.random() * 0.7; // 0.3 to 1.0
          
          console.log(`🎲 Random expression: ${randomExpression.name} (intensity: ${randomIntensity.toFixed(2)})`);
          
          vrmModel.expressionManager.setValue(randomExpression.name, randomIntensity);
          setCurrentRandomExpression(randomExpression.name);
        }

        // Set next random expression time
        nextRandomExpressionRef.current = timeRef.current + randomExpressionInterval + Math.random() * 2;
      }
    }
  });

  // Set expression method with validation (exposed for potential future use)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const setExpression = (name: string, value: number) => {
    if (!vrmModel?.expressionManager) return;
    
    const expression = vrmModel.expressionManager.getExpression(name);
    if (!expression) {
      console.warn(`Expression "${name}" not available in this VRM model`);
      return;
    }
    
    const clampedValue = Math.max(0, Math.min(1, value));
    vrmModel.expressionManager.setValue(name, clampedValue);
  };

  // Reset all expressions (exposed for potential future use)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const resetExpressions = () => {
    if (!vrmModel?.expressionManager) return;

    // Reset all available expressions
    availableExpressions.forEach(({ name }) => {
      vrmModel.expressionManager?.setValue(name, 0);
    });
  };

  // Emotion helper method with validation (exposed for potential future use)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const setEmotion = (emotion: "joy" | "anger" | "sadness" | "surprise" | "neutral", intensity = 1) => {
    if (!vrmModel?.expressionManager) return;

    const emotionMap = {
      joy: "happy",
      anger: "angry",
      sadness: "sad",
      surprise: "surprised",
      neutral: "relaxed"
    };

    // Reset all emotion expressions that exist
    Object.values(emotionMap).forEach(name => {
      const expression = vrmModel.expressionManager?.getExpression(name);
      if (expression) {
        vrmModel.expressionManager?.setValue(name, 0);
      }
    });

    // Apply new emotion if it exists
    const targetExpression = emotionMap[emotion];
    const expression = vrmModel.expressionManager.getExpression(targetExpression);
    
    if (expression) {
      const clampedIntensity = Math.max(0, Math.min(1, intensity));
      const finalIntensity = emotion === "neutral" ? clampedIntensity * 0.3 : clampedIntensity;
      vrmModel.expressionManager.setValue(targetExpression, finalIntensity);
    } else {
      console.warn(`Emotion expression "${targetExpression}" not available in this VRM model`);
    }
  };

  // Expose methods via ref if needed
  useEffect(() => {
    // You can expose these methods through a ref or context if needed
    // For now, they're internal to the component
  }, []);

  return null; // This component doesn't render anything
};