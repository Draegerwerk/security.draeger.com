document.addEventListener("DOMContentLoaded", function (event) {
    const keyToggle = document.getElementById("pgp-key");

    keyToggle.addEventListener("click", function () {
        const element = document.getElementById("collapseExample");
        element.classList.toggle("collapse");
    });

});

$(document).ready(function () {

	// Scroll & navigation handlers and functions

	scrollToAnchor(location.hash);

	const navItems = $('.dropdown-toggle');
	
	// Add click events to all nav items
	navItems.each(function () {
		$(this).on('click', () => {
			// First hide all elements except the current
			$(navItems).not($(this)).parent('.dropdown').removeClass('open');
			$(navItems).not($(this)).next('.dropdown-menu').fadeOut();

			// Add class and open the selected element
			$(this).parent('.dropdown').hasClass('open') ?
			$(this).next('.dropdown-menu').fadeOut() && $(this).parent('.dropdown').removeClass('open') :
			$(this).next('.dropdown-menu').fadeIn() && $(this).parent('.dropdown').addClass('open');
		});
	});

	// Scroll to the selected anchor
	$('.dropdown li a').on('click', function() {
		scrollToAnchor($(this).attr('href'));
	});

	// Hide all opened dropdown menus if click was outside the element
	$(document).on('click', function(event) {
		if(!$(event.target).closest('.dropdown-toggle').length) {
			$(navItems).parent('.dropdown').removeClass('open');
			$(navItems).next('.dropdown-menu').fadeOut();
		}
	});

	// Product selection handlers and functions
	
	let productDropdown = $('#products');
	// Sort the dropdown options alphabetically
	productDropdown.html($("option").sort(function (a, b) {
		return a.text.localeCompare(b.text);
	}))

	// Select the current default product
	// This will get the value of the tagged option
	selectProduct($('#products').find('option[selected]').val());

	// Change product selection
	$('#products').on('change', function(event) {
		selectProduct($(this).val());
	});

})

/**
 * The scrollToAnchor function scrolls the page to a specific anchor element on a given URL.
 * @param url - The `url` parameter is a string that represents the URL of the page or just the anchor itself.
 */
function scrollToAnchor(url) {
	const urlHash = url.split('#')[1];
	if (urlHash &&  $('#' + urlHash).length) {
		$('html').animate({
			scrollTop: $('#' + urlHash).offset().top - 75
		}, 250);
	}
}

/**
 * The function selectProduct hides all elements with the class "product" and then fades in the element
 * with the specified productId.
 * @param productId - The productId parameter is the unique identifier of the product that you want to
 * select and display on the page.
 */
function selectProduct(productId) {
	$('.product').hide();
	$('#'+productId+'.product').fadeIn();
}