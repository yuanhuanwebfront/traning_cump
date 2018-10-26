import {getOrder} from "../../common/$http";
import {formatTime, wxSetNavTitle} from "../../common/common";

let pageParams = {
    page: 1,
    page_size: 20
};

let tempList = [];

Page({
    data: {
        list: [],
        listEnd: false
    },

    onLoad() {

        tempList = [];
        pageParams.page = 1;
        pageParams.order_type = 2;
        pageParams.sid = wx.getStorageSync('sid');

        wxSetNavTitle('我的订单');

        getOrder(pageParams, this.handleOrderList, 'classifiedOrderList')

    },

    onReachBottom (){
        if(!this.data.listEnd){
            pageParams.page++;
            getOrder(pageParams, this.handleOrderList, 'classifiedOrderList')
        }

    },

    handleOrderList(data) {

        data.list.forEach(item => {

            //  找到product_list里面的source_type == 21 的商品 作为列表主商品展示
            let mainSession = item.product_list.find(item => {
                return item.source_type === 21;
            });

            if(mainSession){
                item.buyTime = formatTime(mainSession.create_time * 1000, 'yyyy-mm-dd');
                item.startTime = formatTime(mainSession.start_time * 1000, 'yyyy-mm-dd');
                item.sessionImage = mainSession.image || "";
            }

        });

        tempList = [...tempList, ...data.list];

        this.setData({
            list: tempList,
            listEnd: data.list.length < pageParams.page_size
        })
    },

    toOrderDetail(e){
        wx.navigateTo({
            url: '../orderDetail/orderDetail?orderId=' + e.currentTarget.dataset.order.order_id
        })
    }

});