# TAMV Integration Interfaces

## Overview

This directory contains integration interfaces for AI, XR, and Blockchain systems that are modular and ready for real implementation or mocking.

```
integrations/
├── ai/           # AI engine interfaces
├── xr/           # WebXR/WebGPU interfaces
├── blockchain/   # Blockchain/MSR interfaces
└── providers/    # External service providers
```

---

## 1. AI Integration

### 1.1 Isabella AI Core Interface

```typescript
// src/integrations/ai/IsabellaAI.ts

/**
 * Isabella AI - TAMV's conscious AI assistant
 * 
 * This interface defines the contract for the Isabella AI engine,
 * which provides conversational AI, content generation, and moderation.
 */

export interface IsabellaConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  embeddingModel: string;
  vectorStore: 'pinecone' | 'weaviate' | 'local';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface ChatRequest {
  message: string;
  conversationId?: string;
  context?: {
    worldId?: string;
    location?: Vector3;
    nearbyPlayers?: string[];
  };
  options?: {
    temperature?: number;
    maxTokens?: number;
  };
}

export interface ChatResponse {
  message: string;
  conversationId: string;
  tokens: number;
  emotion?: EmotionAnalysis;
  suggestedActions?: string[];
}

export interface EmotionAnalysis {
  primary: 'joy' | 'sadness' | 'anger' | 'fear' | 'surprise' | 'disgust' | 'neutral';
  intensity: number; // 0-1
  secondary: string[];
  adaptation?: {
    uiTheme?: 'default' | 'calm' | 'energetic';
    responseStyle?: 'formal' | 'casual' | 'empathetic';
  };
}

export interface ContentGenerationRequest {
  type: 'image' | 'text' | 'scene' | 'audio' | '3d_model';
  prompt: string;
  options?: {
    style?: string;
    size?: string;
    quality?: 'low' | 'medium' | 'high';
    negativePrompt?: string;
    seed?: number;
  };
}

export interface ContentGenerationResponse {
  id: string;
  type: string;
  url?: string;
  metadata?: Record<string, unknown>;
  creditsCost: number;
}

export interface ModerationRequest {
  content: string;
  contentType: 'text' | 'image' | 'audio';
  context?: {
    worldId?: string;
    userId?: string;
  };
}

export interface ModerationResult {
  isSafe: boolean;
  categories: {
    hate: number;
    violence: number;
    sexual: number;
    harassment: number;
    selfHarm: number;
    spam: number;
  };
  flagged: boolean;
  action?: 'allow' | 'review' | 'block';
  reason?: string;
}

export interface IsabellaAI {
  // Chat
  chat(request: ChatRequest): Promise<ChatResponse>;
  
  // Content generation
  generate(request: ContentGenerationRequest): Promise<ContentGenerationResponse>;
  
  // Content moderation
  moderate(request: ModerationRequest): Promise<ModerationResult>;
  
  // Recommendations
  getRecommendations(userId: string, context: RecommendationContext): Promise<Recommendation[]>;
  
  // Memory management
  saveMemory(userId: string, memory: AIMemory): Promise<void>;
  getMemories(userId: string, query: string): Promise<AIMemory[]>;
}

export interface RecommendationContext {
  worldId?: string;
  location?: Vector3;
  timeOfDay?: string;
  userInterests?: string[];
}

export interface Recommendation {
  id: string;
  type: 'world' | 'asset' | 'person' | 'event' | 'content';
  title: string;
  description: string;
  url: string;
  score: number;
  reasons: string[];
}

export interface AIMemory {
  id: string;
  userId: string;
  content: string;
  type: 'conversation' | 'preference' | 'experience' | 'achievement';
  embedding?: number[];
  timestamp: string;
  importance: number;
}

// Factory function
export function createIsabellaAI(config: IsabellaConfig): IsabellaAI {
  // Implementation would be loaded based on config
  return new MockIsabellaAI();
}

// Mock implementation for development
class MockIsabellaAI implements IsabellaAI {
  async chat(request: ChatRequest): Promise<ChatResponse> {
    return {
      message: "Hello! I'm Isabella, your AI companion in TAMV. How can I help you today?",
      conversationId: request.conversationId || crypto.randomUUID(),
      tokens: 50,
      emotion: {
        primary: 'joy',
        intensity: 0.8,
        secondary: ['curiosity', 'helpful'],
      },
    };
  }

  async generate(request: ContentGenerationRequest): Promise<ContentGenerationResponse> {
    return {
      id: crypto.randomUUID(),
      type: request.type,
      url: 'https://placeholder.example.com/generated',
      creditsCost: 10,
    };
  }

  async moderate(request: ModerationRequest): Promise<ModerationResult> {
    return {
      isSafe: true,
      categories: {
        hate: 0,
        violence: 0,
        sexual: 0,
        harassment: 0,
        selfHarm: 0,
        spam: 0,
      },
      flagged: false,
      action: 'allow',
    };
  }

  async getRecommendations(userId: string, context: RecommendationContext): Promise<Recommendation[]> {
    return [];
  }

  async saveMemory(userId: string, memory: AIMemory): Promise<void> {}
  async getMemories(userId: string, query: string): Promise<AIMemory[]> {
    return [];
  }
}
```

