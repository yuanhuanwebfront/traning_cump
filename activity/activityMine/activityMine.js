const mock = {
    list: [{
        image: "http://ypycdn.dailyyoga.com.cn/cd/90/cd90fec9fcaac7552a6d718f9a8fca0f.jpeg",
        sessionTitle: "活动标题1",
        subTitle: "活动副标题1",
        price: "10",
        joinPerson: "100",
        status: 1
    },{
        image: "http://ypycdn.dailyyoga.com.cn/cd/90/cd90fec9fcaac7552a6d718f9a8fca0f.jpeg",
        sessionTitle: "活动标题2",
        subTitle: "活动副标题2",
        price: "20",
        joinPerson: "200",
        status: 2
    }]
};

Page({

    data: {
        activityList: mock.list
    },

    backHome(){
        wx.switchTab({
            url: '/pages/index/index'
        })
    }

});