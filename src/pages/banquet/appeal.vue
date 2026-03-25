<template>
  <view class="page-appeal" :style="themeVars">
    <view v-if="step === 0" class="tip fs-28 text-center">申诉机会仅有1次，请确定补充资料无误后发起申诉。</view>
    <BaseStep :current="step" :list="steps" />
    <view class="apply-container">
      <template v-if="mode === 1">
        <view class="result-box flex flex-middle flex-column">
          <view class="icon" :class="statusInfo.icon" />
          <view class="text fs-32 fw-bold mt-40">{{ statusInfo.text }}</view>
          <view v-if="statusInfo.desc" class="desc mt-20 fs-24">{{ statusInfo.desc }}</view>
        </view>
        <view class="list-box mt-30 fs-28">
          <view class="item flex flex-middle">
            <view class="label shrink-0">申诉订单：</view>
            {{ orderId }}
          </view>
          <view class="item flex flex-middle">
            <view class="label shrink-0">申诉时间：</view>
            {{ info.createdtime }}
          </view>
          <view class="item flex">
            <view class="label shrink-0">申诉原因：</view>
            <view>{{ form.remark }}</view>
          </view>
          <view v-if="form.pictures.length" class="item flex mt-20">
            <view class="label shrink-0">照片：</view>
            <view class="flex-wrap">
              <image
                v-for="(item, index) in form.pictures"
                :key="index"
                :src="item"
                mode="aspectFill"
                class="img"
                @tap="handlePreview(item)"
              />
            </view>
          </view>
          <!-- #ifdef MP-SALE -->
          <view v-if="info.auditidea" class="item flex">
            <view class="label shrink-0">申诉审核意见：</view>
            <view>{{ info.auditidea }}</view>
          </view>
          <!-- #endif -->
        </view>
      </template>
      <template v-else>
        <view class="order-num pb-30">申诉订单：{{ orderId }}</view>
        <view class="mt-30">
          <view class="title fs-30 flex flex-middle mb-20">
            <text class="is-required">*</text>
            申诉原因
          </view>
          <textarea
            :value="form.remark"
            maxlength="500"
            placeholder="请输入申诉原因"
            class="textarea"
            placeholder-style="color: #aaa"
            @input="onRemark"
            @blur="onRemark"
          />
          <view class="count text-right pb-30 fs-24">{{ form.remark.length }}/500</view>
        </view>
        <view class="mt-30">
          <view class="title fs-30 flex flex-middle mb-20">
            照片
            <text class="fs-24 upload-tip">（限60张）</text>
          </view>
          <UploadImages v-model="form.pictures" :max-length="60" size="100" multiple />
        </view>
        <view style="height: 110rpx" />
        <button class="primary-btn round size-small" hover-class="button-action" @tap="handleSubmit">确定申诉</button>
      </template>
    </view>
  </view>
</template>

