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
				<el-table-column prop="order" label="FNSKU" width="150">
				</el-table-column>
				<el-table-column prop="amount" label="FNSKU总数" width="150">
				</el-table-column>
				<el-table-column prop="" label="产品在途数量" width="150">
				</el-table-column>
				<el-table-column prop="" label="已收到数量" width="120">
				</el-table-column>
				<el-table-column prop="" label="上架数量" width="120">
				</el-table-column>
				<el-table-column prop="" label="已发出/剩余" width="120">
				</el-table-column>
				<el-table-column prop="" label="状态" width="120">
				</el-table-column>
				<el-table-column prop="" label="备注" :formatter="formatter">
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
									<el-button @click="editVisible = true" type="text">发货</el-button>
								</el-dropdown-item>
								<!--<el-button @click="editVisible = true">贴标</el-button>-->
							</el-dropdown-menu>
						</el-dropdown>
					</template>
				</el-table-column>
			</el-table>
			<div class="pagination">
				<el-pagination @current-change="handleCurrentChange" layout="prev, pager, next" :total="totalSize">
				</el-pagination>
			</div>
		</div>

		<!-- 编辑弹出框 -->
		<el-dialog title="编辑" :visible.sync="editVisible" width="30%">
			<el-form ref="form" :model="form" label-width="80px">
				<el-form-item label="入库单号">
					<el-input v-model="form.order"></el-input>
				</el-form-item>
				<el-form-item label="新FNSKU">
					<el-input v-model="form.address"></el-input>
				</el-form-item>
				<el-form-item label="数量">
					<el-input v-model="form.amounts"></el-input>
				</el-form-item>
				<el-form-item label="新标PDF">
					<el-upload>上传</el-upload>
				</el-form-item>
				<!--<el-form-item label="日期">
					<el-date-picker type="date" placeholder="选择日期" v-model="form.date" value-format="yyyy-MM-dd" style="width: 100%;"></el-date-picker>
				</el-form-item>-->
			</el-form>
			<span slot="footer" class="dialog-footer">
                <el-button @click="editVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveEdit">确 定</el-button>
            </span>
		</el-dialog>

		<el-dialog title="编辑" :visible.sync="mixVisible" width="30%">
			<el-table class="tb-edit" :data="planLists" style="width: 100%" highlight-current-row @row-click="handleCurrentChange">
				<el-table-column v-for="col in mix_list" :label="col.order">
					<template scope="scope">
						<el-input size="small" v-model="col.a" placeholder="请输入数量"></el-input>
					</template>
				</el-table-column>
			</el-table>			
			<span slot="footer" class="dialog-footer">
				<div class="newOrder">
					<el-button @click="createOrder">添加更多</el-button>
				</div>
                <el-button @click="mixVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveEditOrder">确 定</el-button>
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
				totalSize: 0,
				multipleSelection: [],
				select_cate: '',
				select_word: '',
				del_list: [],
				mix_list: [],
				is_search: false,
				editVisible: false,
				delVisible: false,
				mixVisible: false,
//				planList:['1'],
				planListss: {
					amounts: []
				},
				planLists:[{
					amount: []
				}],
				form: {
					order: '',
					total_fnsku: '',
					amounts_way: '',
					amounts_get: '',
					amounts_ground: '',
					amounts_send: '',
					amounts: '',
					status: '',
					remarks: '',
					name: '',
					date: '',
					address: ''
				},
				newFnsku: '',
				idx: -1
			}
		},
		created() {
			this.getData();
		},
		computed: {
			data() {
				return this.tableData.filter((d) => {
					let is_del = false;
					for(let i = 0; i < this.del_list.length; i++) {
						if(d.name === this.del_list[i].name) {
							is_del = true;
							break;
						}
					}
					if(!is_del) {
						if(d.address.indexOf(this.select_cate) > -1 &&
							(d.order.indexOf(this.select_word) > -1 ||
								d.address.indexOf(this.select_word) > -1)
						) {
							return d;
						}
					}
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
				this.$axios.get(this.url, {
					page: this.cur_page
				}).then((res) => {
					this.tableData = res.data.list;
					this.totalSize = this.tableData.length
				})
			},
			search() {
				this.is_search = true;
			},
			formatter(row, column) {
				return row.address;
			},
			filterTag(value, row) {
				return row.tag === value;
			},
			handleEdit(index, row) {
				this.idx = index;
				const item = this.tableData[index];
				this.form = {
					name: item.name,
					date: item.date,
					address: item.address,
					order: item.order,
					amount: item.amount,
					amounts: item.amounts
				}
				this.editVisible = true;
			},
			handleDelete(index, row) {
				this.idx = index;
				this.delVisible = true;
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
			// 保存编辑
			saveEdit() {
				this.$set(this.tableData, this.idx, this.form);
				this.editVisible = false;
				this.$message.success(`修改第 ${this.idx+1} 行成功`);
			},
			saveEditOrder() {
				this.planLists
				this.mixVisible = false;
			},
			// 确定删除
			deleteRow() {
				this.tableData.splice(this.idx, 1);
				this.$message.success('删除成功');
				this.delVisible = false;
			},
			
			createOrder() {
//				this.planList.push('1');
				this.planLists.push(this.planListss);
//				this.mix_list.push(this.planListss);
				this.planLists
				// 添加完newPerson对象后，重置newPerson对象
				this.planListss = {
					amounts: ''
				}
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

<!--<template>
	<el-table :data="tableData" class="tb-edit" style="width: 100%" highlight-current-row @row-click="handleCurrentChange">
		<el-table-column label="日期" width="180">
			<template scope="scope">
				<el-input size="small" v-model="scope.row.date" placeholder="请输入内容" @change="handleEdit(scope.$index, scope.row)"></el-input>
				<!--<span>{{scope.row.date}}</span>-->
<!--</template>
		</el-table-column>
		<el-table-column label="姓名" width="180">
			<template scope="scope">
				<el-input size="small" v-model="scope.row.name" placeholder="请输入内容" @change="handleEdit(scope.$index, scope.row)"></el-input>
				<span>{{scope.row.name}}</span>
			</template>
		</el-table-column>
		<el-table-column prop="address" label="地址">
			<template scope="scope">
				<el-input size="small" v-model="scope.row.address" placeholder="请输入内容" @change="handleEdit(scope.$index, scope.row)"></el-input>
				<span>{{scope.row.address}}</span>
			</template>
		</el-table-column>
		<el-table-column label="操作">
			<template scope="scope">
				<!--<el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>-->
<!--<el-button size="small" type="danger" @click="handleDelete(scope.$index, scope.row)">删除</el-button>
			</template>
		</el-table-column>
	</el-table>-->
<!--<br>数据:{{tableData}}</p>-->
<!--</template>-->-->-->

<!--<script>
	export default {
		data() {
			return {
				tableData: [{
					date: '2016-05-02',
					name: '王小虎',
					address: '上海市普陀区金沙江路 1518 弄'
				}, {
					date: '2016-05-04',
					name: '王小虎',
					address: '上海市普陀区金沙江路 1517 弄'
				}, {
					date: '2016-05-01',
					name: '王小虎',
					address: '上海市普陀区金沙江路 1519 弄'
				}, {
					date: '2016-05-03',
					name: '王小虎',
					address: '上海市普陀区金沙江路 1516 弄'
				}]
			}
			
		},
		methods: {
				handleCurrentChange(row, event, column) {
					console.log(row, event, column, event.currentTarget)
				},
				handleEdit(index, row) {
					console.log(index, row);
				},
				handleDelete(index, row) {
					console.log(index, row);
				}
			}

	}
</script>-->