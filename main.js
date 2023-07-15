//Canvas elements
const carCanvas=document.getElementById("carCanvas");
carCanvas.width=200;
const networkCanvas=document.getElementById("networkCanvas");
networkCanvas.width=300;

//Canvas contexts
const carCtx = carCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");

//road and car spawning/inits
const road=new Road(carCanvas.width/2,carCanvas.width*0.9);

// Car following and init
const N = 100;
const cars = generateCars(N);
let bestCar=cars[0];
if(localStorage.getItem("bestCar")){
    for(let i = 0; i < cars.length; i++){
        cars[i].brain = JSON.parse(
            localStorage.getItem("bestCar"));
        if(i != 0){
            NeuralNetwork.mutate(cars[i].brain, 0.1);
        }
    }
}

const traffic=[
    new Car(road.getLaneCenter(0),-300,30,50,"DUMMY",2),
    new Car(road.getLaneCenter(0),-500,30,50,"DUMMY",2),
    new Car(road.getLaneCenter(1),-100,30,50,"DUMMY",2),
    new Car(road.getLaneCenter(1),-500,30,50,"DUMMY",2),
    new Car(road.getLaneCenter(1),-700,30,50,"DUMMY",2),
    new Car(road.getLaneCenter(2),-300,30,50,"DUMMY",2),
    new Car(road.getLaneCenter(2),-700,30,50,"DUMMY",2),
];

let currentGeneration = 0;

// Get the currentGeneration button element
const currentGenerationButton = document.getElementById('currentGeneration');

// Define a function to update the currentGeneration button element's innerText
function updateGenerationCounter() {
        currentGenerationButton.innerText = `Generation: ${currentGeneration}`;
    }

updateGenerationCounter();

currentGeneration++;

updateGenerationCounter();


//run the animate method
animate();

// Dealing with the save button
function save() {
    localStorage.setItem("bestCar",
       JSON.stringify(bestCar.brain));
}

// Dealing with the discard button
function discard() {
    localStorage.removeItem("bestCar");
}

// Dealing with the sng button (startNewGeneration)
function sng() {
    const countdownTimer = document.getElementById('countdownTimer');
    
    const countdownDuration = 5;

    const generationInterval = setInterval(function() {

        if (currentGeneration === 4) {

            clearInterval(generationInterval);

        } else {
            // Display the initial countdown value
            countdownTimer.innerText = `Next generation in ${countdownDuration} seconds`;
    
            let countdown = countdownDuration;
            const countdownInterval = setInterval(function() {
                countdown--;
                
                // When the countdown reaches 0:
                if (countdown === 0) {
                    
                    localStorage.setItem("bestCar", JSON.stringify(bestCar.brain));
                    currentGeneration++;
                    updateGenerationCounter();
                    
                    clearInterval(countdownInterval);
                    
                    // Hide the countdown timer
                    countdownTimer.style.display = 'none';
                    
                    // Reset countdownDuration
                    countdownDuration = 5;
                } else {
                    // Update the countdown timer display
                    countdownTimer.innerText = `Next generation in ${countdown} seconds`;
                }
            }, 1000);
        }
    }, 5000);
}

// Generaete new cars
function generateCars(N) {
    const cars = [];
    for (let i = 1; i <= N; i++) {
        cars.push(new Car(road.getLaneCenter(1), 100, 30, 50, "AI"));
    }
    return cars;
}

// Animation 
function animate(time){
    for(let i=0;i<traffic.length;i++){
        traffic[i].update(road.borders,[]);
    }
    for (let i = 0; i < cars.length; i++){
        cars[i].update(road.borders,traffic);
    }
    bestCar = cars.find(
        c=>c.y==Math.min(
            ...cars.map(c=>c.y)
        ));

    carCanvas.height=window.innerHeight;
    networkCanvas.height=window.innerHeight;

    carCtx.save();
    carCtx.translate(0,-bestCar.y+carCanvas.height*0.7);

    // Draw the traffic
    road.draw(carCtx);
    for(let i = 0; i < traffic.length; i++){
        traffic[i].draw(carCtx,"blue");
    }
    // Draw the AI cars
    carCtx.globalAlpha = 0.2;
    for(let i = 0; i < cars.length; i++){
        cars[i].draw(carCtx,"red");
    }

    // The car that will be the best, the one we follow
    carCtx.globalAlpha = 1;
    bestCar.draw(carCtx, "green", true);

    carCtx.restore();

    //dont forget to add time to the parameters of this animate function
    networkCtx.lineDashOffset=-time/50;
    Visualiser.drawNetwork(networkCtx, bestCar.brain);

    requestAnimationFrame(animate);
}