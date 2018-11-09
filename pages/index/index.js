import {
	getSessionDetail,
	getSessionList
} from '../../common/$http';

let mySa = require('../../common/sa.js');

let pageParams = {
	page: 1,
	size: 20,
	tag_id: 0,
	session_type: 1
};

let app = getApp();

let tempList = [];

function renderSessionItem(item) {
	return {
		id: item.id,
		source: item.category_id,
		session_name: item.session_name,
		image_phone: item.image_phone,
		notice_list: item.notice_list,
		enrollNum: item.enroll_num_info.addon_enroll_num
	}
}

Page({

	data: {
		activeTag: 0,
		listEnd: false,
		tagList: [],
		swiperList: [],
		sessionList: [],
		isFirstEnter: true,
		showFloatImage: false,
		showGuideDialog: false,
		floatImage: '',
		smallFloatImage: ''
	},

	onLoad: function() {
		mySa.trackEvent(11, {
			page_id: 1000
		});
		this.setData({
			showGuideDialog: !wx.getStorageSync('hideGuideDialog')
		});
		this.initHomePage();
	},

	onShow() {
		let hasLogin = wx.getStorageSync('sid');
		if (hasLogin && !app.globalData.hasListLoginRefresh && !this.data.isFirstEnter) {
			this.getSessionList(true);
			app.globalData.hasListLoginRefresh = true;
		}
	},

	onPullDownRefresh() {
		this.getSessionList(true, true);
	},

	onReachBottom() {
		if (!this.data.listEnd) {
			pageParams.page++;
			this.getSessionList();
		}
	},

	onTabItemTap() {
		mySa.trackEvent(4, {
			page_name: "1000",
			click_id: 1000
		})
	},

	onShareAppMessage() {
		return {
			title: '给你推荐一个超赞的学瑜伽小程序',
			path: '/pages/index/index'
		}
	},

	initHomePage() {

		let sid = wx.getStorageSync('sid'),
			params = {
				tag_id: 0,
				session_type: 1,
			};

		if (sid) params.sid = sid;

		getSessionDetail(params, this.handleHomePage, 'session/yogaO2SchoolList')

	},

	handleHomePage(data) {

		data.yogao2school_list = data.yogao2school_list.map(renderSessionItem);

		tempList = [...data.yogao2school_list];

		if (!this.data.showGuideDialog) {
			this.checkPopupStatus(data.Suspended_Adv);
		}
		this.setData({
			swiperList: data.banner_list,
			tagList: data.tag_list,
			sessionList: tempList,
			listEnd: data.yogao2school_list.length < 20,
			isFirstEnter: false,
			popData: data.Suspended_Adv,
			floatImage: data.Suspended_Adv.image || '',
			smallFloatImage: data.Suspended_Adv.images || ''
		});
	},

	//  弹窗需要根据put_in_type区分展示次数为   每天展示一次( type === 2 )  只展示一次( type === 3 )
	//  先检测本地是否有缓存弹窗数据，没有的话说明第一次请求，直接缓存，弹窗直接显示，记录一个show_time;
	//  如果有缓存弹窗数据,
	//      判断id是否相同,id相同
	//              put_in_type === 2 (判断show_time是否属于今天, 是今天显示悬浮按钮，不显示弹窗)
	//                                                       不是今天显示弹窗，不现实悬浮按钮
	//              put_in_type === 3 (不显示弹窗，显示悬浮按钮)
	//      id不同, 重新保存最新的data,重复上面的判断
	checkPopupStatus(popupData) {

		let vm = this,
			storagePopup = wx.getStorageSync('popup-info');

		function resetData(data) {
			data.SHOW_TIME = new Date().getTime();
			vm.setData({
				showFloatImage: true
			})
		}

		function checkIsToday(time) {
			let now = new Date().getFullYear() + new Date().getMonth() + new Date().getDate(),
				myTime = new Date(time).getFullYear() + new Date(time).getMonth() + new Date(time).getDate();
			return now === myTime;
		}

		if (popupData && popupData.id) {
			if (storagePopup && storagePopup.id === popupData.id) {
				this.setData({
					showFloatImage: !checkIsToday(storagePopup.SHOW_TIME) && storagePopup.put_in_type === 2,
				});
			} else {
				resetData(popupData);
			}

			wx.setStorageSync('popup-info', {
				id: popupData.id,
				put_in_type: popupData.put_in_type,
				SHOW_TIME: new Date().getTime()
			});
		} else {
			wx.setStorageSync('popup-info', null);
		}



	},

	//  获取课程列表数据  isRefresh 是否重新刷新列表
	getSessionList(isRefresh, noNeedRefresh) {

		pageParams.tag_id = this.data.activeTag;

		if (isRefresh) {
			tempList = [];
			pageParams.page = 1;
		}

		getSessionList(pageParams, this.handleSessionList, noNeedRefresh);

	},

	handleSessionList(data) {

		data = data.map(renderSessionItem);

		tempList = [...tempList, ...data];

		this.setData({
			sessionList: tempList,
			listEnd: data.length < pageParams.size
		});
		wx.stopPullDownRefresh();
	},

	//  切换tab
	changeTab(e) {

		let tagId = e.target.dataset.id ? parseInt(e.target.dataset.id) : '';

		if (this.data.activeTag === tagId) return;

		this.setData({
			activeTag: tagId
		});

		pageParams.tag_id = tagId;

		this.getSessionList(true);

	},

	hideFloatImage() {
		this.setData({
			showFloatImage: false
		})
	},

	//  跳到课程详情页
	goDetail(e) {
		let {
			id,
			source
		} = e.target.dataset.session;
		wx.navigateTo({
			url: '../../package/detail/detail?session_id=' + id + '&source=' + source
		})
	},

	toBannerPage(e) {

		//  跳转类型   1 (外链)  100(小程序内部页)
		let {
			sourceType,
			content_url
		} = e.target.dataset.info,
			url = sourceType === 1 ? '../webView/webView?url=' + encodeURI(content_url) : content_url;

		console.log(e.target.dataset.info);
		console.log(content_url);

		wx.navigateTo({
			url
		});
	},

	closeDialog(e) {
		wx.setStorageSync('hideGuideDialog', true);
		this.setData({
			showGuideDialog: false
		});
		this.checkPopupStatus(this.data.popData);
	}

});