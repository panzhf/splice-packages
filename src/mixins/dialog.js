export default {
  props: {
    value: Boolean
  },
  computed: {
    showDialog: {
      get() {
        return this.value
      },
      set(v) {
        this.$emit('input', v)
      }
    }
  },
  methods: {
    close() {
      this.showDialog = false
    }
  }
}
