<template>
  <div class="showProject">
    <v-container v-if="loading">
      <app-skeleton type="page" />
    </v-container>
    <v-container v-else-if="oneProject">
      <page-header
        :breadcrumb="$t('Current Projects')"
        :title="projectDisplayName"
      >
        <nuxt-link :to="localePath('/projects')" class="btn btn-view">{{ $t('Back') }}</nuxt-link>
      </page-header>

      <section class="project-hero">
        <div class="project-hero__identity">
          <div class="project-hero__avatar">
            <img
              :src="$resolveImage(oneProject.image, require('@/assets/imgs/NiImage.jpg'))"
              :alt="projectDisplayName"
            >
          </div>

          <div class="project-hero__copy">
            <div class="project-hero__names">
              <span class="project-hero__name">{{ projectDisplayName }}</span>
              <span class="project-hero__ticket">{{ oneProject.ticket_id }}</span>
            </div>

            <p class="project-hero__dates">
              <span class="mdi mdi-calendar-range"></span>
              <span class="project-hero__date-range">
                <span>{{ formatProjectDate(oneProject.start_date) }}</span>
                {{ $t('To') }}
                <span>{{ formatProjectDate(oneProject.dead_line) }}</span>
              </span>
            </p>
          </div>
        </div>

        <div v-if="projectTeamProgress.length" class="project-hero__teams">
          <div v-for="team in projectTeamProgress" :key="team.name" class="project-hero__team">
            <v-progress-circular
              :value="team.progress"
              :size="40"
              :width="3"
              color="primary"
            >{{ team.progress }}%</v-progress-circular>
            <span>{{ localizedContent(team, 'name') }}</span>
          </div>
        </div>
      </section>

      <div class="project-meta">
        <article class="project-meta__card">
          <p>{{ $t('Created By') }}</p>
          <h4>{{ projectCreatorDisplayName }}</h4>
        </article>

        <article class="project-meta__card">
          <p>{{ $t('Client') }}</p>
          <h4>{{ customerDisplayName }}</h4>
        </article>

        <article class="project-meta__card">
          <p>{{ $t('Project Status') }}</p>
          <v-select
            :items="projectStatus"
            item-text="name"
            item-value="value"
            v-model="statusValue"
            outlined
            dense
            hide-details
            @change="changeStatus()"
          />
        </article>

      </div>

      <section class="project-assignees-card">
        <div class="project-card__head">
          <h3>{{ $t('Assigned To') }}</h3>
        </div>
        <div class="project-assignees">
          <div v-for="item in assignedMembers" :key="item.id" class="project-assignees__row">
            <img
              class="project-assignees__avatar"
              :src="$resolveImage(item.image, require('@/assets/imgs/avatar.png'))"
              :alt="memberDisplayName(item)"
            >
            <span class="project-assignees__name">{{ memberDisplayName(item) }}</span>
            <span class="project-assignees__check mdi mdi-check" />
          </div>
          <p v-if="!assignedMembers.length" class="project-assignees__empty">{{ $t('No Data') }}</p>
        </div>
      </section>

      <v-row class="project-layout">
        <v-col cols="12" md="8" lg="9">
          <section class="project-card descriptionProject">
            <div class="project-card__head">
              <h3>{{ $t('Description') }}</h3>
            </div>
            <div class="project-card__body" v-html="projectDescription"></div>
          </section>

          <section class="project-card importantEvent">
            <div class="project-card__head">
              <h3>{{ $t('Important Event') }}</h3>
            </div>
            <v-expansion-panels v-if="projectEvents.length" accordion flat class="project-notes-list">
              <v-expansion-panel v-for="item in projectEvents" :key="item.id">
                <v-expansion-panel-header expand-icon="mdi-chevron-left">{{ localizedContent(item, 'name') }}</v-expansion-panel-header>
                <v-expansion-panel-content>
                  <div class="project-event__body" v-html="safeHtml(localizedContent(item, 'description'))"></div>
                  <div class="project-event__actions">
                    <v-btn class="btn btn-edit" @click="openEditEventDialog(item)">{{ $t('Edit') }}</v-btn>
                    <v-btn class="btn btn-delete" @click.prevent="deleteDialogMethod('event', item.id)">{{ $t('Delete') }}</v-btn>
                  </div>
                </v-expansion-panel-content>
              </v-expansion-panel>
            </v-expansion-panels>
            <p v-else class="project-section-empty">{{ $t('No notes yet') }}</p>
          </section>

          <section class="project-content-section">
            <div class="project-section-heading">
              <h3>{{ $t('Attachments') }}</h3>
              <span class="project-section-count">{{ (oneProject.attachments || []).length }}</span>
            </div>
            <div v-if="oneProject.attachments && oneProject.attachments.length" class="project-attachments-list">
            <section
              v-for="attachment in oneProject.attachments"
              :key="attachment.id"
              class="project-card attachment"
            >
            <a
              v-if="!attachment.missing"
              class="attachment__preview"
              :download="attachment.file_name || attachmentDescription(attachment)"
              :href="attachment.path ? attachment.path : require('@/assets/imgs/NiImage.jpg')"
            >
              <img
                v-if="attachment.type == 'image'"
                :src="attachment.path ? attachment.path : require('@/assets/imgs/NiImage.jpg')"
                class="imageProject"
                alt=""
              >
              <video :src="attachment.path" v-if="attachment.type == 'video'" controls />
              <img src="@/assets/imgs/document.jpg" v-if="attachment.type == 'file'" alt="">
            </a>
            <div v-else class="attachment__preview attachment__preview--missing" role="img" :aria-label="$t('Attachment file is unavailable')">
              <v-icon>mdi-file-alert-outline</v-icon>
            </div>
            <div class="detailsAttachment">
              <h3>{{ attachmentDescription(attachment) }}</h3>
              <span v-if="attachment.missing">{{ $t('Attachment file is unavailable') }}</span>
              <span>{{ $t('BY') }} : {{ localizedPersonName(attachment) }}</span>
              <span>{{ formatProjectDate(attachment.created_at) }}</span>
            </div>
            <div class="actions attachment-actions">
              <v-btn class="btn btn-edit" @click="editAttachment(attachment.id)">
                {{ $t('Edit') }}
              </v-btn>
              <v-btn class="btn btn-delete"
                @click.prevent="deleteDialogMethod('attachment', attachment.id)">
                {{ $t('Delete') }}
              </v-btn>
            </div>
            </section>
            </div>
            <p v-else class="project-section-empty">{{ $t('No attachments yet') }}</p>
          </section>

          <section class="project-content-section">
            <div class="project-section-heading">
              <h3>{{ $t('Links') }}</h3>
              <span class="project-section-count">{{ (oneProject.links || []).length }}</span>
            </div>
            <div v-if="oneProject.links && oneProject.links.length" class="project-links-grid">
              <section
                v-for="projectLink in (oneProject.links || [])"
                :key="'link-' + projectLink.id"
                class="project-card attachment project-link"
              >
            <a
              class="attachment__preview project-link__preview"
              :href="safeExternalLink(projectLink.link) || undefined"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span class="mdi mdi-link-variant"></span>
            </a>
            <div class="detailsAttachment">
              <h3>
                <a :href="safeExternalLink(projectLink.link) || undefined" target="_blank" rel="noopener noreferrer">
                  {{ projectLinkDescription(projectLink) }}
                </a>
              </h3>
              <span>{{ $t('BY') }} : {{ localizedPersonName(projectLink) }}</span>
              <span>{{ formatProjectDate(projectLink.created_at) }}</span>
            </div>
            <div class="actions attachment-actions">
              <v-btn class="btn btn-edit" @click="editLink(projectLink)">
                {{ $t('Edit') }}
              </v-btn>
              <v-btn
                class="btn btn-delete"
                @click.prevent="deleteDialogMethod('link', projectLink.id)"
              >
                {{ $t('Delete') }}
              </v-btn>
            </div>
              </section>
            </div>
            <p v-else class="project-section-empty">{{ $t('No links yet') }}</p>
          </section>

          <section class="project-task-section">
            <div class="project-section-heading">
              <div class="project-section-heading__title">
                <h3>{{ $t('Tasks') }}</h3>
                <span class="project-section-count">{{ (oneProject.tasks || []).length }}</span>
              </div>
            </div>
            <template v-if="oneProject.tasks && oneProject.tasks.length">
              <article class="project-task-item" v-for="task in visibleTasks" :key="task.id">
                <div class="project-task-row">
                  <div class="project-task-row__name">
                    <img
                      v-if="taskMember(task)"
                      class="project-task-row__avatar"
                      :src="$resolveImage(taskMember(task).image, require('@/assets/imgs/avatar.png'))"
                      :alt="memberDisplayName(taskMember(task))"
                    >
                    <div>
                      <strong>{{ localizedContent(task, 'name') }}</strong>
                    </div>
                  </div>
                  <span v-if="task.deadline_date" class="project-task-row__deadline">
                    <span class="mdi mdi-calendar-clock" aria-hidden="true"></span>
                    {{ formatProjectDate(task.deadline_date) }}
                    <template v-if="task.deadline_time"> · {{ task.deadline_time }}</template>
                  </span>
                  <div class="project-task-row__status">
                    <span class="project-task-row__count">
                      {{ $t('Completed') }} {{ taskProgress(task).completedItems }} {{ $t('of') }} {{ taskProgress(task).totalItems }}
                    </span>
                    <span class="project-task-row__badge" :class="taskProgress(task).percent === 100 ? 'is-done' : 'is-unfinished'">
                      <span class="mdi" :class="taskProgress(task).percent === 100 ? 'mdi-check-circle-outline' : 'mdi-clock-outline'" aria-hidden="true"></span>
                      {{ taskProgress(task).percent === 100 ? $t('Finished') : $t('Not Finished') }}
                    </span>
                  </div>
                  <nuxt-link
                    class="project-task-row__view"
                    :to="localePath(`/todo/${task.id}`)"
                  >
                    {{ $t('View') }}
                  </nuxt-link>
                </div>
              </article>
              <button
                v-if="visibleTaskCount < oneProject.tasks.length"
                type="button"
                class="project-tasks-more"
                @click="visibleTaskCount += 3"
              >{{ $t('Show More') }}</button>
            </template>
            <div v-else class="project-tasks-empty">
              <span class="mdi mdi-clipboard-text-outline" aria-hidden="true"></span>
              <div>
                <strong>{{ $t('No tasks yet') }}</strong>
                <p>{{ $t('Add a task to start tracking project progress.') }}</p>
              </div>
            </div>
          </section>
          <section class="project-card project-comments">
            <div class="project-section-heading">
              <div>
                <h3>{{ $t('Project Comments') }}</h3>
                <p>{{ $t('Keep in touch with the project team') }}</p>
              </div>
            </div>
            <div v-if="oneProject.comments && oneProject.comments.length" class="project-comments__list">
              <article v-for="comment in oneProject.comments" :key="comment.id" class="project-comments__item">
                <img
                  :src="$resolveImage(comment.image, require('@/assets/imgs/avatar.png'))"
                  :alt="comment.author"
                >
                <div>
                  <div class="project-comments__meta">
                    <strong>{{ $i18n.locale === 'en' ? (comment.author_en || comment.author) : comment.author }}</strong>
                    <time>{{ formatProjectDate(comment.created_at) }}</time>
                  </div>
                  <p>{{ comment.comment }}</p>
                </div>
              </article>
            </div>
            <p v-else class="project-section-empty">{{ $t('No project comments yet') }}</p>
            <form class="project-comments__form" @submit.prevent="submitProjectComment">
              <v-textarea
                v-model="projectCommentDraft"
                :placeholder="$t('Write a comment')"
                rows="2"
                auto-grow
                outlined
                hide-details
              />
              <button class="btn btn-create" type="submit" :disabled="savingProjectComment">
                {{ $t('Post Comment') }}
              </button>
            </form>
          </section>
          <project-milestones
            :project-id="oneProject.id"            class="project-card milestones-wrap"
          />
        </v-col>
        <v-col cols="12" md="4" lg="3">
          <aside class="project-aside">
            <h3>{{ $t('Add To Card') }}</h3>
            <button class="project-aside__btn" @click.prevent="openCreateTask">
              <span class="mdi mdi-playlist-plus"></span>
              {{ $t('Add Task') }}
            </button>
            <button              class="project-aside__btn"
              @click.prevent="addAttachmentDialog = true"
            >
              <span class="mdi mdi-file-document-multiple-outline"></span>
              {{ $t('Attachment') }}
            </button>
            <button              class="project-aside__btn"
              @click="addLinkDialog = true"
            >
              <span class="mdi mdi-link-variant"></span>
              {{ $t('Link') }}
            </button>
          </aside>
        </v-col>
      </v-row>
      <v-dialog v-model="dialogEvent" max-width="700">
        <dialogEvent @one_Project="getNewEvent" @status_Value="updateStatusValue" @loading="updateLoading"
          @dialogEvent="dialogEventMethod" :oneEvent="oneEvent" :editEvent="editEvent" />
      </v-dialog>
      <v-dialog v-model="addEvent" max-width="700">
        <addEvent @one_Project="getNewEvent" @status_Value="updateStatusValue" @addEvent="addEventMethod"
          @loading="updateLoading" />
      </v-dialog>
      <v-dialog v-model="deleteDialog" max-width="420" content-class="confirm-delete-dialog">
        <v-card class="confirm-delete-dialog__card">
          <div class="confirm-delete-dialog__icon">
            <v-icon size="28" color="#B42318">mdi-alert-circle-outline</v-icon>
          </div>
          <h3 class="confirm-delete-dialog__title">
            <span v-if="typeDialog === 'project'">{{ $t('Are you sure you want to delete this project?') }}</span>
            <span v-else-if="typeDialog === 'task' || typeDialog === 'subtask'">{{ $t('Are you sure you want to delete this todo?') }}</span>
            <span v-else-if="typeDialog === 'attachment'">{{ $t('Are you sure you want to delete this attachment?') }}</span>
            <span v-else-if="typeDialog === 'link'">{{ $t('Are you sure you want to delete this item?') }}</span>
            <span v-else-if="typeDialog === 'event'">{{ $t('Are you sure you want to delete this event?') }}</span>
            <span v-else>{{ $t('Are you sure you want to delete this item?') }}</span>
          </h3>
          <p v-if="typeDialog === 'project'" class="confirm-delete-dialog__message">{{ $t('Deleting a project will remove its member assignments. This cannot be undone.') }}</p>
          <div class="confirm-delete-dialog__actions">
            <button
              type="button"
              class="btn btn-view"
              @click.prevent="deleteDialog = false"
            >{{ $t('Cancel') }}</button>
            <button
              type="button"
              class="btn btn-danger"
              @click.prevent="confirmDelete()"
            >{{ $t('Delete') }}</button>
          </div>
        </v-card>
      </v-dialog>
      <v-dialog v-model="editAttachmentDialog" max-width="700">
        <v-card>
          <v-container class="pt-8 pb-8">
            <label for="selectImage" class="d-block m-auto text-center mb-4">
              <img v-if="editAttachmentType === 'image'" :src="attachmentPreviewUrl || require('@/assets/imgs/NiImage.jpg')" alt=""
                style="border-radius: 12px; max-height: 150px; max-width: 100%">
              <video v-else-if="editAttachmentType === 'video'" :src="attachmentPreviewUrl" controls style="max-height: 150px; max-width: 100%" />
              <div v-else class="text-center"><v-icon size="56">mdi-file-document-outline</v-icon><div>{{ selectedAttachmentFile ? selectedAttachmentFile.name : showFileName }}</div></div>
            </label>
            <input type="file" class="d-none" @change="handleAttachmentFileChange" id="selectImage" />
            <small class="d-block text-center mb-3">{{ $t('Attachment size limit') }}</small>
            <button class="btn btn-create w-100 d-block mt-4" @click.prevent="saveAttachmentReplacement()">{{ $t('Save')
            }}</button>
          </v-container>
        </v-card>
      </v-dialog>
      <v-dialog v-model="addTaskDialog" max-width="760" @click:outside="closeTaskDialog" @keydown.esc="closeTaskDialog">
        <addTask
          :key="editingTask ? 'edit-' + editingTask.id : 'create'"
          :project-id="$route.params.id"
          :task="editingTask"
          @hideDiaglogAddTask="hideDiaglogAddTask"
        />
      </v-dialog>
      <v-dialog v-model="addAttachmentDialog" max-width="500">
        <v-card>
          <v-container class="pt-8 pb-8">
            <h3 class="text-center">{{ $t('Add Attachment') }}</h3>
            <v-divider class="mt-3 mb-5"></v-divider>
            <h4>{{ $t('Attach A File Your Computer') }}</h4>
            <v-form>
              <input type="file" id="fileInputImage" class="d-none" ref="fileInput" @change="handleFileChange($event)" />
              <label for="fileInputImage" class="btn btn-add-attachment">
                {{ selectedFiles ? selectedFiles.name : $t('Attach Attachment') }}
              </label>
              <small class="d-block mb-3">{{ $t('Attachment size limit') }}</small>
              <button class="btn btn-create w-100 d-block" @click.prevent="addAttachment()">{{ $t('Add') }}</button>
            </v-form>
          </v-container>
        </v-card>
      </v-dialog>
      <v-dialog v-model="addLinkDialog" max-width="400">
        <v-card>
          <v-container class="p-8">
            <h3 class="mt-4">{{ $t(editingLinkId ? 'Edit Link' : 'Add Link') }}</h3>
            <v-divider class="mt-5 mb-5"></v-divider>
            <v-form ref="addLinkForm" v-model="valid" lazy-validation>
              <label>{{ $t('Paste Ticket link') }}</label>
              <v-text-field class="mb-4" v-model="ticketLink" :rules="ticketLinkRule"
                :placeholder="$t('Paste Ticket link')" outlined dense hide-details="auto" required></v-text-field>
              <label class="mt-5">{{ $t('Display text') }}</label>
              <v-text-field v-model="displayText" :rules="displayTextRule" :placeholder="$t('Display text')"
                outlined dense hide-details="auto" required></v-text-field>
              <v-btn
                class="btn btn-create mt-5 mb-5 w-100 d-block"
                :loading="savingLink"
                :disabled="savingLink"
                @click.prevent="addLink()"
              >{{ $t(editingLinkId ? 'Save' : 'Add') }}</v-btn>
            </v-form>

          </v-container>

        </v-card>
      </v-dialog>

    </v-container>
    <v-container v-else>
      <app-empty-state icon="mdi-folder-alert-outline" :title="$t('No Data')" />
    </v-container>
  </div>
