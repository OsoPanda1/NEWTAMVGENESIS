# TAMV Event Model & Webhooks

## 1. Internal Event Architecture

### Event Bus Design

```
┌──────────────────────────────────────────────────────────────────────┐
│                         EVENT BUS ARCHITECTURE                       │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐             │
│  │  Producer   │────▶│   Event     │────▶│  Consumer  │             │
│  │  Services   │     │    Bus      │     │  Services  │             │
│  └─────────────┘     └─────────────┘     └─────────────┘             │
│        │                   │                   │                     │
│        │                   │                   │                     │
│        ▼                   ▼                   ▼                     │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐           │
│  │   Events    │     │   Message   │     │   Handlers  │           │
│  │  (Domain)   │     │   Queue     │     │  (Saga/FSM) │           │
│  └─────────────┘     └─────────────┘     └─────────────┘           │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### Event Types

```typescript
// Base event interface
interface TamvEvent {
  id: string;
  type: string;
  aggregateId: string;
  aggregateType: string;
  version: number;
  timestamp: string;
  metadata: EventMetadata;
  payload: unknown;
}

interface EventMetadata {
  correlationId?: string;
  causationId?: string;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  tenantId?: string;
  source: string;
  ipAddress?: string;
  userAgent?: string;
}

// ==================== USER EVENTS ====================
type UserEvent =
  | UserCreated
  | UserUpdated
  | UserEmailChanged
  | UserVerified
  | UserMFAEnabled
  | UserMFADisabled
  | UserSuspended
  | UserActivated
  | UserDeleted;

interface UserCreated {
  type: 'USER_CREATED';
  aggregateId: string;
  payload: {
    email: string;
    username: string;
    displayName: string;
    walletAddress?: string;
  };
}

interface UserVerified {
  type: 'USER_VERIFIED';
  aggregateId: string;
  payload: {
    verifiedAt: string;
    method: 'email' | 'phone' | 'wallet';
  };
}

// ==================== WORLD EVENTS ====================
type WorldEvent =
  | WorldCreated
  | WorldUpdated
  | WorldDeleted
  | WorldPublished
  | WorldUnpublished
  | PlayerJoinedWorld
  | PlayerLeftWorld
  | PlayerMovedInWorld
  | WorldAssetAdded
  | WorldAssetRemoved;

interface WorldCreated {
  type: 'WORLD_CREATED';
  aggregateId: string;
  payload: {
    ownerId: string;
    title: string;
    description?: string;
    worldType: WorldType;
    isPublic: boolean;
    maxPlayers: number;
    entranceFee: number;
  };
}

interface PlayerJoinedWorld {
  type: 'PLAYER_JOINED_WORLD';
  aggregateId: string;
  payload: {
    playerId: string;
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number; w: number };
    sessionId: string;
    entranceFeePaid: number;
  };
}

// ==================== ECONOMY EVENTS ====================
type EconomyEvent =
  | CreditsPurchased
  | CreditsSpent
  | CreditsTransferred
  | CreditsAwarded
  | CreditsRefunded
  | AssetListed
  | AssetDelisted
  | AssetPurchased
  | AssetTransferred
  | RoyaltyPaid;

interface CreditsPurchased {
  type: 'CREDITS_PURCHASED';
  aggregateId: string;
  payload: {
    userId: string;
    amount: number;
    paymentMethodId: string;
    paymentProvider: 'stripe' | 'crypto' | 'paypal';
    currency: string;
    exchangeRate: number;
    bonusAmount?: number;
  };
}

interface AssetPurchased {
  type: 'ASSET_PURCHASED';
  aggregateId: string;
  payload: {
    assetId: string;
    sellerId: string;
    buyerId: string;
    price: number;
    royaltyAmount?: number;
    platformFee: number;
    transactionId: string;
  };
}

