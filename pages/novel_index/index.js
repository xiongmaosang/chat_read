// 首页数据url
const data_url = 'https://wxapi.dajianet.com/novel/index';
// 工具-异步请求
const new_data = require('../../utils/new_data.js');

//获取应用实例
const app = getApp();
// 数据 
Page({
  data: {
    motto: '欢迎来到大佳阅读',//欢迎语
    userInfo: {},
    hasUserInfo: false,
    loading: true,//加载
    interval:5000,
    duration:500,
    subtitle: '',//加载信息提示
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    imgUrls:{0:'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1528177017516&di=84c1ddce97fc025187865f883f59606c&imgtype=0&src=http%3A%2F%2Fimg.zcool.cn%2Fcommunity%2F01f40f597788a2a8012193a3dc8901.jpg',1:'https://ss0.bdstatic.com/70cFvHSh_Q1YnxGkpoWK1HF6hhy/it/u=105013293,614530137&fm=27&gp=0.jpg'},
    commCards: {} // 首页重磅推荐书籍卡信息
  },
  /**
   * [初始化数据]
   * */
  initList:function(){
    this.showLoading();
    //加载本页数据
    new_data.loadData(data_url, this.initCallback);
  },
  /**
   * [数据加载完成后回调处理]
   * @datas:返回数据
   * */
  initCallback:function(datas){
    if(datas){
      this.setData({
        commCards : datas
      })
      console.log()
    }else{//数据加载失败
      this.setData({
        subtitle:'加载失败'
      })
    }
    this.hideLoading();
  },
  /**
   * [点击书籍卡跳转到文章详细]
   * @params:书籍id
   */
  navToArticle:function(params) {
    let str = params.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../novel_article/novel_article?bookid=' + str,
      success: (res) => { },
      fail: (err) => {
        console.log(err)
      }
    });
  },
  /**
   * [点击全部原创跳转到书籍列表]
   * */
  navToNovelList:function(){
    wx.navigateTo({
      url: '../comm_booklist/comm_booklist'
    })
  },
  /**
   * [onLoad 载入页面时执行的生命周期初始函数]
   * @return {[type]} [description]
   */
  onLoad: function () {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
    this.initList();  
    // 转发
    wx.showShareMenu({
      withShareTicket: true
    })
  },
  getUserInfo: function(e) {
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
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
