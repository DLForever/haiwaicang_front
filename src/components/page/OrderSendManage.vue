<template>
	<div class="table">
		<div class="crumbs">
			<el-breadcrumb separator="/">
				<el-breadcrumb-item><i class="el-icon-tickets"></i> 订单管理</el-breadcrumb-item>
				<el-breadcrumb-item>订单管理</el-breadcrumb-item>
			</el-breadcrumb>
		</div>
		<div class="container">
			<div class="handle-box">
				<!--<el-button type="primary" icon="delete" class="handle-del mr10" @click="delAll">批量删除</el-button>-->
			</div>
			<el-table :data="data" border style="width: 100%" ref="multipleTable" @selection-change="handleSelectionChange">
				<el-table-column type="selection" width="55"></el-table-column>
				<el-table-column prop="logistics_number" label="物流单号" fixed width="150">
				</el-table-column>
				<el-table-column prop="l_type" label="物流方式" width="150">
					<template slot-scope="scope">{{getStatusLtype(scope.row.l_type)}}</template>
				</el-table-column>
				<el-table-column prop="total_plan_sum" label="总计划数量" width="150">
				</el-table-column>
				<el-table-column prop="box_sum" label="箱子数量" width="120">
				</el-table-column>
				<el-table-column prop="created_at" label="创建时间" :formatter="formatter_created_at" width="150">
				</el-table-column>
				<el-table-column prop="updated_at" label="更新时间" :formatter="formatter_updated_at" width="150">
				</el-table-column>
				<el-table-column prop="user_remark" label="用户备注" show-overflow-tooltip>
				</el-table-column>
				<el-table-column prop="manager_remark" label="仓库备注" show-overflow-tooltip>
				</el-table-column>
				<el-table-column prop="remove_remark" label="用户删除备注" show-overflow-tooltip>
				</el-table-column>
				<el-table-column prop="status" label="状态" width="120">
					<template slot-scope="scope">
						<el-tag :type="scope.row.status | statusFilter">{{getStatusName(scope.row.status)}}</el-tag>
					</template>
				</el-table-column>
				<el-table-column label="操作" width="100">
					<template slot-scope="scope">
						<el-dropdown>
							<el-button type="primary">
								操作<i class="el-icon-arrow-down el-icon--right"></i>
							</el-button>
							<el-dropdown-menu slot="dropdown">
								<el-dropdown-item>
									<el-button size="small" @click="detailShow(scope.$index, scope.row)" type="text">&nbsp&nbsp&nbsp详&nbsp情&nbsp&nbsp&nbsp</el-button>
								</el-dropdown-item>
								<el-dropdown-item>
									<el-button size="small" @click="handleEdit(scope.$index, scope.row)" type="text">&nbsp外箱标</el-button>
								</el-dropdown-item>
								<el-dropdown-item>
									<el-button @click="showImgs(scope.$index, scope.row)" type="text">查看附件</el-button>
								</el-dropdown-item>
								<el-dropdown-item>
									<el-button @click="handleDelete(scope.$index, scope.row)" type="text">&nbsp&nbsp&nbsp删&nbsp除&nbsp&nbsp&nbsp</el-button>
								</el-dropdown-item>
								<!--<el-button @click="editVisible = true">贴标</el-button>-->
							</el-dropdown-menu>
						</el-dropdown>
						<!--<el-button size="small" @click="handleEdit(scope.$index, scope.row)">外箱标</el-button>-->
					</template>
				</el-table-column>
			</el-table>
			<div class="pagination">
				<el-pagination @current-change="handleCurrentChange" :page-size="pagesize" layout="prev, pager, next" :total="totals">
				</el-pagination>
			</div>
		</div>

		<!-- 编辑弹出框 -->
		<el-dialog title="编辑" :visible.sync="editVisible" width="30%">
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

		<!-- 删除提示框 -->
		<el-dialog title="提交删除请求" :visible.sync="delVisible" width="35%">
			<el-form ref="form" :model="form" :rules="rules" label-width="80px">
				<el-form-item label="备注" prop="remark">
					<el-input v-model.trim="form.remark"></el-input>
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
                <el-button @click="delVisible = false">取 消</el-button>
                <el-button type="primary" @click="deleteOrder('form')">确 定</el-button>
            </span>
		</el-dialog>
		<!-- 查看详情 -->
		<el-dialog title="详情" :visible.sync="detailVisible" width="60%">
			<el-table :data="form.cargo_store_outs" border style="width: 100%">
				<el-table-column prop="fnsku" label="fnsku" width="400"></el-table-column>
				<el-table-column prop="sum" label="计划发货数量"></el-table-column>
			</el-table>
			<br />
			<el-table :data="form.store_out_boxes" border style="width: 100%">
				<el-table-column prop="box_detail" label="箱子(长*宽*高)"></el-table-column>
				<el-table-column prop="weight" label="箱子重量" width="200"></el-table-column>
				<el-table-column prop="sum" label="总发货数量" width="200"></el-table-column>
				<el-table-column prop="pack_count" label="箱子包含的产品(数量)" show-overflow-tooltip></el-table-column>
			</el-table>
		</el-dialog>
	</div>
