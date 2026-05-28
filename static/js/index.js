window.HELP_IMPROVE_VIDEOJS = false;

var INTERP_BASE = "./static/interpolation/stacked";
var NUM_INTERP_FRAMES = 240;

var interp_images = [];
function preloadInterpolationImages() {
  for (var i = 0; i < NUM_INTERP_FRAMES; i++) {
    var path = INTERP_BASE + '/' + String(i).padStart(6, '0') + '.jpg';
    interp_images[i] = new Image();
    interp_images[i].src = path;
  }
}

function setInterpolationImage(i) {
  var image = interp_images[i];
  image.ondragstart = function() { return false; };
  image.oncontextmenu = function() { return false; };
  $('#interpolation-image-wrapper').empty().append(image);
}


$(document).ready(function() {
    var options = {
			slidesToScroll: 1,
			slidesToShow: 3,
			loop: true,
			infinite: true,
			autoplay: false,
			autoplaySpeed: 3000,
    }

		// Initialize all div with carousel class
    var carousels = bulmaCarousel.attach('.carousel', options);

    // Loop on each carousel initialized
    for(var i = 0; i < carousels.length; i++) {
    	// Add listener to  event
    	carousels[i].on('before:show', state => {
    		console.log(state);
    	});
    }

    // Access to bulmaCarousel instance of an element
    var element = document.querySelector('#my-element');
    if (element && element.bulmaCarousel) {
    	// bulmaCarousel instance is available as element.bulmaCarousel
    	element.bulmaCarousel.on('before-show', function(state) {
    		console.log(state);
    	});
    }

    /*var player = document.getElementById('interpolation-video');
    player.addEventListener('loadedmetadata', function() {
      $('#interpolation-slider').on('input', function(event) {
        console.log(this.value, player.duration);
        player.currentTime = player.duration / 100 * this.value;
      })
    }, false);*/
    preloadInterpolationImages();

    $('#interpolation-slider').on('input', function(event) {
      setInterpolationImage(this.value);
    });
    setInterpolationImage(0);
    $('#interpolation-slider').prop('max', NUM_INTERP_FRAMES - 1);

    bulmaSlider.attach();

})


// Wait for the HTML to fully load before running our script
document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. SINGLE IMAGE CAROUSEL LOGIC
    // ==========================================
    const singleCarousel = document.getElementById('image-carousel');
    
    // Only run this if the single carousel exists on the current page
    if (singleCarousel) {
        let currentPositionX = 0;
        const scrollSpeed = 0.8;
        let isScrollActive = false; 

        singleCarousel.addEventListener('click', () => {
            isScrollActive = !isScrollActive;
            if (isScrollActive) {
                singleCarousel.classList.add('is-active');
            } else {
                singleCarousel.classList.remove('is-active');
            }
        });

        singleCarousel.addEventListener('wheel', (event) => {
            if (!isScrollActive) return; 

            event.preventDefault();
            const scrollAmount = event.deltaY !== 0 ? event.deltaY : event.deltaX;
            currentPositionX -= scrollAmount * scrollSpeed;
            singleCarousel.style.backgroundPosition = `${currentPositionX}px 0px`;
        }, { passive: false });
    }


    // ==========================================
    // 2. MULTI-IMAGE CAROUSEL LOGIC
    // ==========================================
    const multiContainer = document.getElementById('multi-carousel');
    const multiTrack = document.getElementById('multi-track');

    // Only run this if the multi-carousel exists on the current page
    if (multiContainer && multiTrack) {
        const originalImages = Array.from(multiTrack.children);
        
        // Clone images
        originalImages.forEach(img => {
            const clone = img.cloneNode(true);
            multiTrack.appendChild(clone);
        });

        let currentX = 0;
        let isManualControl = false;
        let autoScrollSpeed = 1.0; 
        let manualScrollSpeed = 0.8; 
        let originalSetWidth = 0;

        function calculateWidth() {
            originalSetWidth = 0;
            originalImages.forEach(img => {
                originalSetWidth += img.getBoundingClientRect().width; 
            });
        }

        Promise.all(originalImages.map(img => {
            if (img.complete) return Promise.resolve();
            return new Promise(resolve => img.addEventListener('load', resolve));
        })).then(() => {
            calculateWidth();
            autoScroll(); 
        });

        window.addEventListener('resize', calculateWidth);

        function enforceLoop() {
            if (originalSetWidth === 0) return;
            if (currentX <= -originalSetWidth) {
                currentX += originalSetWidth;
            } else if (currentX > 0) {
                currentX -= originalSetWidth;
            }
            multiTrack.style.transform = `translateX(${currentX}px)`;
        }

        function autoScroll() {
            if (!isManualControl && originalSetWidth > 0) {
                currentX -= autoScrollSpeed; 
                enforceLoop();
            }
            requestAnimationFrame(autoScroll);
        }

        multiContainer.addEventListener('click', () => {
            isManualControl = !isManualControl;
            if (isManualControl) {
                multiContainer.classList.add('is-active');
            } else {
                multiContainer.classList.remove('is-active');
            }
        });

        multiContainer.addEventListener('wheel', (event) => {
            if (!isManualControl) return; 

            event.preventDefault(); 
            const scrollAmount = event.deltaY !== 0 ? event.deltaY : event.deltaX;
            currentX -= scrollAmount * manualScrollSpeed;
            enforceLoop(); 
        }, { passive: false });
    }
});
