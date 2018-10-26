let imgList = {
    1: "http://qiniucdn.dailyyoga.com.cn/bf/b7/bfb75ba4ec9c3632381b2875e7af2764.png",  //  邀请好友图
    2: "http://qiniucdn.dailyyoga.com.cn/27/30/2730e3d4bc16df83b170a7f96bc437f0.png",  //  钱包图
    3: "http://qiniucdn.dailyyoga.com.cn/d6/60/d660cc0f11507bdb72115d733f2dea20.png",  //  瑜乐大学图
    4: "http://qiniucdn.dailyyoga.com.cn/40/fa/40fa9d592b36cf046a262706b32f796c.png",  //  挑战赛图
    5: "http://qiniucdn.dailyyoga.com.cn/ed/6e/ed6e8210c8703be0e1a9217fe109bcdf.png",  //  结伴图
    10: "http://qiniucdn.dailyyoga.com.cn/a9/b2/a9b2ffd5034c8aa55632929d846c434f.png",  //  结伴图
};

Component({

    properties: {
        info: {
            type: Object,
            value: {}
        },
        isHome: {
            type: Boolean,
            value: false
        }
    },

    methods: {
        goWechat (){
            wx.showModal({
                title: '提示',
                content: '提现请在公众号“每日瑜伽教你学”中操作，关注后点击 我的--提现。',
                cancelText: '取消',
                confirmText: '确认',
                confirmColor: '#8CA5FF',
                success: res => {
                   if(res.confirm){
                   //    执行确认的方法
                   }
                }
            })
        }
    },

    data: {
        imgList
    }

});