</template>
<script>
import draggable from "vuedraggable";
import { personName } from '~/utils/personName'
import { summarizeProjectTeamProgress, summarizeTaskProgress } from '~/utils/projectProgress'
import { sanitizeHtml } from '~/utils/sanitizeHtml'
export default {
  display: "Transitions",
  order: 7,
  components: {
    draggable
  },
  data() {
    return {
      statusValue: null,
      validSubTask: true,
      showSubtaskForm: false,
      oneProject: null,
      projectCommentDraft: '',
      savingProjectComment: false,
      visibleTaskCount: 3,
      selectedAttachmentFile: null,
      attachmentPreviewUrl: null,
      showFileName: '',
      editAttachmentType: 'file',
      deleteDialog: false,
      typeDialog: null,
      typeId: null,
      editAttachmentDialog: false,
      addTaskDialog: false,
      editingTask: null,
      addLinkDialog: false,
      editingLinkId: null,
      savingLink: false,
      showinputName: false,
      showinputDescription: false,
      addAttachmentDialog: false,
      ticketLink: '',
      name: '',
      displayText: '',
      drag: false,
      oneEvent: null,

      taskName: '',
      taskDescription: '',
      nameRules: [
        v => !!v || this.$t('Name is required'),
      ],
      loading: true,
      valid: true,
      dialogEvent: false,
      addEvent: false,
      selectedFiles: null,
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
      editingAttachmentId: null,
      editEvent: false,
      ticketLinkRule: [
        v => !!v || this.$t('Required'),
        (v) => this.isValidTicketLink(v) || this.$t('Invalid Ticket link'),
      ],
      displayTextRule: [
        v => !!v || this.$t('Required'),
      ],
      selectProjectImage: null,
      members: [],
      memberSelected: [],
      savingMembers: false,
      loadingMembers: true,
      targetCardIndex: -1,
    }
  },
  async beforeMount() {
    this.getProject()
    this.getMembers()
  },
  watch: {
    addLinkDialog(isOpen) {
      if (!isOpen) this.editingLinkId = null
    },
  },
  methods: {
    submitProjectComment() {
      const comment = this.projectCommentDraft.trim()
      if (!comment) {
        this.notification(this.$t('Comment is required'), 'error')
        return
      }
      if (!this.oneProject || this.savingProjectComment) return
      this.savingProjectComment = true
      this.$axios.post(`/projects/${this.oneProject.id}/comments`, { comment }, {
        headers: { 'Accept-Language': this.$i18n.locale }
      }).then((res) => {
        const comments = res.data && res.data.data
        if (Array.isArray(comments)) this.$set(this.oneProject, 'comments', comments)
        this.projectCommentDraft = ''
      }).catch((error) => {
        this.notification(error?.response?.data?.message || this.$t('Something went wrong'), 'error')
      }).finally(() => {
        this.savingProjectComment = false
      })
    },
    safeHtml(value) {
      return sanitizeHtml(value)
    },
    taskProgress(task) {
      return summarizeTaskProgress(task)
    },
    taskMember(task) {
      const taskMembers = task && Array.isArray(task.members) ? task.members : []
      const projectMembers = this.oneProject && Array.isArray(this.oneProject.members) ? this.oneProject.members : []
      return taskMembers[0] || projectMembers[0] || null
    },
    getNewEvent(data) {
      this.oneProject = data;
    },
    hideDiaglogAddTask(data) {
      this.addTaskDialog = data
      this.editingTask = null
      this.getProject()
      this.getMembers()
    },
    openCreateTask() {
      this.editingTask = null
      this.addTaskDialog = true
    },
    openEditTask(task) {
      this.editingTask = task ? { ...task } : null
      this.addTaskDialog = true
    },
    closeTaskDialog() {
      this.addTaskDialog = false
      this.editingTask = null
    },
    updateStatusValue(statusValue) {
      this.statusValue = statusValue;
    },
    dialogEventMethod(dialogEvent) {
      this.dialogEvent = dialogEvent;
    },
    addEventMethod(addEvent) {
      this.addEvent = addEvent;
    },
    editProject(options = {}) {
      const syncMembers = !!(options && options.syncMembers)
      const formData = new FormData();
      if (this.selectProjectImage !== null) {
        formData.append('image', this.oneProject.image);
      }
      formData.append('name_ar', this.oneProject.name_ar || this.oneProject.name || '');
      formData.append('name_en', this.oneProject.name_en || this.oneProject.name || '');
      formData.append('name', this.oneProject.name);
      formData.append('customer_name_ar', this.oneProject.customer_name_ar || this.oneProject.customer_name || '');
      formData.append('customer_name_en', this.oneProject.customer_name_en || this.oneProject.customer_name || '');
      formData.append('customer_name', this.oneProject.customer_name);
      formData.append('dead_line', this.oneProject.dead_line || '');
      formData.append('start_date', this.oneProject.start_date);
      formData.append('ticket_id', this.oneProject.ticket_id);
      if (syncMembers) {
        formData.append('sync_members', '1');
        (this.memberSelected || []).forEach((element, index) => {
          formData.append(`members[${index}]`, element);
        });
      }
      return this.$axios.post(`/projects/${this.$route.params.id}`, formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.token}`,
          'Accept': 'application/json',
          'Accept-Language': this.$i18n.locale
        }
      }).then(res => {
        this.notification(res.data.message, 'success')
      }).catch(error => {
        this.notification(error?.response?.data?.message || this.$t('Something went wrong'), 'error')
        this.getProject()
      })
    },
    updateLoading(isLoading) {
      this.loading = isLoading;
    },
    showinputProjectName(event,number) {
      event.srcElement.classList.add('d-none')
      event.srcElement.parentElement.children[number].classList.remove('d-none')
      event.srcElement.parentElement.children[number].focus()
    },
    hideinputProjectDate(event,number){
      event.srcElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.children[Number(number+1)].classList.add('d-none')
      event.srcElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.children[number].classList.remove('d-none')
      this.editProject()
    },
    hideinputProjectName(event,number) {
      this.editProject()
      event.srcElement.classList.add('d-none')
      event.srcElement.parentElement.children[number].classList.remove('d-none')
    },
    getProject() {
      this.$axios.get(`/projects/${this.$route.params.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.token}`,
          'Accept': 'application/json',
          'Accept-Language': this.$i18n.locale
        }
      })
        .then(res => {
          this.oneProject = res.data.data;
          // Older saved projects may still use HOLD for the postponed state.
          this.statusValue = this.oneProject.status === 'HOLD'
            ? 'POSTPONED'
            : this.oneProject.status
          this.loading = false
          this.mergeAssignedMembersFromProject()
        })
        .catch(error => {
          this.loading = false
          this.oneProject = null
          this.notification(error?.response?.data?.message || this.$t('Something went wrong'), 'error')
        })
    },
    getMembers() {
      return this.$axios.get(`/projects/${this.$route.params.id}/members`, {
        headers: {
          'Authorization': `Bearer ${localStorage.token}`,
          'Accept': 'application/json',
          'Accept-Language': this.$i18n.locale
        }
      })
      .then(res=>{
        const list = Array.isArray(res.data.data) ? res.data.data : []
        this.members = list.filter((member) => member && member.in_project == true)
        this.memberSelected = this.members.map((member) => member.id)
        this.mergeAssignedMembersFromProject()
      })
      .catch(() => {
        this.mergeAssignedMembersFromProject()
      })
    },
    mergeAssignedMembersFromProject() {
      const projectMembers = this.oneProject && Array.isArray(this.oneProject.members)
        ? this.oneProject.members
        : []
      const byId = {}
      projectMembers.forEach((member) => {
        if (!member || member.id == null) return
        byId[member.id] = {
          id: member.id,
          name: member.name,
          name_ar: member.name_ar,
          name_en: member.name_en,
          image: member.image,
          in_project: true,
        }
      })
      ;(this.members || []).forEach((member) => {
        if (!member || member.id == null) return
        if (member.in_project != true && !byId[member.id]) return
        byId[member.id] = Object.assign({}, byId[member.id] || {}, member, { in_project: true })
      })
      this.members = Object.values(byId)
      this.memberSelected = this.members.map((member) => member.id)
    },
    showinputNameMethod(event) {
      event.srcElement.classList.add('d-none')
      event.srcElement.parentElement.children[1].classList.remove('d-none')
      event.srcElement.parentElement.children[1].focus()
    },
    showinputDescriptionMethod(event) {
      event.srcElement.classList.add('d-none')
      event.srcElement.parentElement.children[3].classList.remove('d-none')
      event.srcElement.parentElement.children[3].focus()
    },
    hideNameInput(event, id, taskId) {
      const value = event.target.value
      const localizedName = this.$i18n.locale === 'en' ? 'name_en' : 'name_ar'
      this.$axios.put(`tasks/sub/${id}?${localizedName}=${encodeURIComponent(value)}&task_id=${taskId}`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.token}`,
          'Accept': 'application/json',
          'Accept-Language':this.$i18n.locale
        }
      })
        .then(res => {
          this.notification(res.data.message, 'success')
          event.srcElement.parentElement.children[0].classList.remove('d-none')
          event.srcElement.parentElement.children[1].classList.add('d-none')
        })
        .catch(error => {
          this.notification(error?.response?.data?.message || this.$t('Something went wrong'), 'error')
        })
    },
    hideDescInput(event, id, taskId) {
      const value = event.target.value
      const localizedDescription = this.$i18n.locale === 'en' ? 'description_en' : 'description_ar'
      this.$axios.put(`tasks/sub/${id}?${localizedDescription}=${encodeURIComponent(value)}&task_id=${taskId}`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.token}`,
          'Accept': 'application/json',
          'Accept-Language':this.$i18n.locale
        }
      })
        .then(res => {
          this.notification(res.data.message, 'success')
          event.srcElement.parentElement.children[2].classList.remove('d-none')
          event.srcElement.parentElement.children[3].classList.add('d-none')
        })
        .catch(error => {
          this.notification(error?.response?.data?.message || this.$t('Something went wrong'), 'error')
        })
    },
    isValidTicketLink(link) {
      const value = String(link || '').trim()
      return Boolean(this.safeExternalLink(value))
    },
    safeExternalLink(link) {
      try {
        const url = new URL(String(link || '').trim())
        return ['http:', 'https:'].includes(url.protocol) ? url.href : ''
      } catch (error) {
        return ''
      }
    },
    editLink(item) {
      this.editingLinkId = item.id
      this.displayText = this.projectLinkDescription(item)
      this.ticketLink = item.link
      this.addLinkDialog = true
    },
    addLink() {
      const form = this.$refs.addLinkForm
      if (form && !form.validate()) return
      if (this.savingLink) return

      this.savingLink = true
      const currentLink = (this.oneProject.links || []).find(item => String(item.id) === String(this.editingLinkId))
      this.$axios.post(this.editingLinkId ? '/links/update' : '/links', {
        id: this.editingLinkId,
        project_id: this.$route.params.id,
        description: this.displayText,
        description_ar: this.$i18n.locale === 'ar' ? this.displayText : (currentLink && currentLink.description_ar) || '',
        description_en: this.$i18n.locale === 'en' ? this.displayText : (currentLink && currentLink.description_en) || '',
        link: String(this.ticketLink || '').trim(),
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.token}`,
          'Accept': 'application/json',
          'Accept-Language': this.$i18n.locale
        }
      })
        .then(res => {
          this.notification(res.data.message, 'success')
          this.addLinkDialog = false
          this.editingLinkId = null
          this.ticketLink = ''
          this.displayText = ''
          if (form && form.resetValidation) form.resetValidation()
          this.getProject()
        })
        .catch(error => {
          const payload = error && error.response && error.response.data
          const firstError = payload && payload.errors
            ? Object.values(payload.errors)[0]
            : null
          const message = (Array.isArray(firstError) ? firstError[0] : firstError)
            || (payload && payload.message)
            || this.$t('Something went wrong')
          this.notification(message, 'error')
        })
        .finally(() => {
          this.savingLink = false
        })
    },
    changeStatus() {
      this.$axios.put(`projects/${this.$route.params.id}?status=${this.statusValue}`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.token}`,
          'Accept': 'application/json',
          'Accept-Language':this.$i18n.locale
        }
      })
        .then(res => {
          this.notification(res.data.message, 'success')
        })
        .catch(error => {
          this.notification(error?.response?.data?.message || this.$t('Something went wrong'), 'error')
          this.getProject()
        })
    },
    notification(message, status) {
      status == 'success' ? this.$toast.success(message, this.notificationData) : this.$toast.error(message, this.notificationData);
    },
    addSubTaskMethod(index) {
      this.targetCardIndex = index
      this.showSubtaskForm = true
    },
    cancelAddSubTask() {
      this.showSubtaskForm = false
      this.targetCardIndex = -1
      this.taskName = ''
      this.taskDescription = ''
      this.validSubTask = true
    },
    addTask(id) {
      if (!String(this.taskName || '').trim()) {
        this.notification(this.$t('Name is required'), 'error')
        return
      }
      var data = {
        task_id: id,
        name: this.taskName,
        name_ar: this.$i18n.locale === 'ar' ? this.taskName : '',
        name_en: this.$i18n.locale === 'en' ? this.taskName : '',
        description: this.taskDescription
      }
      if (this.$i18n.locale === 'ar') data.description_ar = this.taskDescription
      else data.description_en = this.taskDescription
      this.$axios.post('/tasks/sub', data, {
        headers: {
          'Authorization': `Bearer ${localStorage.token}`,
          'Accept': 'application/json',
          'Accept-Language':this.$i18n.locale
        }
      })
        .then(res => {
          this.notification(res.data.message, 'success')
          this.getProject()
          this.taskName = ''
          this.taskDescription = ''
          this.showSubtaskForm = false
          this.targetCardIndex = -1
        })
        .catch(error => this.notification(error?.response?.data?.message || this.$t('Something went wrong'), 'error'))
    },
    handleAttachmentFileChange(event) {
      const file = event.target.files[0];
      if (file && file.size > 1024 * 1024) {
        this.notification(this.$t('Attachment size limit'), 'error')
        event.target.value = ''
        return
      }
      this.selectedAttachmentFile = event.target.files[0]
      if (file) {
        this.editAttachmentType = file.type && file.type.startsWith('image/') ? 'image' : file.type && file.type.startsWith('video/') ? 'video' : 'file'
        this.showFileName = file.name
      }

      if (file && this.editAttachmentType !== 'file') {
        const reader = new FileReader();
        reader.onload = (event) => {
          this.attachmentPreviewUrl = event.target.result
        };
        reader.readAsDataURL(file);
      }
    },
    openEditEventDialog(event) {
      const id = event && event.id
      if (!id) return
      this.$axios.get(`/events/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.token}`,
          'Accept': 'application/json',
          'Accept-Language':this.$i18n.locale
        }
      }).then(res => {
        this.oneEvent = res.data.data;
        this.editEvent = true
        this.dialogEvent = true
      })
      .catch(error => this.notification(error?.response?.data?.message || this.$t('Something went wrong'), 'error'))
    },
    openCreateEventDialog() {
      this.addEvent = true
    },
    saveAttachmentReplacement() {
      if (!this.selectedAttachmentFile) {
        this.notification(this.$t('Select a file first'), 'error')
        return
      }
      const formData = new FormData();
      formData.append('attachment', this.selectedAttachmentFile);
      formData.append('id', this.editingAttachmentId);
      formData.append('project_id', this.$route.params.id);
      this.$axios.post('/attachments/update', formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.token}`,
          'Accept': 'application/json',
          'Accept-Language':this.$i18n.locale
        }
      })
        .then(res => {
          this.notification(res.data.message, 'success')
          this.editAttachmentDialog = false
          this.selectedAttachmentFile = null
          this.getProject()
        })
        .catch(error => this.notification(error?.response?.data?.message || this.$t('Something went wrong'), 'error'))

    },
    deleteDialogMethod(type, id) {
      this.typeDialog = type
      this.typeId = id
      this.deleteDialog = true
    },
    confirmDelete() {
      const headers = {
        'Authorization': `Bearer ${localStorage.token}`,
        'Accept': 'application/json',
        'Accept-Language': this.$i18n.locale
      }

      const endpoint = this.typeDialog === 'project'
        ? `/projects/${this.typeId}`
        : this.typeDialog === 'subtask'
          ? `/tasks/sub/${this.typeId}`
          : this.typeDialog === 'task'
            ? `/tasks/${this.typeId}`
            : this.typeDialog === 'attachment'
              ? `/attachments/${this.typeId}`
              : this.typeDialog === 'link'
                ? `/links/${this.typeId}`
                : this.typeDialog === 'event'
                  ? `/events/${this.typeId}`
                  : null
      if (!endpoint) return

      this.$axios.delete(endpoint, { headers })
        .then(res => {
          this.notification(res.data.message, 'success')
          this.deleteDialog = false
          if (this.typeDialog === 'project') this.$router.push(this.localePath('/projects'))
          else this.getProject()
        })
        .catch(error => {
          this.notification(error?.response?.data?.message || this.$t('Something went wrong'), 'error')
        })
    },
    editAttachment(id) {
      this.editingAttachmentId = id;
      this.$axios.get(`/attachments/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.token}`,
          'Accept': 'application/json',
          'Accept-Language':this.$i18n.locale
        }
      }).then(res => {
        const attachment = res.data.data || {}
        this.attachmentPreviewUrl = attachment.path || null
        this.showFileName = attachment.file_name || this.attachmentDescription(attachment)
        this.editAttachmentType = attachment.type || 'file'
        this.selectedAttachmentFile = null
        this.editAttachmentDialog = true
      })
      .catch(error => this.notification(error?.response?.data?.message || this.$t('Something went wrong'), 'error'))
    },
    toogleStatusSubTask(event,subTaskId, taskId,elementStatus,taskLength,taskFinished) {
      if(elementStatus=='HOLD'){
        this.$axios.put(`tasks/toggle/${subTaskId}?status=FINISHED`, {}, {
          headers: {
            'Authorization': `Bearer ${localStorage.token}`,
            'Accept': 'application/json',
            'Accept-Language':this.$i18n.locale
          }
        }).then(res => {
          this.notification(res.data.message,'success')
          this.getProject()
        }).catch(error => {
          this.notification(error?.response?.data?.message || this.$t('Something went wrong'), 'error')
          this.getProject()
        })
      } else if(elementStatus=='FINISHED'){
        this.$axios.put(`tasks/toggle/${subTaskId}?status=HOLD`, {}, {
          headers: {
            'Authorization': `Bearer ${localStorage.token}`,
            'Accept': 'application/json',
            'Accept-Language':this.$i18n.locale
          }
        }).then(res => {
          this.notification(res.data.message,'success')
          this.getProject()
        }).catch(error => {
          this.notification(error?.response?.data?.message || this.$t('Something went wrong'), 'error')
          this.getProject()
        })
      }
    },
    addAttachment() {
      if (!this.selectedFiles) {
        this.notification(this.$t('Select a file first'), 'error')
        return
      }
      if (this.selectedFiles.size > 1024 * 1024) {
        this.notification(this.$t('Attachment size limit'), 'error')
        return
      }
      const formData = new FormData();
      formData.append('attachment', this.selectedFiles);
      formData.append('project_id', this.$route.params.id);
      this.$axios.post('/attachments', formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.token}`,
          'Accept': 'application/json',
          'Accept-Language':this.$i18n.locale
        }
      })
        .then(res => {
          this.notification(res.data.message, 'success')
          this.addAttachmentDialog = false
          this.selectedFiles = null
          if (this.$refs.fileInput) this.$refs.fileInput.value = ''
          this.getProject()
        })
        .catch(error => this.notification(error?.response?.data?.message || this.$t('Something went wrong'), 'error'))
    },
    handleFileChange(event) {
      this.selectedFiles = event.target.files[0];
      if (this.selectedFiles && this.selectedFiles.size > 1024 * 1024) {
        this.notification(this.$t('Attachment size limit'), 'error')
        this.selectedFiles = null
        event.target.value = ''
      }
    },
    changeTaskStatus(event, taskId) {
      var idTask = []
      for (let i = 0; i < this.oneProject.tasks[taskId].subTasks.length; i++) {
        idTask.push(this.oneProject.tasks[taskId].subTasks[i].id)
      }
      this.$axios.post('/tasks/sort', {
        id: idTask,
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.token}`,
          'Accept': 'application/json',
          'Accept-Language':this.$i18n.locale
        }
      }).then(res => {
        this.notification(res.data.message, 'success')
        this.getProject()
      }).catch(error => {
        this.notification(error?.response?.data?.message || this.$t('Something went wrong'), 'error')
        this.getProject()
      })
    },
    isMemberSelected(id) {
      const nid = Number(id)
      return (this.memberSelected || []).some((value) => Number(value) === nid)
    },
    memberDisplayName(member) {
      return personName(member, this.$i18n.locale)
    },
    localizedContent(item, field) {
      if (!item) return ''
      const englishField = `${field}_en`
      const arabicField = `${field}_ar`
      return this.$i18n.locale === 'en'
        ? (item[englishField] || item[arabicField] || item[field] || '')
        : (item[arabicField] || item[field] || item[englishField] || '')
    },
    setLocalizedContent(item, field, value) {
      const suffix = this.$i18n.locale === 'en' ? '_en' : '_ar'
      this.$set(item, `${field}${suffix}`, value)
    },
    attachmentDescription(item) {
      return this.localizedContent(item, 'description')
    },
    projectLinkDescription(item) {
      return this.localizedContent(item, 'description') || item.link || ''
    },
    localizedPersonName(item) {
      if (!item) return ''
      return personName({ name: item.by, name_ar: item.by_ar || item.by, name_en: item.by_en }, this.$i18n.locale)
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
    toggleMemberRow(id) {
      if (this.savingMembers) return
      const nid = Number(id)
      const index = (this.memberSelected || []).findIndex((value) => Number(value) === nid)
      if (index === -1) {
        this.memberSelected.push(id)
      } else {
        this.memberSelected.splice(index, 1)
      }
      this.syncMembers()
    },
    syncMembers() {
      if (this.savingMembers) return
      this.savingMembers = true
      this.editProject({ syncMembers: true })
        .catch((error) => {
          const message = error && error.response && error.response.data && error.response.data.message
          this.notification(message || this.$t('No Data'), 'error')
        })
        .finally(() => {
          this.getProject()
          this.getMembers()
          this.savingMembers = false
        })
    },
    editMember(){
      this.syncMembers()
    }
  },
  computed: {
    projectDisplayName() {
      if (!this.oneProject) return ''
      return this.$i18n.locale === 'en'
        ? (this.oneProject.name_en || this.oneProject.name || '')
        : (this.oneProject.name_ar || this.oneProject.name || '')
    },
    customerDisplayName() {
      if (!this.oneProject) return ''
      return this.$i18n.locale === 'en'
        ? (this.oneProject.customer_name_en || this.oneProject.customer_name || '')
        : (this.oneProject.customer_name_ar || this.oneProject.customer_name || '')
    },
    projectDescription() {
      if (!this.oneProject) return ''
      const description = this.$i18n.locale === 'en'
        ? (this.oneProject.description_en || this.oneProject.description || '')
        : (this.oneProject.description_ar || this.oneProject.description || '')
      return sanitizeHtml(description)
    },
    projectCreatorDisplayName() {
      if (!this.oneProject) return ''
      return this.$i18n.locale === 'en'
        ? (this.oneProject.created_by_en || this.oneProject.created_by || '')
        : (this.oneProject.created_by_ar || this.oneProject.created_by || '')
    },
    assignedMembers() {
      return this.members || []
    },
    projectTeamProgress() {
      return summarizeProjectTeamProgress(this.oneProject || {})
    },
    projectEvents() {
      const flatten = (events) => (events || []).reduce((items, event) => {
        items.push(event)
        return items.concat(flatten(event.children))
      }, [])
      return flatten(this.oneProject && this.oneProject.events)
    },
    visibleTasks() {
      return (this.oneProject && this.oneProject.tasks || []).slice(0, this.visibleTaskCount)
    },
    projectStatus() {
      return [
        { name: this.$t('New'), value: 'NEW' },
        { name: this.$t('In Progress'), value: 'IN_PROGRESS' },
        { name: this.$t('Finished'), value: 'FINISHED' },
        { name: this.$t('Postponed'), value: 'POSTPONED' },
      ]
    },
    projectMentionMembers() {
      const byId = {}
      const push = (list) => {
        ;(list || []).forEach((member) => {
          if (!member || member.id == null) return
          byId[String(member.id)] = {
            id: member.id,
            name: member.name,
            image: member.image,
          }
        })
      }
      push(this.oneProject && this.oneProject.members)
      push(this.members)
      return Object.values(byId)
    },
    dragOptions() {
      return {
        animation: 200,
        group: "description",
        disabled: false,
        ghostClass: "ghost"
      };
    }
  },
  mounted() {
    // this.dialogEvent = true
  },
}
</script>
<style lang="scss" scoped>
@import "@/assets/css/variables.scss";
.showProject {
  color: $text-primary;
  padding-bottom: 40px;
}

