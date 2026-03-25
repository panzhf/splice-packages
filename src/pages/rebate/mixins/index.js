export default {
  props: {
    value: Boolean,
    info: {
      type: Object,
      default: () => {}
    }
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
