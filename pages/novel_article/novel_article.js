// 获取单本原创图书信息
const book_data_url = 'https://wxapi.dajianet.com/novel/details?id=';
const video_data_url = 'https://wxapi.dajianet.com/video/details?id=';
const circle_data_url = 'https://wxapi.dajianet.com/community/content?id=';

// 富文本解析插件
const WxParse = require('../../wxParse/wxParse.js');

// 工具-异步请求
const new_data = require('../../utils/new_data.js');
const util = require('../../utils/util.js');

// 数据
Page({
  data: {
    prevBookId:0,//当前书籍id
    prevVideoId:0,//当前视频id
    prevCircleId:0,//书圈id
    controlShow:true, //默认隐藏
    commCards: {},//列表书籍卡
    commSumm: {}//书籍概述
  },
  //初始化数据
  initList: function () {
    this.showLoading();
    if(this.data.prevBookId){//加载图书信息
      new_data.loadData(book_data_url + this.data.prevBookId, this.initCallback);
    } else if (this.data.prevVideoId){
      new_data.loadData(video_data_url + this.data.prevVideoId, this.initCallback);
    } else if (this.data.prevCircleId){
      new_data.loadData(circle_data_url + this.data.prevCircleId, this.initCallback);
    }
  },
  //数据加载完成后回调处理
  initCallback: function (datas) {
    let that = this;
    if (datas && this.data.prevBookId) {//图书,更新日期format
      let updatetime = datas.details.published;
      datas.details.published = util.formatTime(updatetime*1000);
      this.setData({
        commCards:datas,//看了本书的还看
        commSumm: datas.details,//书籍信息简介
      })
      console.log(datas.details);
      //解析富文本
      WxParse.wxParse('description', 'html', datas.details.description, that, 5);
    } else if (datas && this.data.prevVideoId){//视频
      let updatetime = datas.video.published;
      datas.video.published = util.formatTime(updatetime * 1000);
      this.setData({
        commCards: datas,//看了本书的还看
        commSumm: datas.video//书籍信息简介
      })  
      //解析富文本
      WxParse.wxParse('description', 'html', datas.video.description, that, 5);
      let wxtit = this.data.commSumm.title;//更新标题为书籍名
      if (wxtit) {
        wx.setNavigationBarTitle({
          title: wxtit//页面标题为路由参数
        })
      }
    } else if (datas && this.data.prevCircleId){//书圈
      let updatetime = datas.created;
      datas.created = util.formatTime(updatetime * 1000);
      this.setData({
        commSumm: datas//书籍信息简介
      })
      WxParse.wxParse('description', 'html', datas.content, that, 5);
      wx.setNavigationBarTitle({
        title: '文章'//页面标题为路由参数
      })
    } else {//数据加载失败
      this.setData({
        subtitle: '加载失败'
      })
    }
    this.hideLoading();
  },
  /* 点击书籍卡跳转到文章详细
   * params:书籍id
   */
  navToArticle: function (params) {
    let str = params.currentTarget.dataset.id;
    // 由于最多跳转5层，改为关闭当前页
    wx.redirectTo({
      url: '../novel_article/novel_article?bookid=' + str,
      success: (res) => { },
      fail: (err) => {
        console.log(err)
      }
    });
  },
  /*
   * 点击目录跳转到目录列表
   * params : 当前书籍id
   */
  navToArticleList: function (params) {
    let str = params.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../novel_article_list/novel_article_list?bookid=' + str + '&wxtit=' + this.data.commSumm.title,//目录列表
      success: (res) => {},
      fail: (err) => {
        console.log(err)
      }
    });
  },
  /*
   * 点击阅读跳转到章节详细
   * params : 当前书籍id
   */
  navToChapterRead: function (params){
    let str = params.currentTarget.dataset.id;
    let arti = params.currentTarget.dataset.arti;
    wx.navigateTo({
      url: '../novel_chapter_read/novel_chapter_read?bookid=' + str + '&wxtit=' + this.data.commSumm.title + '&isarti=' + arti,//目录列表,
      success: (res) => { },
      fail: (err) => {
        console.log(err)
      }
    });
  },
  /**
   * [onLoad 载入页面时执行的生命周期初始函数]
   * params:书籍id信息
   * @return {[type]} [description]
   */
  onLoad: function (params) {
    if (params.bookid){//单个图书
      this.setData({
        prevBookId : params.bookid
      })
    }else if(params.videoid){//单个视频
      this.setData({
        prevVideoId: params.videoid
      })
    } else if (params.circleid){//单篇文章
      this.setData({
        prevCircleId: params.circleid
      })
    }
    // 加载对应书籍信息并初始化
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
    debugger
    this.setData({
      loading: false,
      controlShow:false
    });
  }
})
