/**
 * Dynamic Search Placeholder Plugin
 * Zeigt animierte, konfigurierbare Suchvorschläge im Suchfeld an (Plentymarkets-ready)
 * v1.0
 */
(function () {
    // 1. Konfig aus globalem Objekt lesen (wird via Twig/Plenty ins HTML gepusht)
    const config = window.dynamicSearchPlaceholderConfig || {
        searchSelector: 'input[type="search"]',
        wordList: '',
        emptyFocusText: 'Wonach suchen Sie?',
        prefixDesktop: 'Häufig gesucht:',
        breakpointMobile: 768,
        prefixMobile: 'Häufig gesucht:'
    };

    // 2. Variablen vorbereiten
    const searchSelector   = config.searchSelector || 'input[type="search"]';
    const wordList         = (config.wordList || '').split(',').map(w => w.trim()).filter(Boolean);
    const emptyFocusText   = config.emptyFocusText || 'Wonach suchen Sie?';
    const prefixDesktop    = config.prefixDesktop || 'Häufig gesucht:';
    const breakpointMobile = parseInt(config.breakpointMobile, 10) || 768;
    const prefixMobile     = config.prefixMobile || prefixDesktop;

    // 3. Mobile/Desktop-Erkennung
    function isMobile() {
        return window.innerWidth <= breakpointMobile;
    }
    function getPrefix() {
        return isMobile() ? prefixMobile : prefixDesktop;
    }

    // 4. Animation-Logik für Platzhalter
    function startAnimation(input, state) {
        if (!input || !wordList.length) return;
        let index = 0;
        state.running = true;

        function loop() {
            if (!state.running || document.activeElement === input) return;
            const prefix = getPrefix();
            input.setAttribute('placeholder', `${prefix} ${wordList[index]}`);
            index = (index + 1) % wordList.length;
            state.timer = setTimeout(loop, 2000); // Alle 2 Sekunden nächsten Begriff
        }
        loop();
    }

    function stopAnimation(state) {
        state.running = false;
        if (state.timer) clearTimeout(state.timer);
    }

    // 5. Alles initialisieren
    document.addEventListener('DOMContentLoaded', function () {
        const inputs = document.querySelectorAll(searchSelector);
        if (!inputs.length) return;

        inputs.forEach(input => {
            const state = { running: false, timer: null };

            // Initial: Animierter Vorschlag (falls Liste da)
            if (wordList.length) {
                startAnimation(input, state);
            } else {
                input.setAttribute('placeholder', getPrefix());
            }

            // Fokus: Wenn leer, zeige leeren Fokus-Text. Animation stoppen.
            input.addEventListener('focus', function () {
                stopAnimation(state);
                if (!input.value) input.setAttribute('placeholder', emptyFocusText);
            });

            // Eingabe: Placeholder entfernen beim Tippen. Bei "alles gelöscht" = leeren Fokus-Text.
            input.addEventListener('input', function () {
                if (input.value) {
                    input.setAttribute('placeholder', '');
                } else if (document.activeElement === input) {
                    input.setAttribute('placeholder', emptyFocusText);
                }
            });

            // Blur: Animation wieder starten, oder statischen Vorschlag anzeigen.
            input.addEventListener('blur', function () {
                // Kurze Verzögerung, falls Suggest/Dropdown nach dem Blur kommt
                setTimeout(function () {
                    if (wordList.length) {
                        startAnimation(input, state);
                    } else {
                        input.setAttribute('placeholder', getPrefix());
                    }
                }, 100);
            });

            // Bei Window-Resize: Prefix für Placeholder anpassen (nur falls NICHT im Fokus)
            window.addEventListener('resize', function () {
                if (document.activeElement !== input) {
                    if (wordList.length) {
                        // Falls Animation läuft, sofort Prefix anpassen
                        stopAnimation(state);
                        startAnimation(input, state);
                    } else {
                        input.setAttribute('placeholder', getPrefix());
                    }
                }
            });
        });
    });

    // Debug
    window.dynamicSearchPlaceholderDebug = {
        config
    };
})();
