(function($) {

	var	$window = $(window),
		$body = $('body'),
		$wrapper = $('#page-wrapper'),
		$banner = $('#banner'),
		$header = $('#header');
	
	/*toc*/
	var toc = document.querySelector( '.toc' );
	var tocPath = document.querySelector( '.toc-marker path' );
	var tocItems;

	// Factor of screen size that the element must cross before it's considered visible
	var TOP_MARGIN = 0.1,
	    BOTTOM_MARGIN = 0.2;

	var pathLength;

	var lastPathStart,
		lastPathEnd; /*end toc*/

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
	/*TOC*/
	window.addEventListener( 'resize', drawPath, false );
	window.addEventListener( 'scroll', sync, false );

	drawPath();

	function drawPath() {

	  tocItems = [].slice.call( toc.querySelectorAll( 'li' ) );

	  // Cache element references and measurements
	  tocItems = tocItems.map( function( item ) {
	    var anchor = item.querySelector( 'a' );
	    var target = document.getElementById( anchor.getAttribute( 'href' ).slice( 1 ) );

	    return {
	      listItem: item,
	      anchor: anchor,
	      target: target
	    };
	  } );

	  // Remove missing targets
	  tocItems = tocItems.filter( function( item ) {
	    return !!item.target;
	  } );

	  var path = [];
	  var pathIndent;

	  tocItems.forEach( function( item, i ) {

	    var x = item.anchor.offsetLeft - 5,
		y = item.anchor.offsetTop,
		height = item.anchor.offsetHeight;

	    if( i === 0 ) {
	      path.push( 'M', x, y, 'L', x, y + height );
	      item.pathStart = 0;
	    }
	    else {
	      // Draw an additional line when there's a change in
	      // indent levels
	      if( pathIndent !== x ) path.push( 'L', pathIndent, y );

	      path.push( 'L', x, y );

	      // Set the current path so that we can measure it
	      tocPath.setAttribute( 'd', path.join( ' ' ) );
	      item.pathStart = tocPath.getTotalLength() || 0;

	      path.push( 'L', x, y + height );
	    }

	    pathIndent = x;

	    tocPath.setAttribute( 'd', path.join( ' ' ) );
	    item.pathEnd = tocPath.getTotalLength();

	  } );

	  pathLength = tocPath.getTotalLength();

	  sync();

	}

	function sync() {

	  var windowHeight = window.innerHeight;

	  var pathStart = pathLength,
	      pathEnd = 0;

	  var visibleItems = 0;

	  tocItems.forEach( function( item ) {

	    var targetBounds = item.target.getBoundingClientRect();

	    if( targetBounds.bottom > windowHeight * TOP_MARGIN && targetBounds.top < windowHeight * ( 1 - BOTTOM_MARGIN ) ) {
	      pathStart = Math.min( item.pathStart, pathStart );
	      pathEnd = Math.max( item.pathEnd, pathEnd );

	      visibleItems += 1;

	      item.listItem.classList.add( 'visible' );
	    }
	    else {
	      item.listItem.classList.remove( 'visible' );
	    }

	  } );

	  // Specify the visible path or hide the path altogether
	  // if there are no visible items
	  if( visibleItems > 0 && pathStart < pathEnd ) {
	    if( pathStart !== lastPathStart || pathEnd !== lastPathEnd ) {
	      tocPath.setAttribute( 'stroke-dashoffset', '1' );
	      tocPath.setAttribute( 'stroke-dasharray', '1, '+ pathStart +', '+ ( pathEnd - pathStart ) +', ' + pathLength );
	      tocPath.setAttribute( 'opacity', 1 );
	    }
	  }
	  else {
	    tocPath.setAttribute( 'opacity', 0 );
	  }

	  lastPathStart = pathStart;
	  lastPathEnd = pathEnd;
	}
	
})(jQuery);
