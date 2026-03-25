<template>
  <view class="page-logoff">
    <!-- #ifdef MP-GUIDE -->
    <ChooseBrands
      v-show="currentStep === 1"
      @setStep="handleGoStep"
      @reasonBtnBack="getReasonBtnBack"
      @brands="getBrandList"
    />
    <!-- #endif -->
    <reason v-show="currentStep === 2" :show-back="showReasonBtnBack" @setStep="handleGoStep" @reason="getReason" />
    <remind v-show="currentStep === 3" :login-out-rule-no="loginOutRuleNo" @setStep="handleGoStep" />
    <confirm
      v-show="currentStep === 4"
      :brands="choosedBrands"
      :reason="reason"
      @getResult="handleGetResult"
      @setStep="handleGoStep"
    />
    <result v-if="currentStep === 5" :result-data="resultData" />
  </view>
</template>

<script>
// #ifdef MP-GUIDE
import ChooseBrands from './components/choose-brands.vue'
// #endif
import reason from './components/reason.vue'
import remind from './components/remind.vue'
import confirm from './components/confirm.vue'
import result from './components/result.vue'
import ruleConfigMixin from 'packages/utils/rules-config'
export default {
  mixins: [ruleConfigMixin],
  components: {
    // #ifdef MP-GUIDE
    ChooseBrands,
    // #endif
    reason,
    remind,
    confirm,
    result
  },
  data() {
    return {
      /*
      currentStep
      1、选择品牌(会员小程序不需要)
      2、选择原因
      3、重要提醒
      4、确认注销
      5、注销结果
      */
      currentStep: 1,
      showReasonBtnBack: false, // 选择原因页面上一步按钮：非会员小程序&&多个品牌才显示
      choosedBrands: [],
      reason: '',
      resultData: {}
    }
  },
  watch: {
    currentStep(n) {
      if (n === 3) {
        uni.setNavigationBarTitle({
          title: '重要提醒'
        })
      } else {
        uni.setNavigationBarTitle({
          title: '账号注销'
        })
      }
    }
  },
  onLoad() {
    // #ifdef MP-MEMBER
    this.currentStep = 2
    // #endif
  },
  methods: {
    handleGoStep(step) {
      this.currentStep = step
    },
    getReasonBtnBack(e) {
      this.showReasonBtnBack = e
    },
    getBrandList(e) {
      this.choosedBrands = e
    },
    getReason(e) {
      this.reason = e
    },
    handleGetResult(res) {
      this.resultData = res || {}
    }
  }
}
</script>
<style lang="scss">
@import './styles/safe.scss';
.page-logoff {
  min-height: 100vh;
  background-color: #fff;
}
.continue-btn {
  // #ifdef MP-GUIDE
  background: $guideBtnColor;
  color: #9a4802;
  // #endif
  // #ifdef MP-MEMBER
  background: $memberBtnColor;
  color: #fff;
  // #endif
}
.icon-success {
  color: #3daf35;
}
.icon-duihuan-fail {
  color: #ffa200;
}
.icon-checked {
  color: #ff9933;
}
.icon-unchecked {
  color: #cccc;
}
</style>



