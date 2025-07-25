// VRM standard expressions mapping
// This maps common expression names to VRM standard expression names
export const VRM_EXPRESSION_MAPPING: Record<string, string> = {
  // Basic emotions
  'happy': 'happy',
  'angry': 'angry', 
  'sad': 'sad',
  'relaxed': 'relaxed',
  'surprised': 'surprised',
  'neutral': 'neutral',
  
  // Mouth shapes (visemes)
  'aa': 'aa',
  'ih': 'ih', 
  'ou': 'ou',
  'ee': 'ee',
  'oh': 'oh',
  
  // Eye movements
  'blink': 'blink',
  'blinkLeft': 'blinkLeft',
  'blinkRight': 'blinkRight',
  'lookUp': 'lookUp',
  'lookDown': 'lookDown', 
  'lookLeft': 'lookLeft',
  'lookRight': 'lookRight',
};

// Common VRM expression names that might be used
export const COMMON_VRM_EXPRESSIONS = [
  'neutral', 'happy', 'angry', 'sad', 'relaxed', 'surprised',
  'aa', 'ih', 'ou', 'ee', 'oh', 'blink', 'blinkLeft', 'blinkRight',
  'lookUp', 'lookDown', 'lookLeft', 'lookRight', 'wink', 'winkLeft', 'winkRight'
];

export function findBestExpressionMatch(
  targetExpression: string, 
  availableExpressions: string[]
): string | null {
  // Direct match
  if (availableExpressions.includes(targetExpression)) {
    return targetExpression;
  }
  
  // Try mapped expression  
  const mappedExpression = VRM_EXPRESSION_MAPPING[targetExpression];
  if (mappedExpression && availableExpressions.includes(mappedExpression)) {
    return mappedExpression;
  }
  
  // Try case-insensitive match
  const lowerTarget = targetExpression.toLowerCase();
  for (const expr of availableExpressions) {
    if (expr.toLowerCase() === lowerTarget) {
      return expr;
    }
  }
  
  // Try partial match
  for (const expr of availableExpressions) {
    if (expr.toLowerCase().includes(lowerTarget) || lowerTarget.includes(expr.toLowerCase())) {
      return expr;
    }
  }
  
  return null;
}