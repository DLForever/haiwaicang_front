<template>
	<div class="table">
		<div class="crumbs">
			<el-breadcrumb separator="/">
				<el-breadcrumb-item><i class="el-icon-tickets"></i> WMS订单管理</el-breadcrumb-item>
				<el-breadcrumb-item>订单管理</el-breadcrumb-item>
			</el-breadcrumb>
		</div>
		<div class="container">
			<div class="handle-box">
				<el-button type="primary" icon="delete" class="handle-del mr10" @click="delAll">批量删除</el-button>
				<el-select v-model="select_cate" placeholder="筛选省份" class="handle-select mr10">
					<el-option key="1" label="广东省" value="广东省"></el-option>
					<el-option key="2" label="湖南省" value="湖南省"></el-option>
				</el-select>
				<el-input v-model="select_word" placeholder="筛选关键词" class="handle-input mr10"></el-input>
				<el-button type="primary" icon="search" @click="search">搜索</el-button>
			</div>
			<el-table :data="data.slice((cur_page-1)*pagesize, cur_page*pagesize)" border style="width: 100%" model="form" ref="multipleTable" @selection-change="handleSelectionChange">
				<el-table-column type="selection" width="55"></el-table-column>
				<el-table-column prop="fnsku" label="fnsku" width="150">
				</el-table-column>
				<el-table-column prop="sum" label="数量" width="150">
				</el-table-column>
				<el-table-column prop="box_sum" label="箱子数量" width="120">
				</el-table-column>
				<el-table-column prop="weight" label="装箱重量" width="120">
				</el-table-column>
				<el-table-column prop="length" label="装箱长度" width="120">
				</el-table-column>
				<el-table-column prop="width" label="装箱宽度" width="120">
				</el-table-column>
				<el-table-column prop="height" label="装箱高度" width="120">
				</el-table-column>
				<el-table-column prop="user_remark" label="用户备注">
				</el-table-column>
				<el-table-column prop="manager_remark" label="仓库备注">
				</el-table-column>
				<el-table-column prop="status" label="状态" width="120">
                	<template slot-scope="scope">{{getStatusName(scope.row.status)}}</template>
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
								<el-dropdown-item><el-button @click="handleEdit(scope.$index, scope.row)" type="text">发货</el-button></el-dropdown-item>
								<el-dropdown-item><el-button @click="showImgs(scope.$index, scope.row)" type="text">查看图片</el-button></el-dropdown-item>
								<!--<el-dropdown-item><el-button @click="editVisible = true" type="text">详情</el-button></el-dropdown-item>-->
								<!--<el-button @click="editVisible = true">贴标</el-button>-->
							</el-dropdown-menu>
						</el-dropdown>
					</template>
				</el-table-column>
			</el-table>
			<div class="pagination">
				<el-pagination @current-change="handleCurrentChange" :page-sizes="[10, 20, 30, 50]" layout="sizes, prev, pager, next" :total="totals">
				</el-pagination>
			</div>
		</div>

		<!-- 编辑弹出框 -->
		<el-dialog title="编辑" :visible.sync="editVisible" width="30%">
			<el-form ref="form" :model="form" label-width="80px">
				<el-form-item label="箱子数量">
					<el-input v-model="form.box_sum"></el-input>
				</el-form-item>
				<el-form-item label="箱子重量">
					<el-input v-model="form.weight"></el-input>
				</el-form-item>
				<el-form-item label="装箱长度">
					<el-input v-model="form.length"></el-input>
				</el-form-item>
				<el-form-item label="装箱宽度">
					<el-input v-model="form.width"></el-input>
				</el-form-item><el-form-item label="装箱高度">
					<el-input v-model="form.height"></el-input>
				</el-form-item>
				</el-form-item><el-form-item label="备注">
					<el-input v-model="form.remark"></el-input>
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
		
		<!-- 编辑弹出框 -->
		<el-dialog title="编辑" :visible.sync="showImg" width="30%">
			<el-carousel :interval="4000" type="card" height="200px">
				<el-carousel-item v-for="item in form.pictures">
					<img :src="'http://47.74.177.128:3000'+item.url.url" />
				</el-carousel-item>
			</el-carousel>
			<span slot="footer" class="dialog-footer">
                <!--<el-button @click="showImg = false">取 消</el-button>-->
                <el-button type="primary" @click="showImg = false">确 定</el-button>
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
				multipleSelection: [],
				select_cate: '',
				select_word: '',
				del_list: [],
				is_search: false,
				editVisible: false,
				delVisible: false,
				showImg: false,
				form: {
					order: 'rr',
					total_fnsku: '',
					amounts_way: '',
					amounts_get: '',
					amounts_ground: '',
					amounts_send: '',
					status: '',
					remarks: '',
					name: '',
					date: '',
					address: ''
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
//							(d.name.indexOf(this.select_word) > -1 ||
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
				let params = {
					o_type: 2,
					page: this.cur_page
				}
				this.$axios.get('http://47.74.177.128:3000/admin/orders', {
					headers: {'Authorization': token},
					params
				}).then((res) => {
					this.tableData = res.data.data;
					this.totals = this.tableData.length
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
					id: item.id,
					remark: item.remark,
					box_sum: item.box_sum,
					weight: item.weight,
					length: item.length,
					width: item.width,
					height: item.height,
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
			handleSelectionChange(val) {
				this.multipleSelection = val;
			},
			// 保存编辑
			saveEdit(form) {
				let token = localStorage.getItem('token')
				let params = {
					remark: this.form.remark,
					box_sum: this.form.box_sum,
					weight: this.form.weight,
					length: this.form.length,
					width: this.form.width,
					height: this.form.height
				}
				this.$axios.post('http://47.74.177.128:3000/admin/orders/' + this.form.id + '/done',params, {
					headers: {
						'Authorization': token
					},
				}).then((res) => {
					if(res.data.code == 200) {
						this.$message.success("换标成功!")
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
				this.showImg = true;
			},
			// 确定删除
			deleteRow() {
				this.tableData.splice(this.idx, 1);
				this.$message.success('删除成功');
				this.delVisible = false;
			},
			getStatusName(status){
            	if(status == 1){
            		return "正常"
            	}else if(status ==4){
            		return "已完成"
            	}else{
            		return '包装完成'
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