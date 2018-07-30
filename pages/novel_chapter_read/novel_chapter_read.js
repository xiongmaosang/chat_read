// 获取目录标题列表
const chap_data_url = 'https://wxapi.dajianet.com/novel/chapters?novel_id=';
// 获取目录章小节列表
const sec_data_url = 'https://wxapi.dajianet.com/novel/sections?chapter_id=';
// 单篇文章
const article_data_url = 'https://wxapi.dajianet.com/novel/article?book_id=';

// 富文本解析插件
const WxParse= require('../../wxParse/wxParse.js');

// 工具-异步请求
const new_data = require('../../utils/new_data.js');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    prevBookId: 0,
    isArticle:0,
    chapterId:0,//所在章
    subChapterId:0,//所在小节
    loading: true,//加载
    subtitle: '',//加载信息提示
    wxTit:'',
    modeCut:'day',
    commToast:{
      toastText: '提示信息',
      isShowToast: false
    },
    chapterCard:{},//章节信息
    subChapters:{},//子章节集合
    subChapterCard:{}//子章节信息
  },
  /* 页面载入：章节列表载入传参
   * params: 书籍{chapId:章id，secId：节id}
   */
  onLoad(params) {
    this.showLoading();
    //获取传参
    let bookId = params.bookid;
    let chapId = params.chapterid;
    let isarti = params.isarti;//0-连载，1-单篇
    console.log(isarti);
    //设置标题
    let wxtit = decodeURIComponent(params.wxtit);//单本图书传入的书籍名
    if (wxtit){
      wx.setNavigationBarTitle({
        title: wxtit//页面标题为路由参数
      })
      this.setData({
        wxTit: wxtit
      })
    }
    if (isarti){
      this.setData({
        isArticle: isarti
      })
    }
    //设定日夜模式
    this.modeSet();
    if (chapId){//章节列表进入
      let secId = params.sectionid;
      this.setData({
        chapterId: chapId,
        subChapterId: secId
      })
    }

    this.setData({
      prevBookId: bookId,
    })
    this.initData();
    // 转发
    wx.showShareMenu({
      withShareTicket: true
      // path:'/page/novel_article_read/novel_article_read？wxtit'+this.data.wxTit
    });
  },
  //初始化数据
  initData: function () {
    if (this.data.isArticle == 1){
      new_data.loadData(article_data_url + this.data.prevBookId, this.initCallback);//加载单篇
      console.log(2222222);
      return;
    }
    new_data.loadData(chap_data_url + this.data.prevBookId, this.initCallback);//加载章节数据
  },
  //数据加载完成后回调处理
  initCallback: function (datas) {
    let that = this;
    console.log(datas);
    if (datas) {
      if (that.data.isArticle==1){//单篇
        that.setData({//回填章节信息
          subChapterCard: datas
        })
        //解析富文本
        WxParse.wxParse('subChapterCard', 'html', datas.content, that, 5);
        that.hideLoading();
      }else{
        that.setData({//回填章节信息
          chapterCard: datas
        })
        if (!that.data.chapterId){//单本图书进入
          that.data.chapterCard.forEach(function(v,i){
            if(i==0){
              that.setData({
                chapterId: v.chapterid
              })
            }
          });
        }
        // 查询小节信息
        new_data.loadData(sec_data_url + that.data.chapterId, that.initSubChap);
      }
    } else {//数据加载失败
      this.setData({
        subtitle: '加载失败'
      })
    }
  },
  /**
   * [初始化章节]
   */
  initSubChap: function (datas){
    let that = this;
    if (datas) {
      that.setData({
        subChapters:datas
      });

      datas.forEach(function(v,i){
        if (that.data.subChapterId){//章节进入
          if (v.sectionid == that.data.subChapterId){
            that.setData({
              subChapterCard:v
            });
            //解析富文本
            WxParse.wxParse('subChapterCard', 'html', v.content, that, 5);
          }
        }else{//阅读进入
          if(i==0){
            that.setData({
              subChapterId : v.sectionid,
              subChapterCard: v
            });
            //解析富文本
            WxParse.wxParse('subChapterCard', 'html', v.content, that, 5);
          }
        }
        // return;
      });
    }
    this.hideLoading();
  },
  // 跳转前后章节阅读
  navToOhterChapter: function (params) {
    var that = this;
    that.showLoading();
    let op = params.currentTarget.dataset.id;
    if(op=='prev'){//上一章
      that.data.subChapters.some(function (v, i) {//遍历查找index
        if (v.sectionid == that.data.subChapterId){//找到所在节
          if (i == 0) {//查询前一章最后一节
            that.data.chapterCard.some(function(v,i){//循环询章
              if(v.chapterid == that.data.chapterId){//找到所在章
                if(i==0){//第一章，第一节，则不跳转
                  that.showToast('已经是第一章,第一节');
                }else if(i>0){//本章第一节，查询前一章最后一节
                  let chapterCard = that.data.chapterCard[i-1];
                  let sections = chapterCard.sections;
                  let chapterid = chapterCard.chapterid;
                  let sectionid = sections[sections.length-1].sectionid;
                  if (chapterid){
                    that.setData({
                      chapterId: chapterid,
                      subChapterId:sectionid
                    })
                  }
                  // 查询小节信息
                  new_data.loadData(sec_data_url + chapterid, that.initSubChap);
                }
                return true;
              }
            })
          } else if(i>0) {//非第一节，查询前一节
            that.setData({
              subChapterId: that.data.subChapters[i - 1].sectionid,
              subChapterCard: that.data.subChapters[i-1]
            })

            //解析富文本
            WxParse.wxParse('subChapterCard', 'html', that.data.subChapters[i - 1].content, that, 5);
          }
          return true;
        }
      })
    }else if(op=='next'){//下一章
      that.data.subChapters.some(function (v, i) {//遍历查找index
        let len = that.data.subChapters.length - 1;
        if (v.sectionid == that.data.subChapterId) {//找到所在节
          if (i == len) {//查询下一章第一节
            that.data.chapterCard.some(function (item, j) {//循环询章
              if (item.chapterid == that.data.chapterId) {//找到所在章
                let lenn = that.data.chapterCard.length - 1;//章count
                if (j == lenn) {//最后一章，最后一节，则不跳转
                  that.showToast('已经是最后一节');
                } else if (j < lenn) {//本章第一节，查询前一章第一节
                  let chapterCard = that.data.chapterCard[j + 1];
                  let sections = chapterCard.sections;
                  let chapterid = chapterCard.chapterid;
                  let sectionid = sections[0].sectionid;
                  if (chapterid) {
                    that.setData({
                      chapterId: chapterid,
                      subChapterId: sectionid
                    })
                  }
                  // 查询小节信息
                  new_data.loadData(sec_data_url + chapterid, that.initSubChap);
                }
                return true;
              }
            })
          } else if (i < len) {//非最后一节，查询后一节
            that.setData({
              subChapterId: that.data.subChapters[i + 1].sectionid,
              subChapterCard: that.data.subChapters[i + 1]
            })
            //解析富文本
            WxParse.wxParse('subChapterCard', 'html', that.data.subChapters[i + 1].content, that, 5);
          }
          return true;
        }
      })
    }
    that.hideLoading();
  },
  /*
   * 点击目录跳转到目录列表
   * params : 当前书籍id
   */
  navToArticleList: function (params) {
    console.log(this.data.bookTit);
    wx.redirectTo({
      url: '../novel_article_list/novel_article_list?bookid=' + this.data.prevBookId + '&chapid=' + this.data.chapterId + '&secid=' + this.data.subChapterId + "&wxtit=" + this.data.wxTit,//目录列表
      success: (res) => {},
      fail: (err) => {
        console.log(err)
      }
    });
  },
  /**
   * [切换日夜]
   * */ 
  modeCut:function(){
    if (this.data.modeCut == 'night'){
      this.setData({//切换至日光
        modeCut:'day'
      })
    }else{
      this.setData({//切换至夜光
        modeCut:'night'
      })
    }
  },
  /**
   * [设定日夜模式]
   * */ 
  modeSet: function (){
    if (this.data.modeCut=='night'){//设定夜光
      wx.setNavigationBarColor({
        frontColor: '#ffffff',
        backgroundColor: '#29414a',
        animation: {
          duration: 400,
          timingFunc: 'easeIn'
        }
      })
    } else {//设定日光
      wx.setNavigationBarColor({
        frontColor: '#000000',
        backgroundColor: '#f6f6ee',
        animation: {
          duration: 400,
          timingFunc: 'easeIn'
        }
      })
    }
  },
  /**
   * [显示提示信息]
   * */ 
  showToast(tips){
    var _this = this;
    // 显示toast
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation;
    animation.translateY(300).step()
    _this.setData({
        commToast: {
          isShowToast: true,
          toastText: tips
        }
    });
    // 定时器关闭
    setTimeout(function () {
      animation.translateY(0).step()
      _this.setData({
        commToast: {
          isShowToast: false,
          toastText: ''
          }
      });
    }.bind(this), 1200)
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