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



function BoundingBox( xmin , ymin , xmax , ymax ) {
	this.xmin = xmin ;
	this.ymin = ymin ;
	this.xmax = xmax ;
	this.ymax = ymax ;
}

module.exports = BoundingBox ;



BoundingBox.prototype.set = function( xmin , ymin , xmax , ymax ) {
	this.xmin = xmin ;
	this.ymin = ymin ;
	this.xmax = xmax ;
	this.ymax = ymax ;
} ;



Object.defineProperties( BoundingBox.prototype , {
	x: {
		get: function() { return this.xmin ; } ,
		set: function( x ) { this.xmin = x ; }
	} ,
	y: {
		get: function() { return this.ymin ; } ,
		set: function( y ) { this.ymin = y ; }
	} ,
	width: {
		get: function() { return this.xmax - this.xmin ; } ,
		set: function( width ) { this.xmax = this.xmin + width ; }
	} ,
	height: {
		get: function() { return this.ymax - this.ymin ; } ,
		set: function( height ) { this.height = this.ymin + height ; }
	}
} ) ;



BoundingBox.prototype.clone = function() {
	return new BoundingBox( this.xmin , this.ymin , this.xmax , this.ymax ) ;
} ;



BoundingBox.prototype.merge = function( bbox ) {
	this.xmin = Math.min( this.xmin , bbox.xmin ) ;
	this.ymin = Math.min( this.ymin , bbox.ymin ) ;
	this.xmax = Math.max( this.xmax , bbox.xmax ) ;
	this.ymax = Math.max( this.ymax , bbox.ymax ) ;
} ;

