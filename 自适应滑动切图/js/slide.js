
/**
 * create by Helen
 * 2016-12-29
 * 
 * !! 本插件依赖于jq运行 
 * container 参数为滑动列表的父容器， 必传
 * 
 * 如果当中使用到的样式有冲突， 可自行更改css
 * 
 * html 格式如下：
 * 
 	<div id='slidelist' class='slidelist'>
		<div shade class='shade top-shade'></div>
		<div shade class='shade bottom-shade'></div>
		<ul>
			<li>
				<img src='images/bird1.png'/>
			</li>
			<li class='selected'>
				<img src='images/bird2.png'/>
			</li>
			<li>
				<img src='images/bird3.png'/>
			</li>
			<li>
				<img src='images/bird4.png'/>
			</li>
		</ul>			
	</div>
 * **/



function Jslide( opt ){
	this.doc = $(document);

	this.settings = {
		// 容器
		container: null,
		
		// 上下两块蒙版
		shades: null,

		// 滑动列表
		listEl: null,

		// 滑动列表元素
		listItems: null,

		// 容器规格， 默认全屏
		width: this.doc.width(),
		height: this.doc.height(),

		itemTransition: 'all 0.2s ease-in 0.1s',

		// 滑动总需时间
		animateTime: 300,

		// 下标相关
		curIndex: -1,

		// 0：横向， 1：纵向
		direction: 0,

		// false: 不循环， true：循环
		loop: false,
		
		// 显示图片个数
		showCount: 3
	}

	// 合并参数
	$.extend( this.settings, opt );
	
	this.settings.showCount = this.settings.showCount < 3 ? 3: this.settings.showCount;

	// 按下点的坐标
	this.initX = 0;
	this.initY = 0;
	
	// 按下的时间点
	this.starttime = 0;

	// 滑动距离阈值
	this.distance = 10;

	// 是否是滑动
	this.isMove = false;

	// 滑动后需移动的个数
	this.sumcount = 0;

	// 当前已经移动的个数
	this.runcount = 0;

	// 当个元素动画最低时间
	this.runtime = 200;

	// 当前列表移动函数
	this.curFn = null;

	// 列表是否在滑动中
	this.inRun = false;


	this.init();
}


