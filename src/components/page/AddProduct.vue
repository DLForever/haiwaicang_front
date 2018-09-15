<template>
	<div>
		<div class="crumbs">
			<el-breadcrumb separator="/">
				<el-breadcrumb-item><i class="el-icon-date"></i> 产品管理</el-breadcrumb-item>
				<el-breadcrumb-item>新建产品</el-breadcrumb-item>
			</el-breadcrumb>
		</div>
		<div class="container">
			<el-tabs v-model="message">
				<el-tab-pane label="新建产品" name="first">
					<div class="form-box">
						<el-form ref="form" :rules="rules" :model="form" label-width="95px">
							<el-form-item label="产品名称" prop="name">
								<el-input v-model.trim="form.name"></el-input>
							</el-form-item>
							<el-form-item label="FNSKU" prop="fnsku">
								<el-input v-model.trim="form.fnsku" prop=""></el-input>
							</el-form-item>
							<el-form-item label="SKU" prop="sku">
								<el-input v-model.trim="form.sku"></el-input>
							</el-form-item>
							<el-form-item label="申报价值" prop="price">
								<el-input v-model.trim="form.price"></el-input>
							</el-form-item>
							<el-form-item label="外包装尺寸" required>
								<template slot-scope="scope">
									<el-col :span="7">
										<el-form-item prop="length">
											<el-input v-model.trim="form.length" placeholder="长(英寸)"></el-input>
										</el-form-item>
									</el-col>
									<el-col class="line" :span="1">-</el-col>
									<el-col :span="7">
										<el-form-item prop="width">
											<el-input v-model.trim="form.width" placeholder="宽(英寸)"></el-input>
										</el-form-item>
									</el-col>
									<el-col class="line" :span="1">-</el-col>
									<el-col :span="7">
										<el-form-item prop="height">
											<el-input v-model.trim="form.height" placeholder="高(英寸)"></el-input>
										</el-form-item>
									</el-col>
								</template>
							</el-form-item>
							<el-form-item label="重量" prop="weight">
								<el-input v-model.trim="form.weight"></el-input>
							</el-form-item>
							<el-form-item label="备注" prop="remark">
								<el-input v-model.trim="form.remark"></el-input>
							</el-form-item>
							<el-form-item label="产品图片" required>
								<el-upload class="upload-demo" drag action="" :file-list="fileList" :on-remove="handleRemove" :auto-upload="false" :on-change="changeFile" :limit="5" multiple>
									<i class="el-icon-upload"></i>
									<div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
									<!--<div class="el-upload__tip" slot="tip">只能上传jpg/png文件，且不超过500kb</div>-->
								</el-upload>
							</el-form-item>
							<el-form-item label="外包装图片">
								<el-upload class="upload-demo" drag action="" :file-list="fileList2" :on-remove="handleRemove2" :auto-upload="false" :on-change="changeFile2" :limit="5" multiple>
									<i class="el-icon-upload"></i>
									<div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
									<!--<div class="el-upload__tip" slot="tip">只能上传jpg/png文件，且不超过500kb</div>-->
								</el-upload>
							</el-form-item>
							<!--<el-form-item label="文本框">
						<el-input type="textarea" rows="5" v-model="form.desc"></el-input>
					</el-form-item>-->
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
		name: 'addProduct',
		data: function() {
			return {
				message: 'first',
				product_pictures: [],
				fileList: [],
				fileList2: [],
				form: {
					name: '',
					sku: '',
					fnsku: '',
					price: '',
					length: '',
					width: '',
					height: '',
					weight: '',
					remark: '',
				},
				rules: {
					name: [{
						required: true,
						message: '请输入名称',
						trigger: 'blur'
					}],
					fnsku: [{
						required: true,
						message: '请输入fnsku',
						trigger: 'blur'
					}],
					sku: [{
						required: true,
						message: '请输入sku',
						trigger: 'blur'
					}],
					price: [{
						required: true,
						message: '请输入申报价格',
						trigger: 'blur'
					}],
					length: [{
						required: true,
						message: '请输入长度',
						trigger: 'blur'
					}],
					width: [{
						required: true,
						message: '请输入宽度',
						trigger: 'blur'
					}],
					height: [{
						required: true,
						message: '请输入高度',
						trigger: 'blur'
					}],
					weight: [{
						required: true,
						message: '请输入重量',
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
				let arr = []
				arr.push(this.form.length, this.form.width, this.form.height, this.form.weight, this.form.price)
				if(this.judge_addproduct(arr)){
				}else{
					return false
				}
				let formData = new FormData()
				this.$refs[formName].validate((valid) => {
					if(valid) {
						if (this.fileList.length == 0){
							this.$message.error('请上传产品图片')
							return false
						}
						formData.append('product[fnsku]', this.form.fnsku)
						formData.append('product[name]', this.form.name)
						formData.append('product[sku]', this.form.sku)
						formData.append('product[length]', this.form.length)
						formData.append('product[width]', this.form.width)
						formData.append('product[height]', this.form.height)
						formData.append('product[weight]', this.form.weight)
						formData.append('product[price]', this.form.price)
						formData.append('product[remark]', this.form.remark)
						this.fileList.forEach((item) => {
							formData.append('product_pictures[]', item.raw)
						})
						this.fileList2.forEach((item) => {
							formData.append('package_pictures[]', item.raw)
						})
						let config = {
							headers: {
								'Authorization': this.cookie.token
							}
						}
						this.$axios.post('/products', formData, config).then((res) => {
							if(res.data.code == 200) {
								this.$message.success('提交成功！');
								this.$refs['form'].resetFields()
								this.form.length = ''
								this.form.width = ''
								this.form.height = ''
								this.fileList = []
								this.fileList2 = []
								this.$router.push('/productmanage')
							}
						}).catch((res) => {
							this.$message.error('提交有误')
						})
					} else {
						this.$message.error("请填写完整信息")
						return false
					}
				})
				//				formData.append('product[fnsku]', this.form.fnsku)
				//				formData.append('product[name]', this.form.name)
				//				formData.append('product[sku]', this.form.sku)
				//				formData.append('product[length]', this.form.length)
				//				formData.append('product[width]', this.form.width)
				//				formData.append('product[height]', this.form.height)
				//				formData.append('product[weight]', this.form.weight)
				//				formData.append('product[price]', this.form.price)
				//				formData.append('product[remark]', this.form.remark)
				//				this.fileList.forEach((item) => {
				//					formData.append('product_pictures[]', item.raw)
				//				})
				//				this.fileList2.forEach((item) => {
				//					formData.append('package_pictures[]', item.raw)
				//				})
				//				let config = {
				//					headers: {
				//						'Authorization': token
				//					}
				//				}
				//				this.$axios.post('/products', formData, config
				//				).then((res) => {
				//					if(res.data.code == 200){
				//						this.$message.success('提交成功！');
				//						this.$refs['form'].resetFields()
				//						this.form.length = ''
				//						this.form.width = ''
				//						this.form.height = ''
				//						this.fileList = []
				//						this.fileList2 = []
				//					}			
				//				}).catch((res) => {
				//					this.$message.error('提交有误')
				//				})
			},
			//上传前对文件的大小进行判断
			beforeAvatarUpload(file) {
				const extension = file.name.split('.')[1] === 'xls'
				const extension2 = file.name.split('.')[1] === 'xlsx'
				const isLt2M = file.size / 1024 / 1024 < 10
				if(!extension & !extension2) {
					console.log('上传模板只能是 xls、xlsx格式！')
					this.$message.error('请上传 xls、xlsx格式的文件')
				}
				if(!isLt2M) {
					console.log('上传模板大小不能超过10MB！')
				}
			},
			uploadError(res, file, FileList) {
				console.log('上传失败，请重试！')
			},
			changeFile(file) {
				this.fileList.push(file)
			},
			handleRemove(a, b) {
				this.fileList = b
			},
			changeFile2(file) {
				this.fileList2.push(file)
			},
			handleRemove2(a, b) {
				this.fileList2 = b
			},
		}
	}
</script>