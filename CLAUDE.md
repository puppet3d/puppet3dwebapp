# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Puppet3D WebApp - a React-based web application that allows LLMs to control 3D avatars through the MCP (Model Context Protocol) Server. The app enables users to upload custom 3D models, render them in the browser(supports VR/AR by WebXR).

## Key Technologies

- **React 19.1.0** with **TypeScript 5.8.3**
- **Vite 7.0.4** as build tool
- **Tailwind CSS 4.1.11** for styling (using @tailwindcss/vite plugin)
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

# Preview
npm run preview      # Preview production build
```

## Architecture Overview

The application follows this communication flow:

```
LLM → Puppet3D MCP Server → API Server → WebApp (WebSocket)
```

### Key Features to Implement:

1. **3D Model Management**: Upload and display custom 3D models
2. **WebSocket Integration**: Real-time communication with API server
3. **3D Rendering**: Browser-based 3D model visualization
4. **WebXR Support**: VR/AR capabilities
5. **Cloud Features**: Save, chat, and share avatars

### TypeScript Configuration

- **Strict mode** is enabled with additional checks
- **Module resolution**: bundler mode
- Separate configs for app (`tsconfig.app.json`) and build tools (`tsconfig.node.json`)

## Development Guidelines

### File Structure

The project uses standard React conventions:

- Components should go in `src/components/`
- 3D-related utilities in `src/utils/` or `src/lib/`
- WebSocket logic in `src/services/`
- Type definitions in `src/types/`

### Code Style

- ESLint and Prettier are configured and enforced via pre-commit hooks
- Use conventional commits (enforced by commitlint)
- TypeScript strict mode requires explicit typing

### State Management

Consider the need for:

- WebSocket connection state
- 3D model/avatar state
- User interaction state
- Cloud service authentication state

### 3D Rendering Considerations

When implementing 3D features:

- Consider using Three.js or similar WebGL library
- Plan for model loading (GLTF, FBX, etc.)
- Implement proper disposal of 3D resources
- Handle WebXR API for VR/AR support

### WebSocket Implementation

- Establish connection to API server
- Handle reconnection logic
- Implement message protocol for avatar control
- Consider using Socket.io or native WebSocket API
