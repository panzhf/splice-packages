<template>
  <view class="goods-list">
    <view v-if="articleData.isShowTitle" class="header flex flex-between flex-middle">
      <view class="title fs-32 fw-bold">{{ articleData.title }}</view>
      <view class="text flex flex-middle fs-24" @tap="goList">
        <text>更多</text>
        <text class="icon iconfont icon-more ml-10" />
      </view>
    </view>
    <view v-if="articleData.style === 'block'" class="article-list1">
      <view v-for="(item, index) in list" :key="index" class="li" @tap="handleDetail(item.id)">
        <v-img size="1000" :src="item.postpicture" mode="widthFix" />
        <view class="flex flex-middle overflow-h mt-20 mb-20">
          <view class="flex-1 fw-bold ellipsis fs-30">
            {{ item.title }}
          </view>
          <view class="article-zan ml-30">
            <span class="icon iconfont icon-thumbs-up" />
            <span class="fs-26 ml-10">{{ item.totalpraises }}</span>
          </view>
        </view>
        <view v-if="item.summary" class="article-descript ellipsis-2 fs-28">
          {{ item.summary }}
        </view>
      </view>
    </view>

    <view v-else class="article-list2">
      <view v-for="(item, index) in list" :key="index" class="li flex" @tap="handleDetail(item.id)">
        <v-img size="400" :src="item.postpicture" mode="widthFix" class="article-photo shrink-0" />
        <view class="flex-1 flex flex-column flex-between overflow-h ml-20">
          <view>
            <view class="fw-bold ellipsis fs-28">
              {{ item.title }}
            </view>
            <view v-if="item.summary" class="article-descript ellipsis-2 fs-24">
              {{ item.summary }}
            </view>
          </view>
          <view class="article-zan">
            <span class="icon iconfont icon-thumbs-up" />
            <span class="fs-26 ml-10">{{ item.totalpraises }}</span>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
// #ifdef MP-WEIXIN
import { apiBlogList } from 'packages/api/dynamic'
// #endif
export default {
  props: {
    articleData: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      list: []
    }
  },
  // #ifdef H5-DECORATE
  mounted() {
    this.getData()
  },
  // #endif
  methods: {
    getData() {
      // 父组件主动调用以刷新数据
      // #ifdef MP-WEIXIN
      const blogids = (this.articleData.list || []).map(item => item.id)
      apiBlogList({ blogids }).then(res => {
        if (this.$ck(res)) {
          const list = res.return_data.results || []
          // 保证文章顺序
          this.list = blogids
            .map(id => list.find(item => item.id === id))
            .map(item => {
              // 过滤多余字段
              return {
                id: item.id,
                title: item.title,
                summary: item.summary,
                postpicture: item.postpicture,
                totalpraises: item.totalpraises
              }
            })
        }
      })
      // #endif
      // #ifdef H5-DECORATE
      this.list = this.articleData.list
      // #endif
    },
    goList() {
      /* #ifdef MP-WEIXIN */
      uni.navigateTo({
        url: `/packages/src/dynamic/list`
      })
      /* #endif */
    },
    handleDetail(id) {
      /* #ifdef MP-WEIXIN */
      uni.navigateTo({
        url: `/packages/src/dynamic/activity?id=${id}&type=0`
      })
      /* #endif */
    }
  }
}
</script>

<style lang="scss" scoped>
.goods-list {
  padding: 0 26rpx;
  background: #fff;
  color: #000;
  .header {
    padding: 24rpx 0;
    .text {
      color: #666;
      .icon {
        font-size: 20rpx;
      }
    }
  }
}
.li {
  border-bottom: 1px solid #eee;
  padding-bottom: 30rpx;
  margin-bottom: 30rpx;
  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }
}
.article-list1 {
  .article-zan {
    color: #333;
    .icon-thumbs-up {
      font-size: 36rpx;
    }
  }
  .article-descript {
    color: #666;
    line-height: 36rpx;
  }
}
.article-list2 {
  .article-photo {
    width: 300rpx;
  }
  .article-descript {
    margin: 15rpx 0;
    color: #666;
  }
  .article-zan {
    color: #333;
    text-align: right;
    .icon-thumbs-up {
      font-size: 30rpx;
    }
  }
}
</style>
