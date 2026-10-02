export const projectTaskTeams = [
  { id: 'front-end', name: 'فرونت اند', name_en: 'Front End', members: [] },
  { id: 'back-end', name: 'باك اند', name_en: 'Back End', members: [] },
  { id: 'testers', name: 'مختبرين', name_en: 'Testers', members: [] },
  { id: 'front-end-designers', name: 'مصممين الواجهة الأمامية', name_en: 'Front End Designers', members: [] },
]

export function resolveProjectTaskTeam(value, teams = projectTaskTeams) {
  if (!value) return null
  const id = value.id == null ? '' : String(value.id)
  const names = [value.name, value.name_ar, value.name_en]
    .filter(Boolean)
    .map(name => String(name).trim().toLocaleLowerCase())

  return teams.find(team => {
    if (id && String(team.id) === id) return true
    return [team.name, team.name_ar, team.name_en]
      .filter(Boolean)
      .some(name => names.includes(String(name).trim().toLocaleLowerCase()))
  }) || null
}

export function projectTeamKey(team, teams = projectTaskTeams) {
  const canonical = resolveProjectTaskTeam(team, teams)
  if (canonical) return String(canonical.id)
  if (team && team.id != null) return String(team.id)
  return String(team && (team.name_ar || team.name_en || team.name) || '').trim().toLocaleLowerCase()
}
