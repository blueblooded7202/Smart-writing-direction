(function() {
    'use strict';

    /** @type {Map<string, KeyboardEvent>} */
    const pressedKeys = new Map();
    let isShortcutSequenceBroken = false;

    /**
     * تتحقق مما إذا كان الحرف المُمرر ينتمي إلى لغة تُكتب من اليمين إلى اليسار.
     * @param {string} char - الحرف المراد التحقق منه.
     * @returns {boolean} true إذا كان الحرف RTL، false خلاف ذلك.
     */
    function isRTL(char) {
        const rtlRange = new RegExp("[" +
            "\u0590-\u05FF" + // العبرية
            "\u0600-\u06FF" + // العربية
            "\u0700-\u074F" + // السريانية
            "\u0750-\u077F" + // المكمل العربي
            "\u0780-\u07BF" + // التانا
            "\u08A0-\u08FF" + // العربية الموسعة-A
            "\uFB1D-\uFDFF" + // أشكال تقديمية للعبري والعربية-A
            "\uFE70-\uFEFF" + // أشكال تقديمية للعربية-B
            "\u{10E60}-\u{10E7F}" + // رموز أرقام رومي
            "\u{1EE00}-\u{1EEFF}" + // رموز رياضية عربية
        "]", "u");
        return rtlRange.test(char);
    }

    /**
     * يقوم بتعيين اتجاه النص ومحاذاة العنصر.
     * @param {HTMLElement} element - العنصر المُراد تغييره.
     * @param {string} dir - اتجاه النص ("rtl" أو "ltr").
     * @param {boolean} [isManual=false] - تحدد إذا كان التغيير نتيجة تدخل يدوي.
     */
    function setDirection(element, dir, isManual = false) {
        element.style.direction = dir;
        const computedStyle = window.getComputedStyle(element);
        const textAlign = computedStyle.getPropertyValue('text-align');
        // في حال كانت المحاذاة "right" أو "left" يتم إعادة تعيينها إلى "start"
        if (textAlign === "right" || textAlign === "left") {
            element.style.textAlign = "start";
        }
        if (isManual) {
            element.dataset.auto = "false";
        }
    }

    /**
     * تتحقق مما إذا كان العنصر قابلاً للتعديل.
     * @param {HTMLElement} element - العنصر المُراد التحقق منه.
     * @returns {boolean} true إذا كان قابلاً للتعديل، false خلاف ذلك.
     */
    function isEditable(element) {
        return element.isContentEditable || element.tagName === "INPUT" || element.tagName === "TEXTAREA";
    }

    /**
     * يحدد ما إذا كان يجب تغيير اتجاه النص تلقائيًا للعنصر.
     * @param {HTMLElement} element - العنصر المُراد فحصه.
     * @returns {boolean} true إذا كان التغيير التلقائي مسموحًا، false خلاف ذلك.
     */
    function shouldAutoChangeDirection(element) {
        if (element.dataset.auto === "false") {
            return false;
        }
        // الحصول على اتجاه الصفحة من عناصر html و body
        const htmlDir = document.documentElement.getAttribute("dir") || window.getComputedStyle(document.documentElement).direction;
        const bodyDir = document.body.getAttribute("dir") || window.getComputedStyle(document.body).direction;
        const textAlign = window.getComputedStyle(element).getPropertyValue('text-align');
        // السماح بتغيير الاتجاه تلقائيًا إذا لم يكن اتجاه الصفحة RTL أو إذا لم تكن المحاذاة "right"
        return (htmlDir !== "rtl" && bodyDir !== "rtl") || textAlign !== "right";
    }

    /**
     * يستخرج القيمة النصية من العنصر.
     * @param {HTMLElement} element - العنصر المُراد استخراج القيمة منه.
     * @returns {string} محتوى النص أو قيمة العنصر.
     */
    function getValue(element) {
        if (element.contentEditable === "true") {
            return element.textContent;
        }
        return element.value;
    }

    /**
     * يعالج حدث keydown لتتبع المفاتيح المضغوطة.
     * @param {KeyboardEvent} event - حدث ضغط المفتاح.
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
     * يعالج حدث keyup للتبديل اليدوي باستخدام اختصارات لوحة المفاتيح.
     * @param {KeyboardEvent} event - حدث رفع المفتاح.
     */
    function handleKeyup(event) {
        // ننسخ المفاتيح المضغوطة قبل الإزالة
        const currentPressedKeys = Array.from(pressedKeys.values());
        pressedKeys.delete(event.code);

        // إذا لم يكن العدد الدقيق للمفاتيح المضغوطة هو 2 أو إذا لم يكن المفتاح المُحرر "Control" أو "Shift"، نعتبر التسلسل مكسورًا.
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

        // الحصول على آخر مفتاح تم ضغطه ضمن التسلسل
        const lastKeyEvent = currentPressedKeys[1];
        if (!lastKeyEvent) return;

        // التبديل اليدوي: التحقق من ضغط (Control + Shift) مع معرفة جهة المفتاح (Right أو Left) باستخدام event.code.
        if (lastKeyEvent.ctrlKey && lastKeyEvent.shiftKey) {
            if (lastKeyEvent.code.endsWith("Right")) {
                setDirection(element, "rtl", true);
            } else if (lastKeyEvent.code.endsWith("Left")) {
                setDirection(element, "ltr", true);
            }
        }
    }

    /**
     * يعالج حدث الإدخال لتغيير اتجاه النص تلقائيًا.
     * @param {InputEvent} event - حدث الإدخال.
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
            // البحث عن أول حرف ينتمي للفئة \p{L} (أي حرف)
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
     * يعيد ضبط حالة المفاتيح عند تغير التركيز.
     * @param {FocusEvent} event - حدث تغيير التركيز.
     */
    function handleFocus(event) {
        pressedKeys.clear();
    }

    // إضافة مستمعي الأحداث مع استخدام "true" للالتقاط قبل الأحداث الأخرى
    document.addEventListener("keydown", handleKeydown, true);
    document.addEventListener("keyup", handleKeyup, true);
    document.addEventListener("input", handleInput, true);
    window.addEventListener("focus", handleFocus, true);
})();