::v-deep > .container {
  max-width: 1320px;
}

::v-deep .app-page-header__title {
  font-size: 24px;
  line-height: 1.35;
}

.project-hero {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  background: $surface;
  border: 1px solid $border;
  border-radius: 10px;
  min-height: 106px;
  padding: 18px 22px;
  margin-bottom: 16px;

  &__identity {
    display: flex;
    align-items: center;
    gap: 16px;
    min-width: 0;
    flex: 1 1 280px;
  }

  &__avatar {
    position: relative;
    width: 68px;
    height: 68px;
    border-radius: 50%;
    overflow: hidden;
    flex-shrink: 0;
    background: $surface-secondary;
    border: 1px solid $border;
    display: block;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

  }

  &__copy {
    min-width: 0;
  }

  &__names {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }

  &__name {
    font-size: 22px;
    line-height: 28px;
    font-weight: 600;
    color: $text-primary;
    cursor: pointer;
  }

  &__ticket {
    display: inline-flex;
    align-items: center;
    height: 22px;
    padding: 0 8px;
    border-radius: 6px;
    background: $primary-soft;
    color: $primary;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
  }

  &__dates {
    display: flex;
    align-items: center;
    gap: 6px;
    margin: 8px 0 0;
    color: $text-secondary;
    font-size: 13px;
    line-height: 20px;

    .mdi {
      font-size: 16px;
    }
  }

  &__teams {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    flex: 0 1 360px;
    min-width: 0;
    gap: 14px;
    margin-inline-start: auto;
  }
}

