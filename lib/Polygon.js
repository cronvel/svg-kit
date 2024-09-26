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



const BoundingBox = require( './BoundingBox.js' ) ;



function Polygon( params ) {
	this.points = [] ;
	this.sides = [] ;
	this.boundingBox = new BoundingBox( null ) ;

	if ( params ) { this.set( params ) ; }
}

module.exports = Polygon ;

Polygon.prototype.__prototypeUID__ = 'svg-kit/Polygon' ;
Polygon.prototype.__prototypeVersion__ = require( '../package.json' ).version ;

// Circular...
const Path = require( './Path/Path.js' ) ;



Polygon.prototype.set = function( params ) {
	if ( params.points ) { this.setPoints( params.points ) ; }
} ;



Polygon.prototype.setPoints = function( points ) {
	this.points.length = 0 ;
	this.sides.length = 0 ;
	this.boundingBox.nullify() ;

	if ( ! Array.isArray( points ) ) { return ; }
	for ( let point of points ) { this.addPoint( point , true ) ; }
	if ( this.addClosingSide ) { this.addClosingSide() ; }
} ;



Polygon.prototype.addPoint = function( point , noClosingSide = false ) {
	if ( ! point || typeof point !== 'object' ) { return ; }

	var pointClone = { x: + point.x || 0 , y: + point.y || 0 } ;
	this.points.push( pointClone ) ;
	this.boundingBox.ensurePoint( pointClone ) ;

	this.addLastSide() ;
	if ( this.addClosingSide && ! noClosingSide ) { this.addClosingSide() ; }
} ;



Polygon.prototype.addLastSide = function() {
	var count = this.points.length ;
	if ( count <= 1 ) { return ; }
	this.sides[ count - 2 ] = Polygon.getParametricLineParameters( this.points[ count - 2 ] , this.points[ count - 1 ] ) ;
} ;



Polygon.prototype.addClosingSide = function() {
	var count = this.points.length ;
	if ( count < 3 ) { return ; }
	this.sides[ count - 1 ] = Polygon.getParametricLineParameters( this.points[ count - 1 ] , this.points[ 0 ] ) ;
} ;



Polygon.prototype.export = function( data = {} ) {
	data.points = this.points.map( p => ( { x: p.x , y: p.y } ) ) ;
	return data ;
} ;



Polygon.prototype.toD = function( invertY = false ) {
	return Path.polygonPointsToD( this.points , invertY ) ;
} ;



Polygon.prototype.isInside = function( coords ) {
	if ( ! this.sides.length ) { return false ; }

	var count = 0 ;

	// Cast rays on each side, and count the intersection
	for ( let side of this.sides ) {
		if ( Polygon.castRayOnSide( side , coords ) ) { count ++ ; }
	}
	
	//console.log( "Polygon.isInside: count =" , count ) ;

	// Odd count means it's inside, even count means it's outside
	return !! ( count % 2 ) ;
} ;



/*
	Get the line equation's parameters.
	The equation is:   ax + by + c
	The result is =0 on the line, >0 on the left-side (point 1 toward point 2), <0 on the right-side.

	Also get the parametric line segment parameters.
	For 0 ≤ t ≤ 1 :
	x = x0 + dx * t
	y = y0 + dy * t
*/
Polygon.getParametricLineParameters = function( point1 , point2 ) {
	var dx = point2.x - point1.x ,
		dy = point2.y - point1.y ;

	return {
		// Line equation
		a: - dy ,
		b: dx ,
		c: - dx * point1.y + dy * point1.x ,
		
		// Parametric
		x0: point1.x ,
		y0: point1.y ,
		dx ,
		dy
	} ;
} ;



// Apply the line equation on a point/coords, result is =0 if on the line, >0 if on the left-side, <0 if on the right-side
Polygon.testSideLineEquation = function( side , coords ) {
	return side.a * coords.x + side.b * coords.y + side.c ;
} ;



// Cast an horizontal ray, and return true if it intersect with a side.
// The ray is infinite on the left-side (x<0) and stop ath the precise ray.x and ray.y coordinates.
Polygon.castRayOnSide = function( side , ray ) {
	// Tangential rays are always considered not intersecting, so horizontal line segments don't intersect
	if ( ! side.dy ) { return false ; }
	
	// Compute the parametric t value for the side's line-segment for the Y horizontal line
	// y = y0 + dy * t   <=>   t = ( y - y0 ) / dy
	let t = ( ray.y - side.y0 ) / side.dy ;

	// If we don't have 0 < t < 1, then the ray is not in the correct Y-axis range
	// To avoid degenerate cases, we consider edge case to be OUTSIDE, no intersection.
	if ( t <= 0 || t >= 1 ) { return false ; }

	// Now get the X coord of the intersection
	// x = x0 + dx * t
	let x = side.x0 + side.dx * t ;
	
	// The ray is infinite on the left and stop at ray's (x,y), so for the ray to intersect,
	// its X coord should be greater than the X coord of the line intersection.
	// Again, to avoid degenerate cases, we consider edge case to be OUTSIDE, no intersection.
	return ray.x > x ;
} ;

