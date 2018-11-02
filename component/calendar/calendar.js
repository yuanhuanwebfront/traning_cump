//  检查传入的日期是否是今天
function checkIsToday(myDate, today){
    let year = myDate.getFullYear(),
        month = myDate.getMonth() + 1,
        day = myDate.getDate(),
        nowYear = new Date(today * 1000).getFullYear(),
        nowMonth = new Date(today * 1000).getMonth() + 1,
        nowDay = new Date(today * 1000).getDate();

    return nowYear === year && nowMonth === month && nowDay === day;
}

function checkIsBeyondToday(date, today){
    let nowDate = new Date(today * 1000),
        day = nowDate.getDate(),
        month = nowDate.getMonth() + 1,
        year = nowDate.getFullYear();

    let flag = false;

    if(date.year > year){
        flag = true;
    }else if(date.year === year){
        if(date.month > month){
            flag = true;
        }else if(date.month === month){
            if(date.day > day){
                flag = true
            }
        }
    }


    date.isBeyondToday = flag;
}

/*
*   检查今天有没有练习
*   @params     date     日期对象，应当有 day, month, year这三个key
*   @params     practiceList    练习日期列表，元素为时间戳
* */
function checkHasPractice(date, practiceList){


    practiceList.forEach(item => {

        let dateInfo = new Date(item * 1000),
            year = dateInfo.getFullYear(),
            month = dateInfo.getMonth() + 1,
            day = dateInfo.getDate();

        if(year === date.year && month === date.month && day === date.day){
            date.hasPractice = true;
        }

    })



}
/*
*   将构造好的日历数据导出，根据用户有没有连续练习生成整个日历
*   @params     arr     构造好的日历数据
*   arr为一个二维数组，第一层的元素为日历的某一行所有数据
*                     第二层的元素为某一行的所有日期
* */
function renderCalendarByArr(arr){

    arr.forEach(itemArr =>{

        itemArr.forEach((item, index) => {

            //  数组内元素不为空并且不是今天以后的日期
            if(item !== 0 && !item.isBeyondToday){

                //  true 或者 undefined
                let studyStatus = item.hasPractice;

                if(index === 0){
                    if(itemArr[1] !== 0){
                        item.isLeftBorder = studyStatus === itemArr[1].hasPractice && !(itemArr[1].isToday && !itemArr[1].hasPractice);
                        item.isRightBorder = false;
                    }
                }else if(index === 6){
                    //  日历最后一个   是否有有边框取决于是否和左边的状态相同  并且左边不为0
                    item.isRightBorder = (studyStatus === itemArr[5].hasPractice) && (itemArr[5] !== 0);
                    item.isLeftBorder = false;
                }else{

                    if(itemArr[index - 1] === 0){
                        item.isLeftBorder = studyStatus === itemArr[index + 1].hasPractice && !(itemArr[index + 1].isToday && !(itemArr[index + 1].hasPractice));
                    }else if(itemArr[index + 1] === 0){
                        item.isRightBorder = studyStatus === itemArr[index - 1].hasPractice;
                    }else{

                        let leftStatus = itemArr[index - 1].hasPractice,
                            rightStatus = itemArr[index + 1].hasPractice;

                        item.isLeftBorder = studyStatus === rightStatus && studyStatus !== leftStatus && !(itemArr[index + 1].isToday && !itemArr[index + 1].hasPractice);
                        item.isMiddle = (studyStatus === rightStatus && studyStatus === leftStatus);

                        item.isRightBorder = (studyStatus !== rightStatus || (itemArr[index + 1].isToday && !studyStatus) ) && studyStatus === leftStatus;

                        if(itemArr[index + 1].isToday){
                            item.isRightBorder = item.isRightBorder && (itemArr[index + 1].hasPractice ? studyStatus !== rightStatus : true);
                        }

                    }
                }

            }
        })

    })



}

Component({

    properties: {
        startTime: {
            type: Number,
            observer (newVal, oldVal){
                this.renderCalender();
            }
        },
        endTime: {
            type: Number
        },
        today: {
            type: Number
        },
        selectDay: {
            type: Array,
            value: [],
            observer (newVal, oldVal){
                this.renderCalender();
            }
        }
    },


    data: {
        weekList: ['日', '一', '二', '三', '四', '五', '六'],
    },

    methods: {
        renderCalender (){
            // wx.showLoading({mask: true});
            let startDate = new Date(this.data.startTime * 1000),
                startDayIndex = startDate.getDay(),
                startDayInfo = {
                    timeStamp: this.data.startTime,
                    day: startDate.getDate(),
                    month: startDate.getMonth + 1,
                    year: startDate.getFullYear(),
                    isToday: checkIsToday(startDate, this.data.today),
                    arrIndex: startDayIndex,
                },
                initArr = [0, 0, 0, 0, 0, 0, 0],
                calendarArr = [],
                allDays = Math.ceil((this.data.endTime - this.data.startTime) / (60 * 60 * 24) + 1);

            checkIsBeyondToday(startDayInfo, this.data.today);
            checkHasPractice(startDayInfo, this.data.selectDay);


            //  初始化的时候  先push第一行数据
            initArr[startDayIndex] = {...startDayInfo};
            calendarArr.push(initArr);

            for(let i = 0; i < allDays - 1; i++){

                let arrIndex = calendarArr.length - 1,
                    pushDate = new Date((this.data.startTime + 60 * 60 * 24 * i) * 1000),
                    dateInfo = {
                        timeStamp: this.data.startTime + 60 * 60 * 24 * i,
                        day: pushDate.getDate(),
                        month: pushDate.getMonth() + 1,
                        year: pushDate.getFullYear(),
                        isToday: checkIsToday(pushDate, this.data.today),
                        arrIndex: startDayIndex > 6 ? 0 : startDayIndex
                    };
                checkIsBeyondToday(dateInfo, this.data.today);
                checkHasPractice(dateInfo, this.data.selectDay);
                //  如果 startDayIndex  大于6   那么应该push一个新数组，新数组第一个元素为pushDate
                if(startDayIndex > 6){
                    calendarArr.push([dateInfo, 0, 0, 0, 0, 0, 0]);
                    startDayIndex = 0;
                }else{
                    calendarArr[arrIndex][startDayIndex] = dateInfo;
                }

                startDayIndex ++;
            }

            renderCalendarByArr(calendarArr);

            this.setData({
                calendarArr
            }, () => {
                // wx.hideLoading();
            })

        },

        jumpPage (){
            this.triggerEvent('jumpinfo');
        }
    }

});