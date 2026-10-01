<template>
  <v-card class="add-task-dialog">
    <v-container class="add-task-dialog__body">
      <header class="add-task-dialog__head">
        <h3>{{ isEdit ? $t('Edit Task') : $t('Add Task') }}</h3>
        <p>{{ isEdit ? $t('Update task details and deadline') : $t('Create a task and assign it to a team') }}</p>
      </header>

      <feature-limit-notice v-if="!isEdit" feature="tasks" />

      <v-row dense>
        <v-col cols="12" sm="6">
          <label class="rms-labeled-field__label">{{ $t('Add Title') }} *</label>
          <v-text-field
            v-model="name"
            outlined
            dense
            hide-details="auto"
            :placeholder="$t('Add Title')"
          />
        </v-col>
        <v-col cols="12" sm="6">
          <label class="rms-labeled-field__label">{{ $t('Status') }}</label>
          <v-select
            v-model="statusProject"
            :items="projectStatus"
            item-text="name"
            item-value="value"
            outlined
            dense
            hide-details="auto"
            :placeholder="$t('Status')"
          />
        </v-col>

        <v-col v-if="!isProjectScoped" cols="12" sm="6">
          <label class="rms-labeled-field__label">{{ $t('Project Name') }}</label>
          <v-select
            v-model="idProject"
            :items="projects"
            item-text="name"
            item-value="id"
            outlined
            dense
            hide-details="auto"
            :placeholder="$t('Project Name')"
            @change="loadProjectScope"
          />
        </v-col>

        <v-col cols="12" sm="6">
          <label class="rms-labeled-field__label">{{ $t('Department') }}</label>
          <v-select
            v-model="Departmentvalue"
            :items="depatment"
            item-text="name"
            item-value="id"
            outlined
            dense
            hide-details="auto"
            multiple
            chips
            deletable-chips
            :placeholder="$t('Department')"
            @change="onDepartmentsChange"
          />
        </v-col>
        <v-col cols="12" sm="6">
          <label class="rms-labeled-field__label">{{ $t('Assigne') }}</label>
          <v-select
            v-model="Assignevalue"
            :items="filteredAssignees"
            item-text="name"
            item-value="id"
            outlined
            dense
            hide-details="auto"
            multiple
            chips
            deletable-chips
            :placeholder="$t('Assigne')"
          />
        </v-col>
      </v-row>

      <div class="add-task-dialog__field">
        <label class="rms-labeled-field__label">{{ $t('Add Description') }}</label>
        <div :id="editorDomId" class="add-task-dialog__editor" />
      </div>

      <section v-if="!isEdit" class="add-task-dialog__subtasks">
        <div class="add-task-dialog__subtasks-head">
          <h4>{{ $t('Add Sub Task') }}</h4>
          <button
            type="button"
            class="btn btn-view add-task-dialog__mini-btn"
            @click.prevent="addSubTask()"
          >
            + {{ $t('Add Task') }}
          </button>
        </div>

        <div
          v-for="(row, index) in subtaskRows"
          :key="'subtask-row-' + index"
          class="add-task-dialog__subtask"
        >
          <v-checkbox
            v-model="row.done"
            dense
            hide-details
            class="add-task-dialog__check"
            @change="row.status = row.done ? 'FINISHED' : 'HOLD'"
          />
          <div class="add-task-dialog__subtask-fields">
            <v-text-field
              v-model="row.name"
              outlined
              dense
              hide-details="auto"
              :placeholder="$t('Add Title')"
            />
            <v-text-field
              v-model="row.description"
              outlined
              dense
              hide-details="auto"
              :placeholder="$t('Add Description')"
            />
          </div>
          <button
            type="button"
            class="btn btn-delete add-task-dialog__mini-btn"
            @click.prevent="removeSubTask(index)"
          >
            {{ $t('Delete') }}
          </button>
        </div>
      </section>

      <v-row dense class="mt-2">
        <v-col cols="12" sm="6">
          <label class="rms-labeled-field__label">{{ $t('Deadline') }}</label>
          <v-menu
            v-model="menu"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
            min-width="auto"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                v-model="date"
                :placeholder="$t('Deadline')"
                prepend-inner-icon="mdi-calendar"
                readonly
                outlined
                dense
                hide-details="auto"
                v-bind="attrs"
                v-on="on"
              />
            </template>
            <v-date-picker
              v-model="date"
              prev-icon="mdi-chevron-right"
              next-icon="mdi-chevron-left"
              @input="menu = false"
            />
          </v-menu>
        </v-col>
        <v-col cols="12" sm="6">
          <label class="rms-labeled-field__label">{{ $t('Select A Time') }}</label>
          <v-menu
            ref="menu"
            v-model="menu2"
            :close-on-content-click="false"
            :return-value.sync="time"
            transition="scale-transition"
            offset-y
            max-width="290px"
            min-width="290px"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                v-model="time"
                :placeholder="$t('Select A Time')"
                prepend-inner-icon="mdi-clock-time-four-outline"
                readonly
                outlined
                dense
                hide-details="auto"
                v-bind="attrs"
                v-on="on"
              />
            </template>
            <v-time-picker
              v-if="menu2"
              v-model="time"
              full-width
              @click:minute="$refs.menu.save(time)"
            />
          </v-menu>
        </v-col>
      </v-row>

      <button
        type="button"
        class="btn btn-create add-task-dialog__submit"
        :disabled="saving"
        @click.prevent="submitTask()"
      >
        {{ isEdit ? $t('Save') : $t('Add') }}
      </button>
    </v-container>
  </v-card>
