/**
 * @type {HTMLDivElement}
 */
var paletteContainer = document.querySelector('#palette-container');

/**
 * @type {HTMLButtonElement}
 */
var addColorButton = document.querySelector('#add-color-button');

/**
 * @type {HTMLInputElement}
 */
var noneColorBlindnessRadio = document.querySelector('#none-color-blindness-radio');

/**
 * @type {Array<HTMLDivElement>}
 */
var paletteColors = [];

function setColorBlindMode(colorBlindMode) {
    paletteContainer.classList.remove('deuteranopia');
    paletteContainer.classList.remove('protanopia');
    paletteContainer.classList.remove('tritanopia');
    paletteContainer.classList.add(colorBlindMode);
}

function removeColorBlindMode() {
    paletteContainer.classList.remove('deuteranopia');
    paletteContainer.classList.remove('protanopia');
    paletteContainer.classList.remove('tritanopia');
}

function addColor() {
    var colorContainer = document.createElement('div');
    colorContainer.classList.add('palette-color', 'border-black', 'padding-small');

    var exampleContainer = document.createElement('div');
    exampleContainer.classList.add('palette-example');

    var colorTypeContainer = document.createElement('div');
    var hexLabel = document.createElement('label');
    var hslLabel = document.createElement('label');
    var rgbLabel = document.createElement('label');

    var hexRadio = document.createElement('input');
    hexRadio.type = 'radio';
    hexRadio.name = `colorType${paletteColors.length}`;
    hexRadio.checked = true;
    hex = true;
    hexRadio.onchange = () => {
        var newValue;
        if (colorContainer.contains(hslColorInputContainer)) {
            if (hslHueInput.value && hslSaturationInput.value && hslLightnessInput.value) {
                var rgbObject = hslToRgb(parseInt(hslHueInput.value), parseInt(hslSaturationInput.value), parseInt(hslLightnessInput.value));
                newValue = rgbToHex(rgbObject.r, rgbObject.g, rgbObject.b);
            }
            colorContainer.removeChild(hslColorInputContainer);
        }
        if (colorContainer.contains(rgbColorInputContainer)) {
            if (rgbRedInput.value && rgbGreenInput.value && rgbBlueInput.value) {
                newValue = rgbToHex(parseInt(rgbRedInput.value), parseInt(rgbGreenInput.value), parseInt(rgbBlueInput.value));
            }
            colorContainer.removeChild(rgbColorInputContainer);
        }
        colorContainer.insertBefore(hexColorInput, colorRemoveButton);

        if (newValue) {
            hexColorInput.value = newValue;
            exampleContainer.style.backgroundColor = '';
            exampleContainer.style.backgroundColor = hexColorInput.value;
        }
    };

    var hexColorInput = document.createElement('input');
    hexColorInput.classList.add('fullWidth');
    hexColorInput.placeholder = 'Enter color value here (eg: #009900)';
    hexColorInput.maxLength = 7;
    hexColorInput.onkeydown = () => {
        exampleContainer.style.backgroundColor = '';
    };

    hexColorInput.onkeyup = () => {
        if (hexColorInput.value && hexColorInput.value.length === 7) {
            exampleContainer.style.backgroundColor = hexColorInput.value;
        }
    };

    var hslRadio = document.createElement('input');
    hslRadio.type = 'radio';
    hslRadio.name = `colorType${paletteColors.length}`;
    hslRadio.onchange = () => {
        var hslObject;

        if (colorContainer.contains(hexColorInput)) {
            if (hexColorInput.value) {
                var rgbObject = hexToRgb(hexColorInput.value);
                hslObject = rgbToHsl(rgbObject.r, rgbObject.g, rgbObject.b);
            }
            colorContainer.removeChild(hexColorInput);
        }
        if (colorContainer.contains(rgbColorInputContainer)) {
            if (rgbRedInput.value && rgbGreenInput.value && rgbBlueInput.value) {
                hslObject = rgbToHsl(parseInt(rgbRedInput.value), parseInt(rgbGreenInput.value), parseInt(rgbBlueInput.value));
            }
            colorContainer.removeChild(rgbColorInputContainer);
        }
        colorContainer.insertBefore(hslColorInputContainer, colorRemoveButton);
        if (hslObject) {
            hslHueInput.value = hslObject.h;
            hslSaturationInput.value = hslObject.s;
            hslLightnessInput.value = hslObject.l;
        }
    };

    var hslColorInputContainer = document.createElement('div');
    hslColorInputContainer.classList.add('display-flex');

    var hslHueInput = document.createElement('input');
    hslHueInput.classList.add('fullWidth');
    hslHueInput.placeholder = 'Hue';
    hslHueInput.type = 'number';
    hslHueInput.max = '360';
    hslHueInput.onkeyup = () => {
        exampleContainer.style.backgroundColor = '';
        exampleContainer.style.backgroundColor = `hsl(${hslHueInput.value}, ${hslSaturationInput.value}%, ${hslLightnessInput.value}%)`;
    };

    var hslSaturationInput = document.createElement('input');
    hslSaturationInput.classList.add('fullWidth');
    hslSaturationInput.placeholder = 'Saturation';
    hslSaturationInput.type = 'number';
    hslSaturationInput.max = '100';
    hslSaturationInput.onkeyup = () => {
        exampleContainer.style.backgroundColor = '';
        exampleContainer.style.backgroundColor = `hsl(${hslHueInput.value}, ${hslSaturationInput.value}%, ${hslLightnessInput.value}%)`;
    };

    var hslLightnessInput = document.createElement('input');
    hslLightnessInput.classList.add('fullWidth');
    hslLightnessInput.placeholder = 'Lightness';
    hslLightnessInput.type = 'number';
    hslLightnessInput.max = '100';
    hslLightnessInput.onkeyup = () => {
        exampleContainer.style.backgroundColor = '';
        exampleContainer.style.backgroundColor = `hsl(${hslHueInput.value}, ${hslSaturationInput.value}%, ${hslLightnessInput.value}%)`;
    };

    hslColorInputContainer.appendChild(hslHueInput);
    hslColorInputContainer.appendChild(hslSaturationInput);
    hslColorInputContainer.appendChild(hslLightnessInput);

    var rgbRadio = document.createElement('input');
    rgbRadio.type = 'radio';
    rgbRadio.name = `colorType${paletteColors.length}`;
    rgbRadio.onchange = () => {
        var rgbObject;
        if (colorContainer.contains(hexColorInput)) {
            if (hexColorInput.value) {
                rgbObject = hexToRgb(hexColorInput.value);
            }
            colorContainer.removeChild(hexColorInput);
        }
        if (colorContainer.contains(hslColorInputContainer)) {
            if (hslHueInput.value && hslSaturationInput.value && hslLightnessInput.value) {
                rgbObject = hslToRgb(parseInt(hslHueInput.value), parseInt(hslSaturationInput.value), parseInt(hslLightnessInput.value));
            }
            colorContainer.removeChild(hslColorInputContainer);
        }
        colorContainer.insertBefore(rgbColorInputContainer, colorRemoveButton);
        if (rgbObject) {
            rgbRedInput.value = rgbObject.r;
            rgbGreenInput.value = rgbObject.g;
            rgbBlueInput.value = rgbObject.b;
        }
    };

    var rgbColorInputContainer = document.createElement('div');
    rgbColorInputContainer.classList.add('display-flex');

    var rgbRedInput = document.createElement('input');
    rgbRedInput.classList.add('fullWidth');
    rgbRedInput.placeholder = 'Red';
    rgbRedInput.type = 'number';
    rgbRedInput.max = '255';
    rgbRedInput.onkeyup = () => {
        exampleContainer.style.backgroundColor = '';
        exampleContainer.style.backgroundColor = `rgb(${rgbRedInput.value}, ${rgbGreenInput.value}, ${rgbBlueInput.value})`;
    };

    var rgbGreenInput = document.createElement('input');
    rgbGreenInput.classList.add('fullWidth');
    rgbGreenInput.placeholder = 'Green';
    rgbGreenInput.type = 'number';
    rgbGreenInput.max = '255';
    rgbGreenInput.onkeyup = () => {
        exampleContainer.style.backgroundColor = '';
        exampleContainer.style.backgroundColor = `rgb(${rgbRedInput.value}, ${rgbGreenInput.value}, ${rgbBlueInput.value})`;
    };

    var rgbBlueInput = document.createElement('input');
    rgbBlueInput.classList.add('fullWidth');
    rgbBlueInput.placeholder = 'Blue';
    rgbBlueInput.type = 'number';
    rgbBlueInput.max = '255';
    rgbBlueInput.onkeyup = () => {
        exampleContainer.style.backgroundColor = '';
        exampleContainer.style.backgroundColor = `rgb(${rgbRedInput.value}, ${rgbGreenInput.value}, ${rgbBlueInput.value})`;
    };

    rgbColorInputContainer.appendChild(rgbRedInput);
    rgbColorInputContainer.appendChild(rgbGreenInput);
    rgbColorInputContainer.appendChild(rgbBlueInput);

    var colorRemoveButton = document.createElement('button');
    colorRemoveButton.appendChild(document.createTextNode('Remove'));
    colorRemoveButton.onclick = () => {
        paletteContainer.removeChild(colorContainer);
        paletteColors.splice(paletteColors.indexOf(colorContainer), 1);
    };
    colorRemoveButton.classList.add('fullWidth');

    hexLabel.appendChild(hexRadio);
    hexLabel.appendChild(document.createTextNode('Hex'));

    hslLabel.appendChild(hslRadio);
    hslLabel.appendChild(document.createTextNode('Hsl'));

    rgbLabel.appendChild(rgbRadio);
    rgbLabel.appendChild(document.createTextNode('Rgb'));

    colorTypeContainer.appendChild(hexLabel);
    colorTypeContainer.appendChild(hslLabel);
    colorTypeContainer.appendChild(rgbLabel);

    colorContainer.appendChild(exampleContainer);
    colorContainer.appendChild(colorTypeContainer);
    colorContainer.appendChild(hexColorInput);
    colorContainer.appendChild(colorRemoveButton);

    paletteContainer.insertBefore(colorContainer, addColorButton);
    paletteColors.push(colorContainer);
}

