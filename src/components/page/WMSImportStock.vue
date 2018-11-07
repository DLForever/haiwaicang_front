<template>
	<div>
		<div class="crumbs">
			<el-breadcrumb separator="/">
				<el-breadcrumb-item><i class="el-icon-date"></i> 导入库存</el-breadcrumb-item>
				<el-breadcrumb-item>导入库存</el-breadcrumb-item>
			</el-breadcrumb>
		</div>
		<div class="container">
			<el-tabs v-model="message">
				<el-tab-pane label="导入库存" name="first">
					<el-form label-width="120px">
						<el-form-item label="上传excel文件">
							<el-upload class="upload-demo" drag action="" :file-list="xlsxList" :on-remove="handleRemove" :on-exceed="exceed" :auto-upload="false" :on-change="changeFile" :limit="1">
								<i class="el-icon-upload"></i>
								<div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
								<div class="el-upload__tip" slot="tip">只能上传xls/xlsx文件</div>
							</el-upload>
							<a :href="$axios.defaults.baseURL +'/cargos.xlsx'">模板下载</a>
						</el-form-item>
						<el-form-item>
							<el-button type="primary" @click="onSubmit">上传文件</el-button>
						</el-form-item>
					</el-form>
					<!-- <el-form label-width="120px">
						<el-form-item label="上传文件">
							<el-upload class="upload-demo" drag action="" :file-list="fileList" :auto-upload="false" multiple>
								<i class="el-icon-upload"></i>
								<div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
								<div class="el-upload__tip" slot="tip">只能上传xls/xlsx文件</div>
							</el-upload>
						</el-form-item>
						<el-form-item label="备注">
							<el-input v-model="remark"></el-input>
						</el-form-item>
						<el-form-item>
							<el-button type="primary" @click="onSubmit">上传文件</el-button>
						</el-form-item>
					</el-form> -->
					
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
				xlsxList: [],
				fileList: [],
				remark: '',
				tag: '',
			}
		},
		methods: {
			onSubmit() {
				if(this.xlsxList.length == 0) {
					this.$message.error("请选择xlsx文件")
					return false;
				}
				const extension = this.xlsxList[0].name.split('.')[1] === 'xls';
                const extension2 = this.xlsxList[0].name.split('.')[1] === 'xlsx';
                const maxSzie = this.xlsxList[0].size / 1024 / 1024 < 10;
                if (!extension && !extension2) {
                    this.$message.error('上传失败，请上传xls、xlsx格式的文件！')
                    return false
                }
                if (!maxSzie) {
                    console.log('上传文件不能超过10MB！')
                    this.$message.error('上传文件不能超过10MB!')
                    return false
                }
				let formData = new FormData()
				let config = {
					headers: {
						'Authorization': localStorage.getItem('token_admin')
					}
				}
				this.xlsxList.forEach((item) => {
					formData.append('file', item.raw)
				})
				// formData.append('remark', this.remark)
				this.$axios.post('/admin/cargos/set_cargo_stock', formData, config).then((res) => {
					if(res.data.code == 200) {
						this.$message.success("提交成功")
						this.xlsxList = []
						// this.remark = ''
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
				this.xlsxList.push(file)
			},
			handleRemove(a, b) {
				this.xlsxList = b
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