import { clerk } from './_clerk.js'

export async function requireAuth(req, res, allowedRoles = []) {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) { res.status(401).json({ error: 'Unauthorized' }); return null }
  try {
    const payload = await clerk.verifyToken(token)
    const user    = await clerk.users.getUser(payload.sub)
    const role    = user.publicMetadata?.role ?? 'user'
    if (allowedRoles.length && !allowedRoles.includes(role)) {
      res.status(403).json({ error: 'Forbidden' }); return null
    }
    return { userId: payload.sub, role, clerkUser: user }
  } catch {
    res.status(401).json({ error: 'Invalid token' }); return null
  }
}
