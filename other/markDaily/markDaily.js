import {diaryRequest} from '../../common/$http';

let app = getApp();

let commonParams = {};

let listParams = {};

const shareImage = 'http://qiniucdn.dailyyoga.com.cn/26/8b/268bb7417d51b432419373171220a634.jpeg';

Page({

    data: {
        tabType: 'class',
        isShareEnter: false,
        classDailyList: [],
        mineDailyList: [],
        invite_euid: "",
        pageLoaded: false,
        emptyImg: 'http://qiniucdn.dailyyoga.com.cn/8c/82/8c82090346ccd81acedc440c76d344e2.png'
    },

    /*
    *   页面参数   options
    *   shareStatus  若为  0表示不是分享页面   1是我的日记分享    2是单次日记分享
    *   tab          若为 'class' 则表示显示班级tab      若为 'mine' 则显示 我的tab
    * */
    onLoad(options) {

        commonParams = {
            page: 1,
            page_size: 10,
            listEnd: false
        };
        listParams = {
            'class': {...commonParams},
            'mine': {...commonParams}
        };

        this.setData({
            shareStatus: options.shareStatus || '0',
            tabType: options.tab || 'class',
            sessionId: options.yoga_o2_session_id,
            invite_euid: options.invite_euid || '',
            globalQuery: options
        });


        //  第一次进入这个页面并且shareStatus为0
        if (options.shareStatus === '0') {
            this.getSessionInfo();
            this.firstGetList(0, options.yoga_o2_session_id);
        } else {
            //  从分享出来的进入
            this.getDairyListByType(options.yoga_o2_session_id, options.diaryId);
        }

        wx.hideShareMenu();
    },

    onPullDownRefresh() {
        listParams[this.data.tabType].page = 1;
        listParams[this.data.tabType].listEnd = false;
        this.getDairyListByType(this.data.sessionId, this.data.globalQuery.diaryId, true);
    },

    onReachBottom() {

        let sessionId = this.data.sessionId;

        listParams[this.data.tabType].page++;

        if (!listParams[this.data.tabType].listEnd) {
            this.getDairyListByType(sessionId, this.data.globalQuery.diaryId);
        }
    },

    getSessionInfo() {
        wx.showLoading({mask: true});
        let params = {
            yoga_o2_session_id: this.data.sessionId,
            mark_location: this.data.tabType === 'class' ? '1' : '2'
        };
        diaryRequest(params, 'getUserDiarySessionInfoByO2SessionId', this.handleSessionInfo, 'GET');
    },

    handleSessionInfo(data) {
        this.setData({
            pageInfo: data,
            pageLoaded: true
        })
    },

    //  非分享页面进入日记列表获取班级日记和个人日记 (通过shareStatus === 0) 判断
    firstGetList(diaryType, sessionId) {

        let params = {
            yoga_o2_session_id: sessionId,
            diary_type: diaryType,
            page: commonParams.page,
            page_size: commonParams.page_size
        };

        diaryRequest(params, 'getDiaryByO2SessionId', this.handleFirstList, 'GET');

    },

    handleFirstList(res) {

        listParams.class.listEnd = res.user_class_diary.list.length < commonParams.page_size;
        listParams.mine.listEnd = res.user_diary.list.length < commonParams.page_size;

        this.setData({
            classDailyList: res.user_class_diary.list,
            mineDailyList: res.user_diary.list,
            invite_euid: res.user_diary.invite_euid || res.user_class_diary.invite_euid
        })

    },

    /*
    *   获取单个tab下的日记列表数据
    *   @params sessionId       课程ID
    *   @params diaryId         日记ID
    *   @params needRefresh     是否是下拉刷新操作(需要重置list和page)
    * */
    getDairyListByType(sessionId, diaryId, needRefresh) {

        let vm = this,
            listInfo = listParams[this.data.tabType],
            params = {
                yoga_o2_session_id: sessionId,
                diary_type: vm.data.tabType === 'class' ? 2 : 1,
            };

        if (needRefresh) {
            listInfo.page = 1;
        }

        //  分享单个日记  不会有上拉加载
        if (diaryId) {
            params.yoga_o2_diary_id = diaryId;
            params.yoga_o2_session_id = sessionId;
            params.invite_euid = this.data.globalQuery.invite_euid;
            diaryRequest(params, 'getUserShareDiaryInfo', this.handleDiaryItemFromShare, 'GET');
        }

        //  分享班级日记  会有上拉加载
        if (!diaryId && this.data.globalQuery.invite_euid) {
            params.page = listInfo.page;
            params.page_size = commonParams.page_size;
            params.invite_euid = this.data.globalQuery.invite_euid;
            diaryRequest(params, 'getUserShareDiaryList', res => {
                this.handleDiaryListFromShare(res, needRefresh)
            }, 'GET');
        }

        //  直接进入页面
        if (!diaryId && !this.data.globalQuery.invite_euid) {
            params.page = listInfo.page;
            params.page_size = commonParams.page_size;
            diaryRequest(params, 'getDiaryByO2SessionId', res => {
                vm.handleDiaryList(res, needRefresh);
            }, 'GET');
        }
    },

    handleDiaryItemFromShare(data) {
        listParams.mine.listEnd = true;
        this.handleSessionInfo(data.heard);
        this.setData({mineDailyList: [...data.list.list]});
        wx.stopPullDownRefresh();
    },

    handleDiaryListFromShare(data, needRefresh) {
        listParams.mine.listEnd = data.list.list.length < commonParams.page_size;
        this.handleSessionInfo(data.heard);
        if (needRefresh) {
            this.setData({
                mineDailyList: [...data.list.list]
            });
        } else {
            let tempList = data.list.list;
            this.setData({
                mineDailyList: [...this.data.mineDailyList, ...tempList]
            });
        }
        wx.stopPullDownRefresh();
    },

    //  dairyType   1为个人  2为班级  根据tab区分
    handleDiaryList(data, needRefresh) {

        let tempList = data.list;

        if (this.data.tabType === 'mine') {
            if (tempList.length < commonParams.page_size) listParams.mine.listEnd = true;
            this.setData({
                mineDailyList: needRefresh ? [...tempList] : [...this.data.mineDailyList, ...tempList],
                invite_euid: data.invite_euid
            })
        } else if (this.data.tabType === 'class') {
            if (tempList.length < commonParams.page_size) listParams.class.listEnd = true;
            this.setData({
                classDailyList: needRefresh ? [...tempList] : [...this.data.classDailyList, ...tempList],
                invite_euid: data.invite_euid
            })
        }

        wx.stopPullDownRefresh();
    },

    switchTab(e) {
        let {type} = e.target.dataset;
        this.setData({
            tabType: type
        })
    },

    //  我的日记分享出去  点击顶部banner进入课程详情页
    toMySession() {
        let inviteParams = this.data.invite_euid ? '&invite_euid=' + this.data.invite_euid : '';

        if (this.data.shareStatus !== '0') {
            wx.navigateTo({
                url: '../../package/detail/detail?session_id=' + this.data.sessionId + inviteParams
            })
        }

    },

    toRankPage() {
        wx.navigateTo({
            url: '../../session/sessionRank/sessionRank?session_id=' + this.data.sessionId
        })
    },

    toClassDiary() {
        this.setData({
            tabType: 'class'
        })
    },

    giveZan(e) {

        wx.showLoading({mask: true});

        let vm = this,
            {index, active, item, id, count} = e.target.dataset,
            tempList = [...item.like_list],
            listType = this.data.tabType === 'class' ? 'classDailyList' : 'mineDailyList',
            params = {
                status: active ? 0 : 1,
                yoga_o2_diary_id: id
            },
            obj = {};

        if (!app.checkUserLogin()) {
            wx.navigateTo({
                url: '../../pages/login/login'
            })
        }

        //  TODO 打卡逻辑
        diaryRequest(params, 'userLikeDiaryBySessionId', res => {
            obj[listType + '[' + index + '].is_like'] = !active;

            let userInfo = app.globalData.userInfo,
                pushInfo = {
                    Thumbnail: userInfo.Thumbnail,
                    nickname: userInfo.nickName,
                    uid: userInfo.uid,
                };

            if (obj[listType + '[' + index + '].is_like']) {
                count = parseInt(count) + 1;
                tempList.push(pushInfo);
            } else {
                count = parseInt(count) - 1;
                tempList = tempList.filter(item => item.uid !== pushInfo.uid);
            }

            obj[listType + '[' + index + '].like_list'] = [...tempList];
            obj[listType + '[' + index + '].like_count'] = count;

            vm.setData(obj);

            wx.hideLoading();
        });

    },

    backHome() {
        wx.switchTab({
            url: '/pages/index/index'
        })
    },

    onShareAppMessage(from) {

        let shareUrl = 'other/markDaily/markDaily?tab=mine&shareStatus=1&yoga_o2_session_id=' + this.data.sessionId
            + '&invite_euid=' + this.data.invite_euid;

        return {
            title: app.globalData.userInfo.nickName + '的打卡日记 @' + this.data.pageInfo.session_name,
            path: shareUrl,
            imageUrl: shareImage
        }

    },


});