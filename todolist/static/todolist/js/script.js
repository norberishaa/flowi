const cursorDot = document.querySelector("[data-cursor-dot]");
const cursorOutline = document.querySelector("[data-cursor-outline]");

function setCursorPosition(x, y) {
    cursorDot.style.left = `${x}px`;
    cursorDot.style.top = `${y}px`;
    cursorOutline.style.left = `${x}px`;
    cursorOutline.style.top = `${y}px`;
}

const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

if (isTouchDevice) {
    cursorDot.style.display = 'none';
    cursorOutline.style.display = 'none';
} else {
    window.addEventListener("load", () => {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        setCursorPosition(centerX, centerY);
    });

    function getBrightness(rgb) {
        const result = rgb.match(/\d+/g);
        if (!result || result.length < 3) return 255; // fallback for non-rgb elements
        const [r, g, b] = result.map(Number);
        return (r * 299 + g * 587 + b * 114) / 1000;
    }

    window.addEventListener("mousemove", function (e) {
        const posX = e.clientX;
        const posY = e.clientY;

        cursorDot.style.left = `${posX}px`;
        cursorDot.style.top = `${posY}px`;

        cursorOutline.animate(
            [
                { left: `${posX}px`, top: `${posY}px` }
            ],
            { duration: 100, fill: "forwards" }
        );

        const elementUnderCursor = document.elementFromPoint(posX, posY);
        let brightness = 255;

        if (elementUnderCursor) {
            if (elementUnderCursor.tagName === "IMG") {
                const img = elementUnderCursor;
                const canvas = document.createElement("canvas");
                const context = canvas.getContext("2d");

                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;

                try {
                    context.drawImage(img, 0, 0);

                    const rect = img.getBoundingClientRect();
                    const scaleX = img.naturalWidth / rect.width;
                    const scaleY = img.naturalHeight / rect.height;

                    const imgX = Math.floor((e.clientX - rect.left) * scaleX);
                    const imgY = Math.floor((e.clientY - rect.top) * scaleY);

                    const pixel = context.getImageData(imgX, imgY, 1, 1).data;
                    brightness = (pixel[0] * 299 + pixel[1] * 587 + pixel[2] * 114) / 1000;
                } catch {
                    // Fallback if CORS or drawImage fails
                    brightness = 255;
                }
            } else {
                const bgColor = window.getComputedStyle(elementUnderCursor).backgroundColor;
                brightness = getBrightness(bgColor);
            }

            if (brightness < 128) {
                cursorDot.style.backgroundColor = "#ffcc00";
                cursorOutline.style.borderColor = "rgba(255, 204, 0, 0.5)";
            } else {
                cursorDot.style.backgroundColor = "black";
                cursorOutline.style.borderColor = "rgba(0, 0, 0, 0.5)";
            }
        }
    });

    window.addEventListener("mousedown", () => {
        cursorDot.classList.add("clicked");
    });

    window.addEventListener("mouseup", () => {
        cursorDot.classList.remove("clicked");
    });
}

document.addEventListener("DOMContentLoaded", function () {
    const typedTarget = document.querySelector(".autotype");

    if (typedTarget) {
        new Typed(".autotype", {
            strings: ["Effectiveness", "Clarity", "Focus", "Results"],
            typeSpeed: 70,
            backSpeed: 30,
            backDelay: 3000,
            loop: true,
            showCursor: true,
            cursorChar: '|'
        });
    }
});
