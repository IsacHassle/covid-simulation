let canvas = document.querySelector("canvas");


canvas.width = window.innerWidth / 2;
canvas.height = window.innerHeight;

let c = canvas.getContext("2d");


function rotate(velocity, angle) {
    const rotatedVelocities = {
        x: velocity.x * Math.cos(angle) - velocity.y * Math.sin(angle),
        y: velocity.x * Math.sin(angle) + velocity.y * Math.cos(angle)
    };

    return rotatedVelocities;
}


function resolveCollision(circle, otherCircle) {
    const xVelocityDiff = circle.velocity.x - otherCircle.velocity.x;
    const yVelocityDiff = circle.velocity.y - otherCircle.velocity.y;

    const xDist = otherCircle.x - circle.x;
    const yDist = otherCircle.y - circle.y;

    // Prevent accidental overlap of circles
    if (xVelocityDiff * xDist + yVelocityDiff * yDist >= 0) {

        // Grab angle between the two colliding circles
        const angle = -Math.atan2(otherCircle.y - circle.y, otherCircle.x - circle.x);

        // Store mass in var for better readability in collision equation
        const m1 = circle.mass;
        const m2 = otherCircle.mass;

        // Velocity before equation
        const u1 = rotate(circle.velocity, angle);
        const u2 = rotate(otherCircle.velocity, angle);

        // Velocity after 1d collision equation
        const v1 = { x: u1.x * (m1 - m2) / (m1 + m2) + u2.x * 2 * m2 / (m1 + m2), y: u1.y };
        const v2 = { x: u2.x * (m1 - m2) / (m1 + m2) + u1.x * 2 * m2 / (m1 + m2), y: u2.y };

        // Final velocity after rotating axis back to original location
        const vFinal1 = rotate(v1, -angle);
        const vFinal2 = rotate(v2, -angle);

        // Swap circle velocities for realistic bounce effect
        circle.velocity.x = vFinal1.x;
        circle.velocity.y = vFinal1.y;

        otherCircle.velocity.x = vFinal2.x;
        otherCircle.velocity.y = vFinal2.y;
    }
}



function getDistance(x1, y1, x2, y2) {
    let xDistance = x2 - x1;
    let yDistance = y2 - y1;

    return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2))
}

function Circle(x, y, radius) {
    this.x = x;
    this.y = y;
    this.velocity = {
        x: ((Math.random() - 0.5) * 2.5),
        y: ((Math.random() - 0.5) * 2.5)
    }
    this.radius = radius;
    this.mass = 1;
   if(Math.random() >= 0.03){
        this.infected = false;
        this.immune = (Math.random() >= 0.01 ? false : true);
    } 
    else{
        this.infected = true;
        this.immune = false;
    }
    let timeUntilDeath = Math.random() * 10000;
   
    this.willDieAt = (this.infected === true && this.immune === false) ? new Date().getTime() + timeUntilDeath : new Date().getTime() + 10000000000;
    this.sick = false;


    function infect(thisCircle, otherCircle) {
        if (thisCircle.infected === true && otherCircle.immune === false && otherCircle.infected === false) {
            otherCircle.infected = true;
            otherCircle.willDieAt = new Date().getTime() + timeUntilDeath;
    
        }
        if (otherCircle.infected === true && thisCircle.immune === false && thisCircle.infected === false) {
            thisCircle.infected = true;
            thisCircle.willDieAt = new Date().getTime() + timeUntilDeath;
        }
    }

    let deathRate = Math.random();
    this.update = function (circleArray) {
        this.draw();
        // Collide detection
        for (let i = 0; i < circleArray.length; i++) {
            if (this === circleArray[i]) continue;


            if (getDistance(this.x, this.y, circleArray[i].x, circleArray[i].y) - this.radius * 2 < 0) {


                if (this.infected === true || circleArray[i].infected === true) {
                    infect(this, circleArray[i]);

                }



                resolveCollision(this, circleArray[i]);


            }
            // makes the circle change direction when in contact with wall
        }
        if (this.x + this.radius >= canvas.width || this.x - this.radius <= canvas.width - canvas.width) {
            this.velocity.x = -this.velocity.x;
        }

        if (this.y + this.radius > canvas.height || this.y - this.radius < canvas.height - canvas.height) {
            this.velocity.y = -this.velocity.y;
        }


        this.x += this.velocity.x;
        this.y += this.velocity.y;


        if (this.willDieAt < new Date().getTime()) {
            this.sick = true;
        }
        if (this.sick && deathRate < survivalRate) {
            this.infected = false;
            this.immune = true;
        }
        if (this.sick && deathRate > survivalRate) {
            this.velocity.x = 0;
            this.velocity.y = 0;
            this.x = canvas.width + 100;
            this.y = canvas.length + 100;
        }

        
    };


    // draws the circle
    this.draw = function () {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        // changes the color based on if the circle is infected or not
        if (this.infected === true) {
            c.strokeStyle = "red";
        }
        else if (this.immune === true) {
            c.strokeStyle = "yellow";
        }
        else {
            c.strokeStyle = "blue";
        }

        if (this.infected === true) {
            c.fillStyle = "red";
        }
        else if (this.immune === true) {
            c.fillStyle = "yellow";
        }
        else {
            c.fillStyle = "blue";
        }
        c.stroke();
        c.fill();
    }
};


let survivalRate = 0.5;

let circleAmount = 100;

let circleArray = [];

for (let i = 0; i < circleAmount; i++) {
    let radius = 6;
    let x = Math.random() * (canvas.width - radius * 2) + radius;
    let y = Math.random() * (canvas.height - radius * 2) + radius;

    if (i !== 0) {
        for (let j = 0; j < circleArray.length; j++) {
            if (getDistance(x, y, circleArray[j].x, circleArray[j].y) - radius * 2 < 0) {
                x = Math.random() * (canvas.width - radius * 2) + radius;
                y = Math.random() * (canvas.height - radius * 2) + radius;
                j = -1;
            }
        }
    }

    circleArray.push(new Circle(x, y, radius));
}
console.log("There are " + circleArray.length + " circles");

function circlemove() {
    c.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < circleArray.length; i++) {
        circleArray[i].update(circleArray);
    }
    requestAnimationFrame(circlemove);
}
circlemove();









