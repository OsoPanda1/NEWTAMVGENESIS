# TAMV Domain Layer

## Overview

This directory contains the domain-driven design (DDD) implementation for TAMV. The domain layer is the core of the application, containing business logic, entities, value objects, and domain services.

## Architecture

```
domain/
├── entities/           # Domain entities (Aggregate Roots)
├── value-objects/      # Immutable value objects
├── repositories/      # Repository interfaces
├── services/          # Domain services
├── events/            # Domain events
├── exceptions/        # Domain exceptions
└── types/             # Domain types and interfaces
```

## Domain Entities

### User (Aggregate Root)

```typescript
// User Entity
class User {
  readonly id: UserId;
  private email: Email;
  private username: Username;
  private passwordHash: PasswordHash;
  private walletAddress?: WalletAddress;
  private profile: UserProfile;
  private credits: Credits;
  private reputation: Reputation;
  private status: UserStatus;
  private mfaEnabled: boolean;
  private createdAt: Date;
  private updatedAt: Date;

  // Domain methods
  changeEmail(newEmail: Email): void;
  updateProfile(profile: Partial<UserProfile>): void;
  addCredits(amount: Credits): void;
  spendCredits(amount: Credits): void;
  enableMFA(secret: MFASecret): void;
  disableMFA(): void;
  suspend(reason: SuspensionReason): void;
  activate(): void;
}
```

### World (Aggregate Root)

```typescript
// World Entity
class World {
  readonly id: WorldId;
  private ownerId: UserId;
  private title: WorldTitle;
  private description?: WorldDescription;
  private sceneData: SceneData;
  private worldType: WorldType;
  private visibility: Visibility;
  private capacity: WorldCapacity;
  private entranceFee: Credits;
  private assets: AssetCollection;
  private currentPlayers: PlayerCount;
  private createdAt: Date;
  private updatedAt: Date;

  // Domain methods
  updateScene(sceneData: SceneData): void;
  changeVisibility(visibility: Visibility): void;
  setEntranceFee(fee: Credits): void;
  addAsset(asset: Asset): void;
  removeAsset(assetId: AssetId): void;
  canJoin(player: User): boolean;
  join(player: User): WorldSession;
  leave(playerId: UserId): void;
}
```

### Asset (Aggregate Root)

```typescript
// Asset Entity
class Asset {
  readonly id: AssetId;
  private ownerId: UserId;
  private worldId?: WorldId;
  private name: AssetName;
  private description?: AssetDescription;
  private type: AssetType;
  private storageUrl: StorageUrl;
  private thumbnailUrl?: ThumbnailUrl;
  private metadata: AssetMetadata;
  private pricing?: AssetPricing;
  private ownershipHistory: OwnershipRecord[];
  private createdAt: Date;

  // Domain methods
  changeOwner(newOwner: User, price: Credits): void;
  listForSale(price: Credits): void;
  delist(): void;
  updateMetadata(metadata: Partial<AssetMetadata>): void;
}
```

## Value Objects

```typescript
// Credits Value Object
class Credits {
  private readonly amount: number;
  
  constructor(amount: number) {
    if (amount < 0) throw new NegativeCreditsError();
    this.amount = amount;
  }
  
  add(other: Credits): Credits;
  subtract(other: Credits): Credits;
  multiply(factor: number): Credits;
  isGreaterThan(other: Credits): boolean;
  isLessThan(other: Credits): boolean;
  toNumber(): number;
}

// Email Value Object
class Email {
  private readonly value: string;
  
  constructor(value: string) {
    if (!isValidEmail(value)) throw new InvalidEmailError(value);
    this.value = value.toLowerCase();
  }
  
  getValue(): string;
  equals(other: Email): boolean;
}

// WorldType Enum
enum WorldType {
  GALLERY = 'gallery',
  CONCERT = 'concert',
  MEETING = 'meeting',
  GAME = 'game',
  MEDITATION = 'meditation',
  CUSTOM = 'custom'
}

// AssetType Enum
enum AssetType {
  MODEL = 'model',
  TEXTURE = 'texture',
  AUDIO = 'audio',
  VIDEO = 'video',
  SCRIPT = 'script'
}
```

## Domain Services

### CreditService

```typescript
interface CreditService {
  purchaseCredits(userId: UserId, amount: number, paymentMethod: PaymentMethod): Promise<CreditTransaction>;
  transferCredits(fromUserId: UserId, toUserId: UserId, amount: Credits, memo?: string): Promise<CreditTransaction>;
  spendCredits(userId: UserId, amount: Credits, purpose: SpendPurpose): Promise<CreditTransaction>;
  awardCredits(userId: UserId, amount: Credits, reason: AwardReason): Promise<CreditTransaction>;
  getBalance(userId: UserId): Promise<Credits>;
  getTransactionHistory(userId: UserId, filters?: TransactionFilters): Promise<CreditTransaction[]>;
}
```

