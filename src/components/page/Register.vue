<template>
	<div class="login-wrap">
		<div class="ms-title">海外仓系统</div>
		<div class="ms-login">
			<el-form :model="ruleForm" :rules="rules" status-icon ref="ruleForm" label-width="0px" class="demo-ruleForm">
				<el-form-item prop="username">
					<el-input v-model.trim="ruleForm.username" placeholder="用户名"></el-input>
				</el-form-item>
				<el-form-item prop="pass">
					<el-input type="password" v-model.trim="ruleForm.pass" placeholder="密码" @keyup.enter.native="submitForm('ruleForm')"></el-input>
				</el-form-item>
				<el-form-item prop="checkpass">
					<el-input type="password" v-model.trim="ruleForm.checkpass" placeholder="确认密码" @keyup.enter.native="submitForm('ruleForm')"></el-input>
				</el-form-item>
				<el-form-item prop="name">
					<el-input v-model.trim="ruleForm.name" placeholder="姓名"></el-input>
				</el-form-item>
				<el-form-item prop="email">
					<el-input type="email" v-model.trim="ruleForm.email" placeholder="邮箱" @keyup.enter.native="submitForm('ruleForm')"></el-input>
				</el-form-item>
				<!--<el-form-item prop="company">
					<el-input type="company" v-model.trim="ruleForm.company" placeholder="公司" @keyup.enter.native="submitForm('ruleForm')"></el-input>
				</el-form-item>-->
				<el-form-item prop="phone">
					<el-input type="tel" v-model.trim="ruleForm.phone" placeholder="手机号码" @keyup.enter.native="submitForm('ruleForm')"></el-input>
				</el-form-item>
				<el-form-item prop="card">
					<el-input type="tel" v-model.trim="ruleForm.card" placeholder="身份证" @keyup.enter.native="submitForm('ruleForm')"></el-input>
				</el-form-item>
				<el-form-item prop="remark">
					<el-input type="tel" v-model.trim="ruleForm.remark" placeholder="备注" @keyup.enter.native="submitForm('ruleForm')"></el-input>
				</el-form-item>
				<el-form-item>
					<el-radio v-model="ruleForm.radio" label="true">男</el-radio>
					<el-radio v-model="ruleForm.radio" label="false">女</el-radio>
				</el-form-item>
				<div class="login-btn">
					<el-button type="primary" @click="submitForm('ruleForm')">注册</el-button>
				</div>
				<p style="font-size:12px;line-height:30px;color:#999;">已有账号?
					<router-link to="/login" class="logout">去登陆</router-link>
				</p>
			</el-form>
		</div>
	</div>
</template>

