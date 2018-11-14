Page({

    data: {
        activityList: []
    },

    backHome(){
        wx.switchTab({
            url: '/pages/index/index'
        })
    }

});