function toHex(n) {
    var hex = n.toString(16);
    while (hex.length < 2) { hex = "0" + hex; }
    return hex;
}

function rgbToHex(r, g, b) {
    return "#" + toHex(r) + toHex(g) + toHex(b);
}

function hexToRgb(hex) {
    var arr = [];
    hex = hex.replace("#", "");
    if (hex.length == 3) {
        hex = hex.substr(0, 1) + hex.substr(0, 1) + hex.substr(1, 1) + hex.substr(1, 1) + hex.substr(2, 1) + hex.substr(2, 1);
    }

    arr[0] = parseInt(hex.substr(0, 2), 16);
    arr[1] = parseInt(hex.substr(2, 2), 16);
    arr[2] = parseInt(hex.substr(4, 2), 16);

    return {
        r: arr[0],
        g: arr[1],
        b: arr[2]
    };
}

function hslToRgb(hue, sat, light) {
    sat /= 100;
    light /= 100;
    var t1, t2, r, g, b;
    hue = hue / 60;
    if (light <= 0.5) {
        t2 = light * (sat + 1);
    } else {
        t2 = light + sat - (light * sat);
    }
    t1 = light * 2 - t2;

    r = hueToRgb(t1, t2, hue + 2) * 255;
    g = hueToRgb(t1, t2, hue) * 255;
    b = hueToRgb(t1, t2, hue - 2) * 255;

    return {
        r: Math.round(r),
        g: Math.round(g),
        b: Math.round(b)
    };
}

