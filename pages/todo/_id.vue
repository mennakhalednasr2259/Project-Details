<template>
  <div class="task-details-page">
    <v-container v-if="loading" class="task-details-page__loading">
      <app-skeleton type="page" />
    </v-container>

    <v-container v-else-if="task && project" class="task-details-page__container">
      <header class="task-details-heading">
        <div>
          <p>{{ $t('Task Details') }}</p>
          <h1>{{ taskName }}</h1>
        </div>
        <div class="task-details-heading__actions">
          <nuxt-link class="btn btn-view" :to="localePath(`/projects/${project.id}`)">
            {{ $t('Open Project') }}
          </nuxt-link>
          <button type="button" class="btn btn-view" @click="editDialog = true">
            {{ $t('Edit') }}
          </button>
        </div>
      </header>

      <section class="task-details-card">
        <div class="task-details-card__top">
          <div class="task-details-card__identity">
            <img :src="$resolveImage(project.image, require('@/assets/imgs/NiImage.jpg'))" :alt="projectName">
            <div>
              <span class="task-details-card__eyebrow">{{ projectName }}</span>
              <h2>{{ taskName }}</h2>
              <div v-if="taskTeams.length" class="task-details-card__teams">
                <span v-for="team in taskTeams" :key="team.id || team.name" class="task-details-card__team">
                  {{ localized(team, 'name') }}
                </span>
              </div>
            </div>
          </div>

          <div class="task-details-card__status">
            <label for="task-status">{{ $t('Status') }}</label>
            <v-select
              id="task-status"
              v-model="taskStatus"
              :items="statusOptions"
              item-text="text"
              item-value="value"
              outlined
              dense
              hide-details
              :disabled="savingStatus"
              @change="saveStatus"
            />
          </div>
        </div>

        <div class="task-details-card__meta">
          <div>
            <span>{{ $t('Members') }}</span>
            <div v-if="taskMembers.length" class="task-details-members">
              <div v-for="member in taskMembers" :key="member.id" class="task-details-members__person">
                <img :src="$resolveImage(member.image, require('@/assets/imgs/avatar.png'))" :alt="personName(member)">
                <span>{{ personName(member) }}</span>
              </div>
            </div>
            <p v-else class="task-details-muted">{{ $t('No Data') }}</p>
          </div>

          <div>
            <span>{{ $t('Deadline') }}</span>
            <p>{{ deadlineLabel }}</p>
          </div>
        </div>

        <div class="task-details-progress">
          <div class="task-details-progress__track">
            <div class="task-details-progress__value" :style="{ width: `${progress.percent}%` }"></div>
            <span>{{ progress.percent }}%</span>
          </div>
          <p>{{ $t('Completed') }} {{ progress.completedItems }} {{ $t('of') }} {{ progress.totalItems }}</p>
        </div>
      </section>

      <section class="task-details-card task-subtasks">
        <div class="task-details-section-heading">
          <h2>{{ $t('Subtasks') }}</h2>
          <span>{{ $t('Completed') }} {{ progress.completedItems }} {{ $t('of') }} {{ progress.totalItems }}</span>
        </div>

        <ul v-if="!showSubtaskForm && task.subTasks && task.subTasks.length" class="task-subtasks__list">
          <li v-for="subtask in task.subTasks" :key="subtask.id" class="task-subtasks__item">
            <label>
              <input
                type="checkbox"
                :checked="subtask.status === 'FINISHED'"
                :disabled="savingSubtaskId === String(subtask.id)"
                @change="toggleSubtask(subtask, $event.target.checked)"
              >
              <span>
                <strong>{{ localized(subtask, 'name') }}</strong>
                <small v-if="localized(subtask, 'description')">{{ localized(subtask, 'description') }}</small>
              </span>
            </label>
          </li>
        </ul>
        <app-empty-state v-else-if="!showSubtaskForm" icon="mdi-format-list-checks" :title="$t('No subtasks yet')" />

        <form v-if="showSubtaskForm" class="task-subtasks__form" @submit.prevent="addSubtask">
          <v-text-field
            class="task-subtasks__field"
            v-model="newSubtaskName"
            :placeholder="$t('Name')"
            :aria-label="$t('Name')"
            outlined
            dense
            hide-details="auto"
            required
          />
          <v-text-field
            class="task-subtasks__field"
            v-model="newSubtaskDescription"
            :placeholder="$t('Details')"
            :aria-label="$t('Details')"
            outlined
            dense
            hide-details="auto"
          />
          <div class="task-subtasks__form-actions">
            <button type="submit" class="btn btn-create" :disabled="savingSubtask || !newSubtaskName.trim()">
              {{ $t('Create') }}
            </button>
            <button type="button" class="btn btn-view" :disabled="savingSubtask" @click="cancelSubtaskForm">
              {{ $t('Cancel') }}
            </button>
          </div>
        </form>
        <button v-else type="button" class="btn btn-view task-subtasks__add" @click="showSubtaskForm = true">
          <span class="mdi mdi-plus" aria-hidden="true"></span>
          {{ $t('Add Subtask') }}
        </button>
      </section>

      <section class="task-details-card task-comments-card">
        <task-comments :task-id="task.id" :members="taskMembers" />
      </section>

      <v-dialog v-model="editDialog" max-width="760" @click:outside="editDialog = false" @keydown.esc="editDialog = false">
        <add-task
          :key="`edit-${task.id}`"
          :project-id="String(project.id)"
          :task="task"
          @hideDiaglogAddTask="onTaskEdited"
        />
      </v-dialog>
    </v-container>

    <v-container v-else class="task-details-page__missing">
      <app-empty-state icon="mdi-checkbox-marked-circle-outline" :title="$t('No Data')">
        <nuxt-link class="btn btn-view" :to="localePath('/projects')">{{ $t('Current Projects') }}</nuxt-link>
      </app-empty-state>
    </v-container>
  </div>
