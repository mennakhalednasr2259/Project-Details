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
