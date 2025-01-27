let currentPage = 1;
let totalPages = 17;
let viewer;
let baseLayer, answerLayer;
let isInitialLoad = true;
let showAnswer = false; // New variable to track the state of the "Show answer" toggle

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
        defaultZoomLevel: isMobile ? 0.85 : 0.33,
        homeFitBounds: true,
        autoResize: true,
        viewportMargins: {    /* Added to control viewport margins */
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
        },
        viewerPadding: {      /* Added to remove padding */
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
        }
    });

    // Add resize handler to adjust zoom when switching between mobile/desktop
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
        url: `assets/LAYER_0/${imageName}`
    };
    const answerTileSource = {
        type: 'image',
        url: `assets/LAYER_1/${imageName}`
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