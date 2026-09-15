(function () {
    function renderQrCodes() {
        if (typeof QRCode === 'undefined') {
            return;
        }
        document.querySelectorAll('div.qr[data-url]').forEach((el) => {
            if (el.dataset.qrRendered === 'true') {
                return;
            }
            const url = (el.getAttribute('data-url') || '').trim();
            if (!url) {
                return;
            }
            el.innerHTML = '';
            new QRCode(el, {
                text: url,
                width: 200,
                height: 200,
                colorDark: '#000000',
                colorLight: '#ffffff',
                correctLevel: QRCode.CorrectLevel.L,
            });
            el.dataset.qrRendered = 'true';
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', renderQrCodes, { once: true });
    } else {
        renderQrCodes();
    }

    if (typeof Reveal !== 'undefined' && typeof Reveal.addEventListener === 'function') {
        Reveal.addEventListener('ready', renderQrCodes);
        Reveal.addEventListener('slidechanged', renderQrCodes);
    }
})();
