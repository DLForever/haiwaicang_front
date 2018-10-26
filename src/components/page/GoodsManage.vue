<template>
	<div class="table">
		<div class="crumbs">
			<el-breadcrumb separator="/">
				<el-breadcrumb-item><i class="el-icon-tickets"></i> 货物管理</el-breadcrumb-item>
				<el-breadcrumb-item>货物管理</el-breadcrumb-item>
			</el-breadcrumb>
		</div>
		<div class="container">
			<!-- <div class="handle-box">
				<el-button type="primary" icon="search" @click="mixed">混装发货</el-button>
			</div> -->
			<el-table :data="data" border style="width: 100%" model="form" ref="multipleTable" @selection-change="handleSelectionChange">
				<!-- <el-table-column type="selection" width="55"></el-table-column> -->
				<el-table-column prop="fnsku" label="FNSKU" width="250">
				</el-table-column>
				<el-table-column prop="stock_sum" label="库存" width="150">
				</el-table-column>
				<el-table-column prop="arrive_sum" label="未上架数量" width="120">
				</el-table-column>
				<el-table-column prop="done_sum" label="已发出数量" width="120">
				</el-table-column>
				<el-table-column prop="lock_sum" label="已锁定数量" width="120">
				</el-table-column>								
				<el-table-column prop="created_at" label="创建时间" :formatter="formatter_created_at" width="150">
				</el-table-column>
				<el-table-column prop="updated_at" label="更新时间" :formatter="formatter_updated_at" width="150">
				</el-table-column>
				<el-table-column prop="remark" label="备注">
				</el-table-column>
				<el-table-column prop="status" label="状态" width="120">
					<template slot-scope="scope">
						<el-tag :type="scope.row.status | statusFilter">{{getStatusName(scope.row.status)}}</el-tag>
					</template>
				</el-table-column>
				<!-- <el-table-column label="操作" width="100">
					<template slot-scope="scope">
						<el-dropdown>
							<el-button type="primary">
								操作<i class="el-icon-arrow-down el-icon--right"></i>
							</el-button>
							<el-dropdown-menu slot="dropdown">
								<el-dropdown-item>
									<el-button @click="handleEdit(scope.$index, scope.row)" type="text">换标</el-button>
								</el-dropdown-item>
								<el-dropdown-item>
									<el-button @click="handleSendEdit(scope.$index, scope.row)" type="text">发货</el-button>
								</el-dropdown-item>
							</el-dropdown-menu>
						</el-dropdown>
					</template>
				</el-table-column> -->
			</el-table>
			<div class="pagination">
				<el-pagination @current-change="handleCurrentChange" @size-change="handleSizeChange" :page-size="pagesize" layout="prev, pager, next" :total="totals">
				</el-pagination>
			</div>
		</div>

		<!-- 换标弹出框 -->
		<el-dialog title="编辑" :visible.sync="editVisible" width="30%">
			<el-form ref="form" :rules="rules" :model="form" label-width="80px">
				<!--<el-form-item label="入库单号">
					<el-input v-model="form.order"></el-input>
				</el-form-item>-->
				<el-form-item label="处理数量" prop="sum">
					<el-input v-model.trim="form.sum"></el-input>
				</el-form-item>
				<el-form-item label="新fnsku" prop="dst_fnsku">
					<el-input v-model.trim="form.dst_fnsku"></el-input>
				</el-form-item>
				<el-form-item label="备注" prop="remark">
					<el-input v-model.trim="form.remark"></el-input>
				</el-form-item>
				<el-form-item label="新标图片" required>
					<el-upload class="upload-demo" drag action="" :file-list="fileList" :on-remove="handleRemove" :auto-upload="false" :on-change="changeFile" :limit="5" multiple>
						<i class="el-icon-upload"></i>
						<div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
						<!--<div class="el-upload__tip" slot="tip">只能上传jpg/png文件，且不超过500kb</div>-->
					</el-upload>
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
                <el-button @click="cancelChange">取 消</el-button>
                <el-button type="primary" @click="saveEdit('form')">确 定</el-button>
            </span>
		</el-dialog>

		<!-- 发货弹出框 -->
		<el-dialog title="编辑" :visible.sync="sendVisible" width="30%">
			<el-form ref="form" :rules="rules_send" :model="form" label-width="80px">
				<!--<el-form-item label="入库单号">
					<el-input v-model="form.order"></el-input>
				</el-form-item>-->
				<el-form-item label="处理数量" prop="sum">
					<el-input v-model="form.sum"></el-input>
				</el-form-item>
				<el-form-item label="备注">
					<el-input v-model="form.remark"></el-input>
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
                <el-button @click="sendVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveSend('form')">确 定</el-button>
            </span>
		</el-dialog>

		<!-- 混装-->
		<el-dialog title="混装" :visible.sync="mixVisible" width="50%" @close="closeMix">
			<el-form>
				<el-table :data="mix_lists" border style="width: 100%">
					<el-table-column v-for="col in mix_list" :label="col.fnsku">
						<template slot-scope="scope">
							<el-input type="text" v-model="col.stock_sum"></el-input>
						</template>
					</el-table-column>
				</el-table>
				<el-form-item label="备注">
					<el-input v-model="form.remark"></el-input>
				</el-form-item>
			</el-form>
			<!--<el-form>
				<el-tag :key="tag" v-for="tag in dynamicTags" closable :disable-transitions="false" @close="handleClose(tag)">{{tag}}</el-tag>
				<el-input class="input-new-tag" v-if="inputVisible" v-model="inputValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm" @blur="handleInputConfirm"></el-input>
			</el-form>-->
			<!--<el-tag :key="tag" v-for="tag in dynamicTags" closable :disable-transitions="false" @close="handleClose(tag)">{{tag}}</el-tag>-->
			<span slot="footer" class="dialog-footer">
				<!--<div class="newOrder">
					<el-button @click="createOrder">添加更多</el-button>
				</div>-->
                <el-button @click="closeMix">取 消</el-button>
                <el-button type="primary" @click="saveMix">确 定</el-button>
            </span>
		</el-dialog>

		<!-- 删除提示框 -->
		<el-dialog title="提示" :visible.sync="delVisible" width="300px" center>
			<div class="del-dialog-cnt">删除不可恢复，是否确定删除？</div>
			<span slot="footer" class="dialog-footer">
                <el-button @click="delVisible = false">取 消</el-button>
                <el-button type="primary" @click="deleteRow">确 定</el-button>
            </span>
		</el-dialog>
	</div>