### WorldService

```typescript
interface WorldService {
  createWorld(ownerId: UserId, data: CreateWorldData): Promise<World>;
  updateWorld(worldId: WorldId, ownerId: UserId, data: UpdateWorldData): Promise<World>;
  deleteWorld(worldId: WorldId, ownerId: UserId): Promise<void>;
  getWorld(worldId: WorldId): Promise<World>;
  listWorlds(filters?: WorldFilters): Promise<World[]>;
  joinWorld(worldId: WorldId, userId: UserId, position?: Position): Promise<WorldSession>;
  leaveWorld(worldId: WorldId, userId: UserId): Promise<void>;
  getActivePlayers(worldId: WorldId): Promise<Player[]>;
}
```

### SocialService

```typescript
interface SocialService {
  createPost(userId: UserId, content: PostContent): Promise<Post>;
  deletePost(postId: PostId, userId: UserId): Promise<void>;
  getPost(postId: PostId): Promise<Post>;
  getFeed(userId: UserId, filters?: FeedFilters): Promise<Post[]>;
  resonate(postId: PostId, userId: UserId, emotion: Resonance): Promise<void>;
  comment(postId: PostId, userId: UserId, content: string, parentId?: CommentId): Promise<Comment>;
  follow(followerId: UserId, followingId: UserId): Promise<void>;
  unfollow(followerId: UserId, followingId: UserId): Promise<void>;
  getFollowers(userId: UserId): Promise<User[]>;
  getFollowing(userId: UserId): Promise<User[]>;
}
```

## Domain Events

```typescript
// User Events
type UserDomainEvent =
  | UserCreatedEvent
  | UserUpdatedEvent
  | UserVerifiedEvent
  | UserSuspendedEvent
  | UserActivatedEvent;

interface UserCreatedEvent {
  type: 'USER_CREATED';
  userId: UserId;
  email: Email;
  timestamp: Date;
}

// World Events
type WorldDomainEvent =
  | WorldCreatedEvent
  | WorldUpdatedEvent
  | WorldDeletedEvent
  | PlayerJoinedWorldEvent
  | PlayerLeftWorldEvent;

interface PlayerJoinedWorldEvent {
  type: 'PLAYER_JOINED_WORLD';
  worldId: WorldId;
  playerId: UserId;
  position: Position;
  timestamp: Date;
}

// Economy Events
type EconomyDomainEvent =
  | CreditsPurchasedEvent
  | CreditsSpentEvent
  | CreditsTransferredEvent
  | AssetPurchasedEvent;

interface CreditsPurchasedEvent {
  type: 'CREDITS_PURCHASED';
  userId: UserId;
  amount: Credits;
  paymentMethod: PaymentMethod;
  timestamp: Date;
}
```

## Repository Interfaces

```typescript
interface UserRepository {
  findById(id: UserId): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  findByUsername(username: Username): Promise<User | null>;
  save(user: User): Promise<void>;
  delete(id: UserId): Promise<void>;
}

interface WorldRepository {
  findById(id: WorldId): Promise<World | null>;
  findByOwner(ownerId: UserId): Promise<World[]>;
  findPublic(filters?: WorldFilters): Promise<World[]>;
  save(world: World): Promise<void>;
  delete(id: WorldId): Promise<void>;
}

interface AssetRepository {
  findById(id: AssetId): Promise<Asset | null>;
  findByOwner(ownerId: UserId): Promise<Asset[]>;
  findByWorld(worldId: WorldId): Promise<Asset[]>;
  findForSale(filters?: AssetFilters): Promise<Asset[]>;
  save(asset: Asset): Promise<void>;
  delete(id: AssetId): Promise<void>;
}
```

## Domain Invariants

### User Invariants
- Email must be unique
- Username must be unique and alphanumeric
- Credits balance cannot be negative
- MFA can only be disabled by the user

### World Invariants
- Owner must exist
- Maximum players must be positive
- Entrance fee must be non-negative
- Scene data must be valid JSON

### Asset Invariants
- Owner must exist
- Storage URL must be valid
- Price must be positive if for sale

## Usage

```typescript
// Example: Creating a world
const worldService = container.resolve<WorldService>('WorldService');

const world = await worldService.createWorld(
  userId,
  {
    title: new WorldTitle('My Dream Space'),
    description: new WorldDescription('A beautiful virtual gallery'),
    worldType: WorldType.GALLERY,
    isPublic: true,
    maxPlayers: 50,
    entranceFee: new Credits(0)
  }
);

// This automatically publishes WorldCreatedEvent
// which can be handled by other services
```

---

*Domain-driven design for TAMV - v1.0.0*
