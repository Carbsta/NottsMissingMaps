/*jslint browser: true*/
/*global  $*/
/*global  document*/


// Add animation to cards
function structureCard(roundedBox) {
    'use strict';

    var expand = document.createElement('h2'),
        collapse = document.createElement('h2');

    $(collapse).hide();

    roundedBox.appendChild(expand);
    roundedBox.appendChild(collapse);

    expand.appendChild(document.createTextNode('▼ Expand for more info ▼'));
    collapse.appendChild(document.createTextNode('▲ Collapse for less info ▲'));

    return;
}

// Populate cards with information
function populateCard(roundedBox, roundedBoxMain, i) {
    'use strict';
    
    var downloadLink = document.createElement('a'),
        downloadIcon = document.createElement('img'),
        aerialImg = document.createElement('img'),
        imgName = document.createElement('h3'),
        imgSize = document.createElement('h4');
    
    downloadLink.setAttribute('href', 'downloadpage');
    downloadLink.setAttribute('target', '_blank');
    
    downloadIcon.setAttribute('src', 'icons/download.png');
    downloadIcon.setAttribute('alt', 'Click to Download');
    downloadIcon.className = 'icon';
    
    aerialImg.setAttribute('src', 'images/Aerial' + (i + 1) + '.png');
    aerialImg.setAttribute('alt', 'Aerial Image' + (i + 1));
    aerialImg.className = 'aerialImg';
    
    
    
    downloadLink.appendChild(downloadIcon);
    roundedBoxMain.appendChild(downloadLink);
    roundedBoxMain.appendChild(aerialImg);
    roundedBoxMain.appendChild(imgName);
    roundedBoxMain.appendChild(imgSize);
    // Placeholder values
    imgName.appendChild(document.createTextNode('Aerial' + (i + 1) + '.png'));
    imgSize.appendChild(document.createTextNode('2.06 MB'));
    
    return;
}

// Generate cards for images
function generateCard() {
    'use strict';
    
    var numImages = 12,
        i,
        wrapper,
        roundedBox,
        roundedBoxMain;

    for (i = 0; i < numImages; i += 1) {

        wrapper = document.createElement('div');
        roundedBox = document.createElement('div');
        roundedBoxMain = document.createElement('div');

        wrapper.className = 'wrapper';
        roundedBox.className = 'roundedBox';
        roundedBoxMain.className = 'roundedBoxMain';

        document.getElementById('mainWrapper').appendChild(wrapper);
        wrapper.appendChild(roundedBox);
        roundedBox.appendChild(roundedBoxMain);

        structureCard(roundedBox);
        populateCard(roundedBox, roundedBoxMain, i);
    }
}

// MAIN /////////////////////////////////////////////////////
$(function () {
    'use strict';
    
    generateCard();
});


        

    