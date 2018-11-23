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
        wx.redirectTo({
            url: '/activity/activitySessionVideo/activitySessionVideo?session_id='
            + this.data.pageQuery.session_id + '&activity_id='
            + this.data.pageQuery.activity_id
        })
    }

});