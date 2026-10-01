<template>
  <div class="mt-5 createProject">
    <v-container v-if="pageLoading">
      <app-skeleton type="page" />
    </v-container>

    <v-container v-else>
      <div class="section d-flex align-center justify-space-between flex-wrap">
        <h2 class="section-title">{{ $t('Edit Project') }}</h2>
        <nuxt-link :to="localePath(`/projects/${$route.params.id}`)" class="btn btn-view">
          {{ $t('Back') }}
        </nuxt-link>
      </div>

      <v-form ref="form" v-model="valid" lazy-validation>
        <v-row>
          <v-col cols="12" md="6">
            <label class="d-block mb-1 font-weight-medium">{{ $t('Project Name (Arabic)') }} *</label>
            <v-text-field
              v-model="projectNameAr"
              :rules="projectNameRule"
              :placeholder="$t('Project Name (Arabic)')"
              hide-details="auto"
              required
            />
          </v-col>
          <v-col cols="12" md="6">
            <label class="d-block mb-1 font-weight-medium">{{ $t('Project Name (English)') }} *</label>
            <v-text-field
              v-model="projectNameEn"
              :rules="projectNameRule"
              :placeholder="$t('Project Name (English)')"
              hide-details="auto"
              required
            />
          </v-col>
          <v-col cols="12" md="6">
            <label class="d-block mb-1 font-weight-medium">{{ $t('Ticket ID') }}</label>
            <v-text-field
              v-model="ticketID"
              :placeholder="$t('Ticket ID')"
              hide-details="auto"
            />
          </v-col>
          <v-col cols="12" md="6">
            <label class="d-block mb-1 font-weight-medium">{{ $t('Project Image') }}</label>
            <div class="project-image-field">
              <div class="project-image-field__avatar">
                <img
                  :src="imagePreview || require('@/assets/imgs/NiImage.jpg')"
                  :alt="$t('Project Image')"
                >
              </div>
              <div class="project-image-field__control">
                <input
                  ref="imageInput"
                  type="file"
                  class="project-image-field__native"
                  accept="image/png,image/jpeg"
                  @change="onNativeFileChange"
                >
                <button
                  type="button"
                  class="project-image-field__browse"
                  @click.prevent="openImagePicker"
                >{{ $t('Choose file') }}</button>
                <span class="project-image-field__name">{{ fileLabel }}</span>
              </div>
            </div>
            <p v-if="imageError" class="project-image-field__error">{{ imageError }}</p>
          </v-col>
          <v-col cols="12" md="6">
            <label class="d-block mb-1 font-weight-medium">{{ $t('Customer Name (Arabic)') }} *</label>
            <v-text-field
              v-model="customerNameAr"
              :rules="customerNameRules"
              :placeholder="$t('Customer Name (Arabic)')"
              hide-details="auto"
              required
            />
          </v-col>
          <v-col cols="12" md="6">
            <label class="d-block mb-1 font-weight-medium">{{ $t('Customer Name (English)') }} *</label>
            <v-text-field
              v-model="customerNameEn"
              :rules="customerNameRules"
              :placeholder="$t('Customer Name (English)')"
              hide-details="auto"
              required
            />
          </v-col>
          <v-col cols="12" md="6">
            <label class="d-block mb-1 font-weight-medium">{{ $t('Start Date') }} *</label>
            <v-menu
              v-model="menu2"
              :close-on-content-click="false"
              :nudge-right="40"
              transition="scale-transition"
              offset-y
              min-width="auto"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  v-model="startDate"
                  :rules="startDateRules"
                  :placeholder="$t('Start Date')"
                  readonly
                  v-bind="attrs"
                  v-on="on"
                />
              </template>
              <v-date-picker
                v-model="startDate"
                prev-icon="mdi-chevron-right"
                next-icon="mdi-chevron-left"
                @input="menu2 = false"
              />
            </v-menu>
          </v-col>
          <v-col cols="12" md="6">
            <label class="d-block mb-1 font-weight-medium">{{ $t('Project Dead Line') }}</label>
            <v-menu
              v-model="deadLineMenu"
              :close-on-content-click="false"
              :nudge-right="40"
              transition="scale-transition"
              offset-y
              min-width="auto"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  v-model="deadLine"
                  :placeholder="$t('Project Dead Line')"
                  readonly
                  v-bind="attrs"
                  v-on="on"
                />
              </template>
              <v-date-picker
                v-model="deadLine"
                prev-icon="mdi-chevron-right"
                next-icon="mdi-chevron-left"
                @input="deadLineMenu = false"
              />
            </v-menu>
          </v-col>
        </v-row>

        <v-divider class="mt-5 mb-5" />

        <div class="mt-10 createProject__sections">
          <v-row>
            <v-col
              v-for="(item, index) in visibleItems"
              :key="sectionKey(item, index)"
              cols="12"
              sm="6"
              md="4"
              lg="3"
            >
              <div class="d-flex align-center justify-space-between mb-2">
                <label class="mb-0 d-block font-weight-medium">{{ item.name }}</label>
                <button
                  type="button"
                  class="btn btn-delete"
                  style="min-width:auto;padding:2px 8px;font-size:12px"
                  @click.prevent="removeSection(item, index)"
                  >{{ $t('Delete') }}</button>
              </div>
              <v-select
                v-model="itemValue[sectionKey(item, index)]"
                :items="sectionMemberItems(item)"
                chips
                multiple
                outlined
                dense
                hide-details
                attach
                item-text="name"
                item-value="id"
              >
                <template v-slot:selection="{ item: member, index: chipIndex }">
                  <v-chip v-if="chipIndex === 0 && member">
                    <span>{{ member && member.name }}</span>
                  </v-chip>
                  <span
                    v-if="chipIndex === 1"
                    class="grey--text text-caption"
                  >
                    {{ $t('+{n} others', { n: (itemValue[sectionKey(item, index)] || []).length - 1 }) }}
                  </span>
                </template>
              </v-select>
            </v-col>
          </v-row>

          <div v-if="hiddenItems.length" class="mt-4" style="max-width:320px">
            <label class="d-block mb-1 font-weight-medium">{{ $t('Add Team') }}</label>
            <v-select
              v-model="sectionToAdd"
              :items="hiddenItems"
              item-text="name"
              item-value="id"
              :placeholder="$t('Add Team')"
              clearable
              outlined
              dense
              hide-details
              @change="addSection"
            />
          </div>
        </div>

        <v-divider class="mt-5 mb-5" />

        <h4 class="mb-2">{{ $t('Description (Arabic)') }}</h4>
        <div ref="editorAr" class="mb-5" style="min-height: 150px;"></div>

        <h4 class="mb-2">{{ $t('Description (English)') }}</h4>
        <div ref="editorEn" class="mb-5" style="min-height: 150px;"></div>

        <v-btn class="btn btn-create mt-5" :loading="saving" @click.stop="updateProject">
          {{ $t('Update Project') }}
        </v-btn>
      </v-form>
    </v-container>
  </div>
