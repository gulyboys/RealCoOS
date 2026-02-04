# Entity Dictionary: Canonical Layer

This document defines the logical entities within the Canonical Memory of RealCo OS. These definitions focus on governance rules and state transitions.

## 1. CanonicalUnit
The anchor of truth for all property data.
*   **Definition**: A distinct real estate unit verified against the DLD Registry.
*   **Minimum Required Fields**:
    *   `UnitKey` (Unique Identifier)
    *   `ZoneID` (Linked to Zone entity)
    *   `PropertyType` (e.g., Apartment, Villa)
    *   `Status` (e.g., Available, Occupied, Sold)
*   **Allowed Transitions**:
    *   `Available` -> `Under Contract` -> `Sold`
    *   `Occupied` -> `Available` (on Lease Termination)
*   **Prohibited States**:
    *   Unit existing without a `ZoneID`.
    *   Multiple `UnitKey` entries for the same physical location.
*   **Conflict Handling**: Always favors DLD Registry data over CRM signals.

## 2. CanonicalContact
A unified record for individuals or entities.
*   **Definition**: A verified person or company involved in transitions.
*   **Minimum Required Fields**:
    *   `ContactID`
    *   `LegalName`
    *   `VerifiedPhone` / `VerifiedEmail`
*   **Allowed Transitions**:
    *   `Unknown` -> `Verified` (after KYC/Docs)
*   **Conflict Handling**: System favors "Signed Contract" data over "Lead Form" data.

## 3. ResolutionEvent
The append-only ledger entries.
*   **Definition**: A record of a decision made by the Governance Gate.
*   **Minimum Required Fields**:
    *   `EventID`
    *   `EntityID` (e.g., UnitKey)
    *   `Action` (e.g., CREATED, UPDATED, REJECTED)
    *   `SourceSystem` (Monday, DLD, User)
    *   `DecisionHash` (To verify integrity)

## 4. AuditLog
The immutable compliance record.
*   **Definition**: A chronological log of every interaction with a canonical entity.
*   **Minimum Required Fields**:
    *   `LogID`
    *   `Timestamp`
    *   `User/SystemID`
    *   `RawPayload` (Snap-shot of incoming data)
*   **Conflict Handling**: None; immutable and absolute.

## 5. UnresolvedItem
The queue for data that failed governance.
*   **Definition**: A record of a signal that could not be processed automatically.
*   **Minimum Required Fields**:
    *   `ItemID`
    *   `SignalSource`
    *   `ReasonCode` (e.g., `ZONE_NOT_MAPPED`)
    *   `Status` (OPEN, RESOLVED, IGNORED)
*   **Prohibited States**:
    *   Remaining in OPEN state without a `ReasonCode`.

## 6. Zone
A business-defined geographical or category grouping.
*   **Definition**: A fixed polygon or group representing a business area.
*   **Minimum Required Fields**:
    *   `ZoneID`
    *   `ZoneName`
    *   `TrustLevel` (Standard score for data in this zone)

## 7. AreaZoneMap
The bridge between external descriptors and internal Zones.
*   **Definition**: Explicit mapping from DLD "Area" or Monday "Project" names to a `ZoneID`.
*   **Constraint**: No inference allowed. If an Area is not in this map, it results in `ZONE_NOT_MAPPED`.
