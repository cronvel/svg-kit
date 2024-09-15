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



const pathUtilities = require( './path-utilities.js' ) ;



function Polygon( params ) {
	// Note: all properties should be copied to VGPolygon as well
	this.points = [] ;
	this.sides = [] ;
	this.clockwise = true ;
	this.autofix = false ;

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
	for ( let point of points ) { this.addPoint( point , true ) ; }
	this.addClosingSide() ;

	if ( this.autofix ) { this.fixPolygon() ; }
} ;



Polygon.prototype.addPoint = function( point , noClosingSide = false ) {
	if ( ! point || typeof point !== 'object' ) { return ; }

	this.points.push( {
		x: + point.x || 0 ,
		y: + point.y || 0
	} ) ;

	this.addLastSide() ;
	if ( ! noClosingSide ) { this.addClosingSide() ; }
} ;



Polygon.prototype.addLastSide = function() {
	var count = this.points.length ;
	if ( count <= 1 ) { return ; }
	this.sides[ count - 2 ] = this.getParametricLineParameters( this.points[ count - 2 ] , this.points[ count - 1 ] ) ;
} ;



Polygon.prototype.addClosingSide = function() {
	var count = this.points.length ;
	if ( count < 3 ) { return ; }
	this.sides[ count - 1 ] = this.getParametricLineParameters( this.points[ count - 1 ] , this.points[ 0 ] ) ;
} ;



Polygon.prototype.export = function( data = {} ) {
	data.points = this.points.map( p => ( { x: p.x , y: p.y } ) ) ;
	return data ;
} ;



Polygon.prototype.toD = function( invertY = false ) {
	return pathUtilities.polygonPointsToD( this.points , invertY ) ;
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



// Find out if the points are really clowkwise or anti-clockwise
Polygon.prototype.fixPolygon = function( coords ) {
	if ( ! this.sides.length ) { return ; }

	var clockwiseOk = true ,
		antiClockwiseOk = true ;

	for ( let i = 0 ; i < this.sides.length ; i ++ ) {
		let side = this.sides[ i ] ;

		for ( let j = i + 2 ; j < this.points.length ; j ++ ) {
			if ( j === i || j === ( i + 1 ) % this.sides.length ) {
				// We don't check points of the current side
				continue ;
			}

			let point = this.points[ j ] ;
			
			if ( clockwiseOk && Polygon.sideTest( side , point ) > 0 ) { clockwiseOk = false ; }
			if ( antiClockwiseOk && Polygon.sideTest( side , point ) < 0 ) { antiClockwiseOk = false ; }

			if ( ! clockwiseOk && ! antiClockwiseOk ) {
				console.warn( "Bad polygon, probably not simple/convex" ) ;
				return ;
			}
		}
	}

	if ( clockwiseOk && ! antiClockwiseOk ) {
		console.warn( "Clockwise detected!" ) ;
		this.clockwise = true ;
	}
	else if ( ! clockwiseOk && antiClockwiseOk ) {
		console.warn( "Anti-clockwise detected!" ) ;
		this.clockwise = false ;
	}
	else {
		console.warn( "Bad polygon" ) ;
	}
} ;



Polygon.sideTest = function( side , coords ) {
	return side.a * coords.x + side.b * coords.y + side.c ;
} ;

