# MCP Tools Documentation

This document defines the Model Context Protocol (MCP) tools that enable LLMs to control VRM avatars in the Puppet3D WebApp. These tools map to the VRM component architecture and provide a comprehensive API for avatar manipulation.

## Tool Categories Overview

The MCP tools are organized into the following categories:

- **Expression Control**: Facial expressions and emotions
- **Lip Sync**: Mouth movements for speech synchronization
- **Gaze Control**: Eye and head tracking
- **Pose Control**: Body and bone positioning
- **Animation**: Predefined animation playback
- **Physics Control**: Spring bone and physics simulation
- **Material Settings**: Visual appearance and shading
- **Utility**: Information retrieval and state management
- **High-level Composite**: Combined actions for natural behaviors

## 1. Expression Control Tools

These tools interact with the `VRMExpressionControl` component and `VRMExpressionManager`.

### 1.1 `set_expression`

Sets a single facial expression with specified intensity.

**Parameters:**

```json
{
  "expression_name": "string", // happy, angry, sad, surprised, relaxed, neutral, blink, etc.
  "weight": "number", // 0.0-1.0 (0=none, 1=full)
  "duration": "number?" // Optional fade-in duration in seconds
}
```

**Example:**

```json
{
  "name": "set_expression",
  "arguments": {
    "expression_name": "happy",
    "weight": 0.8,
    "duration": 0.5
  }
}
```

### 1.2 `set_multiple_expressions`

Sets multiple expressions simultaneously for blended emotions.

**Parameters:**

```json
{
  "expressions": [
    {
      "name": "string",
      "weight": "number"
    }
  ],
  "duration": "number?"
}
```

### 1.3 `reset_expressions`

Resets all facial expressions to neutral state.

**Parameters:**

```json
{
  "duration": "number?" // Optional fade-out duration in seconds
}
```

### 1.4 `get_available_expressions`

Returns list of available expressions for the current VRM model.

**Returns:**

```json
{
  "preset_expressions": ["string"], // Standard VRM expressions
  "custom_expressions": ["string"] // Model-specific expressions
}
```

## 2. Lip Sync Tools

These tools will interact with the future `VRMLipSyncControl` component for speech synchronization.

### 2.1 `set_viseme`

Sets mouth shape for specific phoneme/viseme.

**Parameters:**

```json
{
  "viseme": "string", // aa, ih, ou, ee, oh
  "weight": "number", // 0.0-1.0
  "duration": "number?" // Transition duration
}
```

### 2.2 `start_lip_sync`

Starts automatic lip sync with audio input.

**Parameters:**

```json
{
  "audio_source": "string", // URL or stream identifier
  "language": "string?" // Language hint for phoneme mapping
}
```

### 2.3 `stop_lip_sync`

Stops active lip sync session.

**Parameters:**

```json
{
  "fade_out": "number?" // Fade-out duration
}
```

## 3. Gaze Control Tools

These tools will interact with the future `VRMLookAtControl` component.

### 3.1 `look_at_position`

Controls avatar gaze to look at specific 3D position.

**Parameters:**

```json
{
  "x": "number", // X coordinate in 3D space
  "y": "number", // Y coordinate in 3D space
  "z": "number", // Z coordinate in 3D space
  "duration": "number?" // Transition duration
}
```

### 3.2 `look_at_direction`

Controls gaze by angle instead of position.

**Parameters:**

```json
{
  "yaw": "number", // Horizontal rotation in degrees (-90 to 90)
  "pitch": "number", // Vertical rotation in degrees (-45 to 45)
  "duration": "number?" // Transition duration
}
```

### 3.3 `reset_gaze`

Returns gaze to forward-looking neutral position.

**Parameters:**

```json
{
  "duration": "number?" // Transition duration
}
```

### 3.4 `set_gaze_behavior`

Sets automatic gaze behavior patterns.

**Parameters:**

```json
{
  "behavior": "string", // "fixed", "tracking", "wandering", "shy"
  "target": "object?", // Optional target for tracking mode
  "intensity": "number?" // Behavior intensity (0.0-1.0)
}
```

## 4. Pose Control Tools

These tools will interact with the future `VRMHumanoidControl` component.

### 4.1 `set_bone_rotation`

Controls individual bone rotation.

**Parameters:**