### 1.2 AI Provider Abstraction

```typescript
// src/integrations/ai/providers.ts

export type AIProviderType = 'openai' | 'anthropic' | 'cohere' | 'local';

export interface AIProvider {
  name: string;
  type: AIProviderType;
  
  // Text generation
  generate(prompt: string, options?: GenerationOptions): Promise<GenerationResult>;
  
  // Embeddings
  embed(text: string[]): Promise<number[][]>;
  
  // Chat
  chat(messages: ChatMessage[], options?: ChatOptions): Promise<ChatMessage>;
  
  // Image generation
  generateImage(prompt: string, options?: ImageOptions): Promise<ImageResult>;
}

export interface GenerationOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stop?: string[];
}

export interface GenerationResult {
  text: string;
  finishReason: 'stop' | 'length' | 'content_filter';
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface ChatOptions extends GenerationOptions {
  systemPrompt?: string;
}

export interface ImageOptions {
  model?: string;
  size?: '256x256' | '512x512' | '1024x1024';
  quality?: 'standard' | 'hd';
  style?: 'natural' | 'vivid' | 'neutral';
}

export interface ImageResult {
  url: string;
  revisedPrompt?: string;
}

// Provider implementations
export class OpenAIProvider implements AIProvider {
  name = 'OpenAI';
  type = 'openai';
  
  async generate(prompt: string, options?: GenerationOptions): Promise<GenerationResult> {
    // Implementation
    return { text: '', finishReason: 'stop', usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 } };
  }
  
  async embed(text: string[]): Promise<number[][]> {
    return text.map(() => Array(1536).fill(0));
  }
  
  async chat(messages: ChatMessage[], options?: ChatOptions): Promise<ChatMessage> {
    return { id: '', role: 'assistant', content: '', timestamp: '' };
  }
  
  async generateImage(prompt: string, options?: ImageOptions): Promise<ImageResult> {
    return { url: '' };
  }
}

export class AnthropicProvider implements AIProvider {
  name = 'Anthropic';
  type = 'anthropic';
  
  async generate(prompt: string, options?: GenerationOptions): Promise<GenerationResult> {
    return { text: '', finishReason: 'stop', usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 } };
  }
  
  async embed(text: string[]): Promise<number[][]> {
    return text.map(() => Array(1536).fill(0));
  }
  
  async chat(messages: ChatMessage[], options?: ChatOptions): Promise<ChatMessage> {
    return { id: '', role: 'assistant', content: '', timestamp: '' };
  }
  
  async generateImage(prompt: string, options?: ImageOptions): Promise<ImageResult> {
    throw new Error('Image generation not supported');
  }
}
```

