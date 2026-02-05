# Governance Rules: RealCo OS

This document defines the rules and logic governing the acceptance of data into the Canonical Memory of RealCo OS.

## 1. Core Doctrine
All data flowing through the Governance Gate must adhere to these non-negotiable principles:

*   **Atomic Unit Truth**: The Property Unit is the fundamental anchor for all ground truth. Data associated with a unit must be verified against the Registry.
*   **Won-Only deals**: A deal or transaction is only considered valid and accepted into canonical memory if its status is explicitly **WON**. Pre-won or lost deals are treated as transient signals.
*   **Append-Only History**: The canonical state is never "updated" in place. Every change or decision is recorded as an immutable event in the Resolution Ledger.
*   **No Inference**: Values (e.g., Zones) are never guessed or inferred by the system. If a mapping is missing, the item is marked as **UNKNOWN** and moved to the Unresolved Queue.

## 2. Trust Hierarchy
When conflicting data is received from multiple sources, the Governance Gate applies the following hierarchy to determine the "Winner":

1.  **DLD / Registry (Databricks Gold)**: Official government records and locked internal registries. Absolute truth.
2.  **Canonical OS Decisions**: Explicit manual overrides or historical decisions recorded in the Resolution Ledger.
3.  **Monday Signals (Databricks Silver)**: Data flowing from CRM/Monday.com. High trust but requires validation against the Registry.
4.  **User Input / Notes**: Transcripts, manual notes, and other unstructured inputs. Lowest trust; used for enrichment only.

## 3. Canonical Validation Flow (Gate)
Every request to update canonical memory follows this conceptual flow:

1.  **Request**: Ingest raw signal (e.g., a Monday Deal).
2.  **Identity Resolution**: Match unit using the `UnitKey`.
3.  **Governance Validation**:
    *   Check if status is **WON**.
    *   Check for required fields.
    *   Verify Zone mapping.
4.  **Trust Check**: Compare incoming values with existing canonical memory using the Trust Hierarchy.
5.  **Write Decision**: If valid, update the entity state (logical).
6.  **Append Ledger**: Record a `ResolutionEvent` describing the change.
7.  **Append Audit**: Record an immutable `AuditLog` entry for compliance.

## 4. Blocked States & Prohibited Data
The Governance Gate will reject and move to the Unresolved Queue any data that results in a "Blocked State":

*   **Impossible Property Types**: e.g., "Villa" in a "High-Rise Building" zone (unless explicitly mapped).
*   **Negative Prices**: All transaction values must be positive.
*   **Broken History**: A "Won" deal for a unit that is already marked as "Sold" in the Registry to a different party without a corresponding transfer record.
*   **Missing Unit Anchor**: Any data not linked to a valid `UnitKey`.
