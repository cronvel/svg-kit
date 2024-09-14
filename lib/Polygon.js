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

	if ( params ) { this.set( params ) ; }
}

module.exports = Polygon ;



Polygon.prototype.set = function( params ) {
	if ( params.points ) { this.setPoints( params.points ) ; }
} ;



Polygon.prototype.setPoints = function( points ) {
	this.points.length = 0 ;
	if ( ! Array.isArray( points ) ) { return ; }
	for ( let point in points ) { this.addPoint( point ) ; }
} ;



Polygon.prototype.addPoint = function( point ) {
	if ( ! point || typeof point !== 'object' ) { return ; }

	this.points.push( {
		x: + point.x || 0 ,
		y: + point.y || 0
	} ) ;
} ;



Polygon.prototype.isInside = function( coords ) {
} ;

