'use strict'
let canvas = $("#myCanvas")[0];
let w = canvas.width;
let h = canvas.height;
let n = 200; // number of pts on circle
let multN = 2; 
let context = canvas.getContext('2d');
let radius = Math.min(w/4,h/4);
let cx = w/2;
let cy = h/2;

// draw a circle
function drawCircle() {
    context.arc(cx, cy, radius, 0, Math.PI * 2);
}

function connect(from, to) {
    // from and to must be below 
    function coord(r) {
	let theta = r / n * Math.PI * 2;
	return {x:cx+radius*Math.cos(theta),
		y:cy+radius*Math.sin(theta)};
    }
    
    context.moveTo(coord(from).x, coord(from).y);
    context.lineTo(coord(to).x, coord(to).y);
}

function drawPattern() {
    multN = (n + multN) % n
    for (let i=0; i<n; ++i) {
	connect(i, (i*multN) %n);
    }
}

let color = { value: 0,
	      hexformat: function () {
		  let colorStr = ((this.value++)
				  % parseInt("1000000",16)
				 ).toString(16);

		  let toAppend = "#";
		  let n = 6-colorStr.length;
		  while (n--) toAppend += "0";
		  return toAppend + colorStr;
	      },
	      hslformat: function() {
		  return "hsl(" + (this.value++ % 360) + ", 100%, 30%)";
	      }
	    };

function updateDrawing() {
    context.clearRect(0,0,w,h);

    context.beginPath();
    context.strokeStyle = color.hslformat();
    drawCircle();
    drawPattern();
    context.stroke();
    
    // save canvas image as data url (png format by default)
    var dataURL = canvas.toDataURL();
    // set canvasImg image src to dataURL
    // so it can be saved as an image
    document.getElementById('canvasImg').src = dataURL;
}

$( document ).ready(function() {
    updateDrawing();
});

$("#mult_up").click(function() {
    multN++;
    $("#m").val(multN);    
    updateDrawing();
})

$("#mult_down").click(function() {
    multN--;
    $("#m").val(multN);    
    updateDrawing();    
})

$("#submit").click(function() {
    multN = parseInt($("#m").val()) || 2;
    n = parseInt($("#n").val()) || 200;
    updateDrawing();        
}) 

function controlTime() {
    let timeVar;
    let step = 0;
    let started = false;
    return {
	start: function() {
	    if (started) return;
	    started = true;	    
	    timeVar = window.setInterval(function() {
		multN = multN + step;
		$("#m").val(multN);		
		updateDrawing();
	    },100)
	},
	leftScroll: function() {
	    step -= 0.05;
	    this.start();
	},
	rightScroll: function() {
	    step += 0.05;
	    this.start();	    
	},
	stop: function() {
	    step = 0;	    
	    started = false;
	    window.clearInterval(timeVar);
	}
    }
}

(function() {
    let auto = controlTime()
    $("#autoL").click(function() {
	auto.leftScroll();
    })
    $("#autoR").click(function() {
	auto.rightScroll();
    })
    $("#stop").click(function() {
	auto.stop();	
    })
})()
