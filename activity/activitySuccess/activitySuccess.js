Page({

    data: {
        validDay: ''
    },

    onLoad(options){
        this.setData({
            validDay: options.valid_day,
            pageQuery: options
        })
    },

    toWatchVideo(){
        wx.navigateTo({
            url: '/activity/activitySessionVideo/activitySessionVideo?sessionId=' + this.data.pageQuery.session_id
        })
    }

});