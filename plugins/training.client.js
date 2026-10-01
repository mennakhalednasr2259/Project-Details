import Quill from 'quill'
import Vue from 'vue'
import translationsAr from '~/locales/ar.js'
import translationsEn from '~/locales/en.js'

const STORAGE_KEY = 'project-details-training-api-v1'
function showToast(message, type) {
  if (typeof document === 'undefined') return
  let el = document.querySelector('.training-toast')
  if (!el) { el = document.createElement('div'); el.className = 'training-toast'; document.body.appendChild(el) }
  el.textContent = message || ''
  el.style.background = type === 'error' ? '#b54747' : '#315c56'
  el.classList.add('training-toast--visible')
  clearTimeout(window.__trainingToastTimer)
  window.__trainingToastTimer = setTimeout(() => el.classList.remove('training-toast--visible'), 2400)
}
const image = '/imgs/NiImage.jpg'
const avatar = '/imgs/avatar.png'
const now = new Date()
const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

const makeState = () => {
  const people = [
    { id: 1, name: 'مريم أحمد', name_ar: 'مريم أحمد', name_en: 'Maryam Ahmed', image: avatar },
    { id: 2, name: 'عمر خالد', name_ar: 'عمر خالد', name_en: 'Omar Khaled', image: avatar },
    { id: 3, name: 'سارة محمود', name_ar: 'سارة محمود', name_en: 'Sara Mahmoud', image: avatar },
    { id: 4, name: 'نور علي', name_ar: 'نور علي', name_en: 'Nour Ali', image: avatar },
  ]
  const teams = [
    { id: 1, name: 'فريق المنتج', name_en: 'Product Team', members: [people[0], people[1]] },
    { id: 2, name: 'فريق التطبيقات', name_en: 'App Team', members: [people[2], people[3]] },
    { id: 3, name: 'فريق التصميم', name_en: 'Design Team', members: [people[1], people[2]] },
  ]
  const projects = [
    {
      id: 1, name: 'إطلاق المنصة الجديدة', name_ar: 'إطلاق المنصة الجديدة', name_en: 'New Platform Launch',
      ticket_id: 'PRJ-2026-014', status: 'IN_PROGRESS', start_date: '2026-09-01', dead_line: '2026-11-30',
      customer_name: 'شركة آفاق للتقنية', customer_name_ar: 'شركة آفاق للتقنية', customer_name_en: 'Afaq Technology', created_by: 'مريم أحمد', image, progress: 60, days_left: '62 يوم متبقي',
      tasks_progress: [{ name: 'فريق المنتج', name_en: 'Product Team', progress: 64 }, { name: 'فريق التطبيقات', name_en: 'App Team', progress: 45 }],
      members: [people[0], people[1], people[2]], description: '<p>منصة موحدة تساعد فرق العمل على تنظيم المشاريع ومتابعة الإنجاز والتواصل بفعالية.</p>', description_en: '<p>A unified platform that helps teams organize projects, track progress, and communicate effectively.</p>',
      attachments: [
        { id: 101, type: 'image', path: image, file_name: 'صورة المشروع', isSample: true, description: 'صورة المشروع', by: 'مريم أحمد', created_at: '2026-09-20', created_by: 1 },
        { id: 102, type: 'file', path: '/imgs/document.jpg', file_name: 'متطلبات المشروع', isSample: true, description: 'متطلبات المشروع', by: 'عمر خالد', created_at: '2026-09-18', created_by: 2 },
      ],
      links: [
        { id: 201, link: 'https://www.figma.com/', description: 'تصميمات Figma', by: 'عمر خالد', created_at: '2026-09-18', created_by: 2 },
        { id: 202, link: 'https://docs.google.com/', description: 'مستند متطلبات المشروع', by: 'مريم أحمد', created_at: '2026-09-15', created_by: 1 },
        { id: 203, link: 'https://github.com/', description: 'مستودع الكود', by: 'سارة محمود', created_at: '2026-09-12', created_by: 3 },
      ],
      events: [
        { id: 301, name: 'اعتماد واجهات المنصة', description: '<p>اعتماد التصميم النهائي مع العميل.</p>', children: [{ id: 302, name: 'مراجعة تجربة الاستخدام', description: '<p>تأكيد الملاحظات قبل بدء التطوير.</p>', children: [] }] },
        { id: 303, name: 'إطلاق النسخة التجريبية', description: '<p>تجهيز النسخة التجريبية.</p>', children: [] },
      ],
      tasks: [
        { id: 401, name: 'تصميم واجهات لوحة التحكم', description: '<p>تجهيز التصميم النهائي للشاشات الرئيسية ومراجعته مع الفريق.</p>', deadline_date: '2026-09-24', deadline_time: '15:00', finished: 2, members: [people[1]], comments: [], subTasks: [{ id: 411, name: 'تحديد نظام الألوان والخطوط', description: '', status: 'FINISHED', members: [] }, { id: 412, name: 'تصميم صفحة المشاريع', description: '', status: 'FINISHED', members: [] }, { id: 413, name: 'مراجعة التصميم مع الفريق', description: '', status: 'HOLD', members: [] }] },
        { id: 402, name: 'تطوير نظام تسجيل الدخول', description: '<p>تسجيل الدخول بالبريد الإلكتروني مع استعادة كلمة المرور.</p>', deadline_date: '2026-10-12', deadline_time: '', finished: 1, members: [people[2], people[3]], comments: [], subTasks: [{ id: 421, name: 'تجهيز واجهة تسجيل الدخول', description: '', status: 'FINISHED', members: [] }, { id: 422, name: 'ربط الواجهة بخدمة المصادقة', description: '', status: 'HOLD', members: [] }] },
      ],
      milestones: [{ id: 501, name: 'اعتماد التصميم النهائي', due_date: '2026-09-25', status: 'DONE' }, { id: 502, name: 'إطلاق النسخة التجريبية', due_date: '2026-10-20', status: 'IN_PROGRESS' }],
      comments: {},
    },
    {
      id: 2, name: 'تطوير تطبيق الجوال', name_ar: 'تطوير تطبيق الجوال', name_en: 'Mobile App Development',
      ticket_id: 'PRJ-2026-011', status: 'NEW', start_date: '2026-10-01', dead_line: '2026-12-18',
      customer_name: 'شركة آفاق للتقنية', customer_name_ar: 'شركة آفاق للتقنية', customer_name_en: 'Afaq Technology', created_by: 'مريم أحمد', image, progress: 0, days_left: '80 يوم متبقي',
      tasks_progress: [{ name: 'فريق التطبيقات', name_en: 'App Team', progress: 18 }], members: [people[2], people[3]],
      description: '<p>تطوير تطبيق جوال لتسهيل متابعة المشاريع والمهام.</p>', description_en: '<p>A mobile app that makes it easier to track projects and tasks.</p>', attachments: [], links: [], events: [], tasks: [], milestones: [], comments: {},
    },
    {
      id: 3, name: 'هوية العلامة التجارية', name_ar: 'هوية العلامة التجارية', name_en: 'Brand Identity',
      ticket_id: 'PRJ-2026-008', status: 'FINISHED', start_date: '2026-07-05', dead_line: '2026-09-10',
      customer_name: 'شركة آفاق للتقنية', customer_name_ar: 'شركة آفاق للتقنية', customer_name_en: 'Afaq Technology', created_by: 'مريم أحمد', image, progress: 100, days_left: '',
      tasks_progress: [{ name: 'فريق التصميم', name_en: 'Design Team', progress: 100 }], members: [people[0]], description: '<p>تطوير الهوية البصرية للعلامة التجارية.</p>', description_en: '<p>Develop the visual identity for the brand.</p>', attachments: [], links: [], events: [], tasks: [], milestones: [], comments: {},
    },
    {
      id: 4, name: 'بوابة الشركاء', name_ar: 'بوابة الشركاء', name_en: 'Partner Portal',
      ticket_id: 'PRJ-2026-005', status: 'POSTPONED', start_date: '2026-06-12', dead_line: '2026-10-30',
      customer_name: 'شركة آفاق للتقنية', customer_name_ar: 'شركة آفاق للتقنية', customer_name_en: 'Afaq Technology', created_by: 'مريم أحمد', image, progress: 0, days_left: '33 يوم متبقي',
      tasks_progress: [{ name: 'فريق المنتج', name_en: 'Product Team', progress: 36 }], members: [people[1], people[3]], description: '<p>بوابة للتواصل مع شركاء العمل.</p>', description_en: '<p>A portal for communicating with business partners.</p>', attachments: [], links: [], events: [], tasks: [], milestones: [], comments: {},
    },
  ]
  const peopleEn = { 'مريم أحمد': 'Maryam Ahmed', 'عمر خالد': 'Omar Khaled', 'سارة محمود': 'Sara Mahmoud', 'نور علي': 'Nour Ali' }
  const translations = {
    events: {
      301: ['Approve platform screens', '<p>Approve the final design with the client.</p>'],
      302: ['Review user experience', '<p>Confirm feedback before development begins.</p>'],
      303: ['Launch the beta version', '<p>Prepare the beta release.</p>'],
    },
    tasks: {
      401: ['Design dashboard screens', '<p>Prepare and review the final designs for the main screens with the team.</p>'],
      402: ['Build the sign-in system', '<p>Sign in with email and support password recovery.</p>'],
    },
    subtasks: {
      411: 'Choose the color and typography system', 412: 'Design the projects page', 413: 'Review the design with the team',
      421: 'Prepare the sign-in screen', 422: 'Connect the screen to the authentication service',
    },
    milestones: { 501: 'Approve final design', 502: 'Launch the beta version' },
    attachments: { 101: 'Project image', 102: 'Project requirements' },
    links: { 201: 'Figma designs', 202: 'Project requirements document', 203: 'Code repository' },
  }
  const enrichEvents = events => (events || []).forEach(event => {
    const translation = translations.events[event.id]
    if (translation) [event.name_en, event.description_en] = translation
    enrichEvents(event.children)
  })
  projects.forEach(project => {
    project.created_by_en = peopleEn[project.created_by] || project.created_by
    ;(project.attachments || []).forEach(item => {
      item.description_en = translations.attachments[item.id] || item.description
      item.by_en = peopleEn[item.by] || item.by
    })
    ;(project.links || []).forEach(item => {
      item.description_en = translations.links[item.id] || item.description
      item.by_en = peopleEn[item.by] || item.by
    })
    enrichEvents(project.events)
    ;(project.tasks || []).forEach(task => {
      const translation = translations.tasks[task.id]
      if (translation) [task.name_en, task.description_en] = translation
      ;(task.subTasks || []).forEach(subtask => { subtask.name_en = translations.subtasks[subtask.id] || subtask.name })
    })
    ;(project.milestones || []).forEach(milestone => { milestone.name_en = translations.milestones[milestone.id] || milestone.name })
  })
  return { projects, teams, people, nextId: 1000 }
}