</template>

<script>
import { personName } from '~/utils/personName'
import { summarizeTaskProgress } from '~/utils/projectProgress'
import TaskComments from '~/components/TaskComments.vue'
import AddTask from '~/components/addTask.vue'

export default {
  components: { TaskComments, AddTask },
  data() {
    return {
      loading: true,
      task: null,
      project: null,
      teams: [],
      taskStatus: 'NEW',
      savingStatus: false,
      savingSubtaskId: null,
      savingSubtask: false,
      showSubtaskForm: false,
      newSubtaskName: '',
      newSubtaskDescription: '',
      editDialog: false,
    }
  },
  computed: {
    taskName() {
      return this.localized(this.task, 'name')
    },
    projectName() {
      return this.localized(this.project, 'name')
    },
    taskMembers() {
      return Array.isArray(this.task && this.task.members) ? this.task.members : []
    },
    taskTeams() {
      if (!this.task) return []
      if (Array.isArray(this.task.team_names) && this.task.team_names.length) return this.task.team_names
      const ids = Array.isArray(this.task.team_ids) && this.task.team_ids.length
        ? this.task.team_ids
        : (this.task.team_id != null ? [this.task.team_id] : [])
      return ids.map(id => this.teams.find(team => String(team.id) === String(id))).filter(Boolean)
    },
    progress() {
      return summarizeTaskProgress(this.task)
    },
    statusOptions() {
      return [
        { value: 'NEW', text: this.$t('New') },
        { value: 'IN_PROGRESS', text: this.$t('In Progress') },
        { value: 'FINISHED', text: this.$t('Finished') },
        { value: 'HOLD', text: this.$t('Hold') },
      ]
    },
    deadlineLabel() {
      if (!this.task || !this.task.deadline_date) return this.$t('No deadline')
      const parts = String(this.task.deadline_date).slice(0, 10).split('-')
      let date = this.task.deadline_date
      if (parts.length === 3 && parts.every(part => /^\d+$/.test(part))) {
        date = new Date(Date.UTC(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])))
          .toLocaleDateString(this.$i18n.locale === 'ar' ? 'ar-EG' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
      }
      return this.task.deadline_time ? `${date} · ${this.task.deadline_time}` : date
    },
  },
  async mounted() {
    await this.loadTask()
  },
  methods: {
    headers() {
      return {
        Authorization: `Bearer ${localStorage.token}`,
        Accept: 'application/json',
        'Accept-Language': this.$i18n.locale,
      }
    },
    localized(item, field) {
      if (!item) return ''
      const suffix = this.$i18n.locale === 'en' ? '_en' : '_ar'
      return item[`${field}${suffix}`] || item[field] || item[`${field}_en`] || item[`${field}_ar`] || ''
    },
    personName(member) {
      return personName(member, this.$i18n.locale)
    },
    async loadTask() {
      this.loading = true
      try {
        const [projectsRes, teamsRes] = await Promise.all([
          this.$axios.get('/projects', { headers: this.headers() }),
          this.$axios.get('/teams', { headers: this.headers() }),
        ])
        const projects = Array.isArray(projectsRes.data && projectsRes.data.data) ? projectsRes.data.data : []
        const project = projects.find(item => String(item.id) === String(this.$route.query.project))
          || projects.find(item => (item.tasks || []).some(task => String(task.id) === String(this.$route.params.id)))
        this.project = project || null
        this.task = project && (project.tasks || []).find(item => String(item.id) === String(this.$route.params.id)) || null
        this.teams = Array.isArray(teamsRes.data && teamsRes.data.data) ? teamsRes.data.data : []
        if (this.task) this.taskStatus = this.task.status || 'NEW'
      } catch (error) {
        this.project = null
        this.task = null
      } finally {
        this.loading = false
      }
    },
    async saveStatus(status) {
      if (!this.task || this.savingStatus) return
      this.savingStatus = true
      try {
        await this.$axios.put(`/tasks/${this.task.id}`, { status }, { headers: this.headers() })
        this.$set(this.task, 'status', status)
      } catch (error) {
        this.taskStatus = this.task.status || 'NEW'
        this.$toast.error(error?.response?.data?.message || this.$t('Something went wrong'))
      } finally {
        this.savingStatus = false
      }
    },
    async toggleSubtask(subtask, checked) {
      this.savingSubtaskId = String(subtask.id)
      try {
        await this.$axios.put(`/tasks/toggle/${subtask.id}?status=${checked ? 'FINISHED' : 'HOLD'}`, {}, { headers: this.headers() })
        this.$set(subtask, 'status', checked ? 'FINISHED' : 'HOLD')
        this.$set(this.task, 'finished', (this.task.subTasks || []).filter(item => item.status === 'FINISHED').length)
      } catch (error) {
        this.$toast.error(error?.response?.data?.message || this.$t('Something went wrong'))
      } finally {
        this.savingSubtaskId = null
      }
    },
    cancelSubtaskForm() {
      this.showSubtaskForm = false
      this.newSubtaskName = ''
      this.newSubtaskDescription = ''
    },
    async addSubtask() {
      const name = this.newSubtaskName.trim()
      if (!name || !this.task || this.savingSubtask) return
      this.savingSubtask = true
      const nameAr = this.$i18n.locale === 'ar' ? name : ''
      const nameEn = this.$i18n.locale === 'en' ? name : ''
      const description = this.newSubtaskDescription.trim()
      try {
        await this.$axios.post('/tasks/sub', {
          task_id: this.task.id,
          name,
          name_ar: nameAr,
          name_en: nameEn,
          description,
          description_ar: this.$i18n.locale === 'ar' ? description : '',
          description_en: this.$i18n.locale === 'en' ? description : '',
        }, { headers: this.headers() })
        this.cancelSubtaskForm()
        await this.loadTask()
      } catch (error) {
        this.$toast.error(error?.response?.data?.message || this.$t('Something went wrong'))
      } finally {
        this.savingSubtask = false
      }
    },
    async onTaskEdited() {
      this.editDialog = false
      await this.loadTask()
    },
  },
}
</script>

