
"use strict" ;

// Dummy class

function Move( endPoint ) {
	this.endPoint = endPoint ;
	this.length = 0 ;
}

module.exports = Move ;

Move.prototype.getLength = function() { return 0 ; } ;
Move.prototype.getPointAtLength = function() { return { x: this.endPoint.x , y: this.endPoint.y } ; } ;
Move.prototype.getTangentAtLength = function() { return { x: 0 , y: 0 } ; } ;
Move.prototype.getPropertiesAtLength = function() { return { x: this.endPoint.x , y: this.endPoint.y , dx: 0 , dy: 0 } ; } ;