Jslide.prototype = {
	init: function(){
		var s = this.settings;
		if( typeof s.container === 'string' ){
			s.container = $(s.container);
		}

		// 元素初始化
		s.shades = s.container.children('[shade]');
		s.listEl = s.container.children('ul');
		s.listItems = s.listEl.find('li');
		s.width = s.container.width();
		s.height = s.container.height();
				
		this.offsetLeft = s.container.offset().left;
		this.offsetTop = s.container.offset().top;
		
		this.itemWidth = s.width / s.showCount;
		this.itemHeight = s.height / s.showCount;
		this.maxIndex = s.listItems.size() - 1;
		
		var index = this.settings.curIndex;
		this.curIndex = index == -1 ? Math.floor(s.listItems.size()/2) : index;
		
		this.animateTime = s.animateTime;
		//是否是横向
		this.isHoriz = s.direction === 0;
			
		this.initItemSize();
		this.initEvent();
		this.update();
	},

	initItemSize: function(){	
		var _this = this;
		var s = this.settings;
		var styleName = this.isHoriz ? 'width': 'height';
		var styleVal = this.isHoriz ? _this.itemWidth: _this.itemHeight;
				
		s.listEl.css('transition', 'all 0.25s ease-out');	
		s.listItems.css('transition', _this.itemTransition);		
		
		if( this.isHoriz ){
			s.listEl.css('width', s.listItems.size()*_this.itemWidth);	
			
			s.listItems.css({
				'float': 'left',
				'height': '100%',
				'width': _this.itemWidth
			});
			
			// 设置图片垂直居中
			s.listItems.children('img').each(function(index, img){
				var _img = $(img);
				var imgHeight = _this.itemWidth * _this.itemHeight / _img.width();
				var mt = (_this.itemHeight-imgHeight) / 2;
								
				_img.css({
					'width': '100%',
					'opacity': '1',
					'margin-top': mt
				})
			});
		}else{			
			s.listItems.css({
				'height': _this.itemHeight,
				'width': '100%'
			});
			
			s.listItems.children('img').css({
				'height': '100%',
				'opacity': '1'
			});
		}
		
		// 蒙版
		s.shades.css(styleName, styleVal);
	},

	initEvent: function(){
		// 事件相关
		this.evtName = {
			touchStart: 'mousedown',
			touchMove: 'mousemove',
			touchEnd: 'mouseup'
		}	
		
		if( 'ontouchstart' in document ){
			this.evtName = {
				touchStart: 'touchstart',
				touchMove: 'touchmove',
				touchEnd: 'touchend'
			}
		}

		var s = this.settings;		
		s.container.on(this.evtName.touchStart, this.onTouchStart.bind(this));
		s.container.on(this.evtName.touchMove, this.onTouchMove.bind(this));
	},

	
	onTouchStart: function( e ){	
		e.preventDefault();
		
		var touchs = e.originalEvent && e.originalEvent.changedTouches ? 
					e.originalEvent.changedTouches[0] : e;		
					
		this.initPos = this.isHoriz ? touchs.clientX : touchs.clientY;
		
		this.starttime = this.getTime();
		this.isMove = false;
		
		// 为避免和页面其他元素发生冲突， 所以点击一次绑定一次, 执行之后自动删除
		this.doc.one(this.evtName.touchEnd, this.onTouchEnd.bind(this));
	},

	onTouchMove: function( e ){
		e.preventDefault();
		this.isMove = true;
	},

	onTouchEnd: function( e ){	
		if( this.inRun ){ return; }
		
		// 单击当前元素激活状态并且是a， 则进行跳转
		if( !this.isMove && e.target.tagName === 'A' ){
			window.location.href = e.target.getAttribute('href');
		}
		
		var touchs = e.originalEvent && e.originalEvent.changedTouches ? 
					e.originalEvent.changedTouches[0] : e;
					
		var endPos = this.isHoriz ? touchs.clientX : touchs.clientY;
		var offsetPos = this.isHoriz ? this.offsetLeft : this.offsetTop;
		
		
		// 计算按下与松开的时间戳
		var timespan = this.getTime() - this.starttime;
		
		
		// 滑动距离
		var distance = endPos - this.initPos;
		var size = this.isHoriz ? this.itemWidth: this.itemHeight;
		var inFront = endPos - offsetPos < size;		
		
		
		// 根据滑动方向调用对应方法
		this.curFn = distance > this.distance ? this.prevItem: this.nextItem;
		
		
		// 如果是点击，则根据点击的位置调用对应方法
		if( !this.isMove && inFront ){
			this.curFn = this.prevItem;
		}	
		
		
		// 点击或者在指定的时间和距离内不做多个过渡
		if( !this.isMove || timespan > 120 && Math.abs(distance) < 80 ){
			this.curFn();
			
		}else{
			// 时间越短滑动的元素越多
			this.sumcount = Math.floor( timespan * 0.03 );		
			this.runcount = 0;	
			this.runtime = this.animateTime/this.sumcount;	
			this.runtime = this.runtime < 100 ? 100 : this.runtime;

			this.settings.listItems.css('transition', 'all ' + this.runtime + 'ms linear');
			setTimeout( this.run.bind(this), this.runtime );		
		}
	},

	run: function(){
		this.inRun = true;	
		this.curFn && this.curFn();
				
		this.runcount++;
		if( this.runcount < this.sumcount ){
			setTimeout( this.run.bind(this), this.runtime );
		}else{		
			this.inRun = false;
			setTimeout( function(){
				this.settings.listItems.css('transition', this.settings.itemTransition);
			}.bind(this), this.runtime );
		}
	},

	prevItem: function(){
		var s = this.settings;
		
		this.curIndex--;
		if( this.curIndex < 0 ){
			this.curIndex = this.settings.loop ? this.maxIndex: 0;
			
			// 避免重复显示
			if( !s.loop ){
				return;
			}
		}		
		
		s.listItems.removeClass('selected');
		
		var time = this.inRun ? 16 : this.runtime + 200;
		setTimeout(this.update.bind(this), time);
	},

	nextItem: function(){
		var s = this.settings;
		
		this.curIndex++;
		if( this.curIndex > this.maxIndex ){
			this.curIndex = s.loop ? 0: this.maxIndex;
					
			// 避免重复显示
			if( !s.loop ){
				return;
			}
		}
		
		s.listItems.removeClass('selected');	
		
		var time = this.inRun ? 16 : this.runtime + 200;
		setTimeout(this.update.bind(this), time);
	},

	update: function(){	
		var s = this.settings;
		var styleName = this.isHoriz ? 'translateX':'translateY';
		var size = this.isHoriz ? this.itemWidth : this.itemHeight;
		
		s.listItems.eq( this.curIndex ).addClass('selected');
		s.listEl.css('transform', styleName+'(' + -size*(this.curIndex-1) + 'px)');
	},


	getTime: function(){
		return +new Date();
	}
}



