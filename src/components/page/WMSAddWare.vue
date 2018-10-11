<template>
	<div>
		<div class="crumbs">
			<el-breadcrumb separator="/">
				<el-breadcrumb-item><i class="el-icon-date"></i> 库位管理</el-breadcrumb-item>
				<el-breadcrumb-item>新建库位</el-breadcrumb-item>
			</el-breadcrumb>
		</div>
		<div class="container">
			<el-tabs v-model="message">
				<el-tab-pane label="新建库位" name="first">
					<div class="form-box">
						<el-form ref="form" :rules="rules" :model="form" label-width="85px">
							<el-form-item label="库位名称" prop="name">
								<el-input v-model.trim="form.name"></el-input>
							</el-form-item>
							<el-form-item>
								<el-button type="primary" @click="onSubmit('form')">新建</el-button>
							</el-form-item>
						</el-form>
					</div>

				</el-tab-pane>
				<!--<el-tab-pane label="批量上传" name="second">
					<template v-if="message === 'second'">
						<el-form ref="form" :model="form" label-width="85px">
							<el-form-item label="批量上传">
								<el-upload class="upload-demo" drag action="" :file-list="fileList2" :on-remove="handleRemove2" :auto-upload="false" :on-change="changeFile2" :limit="5" multiple>
									<i class="el-icon-upload"></i>
									<div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
									<div class="el-upload__tip" slot="tip">只能上传xls文件</div>
								</el-upload>
								<a type="primary" href="">模板下载</a>
							</el-form-item>
						</el-form>
					</template>
				</el-tab-pane>-->
			</el-tabs>
		</div>
	</div>
</template>

<script>
	export default {
		name: 'addWare',
		data: function() {
			return {
				message: 'first',
				form: {
					name: '',
				},
				rules: {
					name: [{
						required: true,
						message: '请输入名称',
						trigger: 'blur'
					}],

				},
			}
		},
		methods: {
			submitUpload(content) {
				this.formData = new FormData();
				formData.append('file', content.file)
			},
			onSubmit(formName) {
				let formData = new FormData()
				this.$refs[formName].validate((valid) => {
					if(valid) {
						this.$message.success('功能尚未开放哦')
						this.form.name = ''
//						if (this.fileList.length == 0){
//							this.$message.error('请上传产品图片')
//							return false
//						}
//						formData.append('product[fnsku]', this.form.fnsku)
//						this.fileList.forEach((item) => {
//							formData.append('product_pictures[]', item.raw)
//						})
//						this.fileList2.forEach((item) => {
//							formData.append('package_pictures[]', item.raw)
//						})
//						let config = {
//							headers: {
//								'Authorization': this.token_admin
//							}
//						}
//						this.$axios.post('http://47.74.177.128:3000/products', formData, config).then((res) => {
//							if(res.data.code == 200) {
//								this.$message.success('提交成功！');
//								this.$refs['form'].resetFields()
//								this.form.length = ''
//							}
//						}).catch((res) => {
//							this.$message.error('提交有误')
//						})
					} else {
						this.$message.error("请填写完整信息")
						return false
					}
				})
			},
		}
	}
</script>