function readState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return makeState()

    const state = JSON.parse(saved)
    const defaults = makeState()
    const projectsById = Object.fromEntries(defaults.projects.map(project => [String(project.id), project]))
    const peopleById = Object.fromEntries(defaults.people.map(person => [String(person.id), person]))
    const teamsByArabicName = Object.fromEntries(defaults.teams.map(team => [team.name, team]))

    state.projects = (state.projects || []).map((project) => {
      const fallback = projectsById[String(project.id)] || {}
      return Object.assign({}, project, {
        name_ar: project.name_ar || fallback.name_ar || project.name,
        name_en: project.name_en || fallback.name_en,
        customer_name_ar: project.customer_name_ar || fallback.customer_name_ar || project.customer_name,
        customer_name_en: project.customer_name_en || fallback.customer_name_en,
        description_en: project.description_en || fallback.description_en,
        created_by_en: project.created_by_en || fallback.created_by_en || project.created_by,
        attachments: mergeLocalizedItems(project.attachments, fallback.attachments).map((attachment) => ({
          ...attachment,
          missing: !attachment.isSample && !attachment.file_name && ['/imgs/document.jpg', image].includes(attachment.path),
        })),
        links: mergeLocalizedItems(project.links, fallback.links),
        events: mergeLocalizedItems(project.events, fallback.events, 'children'),
        tasks: mergeLocalizedItems(project.tasks, fallback.tasks, 'subTasks'),
        milestones: mergeLocalizedItems(project.milestones, fallback.milestones),
        members: (project.members || []).map((person) => Object.assign({}, person, {
          name_ar: person.name_ar || peopleById[String(person.id)]?.name_ar,
          name_en: person.name_en || peopleById[String(person.id)]?.name_en,
        })),
        tasks_progress: (project.tasks_progress || []).map((progress) => {
          const fallbackTeam = teamsByArabicName[progress.name]
          return Object.assign({}, progress, {
            name_en: progress.name_en || fallbackTeam?.name_en,
          })
        }),
      })
    })
    return state
  } catch (e) {
    return makeState()
  }
}
function saveState(state) {
  const serialized = JSON.stringify(state)
  const isEnglish = localStorage.getItem('project-details-language') === 'en'
  if (serialized.length > 4 * 1024 * 1024) {
    const error = new Error(isEnglish
      ? 'Training storage is full. Remove some attachments before adding more.'
      : 'مساحة التخزين التدريبية امتلأت. احذفي بعض المرفقات قبل إضافة المزيد.')
    error.response = { data: { message: error.message } }
    throw error
  }
  try {
    localStorage.setItem(STORAGE_KEY, serialized)
  } catch (cause) {
    const error = new Error(isEnglish
      ? 'Training storage is full. Remove some attachments before adding more.'
      : 'مساحة التخزين التدريبية امتلأت. احذفي بعض المرفقات قبل إضافة المزيد.')
    error.response = { data: { message: error.message } }
    throw error
  }
}
function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Unable to read the selected file'))
    reader.readAsDataURL(file)
  })
}
async function payload(value) {
  if (typeof FormData !== 'undefined' && value instanceof FormData) {
    const out = {}
    for (const [key, item] of value.entries()) {
      const isFile = typeof File !== 'undefined' && item instanceof File
      if (isFile && item.size > 1024 * 1024) {
        const isEnglish = localStorage.getItem('project-details-language') === 'en'
        const error = new Error(isEnglish
          ? 'Files must be 1 MB or smaller in this training version.'
          : 'حجم الملف يجب ألا يتجاوز 1 ميجابايت في نسخة التدريب.')
        error.response = { data: { message: error.message } }
        throw error
      }
      const safe = isFile
        ? { name: item.name, type: item.type, size: item.size, dataUrl: await readFileAsDataUrl(item) }
        : item
      if (key.startsWith('members[')) (out.members || (out.members = [])).push(safe)
      else if (key.startsWith('member_sections[')) {
        const match = key.match(/^member_sections\[([^\]]+)\]\[\d+\]$/)
        if (match) {
          if (!out.member_sections) out.member_sections = {}
          if (!out.member_sections[match[1]]) out.member_sections[match[1]] = []
          out.member_sections[match[1]].push(safe)
        }
      } else out[key] = safe
    }
    return out
  }
  return value && typeof value === 'object' ? value : {}
}
function response(data, message = 'تم الحفظ') { return { data: { data, message }, status: 200 } }
const englishMessages = {
  'تم الحذف': 'Deleted successfully',
  'تم إنشاء المشروع': 'Project created',
  'تم تحديث المشروع': 'Project updated',
  'تمت إضافة الرابط': 'Link added',
  'تمت إضافة المرفق': 'Attachment added',
  'تم تحديث المرفق': 'Attachment updated',
  'تمت إضافة المهمة الفرعية': 'Subtask added',
  'تمت إضافة المهمة': 'Task added',
  'تم تحديث المهمة': 'Task updated',
  'تمت إضافة الحدث': 'Note added',
  'تمت إضافة التعليق': 'Comment added',
  'تمت إضافة المرحلة': 'Milestone added',
  'تم تحديث المرحلة': 'Milestone updated',
  'تم تحديث الحالة': 'Status updated',
  'تم التحديث': 'Updated successfully',
  'تم الحفظ': 'Saved successfully',
}
function flattenEvents(events) { return (events || []).flatMap(e => [e, ...flattenEvents(e.children)]) }
function mergeLocalizedItems(items, fallbacks, childKey) {
  const defaults = new Map((fallbacks || []).map(item => [String(item.id), item]))
  return (items || []).map(item => {
    const fallback = defaults.get(String(item.id)) || {}
    const merged = { ...fallback, ...item }
    ;['name_en', 'name_ar', 'description_en', 'description_ar', 'by_en', 'by_ar'].forEach(key => {
      merged[key] = item[key] || fallback[key] || merged[key]
    })
    if (childKey) merged[childKey] = mergeLocalizedItems(item[childKey], fallback[childKey], childKey)
    return merged
  })
}
function removeEvent(events, id) {
  for (let index = events.length - 1; index >= 0; index -= 1) {
    const event = events[index]
    if (String(event.id) === String(id)) events.splice(index, 1)
    else removeEvent(event.children || [], id)
  }
}