---

## 2. XR Integration

### 2.1 WebXR Session Manager

```typescript
// src/integrations/xr/XRSessionManager.ts

/**
 * WebXR Integration for TAMV
 * 
 * Provides multi-device immersive experiences using WebXR and WebGPU.
 */

export type XRMode = 'vr' | 'ar' | 'mr';

export type XRReferenceSpace = 
  | 'local' 
  | 'local-floor' 
  | 'bounded' 
  | 'unbounded';

export interface XRConfig {
  mode: XRMode;
  referenceSpace: XRReferenceSpace;
  optionalFeatures?: string[];
  requiredFeatures?: string[];
  renderScale: number;
  foveationLevel: number;
}

export interface XRDeviceInfo {
  name: string;
  vendor: string;
  type: 'headset' | 'glasses' | 'mobile';
  capabilities: {
    hasPassthrough: boolean;
    hasHandTracking: boolean;
    hasEyeTracking: boolean;
    hasSpatialAudio: boolean;
    maxRenderScale: number;
  };
}

export interface XRInputSource {
  id: string;
  handedness: 'left' | 'right' | 'none';
  targetRayMode: 'gaze' | 'tap' | 'controller';
  pointerOrigin?: Matrix4;
  gripOrigin?: Matrix4;
  profiles: string[];
  gamepad?: Gamepad;
}

export interface XRPlayer {
  id: string;
  displayName: string;
  avatarUrl?: string;
  position: Vector3;
  rotation: Quaternion;
  avatar?: XRAvatar;
}

export interface XRAvatar {
  modelUrl: string;
  animationSet: string;
  skeleton: XR skeleton;
}

export interface XRSession {
  id: string;
  worldId: string;
  mode: XRMode;
  state: 'starting' | 'active' | 'paused' | 'ending';
  startedAt: string;
  referenceSpace: XRReferenceSpace;
  players: Map<string, XRPlayer>;
}

export interface XRInteraction {
  type: 'select' | 'squeeze' | 'hover' | 'drag' | 'teleport';
  source: XRInputSource;
  target?: XRInteractable;
  position: Vector3;
  timestamp: string;
}

export interface XRInteractable {
  id: string;
  type: 'object' | 'portal' | 'ui' | 'avatar';
  position: Vector3;
  rotation: Quaternion;
  scale: Vector3;
}

export interface XRSessionManager {
  // Session lifecycle
  startSession(config: XRConfig): Promise<XRSession>;
  endSession(sessionId: string): Promise<void>;
  pauseSession(sessionId: string): Promise<void>;
  resumeSession(sessionId: string): Promise<void>;
  
  // Player management
  getPlayers(sessionId: string): XRPlayer[];
  updatePlayer(sessionId: string, player: XRPlayer): void;
  removePlayer(sessionId: string, playerId: string): void;
  
  // Input
  getInputSources(): XRInputSource[];
  onInputSourceAdded(callback: (source: XRInputSource) => void): void;
  onInputSourceRemoved(callback: (source: XRInputSource) => void): void;
  
  // Interactions
  onInteraction(callback: (interaction: XRInteraction) => void): void;
  triggerHapticFeedback(inputSource: XRInputSource, intensity: number, duration: number): void;
  
  // Teleportation
  requestTeleport(position: Vector3): Promise<boolean>;
  
  // Device info
  getDeviceInfo(): XRDeviceInfo | null;
  isXRSupported(): Promise<boolean>;
}

// Factory
export function createXRSessionManager(): XRSessionManager {
  if (typeof navigator !== 'undefined' && navigator.xr) {
    return new WebXRSessionManager();
  }
  return new MockXRSessionManager();
}

// WebXR Implementation
class WebXRSessionManager implements XRSessionManager {
  private session: XRSession | null = null;
  private xrSession: XRSession | null = null;
  
  async startSession(config: XRConfig): Promise<XRSession> {
    if (!navigator.xr) {
      throw new Error('WebXR not supported');
    }
    
    const xrSession = await navigator.xr.requestSession(config.mode, {
      requiredFeatures: [config.referenceSpace],
      optionalFeatures: config.optionalFeatures,
    });
    
    this.session = {
      id: crypto.randomUUID(),
      worldId: '',
      mode: config.mode,
      state: 'starting',
      startedAt: new Date().toISOString(),
      referenceSpace: config.referenceSpace,
      players: new Map(),
    };
    
    return this.session;
  }
  
  async endSession(sessionId: string): Promise<void> {
    if (this.xrSession) {
      await this.xrSession.end();
    }
    this.session = null;
    this.xrSession = null;
  }
  
  async pauseSession(sessionId: string): Promise<void> {
    // Implementation
  }
  
  async resumeSession(sessionId: string): Promise<void> {
    // Implementation
  }
  
  getPlayers(sessionId: string): XRPlayer[] {
    return this.session?.players ? Array.from(this.session.players.values()) : [];
  }
  
  updatePlayer(sessionId: string, player: XRPlayer): void {
    this.session?.players.set(player.id, player);
  }
  
  removePlayer(sessionId: string, playerId: string): void {
    this.session?.players.delete(playerId);
  }
  
  getInputSources(): XRInputSource[] {
    return [];
  }
  
  onInputSourceAdded(callback: (source: XRInputSource) => void): void {}
  onInputSourceRemoved(callback: (source: XRInputSource) => void): void {}
  onInteraction(callback: (interaction: XRInteraction) => void): void {}
  triggerHapticFeedback(inputSource: XRInputSource, intensity: number, duration: number): void {}
  async requestTeleport(position: Vector3): Promise<boolean> { return true; }
  getDeviceInfo(): XRDeviceInfo | null { return null; }
  async isXRSupported(): Promise<boolean> { return false; }
}

// Mock Implementation
class MockXRSessionManager implements XRSessionManager {
  async startSession(config: XRConfig): Promise<XRSession> {
    return {
      id: crypto.randomUUID(),
      worldId: '',
      mode: config.mode,
      state: 'active',
      startedAt: new Date().toISOString(),
      referenceSpace: config.referenceSpace,
      players: new Map(),
    };
  }
  
  async endSession(sessionId: string): Promise<void> {}
  async pauseSession(sessionId: string): Promise<void> {}
  async resumeSession(sessionId: string): Promise<void> {}
  getPlayers(sessionId: string): XRPlayer[] { return []; }
  updatePlayer(sessionId: string, player: XRPlayer): void {}
  removePlayer(sessionId: string, playerId: string): void {}
  getInputSources(): XRInputSource[] { return []; }
  onInputSourceAdded(callback: (source: XRInputSource) => void): void {}
  onInputSourceRemoved(callback: (source: XRInputSource) => void): void {}
  onInteraction(callback: (interaction: XRInteraction) => void): void {}
  triggerHapticFeedback(inputSource: XRInputSource, intensity: number, duration: number): void {}
  async requestTeleport(position: Vector3): Promise<boolean> { return true; }
  getDeviceInfo(): XRDeviceInfo | null { return null; }
  async isXRSupported(): Promise<boolean> { return false; }
}
```

