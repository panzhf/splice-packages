<template>
  <view>
    <view
      v-if="configLoaded"
      :class="[
        giftCategoryConfig.mode === 1 ? 'gift-theme-1' : 'gift-theme-2',
        giftCategoryConfig.showCategory ? 'gift-theme-category' : ''
      ]"
    >
      <view v-if="giftCategoryConfig.mode !== 1 || giftCategoryConfig.showCategory" class="type-list">
        <search-type
          :list="classList"
          :mode="giftCategoryConfig.mode"
          :paging="paging"
          @submit="submit"
          @query="
            e => {
              paging = e
            }
          "
        />
      </view>
      <view class="list">
        <view class="tab-box">
          <view
            v-for="(item, index) in tab"
            :key="index"
            class="tab-item flex flex-middle flex-center"
            :class="{ active: index == active }"
            @tap="handleSelect(index, item)"
          >
            <view>{{ item.name }}</view>
            <!--兑换量和积分 -->
            <view v-if="[1, 2].includes(item.value)" class="caret-wrapper flex flex-column flex-middle">
              <view class="sort-caret ascending" :class="{ active: item.sort === 1 }" />
              <view class="sort-caret descending" :class="{ active: item.sort === 2 }" />
            </view>
            <!-- 筛选 -->
            <view v-if="item.isFilter" class="caret-wrapper">
              <view style="margin-top: 6rpx" class="sort-caret descending" />
            </view>
          </view>
        </view>

        <u-waterfall ref="uWaterfall" v-model="list">
          <template #left="{ leftList }">
            <view v-for="(item, index) in leftList" :key="index" class="item item-left">
              <ProductCard
                :image="item.picurl"
                :goods-name="item.goodsname"
                :hgway="item.hgway"
                :row="item"
                :points="item.points"
                :price="item.price"
                layout="grid"
                :bg-color="giftData.Bgcolor"
                :list="list"
                @click="handleOpenDetail(item.goodsid)"
              />
            </view>
          </template>
          <template #right="{ rightList }">
            <view v-for="(item, index) in rightList" :key="index" class="item item-right">
              <ProductCard
                layout="grid"
                :list="list"
                :row="item"
                :bg-color="giftData.Bgcolor"
                :is-show-add-cart="false"
                :image="item.picurl"
                :goods-name="item.goodsname"
                :hgway="item.hgway"
                :points="item.points"
                :price="item.price"
                @click="handleOpenDetail(item.goodsid)"
              />
            </view>
          </template>
        </u-waterfall>

        <load-more v-if="!loading && list.length" :has-more="hasMore" />
        <none-data v-if="!list.length && !loading" class="none-data" />
      </view>
      <!-- #ifdef MP-MEMBER || MP-CLOUDSHOP -->
      <md-copyright :custom-style="copyrightStyle" />
      <!-- #endif -->
    </view>
    <search
      :show.sync="show"
      :class-list="classList"
      :paging="paging"
      @submit="submit"
      @query="
        e => {
          paging = e
        }
      "
    />
    <!-- #ifdef MP-WEIXIN -->
    <privacy-popup />
    <!-- #endif -->
  </view>
</template>

