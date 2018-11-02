let app = getApp(),
    globalInterval = null;

const mock = {
    //  活动课程图
    sessionImage: 'http://qiniucdn.dailyyoga.com.cn/e2/19/e21918c26897cb13ee79dd28755fd9ac.png',
    //  活动原价
    realPrice: 12,
    //  参与人数
    joinPerson: 200,
    //  活动结束时间
    end_time: 1541088000,
    //  课程标题
    session_title: "课程标题",
    //  课程副标题
    session_subtitle: "课程副标题",
    //  邀请用户的列表
    invite_list: [{
        uid: 123213,
        logo: "http://ypycdn.dailyyoga.com.cn/93/bf/93bfcd4df08f5d3d43264758c2b6c918.png"
    }, {
        uid: 123213,
        logo: "http://st1.dailyyoga.com.cn/data/be/b8/beb8d753e3df02d1579774c907aca6c8.png"
    }, {
        uid: 123213,
        logo: "http://ypycdn.dailyyoga.com.cn/53/03/5303bfb0d7c3fcbfcdf9a5cdfafb9490.jpeg"
    }, {
        uid: 123213,
        logo: "http://ypycdn.dailyyoga.com.cn/f1/cd/f1cd0083ee6435f2d4865ff199ba55c1.png"
    },{
        uid: 123213,
        logo: "http://ypycdn.dailyyoga.com.cn/f1/cd/f1cd0083ee6435f2d4865ff199ba55c1.png"
    },{
        uid: 123213,
        logo: "http://ypycdn.dailyyoga.com.cn/f1/cd/f1cd0083ee6435f2d4865ff199ba55c1.png"
    }],
    //  邀请几个人算活动完成
    full_person: 7,
    //  0 进行中  1 已结束  2 参与成功
    status: 0,

};


Page({

    data: {
        sessionImage: 'http://qiniucdn.dailyyoga.com.cn/e2/19/e21918c26897cb13ee79dd28755fd9ac.png',
        sessionInfo: {
            finalPrice: [0, 0],
            dayCount: 0,
            hourCount: 0,
            minuteCount: 0,
            secondCount: 0,
            millsCount: 0
        },
        showInviteDialog: false,
        showShareInDialog: false,
        showEndDialog: false,
        activityClass: {
            0: '',
            1: 'finish-session'
        },
        activityDetail: {}
    },

    onLoad() {

        globalInterval = null;
        
        this.setData({
            activityDetail: mock,
            allInviteList: new Array(mock.full_person > 6 ? 6 : mock.full_person).fill({}).map((item, index) =>{
                if(mock.invite_list[index]){
                    return  {...mock.invite_list[index]}
                }
            })
        });
        this.countDown();
    },

    countDown() {

        let vm = this,
            minuteNum =  1000 * 60,
            hourNum = minuteNum * 60,
            dayNum = hourNum * 24,
            endTime = this.data.activityDetail.end_time ? this.data.activityDetail.end_time * 1000 : 0;


        if (endTime - (new Date().getTime() * 1000) <= 0) {
            return false;
        }

        globalInterval = setInterval(() => {

            let nowTimeStamp = endTime - new Date().getTime(),
                dayCount = Math.floor(nowTimeStamp / dayNum),
                hourCount = Math.floor((nowTimeStamp - dayCount * dayNum) / hourNum),
                minuteCount = Math.floor((nowTimeStamp - dayCount * dayNum - hourCount * hourNum) / minuteNum),
                secondCount = Math.floor((nowTimeStamp - dayCount * dayNum - hourCount * hourNum - minuteCount * minuteNum) / 1000),
                millsCount = Math.floor((nowTimeStamp - dayCount * dayNum - hourCount * hourNum - minuteCount * minuteNum - secondCount * 1000) / 100);

            vm.setData({
                'sessionInfo.dayCount': dayCount,
                'sessionInfo.hourCount': hourCount,
                'sessionInfo.minuteCount': minuteCount,
                'sessionInfo.secondCount': secondCount,
                'sessionInfo.millsCount': millsCount
            })


        }, 100)

    },

    onShow(){
        this.countDown();
    },

    onHide(){
        clearInterval(globalInterval);
    },

    onUnload(){
        clearInterval(globalInterval);
    },

    openInviteDialog() {
        this.setData({
            showInviteDialog: true
        })
    },

    openShareInDialog() {
        this.setData({
            showShareInDialog: true
        })
    },

    openEndDialog() {
        this.setData({
            showEndDialog: true
        })
    },

    closeDialog(e) {
        let closeStatus = e.target.dataset.close === '1';
        if (closeStatus) {
            this.setData({
                showInviteDialog: false,
                showShareInDialog: false,
                showEndDialog: false
            })
        }

    },

    backHome(){
        wx.switchTab({url: '/pages/index/index'})
    }





});