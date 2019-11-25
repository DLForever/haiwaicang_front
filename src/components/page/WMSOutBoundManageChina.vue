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
				<div class="fnsku_filter">
					用户:
					<el-select v-model="select_cate" filterable remote placeholder="选择用户" class="handle-select mr10" :loading="loading" @visible-change="selectVisble" :remote-method="remoteMethod">
						<el-option v-for="item in options" :label="item.usercode" :value="item.id"></el-option>
						<infinite-loading :on-infinite="onInfinite" ref="infiniteLoading"></infinite-loading>
					</el-select>
					Fnsku:
                    <el-input style="width:150px" placeholder="请输入Fnsku" v-model.trim="search_fnsku"></el-input>
                    状态:
					<el-select v-model="statusSelect" placeholder="请选择" class="handle-select mr10">
						<el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
					</el-select>
                    <el-button @click="clear_search" type="default">重置</el-button>
                    <el-button @click="filter_inbound" type="primary">查询</el-button>
                </div>
			</div>
			<br><br>
			<el-table :data="data" border style="width: 100%" model="form" ref="multipleTable" @selection-change="handleSelectionChange">
				<el-table-column type="selection" width="55"></el-table-column>
				<el-table-column prop="barcode" label="出库单号">
				</el-table-column>
				<!-- <el-table-column label="条形码" width="120">
					<template slot-scope="scope">
						<barcode :value="scope.row.barcode" :options="{displayValue:false}" tag="img" width="100" height="50"></barcode>
					</template>
				</el-table-column> -->
				<el-table-column prop="user_number" label="用户名">
				</el-table-column>
				<el-table-column prop="total" label="数量">
				</el-table-column>
				<el-table-column prop="user_remark" label="用户备注" show-overflow-tooltip>
				</el-table-column>
				<el-table-column prop="manager_remark" label="仓库备注" show-overflow-tooltip>
				</el-table-column>
				<el-table-column prop="remove_remark" label="用户删除备注" show-overflow-tooltip>
				</el-table-column>
				<el-table-column prop="created_at" label="创建时间" :formatter="formatter_created_at" show-overflow-tooltip>
				</el-table-column>
				<el-table-column prop="is_mix" label="是否混装" width="150"></el-table-column>
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
									<el-button @click="detailsShow(scope.$index, scope.row)" type="text">&nbsp&nbsp&nbsp详&nbsp情&nbsp&nbsp&nbsp</el-button>
								</el-dropdown-item>
								<el-dropdown-item>
									<el-button @click="showImgs(scope.$index, scope.row)" type="text">&nbsp&nbsp&nbsp附&nbsp件&nbsp&nbsp&nbsp</el-button>
								</el-dropdown-item>
								<el-dropdown-item>
									<el-button @click="package(scope.$index, scope.row)" type="text">&nbsp&nbsp&nbsp打&nbsp包&nbsp&nbsp&nbsp</el-button>
								</el-dropdown-item>
								<el-dropdown-item>
									<el-button @click="package(scope.$index, scope.row, 'extra')" type="text">额外打包</el-button>
								</el-dropdown-item>
								<el-dropdown-item>
									<el-button @click="packageBatch(scope.$index, scope.row, 'extra')" type="text">批量打包</el-button>
								</el-dropdown-item>
								<el-dropdown-item>
									<el-button @click="check(scope.$index, scope.row)" type="text">&nbsp&nbsp&nbsp结&nbsp算&nbsp&nbsp&nbsp</el-button>
								</el-dropdown-item>
								<!-- <el-dropdown-item>
									<el-button @click="sendProduct(scope.$index, scope.row)" type="text">&nbsp&nbsp&nbsp发&nbsp货&nbsp&nbsp&nbsp</el-button>
								</el-dropdown-item> -->
								<!-- <el-dropdown-item>
									<el-button @click="printStock(scope.$index, scope.row)" type="text">打印出库单&nbsp&nbsp&nbsp</el-button>
								</el-dropdown-item> -->
								<el-dropdown-item>
									<el-button @click="handleDelete(scope.$index, scope.row)" type="text">&nbsp&nbsp&nbsp删&nbsp除&nbsp&nbsp&nbsp</el-button>
								</el-dropdown-item>
							</el-dropdown-menu>
						</el-dropdown>
					</template>
				</el-table-column>
			</el-table>
			<div class="pagination">
				<el-pagination v-if="paginationShow" @current-change="handleCurrentChange" :page-size="pagesize" layout="prev, pager, next" :total="totals">
				</el-pagination>
			</div>
		</div>
		<!-- 详情提示框 -->
		<el-dialog title="详情" :visible.sync="detailVisible" width="50%" @close="closeDetails">
			<!-- <div style="height: 10%;">
			<el-scrollbar style="height: 100%;"> -->
			<div class="creat">
				<!-- <el-button type="primary" @click="pick">生成拣货单</el-button> -->
				<el-button type="primary" @click="print">打印</el-button>
				<!--<el-button type="default" @click="print2">打印</el-button>-->
			</div>

			<div id="printJS-form">
				<!--<h1 class="ismix">{{is_mix}}</h1>-->
				<h1 style="text-align:center" class="ismix">{{is_mix}}</h1>
				<barcode :value="barcode" :options="{displayValue:true}" tag="img" width="300" height="100"></barcode>
				<el-table :data="outBoundTable" border style="width: 100%">
					<el-table-column prop="fnsku" label="fnsku"></el-table-column>
					<el-table-column prop="dst_fnsku" label="新fnsku"></el-table-column>
					<el-table-column prop="sum" label="数量"></el-table-column>
					<el-table-column label="新标" width="120px">
						<template slot-scope="scope">
							<!-- <span>{{scope.row.pictures[0]}}</span> -->
							<span v-if="scope.row.pictures.length === 0">无</span>
							<!-- <span v-else-if="scope.row.pictures[0].url.url != null">无</span> -->
							<img class="img_fnsku" v-else-if="scope.row.pictures[0] != undefined && !(scope.row.pictures[0].url.url.match(/.pdf/))" :src="$axios.defaults.baseURL+scope.row.pictures[0].url.url"/>
							<a v-else :href="$axios.defaults.baseURL+scope.row.pictures[0].url.url" target="_blank">{{decodeURI(scope.row.pictures[0].url.url.split('/').pop())}}</a>
							<!-- <span v-else >无</span> -->
						</template>
					</el-table-column>
					<el-table-column label="操作" width="80">
						<template slot-scope="scope">
							<el-button type="primary" @click="handleAddSum(scope.$index, scope.row)">增加</el-button>
						</template>
					</el-table-column>
				</el-table>
				<br>
				<el-table v-if="this.ware_houseTable2.length != 0" :data="ware_houseTable2" border style="width: 100%">
					<el-table-column prop="ware_house_name" label="库位" width="307"></el-table-column>
					<!-- <el-table-column prop="sum" label="数量"></el-table-column> -->
					<el-table-column prop="fnsku" label="fnsku"></el-table-column>
					<el-table-column prop="sum" label="数量"></el-table-column>
					<el-table-column label="操作" width="80">
						<template slot-scope="scope">
							<el-button type="danger" @click="handleDeleteSum(scope.$index, scope.row)">减少</el-button>
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
					<el-table-column prop="repeat" label="箱子个数"></el-table-column>
					<el-table-column label="操作" width="80">
						<template slot-scope="scope">
							<el-button type="danger" @click="handleDeleteBox(scope.$index, scope.row)">删除</el-button>
						</template>
					</el-table-column>
				</el-table>
			</div>
			<!-- </el-scrollbar>
			</div> -->
		</el-dialog>

		<!-- 打印出库提示框 -->
		<el-dialog title="详情" :visible.sync="importStockVisible" width="50%">
			<div class="creat">
				<el-button type="primary" @click="printImport">打印</el-button>
			</div>
			<div id="importStock">
				<h1 style="text-align:center" class="ismix">{{is_mix}}</h1>
				<barcode :value="barcode" :options="{displayValue:true}" tag="img" width="300" height="100"></barcode>
				<el-table :data="importStockTable" border style="width: 100%">
					<el-table-column prop="id" label="id" width="50"></el-table-column>
					<el-table-column label="箱子"></el-table-column>
					<el-table-column label="箱子重量"></el-table-column>
					<el-table-column label="fnsku"></el-table-column>
					<el-table-column label="数量"></el-table-column>
				</el-table>
			</div>
		</el-dialog>

		<!-- 检查提示框 -->
		<el-dialog title="详情" :visible.sync="checkVisible" width="65%" @close="closeCheckVisible">
			<el-table :data="checkData" border style="width: 100%">
				<el-table-column prop="total" label="货物总数"></el-table-column>
				<el-table-column prop="box_sum" label="箱子数量"></el-table-column>
			</el-table>
			<br>
			<el-table v-if="this.checkData3.length != 0" :data="checkData3" border style="width: 100%">
				<el-table-column prop="sum" label="货物数量(每箱)"></el-table-column>
				<el-table-column prop="weight" label="箱子重量"></el-table-column>
				<el-table-column prop="repeat" label="箱子数量"></el-table-column>
			</el-table>
			<br>
			<el-table :data="checkData2" border style="width: 100%">
				<el-table-column prop="fnsku" label="fnsku"></el-table-column>
				<el-table-column prop="dst_fnsku" label="新fnsku"></el-table-column>
				<el-table-column prop="sum2" label="数量"></el-table-column>
			</el-table>
			<!-- <br>
			<el-table v-if="this.checkData4.length != 0" :data="checkData4" border style="width: 100%" ref="multipleCheck" @selection-change="store_insSelectionChange">
				<el-table-column type="selection" width="55"></el-table-column>
				<el-table-column label="序号" width="50">
					<template slot-scope="scope">
						<span>{{scope.$index + 1}}</span>
					</template>
				</el-table-column>
				<el-table-column prop="logistics_number" label="物流单号"></el-table-column>
				<el-table-column prop="batch_number" label="任务批次"></el-table-column>
				<el-table-column prop="cate_sum" label="种类数量"></el-table-column>
				<el-table-column prop="total_plan_sum" label="计划数量"></el-table-column>
				<el-table-column prop="total_arrive_sum" label="到达数量"></el-table-column>
				<el-table-column prop="created_at" label="创建时间" :formatter="formatter_created_at"></el-table-column>
			</el-table> -->
			<!-- <br>
			<el-table v-if="this.checkData5.length != 0" :data="checkData5" border style="width: 100%" @selection-change="productSelectionChange">
				<el-table-column prop="fnsku" label="fnsku"></el-table-column>
				<el-table-column prop="plan_sum" label="计划数量"></el-table-column>
				<el-table-column prop="arrive_sum" label="到达数量"></el-table-column>
				<el-table-column prop="remove_sum" label="移出数量"></el-table-column>
				<el-table-column prop="check_sum" label="已结算数量"></el-table-column>
				<el-table-column prop="created_at" label="创建时间" :formatter="formatter_created_at"></el-table-column>
				<el-table-column prop="stock_time" label="存留时间(天/小时)"></el-table-column>
				<el-table-column label="结算数量">
					<template slot-scope="scope">
						<el-input placeholder="输入结算数量" :value="scope.row.check_sum2" v-model.trim="scope.row.check_sum2"></el-input>
					</template>
				</el-table-column>
			</el-table> -->
			<br>
			<el-table :data="pricetable" border style="width: 100%">
				<el-table-column label="价格">
					<template slot-scope="scope">
						<el-input-number :min="0" :precision="2" :step="10" v-model="scope.row.price"></el-input-number>
					</template>
				</el-table-column>
				<el-table-column label="备注">
					<template scope="scope">
						<el-input placeholder="请输入备注" v-model.trim="scope.row.price_remark">
						</el-input>
					</template>
				</el-table-column>
			</el-table>
			<br>
			<el-form label-width="60px">
				<div class="newPrice">
					<el-button @click="createPrice">添加价格</el-button>
					<el-button @click="back" :disabled="isDisableBu2" type="danger">撤销</el-button>
				</div>
				<br>
				<el-form-item label="汇率">
					<el-input-number :min="0" :precision="5" :step="0.01" v-model="exchange_rate"></el-input-number>
				</el-form-item>
				<el-form-item label="折扣">
					<el-input-number :min="0" :max="1" :precision="5" :step="0.01" v-model="discount"></el-input-number>
				</el-form-item>
				<el-form-item label="备注">
					<el-input v-model="remark"></el-input>
				</el-form-item>
			</el-form>
			<div class="dialog-footer-check">
				<span slot="footer" class="dialog-footer">
					<el-button type="default" @click="closeCheckVisible">取消</el-button>
					<el-button type="primary" @click="check_done" :disabled="check_doneDisabled">提交</el-button>
				</span>
			</div>
			
		</el-dialog>
		
		<!-- 发货弹出框 -->
		<el-dialog title="发货" :visible.sync="sendProductVisible" width="30%" center>
			<div class="del-dialog-cnt">确认发货？</div>
			<!-- <el-form ref="form" :model="form" label-width="80px">
				<el-form-item label="物流单号">
					<el-input v-model.trim="form.logistics_number"></el-input>
				</el-form-item>
				<el-form-item label="物流方式">
					<el-radio v-model="l_type" label="1">FBA</el-radio>
					<el-radio v-model="l_type" label="2">自提</el-radio>
					<el-radio v-model="l_type" label="3">其他</el-radio>
				</el-form-item>
			</el-form> -->
			<span slot="footer" class="dialog-footer">
                <el-button @click="sendProductVisible = false">取 消</el-button>
                <el-button type="primary" @click="sendEnd">确 定</el-button>
            </span>
		</el-dialog>

		<!-- 打包弹出框 -->
		<el-dialog title="打包" :visible.sync="packageVisible" width="60%" @close="cancel_Package">
			<el-form label-width="115px">
				<el-form-item label="箱子" required>
					<table class="table text-center">
						<tbody v-for="(p,index) in form">
							<tr>
							<td>
								<el-select placeholder="选择箱子" v-model="p.boxes_id" filterable remote :loading="loading_box" @visible-change="selectVisble_box" :remote-method="remoteMethod_box" width="130" value-key="id">
									<el-option v-for="item in box_options" :label="item.name" :value="item.id"></el-option>
									<infinite-loading :on-infinite="onInfinite_box" ref="infiniteLoading_box"></infinite-loading>
								</el-select>
							</td>
							<td>
								<el-input v-model.trim="p.boxes_weight" placeholder="箱子重量"></el-input>
							</td>
							
							<i class="el-icon-circle-plus" @click="orderAdd(index)" :disabled="false"></i>
							<span>&nbsp</span>
							<i class="el-icon-remove" @click="orderDel(index)"></i>
							</tr>
							<tr v-for="(q,index) in p['form_branch']">
								<td>
									<el-select v-model="q.fnsku" placeholder="选择产品" width="130">
										<el-option v-for="item in package_fnskus" :label="item" :value="item"></el-option>
									</el-select>
								</td>
								<td>
									<!-- <td> -->
									<el-input v-model.trim="q.sum" placeholder="计划数量"></el-input>
									<!-- </td> -->
								</td>
							</tr>
							<el-input-number v-model="p.repeat" :min="1" label="箱子重复次数"></el-input-number>
							<br/>
							<span>-----</span>
						</tbody>
					</table>
				</el-form-item>
				<div class="newOrder">
					<el-button @click="addBoxes">添加箱子</el-button>
					<el-button @click="back" :disabled="isDisableBu" type="danger">撤销</el-button>
				</div>
				<br>
				<template v-if="!package_extra">
					<el-form-item label="备注">
						<el-input v-model="package_ramark" ></el-input>
					</el-form-item>
				</template>
				<el-form-item>
					<template v-if="!package_extra">
						<el-button type="primary" @click="package_done">打包</el-button>
					</template>
					<template v-if="package_extra">
						<el-button type="primary" @click="package_done">额外打包</el-button>
					</template>
				</el-form-item>
			</el-form>
		</el-dialog>
		
		<!-- 图片弹出框 -->
		<el-dialog title="附件详情" :visible.sync="showImg" width="30%">
			<el-carousel :interval="4000" type="card" height="200px" v-if="img_show">
				<el-carousel-item v-for="item in form_picture.pictures">
					<img :src="$axios.defaults.baseURL+item.url.url" />
				</el-carousel-item>
			</el-carousel>
			<div v-if="pdf_show" v-for="item in form_picture.pictures">
				<a target="_blank" :href="$axios.defaults.baseURL+item.url.url">{{'查看' + item.id + '.pdf'}}</a>
			</div>
			<span slot="footer" class="dialog-footer">
                <!--<el-button @click="showImg = false">取 消</el-button>-->
                <el-button type="primary" @click="showImg = false">确 定</el-button>
            </span>
		</el-dialog>

		<!-- 删除提示框 -->
		<el-dialog title="提示" :visible.sync="delVisible" width="30%" center>
			<div class="del-dialog-cnt">删除不可恢复，是否确定删除？</div>
			<span slot="footer" class="dialog-footer">
				<el-button @click="delVisible = false">取 消</el-button>
				 <el-button type="danger" @click="deleteRow">删 除</el-button>
			</span>
		</el-dialog>

		<!-- 收费预览提示框 -->
		<!-- <el-dialog title="收费预览" :visible.sync="previewVisible" width="65%">
			<el-table :data="preview_details" border style="width: 100%">
				<el-table-column prop="box_price" label="箱子数量"></el-table-column>
				<el-table-column prop="box_sum" label="箱子价格" ></el-table-column>
				<el-table-column prop="change_box_price" label="换箱费用" ></el-table-column>
				<el-table-column prop="label_change_sum" label="换标数量" ></el-table-column>
				<el-table-column prop="label_change_price" label="换标费用" ></el-table-column>
				<el-table-column prop="store_in_sum" label="入库数量" ></el-table-column>
				<el-table-column prop="store_in_price" label="入库费用" ></el-table-column>
				<el-table-column prop="store_price" label="仓储费用" ></el-table-column>
			</el-table>
			<template v-if="preview_details_store_ins.length != 0">
				<br>
				详情:
				<el-table :data="preview_details_store_ins" border style="width: 100%">
					<el-table-column prop="cube" label="计算仓储的立方值"></el-table-column>
					<el-table-column prop="day" label="计算仓储的天数" ></el-table-column>
					<el-table-column prop="sum" label="数量" ></el-table-column>
					<el-table-column prop="store_price" label="仓储费用" ></el-table-column>
				</el-table>
			</template>
			<span slot="footer" class="dialog-footer">
				<el-button type="danger" @click="deleteCheck">删 除 预 览</el-button>
				<el-button type="primary" @click="confirmCheck">确 认 审 核</el-button>
			</span>
		</el-dialog> -->

		<!-- 收费预览提示框 -->
		<el-dialog title="详情" :visible.sync="previewVisible" width="60%">
			<el-table :data="preview_form.charge_standard" border style="width: 100%">
				<el-table-column type="index" width="55"></el-table-column>
				<el-table-column label="入库收费标准" v-if="preview_form.settlement_details[0].s_type == '1' || preview_form.settlement_details[0].s_type == '3'">
					<template slot-scope="scope">
						<span v-if="scope.row.by_box == false">每个收费{{scope.row.store_in_fee}}美元</span>
						<span v-else-if="scope.row.by_box == true">每箱收费{{scope.row.store_in_fee}}美元</span>
					</template>
				</el-table-column>
				<el-table-column label="出库收费标准" v-if="preview_form.settlement_details[0].s_type == '2' || preview_form.settlement_details[0].s_type == '3'">
					<template slot-scope="scope">
						<span >箱子{{scope.row.box_fee}}美元一个，换箱费{{scope.row.change_box_fee}}美元一个，换标费{{scope.row.change_label_fee}}美元一个</span>
					</template>
				</el-table-column>
				<el-table-column label="仓储收费标准" v-if="preview_form.settlement_details[0].s_type == '4'">
					<template slot-scope="scope">
						<span>每{{scope.row.cube}}方{{scope.row.day}}天收费{{scope.row.store_fee}}美元</span>
					</template>
				</el-table-column>
			</el-table>
			<br>
			<el-table v-if="preview_form.settlement_details.length != 0 && preview_form.settlement_details[0].s_type != '1' && preview_form.settlement_details[0].s_type != '4'" :data="preview_form.settlement_details" border style="width: 100%">
				<el-table-column prop="box_sum" label="箱子数量"></el-table-column>
				<el-table-column prop="box_price" label="箱子费用"></el-table-column>
				<el-table-column prop="change_box_price" label="换箱费用"></el-table-column>
				<el-table-column prop="label_change_sum" label="换标数量"></el-table-column>
				<el-table-column prop="label_change_price" label="换标费用"></el-table-column>
			</el-table>
			<br v-if="preview_form.settlement_details[0].s_type != '1' && preview_form.settlement_details[0].s_type != '4'">
			<el-table v-if="preview_form.store_ins.length != 0" :data="preview_form.store_ins" border style="width: 100%">
				<el-table-column prop="batch_number" label="批次号"></el-table-column>
				<el-table-column prop="logistics_number" label="物流单号"></el-table-column>
				<el-table-column prop="order_number" label="订单号"></el-table-column>
				<el-table-column prop="total_plan_sum" label="总计划数量"></el-table-column>
				<el-table-column prop="total_arrive_sum" label="实际到达数量"></el-table-column>
			</el-table>
			<br v-if="preview_form.store_ins.length != 0">
			<el-table v-if="preview_form.settlement_details.length != 0 && preview_form.settlement_details[0].s_type != '2' && preview_form.settlement_details[0].s_type != '4'" :data="preview_form.settlement_details" border style="width: 100%">
				<el-table-column prop="store_in_sum" label="入库数量"></el-table-column>
				<el-table-column prop="store_in_price" label="费用"></el-table-column>
			</el-table>
			<br v-if="preview_form.settlement_details[0].s_type != '2' && preview_form.settlement_details[0].s_type != '4'">
			<el-table show-summary :summary-method="getSummaries" v-if="preview_form.settlement_store_ins.length != 0 && preview_form.settlement_details[0].store_price != '0.0'" :data="preview_form.settlement_store_ins" border style="width: 100%">
				<el-table-column type="index" width="55"></el-table-column>
				<el-table-column prop="cube" label="立方数"></el-table-column>
				<el-table-column prop="day" label="天数"></el-table-column>
				<el-table-column prop="fnsku" label="fnsku"></el-table-column>
				<el-table-column prop="sum" label="数量"></el-table-column>
				<el-table-column prop="store_price" label="仓储费"></el-table-column>
			</el-table>
			<br v-if="preview_form.settlement_details[0].store_price != '0.0'">
			<el-table v-if="preview_form.settlement_charges.length != 0" :data="preview_form.settlement_charges" border style="width: 100%">
				<el-table-column prop="price" label="价格"></el-table-column>
				<el-table-column prop="remark" label="备注"></el-table-column>
			</el-table>
			<span slot="footer" class="dialog-footer">
				<el-button type="danger" @click="deleteCheck">删 除 预 览</el-button>
				<el-button type="primary" @click="confirmCheck">确 认 审 核</el-button>
			</span>
		</el-dialog>

		<!-- 减少提示框 -->
		<el-dialog title="提示" :visible.sync="delSumVisible" width="50%" center>
			<el-form ref="form" label-width="130px">
				<el-form-item label="是否移除不良品" required>
					<el-radio v-model="defetct" label="1">是</el-radio>
					<el-radio v-model="defetct" label="0">否</el-radio>
				</el-form-item>
				<el-form-item label="减少数量" required>
					<el-input-number :min="0" v-model="deleteSum"></el-input-number>
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button @click="delSumVisible = false">取 消</el-button>
				 <el-button type="primary" @click="saveDeleteSum">确 认</el-button>
			</span>
		</el-dialog>
		<!-- 增加提示框 -->
		<el-dialog title="提示" :visible.sync="addSumVisible" width="50%" center>
			<el-form ref="form" label-width="80px">
				<el-form-item label="库位" required>
					<el-select v-model="cargo_ware_house_id" placeholder="请选择" class="handle-select mr10">
						<el-option v-for="item in cargo_ware_house_options" :key="item.id" :label="item.name" :value="item.cargo_ware_houses[0].id"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="数量" required>
					<el-input-number :min="0" v-model="addSum"></el-input-number>
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button @click="addSumVisible = false">取 消</el-button>
				 <el-button type="primary" @click="saveAddSum">确 认</el-button>
			</span>
		</el-dialog>
		<!-- 批量打包提示框 -->
		<el-dialog title="提示" :visible.sync="batchpackVisible" width="50%" center>
			<el-form ref="form" label-width="80px">
				<el-form-item label="上传文件">
					<el-upload class="upload-demo" drag action="" :file-list="fileList" :on-remove="handleRemove" :on-exceed="exceed" :auto-upload="false" :on-change="changeFile" :limit="1" multiple>
						<i class="el-icon-upload"></i>
						<div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
						<div class="el-upload__tip" slot="tip">只能上传xls/xlsx文件</div>
					</el-upload>
					<a :href="$axios.defaults.baseURL +'/package.xlsx'">模板下载</a>
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button @click="batchpackVisible = false">取 消</el-button>
				 <el-button type="primary" @click="saveBatchPackage" :disabled="isDisabled">确 认</el-button>
			</span>
		</el-dialog>
	</div>
