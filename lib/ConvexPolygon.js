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



const Polygon = require( './Polygon.js' ) ;
const BoundingBox = require( './BoundingBox.js' ) ;



function ConvexPolygon( params ) {
	this.points = [] ;
	this.sides = [] ;
	this.boundingBox = new BoundingBox( null ) ;
	this.clockwise = true ;
	this.autofix = false ;
	this.badConvexPolygon = false ;

	if ( params ) { this.set( params ) ; }
}

module.exports = ConvexPolygon ;

ConvexPolygon.prototype = Object.create( Polygon.prototype ) ;
ConvexPolygon.prototype.constructor = ConvexPolygon ;
ConvexPolygon.prototype.__prototypeUID__ = 'svg-kit/ConvexPolygon' ;
ConvexPolygon.prototype.__prototypeVersion__ = require( '../package.json' ).version ;



ConvexPolygon.prototype.set = function( params ) {
	Polygon.prototype.set.call( this , params ) ;
	if ( typeof params.clockwise === 'boolean' ) { this.clockwise = params.clockwise ; }
} ;



ConvexPolygon.prototype.setPoints = function( points ) {
	Polygon.prototype.setPoints.call( this , points ) ;
	if ( this.autofix ) { this.fixConvexPolygon() ; }
} ;



ConvexPolygon.prototype.isInside = function( coords ) {
	if ( ! this.sides.length ) { return false ; }

	return this.clockwise ?
		this.sides.every( side => Polygon.testSideLineEquation( side , coords ) <= 0 ) :
		this.sides.every( side => Polygon.testSideLineEquation( side , coords ) >= 0 ) ;
} ;



// Find out if the points are really clowkwise or anti-clockwise
ConvexPolygon.prototype.fixConvexPolygon = function() {
	if ( ! this.sides.length ) { return ; }

	var clockwiseOk = true ,
		antiClockwiseOk = true ;

	this.badConvexPolygon = false ;

	for ( let i = 0 ; i < this.sides.length ; i ++ ) {
		let side = this.sides[ i ] ;

		for ( let j = i + 2 ; j < this.points.length ; j ++ ) {
			if ( j === i || j === ( i + 1 ) % this.sides.length ) {
				// We don't check points of the current side
				continue ;
			}

			let point = this.points[ j ] ;

			if ( clockwiseOk && Polygon.testSideLineEquation( side , point ) > 0 ) { clockwiseOk = false ; }
			if ( antiClockwiseOk && Polygon.testSideLineEquation( side , point ) < 0 ) { antiClockwiseOk = false ; }

			if ( ! clockwiseOk && ! antiClockwiseOk ) {
				console.warn( "Bad convex polygon, probably not simple/convex" ) ;
				this.badConvexPolygon = true ;
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
		this.badConvexPolygon = true ;
	}
} ;

