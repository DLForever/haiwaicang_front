<template>
	<div class="table">
		<div class="crumbs">
			<el-breadcrumb separator="/">
				<el-breadcrumb-item><i class="el-icon-tickets"></i> 入库申请管理</el-breadcrumb-item>
				<el-breadcrumb-item>入库申请详情</el-breadcrumb-item>
			</el-breadcrumb>
		</div>
		<div class="container">
			<div class="handle-box">
				<!-- <div class="fnsku_filter">
                    <el-input style="width:150px" placeholder="请输入店铺名" v-model.trim="search_shopname"></el-input>
                    <el-input style="width:150px" placeholder="请输入fnsku" v-model.trim="search_fnsku"></el-input>
                    <el-button @click="filter_product" type="primary">查询</el-button>
                </div> -->
			</div>
			<el-table :data="data" border style="width: 100%" model="form" ref="multipleTable" @selection-change="handleSelectionChange">
				<el-table-column type="selection" width="55"></el-table-column>
				<el-table-column label="申请文件">
					<template slot-scope="scope">
						<a :href="$axios.defaults.baseURL+scope.row.url.url">查看文件</a>
					</template>
				</el-table-column>
				<el-table-column prop="created_at" label="创建时间" :formatter="formatter_created_at">
				</el-table-column>
				<el-table-column prop="updated_at" label="更新时间" :formatter="formatter_updated_at">
				</el-table-column>
				<el-table-column prop="remark" label="备注">
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
									<el-button @click="detailsShow(scope.$index, scope.row)" type="text">详情</el-button>
								</el-dropdown-item>
							</el-dropdown-menu>
						</el-dropdown>
					</template>
				</el-table-column>
			</el-table>
			<div class="pagination">
				<el-pagination @current-change="handleCurrentChange" @size-change="handleSizeChange" :page-size="pagesize" layout="prev, pager, next" :total="totals">
				</el-pagination>
			</div>
		</div>

		<el-dialog title="详情" :visible.sync="detailVisible" width="65%">
			<el-table :data="batch_list" border style="width: 100%">
				<!--<el-table-column prop="ware_house_id" label="库位"></el-table-column>-->
				<el-table-column prop="batch_number" label="批次编号" width="150"></el-table-column>
				<el-table-column prop="created_at" :formatter="formatter_created_at" label="创建时间">
				</el-table-column>
				<el-table-column prop="updated_at" :formatter="formatter_updated_at" label="更新时间">
				</el-table-column>
			</el-table>
			<br />
			<el-table v-if="this.batch_list.length" :data="address" border style="width: 100%">
				<el-table-column prop="address1" label="地址一"></el-table-column>
				<el-table-column prop="address2" label="地址二"></el-table-column>
				<el-table-column prop="recipients" label="联系人"></el-table-column>
				<el-table-column prop="tel" label="电话"></el-table-column>
				<el-table-column prop="city" label="城市"></el-table-column>
				<el-table-column prop="zip" label="邮编"></el-table-column>
				<el-table-column prop="area" label="地区"></el-table-column>
			</el-table>
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
				batch_list: [],
				cur_page: 1,
				pagesize: 20,
				totals: 0,
				fileList: [],
				multipleSelection: [],
				delVisible: false,
				detailVisible: false,
				select_cate: '',
				select_word: '',
				del_list: [],
				mix_list: [],
				inputValue: '',
				idx: -1,
				address: [{address1: '12851 Telegraph Rd', address2: 'Santa Fe Springs', recipients: '', tel: '5177753674', city: 'Los Angeles', zip: '90670', area: 'CA'}]
			}
		},
		created() {
			this.getData();
			this.getNotify()
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
					3: 'success',
					2: 'warning',
					1: 'danger'
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
				this.$axios.get('/apply_store_ins?page=' + this.cur_page, {
					headers: {
						'Authorization': localStorage.getItem('token')
					}
				}).then((res) => {
					this.tableData = res.data.data
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
			handleSelectionChange(val) {
				this.multipleSelection = val;
			},
			// 确定删除
			deleteRow() {
				this.tableData.splice(this.idx, 1);
				this.$message.success('删除成功');
				this.delVisible = false;
			},
			getStatusName(status) {
				if(status == 1) {
					return "待通过"
				}else if(status == 2) {
					return "申请失败"
				} else {
					return "已通过"
				}
			},
			sendVisibleClose() {
				this.getData()
				this.sendVisible = false
			},
			detailsShow(index, row) {
				let params = {
					apply_store_in_id: row.id
				}
				this.$axios.get('/batch_store_ins', {
					headers: {
						'Authorization': localStorage.getItem('token')
					},
					params
				}).then((res) => {
					if(res.data.code == 200) {
						this.batch_list = res.data.data
						res.data.data.forEach((data) => {
							this.address[0]['recipients'] = data.batch_number
						})
						this.detailVisible = true
					}
				}).catch((res) => {
					cosnole.log('error')
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