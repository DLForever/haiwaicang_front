<template>
	<div>
		<div class="crumbs">
			<el-breadcrumb separator="/">
				<el-breadcrumb-item><i class="el-icon-date"></i> 入库管理</el-breadcrumb-item>
				<el-breadcrumb-item>新建入库单</el-breadcrumb-item>
			</el-breadcrumb>
		</div>
		<div class="container">
			<el-tabs v-model="message">
				<el-tab-pane label="创建入库单" name="first">
					<div class="form-box">
						<el-form :rules="rules" label-width="115px">
							<el-form-item label="批次" required>
								<el-select v-model="select_batch" placeholder="选择批次" class="handle-select mr10">
									<el-option v-for="item in batch_options" :key="item.id" :label="item.batch_number" :value="item.id"></el-option>
									<infinite-loading :on-infinite="onInfiniteBatch" ref="infiniteLoading"></infinite-loading>
								</el-select>
							</el-form-item>
							<!--<el-form-item label="产品" required>
								<el-select v-model="select_cate" placeholder="选择产品" multiple class="handle-select mr10">
									<el-option v-for="item in options" :key="item.id" :label="item.name" :value="item.id"></el-option>
									<infinite-loading :on-infinite="onInfinite" ref="infiniteLoading"></infinite-loading>
								</el-select>
							</el-form-item>-->
							<el-form-item label="物流单" required>
								<table class="table text-center">
									<tbody v-for="(p,index) in form">
										<td>
											<el-input v-model.trim="p.logistics_number" placeholder="物流编号"></el-input>
										</td>
										<i class="el-icon-circle-plus" @click="orderAdd(index)" :disabled="false"></i>
										<span>&nbsp</span>
										<i class="el-icon-remove" @click="orderDel(index)"></i>
										<tr v-for="(q,index) in p['form_branch']">
											<td>
												<el-select v-model="q.product_id" placeholder="选择产品" class="handle-select mr10">
													<el-option v-for="item in options" :key="item.id" :label="item.fnsku" :value="item.id"></el-option>
													<infinite-loading :on-infinite="onInfinite" ref="infiniteLoading"></infinite-loading>
												</el-select>
											</td>
											<!--<el-col class="line" :span="1">&nbsp-</el-col>-->
											<td>
												<td>
													<el-input v-model.trim="q.plan_sum" placeholder="计划数量"></el-input>
												</td>
											</td>
										</tr>
										<span>-----</span>
									</tbody>
								</table>
							</el-form-item>
							<div class="newOrder">
								<el-button @click="createOrder">添加物流单</el-button>
								<el-button @click="back" :disabled="isDisableBu" type="danger">撤销</el-button>
							</div>
							<br>
							<el-form-item label="备注">
								<el-input v-model="remark"></el-input>
							</el-form-item>
							<el-form-item>
								<el-button type="primary" @click="onSubmit">新建</el-button>
							</el-form-item>
						</el-form>
					</div>
				</el-tab-pane>
				<!-- <el-tab-pane label="批量上传" name="second">
					<el-form label-width="85px">
						<el-form-item label="批量上传">
							<el-upload class="upload-demo" drag action="" :file-list="fileList" :on-remove="handleRemove" :on-exceed="exceed" :auto-upload="false" :on-change="changeFile" :limit="1" multiple>
								<i class="el-icon-upload"></i>
								<div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
								<div class="el-upload__tip" slot="tip">只能上传xls/xlsx文件</div>
							</el-upload>
							<a href="">模板下载</a>
						</el-form-item>
						<el-form-item>
							<el-button type="primary" @click="addFile">上传</el-button>
						</el-form-item>
					</el-form>
				</el-tab-pane> -->
			</el-tabs>
		</div>
	</div>
</template>