function handle(method, url, body, config = {}) {
  const state = readState()
  const raw = String(url || '').replace(/^.*?training-api\//, '').replace(/^\/+/, '')
  const [path, queryString = ''] = raw.split('?')
  const query = Object.fromEntries(new URLSearchParams(queryString))
  const params = { ...(config.params || {}), ...query }
  const segments = path.split('/').filter(Boolean)
  const projectId = segments[1]
  const project = state.projects.find(p => String(p.id) === String(projectId))
  const data = body && typeof body === 'object' && !(typeof FormData !== 'undefined' && body instanceof FormData) ? body : {}
  const requestLocale = config.headers && config.headers['Accept-Language']
  const activeId = typeof window !== 'undefined' ? window.location.pathname.split('/').filter(Boolean).filter(x => x !== 'projects' && x !== 'edit' && x !== 'ar' && x !== 'en').pop() : null
  const activeProject = state.projects.find(p => String(p.id) === String(activeId)) || state.projects[0]
  const done = (value, message) => {
    saveState(state)
    const localizedMessage = requestLocale === 'en' && message ? (englishMessages[message] || message) : message
    return response(value, localizedMessage)
  }

  if (method === 'get') {
    if (path === 'settings') return Promise.resolve(response({ id: 1, permissions: [19,20,21,22,23,24,25,26,27,28,29,30].map(id => ({ id })), roles: [{ id: 1 }] }))
    if (path === 'teams') return Promise.resolve(response(state.teams.map(({ id, name, name_en }) => ({ id, name, name_en }))))
    if (path === 'team/members') return Promise.resolve(response(state.teams))
    if (path === 'projects') {
      let list = state.projects.map(p => ({ ...p, attachmentsCount: (p.attachments || []).length, linksCount: (p.links || []).length, eventsCount: flattenEvents(p.events).length }))
      if (params.date !== undefined && params.date !== '') {
        const months = Number(params.date) === 0 ? 1 : Number(params.date) === 1 ? 3 : Number(params.date) === 2 ? 6 : 0
        if (months) {
          const cutoff = new Date()
          cutoff.setDate(1)
          cutoff.setMonth(cutoff.getMonth() - (months - 1))
          const end = new Date()
          end.setDate(1)
          end.setMonth(end.getMonth() + 1)
          list = list.filter(p => {
            const start = new Date(`${p.start_date}T00:00:00`)
            return !Number.isNaN(start.getTime()) && start >= cutoff && start < end
          })
        }
      }
      if (params.name) list = list.filter(p => [p.name, p.name_ar, p.name_en].filter(Boolean).some(name => name.toLowerCase().includes(String(params.name).toLowerCase())))
      if (params.ticket_id) list = list.filter(p => p.ticket_id.toLowerCase().includes(String(params.ticket_id).toLowerCase()))
      if (params.team_id) list = list.filter(p => (p.members || []).some(m => state.teams.find(t => String(t.id) === String(params.team_id))?.members.some(tm => tm.id === m.id)))
      list.sort((a, b) => (a.sort_order ?? Number.MAX_SAFE_INTEGER) - (b.sort_order ?? Number.MAX_SAFE_INTEGER))
      return Promise.resolve(response(list))
    }
    if (segments[0] === 'projects' && segments.length === 2) return Promise.resolve(response(project || null))
    if (segments[0] === 'projects' && segments[2] === 'members') return Promise.resolve(response(project ? (project.members || []).map(m => ({ ...m, in_project: true })) : []))
    if (segments[0] === 'projects' && segments[2] === 'milestones') {
      const list = project?.milestones || []
      if (segments[3] === 'progress') return Promise.resolve({ data: { percent: list.length ? Math.round(list.reduce((n,m) => n + (m.status === 'DONE' ? 100 : m.status === 'IN_PROGRESS' ? 50 : 0), 0) / list.length) : 0 } })
      return Promise.resolve({ data: list })
    }
    if (segments[0] === 'tasks' && segments[2] === 'comments') {
      const task = state.projects.flatMap(p => p.tasks || []).find(t => String(t.id) === String(segments[1]))
      return Promise.resolve({ data: task?.comments || [] })
    }
    if (segments[0] === 'events') return Promise.resolve(response(flattenEvents(state.projects.flatMap(p => p.events || [])).find(e => String(e.id) === String(segments[1])) || null))
    if (segments[0] === 'attachments') {
      const attachment = state.projects.flatMap(p => p.attachments || []).find(a => String(a.id) === String(segments[1]))
      return Promise.resolve(response(attachment || { path: image }))
    }
    return Promise.resolve(response([]))
  }

  if (method === 'post') {
    if (path === 'sort/projects') {
      ;(data.id || []).forEach((id, index) => {
        const item = state.projects.find(p => String(p.id) === String(id))
        if (item) item.sort_order = index
      })
      return Promise.resolve(done(true))
    }
    if (path === 'tasks/sort') {
      const ids = (data.id || []).map(String)
      for (const p of state.projects) for (const task of p.tasks || []) {
        if ((task.subTasks || []).some(sub => ids.includes(String(sub.id)))) {
          task.subTasks.sort((a, b) => ids.indexOf(String(a.id)) - ids.indexOf(String(b.id)))
        }
      }
      return Promise.resolve(done(true))
    }
    if (path === 'projects') {
      const id = ++state.nextId
      const created = { id, name: data.name || data.name_ar || data.name_en || 'مشروع جديد', name_ar: data.name_ar, name_en: data.name_en, ticket_id: data.ticket_id || `PRJ-${id}`, status: 'NEW', start_date: data.start_date || today, dead_line: data.dead_line || '', customer_name: data.customer_name || data.customer_name_ar || '', customer_name_ar: data.customer_name_ar, customer_name_en: data.customer_name_en, created_by: 'مريم أحمد', created_by_en: 'Maryam Ahmed', image: data.image?.dataUrl || image, progress: 0, days_left: '', tasks_progress: [], members: state.people.filter(m => (data.members || []).map(String).includes(String(m.id))), member_sections: data.member_sections || {}, description: data.description || data.description_ar || data.description_en || '', description_ar: data.description_ar || data.description || '', description_en: data.description_en || '', attachments: [], links: [], events: [], tasks: [], milestones: [], comments: {} }
      if (data['link[link]']) created.links.push({ id: ++state.nextId, link: data['link[link]'], description: data['link[description]'] || '', by: 'مريم أحمد', created_at: today, created_by: 1 })
      state.projects.unshift(created)
      return Promise.resolve(done(created, 'تم إنشاء المشروع'))
    }
    if (path === 'links') {
      const p = state.projects.find(x => String(x.id) === String(data.project_id))
      if (p) p.links.push({ id: ++state.nextId, link: data.link, description: data.description, description_ar: data.description_ar || data.description || '', description_en: data.description_en || '', by: 'مريم أحمد', by_en: 'Maryam Ahmed', created_at: today, created_by: 1 })
      return Promise.resolve(done(true, 'تمت إضافة الرابط'))
    }
    if (path === 'attachments') {
      const p = state.projects.find(x => String(x.id) === String(data.project_id))
      if (p && data.attachment?.dataUrl) {
        const file = data.attachment
        const type = file.type && file.type.startsWith('image/') ? 'image' : file.type && file.type.startsWith('video/') ? 'video' : 'file'
        p.attachments.push({ id: ++state.nextId, type, path: file.dataUrl, file_name: file.name, file_type: file.type, file_size: file.size, description: file.name || 'مرفق جديد', description_ar: file.name || 'مرفق جديد', by: 'مريم أحمد', by_en: 'Maryam Ahmed', created_at: today, created_by: 1 })
      }
      return Promise.resolve(done(true, 'تمت إضافة المرفق'))
    }
    if (path === 'attachments/update') {
      const p = state.projects.find(x => x.attachments.some(a => String(a.id) === String(data.id)))
      const attachment = p && p.attachments.find(a => String(a.id) === String(data.id))
      if (attachment && data.attachment?.dataUrl) Object.assign(attachment, {
        path: data.attachment.dataUrl,
        file_name: data.attachment.name,
        file_type: data.attachment.type,
        file_size: data.attachment.size,
        type: data.attachment.type && data.attachment.type.startsWith('image/') ? 'image' : data.attachment.type && data.attachment.type.startsWith('video/') ? 'video' : 'file',
        description: data.attachment.name || attachment.description,
        description_ar: data.attachment.name || attachment.description_ar,
        missing: false,
      })
      return Promise.resolve(done(true, 'تم تحديث المرفق'))
    }
    if (path === 'tasks/sub') {
      const task = state.projects.flatMap(p => p.tasks || []).find(t => String(t.id) === String(data.task_id))
      if (task) task.subTasks.push({ id: ++state.nextId, name: data.name, name_ar: data.name_ar || '', name_en: data.name_en || '', description: data.description, description_ar: data.description_ar || '', description_en: data.description_en || '', status: 'HOLD', members: [] })
      if (task) task.finished = task.subTasks.filter(sub => sub.status === 'FINISHED').length
      return Promise.resolve(done(true, 'تمت إضافة المهمة الفرعية'))
    }
    if (path === 'tasks') {
      const p = state.projects.find(x => String(x.id) === String(data.project_id || projectId || activeId)) || activeProject
      if (p) {
        const [deadline_date = '', deadline_time = ''] = String(data.deadline || '').split(' ')
        const members = state.people.filter(member => (data.members || []).map(String).includes(String(member.id)))
        const subTasks = (data.subTasks || []).map(sub => ({ id: ++state.nextId, name: sub.name, name_ar: sub.name_ar, name_en: sub.name_en, description: sub.description || '', description_ar: sub.description_ar || '', description_en: sub.description_en || '', status: sub.status || 'HOLD', members: [] }))
        p.tasks.push({ id: ++state.nextId, name: data.name || 'مهمة جديدة', name_ar: data.name_ar || '', name_en: data.name_en || '', description: data.description || '', description_ar: data.description_ar || '', description_en: data.description_en || '', deadline_date: deadline_date || data.deadline_date || '', deadline_time: deadline_time || data.deadline_time || '', status: data.status || 'NEW', team_id: data.team_id, members, finished: subTasks.filter(sub => sub.status === 'FINISHED').length, comments: [], subTasks })
      }
      return Promise.resolve(done(true, 'تمت إضافة المهمة'))
    }
    if (path === 'events' || segments[0] === 'events') {
      const p = state.projects.find(x => String(x.id) === String(data.project_id || projectId || activeId)) || activeProject
      if (p && segments.length > 1) { const event = flattenEvents(p.events).find(e => String(e.id) === String(segments[1])); if (event) Object.assign(event, data) } else if (p) p.events.push({ id: ++state.nextId, name: data.name || data.title || 'حدث جديد', name_ar: data.name_ar || data.name || '', name_en: data.name_en || '', description: data.description || '', description_ar: data.description_ar || data.description || '', description_en: data.description_en || '', children: [] })
      return Promise.resolve(done(true, 'تمت إضافة الحدث'))
    }
    if (segments[0] === 'tasks' && segments[2] === 'comments') {
      const task = state.projects.flatMap(p => p.tasks || []).find(t => String(t.id) === String(segments[1]))
      if (task) task.comments.push({ id: ++state.nextId, comment: data.comment, author: 'مريم أحمد', author_en: 'Maryam Ahmed', created_at: today })
      return Promise.resolve(done(true, 'تمت إضافة التعليق'))
    }
    if (segments[0] === 'projects' && segments[2] === 'milestones') {
      if (project) project.milestones.push({ id: ++state.nextId, name: data.name, name_ar: data.name_ar, name_en: data.name_en, due_date: data.due_date, status: data.status || 'OPEN' })
      return Promise.resolve(done(true, 'تمت إضافة المرحلة'))
    }
    if (segments[0] === 'projects' && segments.length === 2) {
      if (project) { const patch = { ...data }; if (Array.isArray(patch.members)) patch.members = state.people.filter(m => patch.members.map(String).includes(String(m.id))); Object.assign(project, patch, { name: data.name || data.name_ar || project.name, customer_name: data.customer_name || data.customer_name_ar || project.customer_name, image: data.image?.dataUrl || project.image }) }
      return Promise.resolve(done(project, 'تم تحديث المشروع'))
    }
    return Promise.resolve(done(true))
  }

  if (method === 'put') {
    if (segments[0] === 'projects' && segments.length === 2 && project) { if (params.status) project.status = params.status; return Promise.resolve(done(project, 'تم تحديث الحالة')) }
    if (segments[0] === 'tasks' && segments[1] === 'sub') {
      const sub = state.projects.flatMap(p => p.tasks || []).flatMap(t => t.subTasks || []).find(s => String(s.id) === String(segments[2]))
      if (sub) {
        if (params.name) sub.name = params.name
        if (params.name_ar) sub.name_ar = params.name_ar
        if (params.name_en) sub.name_en = params.name_en
        if (params.description) sub.description = params.description
        if (params.description_ar) sub.description_ar = params.description_ar
        if (params.description_en) sub.description_en = params.description_en
      }
      return Promise.resolve(done(sub, 'تم التحديث'))
    }
    if (segments[0] === 'tasks' && segments[1] === 'toggle') {
      let parentTask = null
      const sub = state.projects.flatMap(p => p.tasks || []).flatMap(t => {
        const match = (t.subTasks || []).find(s => String(s.id) === String(segments[2]))
        if (match) parentTask = t
        return match ? [match] : []
      })[0]
      if (sub) sub.status = params.status || sub.status
      if (parentTask) parentTask.finished = parentTask.subTasks.filter(item => item.status === 'FINISHED').length
      return Promise.resolve(done(sub, 'تم تحديث المهمة'))
    }
    if (segments[0] === 'tasks' && segments.length === 2) {
      const task = state.projects.flatMap(p => p.tasks || []).find(t => String(t.id) === String(segments[1]))
      if (task) Object.assign(task, data)
      return Promise.resolve(done(task, 'تم تحديث المهمة'))
    }
    if (segments[0] === 'projects' && segments[2] === 'milestones') {
      const m = project?.milestones.find(x => String(x.id) === String(segments[3]))
      if (m) Object.assign(m, data)
      return Promise.resolve(done(m, 'تم تحديث المرحلة'))
    }
    return Promise.resolve(done(true))
  }

  if (method === 'delete') {
    if (segments[0] === 'projects' && segments.length === 2) state.projects = state.projects.filter(p => String(p.id) !== String(segments[1]))
    else if (segments[0] === 'tasks' && segments[1] !== 'sub') {
      for (const p of state.projects) p.tasks = p.tasks.filter(t => String(t.id) !== String(segments[1]))
    } else if (segments[0] === 'attachments') {
      for (const p of state.projects) p.attachments = p.attachments.filter(a => String(a.id) !== String(segments[1]))
    } else if (segments[0] === 'links') {
      for (const p of state.projects) p.links = p.links.filter(a => String(a.id) !== String(segments[1]))
    } else if (segments[0] === 'events') {
      for (const p of state.projects) removeEvent(p.events, segments[1])
    } else if (segments[0] === 'projects' && segments[2] === 'milestones' && project) {
      project.milestones = project.milestones.filter(m => String(m.id) !== String(segments[3]))
    } else if (segments[0] === 'tasks' && segments[1] === 'sub') {
      for (const p of state.projects) for (const t of p.tasks) {
        t.subTasks = t.subTasks.filter(s => String(s.id) !== String(segments[2]))
        t.finished = t.subTasks.filter(s => s.status === 'FINISHED').length
      }
    }
    return Promise.resolve(done(true, 'تم الحذف'))
  }
  return Promise.resolve(response(null))
}

export default (_, inject) => {
  const savedLocale = typeof localStorage !== 'undefined' && localStorage.getItem('project-details-language')
  const i18n = Vue.observable({ locale: savedLocale === 'en' ? 'en' : 'ar' })
  i18n.setLocale = (locale) => {
    i18n.locale = locale === 'en' ? 'en' : 'ar'
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('project-details-language', i18n.locale)
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = i18n.locale
      document.documentElement.dir = i18n.locale === 'ar' ? 'rtl' : 'ltr'
    }
  }

  if (process.client) {
    i18n.setLocale(i18n.locale)
    window.Quill = Quill
    if (!localStorage.getItem(STORAGE_KEY)) saveState(makeState())
    if (!localStorage.getItem('token')) localStorage.setItem('token', 'training-demo')
  }
  const axiosMock = {
    get: (url, config) => handle('get', url, null, config),
    post: async (url, body, config) => handle('post', url, await payload(body), config),
    put: (url, body, config) => handle('put', url, body, config),
    delete: (url, config) => handle('delete', url, null, config),
  }
  Vue.mixin({ methods: { localePath(path) { return path } } })
  inject('i18n', i18n)
  inject('t', key => {
    const translations = i18n.locale === 'en' ? translationsEn : translationsAr
    return translations[key] || translationsAr[key] || key
  })
  inject('toast', { success: message => showToast(message, 'success'), error: message => showToast(message, 'error') })
  inject('axios', axiosMock)
  inject('resolveImage', (src, fallback = image) => {
    if (!src) return fallback
    if (typeof src === 'string' && (src.startsWith('http') || src.startsWith('/') || src.startsWith('data:image/'))) return src
    return `/${String(src).replace(/^\/+/, '')}`
  })
}
