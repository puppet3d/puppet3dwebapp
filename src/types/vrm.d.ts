interface VRMExpression {
  name: string;
  value: number;
}

type VRMExpressionPreset =
  | "happy"
  | "angry"
  | "sad"
  | "relaxed"
  | "surprised"
  | "aa"
  | "ih"
  | "ou"
  | "ee"
  | "oh"
  | "blink"
  | "blinkLeft"
  | "blinkRight"
  | "lookUp"
  | "lookDown"
  | "lookLeft"
  | "lookRight"
  | "neutral";
