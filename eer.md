# Enhanced Entity-Relationship (EER) Diagram — Dako Emergency Service System (SERDS)

> This document provides every detail needed to draw a complete EER diagram for the system.
> Entities marked with **[EXISTS]** are already implemented in the codebase.
> Entities marked with **[NEW]** are proposed additions for the complete system.

---

## 1. Entities & Attributes

---

### 1.1 BaseUser (Superclass / Parent Entity) — [EXISTS]

| Attribute    | Data Type       | Constraint                          | Key  |
|--------------|-----------------|-------------------------------------|------|
| id           | Long (BIGINT)   | AUTO_INCREMENT, NOT NULL            | PK   |
| fullName     | String (VARCHAR) | NOT NULL                           |      |
| nid          | String (VARCHAR) | UNIQUE, NOT NULL                   | AK   |
| phoneNumber  | String (VARCHAR) | UNIQUE, NOT NULL                   | AK   |
| email        | String (VARCHAR) | UNIQUE, Nullable                   | AK   |
| password     | String (VARCHAR) | NOT NULL                           |      |
| role         | Enum (VARCHAR)  | NOT NULL — values: CITIZEN, RESPONDER, ADMIN | Discriminator |
| profileImageUrl | String (VARCHAR) | Nullable                        |      |
| latitude     | Double          | Nullable — live GPS latitude        |      |
| longitude    | Double          | Nullable — live GPS longitude       |      |
| isActive     | Boolean         | Default = true                      |      |
| lastLoginAt  | LocalDateTime   | Nullable                           |      |
| createdAt    | LocalDateTime   | Auto-set on creation, non-updatable |      |
| updatedAt    | LocalDateTime   | Auto-updated on modification        |      |

- **Table Name:** `users`
- **Inheritance Strategy:** JOINED (each subclass has its own table linked by PK)

---

### 1.2 Citizen (Subclass of BaseUser) — [EXISTS]

| Attribute              | Data Type       | Constraint  | Key |
|------------------------|-----------------|-------------|-----|
| *(inherits id)*        | Long (BIGINT)   | FK → users.id | PK/FK |
| homeAddress            | String (VARCHAR) | Nullable   |     |
| emergencyContactNumber | String (VARCHAR) | Nullable   |     |
| bloodGroup             | String (VARCHAR) | Nullable — e.g. A+, O- |     |
| medicalConditions      | String (TEXT)    | Nullable — known allergies, conditions |     |
| dateOfBirth            | LocalDate        | Nullable   |     |

- **Table Name:** `citizens`
- **Discriminator Value:** `CITIZEN`

---

### 1.3 Responder (Subclass of BaseUser) — [EXISTS]

| Attribute                  | Data Type       | Constraint                                    | Key   |
|----------------------------|-----------------|-----------------------------------------------|-------|
| *(inherits id)*            | Long (BIGINT)   | FK → users.id                                 | PK/FK |
| serviceType                | Enum (VARCHAR)  | Values: POLICE, AMBULANCE, FIRE_SERVICE       |       |
| badgeNumber                | String (VARCHAR) | UNIQUE, Nullable                             | AK    |
| vehicleRegistrationNumber  | String (VARCHAR) | Nullable                                     |       |
| currentStatus              | String (VARCHAR) | Default = "OFFLINE"                           |       |
| isAvailable                | Boolean         | Default = true                                |       |
| station_id                 | Long (BIGINT)   | FK → stations.id, Nullable                    | FK    |
| rating                     | Double          | Default = 5.0 — average rating from citizens  |       |
| totalResponseCount         | Integer         | Default = 0                                   |       |

- **Table Name:** `responders`
- **Discriminator Value:** `RESPONDER`

---

### 1.4 Admin (Subclass of BaseUser) — [EXISTS]

| Attribute        | Data Type       | Constraint                          | Key   |
|------------------|-----------------|-------------------------------------|-------|
| *(inherits id)*  | Long (BIGINT)   | FK → users.id                       | PK/FK |
| department       | String (VARCHAR) | Default = "GENERAL_ADMINISTRATION" |       |
| accessLevel      | Enum (VARCHAR)  | Values: SUPER_ADMIN, REGIONAL_ADMIN, OPERATOR | |
| station_id       | Long (BIGINT)   | FK → stations.id, Nullable          | FK    |

- **Table Name:** `admins`
- **Discriminator Value:** `ADMIN`

---

### 1.5 EmergencyRequest (Regular Entity) — [EXISTS]

| Attribute     | Data Type        | Constraint                                                         | Key |
|---------------|------------------|--------------------------------------------------------------------|-----|
| id            | Long (BIGINT)    | AUTO_INCREMENT, NOT NULL                                           | PK  |
| citizen_id    | Long (BIGINT)    | FK → users.id, NOT NULL                                           | FK  |
| responder_id  | Long (BIGINT)    | FK → users.id, Nullable (null until dispatch)                     | FK  |
| emergencyType | Enum (VARCHAR)   | NOT NULL — values: POLICE, MEDICAL, FIRE, GENERAL                 |     |
| severity      | Enum (VARCHAR)   | NOT NULL, Default = MEDIUM — values: LOW, MEDIUM, HIGH, CRITICAL  |     |
| status        | Enum (VARCHAR)   | NOT NULL, Default = PENDING — values: PENDING, DISPATCHED, EN_ROUTE, ARRIVED, RESOLVED, CANCELLED |     |
| description   | String (TEXT)    | Nullable — free text description of the emergency                 |     |
| latitude      | Double           | NOT NULL — citizen's SOS location at trigger time                  |     |
| longitude     | Double           | NOT NULL — citizen's SOS location at trigger time                  |     |
| address       | String (TEXT)    | Nullable — reverse-geocoded human-readable address                 |     |
| imageUrl      | String (VARCHAR) | Nullable — Image URL sent for AI analysis                          |     |
| baseFare      | Double           | Nullable — Base rate for the selected service                      |     |
| perKmFare     | Double           | Nullable — Dynamic per kilometer fare                              |     |
| totalDistanceKm | Double         | Nullable — Computed Haversine trip distance                        |     |
| totalFare     | Double           | Nullable — Final dynamically computed trip fare                    |     |
| createdAt     | LocalDateTime    | Auto-set on creation, non-updatable                                |     |
| dispatchedAt  | LocalDateTime    | Nullable — timestamp when a responder was assigned                 |     |
| arrivedAt     | LocalDateTime    | Nullable — timestamp when responder reached scene                  |     |
| resolvedAt    | LocalDateTime    | Nullable — timestamp when the emergency was resolved               |     |
| cancelledAt   | LocalDateTime    | Nullable — timestamp if cancelled                                  |     |
| cancelReason  | String (TEXT)    | Nullable — reason for cancellation                                 |     |

- **Table Name:** `emergency_requests`

---

### 1.6 Station (New Entity) — [NEW]

> A physical facility where responders are based (police station, fire station, hospital).