// ==================== SOCIAL EVENTS ====================
type SocialEvent =
  | PostCreated
  | PostUpdated
  | PostDeleted
  | PostResonated
  | CommentAdded
  | CommentDeleted
  | UserFollowed
  | UserUnfollowed;

interface PostCreated {
  type: 'POST_CREATED';
  aggregateId: string;
  payload: {
    authorId: string;
    content: string;
    mediaUrls?: string[];
    postType: PostType;
    visibility: Visibility;
    worldId?: string;
  };
}

interface PostResonated {
  type: 'POST_RESONATED';
  aggregateId: string;
  payload: {
    postId: string;
    userId: string;
    emotion: Resonance;
  };
}

// ==================== XR EVENTS ====================
type XREvent =
  | XRSessionStarted
  | XRSessionEnded
  | XRSessionPaused
  | XRPlayerTeleported
  | XRInteractionPerformed
  | XRTrackingLost
  | XRTrackingRestored;

interface XRSessionStarted {
  type: 'XR_SESSION_STARTED';
  aggregateId: string;
  payload: {
    sessionId: string;
    worldId: string;
    userId: string;
    mode: 'vr' | 'ar' | 'mr';
    deviceInfo: XRDeviceInfo;
  };
}

// ==================== AI EVENTS ====================
type AIEvent =
  | AIInteractionStarted
  | AIInteractionEnded
  | ContentGenerated
  | ContentModerated
  | RecommendationGenerated;

interface ContentGenerated {
  type: 'CONTENT_GENERATED';
  aggregateId: string;
  payload: {
    userId: string;
    generationType: 'image' | 'text' | 'scene' | 'audio';
    prompt: string;
    result: GenerationResult;
    creditsSpent: number;
  };
}
```

## 2. Event Handler Pattern

```typescript
// Base event handler
abstract class EventHandler<T extends TamvEvent> {
  abstract handle(event: T): Promise<void>;
  
