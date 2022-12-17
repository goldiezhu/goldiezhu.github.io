(function($) {

	var	$window = $(window),
		$body = $('body'),
		$wrapper = $('#page-wrapper'),
		$banner = $('#banner'),
		$header = $('#header');
	
	
	// Breakpoints.
		breakpoints({
			xlarge:   [ '1281px',  '1680px' ],
			large:    [ '981px',   '1280px' ],
			medium:   [ '737px',   '980px'  ],
			small:    [ '481px',   '736px'  ],
			xsmall:   [ null,      '480px'  ]
		});

	// Play initial animations on page load.
		$window.on('load', function() {
			window.setTimeout(function() {
				$body.removeClass('is-preload');
			}, 100);
		});

	// Mobile?
		if (browser.mobile)
			$body.addClass('is-mobile');
		else {

			breakpoints.on('>medium', function() {
				$body.removeClass('is-mobile');
			});

			breakpoints.on('<=medium', function() {
				$body.addClass('is-mobile');
			});

		}

	// Scrolly.
		$('.scrolly')
			.scrolly({
				speed: 1500,
				offset: $header.outerHeight()
			});

	// Menu.
		$('#menu')
			.append('<a href="#menu" class="close"></a>')
			.appendTo($body)
			.panel({
				delay: 500,
				hideOnClick: true,
				hideOnSwipe: true,
				resetScroll: true,
				resetForms: true,
				side: 'right',
				target: $body,
				visibleClass: 'is-menu-visible'
			});

	// Header.
		if ($banner.length > 0
		&&	$header.hasClass('alt')) {

			$window.on('resize', function() { $window.trigger('scroll'); });

			$banner.scrollex({
				bottom:		$header.outerHeight() + 1,
				terminate:	function() { $header.removeClass('alt'); },
				enter:		function() { $header.addClass('alt'); },
				leave:		function() { $header.removeClass('alt'); }
			});
		}
	//back to top button
		$window.scroll(function() {
		    var height = $window.scrollTop();
		    if (height > 100) {
			$('#back2Top').fadeIn();
		    } else {
			$('#back2Top').fadeOut();
		    }
		});
		$(document).ready(function() {
		    $("#back2Top").click(function(event) {
			event.preventDefault();
			$("html, body").animate({ scrollTop: 0 }, "slow");
			return false;
		    });
		});
	
	// Table of Contents
	var sectionsHeight = $('.sections').height();
	$('.sectionsWrapper').css({ bottom: '-' + sectionsHeight + 'px', visibility: 'visible' });

	$('#toc').click(function(){
		if($('.sectionsWrapper').hasClass('closed')){
			$('.sectionsWrapper').removeClass('closed');
			$('.sectionsWrapper').stop().animate({ bottom: '34px' }, 200);
		}else{
			$('.subsectionContent').hide(100, function(){
				$('.sectionsWrapper').addClass('closed');
				$('.sectionsWrapper').stop().animate({ bottom: '-' + sectionsHeight + 'px' }, 200);
			});
		}
		return false;
	});

	$('.subsection').click(function(){
		$('.subsectionContent').hide(100);
		$(this).parent().next('.subsectionContent').show(200);

		return false;
	});
	$('#toc').mouseenter(function(){
		if($('.sectionsWrapper').hasClass('closed')){
			$('.sectionsWrapper').removeClass('closed');
			$('.sectionsWrapper').stop().animate({ bottom: '34px' }, 200);
		}else{
			$('.subsectionContent').hide(100, function(){
				$('.sectionsWrapper').addClass('closed');
				$('.sectionsWrapper').stop().animate({ bottom: '-' + sectionsHeight + 'px' }, 200);
			});
		}
		return false;

	});

	$('#tableOfContents').mouseleave(function(){
		$('.subsectionContent').hide(100, function(){
			$('.sectionsWrapper').addClass('closed');
			$('.sectionsWrapper').stop().animate({ bottom: '-' + sectionsHeight + 'px' }, 200);
		});
	});

		
})(jQuery);

$("path, circle").hover(function(e) {
  $('#info-box').css('display','block');
  $('#info-box').html($(this).data('info'));
});

$("path, circle").mouseleave(function(e) {
  $('#info-box').css('display','none');
});

$(document).mousemove(function(e) {
  $('#info-box').css('top',e.pageY-$('#info-box').height()-30);
  $('#info-box').css('left',e.pageX-($('#info-box').width())/2);
}).mouseover();

var ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
if(ios) {
  $('a').on('click touchend', function() { 
    var link = $(this).attr('href');   
    window.open(link,'_blank');
    return false;
  });
}