function hueToRgb(t1, t2, hue) {
    if (hue < 0) hue += 6;
    if (hue >= 6) hue -= 6;
    if (hue < 1) return (t2 - t1) * hue + t1;
    else if (hue < 3) return t2;
    else if (hue < 4) return (t2 - t1) * (4 - hue) + t1;
    else return t1;
}

function rgbToHsl(r, g, b) {
    var min, max, i, l, s, maxcolor, h, rgb = [];
    rgb[0] = r / 255;
    rgb[1] = g / 255;
    rgb[2] = b / 255;
    min = rgb[0];
    max = rgb[0];
    maxcolor = 0;

    for (i = 0; i < rgb.length - 1; i++) {
        if (rgb[i + 1] <= min) { min = rgb[i + 1]; }
        if (rgb[i + 1] >= max) { max = rgb[i + 1]; maxcolor = i + 1; }
    }

    if (maxcolor == 0) {
        h = (rgb[1] - rgb[2]) / (max - min);
    }
    if (maxcolor == 1) {
        h = 2 + (rgb[2] - rgb[0]) / (max - min);
    }
    if (maxcolor == 2) {
        h = 4 + (rgb[0] - rgb[1]) / (max - min);
    }

    if (isNaN(h)) { h = 0; }
    h = h * 60;
    if (h < 0) { h = h + 360; }
    l = (min + max) / 2;

    if (min == max) {
        s = 0;
    } else {
        if (l < 0.5) {
            s = (max - min) / (max + min);
        } else {
            s = (max - min) / (2 - max - min);
        }
    }

    s = s;
    return {
        h: Math.round(h),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };
}

noneColorBlindnessRadio.checked = true;