
(function(){

    var els = document.querySelectorAll('[get-code]');

    els.forEach(function(el){
        el.normalTxt = el.textContent;
        el.time = el.getAttribute('data-time') - 0 || 60;
        el.countTime = el.time;
        el.timeTxt = el.getAttribute('data-timetxt') || 's';
        
        // 回调函数
        el.callback = el.getAttribute('data-call') || '';

        el.addEventListener('click', function(e){
            if(this.classList.contains('disabled')){
                return false;
            }

            this.classList.add('disabled');
            timeDown(this);
            
            var url = this.getAttribute('data-ajaxurl');
            sendAjax( this, url );
        }, false );
    });


    function timeDown( el ){
        if( el.countTime === 0 ){
            el.countTime = el.time;
            
            clearTimeout( el.key );
            el.classList.remove('disabled');
            el.textContent = el.normalTxt;
            return;
        }

        el.textContent = el.countTime + el.timeTxt;
        el.countTime--;
        
        el.key = setTimeout( function(e){
            timeDown(this);
        }.bind(el), 1000 );
    }
    
    
    function sendAjax( el, url ){
    	if( !url ){
    		console.log( '木有请求地址' );
    		return;
    	}
    	
    	var req = new XMLHttpRequest();
    	
    	req.open('GET', url, true);
    	req.addEventListener('readystatechange', function(e){
    		var res = e.currentTarget;
    		
    		if( res.status === 200 && res.readyState === 4 ){
    			if( el.callback ){
    				typeof window[el.callback] === 'function' && 
    				window[el.callback]( res.responseText );
    			}
    		}
    	})
    	
    	req.send(null);
    }
})();
