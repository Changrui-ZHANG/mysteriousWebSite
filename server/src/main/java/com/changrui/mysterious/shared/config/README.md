# WebSocket - Architecture et Fonctionnement

## Vue d'ensemble

Ce projet utilise WebSocket avec STOMP pour la communication temps réel entre le serveur Spring Boot et les clients React.

```
┌─────────────────┐         WebSocket          ┌─────────────────┐
│   Client 1      │◄──────────────────────────►│                 │
│   (Browser)     │                            │   Spring Boot   │
└─────────────────┘                            │     Server      │
                                               │                 │
┌─────────────────┐         WebSocket          │  ┌───────────┐  │
│   Client 2      │◄──────────────────────────►│  │  STOMP    │  │
│   (Browser)     │                            │  │  Broker   │  │
└─────────────────┘                            │  └───────────┘  │
                                               └─────────────────┘
```

## HTTP vs WebSocket

| HTTP (Polling) | WebSocket |
|----------------|-----------|
| Client demande → Serveur répond | Connexion bidirectionnelle permanente |
| Nouvelle connexion à chaque requête | Une seule connexion maintenue |
| Le serveur ne peut pas initier | Le serveur peut "push" des données |
| Overhead important | Très léger après connexion |

## Composants

### 1. WebSocketConfig.java
Configuration du WebSocket et du broker STOMP.

```java
@EnableWebSocketMessageBroker
public class WebSocketConfig {
    // Endpoint: /ws/websocket (natif) et /ws (SockJS fallback)
    // Broker: /topic pour broadcast à tous les abonnés
    // Prefix: /app pour messages client → serveur
}
```

### 2. WebSocketEventListener.java
Écoute les événements de connexion/déconnexion.

```java
@EventListener
public void handleConnect(SessionConnectedEvent event) {
    // Appelé quand un client se connecte
    presenceService.userConnected(sessionId);
}

@EventListener  
public void handleDisconnect(SessionDisconnectEvent event) {
    // Appelé quand un client se déconnecte
    presenceService.userDisconnected(sessionId);
}
```

### 3. MessageWebSocketController.java
Broadcast les événements aux clients.

```java
public void broadcastNewMessage(Message message) {
    // Envoie à TOUS les clients abonnés à /topic/messages
    messagingTemplate.convertAndSend("/topic/messages", 
        new WebSocketEvent("NEW_MESSAGE", message));
}
```

### 4. WebSocketPresenceService.java
Gère le compteur d'utilisateurs en ligne via les sessions WebSocket.

```java
private final Set<String> activeSessions = ConcurrentHashMap.newKeySet();

public void userConnected(String sessionId) {
    activeSessions.add(sessionId);
    broadcastOnlineCount(); // Notifie tous les clients
}
```

### 5. useWebSocket.ts (Frontend)
Hook React pour la connexion STOMP.

```typescript
const client = new Client({
    brokerURL: 'ws://localhost:8080/ws/websocket',
    onConnect: () => {
        client.subscribe('/topic/messages', handleMessage);
        client.subscribe('/topic/presence', handlePresence);
    }
});
```

## Topics

| Topic | Description | Payload |
|-------|-------------|---------|
| `/topic/messages` | Nouveaux messages, suppressions, mute | `{ type, payload }` |
| `/topic/presence` | Nombre d'utilisateurs en ligne | `{ count, showToAll }` |

### Types d'événements messages
- `NEW_MESSAGE` - Nouveau message posté
- `DELETE_MESSAGE` - Message supprimé
- `MUTE_STATUS` - Chat muté/démuté
- `CLEAR_ALL` - Tous les messages effacés

## Flux d'un message

```
1. User A envoie un message
         │
         ▼
2. POST /api/messages (REST)
         │
         ▼
3. MessageController.addMessage()
   ├── Sauvegarde en DB
   └── webSocketController.broadcastNewMessage()
         │
         ▼
4. messagingTemplate.convertAndSend("/topic/messages", event)
         │
         ▼
5. Tous les clients abonnés reçoivent le message instantanément
```

## Flux de la présence

```
1. User B ouvre la page
         │
         ▼
2. WebSocket se connecte à /ws/websocket
         │
         ▼
3. WebSocketEventListener détecte la connexion
         │
         ▼
4. WebSocketPresenceService.userConnected()
   ├── Ajoute sessionId au Set
   └── Broadcast count à /topic/presence
         │
         ▼
5. Tous les clients reçoivent { count: 2, showToAll: true }
```

## Pourquoi STOMP ?

STOMP (Simple Text Oriented Messaging Protocol) ajoute au-dessus de WebSocket :
- **Topics** : Pub/sub avec `/topic/...`
- **Headers** : Métadonnées structurées
- **Heartbeat** : Détection de connexion morte
- **Reconnexion** : Gérée automatiquement côté client

## Configuration Vite (Dev)

Le proxy Vite redirige `/ws` vers le backend :

```typescript
// vite.config.ts
proxy: {
    '/ws': {
        target: 'http://localhost:8080',
        ws: true
    }
}
```

## Dépendances

**Backend (pom.xml)**
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-websocket</artifactId>
</dependency>
```

**Frontend (package.json)**
```json
"@stomp/stompjs": "^7.x"
```
