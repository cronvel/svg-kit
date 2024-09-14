/*
	SVG Kit

	Copyright (c) 2017 - 2023 Cédric Ronvel

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



function Polygon( params ) {
	this.points = [] ;
	this.sides = [] ;
	this.clockwise = true ;

	if ( params ) { this.set( params ) ; }
}

module.exports = Polygon ;



Polygon.prototype.set = function( params ) {
	if ( params.points ) { this.setPoints( params.points ) ; }
	if ( typeof params.clockwise === 'boolean' ) { this.clockwise = params.clockwise ; }
} ;



Polygon.prototype.setPoints = function( points ) {
	this.points.length = 0 ;
	this.sides.length = 0 ;

	if ( ! Array.isArray( points ) ) { return ; }
	for ( let point of points ) { this.addPoint( point ) ; }
} ;



Polygon.prototype.addPoint = function( point ) {
	if ( ! point || typeof point !== 'object' ) { return ; }

	this.points.push( {
		x: + point.x || 0 ,
		y: + point.y || 0
	} ) ;

	this.addSide() ;
} ;



Polygon.prototype.addSide = function() {
	var count = this.points.length ;
	if ( count <= 1 ) { return ; }

	// Remove the closing side
	this.sides.length = count - 1 ;

	this.sides.push( this.getParametricLineParameters( this.points[ count - 2 ] , this.points[ count - 1 ] ) ) ;
	this.sides.push( this.getParametricLineParameters( this.points[ count - 1 ] , this.points[ 0 ] ) ) ;
} ;



/*
	Get the parametric line equation's parameters.
	The equation is:   ax + by + c
	The result is =0 on the line, >0 on the left (point 1 toward point 2), <0 on the right.
*/
Polygon.prototype.getParametricLineParameters = function( point1 , point2 ) {
	var dx = point2.x - point1.x ,
		dy = point2.y - point1.y ;

	return {
		a: - dy ,
		b: dx ,
		c: - dx * point1.y + dy * point1.x
	} ;
} ;



Polygon.prototype.isInside = function( coords ) {
	if ( ! this.sides.length ) { return false ; }

	return this.clockwise ?
		this.sides.every( side => Polygon.sideTest( side , coords ) <= 0 ) :
		this.sides.every( side => Polygon.sideTest( side , coords ) >= 0 ) ;
} ;



Polygon.sideTest = function( side , coords ) {
	return side.a * coords.x + side.b * coords.y + side.c ;
} ;