### 2.2 WebGPU Renderer Interface

```typescript
// src/integrations/xr/WebGPURenderer.ts

/**
 * WebGPU Renderer for TAMV
 * 
 * High-performance rendering using WebGPU API with support for
 * advanced rendering techniques like global illumination, physics, etc.
 */

export interface RenderConfig {
  width: number;
  height: number;
  pixelRatio: number;
  antialiasing: boolean;
  shadows: boolean;
  postProcessing: PostProcessingConfig;
  lod: LODConfig;
}

export interface PostProcessingConfig {
  bloom: boolean;
  ambientOcclusion: boolean;
  depthOfField: boolean;
  motionBlur: boolean;
  colorGrading: boolean;
}

export interface LODConfig {
  enabled: boolean;
  distances: number[];
  qualities: ['low', 'medium', 'high', 'ultra'][];
}

export interface Scene {
  id: string;
  name: string;
  objects: SceneObject[];
  lights: Light[];
  cameras: Camera[];
  skybox?: Skybox;
  physics?: PhysicsWorld;
}

export interface SceneObject {
  id: string;
  name: string;
  mesh: Mesh;
  material: Material;
  transform: Transform;
  collider?: Collider;
}

export interface Mesh {
  geometry: Geometry;
  vertexBuffer: GPUBuffer;
  indexBuffer: GPUBuffer;
}

export interface Material {
  type: 'standard' | 'pbr' | 'emissive' | 'transparent';
  albedo: Vector4;
  metalness: number;
  roughness: number;
  normalMap?: Texture;
  emissive?: Vector4;
  opacity: number;
}

export interface Light {
  id: string;
  type: 'directional' | 'point' | 'spot';
  color: Vector3;
  intensity: number;
  position?: Vector3;
  direction?: Vector3;
  castShadow: boolean;
}

export interface Camera {
  id: string;
  position: Vector3;
  rotation: Quaternion;
  fov: number;
  near: number;
  far: number;
}

export interface PhysicsWorld {
  gravity: Vector3;
  bodies: PhysicsBody[];
}

export interface PhysicsBody {
  id: string;
  mass: number;
  position: Vector3;
  rotation: Quaternion;
  velocity: Vector3;
  angularVelocity: Vector3;
  collider: Collider;
}

export interface GlobalIlluminationResult {
  lightMap: Texture;
  irradianceVolume: Texture;
}

export interface WebGPURenderer {
  // Initialization
  initialize(canvas: HTMLCanvasElement, config: RenderConfig): Promise<void>;
  destroy(): void;
  
  // Scene management
  loadScene(scene: Scene): Promise<void>;
  unloadScene(): Promise<void>;
  
  // Rendering
  render(cameraId: string): Promise<void>;
  
  // Global illumination
  computeGlobalIllumination(scene: Scene): Promise<GlobalIlluminationResult>;
  
  // Physics
  simulatePhysics(deltaTime: number): Promise<void>;
  
  // LOD
  updateLODs(cameraPosition: Vector3): void;
  
  // Asset streaming
  streamAsset(url: string, priority: number): Promise<void>;
  preloadAssets(urls: string[]): Promise<void>;
  
  // Performance
  getFPS(): number;
  getGPUInfo(): GPUInfo;
}

// Asset streaming
export interface AssetStreamingManager {
  loadWorld(worldId: string, options: StreamingOptions): Promise<void>;
  prioritizeAssets(priorities: AssetPriority[]): void;
  getProgress(): StreamingProgress;
  cancelLoading(): void;
}

export interface StreamingOptions {
  quality: 'low' | 'medium' | 'high' | 'ultra';
  preloadRadius: number;
  priorityMode: 'distance' | 'visibility' | 'custom';
}

export interface AssetPriority {
  assetId: string;
  priority: number;
}

export interface StreamingProgress {
  loaded: number;
  total: number;
  percentage: number;
  currentAsset?: string;
}
```

