<template>
  <v-card>
    <v-container class="pt-8 pb-8">
      <h3 class="text-center">{{ $t('Edit Event') }}</h3>
      <v-text-field v-model="name" :placeholder="$t('Add Title')" required></v-text-field>

      <div id="editor"></div>
      <button class="btn btn-create w-100 d-block mt-4" @click.prevent="saveEvent()">{{ $t('Save') }}</button>
    </v-container>
  </v-card>
</template>
<script>
import { sanitizeHtml } from '~/utils/sanitizeHtml'

export default {
  data() {
    return {
      name: null,
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
  props: ['oneEvent', 'editEvent'],
  beforeMount() {
    this.name = this.oneEvent?.name
    // this.quill.root.innerHTML = this.children[0].description
  },
  methods: {
    notification(message, status) {
      status == 'success' ? this.$toast.success(message, this.notificationData) : this.$toast.error(message, this.notificationData);
    },
    getProject(){
      this.$axios.get(`/projects/${this.$route.params.id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.token}`,
        'Accept': 'application/json',
        'Accept-Language': this.$i18n.locale
      }
    })
      .then(res => {
        this.$emit('one_Project' , res.data.data)
        this.$emit('status_Value' , res.data.data.status)
        this.$emit('loading' , false)
      })
    },

    initializeDescriptionEditor() {
      this.counterQuill++
      const toolbarOptions = [
        [{ 'color': [] }, { 'background': [] }],         // Text and background color
        ['link', 'image'],                              // Links and images
        ['bold', 'italic', 'underline', 'strike'], // Basic formatting
        ['link', 'image', 'video'], // Links and media
        [{ 'list': 'ordered' }, { 'list': 'bullet' }], // Lists
        [{ 'indent': '-1' }, { 'indent': '+1' }], // Indentation
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }], // Headers
        ['blockquote', 'code-block'], // Block quotes and code blocks
        [{ 'align': [] }], // Text alignment
        ['formula'], // Mathematical formulas
        ['clean'], // Remove formatting

      ];
      this.quill = new Quill('#editor', {
        modules: {
          toolbar: toolbarOptions,
        },
        theme: 'snow'
      });
      this.quill.root.innerHTML = sanitizeHtml(this.$i18n.locale === 'en'
        ? (this.oneEvent?.description_en || this.oneEvent?.description || '')
        : (this.oneEvent?.description_ar || this.oneEvent?.description || ''))

    },
    saveEvent() {
      if (!String(this.name || '').trim()) {
        this.notification(this.$t('Name is required'), 'error')
        return
      }
      const currentDescription = this.quill.root.innerHTML
      var data = {
        project_id: this.$route.params.id,
        name: this.$i18n.locale === 'en' ? (this.oneEvent.name || this.name) : this.name,
        name_ar: this.$i18n.locale === 'ar' ? this.name : (this.oneEvent.name_ar || this.oneEvent.name || ''),
        name_en: this.$i18n.locale === 'en' ? this.name : (this.oneEvent.name_en || ''),
        description: this.$i18n.locale === 'en' ? (this.oneEvent.description || currentDescription) : currentDescription,
        description_ar: this.$i18n.locale === 'ar' ? currentDescription : (this.oneEvent.description_ar || this.oneEvent.description || ''),
        description_en: this.$i18n.locale === 'en' ? currentDescription : (this.oneEvent.description_en || ''),
      }
      this.$axios.post(`/events/${this.oneEvent.id}`, data, {
          headers: {
            'Authorization': `Bearer ${localStorage.token}`,
            'Accept': 'application/json',
            'Accept-Language': this.$i18n.locale
          }
        })
          .then(res => {
            // this.notification(res.data.message, 'success')
            this.getProject()
            this.$emit('dialogEvent' , false)

          })
          .catch(error => this.notification(error?.response?.data?.message || this.$t('Something went wrong'), 'error'))
    }
  },
  mounted() {
    this.initializeDescriptionEditor()
  }

}
</script>
