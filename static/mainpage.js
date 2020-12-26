var timer = null;
var time = 3000;

var moveLeft = new function() {

    var count = 0;
    this.moveLeft = function () {
	if (count++ == 3) {
	    count = 1;
	    var nav_div = $("nav div");
	    for (var i=0, len=nav_div.length; i<len; ++i)
		nav_div[i].style.left = i*100+"%";
	}
	$("nav div").animate({left:"-=100%"});
    }
}

window.addEventListener("load", function() {
    timer = setInterval('moveLeft.moveLeft()', time);
    $("#author_photo").css("width", $("#photo_div").width())
})

$("nav").on("mouseover", function() {
    clearInterval(timer);
})

$("nav").on("mouseout", function() {
    timer = setInterval('moveLeft.moveLeft()', time);
})