| Attribute     | Data Type        | Constraint                                          | Key |
|---------------|------------------|-----------------------------------------------------|-----|
| id            | Long (BIGINT)    | AUTO_INCREMENT, NOT NULL                            | PK  |
| name          | String (VARCHAR) | NOT NULL — e.g. "Dhanmondi Fire Station"            |     |
| stationType   | Enum (VARCHAR)   | NOT NULL — values: POLICE_STATION, FIRE_STATION, HOSPITAL |   |
| address       | String (TEXT)    | NOT NULL                                            |     |
| latitude      | Double           | NOT NULL                                            |     |
| longitude     | Double           | NOT NULL                                            |     |
| phoneNumber   | String (VARCHAR) | NOT NULL                                            |     |
| capacity      | Integer          | Nullable — max number of responders                 |     |
| isOperational | Boolean          | Default = true                                      |     |
| zone_id       | Long (BIGINT)    | FK → zones.id, Nullable                             | FK  |
| createdAt     | LocalDateTime    | Auto-set                                            |     |

- **Table Name:** `stations`

---

### 1.7 Zone (New Entity) — [NEW]

> Geographic jurisdiction/region for dispatch load-balancing and admin management.

| Attribute     | Data Type        | Constraint                                | Key |
|---------------|------------------|-------------------------------------------|-----|
| id            | Long (BIGINT)    | AUTO_INCREMENT, NOT NULL                  | PK  |
| name          | String (VARCHAR) | NOT NULL, UNIQUE — e.g. "Dhaka North"    | AK  |
| description   | String (TEXT)    | Nullable                                  |     |
| boundaryNorthLat | Double        | NOT NULL — bounding box north latitude    |     |
| boundarySouthLat | Double        | NOT NULL — bounding box south latitude    |     |
| boundaryEastLng  | Double        | NOT NULL — bounding box east longitude    |     |
| boundaryWestLng  | Double        | NOT NULL — bounding box west longitude    |     |
| isActive      | Boolean          | Default = true                            |     |
| createdAt     | LocalDateTime    | Auto-set                                  |     |

- **Table Name:** `zones`

---

### 1.8 Vehicle (New Entity) — [NEW]

> A dedicated entity for emergency vehicles, replacing the simple `vehicleRegistrationNumber` string on Responder.

| Attribute         | Data Type        | Constraint                                              | Key |
|-------------------|------------------|---------------------------------------------------------|-----|
| id                | Long (BIGINT)    | AUTO_INCREMENT, NOT NULL                                | PK  |
| registrationNumber| String (VARCHAR) | UNIQUE, NOT NULL                                        | AK  |
| vehicleType       | Enum (VARCHAR)   | NOT NULL — values: PATROL_CAR, AMBULANCE, FIRE_TRUCK, MOTORCYCLE |  |
| make              | String (VARCHAR) | Nullable — e.g. "Toyota"                                |     |
| model             | String (VARCHAR) | Nullable — e.g. "Hiace"                                 |     |
| year              | Integer          | Nullable                                                |     |
| currentStatus     | Enum (VARCHAR)   | Default = AVAILABLE — values: AVAILABLE, IN_USE, MAINTENANCE, RETIRED |  |
| station_id        | Long (BIGINT)    | FK → stations.id, Nullable                              | FK  |
| responder_id      | Long (BIGINT)    | FK → users.id, Nullable — currently assigned driver      | FK  |
| fuelLevel         | Double           | Nullable — percentage 0-100                              |     |
| lastServiceDate   | LocalDate        | Nullable                                                |     |
| createdAt         | LocalDateTime    | Auto-set                                                |     |

- **Table Name:** `vehicles`

---

### 1.9 IncidentReport (New Entity) — [NEW]

> A formal report filed by the responder after resolving an emergency. Weak entity of EmergencyRequest.

| Attribute         | Data Type        | Constraint                                | Key    |
|-------------------|------------------|-------------------------------------------|--------|
| id                | Long (BIGINT)    | AUTO_INCREMENT, NOT NULL                  | PK     |
| request_id        | Long (BIGINT)    | FK → emergency_requests.id, UNIQUE, NOT NULL | FK/AK |
| responder_id      | Long (BIGINT)    | FK → users.id, NOT NULL                   | FK     |
| reportText        | String (TEXT)    | NOT NULL — detailed incident description   |        |
| actionsTaken      | String (TEXT)    | NOT NULL — what the responder did          |        |
| casualtyCount     | Integer          | Default = 0                               |        |
| injuryCount       | Integer          | Default = 0                               |        |
| propertyDamage    | Boolean          | Default = false                           |        |
| evidenceImageUrls | String (TEXT)    | Nullable — JSON array of image URLs        |        |
| createdAt         | LocalDateTime    | Auto-set                                  |        |

- **Table Name:** `incident_reports`
- **Note:** This is a **weak entity** — it cannot exist without its parent EmergencyRequest.

---

### 1.10 Rating (New Entity) — [NEW]

