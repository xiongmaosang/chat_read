// 分类标签
const data_url = 'https://wxapi.dajianet.com/novel/cats';
// 工具-异步请求
const new_data = require('../../utils/new_data.js');

Page({
  data: {
    loading: true,//加载
    hasMore: true,//更多
    subtitle: '',//加载信息提示
    // 首页重磅推荐书籍信息-缩略图
    catCards: {}
  },
  //初始化数据
  initList: function () {
    this.showLoading();
    //加载首页数据，无须分页
    new_data.loadData(data_url, this.initCallback);
  },
  /*
   * 数据加载完成后回调处理
   * datas:返回数据
   * page:是否分页
   */
  initCallback: function (datas, page) {
    if (datas) {
      this.setData({
        catCards: datas
      })
      this.hideLoading();
    } else {//数据加载失败
      this.setData({
        subtitle: '加载失败'
      })
    }
  },
  /* 点击全部原创跳转到书籍列表
   * 
   */
  navToNovelList: function (params) {
    let typeId = params.currentTarget.dataset.id || 0;
    let wxtit = params.currentTarget.dataset.txt || '';
    wx.navigateTo({
      url: '../comm_booklist/comm_booklist?page=1&typeid=' + typeId + '&wxtit=' + wxtit
    })
  }, 
  /**
   * [onLoad 载入页面时执行的生命周期初始函数]
   * @return {[type]} [description]
   */
  onLoad: function () {
    this.initList();
    // 转发
    wx.showShareMenu({
      withShareTicket: true
    })
  },
  /**
     * [onPullDownRefresh 下拉刷新数据]
     * @return {[type]} [description]
     */
  onPullDownRefresh() {
    this.initList();
  },
  // 加载中
  showLoading() {
    wx.showNavigationBarLoading();
    this.setData({
      subtitle: '加载中...',
      loading: true,
    });
  },
  // 隐藏加载
  hideLoading() {
    wx.hideNavigationBarLoading();
    wx.stopPullDownRefresh();
    this.setData({
      loading: false
    });
  }
})