.project-hero__team {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex: 0 1 70px;
  min-width: 0;

  > span {
    color: $text-secondary;
    font-size: 12px;
    line-height: 1.5;
    text-align: center;
  }
}

.project-tasks-empty {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border: 1px dashed $border-strong;
  border-radius: 9px;
  background: $surface-secondary;

  > .mdi { color: $primary; font-size: 24px; }
  strong { font-size: 13px; }
  p { margin: 3px 0 0; color: $text-secondary; font-size: 11px; }
}

.project-meta {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 20px;

  &__card {
    background: $surface;
    border: 1px solid $border;
    border-radius: 10px;
    min-height: 98px;
    padding: 16px 18px;
    min-width: 0;

    p {
      margin: 0 0 8px;
      font-size: 13px;
      font-weight: 500;
      color: $text-secondary;
    }

      h4 {
        margin: 0;
        font-size: 15px;
        font-weight: 600;
        color: $text-primary;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

    }
  }

.project-assignees {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  &__row {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
    flex: 1 1 180px;
    max-width: 260px;
    margin: 0;
    padding: 8px 10px;
    border: 1px solid $border;
    border-radius: 8px;
    background: $primary-soft;
    border-color: $primary;
    cursor: default;
  }

  &__avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
    background: $surface-secondary;
  }

  &__name {
    flex: 1;
    min-width: 0;
    font-size: 14px;
    font-weight: 500;
    color: $text-primary;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__check {
    flex: 0 0 auto;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: $primary;
    color: #fff;
    font-size: 14px;
    line-height: 1;
  }

  &__empty {
    margin: 0;
    color: $text-secondary;
    font-size: 13px;
  }
}

.project-assignees-card {
  padding: 18px 20px;
  margin-bottom: 20px;
  background: $surface;
  border: 1px solid $border;
  border-radius: 10px;

  .project-card__head {
    margin-bottom: 12px;
  }
}

.project-section-heading,
.project-section-heading__title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.project-section-heading {
  justify-content: space-between;
  margin-bottom: 12px;

  h3 {
    margin: 0;
    color: $text-primary;
    font-size: 16px;
    font-weight: 600;
  }
}

.project-section-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  border-radius: 999px;
  background: $primary-soft;
  color: $primary;
  font-size: 11px;
  font-weight: 600;
}

