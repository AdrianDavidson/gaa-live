import { createClerkClient, verifyToken } from '@clerk/backend'

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })

export async function requireAuth(req, res, allowedRoles = []) {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) { res.status(401).json({ error: 'Unauthorized' }); return null }
  try {
    const payload = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY })

    let role = payload.public_metadata?.role ?? payload.role ?? 'user'
    try {
      const user = await clerk.users.getUser(payload.sub)
      role = user.publicMetadata?.role ?? role
    } catch (userErr) {
      console.error('[auth] getUser failed (using JWT role fallback):', userErr?.message)
    }

    if (allowedRoles.length && !allowedRoles.includes(role)) {
      res.status(403).json({ error: 'Forbidden' }); return null
    }
    return { userId: payload.sub, role }
  } catch (err) {
    console.error('[auth] verifyToken failed:', err?.message)
    res.status(401).json({ error: 'Unauthorized' }); return null
  }
}
