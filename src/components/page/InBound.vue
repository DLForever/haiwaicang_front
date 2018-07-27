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
						<el-form label-width="110px">
							<el-form-item label="产品">
								<el-select v-model="select_cate" placeholder="选择产品" class="handle-select mr10">
									<el-option v-for="item in options" :key="item.name" :label="item.name" :value="item.id+'_'+item.fnsku"></el-option>
								</el-select>
							</el-form-item>
							<!--<el-form-item label="物流方式">
								<el-input v-model="form.type"></el-input>
							</el-form-item>-->
							<el-form-item label="物流编号+数量">
								<table class="table text-center">
									<tbody>
										<tr v-for="p in form">
											<td><el-input v-model="p.logistics_number" placeholder="物流编号"></el-input></td>
											<el-col class="line" :span="1">-</el-col>
											<td><el-input v-model="p.plan_sum" placeholder="计划数量"></el-input></td>
										</tr>
										
									</tbody>		
								</table>
							</el-form-item>
							<el-form-item label="备注">
								<el-input v-model="remark"></el-input>
							</el-form-item>
							<div class="newOrder">
								<el-button @click="createOrder">添加更多</el-button>
							</div>
							<!--<el-form-item label="文本框">
						<el-input type="textarea" rows="5" v-model="form.desc"></el-input>
					</el-form-item>-->
							<el-form-item>
								<el-button type="primary" @click="onSubmit">新建</el-button>
							</el-form-item>
							

						</el-form>
					</div>
				</el-tab-pane>
				<el-tab-pane label="批量上传" name="second">
					<el-form ref="form" :model="form" label-width="85px">
						<el-form-item label="批量上传">
							<el-upload class="upload-demo" drag action="https://jsonplaceholder.typicode.com/posts/" multiple>
								<i class="el-icon-upload"></i>
								<div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
								<div class="el-upload__tip" slot="tip">只能上传xls文件</div>
							</el-upload>
							<a href="">模板下载</a>
							<!--<el-button type="primary">模板下载</el-button>-->
						</el-form-item>
					</el-form>
				</el-tab-pane>
			</el-tabs>
		</div>
	</div>
</template>

<script>
	export default {
		name: 'baseform',
		data: function() {
			return {
				url: './static/vuetable.json',
				message: 'first',
				select_cate: '',
				options: [],
				product_id: '',
				remark: '',
				form: [{
					plan_sum: [],
					logistics_number: []
				}],
				newForm: {
					fnskus: [],
					amounts: []
				},
				inputVisible: false,
				inputVisible2: false,
				Fnskus: [],
				Fnsku: '',
				Amounts: [],
				Amount: '',
				tag: ''
			}
		},
		created() {
			this.getData();
		},
		methods: {
			getData() {
				let token = localStorage.getItem('token')
				this.$axios.get('http://47.74.177.128:3000/products', {
					headers: {'Authorization': token}
				}).then((res) => {
					this.options = res.data.data;
				})
			},
			createOrder(){
				this.form.push(this.newForm);
				// 添加完newPerson对象后，重置newPerson对象
				this.newForm = {
					fnskus: '',
					amounts: ''
				}
			},
			onSubmit() {
				let token = localStorage.getItem('token')
				this.product_id = this.select_cate.split('_')[0]
				this.fnsku = this.select_cate.split('_')[1]
				let a = this.form.length
				let plan_sum = this.form[0].plan_sum
				let logistics_number = this.form[0].logistics_number
				let params = {
					store_ins:[{
					product_id: this.product_id,
					fnsku: this.fnsku,
					plan_sum: plan_sum,
					logistics_number: logistics_number,
					remark: this.remark
					},]
//					{
//					product_id: this.product_id,
//					fnsku: this.fnsku,
//					plan_sum: plan_sum,
//					logistics_number: logistics_number
//					}]
				}
//				formData.append("store_ins[]",{
//					product_id: this.product_id,
//					fnsku: this.fnsku,
//					plan_sum: plan_sum,
//					logistics_number: logistics_number
//				})
				this.$axios.post('http://47.74.177.128:3000/store_ins', params, {
					headers: {'Authorization': token}
				
				}).then((res) =>{
					console.log(res)
					if(res.data.code == 200){
						this.$message.success('提交成功！');
					}
				}).catch((res) => {
					this.$message.error('提交失败！');
				})
				
			},
			handleClose(tag) {
				this.Fnskus.splice(this.Fnskus.indexOf(tag), 1);
			},
			showInput() {
				this.inputVisible = true;
				this.$nextTick(_ => {
					this.$refs.saveTagInput.$refs.input.focus();
				});
			},
			handleInputConfirm() {
				let Fnsku = this.Fnsku;
				if(Fnsku) {
					this.Fnskus.push(Fnsku);
				}
				this.inputVisible = false;
				this.Fnsku = '';
			},
			showInputs() {
				this.inputVisible2 = true;
				this.$nextTick(_ => {
					this.$refs.saveTagInput.$refs.input.focus();
				});
			},
			handleInputConfirm2() {
				let Amount = this.Amount;
				if(Amount) {
					this.Amounts.push(Amount);
				}
				this.inputVisible2 = false;
				this.Amount = '';
			},
			handleClose2(tag) {
				this.Amounts.splice(this.Amounts.indexOf(tag), 1);
			},
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