---

## 3. Blockchain Integration (MSR)

### 3.1 MSR Blockchain Client

```typescript
// src/integrations/blockchain/MSRBlockchain.ts

/**
 * MSR (Monitoreo, Seguridad, Respaldo) Blockchain
 * 
 * TAMV's accountable blockchain for digital ownership, economy,
 * and immutable audit trails.
 */

export interface MSRConfig {
  network: 'mainnet' | 'testnet' | 'devnet';
  nodeUrl: string;
  chainId: number;
  gasLimit: number;
  gasMultiplier: number;
}

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: BigNumber;
  data: string;
  nonce: number;
  gasPrice: BigNumber;
  gasLimit: number;
  timestamp: string;
  status: 'pending' | 'confirmed' | 'failed';
}

export interface TransactionReceipt {
  transactionHash: string;
  blockNumber: number;
  blockHash: string;
  status: boolean;
  gasUsed: number;
  logs: Log[];
}

export interface Log {
  address: string;
  topics: string[];
  data: string;
}

export interface Block {
  number: number;
  hash: string;
  parentHash: string;
  timestamp: string;
  transactions: Transaction[];
  stateRoot: string;
  receiptsRoot: string;
}

export interface Wallet {
  address: string;
  privateKey?: string;
  publicKey: string;
  balance: BigNumber;
}

// Token Contract
export interface MSRToken {
  // Read
  name(): Promise<string>;
  symbol(): Promise<string>;
  decimals(): Promise<number>;
  totalSupply(): Promise<BigNumber>;
  balanceOf(owner: string): Promise<BigNumber>;
  allowance(owner: string, spender: string): Promise<BigNumber>;
  
  // Write
  transfer(to: string, amount: BigNumber): Promise<TransactionReceipt>;
  approve(spender: string, amount: BigNumber): Promise<TransactionReceipt>;
  transferFrom(from: string, to: string, amount: BigNumber): Promise<TransactionReceipt>;
  mint(to: string, amount: BigNumber): Promise<TransactionReceipt>;
  burn(amount: BigNumber): Promise<TransactionReceipt>;
}

// NFT Contract (Soul-bound)
export interface MSRNFT {
  // Read
  name(): Promise<string>;
  symbol(): Promise<string>;
  totalSupply(): Promise<BigNumber>;
  tokenURI(tokenId: BigNumber): Promise<string>;
  ownerOf(tokenId: BigNumber): Promise<string>;
  
  // Write
  mint(to: string, tokenURI: string, metadata: NFTMetadata): Promise<TransactionReceipt>;
  burn(tokenId: BigNumber): Promise<TransactionReceipt>;
  setTokenURI(tokenId: BigNumber, tokenURI: string): Promise<TransactionReceipt>;
  
  // Soul-bound checks
  isTransferable(tokenId: BigNumber): Promise<boolean>;
}

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: NFTAttribute[];
}

export interface NFTAttribute {
  trait_type: string;
  value: string | number;
}

// Marketplace Contract
export interface MSRMarketplace {
  // Listings
  createListing(assetId: string, price: BigNumber, royaltyBps: number): Promise<TransactionReceipt>;
  updateListing(assetId: string, price: BigNumber): Promise<TransactionReceipt>;
  cancelListing(assetId: string): Promise<TransactionReceipt>;
  
  // Purchasing
  purchase(assetId: string, buyer: string): Promise<TransactionReceipt>;
  
  // Reading
  getListing(assetId: string): Promise<Listing>;
  getListings(creator: string): Promise<Listing[]>;
  getActiveListings(): Promise<Listing[]>;
}

export interface Listing {
  assetId: string;
  seller: string;
  price: BigNumber;
  royaltyBps: number;
  isActive: boolean;
  createdAt: string;
}

// MSR Blockchain Client
export interface MSRBlockchain {
  // Wallet
  createWallet(): Wallet;
  importWallet(privateKey: string): Wallet;
  
  // Transaction
  sendTransaction(tx: Partial<Transaction>): Promise<TransactionReceipt>;
  getTransaction(hash: string): Promise<Transaction>;
  getTransactionReceipt(hash: string): Promise<TransactionReceipt>;
  
  // Blocks
  getBlock(blockNumber: number): Promise<Block>;
  getLatestBlock(): Promise<Block>;
  getBlockNumber(): Promise<number>;
  
  // Contracts
  getToken(): MSRToken;
  getNFT(): MSRNFT;
  getMarketplace(): MSRMarketplace;
  
  // Query
  callContract(contract: string, method: string, args: any[]): Promise<any>;
  getBalance(address: string): Promise<BigNumber>;
}

// Quantum-Safe Cryptography
export interface QuantumCrypto {
  // Key generation
  generateKeyPair(algorithm: 'kyber' | 'dilithium'): Promise<KeyPair>;
  generateBB84Key(): Promise<BB84KeyPair>;
  
  // Encryption
  encryptKyber(plaintext: string, publicKey: string): Promise<string>;
  decryptKyber(ciphertext: string, privateKey: string): Promise<string>;
  
  // Signing
  signDilithium(message: string, privateKey: string): Promise<string>;
  verifyDilithium(message: string, signature: string, publicKey: string): Promise<boolean>;
  
  // Hashing
  quantumHash(data: string): Promise<string>;
  
  // Random
  generateQuantumRandom(length: number): Promise<string>;
}

export interface KeyPair {
  publicKey: string;
  privateKey: string;
}

export interface BB84KeyPair {
  key: string;
  basis: string[];
}
```

