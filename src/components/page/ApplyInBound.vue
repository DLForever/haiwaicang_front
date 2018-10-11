<template>
	<div>
		<div class="crumbs">
			<el-breadcrumb separator="/">
				<el-breadcrumb-item><i class="el-icon-date"></i> 入库申请管理</el-breadcrumb-item>
				<el-breadcrumb-item>创建入库申请</el-breadcrumb-item>
			</el-breadcrumb>
		</div>
		<div class="container">
			<el-tabs v-model="message">
				<el-tab-pane label="入库申请" name="first">
					<el-form label-width="85px">
						<el-form-item label="上传文件">
							<el-upload class="upload-demo" drag action="" :file-list="fileList" :on-remove="handleRemove" :on-exceed="exceed" :auto-upload="false" :on-change="changeFile" :limit="1" multiple>
								<i class="el-icon-upload"></i>
								<div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
								<div class="el-upload__tip" slot="tip">只能上传xls/xlsx文件</div>
							</el-upload>
							<!--<a href="">模板下载</a>-->
						</el-form-item>
						<el-form-item label="备注">
							<el-input v-model="remark"></el-input>
						</el-form-item>
						<el-form-item>
							<el-button type="primary" @click="onSubmit">上传申请</el-button>
						</el-form-item>
					</el-form>
				</el-tab-pane>
			</el-tabs>
		</div>
	</div>
</template>

<script>
	export default {
		//		name: 'baseform',
		data: function() {
			return {
				url: './static/vuetable.json',
				message: 'first',
				fileList: [],
				remark: '',
				tag: '',
			}
		},
		methods: {
			onSubmit() {
				if(this.fileList.length == 0) {
					this.$message.error("请选择xlsx文件")
					return false;
				}
				let formData = new FormData()
				let config = {
					headers: {
						'Authorization': localStorage.getItem('token')
					}
				}
				this.fileList.forEach((item) => {
					formData.append('file', item.raw)
				})
				formData.append('remark', this.remark)
				this.$axios.post('/apply_store_ins', formData, config).then((res) => {
					if(res.data.code == 200) {
						this.$message.success("提交成功")
						this.fileList = []
						this.remark = ''
					}
				}).catch((res) => {
					this.$message.error("失败，请核对无误后联系管理员")
				})
			},			
			beforeUpload(file) {
                const extension = file.name.split('.')[1] === 'xls';
                const extension2 = file.name.split('.')[1] === 'xlsx';
                const maxSzie = file.size / 1024 / 1024 < 10;
                if (!extension && !extension2) {
                    console.log('格式有误，请上传xls、xlsx格式的文件！');
                    this.$message.error('上传失败，请上传xls、xlsx格式的文件！')
                    return false
                }
                if (!maxSzie) {
                    console.log('上传文件不能超过10MB！')
                    this.$message.error('上传文件不能超过10MB!')
                    return false
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
			exceed() {
				this.$message.error("对不起，超过个数限制")
			}
		},
	}
</script>

<style>
	.el-tag+.el-tag {
		margin-left: 10px;
	}
	
	.button-new-tag {
		margin-left: 10px;
		height: 32px;
		line-height: 30px;
		padding-top: 0;
		padding-bottom: 0;
	}
	
	.input-new-tag {
		width: 90px;
		margin-left: 10px;
		vertical-align: bottom;
	}
	
	.newOrder {
		text-align: center;
	}
</style>