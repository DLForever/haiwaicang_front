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
							<el-form-item label="物流编号+数量" required>
								<table class="table text-center">

									<tbody>
										<tr v-for="p in form">
											<td>
												<el-input v-model.trim="p.logistics_number" placeholder="物流编号"></el-input>
											</td>
											<el-col class="line" :span="1">-</el-col>
											<td>
												<el-select v-model="p.select_cate" placeholder="选择产品" class="handle-select mr10">
													<el-option v-for="item in options" :key="item.id" :label="item.name" :value="item.id"></el-option>
													<infinite-loading :on-infinite="onInfinite" ref="infiniteLoading"></infinite-loading>
												</el-select>
											</td>
											<el-col class="line" :span="1">-</el-col>
											<td>
												<td>
													<el-input v-model.trim="p.plan_sum" placeholder="计划数量"></el-input>
												</td>
											</td>
											<span @click="orderAdd">加</span>
											<!--<span>减</span>-->
											<!--<td><el-input v-model="p.plan_sum" placeholder="计划数量"></el-input></td>-->
											<!--<el-form-item prop="name2">
												<td><el-input v-model="p.plan_sum" placeholder="计划数量"></el-input></td>
											</el-form-item>-->
											<!--<td><el-input v-model="p.logistics_number" placeholder="物流编号" prop="name"></el-input></td>-->
											<!--
											<td><el-input v-model="p.plan_sum" placeholder="计划数量"></el-input></td>-->
										</tr>
									</tbody>
									<!--<div slot="tip" class="el-upload__tip">如果一个物流编号有多个产品,数量格式为 66/88</div>-->
								</table>

							</el-form-item>
							<div class="newOrder">
								<el-button @click="createOrder">添加更多</el-button>
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
				<!--<el-tab-pane label="批量上传" name="second">
					<el-form label-width="85px">
						<el-form-item label="批量上传">
							<el-upload class="upload-demo" drag action="https://jsonplaceholder.typicode.com/posts/" multiple>
								<i class="el-icon-upload"></i>
								<div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
								<div class="el-upload__tip" slot="tip">只能上传xls文件</div>
							</el-upload>
							<a href="">模板下载</a>
						</el-form-item>
					</el-form>
				</el-tab-pane>-->
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
				select_batch: '',
				product_id: '',
				remark: '',
				form: [{
					plan_sum: '',
					form_branch: [{
						logistics_number: '',
						select_cate: ''
					},
					{
						logistics_number: '',
						select_cate: ''
					},
					],
				}],
				newForm: {
					fnskus: [],
					amounts: []
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
						'Authorization': localStorage.getItem('token_admin')
					}
				}).then((res) => {
					this.options = this.options.concat(res.data.data)
					this.totals = res.data.count
				})
			},
			getBatchInbound() {
				this.$axios.get('/batch_store_ins/available_index?page=' + this.batch_page, {
					headers: {
						'Authorization': localStorage.getItem('token_admin')
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
				this.form.push(this.newForm);
				// 添加完newPerson对象后，重置newPerson对象
				this.newForm = {
					fnskus: '',
					amounts: ''
				}
			},
			orderAdd() {
				this.form[0]['form_branch'].push(this.newForm)
				this.newForm = {
					fnskus: '',
					amounts: ''
				}
			},
			back() {
				this.form.pop(this.newForm)
			},
			onSubmit() {
				if(this.select_cate.length !== 0 && this.form.length !== 0) {
					let store_ins = []
					for(let i = 0; i < this.form.length; i++) {
						if(this.judge_inbound(this.form[i].plan_sum)) {

						} else {
							return false
						}
						let store_tmp = {
							product_id: this.select_cate,
							plan_sum: this.form[i].plan_sum.split('/'),
							logistics_number: this.form[i].logistics_number,
							remark: this.remark
						}
						store_ins.push(store_tmp)
					}
					let params = {
						store_ins: store_ins,
						batch_store_in_id: this.select_batch,
						remark: this.remark
					}
					this.$axios.post('/store_ins', params, {
						headers: {
							'Authorization': localStorage.getItem('token_admin')
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
							this.$router.push('/inboundmanage')
						}
					}).catch((res) => {
						this.$message.error('提交失败！');
					})
				} else {
					this.$message.error('请确认格式是否正确')
					return false
				}
				//				let params = {
				//					store_ins:[{
				//					product_id: this.product_id,
				//					fnsku: this.fnsku,
				//					plan_sum: plan_sum,
				//					logistics_number: logistics_number,
				//					remark: this.remark
				//					},
				//					{
				//					product_id: this.product_id,
				//					fnsku: this.fnsku,
				//					plan_sum: plan_sum,
				//					logistics_number: logistics_number
				//					}]
				//				}
				//				formData.append("store_ins[]",{
				//					product_id: this.product_id,
				//					fnsku: this.fnsku,
				//					plan_sum: plan_sum,
				//					logistics_number: logistics_number
				//				})
				//				this.$axios.post('/store_ins', params, {
				//					headers: {
				//						'Authorization': localStorage.getItem('token_admin')
				//					}
				//
				//				}).then((res) => {
				//					console.log(res)
				//					if(res.data.code == 200) {
				//						this.$message.success('提交成功！')
				//						this.remark = ''
				//						this.form = [{
				//							plan_sum: '',
				//							logistics_number: ''
				//						}]
				//						this.$router.push('/inboundmanage')
				//					}
				//				}).catch((res) => {
				//					this.$message.error('提交失败！');
				//				})

			},
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