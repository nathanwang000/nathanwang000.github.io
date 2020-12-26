function showNumberWithAnimation(i, j, randNumber){
    var numberCell =  $('#number-cell-'+i+'-'+j);
    
    numberCell.css('background-color', getNumberColor(randNumber));
    numberCell.css('color', getNumberBackgroundColor(randNumber));
    numberCell.text(randNumber);

    numberCell.animate({
	width: cellSideLength,
	height: cellSideLength,
	top: getPosTop(i,j),
	left: getPosLeft(i,j)
    }, 50);
    
}

function showMoveAnimation(fromx, fromy, tox, toy) {
    var theNumberCell = $("#number-cell-"+fromx+'-'+fromy);
    theNumberCell.animate({
	top: getPosTop(tox, toy),
	left: getPosLeft(tox, toy)
    },200);
}

function animatescore( score ) {
    $("#score").text(score);
    $("#score").animate({
	color: "rgba(255,165,0,1)",
    },200);
    
    // $("#score").animate({
    // 	color: "rgba(255,165,0,0.5)"
    // },2000);
    
}