> Feedback/rating given by a citizen after an emergency is resolved (like Uber's rating system).

| Attribute     | Data Type        | Constraint                                     | Key |
|---------------|------------------|-------------------------------------------------|-----|
| id            | Long (BIGINT)    | AUTO_INCREMENT, NOT NULL                        | PK  |
| request_id    | Long (BIGINT)    | FK → emergency_requests.id, UNIQUE, NOT NULL    | FK  |
| citizen_id    | Long (BIGINT)    | FK → users.id, NOT NULL                         | FK  |
| responder_id  | Long (BIGINT)    | FK → users.id, NOT NULL                         | FK  |
| score         | Integer          | NOT NULL — range 1 to 5                         |     |
| comment       | String (TEXT)    | Nullable — optional written feedback             |     |
| createdAt     | LocalDateTime    | Auto-set                                        |     |

- **Table Name:** `ratings`

---

### 1.11 Notification (New Entity) — [NEW]

> Push/in-app notifications sent to users during the emergency lifecycle.

| Attribute     | Data Type        | Constraint                                              | Key |
|---------------|------------------|---------------------------------------------------------|-----|
| id            | Long (BIGINT)    | AUTO_INCREMENT, NOT NULL                                | PK  |
| recipient_id  | Long (BIGINT)    | FK → users.id, NOT NULL                                 | FK  |
| request_id    | Long (BIGINT)    | FK → emergency_requests.id, Nullable                    | FK  |
| title         | String (VARCHAR) | NOT NULL — e.g. "Responder Dispatched"                  |     |
| message       | String (TEXT)    | NOT NULL                                                |     |
| type          | Enum (VARCHAR)   | NOT NULL — values: SOS_ALERT, DISPATCH, STATUS_UPDATE, SYSTEM, RATING_REQUEST |  |
| isRead        | Boolean          | Default = false                                         |     |
| createdAt     | LocalDateTime    | Auto-set                                                |     |

- **Table Name:** `notifications`

---

### 1.12 DispatchLog (New Entity) — [NEW]

> An audit trail tracking every state transition and dispatch decision. Every action on a request is logged here.

| Attribute     | Data Type        | Constraint                                       | Key |
|---------------|------------------|--------------------------------------------------|-----|
| id            | Long (BIGINT)    | AUTO_INCREMENT, NOT NULL                         | PK  |
| request_id    | Long (BIGINT)    | FK → emergency_requests.id, NOT NULL             | FK  |
| performedBy_id| Long (BIGINT)    | FK → users.id, Nullable — who triggered action   | FK  |
| previousStatus| Enum (VARCHAR)   | Nullable — status before transition               |     |
| newStatus     | Enum (VARCHAR)   | NOT NULL — status after transition                |     |
| action        | Enum (VARCHAR)   | NOT NULL — values: CREATED, ASSIGNED, REASSIGNED, STATUS_CHANGE, CANCELLED, RESOLVED |  |
| notes         | String (TEXT)    | Nullable — optional description                  |     |
| createdAt     | LocalDateTime    | Auto-set                                         |     |

- **Table Name:** `dispatch_logs`

---

### 1.13 ChatMessage (New Entity) — [NEW]

> Real-time messages exchanged between citizen and responder during an active emergency.

| Attribute     | Data Type        | Constraint                                     | Key |
|---------------|------------------|-------------------------------------------------|-----|
| id            | Long (BIGINT)    | AUTO_INCREMENT, NOT NULL                        | PK  |
| request_id    | Long (BIGINT)    | FK → emergency_requests.id, NOT NULL            | FK  |
| sender_id     | Long (BIGINT)    | FK → users.id, NOT NULL                         | FK  |
| messageText   | String (TEXT)    | NOT NULL                                        |     |
| messageType   | Enum (VARCHAR)   | Default = TEXT — values: TEXT, IMAGE, LOCATION   |     |
| isRead        | Boolean          | Default = false                                 |     |
| createdAt     | LocalDateTime    | Auto-set                                        |     |

- **Table Name:** `chat_messages`

---

### 1.14 EmergencyContact (New Entity) — [NEW]

> A citizen can register multiple trusted contacts who get auto-notified during SOS.
> This is a **multi-valued attribute** extracted into its own entity.

| Attribute     | Data Type        | Constraint                           | Key |
|---------------|------------------|--------------------------------------|-----|
| id            | Long (BIGINT)    | AUTO_INCREMENT, NOT NULL             | PK  |
| citizen_id    | Long (BIGINT)    | FK → users.id, NOT NULL             | FK  |
| contactName   | String (VARCHAR) | NOT NULL                             |     |
| phoneNumber   | String (VARCHAR) | NOT NULL                             |     |
| relationship  | String (VARCHAR) | Nullable — e.g. "Father", "Spouse"  |     |
| isPrimary     | Boolean          | Default = false                      |     |
| createdAt     | LocalDateTime    | Auto-set                             |     |

- **Table Name:** `emergency_contacts`

---

### 1.15 Shift (New Entity) — [NEW]

> Work schedule for responders — tracks when a responder is on-duty.

| Attribute     | Data Type        | Constraint                           | Key |
|---------------|------------------|--------------------------------------|-----|
| id            | Long (BIGINT)    | AUTO_INCREMENT, NOT NULL             | PK  |
| responder_id  | Long (BIGINT)    | FK → users.id, NOT NULL             | FK  |
| station_id    | Long (BIGINT)    | FK → stations.id, NOT NULL          | FK  |
| startTime     | LocalDateTime    | NOT NULL                             |     |
| endTime       | LocalDateTime    | NOT NULL                             |     |
| shiftType     | Enum (VARCHAR)   | Values: DAY, NIGHT, OVERTIME         |     |
| status        | Enum (VARCHAR)   | Default = SCHEDULED — values: SCHEDULED, ACTIVE, COMPLETED, ABSENT |  |
| createdAt     | LocalDateTime    | Auto-set                             |     |

- **Table Name:** `shifts`

---

### 1.16 SOSMedia (New Entity) — [NEW]

> Photos/videos/audio captured by the citizen's phone when they trigger SOS, attached as evidence.

| Attribute     | Data Type        | Constraint                           | Key |
|---------------|------------------|--------------------------------------|-----|
| id            | Long (BIGINT)    | AUTO_INCREMENT, NOT NULL             | PK  |
| request_id    | Long (BIGINT)    | FK → emergency_requests.id, NOT NULL | FK  |
| mediaUrl      | String (TEXT)    | NOT NULL — cloud storage URL          |     |
| mediaType     | Enum (VARCHAR)   | NOT NULL — values: IMAGE, VIDEO, AUDIO |   |
| fileSize      | Long             | Nullable — bytes                      |     |
| uploadedAt    | LocalDateTime    | Auto-set                             |     |

- **Table Name:** `sos_media`

---

### 1.17 AIAnalysisResult (New Entity) — [NEW]

> Stores the deep learning model's computer vision output when it processes citizen uploads (e.g., verifying a Fire emergency).

| Attribute     | Data Type        | Constraint                                     | Key |
|---------------|------------------|------------------------------------------------|-----|
| id            | Long (BIGINT)    | AUTO_INCREMENT, NOT NULL                       | PK  |
| request_id    | Long (BIGINT)    | FK → emergency_requests.id, UNIQUE, NOT NULL   | FK  |
| isDetected    | Boolean          | NOT NULL — True if the AI confirmed the threat |     |
| confidence    | Double           | NOT NULL — AI confidence score (0.0 to 1.0)    |     |
| modelVersion  | String (VARCHAR) | Nullable — Version of the AI model used        |     |
| boundingBoxes | String (TEXT)    | Nullable — JSON array of detection coordinates |     |
| analyzedAt    | LocalDateTime    | Auto-set upon analysis completion              |     |

- **Table Name:** `ai_analysis_results`
- **Note:** This is a **weak entity** identifying the AI's conclusion for a specific EmergencyRequest.

---

## 2. Enumerations (All Enum Types)

### 2.1 Role
```
CITIZEN | RESPONDER | ADMIN
```
Used by: `BaseUser.role`

### 2.2 ServiceType
```
POLICE | AMBULANCE | FIRE_SERVICE
```
Used by: `Responder.serviceType`

### 2.3 EmergencyType
```
POLICE | MEDICAL | FIRE | GENERAL
```
Used by: `EmergencyRequest.emergencyType`

### 2.4 EmergencyStatus
```
PENDING → DISPATCHED → EN_ROUTE → ARRIVED → RESOLVED
                                             ↗
                              CANCELLED ────┘
```
Used by: `EmergencyRequest.status`

### 2.5 Severity — [NEW]
```
LOW | MEDIUM | HIGH | CRITICAL
```
Used by: `EmergencyRequest.severity`

### 2.6 StationType — [NEW]
```
POLICE_STATION | FIRE_STATION | HOSPITAL
```
Used by: `Station.stationType`

### 2.7 VehicleType — [NEW]
```
PATROL_CAR | AMBULANCE | FIRE_TRUCK | MOTORCYCLE
```
Used by: `Vehicle.vehicleType`

### 2.8 VehicleStatus — [NEW]
```
AVAILABLE | IN_USE | MAINTENANCE | RETIRED
```
Used by: `Vehicle.currentStatus`

### 2.9 AccessLevel — [NEW]
```
SUPER_ADMIN | REGIONAL_ADMIN | OPERATOR
```
Used by: `Admin.accessLevel`

### 2.10 NotificationType — [NEW]
```
SOS_ALERT | DISPATCH | STATUS_UPDATE | SYSTEM | RATING_REQUEST
```
Used by: `Notification.type`

### 2.11 DispatchAction — [NEW]
```
CREATED | ASSIGNED | REASSIGNED | STATUS_CHANGE | CANCELLED | RESOLVED
```
Used by: `DispatchLog.action`

### 2.12 MessageType — [NEW]
```
TEXT | IMAGE | LOCATION
```
Used by: `ChatMessage.messageType`

### 2.13 MediaType — [NEW]
```
IMAGE | VIDEO | AUDIO
```
Used by: `SOSMedia.mediaType`

### 2.14 ShiftType — [NEW]
```
DAY | NIGHT | OVERTIME
```
Used by: `Shift.shiftType`

### 2.15 ShiftStatus — [NEW]
```
SCHEDULED | ACTIVE | COMPLETED | ABSENT
```
Used by: `Shift.status`

---

## 3. Relationships

---

### 3.1 Generalization / Specialization (IS-A) — **The Core EER Part**

```
                    ┌──────────┐
                    │ BaseUser │  (Superclass — Abstract)
                    └────┬─────┘
                         │
              ┌──── d, total ────┐
              │          │        │
         ┌────▼───┐ ┌───▼─────┐ ┌▼──────┐
         │Citizen │ │Responder│ │ Admin │
         └────────┘ └─────────┘ └───────┘
```

| Property              | Value                                       |
|-----------------------|---------------------------------------------|
| **Inheritance Type**  | JOINED (each subclass gets its own table)   |
| **Disjointness**      | **Disjoint (d)** — a user can only be one type at a time (enforced by the `role` discriminator) |
| **Completeness**      | **Total** — every BaseUser must be a Citizen, Responder, or Admin (BaseUser is abstract) |
| **Discriminator**     | `role` attribute (CITIZEN / RESPONDER / ADMIN) |

> **How to draw:** Use the EER specialization circle/triangle notation. Place a "d" inside the circle to indicate disjoint, and a double line from BaseUser to the circle to indicate total participation.

---

### 3.2 Citizen — *creates* → EmergencyRequest

```
┌────────┐              ┌───────────────────┐
│Citizen │ 1 ═══════ M  │ EmergencyRequest  │
└────────┘    creates    └───────────────────┘
```

| Property             | Value                              |
|----------------------|------------------------------------|
| Relationship Name    | **creates** (or "submits")         |
| Citizen participation | **Partial** — a citizen may not have created any requests |
| EmergencyRequest participation | **Total** — every request MUST have a citizen (`citizen_id` NOT NULL) |
| Cardinality          | **1:N** — one citizen → many requests; each request → exactly one citizen |
| FK                   | `emergency_requests.citizen_id` → `users.id` |

---

### 3.3 Responder — *responds to* → EmergencyRequest

```
┌──────────┐              ┌───────────────────┐
│Responder │ 1 ──────── M │ EmergencyRequest  │
└──────────┘  responds_to  └───────────────────┘
```

| Property             | Value                              |
|----------------------|------------------------------------|
| Relationship Name    | **responds_to** (or "is_assigned_to") |
| Responder participation | **Partial** — may not be assigned to any requests |
| EmergencyRequest participation | **Partial** — may not yet have a responder (`responder_id` NULLABLE) |
| Cardinality          | **1:N** — one responder → many requests; each request → at most one responder |
| FK                   | `emergency_requests.responder_id` → `users.id` |

---

### 3.4 Responder — *belongs to* → Station — [NEW]

```
┌──────────┐              ┌─────────┐
│Responder │ N ──────── 1 │ Station │
└──────────┘  belongs_to   └─────────┘
```

| Property             | Value                              |
|----------------------|------------------------------------|
| Relationship Name    | **belongs_to**                     |
| Responder participation | **Partial** — a responder may not yet be assigned to a station |
| Station participation | **Partial** — a station may have zero responders |
| Cardinality          | **N:1** — many responders can belong to one station |
| FK                   | `responders.station_id` → `stations.id` |

---

### 3.5 Admin — *oversees* → Station — [NEW]

```
┌───────┐              ┌─────────┐
│ Admin │ N ──────── 1 │ Station │
└───────┘   oversees    └─────────┘
```

| Property             | Value                              |
|----------------------|------------------------------------|
| Relationship Name    | **oversees**                       |
| Admin participation  | **Partial** — an admin may manage the whole system, not a specific station |
| Station participation | **Partial** — a station may not have an admin assigned |
| Cardinality          | **N:1** — many admins can oversee one station |
| FK                   | `admins.station_id` → `stations.id` |

---

### 3.6 Station — *located in* → Zone — [NEW]

```
┌─────────┐              ┌──────┐
│ Station │ N ──────── 1 │ Zone │
└─────────┘  located_in   └──────┘
```

| Property             | Value                              |
|----------------------|------------------------------------|
| Relationship Name    | **located_in**                     |
| Station participation | **Partial** — a station may not be assigned to a zone yet |
| Zone participation   | **Partial** — a zone may not have stations yet |
| Cardinality          | **N:1** — many stations belong to one zone |
| FK                   | `stations.zone_id` → `zones.id` |

---

### 3.7 Vehicle — *housed at* → Station — [NEW]

```
┌─────────┐              ┌─────────┐
│ Vehicle │ N ──────── 1 │ Station │
└─────────┘  housed_at    └─────────┘
```

| Property             | Value                              |
|----------------------|------------------------------------|
| Relationship Name    | **housed_at**                      |
| Vehicle participation | **Partial** — vehicle may not be assigned to a station |
| Station participation | **Partial** — a station may have zero vehicles |
| Cardinality          | **N:1** — many vehicles at one station |
| FK                   | `vehicles.station_id` → `stations.id` |

---

### 3.8 Vehicle — *assigned to* → Responder — [NEW]

```
┌─────────┐              ┌──────────┐
│ Vehicle │ 1 ──────── 1 │Responder │
└─────────┘ assigned_to   └──────────┘
```

| Property             | Value                              |
|----------------------|------------------------------------|
| Relationship Name    | **assigned_to**                    |
| Vehicle participation | **Partial** — a vehicle may be unassigned |
| Responder participation | **Partial** — a responder may not have a vehicle |
| Cardinality          | **1:1** — one vehicle assigned to one responder at a time |
| FK                   | `vehicles.responder_id` → `users.id` |

---

### 3.9 EmergencyRequest — *has* → IncidentReport — [NEW]

```
┌───────────────────┐              ┌────────────────┐
│ EmergencyRequest  │ 1 ═══════ 1 │ IncidentReport │
└───────────────────┘     has      └────────────────┘
```

| Property             | Value                              |
|----------------------|------------------------------------|
| Relationship Name    | **has**                            |
| EmergencyRequest participation | **Partial** — not all requests will have a report (only resolved ones) |
| IncidentReport participation | **Total** — every report MUST belong to a request (`request_id` NOT NULL, UNIQUE) |
| Cardinality          | **1:1** — one request → at most one report |
| FK                   | `incident_reports.request_id` → `emergency_requests.id` |
| **Weak Entity**      | IncidentReport is a weak entity of EmergencyRequest |

---

### 3.10 EmergencyRequest — *receives* → Rating — [NEW]

```
┌───────────────────┐              ┌────────┐
│ EmergencyRequest  │ 1 ──────── 1 │ Rating │
└───────────────────┘   receives    └────────┘
```

| Property             | Value                              |
|----------------------|------------------------------------|
| Relationship Name    | **receives**                       |
| EmergencyRequest participation | **Partial** — not all requests get rated |
| Rating participation | **Total** — every rating MUST link to a request (`request_id` NOT NULL, UNIQUE) |
| Cardinality          | **1:1** — one request → at most one rating |
| FK                   | `ratings.request_id` → `emergency_requests.id` |

---

### 3.11 Citizen — *gives* → Rating — [NEW]

```
┌────────┐              ┌────────┐
│Citizen │ 1 ──────── N │ Rating │
└────────┘    gives      └────────┘
```

| Property             | Value                              |
|----------------------|------------------------------------|
| Relationship Name    | **gives**                          |
| Citizen participation | **Partial** — a citizen may not have given any ratings |
| Rating participation | **Total** — every rating MUST come from a citizen |
| Cardinality          | **1:N** — one citizen can give many ratings |
| FK                   | `ratings.citizen_id` → `users.id` |

---

### 3.12 Responder — *rated by* → Rating — [NEW]

```
┌──────────┐              ┌────────┐
│Responder │ 1 ──────── N │ Rating │
└──────────┘   rated_by    └────────┘
```

| Property             | Value                              |
|----------------------|------------------------------------|
| Relationship Name    | **rated_by**                       |
| Responder participation | **Partial** — a responder may not have ratings yet |
| Rating participation | **Total** — every rating MUST reference a responder |
| Cardinality          | **1:N** — one responder can have many ratings |
| FK                   | `ratings.responder_id` → `users.id` |

---

### 3.13 BaseUser — *receives* → Notification — [NEW]

```
┌──────────┐              ┌──────────────┐
│ BaseUser │ 1 ═══════ N  │ Notification │
└──────────┘   receives    └──────────────┘
```

| Property             | Value                              |
|----------------------|------------------------------------|
| Relationship Name    | **receives**                       |
| BaseUser participation | **Partial** — a user may have no notifications |
| Notification participation | **Total** — every notification MUST have a recipient |
| Cardinality          | **1:N** — one user → many notifications |
| FK                   | `notifications.recipient_id` → `users.id` |

---

### 3.14 EmergencyRequest — *triggers* → Notification — [NEW]

```
┌───────────────────┐              ┌──────────────┐
│ EmergencyRequest  │ 1 ──────── N │ Notification │
└───────────────────┘   triggers    └──────────────┘
```

| Property             | Value                              |
|----------------------|------------------------------------|
| Relationship Name    | **triggers**                       |
| EmergencyRequest participation | **Partial** — system notifications may not be tied to a request |
| Notification participation | **Partial** — some notifications are system-wide (no request) |
| Cardinality          | **1:N** — one request → many notifications |
| FK                   | `notifications.request_id` → `emergency_requests.id` |

---

### 3.15 EmergencyRequest — *logged in* → DispatchLog — [NEW]

```
┌───────────────────┐              ┌─────────────┐
│ EmergencyRequest  │ 1 ═══════ N  │ DispatchLog │
└───────────────────┘   logged_in   └─────────────┘
```

| Property             | Value                              |
|----------------------|------------------------------------|
| Relationship Name    | **logged_in** (or "audited_by")    |
| EmergencyRequest participation | **Partial** — a new request may not have logs yet |
| DispatchLog participation | **Total** — every log entry MUST reference a request |
| Cardinality          | **1:N** — one request → many log entries (one per state change) |
| FK                   | `dispatch_logs.request_id` → `emergency_requests.id` |

---

### 3.16 EmergencyRequest — *contains* → ChatMessage — [NEW]

```
┌───────────────────┐              ┌─────────────┐
│ EmergencyRequest  │ 1 ═══════ N  │ ChatMessage │
└───────────────────┘   contains    └─────────────┘
```

| Property             | Value                              |
|----------------------|------------------------------------|
| Relationship Name    | **contains**                       |
| EmergencyRequest participation | **Partial** — not all emergencies use the chat |
| ChatMessage participation | **Total** — every message MUST belong to a request |
| Cardinality          | **1:N** — one request → many messages |
| FK                   | `chat_messages.request_id` → `emergency_requests.id` |

---

### 3.17 BaseUser — *sends* → ChatMessage — [NEW]

```
┌──────────┐              ┌─────────────┐
│ BaseUser │ 1 ──────── N │ ChatMessage │
└──────────┘    sends      └─────────────┘
```

| Property             | Value                              |
|----------------------|------------------------------------|
| Relationship Name    | **sends**                          |
| BaseUser participation | **Partial** — not all users send chat messages |
| ChatMessage participation | **Total** — every message has a sender |
| Cardinality          | **1:N** — one user → many messages |
| FK                   | `chat_messages.sender_id` → `users.id` |

---

### 3.18 Citizen — *registers* → EmergencyContact — [NEW]

```
┌────────┐              ┌────────────────────┐
│Citizen │ 1 ═══════ N  │ EmergencyContact   │
└────────┘  registers    └────────────────────┘
```

| Property             | Value                              |
|----------------------|------------------------------------|
| Relationship Name    | **registers**                      |
| Citizen participation | **Partial** — a citizen may not have registered any contacts |
| EmergencyContact participation | **Total** — every contact MUST belong to a citizen |
| Cardinality          | **1:N** — one citizen → many emergency contacts |
| FK                   | `emergency_contacts.citizen_id` → `users.id` |
| **Multi-valued Attr** | This entity represents extracted multi-valued attribute |

---

### 3.19 Responder — *works* → Shift — [NEW]

```
┌──────────┐              ┌───────┐
│Responder │ 1 ═══════ N  │ Shift │
└──────────┘    works      └───────┘
```

| Property             | Value                              |
|----------------------|------------------------------------|
| Relationship Name    | **works**                          |
| Responder participation | **Total** — every responder must have at least one shift |
| Shift participation  | **Total** — every shift MUST belong to a responder |
| Cardinality          | **1:N** — one responder → many shifts |
| FK                   | `shifts.responder_id` → `users.id` |

---

### 3.20 Station — *schedules* → Shift — [NEW]

```
┌─────────┐              ┌───────┐
│ Station │ 1 ═══════ N  │ Shift │
└─────────┘  schedules    └───────┘
```

| Property             | Value                              |
|----------------------|------------------------------------|
| Relationship Name    | **schedules**                      |
| Station participation | **Partial** — a station may not have shifts yet |
| Shift participation  | **Total** — every shift is at a station |
| Cardinality          | **1:N** — one station → many shifts |
| FK                   | `shifts.station_id` → `stations.id` |

---

### 3.21 EmergencyRequest — *has* → SOSMedia — [NEW]

```
┌───────────────────┐              ┌──────────┐
│ EmergencyRequest  │ 1 ──────── N │ SOSMedia │
└───────────────────┘     has       └──────────┘
```

| Property             | Value                              |
|----------------------|------------------------------------|
| Relationship Name    | **has**                            |
| EmergencyRequest participation | **Partial** — not all SOS calls include media |
| SOSMedia participation | **Total** — every media file MUST belong to a request |
| Cardinality          | **1:N** — one request → many media files |
| FK                   | `sos_media.request_id` → `emergency_requests.id` |

---

### 3.22 EmergencyRequest — *verified by* → AIAnalysisResult — [NEW]

```
┌───────────────────┐              ┌──────────────────┐
│ EmergencyRequest  │ 1 ═══════ 1 │ AIAnalysisResult │
└───────────────────┘ verified_by  └──────────────────┘
```

| Property             | Value                              |
|----------------------|------------------------------------|
| Relationship Name    | **verified_by**                    |
| EmergencyRequest participation | **Partial** — not all requests require AI computer vision |
| AIAnalysisResult participation | **Total** — every AI result MUST belong to an emergency request |
| Cardinality          | **1:1** — one request → at most one AI analysis |
| FK                   | `ai_analysis_results.request_id` → `emergency_requests.id` |
| **Weak Entity**      | AIAnalysisResult is a weak entity of EmergencyRequest |

---

### 3.22 Responder — *files* → IncidentReport — [NEW]

```
┌──────────┐              ┌────────────────┐
│Responder │ 1 ──────── N │ IncidentReport │
└──────────┘    files      └────────────────┘
```

| Property             | Value                              |
|----------------------|------------------------------------|
| Relationship Name    | **files**                          |
| Responder participation | **Partial** — a responder may not have filed any reports yet |
| IncidentReport participation | **Total** — every report MUST be filed by a responder |
| Cardinality          | **1:N** — one responder → many reports across different emergencies |
| FK                   | `incident_reports.responder_id` → `users.id` |

---

## 4. Summary of All Cardinalities

| # | Relationship           | Entity A           | Card.  | Entity B           | A Participation | B Participation |
|---|------------------------|-----------------------|:------:|--------------------|-:-:-------------:|:---------------:|
| 1 | IS-A (Generalization)  | BaseUser              | 1:1    | Citizen            | Total           | Total           |
| 2 | IS-A (Generalization)  | BaseUser              | 1:1    | Responder          | Total           | Total           |
| 3 | IS-A (Generalization)  | BaseUser              | 1:1    | Admin              | Total           | Total           |
| 4 | creates                | Citizen               | 1:N    | EmergencyRequest   | Partial         | Total           |
| 5 | responds_to            | Responder             | 1:N    | EmergencyRequest   | Partial         | Partial         |
| 6 | belongs_to             | Responder             | N:1    | Station            | Partial         | Partial         |
| 7 | oversees               | Admin                 | N:1    | Station            | Partial         | Partial         |
| 8 | located_in             | Station               | N:1    | Zone               | Partial         | Partial         |
| 9 | housed_at              | Vehicle               | N:1    | Station            | Partial         | Partial         |
| 10| assigned_to            | Vehicle               | 1:1    | Responder          | Partial         | Partial         |
| 11| has (report)           | EmergencyRequest      | 1:1    | IncidentReport     | Partial         | Total           |
| 12| receives (rating)      | EmergencyRequest      | 1:1    | Rating             | Partial         | Total           |
| 13| gives                  | Citizen               | 1:N    | Rating             | Partial         | Total           |
| 14| rated_by               | Responder             | 1:N    | Rating             | Partial         | Total           |
| 15| receives (notif)       | BaseUser              | 1:N    | Notification       | Partial         | Total           |
| 16| triggers               | EmergencyRequest      | 1:N    | Notification       | Partial         | Partial         |
| 17| logged_in              | EmergencyRequest      | 1:N    | DispatchLog        | Partial         | Total           |
| 18| contains               | EmergencyRequest      | 1:N    | ChatMessage        | Partial         | Total           |
| 19| sends                  | BaseUser              | 1:N    | ChatMessage        | Partial         | Total           |
| 20| registers              | Citizen               | 1:N    | EmergencyContact   | Partial         | Total           |
| 21| works                  | Responder             | 1:N    | Shift              | Total           | Total           |
| 22| schedules              | Station               | 1:N    | Shift              | Partial         | Total           |
| 23| has (media)            | EmergencyRequest      | 1:N    | SOSMedia           | Partial         | Total           |
| 24| verified_by            | EmergencyRequest      | 1:1    | AIAnalysisResult   | Partial         | Total           |
| 25| files                  | Responder             | 1:N    | IncidentReport     | Partial         | Total           |

---

## 5. Complete Physical Table Mapping

```
┌──────────────────────────────────────────────────────────────────┐
│                        users (BaseUser)                          │
│──────────────────────────────────────────────────────────────────│
│ PK  id              BIGINT AUTO_INCREMENT                        │
│     fullName        VARCHAR NOT NULL                             │
│ AK  nid             VARCHAR UNIQUE NOT NULL                      │
│ AK  phoneNumber     VARCHAR UNIQUE NOT NULL                      │
│ AK  email           VARCHAR UNIQUE                               │
│     password        VARCHAR NOT NULL                             │
│     role            VARCHAR NOT NULL (CITIZEN/RESPONDER/ADMIN)   │
│     profileImageUrl VARCHAR                                      │
│     latitude        DOUBLE                                       │
│     longitude       DOUBLE                                       │
│     isActive        BOOLEAN DEFAULT TRUE                         │
│     lastLoginAt     DATETIME                                     │
│     created_at      DATETIME                                     │
│     updated_at      DATETIME                                     │
└──────────────────────────────────────────────────────────────────┘
            │ PK(id) referenced by ▼
            │
    ┌───────┴────────┬─────────────────────┐
    │                │                     │
    ▼                ▼                     ▼
┌───────────────┐ ┌──────────────────┐ ┌────────────────┐
│   citizens    │ │    responders    │ │     admins     │
│───────────────│ │──────────────────│ │────────────────│
│PK/FK id       │ │PK/FK id          │ │PK/FK id        │
│homeAddress    │ │serviceType       │ │department      │
│emergencyCont..│ │badgeNumber       │ │accessLevel     │
│bloodGroup     │ │vehicleRegNum     │ │FK station_id   │
│medicalCond..  │ │currentStatus     │ └────────────────┘
│dateOfBirth    │ │isAvailable       │
└───────────────┘ │rating            │
                  │totalResponseCount│
                  │FK station_id     │
                  └──────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                      zones                                       │
│──────────────────────────────────────────────────────────────────│
│ PK  id              BIGINT AUTO_INCREMENT                        │
│ AK  name            VARCHAR UNIQUE NOT NULL                      │
│     description     TEXT                                         │
│     boundaryNorthLat DOUBLE NOT NULL                             │
│     boundarySouthLat DOUBLE NOT NULL                             │
│     boundaryEastLng  DOUBLE NOT NULL                             │
│     boundaryWestLng  DOUBLE NOT NULL                             │
│     isActive        BOOLEAN DEFAULT TRUE                         │
│     created_at      DATETIME                                     │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                      stations                                    │
│──────────────────────────────────────────────────────────────────│
│ PK  id              BIGINT AUTO_INCREMENT                        │
│     name            VARCHAR NOT NULL                             │
│     stationType     VARCHAR NOT NULL                             │
│     address         TEXT NOT NULL                                │
│     latitude        DOUBLE NOT NULL                              │
│     longitude       DOUBLE NOT NULL                              │
│     phoneNumber     VARCHAR NOT NULL                             │
│     capacity        INT                                          │
│     isOperational   BOOLEAN DEFAULT TRUE                         │
│ FK  zone_id         BIGINT → zones.id                            │
│     created_at      DATETIME                                     │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                      vehicles                                    │
│──────────────────────────────────────────────────────────────────│
│ PK  id                BIGINT AUTO_INCREMENT                      │
│ AK  registrationNumber VARCHAR UNIQUE NOT NULL                   │
│     vehicleType       VARCHAR NOT NULL                           │
│     make              VARCHAR                                    │
│     model             VARCHAR                                    │
│     year              INT                                        │
│     currentStatus     VARCHAR DEFAULT 'AVAILABLE'                │
│ FK  station_id        BIGINT → stations.id                       │
│ FK  responder_id      BIGINT → users.id                          │
│     fuelLevel         DOUBLE                                     │
│     lastServiceDate   DATE                                       │
│     created_at        DATETIME                                   │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                  emergency_requests                              │
│──────────────────────────────────────────────────────────────────│
│ PK  id              BIGINT AUTO_INCREMENT                        │
│ FK  citizen_id      BIGINT NOT NULL → users.id                   │
│ FK  responder_id    BIGINT NULLABLE → users.id                   │
│     emergencyType   VARCHAR NOT NULL                             │
│     severity        VARCHAR NOT NULL DEFAULT 'MEDIUM'            │
│     status          VARCHAR NOT NULL DEFAULT 'PENDING'           │
│     description     TEXT                                         │
│     latitude        DOUBLE NOT NULL                              │
│     longitude       DOUBLE NOT NULL                              │
│     address         TEXT                                         │
│     imageUrl        VARCHAR                                      │
│     baseFare        DOUBLE                                       │
│     perKmFare       DOUBLE                                       │
│     totalDistanceKm DOUBLE                                       │
│     totalFare       DOUBLE                                       │
│     created_at      DATETIME                                     │
│     dispatched_at   DATETIME                                     │
│     arrived_at      DATETIME                                     │
│     resolved_at     DATETIME                                     │
│     cancelled_at    DATETIME                                     │
│     cancelReason    TEXT                                          │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                 ai_analysis_results                              │
│──────────────────────────────────────────────────────────────────│
│ PK  id              BIGINT AUTO_INCREMENT                        │
│ FK  request_id      BIGINT UNIQUE NOT NULL → emergency_requests  │
│     isDetected      BOOLEAN NOT NULL                             │
│     confidence      DOUBLE NOT NULL                              │
│     modelVersion    VARCHAR                                      │
│     boundingBoxes   TEXT                                         │
│     analyzed_at     DATETIME                                     │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                  incident_reports                                │
│──────────────────────────────────────────────────────────────────│
│ PK  id              BIGINT AUTO_INCREMENT                        │
│ FK  request_id      BIGINT UNIQUE NOT NULL → emergency_requests  │
│ FK  responder_id    BIGINT NOT NULL → users.id                   │
│     reportText      TEXT NOT NULL                                │
│     actionsTaken    TEXT NOT NULL                                 │
│     casualtyCount   INT DEFAULT 0                                │
│     injuryCount     INT DEFAULT 0                                │
│     propertyDamage  BOOLEAN DEFAULT FALSE                        │
│     evidenceImageUrls TEXT                                       │
│     created_at      DATETIME                                     │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                      ratings                                     │
│──────────────────────────────────────────────────────────────────│
│ PK  id              BIGINT AUTO_INCREMENT                        │
│ FK  request_id      BIGINT UNIQUE NOT NULL → emergency_requests  │
│ FK  citizen_id      BIGINT NOT NULL → users.id                   │
│ FK  responder_id    BIGINT NOT NULL → users.id                   │
│     score           INT NOT NULL (1-5)                           │
│     comment         TEXT                                         │
│     created_at      DATETIME                                     │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                    notifications                                 │
│──────────────────────────────────────────────────────────────────│
│ PK  id              BIGINT AUTO_INCREMENT                        │
│ FK  recipient_id    BIGINT NOT NULL → users.id                   │
│ FK  request_id      BIGINT → emergency_requests.id               │
│     title           VARCHAR NOT NULL                             │
│     message         TEXT NOT NULL                                │
│     type            VARCHAR NOT NULL                             │
│     isRead          BOOLEAN DEFAULT FALSE                        │
│     created_at      DATETIME                                     │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                    dispatch_logs                                 │
│──────────────────────────────────────────────────────────────────│
│ PK  id              BIGINT AUTO_INCREMENT                        │
│ FK  request_id      BIGINT NOT NULL → emergency_requests.id      │
│ FK  performedBy_id  BIGINT → users.id                            │
│     previousStatus  VARCHAR                                      │
│     newStatus       VARCHAR NOT NULL                             │
│     action          VARCHAR NOT NULL                             │
│     notes           TEXT                                         │
│     created_at      DATETIME                                     │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                   chat_messages                                  │
│──────────────────────────────────────────────────────────────────│
│ PK  id              BIGINT AUTO_INCREMENT                        │
│ FK  request_id      BIGINT NOT NULL → emergency_requests.id      │
│ FK  sender_id       BIGINT NOT NULL → users.id                   │
│     messageText     TEXT NOT NULL                                │
│     messageType     VARCHAR DEFAULT 'TEXT'                       │
│     isRead          BOOLEAN DEFAULT FALSE                        │
│     created_at      DATETIME                                     │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                 emergency_contacts                               │
│──────────────────────────────────────────────────────────────────│
│ PK  id              BIGINT AUTO_INCREMENT                        │
│ FK  citizen_id      BIGINT NOT NULL → users.id                   │
│     contactName     VARCHAR NOT NULL                             │
│     phoneNumber     VARCHAR NOT NULL                             │
│     relationship    VARCHAR                                      │
│     isPrimary       BOOLEAN DEFAULT FALSE                        │
│     created_at      DATETIME                                     │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                       shifts                                     │
│──────────────────────────────────────────────────────────────────│
│ PK  id              BIGINT AUTO_INCREMENT                        │
│ FK  responder_id    BIGINT NOT NULL → users.id                   │
│ FK  station_id      BIGINT NOT NULL → stations.id                │
│     startTime       DATETIME NOT NULL                            │
│     endTime         DATETIME NOT NULL                            │
│     shiftType       VARCHAR                                      │
│     status          VARCHAR DEFAULT 'SCHEDULED'                  │
│     created_at      DATETIME                                     │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                     sos_media                                    │
│──────────────────────────────────────────────────────────────────│
│ PK  id              BIGINT AUTO_INCREMENT                        │
│ FK  request_id      BIGINT NOT NULL → emergency_requests.id      │
│     mediaUrl        TEXT NOT NULL                                │
│     mediaType       VARCHAR NOT NULL                             │
│     fileSize        BIGINT                                       │
│     uploaded_at     DATETIME                                     │
└──────────────────────────────────────────────────────────────────┘
```

---

## 6. Complete EER Diagram — Visual Layout Guide

```
                              ┌──────────┐
                              │ BaseUser │  (ABSTRACT)
                              └────┬─────┘
                                   │
                        ┌──── d, total ────┐
                        │         │         │
                   ┌────▼───┐ ┌───▼─────┐ ┌─▼─────┐
                   │Citizen │ │Responder│ │ Admin │
                   └──┬──┬──┘ └─┬──┬──┬─┘ └───┬───┘
                      │  │      │  │  │        │
        ┌─────────────┘  │      │  │  │        │
        │                │      │  │  │        │
        ▼                │      │  │  │        ▼
  ┌────────────────┐     │      │  │  │   ┌─────────┐
  │EmergencyContact│     │      │  │  │   │ Station │◄────────────────┐
  └────────────────┘     │      │  │  │   └────┬────┘                │
                         │      │  │  │        │                     │
        ┌────────────────┘      │  │  └────────┤              ┌─────┴────┐
        │              ┌────────┘  │           │              │   Zone   │
        ▼              │           ▼           ▼              └──────────┘
  ┌───────────────┐    │     ┌─────────┐  ┌───────┐
  │EmergencyReq.  │◄───┘    │ Vehicle │  │ Shift │
  └──┬──┬──┬──┬──┬┘         └─────────┘  └───────┘
     │  │  │  │  │
     │  │  │  │  └──────────────────────┐
     │  │  │  └────────────┐            │
     │  │  └──────┐        │            │
     │  │         │        │            │
     ▼  ▼         ▼        ▼            ▼
┌──────┐┌───────┐┌──────┐┌────────────┐┌──────────┐
│Rating││Notif. ││Chat  ││DispatchLog ││SOSMedia  │
└──────┘│       ││Msg   │└────────────┘└──────────┘
        └───────┘└──────┘
           ▲
           │
     ┌─────┴──────┐
     │IncidentRpt │
     └────────────┘
```

---

## 7. EER Notation Guide (How to Draw It)

1. **Rectangles** → All 16 entities listed above
2. **Double-bordered Rectangle** → Weak entities: `IncidentReport`, `SOSMedia`
3. **Ovals** → Attributes (attach to their entity rectangle)
   - **Underlined oval** → Primary Key (`id`)
   - **Dashed oval** → Derived attribute (`Responder.rating` — derived from Rating scores)
   - **Double oval** → Multi-valued attribute concept (EmergencyContact is the extracted entity)
4. **Diamonds** → Relationships listed in Section 3
   - **Double-bordered Diamond** → Identifying relationships for weak entities
5. **Specialization Circle/Triangle** → Place between `BaseUser` and its three subclasses
   - Write **"d"** inside = disjoint
   - **Double line** from BaseUser to the circle = total participation
   - **Single lines** from circle down to `Citizen`, `Responder`, `Admin`
6. **Cardinality notation** → Write `1` and `N` on relationship lines
7. **Participation**:
   - **Double line (═══)** = Total participation (mandatory)
   - **Single line (───)** = Partial participation (optional)

---

## 8. Key EER Concepts Present in This System

| EER Concept                       | Where It Appears                                                   |
|-----------------------------------|--------------------------------------------------------------------|
| **Generalization/Specialization** | BaseUser → Citizen, Responder, Admin                               |
| **Disjoint Constraint (d)**       | A user is exactly one of the three roles                           |
| **Total Specialization**          | BaseUser is abstract; every instance must be a subclass            |
| **JOINED Inheritance**            | Each subclass has its own table with FK back to parent              |
| **Weak Entity**                   | IncidentReport (depends on EmergencyRequest), SOSMedia             |
| **Multi-valued Attribute → Entity** | EmergencyContact (extracted from Citizen)                        |
| **Derived Attribute**             | Responder.rating (computed from avg of Rating.score)               |
| **Enum as Attribute Domain**      | Role, ServiceType, EmergencyType, EmergencyStatus, Severity, etc.  |
| **1:1 Relationship**              | EmergencyRequest↔IncidentReport, EmergencyRequest↔Rating, Vehicle↔Responder |
| **1:N Relationship**              | Citizen→EmergencyRequest, Responder→EmergencyRequest, all log/chat/notification relationships |
| **N:1 Relationship**              | Responder→Station, Station→Zone, Vehicle→Station                   |
| **Total Participation (double line)** | EmergencyRequest must have Citizen; IncidentReport must have EmergencyRequest; etc. |
| **Partial Participation (single line)** | EmergencyRequest.responder_id is nullable; Vehicle may be unassigned |
| **Identifying Relationship**      | IncidentReport identified by its parent EmergencyRequest           |
| **Recursive concept**             | DispatchLog tracks state transitions on the same EmergencyRequest  |

---

## 9. Entity Count Summary

| Category         | Entities                                                        | Count |
|------------------|-----------------------------------------------------------------|:-----:|
| **Existing**     | BaseUser, Citizen, Responder, Admin, EmergencyRequest           | 5     |
| **New (proposed)** | Station, Zone, Vehicle, IncidentReport, Rating, Notification, DispatchLog, ChatMessage, EmergencyContact, Shift, SOSMedia, AIAnalysisResult | 12  |
| **Total**        |                                                                 | **17** |
| **Enumerations** | Role, ServiceType, EmergencyType, EmergencyStatus, Severity, StationType, VehicleType, VehicleStatus, AccessLevel, NotificationType, DispatchAction, MessageType, MediaType, ShiftType, ShiftStatus | **15** |
| **Relationships** |                                                                | **25** |
<!-- Emergency dispatch database reference. -->