</template>

<script>
	export default {
		//		name: 'orders_sendmanage',
		data() {
			return {
				url: './static/vuetable.json',
				img_show: 1,
				pdf_show: 0,
				tableData: [],
				cur_page: 1,
				pagesize: 20,
				multipleSelection: [],
				fileList: [],
				select_cate: '',
				select_word: '',
				del_list: [],
				is_search: false,
				editVisible: false,
				delVisible: false,
				showImg: false,
				detailVisible: false,
				totals: 0,
				form: {
					name: '',
					date: '',
					address: ''
				},
				idx: -1,
				rules: {
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
					1: 'warning',
//					5: 'danger',
					4: 'success',
					6: 'primary',
					7: 'danger'
				}
				return statusMap[status]
			},
		},
		methods: {
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
				this.$axios.get('/store_outs?page' + this.cur_page, {
					headers: {
						'Authorization': localStorage.getItem('token')
					},
				}).then((res) => {
					this.tableData = res.data.data;
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
				}
				this.editVisible = true;
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
			handleDelete(index, row) {
				this.idx = index;
				this.delVisible = true;
			},
			deleteOrder(formName) {
				this.$refs[formName].validate((valid) => {
					if(valid) {
						let index = this.idx
						const item = this.tableData[index]
						this.form = {
							id: item.id,
							remark: this.form.remark
						}
						let params = {
							remark: this.form.remark
						}
						this.$axios.delete('/store_outs/' + this.form.id, {
							headers: {
								'Authorization': localStorage.getItem('token')
							},
							params
						}).then((res) => {
							if(res.data.code == 200) {
								this.getData()
								this.$message.success("成功提交申请")
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
			handleSelectionChange(val) {
				this.multipleSelection = val;
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
					return "等待打包"
				} else if(status == 4) {
					return "已发货"
				} else if(status == 7) {
					return "删除待审核"
				} else if(status == 6) {
					return "待发货"
				} else {
					return '待贴箱标'
				}
			},
			getStatusLtype(status) {
				if(status == 1) {
					return "FBA"
				} else if(status == 2) {
					return "自提"
				} else if(status == 3) {
					return "其他"
				} else {
					return '未发货'
				}
			},
			detailShow(index, row) {
				this.idx = index;
				//				const item = this.tableData[index];
				//				this.form = {
				//					cargo_store_outs: item.cargo_store_outs,
				//				}
				//				this.detailVisible = true;
				this.$axios.get('/store_outs/' + row.id, {
					headers: {
						'Authorization': localStorage.getItem('token')
					},
				}).then((res) => {
					res.data.data.store_out_boxes.forEach((data) => {
						data.pack_count = ''
						data.fnsku = []
						data.box_detail = data.box.name + ' (' + data.box.length + '*' + data.box.width + '*' + data.box.height + ')'
						data.store_out_box_cargos.forEach((data2) => {
							data.pack_count += data2.fnsku + '(' + data2.sum + ')  '
						})
					})
					this.store_outs_details = res.data.data;
					const item = this.store_outs_details
					this.form = {
						cargo_store_outs: item.cargo_store_outs,
						store_out_boxes: item.store_out_boxes
					}
					this.detailVisible = true;
				})
			},
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
	
	a {
		display: block;
		text-align: center;
	}
</style>