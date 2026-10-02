<template>
  <div class="milestones-panel">
    <div class="d-flex align-items-center mb-3">
      <h4 class="mb-0">{{ $t('Milestones') }}</h4>
      <v-spacer />
      <span class="progress-label">{{ progress.percent }}%</span>
    </div>
    <v-progress-linear :value="progress.percent" height="8" class="mb-3" />
    <div v-for="m in milestones" :key="m.id" class="milestone-row mb-2 d-flex align-items-center">
      <v-select
        dense
        hide-details
        :items="statuses"
        v-model="m.status"
        item-text="text"
        item-value="value"
        class="status-select"
        @change="update(m)"
      />
      <span class="flex-grow-1">{{ milestoneName(m) }}</span>
      <small v-if="m.due_date">{{ formatDayDate(m.due_date) }}</small>
      <v-btn icon x-small :aria-label="$t('Delete')" @click="remove(m.id)"><v-icon small>mdi-delete</v-icon></v-btn>
    </div>
    <v-dialog v-model="deleteDialog" max-width="380">
      <v-card class="pa-5">
        <h3 class="mb-4">{{ $t('Are you sure you want to delete this item?') }}</h3>
        <div class="d-flex justify-end" style="gap: 8px">
          <v-btn text @click="deleteDialog = false">{{ $t('Cancel') }}</v-btn>
          <v-btn color="error" :loading="deleting" @click="confirmRemove">{{ $t('Delete') }}</v-btn>
        </div>
      </v-card>
    </v-dialog>
    <div class="milestone-add d-flex align-items-center mt-2">
      <v-text-field
        v-model="form.name"
        dense
        outlined
        hide-details
        class="milestone-add__name"
        :placeholder="$t('Milestone name')"
      />
      <v-menu
        v-model="dateMenu"
        :close-on-content-click="false"
        transition="scale-transition"
        offset-y
        min-width="290"
      >
        <template v-slot:activator="{ on, attrs }">
          <v-text-field
            v-bind="attrs"
            v-on="on"
            :value="formatDayDate(form.due_date)"
            :placeholder="$t('Deadline')"
            prepend-inner-icon="mdi-calendar-range"
            class="milestone-add__date"
            dense
            outlined
            readonly
            hide-details
          />
        </template>
        <v-date-picker
          v-model="form.due_date"
          :locale="$i18n.locale === 'ar' ? 'ar' : 'en'"
          @input="dateMenu = false"
        />
      </v-menu>
      <button type="button" class="btn btn-create milestone-add__btn" @click="add">
        {{ $t('Add') }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProjectMilestones',
  props: {
    projectId: { type: [Number, String], required: true },
  },
  data() {
    return {
      milestones: [],
      progress: { percent: 0 },
      form: { name: '', due_date: '' },
      dateMenu: false,
      deleteDialog: false,
      deleteTarget: null,
      deleting: false,
    }
  },
  computed: {
    statuses() {
      return [
        { text: this.$t('Open'), value: 'OPEN' },
        { text: this.$t('In Progress'), value: 'IN_PROGRESS' },
        { text: this.$t('Done'), value: 'DONE' },
      ]
    }
  },
  mounted() { this.load() },
  methods: {
    milestoneName(milestone) {
      return this.$i18n.locale === 'en'
        ? (milestone.name_en || milestone.name || '')
        : (milestone.name_ar || milestone.name || '')
    },
    headers() {
      return { Authorization: `Bearer ${localStorage.token}`, Accept: 'application/json' }
    },
    formatDayDate(value) {
      if (!value) return ''
      const parts = String(value).slice(0, 10).split('-')
      if (parts.length < 3) return value
      const date = new Date(Date.UTC(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])))
      if (Number.isNaN(date.getTime())) return value
      const locale = this.$i18n.locale === 'ar' ? 'ar-EG' : 'en-GB'
      return date.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
    },
    async load() {
      try {
        const [list, prog] = await Promise.all([
          this.$axios.get(`/projects/${this.projectId}/milestones`, { headers: this.headers() }),
          this.$axios.get(`/projects/${this.projectId}/milestones/progress`, { headers: this.headers() }),
        ])
        this.milestones = list.data || []
        this.progress = prog.data || { percent: 0 }
      } catch (e) {
        this.milestones = []
        this.progress = { percent: 0 }
      }
    },
    async add() {
      if (!String(this.form.name || '').trim()) {
        this.$toast && this.$toast.error(this.$t('Name is required'))
        return
      }
      try {
        const name = String(this.form.name || '').trim()
        const data = {
          ...this.form,
          name,
          name_ar: this.$i18n.locale === 'ar' ? name : '',
          name_en: this.$i18n.locale === 'en' ? name : '',
        }
        await this.$axios.post(`/projects/${this.projectId}/milestones`, data, { headers: this.headers() })
        this.form = { name: '', due_date: '' }
        await this.load()
      } catch (e) {
        this.$toast && this.$toast.error(e?.response?.data?.message || this.$t('Something went wrong'))
      }
    },
    async update(m) {
      try {
        await this.$axios.put(`/projects/${this.projectId}/milestones/${m.id}`, m, { headers: this.headers() })
        await this.load()
      } catch (e) {
        this.$toast && this.$toast.error(e?.response?.data?.message || this.$t('Something went wrong'))
        await this.load()
      }
    },
    remove(id) {
      this.deleteTarget = id
      this.deleteDialog = true
    },
    async confirmRemove() {
      if (this.deleteTarget == null || this.deleting) return
      this.deleting = true
      try {
        await this.$axios.delete(`/projects/${this.projectId}/milestones/${this.deleteTarget}`, { headers: this.headers() })
        await this.load()
        this.deleteDialog = false
        this.deleteTarget = null
      } catch (e) {
        this.$toast && this.$toast.error(e?.response?.data?.message || this.$t('Something went wrong'))
      } finally {
        this.deleting = false
      }
    },
  },
}
</script>

<style lang="scss" scoped>
@import "@/assets/css/variables.scss";
.milestones-panel {
  h4 {
    font-size: 16px;
    font-weight: 600;
  }
}

.status-select {
  max-width: 140px;
  margin-inline-end: 8px;
}

.milestone-row {
  gap: 8px;
  border-bottom: 1px solid $border;
  padding-bottom: 8px;
  font-size: 14px;
}

.progress-label {
  font-size: 13px;
  font-weight: 600;
  color: $primary;
}

.milestone-add {
  gap: 8px;
  flex-wrap: wrap;

  &__name {
    flex: 1 1 160px;
    min-width: 140px;
  }

  &__date {
    flex: 0 1 220px;
    min-width: 180px;
  }

  &__btn {
    flex: 0 0 auto;
    min-height: 40px !important;
    height: 40px !important;
    padding: 0 16px !important;
    width: auto !important;
    white-space: nowrap;
  }
}

@media (max-width: 600px) {
  .milestone-row {
    flex-wrap: wrap;
  }

  .status-select {
    flex: 1 1 100%;
    width: 100%;
    max-width: none;
    margin-inline-end: 0;
  }

  .milestone-add {
    align-items: stretch;

    &__name,
    &__date {
      flex: 1 1 100%;
      width: 100%;
      min-width: 0;
    }

    &__btn {
      width: 100% !important;
    }
  }
}
</style>
