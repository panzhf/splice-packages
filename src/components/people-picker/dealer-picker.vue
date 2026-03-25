<template>
  <view class="people-picker fs-28">
    <u-popup
      v-model="showPicker"
      mode="bottom"
      border-radius="30"
      safe-area-inset-bottom
      @close="$emit('input', false)"
    >
      <view class="title fs-30 fw-bold tx-c">选择经销商</view>
      <view class="search-box">
        <search-input
          v-model="keywordOri"
          :placeholder="searchPlacehoder"
          :max-length="20"
          :style-type="2"
          custom-style="background: #f5f5f5"
          :btn-style="btnStyle"
          @clearKeyword="handleChange(2)"
          @search="handleChange(2)"
        />
      </view>
      <view v-if="list.length && searchType === 1" class="mb-10 fs-24 ml-40 mt-20 primary-color">
        下列为根据门店定位推荐的经销商
      </view>
      <scroll-view
        class="list"
        :class="multiple ? 'min-h' : ''"
        scroll-y
        scroll-left="120"
        enable-flex
        @scrolltolower="scrollBottom"
      >
        <template v-if="multiple">
          <view
            v-for="(item, index) in list"
            :key="index"
            class="flex flex-middle bd-e pt-30 pb-30"
            @tap="handleCheck(item)"
          >
            <view class="check-box flex flex-center flex-middle">
              <!-- #ifdef MP-SALE || MP-MEMBER-->
              <text class="iconfont fs-40" :class="item.checked ? 'iconchecked checked' : 'iconunchecked unchecked'" />
              <!-- #endif -->
              <!-- #ifdef MP-RETAIL  -->
              <text
                class="iconfont fs-36"
                :class="item.checked ? 'icon-checked checked' : 'icon-unchecked unchecked'"
              />
              <!-- #endif -->
            </view>
            <view class="flex-1 overflow-h">
              <view class="name fs-30 fw-bold">{{ item.dealername }}</view>
              <view class="c-9 fs-24 pt-10">{{ item.fulladdress }}</view>
            </view>
          </view>
        </template>
        <template v-else>
          <view
            v-for="(item, index) in list"
            :key="index"
            class="item flex flex-middle pt-20 pb-20"
            @click="handleSelect(item)"
          >
            <view class="flex-1 overflow-h">
              <view class="name fs-30 fw-bold">{{ item.dealername }}</view>
              <view class="c-9 fs-24 pt-10">{{ item.fulladdress }}</view>
            </view>
            <view v-if="dealerId == item.id" class="fs-28 primary-color mr-20">✔</view>
          </view>
        </template>
        <none-data v-if="!list.length && !busy" :msg="nonMsg" :view-height="560" :icon="nonoDataIcon" />
      </scroll-view>

      <template v-if="multiple">
        <view class="flex flex-middle ml-30 mr-30 mb-20">
          <button class="primary-btn round size-small plain flex-1" hover-class="button-action" @tap="handleReset">
            重 置
          </button>
          <button class="primary-btn round size-small flex-1 ml-30" hover-class="button-action" @tap="handleConfirm">
            确 认
          </button>
        </view>
      </template>

      <view v-if="showOrigin" class="pt-30 pb-30 tx-c" @tap="multiple ? handSelectZong() : handleSelect(originInfo)">
        若需选择品牌商总部，请点击
        <text class="fw-bold primary-color">选择{{ originInfo.dealername }}</text>
      </view>
    </u-popup>
    <common-popup
      v-model="showConfirmPopup"
      pstyle="z-index: 150000;"
      type="confirm"
      title="提示"
      :content="popContent"
      @confirm="hangdleClickConfirm"
    />
  </view>
</template>

