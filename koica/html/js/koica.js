/**
 * Created by KOICA on 2017-02-28.
 */

var KOICA = KOICA || {},
	scope = {
	w : window,
	jQ : jQuery
};

(function (param) {
	
	var global = param.w,
	    $      = param.jQ;
	
	/**
	 * -----------------------
	 * @통합 검색 애니메이션
	 * -----------------------
	 **/
	KOICA.searchToggle = function () {
		var $searchBtn = $('.search-toggle');
		if (!$searchBtn) return;
		
		var $searchWarp = $('.total-search'),
		    $searchInput = $('.search-input');
		
		$searchBtn.on('click', function (e) {
			e.preventDefault();
			var $self = $(this);
			$searchWarp.toggleClass('active');
			$self.toggleClass('close');
			$searchInput.focus();
			
		});
	};
	
	/**
	 * -----------------------
	 * @Quick Menu
	 * -----------------------
	 **/
	var $quick, quickTop,
	    detect = {
		    gap : 62,
		    fixed : 'fixed',
		    abs : 'absolute',
	    };
	
	function quickInit() {
		$quick = $('.quick-section');
		quickTop = $quick.position().top;
	}
	
	
	KOICA.quick = function () {
		
		var globalTop = $(global).scrollTop(),
		    scrollTop  = globalTop + 62;
		
		if ($('body').is('#main')) {
			if (scrollTop > quickTop) {
				$quick.css({
					position : detect.fixed,
					top : detect.gap + 'px'
				})
			} else {
				$quick.css({
					position : detect.abs,
					top : quickTop + 'px'
				})
			}
		} else {
			if (scrollTop >= quickTop) {
				$quick.css({
					position : detect.fixed,
					top : detect.gap + 'px'
				})
			} else {
				$quick.css({
					position : detect.abs,
					top : quickTop + 'px'
				})
			}
		}
		
	};
	
	$(function () {
		
		KOICA.searchToggle();
		
		quickInit();
		$(global).on('scroll', function () {
			KOICA.quick();
		});
	});
	
})(scope);

/**
 * ----------------------------
 * @Plug-in Tab Menu Type
 * ----------------------------
 **/
(function (param) {
	
	var global = param.w,
	    $      = param.jQ;
	
	var pluginName = 'koicaTabs';
	
	function TabPlugin($selector, options) {
		this.$selector = $selector;
		this.detect = {};
		this.config = $.extend({}, this.defaults, options || {});
		
		if (!this.$selector.length) return;
		
		this._init();
	}
	
	TabPlugin.prototype = {
		constructor :  TabPlugin.prototype,
		defaults : {
			menuItemClass : '.tabItem',
			contentClass : '.panel',
			isSelected : 'is-selected',
			visibleContent : 1
		},
		_init : function () {
			this.setting();
			this._setEvent();
			this._defaultShowing();
		},
		setting : function () {
			this.detect.$selector = this.$selector;
			this.detect.$items    = this.detect.$selector.find(this.config.menuItemClass + ' a');
		},
		_setEvent : function () {
			
			var self = this;
			$(document).on('click.ui.tab', this.config.menuItemClass + ' a' , function (e) {
				e.preventDefault();
				var target     = this,
				    $showTabContent = $(target.hash);
				
				self._hidePanels($(target), $showTabContent);
				self._showPanels($(target), $showTabContent);
			})
		},
		_showPanels : function ($this, $showContent) {
			this.$targetItem.addClass(this.config.isSelected);
			$showContent.addClass(this.config.isSelected);
		},
		_hidePanels : function ($this, $showContent) {
			this.$targetItem = $this.closest('li');
			var isActived = this.$targetItem.siblings('.' + this.config.isSelected);
			
			if (!!isActived) {
				isActived.removeClass(this.config.isSelected);
			}
			
			$showContent.siblings(this.config.contentClass).removeClass(this.config.isSelected);
		},
		_defaultShowing : function () {
			this.detect.$items.eq(this.config.visibleContent - 1).trigger('click');
		}
		
	};
	
	$.fn[pluginName] = $.fn[pluginName] || function (options) {
			var $this = this;
			return $.each($this, function (idx, el) {
				var $selector = $this.eq(idx);
				if (!$.data(this, 'plugin_' + pluginName)) {
					$.data(this, 'plugin_' + pluginName, new TabPlugin($selector, options))
				}
				return $selector;
			})
	};
	
	$(function () {
		/**
		 * [data-*] 로 플러그인 호출
		 * @param @type {} : 플러그인 옵션값
		 * 기본값 { menuItemClass : '.tabItem', isSelected : 'is-selected', visibleContent : 1}
		 */
		/* // 탭 메뉴 플러그인 사용법
		$('[data-tab="***"]').koicaTabs({
			menuItemClass : ".tabItem", // 탭 메뉴의 li 클래스 사용자 정의
			isSelected : "is-selected", // 탭 메뉴 활성화 클래스
			contentClass : '.panel', // 탭 콘텐츠 클래스
			visibleContent: 1 // 처음에 보여줄 탭 메뉴 및 콘텐츠
		});
		*/
		$('[data-tab="tabs"]').koicaTabs();
	});
	
})(scope);

