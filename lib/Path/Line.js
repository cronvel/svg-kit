
"use strict" ;

function Line( startPoint , endPoint ) {
	this.startPoint = startPoint ;
	this.endPoint = endPoint ;
	this.length = this.getLength() ;
}

module.exports = Line ;



Line.prototype.getLength = function( t = 1 ) {
	let dx = this.endPoint.x - this.startPoint.x ,
		dy = this.endPoint.y - this.startPoint.y ;

	return t * Math.sqrt( dx * dx + dy * dy ) ;
} ;



Line.prototype.getPointAtLength = function( length ) {
	let dx = this.endPoint.x - this.startPoint.x ,
		dy = this.endPoint.y - this.startPoint.y ,
		t = length / this.length || 1 ;

	return {
		x: this.startPoint.x + t * dx ,
		y: this.startPoint.y + t * dy
	} ;
} ;



// No argument, it does not depend on the length, it's always the same
Line.prototype.getTangentAtLength = function() {
	let dx = this.endPoint.x - this.startPoint.x ,
		dy = this.endPoint.y - this.startPoint.y ;

	return {
		x: dx / this.length || 0 ,
		y: dy / this.length || 0
	} ;
} ;



Line.prototype.getPointAndTangentAtLength = function( length ) {
	let dx = this.endPoint.x - this.startPoint.x ,
		dy = this.endPoint.y - this.startPoint.y ,
		t = length / this.length || 1 ;

	return {
		x: this.startPoint.x + t * dx ,
		y: this.startPoint.y + t * dy ,
		dx: dx / this.length || 0 ,
		dy: dy / this.length || 0
	} ;
} ;

