/**
 * One-time admin bootstrap.
 *
 * Sets `publicMetadata.role = "admin"` on a Clerk user by email. Every other
 * user keeps the default "user" role. Run with the Clerk secret key available
 * in the environment:
 *
 *   node --env-file-if-exists=.env.local scripts/set-admin.mjs you@example.com
 *
 * or pass it inline:
 *
 *   CLERK_SECRET_KEY=sk_... node scripts/set-admin.mjs you@example.com
 *
 * To DEMOTE a user back to "user", pass a second arg:
 *
 *   node scripts/set-admin.mjs you@example.com user
 */
const email = process.argv[2]
const role = process.argv[3] === 'user' ? 'user' : 'admin'
const sk = process.env.CLERK_SECRET_KEY

if (!sk) {
  console.error('Missing CLERK_SECRET_KEY in the environment.')
  process.exit(1)
}
if (!email) {
  console.error('Usage: node scripts/set-admin.mjs <email> [admin|user]')
  process.exit(1)
}

const headers = { Authorization: `Bearer ${sk}`, 'Content-Type': 'application/json' }

const found = await fetch(
  `https://api.clerk.com/v1/users?email_address=${encodeURIComponent(email)}`,
  { headers },
).then((r) => r.json())

if (!Array.isArray(found) || found.length === 0) {
  console.error(`No Clerk user found for ${email}`)
  process.exit(1)
}

const user = found[0]
const res = await fetch(`https://api.clerk.com/v1/users/${user.id}/metadata`, {
  method: 'PATCH',
  headers,
  body: JSON.stringify({ public_metadata: { role } }),
}).then((r) => r.json())

console.log(`User ${email} (${user.id}) role set to: ${res.public_metadata?.role}`)
console.log('Sign out and back in (or refresh) for the new role to take effect.')
