<template>
  <div class="projects mt-5">
    <div class="projects__content">
      <div class="rms-filter-bar projects-toolbar">
        <h2 class="section-title">{{ $t('Current Projects') }}</h2>
        <div class="projects-toolbar__actions">
          <labeled-field :label="$t('Project Name')" class="projects-toolbar__field">
            <v-text-field
              v-model="searchName"
              :placeholder="$t('Search by project name')"
              prepend-inner-icon="mdi-folder-outline"
              outlined
              dense
              hide-details
              clearable
              @input="onSearchInput"
            />
          </labeled-field>
          <button
            type="button"
            class="projects-toolbar__filter-toggle"
            :aria-expanded="filtersOpen ? 'true' : 'false'"
            @click="filtersOpen = !filtersOpen"
          >
            <span class="mdi mdi-tune-variant" />
            {{ $t('Filters') }}
            <span v-if="activeFilterCount" class="projects-toolbar__filter-count">{{ activeFilterCount }}</span>
          </button>
          <nuxt-link
            :to="localePath('/projects/create')"
            class="btn btn-create projects-toolbar__create"
          >{{ $t('Create') }}</nuxt-link>
        </div>
        <div v-if="filtersOpen" class="projects-toolbar__advanced">
          <labeled-field :label="$t('Ticket ID')" class="projects-toolbar__field">
            <v-text-field
              v-model="searchTicket"
              :placeholder="$t('Search by ticket ID')"
              prepend-inner-icon="mdi-ticket-outline"
              outlined dense hide-details clearable
              @input="onSearchInput"
            />
          </labeled-field>
          <labeled-field :label="$t('Period')" class="projects-toolbar__field">
            <v-select
              :items="periodOptions"
              item-text="name"
              item-value="id"
              v-model="month"
              :placeholder="$t('Period')"
              prepend-inner-icon="mdi-calendar-month-outline"
              outlined dense hide-details
              @change="filterProjects()"
            />
          </labeled-field>
          <labeled-field :label="$t('Team')" class="projects-toolbar__field">
            <v-select
              :items="localizedTeams"
              :placeholder="$t('Select team')"
              item-text="name"
              item-value="id"
              v-model="field"
              prepend-inner-icon="mdi-account-group-outline"
              outlined dense hide-details clearable
              @change="filterProjects()"
            />
          </labeled-field>
          <button
            v-if="activeFilterCount"
            type="button"
            class="projects-toolbar__reset"
            @click="resetFilters"
          >{{ $t('Reset Filters') }}</button>
        </div>
      </div>
      <v-row class="kanban-board">
        <v-col cols="12" sm="6" lg="3" v-for="(col, colIdx) in kanbanColumns" :key="colIdx" class="kanban-column">
          <div class="kanban-column-header d-flex justify-content-space-between align-items-center mb-3">
            <h3 class="kanban-col-title">{{ $t(col.title) }}</h3>
            <v-chip small color="primary" outlined>{{ col.list.length }}</v-chip>
          </div>
          <draggable class="list-group kanban-list" :list="col.list" group="projects" @change="log($event, colIdx)">
            <div class="list-group-item" v-for="element in col.list" :key="element.id">
              <article class="project-kanban-card">
                <header class="project-kanban-card__head">
                  <img
                    class="project-kanban-card__avatar"
                    :src="$resolveImage(element.image)"
                    :alt="localizedProjectName(element)"
                  >
                  <div class="project-kanban-card__title-wrap">
                    <h3 class="project-kanban-card__title">{{ localizedProjectName(element) }}</h3>
                    <p class="project-kanban-card__ticket">{{ $t('Ticket ID') }}: {{ element.ticket_id }}</p>
                  </div>
                </header>

                <div class="project-kanban-card__body">
                  <div class="project-kanban-card__members">
                    <span class="project-kanban-card__label">{{ $t('Members') }}</span>
                    <div class="project-kanban-card__avatars">
                      <img
                        v-for="member in (element.members || []).slice(0, 5)"
                        :key="member.id"
                        :src="$resolveImage(member.image, require('~/assets/imgs/avatar.png'))"
                        :alt="localizedMemberName(member)"
                      >
                      <span
                        v-if="(element.members || []).length > 5"
                        class="project-kanban-card__more"
                      >+{{ element.members.length - 5 }}</span>
                    </div>
                  </div>

                  <div class="project-kanban-card__dates">
                    <span class="mdi mdi-calendar-range" />
                    <span>{{ formatProjectDate(element.start_date) }} — {{ formatProjectDate(element.dead_line) }}</span>
                  </div>

                  <div class="project-kanban-card__progress-wrap">
                    <span
                      v-if="daysRemaining(element) !== null"
                      class="project-kanban-card__days"
                      :class="{
                        'project-kanban-card__days--overdue': daysRemaining(element) < 0,
                        'project-kanban-card__days--today': daysRemaining(element) === 0,
                      }"
                    >
                      <span class="mdi mdi-alert-circle-outline" />
                      {{ daysLeftLabel(element) }}
                    </span>
                    <v-progress-linear
                      class="project-kanban-card__progress"
                      height="10"
                      rounded
                      :value="projectProgress(element)"
                      color="primary"
                    >
                      <template v-slot:default="{ value }">
                        <strong>{{ Math.ceil(value) }}%</strong>
                      </template>
                    </v-progress-linear>
                  </div>
                </div>

                <footer class="project-kanban-card__foot">
                  <div class="project-kanban-card__meta">
                    <span><span class="mdi mdi-note-outline" />{{ element.attachmentsCount || 0 }}</span>
                    <span><span class="mdi mdi-link-variant" />{{ element.linksCount || 0 }}</span>
                    <span><span class="mdi mdi-message-outline" />{{ element.eventsCount || 0 }}</span>
                  </div>
                  <div class="project-kanban-card__actions">
                    <button
                      type="button"
                      class="btn btn-create project-kanban-card__btn"
                      @click.prevent="$router.push(localePath(`/projects/${element.id}`))"
                    >{{ $t('View') }}</button>
                    <button
                      type="button"
                      class="btn btn-edit project-kanban-card__btn"
                      @click.prevent="$router.push(localePath(`/projects/edit/${element.id}`))"
                    >{{ $t('Edit') }}</button>
                    <button
                      type="button"
                      class="btn btn-delete project-kanban-card__btn"
                      :aria-label="$t('Delete')"
                      :title="$t('Delete')"
                      @click.prevent="openDeleteDialog(element.id)"
                    >{{ $t('Delete') }}</button>
                  </div>
                </footer>
              </article>
            </div>
          </draggable>
        </v-col>
      </v-row>
      <app-empty-state
        v-if="!projectsLoading && projects.length === 0"
        icon="mdi-folder-outline"
        :title="$t('No assigned projects')"
      />
      <v-dialog v-model="deleteDialog" max-width="420" content-class="confirm-delete-dialog">
        <v-card class="confirm-delete-dialog__card">
          <div class="confirm-delete-dialog__icon">
            <v-icon size="28" color="#B42318">mdi-alert-circle-outline</v-icon>
          </div>
          <h3 class="confirm-delete-dialog__title">
            {{ $t('Are you sure you want to delete this project?') }}
          </h3>
          <p class="confirm-delete-dialog__message">{{ $t('Deleting a project will remove its member assignments. This cannot be undone.') }}</p>
          <div class="confirm-delete-dialog__actions">
            <button
              type="button"
              class="btn btn-view"
              @click.prevent="deleteDialog = false"
            >{{ $t('Cancel') }}</button>
            <button
              type="button"
              class="btn btn-danger"
              @click.prevent="confirmDeleteProject()"
            >{{ $t('Delete') }}</button>
          </div>
        </v-card>
      </v-dialog>
    </div>
  </div>
