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



function BoundingBox( xmin = 0 , ymin = 0 , xmax = xmin , ymax = ymin ) {
	this.xmin = 0 ;
	this.ymin = 0 ;
	this.xmax = 0 ;
	this.ymax = 0 ;

	if ( xmin && typeof xmin === 'object' ) {
		this.set( xmin ) ;
	}
	else if ( xmin === null ) {
		this.xmin = Infinity ;
		this.xmax = - Infinity ;
		this.ymin = Infinity ;
		this.ymax = - Infinity ;
	}
	else {
		this.xmin = xmin ;
		this.ymin = ymin ;
		this.xmax = xmax ;
		this.ymax = ymax ;
	}
}

module.exports = BoundingBox ;



BoundingBox.prototype.set = function( params ) {
	if ( params instanceof BoundingBox ) {
		this.xmin = params.xmin ;
		this.ymin = params.ymin ;
		this.xmax = params.xmax ;
		this.ymax = params.ymax ;
		return ;
	}

	if ( params.xmin !== undefined ) { this.xmin = params.xmin ; }
	if ( params.ymin !== undefined ) { this.ymin = params.ymin ; }
	if ( params.xmax !== undefined ) { this.xmax = params.xmax ; }
	if ( params.ymax !== undefined ) { this.ymax = params.ymax ; }
	if ( params.x !== undefined ) { this.x = params.x ; }
	if ( params.y !== undefined ) { this.y = params.y ; }
	if ( params.width !== undefined ) { this.width = params.width ; }
	if ( params.height !== undefined ) { this.height = params.height ; }
} ;



// Shorter update lines
BoundingBox.prototype.setMinMax = function( xmin = 0 , ymin = 0 , xmax = xmin , ymax = ymin ) {
	this.xmin = xmin ;
	this.ymin = ymin ;
	this.xmax = xmax ;
	this.ymax = ymax ;
} ;



// Prepare a bounding box for a sequence of .merge()/.ensurePoint(), making it invert-infinitely large
BoundingBox.prototype.nullify = function() {
    this.xmin = Infinity ;
    this.xmax = - Infinity ;
    this.ymin = Infinity ;
    this.ymax = - Infinity ;
} ;



BoundingBox.prototype.isNull = function() {
	return this.xmin === Infinity && this.xmax === - Infinity && this.ymin === Infinity && this.ymax === - Infinity ;
} ;



Object.defineProperties( BoundingBox.prototype , {
	x: {
		get: function() { return this.xmin ; } ,
		set: function( x ) {
			// Preserve width
			var width = this.xmax - this.xmin ;
			this.xmin = x ;
			this.xmax = this.xmin + width ;
		}
	} ,
	y: {
		get: function() { return this.ymin ; } ,
		set: function( y ) {
			// Preserve height
			var height = this.ymax - this.ymin ;
			this.ymin = y ;
			this.ymax = this.ymin + height ;
		}
	} ,
	width: {
		get: function() { return this.xmax - this.xmin ; } ,
		set: function( width ) { this.xmax = this.xmin + width ; }
	} ,
	height: {
		get: function() { return this.ymax - this.ymin ; } ,
		set: function( height ) { this.ymax = this.ymin + height ; }
	}
} ) ;



BoundingBox.prototype.export = function() {
	return {
		xmin: this.xmin ,
		ymin: this.ymin ,
		xmax: this.xmax ,
		ymax: this.ymax
	} ;
} ;



BoundingBox.prototype.dup =
BoundingBox.prototype.clone = function() {
	return new BoundingBox( this.xmin , this.ymin , this.xmax , this.ymax ) ;
} ;



// Merge two bounding box
BoundingBox.prototype.merge = function( bbox ) {
	this.xmin = Math.min( this.xmin , bbox.xmin ) ;
	this.ymin = Math.min( this.ymin , bbox.ymin ) ;
	this.xmax = Math.max( this.xmax , bbox.xmax ) ;
	this.ymax = Math.max( this.ymax , bbox.ymax ) ;
} ;



BoundingBox.prototype.mergeArray = function( bboxList ) {
	for ( let bbox of bboxList ) {
		this.xmin = Math.min( this.xmin , bbox.xmin ) ;
		this.ymin = Math.min( this.ymin , bbox.ymin ) ;
		this.xmax = Math.max( this.xmax , bbox.xmax ) ;
		this.ymax = Math.max( this.ymax , bbox.ymax ) ;
	}
} ;



// Ensure that the bounding box includes a point, like .merge() but for singularity
BoundingBox.prototype.ensurePoint = function( point ) {
	this.xmin = Math.min( this.xmin , point.x ) ;
	this.ymin = Math.min( this.ymin , point.y ) ;
	this.xmax = Math.max( this.xmax , point.x ) ;
	this.ymax = Math.max( this.ymax , point.y ) ;
} ;



BoundingBox.prototype.ensurePointArray = function( pointList ) {
	for ( let point of pointList ) {
		this.xmin = Math.min( this.xmin , point.x ) ;
		this.ymin = Math.min( this.ymin , point.y ) ;
		this.xmax = Math.max( this.xmax , point.x ) ;
		this.ymax = Math.max( this.ymax , point.y ) ;
	}
} ;



BoundingBox.prototype.isEqualTo = function( bbox ) {
	return bbox.xmin === this.xmin && bbox.xmax === this.xmax && bbox.ymin === this.ymin && bbox.ymax === this.ymax ;
} ;



// Is equal to a foreign object, support both the xmin/xmax/ymin/ymax and the x/y/width/height format
BoundingBox.prototype.isEqualToObject = function( object ) {
	if ( object.width !== undefined ) {
		return object.x === this.xmin && object.width === this.width && object.y === this.ymin && object.height === this.height ;
	}

	if ( object.xmin !== undefined ) {
		return object.xmin === this.xmin && object.xmax === this.xmax && object.ymin === this.ymin && object.ymax === this.ymax ;
	}

	return false ;
} ;



BoundingBox.prototype.isInside = function( coords ) {
	return coords.x >= this.xmin && coords.x <= this.xmax && coords.y >= this.ymin && coords.y <= this.ymax ;
} ;



BoundingBox.prototype.enlarge = function( value ) {
	value = + value || 0 ;
	if ( value < 0 ) { return this.shrink( - value ) ; }
	this.xmin -= value ;
	this.xmax += value ;
	this.ymin -= value ;
	this.ymax += value ;
} ;



BoundingBox.prototype.shrink = function( value , min = 0 ) {
	value = + value || 0 ;
	if ( value < 0 ) { return this.enlarge( - value ) ; }

	var width = this.xmax - this.xmin ,
		height = this.ymax - this.ymin ;

	if ( width < 2 * value ) {
		this.xmin += width / 2 - min / 2 ;
		this.xmax -= width / 2 - min / 2 ;
	}
	else {
		this.xmin += value ;
		this.xmax -= value ;
	}

	if ( height < 2 * value ) {
		this.ymin += height / 2 - min / 2 ;
		this.ymax -= height / 2 - min / 2 ;
	}
	else {
		this.ymin += value ;
		this.ymax -= value ;
	}
} ;

