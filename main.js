
// SELECTION LISTENER
var select = document.getElementById("selection");

select.onchange = function(event) {
    loadData(event.target.value);
    setTimeout(o => {
        console.log("Loaded " + celebrities.length + " celebrities");
        console.log("Loaded " + faces.length + " faces");
        console.log("Loaded " + labels.length + " labels");
        console.log("Loaded " + persons.length + " persons");
        //video.src = "file:///home/daniele/Downloads/XPeppers/DeepLens/" + event.target.value + ".mp4";
        video.src = "https://s3.eu-west-1.amazonaws.com/rekognition-video-demo/" + event.target.value + ".mp4";
    }, 2500)
}

// VIDEO LISTENER
var video = document.getElementById("video");

video.ontimeupdate = function() {
    let timestamp = getVideoTimestamp();
    let frameCelebrities = getCelebritiesFor(timestamp);
    displayCelebrities(frameCelebrities);
    let frameFaces = getFacesFor(timestamp);
    displayFaces(frameFaces);
    let frameLabels = getLabelsFor(timestamp);
    displayLabels(frameLabels);
    let framePersons = getPersonsFor(timestamp);
    displayPersons(framePersons);
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
    cleanChild(overlay, "overlay-celebrity");
    frameCelebrities.forEach(function(item) {
        let celebrity = item.celebrity;
        let name = celebrity.name;
        //let bb = celebrity.face && celebrity.face.boundingBox ? celebrity.face.boundingBox : celebrity.boundingBox;
        let bb = celebrity.face && celebrity.face.boundingBox ? celebrity.face.boundingBox : null;
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

// FACES
function getFacesFor(timestamp) {
    let selectedFaces = new Array();
    faces.forEach(function(face) {
        if (face.timestamp > timestamp && face.timestamp < (timestamp + 200)) {
            selectedFaces.push(face);
        }
    });
    return selectedFaces;
}

function displayFaces(frameFaces) {
    let overlay = document.getElementById("video-container");
    let faces = document.getElementById("faces-container");
    cleanChild(overlay, "overlay-face");
    cleanChild(faces);
    frameFaces.forEach(function(item) {
        let face = item.face;
        let bb = face.boundingBox;
        let pose = face.pose;
        let div = document.createElement("div");
        div.style = convertBoundingBoxToCSS(bb, pose);
        div.className = "overlay-face toClean";
        div.innerHTML = "<span>" + item.timestamp + "</span>";
        overlay.appendChild(div);
        let p = document.createElement("p");
        p.className = "face toClean";
        let faceHTML = "<ul>" + item.timestamp;
        faceHTML += "<li>Gender: " + face.gender.value + "</li>";
        faceHTML += "<li>Age: " + face.ageRange.low + "/" + face.ageRange.high + "</li>";
        if (face.emotions.length > 0) {
            faceHTML += "<li>Emotions: ";
            face.emotions.forEach(element => {
                faceHTML += element.type + " ";
            });
            faceHTML += "</li>";
        }
        if (face.smile.value) {
            faceHTML += "<li>Smiling</li>";
        }
        if (faces.eyeglasses && faces.eyeglasses.value) {
            faceHTML += "<li>Eyeglasses</li>";
        }
        if (faces.sunglasses && faces.sunglasses.value) {
            faceHTML += "<li>Sunglasses</li>";
        }
        if (faces.beard && faces.beard.value) {
            faceHTML += "<li>Beard</li>";
        }
        if (faces.mustache && faces.mustache.value) {
            faceHTML += "<li>Mustache</li>";
        }
        faceHTML += "</ul>";
        p.innerHTML = faceHTML;
        faces.appendChild(p);
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
    overlay.textContent = unique(items).toString().replace(/,/g, ", ");
}

// PERSONS
function getPersonsFor(timestamp) {
    let selectedPersons = new Array();
    persons.forEach(function(person) {
        if (person.timestamp > timestamp && person.timestamp < (timestamp + 200)) {
            selectedPersons.push(person);
        }
    });
    return selectedPersons;
}

function displayPersons(framePersons) {
    let overlay = document.getElementById("video-container");
    cleanChild(overlay, "overlay-person");
    let displayed = new Array();
    framePersons.forEach(function(item) {
        let person = item.person;
        let index = person.index;
        let bb = person.face && person.face.boundingBox ? person.face.boundingBox : person.boundingBox;
        //let bb = person.face && person.face.boundingBox ? person.face.boundingBox : null;
        let pose = person.face && person.face.pose ? person.face.pose : null;
        if (bb == null) {
            //console.log(name + " - " + item.timestamp);
        } else if (!displayed.includes(index)) {
            let div = document.createElement("div");
            div.style = convertBoundingBoxToCSS(bb, pose);
            div.className = "overlay-person toClean";
            div.innerText = index;
            overlay.appendChild(div);
            displayed.push(index);
        }
    });
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

function cleanChild(parent, classes) {
    if (classes == undefined) {
        classes = "";
    }
    classes += " toClean";
    let toClean = parent.getElementsByClassName(classes);
    let size = toClean.length;
    for (var i=toClean.length; i>0; i--) {
        toClean[i-1].remove();
    }
    return size;
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

