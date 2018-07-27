<template>
	<div class="login-wrap">
		<div class="ms-title">深圳闪速供应链有限公司</div>
		<div class="ms-login">
			<el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="0px" class="demo-ruleForm">
				<el-form-item prop="username">
					<el-input v-model.trim="ruleForm.username" placeholder="用户名"></el-input>
				</el-form-item>
				<el-form-item prop="pass">
					<el-input type="password" v-model.trim="ruleForm.pass" placeholder="密码" @keyup.enter.native="submitForm('ruleForm')"></el-input>
				</el-form-item>
				<el-form-item prop="checkpass">
					<el-input type="password" v-model.trim="ruleForm.checkpass" placeholder="确认密码" @keyup.enter.native="submitForm('ruleForm')"></el-input>
				</el-form-item>
				<el-form-item prop="email">
					<el-input type="email" v-model.trim="ruleForm.email" placeholder="邮箱" @keyup.enter.native="submitForm('ruleForm')"></el-input>
				</el-form-item>
				<el-form-item prop="company">
					<el-input type="company" v-model.trim="ruleForm.company" placeholder="公司" @keyup.enter.native="submitForm('ruleForm')"></el-input>
				</el-form-item>
				<el-form-item prop="tel">
					<el-input type="tel" v-model.trim="ruleForm.tel" placeholder="电话" @keyup.enter.native="submitForm('ruleForm')"></el-input>
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
			var vaildatePass = (rule, value, callback) => {
				if(value === '') {
					callback(new Error('请输入密码'));
				} else {
					if(this.ruleForm.checkpass !== '') {
						this.$refs.ruleForm.validateField('checkPass');
					}
					callback();
				}
			};
			var validatePass2 = (rule, value, callback) => {
				if(value === '') {
					callback(new Error('请再次输入密码'));
				} else if(value !== this.ruleForm.pass) {
					callback(new Error('两次输入密码不一致'));
				} else {
					callback();
				}
			};
			var validateEmail = (rule, value, callback) => {
				var regEmail = /^[A-Za-zd]+([-_.][A-Za-zd]+)*@([A-Za-zd]+[-.])+[A-Za-zd]{2,5}$/;
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
			}
			return {
				ruleForm: {
					username: '',
					pass: '',
					checkpass: '',
					email: '',
					company: '',
					tel: '',
				},
				rules: {
					username: [{
						required: true,
						validator: vaildateUser,
						trigger: 'blur'
					}],
					pass: [{
						required: true,
						validator: vaildatePass,
						trigger: 'blur'
					}],
					checkpass: [{
						required: true,
						validator: validatePass2,
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
					tel: [{
						required: true,
						validator: vaildatePhone,
						trigger: 'blur'
					}],
				}
			}
		},
		methods: {
			submitForm(formName) {
				this.$axios.post('http://47.74.177.128:3000/users', {
					username: this.ruleForm.username,
					password: this.ruleForm.pass,
					email: this.ruleForm.email
				}, {
					headers: {
						'Content-Type': 'application/json; charset=UTF-8'
					}
				}).then((res) => {
					localStorage.setItem('ms_username', this.ruleForm.username);
					localStorage.setItem('token', res.data.data.token);
					console.log(res)
					this.$router.push('/');
				})
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
		height: 350px;
		margin: -150px 0 0 -190px;
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