<script>
import { apiOrderAppeal, apiGetAppealRecord } from 'packages/api/banquet'
import BaseStep from './components/base-step'
import UploadImages from 'packages/components/upload/upload'
import { previewImage } from 'packages/utils'
import dayjs from 'dayjs'
// #ifndef MP-RETAIL
import { notThemeMixin } from 'packages/mixins/not-theme.js'
// #endif
export default {
  name: 'Appeal',
  components: { BaseStep, UploadImages },
  mixins: [
    // #ifndef MP-RETAIL
    notThemeMixin
    // #endif
  ],
  data() {
    return {
      mode: 0, // 0.申诉表单填写 1.申诉结果
      orderId: 0,
      step: 0,
      steps: ['发起申诉', '等待审核', '结果反馈'],
      info: {
        status: -1, // 0.报名审核 1.审核通过 2.审核不通过
        createdtime: '',
        cause: '', // 不通过原因
        auditidea: '' // 申诉审核意见
      },
      form: {
        remark: '',
        pictures: []
      },
      busy: false
    }
  },
  computed: {
    statusInfo() {
      const m = {
        0: {
          text: '申诉已发起成功，请耐心等待',
          icon: 'mdfont icon-dengdai'
        },
        1: {
          text: '申诉通过',
          icon: 'iconfont iconpack-gou',
          desc: '申诉通过后，系统会执行发奖操作，请稍后在订单详情中查看奖品发放情况。'
        },
        2: {
          text: '申诉不通过',
          icon: 'iconfont icon-duihuan-fail',
          desc: this.info.cause
        }
      }
      return m[this.info.status]
    }
  },
  onLoad(options) {
    options.mode && (this.mode = +options.mode)
    this.orderId = +options.orderid
    if (this.mode === 1) {
      this.getInfo()
    }
  },
  methods: {
    getInfo() {
      apiGetAppealRecord({ orderid: this.orderId }).then(res => {
        if (this.$ck(res)) {
          const { status, remark, createdtime, cause, picturesjson, auditidea } = res.return_data
          this.info = {
            status,
            createdtime,
            cause,
            auditidea,
          }
          this.form = {
            remark,
            pictures: JSON.parse(picturesjson || '[]')
          }
          if ([1, 2].includes(status)) {
            this.step = 2
          } else if (status === 0) {
            this.step = 1
          }
        }
      })
    },
    onRemark(e) {
      const v = e.detail.value || ''
      // 部分机型输入法粘贴还是能超过限制，因此才截取
      this.form.remark = v.trim().slice(0, 500)
    },
    async handleSubmit() {
      if (!this.form.remark) {
        return this.$msg('请输入申诉原因')
      }
      this.busy = true
      try {
        const res = await apiOrderAppeal({
          orderid: this.orderId,
          remark: this.form.remark,
          picturesjson: this.form.pictures,
          flag: 1
        })
        if (this.$ck(res)) {
          this.mode = 1
          this.info.status = 0
          this.step = 1
          this.info.createdtime = dayjs().format('YYYY-MM-DD HH:mm:ss')
        }
      } finally {
        this.busy = false
      }
    },
    handlePreview(url) {
      previewImage({ current: url, urls: this.form.pictures })
    }
  }
}
</script>

<style lang="scss" scoped>
$prefix: page-appeal;
.#{$prefix} {
  /* #ifdef MP-SALE */
  min-height: 100vh;
  background-color: #f6f7fc;
  /* #endif */
  .tip {
    @include lh(68rpx);
    font-weight: 500;
    /* #ifdef MP-RETAIL */
    background: #fff5f1;
    color: #ff7640;
    /* #endif */
    /* #ifdef MP-SALE */
    background: rgba(255, 150, 13, 0.1);
    color: #ff960d;
    /* #endif */
  }
  .apply-container {
    margin: 0 20rpx;
    padding: 30rpx;
    border-radius: 10rpx;
    background-color: #fff;
    .order-num,
    .count,
    .result-box {
      border-bottom: 1rpx solid #e5e5e5;
    }
    .title,
    .desc,
    .list-box .item {
      color: #666;
    }
    .is-required {
      margin-right: 5rpx;
      color: #dd2726;
    }
    .textarea {
      @include wh(100%, 400rpx);
    }
    .count,
    .upload-tip {
      color: #aaa;
    }
  }
  .result-box {
    padding: 120rpx 30rpx;
    .icon {
      font-size: 60rpx;
      color: #57b669;
      &.icon-duihuan-fail {
        color: #ff7640;
      }
    }
    .desc {
      line-height: 36rpx;
    }
  }
  .list-box {
    .item {
      line-height: 48rpx;
    }
    .label {
      width: 200rpx;
    }
    .img {
      @include wh(80rpx);
      margin-right: 10rpx;
      margin-bottom: 10rpx;
    }
  }
  .primary-btn {
    position: fixed;
    left: 30rpx;
    right: 30rpx;
    bottom: 30rpx;
  }
}
</style>
