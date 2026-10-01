export const P = {
  teams: { create: 1, read: 2, update: 3, delete: 4 },
  members: { create: 5, read: 6, update: 7, delete: 8 },
  reports: { read: 9, update: 10, delete: 11, create: 31 },
  reviews: { create: 12, update: 13, delete: 14, read: 32 },
  statistics: { create: 15, read: 16, update: 17, delete: 18 },
  projects: { create: 19, read: 20, update: 21, delete: 22 },
  tasks: { create: 23, read: 24, update: 25, delete: 26 },
  events: { create: 27, read: 28, update: 29, delete: 30 },
  meetings: { create: 63, read: 64, update: 65, delete: 66 },
  timer: { user: 33, read: 33, create: 59, update: 60, delete: 61 },
  roles: { read: 34, update: 35, create: 57, delete: 58 },
  chat: { read: 36, create: 51, update: 52, delete: 53 },
  leaves: { create: 37, read: 38, update: 39, delete: 40 },
  payroll: { create: 41, read: 42, update: 43, delete: 44 },
  goals: { create: 45, read: 46, update: 47, delete: 48 },
  activity: { read: 49, create: 67, update: 68, delete: 62, usersRead: 75 },
  currencies: { read: 50, create: 54, update: 55, delete: 56 },
  mail: { create: 69, read: 70 },
  expenses: { create: 71, read: 72, update: 73, delete: 74 },
}

export function hasPermissionId(permissions, id) {
  if (id == null || !Array.isArray(permissions)) return false
  return permissions.some((item) => item && item.id == id)
}

/** Merge permissions from all assigned roles (+ top-level profile.permissions). */
export function collectUserPermissions(profile) {
  const seen = new Set()
  const out = []

  const push = (list) => {
    if (!Array.isArray(list)) return
    list.forEach((item) => {
      if (!item || item.id == null || seen.has(item.id)) return
      seen.add(item.id)
      out.push(item)
    })
  }

  if (!profile || typeof profile !== 'object') return out

  push(profile.permissions)
  if (Array.isArray(profile.roles)) {
    profile.roles.forEach((role) => push(role && role.permissions))
  }

  return out
}

export function profileRoleNames(profile) {
  if (!profile || !Array.isArray(profile.roles)) return []
  return profile.roles
    .map((role) => String((role && role.name) || '').trim().toLowerCase())
    .filter(Boolean)
}

export function profileHasRole(profile, names) {
  const wanted = (Array.isArray(names) ? names : [names]).map((n) => String(n).toLowerCase())
  return profileRoleNames(profile).some((name) => wanted.includes(name))
}

function readBillingFlag(canManageBilling) {
  if (canManageBilling === true) return true
  if (!process.client) return false
  try {
    const entitlements = JSON.parse(localStorage.getItem('entitlements') || 'null')
    return !!(entitlements && entitlements.can_manage_billing === true)
  } catch (e) {
    return false
  }
}

/** Super Admin, company Admin, or the workspace subscriber. Everyone else sees only their own data. */
export function canOverseeTeam(profile, permissions = [], isSuperAdmin = false, canManageBilling = false) {
  if (isSuperAdmin || (profile && profile.is_super_admin)) return true
  if (readBillingFlag(canManageBilling)) return true
  return profileHasRole(profile, ['admin', 'super_admin'])
}

export const ROLE_MENU = [
  { title: 'Dashboard', always: true },
  { title: 'Chat', permission: P.chat.read },
  { title: 'Projects', permission: P.projects.read },
  { title: 'Tasks', permission: P.tasks.read },
  { title: 'Reports', permission: P.reports.read },
  { title: 'Send Email', permission: P.mail.read },
  { title: 'Clock In', always: true },
  { title: 'Attendance Log', always: true },
  { title: 'My Screenshots', always: true },
  { title: 'Team Attendance', permission: P.timer.read },
  { title: 'Teams', permission: P.teams.read },
  { title: 'Team Members', permission: P.members.read },
  { title: 'Roles', permission: P.roles.read },
  { title: 'Leaves', permission: P.leaves.read },
  { title: 'Payroll', permission: P.payroll.read },
  { title: 'Company Expenses', permission: P.expenses.read },
  { title: 'Currencies', permission: P.currencies.read },
  { title: 'Announcements', permission: P.events.read },
  { title: 'Calendar', permission: P.events.read },
  { title: 'Meetings', permission: P.meetings.read },
  { title: 'Activity Log', permission: P.activity.read },
  { title: 'KPI Dashboard', permission: P.statistics.read },
  { title: 'Statistic', permission: P.statistics.read },
  { title: 'Goals & OKRs', permission: P.goals.read },
  { title: 'Settings', always: true },
]