.project-content-section,
.project-task-section {
  margin-bottom: 16px;
}

.project-content-section > .project-card {
  margin-bottom: 0;
}

.project-attachments-list {
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  > .attachment {
    width: min(100%, 390px);
    gap: 12px;

    .attachment__preview img,
    .attachment__preview video { width: 60px; height: 60px; }
    .attachment__preview--missing { width: 60px; height: 60px; }
    .detailsAttachment { flex-basis: 120px; }
  }
}

.project-notes-list {
  border: 0;
  border-radius: 0;
  overflow: visible;

  ::v-deep .v-expansion-panel {
    background: transparent;
    box-shadow: none;
  }

  ::v-deep .v-expansion-panel-header {
    min-height: 44px;
    padding: 0 12px;
    color: $text-primary;
    font-size: 13px;
    text-align: start;
  }

  ::v-deep .v-expansion-panel-header__icon {
    transform: none;
  }

  ::v-deep .v-expansion-panel--active .v-expansion-panel-header__icon {
    transform: rotate(90deg);
  }

  ::v-deep .v-expansion-panel-content__wrap {
    padding: 0 16px 16px;
  }
}

.project-comments {
  margin-top: 20px;

  .project-section-heading {
    align-items: flex-start;
    margin-bottom: 16px;

    p {
      margin: 4px 0 0;
      color: $text-secondary;
      font-size: 12px;
    }
  }

  &__list {
    display: grid;
    gap: 16px;
    margin-bottom: 18px;
  }

  &__item {
    display: flex;
    align-items: flex-start;
    gap: 10px;

    > img {
      width: 34px;
      height: 34px;
      flex: 0 0 34px;
      border-radius: 50%;
      object-fit: cover;
    }

    > div { min-width: 0; flex: 1; }
    p { margin: 6px 0 0; color: $text-primary; font-size: 13px; line-height: 1.6; }
  }

  &__meta {
    display: flex;
    align-items: baseline;
    gap: 10px;

    strong { color: $text-primary; font-size: 13px; }
    time { color: $text-secondary; font-size: 11px; }
  }

  &__form {
    display: flex;
    align-items: stretch;
    flex-direction: column;
    gap: 8px;

    .v-input { width: 100%; }
    .btn { align-self: flex-start; }
  }
}

