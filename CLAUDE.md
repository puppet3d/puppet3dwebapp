# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Puppet3D WebApp - a React-based web application that serves as both an MCP Host and MCP Client in the Model Context Protocol ecosystem. The app allows LLMs to control 3D VRM avatars through MCP tools, enabling users to upload custom VRM models, render them in the browser with WebXR support (VR/AR), and interact with avatars through natural language.

## Key Technologies

- **React 19.1.0** with **TypeScript 5.8.3**
- **Vite 7.0.4** as build tool
- **Tailwind CSS 4.1.11** for styling (using @tailwindcss/vite plugin)
- **Three.js 0.178.0** for 3D rendering
- **@pixiv/three-vrm 3.4.2** for VRM avatar support
- **@react-three/fiber 9.2.0** and **@react-three/drei 10.6.0** for React 3D integration
- **ESLint** and **Prettier** for code quality
- **Commitlint** with conventional commits
- **Husky** with lint-staged for pre-commit hooks

## Essential Commands

```bash
# Development
npm run dev          # Start development server

# Building
npm run build        # TypeScript check + production build

# Code Quality
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm run typecheck    # TypeScript check

# Testing
npm run test         # Run tests
npm run test:ui      # Run tests with UI
npm run test:coverage # Run tests with coverage report

# Preview
npm run preview      # Preview production build
```

## Architecture Overview

refer to [architecture.md](./docs/architecture.md) for more details.

## Components

refer to [components.md](./docs/components.md) for more details.

### Key Features

1. **VRM Model Management**: Upload and display VRM 3D avatars
2. **MCP Integration**: Host and client functionality for LLM-avatar communication
3. **Avatar Control**: Expression, pose, and animation control through MCP tools
4. **3D Rendering**: Browser-based VRM visualization with Three.js
5. **WebXR Support**: VR/AR capabilities for immersive avatar interaction
6. **Human-in-the-loop**: User approval for LLM requests and tool usage

### TypeScript Configuration

- **Strict mode** is enabled with additional checks
- **Module resolution**: bundler mode
- Separate configs for app (`tsconfig.app.json`) and build tools (`tsconfig.node.json`)

## Development Guidelines

### File Structure

The project uses standard React conventions:

- Components should go in `src/components/`
- Hooks should go in `src/hooks/`
- Documents related to the project should go in `docs/`

### Code Style

- Do not use Type Assertion
- Always check Lint errors and fix them
- Always check TypeScript errors and fix them

### State Management

Consider the need for:

- 3D model/avatar state especially VRM model state refer to [three-vrm](./docs/three-vrm/index.md)

### VRM Avatar System

Documentations refer to [three-vrm](./docs/three-vrm/index.md) for more details.

The application uses **@pixiv/three-vrm** for comprehensive VRM avatar support:

#### Core VRM Components

- **VRMLoaderPlugin**: Loads .vrm files into Three.js scenes
- **VRMCore/VRM**: Main avatar model management
- **VRMHumanoid**: Bone structure and pose control
- **VRMExpressionManager**: Facial expression control (happy, angry, etc.)
- **VRMLookAt**: Eye and head tracking system
- **VRMSpringBone**: Physics simulation for hair and clothing
- **MToonMaterial**: Anime-style toon shading
- **VRMAnimation**: Animation playback system
- **VRMNodeConstraint**: Bone constraint system

#### 3D Rendering Best Practices

- Use Three.js 0.178.0 with React Three Fiber integration
- Implement proper VRM resource disposal
- Handle WebXR API for VR/AR avatar interaction
- Support real-time expression and pose updates via MCP tools

### MCP Protocol Implementation

#### MCP Server (Backend)

- Expose avatar control tools (set_expression, look_at, set_pose, play_animation)
- Handle JSON-RPC 2.0 requests over HTTP
- Implement MCP capabilities declaration (tools, logging)
- Process LLM sampling requests and tool calls

#### MCP Client (Frontend)

- Connect to external LLM APIs (user-provided endpoints)
- Send sampling/createMessage requests to LLMs
- Handle tool_use responses and forward to MCP server
- Implement human-in-the-loop approval interface

#### WebSocket Integration

- Real-time avatar state synchronization
- Bidirectional communication for avatar control
- Handle reconnection and error states
- Message protocol for VRM property updates

## MCP Server Tools

The backend MCP server should expose the following tools for LLM-controlled avatar manipulation:

### Expression Control Tools

#### `set_expression`

Controls facial expressions using VRMExpressionManager.

**Parameters:**

- `expression_name` (string): Expression name (happy, angry, sad, surprised, relaxed, neutral, blink, etc.)
- `weight` (number, 0.0-1.0): Expression intensity (0=none, 1=full)
- `duration` (number, optional): Fade-in duration in seconds

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

#### `reset_expressions`

Resets all facial expressions to neutral state.

**Parameters:**

- `duration` (number, optional): Fade-out duration in seconds

### Gaze Control Tools

#### `look_at_position`

Controls avatar gaze using VRMLookAt system.

**Parameters:**

- `x` (number): X coordinate in 3D space
- `y` (number): Y coordinate in 3D space
- `z` (number): Z coordinate in 3D space
- `duration` (number, optional): Transition duration in seconds

#### `look_at_direction`

Controls gaze by angle instead of position.

**Parameters:**

- `yaw` (number): Horizontal rotation in degrees (-90 to 90)
- `pitch` (number): Vertical rotation in degrees (-45 to 45)
- `duration` (number, optional): Transition duration in seconds

#### `reset_gaze`

Returns gaze to forward-looking neutral position.

### Pose Control Tools

#### `set_pose`

Controls body pose using VRMHumanoid bone system.

**Parameters:**

- `bone_name` (string): Bone name (head, neck, chest, leftUpperArm, etc.)
- `rotation_x` (number): X-axis rotation in degrees
- `rotation_y` (number): Y-axis rotation in degrees
- `rotation_z` (number): Z-axis rotation in degrees
- `duration` (number, optional): Transition duration in seconds

#### `set_head_pose`

Simplified head pose control.

**Parameters:**

- `tilt` (number): Head tilt in degrees (-30 to 30)
- `turn` (number): Head turn in degrees (-45 to 45)
- `nod` (number): Head nod in degrees (-20 to 20)
- `duration` (number, optional): Transition duration in seconds

### Animation Tools

#### `play_animation`

Plays predefined animations using VRMAnimation system.

**Parameters:**

- `animation_name` (string): Name of animation to play
- `loop` (boolean, optional): Whether to loop animation
- `speed` (number, optional): Playback speed multiplier (default: 1.0)

#### `stop_animation`

Stops currently playing animation.

**Parameters:**

- `fade_out` (number, optional): Fade-out duration in seconds

### Utility Tools

#### `get_avatar_info`

Returns information about the currently loaded avatar.

**Returns:**

- Available expressions list
- Available bones list
- Avatar model name and metadata
- Current expression states
- Current pose states

#### `reset_avatar`

Resets avatar to default neutral state.

**Parameters:**

- `duration` (number, optional): Reset transition duration in seconds

### Tool Combinations

#### `express_emotion`

High-level tool that combines expression and pose for natural emotion display.

**Parameters:**

- `emotion` (string): joy, sadness, anger, surprise, fear, disgust, neutral
- `intensity` (number, 0.0-1.0): Emotion intensity
- `duration` (number, optional): Transition duration in seconds

**Implementation:** Automatically selects appropriate expression, gaze direction, and subtle head pose for the specified emotion.
