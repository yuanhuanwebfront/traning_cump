let app = getApp();

const mock = {
    //  活动课程图
    sessionImage: 'http://qiniucdn.dailyyoga.com.cn/e2/19/e21918c26897cb13ee79dd28755fd9ac.png',
    //  活动原价
    realPrice: 12,
    //  参与人数
    joinPerson: 200,
    //  活动结束时间
    end_time: 1541001600,
    //  课程标题
    session_title: "课程标题",
    //  课程副标题
    session_subtitle: "课程副标题",
    //  邀请用户的列表
    invite_list: [{
        uid: 123213,
        logo: ""
    }],
    //  邀请几个人算活动完成
    full_person: 5
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
        showEndDialog: false
    },

    onLoad(){
        this.countDown();
        this.setData({
            activityDetail: mock
        })
    },

    countDown(){

        let vm = this,
            minuteNum = 1000 * 60,
            hourNum = 1000 * 60 * 60,
            dayNum = hourNum * 24,
            endTime = 1541001600 * 1000;

        if(endTime - new Date().getTime() <= 0){
            return;
        }

        setInterval(() => {

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

    openInviteDialog(){
        this.setData({
            showInviteDialog: true
        })
    },

    openShareInDialog(){
        this.setData({
            showShareInDialog: true
        })
    },

    openEndDialog(){
        this.setData({
            showEndDialog: true
        })
    },

    closeDialog(e){
        let closeStatus = e.target.dataset.close === '1';
        if(closeStatus){
            this.setData({
                showInviteDialog: false,
                showShareInDialog: false,
                showEndDialog: false
            })
        }

    }





});