.project-section-empty {
  margin: 0;
  padding: 18px;
  border: 1px dashed $border-strong;
  border-radius: 9px;
  color: $text-secondary;
  font-size: 13px;
  text-align: center;
}

.project-links-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;

  .project-link {
    min-width: 0;
    margin: 0;
    padding: 12px;
    gap: 10px;

    .project-link__preview {
      width: 56px;
      height: 56px;
    }

    .detailsAttachment {
      flex-basis: 120px;
    }
  }
}

.project-task-item {
  margin-bottom: 8px;
  overflow: hidden;
  border: 1px solid $border;
  border-radius: 9px;
  background: $surface;
}

.project-task-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto auto auto;
  align-items: center;
  gap: 12px;
  min-height: 62px;
  padding: 10px 12px;
  cursor: default;

  &__name {
    display: flex;
    align-items: center;
    gap: 9px;
    min-width: 0;

    > div { display: grid; gap: 5px; min-width: 0; }
    strong { overflow: hidden; color: $text-primary; font-size: 13px; font-weight: 600; text-overflow: ellipsis; white-space: nowrap; }
  }

  &__avatar {
    width: 24px;
    height: 24px;
    flex: 0 0 24px;
    border-radius: 50%;
    object-fit: cover;
  }

  &__deadline { display: inline-flex; align-items: center; gap: 5px; color: $text-secondary; font-size: 11px; white-space: nowrap; }

  &__status {
    display: flex;
    align-items: center;
    gap: 8px;
    color: $text-secondary;
    font-size: 11px;
    white-space: nowrap;
  }

  &__count,
  &__badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    min-height: 24px;
    padding: 4px 9px;
    border-radius: 999px;
  }

  &__count {
    background: $surface-secondary;
    color: $text-secondary;
  }

  &__badge {
    background: $primary-soft;
    color: $primary;

    &.is-done { background: $surface-secondary; color: $text-secondary; }
  }

  &__view {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    min-width: 48px;
    height: 40px;
    min-height: 40px;
    padding: 0 8px;
    border: 1px solid $primary;
    border-radius: 8px;
    background: $primary;
    color: $on-primary !important;
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;

    &:hover { background: $primary-hover; color: $on-primary !important; }
  }
}

