<template>
	<div>
		<div class="crumbs">
			<el-breadcrumb separator="/">
				<el-breadcrumb-item><i class="el-icon-date"></i> 出库单管理</el-breadcrumb-item>
				<el-breadcrumb-item>出库单管理</el-breadcrumb-item>
			</el-breadcrumb>
		</div>
		<div class="container">
			<div class="handle-box">
				<el-button type="primary" @click="showOutBound">创建出库单</el-button>
			</div>

			<el-table :data="data" border style="width: 100%" ref="multipleTable" @selection-change="handleSelectionChange">
				<el-table-column type="selection" width="55"></el-table-column>
				<!--<el-table-column prop="created_at" label="创建时间" :formatter="formatter_created_at" width="150">
				</el-table-column>
				<el-table-column prop="updated_at" label="更新时间" :formatter="formatter_updated_at" width="150">
				</el-table-column>				-->
				<el-table-column prop="user_remark" label="用户备注" show-overflow-tooltip>
				</el-table-column>
				<el-table-column prop="manager_remark" label="仓库备注" show-overflow-tooltip>
				</el-table-column>
				<el-table-column prop="remove_remark" label="用户删除备注" show-overflow-tooltip>
				</el-table-column>
				<el-table-column prop="is_mix" label="是否混装" width="150"></el-table-column>
				<el-table-column prop="status" label="状态" width="120">
					<template slot-scope="scope">
						<el-tag :type="scope.row.status | statusFilter">{{getStatusName(scope.row.status)}}</el-tag>
					</template>
				</el-table-column>
				<!--<el-table-column prop="status" label="状态" width="120">
					<template slot-scope="scope">
						<el-tag :type="scope.row.status | statusFilter">{{getStatusName(scope.row.status)}}</el-tag>
					</template>
				</el-table-column>-->
				<el-table-column label="操作" width="100">
					<template slot-scope="scope">
						<el-dropdown>
							<el-button type="primary">
								操作<i class="el-icon-arrow-down el-icon--right"></i>
							</el-button>
							<el-dropdown-menu slot="dropdown">
								<el-dropdown-item>
									<el-button @click="detailsShow(scope.$index, scope.row)" type="text">详情</el-button>
								</el-dropdown-item>
								<el-dropdown-item>
									<el-button size="small" @click="handleEdit(scope.$index, scope.row)" type="text">&nbsp外箱标</el-button>
								</el-dropdown-item>
								<el-dropdown-item>
									<el-button @click="showImgs(scope.$index, scope.row)" type="text">查看附件</el-button>
								</el-dropdown-item>
								<el-dropdown-item>
									<el-button @click="handleDelete(scope.$index, scope.row)" type="text">删除</el-button>
								</el-dropdown-item>
							</el-dropdown-menu>
						</el-dropdown>
					</template>
				</el-table-column>
			</el-table>
			<!-- 添加出库弹出框 -->
			<el-dialog title="创建出库单" :visible.sync="outboundVisible" width="50%">
				<el-form :rules="rules" label-width="115px">
					<el-form-item label="出库单" required>
						<table class="table text-center">
							<tbody v-for="(p,index) in form">
								<!--<tr v-for="(q,index) in p['form_branch']">-->
								<tr>
									<td>
										<el-select v-model="p.product_id" placeholder="选择产品" class="handle-select mr10">
											<el-option v-for="item in options" :key="item.id" :label="item.fnsku" :value="item.id"></el-option>
											<infinite-loading :on-infinite="onInfinite" ref="infiniteLoading"></infinite-loading>
										</el-select>
									</td>
									<td>
										<td>
											<el-input v-model.trim="p.new_fnsku" placeholder="新的fnsku"></el-input>
										</td>
									</td>
									<td>
										<td>
											<el-input v-model.trim="p.plan_sum" placeholder="计划数量"></el-input>
										</td>
									</td>
									<!--<i class="el-icon-circle-plus" @click="orderAdd(index)" :disabled="false"></i>
									<i class="el-icon-remove" @click="orderDel(index)"></i>-->
								</tr>
								<span>-----</span>
							</tbody>
						</table>

					</el-form-item>
					<div class="newOrder">
						<el-button @click="createOrder">添加出库单</el-button>
						<el-button @click="back" :disabled="isDisableBu" type="danger">撤销</el-button>
					</div>
					<br>
					<el-form-item label="是否混装">
						<el-radio v-model="radio" label="true">是</el-radio>
						<el-radio v-model="radio" label="false">否</el-radio>
					</el-form-item>
					<el-form-item label="备注">
						<el-input v-model="remark"></el-input>
					</el-form-item>
					<el-form-item>
						<el-button type="primary" @click="onSubmit">新建</el-button>
					</el-form-item>
				</el-form>
			</el-dialog>

			<!-- 详情提示框 -->
			<el-dialog title="详情" :visible.sync="detailVisible" width="65%">
				<el-table :data="OutBoundTable" border style="width: 100%">
					<el-table-column prop="fnsku" label="fnsku"></el-table-column>
					<el-table-column prop="dst_fnsku" label="新fnsku"></el-table-column>
					<el-table-column prop="sum" label="数量"></el-table-column>
				</el-table>
				<br />
			</el-dialog>
			<!-- 删除提示框 -->
			<el-dialog title="提交删除请求" :visible.sync="delVisible" width="35%" @close="closeDel">
				<el-form ref="form2" :model="form2" :rules="rules" label-width="80px">
					<el-form-item label="备注" prop="remark">
						<el-input v-model.trim="form2.remark"></el-input>
					</el-form-item>
				</el-form>
				<span slot="footer" class="dialog-footer">
                <el-button @click="closeDel">取 消</el-button>
                <el-button type="primary" @click="deleteOrder('form2')">确 定</el-button>
            </span>
			</el-dialog>
			<!-- 贴标弹出框 -->
			<el-dialog title="编辑" :visible.sync="editVisible" width="30%" @close="cancelLabel">
				<el-form ref="form" :model="form" label-width="80px">
					<el-form-item label="外箱标">
						<el-upload class="upload-demo" drag action="" :file-list="fileList" :on-remove="handleRemove" :auto-upload="false" :on-change="changeFile" :limit="5" multiple>
							<i class="el-icon-upload"></i>
							<div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
							<!--<div class="el-upload__tip" slot="tip">只能上传jpg/png文件，且不超过500kb</div>-->
						</el-upload>
					</el-form-item>

				</el-form>
				<span slot="footer" class="dialog-footer">
                <el-button @click="editVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveEdit('form')">确 定</el-button>
            </span>
			</el-dialog>

			<!-- 查看外箱标 -->
			<el-dialog title="附件详情" :visible.sync="showImg" width="30%">
				<el-carousel :interval="4000" type="card" height="200px" v-if="img_show">
					<el-carousel-item v-for="item in form.pictures">
						<img :src="$axios.defaults.baseURL+item.url.url" />
					</el-carousel-item>
				</el-carousel>
				<div v-if="pdf_show" v-for="item in form.pictures">
					<a target="_blank" :href="$axios.defaults.baseURL+item.url.url">{{'查看' + item.id + '.pdf'}}</a>
				</div>
				<span slot="footer" class="dialog-footer">
                <!--<el-button @click="showImg = false">取 消</el-button>-->
                <el-button type="primary" @click="showImg = false">确 定</el-button>
            </span>
			</el-dialog>
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
				tableData: [],
				options: [],
				OutBoundTable: [],
				batch_options: [],
				fileList: [],
				select_batch: '',
				product_id: '',
				remark: '',
				radio: 'true',
				form2: {
					remark: ''
				},
				form: [{
					product_id: '',
					new_fnsku: '',
					plan_sum: '',
				}],
				newForm: {
					product_id: '',
					newfnsku: '',
					plan_sum: ''
				},
				newForm2: {
					product_id: '',
					new_fnsku: '',
					plan_sum: '',
				},
				inputVisible: false,
				inputVisible2: false,
				isdisable: true,
				outboundVisible: false,
				detailVisible: false,
				delVisible: false,
				editVisible: false,
				showImg: false,
				img_show: 1,
				pdf_show: 0,
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
					remark: [{
						required: true,
						message: '请输入删除备注',
						trigger: 'blur'
					}],
				}
			}
		},
		created() {
			this.getData();
			this.getDatas();
			this.getBatchInbound()
		},
		computed: {
			isDisableBu() {
				if(this.form.length <= 1) {
					return this.isdisable = true
				} else {
					return this.isdisable = false
				}
			},
			data() {
				return this.tableData.filter((d) => {
					return d
				})
			}
		},
		filters: {
			//类型转换
			statusFilter(status) {
				const statusMap = {
					5: 'primary',
					1: 'warning',
					8: 'danger',
					2: 'success',
					7: 'info'
				}
				return statusMap[status]
			},
		},
		methods: {
			getData() {
				this.$axios.get('/cargos?page=' + this.cur_page, {
					headers: {
						'Authorization': localStorage.getItem('token')
					}
				}).then((res) => {
					this.options = this.options.concat(res.data.data)
					this.totals = res.data.count
				})
			},
			getDatas() {
				this.$axios.get('/outbound_orders?page=' + this.cur_page, {
					headers: {
						'Authorization': localStorage.getItem('token')
					}
				}).then((res) => {
					res.data.data.forEach((data) => {
						if(data.is_mix) {
							data.is_mix = '混装'
						} else {
							data.is_mix = '不混装'
						}
					})
					this.tableData = res.data.data
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
			detailsShow(index, row) {
				this.$axios.get('/outbound_orders/' + row.id, {
					headers: {
						'Authorization': localStorage.getItem('token')
					},
				}).then((res) => {
					this.OutBoundTable = res.data.data.label_changes
					this.detailVisible = true
				})
			},
			showOutBound() {
				this.outboundVisible = true
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
			handleSelectionChange(val) {
				this.multipleSelection = val;
			},
			createOrder() {
				this.form.push(this.newForm2);
				// 添加完newPerson对象后，重置newPerson对象
				this.newForm2 = {
					plan_sum: '',
					new_fnsku: '',
					product_id: ''
					//					form_branch: [{
					//						logistics_number: '',
					//						select_cate: ''
					//					}],
				}
				console.log(this.form)
			},
			orderAdd(index) {
				this.form[index]['form_branch'].push(this.newForm)
				this.newForm = {
					product_id: '',
					newfnsku: '',
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
				console.log(this.form)
				let logistics_number = []
				let product_ids = []
				let plan_sum = []
				let new_fnsku = []
				let store_ins = []
				this.form.forEach((data) => {
					product_ids.push(data['product_id'])
					plan_sum.push(Number(data['plan_sum']))
					new_fnsku.push(data['new_fnsku'])
				})
				let params = {
					cargo_ids: product_ids,
					dst_fnsku: new_fnsku,
					sum: plan_sum,
					is_mix: this.radio,
					remark: this.remark
				}
				this.$axios.post('/outbound_orders', params, {
					headers: {
						'Authorization': localStorage.getItem('token')
					}
				}).then((res) => {
					console.log(res)
					if(res.data.code == 200) {
						this.$message.success('提交成功！')
						this.remark = ''
						this.radio = 'true'
						this.form = [{
							plan_sum: '',
							new_fnsku: '',
							product_id: ''
						}]
						this.getDatas()
						this.outboundVisible = false
					}
				}).catch((res) => {
					this.$message.error('提交失败！');
				})
			},
			cancelLabel() {
				this.fileList = []
				this.editVisible = false
			},
			handleEdit(index, row) {
				this.idx = index;
				const item = this.tableData[index];
				this.form = {
					id: item.id,
				}
				this.editVisible = true;
			},
			// 添加外箱标
			saveEdit(form) {
				if(this.fileList.length == 0) {
					this.$message.error('请添加外箱标')
					return false
				}
				let formData = new FormData()
				this.fileList.forEach((item) => {
					formData.append('picture[]', item.raw)
				})
				let config = {
					headers: {
						'Authorization': localStorage.getItem('token')
					}
				}
				this.$axios.post('/store_outs/' + this.form.id + '/upload_image', formData, config).then((res) => {
					if(res.data.code == 200) {
						this.$message.success("添加成功!")
						this.getData()
					}
				}).catch((res) => {
					this.$message.error(res)
				})
				this.editVisible = false;
			},
			showImgs(index, row) {
				this.idx = index;
				const item = this.tableData[index];
				this.form = {
					id: item.id,
					pictures: item.pictures
				}
				if(item.pictures.length == 0) {
					this.$message.error('抱歉，该用户暂未提供附件')
					return false;
				}
				if(item.pictures[0].url.url.endsWith('.pdf')) {
					this.img_show = 0
					this.pdf_show = 1
				} else {
					this.img_show = 1
					this.pdf_show = 0
				}
				this.showImg = true;
			},
			closeDel() {
				this.delVisible = false
				this.form2.remark = ''
			},
			handleDelete(index, row) {
				this.idx = index;
				this.delVisible = true;
			},
			deleteOrder(formName) {
				this.$refs[formName].validate((valid) => {
					if(valid) {
						let index = this.idx
						const item = this.tableData[index]
						let params = {
							remark: this.form2.remark
						}
						this.$axios.delete('/outbound_orders/' + item.id, {
							headers: {
								'Authorization': localStorage.getItem('token')
							},
							params
						}).then((res) => {
							if(res.data.code == 200) {
								this.getDatas()
								this.$message.success("成功提交申请")
								this.form2.remark = ''
							}
						}).catch((res) => {
							this.$message.error("提交失败")
						})
						this.delVisible = false;
					} else {
						console.log("没有输入删除备注")
						return false;
					}
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
			},
			getStatusName(status) {
				if(status == 1) {
					return "待拣货"
				} else if(status == 2) {
					return "已拣货"
				} else if(status == 8) {
					return "删除待审核"
				} else if(status == 6) {
					return '待定'
				} else {
					return '其他'
				}
			},
		},
		components: {
			"infinite-loading": VueInfiniteLoading
		}
	}
</script>

<style>
	.handle-box {
		margin-bottom: 20px;
	}
	
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