</template>
<script>
import draggable from "vuedraggable";
import { personName } from '~/utils/personName'
import { summarizeProjectProgress } from '~/utils/projectProgress'

export default {
  display: "Three Lists",
  order: 1,
  components: {
    draggable
  },
  data() {
    return {
      month: null,
      filtersOpen: false,
      searchName: '',
      searchTicket: '',
      searchTimer: null,
      fields: [],
      field: null,
      projects: [],
      list1: [],
      list2: [],
      list3: [],
      list4: [],
      projectsLoading: true,
      deleteDialog: false,
      deleteProjectId: null,
      notificationData: {
        position: "top-right",
        timeout: 2000,
        closeOnClick: true,
        pauseOnFocusLoss: true,
        pauseOnHover: true,
        draggable: true,
        draggablePercent: 0.6,
        showCloseButtonOnHover: true,
        hideProgressBar: true,
        closeButton: "button",
        rtl: false
      },
    }
  },
  computed: {
    periodOptions() {
      return [
        { id: null, name: this.$t('All') },
        { id: 0, name: this.$t('This month') },
        { id: 1, name: this.$t('Last 3 month') },
        { id: 2, name: this.$t('Last 6 month') },
      ]
    },
    activeFilterCount() {
      return [this.searchName, this.searchTicket, this.month, this.field].filter(value => value !== null && value !== undefined && value !== '').length
    },
    localizedTeams() {
      return (this.fields || []).map((team) => Object.assign({}, team, {
        name: this.$i18n.locale === 'en' ? (team.name_en || team.name) : (team.name_ar || team.name),
      }))
    },
    kanbanColumns() {
      return [
        { title: 'New', list: this.list1 },
        { title: 'In Progress', list: this.list2 },
        { title: 'Completed', list: this.list3 },
        { title: 'Postponed', list: this.list4 }
      ]
    }
  },
  async beforeMount() {
    this.filterProjects()
    this.$axios.get('/teams', {
      headers: {
        'Authorization': `Bearer ${localStorage.token}`,
        'Accept': 'application/json',
        'Accept-Language': this.$i18n.locale
      }
    })
      .then((res) => {
        this.fields = Array.isArray(res.data.data) ? res.data.data : []
      })
      .catch(() => {
        this.fields = []
      })
  },
  methods: {
    localizedProjectName(project) {
      if (!project) return ''
      return this.$i18n.locale === 'en'
        ? (project.name_en || project.name || '')
        : (project.name_ar || project.name || '')
    },
    localizedMemberName(member) {
      return personName(member, this.$i18n.locale)
    },
    projectProgress(project) {
      return summarizeProjectProgress(project).percent
    },
    formatProjectDate(value) {
      if (!value) return ''
      const parts = String(value).slice(0, 10).split('-')
      if (parts.length !== 3 || parts.some(part => !/^\d+$/.test(part))) return value
      const date = new Date(Date.UTC(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])))
      if (Number.isNaN(date.getTime())) return value
      return date.toLocaleDateString(this.$i18n.locale === 'ar' ? 'ar-EG' : 'en-GB', {
        day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
      })
    },
    daysRemaining(project) {
      if (!project || !project.dead_line || project.status === 'FINISHED') return null
      const parts = String(project.dead_line).slice(0, 10).split('-').map(Number)
      if (parts.length !== 3 || parts.some(Number.isNaN)) return null
      const dueDate = Date.UTC(parts[0], parts[1] - 1, parts[2])
      const todayParts = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Africa/Cairo', year: 'numeric', month: '2-digit', day: '2-digit',
      }).formatToParts(new Date())
      const today = Object.fromEntries(todayParts.map(part => [part.type, part.value]))
      const todayUtc = Date.UTC(Number(today.year), Number(today.month) - 1, Number(today.day))
      return Math.round((dueDate - todayUtc) / 86400000)
    },
    daysLeftLabel(project) {
      const days = this.daysRemaining(project)
      if (days === null) return ''
      if (this.$i18n.locale !== 'en') {
        if (days < 0) return `متأخر ${Math.abs(days)} يوم`
        if (days === 0) return 'موعد التسليم اليوم'
        return `${days} يوم متبقي`
      }
      if (days < 0) return `Overdue by ${Math.abs(days)} ${Math.abs(days) === 1 ? 'day' : 'days'}`
      if (days === 0) return 'Due today'
      return `${days} ${days === 1 ? 'day' : 'days'} left`
    },
    notification(message, status) {
      status == 'success' ? this.$toast.success(message, this.notificationData) : this.$toast.error(message, this.notificationData);
    },
    log(evt, id) {
      if (evt.added) {
        var status_id = id
        var status = 'NEW';
        if (status_id === 1) status = 'IN_PROGRESS';
        else if (status_id === 2) status = 'FINISHED';
        else if (status_id === 3) status = 'POSTPONED';

        this.$axios.put(`/projects/${evt.added.element.id}?status=${status}`, {}, {
          headers: {
            'Authorization': `Bearer ${localStorage.token}`,
            'Accept': 'application/json',
            'Accept-Language': this.$i18n.locale
          }
        })
          .then(res => {
            this.notification(res.data.message, 'success')
            var idProjects = [];
            for (let i = 0; i < this.list1.length; i++) idProjects.push(this.list1[i].id);
            for (let i = 0; i < this.list2.length; i++) idProjects.push(this.list2[i].id);
            for (let i = 0; i < this.list3.length; i++) idProjects.push(this.list3[i].id);
            for (let i = 0; i < this.list4.length; i++) idProjects.push(this.list4[i].id);
            this.$axios.post('/sort/projects', { id: idProjects }, {
              headers: {
                'Authorization': `Bearer ${localStorage.token}`,
                'Accept': 'application/json',
                'Accept-Language': this.$i18n.locale
              }
            })
          })
      }
      if (evt.moved) {
        var idProjects = [];
        for (let i = 0; i < this.list1.length; i++) idProjects.push(this.list1[i].id);
        for (let i = 0; i < this.list2.length; i++) idProjects.push(this.list2[i].id);
        for (let i = 0; i < this.list3.length; i++) idProjects.push(this.list3[i].id);
        for (let i = 0; i < this.list4.length; i++) idProjects.push(this.list4[i].id);
        this.$axios.post('/sort/projects', { id: idProjects }, {
          headers: {
            'Authorization': `Bearer ${localStorage.token}`,
            'Accept': 'application/json',
            'Accept-Language': this.$i18n.locale
          }
        })
          .then(res => {
            this.notification(res.data.message, 'success')
          })
      }
    },
    filterProjects() {
      const params = {}
      if (this.field !== null && this.field !== undefined && this.field !== '') {
        params.team_id = this.field
      }
      if (this.month !== null && this.month !== undefined && this.month !== '') {
        params.date = this.month
      }
      const name = String(this.searchName || '').trim()
      const ticket = String(this.searchTicket || '').trim()
      if (name) params.name = name
      if (ticket) params.ticket_id = ticket

      this.projectsLoading = true
      this.$axios.get('/projects', {
        params,
        headers: {
          'Authorization': `Bearer ${localStorage.token}`,
          'Accept': 'application/json',
          'Accept-Language': this.$i18n.locale
        }
      })
        .then(res => {
          this.applyProjectLists(Array.isArray(res.data.data) ? res.data.data : [])
        })
        .catch(() => {
          this.applyProjectLists([])
        })
        .finally(() => {
          this.projectsLoading = false
        })
    },
    onSearchInput() {
      if (this.searchTimer) clearTimeout(this.searchTimer)
      this.searchTimer = setTimeout(() => {
        this.filterProjects()
      }, 350)
    },
    resetFilters() {
      this.searchName = ''
      this.searchTicket = ''
      this.month = null
      this.field = null
      this.filterProjects()
    },
    applyProjectLists(projects) {
      this.projects = projects
      this.list1 = projects.filter((item) => item.status == 'NEW')
      this.list2 = projects.filter((item) => item.status == 'IN_PROGRESS')
      this.list3 = projects.filter((item) => item.status == 'FINISHED')
      this.list4 = projects.filter((item) => item.status == 'POSTPONED' || item.status == 'HOLD')
    },
    openDeleteDialog(projectId) {
      this.deleteProjectId = projectId
      this.deleteDialog = true
    },
    confirmDeleteProject() {
      this.$axios.delete(`/projects/${this.deleteProjectId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.token}`,
          'Accept': 'application/json',
          'Accept-Language': this.$i18n.locale
        }
      })
        .then(res => {
          this.notification(res.data.message, 'success')
          this.deleteDialog = false
          this.projects = this.projects.filter(p => String(p.id) !== String(this.deleteProjectId))
          this.list1 = this.list1.filter(p => String(p.id) !== String(this.deleteProjectId))
          this.list2 = this.list2.filter(p => String(p.id) !== String(this.deleteProjectId))
          this.list3 = this.list3.filter(p => String(p.id) !== String(this.deleteProjectId))
          this.list4 = this.list4.filter(p => String(p.id) !== String(this.deleteProjectId))
          this.deleteProjectId = null
        })
        .catch(error => {
          this.notification(error?.response?.data?.message || this.$t('Something went wrong'), 'error')
        })
    }
  },
}

