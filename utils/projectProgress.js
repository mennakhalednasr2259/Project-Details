import { projectTaskTeams, projectTeamKey, resolveProjectTaskTeam } from './projectTeams'

function isFinished(status) {
  return ['FINISHED', 'DONE', 'COMPLETED'].includes(String(status || '').toUpperCase())
}

export function summarizeTaskProgress(task = {}) {
  const subtasks = Array.isArray(task.subTasks) ? task.subTasks : []

  if (subtasks.length) {
    const completedItems = subtasks.filter((subtask) => isFinished(subtask.status)).length
    return {
      percent: Math.round((completedItems / subtasks.length) * 100),
      completedItems,
      totalItems: subtasks.length,
      hasSubtasks: true,
    }
  }

  const status = String(task.status || '').toUpperCase()
  const percent = isFinished(status) ? 100 : status === 'IN_PROGRESS' ? 50 : 0
  return { percent, completedItems: percent === 100 ? 1 : 0, totalItems: 1, hasSubtasks: false }
}

export function summarizeProjectProgress(project = {}) {
  const tasks = Array.isArray(project.tasks) ? project.tasks : []
  const taskSummaries = tasks.map(summarizeTaskProgress)
  const totalItems = taskSummaries.reduce((total, task) => total + task.totalItems, 0)
  const completedItems = taskSummaries.reduce((total, task) => total + task.completedItems, 0)
  const weightedProgress = taskSummaries.reduce((total, task) => total + (task.percent * task.totalItems), 0)
  const completedTasks = taskSummaries.filter((task) => task.percent === 100).length
  const inProgressTasks = taskSummaries.filter((task) => task.percent > 0 && task.percent < 100).length
  const percent = totalItems
    ? Math.round(weightedProgress / totalItems)
    : (String(project.status || '').toUpperCase() === 'FINISHED' ? 100 : 0)

  return {
    percent,
    totalTasks: tasks.length,
    completedTasks,
    inProgressTasks,
    completedItems,
    totalItems,
  }
}

export function summarizeProjectTeamProgress(project = {}, teams = projectTaskTeams) {
  const teamProgress = new Map()
  const tasksByTeam = new Map()
  const savedProgress = Array.isArray(project.tasks_progress) ? project.tasks_progress : []

  teams.forEach((team) => {
    teamProgress.set(String(team.id), { ...team, progress: 0 })
  })

  savedProgress.forEach((item) => {
    const canonical = resolveProjectTaskTeam(item, teams)
    if (!canonical) return
    const key = String(canonical.id)
    teamProgress.set(key, { ...item, ...canonical, id: canonical.id, progress: Number(item.progress) || 0 })
  })

  ;(Array.isArray(project.tasks) ? project.tasks : []).forEach((task) => {
    const namedTeams = Array.isArray(task.team_names) ? task.team_names : []
    const ids = Array.isArray(task.team_ids) && task.team_ids.length
      ? task.team_ids
      : (task.team_id != null ? [task.team_id] : [])
    const assignments = namedTeams.length
      ? namedTeams
      : ids.map(id => ({ id }))

    assignments.forEach((assignment) => {
      const canonical = resolveProjectTaskTeam(assignment, teams)
      const key = projectTeamKey(assignment, teams)
      if (!key) return

      if (!teamProgress.has(key)) {
        const label = canonical || assignment
        teamProgress.set(key, {
          ...label,
          id: canonical ? canonical.id : assignment.id,
          progress: 0,
        })
      }
      if (!tasksByTeam.has(key)) tasksByTeam.set(key, [])
      tasksByTeam.get(key).push(task)
    })
  })

  tasksByTeam.forEach((tasks, key) => {
    const summaries = tasks.map(summarizeTaskProgress)
    const totalItems = summaries.reduce((total, summary) => total + summary.totalItems, 0)
    const weightedProgress = summaries.reduce((total, summary) => total + summary.percent * summary.totalItems, 0)
    const entry = teamProgress.get(key)
    if (entry) entry.progress = totalItems ? Math.round(weightedProgress / totalItems) : 0
  })

  return Array.from(teamProgress.values())
}
