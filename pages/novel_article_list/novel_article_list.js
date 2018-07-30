// 获取目录标题列表
const data_url = 'https://wxapi.dajianet.com/novel/chapters?novel_id=';
// 工具-异步请求
const new_data = require('../../utils/new_data.js');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    prevBookId: 0,
    chapterId:0,
    subChapterId:0, 
    wxTit:'',
    loading: true,//加载
    hasMore: true,//更多
    subtitle: '',//加载信息提示
    articleList:{}
  },
  /* 页面载入：章节列表载入传参
   * params: 书籍{bookid:XXXX}
   */
  onLoad(params) {
    let bookid = params.bookid;
    let chapid = params.chapid;
    console.log(wxtit);
    let wxtit = params.wxtit;//更新标题为书籍名
    if (wxtit){
      wx.setNavigationBarTitle({
        title: wxtit//页面标题为路由参数
      })
      this.setData({
        wxTit: wxtit
      });
    }
    if(bookid){
      this.setData({
        prevBookId: bookid
      })
    }
    if (chapid){//从具体章节返回
      this.setData({
        chapterId: chapid,
        subChapterId:params.secid
      })
    }
    // 加载对应书籍信息并初始化
    this.initList();
    // 转发
    wx.showShareMenu({
      withShareTicket: true
    })
  },
  //初始化数据
  initList: function () {
    this.showLoading();
    // 加载章节数据
    new_data.loadData(data_url + this.data.prevBookId, this.initCallback);
  },
  //数据加载完成后回调处理
  initCallback: function (datas) {
    if (datas) {
      this.setData({
        articleList:datas
      })
    } else {//数据加载失败
      this.setData({
        subtitle: '加载失败'
      })
    }
    this.hideLoading();
  },
  /*
   * 点击阅读跳转到章节详细
   * params : 前页传递信息
   */
  navToChapterRead: function (params) {
    let chapId = params.currentTarget.dataset.chapId;//章节id
    let secId = params.currentTarget.dataset.secId;//小节id
    let wxtit = params.currentTarget.dataset.wxtit;//书名
    wx.redirectTo({
      url: '../novel_chapter_read/novel_chapter_read?bookid=' + this.data.prevBookId + '&chapterid=' + chapId + "&sectionid=" + secId + '&wxtit=' + wxtit,
      success: (res) => { },
      fail: (err) => {
        console.log(err)
      }
    });
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
  },
})