<style lang="scss" scoped>
@import "@/assets/css/variables.scss";

.task-details-page {
  min-height: 100vh;
  padding: 24px 0 48px;
  color: $text-primary;

  &__container { max-width: 1280px; }
  &__loading,
  &__missing { min-height: 50vh; }
}

.task-details-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;

  p { margin: 0 0 4px; color: $text-secondary; font-size: 13px; }
  h1 { margin: 0; font-size: 22px; line-height: 1.4; }

  &__actions { display: flex; gap: 8px; flex-wrap: wrap; }
}

.task-details-card {
  margin-bottom: 16px;
  padding: 24px 20px;
  border: 1px solid $border;
  border-radius: 14px;
  background: $surface;

  &__top,
  &__identity,
  &__meta { display: flex; align-items: center; justify-content: space-between; gap: 20px; }

  &__identity {
    justify-content: flex-start;
    min-width: 0;

    > img { width: 52px; height: 52px; flex: 0 0 52px; border-radius: 50%; object-fit: cover; }
    h2 { margin: 2px 0; font-size: 20px; line-height: 1.4; overflow-wrap: anywhere; }
  }

  &__eyebrow,
  &__team,
  &__meta > div > span { color: $text-secondary; font-size: 13px; }
  &__teams { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
  &__team { display: inline-flex; align-items: center; padding: 3px 8px; border-radius: 999px; background: $primary-soft; color: $primary; font-size: 12px; }

  &__status { width: 180px; flex: 0 0 180px; }
  &__status label { display: block; margin-bottom: 8px; color: $text-secondary; font-size: 13px; }
  &__meta {
    align-items: flex-start;
    margin-top: 22px;
    padding: 18px 16px;
    border-radius: 12px;
    background: $surface-secondary;
  }
  &__meta > div { min-width: 0; }
  &__meta p { margin: 8px 0 0; color: $text-primary; font-size: 14px; }
  &__meta > div:last-child { min-width: 180px; }
}

.task-details-members {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;

  &__person { display: inline-flex; align-items: center; gap: 8px; padding: 5px 10px; border-radius: 999px; background: $surface; }
  img { width: 26px; height: 26px; border-radius: 50%; object-fit: cover; }
  span { font-size: 13px; }
}

.task-details-muted { color: $text-secondary !important; }

.task-details-progress {
  margin-top: 16px;

  &__track {
    position: relative;
    height: 14px;
    overflow: hidden;
    border-radius: 999px;
    background: $primary-soft;
    text-align: center;

    > span { position: relative; z-index: 1; color: $text-primary; font-size: 10px; line-height: 14px; }
  }
  &__value { position: absolute; inset-block: 0; inset-inline-start: 0; border-radius: inherit; background: $primary; transition: width 180ms ease; }
  p { margin: 6px 0 0; color: $text-secondary; font-size: 12px; }
}

.task-details-section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;

  h2 { margin: 0; font-size: 18px; }
  span { color: $text-secondary; font-size: 13px; }
}

