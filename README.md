# AI Image Generation App

A React Native/Expo application for generating AI images with advanced parameters and history management.

## Project Structure

The project has been reorganized for better maintainability and logical separation of concerns:

```
MyProject/
├── src/                          # Main source code directory
│   ├── components/               # React components
│   │   ├── ui/                   # Reusable UI components
│   │   │   ├── ArrowButton.tsx   # Generic arrow button component
│   │   │   ├── ImageViewer.tsx   # Image display component
│   │   │   ├── PromptInput.tsx   # Text input for prompts
│   │   │   └── index.ts          # UI components exports
│   │   ├── features/             # Feature-specific components
│   │   │   ├── NavigationHeader.tsx      # App navigation
│   │   │   ├── Settings.tsx              # Settings screen
│   │   │   ├── ImageHistory.tsx          # Image gallery
│   │   │   ├── SidePanel.tsx             # Side panel with controls
│   │   │   ├── CoreParametersSection.tsx # Core generation parameters
│   │   │   ├── SamplingSection.tsx       # Sampling parameters
│   │   │   └── index.ts                  # Feature components exports
│   │   └── index.ts              # Main components exports
│   ├── hooks/                    # Custom React hooks
│   │   ├── useImageGeneration.ts # Image generation logic
│   │   ├── useImageHistory.ts    # Image history management
│   │   ├── useImageZoom.ts       # Image zoom functionality
│   │   ├── useSidePanel.ts       # Side panel state management
│   │   └── index.ts              # Hooks exports
│   ├── services/                 # External services and APIs
│   │   └── api.ts                # API service for image generation
│   ├── types/                    # TypeScript type definitions
│   │   └── index.ts              # All app types and interfaces
│   ├── utils/                    # Utility functions
│   │   └── imageUtils.ts         # Image-related utilities
│   ├── constants/                # App constants and configuration
│   │   └── config.ts             # Configuration constants
│   └── screens/                  # Screen components
│       └── HomeScreen.tsx        # Main application screen
├── app/                          # Expo Router structure
│   └── (tabs)/
│       └── index.tsx             # Entry point (imports HomeScreen)
├── assets/                       # Static assets
│   ├── fonts/                    # Custom fonts
│   └── images/                   # App images and icons
├── scripts/                      # Build and utility scripts
│   └── reset-project.js          # Project reset script
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
└── README.md                     # This file
```

## Key Features

### Image Generation
- AI-powered image generation with customizable parameters
- Support for multiple samplers and schedulers
- Configurable steps and CFG scale
- Queue-based generation system

### Image Management
- Automatic saving of generated images
- Image history with thumbnails
- Full-screen image viewing
- Image metadata storage (prompt, timestamp)

### User Interface
- Modern, responsive design
- Collapsible side panel for parameters
- Tab-based navigation (Main, History, Settings)
- Real-time generation status

### Settings
- Configurable generation parameters
- History management options
- App preferences
- Data export functionality

## Component Organization

### UI Components (`src/components/ui/`)
Reusable, generic components that can be used across different features:
- **ArrowButton**: Generic directional button
- **ImageViewer**: Image display with zoom capabilities
- **PromptInput**: Text input with generation controls

### Feature Components (`src/components/features/`)
Components specific to app features and business logic:
- **NavigationHeader**: App navigation with tab switching
- **Settings**: Settings screen with various options
- **ImageHistory**: Image gallery with history management
- **SidePanel**: Collapsible panel for generation parameters
- **CoreParametersSection**: Steps and CFG scale controls
- **SamplingSection**: Sampler and scheduler selection

## Hooks Organization

Custom React hooks for state management and business logic:
- **useImageGeneration**: Manages image generation state and API calls
- **useImageHistory**: Handles image history storage and retrieval
- **useImageZoom**: Provides image zoom and pan functionality
- **useSidePanel**: Manages side panel state and animations

## Development

### Prerequisites
- Node.js (v16 or higher)
- Expo CLI
- React Native development environment

### Installation
```bash
npm install
```

### Running the App
```bash
npm start
```

### Available Scripts
- `npm start`: Start the Expo development server
- `npm run android`: Run on Android device/emulator
- `npm run ios`: Run on iOS device/simulator
- `npm run web`: Run in web browser
- `npm run reset-project`: Reset project to initial state

## Architecture Benefits

This reorganization provides several benefits:

1. **Logical Separation**: Components are grouped by their purpose (UI vs features)
2. **Maintainability**: Related code is co-located, making it easier to find and modify
3. **Reusability**: UI components are separated and can be easily reused
4. **Scalability**: New features can be added without affecting existing code
5. **Type Safety**: Centralized type definitions ensure consistency
6. **Clear Dependencies**: Import paths clearly show component relationships

## Future Enhancements

The new structure makes it easy to add:
- New image generation models
- Additional UI themes
- Plugin system for custom components
- Advanced image editing features
- Social sharing capabilities
- Cloud storage integration
