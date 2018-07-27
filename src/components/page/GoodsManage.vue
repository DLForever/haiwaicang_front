<template>
	<div class="table">
		<div class="crumbs">
			<el-breadcrumb separator="/">
				<el-breadcrumb-item><i class="el-icon-tickets"></i> 货物管理</el-breadcrumb-item>
				<el-breadcrumb-item>货物管理</el-breadcrumb-item>
			</el-breadcrumb>
		</div>
		<div class="container">
			<div class="handle-box">
				<el-button type="primary" icon="delete" class="handle-del mr10" @click="delAll">批量删除</el-button>
				<!--<el-select v-model="select_cate" placeholder="筛选省份" class="handle-select mr10">
					<el-option key="1" label="广东省" value="广东省"></el-option>
					<el-option key="2" label="湖南省" value="湖南省"></el-option>
				</el-select>-->
				<el-input v-model="select_word" placeholder="筛选关键词" class="handle-input mr10"></el-input>
				<el-button type="primary" icon="search" @click="search">搜索</el-button>
				<el-button type="primary" icon="search" @click="mixed">混装</el-button>
			</div>
			<el-table :data="data.slice((cur_page-1)*pagesize, cur_page*pagesize)" border style="width: 100%" model="form" ref="multipleTable" @selection-change="handleSelectionChange">
				<el-table-column type="selection" width="55"></el-table-column>
				<el-table-column prop="fnsku" label="FNSKU" width="150">
				</el-table-column>
				<el-table-column prop="stock_sum" label="库存" width="150">
				</el-table-column>
				<el-table-column prop="done_sum" label="已发出数量" width="120">
				</el-table-column>
				<el-table-column prop="lock_sum" label="已锁定数量" width="120">
				</el-table-column>
				<!--<el-table-column prop="" label="上架数量" width="120">
				</el-table-column>-->
				<!--<el-table-column prop="" label="已发出/剩余" width="120">
				</el-table-column>-->
				<el-table-column prop="status" label="状态" width="120">
					<template slot-scope="scope">{{getStatusName(scope.row.status)}}</template>
				</el-table-column>
				<el-table-column prop="remark" label="备注">
				</el-table-column>
				<el-table-column label="操作" width="100">
					<template slot-scope="scope">
						<!--<el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>-->
						<!--<el-button size="small" type="danger" @click="handleDelete(scope.$index, scope.row)">删除</el-button>-->
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
								<!--<el-button @click="editVisible = true">贴标</el-button>-->
							</el-dropdown-menu>
						</el-dropdown>
					</template>
				</el-table-column>
			</el-table>
			<div class="pagination">
				<el-pagination @current-change="handleCurrentChange" l:page-sizes="[10, 20, 30, 50]" layout="sizes, prev, pager, next" :total="totals">
				</el-pagination>
			</div>
		</div>

		<!-- 换标弹出框 -->
		<el-dialog title="编辑" :visible.sync="editVisible" width="30%">
			<el-form ref="form" :model="form" label-width="80px">
				<!--<el-form-item label="入库单号">
					<el-input v-model="form.order"></el-input>
				</el-form-item>-->
				<el-form-item label="处理数量">
					<el-input v-model="form.sum"></el-input>
				</el-form-item>
				<el-form-item label="新的fnsku">
					<el-input v-model="form.dst_fnsku"></el-input>
				</el-form-item>
				<el-form-item label="备注">
					<el-input v-model="form.remark"></el-input>
				</el-form-item>
				<el-form-item label="新标PDF">
					<el-upload class="upload-demo" drag action="" :file-list="fileList" :on-remove="handleRemove" :auto-upload="false" :on-change="changeFile" :limit="5" multiple>
						<i class="el-icon-upload"></i>
						<div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
						<div class="el-upload__tip" slot="tip">只能上传jpg/png文件，且不超过500kb</div>
					</el-upload>
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
                <el-button @click="editVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveEdit('form')">确 定</el-button>
            </span>
		</el-dialog>

		<!-- 发货弹出框 -->
		<el-dialog title="编辑" :visible.sync="sendVisible" width="30%">
			<el-form ref="form" :model="form" label-width="80px">
				<!--<el-form-item label="入库单号">
					<el-input v-model="form.order"></el-input>
				</el-form-item>-->
				<el-form-item label="处理数量">
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

		<el-dialog title="编辑" :visible.sync="mixVisible" width="30%">
			<el-form :model="mix_lists">
				<el-table :data="mix_lists" border style="width: 100%">
					<el-table-column v-for="col in mix_list" :label="col.order" width="260">
						<template slot-scope="scope">
							<el-input type="text" v-model="col.sexx"></el-input>
						</template>
					</el-table-column>
				</el-table>
				<!--</el-form-item>-->
			</el-form>
			<span slot="footer" class="dialog-footer">
                <el-button @click="mixVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveEdit">确 定</el-button>
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
		name: 'basetable',
		data() {
			return {
				url: './static/vuetable.json',
				tableData: [],
				cur_page: 1,
				pagesize: 10,
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
				idx: -1
			}
		},
		created() {
			this.getData();
		},
		computed: {
			data() {
				return this.tableData.filter((d) => {
					return d
					//					let is_del = false;
					//					for(let i = 0; i < this.del_list.length; i++) {
					//						if(d.name === this.del_list[i].name) {
					//							is_del = true;
					//							break;
					//						}
					//					}
					//					if(!is_del) {
					//						if(d.address.indexOf(this.select_cate) > -1 &&
					//							(d.order.indexOf(this.select_word) > -1 ||
					//								d.address.indexOf(this.select_word) > -1)
					//						) {
					//							return d;
					//						}
					//					}
				})
			}
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
				let token = localStorage.getItem('token')
				this.$axios.get('http://47.74.177.128:3000/cargos', {
					headers: {
						'Authorization': token
					},
					page: this.cur_page
				}).then((res) => {
					this.tableData = res.data.data;
					this.totals = this.tableData.length
				})
			},
			search() {
				this.is_search = true;
			},
			//			formatter(row, column) {
			//				return row.address;
			//			},
			filterTag(value, row) {
				return row.tag === value;
			},
			handleEdit(index, row) {
				this.idx = index;
				const item = this.tableData[index];
				this.form = {
					id: item.id,
					sum: item.stock_sum,
					o_type: '1',
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
					o_type: '2',
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
				const length = this.multipleSelection.length;
				let str = '';
				this.mix_list = this.mix_list.concat(this.multipleSelection);
				this.mixVisible = true
			},
			handleSelectionChange(val) {
				this.multipleSelection = val;
			},
			// 换标编辑
			saveEdit(form) {
				let token = localStorage.getItem('token')
				let formData = new FormData()
				this.fileList.forEach((item) => {
					formData.append('fnsku_images[]', item.raw)
				})
				formData.append('o_type', this.form.o_type)
				formData.append('cargo_id', this.form.id)
				formData.append('sum', this.form.sum)
				formData.append('dst_fnsku', this.form.dst_fnsku)
				formData.append('remark', this.form.remark)
				let config = {
					headers: {
						'Authorization': token
					}
				}
				this.$axios.post('http://47.74.177.128:3000/orders', formData, config).then((res) => {
					if(res.data.code == 200) {
						this.$message.success("添加成功!")
					}
				}).catch((res) => {
					this.$message.error(res)
				})
				this.editVisible = false;
			},
			// 发货
			saveSend(form) {
				let token = localStorage.getItem('token')
				let formData = new FormData()
				formData.append('o_type', this.form.o_type)
				formData.append('cargo_id', this.form.id)
				formData.append('sum', this.form.sum)
				formData.append('remark', this.form.remark)
				let config = {
					headers: {
						'Authorization': token
					}
				}
				this.$axios.post('http://47.74.177.128:3000/orders', formData, config).then((res) => {
					if(res.data.code == 200) {
						this.$message.success('提交成功！');
					}
				}).catch((res) => {
					this.$message.error(res)
				})
				this.sendVisible = false;
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
					return "正常"
				} else {
					return "无库存"
				}
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
</style>