/**
 * ----------------------------
 * @carousel(main)
 * ----------------------------
 **/
(function (param) {
	var global = param.w,
	    $      = param.jQ;
	
	KOICA.Carousel = function (container, options) {
		
		if (!$(container).length)  return;
		this.$container = $(container);
		
		if (!(this instanceof  KOICA.Carousel)) {
			return new KOICA.Carousel(container, options);
		}
		
		this.config = $.extend(this.defaults, options || {});
		this.detect = {};
		this._init();
	};
	KOICA.Carousel.prototype = {
		defaults : {
			start: 0,
			autoPlay: true,
			duration: 1000,
			interval : 3000
		},
		_init : function () {
			this._detectDom();
			this._setupIndicator();
			this._setEvent();
			this._showDefault();
			this._autoRolling();
		},
		_detectDom : function () {
			
			this.detect.$controller  = this.$container.find('.controller');
			this.detect.$visualItems = this.$container.find('.visual li');
			this.detect.$btnStop     = this.$container.find('.ctrl-stop');
			this.detect.$btnPlay     = this.$container.find('.ctrl-play');
			this.detect.maxItems     = this.detect.$visualItems.length;
			this.detect.$indicator   = null;
			this.detect.current      = 0;
			this.detect.intervalID   = null;
			
		},
		_setupIndicator : function () {
			var i   = 0,
			    len = this.detect.maxItems;
			for (; i < len; i++) {
				this.detect.$controller.append(
					'<a href="#" class="indicator" data-index="' + i + '" role="button">' + (i+1) + '</a>'
				);
			}
			
			this.detect.$indicator = this.detect.$controller.find('.indicator');
		},
		_setEvent : function () {
			var self = this;
			
			$(this.$container).on('click.ui.gallery', '.indicator', $.proxy(this._controller, this));
			
			this.detect.$btnStop.on('click.ui.stop', function () {
				var $target = $(this);
				self.config.autoPlay = false;
				clearInterval(self.detect.intervalID);
				$target.removeClass('active');
				self.detect.$btnPlay.addClass('active');
			});
			
			this.detect.$btnPlay.on('click.ui.play', function () {
				var $target = $(this);
				self.config.autoPlay = true;
				self._autoRolling();
				$target.removeClass('active');
				self.detect.$btnStop.addClass('active');
			});
			
			this.detect.$indicator.hover(
				function () {
					if (self.config.autoPlay) clearInterval(self.detect.intervalID);
				},
				function () {
					if (self.config.autoPlay) self._autoRolling();
				}
			);
		},
		_controller : function (e) {
			e.preventDefault();
			var $target = $(e.currentTarget),
			    index   = $target.data('index');
			
			$target.addClass('active');
			$target.siblings().removeClass('active');
			
			if (this.detect.current == index) return;
			
			this._hideItem(this.detect.current);
			this._showItem(index);
			
			this.detect.current = index;
		},
		_showItem : function (index) {
			this.detect.$visualItems.eq(index).fadeIn(this.config.duration);
		},
		_hideItem : function (prevItemIndex) {
			this.detect.$visualItems.eq(prevItemIndex).fadeOut(this.config.duration);
		},
		_showDefault : function () {
			this.detect.$indicator.eq(this.config.start).trigger('click');
		},
		_autoRolling : function () {
			var num, self = this;
			if (this.config.autoPlay) {
				this.detect.intervalID = setInterval(function () {
					num =  self.detect.current;
					(num < self.detect.maxItems-1) ? num++ : (num = 0);
					self.detect.$indicator.eq(num).trigger('click')
				}, this.config.interval)
			}
		},
	};
	
	$(function () {
		
		var $visual = $('[data-visual="carousel"]');
		$visual.each(function () {
			new KOICA.Carousel(this);
		});
		
	});
	
	
})(scope);


