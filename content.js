(function() {
    'use strict';

    /** @type {Map<string, KeyboardEvent>} */
    const pressedKeys = new Map();
    let isShortcutSequenceBroken = false;

    /**
     * Checks if the provided character belongs to a right-to-left (RTL) language.
     * @param {string} char - The character to check.
     * @returns {boolean} Returns true if the character is RTL, otherwise false.
     */
    function isRTL(char) {
        const rtlRange = new RegExp("[" +
            "\u0590-\u05FF" + // Hebrew
            "\u0600-\u06FF" + // Arabic
            "\u0700-\u074F" + // Syriac
            "\u0750-\u077F" + // Arabic Supplement
            "\u0780-\u07BF" + // Thaana
            "\u08A0-\u08FF" + // Arabic Extended-A
            "\uFB1D-\uFDFF" + // Hebrew and Arabic Presentation Forms-A
            "\uFE70-\uFEFF" + // Arabic Presentation Forms-B
            "\u{10E60}-\u{10E7F}" + // Rumi Numeral Symbols
            "\u{1EE00}-\u{1EEFF}" + // Arabic Mathematical Alphabetic Symbols
        "]", "u");
        return rtlRange.test(char);
    }

    /**
     * Sets the text direction and alignment of the given element.
     * @param {HTMLElement} element - The element to modify.
     * @param {string} dir - The text direction ("rtl" or "ltr").
     * @param {boolean} [isManual=false] - Indicates if the change was triggered manually.
     */
    function setDirection(element, dir, isManual = false) {
        element.style.direction = dir;
        const computedStyle = window.getComputedStyle(element);
        const textAlign = computedStyle.getPropertyValue('text-align');
        // If the text alignment is "right" or "left", reset it to "start"
        if (textAlign === "right" || textAlign === "left") {
            element.style.textAlign = "start";
        }
        if (isManual) {
            element.dataset.auto = "false";
        }
    }

    /**
     * Checks if the element is editable.
     * @param {HTMLElement} element - The element to check.
     * @returns {boolean} Returns true if the element is editable, otherwise false.
     */
    function isEditable(element) {
        return element.isContentEditable || element.tagName === "INPUT" || element.tagName === "TEXTAREA";
    }

    /**
     * Determines whether the element is eligible for an automatic text direction change.
     * @param {HTMLElement} element - The element to evaluate.
     * @returns {boolean} Returns true if automatic direction change is allowed, otherwise false.
     */
    function shouldAutoChangeDirection(element) {
        if (element.dataset.auto === "false") {
            return false;
        }
        // Retrieve the page direction from the html and body elements
        const htmlDir = document.documentElement.getAttribute("dir") || window.getComputedStyle(document.documentElement).direction;
        const bodyDir = document.body.getAttribute("dir") || window.getComputedStyle(document.body).direction;
        const textAlign = window.getComputedStyle(element).getPropertyValue('text-align');
        // Allow automatic direction change if the page direction is not RTL or if the text alignment is not "right"
        return (htmlDir !== "rtl" && bodyDir !== "rtl") || textAlign !== "right";
    }

    /**
     * Extracts the text content or value from the element.
     * @param {HTMLElement} element - The element from which to extract the value.
     * @returns {string} The text content or the element's value.
     */
    function getValue(element) {
        if (element.contentEditable === "true") {
            return element.textContent;
        }
        return element.value;
    }

    /**
     * Handles the keydown event to track the pressed keys.
     * @param {KeyboardEvent} event - The keydown event.
     */
    function handleKeydown(event) {
        if (pressedKeys.size === 0) {
            isShortcutSequenceBroken = false;
        }
        if (!pressedKeys.has(event.code)) {
            pressedKeys.set(event.code, event);
        }
    }

    /**
     * Handles the keyup event to allow manual switching using keyboard shortcuts.
     * @param {KeyboardEvent} event - The keyup event.
     */
    function handleKeyup(event) {
        // Copy the current pressed keys before removing the released key
        const currentPressedKeys = Array.from(pressedKeys.values());
        pressedKeys.delete(event.code);

        // If the exact number of pressed keys is not 2, or if the released key is neither "Control" nor "Shift", consider the sequence broken.
        if (currentPressedKeys.length !== 2 || (event.key !== 'Control' && event.key !== 'Shift')) {
            isShortcutSequenceBroken = true;
        }

        if (isShortcutSequenceBroken) {
            return;
        }

        const element = event.target;
        if (!isEditable(element)) {
            return;
        }

        // Retrieve the last key event in the sequence
        const lastKeyEvent = currentPressedKeys[1];
        if (!lastKeyEvent) return;

        // Manual switching: Check if (Control + Shift) is pressed along with an arrow key (Right or Left) using event.code.
        if (lastKeyEvent.ctrlKey && lastKeyEvent.shiftKey) {
            if (lastKeyEvent.code.endsWith("Right")) {
                setDirection(element, "rtl", true);
            } else if (lastKeyEvent.code.endsWith("Left")) {
                setDirection(element, "ltr", true);
            }
        }
    }

    /**
     * Handles the input event to automatically change the text direction.
     * @param {InputEvent} event - The input event.
     */
    function handleInput(event) {
        const element = event.target;
        if (!isEditable(element) || element.type === 'password') {
            return;
        }
        const value = getValue(element);
        if (value === "") {
            element.dataset.auto = "true";
        } else if (shouldAutoChangeDirection(element)) {
            // Search for the first character that belongs to the \p{L} category (i.e., any letter)
            const match = value.match(/\p{L}/u);
            if (match) {
                const char = match[0];
                if (isRTL(char)) {
                    setDirection(element, "rtl");
                } else {
                    setDirection(element, "ltr");
                }
            }
        }
    }

    /**
     * Resets the state of pressed keys when focus changes.
     * @param {FocusEvent} event - The focus change event.
     */
    function handleFocus(event) {
        pressedKeys.clear();
    }

    // Add event listeners with capturing enabled (true) so they are triggered before other event handlers.
    document.addEventListener("keydown", handleKeydown, true);
    document.addEventListener("keyup", handleKeyup, true);
    document.addEventListener("input", handleInput, true);
    window.addEventListener("focus", handleFocus, true);
})();
