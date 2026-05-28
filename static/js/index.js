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
    // 1. SINGLE IMAGE CAROUSEL LOGIC (With Auto-Scroll)
    // ==========================================
    const singleCarousel = document.getElementById('image-carousel');
    
    if (singleCarousel) {
        let currentPositionX = 0;
        const manualScrollSpeed = 0.8;
        const autoScrollSpeed = 1.0; // Pixels to move per frame automatically
        let isManualControl = false; 

        // The automatic rolling animation function
        function autoScrollSingle() {
            if (!isManualControl) {
                currentPositionX -= autoScrollSpeed;
                singleCarousel.style.backgroundPosition = `${currentPositionX}px 0px`;
            }
            requestAnimationFrame(autoScrollSingle);
        }

        // Kick off the automatic rolling immediately
        autoScrollSingle();

        // Listen for clicks to toggle between auto and manual control
        singleCarousel.addEventListener('click', () => {
            isManualControl = !isManualControl;
            if (isManualControl) {
                singleCarousel.classList.add('is-active');
            } else {
                singleCarousel.classList.remove('is-active');
            }
        });

        // Handle mouse wheel scrolling when manual control is active
        singleCarousel.addEventListener('wheel', (event) => {
            if (!isManualControl) return; 

            event.preventDefault();
            const scrollAmount = event.deltaY !== 0 ? event.deltaY : event.deltaX;
            currentPositionX -= scrollAmount * manualScrollSpeed;
            singleCarousel.style.backgroundPosition = `${currentPositionX}px 0px`;
        }, { passive: false });
    }


    // ==========================================
    // 2. MULTI-IMAGE CAROUSEL LOGIC
    // ==========================================
    const multiContainers = document.querySelectorAll('.multi-carousel-container');

    multiContainers.forEach(container => {
        // Find the track inside this specific container
        const track = container.querySelector('.multi-carousel-track');
        if (!track) return;

        const originalImages = Array.from(track.children);
        
        // Clone images for the infinite loop effect
        originalImages.forEach(img => {
            const clone = img.cloneNode(true);
            track.appendChild(clone);
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

        // Wait for images to load before calculating widths and starting
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
            track.style.transform = `translateX(${currentX}px)`;
        }

        function autoScroll() {
            if (!isManualControl && originalSetWidth > 0) {
                currentX -= autoScrollSpeed; 
                enforceLoop();
            }
            requestAnimationFrame(autoScroll);
        }

        container.addEventListener('click', () => {
            isManualControl = !isManualControl;
            if (isManualControl) {
                container.classList.add('is-active');
            } else {
                container.classList.remove('is-active');
            }
        });

        container.addEventListener('wheel', (event) => {
            if (!isManualControl) return; 

            event.preventDefault(); 
            const scrollAmount = event.deltaY !== 0 ? event.deltaY : event.deltaX;
            currentX -= scrollAmount * manualScrollSpeed;
            enforceLoop(); 
        }, { passive: false });
    });
});
