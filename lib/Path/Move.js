
"use strict" ;

// Dummy class

// common null bounding box?
//const BoundingBox = require( '../BoundingBox.js' ) ;
//const BOUNDING_BOX = new BoundingBox( null ) ;

function Move( endPoint ) {
	this.endPoint = endPoint ;
	this.length = 0 ;
	//this.boundingBox = BOUNDING_BOX ;
}

module.exports = Move ;

Move.prototype.getLength = function() { return 0 ; } ;

Move.prototype.getPointAtLength = function() {
	return {
		x: this.endPoint.x ,
		y: this.endPoint.y
	} ;
} ;

Move.prototype.getTangentAtLength = function() {
	return {
		x: 0 ,
		y: 0 ,
		angle: 0
	} ;
} ;

Move.prototype.getPropertiesAtLength = function() {
	return {
		x: this.endPoint.x ,
		y: this.endPoint.y ,
		dx: 0 ,
		dy: 0 ,
		angle: 0
	} ;
} ;