  async onError(event: T, error: Error): Promise<void> {
    console.error(`Error handling event ${event.id}:`, error);
    // Send to dead letter queue
    await deadLetterQueue.publish({
      event,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}

// Example: World event handler
class WorldEventHandler<WorldEvent> {
  constructor(
    private worldRepository extends EventHandler: WorldRepository,
    private notificationService: NotificationService,
    private analyticsService: AnalyticsService,
  ) {
    super();
  }

  async handle(event: WorldEvent): Promise<void> {
    switch (event.type) {
      case 'WORLD_CREATED':
        await this.handleWorldCreated(event);
        break;
      case 'PLAYER_JOINED_WORLD':
        await this.handlePlayerJoined(event);
        break;
      case 'PLAYER_LEFT_WORLD':
        await this.handlePlayerLeft(event);
        break;
    }
  }

  private async handleWorldCreated(event: WorldCreated): Promise<void> {
    const world = await this.worldRepository.findById(event.aggregateId);
    
    // Index world for search
    await searchService.indexWorld({
      id: world.id,
      title: world.title,
      description: world.description,
      worldType: world.worldType,
      ownerId: world.ownerId,
    });

    // Notify owner's followers
    await this.notificationService.notifyFollowers(
      world.ownerId,
      'NEW_WORLD',
      { worldId: world.id, title: world.title }
    );

    // Track analytics
    await this.analyticsService.trackEvent('world_created', {
      worldId: world.id,
      ownerId: world.ownerId,
      worldType: world.worldType,
    });
  }

  private async handlePlayerJoined(event: PlayerJoinedWorld): Promise<void> {
    // Update world player count
    await this.worldRepository.incrementPlayerCount(event.aggregateId);
    
    // Update analytics
    await this.analyticsService.trackEvent('player_joined_world', {
      worldId: event.aggregateId,
      playerId: event.payload.playerId,
    });
  }
}

// Event bus implementation
class EventBus {
  private handlers: Map<string, EventHandler<TamvEvent>[]> = new Map();
  private messageQueue: MessageQueue;
  private deadLetterQueue: MessageQueue;

  async publish<T extends TamvEvent>(event: T): Promise<void> {
    // Add to message queue for persistence
    await this.messageQueue.publish('events', {
      key: event.id,
      value: JSON.stringify(event),
      headers: {
        'event-type': event.type,
        'aggregate-type': event.aggregateType,
        'timestamp': event.timestamp,
      },
    });

    // Get handlers for this event type
    const handlers = this.handlers.get(event.type) || [];
    
    // Execute handlers
    await Promise.allSettled(
      handlers.map(handler => handler.handle(event))
    );
  }

  subscribe<T extends TamvEvent>(
    eventType: string,
    handler: EventHandler<T>
  ): void {
    const handlers = this.handlers.get(eventType) || [];
    handlers.push(handler as EventHandler<TamvEvent>);
    this.handlers.set(eventType, handlers);
  }
}
```

## 3. Webhooks

### Webhook Configuration

```typescript
interface WebhookConfig {
  id: string;
  url: string;
  events: WebhookEvent[];
  secret: string;
  isActive: boolean;
  retryPolicy: RetryPolicy;
  createdAt: Date;
  updatedAt: Date;
}

interface WebhookEvent {
  type: string;
  description: string;
  payload: Record<string, unknown>;
}

interface RetryPolicy {
  maxRetries: number;
  retryDelay: number; // milliseconds
  backoffMultiplier: number;
  maxRetryDelay: number;
}
```

### Outgoing Webhooks

```yaml
# Webhook Endpoints (TAMV → External)

## Payment Webhooks
/webhooks/payment:
  events:
    - credits.purchased
    - payment.completed
    - payment.failed
    - payment.refunded
  payload:
    event: string
    timestamp: string
    data:
      transactionId: string
      userId: string
      amount: number
      currency: string
      status: "completed" | "failed" | "refunded"
      paymentMethod: string

## Analytics Webhooks
/webhooks/analytics:
  events:
    - world.created
    - world.viewed
    - user.joined
    - user.left
    - asset.purchased
  payload:
    event: string
    timestamp: string
    data:
      worldId?: string
      userId: string
      action: string

## Moderation Webhooks
/webhooks/moderation:
  events:
    - content.flagged
    - user.reported
    - content.removed
  payload:
    event: string
    timestamp: string
    data:
      contentId: string
      contentType: string
      reason: string
      severity: "low" | "medium" | "high"

## Economy Webhooks
/webhooks/economy:
  events:
    - credits.transferred
    - asset.sold
    - royalty.paid
    - refund.processed
  payload:
    event: string
    timestamp: string
    data:
      transactionId: string
      fromUserId: string
      toUserId: string
      amount: number
      assetId?: string
```

### Incoming Webhooks

```yaml
# External → TAMV Webhooks

## Payment Provider Webhooks
/webhooks/stripe:
  events:
    - payment_intent.succeeded
    - payment_intent.payment_failed
    - charge.refunded
  security:
    - Signature verification (Stripe-Signature header)

/webhooks/crypto:
  events:
    - deposit.confirmed
    - withdrawal.processed
  security:
    - HMAC signature verification

## External Social Integration
/webhooks/social:
  events:
    - user.linked
    - user.unlinked
    - post.shared
  security:
    - API key verification
```

### Webhook Security

```typescript
// Webhook signature verification
class WebhookSecurity {
  verifySignature(
    payload: string,
    signature: string,
    secret: string
  ): boolean {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  verifyRequest(req: Request, webhook: WebhookConfig): boolean {
    const signature = req.headers.get('x-webhook-signature');
    if (!signature) return false;
    
    const payload = await req.text();
    return this.verifySignature(payload, signature, webhook.secret);
  }
}

// Webhook delivery with retries
class WebhookDelivery {
  async deliver(
    webhook: WebhookConfig,
    event: TamvEvent
  ): Promise<DeliveryResult> {
    const payload = {
      id: event.id,
      type: event.type,
      timestamp: event.timestamp,
      data: event.payload,
    };

    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= webhook.retryPolicy.maxRetries; attempt++) {
      try {
        const response = await fetch(webhook.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Signature': this.sign(payload, webhook.secret),
            'X-Webhook-Event': event.type,
            'X-Webhook-ID': webhook.id,
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          return { success: true, statusCode: response.status };
        }

        lastError = new Error(`HTTP ${response.status}`);
      } catch (error) {
        lastError = error as Error;
      }

      if (attempt < webhook.retryPolicy.maxRetries) {
        const delay = Math.min(
          webhook.retryPolicy.retryDelay * 
          Math.pow(webhook.retryPolicy.backoffMultiplier, attempt),
          webhook.retryPolicy.maxRetryDelay
        );
        await this.sleep(delay);
      }
    }

    return { success: false, error: lastError?.message };
  }
}
```

## 4. Event Schemas (JSON Schema)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "definitions": {
    "UserCreated": {
      "type": "object",
      "required": ["type", "aggregateId", "payload", "timestamp"],
      "properties": {
        "type": { "const": "USER_CREATED" },
        "aggregateId": { "type": "string", "format": "uuid" },
        "payload": {
          "type": "object",
          "required": ["email", "username"],
          "properties": {
            "email": { "type": "string", "format": "email" },
            "username": { "type": "string", "minLength": 3 },
            "displayName": { "type": "string" },
            "walletAddress": { "type": "string" }
          }
        },
        "timestamp": { "type": "string", "format": "date-time" }
      }
    },
    "PlayerJoinedWorld": {
      "type": "object",
      "required": ["type", "aggregateId", "payload", "timestamp"],
      "properties": {
        "type": { "const": "PLAYER_JOINED_WORLD" },
        "aggregateId": { "type": "string", "format": "uuid" },
        "payload": {
          "type": "object",
          "required": ["playerId", "sessionId"],
          "properties": {
            "playerId": { "type": "string", "format": "uuid" },
            "sessionId": { "type": "string", "format": "uuid" },
            "position": { "$ref": "#/definitions/Vector3" },
            "entranceFeePaid": { "type": "number" }
          }
        },
        "timestamp": { "type": "string", "format": "date-time" }
      }
    },
    "Vector3": {
      "type": "object",
      "required": ["x", "y", "z"],
      "properties": {
        "x": { "type": "number" },
        "y": { "type": "number" },
        "z": { "type": "number" }
      }
    }
  }
}
```

## 5. Idempotency

```typescript
// Idempotency key generation
function generateIdempotencyKey(event: TamvEvent): string {
  return `${event.type}:${event.aggregateId}:${event.version}`;
}

// Idempotency check
class IdempotencyService {
  private cache: Cache<string, ProcessedEvent>;
  
  async isProcessed(idempotencyKey: string): Promise<boolean> {
    const cached = await this.cache.get(idempotencyKey);
    return cached !== null;
  }
  
  async markProcessed(idempotencyKey: string, result: unknown): Promise<void> {
    await this.cache.set(idempotencyKey, {
      result,
      processedAt: new Date().toISOString(),
    }, { ttl: 24 * 60 * 60 }); // 24 hours
  }
}

// Usage in event handler
class WorldEventHandler extends EventHandler<WorldEvent> {
  constructor(private idempotencyService: IdempotencyService) {
    super();
  }

  async handle(event: WorldEvent): Promise<void> {
    const key = generateIdempotencyKey(event);
    
    if (await this.idempotencyService.isProcessed(key)) {
      console.log(`Event ${event.id} already processed, skipping`);
      return;
    }

    // Process event
    await this.processEvent(event);
    
    // Mark as processed
    await this.idempotencyService.markProcessed(key, { success: true });
  }
}
```

---

*Event Model & Webhooks Documentation - v1.0.0*