.project-tasks-more {
  display: block;
  margin: 10px 0 0 auto;
  padding: 5px 0;
  border: 0;
  background: transparent;
  color: $primary;
  font-size: 12px;
  cursor: pointer;
}

.project-layout {
  margin-top: 4px;
}

.project-card {
  background: $surface;
  border: 1px solid $border;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: none;

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 16px;

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: $text-primary;
    }
  }

  &__body {
    color: $text-secondary;
    font-size: 14px;
    line-height: 1.6;
    overflow-wrap: anywhere;

    ::v-deep p:last-child {
      margin-bottom: 0;
    }
  }
}

.project-link {
  a {
    color: inherit;
    text-decoration: none;
  }

  h3 a:hover {
    text-decoration: underline;
  }

  &__preview {
    width: 88px;
    height: 88px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    border: 1px solid $border;
    background: rgba(15, 118, 110, 0.08);
    color: $primary;

    .mdi {
      font-size: 32px;
    }
  }
}

.attachment {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;

  &__preview {
    flex-shrink: 0;

    img,
    video {
      width: 88px;
      height: 88px;
      object-fit: cover;
      border-radius: 8px;
      border: 1px solid $border;
      display: block;
    }

    &--missing {
      width: 88px;
      height: 88px;
      display: grid;
      place-items: center;
      border: 1px dashed $border;
      border-radius: 8px;
      color: $text-secondary;

      .v-icon {
        font-size: 32px;
      }
    }
  }
}

.detailsAttachment {
  flex: 1 1 180px;
  min-width: 0;

  h3 {
    margin: 0 0 6px;
    font-size: 15px;
    font-weight: 600;
    color: $text-primary;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  span {
    display: block;
    font-size: 12px;
    color: $text-secondary;
    line-height: 18px;
  }
}

.attachment-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  width: auto;
  margin-inline-start: auto;

  .btn-edit,
  .btn-delete {
    flex: 0 0 auto;
    max-width: none;
  }
}

.project-event {
  h3 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
  }

  &__body {
    margin: 0 -16px;
    padding: 12px 16px 16px;
    background: $surface-secondary;
    color: $text-secondary;
    font-size: 13px;

    ::v-deep ul,
    ::v-deep ol {
      margin: 0;
      padding-inline-start: 20px;
    }

    ::v-deep li + li {
      margin-top: 4px;
    }
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 12px;
  }
}

.task-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 16px;

  &__content {
    flex: 1;
    min-width: 0;

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      overflow-wrap: anywhere;
    }
  }

  &__desc {
    margin-top: 8px;
    color: $text-secondary;
    font-size: 14px;
    overflow-wrap: anywhere;
  }

  &__deadline {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin: 10px 0 0;
    font-size: 13px;
    color: $text-secondary;

    .mdi {
      font-size: 16px;
    }
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    flex-shrink: 0;
  }

  .btn-delete,
  .btn-edit {
    flex-shrink: 0;
  }
}

.task-footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  p {
    margin: 0;
    color: $text-secondary;
    font-size: 13px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
}

.project-aside {
  position: sticky;
  top: 80px;
  background: $surface;
  border: 1px solid $border;
  border-radius: 10px;
  padding: 16px;

  h3 {
    margin: 0 0 12px;
    font-size: 14px;
    font-weight: 600;
    color: $text-primary;
  }

  &__btn {
    display: flex;
    align-items: center;
    gap: 10px;
    border-color: rgba(59, 130, 246, 0.35);
    width: 100%;
    margin: 0 0 8px;
    padding: 10px 12px;
    border: 1px solid $border;
    border-radius: 8px;
    background: $surface;
    color: $text-primary;
    font-size: 14px;
    font-weight: 500;
    text-align: start;
    cursor: pointer;
    transition: background $ownTransition, border-color $ownTransition;

    .mdi {
      font-size: 18px;
      color: $primary;
    }

    &:hover {
      background: $primary-soft;
      border-color: $primary;
    }
  }
}

.subtask-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;

  #checklist {
    flex: 1;
    min-width: 0;
  }
}

.subtask-add-form {
  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 8px;
  }
}

.list-group {
  padding: 0;
  margin: 0;
}

.list-group-item {
  list-style: none;
  margin-bottom: 12px;
  padding: 12px 14px;
  background: $surface-secondary;
  border: 1px solid $border;
  border-radius: 8px;
}

.task-subtask-list .list-group-item {
  display: block;
  min-height: 0;
  margin-bottom: 8px;
  padding: 10px 12px;
}

.task-subtask-list .subtask-item {
  align-items: center;
  gap: 10px;
}

.task-subtask-list .subtask-checklist {
  display: grid;
  grid-template-columns: 18px minmax(0, 1fr);
  align-items: start;
  gap: 10px;
  width: 100%;
  min-width: 0;
}

.subtask-checklist input[type="checkbox"] {
  appearance: none;
  -webkit-appearance: none;
  position: relative;
  display: block;
  width: 18px;
  height: 18px;
  margin: 2px 0 0;
  border: 1px solid $border-strong;
  border-radius: 5px;
  background: $surface;
  cursor: pointer;
}

.subtask-checklist input[type="checkbox"]::before,
.subtask-checklist input[type="checkbox"]::after {
  content: none;
  display: none;
  animation: none;
}

.subtask-checklist input[type="checkbox"]:checked {
  border-color: $primary;
  background: $primary;
}

.subtask-checklist input[type="checkbox"]:checked::after {
  content: '';
  display: block;
  position: absolute;
  top: 2px;
  left: 5px;
  width: 5px;
  height: 9px;
  border: solid #fff;
  border-width: 0 2px 2px 0;
  border-radius: 0;
  background: transparent;
  transform: rotate(45deg);
}

