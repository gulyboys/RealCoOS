# Canonical Memory Specification

This document defines the technical behavior and operational lifecycle of the Canonical Memory layer in RealCo OS.

## 1. Resolution Ledger (Append-Only)
The Resolution Ledger is the source of truth for all state changes.
*   **Semantics**: Every "Decision" made by the Governance Gate is appended as a `ResolutionEvent`.
*   **No Deletes**: Deleting or editing a ledger entry is strictly prohibited.
*   **Correction Logic**: If a previous decision was wrong (e.g., incorrect UnitKey mapping), a new "Correction Event" is appended which logically overrides the previous state. The full history of the error and the correction remains visible.

## 2. Audit Log (Immutable)
The Audit Log captures the "Why" and "From Where" of every signal.
*   **Immutability**: Once written, a log entry cannot be modified or purged (except for legal/GDPR compliance via specialized administrative tools).
*   **Content**: Includes raw payload from source systems (Databricks Silver/Gold), timestamp, and the processing result (Accepted/Queued).

## 3. Unresolved Queue Lifecycle
Data that fails validation or trust checks is diverted to the Unresolved Queue for manual review or automatic re-processing.

### Lifecycle States
*   **OPEN**: Default state for new failures. Visibility: High priority for Data Ops.
*   **RESOLVED**: Marked manually or automatically after the underlying issue (e.g., missing Zone map) is fixed. The signal is then re-submitted to the Governance Gate.
*   **IGNORED**: Marked when a signal is determined to be junk or irrelevant.

### Required Reason Codes
A signal must be tagged with at least one code when sent to the Queue:
*   `NO_UNIT_KEY`: Incoming data has no identifiable unit anchor.
*   `MULTIPLE_MATCHES`: Unit criteria resolved to more than one unique canonical unit.
*   `CONFLICT_DLD_VS_SIGNAL`: High-trust DLD data contradicts a "WON" signal in a way that requires human decision.
*   `MISSING_REQUIRED_FIELD`: Essential data (e.g., price, area) is null or invalid.
*   `ZONE_NOT_MAPPED`: The Location/Area descriptor is not found in the `AreaZoneMap`.

## 4. Unknown State Handling
Unknown states are first-class citizens in RealCo OS.
*   **Rule**: Never infer. If a field's value is unknown, it must be stored as `NULL` or `UNKNOWN`.
*   **Visuals**: UI/Reports must display "Unknown" rather than a system-guessed default.
*   **Resolution**: Moving from `UNKNOWN` to a known state requires either a new high-trust signal (DLD) or a `ResolutionEvent` (Manual Decision).

---

## Phase 4 Implementation Checklist

### Preconditions (Must Be Done Before Phase 4 Starts)
*   [ ] V1 Market Sources locked (Phase 3).
*   [ ] Query Registry & Adapters confirmed working (Phase 3.2).
*   [ ] All Zone definitions and Area-Zone maps finalized in documentation.

### What Phase 4 WILL Implement
*   **DB Schema**: Tables for `CanonicalUnit`, `ResolutionEvent`, `AuditLog`, and `UnresolvedItem`.
*   **Governance Logic**: Middleware that validates "WON" status and enforces the Trust Hierarchy.
*   **The Unresolved Worker**: A process that moves failed signals to the queue.
*   **Basic Data Ops UI**: A screen to view and resolve entries in the Unresolved Queue.

### What Phase 4 Must NOT Implement
*   **Automated Inference**: No "AI-guessing" for missing zones or prices.
*   **Direct Source Editing**: Phase 4 must not write back to Monday.com or Databricks Gold/Silver. It only writes to its own Canonical Memory.
*   **Bulk Sync**: No mass migration of historical "Won" deals until the Gate logic is verified with real-time signals.
