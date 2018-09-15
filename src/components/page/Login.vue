<template>
	<div class="login-wrap">
		<div class="ms-title">海外仓系统</div>
		<div class="ms-login">
			<el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="0px" class="demo-ruleForm">
				<el-form-item prop="username">
					<el-input v-model.trim="ruleForm.username" placeholder="username"></el-input>
				</el-form-item>
				<el-form-item prop="password">
					<el-input type="password" placeholder="password" v-model.trim="ruleForm.password" @keyup.enter.native="submitForm('ruleForm')"></el-input>
				</el-form-item>
				<el-checkbox v-model="checked">记住密码</el-checkbox>
				<br><br>
				<div class="login-btn">
					<!--<el-button type="primary" @click="submitForm('ruleForm')">普通用户登录</el-button>-->
					<el-col :span="12">
						<el-button type="primary" @click="submitForm('ruleForm')">普通用户登录</el-button>
					</el-col>
					<el-col :span="12">
						<el-button type="primary" @click="submitAdmin('ruleForm')">管理员登录</el-button>
					</el-col>				
				</div>
				<p style="font-size:12px;line-height:30px;color:#999;">没有账号?
					<router-link to="/register" class="logout">马上注册</router-link>
				</p>
			</el-form>
		</div>
	</div>
</template>

<script>
	export default {
		data: function() {
			return {
				checked: true,
				ruleForm: {
					username: '',
					password: ''
				},
				rules: {
					username: [{
						required: true,
						message: '请输入用户名',
						trigger: 'blur'
					}],
					password: [{
						required: true,
						message: '请输入密码',
						trigger: 'blur'
					}]
				}
			}
		},
		mounted() {
			this.getCookie()
		},
		methods: {
			submitForm(formName) {
				if(this.checked == true) {
					this.setCookie(this.ruleForm.username, this.ruleForm.password, 7)
				}else {
					this.clearCookie()
				}
				this.$refs[formName].validate((valid) => {
					if(valid) {
						this.$axios.post('/authentication', {
								username: this.ruleForm.username,
								password: this.ruleForm.password
						},
						).then((res) => {
							localStorage.setItem('ms_username', this.ruleForm.username);
							localStorage.setItem('token', res.data.data.token);
							console.log(res)
							this.$router.push('/');
						}).catch((res) => {
							this.$message.error('用户名或密码错误')
						})
					} else {
						console.log('error submit!!');
						return false;
					}
				});
			},
			submitAdmin(formName) {
				if(this.checked == true) {
					this.setCookie(this.ruleForm.username, this.ruleForm.password, 7)
				}else {
					this.clearCookie()
				}
				this.$refs[formName].validate((valid) => {
					if(valid) {
						this.$axios.post('/admin/authentication', {
								username: this.ruleForm.username,
								password: this.ruleForm.password
						},
						).then((res) => {
							localStorage.setItem('ms_username', this.ruleForm.username);
							localStorage.setItem('token_admin', res.data.data.token);
							console.log(res)
							this.$router.push('/');
						}).catch((res) => {
							this.$message.error('用户名或密码错误')
						})
					} else {
						console.log('error submit!!');
						return false;
					}
				});
			},
			//设置cookie
			setCookie(c_name, c_pwd, exdays) {
				let exdate = new Date()
				exdate.setTime(exdate.getTime() + 24 * 60 * 60 * 100 * exdays)
				window.document.cookie = "username" + "=" + c_name + ";path=/;expires=" + exdate.toGMTString()
				window.document.cookie = "userPwd" + "=" + c_pwd + ";path/;expires=" + exdate.toGMTString()
			},
			//读取cookie
			getCookie: function() {
				if (document.cookie.length > 0) {
					let arr = document.cookie.split(';')
					for(let i=0; i < arr.length; i++) {
						let arr2 = arr[i].split('=')
						if(arr2[0] == 'username') {
							this.ruleForm.username = arr2[1]
						}else if(arr2[0] == ' userPwd') {
							this.ruleForm.password = arr2[1]
						}
					}
				}
			},
			//清除cookie
			clearCookie: function() {
				this.setCookie('', '', -1)
			},
			//注册
			register() {
				this.$router.push('/404');
			},
		}
	}
</script>

<style scoped>
	.login-wrap {
		position: relative;
		width: 100%;
		height: 100%;
	}
	
	.ms-title {
		position: absolute;
		top: 50%;
		width: 100%;
		margin-top: -230px;
		text-align: center;
		font-size: 30px;
		color: #fff;
	}
	
	.ms-login {
		position: absolute;
		left: 50%;
		top: 50%;
		width: 300px;
		height: 170px;
		margin: -150px 0 0 -190px;
		padding: 40px;
		border-radius: 5px;
		background: #fff;
	}
	
	.login-btn {
		text-align: center;
	}
	
	.login-btn button {
		width: 90%;
		height: 36px;
	}
</style>