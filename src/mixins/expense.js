// export expenseTaskMixin from 'packages/mixins/expense'
export default {
  data() {
    return {
      taskId: 0,
      showLoading: false,
      isPending: false
    }
  },
  methods: {
    onPending() {
      this.isPending = true
    },
    onDone() {
      this.isPending = false
    }
  }
}
