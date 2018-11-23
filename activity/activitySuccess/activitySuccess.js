Page({

    data: {
        validDay: ''
    },

    onLoad(options){
        this.setData({
            validDay: options.valid_day,
            pageQuery: options
        })
    }

});