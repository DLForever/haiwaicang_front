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
						<el-form :rules="rules" label-width="140px">
							<el-form-item label="批次" required>
								<el-select v-model="select_batch" @change="promptQuick" placeholder="选择批次" class="handle-select mr10">
									<el-option v-for="item in batch_options" :key="item.id" :label="item.batch_number" :value="item.id"></el-option>
									<infinite-loading :on-infinite="onInfiniteBatch" ref="infiniteLoading2"></infinite-loading>
								</el-select>
								<el-tag v-if="is_quick_type == 1" type="success">该批次是入库即出</el-tag>
							</el-form-item>
							<el-form-item label="追踪编码/订单编码" required>
								<table class="table text-center">
									<tbody v-for="(p,index) in form">
										<td>
											<el-input v-model.trim="p.logistics_number" placeholder="追踪编码"></el-input>
										</td>
										<!-- <i class="el-icon-circle-plus" @click="orderAdd(index)" :disabled="false"></i>
										<span>&nbsp</span>
										<i class="el-icon-remove" @click="orderDel(index)"></i> -->
										<td>
											<el-input v-model.trim="p.order_number" placeholder="订单编码"></el-input>
										</td>
										<tr v-for="(q,index2) in p['form_branch']">
											<td>
												<el-select v-model="q.product_id" filterable remote placeholder="选择产品" :loading="loading" @visible-change="selectVisble" :remote-method="remoteMethod">
													<el-option v-for="item in options" :key="item.id" :label="item.fnsku" :value="item.id"></el-option>
													<infinite-loading :on-infinite="onInfinite" ref="infiniteLoading"></infinite-loading>
												</el-select>
											</td>
											<!--<el-col class="line" :span="1">&nbsp-</el-col>-->
											<td>
												<el-input v-model.trim="q.plan_sum" placeholder="计划数量"></el-input>
											</td>
											<div v-if="index2 == 0">
												<i class="el-icon-circle-plus" @click="orderAdd(index)" :disabled="false"></i>
												<span>&nbsp</span>
												<i class="el-icon-remove" @click="orderDel(index)"></i>
											</div>
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
							<!-- <el-form-item label="订单编码">
								<el-input v-model.trim="order_number"></el-input>
							</el-form-item> -->
							<el-form-item label="备注">
								<el-input v-model.trim="remark"></el-input>
							</el-form-item>
							<el-form-item>
								<el-button type="primary" @click="onSubmit" :disabled="submitDisabled">新建</el-button>
							</el-form-item>
						</el-form>
					</div>
				</el-tab-pane>
				<el-tab-pane label="批量上传" name="second">
					<el-form label-width="85px">
						<el-form-item label="批量上传">
							<el-upload class="upload-demo" drag action="" :file-list="fileList" :on-remove="handleRemove" :on-exceed="exceed" :auto-upload="false" :on-change="changeFile" :limit="1" multiple>
								<i class="el-icon-upload"></i>
								<div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
								<div class="el-upload__tip" slot="tip">只能上传xls/xlsx文件</div>
							</el-upload>
							<a :href="$axios.defaults.baseURL +'/store_ins.xlsx'">模板下载</a>
						</el-form-item>
						<el-form-item>
							<el-button type="primary" @click="addFile" :disabled="uploadDisabled">上传</el-button>
						</el-form-item>
					</el-form>
				</el-tab-pane>
			</el-tabs>
		</div>
	</div>
</template>