/**
 * ----------------------------
 * @Banner(main bottom)
 * ----------------------------
 **/
(function (param) {
	
	var global = param.w,
	    $      = param.jQ;
	
	var pluginName = 'thumbBanner';
	
	var Banner = function ($selector, options) {
		
		this.$selector = $selector;
		this.detect = {};
		this.config = $.extend({}, this._defaults, options || {});
		
		this._init();
	};
	
	Banner.prototype = {
		constructor : Banner,
		_defaults : {
			duration: 400,
			movingLength : 7,
		},
		_init : function () {
			this._detectDom();
			this._setEvent();
		},
		addEvent : function (element, evtType, fn, scope) {
			element.on(evtType, function (e) {
				fn.call(scope, e);
			})
		},
		_detectDom : function () {
			this.detect.$container  = this.$selector.find('.banner-item');
			this.detect.$thumbnails = this.detect.$container.find('li');
			this.detect.$itemWidth = this.detect.$thumbnails.width();
			this.detect.$prev       = this.$selector.find('.btn-prev');
			this.detect.$next       = this.$selector.find('.btn-next');
			this.detect.current     = 0;
			this.detect.maxLength   = this.detect.$thumbnails.length;
			this.checkThumbnailSize = parseInt((this.detect.maxLength / this.config.movingLength) /2);
			// console.log(this.checkThumbnailSize);
		},
		_setEvent : function () {
			
			this.addEvent(this.detect.$prev, 'click.banner.prev', this._prev, this);
			this.addEvent(this.detect.$next, 'click.banner.next', this._next, this);
			
		},
		_next : function (e) {
			e.preventDefault();
			if (this.detect.current < this.checkThumbnailSize) {
				this.detect.current++;
			}
			this._move();
		},
		_prev : function (e) {
			e.preventDefault();
			console.log(this.detect.current);
			if (this.detect.current > 0) {
				this.detect.current--;
			}
			this._move();
		},
		_move : function () {
			var offset = ((this.detect.$itemWidth*this.config.movingLength)* this.detect.current) * -1;
			if (this.detect.$container.is(':animated')) return;
			this.detect.$container
				.animate({left : offset}, {duration : this.config.duration})
		}
	};
	
	$.fn[pluginName] = $.fn[pluginName] || function (options) {
			
			var $this = this;
			
			return $.each($this, function (index, el) {
				var $selector = $this.eq(index);
				if (!$.data(this, 'plugin_' + pluginName)) {
					$.data(this, 'plugin_' + pluginName, new Banner($selector, options))
				}
			});
		};
	
	/**
	 * $('selector').thumbBanner() 로 플러그인 호출
	 * @param @type {} : 플러그인 옵션값
	 * 기본값 { menuItemClass : '.tabItem', isSelected : 'is-selected', visibleContent : 1}
	 */
	/* // 탭 메뉴 플러그인 사용법
	 $('selector').koicaTabs({
		 duration: 400, // 애니메이션 속도
		 movingLength : 7, // 이동 갯수 설정
	 });
	 */
	$(function () {
		$('.banner-slide').thumbBanner();
	});
	
})(scope);