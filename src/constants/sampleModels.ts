export const SAMPLE_VRM_MODELS = {
  CONSTRAINT_TWIST_SAMPLE: {
    name: 'VRM Constraint Twist Sample',
    url: '/VRM1_Constraint_Twist_Sample.vrm',
    description: 'Official Pixiv three-vrm sample model with bone animation support',
    enableBoneAnimation: true,
  },
} as const;

export const DEFAULT_SAMPLE_MODEL = SAMPLE_VRM_MODELS.CONSTRAINT_TWIST_SAMPLE;