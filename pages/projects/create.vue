<template>
  <div class="mt-5 createProject">
    <v-container>
      <div class="section">
        <h2 class="section-title">{{ $t('Create Project') }}</h2>
      </div>
      <v-form ref="form" v-model="valid" lazy-validation>
        <v-row>
          <v-col cols="12" md="6">
            <label class="d-block mb-1 font-weight-medium">{{ $t('Project Name (Arabic)') }} *</label>
            <v-text-field v-model="projectNameAr" :rules="projectNameRule" :placeholder="$t('Project Name (Arabic)')"
              hide-details="auto" required></v-text-field>
          </v-col>
          <v-col cols="12" md="6">
            <label class="d-block mb-1 font-weight-medium">{{ $t('Project Name (English)') }} *</label>
            <v-text-field v-model="projectNameEn" :rules="projectNameRule" :placeholder="$t('Project Name (English)')"
              hide-details="auto" required></v-text-field>
          </v-col>
          <v-col cols="12" md="6">
            <label class="d-block mb-1 font-weight-medium">{{ $t('Ticket ID') }}</label>
            <v-text-field v-model="ticketID" :rules="ticketIDRule" :placeholder="$t('Ticket ID')" hide-details="auto"></v-text-field>
          </v-col>
          <v-col cols="12" md="6">
            <label class="d-block mb-1 font-weight-medium">{{ $t('Project Image') }} *</label>
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
                  @click.prevent="$refs.imageInput.click()"
                >{{ $t('Choose file') }}</button>
                <span class="project-image-field__name">{{ fileLabel }}</span>
              </div>
            </div>
            <p v-if="imageError" class="project-image-field__error">{{ imageError }}</p>
          </v-col>
          <v-col cols="12" md="6">
            <label class="d-block mb-1 font-weight-medium">{{ $t('Customer Name (Arabic)') }} *</label>
            <v-text-field v-model="customerNameAr" :rules="customerNameRules" :placeholder="$t('Customer Name (Arabic)')"
              hide-details="auto" required></v-text-field>
          </v-col>
          <v-col cols="12" md="6">
            <label class="d-block mb-1 font-weight-medium">{{ $t('Customer Name (English)') }} *</label>
            <v-text-field v-model="customerNameEn" :rules="customerNameRules" :placeholder="$t('Customer Name (English)')"
              hide-details="auto" required></v-text-field>
          </v-col>
          <v-col cols="12" md="6">
            <label class="d-block mb-1 font-weight-medium">{{ $t('Start Date') }} *</label>
            <v-menu v-model="menu2" :close-on-content-click="false" :nudge-right="40" transition="scale-transition"
              offset-y min-width="auto">
              <template v-slot:activator="{ on, attrs }">
                <v-text-field v-model="startDate" :rules="startDateRules" :placeholder="$t('Start Date')" readonly
                  v-bind="attrs" v-on="on"></v-text-field>
              </template>
              <v-date-picker
                v-model="startDate"
                :rules="startDateRules"
                prev-icon="mdi-chevron-right"
                next-icon="mdi-chevron-left"
                @input="menu2 = false"
              />
            </v-menu>
          </v-col>
          <v-col cols="12" md="6">
            <label class="d-block mb-1 font-weight-medium">{{ $t('Project Dead Line') }}</label>
            <v-menu v-model="deadLineMenu" :close-on-content-click="false" :nudge-right="40" transition="scale-transition"
              offset-y min-width="auto">
              <template v-slot:activator="{ on, attrs }">
                <v-text-field v-model="deadLine" :placeholder="$t('Project Dead Line')" readonly
                  v-bind="attrs" v-on="on"></v-text-field>
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
        <v-divider class="mt-5 mb-5"></v-divider>
        <div class="mt-10 createProject__sections">
          <v-row>
            <v-col
              v-for="(item, index) in (items || [])"
              :key="sectionKey(item, index)"
              cols="12"
              sm="6"
              md="4"
              lg="3"
            >
              <label class="mb-3 d-block font-weight-medium">{{ item.name }}</label>
              <v-select
                v-model="itemValue[sectionKey(item, index)]"
                :items="item.members || []"
                chips
                multiple
                solo
                item-text="name"
                item-value="id"
              >
                <template v-slot:selection="{ item: member, index: chipIndex }">
                  <v-chip v-if="chipIndex === 0">
                    <span>{{ member.name }}</span>
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
        </div>
        <v-divider class="mt-5 mb-5"></v-divider>
        
        <h4 class="mb-2">{{ $t('Description (Arabic)') }}</h4>
        <div id="editorAr" class="mb-5" style="min-height: 150px;"></div>
        
        <h4 class="mb-2">{{ $t('Description (English)') }}</h4>
        <div id="editorEn" class="mb-5" style="min-height: 150px;"></div>

        <div class="createProject__actions mt-5">
          <v-btn class="btn btn-create" @click.stop="showDialog()">{{ $t('Add Project') }}</v-btn>
          <v-btn class="btn btn-view" @click.prevent="$router.push(localePath('/projects'))">{{ $t('Cancel') }}</v-btn>
        </div>
      </v-form>
      <v-dialog v-model="dialog" max-width="450">
        <v-card>
          <v-container class="pa-6">
            <h3 class="mt-2 text-center">{{ $t('Add Link') }}</h3>
            <v-divider class="mt-3 mb-3"></v-divider>
            <v-form ref="formDialog" v-model="validDialog" lazy-validation>

              <label class="d-block mb-1 font-weight-medium">{{ $t('Paste Ticket link') }}</label>
              <v-text-field class="mb-4" v-model="ticketLink" :rules="ticketLinkRule"
                :placeholder="$t('Paste Ticket link')" hide-details="auto" required></v-text-field>
              
              <label class="d-block mt-3 mb-1 font-weight-medium">{{ $t('Display text') }}</label>
              <v-text-field v-model="displayText" :rules="displayTextRule" :placeholder="$t('Display text')"
                hide-details="auto" required></v-text-field>
                
              <div class="createProject__dialog-actions mt-6">
                <v-btn color="primary" @click.prevent="addProject(true)">{{ $t('Add Link & Create') }}</v-btn>
                <v-btn color="warning" @click.prevent="addProject(false)">{{ $t('Skip and Create') }}</v-btn>
                <v-btn text @click.prevent="dialog = false">{{ $t('Cancel') }}</v-btn>
              </div>
            </v-form>
          </v-container>
        </v-card>
      </v-dialog>
    </v-container>
  </div>
