<template>
	<div>
		<div class="crumbs">
			<el-breadcrumb separator="/">
				<el-breadcrumb-item><i class="el-icon-date"></i> 出库单管理</el-breadcrumb-item>
				<el-breadcrumb-item>出库单管理</el-breadcrumb-item>
			</el-breadcrumb>
		</div>
		<div class="container">
			<!-- <el-tabs v-model="message">
				<el-tab-pane label="新建产品" name="first"> -->
			<div class="handle-box">
				<el-button type="primary" @click="showOutBound">创建出库单</el-button>
				<div class="fnsku_filter">
					fnsku:
                    <el-input style="width:150px" placeholder="请输入fnsku" v-model.trim="search_fnsku"></el-input>
                    <el-button @click="clear_search" type="default">重置</el-button>
                    <el-button @click="filter_inbound" type="primary">查询</el-button>
                </div>
			</div>
				
			<el-table :data="data" border style="width: 100%" ref="multipleTable" @selection-change="handleSelectionChange">
				<el-table-column type="selection" width="55"></el-table-column>
				<!--<el-table-column prop="created_at" label="创建时间" :formatter="formatter_created_at" width="150">
				</el-table-column>
				<el-table-column prop="updated_at" label="更新时间" :formatter="formatter_updated_at" width="150">
				</el-table-column>				-->
				<el-table-column prop="total" label="数量">
				</el-table-column>
				<el-table-column prop="user_remark" label="用户备注" show-overflow-tooltip>
				</el-table-column>
				<el-table-column prop="manager_remark" label="仓库备注" show-overflow-tooltip>
				</el-table-column>
				<el-table-column prop="remove_remark" label="用户删除备注" show-overflow-tooltip>
				</el-table-column>
				<el-table-column prop="created_at" label="创建时间" :formatter="formatter_created_at" width="150">
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
									<el-button @click="detailsShow(scope.$index, scope.row)" type="text">&nbsp&nbsp&nbsp详情&nbsp</el-button>
								</el-dropdown-item>
								<el-dropdown-item>
									<el-button @click="updateOutbound(scope.$index, scope.row)" type="text">&nbsp&nbsp&nbsp更新&nbsp</el-button>
								</el-dropdown-item>
								<el-dropdown-item>
									<el-button size="small" @click="handleEdit(scope.$index, scope.row)" type="text">&nbsp外箱标</el-button>
								</el-dropdown-item>
								<el-dropdown-item>
									<el-button @click="showImgs(scope.$index, scope.row)" type="text">查看附件</el-button>
								</el-dropdown-item>
								<el-dropdown-item>
									<el-button @click="handleDelete(scope.$index, scope.row)" type="text">&nbsp&nbsp&nbsp删除&nbsp</el-button>
								</el-dropdown-item>
							</el-dropdown-menu>
						</el-dropdown>
					</template>
				</el-table-column>
			</el-table>
			<div class="pagination">
				<el-pagination v-if="paginationShow"  :page-size="pagesize" layout="prev, pager, next" :total="totals">
				</el-pagination>
			</div>
		<!-- </el-tab-pane>
		<el-tab-pane label="批量上传" name="second">
					<template v-if="message === 'second'">
						<el-form ref="form" :model="form" label-width="85px">
							<el-form-item label="批量上传">
								<el-upload class="upload-demo" drag action="" :file-list="fileList2" :on-remove="handleRemove2" :auto-upload="false" :on-change="changeFile2" :limit="5" multiple>
									<i class="el-icon-upload"></i>
									<div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
									<div class="el-upload__tip" slot="tip">只能上传xls文件</div>
								</el-upload>
								<a type="primary" href="">模板下载</a>
							</el-form-item>
						</el-form>
					</template>
				</el-tab-pane>
	</el-tabs> -->
			<!-- 添加出库弹出框 -->
			<el-dialog title="创建出库单" :visible.sync="outboundVisible" width="70%" @close="closeOutbound">
				<el-table :data="form" border style="width: 100%" ref="multipleTable">
					<el-table-column prop="total" label="原fnsku">
						<template slot-scope="scope">
							<el-select v-model="scope.row.product_id" placeholder="选择产品" class="handle-select mr10">
								<el-option v-for="item in options" :key="item.id" :label="item.fnsku" :value="item.id"></el-option>
							</el-select>
						</template>
					</el-table-column>
					<el-table-column prop="new_fnsku" label="新的fnsku">
						<template slot-scope="scope">
							<el-input v-model.trim="scope.row.new_fnsku" placeholder="新的fnsku"></el-input>
						</template>
					</el-table-column>
					<el-table-column prop="sku" label="sku">
						<template slot-scope="scope">
							<el-input v-model.trim="scope.row.sku" placeholder="sku"></el-input>
						</template>
					</el-table-column>
					<el-table-column prop="plan_sum" label="数量">
						<template slot-scope="scope">
							<el-input v-model.trim="scope.row.plan_sum" placeholder="计划数量"></el-input>
						</template>
					</el-table-column>
					<el-table-column label="新标">
						<template slot-scope="scope">
							<my-uploader v-if="my_uploaderVisible" @current-change="handleCurrentChange" :onChange="changeLabel.bind(null,scope.$index)"></my-uploader>
						</template>
						
					</el-table-column>
				</el-table>
				<el-form :rules="rules" label-width="115px">
					<!-- <el-form-item>
						<table class="table text-center">
							<tbody v-for="(p,index) in form">
								<tr>
									<td>
										<el-select v-model="p.product_id" placeholder="选择产品" class="handle-select mr10">
											<el-option v-for="item in options" :key="item.id" :label="item.fnsku" :value="item.id"></el-option>
											<infinite-loading :on-infinite="onInfinite" ref="infiniteLoading"></infinite-loading>
										</el-select>
									</td>
									
									<td>
											<el-input v-model.trim="p.new_fnsku" placeholder="新的fnsku"></el-input>
									</td>
									<td>
											<el-input v-model.trim="p.sku" placeholder="sku"></el-input>
									</td>
									<td>
											<el-input v-model.trim="p.plan_sum" placeholder="计划数量"></el-input>
									</td>
									<td  @click="getIndex(index)">
										<my-uploader v-if="my_uploaderVisible" :onChange="changeLabel.bind(null,index)"></my-uploader>			
									</td>
								</tr>
							</tbody>
						</table>
					</el-form-item> -->
					<br>
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
					<!-- <el-form-item> -->
					<div class="confirm">
						<el-button type="default" @click="closeOutbound">取消</el-button>
						<el-button type="primary" @click="onSubmit">新建</el-button>
					</div>
					<!-- </el-form-item> -->
				</el-form>
			</el-dialog>

			<!-- 更新出库弹出框 -->
			<el-dialog title="更新出库单" :visible.sync="updateVisible" width="60%" @close="closeUpdate">
				<el-table :data="updateform" border style="width: 100%" ref="multipleTable">
					<el-table-column prop="total" label="原fnsku">
						<template slot-scope="scope">
							<el-select v-model="scope.row.product_id" placeholder="选择产品" class="handle-select mr10">
								<el-option v-for="item in options" :key="item.id" :label="item.fnsku" :value="item.id"></el-option>
							</el-select>
						</template>
					</el-table-column>
					<el-table-column prop="new_fnsku" label="新的fnsku">
						<template slot-scope="scope">
							<el-input v-model.trim="scope.row.new_fnsku" placeholder="新的fnsku"></el-input>
						</template>
					</el-table-column>
					<el-table-column prop="sku" label="sku">
						<template slot-scope="scope">
							<el-input v-model.trim="scope.row.sku" placeholder="sku"></el-input>
						</template>
					</el-table-column>
					<el-table-column prop="plan_sum" label="数量">
						<template slot-scope="scope">
							<el-input v-model.trim="scope.row.plan_sum" placeholder="计划数量"></el-input>
						</template>
					</el-table-column>
					<el-table-column label="新标">
						<template slot-scope="scope">
							<my-uploader v-if="scope.row.picturefileList != ''" :onChange="updateLabel.bind(null,scope.$index)" :defaultImg="$axios.defaults.baseURL+scope.row.picturefileList"></my-uploader>
							<my-uploader v-else :onChange="updateLabel.bind(null,scope.$index)"></my-uploader>
						</template>
						
					</el-table-column>
				</el-table>
				<!-- <el-form :rules="rules" label-width="115px">
					<el-form-item label="出库单" required>
						<table class="table text-center">
							<tbody v-for="(p,index) in updateform">
								<tr>
									<td>
										<el-select v-model="p.product_id" placeholder="选择产品" class="handle-select mr10">
											<el-option v-for="item in options" :key="item.id" :label="item.fnsku" :value="item.id"></el-option>
											<infinite-loading :on-infinite="onInfinite" ref="infiniteLoading"></infinite-loading>
										</el-select>
									</td>
									<td>
										<el-input v-model.trim="p.new_fnsku" placeholder="新的fnsku"></el-input>
									</td>
									<td>
										<el-input v-model.trim="p.plan_sum" placeholder="计划数量"></el-input>
									</td>
									<td @click="getIndex(index)">
										<my-uploader v-if="p.picturefileList != ''" :onChange="updateLabel.bind(null,index)" :defaultImg="$axios.defaults.baseURL+p.picturefileList"></my-uploader>
										<my-uploader v-else :onChange="updateLabel.bind(null,index)"></my-uploader>			
									</td>
								</tr>
							</tbody>
						</table>
					</el-form-item> -->
					<br>
				<el-form>
					<div class="newOrder">
						<el-button @click="updateAdd">添加出库单</el-button>
						<el-button @click="updateCancel" :disabled="isDisableUpdate" type="danger">撤销</el-button>
					</div>
					<br>
					<el-form-item label="是否混装">
						<el-radio v-model="updateRadio" label="true">是</el-radio>
						<el-radio v-model="updateRadio" label="false">否</el-radio>
					</el-form-item>
					<el-form-item label="备注">
						<el-input v-model="remark"></el-input>
					</el-form-item>
					<div class="confirm">
						<el-button type="default" @click="closeUpdate">取消</el-button>
						<el-button type="primary" @click="submitUpdate">更新</el-button>
					</div>
				</el-form>
			</el-dialog>

			<!-- 详情提示框 -->
			<el-dialog title="详情" :visible.sync="detailVisible" width="65%">
				<div class="check_button">
					<el-button type="primary" @click="check">通过审核</el-button>
				</div>
				<br>
				<el-table :data="OutBoundTable" border style="width: 100%">
					<el-table-column prop="fnsku" label="fnsku"></el-table-column>
					<el-table-column prop="dst_fnsku" label="新fnsku"></el-table-column>
					<el-table-column prop="sum" label="数量"></el-table-column>
					<el-table-column prop="sum" label="新标" width="150px">
						<template slot-scope="scope">
							<img class="img_fnsku" v-if="scope.row.pictures[0] != undefined" :src="$axios.defaults.baseURL+scope.row.pictures[0].url.url"/>
							<span v-else>无</span>
						</template>
					</el-table-column>
					<el-table-column label="操作" width="80px">
						<template slot-scope="scope">
							<el-button type="danger" @click="confirmdestroyLabel(scope.$index, scope.row)">删除</el-button>
						</template>
					</el-table-column>
				</el-table>
				<br>
				<el-table v-if="this.order_box_cargos.length != 0" :data="order_box_cargos" border style="width: 100%">
					<el-table-column type="expand">
						<template slot-scope="scope">
							<el-table :data="scope.row.order_box_cargos">
								<el-table-column prop="fnsku" label="fnsku"></el-table-column>
								<el-table-column prop="sum" label="数量"></el-table-column>
							</el-table>
						</template>
					</el-table-column>
					<el-table-column prop="sum" label="数量"></el-table-column>
					<el-table-column prop="box_size" label="箱子尺寸(长*宽*高)"></el-table-column>
					<el-table-column prop="weight" label="箱子重量"></el-table-column>
				</el-table>
			</el-dialog>
			<!-- 删除出库单提示 -->
			<el-dialog title="提交删除请求" :visible.sync="delOutVisible" width="35%">
				<div class="del-dialog-cnt">删除不可恢复，是否确定删除？</div>
				<span slot="footer" class="dialog-footer">
                <el-button @click="delOutVisible = false">取 消</el-button>
                <el-button type="danger" @click="destroyLabel('form2')">确 定</el-button>
            </span>
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
                <el-button type="danger" @click="deleteOrder('form2')">确 定</el-button>
            </span>
			</el-dialog>
			<!-- 贴标弹出框 -->
			<el-dialog title="编辑" :visible.sync="editVisible" width="50%" @close="cancelLabel">
				<el-table v-if="this.order_box_cargos.length != 0" :data="order_box_cargos" border style="width: 100%">
					<el-table-column type="expand">
						<template slot-scope="scope">
							<el-table :data="scope.row.order_box_cargos">
								<el-table-column prop="fnsku" label="fnsku"></el-table-column>
								<el-table-column prop="sum" label="数量"></el-table-column>
							</el-table>
						</template>
					</el-table-column>
					<el-table-column prop="sum" label="数量"></el-table-column>
					<el-table-column prop="box_size" label="箱子尺寸(长*宽*高)"></el-table-column>
					<el-table-column prop="weight" label="箱子重量"></el-table-column>
					<el-table-column label="货物编码">
						<template slot-scope="scope">
							<el-input placeholder="输入货物编码" :value="scope.row.cargo_number" v-model="scope.row.cargo_number"></el-input>
						</template>
					</el-table-column>
				</el-table>
				<br>
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
	import notificatinImg from "@/assets/close.png"
	import VueInfiniteLoading from "vue-infinite-loading"
	import MyUploader from "@/components/common/my_uploader"
	export default {
		//		name: 'baseform',
		data: function() {
			return {
				url: './static/vuetable.json',
				message: 'first',
				totals: 0,
				drag:false,
				batch_totals: 0,
				cur_page: 1,
				batch_page: 1,
				details_id: undefined,
				label_del_id: undefined,
				update_id: undefined,
				tableData: [],
				options: [],
				OutBoundTable: [],
				order_box_cargos: [],
				batch_options: [],
				fileList: [],
				select_batch: '',
				product_id: '',
				remark: '',
				radio: 'true',
				updateRadio: undefined,
				form2: {
					remark: ''
				},
				form: [{
					product_id: '',
					new_fnsku: '',
					sku: '',
					plan_sum: '',
					picturefileList: '',
				}],
				newForm: {
					product_id: '',
					newfnsku: '',
					sku: '',
					plan_sum: '',
					picturefileList: '',
				},
				newForm2: {
					product_id: '',
					new_fnsku: '',
					sku: '',
					plan_sum: '',
					picturefileList: '',
				},
				updateform: [],
				updateform2: {
					// id: '',
					product_id: '',
					new_fnsku: '',
					sku: '',
					plan_sum: '',
					picturefileList: '',
				},
				updateLength: undefined,
				inputVisible: false,
				inputVisible2: false,
				outboundVisible: false,
				detailVisible: false,
				delVisible: false,
				editVisible: false,
				showImg: false,
				pictureVisible: false,
				updateVisible: false,
				delOutVisible: false,
				paginationShow: true,
				pagesize: 20,
				img_show: 1,
				pdf_show: 0,
				picture_index: undefined,
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
				},
				my_uploaderVisible: true,
				notifications: [],
				search_fnsku: ''
			}
		},
		props:{
			getMessageCount:Function
		},
		created() {
			this.getData()
			this.getDatas()
			this.getBatchInbound()
		},
		computed: {
			isDisableBu() {
				if(this.form.length <= 1) {
					return true
				} else {
					return false
				}
			},
			isDisableUpdate() {
				if(this.updateform.length <= this.updateLength) {
					return true
				} else {
					return false
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
					3: 'primary',
					1: 'warning',
					8: 'danger',
					2: 'success',
					7: 'info',
					6: 'warning',
					10: 'success'
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
				this.$axios.get('/outbound_orders?page=' + this.cur_page + '&fnsku=' + this.search_fnsku, {
					headers: {
						'Authorization': localStorage.getItem('token')
					}
				}).then((res) => {
					if(res.data.code == 200) {
						res.data.data.forEach((data) => {
							if(data.is_mix) {
								data.is_mix = '混装'
							} else {
								data.is_mix = '不混装'
							}
						})
						this.tableData = res.data.data
						this.totals = res.data.count
						this.paginationShow = true
					}
				}).catch((res) => {

				})
			},
			filter_inbound() {
				this.paginationShow = false
				this.cur_page = 1
				this.$axios.get('/outbound_orders?page=' + this.cur_page + '&fnsku=' + this.search_fnsku, {
					headers: {
						'Authorization': localStorage.getItem('token')
					}
				}).then((res) => {
					if(res.data.code == 200) {
						res.data.data.forEach((data) => {
							if(data.is_mix) {
								data.is_mix = '混装'
							} else {
								data.is_mix = '不混装'
							}
						})
						this.tableData = res.data.data
						this.totals = res.data.count
						this.paginationShow = true
					}
				}).catch((res) => {

				})
			},
			clear_search() {
				this.search_fnsku = ''
				this.getDatas()
			},
			handleCurrentChange(val) {
				this.cur_page = val
				this.getDatas()
			},
			getBatchInbound() {
				this.$axios.get('/batch_store_ins/available_index?page=' + this.batch_page, {
					headers: {
						'Authorization': localStorage.getItem('token')
					}
				}).then((res) => {
					if(res.data.code == 200) {
						this.batch_options = this.batch_options.concat(res.data.data)
						this.batch_totals = res.data.count
					}
				}).catch((res) => {

				})
			},
			detailsShow(index, row) {
				this.details_id = row.id
				this.$axios.get('/outbound_orders/' + row.id, {
					headers: {
						'Authorization': localStorage.getItem('token')
					},
				}).then((res) => {
					if(res.data.code == 200) {
						this.OutBoundTable = res.data.data.label_changes
						res.data.data.order_boxes.forEach((data) => {
							data.box_size = data.box.length + '*' + data.box.width + '*' + data.box.height
						})
						this.order_box_cargos = res.data.data.order_boxes
						this.detailVisible = true
					}
				})
			},
			showOutBound() {
				this.my_uploaderVisible = true
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
					sku: '',
					product_id: '',
					picturefileList: ''
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
			},
			orderDel(index) {
				if(this.form[index]['form_branch'].length == 1) {
					this.$message.error("至少保留一项哦")
					return false;
				}
				this.form[index]['form_branch'].pop(this.newForm)
			},
			back() {
				this.form.pop(this.newForm2)
			},
			popTest(index,id) {
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
				let logistics_number = []
				let product_ids = []
				let plan_sum = []
				let new_fnsku = []
				let store_ins = []
				let files = []
				let noPic = undefined
				let formData = new FormData()
				this.form.forEach((data) => {
					if(data['picturefileList'] == '') {
						noPic = 1
					}
					product_ids.push(data['product_id'])
					plan_sum.push(Number(data['plan_sum']))
					new_fnsku.push(data['new_fnsku'])
					files.push(data['picturefileList'])
				})
				if(noPic) {
					this.$message.error("请上传新标")
					return false
				}
				this.form.forEach((data) => {
					formData.append('cargo_ids[]', data['product_id'])
					formData.append('dst_fnsku[]', data['new_fnsku'])
					formData.append('sku[]', data['sku'])
					formData.append('sum[]', Number(data['plan_sum']))
				})
				formData.append('is_mix', this.radio)
				formData.append('remark', this.remark)
				files.forEach((item) => {
					formData.append('files[]', item)
				})
				let params = {
					cargo_ids: product_ids,
					dst_fnsku: new_fnsku,
					sum: plan_sum,
					files: files,
					is_mix: this.radio,
					remark: this.remark
				}
				this.$axios.post('/outbound_orders', formData, {
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
							sku: '',
							product_id: '',
							picturefileList: ''
						}]
						this.getDatas()
						this.outboundVisible = false
						this.getMessageCount()
						// let mesId =  JSON.parse(localStorage.getItem('notifyid')) || []
						// this.$axios.get('/notifications', {
		    //                 headers: {
		    //                     'Authorization': localStorage.getItem('token')
		    //                 },
		    //             }).then((res) => {
		    //                 if(res.data.code == 200) {
		    //                     res.data.data.forEach((data, index) => {
		    //                         let offsettemp = 100 + 70 * index
		    //                         if(mesId.indexOf(data.id) == -1) {
		    //                             this.notifications.push(this.$notify({
      //                                       title: '您有新的消息',
      //                                       dangerouslyUseHTMLString: true,
      //                                       offset: offsettemp,
      //                                       message: data.message + `&nbsp<img src="${notificatinImg}"></img>`,
      //                                       onClick: this.popTest.bind(null,this.notifications.length,data.id),
      //                                       customClass: "testlzh",
      //                                       duration: 7000,
      //                                       showClose: false
      //                                   }))
		    //                             mesId.push(data.id)
		    //                             localStorage.removeItem('notifyid')
		    //                             localStorage.setItem('notifyid', JSON.stringify(mesId))  
		    //                         }
		    //                     })
		    //                 }
		    //             }).catch((res) => {
		    //                 console.log('error')
		    //             })
		    

					}
				}).catch((res) => {
					this.$message.error('提交失败！');
				})
			},
			submitUpdate() {
				let noPic = undefined
				let formData = new FormData()
				this.updateform.forEach((data, index) => {
					if(index+1 <= this.updateLength) {
						formData.append('label_changes[][id]',data['id'])
					}
					if(data['picturefileList'] == '') {
						noPic = 1
					}
					formData.append('label_changes[][cargo_id]',data['product_id'])
					formData.append('label_changes[][dst_fnsku]',data['new_fnsku'])
					formData.append('label_changes[][sum]',data['plan_sum'])
					formData.append('label_changes[][sku]',data['sku'])
					console.log(data['picturefileList'])
					if(typeof data['picturefileList'] != "string") {
						formData.append('label_changes[][pictures][]',data['picturefileList'])
					}
				})
				if(noPic) {
					this.$message.error("请上传新标")
					return false
				}
				formData.append('is_mix', this.updateRadio)
				formData.append('remark', this.remark)
				this.$axios.patch('/outbound_orders/' + this.update_id, formData, {
					headers: {
						'Authorization': localStorage.getItem('token')
					}
				}).then((res) => {
					if(res.data.code == 200) {
						this.$message.success("更新成功")
						this.updateVisible  =false
						this.getMessageCount()
					}
				}).catch((res) => {
					console.log(res)
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
				this.$axios.get('/outbound_orders/' + row.id, {
					headers: {
						'Authorization': localStorage.getItem('token')
					},
				}).then((res) => {
					res.data.data.order_boxes.forEach((data) => {
						data.box_size = data.box.length + '*' + data.box.width + '*' + data.box.height
					})
					this.order_box_cargos = res.data.data.order_boxes
				})
				this.editVisible = true;
			},
			updateOutbound(index, row) {
				this.update_id = row.id
				this.$axios.get('/outbound_orders/' + row.id, {
					headers: {
						'Authorization': localStorage.getItem('token')
					},
				}).then((res) => {
					res.data.data.label_changes.forEach((data, index) => {
						this.updateLength = res.data.data.label_changes.length
						this.updateform.push(this.updateform2)
						this.updateform[index].id = data.id
						this.updateform[index].product_id = data.cargo_id
						this.updateform[index].new_fnsku = data.dst_fnsku
						this.updateform[index].plan_sum = data.sum
						this.updateform[index].sku = data.sku
						if(data.pictures[0] != undefined) {
							this.updateform[index].picturefileList = data.pictures[0].url.url
						}
						this.updateform2 = {
							// id: '',
							product_id: '',
							new_fnsku: '',
							sku: '',
							plan_sum: '',
							picturefileList: '',
						}
					})
					this.remark = res.data.data.user_remark
					this.updateRadio = String(res.data.data.is_mix)
					this.updateVisible = true
				})
				
			},
			updateAdd() {
				this.updateform.push(this.updateform2)
				this.updateform2 = {
					// id: '',
					product_id: '',
					new_fnsku: '',
					sku: '',
					plan_sum: '',
					picturefileList: '',
				}
			},
			updateCancel() {
				this.updateform.pop(this.updateform2)
			},
			closeOutbound() {
				this.my_uploaderVisible = false
				this.remark = ''
				this.form = [{
							plan_sum: '',
							new_fnsku: '',
							sku: '',
							product_id: '',
							picturefileList: ''
						}]
				this.outboundVisible = false
			},
			closeUpdate() {
				this.remark = ''
				this.updateform = []
				this.updateVisible = false
			},
			// 添加外箱标
			saveEdit(form) {
				let order_box_ids = []
				let cargo_number = []
				let formData = new FormData()
				this.order_box_cargos.forEach((data) => {
					formData.append('order_box_ids[]', data.box_id)
					formData.append('cargo_number[]', data.cargo_number)
				})
				console.log(cargo_number)
				if(this.fileList.length == 0) {
					this.$message.error('请添加外箱标')
					return false
				}
				
				this.fileList.forEach((item) => {
					formData.append('picture[]', item.raw)
				})
				let config = {
					headers: {
						'Authorization': localStorage.getItem('token')
					}
				}
				this.$axios.post('/outbound_orders/' + this.form.id + '/upload_image', formData, config).then((res) => {
					if(res.data.code == 200) {
						this.$message.success("添加成功!")
						this.getDatas()
					}
				}).catch((res) => {
					
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
			confirmdestroyLabel(index, row) {
				this.idx = index
				this.label_del_id = row.id
				this.delOutVisible = true
			},
			destroyLabel() {
				let params ={
					label_change_id: this.label_del_id
				}
				this.$axios.post('/outbound_orders/' + this.details_id + '/destroy_label_change', params, {
					headers: {
						'Authorization': localStorage.getItem('token')
					}
				}).then((res) => {
					if(res.data.code == 200) {
						this.delOutVisible = false
						this.OutBoundTable.splice(this.idx, 1)
						this.$message.success("删除成功！")
					}
				}).catch((res) => {
					console.log(res)
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
			changeLabel(index,file) {
				// const isJPG = file.raw.type === 'image/jpeg';
				// console.log(file.raw.type)
				// if (!isJPG) {
    //       			this.$message.error('请上传正确格式的图片!')
    //       			return false
    //     		}
    			console.log("index:")
    			console.log(index)
    			this.form[index].picturefileList = file
				// console.log(this.form)
			},
			updateLabel(index, file) {
				this.updateform[index].picturefileList = file
			},
			beforeAvatarUpload(file) {
				const isJPG = file.type === 'image/jpeg';
				if (!isJPG) {
          			this.$message.error('上传头像图片只能是 JPG 格式!')
          			return false
        		}
        		return isJPG
			},
			getIndex(index) {
				console.log(index)
				this.picture_index = index
			},
			handleRemove(a, b) {
				this.fileList = b
			},
			remove_label(a, b) {
				this.form[this.picture_index].picturefileList = ''
			},
			exceed() {
				this.$message.error("对不起，超过个数限制")
			},
			check() {
				this.$axios.get('/outbound_orders/' + this.details_id + '/user_check', {
					headers: {
						'Authorization': localStorage.getItem('token')
					}
				}).then((res) => {
					if(res.data.code == 200) {
						this.$message.success("审核成功!")
						this.getDatas()
					}
				}).catch((res) => {
					console.log(res)
				})
			},
			formatter_created_at(row, column) {
				return row.created_at.substr(0, 19);
			},
			getStatusName(status) {
				if(status == 1) {
					return "待审核"
				} else if(status == 2) {
					return "正在拣货"
				} else if (status == 3) {
					return "待换标"
				} else if (status == 4) {
					return "待审核"
				}else if (status == 5) {
					return "审核通过"
				}else if(status == 8) {
					return "删除待审核"
				} else if(status == 6) {
					return '已提供箱标'
				}else if (status == 7) {
					return "被删除"
				}else if (status == 9) {
					return "删除"
				}else if (status == 10) {
					return "已完成"
				}else if (status == 11) {
					return "待拣货"
				}else if (status == 12) {
					return '已换标'
				} else {
					return '其他'
				}
			},
		},
		components: {
			"infinite-loading": VueInfiniteLoading,
			"my-uploader": MyUploader
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

	.check_button {
		text-align: left;
	}

	.confirm {
		text-align: center;
	}

	.img_fnsku {
		width:5rem;
    	height:5rem;
	}

	.fnsku_filter {
        float: right;
    }

	.uploader_containner{
    display: inline-block;
  	}
  .uploader_containner > .upload_img{
    width:5rem;
    height:5rem;
  }

	.el-icon-plus:before {
    font-size: 2px;
  }
  .avatar {
    width: 50px;
    height: 50px;
    display: block;
  }
  .el-upload--picture-card {
    background-color: #fbfdff;
    border: 1px dashed #c0ccda;
    border-radius: 6px;
    box-sizing: border-box;
    width: 57px;
    height: 57px;
    line-height: 46px;
    vertical-align: top;
}
.el-upload-list--picture-card .el-upload-list__item {
    overflow: hidden;
    background-color: #fff;
    border: 1px solid #c0ccda;
    border-radius: 6px;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    width: 57px;
    height: 57px;
    margin: 0 8px 8px 0;
    display: inline-block;
}
</style>