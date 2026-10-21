/* Isolated Area_push carousel; no shared carousel/plugin settings. */
(function () {
    'use strict';
    function init() {
        var root = document.querySelector('.Area_push .Area_push_carousel');
        if (!root || root.dataset.initialized) return;
        root.dataset.initialized = 'true';
        var track = root.querySelector('.Area_push_list');
        var cards = Array.from(track.children);
        var originalCards = cards.slice();
        var layout = '';
        var tablet = window.matchMedia('(max-width: 1024px)');
        var phone = window.matchMedia('(max-width: 767px)');
        var prev = root.querySelector('.Area_push_prev');
        var next = root.querySelector('.Area_push_next');
        var dots = Array.from(root.querySelectorAll('.Area_push_dots button'));
        var page = 0;
        function render() {
            var mode = phone.matches ? 'phone' : tablet.matches ? 'tablet' : 'desktop';
            if (mode !== layout) {
                // Keep the card order shown in each supplied layout reference.
                var order = mode === 'desktop' ? [0, 2, 1, 3, 4, 5] :
                    mode === 'tablet' ? [0, 1, 4, 2, 3, 5] : [0, 1, 2, 3, 4, 5];
                order.forEach(function (index) { track.appendChild(originalCards[index]); });
                cards = Array.from(track.children);
                layout = mode;
            }
            if (tablet.matches) {
                track.style.transform = 'none';
                root.removeAttribute('aria-roledescription');
            } else {
                var step = cards[2].offsetLeft - cards[0].offsetLeft;
                track.style.transform = 'translateX(' + (-page * step) + 'px)';
                root.setAttribute('aria-roledescription', '輪播');
            }
            cards.forEach(function (card, index) {
                var visible = tablet.matches || (index >= page * 2 && index < page * 2 + 4);
                card.classList.toggle('is-visible', visible);
                card.inert = !visible;
                card.setAttribute('aria-hidden', String(!visible));
                card.tabIndex = visible ? 0 : -1;
            });
            prev.disabled = page === 0;
            next.disabled = page === 1;
            dots.forEach(function (dot, index) { dot.setAttribute('aria-current', String(index === page)); });
            root.querySelector('.Area_push_status').textContent = '第 ' + (page + 1) + ' 頁，共 2 頁';
        }
        function go(value) { if (tablet.matches) return; page = Math.max(0, Math.min(1, value)); render(); }
        prev.addEventListener('click', function () { go(page - 1); });
        next.addEventListener('click', function () { go(page + 1); });
        dots.forEach(function (dot, index) { dot.addEventListener('click', function () { go(index); }); });
        root.addEventListener('keydown', function (event) {
            if (tablet.matches) return;
            if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
            event.preventDefault();
            var focusedCard = document.activeElement.closest('.Area_push_list > a');
            go(page + (event.key === 'ArrowRight' ? 1 : -1));
            if (focusedCard && focusedCard.inert) dots[page].focus();
        });
        var startX, startY;
        root.addEventListener('touchstart', function (event) { startX = event.touches[0].clientX; startY = event.touches[0].clientY; }, { passive: true });
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