</template>

<script>
	export default {
		//		name: 'goods_manage',
		data() {
			return {
				url: './static/vuetable.json',
				tableData: [],
				dynamicTags: [],
				cur_page: 1,
				pagesize: 20,
				totals: 0,
				fileList: [],
				multipleSelection: [],
				select_cate: '',
				select_word: '',
				del_list: [],
				mix_lists: [{
					test: []
				}],
				mix_list: [],
				is_search: false,
				editVisible: false,
				delVisible: false,
				mixVisible: false,
				sendVisible: false,
				inputVisible: false,
				inputValue: '',
				form: {
					order: '',
					total_fnsku: '',
					amounts_way: '',
					amounts_get: '',
					amounts_ground: '',
					amounts_send: '',
					sum: '',
					status: '',
					remark: '',
					name: '',
					date: '',
					address: '',
					dst_fnsku: ''
				},
				idx: -1,
				rules: {
					sum: [{
						required: true,
						message: '请输入换标数量',
						trigger: 'blur'
					}],
					dst_fnsku: [{
						required: true,
						message: '请输入新的FNSKU',
						trigger: 'blur'
					}]
				},
				rules_send: {
					sum: [{
						required: true,
						message: '请输入发货数量',
						trigger: 'blur'
					}],
				}
			}
		},
		created() {
			this.getData();
		},
		watch: {
			"$route": "getData"
		},
		computed: {
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
					2: 'danger',
					1: 'success'
				}
				return statusMap[status]
			},
		},
		methods: {
			handleSizeChange(val) {
				this.pagesize = val;
			},
			// 分页导航
			handleCurrentChange(val) {
				this.cur_page = val;
				this.getData();
			},
			// 获取 easy-mock 的模拟数据
			getData() {
				// 开发环境使用 easy-mock 数据，正式环境使用 json 文件
				if(process.env.NODE_ENV === 'development') {
					//					this.url = '/ms/table/list';
				};
				this.$axios.get('/cargos?page=' + this.cur_page, {
					headers: {
						'Authorization': localStorage.getItem('token')
					}
				}).then((res) => {
					this.tableData = res.data.data
					//					this.totals = this.tableData.length
					this.totals = res.data.count
				})
			},
			search() {
				this.is_search = true;
			},
			formatter_created_at(row, column) {
				return row.created_at.substr(0, 19);
			},
			formatter_updated_at(row, column) {
				return row.updated_at.substr(0, 19);
			},
			filterTag(value, row) {
				return row.tag === value;
			},
			handleEdit(index, row) {
				this.idx = index;
				const item = this.tableData[index];
				this.form = {
					id: item.id,
					sum: item.stock_sum,
					dst_fnsku: item.dst_fnsku,
					remark: item.remark
				}
				this.editVisible = true;
			},
			handleDelete(index, row) {
				this.idx = index;
				this.delVisible = true;
			},
			handleSendEdit(index, row) {
				this.idx = index;
				const item = this.tableData[index];
				this.form = {
					id: item.id,
					sum: item.stock_sum,
					remark: item.remark
				}
				this.sendVisible = true;
			},
			delAll() {
				const length = this.multipleSelection.length;
				let str = '';
				this.del_list = this.del_list.concat(this.multipleSelection);
				for(let i = 0; i < length; i++) {
					str += this.multipleSelection[i].name + ' ';
				}
				this.$message.error('删除了' + str);
				this.multipleSelection = [];
			},
			mixed() {
				this.mix_list = this.mix_list.concat(this.multipleSelection);
				if(this.mix_list.length > 1) {
					this.mixVisible = true
				} else {
					this.mix_list = []
					this.$message.error('请选择两个以上产品')
				}
			},
			handleSelectionChange(val) {
				this.multipleSelection = val;
			},
			// 换标编辑
			saveEdit(form) {
				this.$refs[form].validate((valid) => {
					if(Number.isInteger(Number(this.form.sum))){
						
					}else {
						this.$message.error('您的输入有误，请核对')
						return false
					}
					if(valid) {
						if(this.fileList == 0) {
							this.$message.error('请上传换标文件')
							return false
						}
						let formData = new FormData()
						this.fileList.forEach((item) => {
							formData.append('fnsku_images[]', item.raw)
						})
						formData.append('cargo_id', this.form.id)
						formData.append('sum', this.form.sum)
						formData.append('dst_fnsku', this.form.dst_fnsku)
						formData.append('remark', this.form.remark)
						let config = {
							headers: {
								'Authorization': localStorage.getItem('token')
							}
						}
						this.$axios.post('/orders', formData, config).then((res) => {
							if(res.data.code == 200) {
								this.$message.success("添加成功!")
								this.getData()
								this.editVisible = false
								this.fileList = []
							}
						}).catch((res) => {
							this.$message.error(res)
						})						
					} else {
						console.log('error submit!!');
						return false
					}
				})
			},
			// 发货
			saveSend(form) {
				this.$refs[form].validate((valid) => {
					if(valid) {
						let cargo_ids = []
						let sum = []
						this.cargo_ids = cargo_ids.push(this.form.id)
						this.sum = sum.push(this.form.sum)
						let params = {
							cargo_ids: cargo_ids,
							sum: sum,
							remark: this.form.remark
						}
						let config = {
							headers: {
								'Authorization': localStorage.getItem('token')
							}
						}
						this.$axios.post('/store_outs', params, config).then((res) => {
							if(res.data.code == 200) {
								this.$message.success('提交成功！')
								this.getData()
								this.sendVisible = false;
							}
						}).catch((res) => {
							this.$message.error(res)
							console.log(res)
						})
						
					}else {
						console.log('error submit!!');
						return false
					}
				})

				//				let formData = new FormData()
				//				formData.append('cargo_ids[]', this.form.id)
				//				formData.append('sum[]', this.form.sum)
				//				formData.append('remark', this.form.remark)

			},
			// 确定删除
			deleteRow() {
				this.tableData.splice(this.idx, 1);
				this.$message.success('删除成功');
				this.delVisible = false;
			},
			changeFile(file) {
				this.fileList.push(file)
			},
			handleRemove(a, b) {
				this.fileList = b
			},
			getStatusName(status) {
				if(status == 1) {
					return "已入库"
				} else {
					return "无库存"
				}
			},
			//混装标签
//			handleClose(tag) {
//				this.dynamicTags.splice(this.dynamicTags.indexOf(tag), 1);
//			},
			showInput() {
				this.inputVisible = true;
				this.$nextTick(_ => {
					this.$refs.saveTagInput.$refs.input.focus();
				});
			},
			sendVisibleClose() {
				this.getData()
				this.sendVisible = false
			},
			//混装计划
			saveMix() {
				let cargo_ids = []
				let sum = []
				for(let i = 0; i < this.mix_list.length; i++) {
					cargo_ids.push(this.mix_list[i].id)
					sum.push(this.mix_list[i].stock_sum)
				}
				let params = {
					cargo_ids: cargo_ids,
					sum: sum,
					remark: this.form.remark
				}
				let config = {
					headers: {
						'Authorization': localStorage.getItem('token')
					}
				}
				this.$axios.post('/store_outs', params, config).then((res) => {
					if(res.data.code == 200) {
						this.$message.success('提交成功！')
						this.getData()
						this.mixVisible = false;
						this.mix_list = []
					}
				}).catch((res) => {
					this.getData()
					this.$message.error(res)
					console.log(res)
				})				
//				this.dynamicTags = []
				
			},
			closeMix() {
				this.getData()
				this.mixVisible = false
				this.mix_list = []
//				this.dynamicTags = []
			},
			cancelChange() {
				this.editVisible = false
				this.fileList = []
			}
		}
	}
</script>

<style scoped>
	.handle-box {
		margin-bottom: 20px;
	}
	
	.handle-select {
		width: 120px;
	}
	
	.handle-input {
		width: 300px;
		display: inline-block;
	}
	
	.del-dialog-cnt {
		font-size: 16px;
		text-align: center
	}
	
	.el-dropdown {
		vertical-align: top;
	}
	
	.el-dropdown+.el-dropdown {
		margin-left: 15px;
	}
	
	.el-icon-arrow-down {
		font-size: 12px;
	}
	
	.newOrder {
		text-align: center;
	}
</style>