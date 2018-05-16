var labels;


// SELECTION LISTENER
var select = document.getElementById("selection");

select.onchange = function(event) {
    loadData(event.target.value);
    //console.log("Loaded " + celebrities.length + " celebrities")
    console.log("Loaded " + labels.length + " labels")
    cleanChild(video);
    let source = document.createElement("source");
    //source.setAttribute("src", "file:///home/daniele/Downloads/XPeppers/DeepLens/" + event.target.value + ".mp4");
    source.setAttribute("src", "https://s3.eu-west-1.amazonaws.com/rekognition-video-demo/" + event.target.value + ".mp4");
    source.setAttribute("type", "video/mp4");
    source.setAttribute("class", "toClean");
    video.appendChild(source);
    video.load();
}

// VIDEO LISTENER
var video = document.getElementById("video");

video.ontimeupdate = function() {
    let timestamp = getVideoTimestamp();
    let frameLabels = getLabelsFor(timestamp);
    displayLabels(frameLabels);
    let frameCelebrities = getCelebritiesFor(timestamp);
    displayCelebrities(frameCelebrities);
};

// CELEBRITIES
function getCelebritiesFor(timestamp) {
    let selectedCelebrities = new Array();
    celebrities.forEach(function(celebrity) {
        if (celebrity.timestamp > timestamp && celebrity.timestamp < (timestamp + 200)) {
            selectedCelebrities.push(celebrity);
        }
    });
    return  selectedCelebrities;
}

function displayCelebrities(frameCelebrities) {
    let overlay = document.getElementById("video-container");
    cleanChild(overlay);
    frameCelebrities.forEach(function(item) {
        let celebrity = item.celebrity;
        let name = celebrity.name;
        let bb = celebrity.face && celebrity.face.boundingBox ? celebrity.face.boundingBox : celebrity.boundingBox;
        //let bb = celebrity.face && celebrity.face.boundingBox ? celebrity.face.boundingBox : null;
        let pose = celebrity.face && celebrity.face.pose ? celebrity.face.pose : null;
        if (bb == null) {
            //console.log(name + " - " + item.timestamp);
        } else {
            let div = document.createElement("div");
            div.style = convertBoundingBoxToCSS(bb, pose);
            div.className = "overlay-celebrity toClean";
            div.innerText = celebrity.name;
            overlay.appendChild(div);
        }
    });
}

// LABELS
function getLabelsFor(timestamp) {
    let selectedLabels = new Array();
    labels.forEach(function(label) {
        if (label.timestamp > timestamp && label.timestamp < (timestamp + 400)) {
            selectedLabels.push(label);
        }
    });
    return selectedLabels;
}

function displayLabels(frameLabels) {
    var overlay = document.getElementById("overlay-labels");
    var items = new Array();
    frameLabels.forEach(function(item) {
        items.push(item.label.name);
    });
    overlay.textContent = unique(items);
}

// UTILS
function getVideoTimestamp() {
    let timestamp = video.currentTime * 1000;
    return timestamp;
}

function convertBoundingBoxToCSS(bb, pose) {
    let style = "top: " + bb.top*100 + "%; left: " + bb.left*100 + "%; width: " + bb.width*100 + "%; height: " + bb.height*100 + "%;";
    if (pose) {
        style += " transform: rotateZ(" + pose.roll + "deg);";
    }
    return style;
}

function loadData(movie) {
    let container = document.getElementById("selection-container");
    cleanChild(container);
    addScript(container, "data/" + movie + "-celebrities.json");
    addScript(container, "data/" + movie + "-faces.json");
    addScript(container, "data/" + movie + "-labels.json");
    addScript(container, "data/" + movie + "-persons.json");
}

function addScript(container, path) {
    let script = document.createElement("script");
    script.type = "text/javascript";
    script.src = path;
    script.className = "toClean";
    container.appendChild(script);
}

function cleanChild(parent) {
    let toClean = parent.getElementsByClassName("toClean");
    for (var i=toClean.length; i>0; i--) {
        toClean[i-1].remove();
    }
}

function unique(arr) {
    var u = {}, a = [];
    for(var i = 0, l = arr.length; i < l; ++i){
        if(!u.hasOwnProperty(arr[i])) {
            a.push(arr[i]);
            u[arr[i]] = 1;
        }
    }
    return a;
}