.task-subtasks {
  min-height: 280px;

  &__list { list-style: none; margin: 0; padding: 0; }
  &__item {
    padding: 14px 8px;
    border-bottom: 1px solid $border;

    label { display: flex; align-items: flex-start; gap: 10px; cursor: pointer; }
    input { width: 18px; height: 18px; flex: 0 0 18px; margin-top: 2px; accent-color: $primary; }
    strong { display: block; font-size: 14px; font-weight: 500; }
    small { display: block; margin-top: 4px; color: $text-secondary; font-size: 12px; }
    input:checked + span strong { color: $text-secondary; text-decoration: line-through; }
  }

  &__add { margin-top: 16px; }

  &__form {
    display: grid;
    gap: 12px;
    margin-top: 18px;
    padding: 16px;
    border: 1px dashed $border-strong;
    border-radius: 10px;
    background: $surface-secondary;

  }

  &__form-actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
    gap: 8px;
    direction: ltr;
  }
}

.task-comments-card { padding: 20px; }

@media (max-width: 700px) {
  .task-details-page { padding-top: 16px; }
  .task-details-heading { align-items: flex-start; flex-direction: column; }
  .task-details-card { padding: 16px 14px; }
  .task-subtasks__form { padding: 16px; }
  .task-details-card__top,
  .task-details-card__meta { align-items: stretch; flex-direction: column; }
  .task-details-card__status,
  .task-details-card__meta > div:last-child { width: 100%; min-width: 0; flex-basis: auto; }
  .task-details-card__identity > img { width: 44px; height: 44px; flex-basis: 44px; }
}
</style>