<script>
	import notificatinImg from "@/assets/close.png"
	import VueInfiniteLoading from "vue-infinite-loading"
	import Header from '@/components/common/Header'
	export default {
		//		name: 'baseform',
		data: function() {
			return {
				url: './static/vuetable.json',
				message: 'first',
				submitDisabled: false,
				uploadDisabled: false,
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
					order_number: '',
					form_branch: [{
						product_id: '',
						plan_sum: '',
					}],
				}],
				newForm: {
					product_id: '',
					plan_sum: '',
				},
				newForm2: {
					logistics_number: '',
					order_number: '',
					form_branch: [{
						product_id: '',
						plan_sum: '',
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
				},
				notifications: [],
				order_number: undefined,
				loading: false,
				query: undefined,
				is_quick_type: 0
			}
		},
		created() {
			this.getData();
			this.getBatchInbound()
			this.getNotify()
		},
		props:{
			getMessageCount:Function
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
			onInfinite(obj, index) {
				if((this.cur_page * 20) < this.totals) {
					this.cur_page += 1
					this.remoteMethod(this.query,obj.loaded)
					// this.getData(obj.loaded)
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
			popTest(index,id) {
                console.log('index')
                this.notifications[index].close()
                this.notifications[index] = undefined
                this.$axios.patch('/notifications/' + id, '',{
                    headers: {
                        'Authorization': localStorage.getItem('token')
                    },
                }).then((res) => {
                    if(res.data.code = 200) {

                    }
                }).catch((res) => {
                    console.log('error')
                })
            },
			onSubmit() {
				if(!this.select_batch) {
					this.$message.error("请输入完整信息")
					return false
				}
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
						order_number: data['order_number'],
						plan_sum: temp_plan_sum,
						product_id: temp_product_id,
					}
					store_ins.push(params_temp)
				})
				let params = {
					store_ins: store_ins,
					batch_store_in_id: this.select_batch,
					remark: this.remark
				}
				this.submitDisabled = true
				// setTimeout(() => {
				// 	this.submitDisabled = false
				// }, 3000)
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
							product_id: '',
						}]
						this.getMessageCount()
						if(this.is_quick_type == 1) {
							this.$router.push('/inboundmanagequick')
						}else {
							this.$router.push('/inboundmanage')
						}
					}
				}).catch((res) => {
					console.log('error')
				}).finally(() => {
					this.submitDisabled = false
				})
			},
			addFile() {
				if(this.fileList.length == 0) {
					this.$message.error("请选择xlsx文件")
					return false;
				}
				const extension = this.fileList[0].name.split('.')[this.fileList[0].name.split('.').length - 1] === 'xls';
                const extension2 = this.fileList[0].name.split('.')[this.fileList[0].name.split('.').length - 1] === 'xlsx';
                // const maxSzie = this.fileList[0].size / 1024 / 1024 < 10;
                if (!extension && !extension2) {
                    console.log('格式有误，请上传xls、xlsx格式的文件！');
                    this.$message.error('上传失败，请上传xls、xlsx格式的文件！')
                    return false
                }
    //             if (!maxSzie) {
    //                 console.log('上传文件不能超过10MB！')
    //                 this.$message.error('上传文件不能超过10MB!')
    //                 return false
    //             }
                this.uploadDisabled = true
				let formData = new FormData()
				let config = {
					headers: {
						'Authorization': localStorage.getItem('token')
					}
				}
				this.fileList.forEach((item) => {
					formData.append('file', item.raw)
				})
				// formData.append('remark', this.remark)
				this.$axios.post('/store_ins/batch', formData, config).then((res) => {
					if(res.data.code == 200) {
						// this.$message.success("提交成功")
						this.fileList = []
						this.uploadDisabled = false
						this.$message({
							message: res.data.data,
							type: 'success',
							showClose: true,
							duration: 6000
						})
						// this.remark = ''
					}
				}).catch((res) => {
					this.$message.error("失败，请核对无误后联系管理员")
				}).finally(() => {
					this.uploadDisabled = false
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
			},
			selectVisble(visible) {
				if(visible){
					this.query = undefined
				  	this.remoteMethod("")
				}  
			},
			remoteMethod(query,callback=undefined, index) {
				console.log(this.$refs.infiniteLoading)
				if(query != "" || this.query != "" || callback){
					let reload = false
					if(this.query != query){
						this.loading = true
						this.cur_page = 1
						this.query = query
						reload = true
						for(let i = 0; i < this.$refs.infiniteLoading.length; i++) {
							if(this.$refs.infiniteLoading[i].isComplete){
								this.$refs.infiniteLoading[i].stateChanger.reset()
							}
						}
					}
					this.$axios.get('/products?page=' + this.cur_page + '&fnsku=' + query.trim(), {
						headers: {
						'Authorization': localStorage.getItem('token')
					},
					}).then((res) => {
						if(res.data.code == 200){
							this.loading = false
//							this.options = res.data.data
							if(reload){
								this.options = res.data.data
							}else{
								this.options = this.options.concat(res.data.data)
							}
							this.totals = res.data.count
							if(callback){
								callback()
							}
						}
					}).catch((res) => {
						console.log('失败')
					})
				}
			},
			infiniteIndex(index) {
				console.log('index')
				console.log(index)
			},
			promptQuick() {
				this.is_quick_type = 0
				let index = this.batch_options.findIndex((data) => data.id == this.select_batch)
				if (this.batch_options[index].is_quick == true) {
					this.is_quick_type = 1
				}
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