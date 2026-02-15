import { SqlRow } from '../../client';

export interface OwnerRow {
  owner_id: string | null;
  owner_name: string | null;
  email: string | null;
  phone: string | null;
  source_label: string | null;
}

function getValue(row: SqlRow, keys: string[]): unknown {
  for (const key of keys) {
    if (row[key] !== undefined) return row[key];
    const found = Object.keys(row).find(k => k.toLowerCase() === key.toLowerCase());
    if (found) return row[found];
  }
  return undefined;
}

function normalizeNullableString(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const normalized = String(value).trim();
  return normalized.length > 0 ? normalized : null;
}

export function adaptOwnerRow(row: SqlRow): OwnerRow {
  const ownerId = getValue(row, ['owner_id', 'master_contact_id', 'contact_id', 'customer_id']);
  const ownerName = getValue(row, ['owner_name', 'full_name', 'name', 'contact_name']);
  const phone = getValue(row, ['phone', 'mobile', 'phone_number']);
  const email = getValue(row, ['email', 'email_address']);
  const sourceLabel = getValue(row, ['source_label', 'source', 'source_system']);

  return {
    owner_id: normalizeNullableString(ownerId),
    owner_name: normalizeNullableString(ownerName),
    email: normalizeNullableString(email),
    phone: normalizeNullableString(phone),
    source_label: normalizeNullableString(sourceLabel),
  };
}
