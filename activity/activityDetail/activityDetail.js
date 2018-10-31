let app = getApp();


Page({

    data: {
        sessionImage: 'http://qiniucdn.dailyyoga.com.cn/e2/19/e21918c26897cb13ee79dd28755fd9ac.png',
        sessionInfo: {
            finalPrice: [0, 2],
            realPrice: 12,
            joinPerson: 200,
            dayCount: 0,
            hourCount: 0,
            minuteCount: 0,
            secondCount: 0,
            millsCount: 0
        }
    },

    onLoad(){
        this.countDown();
    },

    countDown(){

        let vm = this,
            minuteNum = 1000 * 60,
            hourNum = 1000 * 60 * 60,
            dayNum = hourNum * 24,
            endTime = 1541001600 * 1000;

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



    }







});