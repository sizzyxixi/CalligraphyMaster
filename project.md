# Chinese Calligraphy Worksheet Generator (字帖生成器)

## Overview

This is a full-stack web application for generating Chinese calligraphy worksheets. The application allows users to create customizable practice sheets with different grid types (米字格, 田字格, 空白格, 四线格), supports multiple content types (Chinese characters, Pinyin, English), and can export worksheets as PDF files for printing.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: React hooks with local component state
- **UI Components**: Custom component library based on shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **Build Tool**: Vite with React plugin

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with ESM modules
- **Development Server**: Custom Vite integration for hot reloading
- **Storage**: In-memory storage implementation with interface for future database integration

### Data Storage Solutions
- **Current**: In-memory storage using Map data structures
- **Prepared for**: PostgreSQL with Drizzle ORM (configuration present but not actively used)
- **Schema**: Basic user management schema defined but not utilized in current implementation

## Key Components

### Core Application Components
1. **PreviewCanvas**: Canvas-based worksheet preview and rendering
2. **CharacterGrid**: Individual grid cell rendering with different grid types
3. **ContentInput**: Multi-mode text input (Chinese/Pinyin/English)
4. **GridTypeSelector**: Visual grid type selection interface
5. **LayoutSettings**: Worksheet layout configuration
6. **StyleSettings**: Font and styling customization

### UI System
- Comprehensive component library based on Radix UI primitives
- Consistent theming with CSS custom properties
- Responsive design with mobile considerations
- Toast notifications for user feedback

### Grid Rendering System
- Canvas-based rendering for precise layout control
- Support for multiple grid types with different line patterns
- Font rendering with opacity controls for tracing practice
- Scalable rendering system for different output sizes

## Data Flow

1. **User Input**: Users configure worksheet settings through various control components
2. **State Management**: Settings are managed in the main Home component and passed down
3. **Character Processing**: Content is processed based on type (Chinese characters extracted, Pinyin split, English words separated)
4. **Grid Layout Calculation**: Layout engine calculates optimal grid placement and sizing
5. **Canvas Rendering**: Grid renderer draws the worksheet preview on HTML5 canvas
6. **PDF Export**: jsPDF library converts the canvas rendering to downloadable PDF

## External Dependencies

### Frontend Libraries
- **React Ecosystem**: React, React DOM, React Router (Wouter)
- **UI Components**: Radix UI primitives, Lucide React icons
- **State Management**: TanStack Query for async state management
- **Form Handling**: React Hook Form with Zod validation
- **Styling**: Tailwind CSS, Class Variance Authority
- **PDF Generation**: jsPDF for client-side PDF creation
- **Canvas Rendering**: HTML5 Canvas API with custom rendering logic

### Backend Libraries
- **Server**: Express.js with TypeScript support
- **Development**: tsx for TypeScript execution, Vite for development server
- **Database Ready**: Drizzle ORM, @neondatabase/serverless (configured but unused)
- **Build**: esbuild for production bundling

### Build and Development Tools
- **Build System**: Vite with React plugin and TypeScript support
- **Development**: Hot module replacement, runtime error overlay
- **TypeScript**: Strict configuration with path mapping
- **Linting**: Implicit through TypeScript strict mode

## Deployment Strategy

### Development
- Vite development server with HMR
- Express server with middleware integration
- Automatic TypeScript compilation and error reporting

### Production Build
- Frontend: Vite build targeting ES modules
- Backend: esbuild bundling for Node.js deployment
- Static assets served through Express in production
- Environment-specific configuration through NODE_ENV

### Database Strategy
- Current: In-memory storage for development and demo
- Future: PostgreSQL with Drizzle migrations (configuration ready)
- Database URL configuration through environment variables

## User Preferences

Preferred communication style: Simple, everyday language.

## Changelog

Changelog:
- June 30, 2025. Initial setup