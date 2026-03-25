/*
 * @Author: hishion
 * @Date: 2021-07-15 13:51:18
 * @Description 用于列表的加载更多。
 * 导入mixin，页面定义getData方法用于获取数据，参考下方写法
 */
const loadMoreMixin = {
  data() {
    return {
      list: [], // 列表数据
      paging: {
        page: 0,
        pageSize: 10
      },
      hasMore: true, // 还有更多数据标记
      busy: false // 防重复标记
    }
  },
  computed: {
    showNoneData() {
      // 用于判断无数据显示占位图
      return !this.hasMore && this.list.length === 0
    }
  },
  onReachBottom() {
    // 使用mixin的地方定义getData方法用于加载数据
    if (this.hasMore) {
      this.getData()
    }
  },
  methods: {
    resetData() {
      return new Promise(resolve => {
        this.list = []
        this.paging.page = 0
        this.hasMore = true
        this.busy = false
        resolve()
      })
    },
    dealRes({ res, nextPage, mode = 1, listProp = 'list' }) {
      if (mode === 1) {
        // 常规接口返回，带list和totalCount
        const { [listProp]: result, totalcount } = res.return_data
        this.list = [...this.list, ...result]
        this.hasMore = this.list.length < totalcount
        // 考虑请求成功且有数据才设置页码
        result.length > 0 && (this.paging.page = nextPage)
      } else if (mode === 2) {
        // 数据在return_data，总数在return_count(或没有)
        const result = res.return_data || []
        const totalcount = res.return_count
        this.list = [...this.list, ...result]
        this.hasMore = totalcount !== undefined ? this.list.length < totalcount : result.length >= this.paging.pageSize
        result.length > 0 && (this.paging.page = nextPage)
      } else if (mode === 3) {
        // 数据在return_data里的list，总数在return_count
        const { [listProp]: result } = res.return_data
        const totalcount = res.return_count
        this.list = [...this.list, ...result]
        this.hasMore = this.list.length < totalcount
        result.length > 0 && (this.paging.page = nextPage)
      }
    }
    /* getData() {
      if (this.busy) return
      this.busy = true
      const nextPage = this.paging.page + 1
      API({
        pageindex: nextPage,
        pagesize: this.paging.pageSize,
        ...this.otherParams
      }).then(res => {
        if (this.$ck(res)) {
          this.dealRes({res, nextPage})
          // 其他业务逻辑
        }
        this.busy = false
      }).catch(() => {
        this.busy = false
      })
    } */
  }
}

export default loadMoreMixin
