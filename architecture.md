# Twitch-to-Speech Architecture

## System Overview

This mermaid chart explains the architecture, data flow, and package dependencies of the Twitch-to-Speech application.

```mermaid
graph TB
    %% External Dependencies
    subgraph "External Dependencies"
        ComfyJS["ComfyJS<br/>Twitch Chat Library"]
        WebSpeechAPI["Web Speech API<br/>Browser TTS"]
        HTTPServer["http-server<br/>Dev Server"]
    end

    %% Main Application
    subgraph "Main Application"
        App["TTSApp<br/>Main Controller"]
        HTML["index.html<br/>UI Structure"]
        CSS["main.css<br/>Styling"]
    end

    %% Core Modules
    subgraph "Core Modules"
        TwitchConn["TwitchConnection<br/>Chat Connection"]
        TTSMgr["TTSManager<br/>Speech Synthesis"]
        UIMgr["UIManager<br/>DOM Manipulation"]
        SettingsMgr["SettingsManager<br/>Configuration"]
        StatsMgr["StatsManager<br/>Analytics"]
    end

    %% Data Flow
    ComfyJS -->|Chat Messages| TwitchConn
    TwitchConn -->|User Messages| App
    App -->|Process Message| TTSMgr
    App -->|Update UI| UIMgr
    App -->|Track Stats| StatsMgr
    App -->|Load/Save Config| SettingsMgr
    
    TTSMgr -->|Speech Queue| WebSpeechAPI
    WebSpeechAPI -->|Voice Output| TTSMgr
    
    SettingsMgr -->|LocalStorage| Browser[("Browser Storage")]
    
    %% UI Components
    subgraph "UI Components"
        NavHeader["Navigation Header"]
        ChatPanel["Collapsible Chat Panel"]
        MainSections["Main Content Sections"]
        Controls["TTS Controls"]
    end
    
    HTML --> NavHeader
    HTML --> ChatPanel
    HTML --> MainSections
    HTML --> Controls
    
    UIMgr -->|Manipulate| NavHeader
    UIMgr -->|Update| ChatPanel
    UIMgr -->|Manage| MainSections
    UIMgr -->|Control| Controls
    
    %% Module Interactions
    TTSMgr -->|Voice Assignment| TTSMgr
    TTSMgr -->|Message Filtering| TTSMgr
    TTSMgr -->|Queue Management| TTSMgr
    
    SettingsMgr -->|Muted Users| TTSMgr
    SettingsMgr -->|Voice Settings| TTSMgr
    
    StatsMgr -->|Message Count| UIMgr
    StatsMgr -->|Queue Count| UIMgr
    StatsMgr -->|User Count| UIMgr
    
    %% Event System
    subgraph "Event System"
        Events["Custom Event Listeners<br/>- Connection Events<br/>- TTS Events<br/>- UI Events"]
    end
    
    App -->|Register/Emit| Events
    TwitchConn -->|Emit| Events
    TTSMgr -->|Emit| Events
    
    %% Development Environment
    HTTPServer -->|Serves| HTML
    HTTPServer -->|Static Files| CSS
    HTTPServer -->|ES6 Modules| App
    
    %% Styling
    CSS -->|Responsive Design| HTML
    CSS -->|Mobile Support| HTML
    CSS -->|Chat Panel Styles| ChatPanel
    
    %% Class Definitions for Styling
    classDef external fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef core fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef ui fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px
    classDef data fill:#fff3e0,stroke:#e65100,stroke-width:2px
    
    class ComfyJS,WebSpeechAPI,HTTPServer external
    class TwitchConn,TTSMgr,UIMgr,SettingsMgr,StatsMgr core
    class NavHeader,ChatPanel,MainSections,Controls ui
    class Browser,Events data
```

## Key Features

### 1. **Modular Architecture**
- **TTSApp**: Main controller that orchestrates all modules
- **TwitchConnection**: Handles Twitch chat connection via ComfyJS
- **TTSManager**: Manages speech synthesis, voice assignment, and message queuing
- **UIManager**: Handles DOM manipulation and user interface updates
- **SettingsManager**: Manages user preferences and localStorage
- **StatsManager**: Tracks usage statistics and metrics

### 2. **Data Flow**
1. User connects to Twitch channel
2. ComfyJS receives chat messages
3. Messages are filtered and processed
4. TTS queue manages speech synthesis
5. UI updates in real-time
6. Settings persist across sessions

### 3. **Key Technologies**
- **ComfyJS**: Twitch chat integration
- **Web Speech API**: Browser-native text-to-speech
- **ES6 Modules**: Modern JavaScript module system
- **LocalStorage**: Client-side settings persistence
- **CSS Grid/Flexbox**: Responsive layout

### 4. **Features**
- Real-time Twitch chat integration
- Customizable TTS voices and settings
- Message filtering and user muting
- Collapsible live chat panel
- Mobile-responsive design
- Settings import/export
- Usage statistics tracking