<script>
import { staticURL } from '@/config'
import { apiGetStoreDealer } from 'packages/api/store'
import { uniLogin as getJsCode } from 'packages/utils/login.js'
import SearchInput from 'packages/components/search/search-input.vue'
import CommonPopup from 'packages/components/common-popup/common-popup.vue'
export default {
  components: {
    SearchInput,
    CommonPopup
  },
  props: {
    value: Boolean,
    memberlogin: {
      type: String,
      default: ''
    },
    dealerId: {
      // multiple为false
      type: Number,
      default: -1
    },
    multiple: Boolean, //默认单选   true---多选：prop传selectedList  mulSubmit回传list    false---单选：prop传dealerId  submit回传item
    selectedList: {
      // multiple为true
      type: Array,
      default: () => []
    },
    dxmDealerId: {
      type: Number,
      default: 0
    },
    lanandlat: {
      type: String,
      default: ''
    },
    showOrigin: Boolean // 总部
  },
  data() {
    return {
      showConfirmPopup: false,
      popContent: '',
      operaType: 0, // 1批量选择经销商 2选择总部
      searchType: 1, // 1-匹配街、区、市、省、全国，2-不匹配省市区街道
      nonoDataIcon: staticURL(true) + '/personal/default.png',
      activeIndex: 0, // 切换
      showPicker: this.value,
      keyword: '', // 搜索关键字
      keywordOri: '',
      originInfo: {
        id: 0,
        dealername: '总部'
      },
      list: [], // 列表数据
      paging: {
        pageSize: 10,
        PageIndex: 0
      },
      hasMore: true, // 还有更多数据标记
      busy: false // 防重复标记
    }
  },
  computed: {
    btnStyle() {
      let s = ''
      // #ifdef MP-MEMBER
      s = 'background: #FF7640;color: #fff'
      // #endif
      // #ifdef MP-SALE
      s = 'background: #fff;color: #3246C3;border: 1px solid #3246C3;border-radius: 15rpx;'
      // #endif
      return s
    },
    searchPlacehoder() {
      return this.searchType === 1 ? '若推荐不正确，请在此处搜索选择' : '请输入关键词搜索'
    },
    nonMsg() {
      return this.searchType === 1 ? '暂无推荐经销商，请在上方搜索选择' : '暂无经销商'
    },
    checkedList() {
      return this.list.filter(item => item.checked)
    }
  },
  watch: {
    value(val) {
      this.showPicker = val
      if (val) {
        if (this.list.length) {
          this.list.forEach(item => {
            item.checked = this.selectedList.includes(item.id)
          })
          return
        }
        this.getData()
      }
    }
  },
  methods: {
    scrollBottom() {
      if (this.hasMore) {
        this.getData()
      }
    },
    resetData() {
      this.hasMore = true // 还有更多数据标记
      this.busy = false // 防重复标记
      this.paging.PageIndex = 0
      this.list = []
    },
    handleCheck(item) {
      item.checked = !item.checked
    },
    handleReset() {
      this.list.forEach(item => {
        item.checked = false
      })
    },
    handleChange(type = 1) {
      this.keyword = this.keywordOri.trim()
      // if (this.keyword !== '' && !/^[a-zA-Z0-9\u4e00-\u9fa5]+$/.test(this.keyword)) {
      //   return this.$msg('请正确输入搜索关键字')
      // }
      this.searchType = type
      this.resetData()
      this.getData()
    },
    async getData(type = 0) {
      if (this.busy) return
      this.busy = true
      let pageIndex = this.paging.PageIndex + 1
      let res = await apiGetStoreDealer({
        memberlogin: this.memberlogin, //品牌商账号
        keyword: this.keyword,
        pageindex: pageIndex,
        pagesize: this.paging.pageSize,
        js_code: await getJsCode(),
        dxmdealerid: this.dxmDealerId,
        lanandlat: this.lanandlat,
        matchingtype: this.searchType
      })
      if (this.$ck(res, true)) {
        this.paging.PageIndex++
        let list = res.return_data.list || []
        if (this.multiple) {
          list.forEach(item => {
            item.checked = this.selectedList.includes(item.id)
          })
        }
        this.list = [...this.list, ...list]
        // 判断加载完成
        this.hasMore = res.return_data.totalcount > this.list.length
        if (type === 1 && this.list.length && this.paging.PageIndex === 1) {
          this.$emit('submit', this.list[0])
        }
      }
      this.busy = false
    },
    hangdleClickConfirm() {
      this.updateCheckedList(this.operaType)
      this.showConfirmPopup = false
    },
    handleConfirm() {
      if (!this.checkedList.length) return this.$msg('请选择经销商！')
      if (this.checkedList.length > 10) return this.$msg('最多可选10个经销商！')
      if (this.multiple && this.selectedList.some(item => item === 0)) {
        this.operaType = 1
        this.popContent = '您已选择总部，确认更换为所选经销商吗？'
        this.showConfirmPopup = true
        return
      }
      this.updateCheckedList(1)
    },
    updateCheckedList(type = 1) {
      //多选经销商 / 选总部  （multiple为true）
      const list = type === 2 ? [{ ...this.originInfo }] : this.checkedList
      this.$emit('mulSubmit', list)
      this.$emit('input', false)
    },
    handSelectZong() {
      if (this.multiple && this.checkedList) {
        this.operaType = 2
        this.popContent = '您已选择经销商，确定更换为总部吗？'
        this.showConfirmPopup = true
        return
      }
      this.updateCheckedList(2)
    },
    handleSelect(item) {
      //单选经销商/总部    （multiple为false）
      this.$emit('submit', item)
      this.$emit('input', false)
    }
  }
}
</script>

<style lang="scss" scoped>
.title {
  padding: 30rpx 20rpx 20rpx;
  // font-size: 30rpx;
  // font-weight: 700;
}
.list {
  height: 650rpx;
  margin: 30rpx 0;
  box-sizing: border-box;
  padding-right: 0;
  ::-webkit-scrollbar {
    width: 0;
    height: 0;
    color: transparent;
  }
  &.min-h {
    height: 550rpx;
  }
  .item {
    border-bottom: 1rpx solid #e5e5e5;
    padding: 30rpx;
    margin: 0 30rpx;
    // padding-bottom: 30rpx;
    // padding-top: 30rpx;
    .name {
      color: #000;
      // font-weight: bold;
      // margin-top: 30rpx;
      // width: 660rpx;
    }
  }
}
.search-box {
  // margin-top: 30rpx;
  // display: flex;
  // padding-right: 30rpx;
  margin: 30rpx 30rpx 0;
  // .search-input {
  //   flex: 1;
  // }
}
.check-box {
  width: 100rpx;
  align-self: stretch;
  .checked {
    color: $uni-color-primary;
  }
  .unchecked {
    color: #ccc;
  }
}
</style>
