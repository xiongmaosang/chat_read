/**
 * 工具
 * 发送异步请求，获取接口数据
 * data_url:数据接口
 * callback:请求数据后回调函数
 * page:是否分页
 */
module.exports = {
  loadData:function(data_url,callback,page){
    wx.request({
      url: data_url,
      method: 'GET',
      dataType: 'json',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        if(page) callback(res.data,page);
        else callback(res.data);
      },
      fail:function(){
        callback(false);
      }
    })
  }
}