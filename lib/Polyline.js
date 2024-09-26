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



const Polygon = require( './Polygon.js' ) ;
const BoundingBox = require( './BoundingBox.js' ) ;



function Polyline( params ) {
	this.points = [] ;
	this.sides = [] ;
	this.boundingBox = new BoundingBox( null ) ;

	if ( params ) { this.set( params ) ; }
}

module.exports = Polyline ;

Polyline.prototype = Object.create( Polygon.prototype ) ;
Polyline.prototype.constructor = Polyline ;
Polyline.prototype.__prototypeUID__ = 'svg-kit/Polyline' ;
Polyline.prototype.__prototypeVersion__ = require( '../package.json' ).version ;

Polyline.prototype.addClosingSide = null ;
Polyline.prototype.isInside = function( coords ) { return false ; } ;	// There is no “inside”, just lines

