Page({


    data: {
        webViewUrl: ""
    },


    onLoad (options){
        this.setData({
            webViewUrl: decodeURI(options.url)
        })
    }


});