</script>

<style lang="scss" scoped>
@import "@/assets/css/variables.scss";
.projects-toolbar {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 14px;
  padding: 18px 20px;
  margin-bottom: 20px;
  background: $surface;
  border: 1px solid $border;
  border-radius: $radius-card;
  box-shadow: $shadow-sm;

  .section-title {
    margin: 0;
    font-size: 21px;
    line-height: 1.4;
    min-width: 0;
    text-align: right;
  }

  &__actions {
    display: grid !important;
    grid-template-columns: minmax(0, 1fr) auto auto;
    align-items: flex-end;
    gap: 10px;
    width: 100% !important;
    min-width: 0;
  }

  &__field {
    width: 100% !important;
    min-width: 0;
    flex: none;

    .v-text-field {
      width: 100%;
      max-width: none;
    }

    ::v-deep .v-input {
      width: 100%;
      margin: 0;
      padding-top: 0;
    }

    ::v-deep .rms-labeled-field__label {
      text-align: start;
    }
  }

  &__create {
    flex: 0 0 auto;
    min-width: 112px;
    white-space: nowrap;
  }

  &__advanced {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr)) auto;
    align-items: flex-end;
    gap: 12px;
    width: 100%;
    padding-top: 14px;
    border-top: 1px solid $border;
  }

  &__filter-toggle,
  &__reset {
    min-height: 40px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    padding: 0 13px;
    border: 1px solid $border;
    border-radius: $radius-btn;
    background: $surface;
    color: $text-secondary;
    font: inherit;
    font-size: 13px;
    cursor: pointer;
    white-space: nowrap;
  }

  &__filter-count {
    min-width: 20px;
    height: 20px;
    display: inline-grid;
    place-items: center;
    padding: 0 5px;
    border-radius: 10px;
    background: $primary-soft;
    color: $primary;
    font-size: 11px;
    font-weight: 600;
  }

  &__reset {
    border-color: transparent;
    color: $primary;
  }
}

