exports.install = function(Vue, options) {
	Vue.prototype.judge_addproduct = function(arr) {
		for(let i = 0; i < arr.length; i++) {
			if(Number(arr[i])) {				
			} else {
				this.$message.error('您的输入有误，请核对')
				return false
			}			
		}
		return true
	}
	Vue.prototype.judge_inbound = function(arr) {
		if(Number.isInteger(Number(String(arr).replace(/[/]/g, '')))) {
			
		}else {
			this.$message.error('您的输入有误,请重新输入')
			return false
		}
		return true
	}
	Vue.prototype.CloseNotify = function() {
		localStorage.removeItem('notifyidHoliday')
	}
	Vue.prototype.getNotify = function() {
		console.log(1111)
		console.log(localStorage.getItem('token'))
		if(localStorage.getItem('notifyidHoliday') != null || localStorage.getItem('token') == null) {
            return
        }
        this.$notify({
            title: '放假通知',
            dangerouslyUseHTMLString: true,
            message: "致广大的客户朋友: " + `<br>` + `&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp` +"因为有爱，生活变的幸福；新年来临之际，闪速供应链感谢您一直以来对我司的大力支持，祝大家新年新景象，福旺财旺，海外事业蒸蒸日上！为了让您的货物能及时有效的安排，闪速海外仓公布新年假期，请大家提前做好假期期间的发货安排。"+ `<br>` + `&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp` +"美国仓：2019年2月2日-10日放假(美国当地时间)"+ `<br>` + `&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp` + "2019年2月4日--8日仓库安排人员值班，值班期间海外仓只接收货物，不安排理货上架和出库业务 (美国当地时间) 请各位客户知悉并且转告,因此造成不便,敬请谅解。" + `<br><br>` + "感谢各位客户的支持!" + `<br><br>` + "深圳市闪速供应链有限公司",
            position: 'bottom-left',
            onClose: this.CloseNotify,
            duration: 0,
            type: 'info'
        })
        localStorage.setItem('notifyidHoliday', 'notified')
	}
}