/**
 * ===============================================
 * 워킹 리스트 및 html 인클루드(웹서버에서 동작)
 * ===============================================
 **/

// include html
function includeHtml() {
	var includeArea = $('[data-include]'),
	    target, url;
	
	$.each(includeArea, function () {
		
		target = $(this);
		url = target.data('include');
		
		target.load(url, function () {
			
			target.removeAttr('data-include');
			
			var page   = location.pathname.split('/').pop(),
			    $links = target.find('li a');
			
			$links.each(function () {
				var $this = $(this);
				if ($this.attr('href') == page) {
					$this.parent().addClass('active');
				}
			})
			
		})
		
	});
	
}


var GUI = GUI || {};

!function (param) {

	var global = param.global,
	    $      = param.jQ;


}({global: window, jQ : window.jQuery});


$(function () {
	includeHtml();
	
});

$(function(){
	// 번호 자동생성, 링크 자동생성
	var $workTbody = $('.working-list tbody'),
	    itemlist   = $workTbody.find('tr:not(".linetitle")'),
	    del        = $workTbody.find('.del'),
	    $tds       = $workTbody.find('td'),
	    arrayItem  = $.makeArray(itemlist),
	    $lineTitle = $workTbody.find('.linetitle td'),
	    i          = 0;
	
	// 테이블내의 서브타이틀 영역의 colspan 정의
	var totalcolspan = $('table thead th').length;
	$lineTitle.attr('colspan', totalcolspan);
	
	// 진척률 생성
	var $complete  = itemlist.find('td:last-child'), // 행마다 마지막 td
	    groupTotal = ($complete.length - del.length),
	    delCnt = del.find('.complete').length,
	    comTotal   = ($complete.find('.complete').length - delCnt);
	
	var groupProgress = (comTotal / groupTotal) * 100;
	
	$('.total').html(
		'<span class="per">종합 진척률 : '
		+ ~~groupProgress
		+ '%</span>'
		+ '<span class="status">'
		+ comTotal
		+ '/'
		+ groupTotal
		+ ' (완료 / 총 본수)</span>'
	);
	
	for(; i < arrayItem.length; i++) {
		var item = arrayItem[i]; // 각각 tr 참조
		$(item).prepend("<td></td>"); // 첫번째 td 생성(number 영역)
		
		// 파일 디렉토리 영역의 링크 생성
		var $cols = $(item).children('td');
		var $col01 = $cols.eq(1),
		    $col02 = $cols.eq(2),
		    $col03 = $cols.eq(3),
		    $col04 = $cols.eq(4);
		
		var url = $cols.eq(2);
		if($(item).is('.del')) {
			$col02.html('<span class="url">' + url.html() + '</span>');
		} else {
			$col02.html('<a href="' + url.html() + '" target="_blank" class="url">' + '<b style="color:#437cbc;">'+url.html() + '</b></a>');
		}
		
		var depthStr = $col01.text(),
		    depthEm = depthStr.substr(depthStr.lastIndexOf('>') + 1);
		
		$col01.html(depthStr.replace( depthEm,'<b style="color:#4b4b4b;">' + depthEm + '</b>'));
		
		$col01.addClass('tal depth');
		$col02.addClass('tal');
		$col03.addClass('publ');
		$col04.addClass('date');
		
	}
	
	// 검수요청,완료 여부에 따른 클래스 부여 및 상태란의 텍스트 생성
	itemlist.each(function(){
		var $this  = $(this),
		    tdStr  = $this.find('td').eq(1).text(),
		    newStr = tdStr.substr(tdStr.lastIndexOf('>') + 1),
		    $tds   = $this.find('td');
		
		var state = $this.find('td:last-child');
		state.find('.undecided').text('미');
		state.find('.delete').text('삭');
		state.find('.edit').text('중');
		state.find('.complete').text('완');
		
		var $inq    = $this.find('td').eq(5),
		    inqText = $inq.text();
		
		if(inqText.indexOf('검수요청') > -1) {
			$inq.addClass('quest');
		} else if(inqText.indexOf('검수완료') > -1) {
			$this.addClass('comp');
		}
		
	});
	
	var $ths = $('.working-list thead th');
	$ths.eq(0).append(' (' + groupTotal + ')');
	$ths.eq(6).append(' (' + comTotal + ')');
	
});