```json
{
  "bone_name": "string", // VRM humanoid bone name
  "rotation": {
    "x": "number", // X-axis rotation in degrees
    "y": "number", // Y-axis rotation in degrees
    "z": "number" // Z-axis rotation in degrees
  },
  "duration": "number?" // Transition duration
}
```

### 4.2 `set_head_pose`

Simplified head pose control.

**Parameters:**

```json
{
  "tilt": "number", // Head tilt in degrees (-30 to 30)
  "turn": "number", // Head turn in degrees (-45 to 45)
  "nod": "number", // Head nod in degrees (-20 to 20)
  "duration": "number?" // Transition duration
}
```

### 4.3 `set_body_pose`

Sets complete body pose configuration.

**Parameters:**

```json
{
  "pose_name": "string?", // Optional preset pose name
  "bones": [
    {
      // Or custom bone configuration
      "name": "string",
      "rotation": {
        "x": "number",
        "y": "number",
        "z": "number"
      }
    }
  ],
  "duration": "number?"
}
```

### 4.4 `reset_pose`

Resets to T-pose or default pose.

**Parameters:**

```json
{
  "to_t_pose": "boolean", // true for T-pose, false for default
  "duration": "number?" // Transition duration
}
```

## 5. Animation Tools

These tools will interact with the future `VRMAnimationPlayer` component.

### 5.1 `play_animation`

Plays predefined animation clip.

**Parameters:**

```json
{
  "animation_name": "string", // Animation clip name
  "loop": "boolean?", // Whether to loop (default: false)
  "speed": "number?", // Playback speed (default: 1.0)
  "blend_duration": "number?" // Blend-in duration
}
```

### 5.2 `stop_animation`

Stops currently playing animation.

**Parameters:**

```json
{
  "fade_out": "number?" // Fade-out duration
}
```

### 5.3 `pause_animation`

Pauses animation at current frame.

**Parameters:**

```json
{
  "animation_name": "string?" // Specific animation or current
}
```

### 5.4 `set_animation_speed`

Adjusts animation playback speed.

**Parameters:**

```json
{
  "speed": "number", // Speed multiplier
  "animation_name": "string?" // Specific animation or current
}
```

## 6. Physics Control Tools

These tools will interact with the future `VRMSpringBonePhysics` component.

### 6.1 `set_spring_bone_stiffness`

Adjusts spring bone stiffness for physics simulation.

**Parameters:**

```json
{
  "joint_name": "string?", // Specific joint or all
  "stiffness": "number" // 0.0-1.0 (soft to rigid)
}
```

### 6.2 `set_spring_bone_gravity`

Sets gravity effect on spring bones.

**Parameters:**

```json
{
  "gravity": {
    "x": "number",
    "y": "number",
    "z": "number"
  },
  "power": "number?" // Gravity strength multiplier
}
```

### 6.3 `reset_spring_bones`

Resets spring bones to rest position.

**Parameters:**

```json
{
  "immediate": "boolean" // true for instant, false for smooth
}
```

## 7. Material Tools

These tools will interact with the future `VRMToonMaterialSettings` component.

### 7.1 `set_material_property`

Modifies MToon material properties.

**Parameters:**

```json
{
  "property": "string", // Property name
  "value": "any", // Property value
  "material_name": "string?" // Specific material or all
}
```

### 7.2 `set_outline_properties`

Configures toon outline rendering.

**Parameters:**

```json
{
  "width": "number?", // Outline width
  "color": "string?", // Hex color
  "opacity": "number?" // 0.0-1.0
}
```

### 7.3 `set_rim_light`

Configures rim lighting effect.

**Parameters:**

```json
{
  "color": "string", // Hex color
  "intensity": "number", // 0.0-1.0
  "fresnel": "number?" // Fresnel power
}
```

## 8. Utility Tools

General utility tools for avatar state management.

### 8.1 `get_avatar_info`

Returns comprehensive avatar information.

**Returns:**

```json
{
  "model": {
    "name": "string",
    "version": "string",
    "author": "string"
  },
  "capabilities": {
    "expressions": ["string"],
    "bones": ["string"],
    "animations": ["string"],
    "spring_bones": ["string"]
  },
  "current_state": {
    "expressions": {},
    "pose": {},
    "gaze": {},
    "animation": {}
  }
}
```

### 8.2 `reset_avatar`

Resets avatar to default state.

