# SwarmUI Mobile Connector

A React Native/Expo application to connect to a desktop run SwarmUI.

## Project Structure

```
SwarmUI-MobileConnector/
├── app/                          # Expo Router structure
│   └── (tabs)/
│       ├── _layout.tsx           # Tab layout configuration
│       └── index.tsx             # Main screen entry point
├── src/                          # Main source code directory
│   ├── components/               # React components
│   │   ├── ui/                   # Reusable UI components
│   │   │   ├── ArrowButton.tsx   # Generic arrow button component
│   │   │   ├── ImageViewer.tsx   # Image display with zoom
│   │   │   ├── PromptInput.tsx   # Text input for prompts
│   │   │   └── index.ts          # UI components exports
│   │   ├── features/             # Feature-specific components
│   │   │   ├── NavigationHeader.tsx      # App navigation
│   │   │   ├── Settings.tsx              # Settings screen
│   │   │   ├── ImageHistory.tsx          # Image gallery
│   │   │   ├── ParametersPanel.tsx       # Side panel with controls
│   │   │   ├── CoreParametersSection.tsx # Core generation parameters
│   │   │   ├── SamplingSection.tsx       # Sampling parameters
│   │   │   └── index.ts                  # Feature components exports
│   │   └── index.ts              # Main components exports
│   ├── hooks/                    # Custom React hooks
│   │   ├── useImageGeneration.ts # Image generation logic
│   │   ├── useImageHistory.ts    # Image history management
│   │   ├── useImageZoom.ts       # Image zoom functionality
│   │   ├── useSidePanel.ts       # Side panel state management
│   │   ├── useTheme.tsx          # Theme management
│   │   └── index.ts              # Hooks exports
│   ├── services/                 # External services and APIs
│   │   └── api.ts                # API service for image generation
│   ├── types/                    # TypeScript type definitions
│   │   ├── ArrowButtonProps.ts   # Component prop types
│   │   ├── GenerationParams.ts   # Generation parameters
│   │   ├── GenerationResponse.ts # API response types
│   │   ├── HistoryImage.ts       # Image history types
│   │   ├── ImageViewerProps.ts   # Image viewer props
│   │   ├── PromptInputProps.ts   # Prompt input props
│   │   ├── SessionResponse.ts    # Session management types
│   │   ├── SettingsProps.ts      # Settings component props
│   │   ├── SidePanelProps.ts     # Side panel props
│   │   └── index.ts              # All app types and interfaces
│   ├── utils/                    # Utility functions
│   │   └── imageUtils.ts         # Image-related utilities
│   ├── constants/                # App constants and configuration
│   │   ├── colors.ts             # Color definitions
│   │   └── config.ts             # Configuration constants
│   ├── contexts/                 # React contexts
│   │   ├── SessionContext.tsx    # Session management context
│   │   └── index.ts              # Context exports
│   ├── styles/                   # Component styles
│   │   ├── CoreParametersSectionStyles.ts
│   │   ├── ImageHistoryStyles.ts
│   │   ├── SamplingSectionStyles.ts
│   │   └── SidePanelStyles.ts
│   └── screens/                  # Screen components
│       └── HomeScreen.tsx        # Main application screen
├── assets/                       # Static assets
│   ├── fonts/                    # Custom fonts
│   │   └── SpaceMono-Regular.ttf
│   └── images/                   # App images and icons
├── scripts/                      # Build and utility scripts
│   └── reset-project.js          # Project reset script
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
├── eslint.config.js              # ESLint configuration
├── app.json                      # Expo configuration
└── README.md                     # This file
```

## Installation

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Expo CLI** (`npm install -g @expo/cli`)
- **React Native development environment** (for native development)

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SwarmUI-MobileConnector
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment variables**
   ```bash
   # Create a .env file in the root directory
   cp .env.example .env
   # Edit .env with your API keys and configuration
   ```

4. **Start the development server**
   ```bash
   npm start
   # or
   yarn start
   ```

## Running the App

### Development Mode
```bash
npm start
```

### Platform-Specific Commands
```bash
# Android
npm run android

# iOS
npm run ios

# Web
npm run web
```

### Available Scripts
- `npm start` - Start the Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS device/simulator
- `npm run web` - Run in web browser
- `npm run reset-project` - Reset project to initial state
- `npm run lint` - Run ESLint for code quality
- `npm run type-check` - Run TypeScript type checking

## Architecture

### Component Organization

#### UI Components (`src/components/ui/`)
Reusable, generic components that can be used across different features:
- **ArrowButton**: Generic directional button with customizable styling
- **ImageViewer**: Image display with zoom and pan capabilities
- **PromptInput**: Text input with generation controls and validation

#### Feature Components (`src/components/features/`)
Components specific to app features and business logic:
- **NavigationHeader**: App navigation with tab switching and status indicators
- **Settings**: Settings screen with various configuration options
- **ImageHistory**: Image gallery with history management and filtering
- **ParametersPanel**: Collapsible panel for generation parameters
- **CoreParametersSection**: Steps and CFG scale controls
- **SamplingSection**: Sampler and scheduler selection

### Hooks Organization

Custom React hooks for state management and business logic:
- **useImageGeneration**: Manages image generation state and API calls
- **useImageHistory**: Handles image history storage and retrieval
- **useImageZoom**: Provides image zoom and pan functionality
- **useSidePanel**: Manages side panel state and animations
- **useTheme**: Manages theme switching and preferences

### State Management

The app uses React Context for global state management:
- **SessionContext**: Manages user sessions and authentication
- **Local state**: Component-specific state using React hooks

## Configuration

### Environment Variables
Create a `.env` file in the root directory with the following variables:

```env
# API Configuration
API_BASE_URL=your_api_base_url
API_KEY=your_api_key

# App Configuration
APP_NAME=SwarmUI Mobile Connector
APP_VERSION=1.0.0

# Feature Flags
ENABLE_ANALYTICS=false
ENABLE_CRASH_REPORTING=false
```

### API Configuration
The app is configured to work with AI image generation APIs. Update the API configuration in `src/services/api.ts` to match your backend service.

## Development

### Code Style
- **TypeScript**: Strict type checking enabled
- **ESLint**: Code quality and style enforcement
- **Prettier**: Code formatting (configured via ESLint)

### Testing
```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Building for Production

#### Android
```bash
# Build APK
expo build:android

# Build AAB
expo build:android --type app-bundle
```

#### iOS
```bash
# Build for iOS
expo build:ios
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Follow the existing code style

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Contact the development team

## Roadmap

### Upcoming Features
- [ ] Advanced image editing capabilities
- [ ] Cloud storage integration
- [ ] Social sharing features
- [ ] Offline mode support
- [ ] Multi-language support
- [ ] Advanced filtering and search
- [ ] Batch image generation
- [ ] Custom model support

### Performance Improvements
- [ ] Image caching optimization
- [ ] Lazy loading for image history
- [ ] Memory usage optimization
- [ ] Faster image generation queue

---

**Built with React Native, Expo, and TypeScript**
