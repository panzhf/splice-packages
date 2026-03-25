// import privacyMixin from 'packages/mixins/privacy'
import { compareVersion } from 'packages/utils'
const supportPrivacy = compareVersion('2.32.2')

export default {
  data() {
    return {
      supportPrivacy
    }
  },
  computed: {
    openType() {
      return this.supportPrivacy ? 'getPhoneNumber|agreePrivacyAuthorization' : 'getPhoneNumber'
    }
  }
}
