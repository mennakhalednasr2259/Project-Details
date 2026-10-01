<template>
  <div class="task-comments mt-3">
    <h4>{{ $t('Task comments') }}</h4>

    <div v-for="c in comments" :key="c.id" class="task-comment mb-2">
      <strong>{{ commentAuthor(c) }}</strong>
      <p class="mb-0" v-html="renderComment(c.comment)"></p>
    </div>

    <div class="task-comments__composer">
      <v-textarea
        ref="commentInput"
        v-model="newComment"
        dense
        outlined
        hide-details
        rows="2"
        :placeholder="$t('Write a comment')"
        @keydown="onCommentKeydown"
        @input="onCommentInput"
      />

      <div
        v-if="mentionOpen && filteredMentionMembers.length"
        class="task-comments__mentions"
      >
        <button
          v-for="member in filteredMentionMembers"
          :key="member.id"
          type="button"
          class="task-comments__mention-item"
          @mousedown.prevent="insertMention(member)"
        >
          <img
            :src="$resolveImage(member.image, require('@/assets/imgs/avatar.png'))"
            :alt="member.name"
          >
          <span>{{ member.name }}</span>
        </button>
      </div>
    </div>

    <v-btn small class="mt-2 btn btn-create" @click="postComment">{{ $t('Post comment') }}</v-btn>
  </div>
</template>

<script>
export default {
  name: 'TaskComments',
  props: {
    taskId: { type: [Number, String], required: true },
    members: { type: Array, default: () => [] },
  },
  data() {
    return {
      comments: [],
      newComment: '',
      mentionOpen: false,
      mentionQuery: '',
      mentionStart: -1,
    }
  },
  computed: {
    filteredMentionMembers() {
      const q = String(this.mentionQuery || '').trim().toLowerCase()
      const list = Array.isArray(this.members) ? this.members : []
      if (!q) return list.slice(0, 8)
      return list
        .filter((member) => String(member.name || '').toLowerCase().includes(q))
        .slice(0, 8)
    },
    membersById() {
      const map = {}
      ;(this.members || []).forEach((member) => {
        if (!member || member.id == null) return
        map[String(member.id)] = member
      })
      return map
    },
  },
  watch: {
    taskId: {
      immediate: true,
      handler() {
        this.loadComments()
      },
    },
  },
  methods: {
    headers() {
      return {
        Authorization: `Bearer ${localStorage.token}`,
        Accept: 'application/json',
        'Accept-Language': this.$i18n.locale,
      }
    },
    escapeHtml(text) {
      return String(text || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
    },
    commentAuthor(comment) {
      if (!comment) return ''
      if (comment.user) return this.$i18n.locale === 'en'
        ? (comment.user.name_en || comment.user.name || '')
        : (comment.user.name_ar || comment.user.name || '')
      return this.$i18n.locale === 'en'
        ? (comment.author_en || comment.author || '')
        : (comment.author_ar || comment.author || '')
    },
    escapeRegExp(text) {
      return String(text || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    },
    renderComment(text) {
      const escaped = this.escapeHtml(text)
      return escaped.replace(/@\[(\d+)\]/g, (match, id) => {
        const member = this.membersById[String(id)]
        const name = member && member.name ? this.escapeHtml(member.name) : match
        return `<span class="task-comments__mention-tag">@${name}</span>`
      })
    },
    serializeComment(text) {
      let out = String(text || '')
      const members = [...(this.members || [])]
        .filter((member) => member && member.id != null && member.name)
        .sort((a, b) => String(b.name).trim().length - String(a.name).trim().length)

      members.forEach((member) => {
        const name = String(member.name).trim()
        if (!name) return
        const re = new RegExp(`@${this.escapeRegExp(name)}(?=\\s|$|[\\n.,!?;:])`, 'g')
        out = out.replace(re, `@[${member.id}]`)
      })

      return out
    },
    onCommentInput() {
      const value = String(this.newComment || '')
      const textarea = this.getTextareaEl()
      const caret = textarea ? textarea.selectionStart : value.length
      const before = value.slice(0, caret)
      const match = before.match(/(^|\s)@([^\s@]*)$/)
      if (!match) {
        this.mentionOpen = false
        this.mentionQuery = ''
        this.mentionStart = -1
        return
      }
      this.mentionOpen = true
      this.mentionQuery = match[2] || ''
      this.mentionStart = caret - (match[2] ? match[2].length + 1 : 1)
    },
    onCommentKeydown(event) {
      if (event.key === 'Escape' && this.mentionOpen) {
        this.mentionOpen = false
        event.preventDefault()
      }
    },
    getTextareaEl() {
      const ref = this.$refs.commentInput
      if (!ref) return null
      return ref.$refs && ref.$refs.input ? ref.$refs.input : null
    },
    insertMention(member) {
      if (!member || member.id == null) return
      const label = String(member.name || '').trim()
      if (!label) return
      const value = String(this.newComment || '')
      const textarea = this.getTextareaEl()
      const caret = textarea ? textarea.selectionStart : value.length
      const start = this.mentionStart >= 0 ? this.mentionStart : caret
      const token = `@${label} `
      this.newComment = `${value.slice(0, start)}${token}${value.slice(caret)}`
      this.mentionOpen = false
      this.mentionQuery = ''
      this.mentionStart = -1
      this.$nextTick(() => {
        const el = this.getTextareaEl()
        if (!el) return
        const pos = start + token.length
        el.focus()
        el.setSelectionRange(pos, pos)
      })
    },
    async loadComments() {
      if (!this.taskId) return
      try {
        const res = await this.$axios.get(`/tasks/${this.taskId}/comments`, { headers: this.headers() })
        this.comments = Array.isArray(res.data) ? res.data : (res.data && res.data.data) || []
      } catch (e) {
        this.comments = []
      }
    },
    async postComment() {
      const comment = this.serializeComment(this.newComment).trim()
      if (!comment) return
      await this.$axios.post(
        `/tasks/${this.taskId}/comments`,
        { comment },
        { headers: this.headers() }
      )
        .then(() => {
          this.newComment = ''
          this.mentionOpen = false
          return this.loadComments()
        })
        .catch((error) => {
          this.$toast.error(error?.response?.data?.message || this.$t('Something went wrong'))
        })
    },
  },
}
</script>

<style lang="scss" scoped>
@import "@/assets/css/variables.scss";
.task-comments {
  position: relative;

  h4 {
    margin: 0 0 10px;
    font-size: 13px;
    font-weight: 600;
  }

  &__composer {
    position: relative;
  }

  &__mentions {
    position: absolute;
    left: 0;
    right: 0;
    bottom: calc(100% + 6px);
    z-index: 5;
    max-height: 220px;
    overflow: auto;
    background: #fff;
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 10px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  }

  &__mention-item {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    border: 0;
    background: transparent;
    text-align: start;
    cursor: pointer;

    &:hover {
      background: rgba(0, 0, 0, 0.04);
    }

    img {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      object-fit: cover;
    }

    span {
      font-size: 13px;
      color: $text-primary;
    }
  }

  &__mention-tag {
    color: $primary;
    font-weight: 600;
  }
}

::v-deep .task-comments__mention-tag {
  color: $primary;
  font-weight: 600;
}

.task-comment {
  border-inline-start: 2px solid $primary;
  padding-inline-start: 12px;
  margin-bottom: 10px;

  strong {
    display: block;
    font-size: 13px;
    color: $text-primary;
  }

  p {
    margin: 4px 0 0;
    font-size: 13px;
    color: $text-secondary;
  }
}
</style>
