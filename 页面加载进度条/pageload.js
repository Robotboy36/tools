
/**
 * build: robert
 * time: 2016-08-25 
 * info: 页面加载进度条显示
 * use: 在页面引入pageload.js 即可
 * */

;(function(win){

	var width = 0;

	var doc = document;
	var head = doc.querySelector("head");
	var styleEl = doc.querySelector("#page_html_loadstyle")
	if( !styleEl ){
		styleEl = doc.createElement("style")
		styleEl.setAttribute( "id", "page_html_loadstyle" )
		head.appendChild( styleEl )
	}
	
	//页面加载完成时
	win.addEventListener( "load", completed, false);

	//init
	init();
	function init(){
		width = 0;
		clearTimeout( loading.key );

		loading();
	}

	
	//页面加载中
	function loading(){		
		width ++;
		
		clearTimeout( loading.key );
		loading.key = setTimeout(function(){
			loadStyle( width, 1 );			
			width<90 && loading();
		}, 100);
	}	
	
	//加载完成， 直接清除计时器
	function completed(){
		clearTimeout( loading.key );
		loadStyle( 100, 1 );
		setTimeout(function(){
			loadStyle( 100, 0 );
		}, 200);
	}	
		
	//控制加载进度条样式
	function loadStyle( width, opacity ){

		var styleHtml = 'html::before {'
			styleHtml += 'content: "";'
			styleHtml += 'position: fixed;'
			styleHtml += 'top: 0;'
			styleHtml += 'left: 0;'
			styleHtml += 'width: ' + width + '%;'
			styleHtml += 'opacity: ' + opacity + ';'
			styleHtml += 'height: 2px;'
			styleHtml += 'background: #0076ff;'
			styleHtml += 'z-index: 10;'
			styleHtml += 'box-shadow: 0 0 2px #498699;'
			styleHtml += 'transition: all ease-in-out 0.3s;'
			styleHtml += '-webkit-transition: all ease-in-out 0.3s;'
			styleHtml += '}'
		
		styleEl.innerHTML = styleHtml;
	}


	return {
		run: init,
		complete: completed
	}

})(window);