.kanban-col-title {
  font-size: 15px;
  font-weight: 600;
  color: $text-primary;
  margin: 0;
}

.kanban-meta {
  gap: 12px;
  color: $text-secondary;
}

.kanban-column {
  min-width: 0;
}

.kanban-list {
  min-width: 0;
  width: 100%;
}

.list-group-item {
  display: flex;
  height: 316px;
  background: transparent;
  border: 0;
  padding: 0;
  margin-bottom: 12px;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
}

.project-kanban-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border: 1px solid $border;
  border-radius: 12px;
  background: $surface;
  box-shadow: none;
  overflow: hidden;
  min-width: 0;
  width: 100%;
  height: 100%;
  box-sizing: border-box;

  &__head {
    display: flex;
    align-items: flex-start;
    gap: 10px;
  }

  &__avatar {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    object-fit: cover;
    flex: 0 0 auto;
    border: 1px solid $border;
  }

  &__title-wrap {
    flex: 1 1 auto;
    min-width: 0;
  }

  &__title {
    margin: 0 0 4px;
    font-size: 14px;
    font-weight: 600;
    line-height: 1.35;
    color: $text-primary;
    word-break: break-word;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
  }

  &__ticket {
    margin: 0;
    font-size: 12px;
    color: $text-secondary;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__days {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    align-self: flex-start;
    max-width: 100%;
    padding: 4px 8px;
    border-radius: 8px;
    background: rgba($primary, 0.08);
    color: $primary;
    font-size: 11px;
    font-weight: 500;
    line-height: 1.3;

    .mdi {
      font-size: 14px;
    }
  }

  &__progress-wrap {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__body {
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    min-height: 0;
    gap: 8px;
  }

  &__members {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: nowrap;
    min-height: 24px;
    max-height: 24px;
    overflow: hidden;
  }

  &__label {
    font-size: 12px;
    font-weight: 500;
    color: $text-secondary;
  }

  &__avatars {
    display: inline-flex;
    align-items: center;

    img {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid $surface;
      margin-inline-end: -6px;
    }
  }

  &__more {
    margin-inline-start: 10px;
    font-size: 11px;
    color: $text-secondary;
  }

  &__dates {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: $text-secondary;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;

    > span:last-child {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .mdi {
      font-size: 16px;
    }
  }

  &__progress {
    ::v-deep strong {
      font-size: 10px;
      color: $text-primary;
    }
  }

  &__foot {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
    padding-top: 8px;
    border-top: 1px solid $border;
    min-width: 0;
    flex: 0 0 auto;
    margin-top: auto;
  }

  &__meta {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    color: $text-secondary;
    font-size: 12px;
    flex-wrap: wrap;

    span {
      display: inline-flex;
      align-items: center;
      gap: 3px;
    }

    .mdi {
      font-size: 15px;
    }
  }

  &__actions {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) 36px;
    align-items: center;
    gap: 7px;
    width: 100%;
    min-width: 0;
  }

  &__btn {
    flex: 1 1 auto;
    min-width: 0 !important;
    max-width: 100%;
    min-height: 32px !important;
    height: auto !important;
    padding: 4px 8px !important;
    font-size: 12px !important;
    width: auto !important;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__btn.btn-delete {
    min-width: 36px !important;
    width: 36px !important;
    padding: 0 !important;
    font-size: 0 !important;

    &::before {
      content: '\F01B4';
      font-family: 'Material Design Icons';
      font-size: 17px;
    }
  }

  &__days--overdue {
    background: rgba($danger, 0.12);
    color: $danger;
  }

  &__days--today {
    background: rgba($warning, 0.14);
    color: $warning;
  }
}

@media (max-width: 768px) {
  .projects-toolbar {
    align-items: stretch;
    padding: 16px;

    &__actions {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto auto;
      gap: 8px;
    }

    &__field {
      grid-column: 1 / -1;
      flex-basis: auto;
    }

    &__create {
      width: auto;
      min-width: 82px;
    }

    &__advanced {
      grid-template-columns: minmax(0, 1fr);
    }
  }
}

@media (max-width: 600px) {
  .project-kanban-card {
    padding: 14px;
    gap: 10px;
  }
}
</style>
