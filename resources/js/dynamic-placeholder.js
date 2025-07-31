/**
 * Dynamic Search Placeholder Plugin
 * Zeigt dynamische Suchvorschläge im Suchfeld an und nutzt die Plugin-Konfiguration
 */

(function () {
    // ==== 1. Konfigurationswerte aus dem Plenty-Plugin laden ====
    // Die Werte werden über die Template Engine in den Browser "geschoben".
    // Fallback auf Default-Werte, falls kein Plenty-Config-Objekt gefunden wird.
    const config = window.dynamicSearchPlaceholderConfig || {
        searchSelector: 'input[type="search"]',
        wordList: '',
        emptyFocusText: 'Wonach suchen Sie?',
        prefixDesktop: 'Häufig gesucht:',
        breakpointMobile: 768,
        prefixMobile: 'Häufig gesucht:'
    };

    // ==== 2. Konfiguration für Nutzer-Logik vorbereiten ====
    const searchSelector = config.searchSelector || 'input[type="search"]';
    const wordList = (config.wordList || '').split(',').map(w => w.trim()).filter(Boolean);
    const emptyFocusText = config.emptyFocusText || 'Wonach suchen Sie?';
    const prefixDesktop = config.prefixDesktop || 'Häufig gesucht:';
    const breakpointMobile = parseInt(config.breakpointMobile, 10) || 768;
    const prefixMobile = config.prefixMobile || prefixDesktop;

    // ==== 3. Hilfsfunktion: Mobil/Desktop unterscheiden ====
    function isMobile() {
        return window.innerWidth <= breakpointMobile;
    }

    // ==== 4. Funktion: Vorschläge als Platzhalter anzeigen ====
    function showDynamicPlaceholder(input) {
        if (!input) return;
        let prefix = isMobile() ? prefixMobile : prefixDesktop;
        // Zeige einen zufälligen Begriff aus der Liste (optional: rotierend, z.B. alle 3s)
        if (wordList.length > 0) {
            const randomWord = wordList[Math.floor(Math.random() * wordList.length)];
            input.setAttribute('placeholder', `${prefix} ${randomWord}`);
        } else {
            input.setAttribute('placeholder', prefix);
        }
    }

    // ==== 5. Funktion: Standard-Placeholder bei leerem Feld im Fokus ====
    function showEmptyFocusPlaceholder(input) {
        if (!input) return;
        input.setAttribute('placeholder', emptyFocusText);
    }

    // ==== 6. Event-Logik für das Suchfeld ====
    document.addEventListener('DOMContentLoaded', function () {
        const inputs = document.querySelectorAll(searchSelector);

        inputs.forEach(input => {
            let hasTyped = false;

            // Setze Initial-Placeholder
            showDynamicPlaceholder(input);

            // Bei Fokus, aber wenn Feld leer: "Wonach suchen Sie?"
            input.addEventListener('focus', function () {
                if (!input.value) {
                    showEmptyFocusPlaceholder(input);
                }
            });

            // Sobald User tippt: Standard-Placeholder entfernen
            input.addEventListener('input', function () {
                hasTyped = !!input.value;
                if (hasTyped) {
                    input.setAttribute('placeholder', '');
                } else {
                    // Wenn gelöscht: wieder leeren Placeholder zeigen
                    showEmptyFocusPlaceholder(input);
                }
            });

            // Bei Verlassen des Felds wieder Dynamik starten
            input.addEventListener('blur', function () {
                showDynamicPlaceholder(input);
            });

            // Responsive: Bei Resize das Prefix anpassen
            window.addEventListener('resize', function () {
                if (document.activeElement !== input) {
                    showDynamicPlaceholder(input);
                }
            });
        });
    });

    // Optional: globales Config-Objekt für Debug
    window.dynamicSearchPlaceholderDebug = {
        config,
        showDynamicPlaceholder,
        showEmptyFocusPlaceholder
    };

})();