</template>
<script>
export default {
  data() {
    return {
      valid: true,
      validDialog: true,
      ticketLink: '',
      displayText: '',
      quillAr: null,
      quillEn: null,
      dialog: false,
      items: [],
      itemValue: {},
      date: null,
      deadLine: null,
      menu2: false,
      deadLineMenu: false,
      projectNameAr: '',
      projectNameEn: '',
      ticketID: '',
      customerNameAr: '',
      customerNameEn: '',
      startDate: null,
      file: null,
      imagePreviewUrl: null,
      imageError: '',
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
      }
    }
  },
  computed: {
    projectNameRule() {
      return [v => !!v || this.$t('Required')]
    },
    ticketIDRule() {
      return []
    },
    customerNameRules() {
      return [v => !!v || this.$t('Required')]
    },
    imageRule() {
      return [v => (this.file !== null) || this.$t('Required')]
    },
    imagePreview() {
      return this.imagePreviewUrl || null
    },
    fileLabel() {
      const file = Array.isArray(this.file) ? this.file[0] : this.file
      if (file && file.name) return file.name
      return this.$t('No file chosen')
    },
    startDateRules() {
      return [v => !!v || this.$t('Required')]
    },
    itemValueRule() {
      return [v => (Array.isArray(v) && v.length > 0) || this.$t('Required')]
    },
    selectedMemberIds() {
      const ids = []
      const seen = new Set()
      Object.keys(this.itemValue || {}).forEach((key) => {
        const list = this.itemValue[key]
        if (!Array.isArray(list)) return
        list.forEach((id) => {
          if (id == null || seen.has(id)) return
          seen.add(id)
          ids.push(id)
        })
      })
      return ids
    },
    ticketLinkRule() {
      return [
        v => !!v || this.$t('Required'),
        v => this.isValidTicketLink(v) || this.$t('Invalid Ticket link'),
      ]
    },
    displayTextRule() {
      return [v => !!v || this.$t('Required')]
    }
  },
  mounted() {
    this.initializeDescriptionEditors()
  },
  beforeMount() {
    this.$axios.get('/team/members', {
      headers: {
        'Authorization': `Bearer ${localStorage.token}`,
        'Accept': 'application/json',
        'Accept-Language': this.$i18n.locale
      }
    })
      .then(res => {
        const teams = Array.isArray(res.data.data) ? res.data.data : []
        this.items = teams
        const values = {}
        teams.forEach((team, index) => {
          values[this.sectionKey(team, index)] = []
        })
        this.itemValue = values
      })
  },
  methods: {
    sectionKey(item, index) {
      if (item && item.id != null) return String(item.id)
      return `section-${index}`
    },
    showDialog() {
      this.imageError = ''
      if (!this.file) {
        this.imageError = this.$t('Required')
      }
      const isValid = this.$refs.form.validate()
      if (isValid && this.file) {
        this.dialog = true
      }
    },
    isValidTicketLink(link) {
      try {
        const url = new URL(String(link || '').trim())
        return ['http:', 'https:'].includes(url.protocol)
      } catch (error) {
        return false
      }
    },
    isValidImage(file) {
      const allowedExtensions = ['png', 'jpeg', 'jpg'];
      const fileExtension = file.name.toLowerCase().split('.').pop();
      return allowedExtensions.includes(fileExtension);
    },
    notification(message, status) {
      status == 'success' ? this.$toast.success(message, this.notificationData) : this.$toast.error(message, this.notificationData);
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
      if (file && !this.isValidImage(file)) {
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
      if (file) {
        this.imagePreviewUrl = URL.createObjectURL(file)
        this.imageError = ''
      }
    },
    addProject(hasLink) {
      if (!hasLink || this.$refs.formDialog.validate()) {
        if (!this.ticketID) {
          this.ticketID = 'PRJ-' + Math.floor(100000 + Math.random() * 900000);
        }
        const formData = new FormData();
        const projectImage = Array.isArray(this.file) ? this.file[0] : this.file
        if (projectImage) {
          formData.append('image', projectImage);
        }
        if (this.deadLine) {
          formData.append('dead_line', this.deadLine);
        }
        formData.append('start_date', this.startDate);
        
        // Pass bilingual parameters to Laravel
        formData.append('name_ar', this.projectNameAr);
        formData.append('name_en', this.projectNameEn);
        formData.append('name', this.projectNameAr || this.projectNameEn); // Fallback standard name
        
        formData.append('customer_name_ar', this.customerNameAr);
        formData.append('customer_name_en', this.customerNameEn);
        formData.append('customer_name', this.customerNameAr || this.customerNameEn); // Fallback standard customer name
        
        formData.append('ticket_id', this.ticketID);
        
        const descAr = this.quillAr ? this.quillAr.root.innerHTML : '';
        const descEn = this.quillEn ? this.quillEn.root.innerHTML : '';
        formData.append('description_ar', descAr);
        formData.append('description_en', descEn);
        formData.append('description', descAr || descEn); // Fallback standard description
        
        this.selectedMemberIds.forEach((element, index) => {
          formData.append(`members[${index}]`, element);
        });
        formData.append('has_member_sections', '1');
        Object.keys(this.itemValue || {}).forEach((teamKey) => {
          const list = this.itemValue[teamKey]
          if (!Array.isArray(list) || !list.length) return
          list.forEach((userId, index) => {
            formData.append(`member_sections[${teamKey}][${index}]`, userId)
          })
        })
        
        if (hasLink) {
          formData.append('link[link]', this.ticketLink);
          formData.append('link[description]', this.displayText);
        }

        this.$axios.post('/projects', formData, {
          headers: {
            'Authorization': `Bearer ${localStorage.token}`,
            'Accept': 'application/json',
            'Accept-Language': this.$i18n.locale
          }
        })
          .then(res => {
            this.notification((res.data && res.data.message) || this.$t('Added'), 'success')
            this.dialog = false
            this.$router.push(this.localePath('/projects'))
          })
          .catch(error => {
            const data = error.response && error.response.data
            const msg =
              (data && data.message) ||
              (data && data.errors && Object.values(data.errors).flat()[0]) ||
              this.$t('Something went wrong')
            this.notification(msg, 'error')
          })
      }
    },
    initializeDescriptionEditors() {
      const toolbarOptions = [
        [{ 'color': [] }, { 'background': [] }],
        ['bold', 'italic', 'underline', 'strike'],
        ['link', 'image', 'video'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'indent': '-1' }, { 'indent': '+1' }],
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['blockquote', 'code-block'],
        [{ 'align': [] }],
        ['formula'],
        ['clean']
      ];
      this.quillAr = new Quill('#editorAr', {
        modules: { toolbar: toolbarOptions },
        theme: 'snow'
      });
      this.quillEn = new Quill('#editorEn', {
        modules: { toolbar: toolbarOptions },
        theme: 'snow'
      });
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

  &__actions,
  &__dialog-actions {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
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

  &__error {
    margin: 6px 0 0;
    color: #b42318;
    font-size: 12px;
  }
}

@media (max-width: 600px) {
  .createProject__actions,
  .createProject__dialog-actions {
    > .v-btn {
      flex: 1 1 100%;
      width: 100%;
      margin-inline: 0 !important;
    }
  }
}
</style>