<script>
import { mapState } from 'vuex'
import { apiHomeDecoration, apiIntegralGetGoodsList, apiIntegralGetGoodsListClass } from '../api/integral'
import LoadMore from 'packages/components/load-more/index.vue'
import NoneData from 'packages/components/none-data/index.vue'
import ProductCard from '../design/integral/components/product-card.vue'
import Search from './components/search-popup.vue'
import SearchType from './components/search-type.vue'
import { setTitleMixin } from 'packages/mixins/navigation'
export default {
  components: {
    Search,
    ProductCard,
    LoadMore,
    NoneData,
    SearchType
  },
  mixins: [setTitleMixin],
  data() {
    return {
      tab: [
        {
          name: '我能兑',
          value: 3,
          sort: 0
        },
        {
          name: '兑换量',
          value: 1,
          sort: 0
        },
        {
          name: '积分值',
          value: 2,
          sort: 0
        },
        {
          name: '筛选',
          value: 3,
          sort: 0,
          isFilter: true
        }
      ],
      active: -1,
      list: [],
      paging: {
        PageIndex: 1,
        PageSize: 10,
        categoryId: 0,
        hgWay: -1,
        exchangepointstype: 0 // 0、会员积分商城 1、导购积分商城
      },
      hasMore: true, // 还有更多数据标识
      loading: true, // 页面显示loading标识
      busy: false, // 防重复请求标识
      show: false,
      classList: [],
      configLoaded: false
    }
  },
  computed: {
    ...mapState('integral', ['isInitCategoryConfig', 'giftCategoryConfig']),
    copyrightStyle() {
      if (this.giftCategoryConfig.mode === 2) {
        return 'margin-left: 170rpx;'
      }
      return ''
    }
  },
  async onLoad() {
    if (!this.isInitCategoryConfig) {
      await this.fetchConfig()
    }
    this.configLoaded = true
    this.setTitle(this.giftCategoryConfig.Title)
    this.$loading.show()
    this.getClass()
    await this.getData()
    this.$loading.hide()
  },
  onReachBottom() {
    if (this.hasMore) {
      this.paging.PageIndex++
      this.getData()
    }
  },
  methods: {
    async fetchConfig() {
      const res = await apiHomeDecoration({ sourcetype: 2 })
      if (res.return_code === 0) {
        const components = res?.return_data?.components || []
        const category = components.find(item => item.code === 'Category')
        if (category) {
          this.$store.commit('integral/setGiftCategory', JSON.parse(category.data))
        }
      }
      // 有装修分类更新分类配置；没装修也更新标记，用默认装修配置
      this.$store.commit('integral/setInitConfig', true)
      return true
    },
    async getClass() {
      let res = await apiIntegralGetGoodsListClass()
      this.classList = res.return_data
    },
    async getData() {
      if (this.busy || !this.hasMore) return
      this.busy = true
      let obj = {}
      this.tab.forEach(item => {
        const { value, sort } = item
        // 兑换值
        if (value === 1) {
          obj.issalesoutsort = sort
        }
        // 全积分
        if (value === 2) {
          obj.ispointssort = sort
        }
      })
      // 可兑换
      obj.ismyexchange = this.active === 0 ? 1 : 0
      // #ifdef MP-GUIDE
      this.paging.exchangepointstype = 1
      // #endif
      let query = JSON.parse(JSON.stringify(this.paging))
      if (query.hgWay === -1) {
        delete query.hgWay
      }
      let res = await apiIntegralGetGoodsList(Object.assign(query, obj))
      if (this.$ck(res, true)) {
        this.list = [...this.list, ...res.return_data.list]
        // 判断加载完成
        this.hasMore = res.return_data.totalcount > this.list.length
        this.busy = false
        this.loading = false
      }
    },
    resetData(state = false) {
      this.hasMore = true
      this.loading = true
      this.busy = false
      this.$refs.uWaterfall && this.$refs.uWaterfall.clear()
      this.list = []
      if (state) {
        this.paging.PageIndex = 1
        this.paging.PageSize = 10
      } else {
        this.paging = {
          PageIndex: 1,
          PageSize: 10,
          categoryId: 0,
          hgWay: -1
        }
      }
    },
    submit() {
      this.resetData(true)
      this.getData()
    },
    handleSelect(index) {
      // 筛选的打开弹窗
      let { isFilter, sort, value } = this.tab[index]
      if (isFilter) {
        return (this.show = true)
      }
      // 排序先清空
      this.tab.forEach(item => {
        item.sort = 0
      })
      // 兑换量和积分值需要处理排序
      if ([1, 2].includes(value)) {
        // 1 -> 2 -> 0 -> 1
        sort = (sort + 1) % 3
        this.$set(this.tab[index], 'sort', sort)
        // 兑换量和积分值， sort为0表示不选中
        this.active = sort === 0 ? -1 : index
      } else {
        // 其他tab
        // 重复点击取消选择
        this.active = this.active === index ? -1 : index
      }
      // 没选中则清空值
      this.resetData(true)
      this.getData()
    },
    handleOpenDetail(id) {
      uni.navigateTo({
        url: '/packages/src/integral/detail?id=' + id
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.list {
  // height: 100%;
  min-height: 100vh;
  ::v-deep {
    .product-card {
      border-radius: 8rpx !important;
      .info {
        padding: 6rpx 20rpx !important;
      }
    }
  }
}
.caret-wrapper {
  margin-left: 8rpx;
  .sort-caret {
    width: 0;
    height: 0;
    border: 8rpx solid transparent;
    & + .sort-caret {
      margin-top: 4rpx;
    }
  }
  .ascending {
    border-bottom-color: #c0c4cc;
    &.active {
      border-bottom-color: #000;
    }
  }
  .descending {
    border-top-color: #c0c4cc;
    &.active {
      border-top-color: #000;
    }
  }
}
.tab-box {
  display: flex;
  background: #f2f2f2;
  box-sizing: border-box;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 29;
  .tab-item {
    font-size: 24rpx;
    font-family: PingFang SC;
    font-weight: 500;
    color: #000;
    height: 60rpx;
    background: white;
    border-radius: 30rpx;
    &:not(:last-child) {
      flex: 1;
      margin-right: 20rpx;
    }
    &:last-child {
      width: 140rpx;
    }
    &.active {
      background: $bg-color;
    }
  }
}
// 图片配置间隔
.item-left {
  margin: 0 20rpx 20rpx;
}
.item-right {
  margin: 0 20rpx 20rpx 0;
}
.list-box {
  display: block;
  padding: 0 20rpx;
}
::v-deep .u-waterfall {
  background-color: #f2f2f2;
}
// 不同主题的type配置样式
.gift-theme {
  &-1 {
    // 类型
    .type-list {
      position: fixed;
      left: 0;
      top: 0;
      width: 100%;
      height: 90rpx;
      z-index: 29;
      background: #fff;
    }
    // 列表展示位置
    .list {
      padding-top: 116rpx;
      .tab-box {
        padding: 28rpx 20rpx 22rpx;
      }
      .item {
        width: 345rpx;
      }
    }
    // 横着放类型的
    &.gift-theme-category {
      .list {
        padding-top: 206rpx;
        .tab-box {
          top: 90rpx;
        }
      }
    }
  }
  &-2 {
    .type-list {
      position: fixed;
      left: 0;
      top: 0;
      width: 170rpx;
      height: 100vh;
      background: #fff;
    }
    .list {
      padding-left: 170rpx;
      padding-top: 110rpx;
      .tab-box {
        left: 170rpx;
        padding: 24rpx 20rpx;
        .tab-item {
          &:not(:last-child) {
            margin-right: 10rpx;
          }
          &:last-child {
            width: 100rpx;
          }
          &.active {
            background: rgba($color: $bg-color, $alpha: 0.5);
          }
        }
      }
      .item {
        width: 260rpx;
      }
    }
  }
}
</style>
