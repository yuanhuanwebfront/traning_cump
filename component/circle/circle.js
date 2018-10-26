//  进度环组件   用来显示一个圆环状的进度条
//  @prop       circleWidth         圆环的圆的边框(单位： rpx)
//  @prop       emptyColor          未被填充的颜色
//  @prop       fullColor           填充的颜色
//  @prop       circleProgress      圆环的进度

let beginPath = -0.5 * Math.PI,
    circleDLen = 74 / 2;

Component({

    properties: {
        circleWidth: {
            type: Number,
            value: 7
        },
        emptyColor: {
            type: String,
            value: '#fff'
        },
        fullColor: {
            type: String,
            value: '#F5E521'
        },
        circleProgress: {
            type: Number,
            value: 70,
            observer(newVal, oldVal) {
                this.drawCircle(newVal);
            }
        }

    },

    attached() {

    },

    methods: {
        drawCircle(progress) {
            let ctx = wx.createCanvasContext('myCanvas', this),
                len = circleDLen - this.data.circleWidth;

            ctx.arc(circleDLen, circleDLen, len, 0, 2 * Math.PI);
            ctx.lineWidth = this.data.circleWidth;
            ctx.strokeStyle = this.data.emptyColor;
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(circleDLen, circleDLen, len, beginPath, beginPath + (progress / 100) * 2 * Math.PI);
            ctx.strokeStyle = this.data.fullColor;
            ctx.stroke();

            ctx.draw();
        }
    }


});