</template>

<script>
	import VueInfiniteLoading from "vue-infinite-loading"
	import VueBarcode from '@xkeshi/vue-barcode'
	import Print from 'print-js'
	import global_ from '../common/cookie'
	let Base64 = require('js-base64').Base64
	export default {
		//		name: 'WareManage',
		data: function() {
			return {
				cur_page: 1,
				user_page: 1,
				box_page: 1,
				img_show: 1,
				l_type: '1',
				pdf_show: 0,
				check_doneDisabled: false,
				pagesize: 20,
				tableData: [],
				select_cate: '',
				outBoundTable: [],
				ware_houseTable: [],
				ware_houseTable2: [],
				// options: [{
				// 	id: -1,
				// 	name: "所有用户"
				// }, ],
				// options2: [{
				// 	id: -1,
				// 	name: "所有用户"
				// }, ],
				options: [],
				options2: [],
				form: [{
					boxes_id: '',
					boxes_weight: '',
					repeat: 1,
					form_branch: [{
						fnsku: '',
						sum: ''
					}],
				}],
				new_form: {
					boxes_id: '',
					boxes_weight: '',
					repeat: 1,
					form_branch: [{
						fnsku: '',
						sum: ''
					}],
				},
				form_branch: {
					fnsku: '',
					sum: ''
				},
				form_picture: [],
				package_fnskus: [],
				product_store_ins_mul: [],
				order_box_cargos: [],
				store_ins_mul: [],
				package_id: undefined,
				details_id: undefined,
				box_options: [],
				is_mix: '',
				pick_id: undefined,
				barcode: undefined,
				status: undefined,
				totals: 0,
				box_total: 0,
				detailVisible: false,
				loading: false,
				paginationShow: true,
				delVisible: false,
				showImg: false,
				sendProductVisible: false,
				packageVisible: false,
				isdisable: false,
				checkVisible: false,
				importStockVisible: false,
				user_total: 0,
				package_ramark: '',
				checkData: [],
				checkData2: [],
				checkData3: [],
				checkData4: [],
				checkData5: [],
				check_id: undefined,
				sendProductId: undefined,
				importStockTable:[{id:1},{id:2},{id:3},{id:4},{id:5},{id:6},{id:7},{id:8},{id:9},{id:10}],
				search_fnsku: '',
				statusOptions: [{value: 12, label: '待装箱'}, {value: 4, label: '待结算'}, {value: 8, label: '待删除'}, {value: 5, label: '已结算'}],
				statusSelect: '',
				query: undefined,
				aft_obj: [],
				package_extra: false,
				preview_details: [],
				previewVisible: false,
				preview_details_store_ins: [],
				check_settlement_id: '',
				code: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"],
				pricetable: [],
				pricetable: [{
					price: 0,
					remark: ''
				}],
				pricetabletemp: {
					price: 0,
					remark: ''
				},
				remark: '',
				loading_box: false,
				query_box: undefined,
				preview_form: {
					settlement_details: [{'s_type': ''}],
					store_ins: [],
					settlement_charges: [],
					settlement_store_ins: [],
					charge_standard: []
				},
				defetct: '',
				delSumVisible: false,
				deleteSum: 0,
				label_ware_house_id: '',
				addSum: 0,
				addSumVisible: false,
				label_change_id: '',
				cargo_ware_house_id: '',
				cargo_ware_house_options: [],
				exchange_rate: 7,
				discount: 1,
				fileList: [],
				batchpackVisible: false,
				isDisabled: false
			}
		},
		created() {
			this.getData();
			this.getBoxs()
		},
		watch: {
			"$route": "getData"
		},
		computed: {
			data() {
				return this.tableData.filter((d) => {
					return d
				})
			},
			isDisableBu() {
				if(this.form.length <= 1) {
					return this.isdisable = true
				} else {
					return this.isdisable = false
				}
			},
			isDisableBu2() {
				if(this.pricetable.length <= 1) {
					return this.isdisable = true
				} else {
					return this.isdisable = false
				}
			},
		},
		filters: {
			//类型转换
			statusFilter(status) {
				const statusMap = {
					5: 'success',
					12: 'warning',
					8: 'danger',
					2: 'success',
					7: 'info',
					4: 'warning',
				}
				return statusMap[status]
			},
		},
		methods: {
			print() {
				if(this.status == 1) {
					this.$message.error("请先生成拣货单")
					return false
				}else if (this.status == 8) {
					this.$message.error("待删除订单不能打印")
				} else {
					Print({
					printable: 'printJS-form',
					type: 'html',
					targetStyle: ['text-align', 'height'],
				})
				}
			},
			printImport() {
				Print({
					printable: 'importStock',
					type: 'html',
					targetStyle: ['text-align'],
				})
			},
			print2() {
				let sub = document.getElementById('printJS-form')
				let newHtml = sub.innerHTML
				let oldHtml = document.body.innerHTML
				document.body.innerHTML = newHtml
				window.print()
				//				window.location.reload()
				document.body.innerHTML = oldHtml
			},
			formatter_created_at(row, column) {
				return row.created_at.substr(0, 19)
			},
			formatter_updated_at(row, column) {
				return row.updated_at.substr(0, 19)
			},
			handleCurrentChange(val) {
				this.cur_page = val
				if(!this.select_cate || this.select_cate == -1) {
					this.getData()
				} else {
					this.getUserDatas()
				}
			},
			handleSelectionChange(val) {
				this.multipleSelection = val
			},
			store_insSelectionChange(val) {
				this.store_ins_mul = val
			},
			productSelectionChange(val) {
				this.product_store_ins_mul = val
				for(let i = 0; i < this.checkData5.length; i++) {
					console.log(this.checkData5[i].check_sum2)
				}
			},
			getData() {
				this.$axios.get('/admin/outbound_orders?page=' + this.cur_page + '&user_id=' + this.select_cate + '&wms=false&is_quick=0' + '&out=false&fnsku=' + this.search_fnsku + '&status=' + this.statusSelect, {
					headers: {
						'Authorization': localStorage.getItem('token_admin')
					},
				}).then((res) => {
					if(res.data.code == 200) {
						res.data.data.forEach((data) => {
							if(data.is_mix) {
								data.is_mix = '混装'
							} else {
								data.is_mix = '不混装'
							}
							data.barcode = 'hwc_' + data.id
							// data.tempcode = 'wzsv587-' + data.id
						})
						this.tableData = res.data.data
						this.totals = res.data.count
					} else {
						console.log('error')
					}
					this.paginationShow = true
				}).catch((res) => {
					console.log('error')
				})
			},
			filter_inbound() {
				this.paginationShow = false
				this.cur_page = 1
				this.$axios.get('/admin/outbound_orders?page=' + this.cur_page + '&user_id=' + this.select_cate + '&wms=false&is_quick=0' + '&out=false&fnsku=' + this.search_fnsku + '&status=' + this.statusSelect, {
					headers: {
						'Authorization': localStorage.getItem('token_admin')
					},
				}).then((res) => {
					if(res.data.code == 200) {
						res.data.data.forEach((data) => {
							if(data.is_mix) {
								data.is_mix = '混装'
							} else {
								data.is_mix = '不混装'
							}
							data.barcode = 'hwc_' + data.id
							// data.tempcode = 'wzsv587-' + data.id
						})
						this.tableData = res.data.data
						this.totals = res.data.count
					} else {
						console.log('error')
					}
					this.paginationShow = true
				}).catch((res) => {
					console.log('error')
				})
			},
			clear_search() {
				this.paginationShow = false
				this.cur_page = 1
				this.select_cate = ''
				this.search_fnsku = ''
				this.statusSelect = ''
				this.getData()
			},
			getUser(callback = undefined) {
				this.$axios.get('/admin/users?page=' + this.user_page, {
					headers: {
						'Authorization': localStorage.getItem('token_admin')
					},
				}).then((res) => {
					if(res.data.code == 200) {
						this.options = this.options.concat(res.data.data)
						this.user_total = res.data.count
						if(callback) {
							callback()
						}
					}
				}).catch((res) => {
					console.log('error')
				})
			},
			getBoxs(callback = undefined) {
				this.$axios.get('/admin/boxes?page=' + this.box_page, {
					headers: {
						'Authorization': localStorage.getItem('token_admin')
					},
				}).then((res) => {
					if(res.data.code == 200) {
						this.box_options = this.box_options.concat(res.data.data)
						this.box_total = res.data.count
						if(callback) {
							callback()
						}
					}
				}).catch((res) => {
					console.log('error')
				})
			},
			onInfinite_box(obj) {
				if((this.box_page * 20) < this.box_total) {
					this.box_page += 1
					// this.getBoxs(obj.loaded)
					this.remoteMethod_box(this.query_box, obj.loaded)
				} else {
					obj.complete()
				}
			},
			selectVisble_box(visible) {
				if(visible) {
					this.query_box = undefined
					this.remoteMethod_box("")
				}
			},
			remoteMethod_box(query, callback = undefined) {
				if(query != "" || this.query_box != "" || callback) {
					let reload = false
					if(this.query_box != query) {
						this.loading_box = true
						this.box_page = 1
						this.query_box = query
						reload = true
						if(this.$refs.infiniteLoading_box.isComplete) {
							this.$refs.infiniteLoading_box.stateChanger.reset()
						}
					}
					this.$axios.get('/admin/boxes?page=' + this.box_page + '&name=' + query.trim(), {
						headers: {
							'Authorization': localStorage.getItem('token_admin')
						},
					}).then((res) => {
						if(res.data.code == 200) {
							this.loading_box = false
							//							this.options = res.data.data
							let temp_options = []
							if(reload) {
								this.box_options = temp_options.concat(res.data.data)
							} else {
								this.box_options = this.box_options.concat(res.data.data)
							}
							this.box_total = res.data.count
							if(callback) {
								callback()
							}
						}
					}).catch((res) => {
						console.log(res)
					})
				}
			},
			selectVisble(visible) {
				if(visible) {
					this.query = undefined
					this.remoteMethod("")
				}
			},
			remoteMethod(query, callback = undefined) {
				if(query != "" || this.query != "" || callback) {
					let reload = false
					if(this.query != query) {
						this.loading = true
						this.user_page = 1
						this.query = query
						reload = true
						if(this.$refs.infiniteLoading.isComplete) {
							this.$refs.infiniteLoading.stateChanger.reset()
						}
					}
					this.$axios.get("/admin/users/search_user?query=" + query.trim() + "&page=" + this.user_page, {
						headers: {
							'Authorization': localStorage.getItem('token_admin')
						},
					}).then((res) => {
						if(res.data.code == 200) {
							res.data.data.forEach((data) => {
								let tempcode =  String(data.id%1000)
								let tempindex = parseInt(data.id/1000)
								if(tempcode.length ==1) {
									tempcode = '00' + tempcode
								}else if(tempcode.length ==2) {
									tempcode = '0' + tempcode
								}else{

								}
								data.usercode = this.code[tempindex] + tempcode
							})
							this.loading = false
							//							this.options = res.data.data
							if(reload) {
								this.options = this.options2.concat(res.data.data)
							} else {
								this.options = this.options.concat(res.data.data)
							}
							this.user_total = res.data.count
							if(callback) {
								callback()
							}
						}
					}).catch((res) => {
						console.log('失败')
					})
				}
			},
			onInfinite(obj) {
				if((this.user_page * 20) < this.user_total) {
					this.user_page += 1
					this.remoteMethod(this.query, obj.loaded)
					//					this.getUser(obj.loaded)
				} else {
					obj.complete()
				}
			},
			// getUserDatasFirst() {
			// 	if(this.select_cate == -1) {
			// 		this.paginationShow = false
			// 		this.cur_page = 1
			// 		this.getData()
			// 		return
			// 	}
			// 	this.paginationShow = false
			// 	this.cur_page = 1
			// 	this.$axios.get('/admin/outbound_orders?page=' + this.cur_page + '&user_id=' + this.select_cate + '&wms=false' + '&out=false&fnsku=' + this.search_fnsku, {
			// 	// this.$axios.get('/admin/outbound_orders?page=' + this.cur_page + '&user_id=' + this.select_cate, {
			// 		headers: {
			// 			'Authorization': localStorage.getItem('token_admin')
			// 		},
			// 	}).then((res) => {
			// 		this.tableData = res.data.data
			// 		this.totals = res.data.count
			// 		this.paginationShow = true
			// 	})
			// },
			getUserDatas() {
				this.$axios.get('/admin/outbound_orders?page=' + this.cur_page + '&user_id=' + this.select_cate + '&wms=false' + '&out=false&fnsku=' + this.search_fnsku, {
				// this.$axios.get('/admin/outbound_orders?page=' + this.cur_page + '&user_id=' + this.select_cate, {
					headers: {
						'Authorization': localStorage.getItem('token_admin')
					},
				}).then((res) => {
					if(res.data.code == 200) {
						res.data.data.forEach((data) => {
							if(data.is_mix) {
								data.is_mix = '混装'
							} else {
								data.is_mix = '不混装'
							}
							data.barcode = 'hwc_' + data.id
							// data.tempcode = 'wzsv587-' + data.id
						})
						this.tableData = res.data.data
						this.totals = res.data.count
					}
				}).catch((res) => {
					console.log('error')
				})
			},
			pick() {
				this.$axios.get('/admin/outbound_orders/' + this.pick_id + '/print_pick', {
					headers: {
						'Authorization': localStorage.getItem('token_admin')
					},
				}).then((res) => {
					if(res.data.code == 200) {
						this.$message.success('拣货成功')
						this.status = 2
						this.refresh_detail()
						this.getData()
					} else {
						this.$message.error("失败,请联系管理员")
					}
				}).catch((res) => {
					console.log('error')
				})
			},
			//打包
			package(index, row, sign) {
				if (sign == 'extra') {
					this.package_extra = true
				}
				this.idx = index
				const item = this.tableData[index]
				this.$axios.get('/admin/outbound_orders/' + row.id, {
					headers: {
						'Authorization': localStorage.getItem('token_admin')
					},
				}).then((res) => {
					if(res.data.code == 200) {
						res.data.data.label_changes.forEach((data) => {
							//获取打包包含的fnsku
							this.package_fnskus.push(data['dst_fnsku'])
						})
						this.package_id = item.id
						this.packageVisible = true
					}
				}).catch((res) => {
					console.log('error')
				})
			},
			package_done() {
				let box_ids = []
				let weight = []
				let sum = []
				let fnsku = []
				let repeat = []
				this.form.forEach((data) => {
					let temp_sum = []
					let temp_fnsku = []
					data.form_branch.forEach((data2) => {
						temp_sum.push(data2['sum'])
						temp_fnsku.push(data2['fnsku'])
					})
					sum.push(temp_sum)
					fnsku.push(temp_fnsku)
					weight.push(data['boxes_weight'])
					box_ids.push(data['boxes_id'])
					repeat.push(data['repeat'])
				})
				let params = {
					box_ids: box_ids,
					weight: weight,
					repeat: repeat,
					sum: sum,
					fnsku: fnsku,
					remark: this.package_ramark
				}
				if (!this.package_extra) {
					this.$axios.post('/admin/outbound_orders/' + this.package_id + '/done_package', params, {
						headers: {
							'Authorization': localStorage.getItem('token_admin')
						},
					}).then((res) => {
						if(res.data.code ==200) {
							this.$message.success("打包成功")
							this.getData()
							this.packageVisible = false
						}
					}).catch((res) => {
						console.log('error')
					})
				} else {
					this.$axios.post('/admin/outbound_orders/' + this.package_id + '/add_package', params, {
						headers: {
							'Authorization': localStorage.getItem('token_admin')
						},
					}).then((res) => {
						if(res.data.code ==200) {
							this.$message.success("额外打包成功")
							this.getData()
							this.packageVisible = false
						}
					}).catch((res) => {
						console.log('error')
					})
				}
			},
			cancel_Package() {
				this.package_fnskus = []
				this.package_ramark = ''
				this.form = [{
					boxes_id: '',
					boxes_weight: '',
					repeat: 1,
					form_branch: [{
						fnsku: '',
						sum: ''
					}],
				}],
				this.package_extra = false
				this.packageVisible = false
			},
			check(index, row) {
				// let temptime = new Date()
				// console.log(temptime)
				this.exchange_rate = 7
				this.discount = 1
				this.check_id = row.id
				this.$axios.get('/admin/outbound_orders/' + row.id + '/settlement', {
					headers: {
						'Authorization': localStorage.getItem('token_admin')
					},
				}).then((res) => {
					if(res.data.code == 200) {
						this.checkData = [res.data.data]
						// 如果没有点结算
						if(res.data.data.label_changes != undefined) {
							res.data.data.label_changes.forEach((data) => {
								data.sum2 = data.sum
							})
							this.checkData2 = res.data.data.label_changes
							// this.Dis_Num_Rep(res.data.data.label_changes, this.aft_obj)
							this.checkData3 = res.data.data.order_boxes
							// res.data.data.product_store_ins.forEach((data) => {
							// 	this.aft_obj.some((data2) => {
							// 		if (data.fnsku == data2.fnsku) {
							// 			if ((data.arrive_sum - data.check_sum - data.remove_sum) <= data2.sum && data2.sum != 0) {
							// 				data.check_sum2 = data.arrive_sum - data.check_sum - data.remove_sum
							// 				data2.sum = data2.sum - data.arrive_sum + data.check_sum + data.remove_sum
							// 			}else if ((data.arrive_sum - data.check_sum - data.remove_sum) > data2.sum && data2.sum != 0) {
							// 				data.check_sum2 = data2.sum
							// 				data2.sum = 0
							// 				return true
							// 			}else {
							// 				data.check_sum2 = ''
							// 			}
							// 		}
							// 	})
							// })
							// res.data.data.product_store_ins.forEach((data) => {
							// 	let temptime = data.done_time.substr(0, 19)
							// 	let temptime2 = temptime.replace(/T/g, " ")
							// 	let temptime3 = new Date(temptime2.replace(/-/g, "/"))
							// 	let dateEnd = new Date()
							// 	let dateDiff = dateEnd.getTime() - temptime3.getTime()
							// 	let dayDiff = Math.floor(dateDiff / (24 * 3600 * 1000))
							// 	let leave1 = dateDiff%(24*3600*1000)
							// 	let hours = Math.floor(leave1/(3600*1000))
							// 	data.stock_time = dayDiff + '天' + hours + '小时'
							// })
							// this.checkData5 = res.data.data.product_store_ins
							this.checkVisible = true
						} else if(res.data.data[0].settlement_store_ins != undefined){
							const item = res.data.data[0]
							this.preview_form = {
								store_ins: item.store_ins,
								settlement_charges: item.settlement_charges,
								settlement_details: [item],
								settlement_store_ins: item.settlement_store_ins,
								charge_standard: [item.charge_standard]
							}

							// this.preview_details = res.data.data
							// this.preview_details_store_ins = res.data.data[0].settlement_store_ins
							this.check_settlement_id = res.data.data[0].id
							this.previewVisible = true
						}
					}
				}).catch((res) => {
					console.log(res)
				})
			},
			Dis_Num_Rep(ori_obj, aft_obj) {
				if (ori_obj === 'undefined' && ori_obj === '' && ori_obj === null) {
					return -1
				}
				ori_obj.forEach(el=>{
				  	const result = aft_obj.findIndex(ol=>{return el.fnsku === ol.fnsku})
				  	if(result!== -1){
				      	aft_obj[result].sum = Number(aft_obj[result].sum) + Number(el.sum)
				      	// aft_obj[result].sum2 = Number(aft_obj[result].sum) + Number(el.sum)
				  	}else{
				      	el.sum = Number(el.sum)
				      	// el.sum2 = Number(el.sum)
				      	aft_obj.push(el)
				  	} 
				})
				return aft_obj
			},
			check_done() {
				let store_in_ids = []
				let product_store_in_ids = []
				let sum = []
				let checkData5_count = 0
				let price = []
				let price_remark = []
				this.pricetable.forEach((data) => {
					if(data.price !=0 && data.price_remark != null) {
						price.push(data.price)
						price_remark.push(data.price_remark)
					}
				})
				// this.checkData5.forEach((data) => {
				// 	if((data.check_sum2 + '').trim() != '') {
				// 		sum.push(data.check_sum2)
				// 		product_store_in_ids.push(data.id)
				// 		checkData5_count = 1
				// 	}
				// })
				this.$confirm('结算后不能修改，是否继续结算？', '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: "warning"
				}).then(() => {
					let params = {
						// product_store_in_ids: product_store_in_ids,
						// sum: sum,
						price: price,
						price_remark: price_remark,
						remark: this.remark,
						exchange_rate: this.exchange_rate,
						discount: this.discount
					}
					this.check_doneDisabled = true
					this.$axios.post('/admin/outbound_orders/' + this.check_id + '/check', params, {
						headers: {
							'Authorization': localStorage.getItem('token_admin')
						},
					}).then((res) => {
						if(res.data.code == 200) {
							this.getData()
							// this.$refs.multipleCheck.clearSelection()
							this.checkVisible = false
							const item = [res.data.data][0]
							this.preview_form = {
								store_ins: item.store_ins,
								settlement_charges: item.settlement_charges,
								settlement_details: [item],
								settlement_store_ins: item.settlement_store_ins,
								charge_standard: [item.charge_standard]
							}

							// this.preview_details = [res.data.data]
							// this.preview_details_store_ins = res.data.data.settlement_store_ins
							this.check_settlement_id = res.data.data.id
							this.previewVisible = true
							// this.$message.success('审核成功')
						}
					}).catch((res) => {
						console.log(res)
					}).finally(() => {
						this.check_doneDisabled = false
					})
					}).catch(() => {
						this.$message.info('取消结算')
					})


				// if(this.store_ins_mul.length == 0 || checkData5_count == 0) {
				// 	this.$confirm('结算后不能修改，是否继续结算？', '提示', {
				// 		confirmButtonText: '确定',
				// 		cancelButtonText: '取消',
				// 		type: "warning"
				// 	}).then(() => {
				// 		let params = {
				// 			product_store_in_ids: product_store_in_ids,
				// 			sum: sum,
				// 			price: price,
				// 			price_remark: price_remark,
				// 			remark: this.remark
				// 		}
				// 		this.check_doneDisabled = true
				// 		this.$axios.post('/admin/outbound_orders/' + this.check_id + '/check', params, {
				// 			headers: {
				// 				'Authorization': localStorage.getItem('token_admin')
				// 			},
				// 		}).then((res) => {
				// 			if(res.data.code == 200) {
				// 				this.getData()
				// 				this.checkVisible = false
				// 				this.preview_details = [res.data.data]
				// 				this.preview_details_store_ins = res.data.data.settlement_store_ins
				// 				this.check_settlement_id = res.data.data.id
				// 				this.previewVisible = true
				// 				// this.$message.success('审核成功')
				// 			}
				// 		}).catch((res) => {
				// 			console.log(res)
				// 		}).finally(() => {
				// 			this.check_doneDisabled = false
				// 		})
				// 	}).catch(() => {
				// 		this.$message.info('取消结算')
				// 	})
				// }else{

				// 	let params = {
				// 		// store_in_ids: store_in_ids,
				// 		product_store_in_ids: product_store_in_ids,
				// 		sum: sum
				// 	}
				// 	this.check_doneDisabled = true
				// 	this.$axios.post('/admin/outbound_orders/' + this.check_id + '/check', params, {
				// 		headers: {
				// 			'Authorization': localStorage.getItem('token_admin')
				// 		},
				// 	}).then((res) => {
				// 		if(res.data.code == 200) {
				// 			// this.$refs.multipleCheck.clearSelection()
				// 			this.checkVisible = false
				// 			this.preview_details = [res.data.data]
				// 			this.preview_details_store_ins = res.data.data.settlement_store_ins
				// 			this.check_settlement_id = res.data.data.id
				// 			this.previewVisible = true
				// 			this.getData()
				// 			// this.$message.success('审核成功')
				// 		}
				// 	}).catch((res) => {
				// 	}).finally(() => {
				// 		this.check_doneDisabled = false
				// 	})
				// }
			},
			closeCheckVisible() {
				this.checkVisible = false
				this.checkData = []
				this.checkData2 = []
				this.checkData3 = []
				this.checkData4 = []
				this.checkData5 = []
				this.pricetable = [{price: 0,remark: ''}]
			},
			addBoxes() {
				this.form.push(this.new_form)
				this.new_form = {
					boxes_id: '',
					boxes_weight: '',
					repeat: 1,
					form_branch: [{
						fnsku: '',
						sum: ''
					}],
				}
			},
			back() {
				this.form.pop(this.new_form)
			},
			orderAdd(index) {
				this.form[index]['form_branch'].push(this.form_branch)
				this.form_branch = {
					fnsku: '',
					sum: ''
				}
			},
			orderDel(index) {
				if(this.form[index]['form_branch'].length == 1) {
					this.$message.error("至少保留一项哦")
					return false
				}
				this.form[index]['form_branch'].pop(this.form_branch)
				console.log(this.form)
			},
			//箱标弹出框
			showImgs(index, row) {
				this.idx = index
				const item = this.tableData[index]
				this.form_picture = {
					id: item.id,
					pictures: item.pictures
				}
				if(item.pictures.length == 0) {
					this.$message.error('抱歉，该用户暂未提供附件')
					return false
				}
				if(item.pictures[0].url.url.endsWith('.pdf')) {
					this.img_show = 0
					this.pdf_show = 1
				} else {
					this.img_show = 1
					this.pdf_show = 0
				}
				this.showImg = true
			},
			sendProduct(index, row) {
				this.idx = index
				const item = this.tableData[index]
				this.sendProductId = item.id
				console.log(item)
				// this.form = {
				// 	id: item.id,
				// 	logistics_number: item.logistics_number,
				// 	l_type: this.l_type
				// }
				this.sendProductVisible = true
			},
			//发货
			sendEnd() {
				// if(this.form.logistics_number == null || this.form.logistics_number == '') {
				// 	this.$message.error('请输入完整信息')
				// 	return false
				// }
				// let params = {
				// 	id: this.form.id,
				// 	logistics_number: this.form.logistics_number,
				// 	l_type: this.l_type
				// }
				this.$axios.post('/admin/outbound_orders/' + this.sendProductId + '/done', '',{
					headers: {
						'Authorization': localStorage.getItem('token_admin')
					},
				}).then((res) => {
					if(res.data.code == 200) {
						this.$message.success("下发成功!")
						this.getData()
						this.sendProductVisible = false
					}
				}).catch((res) => {
					console.log("error")
				})
			},
			handleDelete(index, row) {
				this.idx = index
				this.delVisible = true
			},
			// 确定删除
			deleteRow() {
				let index = this.idx
				const item = this.tableData[index];
				this.$axios.delete('/admin/outbound_orders/' + item.id, {
					headers: {
						'Authorization': localStorage.getItem('token_admin')
					}
				}).then((res) => {
					if(res.data.code == 200) {
						this.tableData.splice(this.idx, 1)
						//						this.getData()
						this.$message.success("删除成功")
					}
				}).catch((res) => {
					this.$message.error("删除失败")
				})
				this.delVisible = false;
			},
			printStock(index, row) {
				this.is_mix = row.is_mix
				// if(row.is_mix) {
				// 	this.is_mix = '可混装'
				// } else {
				// 	this.is_mix = '不混装'
				// }
				// this.barcode = 'hwc_7896541'
				this.barcode = 'hwc_' + row.id
				this.importStockVisible = true
			},
			detailsShow(index, row) {
				this.details_id = row.id
				this.$axios.get('/admin/outbound_orders/' + row.id, {
					headers: {
						'Authorization': localStorage.getItem('token_admin')
					},
				}).then((res) => {
					if(res.data.code == 200) {
						this.is_mix = row.is_mix
						// if(row.is_mix) {
						// 	this.is_mix = '可混装'
						// } else {
						// 	this.is_mix = '不混装'
						// }
						res.data.data.label_changes.forEach((data) => {
							// data.labal_ware_houses = ''
							data.label_ware_houses.forEach((data2) => {
								// data.labal_ware_houses = data.labal_ware_houses + ' ' + data2.ware_house_name + '(' + data2.sum + ')'
								this.ware_houseTable.push(data2)
							})
						})
						this.ware_houseTable.forEach((data) => {
							data.fnsku_ware = data.ware_house_id + data.fnsku
						})
						let temparr = []
						this.ware_houseTable.forEach((data, index) => {
							let indextepm = temparr.indexOf(data.fnsku_ware)
							if(indextepm == -1) {
								temparr.push(data.fnsku_ware)
								this.ware_houseTable2.push(data)
							} else {
								this.ware_houseTable2[indextepm].sum = this.ware_houseTable2[indextepm].sum + data.sum
							}
						})
						res.data.data.order_boxes.forEach((data) => {
							data.box_size = data.box.length + '*' + data.box.width + '*' + data.box.height
						})
						// this.ware_houseTable.forEach((ware) => {
						// 	this.ware_houseTable2.push(ware)
						// })
						this.order_box_cargos = res.data.data.order_boxes
						this.outBoundTable = res.data.data.label_changes
						this.pick_id = row.id
						this.barcode = 'hwc_' + row.id
						this.status = row.status
						//						this.barcode = Base64.encode('123456789_1')
						console.log(this.barcode)
						this.detailVisible = true
					} else {
						this.$message.error("失败,请联系管理员")
					}
				})
			},
			refresh_detail() {
				this.$axios.get('/admin/outbound_orders/' + this.details_id, {
					headers: {
						'Authorization': localStorage.getItem('token_admin')
					},
				}).then((res) => {
					if(res.data.code == 200) {
						// if(row.is_mix) {
						// 	this.is_mix = '可混装'
						// } else {
						// 	this.is_mix = '不混装'
						// }
						res.data.data.label_changes.forEach((data) => {
							// data.labal_ware_houses = ''
							data.label_ware_houses.forEach((data2) => {
								this.ware_houseTable.push(data2)
								// data.labal_ware_houses = data.labal_ware_houses + ' ' + data2.ware_house_name + '(' + data2.sum + ')'
							})
						})
						this.outBoundTable = res.data.data.label_changes
					} else {
						console.log('error')
					}
				})
			},
			closeDetails() {
				this.ware_houseTable = []
				this.ware_houseTable2 = []
			},
			confirmCheck() {
				this.$confirm('审核后不可修改, 是否继续?', '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'danger'
				}).then(() => {
					this.$axios.patch('/admin/settlement_records/' + this.check_settlement_id, '', {
						headers: {
							'Authorization': localStorage.getItem('token_admin')
						},
					}).then((res) => {
						if(res.data.code == 200) {
							this.getData()
							this.previewVisible = false
							this.$message.success('审核成功！')
						}
					}).catch((res) => {
						console.log('error')
					})
                }).catch(() => {
                    this.$message.info('已取消审核')
                })
			},
			deleteCheck() {
				this.$confirm('此操作将永久删除该预览, 是否继续?', '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'danger'
				}).then(() => {
					this.$axios.delete('/admin/settlement_records/' + this.check_settlement_id, {
						headers: {
							'Authorization': localStorage.getItem('token_admin')
						},
					}).then((res) => {
						if(res.data.code == 200) {
							this.getData()
							this.previewVisible = false
							this.$message.success('删除预览成功！')
						}
					}).catch((res) => {
						console.log('error')
					})
                }).catch(() => {
                    this.$message.info('已取消删除')
			})
			},
			createPrice() {
				this.pricetable.push(this.pricetabletemp)
				this.pricetabletemp = {
					price: 0,
					remark: ''
				}
			},
			back() {
				this.pricetable.pop(this.pricetabletemp)
			},
			handleDeleteBox(index, row) {
				let order_box_ids = []
				order_box_ids.push(row.id)
				let params = {
					order_box_ids: order_box_ids,
				}
				this.$confirm('此操作将永久删除该记录, 是否继续?', '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'danger'
				}).then(() => {
					this.$axios.post('/admin/outbound_orders/' + this.details_id +'/delete_package', params, {
						headers: {
							'Authorization': localStorage.getItem('token_admin')
						},
					}).then((res) => {
						if(res.data.code == 200) {
							this.getData()
							this.order_box_cargos.splice(index, 1)
							// this.previewVisible = false
							this.$message.success('删除成功！')
						}
					}).catch((res) => {
						console.log('error')
					})
				}).catch(() => {
					this.$message.info('已取消删除')
				})
			},
			handleDeleteSum(index, row) {
				this.deleteSum = 0
				this.label_ware_house_id = row.id
				this.defetct = ''
				this.delSumVisible = true
			},
			saveDeleteSum() {
				if(this.defetct == '') {
					this.$message.info('请选择是否移除不良品')
					return
				}
				let label_ware_house_ids = []
				let sum = []
				label_ware_house_ids.push(this.label_ware_house_id)
				sum.push(this.deleteSum)
				let params = {
					label_ware_house_ids: label_ware_house_ids,
					sum: sum,
					defetct: this.defetct
				}
				this.$axios.post('/admin/outbound_orders/' + this.details_id +'/fix_less_order', params,{
					headers: {
						'Authorization': localStorage.getItem('token_admin')
					},
				}).then((res) => {
					if(res.data.code == 200) {
						this.$message.success("处理成功!")
						this.getData()
						this.delSumVisible = false
						this.detailVisible = false
					}
				}).catch((res) => {
					console.log(res)
				}).finally(() => {

				})
			},
			handleAddSum(index, row) {
				this.addSum = 0
				this.label_change_id = row.id
				this.cargo_ware_house_options = []
				this.cargo_ware_house_id = ''
				this.$axios.get('/admin/warehouses?fnsku=' + row.fnsku, {
					headers: {
						'Authorization': localStorage.getItem('token_admin')
					},
				}).then((res) => {
					if(res.data.code == 200) {
						this.cargo_ware_house_options = res.data.data
						this.addSumVisible = true
					}
				}).catch((res) => {
					console.log(res)
				})
			},
			saveAddSum() {
				if(this.cargo_ware_house_id == '') {
					this.$message.info('请选择库位')
					return
				}
				let label_change_id = []
				let sum = []
				let cargo_ware_house_id = []
				label_change_id.push(this.label_change_id)
				cargo_ware_house_id.push(this.cargo_ware_house_id)
				sum.push(this.addSum)
				let params = {
					label_change_id: label_change_id,
					sum: sum,
					cargo_ware_house_id: cargo_ware_house_id
				}
				this.$axios.post('/admin/outbound_orders/' + this.details_id +'/fix_more_order', params,{
					headers: {
						'Authorization': localStorage.getItem('token_admin')
					},
				}).then((res) => {
					if(res.data.code == 200) {
						this.$message.success("处理成功!")
						this.getData()
						this.addSumVisible = false
						this.detailVisible = false
					}
				}).catch((res) => {
					console.log(res)
				}).finally(() => {

				})
			},
			getSummaries(param) {
				const { columns, data } = param;
				const sums = [];
				columns.forEach((column, index) => {
					if (index === 0) {
					sums[index] = '总计';
					return;
					}
					if (index === 1 || index === 4 || index === 5) {
						const values = data.map(item => Number(item[column.property]));
						if (!values.every(value => isNaN(value))) {
							sums[index] = values.reduce((prev, curr) => {
								const value = Number(curr);
								if (!isNaN(value)) {
									return prev + curr;
								} else {
									return prev;
								}
							}, 0);
							if(index === 1) {
								sums[index] += ' 立方';
							}else if(index === 4) {
								sums[index] += ' 个';
							}else if(index === 5) {
								sums[index] += ' 美元';
							}
							} else {
								sums[index] = 'N/A';
							}
					}
				});
				return sums;
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
			packageBatch() {
				this.fileList = []
				this.batchpackVisible = true
			},
			saveBatchPackage() {
				if(this.fileList.length == 0) {
					this.$message.error("请选择文件")
					return false;
				}
				const extension = this.fileList[0].name.split('.')[this.fileList[0].name.split('.').length - 1] === 'xls';
				const extension2 = this.fileList[0].name.split('.')[this.fileList[0].name.split('.').length - 1] === 'xlsx';
				if (!extension && !extension2) {
					this.$message.error('上传失败，请上传xls、xlsx格式的文件！')
					return false
				}
				this.isDisabled = true
				let formData = new FormData()
				let config = {
					headers: {
						'Authorization': localStorage.getItem('token_admin')
					}
				}
				this.fileList.forEach((item) => {
					formData.append('file', item.raw)
				})
				this.$axios.post('/admin/outbound_orders/batch_package', formData, config).then((res) => {
					if(res.data.code == 200) {
						this.$message.success("提交成功")
						this.fileList = []
						this.batchpackVisible = false
					}
				}).catch((res) => {
					
				}).finally(() => {
					this.isDisabled = false
				})
			},
			getStatusName(status) {
				if(status == 1) {
					return "待审核"
				} else if(status == 2) {
					return "正在拣货"
				} else if (status == 3) {
					return "待换标"
				} else if (status == 4) {
					return "等待结算"
				}else if (status == 5) {
					return "已结算"
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
					return '待装箱'
				} else {
					return '其他'
				}
			},
		},
		components: {
			"infinite-loading": VueInfiniteLoading,
			"barcode": VueBarcode
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
	
	.creat {
		margin-bottom: 20px;
		float: right;
	}

	.newOrder {
		text-align: center;
	}

	.dialog-footer-check {
		text-align: center;
	}

	.img_fnsku {
		width:5rem;
    	height:5rem;
	}

	.fnsku_filter {
		float: right;
	}
	.newPrice {
		text-align: center;
	}
</style>