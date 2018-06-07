var canvas, engine, scene, camera, score = 0, grade, miss=0;

var taps = [];
var beats  = [];

document.addEventListener("DOMContentLoaded", function () {
    if (BABYLON.Engine.isSupported()) {
        initScene();
        initGame();
        playMusic();
    }
}, false);

function initScene() {
    
    canvas = document.getElementById("renderCanvas");

    
    engine = new BABYLON.Engine(canvas, true);

    
    scene = new BABYLON.Scene(engine);

    
    camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0,4,-10), scene);
    camera.setTarget(new BABYLON.Vector3(0,0,10));
    camera.detachControl(canvas);

    
    var light = new BABYLON.PointLight("light", new BABYLON.Vector3(0,5,-5), scene);

    engine.runRenderLoop(function () {
        scene.render();
        deadBeat();
        beats.forEach(function (beatt) {
        if (beatt.killed) {
            // Nothing to do here
        } else {
            beatt.position.z -= 1.2;
        }
        });
    });

}

function playMusic(){
    var music = new BABYLON.Sound("Music", "music/music.wav", scene, null, { loop: false, autoplay: true, playbackRate: 0.9});
    setTimeout(
        function(){
            $("#myModal").modal();
            scene = new BABYLON.Scene(engine);
        }
    , 131000);
}

function deadBeat() {
    // For all clones
    for (var n=0; n<beats.length; n++) {
        if (beats[n].position.z < -10) {
            var beat = beats[n];
            // Destroy the clone !
            beat.dispose();
            beats.splice(n, 1);
            n--;
            miss++;
            document.getElementById("miss").innerHTML = miss;
        }
    }
}

function initGame() {
    // Number of lanes
    var total_lane = 3;
    // Space between lanes
    var lane_interval = 5;
    var lanes_positions = [];

    var sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter:2}, scene);
    sphere.scaling = new BABYLON.Vector3(0.8,0.8,0.8);
    sphere.isVisible=false;
    sphere.position = new BABYLON.Vector3(-7.5, 1, 2.5);

    // Creates a beat in a random lane
    var createBeat = function () {
        // The starting position of beats
        var posZ = 100;

        // Get a random lane
        var posX = lanes_positions[Math.floor(Math.random() * total_lane)];

        // Create a clone of our template
        var beatt = sphere.clone();

        beatt.id = sphere.name+(beats.length+1);
        // Our beat has not been killed yet !
        beatt.killed = false;
        // Set the beatt visible
        beatt.isVisible = true;
        // Update its position
        beatt.position = new BABYLON.Vector3(posX, beatt.position.y, posZ);
        beats.push(beatt);
    };

    setInterval(createBeat, 200);

    // Function to create lanes
    var createLane = function (id, position) {
        var lane = BABYLON.Mesh.CreateBox("lane"+id, 1, scene);
        lane.scaling.y = 0.1;
        lane.scaling.x = 3;
        lane.scaling.z = 800;
        lane.position.x = position;
        lane.position.z = lane.scaling.z/2-200;
    };

    var createEnding = function (id, position) {
        var tap = BABYLON.MeshBuilder.CreateTorus("tap", {thickness: 0.5, diameter: 2.5}, scene);
        tap.position.x = position;
        tap.position.y = 0.1;
        tap.position.z = 1;
        var mat = new BABYLON.StandardMaterial("tapMat", scene);
        mat.diffuseColor = new BABYLON.Color3(136/255, 75/255, 161/255);
        tap.material = mat;
        return tap;
    };

    var currentLanePosition = lane_interval * -1 * (total_lane/2);
    for (var i = 0; i<total_lane; i++){
        lanes_positions[i] = currentLanePosition;
        createLane(i, currentLanePosition);
        var e = createEnding(i, currentLanePosition);
        taps.push(e);
        currentLanePosition += lane_interval;
    }

    // Adjust camera position
    camera.position.x = lanes_positions[Math.floor(lane_interval/3)];

}

function animateEnding (ending) {
    // Get the initial position of our mesh
    var posY = ending.position.y;
    // Create the Animation object
    var animateEnding = new BABYLON.Animation(
    "animateEnding",
    "position.y",
    60,
    BABYLON.Animation.ANIMATIONTYPE_FLOAT,
    BABYLON.Animation.ANIMATIONLOOPMODE_RELATIVE);

    // Animations keys
    var keys = [];
    keys.push({
        frame: 0,
        value: posY
    },{
        frame: 1,
        value: posY+0.5
    },{
        frame: 3,
        value: 0
    });

    // Add these keys to the animation
    animateEnding.setKeys(keys);

    // Link the animation to the mesh
    ending.animations.push(animateEnding);

    // Run the animation !
    scene.beginAnimation(ending, 0, 3, false, 1);

}

document.addEventListener("keydown", Taptap);
function Taptap (evt){
    var currentEnding = -1;
    var slap = new BABYLON.Sound("slap", "music/slap.wav", scene, null, { autoplay: true, playbackRate: 10});

    switch (evt.keyCode) {
        case 67 : //'c'
            currentEnding = 0;
            slap.play();
            break;
        case 78 : //'n'
            currentEnding = 1;
            slap.play();
            break;
        case 77 : //'m'
            currentEnding = 2;
            slap.play();
            break;
    }

    if (currentEnding != -1) {
        // ANIMATE !!
        animateEnding(taps[currentEnding]);
        var beatt = tapBeat(taps[currentEnding]);
        if(beatt){
            beatt.killed=true;
        }
    }
}

function tapBeat(ending){
    for (var i=0; i<beats.length; i++){
        var beatt = beats[i];
    // Check if the shroom is on the good lane
        if (beatt.position.x === ending.position.x) {

            // Check if the shroom is ON the ending
            var diffSup = ending.position.z + 8;
            var diffInf = ending.position.z - 8;

            if (beatt.position.z > diffInf && beatt.position.z < diffSup ) {
                score++;
                console.log("Score= "+score);
                document.getElementById("score").innerHTML = String(score);
                document.getElementById("scoreFinal").innerHTML = String(score);
                beatt.dispose();

                if(score<350){
                    grade="Fail!";
                }
                else if(score>351 && score<450){
                    grade="C";
                }
                else if(score>451 && score<550){
                    grade="B";
                }
                else{
                    grade="A";
                }
                document.getElementById("modalHeader").innerHTML = grade;
            }
        }
    }
    return null;
}

