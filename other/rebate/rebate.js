import {getRebate} from '../../common/$http';
import {wxSetNavTitle} from '../../common/common';

function handleMoney(money) {
    return (money / 100).toFixed(2);
}

Page({

    data: {
        info: {type: 2},
        income_list: []
    },

    onLoad (){
        let params = {
            sid: wx.getStorageSync('sid')
        };

        wxSetNavTitle('我的返利');
        getRebate(params, this.handleRebateInfo, 'appindex');
    },

    handleRebateInfo (data){

        data.income_list.forEach( item => {
            item.money = handleMoney(item.money);
        });

        this.setData({
            income_list: data.income_list,
            "info.balance": handleMoney(data.balance),
            "info.totalIncome": handleMoney(data.total_income),
            "info.overMoney": handleMoney(data.overdue_amount),
            "info.overDate": data.overdue_date,
        })
    },

    toRebateDetail (e){
        let type = e.target.dataset.type;
        wx.navigateTo({
            url: '../rebateDetail/rebateDetail?type=' + type
        })
    }

});