# AI Voice Chat Web Application Migration Guide

## Table of Contents

1. [Application Overview](#application-overview)
2. [Core Features](#core-features)
3. [Authentication System](#authentication-system)
4. [API Integration](#api-integration)
5. [State Management](#state-management)
6. [Component Structure](#component-structure)
7. [Theme and Styling](#theme-and-styling)
8. [WebRTC Integration](#webrtc-integration)

## Application Overview

This is a React-based web application for making AI voice calls. The application uses TypeScript, Tailwind CSS for styling, and includes real-time communication features using WebSocket and WebRTC.

### Key Technologies

- React 18.2.0
- TypeScript
- Tailwind CSS
- Zustand (State Management)
- React Query
- WebRTC/WebSocket
- React Router DOM
- Axios

## Core Features

### 1. Authentication

- Login/Register functionality
- Protected routes
- Token-based authentication
- Persistent auth state

### 2. Voice Calls

- Real-time voice communication
- Custom scenario creation
- Call history
- Audio visualization
- Call controls (mute, end call)

### 3. Scenarios Management

- Create custom scenarios
- List saved scenarios
- Delete scenarios
- Scenario selection for calls

### 4. User Management

- Profile management
- Name updates
- Dark mode preferences

## Authentication System

### Auth Context Structure

```typescript
interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  user: UserProfile;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}
```

### User Profile Interface

```typescript
interface UserProfile {
  id: string;
  email: string;
  name: string;
}
```

## API Integration

### Base Configuration

```typescript
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
  withCredentials: false,
});
```

### Key Endpoints

1. Authentication

   - POST `/token` - Login
   - POST `/users/register` - Registration
   - GET `/users/me` - Get user profile

2. Scenarios

   - POST `/realtime/custom-scenario` - Create scenario
   - GET `/realtime/custom-scenario/list` - List scenarios
   - DELETE `/realtime/custom-scenario/{id}` - Delete scenario

3. Calls
   - GET `/make-custom-call/{phone_number}/{scenario_id}` - Initiate call
   - POST `/realtime/session` - Create realtime session

## State Management

### Zustand Store Structure

```typescript
interface CallState {
  activeCall: ActiveCall | null;
  isConnecting: boolean;
  error: Error | null;
  webrtcService: WebRTCService | null;
  apiService: ApiService | null;
}
```

### Scenario Context

```typescript
interface ScenarioContextType {
  scenarios: Scenario[];
  addScenario: (scenario: Scenario) => void;
  error: Error | null;
  isLoading: boolean;
  refreshScenarios: () => void;
}
```

## Component Structure

### Key Components

1. Layout Components

   - Header
   - MainLayout
   - PageContainer
   - ProtectedRoute

2. Authentication Components

   - LoginForm
   - RegisterForm
   - UpdateNameForm

3. Call Components

   - CallInterface
   - AudioVisualizer
   - IncomingCallModal
   - CustomCallForm

4. Scenario Components
   - ScenarioList
   - SavedPromptsList
   - MakeCustomCallForm

## Theme and Styling

### Color Scheme

```javascript
colors: {
  background: {
    primary: {
      light: '#ffffff',
      dark: '#000000'
    },
    secondary: {
      light: '#f9fafb',
      dark: '#111111'
    },
    tertiary: {
      light: '#f3f4f6',
      dark: '#1a1a1a'
    }
  },
  accent: {
    primary: '#10b981',
    secondary: '#6366f1',
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b'
  }
}
```

### Typography

```javascript
fontFamily: {
  sans: [
    'Inter var',
    'SF Pro Display',
    'Roboto',
    '-apple-system',
    'BlinkMacSystemFont',
    'system-ui',
    'sans-serif'
  ],
  mono: [
    'JetBrains Mono',
    'Fira Code',
    'Menlo',
    'Monaco',
    'Consolas',
    'monospace'
  ]
}
```

## WebRTC Integration

### WebRTC Configuration

```typescript
interface WebRTCConfig {
  iceServers: RTCIceServer[];
}
```

### WebSocket Events

- 'media' - Audio data
- 'start' - Call start
- 'mark' - Call markers

### Environment Variables

Required environment variables:

```
VITE_API_URL=https://voice.hyperlabsai.com
VITE_WS_URL=wss://voice.hyperlabsai.com
```

## Migration Steps

1. **Authentication Integration**

   - Implement token-based auth system
   - Set up protected routes
   - Integrate user management

2. **API Integration**

   - Update API endpoints
   - Implement error handling
   - Set up interceptors

3. **WebRTC Setup**

   - Configure WebRTC services
   - Set up WebSocket connections
   - Implement call handling

4. **UI Components**

   - Map existing components to theme
   - Update styling classes
   - Implement responsive design

5. **State Management**

   - Set up Zustand stores
   - Implement context providers
   - Configure persistence

6. **Testing**
   - Verify auth flow
   - Test call functionality
   - Validate WebRTC connections

## Additional Notes

### Required Dependencies

```json
{
  "@headlessui/react": "^1.7.18",
  "@heroicons/react": "^2.1.1",
  "@tanstack/react-query": "^5.17.19",
  "axios": "^1.7.9",
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-hot-toast": "^2.4.1",
  "react-router-dom": "^6.22.0",
  "simple-peer": "^9.11.1",
  "socket.io-client": "^4.7.4",
  "zustand": "^4.5.0"
}
```

### Development Dependencies

```json
{
  "@tailwindcss/forms": "^0.5.10",
  "autoprefixer": "^10.4.20",
  "postcss": "^8.5.3",
  "tailwindcss": "^3.4.17",
  "typescript": "^5.2.2",
  "vite": "^5.0.8"
}
```
