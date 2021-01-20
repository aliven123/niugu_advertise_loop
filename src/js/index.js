// import QRCode from '../assets/qrcode.js';
import {ajaxfn,queryToObj,IsPC,dataNow} from '../assets/utils.js';
import '../css/iconfont/iconfont.css';
import '../css/index.less';
function color16(){
	//十六进制随机颜色,并且不能接近蓝色
	const random_arr =['#f87e6a','#8f9192','#ffae00','#fe11f6','#2ba7ee','#4069ad','#ec387c','#fe1901'];
	let index = Math.floor(Math.random()*8);
	return random_arr[index];
}
window.onload=function(){
	class Niugu_loop {
		constructor(el,root_el) {
			this.root_el=root_el;
			this.inner_wrapper=el;
			this.loop_switch=true;
			this.ng_prev=this.root_el.find('.ng_prev').eq(0);
			this.ng_next=this.root_el.find('.ng_next').eq(0);
			this.index=0;//牛股niugu_item初始的index
			// this.renderNiu_Wrapper();
			this.inner_width=0;
			this.inner_padding=17;//inner_wrapper的左右padding;
			this.renderNiu_Wrapper();
		}
		getNiuguData(){
			let host='http://10.88.71.83:23333';
			if(!location.host.includes('localhost')){
				host='';
			};
			return new Promise((resolve,reject)=>{
				ajaxfn(`${host}/quan_language/nujin_scroll_bar/`, 'GET', 'json', {}, (res)=>{
					// let niugu_list_wrapper=$('#niugu_list_wrapper');
					resolve(res)
				})
			})
			
		}
		async renderNiu_Wrapper(){
			const {result:res}=await this.getNiuguData();
			console.log(res);
			// let niugu_list_wrapper=$('#niugu_list_wrapper');
			// console.log(res);
			let oFragment='';
			let href=`https://nujin.com/forum.php?mod=forumdisplay&sort_id=1&fid=`
			for(const item of res){
				let random_color=color16();
				oFragment+=`<div class="niugu_item boxs fl">
						<a href="${href+item.fid}" style="background:${random_color}" class="boxs">
							${item.codename}
						</a>
					</div>
				`
			}
			this.inner_wrapper.html(oFragment);
			// 计算并设置inner_wrapper的宽度；
			this.inner_width=this.countInnerWidth();
			this.inner_wrapper.css({
				'width':`${this.inner_width}px`
			})
			// 绑定btn和遮罩层的显隐；
			this.hishowBtn();
			// 并且btn点击的切换
			this.handleBtn();
			//无限轮播
			this.loopMove();
		}
		countInnerWidth(index){
			let width=0;
			const niugu_item=Array.from($('#niugu_list_wrapper .niugu_item'));
			if(index===undefined){
				for(const item of niugu_item){
					width+=$(item).outerWidth(true);
				};
			}else{
				for(let i=0;i<index;i++){
					width+=$(niugu_item[i]).outerWidth(true);
				}
			};
			
			return Math.ceil(width+1)
		}
		handleMouseOver(el,cover,tag){
			// 鼠标进入按钮和遮罩层
			if(tag==='button'){
				el.on('mouseover',()=>{
					el.css({
						'display':'block'
					});
					cover.css({
						'zIndex':-1
					})
					this.loop_switch=false;
				})
			}else{
				el.on('mouseover',()=>{
					cover.css({
						'display':'block'
					});
					el.css({
						'zIndex':-1
					})
					this.loop_switch=false;
				})
			}			
		}
		handleMouseOut(el,action_btn){
			// 鼠标离开遮罩层；
			this.root_el.on('mouseleave',()=>{
				el.css({
					'zIndex':1
				});
				action_btn.css({
					'display':'none'
				});
				this.loop_switch=true;
			})
		}
		hishowBtn(){
			// 向前向后按钮的显隐，以及遮罩层的显隐
			const ng_left_cover=this.root_el.find('.ng_left_cover').eq(0);
			const ng_right_cover=this.root_el.find('.ng_right_cover').eq(0);
			console.log($(ng_right_cover));
			// return;
			this.handleMouseOver(this.ng_prev,ng_left_cover,'button');
			this.handleMouseOver(ng_left_cover,this.ng_prev,'cover');
			this.handleMouseOver(this.ng_next,ng_right_cover,'button');
			this.handleMouseOver(ng_right_cover,this.ng_next,'cover');
			this.handleMouseOut(ng_left_cover,this.ng_prev);
			this.handleMouseOut(ng_right_cover,this.ng_next);
		}
		maxLelfIndex(){
			// 计算滚动牛股左移动，可以取的最大index
			const root_width=this.root_el.width();
			let width=0;
			let max_index=false;
			const niugu_item=Array.from($('#niugu_list_wrapper .niugu_item'));
			const len=niugu_item.length;
			for(let i=len-1;i>=0;i-- ){
				width+=$(niugu_item[i]).outerWidth(true);
				if(width>root_width){
					max_index=i
					return max_index+1
				}
			};
		}
		loopMove(time=2500){
			setInterval(()=>{
				if(this.loop_switch){
					this.ng_prev.trigger('click','auto')
				}
			},time);
		}
		handleBtn(){
			// 向前向后按钮的事件
			let obj=this.inner_wrapper.get(0);
			this.ng_prev.on('click',()=>{
				// 左按钮事件
				if(this.inner_width<=this.root_el.width()){
					// 如果inner_wrapper的宽度小于或等于niugu_list_wrapper，则左移动无效
					return
				}
				this.index+=1;
				if(this.index>this.maxLelfIndex()){
					this.index=0;
				}
				let left=-this.countInnerWidth(this.index);
				this.rmove(obj,{"left":left});
			});
			this.ng_next.on('click',()=>{
				//右按钮事件
				if(this.inner_width<=this.root_el.width()){
					// 如果inner_wrapper的宽度小于或等于niugu_list_wrapper，则左移动无效
					return
				}
				this.index-=1;
				if(this.index<0){
					this.index=this.maxLelfIndex();
				}
				let left=-this.countInnerWidth(this.index);
				this.rmove(obj,{"left":left});
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
				var bStop = true;
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
						bStop = false;
					};
					if (attr == 'opacity') {
						obj.style.opacity = (icur + ispeed) / 100;
						obj.style.filter = 'alpha(opacity:' + (icur + ispeed) + ')';
					} else {
						obj.style[attr] = icur + ispeed + 'px';
					};
				};
				if (bStop) { //所有的属性都到目标值了，bStop不会被修改，清除定时器
					clearInterval(obj.timer);
					fn && fn();
				};
			}, 30)
		}
	};
	let niugu_list_wrapper=$('#niugu_list_wrapper .inner_wrapper');
	const niugu_loop=new Niugu_loop(niugu_list_wrapper,$('#niugu_list_wrapper'))
}