<script>
	import VueInfiniteLoading from "vue-infinite-loading"
	export default {
		//		name: 'baseform',
		data: function() {
			return {
				url: './static/vuetable.json',
				message: 'first',
				totals: 0,
				batch_totals: 0,
				cur_page: 1,
				batch_page: 1,
				options: [],
				batch_options: [],
				fileList: [],
				select_batch: '',
				product_id: '',
				remark: '',
				form: [{
					logistics_number: '',
					form_branch: [{
						product_id: '',
						plan_sum: ''
					}],
				}],
				newForm: {
					product_id: '',
					plan_sum: ''
				},
				newForm2: {
					logistics_number: '',
					form_branch: [{
						product_id: '',
						plan_sum: ''
					}]
				},
				inputVisible: false,
				inputVisible2: false,
				isdisable: true,
				Fnskus: [],
				Fnsku: '',
				Amounts: [],
				Amount: '',
				tag: '',
				rules: {
					name1: [{
						required: true,
						message: '请输入名称',
						trigger: 'blur'
					}],
				}
			}
		},
		created() {
			this.getData();
			this.getBatchInbound()
		},
		computed: {
			isDisableBu() {
				if(this.form.length <= 1) {
					return this.isdisable = true
				} else {
					return this.isdisable = false
				}
			}
		},
		methods: {
			getData() {
				this.$axios.get('/products?page=' + this.cur_page, {
					headers: {
						'Authorization': localStorage.getItem('token')
					}
				}).then((res) => {
					this.options = this.options.concat(res.data.data)
					this.totals = res.data.count
				})
			},
			getBatchInbound() {
				this.$axios.get('/batch_store_ins/available_index?page=' + this.batch_page, {
					headers: {
						'Authorization': localStorage.getItem('token')
					}
				}).then((res) => {
					this.batch_options = this.batch_options.concat(res.data.data)
					this.batch_totals = res.data.count
				})
			},
			onInfinite(obj) {
				if((this.cur_page * 20) < this.totals) {
					this.cur_page += 1
					this.getData(obj.loaded)
				} else {
					obj.complete()
				}
			},
			//批次翻页
			onInfiniteBatch(obj) {
				if((this.batch_page * 20) < this.batch_totals) {
					this.batch_page += 1
					this.getBatchInbound(obj.loaded)
				} else {
					obj.complete()
				}
			},
			createOrder() {
				this.form.push(this.newForm2);
				// 添加完newPerson对象后，重置newPerson对象
				this.newForm2 = {
					plan_sum: '',
					form_branch: [{
						logistics_number: '',
						select_cate: ''
					}],
				}

			},
			orderAdd(index) {
				this.form[index]['form_branch'].push(this.newForm)
				this.newForm = {
					product_id: '',
					plan_sum: ''
				}
				console.log(this.form)
			},
			orderDel(index) {
				if(this.form[index]['form_branch'].length == 1) {
					this.$message.error("至少保留一项哦")
					return false;
				}
				this.form[index]['form_branch'].pop(this.newForm)
				console.log(this.form)
			},
			back() {
				this.form.pop(this.newForm2)
			},
			onSubmit() {
				let logistics_number = []
				let product_id = []
				let plan_sum = []
				let store_ins = []
				this.form.forEach((data) => {
					let temp_product_id = []
					let temp_plan_sum = []
					data.form_branch.forEach((data2) => {
						temp_product_id.push(data2['product_id'])
						temp_plan_sum.push(Number(data2['plan_sum']))
					})
					let params_temp = {
						logistics_number: data['logistics_number'],
						plan_sum: temp_plan_sum,
						product_id: temp_product_id
					}
					store_ins.push(params_temp)
				})
				let params = {
					store_ins: store_ins,
					batch_store_in_id: this.select_batch,
					remark: this.remark
				}
				this.$axios.post('/store_ins', params, {
					headers: {
						'Authorization': localStorage.getItem('token')
					}
				}).then((res) => {
					console.log(res)
					if(res.data.code == 200) {
						this.$message.success('提交成功！')
						this.remark = ''
						this.form = [{
							plan_sum: '',
							logistics_number: ''
						}]
						let mesId =  JSON.parse(localStorage.getItem('notifyid')) || []
						this.$axios.get('/notifications', {
		                    headers: {
		                        'Authorization': localStorage.getItem('token')
		                    },
		                }).then((res) => {
		                    if(res.data.code == 200) {
		                        res.data.data.forEach((data, index) => {
		                            let offsettemp = 100 + 70 * index
		                            if(mesId.indexOf(data.id) == -1) {
		                                this.$notify({
		                                    title: '您有新的消息',
		                                    offset: offsettemp,
		                                    message: data.message
		                                })
		                                mesId.push(data.id)
		                                localStorage.removeItem('notifyid')
		                                localStorage.setItem('notifyid', JSON.stringify(mesId))  
		                            }
		                        })
		                    }
		                }).catch((res) => {
		                    console.log('error')
		                })
						this.$router.push('/inboundmanage')
						// this.$notify({
						// 	title: '您有新的消息',
						// 	offset: 100,
						// 	message: '您的入库单还需您进一步审核才能提交到仓库'
						// })
					}
				}).catch((res) => {
					console.log('error')
				})
			},
			addFile() {
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
				this.$axios.post('', formData, config).then((res) => {
					if(res.data.code == 200) {
						this.$message.success("提交成功")
						this.fileList = []
						this.remark = ''
					}
				}).catch((res) => {
					this.$message.error("失败，请核对无误后联系管理员")
				})
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
		components: {
			"infinite-loading": VueInfiniteLoading
		}
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