/* Isolated Area_push carousel; no shared carousel/plugin settings. */
(function () {
    'use strict';
    function init() {
        var root = document.querySelector('.Area_push .Area_push_carousel');
        if (!root || root.dataset.initialized) return;
        root.dataset.initialized = 'true';
        var track = root.querySelector('.Area_push_list');
        var filler = track.querySelector('.Area_push_placeholder');
        var featureCount = Array.from(track.children).filter(function (card) {
            return !card.classList.contains('Area_push_placeholder');
        }).length;
        // Retain a non-link filler only when the actual feature count is odd.
        if (filler) {
            if (featureCount % 2) filler.hidden = false;
            else filler.remove();
        }
        var originalCards = Array.from(track.children);
        var cards = originalCards.slice();
        var columns = Math.ceil(cards.length / 2);
        var lastPage = Math.max(0, columns - 2);
        var totalPages = lastPage + 1;
        track.style.setProperty('--area-push-columns', Math.max(2, columns));
        track.style.setProperty('--area-push-track-width',
            'calc(' + (Math.max(2, columns) * 50) + '% + ' + (Math.max(2, columns) / 2 - 1) * 28 + 'px)');
        var layout = '';
        var tablet = window.matchMedia('(max-width: 1024px)');
        var phone = window.matchMedia('(max-width: 767px)');
        var prev = root.querySelector('.Area_push_prev');
        var next = root.querySelector('.Area_push_next');
        var dotContainer = root.querySelector('.Area_push_dots');
        dotContainer.textContent = '';
        var dots = [];
        var page = 0;
        for (var i = 0; i < totalPages; i++) {
            var dot = document.createElement('button');
            dot.type = 'button';
            dot.setAttribute('aria-label', '第 ' + (i + 1) + ' 頁，共 ' + totalPages + ' 頁');
            dotContainer.appendChild(dot);
            dots.push(dot);
        }
        function render() {
            var mode = phone.matches ? 'phone' : tablet.matches ? 'tablet' : 'desktop';
            if (mode !== layout) {
                var ordered = originalCards.slice();
                if (mode === 'desktop') {
                    // Convert each row-major group to the two-row column-flow layout.
                    ordered = [];
                    for (var index = 0; index < originalCards.length; index += 4) {
                        [0, 2, 1, 3].forEach(function (offset) {
                            if (originalCards[index + offset]) ordered.push(originalCards[index + offset]);
                        });
                    }
                }
                ordered.forEach(function (card) { track.appendChild(card); });
                cards = Array.from(track.children);
                layout = mode;
            }
            if (tablet.matches) {
                track.style.transform = 'none';
                root.removeAttribute('aria-roledescription');
            } else {
                var step = cards.length > 2 ? cards[2].offsetLeft - cards[0].offsetLeft : 0;
                track.style.transform = 'translateX(' + (-page * step) + 'px)';
                root.setAttribute('aria-roledescription', '輪播');
            }
            cards.forEach(function (card, index) {
                var visible = tablet.matches || (index >= page * 2 && index < page * 2 + 4);
                card.classList.toggle('is-visible', visible);
                card.inert = !visible;
                card.setAttribute('aria-hidden', String(!visible));
                // The coming-soon card is explanatory content, never a clickable link.
                if (card.matches('a')) card.tabIndex = visible ? 0 : -1;
            });
            prev.disabled = page === 0;
            next.disabled = page === lastPage;
            dots.forEach(function (dot, index) { dot.setAttribute('aria-current', String(index === page)); });
            root.querySelector('.Area_push_status').textContent = '第 ' + (page + 1) + ' 頁，共 ' + totalPages + ' 頁';
        }
        function go(value) {
            if (tablet.matches) return;
            page = Math.max(0, Math.min(lastPage, value));
            render();
        }
        prev.addEventListener('click', function () { go(page - 1); });
        next.addEventListener('click', function () { go(page + 1); });
        dots.forEach(function (dot, index) { dot.addEventListener('click', function () { go(index); }); });
        root.addEventListener('keydown', function (event) {
            if (tablet.matches || (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')) return;
            event.preventDefault();
            var focusedCard = document.activeElement.closest('.Area_push_list > a');
            go(page + (event.key === 'ArrowRight' ? 1 : -1));
            if (focusedCard && focusedCard.inert) dots[page].focus();
        });
        var startX, startY;
        root.addEventListener('touchstart', function (event) {
            startX = event.touches[0].clientX;
            startY = event.touches[0].clientY;
        }, { passive: true });
        root.addEventListener('touchend', function (event) {
            var dx = event.changedTouches[0].clientX - startX;
            var dy = event.changedTouches[0].clientY - startY;
            if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) go(page + (dx < 0 ? 1 : -1));
        }, { passive: true });
        tablet.addEventListener('change', render);
        phone.addEventListener('change', render);
        new ResizeObserver(render).observe(root);
        render();
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
}());
