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



const DEFAULT_STYLE = {
	fill: null ,
	stroke: null ,
	strokeWidth: 1 ,
	opacity: 1 ,
	paintOrder: null
} ;



function Style( params ) {
	this.fill = null ;
	this.stroke = null ;
	this.strokeWidth = 1 ;
	this.opacity = 1 ;
	this.paintOrder = null ;

	if ( params ) { this.set( params ) ; }
}

module.exports = Style ;



// Getters/Setters

Style.prototype.set = function( params ) {
	if ( ! params || typeof params !== 'object' ) { return ; }
	
	if ( params.fill !== undefined ) { this.fill = params.fill ; }
	if ( params.stroke !== undefined ) { this.stroke = params.stroke ; }
	if ( typeof params.strokeWidth === 'number' ) { this.strokeWidth = params.strokeWidth ; }
	if ( params.opacity !== undefined ) { this.opacity = params.opacity ; }
	if ( params.paintOrder !== undefined ) { this.paintOrder = params.paintOrder ; }
} ;



Style.prototype.export = function( data = {} ) {
	var hasKey = false ;

	for ( let key of Object.keys( this ) ) {
		if ( this[ key ] !== DEFAULT_STYLE[ key ] ) {
			data[ key ] = this[ key ] ;
			hasKey = true ;
		}
	}

	if ( ! hasKey ) { return null ; }

	return data ;
} ;

