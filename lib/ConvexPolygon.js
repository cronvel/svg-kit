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
} ;



ConvexPolygon.prototype.setPoints = function( points ) {
	Polygon.prototype.setPoints.call( this , points ) ;
} ;



ConvexPolygon.prototype.isInside = function( coords ) {
	if ( ! this.sides.length ) { return false ; }

	return this.totalAngle > 0 ?
		this.sides.every( side => Polygon.testSideLineEquation( side , coords ) >= 0 ) :
		this.sides.every( side => Polygon.testSideLineEquation( side , coords ) <= 0 ) ;
} ;



ConvexPolygon.prototype.checkConvex = function() {
	// Checking convexity is easy : just check that each point lie on the correct side of its line equation
	this.badConvexPolygon = false ;
	if ( ! this.sides.length ) { return true ; }

	for ( let i = 0 ; i < this.sides.length ; i ++ ) {
		let side = this.sides[ i ] ;

		for ( let j = i + 2 ; j < this.points.length ; j ++ ) {
			// We don't check points of the current side
			if ( j === i || j === ( i + 1 ) % this.sides.length ) { continue ; }

			let point = this.points[ j ] ;

			let ok = this.totalAngle > 0 ?
				Polygon.testSideLineEquation( side , point ) > 0 :
				Polygon.testSideLineEquation( side , point ) < 0 ;

			if ( ! ok ) {
				console.warn( "Bad convex polygon, probably not simple/convex" ) ;
				this.badConvexPolygon = true ;
				return false ;
			}
		}
	}

	return true ;
} ;