</template>

<script>
import { personName } from '~/utils/personName'
import { sanitizeHtml } from '~/utils/sanitizeHtml'

export default {
  data() {
    return {
      pageLoading: true,
      saving: false,
      valid: true,
      quillAr: null,
      quillEn: null,
      items: [],
      itemValue: {},
      forcedSectionKeys: [],
      sectionToAdd: null,
      menu2: false,
      deadLineMenu: false,
      projectNameAr: '',
      projectNameEn: '',
      ticketID: '',
      customerNameAr: '',
      customerNameEn: '',
      startDate: null,
      deadLine: null,
      file: null,
      imageError: '',
      imagePreviewUrl: null,
      currentImage: null,
      descriptionAr: '',
      descriptionEn: '',
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
        rtl: false
      }
    }
  },
  computed: {
    projectNameRule() {
      return [v => !!v || this.$t('Required')]
    },
    customerNameRules() {
      return [v => !!v || this.$t('Required')]
    },
    startDateRules() {
      return [v => !!v || this.$t('Required')]
    },
    imagePreview() {
      if (this.imagePreviewUrl) return this.imagePreviewUrl
      if (this.currentImage) {
        return this.$resolveImage(this.currentImage, require('@/assets/imgs/NiImage.jpg'))
      }
      return null
    },
    fileLabel() {
      const file = Array.isArray(this.file) ? this.file[0] : this.file
      if (file && file.name) return file.name
      return this.$t('No file chosen')
    },
    visibleItems() {
      return (this.items || []).filter((item, index) => {
        const key = this.sectionKey(item, index)
        if (this.forcedSectionKeys.includes(key)) return true
        const list = this.itemValue[key]
        return Array.isArray(list) && list.length > 0
      })
    },
    hiddenItems() {
      return (this.items || []).filter((item, index) => {
        const key = this.sectionKey(item, index)
        if (this.forcedSectionKeys.includes(key)) return false
        const list = this.itemValue[key]
        return !(Array.isArray(list) && list.length > 0)
      })
    },
    selectedMemberIds() {
      const ids = []
      const seen = new Set()
      Object.keys(this.itemValue || {}).forEach((key) => {
        const list = this.itemValue[key]
        if (!Array.isArray(list) || !list.length) return
        list.forEach((id) => {
          if (id == null || id === '' || seen.has(String(id))) return
          seen.add(String(id))
          ids.push(id)
        })
      })
      return ids
    }
  },
  async mounted() {
    try {
      await this.loadTeams()
      await this.loadProject()
    } catch (e) {
      this.notification(this.$t('Something went wrong'), 'error')
    } finally {
      this.pageLoading = false
      this.$nextTick(() => this.initializeDescriptionEditors())
    }
  },
  methods: {
    sectionKey(item, index) {
      if (item && item.id != null) return String(item.id)
      return `section-${index}`
    },
    sectionMemberItems(team) {
      return (team && Array.isArray(team.members) ? team.members : [])
        .filter((member) => member && member.id != null)
        .map((member) => ({
          id: member.id,
          name: personName(member, this.$i18n.locale) || member.name || String(member.id),
          image: member.image,
        }))
    },
    authHeaders() {
      return {
        Authorization: `Bearer ${localStorage.token}`,
        Accept: 'application/json',
        'Accept-Language': this.$i18n.locale
      }
    },
    notification(message, status) {
      status == 'success'
        ? this.$toast.success(message, this.notificationData)
        : this.$toast.error(message, this.notificationData)
    },
    openImagePicker() {
      const input = this.$refs.imageInput
      if (input && typeof input.click === 'function') {
        input.click()
      }
    },
    onNativeFileChange(event) {
      const file = event && event.target && event.target.files
        ? event.target.files[0]
        : null
      this.handleFileChange(file || null)
    },
    handleFileChange(e) {
      if (this.imagePreviewUrl) {
        URL.revokeObjectURL(this.imagePreviewUrl)
        this.imagePreviewUrl = null
      }
      const file = Array.isArray(e) ? e[0] : e
      if (file && !['png', 'jpeg', 'jpg'].includes(file.name.toLowerCase().split('.').pop())) {
        this.file = null
        this.imageError = this.$t('Project image format')
        if (this.$refs.imageInput) this.$refs.imageInput.value = ''
        return
      }
      if (file && file.size > 1024 * 1024) {
        this.file = null
        this.imageError = this.$t('Image size limit')
        if (this.$refs.imageInput) this.$refs.imageInput.value = ''
        return
      }
      this.file = file || null
      this.imageError = ''
      if (file) {
        this.imagePreviewUrl = URL.createObjectURL(file)
      }
    },
    async loadTeams() {
      const res = await this.$axios.get('/team/members', { headers: this.authHeaders() })
      const teams = Array.isArray(res.data.data) ? res.data.data : []
      this.items = teams
      const values = {}
      teams.forEach((team, index) => {
        values[this.sectionKey(team, index)] = []
      })
      this.itemValue = values
    },
    async loadProject() {
      const res = await this.$axios.get(`/projects/${this.$route.params.id}`, {
        headers: this.authHeaders()
      })
      const project = res.data.data || {}
      this.projectNameAr = project.name_ar || project.name || ''
      this.projectNameEn = project.name_en || project.name || ''
      this.ticketID = project.ticket_id || ''
      this.customerNameAr = project.customer_name_ar || project.customer_name || ''
      this.customerNameEn = project.customer_name_en || project.customer_name || ''
      this.startDate = project.start_date || null
      this.deadLine = project.dead_line || null
      this.currentImage = project.image || null
      this.descriptionAr = project.description_ar || project.description || ''
      this.descriptionEn = project.description_en || project.description || ''

      const values = {}
      this.items.forEach((team, index) => {
        values[this.sectionKey(team, index)] = []
      })

      const normalizeIds = (ids) => (Array.isArray(ids) ? ids : [])
        .map((id) => {
          const num = Number(id)
          return Number.isNaN(num) ? id : num
        })
        .filter((id) => id !== null && id !== '')

      const departments = Array.isArray(project.departments) ? project.departments : []
      if (departments.length) {
        departments.forEach((dept) => {
          if (!dept || dept.id == null) return
          values[String(dept.id)] = normalizeIds(dept.member_ids)
        })
      } else {
        const savedSections = project.member_sections && typeof project.member_sections === 'object'
          ? project.member_sections
          : {}
        const savedKeys = Object.keys(savedSections).filter((teamKey) => {
          return Array.isArray(savedSections[teamKey]) && savedSections[teamKey].length > 0
        })

        if (savedKeys.length) {
          savedKeys.forEach((teamKey) => {
            values[String(teamKey)] = normalizeIds(savedSections[teamKey])
          })
        } else {
          const memberIds = new Set(
            (project.members || []).map(m => Number(m.id)).filter(id => !Number.isNaN(id))
          )
          const claimed = new Set()
          this.items.forEach((team, index) => {
            const key = this.sectionKey(team, index)
            values[key] = (team.members || [])
              .filter((m) => {
                const id = Number(m.id)
                if (!memberIds.has(id) || claimed.has(id)) return false
                claimed.add(id)
                return true
              })
              .map(m => m.id)
          })
        }
      }

      this.itemValue = values
      this.forcedSectionKeys = Object.keys(values).filter((key) => {
        return Array.isArray(values[key]) && values[key].length > 0
      })

      // Ensure selected members appear in each team select options
      const projectMembersById = {}
      ;(project.members || []).forEach((member) => {
        if (!member || member.id == null) return
        projectMembersById[String(member.id)] = member
      })
      this.items = (this.items || []).map((team, index) => {
        const key = this.sectionKey(team, index)
        const selected = values[key] || []
        const members = Array.isArray(team.members) ? [...team.members] : []
        const existingIds = new Set(members.map((m) => String(m.id)))
        selected.forEach((id) => {
          const sid = String(id)
          if (existingIds.has(sid)) return
          if (projectMembersById[sid]) {
            members.push(projectMembersById[sid])
            existingIds.add(sid)
          }
        })
        return { ...team, members }
      })
    },
    removeSection(item, index) {
      const key = this.sectionKey(item, index)
      this.$set(this.itemValue, key, [])
      this.$nextTick(() => {
        this.forcedSectionKeys = this.forcedSectionKeys.filter((k) => k !== key)
      })
    },
    addSection(teamId) {
      if (teamId == null || teamId === '') return
      const key = String(teamId)
      if (!Array.isArray(this.itemValue[key])) {
        this.$set(this.itemValue, key, [])
      }
      if (!this.forcedSectionKeys.includes(key)) {
        this.forcedSectionKeys = [...this.forcedSectionKeys, key]
      }
      this.sectionToAdd = null
    },
    appendMemberSections(formData) {
      formData.append('sync_members', '1')
      formData.append('has_member_sections', '1')
      let flatIndex = 0
      Object.keys(this.itemValue || {}).forEach((teamKey) => {
        const list = this.itemValue[teamKey]
        if (!Array.isArray(list) || !list.length) return
        list.forEach((userId, index) => {
          formData.append(`member_sections[${teamKey}][${index}]`, userId)
          formData.append(`members[${flatIndex}]`, userId)
          flatIndex += 1
        })
      })
    },
    updateProject() {
      if (!this.$refs.form || !this.$refs.form.validate()) return

      this.saving = true
      const formData = new FormData()
      const projectImage = Array.isArray(this.file) ? this.file[0] : this.file
      if (projectImage) {
        formData.append('image', projectImage)
      }

      formData.append('start_date', this.startDate || '')
      formData.append('dead_line', this.deadLine || '')
      formData.append('name_ar', this.projectNameAr || '')
      formData.append('name_en', this.projectNameEn || '')
      formData.append('name', this.projectNameAr || this.projectNameEn || '')
      formData.append('customer_name_ar', this.customerNameAr || '')
      formData.append('customer_name_en', this.customerNameEn || '')
      formData.append('customer_name', this.customerNameAr || this.customerNameEn || '')
      formData.append('ticket_id', this.ticketID || '')

      const descAr = this.quillAr ? this.quillAr.root.innerHTML : (this.descriptionAr || '')
      const descEn = this.quillEn ? this.quillEn.root.innerHTML : (this.descriptionEn || '')
      formData.append('description_ar', descAr)
      formData.append('description_en', descEn)
      formData.append('description', descAr || descEn)

      this.appendMemberSections(formData)

      this.$axios
        .post(`/projects/${this.$route.params.id}`, formData, { headers: this.authHeaders() })
        .then((res) => {
          this.notification(res.data.message, 'success')
          this.$router.push(this.localePath(`/projects/${this.$route.params.id}`))
        })
        .catch((error) => {
          const data = error.response && error.response.data
          const msg =
            (data && data.message) ||
            (data && data.errors && Object.values(data.errors).flat()[0]) ||
            this.$t('Something went wrong')
          this.notification(msg, 'error')
        })
        .finally(() => {
          this.saving = false
        })
    },
    initializeDescriptionEditors() {
      if (typeof Quill === 'undefined') return
      const editorAr = this.$refs.editorAr
      const editorEn = this.$refs.editorEn
      if (!editorAr || !editorEn) return
      if (this.quillAr || this.quillEn) return
      try {
        const toolbarOptions = [
          [{ color: [] }, { background: [] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          [{ indent: '-1' }, { indent: '+1' }],
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          ['blockquote', 'code-block'],
          [{ align: [] }],
          ['link'],
          ['clean']
        ]
        this.quillAr = new Quill(editorAr, {
          modules: { toolbar: toolbarOptions },
          theme: 'snow'
        })
        this.quillEn = new Quill(editorEn, {
          modules: { toolbar: toolbarOptions },
          theme: 'snow'
        })
        this.quillAr.root.innerHTML = sanitizeHtml(this.descriptionAr || '')
        this.quillEn.root.innerHTML = sanitizeHtml(this.descriptionEn || '')
      } catch (e) {
        this.quillAr = null
        this.quillEn = null
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/css/variables.scss";
.createProject {
  .section {
    .section-title {
      color: $text-primary;
    }
  }

  &__sections .v-col {
    max-width: 280px;
  }
}

.project-image-field {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  max-width: 100%;

  &__avatar {
    flex: 0 0 48px;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    overflow: hidden;
    border: 1px solid rgba(0, 0, 0, 0.08);
    background: #f3f4f6;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
  }

  &__control {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-height: 40px;
    padding: 4px 8px 4px 4px;
    border: 1px solid rgba(0, 0, 0, 0.16);
    border-radius: 8px;
    background: #fff;
    max-width: min(100%, 340px);
  }

  &__native {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
    pointer-events: none;
  }

  &__browse {
    flex: 0 0 auto;
    border: 1px solid rgba(0, 0, 0, 0.14);
    background: #f5f5f5;
    color: #222;
    border-radius: 6px;
    padding: 6px 12px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    white-space: nowrap;
  }

  &__name {
    flex: 1 1 auto;
    min-width: 0;
    font-size: 13px;
    color: #555;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>