### 3.2 MSR Event System

```typescript
// src/integrations/blockchain/MSREvents.ts

export type MSREventType =
  | 'TRANSACTION_MINED'
  | 'TRANSACTION_FAILED'
  | 'BLOCK_NEW'
  | 'TOKEN_TRANSFER'
  | 'NFT_TRANSFER'
  | 'LISTING_CREATED'
  | 'LISTING_SOLD'
  | 'SMART_CONTRACT_EVENT';

export interface MSREvent {
  type: MSREventType;
  transactionHash?: string;
  blockNumber: number;
  timestamp: string;
  payload: Record<string, unknown>;
}

export interface MSREventListener {
  onEvent(event: MSREvent): Promise<void>;
}

export class MSREventEmitter {
  private listeners: Map<MSREventType, MSREventListener[]> = new Map();
  
  subscribe(type: MSREventType, listener: MSREventListener): void {
    const existing = this.listeners.get(type) || [];
    existing.push(listener);
    this.listeners.set(type, existing);
  }
  
  unsubscribe(type: MSREventType, listener: MSREventListener): void {
    const existing = this.listeners.get(type) || [];
    const filtered = existing.filter(l => l !== listener);
    this.listeners.set(type, filtered);
  }
  
  async emit(event: MSREvent): Promise<void> {
    const listeners = this.listeners.get(event.type) || [];
    await Promise.allSettled(listeners.map(l => l.onEvent(event)));
  }
}
```