**Parameters:**

```json
{
  "include_pose": "boolean",
  "include_expression": "boolean",
  "include_gaze": "boolean",
  "duration": "number?"
}
```

### 8.3 `capture_avatar_state`

Captures current avatar state snapshot.

**Returns:**

```json
{
  "state_id": "string",
  "timestamp": "number",
  "state_data": {} // Complete state object
}
```

### 8.4 `restore_avatar_state`

Restores previously captured state.

**Parameters:**

```json
{
  "state_id": "string",
  "duration": "number?"
}
```

## 9. High-level Composite Tools

Advanced tools that combine multiple low-level operations for natural behaviors.

### 9.1 `express_emotion`

Natural emotion expression combining face, pose, and gaze.

**Parameters:**

```json
{
  "emotion": "string", // joy, sadness, anger, surprise, fear, disgust, neutral
  "intensity": "number", // 0.0-1.0
  "duration": "number?", // Transition duration
  "include_body": "boolean?" // Include body language
}
```

**Implementation Details:**

- Maps emotions to appropriate expression combinations
- Adjusts gaze direction (e.g., looking down for sadness)
- Modifies head pose (e.g., slight tilt for confusion)
- Optional body language (e.g., shoulders for dejection)

### 9.2 `perform_gesture`

Executes predefined gesture sequences.

**Parameters:**

```json
{
  "gesture": "string", // wave, nod, shake_head, bow, point, shrug
  "target": "object?", // Optional target for directional gestures
  "speed": "number?", // Gesture speed multiplier
  "repeat": "number?" // Number of repetitions
}
```

### 9.3 `react_to_user`

Contextual reaction based on user interaction.

**Parameters:**

```json
{
  "interaction_type": "string", // greeting, question, statement, goodbye
  "sentiment": "string?", // positive, negative, neutral
  "intensity": "number?", // Reaction intensity
  "cultural_context": "string?" // Cultural gesture preferences
}
```

## Implementation Notes

### Component Mapping

Each tool category maps to specific React components:

| Tool Category      | Component               | Store Access                             |
| ------------------ | ----------------------- | ---------------------------------------- |
| Expression Control | VRMExpressionControl    | useVRMStore (expressionManager)          |
| Lip Sync           | VRMLipSyncControl       | useVRMStore (expressionManager)          |
| Gaze Control       | VRMLookAtControl        | useVRMStore (vrmModel.lookAt)            |
| Pose Control       | VRMHumanoidControl      | useVRMStore (vrmModel.humanoid)          |
| Animation          | VRMAnimationPlayer      | useVRMStore (vrmModel)                   |
| Physics            | VRMSpringBonePhysics    | useVRMStore (vrmModel.springBoneManager) |
| Material           | VRMToonMaterialSettings | useVRMStore (vrmModel.materials)         |

### State Management

All tools interact with the Zustand store (`useVRMStore`) which maintains:

- Current VRM model instance
- Expression manager and expression maps
- Component-specific managers (humanoid, lookAt, springBone)

### WebSocket Protocol

Tools are invoked via WebSocket messages:

```json
{
  "type": "tool_call",
  "tool": "tool_name",
  "arguments": {},
  "request_id": "uuid"
}
```

Response format:

```json
{
  "type": "tool_response",
  "request_id": "uuid",
  "success": true,
  "result": {}
}
```

### Error Handling

All tools should handle:

- Invalid parameter values
- Missing VRM model
- Unsupported features for specific models
- Animation/transition conflicts

### Performance Considerations

- Batch multiple expression changes when possible
- Use appropriate transition durations to avoid jarring movements
- Consider frame rate impact of physics simulations
- Cache frequently used animations and expressions

## Future Enhancements

Planned additions to the MCP tool set:

1. **Voice Integration Tools**
   - Text-to-speech synchronization
   - Voice emotion detection
   - Prosody-based expression mapping

2. **Environment Interaction**
   - Object interaction tools
   - Spatial awareness
   - Collision detection

3. **Multi-Avatar Coordination**
   - Synchronized animations
   - Group behaviors
   - Turn-taking in conversations

4. **Advanced Physics**
   - Cloth simulation
   - Hair dynamics
   - Environmental effects (wind, gravity)

5. **Procedural Animation**
   - Breathing simulation
   - Idle animations
   - Micro-expressions