<script>
	export default {
		data: function() {
			var vaildateUser = (rule, value, cb) => {
				var pattern = /^[\w\u4e00-\u9fa5]{3,10}$/g
				if(value === '') {
					cb(new Error('请输入用户名'))
				} else if(!pattern.test(value)) {
					cb(new Error('请输入3-10个字母/汉字/数字/下划线'))
				} else {
					cb()
				}
			};
//			var vaildatePass = (rule, value, callback) => {
//				if(value === '') {
//					callback(new Error('请输入密码'));
//				} else {
//					if(this.ruleForm.checkpass !== '') {
//						this.$refs.ruleForm.validateField('checkPass');
//					}
//					callback();
//				}
//			};
			let validatePass2 = (rule, value, callback) => {
				if(value === '') {
					callback(new Error('请再次输入密码'));
				} else if(value !== this.ruleForm.pass) {
					callback(new Error('两次输入密码不一致'));
				} else {
					callback();
				}
			};
			var validateEmail = (rule, value, callback) => {
				var regEmail = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
				if(value === '') {
					callback(new Error('请输入邮箱'));
				} else if(!regEmail.test(value)) {
					callback(new Error('邮箱格式不正确'));
				} else {
					callback();
				}
			};
			var vaildatePhone = (rule, value, callback) => {
				var reg = 11 && /^((13|14|15|17|18)[0-9]{1}\d{8})$/;
				if(value === '') {
					callback(new Error("请输入手机号码"));
				} else if(!reg.test(value)) {
					callback(new Error("手机格式不正确"));
				} else {
					callback();
				}
			};
			var vaildateCard = (rule, value, callback) => {
				var reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
				if(value === '') {
					callback(new Error("请输入身份证号码"))
				} else if(!reg.test(value)) {
					callback(new Error("身份证格式不对"))
				} else {
					callback()
				}
			};
			return {
				ruleForm: {
					username: '',
					pass: '',
					checkpass: '',
					name: '',
					email: '',
					phone: '',
					card: '',
					sex: '',
					radio: 'true',
					remark: ''
				},

				rules: {
					username: [{
						required: true,
						validator: vaildateUser,
						trigger: 'blur'
					}],
					pass: [{
						required: true,
						message: '请输入密码',
						trigger: 'blur'
					}, {
						min: 6,
						max: 16,
						message: '密码长度不能必须是3~16位',
						trigger: 'change'
					}],
					checkpass: [{
						required: true,
						validator: validatePass2,
						trigger: 'blur'
					}],
					name: [{
						required: true,
						message: '请输入姓名',
						trigger: 'blur'
					}],
					email: [{
						required: true,
						validator: validateEmail,
						trigger: 'blur'
					}],
					company: [{
						required: true,
						message: '请输入公司名称',
						trigger: 'blur'
					}],
					phone: [{
						required: true,
						validator: vaildatePhone,
						trigger: 'blur'
					}],
					card: [{
						required: true,
						validator: vaildateCard,
						trigger: 'blur'
					}],
				}
			}
		},
		methods: {
			submitForm(formName) {
				//				username= this.ruleForm.username,
				//				password= this.ruleForm.pass,
				//				name= this.ruleForm.name,
				//				email= this.ruleForm.email,
				//				phone= this.ruleForm.phone,
				//				card= this.ruleForm.card,
				//				remark= this.ruleForm.remark,
				//				sex= this.ruleForm.radio,
				this.$refs[formName].validate((valid) => {
					if(valid) {
						this.$axios.post('/users', {
							username: this.ruleForm.username,
							password: this.ruleForm.pass,
							name: this.ruleForm.name,
							email: this.ruleForm.email,
							phone: this.ruleForm.phone,
							card: this.ruleForm.card,
							remark: this.ruleForm.remark,
							sex: this.ruleForm.radio
						}, {
							headers: {
								'Content-Type': 'application/json; charset=UTF-8'
							}
						}).then((res) => {
							if(res.data.code == 200) {
								localStorage.setItem('ms_username', this.ruleForm.username);
								localStorage.setItem('token', res.data.data.token);
								this.$router.push('/');
							}							
						})
					} else {
						this.$message.error('请填写完整信息')
					}
				})
				//				this.$axios.post('/users', {
				//					username: this.ruleForm.username,
				//					password: this.ruleForm.pass,
				//					email: this.ruleForm.email
				//				}, {
				//					headers: {
				//						'Content-Type': 'application/json; charset=UTF-8'
				//					}
				//				}).then((res) => {
				//					localStorage.setItem('ms_username', this.ruleForm.username);
				//					localStorage.setItem('token', res.data.data.token);
				//					console.log(res)
				//					this.$router.push('/');
				//				})
				//              this.$refs[formName].validate((valid) => {
				//                  if (valid) {
				//                  	this.$axios.post('47.74.177.128:3000/authentication', 
				//                  	{
				//                  		username: this.ruleForm.username,
				//                  		password: this.ruleForm.pass,
				//                  		email: this.ruleForm.email
				//                  	},
				//                  ).then((res) => {
				//                  	localStorage.setItem('ms_username',this.ruleForm.username);
				//                  	this.$router.push('/');
				//                  })
				//                  } else {
				//                      console.log('error submit!!');
				//                      return false;
				//                  }
				//              });
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
		margin-top: -310px;
		text-align: center;
		font-size: 30px;
		color: #fff;
	}
	
	.ms-login {
		position: absolute;
		left: 50%;
		top: 50%;
		width: 300px;
		height: 500px;
		margin: -240px 0 0 -190px;
		padding: 40px;
		border-radius: 5px;
		background: #fff;
	}
	
	.login-btn {
		text-align: center;
	}
	
	.login-btn button {
		width: 100%;
		height: 36px;
	}
</style>