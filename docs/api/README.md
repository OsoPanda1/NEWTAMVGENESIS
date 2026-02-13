# TAMV API Specification

## Overview

This document defines the complete REST API specification for TAMV MD-X4™ platform.

## Base URL

```
Production: https://api.tamv.io/v1
Staging: https://api.staging.tamv.io/v1
Development: http://localhost:3000/v1
```

## Authentication

All API requests require authentication via Bearer token.

```http
Authorization: Bearer <access_token>
```

## Common Headers

```http
Content-Type: application/json
Accept: application/json
X-Request-ID: <uuid>
X-TAMV-Version: 1.0.0
```

## Response Format

### Success Response

```json
{
  "success": true,
  "data": {},
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  },
  "timestamp": "2026-02-13T12:00:00Z"
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": {
      "field": "email",
      "reason": "Must be a valid email address"
    }
  },
  "timestamp": "2026-02-13T12:00:00Z",
  "requestId": "req_abc123"
}
```

## Rate Limiting

| Tier | Requests/Hour | Burst |
|------|---------------|-------|
| Free | 100 | 10 |
| Pro | 1000 | 100 |
| Enterprise | Unlimited | Unlimited |

## Endpoints Summary

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `POST /auth/refresh` - Refresh token
- `POST /auth/mfa/setup` - Setup MFA
- `POST /auth/mfa/verify` - Verify MFA
- `POST /auth/password/reset` - Request password reset
- `POST /auth/password/change` - Change password

### Users
- `GET /users/me` - Get current user
- `GET /users/:id` - Get user by ID
- `PATCH /users/me` - Update current user
- `DELETE /users/me` - Delete account
- `GET /users/:id/profile` - Get user profile
- `PATCH /users/:id/profile` - Update profile
- `POST /users/:id/follow` - Follow user
- `DELETE /users/:id/follow` - Unfollow user
- `GET /users/:id/followers` - Get followers
- `GET /users/:id/following` - Get following

### Worlds
- `GET /worlds` - List worlds
- `POST /worlds` - Create world
- `GET /worlds/:id` - Get world details
- `PATCH /worlds/:id` - Update world
- `DELETE /worlds/:id` - Delete world
- `POST /worlds/:id/join` - Join world
- `POST /worlds/:id/leave` - Leave world
- `GET /worlds/:id/players` - Get active players
- `GET /worlds/:id/assets` - Get world assets

### Assets
- `GET /assets` - List assets
- `POST /assets` - Upload asset
- `GET /assets/:id` - Get asset details
- `PATCH /assets/:id` - Update asset
- `DELETE /assets/:id` - Delete asset
- `POST /assets/:id/purchase` - Purchase asset
- `GET /assets/:id/history` - Get ownership history

### Economy
- `GET /credits/balance` - Get credit balance
- `POST /credits/purchase` - Purchase credits
- `POST /credits/transfer` - Transfer credits
- `GET /transactions` - List transactions
- `GET /transactions/:id` - Get transaction details

### Social
- `GET /posts` - List posts
- `POST /posts` - Create post
- `GET /posts/:id` - Get post
- `PATCH /posts/:id` - Update post
- `DELETE /posts/:id` - Delete post
- `POST /posts/:id/resonate` - React to post
- `POST /posts/:id/comment` - Comment on post
- `GET /posts/:id/comments` - Get comments

### AI (Isabella)
- `POST /ai/chat` - Chat with Isabella
- `POST /ai/generate` - Generate content
- `POST /ai/moderate` - Moderate content
- `GET /ai/recommendations` - Get recommendations

### XR
- `POST /xr/session/start` - Start XR session
- `POST /xr/session/end` - End XR session
- `GET /xr/session/:id` - Get session state
- `POST /xr/teleport` - Teleport player
- `POST /xr/interact` - Interact with object

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| VALIDATION_ERROR | 400 | Invalid input data |
| UNAUTHORIZED | 401 | Missing or invalid token |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| RATE_LIMITED | 429 | Too many requests |
| SERVER_ERROR | 500 | Internal server error |
| SERVICE_UNAVAILABLE | 503 | Service unavailable |

---

## Versioning

API versioning is specified in the URL path: `/v1/`

Deprecation timeline:
- 6 months notice before major version changes
- 12 months support for deprecated versions
- Legacy endpoints marked with `deprecated` flag

---

## SDKs

Official SDKs available:
- JavaScript/TypeScript: `@tamv/sdk-js`
- Python: `@tamv/sdk-python`
- Go: `@tamv/sdk-go`
- Unity: `@tamv/sdk-unity`

---

*Last updated: 2026-02-13*
