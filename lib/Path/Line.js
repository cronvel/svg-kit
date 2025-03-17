/*
	SVG Kit

	Copyright (c) 2017 - 2024 Cédric Ronvel

	The MIT License (MIT)

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.
*/

"use strict" ;



const BoundingBox = require( '../BoundingBox.js' ) ;



function Line( startPoint , endPoint ) {
	this.startPoint = startPoint ;
	this.endPoint = endPoint ;
	this.length = this.getLength() ;

	this.boundingBox = new BoundingBox( null ) ;
	this.boundingBox.ensurePoint( startPoint ) ;
	this.boundingBox.ensurePoint( endPoint ) ;
}

module.exports = Line ;



Line.prototype.getLength = function( t = 1 ) {
	let dx = this.endPoint.x - this.startPoint.x ,
		dy = this.endPoint.y - this.startPoint.y ;

	return t * Math.sqrt( dx * dx + dy * dy ) ;
} ;



Line.prototype.getPointAtLength = function( length ) {
	if ( length === 0 ) { return { x: this.startPoint.x , y: this.startPoint.y } ; }
	if ( length === this.length ) { return { x: this.endPoint.x , y: this.endPoint.y } ; }

	let dx = this.endPoint.x - this.startPoint.x ,
		dy = this.endPoint.y - this.startPoint.y ,
		t = length / this.length || 0 ;

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
		y: dy / this.length || 0 ,
		angle: Math.atan2( dy , dx )
	} ;
} ;



// Position + Tangent + Angle (radians)
Line.prototype.getPropertiesAtLength = function( length ) {
	var point = this.getPointAtLength( length ) ;
	var tangent = this.getTangentAtLength() ;

	return {
		x: point.x ,
		y: point.y ,
		dx: tangent.x ,
		dy: tangent.y ,
		angle: tangent.angle
	} ;
} ;

