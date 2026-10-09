# Security Specification - ElectroPOS

## 1. Data Invariants
- Each document in `/products/`, `/sales/`, `/installments/`, `/returns/`, `/store_settings/` belongs to a specific authenticated owner (`ownerId == request.auth.uid`).
- Strict validation helpers (`isValidProduct`, `isValidSale`, `isValidInstallment`, `isValidReturnClaim`, `isValidStoreSettings`) enforce types, max lengths, and identity integrity.
- Timestamps and key identities cannot be tampered with or modified across different users.
- A user can only access, create, update, or delete records belonging to their own store.

## 2. Dirty Dozen Payload Threat Models
1. Spoofed `ownerId`: Attacker submits product write with another user's UID. Result: Denied.
2. Unauthenticated write: Guest attempts to read or mutate sales records. Result: Denied.
3. Overflow string attack: Attacker submits 50KB string in `name` or `invoiceNumber`. Result: Denied.
4. Negative prices or stock tampering with invalid types: Attempting to insert Boolean for `sellingPrice`. Result: Denied.
5. Invariant breach: Tampering with `ownerId` upon update. Result: Denied.
6. Cross-tenant invoice modification: User A tries to update User B's sales records. Result: Denied.
7. Dropping required fields during creation. Result: Denied.
8. Injecting unexpected arbitrary fields outside defined schema. Result: Denied.
9. Modifying completed immutable invoice details. Result: Denied.
10. Query scraping without tenant filter: `allow list` evaluated against `resource.data.ownerId == request.auth.uid`. Result: Rejected unless scoped.
11. Unverified email write attempt if email verified enforcement is activated. Result: Denied.
12. Invalid document ID paths injection (over 128 chars or special junk chars). Result: Denied.
