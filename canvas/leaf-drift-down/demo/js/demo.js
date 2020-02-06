const NUMBER_OF_LEAVES = 30;

function init() {
    var container = document.getElementById('leafContainer');
    for (var i = 0; i < NUMBER_OF_LEAVES; i++) {
        container.appendChild(createALeaf());
    }
}

function randomInteger(low, high) {
    return low + Math.floor(Math.random() * (high - low));
}

function randomFloat(low, high) {
    return low + Math.random() * (high - low);
}

function pixelValue(value) {
    return value + 'px';
}

function durationValue(value) {
    return value + 's';
}

function createALeaf() {
    var leafDiv = document.createElement('div');
    leafDiv.style.top = "-100px";
    leafDiv.style.left = pixelValue(randomInteger(0, 500));
    leafDiv.style.webkitAnimationName = 'fade, drop';
    var fadeAndDropDuration = durationValue(randomFloat(5, 11));
    leafDiv.style.webkitAnimationDuration = fadeAndDropDuration + ', ' + fadeAndDropDuration;
    var leafDelay = durationValue(randomFloat(0, 5));
    leafDiv.style.webkitAnimationDelay = leafDelay + ', ' + leafDelay;

    var image = document.createElement('img');
    image.src = './test.png';
    var spinAnimationName = (Math.random() < 0.5) ? 'clockwiseSpin' : 'counterclockwiseSpinAndFlip';
    image.style.webkitAnimationName = spinAnimationName;
    var spinDuration = durationValue(randomFloat(4, 8));
    image.style.webkitAnimationDuration = spinDuration;

    leafDiv.appendChild(image);
    return leafDiv;
}

window.addEventListener('load', init, false);