---

## 4. External Providers

### 4.1 Payment Provider Interface

```typescript
// src/integrations/providers/PaymentProvider.ts

export type PaymentProvider = 'stripe' | 'paypal' | 'crypto';

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account' | 'crypto_wallet';
  isDefault: boolean;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed';
  clientSecret?: string;
}

export interface PaymentProvider {
  createPaymentIntent(amount: number, currency: string, metadata?: Record<string, string>): Promise<PaymentIntent>;
  confirmPayment(paymentIntentId: string): Promise<PaymentIntent>;
  getPaymentMethods(customerId: string): Promise<PaymentMethod[]>;
  addPaymentMethod(customerId: string, paymentMethodData: any): Promise<PaymentMethod>;
}

export class StripeProvider implements PaymentProvider {
  async createPaymentIntent(amount: number, currency: string, metadata?: Record<string, string>): Promise<PaymentIntent> {
    return { id: '', amount, currency, status: 'pending' };
  }
  async confirmPayment(paymentIntentId: string): Promise<PaymentIntent> {
    return { id: paymentIntentId, amount: 0, currency: 'usd', status: 'succeeded' };
  }
  async getPaymentMethods(customerId: string): Promise<PaymentMethod[]> {
    return [];
  }
  async addPaymentMethod(customerId: string, paymentMethodData: any): Promise<PaymentMethod> {
    return { id: '', type: 'card', isDefault: false };
  }
}
```

---

*Integration Interfaces Documentation - v1.0.0*
