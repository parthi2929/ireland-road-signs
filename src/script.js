let currentPage = 1;
let totalPages = 17;
let viewer;
let baseLayer, answerLayer;
let isInitialLoad = true;
let showAnswer = false;

function initOpenSeadragon() {
    const isMobile = window.innerWidth <= 768;

    viewer = OpenSeadragon({
        id: "image-container",
        prefixUrl: "https://cdnjs.cloudflare.com/ajax/libs/openseadragon/4.1.0/images/",
        visibilityRatio: 1.0,
        constrainDuringPan: true,
        minZoomLevel: 0.1,
        maxZoomLevel: 10,
        zoomPerClick: 1.5,
        zoomPerScroll: 1.2,
        showNavigationControl: false,
        defaultZoomLevel: isMobile ? 0.85 : 0.52,
        homeFitBounds: true,
        autoResize: true,
        gestureSettingsTouch: {
            pinchToZoom: true,
            flickEnabled: false      // Disable default flick behavior for mobile
        },
        viewportMargins: {
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
        },
        viewportPadding: {
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
        }
    });

    // Add mobile swipe detection only if on mobile
    if (isMobile) {
        let touchStartX = 0;
        let touchStartY = 0;
        const container = document.getElementById('image-container');

        container.addEventListener('touchstart', function (e) {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });

        container.addEventListener('touchend', function (e) {
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;

            // Minimum swipe distance threshold (in pixels)
            const minSwipeDistance = 50;

            // Only handle horizontal swipes (ignore vertical swipes)
            if (Math.abs(deltaX) > minSwipeDistance && Math.abs(deltaX) > Math.abs(deltaY)) {
                if (deltaX > 0) {
                    prevPage(); // Swipe right to go to previous page
                } else {
                    nextPage(); // Swipe left to go to next page
                }
            }
        });
    }

    // Add resize handler
    window.addEventListener('resize', function () {
        const isMobile = window.innerWidth <= 768;
        viewer.viewport.zoomTo(isMobile ? 0.85 : 0.33);
    });

    viewer.addHandler('zoom', function (event) {
        updateZoomControls(event.zoom);
    });

    loadImages();
}

function updatePageCounter() {
    const completion = ((currentPage / totalPages) * 100).toFixed(1);
    document.getElementById('page-counter').textContent =
        `${currentPage}/${totalPages} (${completion}% completed)`;
}

function loadImages() {
    const imageName = `RuleOfTheRoad_Book-for-web-221-237-${String(currentPage).padStart(2, '0')}.png`;
    const baseTileSource = {
        type: 'image',
        url: `../assets/LAYER_0/${imageName}`
    };
    const answerTileSource = {
        type: 'image',
        url: `../assets/LAYER_1/${imageName}`
    };

    let oldBounds = viewer.viewport.getBounds();

    viewer.world.removeAll();

    viewer.addTiledImage({
        tileSource: baseTileSource,
        opacity: 1,
        success: function (event) {
            baseLayer = event.item;
            if (!isInitialLoad) {
                viewer.viewport.fitBounds(oldBounds, true);
            }
        }
    });

    viewer.addTiledImage({
        tileSource: answerTileSource,
        opacity: showAnswer ? 1 : 0,
        success: function (event) {
            answerLayer = event.item;
            if (isInitialLoad) {
                viewer.viewport.goHome(true);  /* Added: Force home position on initial load */
                isInitialLoad = false;
            }
        }
    });

    updatePageCounter();
}

function nextPage() {
    currentPage = currentPage % totalPages + 1;
    loadImages();
}

function prevPage() {
    currentPage = (currentPage - 2 + totalPages) % totalPages + 1;
    loadImages();
}

function updateZoomControls(zoom) {
    const zoomPercentage = Math.round(zoom * 100);
    document.getElementById('zoom-slider').value = zoomPercentage;
    document.getElementById('zoom-level').textContent = `${zoomPercentage}%`;
}

function resetView() {
    viewer.viewport.goHome();
}

document.getElementById('next-btn').addEventListener('click', nextPage);
document.getElementById('prev-btn').addEventListener('click', prevPage);
document.getElementById('reset-btn').addEventListener('click', resetView);

document.getElementById('show-answer').addEventListener('change', function () {
    showAnswer = this.checked; // Update the showAnswer state
    if (answerLayer) {
        answerLayer.setOpacity(showAnswer ? 1 : 0);
    }
});

document.getElementById('zoom-slider').addEventListener('input', function () {
    const zoom = this.value / 100;
    viewer.viewport.zoomTo(zoom);
});

// Initialize page counter
updatePageCounter();

// Initialize OpenSeadragon
initOpenSeadragon();