</template>

<script>
import { sanitizeHtml } from '~/utils/sanitizeHtml'

export default {
  name: 'AddTask',
  props: {
    projectId: {
      type: [Number, String],
      default: null,
    },
    task: {
      type: Object,
      default: null,
    },
  },
  computed: {
    isEdit() {
      return !!(this.task && this.task.id)
    },
    editorDomId() {
      return this.isEdit ? `task-editor-edit-${this.task.id}` : 'task-editor-create'
    },
    projectStatus() {
      return [
        { name: this.$t('New'), value: 'NEW' },
        { name: this.$t('In Progress'), value: 'IN_PROGRESS' },
        { name: this.$t('Finished'), value: 'FINISHED' },
        { name: this.$t('Hold'), value: 'HOLD' },
      ]
    },
    lockedProjectId() {
      if (this.projectId != null && this.projectId !== '') return this.projectId
      if (this.$route && this.$route.params && this.$route.params.id) {
        return this.$route.params.id
      }
      return null
    },
    isProjectScoped() {
      return !!this.lockedProjectId
    },
    filteredAssignees() {
      const selectedTeams = Array.isArray(this.Departmentvalue) ? this.Departmentvalue : []
      if (!selectedTeams.length) return this.projectMembers

      const allowed = new Set()
      this.depatment.forEach((team) => {
        if (!selectedTeams.map(String).includes(String(team.id))) return
        ;(team.members || []).forEach((member) => {
          if (member && member.id != null) allowed.add(String(member.id))
        })
      })

      return this.projectMembers.filter((member) => allowed.has(String(member.id)))
    },
  },
  data() {
    return {
      menu2: false,
      date: null,
      menu: false,
      time: null,
      name: '',
      subtaskRows: [],
      Departmentvalue: [],
      Assignevalue: [],
      projects: [],
      depatment: [],
      projectMembers: [],
      allTeamsWithMembers: [],
      statusProject: 'NEW',
      idProject: null,
      quill: null,
      saving: false,
      notificationData: {
        position: 'top-right',
        timeout: 2000,
        closeOnClick: true,
        pauseOnFocusLoss: true,
        pauseOnHover: true,
        draggable: true,
        draggablePercent: 0.6,
        showCloseButtonOnHover: true,
        hideProgressBar: true,
        closeButton: 'button',
        rtl: false,
      },
    }
  },
  mounted() {
    this.bootstrap()
  },
  beforeDestroy() {
    this.quill = null
  },
  methods: {
    authHeaders() {
      return {
        Authorization: `Bearer ${localStorage.token}`,
        Accept: 'application/json',
        'Accept-Language': this.$i18n.locale,
      }
    },
    normalizeStatus(status) {
      const value = String(status || '').trim()
      if (value === 'IN PROGRESS') return 'IN_PROGRESS'
      if (value === 'CREATED') return 'NEW'
      return value || 'NEW'
    },
    async bootstrap() {
      if (this.isProjectScoped) {
        this.idProject = this.lockedProjectId
        await this.loadProjectScope(this.idProject)
      } else {
        const projectsRes = await this.$axios.get('/projects', { headers: this.authHeaders() })
        this.projects = Array.isArray(projectsRes.data.data) ? projectsRes.data.data : []
      }

      await this.$nextTick()
      this.initializeDescriptionEditor()
      if (this.isEdit) {
        this.applyTask(this.task)
      }
    },
    applyTask(task) {
      if (!task) return
      this.name = this.$i18n.locale === 'en'
        ? (task.name_en || task.name || '')
        : (task.name_ar || task.name || '')
      this.statusProject = this.normalizeStatus(task.status)
      this.date = task.deadline_date || null
      this.time = task.deadline_time || null
      this.idProject = task.project_id || this.lockedProjectId
      this.Departmentvalue = task.team_id != null ? [task.team_id] : []
      this.Assignevalue = Array.isArray(task.members)
        ? task.members.map((member) => member.id).filter((id) => id != null)
        : []
      this.$nextTick(() => {
        if (this.quill) {
          this.quill.root.innerHTML = sanitizeHtml(this.$i18n.locale === 'en'
            ? (task.description_en || task.description || '')
            : (task.description_ar || task.description || ''))
        }
      })
    },
    async loadProjectScope(projectId) {
      if (!projectId) {
        this.depatment = []
        this.projectMembers = []
        this.Departmentvalue = []
        this.Assignevalue = []
        return
      }

      this.idProject = projectId

      const [projectRes, membersRes, teamsRes] = await Promise.all([
        this.$axios.get(`/projects/${projectId}`, { headers: this.authHeaders() }),
        this.$axios.get(`/projects/${projectId}/members`, { headers: this.authHeaders() }),
        this.$axios.get('/team/members', { headers: this.authHeaders() }),
      ])

      const projectData = (projectRes.data && projectRes.data.data) || {}
      const projectMembers = Array.isArray(projectData.members) ? projectData.members : []
      const assigneeList = Array.isArray(membersRes.data && membersRes.data.data)
        ? membersRes.data.data.filter((item) => item.in_project == true)
        : []

      const byId = {}
      ;[...projectMembers, ...assigneeList].forEach((member) => {
        if (!member || member.id == null) return
        byId[String(member.id)] = {
          id: member.id,
          name: member.name,
          image: member.image,
        }
      })
      this.projectMembers = Object.values(byId)
      this.allTeamsWithMembers = Array.isArray(teamsRes.data && teamsRes.data.data)
        ? teamsRes.data.data
        : []

      const apiDepartments = Array.isArray(projectData.departments) ? projectData.departments : []
      if (apiDepartments.length) {
        this.depatment = apiDepartments.map((dept) => {
          const team = this.allTeamsWithMembers.find((item) => String(item.id) === String(dept.id))
          const memberIdSet = new Set((dept.member_ids || []).map((id) => String(id)))
          return {
            id: dept.id,
            name: dept.name || (team && team.name) || `#${dept.id}`,
            members: team && Array.isArray(team.members)
              ? team.members
              : this.projectMembers.filter((member) => memberIdSet.has(String(member.id))),
          }
        })
      } else {
        const memberIds = new Set(this.projectMembers.map((m) => String(m.id)))
        const claimed = new Set()
        this.depatment = []
        this.allTeamsWithMembers.forEach((team) => {
          const ids = (team.members || [])
            .filter((member) => {
              const id = String(member.id)
              if (!memberIds.has(id) || claimed.has(id)) return false
              claimed.add(id)
              return true
            })
            .map((member) => member.id)
          if (!ids.length) return
          this.depatment.push({
            id: team.id,
            name: team.name,
            members: (team.members || []).filter((member) => ids.map(String).includes(String(member.id))),
          })
        })
      }

      if (!this.isEdit) {
        this.Departmentvalue = []
        this.Assignevalue = []
      }
    },
    onDepartmentsChange() {
      const allowed = new Set(this.filteredAssignees.map((m) => String(m.id)))
      this.Assignevalue = (this.Assignevalue || []).filter((id) => allowed.has(String(id)))
    },
    removeSubTask(index) {
      this.subtaskRows.splice(index, 1)
    },
    addSubTask() {
      this.subtaskRows.push({
        name: '',
        description: '',
        status: 'HOLD',
        done: false,
      })
    },
    notification(message, status) {
      status == 'success'
        ? this.$toast.success(message, this.notificationData)
        : this.$toast.error(message, this.notificationData)
    },
    buildPayload() {
      const projectId = this.idProject || this.lockedProjectId
      const teamIds = Array.isArray(this.Departmentvalue) ? this.Departmentvalue : []
      const payload = {
        project_id: projectId,
        name: this.name,
        description: this.quill ? this.quill.root.innerHTML : '',
        name_ar: this.$i18n.locale === 'ar' ? this.name : (this.task && (this.task.name_ar || this.task.name) || ''),
        name_en: this.$i18n.locale === 'en' ? this.name : (this.task && this.task.name_en || ''),
        description_ar: this.$i18n.locale === 'ar'
          ? (this.quill ? this.quill.root.innerHTML : '')
          : (this.task && (this.task.description_ar || this.task.description) || ''),
        description_en: this.$i18n.locale === 'en'
          ? (this.quill ? this.quill.root.innerHTML : '')
          : (this.task && this.task.description_en || ''),
        deadline: this.date ? `${this.date} ${this.time || '00:00'}` : null,
        status: this.statusProject,
        team_id: teamIds[0],
        members: Array.isArray(this.Assignevalue) ? this.Assignevalue : [],
      }

      if (!this.isEdit) {
        payload.subTasks = this.subtaskRows
          .filter((row) => String(row.name || '').trim())
          .map((row, index) => ({
            name: row.name,
            name_ar: this.$i18n.locale === 'ar' ? row.name : '',
            name_en: this.$i18n.locale === 'en' ? row.name : '',
            description: row.description || '',
            description_ar: this.$i18n.locale === 'ar' ? (row.description || '') : '',
            description_en: this.$i18n.locale === 'en' ? (row.description || '') : '',
            sort: index,
            status: row.done ? 'FINISHED' : 'HOLD',
          }))
      }

      return payload
    },
    submitTask() {
      const projectId = this.idProject || this.lockedProjectId
      if (!projectId) {
        this.notification(this.$t('Project Name') + ' ' + this.$t('Required'), 'error')
        return
      }
      if (!String(this.name || '').trim()) {
        this.notification(this.$t('Add Title') + ' ' + this.$t('Required'), 'error')
        return
      }

      const teamIds = Array.isArray(this.Departmentvalue) ? this.Departmentvalue : []
      if (!teamIds.length) {
        this.notification(this.$t('Department') + ' ' + this.$t('Required'), 'error')
        return
      }

      const data = this.buildPayload()
      this.saving = true

      const request = this.isEdit
        ? this.$axios.put(`/tasks/${this.task.id}`, data, { headers: this.authHeaders() })
        : this.$axios.post('/tasks', data, { headers: this.authHeaders() })

      request
        .then((res) => {
          this.$emit('hideDiaglogAddTask', false)
          this.notification(res.data.message, 'success')
        })
        .catch((error) => {
          this.notification(error.response?.data?.message || this.$t('Error'), 'error')
        })
        .finally(() => {
          this.saving = false
        })
    },
    initializeDescriptionEditor() {
      const editor = document.getElementById(this.editorDomId)
      if (!editor || this.quill) return
      this.quill = new Quill(`#${this.editorDomId}`, {
        modules: {
          toolbar: [
            [{ header: [1, 2, 3, false] }],
            ['bold', 'italic', 'underline'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['link'],
            ['clean'],
          ],
        },
        theme: 'snow',
        placeholder: this.$t('Add Description'),
      })
    },
  },
}
</script>

<style lang="scss" scoped>
@import "@/assets/css/variables.scss";
.add-task-dialog {
  border-radius: 14px !important;
  overflow: hidden;

  &__body {
    padding: 24px !important;
    max-height: 80vh;
    overflow-y: auto;
  }

  &__head {
    margin-bottom: 16px;
    text-align: center;

    h3 {
      margin: 0 0 4px;
      font-size: 18px;
      font-weight: 600;
      color: $text-primary;
    }

    p {
      margin: 0;
      font-size: 13px;
      color: $text-secondary;
    }
  }

  &__field {
    margin-top: 12px;
  }

  &__editor {
    min-height: 140px;
    background: $surface;
    border-radius: 0 0 8px 8px;
  }

  &__subtasks {
    margin-top: 16px;
    padding: 12px;
    border: 1px solid $border;
    border-radius: 10px;
    background: $surface-secondary;
  }

  &__subtasks-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 10px;

    h4 {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
    }
  }

  &__subtask {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 10px;
  }

  &__check {
    margin-top: 4px;
    flex: 0 0 auto;
  }

  &__subtask-fields {
    flex: 1 1 auto;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__mini-btn {
    min-height: 36px !important;
    height: 36px !important;
    padding: 0 12px !important;
    width: auto !important;
    white-space: nowrap;
  }

  &__submit {
    width: 100%;
    margin-top: 16px;
  }
}

::v-deep .ql-toolbar.ql-snow {
  border: 1px solid $border !important;
  border-radius: 8px 8px 0 0 !important;
  background: $surface-secondary;
}

::v-deep .ql-container.ql-snow {
  border: 1px solid $border !important;
  border-top: 0 !important;
  border-radius: 0 0 8px 8px !important;
  min-height: 140px;
}
</style>
