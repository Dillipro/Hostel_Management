const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function logAudit(actor_id, action, details) {
  try {
    await prisma.auditLog.create({ data: { actor_id: String(actor_id||'system'), action: String(action), details: details||{} } })
  } catch (e) {
    // swallow to avoid blocking flows
  }
}

module.exports = { logAudit }
