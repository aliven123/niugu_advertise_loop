// import QRCode from '../assets/qrcode.js';
import {
	ajaxfn,
	IsPC
} from '../assets/utils.js';
import '../css/iconfont/iconfont.css';
import '../css/index.less';
import {COLOR_ARR,NIUGU_BOARD} from './constants.js';
function color16() {
	//十六进制随机颜色,并且不能接近蓝色
	let index = Math.floor(Math.random() * COLOR_ARR.length);
	return COLOR_ARR[index];
};
window.onload = function() {
	(function(){
		// console.log(IsPC);
		class NiuguMenus {
			// 导航菜单类
			constructor(){
				this.menu_wrapper=$('#niugu_wrapper').find('.ng_menu_wrapper').eq(0);
				this.board={
					def:'stock',
					niugu_active:'niugu_active',
					list:NIUGU_BOARD,
				};
				this.renderNiuguType();
				this.bindClick();
			}
			renderNiuguType(){
				let oFragment='';
				let niugu_type='';
				for(let [key,val] of Object.entries(this.board.list)){
					console.log(this.board.def);
					niugu_type=key===this.board.def?'niugu_active':'';
					oFragment+=`
						<p class="ng_boxs niugu_type ng_fl ${niugu_type}" type="${key}">${val}</p>
					`
				};
				this.menu_wrapper.html(oFragment);
			}
			bindClick(){
				const menu_list=this.menu_wrapper.find('.niugu_type');
				const that=this;
				for(let menu of Array.from(menu_list)){
					$(menu).on('click',function(){
						that.board.def=$(this).attr('type');
						that.renderNiuguType();
						that.bindClick();
						niugu_loop.clearTimer();
						console.log(that.board.def);
						niugu_loop.renderNiu_Wrapper(that.board.def);
					})
				}
			}
		};
		
		class NiuguLoop {
			// 无限轮播的类
			constructor(el, root_el,niugu_type) {
				this.root_el = root_el;
				this.inner_wrapper = el;
				this.loop_switch = true;
				this.ng_prev = this.root_el.find('.ng_prev').eq(0);
				this.ng_next = this.root_el.find('.ng_next').eq(0);
				this.index = 0; //牛股niugu_item初始的index
				// this.renderNiu_Wrapper();
				this.inner_width = 0;
				this.inner_padding = 17; //inner_wrapper的左右padding;
				this.niugu_type=niugu_type;
				this.clearTimer();
				this.renderNiu_Wrapper();
			}
			clearTimer(){
				console.log(this.inner_wrapper.get(0).timer);
				clearInterval(this.inner_wrapper.get(0).timer);
			}
			getNiuguData() {
				let host = 'http://10.88.71.83:23333';
				if (!location.host.includes('localhost')) {
					host = 'https://data.nujin.com';
				};
				return new Promise((resolve, reject) => {
					ajaxfn(`${host}/quan_language/nujin_scroll_bar/`, 'GET', 'json', {"type":this.niugu_type}, (res) => {
						// let niugu_list_wrapper=$('#niugu_list_wrapper');
						resolve(res)
					})
				})

			}
			handleError(){
				this.loop_switch=false;
				this.inner_wrapper.html(`
				<div class="niugu_item ng_boxs ng_fl" style="color:red;width:200px;">
					${niugu_menus.board.list[niugu_menus.board.def]}板块正在升级中...
				</div>`);
				this.inner_wrapper.css({
					'left': `0px`
				})
				this.root_el.find('.ng_left_cover').eq(0).off('mouseover');
				this.ng_prev.off('click');
				this.ng_next.off('click');
				this.ng_prev.css({
					'display':'none'
				});
				this.ng_next.css({
					'display':'none'
				});
			}
			async renderNiu_Wrapper(niugu_type) {
				console.log(niugu_type);
				if(niugu_type!==undefined){this.niugu_type=niugu_type};
				const {
					result: res
				} = await this.getNiuguData();
				console.log(res);
				let oFragment = '';
				let href = `https://nujin.com/forum.php?mod=forumdisplay&sort_id=1&fid=`;
				if(Array.isArray(res)){
					this.loop_switch=true;
					for (const item of res) {
						let random_color = color16();
						oFragment +=
							`<div class="niugu_item ng_boxs ng_fl">
								<a href="${href+item.fid}" style="background:${random_color}" class="ng_boxs">
									${item.codename}
								</a>
							</div>
						`
					};
					this.inner_wrapper.html(oFragment);;
				}else{
					this.handleError();
					return;
				};
				// 计算并设置inner_wrapper的宽度；
				this.inner_width = this.countInnerWidth();
				this.inner_wrapper.css({
					'width': `${this.inner_width}px`
				})
				// 绑定btn和遮罩层的显隐；
				this.hishowBtn();
				// 并且btn点击的切换
				this.handleBtn();
				//无限轮播
				this.loopMove();
			}
			countInnerWidth(index) {
				let width = 0;
				const niugu_item = Array.from($('#niugu_list_wrapper .niugu_item'));
				if (index === undefined) {
					for (const item of niugu_item) {
						width += $(item).outerWidth(true);
					};
				} else {
					for (let i = 0; i < index; i++) {
						width += $(niugu_item[i]).outerWidth(true);
					}
				};

				return Math.ceil(width + 1)
			}
			handleMouseOver(el, cover, tag) {
				// 鼠标进入按钮和遮罩层
				if(this.inner_wrapper.children('.niugu_item').length===1){return};
				if (tag === 'button') {
					el.on('mouseover', () => {
						el.css({
							'display': 'block',
						});
						cover.css({
							'zIndex': -1
						})
						this.loop_switch = false;
					})
				} else {
					el.on('mouseover', () => {
						cover.css({
							'display': 'block',
						});
						el.css({
							'zIndex': -1
						})
						this.loop_switch = false;
					})
				}
			}
			handleMouseOut(el, action_btn) {
				// 鼠标离开遮罩层；
				this.root_el.on('mouseleave', () => {
					if(this.inner_wrapper.children('.niugu_item').length===1){return};
					if (IsPC === false) {
						this.loop_switch = true;
						return;
					}
					el.css({
						'zIndex': 1
					});
					action_btn.css({
						'display': 'none'
					});
					this.loop_switch = true;
				})
			}
			hishowBtn() {
				// 向前向后按钮的显隐，以及遮罩层的显隐
				const ng_left_cover = this.root_el.find('.ng_left_cover').eq(0);
				const ng_right_cover = this.root_el.find('.ng_right_cover').eq(0);
				// console.log($(ng_right_cover));
				// return;
				if (IsPC === false) {
					const btn_style = {
						'display': 'block',
						'opacity':'0.7'
					};
					const cover_style = {
						'zIndex': '-1'
					};
					this.ng_prev.css(btn_style);
					this.ng_next.css(btn_style);
					ng_left_cover.css(cover_style);
					ng_right_cover.css(cover_style);
				};
				this.handleMouseOver(this.ng_prev, ng_left_cover, 'button');
				this.handleMouseOver(ng_left_cover, this.ng_prev, 'cover');
				this.handleMouseOver(this.ng_next, ng_right_cover, 'button');
				this.handleMouseOver(ng_right_cover, this.ng_next, 'cover');
				this.handleMouseOut(ng_left_cover, this.ng_prev);
				this.handleMouseOut(ng_right_cover, this.ng_next);
			}
			maxLelfIndex() {
				// 计算滚动牛股左移动，可以取的最大index
				const root_width = this.root_el.width();
				let width = 0;
				let max_index = false;
				const niugu_item = Array.from($('#niugu_list_wrapper .niugu_item'));
				const len = niugu_item.length;
				for (let i = len - 1; i >= 0; i--) {
					width += $(niugu_item[i]).outerWidth(true);
					if (width > root_width) {
						max_index = i
						return max_index + 1
					}
				};
			}
			loopMove(time = 2500) {
				// 无限轮播，自动触发左点击,定时器要关掉
				clearInterval(this.inner_wrapper.get(0).trigger_timer);
				this.inner_wrapper.get(0).trigger_timer=setInterval(() => {
					if (this.loop_switch) {
						this.ng_prev.trigger('click', 'auto')
					}
				}, time);
			}
			clipNiuguList(niugu_item, action = 'append') {
				//action标记头部插入节点，还是尾部插入节点
				if (action === 'append') {
					this.inner_wrapper.get(0).appendChild(niugu_item)
					// 结构上left是-75,但是数据更新了
					this.inner_wrapper.css({
						'left': '0px'
					});
				} else {
					const list = this.inner_wrapper.children('.niugu_item').eq(0).get(0);
					this.inner_wrapper.get(0).insertBefore(niugu_item, list);
					this.inner_wrapper.css({
						'left': -$(niugu_item).outerWidth(true) + 'px'
					});
				}
			}
			handleBtn() {
				// 向前向后按钮的事件
				let obj = this.inner_wrapper.get(0);
				this.ng_prev.on('click', () => {
					// 左按钮事件
					if (this.inner_width <= this.root_el.width()) {
						// 如果inner_wrapper的宽度小于或等于niugu_list_wrapper，则左移动无效
						return
					}
					this.index = 1;
					// 向左移动首个元素的宽度
					let left = -this.countInnerWidth(this.index);
					// 把第一个元素移动到结尾
					let niugu_item = this.inner_wrapper.find('.niugu_item').eq(0).get(0);
					this.rmove(obj, {
						"left": left
					}, this.clipNiuguList(niugu_item));
				});
				this.ng_next.on('click', () => {
					//右按钮事件
					if (this.inner_width <= this.root_el.width()) {
						// 如果inner_wrapper的宽度小于或等于niugu_list_wrapper，则左移动无效
						return
					}
					const niugu_item = this.inner_wrapper.find('.niugu_item');
					const last_item = niugu_item.eq(niugu_item.length - 1).get(0);
					this.clipNiuguList(last_item, 'insert_before');
					this.rmove(obj, {
						"left": '0'
					});
				})
			}
			rmove(obj, json, fn) {
				//完美运动框架
				clearInterval(obj.timer);

				function getStyle(obj, attr) { //获得对象的属性值，含单位
					if (obj.currentStyle) { //ie作为属性存在
						return obj.currentStyle[attr];
					} else {
						return getComputedStyle(obj, 100)[attr]; //全局方法
					}
				};
				obj.timer = setInterval(function() {
					// console.log(obj);
					// console.log(obj.timer);
					obj.bStop = true;
					for (const attr of Object.keys(json)) {
						var icur = 0;
						if (attr == 'opacity') { //1.获得初始位置
							icur = parseInt(parseFloat(getStyle(obj, attr)) * 100) //避免出现小数，造成透明度闪烁问题；
						} else {
							icur = parseInt(getStyle(obj, attr));

						};
						var ispeed = (json[attr] - icur) / 10; //2.计算速度;
						ispeed = ispeed > 0 ? Math.ceil(ispeed) : Math.floor(ispeed);
						if (icur != json[attr]) { //3.只要一个没到，就把bStop改值为false;
							obj.bStop = false;
						};
						if (attr == 'opacity') {
							obj.style.opacity = (icur + ispeed) / 100;
							obj.style.filter = 'alpha(opacity:' + (icur + ispeed) + ')';
						} else {
							obj.style[attr] = icur + ispeed + 'px';
						};
					};
					if (obj.bStop) { //所有的属性都到目标值了，bStop不会被修改，清除定时器
						clearInterval(obj.timer);
						fn && fn();
					}
				}, 30)
			}
		};
		let inner_wrapper = $('#niugu_list_wrapper .inner_wrapper');
		let niugu_list_wrapper = $('#niugu_list_wrapper');
		const niugu_menus=new NiuguMenus();
		const niugu_loop=new NiuguLoop(inner_wrapper,niugu_list_wrapper,niugu_menus.board.def);
	})();	
}
