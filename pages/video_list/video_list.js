// 视频列表页数据url
const data_url = 'https://wxapi.dajianet.com/video/query';
// 工具-异步请求
const new_data = require('../../utils/new_data.js');
//获取应用实例
const app = getApp();

// 数据
Page({
  data: {
    loading:true,//加载
    hasMore:true,//更多
    subtitle: '',//加载信息提示
    commCards: {}//视频卡
  },
  /**
   * [初始化数据]
   * */
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
  initCallback: function (datas,page) {
    if (datas) {
      if(page){//分页数据
        let olditem = this.data.commCards.items;//原始数据
        datas.items = olditem.concat(datas.items);//追加数据
      }
      this.setData({
        commCards: datas
      })

      this.hideLoading();
    } else {//数据加载失败
      this.setData({
        subtitle: '加载失败'
      })
    }
  },
  /**
   * [点击跳转到单本视频]
   * @params:单本视频id
   * */ 
  navToVideo: function (params) {
    let str = params.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../novel_article/novel_article?videoid=' + str ,
      success: (res) => { },
      fail: (err) => {
        console.log(err)
      }
    });
  },
  /**
   * [loadMore 加载更多数据/分页]
   * @return {[type]} [description]
   */
  loadMore() {
    this.showLoading();
    let page_index = this.data.commCards.page_index;//当前第几页
    let total_page = this.data.commCards.total_page;//所有页数
    if (page_index >= total_page) {//没有更多
      this.setData({
        hasMore: false,
      });
      this.hideLoading();
      return;
    }
    //加载下一页
    let page_data_url = 'https://wxapi.dajianet.com/video/query?page=' + (page_index+1);
    new_data.loadData(page_data_url, this.initCallback,true)//获取新数据
  },
  /**
   * [onLoad 载入页面时执行的生命周期初始函数]
   * @return {[type]} [description]
   */
  onLoad: function (params) {
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
  /**
   * [onReachBottom 上拉加载更多]
   * @return {[type]} [description]
   */
  onReachBottom() {
    this.loadMore();
  },
  // [加载中]
  showLoading() {
    wx.showNavigationBarLoading();
    this.setData({
      subtitle: '加载中...',
      loading: true,
    });
  },
  // [隐藏加载]
  hideLoading() {
    wx.hideNavigationBarLoading();
    wx.stopPullDownRefresh();
    this.setData({
      loading: false
    });
  }
})
