<template>
  <div class="showProject">
    <v-container v-if="loading">
      <app-skeleton type="page" />
    </v-container>
    <v-container v-else-if="oneProject">
      <page-header
        :breadcrumb="$t('Current Projects')"
        title=""
      >
        <nuxt-link :to="localePath('/projects')" class="btn btn-view">{{ $t('Back') }}</nuxt-link>
        <nuxt-link
          :to="localePath(`/projects/edit/${oneProject.id}`)"
          class="btn btn-edit"
        >{{ $t('Edit Project') }}</nuxt-link>
        <button
          class="btn btn-delete"
          @click.prevent="deleteDialogMethod('project', oneProject.id)"
        >{{ $t('Delete Project') }}</button>
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

        <div class="project-hero__progress">
          <div class="project-hero-progress__heading">
            <span>{{ $t('Project Progress') }}</span>
            <strong>{{ projectProgressSummary.percent }}%</strong>
          </div>
          <v-progress-linear
            :value="projectProgressSummary.percent"
            height="10"
            rounded
            color="primary"
            background-color="#E9EFED"
          />
          <span class="project-hero-progress__caption">
            <template v-if="projectProgressSummary.totalItems">
              {{ $t('Progress is based on task completion') }}
            </template>
            <template v-else-if="oneProject.status === 'FINISHED'">{{ $t('Marked as completed') }}</template>
            <template v-else>{{ $t('No tasks yet') }}</template>
          </span>
        </div>
      </section>

      <div class="project-meta detailsAboutPerson">
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

        <article class="project-meta__card project-meta__card--assignees">
          <p>{{ $t('Assigned To') }}</p>
          <div class="project-assignees">
            <div
              v-for="item in assignedMembers"
              :key="item.id"
              class="project-assignees__row"
            >
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
        </article>
      </div>

      <section class="project-progress-overview">
        <div class="project-progress-overview__stats">
          <article class="project-progress-stat">
            <span class="mdi mdi-format-list-checks" aria-hidden="true"></span>
            <div><strong>{{ projectProgressSummary.totalTasks }}</strong><span>{{ $t('Total Tasks') }}</span></div>
          </article>
          <article class="project-progress-stat">
            <span class="mdi mdi-check-circle-outline" aria-hidden="true"></span>
            <div><strong>{{ projectProgressSummary.completedTasks }}</strong><span>{{ $t('Completed Tasks') }}</span></div>
          </article>
          <article class="project-progress-stat">
            <span class="mdi mdi-progress-clock" aria-hidden="true"></span>
            <div><strong>{{ projectProgressSummary.inProgressTasks }}</strong><span>{{ $t('Tasks in progress') }}</span></div>
          </article>
        </div>
        <div class="project-progress-overview__tasks">
          <div class="project-progress-overview__tasks-heading">
            <h3>{{ $t('Tasks') }}</h3>
            <button
              type="button"
              class="btn btn-create"
              @click.prevent="openCreateTask"
            >{{ $t('Add Task') }}</button>
          </div>
          <div v-if="oneProject.tasks && oneProject.tasks.length" class="project-task-summary-list">
            <article v-for="task in oneProject.tasks" :key="`summary-${task.id}`" class="project-task-summary">
              <div class="project-task-summary__heading">
                <span>{{ localizedContent(task, 'name') }}</span>
                <strong>{{ taskProgress(task).percent }}%</strong>
              </div>
              <v-progress-linear :value="taskProgress(task).percent" height="6" rounded color="primary" />
              <small v-if="taskProgress(task).hasSubtasks">{{ taskProgress(task).completedItems }} {{ $t('of') }} {{ taskProgress(task).totalItems }} {{ $t('Subtasks completed') }}</small>
              <small v-else-if="taskProgress(task).percent === 100">{{ $t('Finished') }}</small>
              <small v-else-if="taskProgress(task).percent > 0">{{ $t('In Progress') }}</small>
              <small v-else>{{ $t('Not Started') }}</small>
            </article>
          </div>
          <div v-else class="project-tasks-empty">
            <span class="mdi mdi-clipboard-text-outline" aria-hidden="true"></span>
            <div>
              <strong>{{ $t('No tasks yet') }}</strong>
              <p>{{ $t('Add a task to start tracking project progress.') }}</p>
            </div>
          </div>
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
              <v-btn
                class="btn btn-delete"
                @click.prevent="deleteDialogMethod('link', projectLink.id)"
              >
                {{ $t('Delete') }}
              </v-btn>
            </div>
          </section>

          <section class="project-card importantEvent">
            <div class="project-card__head">
              <h3>{{ $t('Important Event') }}</h3>
              <button class="btn btn-create" @click="openCreateEventDialog">{{ $t('Add Event') }}</button>
            </div>
            <v-treeview :items="oneProject.events" transition item-text="name" open-on-click>
              <template v-slot:label="{ item }">
                <div class="project-event">
                  <h3>
                    {{ localizedContent(item, 'name') }}
                  </h3>
                  <div v-if="localizedContent(item, 'description')" class="project-event__body">
                    <div v-html="safeHtml(localizedContent(item, 'description'))"></div>
                    <div class="project-event__actions">
                      <v-btn class="btn btn-edit" @click="openEditEventDialog(item)">{{ $t('Edit') }}</v-btn>
                      <v-btn class="btn btn-delete"
                        @click.prevent="deleteDialogMethod('event', item.id)">{{ $t('Delete') }}</v-btn>
                    </div>
                  </div>
                </div>
              </template>
            </v-treeview>
          </section>

          <template >
            <section class="project-card tasks" v-for="(task, index) in (oneProject.tasks || [])" :key="task.id">
              <div class="head task-head">
                <div class="task-head__content">
                  <h3>{{ localizedContent(task, 'name') }}</h3>
                  <div class="task-head__desc" v-html="safeHtml(localizedContent(task, 'description'))"></div>
                  <p v-if="task.deadline_date" class="task-head__deadline">
                    <span class="mdi mdi-calendar-clock"></span>
                    {{ formatProjectDate(task.deadline_date) }}
                    <template v-if="task.deadline_time"> · {{ task.deadline_time }}</template>
                  </p>
                </div>
                <div class="task-head__actions">
                  <button                    class="btn btn-edit"
                    @click.prevent="openEditTask(task)"
                  >
                    {{ $t('Edit') }}
                  </button>
                  <button                    class="btn btn-delete"
                    @click.prevent="deleteDialogMethod('task', task.id)"
                  >
                    {{ $t('Delete') }}
                  </button>
                </div>
              </div>
              <div class="subtack">
                <draggable
                  class="list-group task-subtask-list"
                  tag="ul"
                  v-model="task.subTasks"
                  @change="changeTaskStatus($event, index)"
                  v-bind="dragOptions"                  @start="drag = true"
                  @end="drag = false"
                >
                  <transition-group type="transition" :name="!drag ? 'flip-list' : null">
                    <li class="list-group-item" v-for="(element, index) in task.subTasks" :key="element.id">
                      <div class="subtask-item">
                      <div class="subtask-checklist">
                        <input
                          :value="element.name"                          @change="toogleStatusSubTask($event,element.id, task.id,element.status,task.subTasks.length,task.finished)"
                          name="subtask-status"
                          type="checkbox"
                          :id="'subtask-' + task.id + '-' + element.id"
                          :checked="element.status == 'FINISHED'"
                        >
                        <label class="subtask-checklist__label" :for="'subtask-' + task.id + '-' + element.id">
                          <span class="subtask-checklist__content">
                            <span
                              class="subtask-checklist__name"
                              v-if="!showinputName"
                              @click.prevent="showinputNameMethod($event)"
                            >
                              {{ localizedContent(element, 'name') }}
                            </span>
                            <input
                              type="text"
                              :value="localizedContent(element, 'name')"
                              class="d-none form-control"
                              :placeholder="$t('Name')"
                              required
                              @input="setLocalizedContent(element, 'name', $event.target.value)"
                              @blur="hideNameInput($event, element.id, task.id)"
                            >
                            <p
                              class="subtask-checklist__description"
                              v-if="!showinputDescription"
                              @click.prevent="showinputDescriptionMethod($event)"
                            >{{ localizedContent(element, 'description') }}</p>
                            <input
                              type="text"
                              :value="localizedContent(element, 'description')"
                              class="d-none form-control"
                              :placeholder="$t('Description')"
                              required
                              @input="setLocalizedContent(element, 'description', $event.target.value)"
                              @blur="hideDescInput($event, element.id, task.id)"
                            >
                          </span>
                        </label>
                      </div>
                        <button                          class="btn btn-delete btn-delete--sm"
                          @click.prevent="deleteDialogMethod('subtask', element.id)"
                        >
                          <span class="mdi mdi-trash-can-outline" aria-hidden="true"></span>
                          {{ $t('Delete') }}
                        </button>
                      </div>
                    </li>
                    <li class="list-group-item" v-if="targetCardIndex === index && showSubtaskForm" :key="'add-' + index">
                      <div id="checklist" class="subtask-add-form">
                        <input type="checkbox" name="r" disabled>
                        <label>
                          <i class="glyphicon glyphicon-pushpin"></i>
                          <v-form ref="formSubTask" v-model="validSubTask" lazy-validation>
                            <v-text-field v-model="taskName" :rules="nameRules" :placeholder="$t('Name')" outlined dense required></v-text-field>
                            <v-text-field :placeholder="$t('Details')" v-model="taskDescription" outlined dense required></v-text-field>
                            <div class="subtask-add-form__actions">
                              <v-btn class="btn btn-view" @click.prevent="cancelAddSubTask">
                                {{ $t('Cancel') }}
                              </v-btn>
                              <v-btn :disabled="!validSubTask" class="btn btn-create" @click="addTask(task.id)">
                                {{ $t('Create') }}
                              </v-btn>
                            </div>
                          </v-form>
                        </label>
                      </div>
                    </li>
                  </transition-group>
                </draggable>
                <v-divider class="mt-4 mb-4"></v-divider>
                <div class="task-footer">
                  <p>
                    <span class="mdi mdi-check-circle-outline"></span>
                    {{ $t('Completed') }} {{ task.finished }} {{ $t('of') }} {{ task.subTasks.length }}
                  </p>
                  <v-btn                    class="btn btn-view"
                    @click.prevent="addSubTaskMethod(index)"
                  >+ {{ $t('Add Sub Task') }}</v-btn>
                </div>
                <task-comments
                  :task-id="task.id"
                  :members="projectMentionMembers"
                />
              </div>
            </section>
          </template>
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
            <h3 class="mt-4">{{ $t('Add Link') }}</h3>
            <v-divider class="mt-5 mb-5"></v-divider>
            <v-form ref="addLinkForm" v-model="valid" lazy-validation>
              <label>{{ $t('Paste Ticket link') }}</label>
              <v-text-field class="mb-4" v-model="ticketLink" :rules="ticketLinkRule"
                :placeholder="$t('Paste Ticket link')" hide-details="auto" required></v-text-field>
              <label class="mt-5">{{ $t('Display text') }}</label>
              <v-text-field v-model="displayText" :rules="displayTextRule" :placeholder="$t('Display text')"
                hide-details="auto" required></v-text-field>
              <v-btn
                class="btn btn-create mt-5 mb-5 w-100 d-block"
                :loading="savingLink"
                :disabled="savingLink"
                @click.prevent="addLink()"
              >{{ $t('Add') }}</v-btn>
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
import { summarizeProjectProgress, summarizeTaskProgress } from '~/utils/projectProgress'
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
  methods: {
    safeHtml(value) {
      return sanitizeHtml(value)
    },
    taskProgress(task) {
      return summarizeTaskProgress(task)
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
          this.statusValue = this.oneProject.status
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
    addLink() {
      const form = this.$refs.addLinkForm
      if (form && !form.validate()) return
      if (this.savingLink) return

      this.savingLink = true
      this.$axios.post('/links', {
        project_id: this.$route.params.id,
        description: this.displayText,
        description_ar: this.$i18n.locale === 'ar' ? this.displayText : '',
        description_en: this.$i18n.locale === 'en' ? this.displayText : '',
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
    projectProgressSummary() {
      return summarizeProjectProgress(this.oneProject || {})
    },
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
    projectStatus() {
      return [
        { name: this.$t('New'), value: 'NEW' },
        { name: this.$t('In Progress'), value: 'IN_PROGRESS' },
        { name: this.$t('Finished'), value: 'FINISHED' },
        { name: this.$t('Hold'), value: 'HOLD' },
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

.project-hero {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  background: $surface;
  border: 1px solid $border;
  border-radius: 10px;
  padding: 20px 24px;
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
    width: 88px;
    height: 88px;
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

    &.is-editable {
      cursor: pointer;
    }
  }

  &__avatar-overlay {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(16, 24, 40, 0.4);
    opacity: 0;
    transition: opacity $ownTransition;
    color: #fff;
  }

  &__avatar.is-editable:hover &__avatar-overlay {
    opacity: 1;
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

  &__date-range span {
    cursor: pointer;
  }

  &__progress {
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex: 0 1 300px;
    min-width: 230px;
    margin-inline-start: auto;
  }
}

.project-hero-progress__heading,
.project-progress-overview__tasks-heading,
.project-task-summary__heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.project-hero-progress__heading {
  span {
    font-size: 12px;
    font-weight: 500;
    color: $text-secondary;
  }

  strong { font-size: 20px; color: $primary; }
}

.project-hero-progress__caption {
  color: $text-secondary;
  font-size: 11px;
}

.project-progress-overview {
  display: grid;
  grid-template-columns: minmax(220px, 0.8fr) minmax(0, 1.4fr);
  gap: 20px;
  padding: 18px;
  margin-bottom: 18px;
  border: 1px solid $border;
  border-radius: 12px;
  background: $surface;
  box-shadow: $shadow-sm;

  &__stats {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
  }

  &__tasks {
    min-width: 0;
    padding-inline-start: 18px;
    border-inline-start: 1px solid $border;
  }

  &__tasks-heading {
    margin-bottom: 12px;

    h3 { margin: 0; font-size: 15px; }
    .btn { min-height: 34px !important; padding: 0 12px !important; }
  }
}

.project-progress-stat {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 0;
  padding: 10px;
  border: 1px solid $border;
  border-radius: 9px;
  background: $surface-secondary;

  > .mdi { color: $primary; font-size: 20px; }

  div { display: flex; flex-direction: column; min-width: 0; }
  strong { font-size: 18px; line-height: 1.2; color: $text-primary; }
  span:not(.mdi) { color: $text-secondary; font-size: 10px; line-height: 1.35; }
}

.project-task-summary-list { display: grid; gap: 10px; }

.project-task-summary {
  display: grid;
  gap: 5px;
  min-width: 0;
  padding: 9px 11px;
  border: 1px solid $border;
  border-radius: 8px;

  &__heading {
    span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 12px; }
    strong { flex: 0 0 auto; color: $primary; font-size: 12px; }
  }

  small { color: $text-secondary; font-size: 10px; }
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
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 20px;

  &__card {
    background: $surface;
    border: 1px solid $border;
    border-radius: 10px;
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

      &--assignees {
        grid-column: auto;
      }
    }
  }

.project-assignees {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 8px;

  &__row {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
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
    margin-top: 8px;
    color: $text-secondary;
    font-size: 13px;
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
::v-deep .task-meta-panel,
::v-deep .milestones-panel {
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

  .project-aside {
    position: static;
  }

  .project-progress-overview {
    grid-template-columns: 1fr;

    &__tasks {
      padding-inline-start: 0;
      padding-top: 16px;
      border-inline-start: 0;
      border-top: 1px solid $border;
    }
  }
}

@media (max-width: 600px) {
  .project-card {
    padding: 14px;
  }

  .project-hero {
    padding: 16px;

    &__progress { flex: 1 1 100%; min-width: 0; margin-inline-start: 0; }
    &__identity { flex-basis: 100%; }
    &__avatar { width: 64px; height: 64px; }
    &__name { font-size: 18px; line-height: 24px; }
    &__dates { align-items: flex-start; font-size: 12px; }
    &__date-range { min-width: 0; overflow-wrap: anywhere; }
  }

  .project-meta {
    grid-template-columns: 1fr;
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

  .project-progress-overview__tasks-heading {
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .project-progress-overview { padding: 13px; gap: 14px; }
  .project-progress-overview__stats { grid-template-columns: 1fr 1fr 1fr; gap: 5px; }
  .project-progress-stat { flex-direction: column; align-items: flex-start; padding: 8px; }
  .project-progress-stat strong { font-size: 16px; }
  .project-progress-stat span:not(.mdi) { font-size: 9px; }
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
