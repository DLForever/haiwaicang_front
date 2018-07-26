<template>
	<div class="login-wrap">
		<div class="ms-title">深圳闪速供应链有限公司</div>
		<div class="ms-login">
			<el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="0px" class="demo-ruleForm">
				<el-form-item prop="username">
					<el-input v-model.trim="ruleForm.username" placeholder="username"></el-input>
				</el-form-item>
				<el-form-item prop="password">
					<el-input type="password" placeholder="password" v-model.trim="ruleForm.password" @keyup.enter.native="submitForm('ruleForm')"></el-input>
				</el-form-item>
				<div class="login-btn">
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
				ruleForm: {
					username: 'lyh',
					password: '123456'
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
		methods: {
			submitForm(formName) {
				this.$refs[formName].validate((valid) => {
					if(valid) {
						this.$axios.post('http://47.74.177.128:3000/authentication', {
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
				this.$refs[formName].validate((valid) => {
					if(valid) {
						this.$axios.post('http://47.74.177.128:3000/admin/authentication', {
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
		height: 160px;
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