(function($) {
	
	function update() {
		
		var text, tr, select, visibleTr;
		
		visibleTr = $('tbody tr:visible');
		tr = $('tbody tr:not(".linetitle")');
		select = $('select');
		text = [];
		
		// 셀렉트 값이 변경될 때마다 배열 text 에 참조
		select.each(function() {
			text.push($.trim($(this).find('option:selected').text() ));
		});
		
		// jQuery.inArray : 배열 내의 값을 찾아서 인덱스를 반환합니다.(요소가 없을 경우 -1을 반환)
		// 담당자 전체, 전체인 경우에 모든 table row 를 보여줌
		if( ($.inArray('담당자', text) > -1) && ($.inArray('date', text) > -1) ) {
			tr.show();
		}
		// 담당자 문자열이 아닌 이름을 선택하고 date 전체인 경우
		else if( ($.inArray('담당자', text) == -1) && ($.inArray('date', text) > -1) ) {
			tr.each(function() {
				var $this = $(this);
				if(text[0] == $this.find('.publ').text()) {
					$this.show();
				} else {
					$this.hide();
				}
			})
		}
		// 담당자이고 전체가 아닌 날짜를 선택한 경우
		else if( ($.inArray('담당자', text) > -1) && ($.inArray('date', text) == -1) ) {
			tr.each(function() {
				var $this = $(this);
				if(text[1] == $this.find('.date').text()) {
					$this.show();
				} else {
					$this.hide();
				}
			})
		}
		else if( ($.inArray('담당자', text) == -1) && ($.inArray('date', text) == -1) ) {
			tr.each(function() {
				var $this = $(this);
				if(text[0] == $this.find('.publ').text() && text[1] == $this.find('.date').text()) {
					$this.show();
				} else {
					$this.hide();
				}
			});
			
		}
		
	}
	
	$(document).on('change', 'select', update);
	
	// 날짜 컬럼을 셀렉트 박스에 차례대로 생성
	function sortDate(idx, el) {
		var worklist = $('.working-list'),
		    dateBox  = $('thead th').eq(idx),
		    dateData = [],
		    dateList = worklist.find( el+':visible');
		
		dateList.each(function() {
			
			var $this = $(this);
			
			if(!!$.trim($(this).text())) {
				// 배열길이가 0 이면 날짜 컬럼 텍스트의 처음 문자열을 배열에 추가
				if(dateData.length == 0) {
					dateData.push($.trim($this.text()));
					return;
				}
				// 배열에 해당 날짜 문자열이 없다면 dateDate 배열에 추가
				if($.inArray($.trim( $this.text()), dateData) == -1) {
					dateData.push($.trim($this.text()));
				}
				
			}
			
		});
		
		var dateSort = dateData.sort(compareForSort);
		
		function compareForSort(first, second) {
			if (first == second) {
				return 0;
			}
			if (first < second) {
				return -1;
			} else {
				return 1;
			}
		}
		
		// 배열에 저장된 날짜 모음을 셀렉트박스에 추가
		for(var i = 0, max = dateSort.length; i < max; i++) {
			dateBox.find('select').append('<option>' + dateSort[i] + '</option>');
		}
		
	}
	
	// number 컬럼에 넘버 증가 및 서브타이틀의 총 갯수 정의
	function countLine() {
		var count       = 0,
		    linetitle   = $('.linetitle'),
		    titleLength = linetitle.length,
		    title,
		    tr          = $('tbody tr'),
		    length      = tr.length;
		
		linetitle.each(function(index) {
			$(this).data('idx', index);
		});
		
		tr.each(function(idx) {
			var $this = $(this);
			
			
			if($this.hasClass('linetitle')) {
				// 최초 linetitle 은 count 가 증가하기 전이므로 - 1 하여 요소를 선택하지 않는다.
				title = linetitle[$this.data('idx') - 1];
				
				// count 를 증가시킨후 linetitle 을 검색하도록 한다.
				if(!!title) {
					$(title).find('td .sub-tit').append(' (' + count + ')');
					// linetitle 이 있다면 count 를 0 으로 초기화
					count = 0;
				}
			} else {
				$this.find('td:first-child').append(count + 1);
				// del 클래스가 있으면 변수 count 를 증가시키지 않고 아니면 증가시킨다.
				count = $this.hasClass('del') ? count : count + 1;
			}
			
			// each 문이 모두 돌았을 때 즉, 마지막 .linetitle 의 count 를 참조
			if(idx == length -1) {
				title = linetitle[titleLength -1];
				if(!!title) {
					$(title).find('td .sub-tit').append(' (' + count + ')');
				}
			}
			
		})
		
	}
	
	function sortCount() {
		var count = 0,
		    tr    = $('tbody tr:not(".del")');
		
		tr.each(function() {
			var $this = $(this);
			if(!$this.hasClass('linetitle') && $this.is(':visible')) {
				count = count + 1;
			}
		});
		
		return count;
		
	}
	
	$(function(){
		countLine();
		sortDate(3, '.publ');
		sortDate(4, '.date');
		
		var $ribbon = $('#guide #header .ribbon');
		$ribbon.on('click', function () {
			var $this   = $(this),
			    cloneEl = $this.clone(true);
			
			$this.before(cloneEl);
			$('.' + $this.attr('class') + ':last').remove();
		});
		
	});
	
}(jQuery));