.subtask-checklist__label {
  display: block;
  position: static;
  width: 100%;
  min-width: 0;
  margin: 0;
  color: $text-primary;
  cursor: pointer;
  transition: none;
}

.subtask-checklist__label::before,
.subtask-checklist__label::after {
  content: none;
  display: none;
}

.subtask-checklist input[type="checkbox"]:checked + .subtask-checklist__label {
  color: $text-secondary;
  animation: none;
}

.subtask-checklist__content { display: block; min-width: 0; }
.subtask-checklist__name { display: block; overflow-wrap: anywhere; }
.subtask-checklist__description {
  margin: 4px 0 0;
  color: $text-muted;
  font-size: 12px;
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.form-control {
  width: 100%;
  max-width: 280px;
  padding: 8px 10px;
  border: 1px solid $border;
  border-radius: 8px;
  background: $surface;
  color: $text-primary;
  font-size: 14px;
}

::v-deep .task-comments,
::v-deep .task-checklist,
::v-deep .task-meta-panel {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid $border;

  h4 {
    font-size: 13px;
    font-weight: 600;
    margin: 0 0 10px;
    color: $text-primary;
  }
}

.milestones-wrap {
  margin-top: 0;
}

@media (max-width: 1100px) {
  .project-layout > .v-col {
    flex: 0 0 100%;
    max-width: 100%;
  }

  .project-meta {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .project-links-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .project-aside {
    position: static;
  }

}

@media (max-width: 600px) {
  .project-card {
    padding: 16px;
  }

  .project-hero {
    padding: 16px;

    &__teams { flex: 1 1 100%; min-width: 0; margin-inline-start: 0; }
    &__identity { flex-basis: 100%; }
    &__avatar { width: 64px; height: 64px; }
    &__name { font-size: 18px; line-height: 24px; }
    &__dates { align-items: flex-start; font-size: 12px; }
    &__date-range { min-width: 0; overflow-wrap: anywhere; }
  }

  .project-meta {
    grid-template-columns: 1fr;
  }

  .project-links-grid {
    grid-template-columns: 1fr;
  }

  .project-assignees-card {
    padding: 16px;
  }

  .project-comments__form .btn { align-self: stretch; }

  .project-task-row {
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 8px 12px;

    &__name { grid-column: 1; grid-row: 1; }
    &__deadline { grid-column: 1 / -1; grid-row: 2; }
    &__status {
      grid-column: 1 / -1;
      grid-row: 3;
      flex-wrap: wrap;
    }
    &__view { grid-column: 2; grid-row: 1; }
  }

  .attachment-actions {
    width: 100%;
    margin-inline-start: 0;

    .btn {
      flex: 1;
    }
  }

  .task-head {
    flex-direction: column;
    gap: 10px;

    &__actions {
      width: 100%;
      flex-shrink: 1;

      .btn {
        flex: 1 1 auto;
      }
    }
  }

}

.checkmark {
  display: block;
  width: 30px;
  height: 30px;
  background-color: $surface-secondary;
  border-radius: 6px;
  position: relative;
  transition: background-color 0.4s;
  overflow: hidden;
  cursor: pointer;
}

.check:checked~.checkmark {
  background-color: #{$primary};
}

.checkmark::after {
  content: "";
  position: absolute;
  width: 5px;
  height: 10px;
  border-right: 3px solid $on-primary;
  border-bottom: 3px solid $on-primary;
  top: 44%;
  left: 50%;
  transform: translate(-50%, -50%) rotateZ(40deg) scale(10);
  opacity: 0;
  transition: all 0.4s;
}

.check:checked~.checkmark::after {
  opacity: 1;
  transform: translate(-50%, -50%) rotateZ(40deg) scale(1);
}

.subtack {
  ul {
    list-style: none;
  }
}

#checklist {
  --background: #{$bg-surface};
  --text: #{$deep};
  --check: #{$primary-blue};
  --disabled: #{$sand};
  --border-radius: 10px;

  width: 100px;
  width: fit-content;

  display: grid;
  grid-template-columns: 30px auto;
  align-items: center;
  /* justify-content: center;*/
}

#checklist label {
  color: var(--text);
  position: relative;
  cursor: pointer;
  display: grid;
  align-items: center;
  width: fit-content;
  transition: color 0.3s ease;
  margin-right: 20px;
}

#checklist label::before,
#checklist label::after {
  content: "";
  position: absolute;
}

#checklist label::before {
  height: 2px;
  width: 8px;
  left: -27px;
  background: var(--check);
  border-radius: 2px;
  transition: background 0.3s ease;
}

#checklist label:after {
  height: 4px;
  width: 4px;
  top: 8px;
  left: -25px;
  border-radius: 50%;
}

#checklist input[type="checkbox"] {
  -webkit-appearance: none;
  -moz-appearance: none;
  position: relative;
  height: 15px;
  width: 15px;
  outline: none;
  border: 0;
  margin: 0 15px 0 0;
  cursor: pointer;
  background: var(--background);
  display: grid;
  align-items: center;
  margin-right: 20px;
}

#checklist input[type="checkbox"]::before,
#checklist input[type="checkbox"]::after {
  content: "";
  position: absolute;
  height: 2px;
  top: auto;
  background: var(--check);
  border-radius: 2px;
}

#checklist input[type="checkbox"]::before {
  width: 0px;
  right: 60%;
  transform-origin: right bottom;
}

#checklist input[type="checkbox"]::after {
  width: 0px;
  left: 40%;
  transform-origin: left bottom;
}

#checklist input[type="checkbox"]:checked::before {
  animation: check-01 0.4s ease forwards;
}

#checklist input[type="checkbox"]:checked::after {
  animation: check-02 0.4s ease forwards;
}

#checklist input[type="checkbox"]:checked+label {
  color: var(--disabled);
  animation: move 0.3s ease 0.1s forwards;
}

#checklist input[type="checkbox"]:checked+label::before {
  background: var(--disabled);
  animation: slice 0.4s ease forwards;
}

#checklist input[type="checkbox"]:checked+label::after {
  animation: firework 0.5s ease forwards 0.1s;
}

@keyframes move {
  50% {
    padding-left: 8px;
    padding-right: 0px;
  }

  100% {
    padding-right: 4px;
  }
}

@keyframes slice {
  60% {
    width: 100%;
    left: 4px;
  }

  100% {
    width: 100%;
    left: -2px;
    padding-left: 0;
  }
}

@keyframes check-01 {
  0% {
    width: 4px;
    top: auto;
    transform: rotate(0);
  }

  50% {
    width: 0px;
    top: auto;
    transform: rotate(0);
  }

  51% {
    width: 0px;
    top: 8px;
    transform: rotate(45deg);
  }

  100% {
    width: 5px;
    top: 8px;
    transform: rotate(45deg);
  }
}

@keyframes check-02 {
  0% {
    width: 4px;
    top: auto;
    transform: rotate(0);
  }

  50% {
    width: 0px;
    top: auto;
    transform: rotate(0);
  }

  51% {
    width: 0px;
    top: 8px;
    transform: rotate(-45deg);
  }

  100% {
    width: 10px;
    top: 8px;
    transform: rotate(-45deg);
  }
}

@keyframes firework {
  0% {
    opacity: 1;
    box-shadow: 0 0 0 -2px #{$terracotta}, 0 0 0 -2px #{$terracotta}, 0 0 0 -2px #{$terracotta}, 0 0 0 -2px #{$terracotta}, 0 0 0 -2px #{$terracotta}, 0 0 0 -2px #{$terracotta};
  }

  30% {
    opacity: 1;
  }

  100% {
    opacity: 0;
    box-shadow: 0 -15px 0 0px #{$terracotta}, 14px -8px 0 0px #{$terracotta}, 14px 8px 0 0px #{$terracotta}, 0 15px 0 0px #{$terracotta}, -14px 8px 0 0px #{$terracotta}, -14px -8px 0 0px #{$terracotta};
  }
}

.btn-add-attachment {
  background-color: $surface;
  color: $primary;
  border: 1px solid $border;
  cursor: pointer;
  padding: 8px 16px;
  display: block;
  width: auto;
  margin: 16px auto;
  text-align: center;
  border-radius: 8px;
  transition: background $ownTransition;

  &:hover {
    background-color: $primary-soft !important;
    color: $primary;
  }
}

.detailsAttachment {
  h3 {
    width: 20ch;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

  }
}
</style>
