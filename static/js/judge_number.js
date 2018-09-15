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
}