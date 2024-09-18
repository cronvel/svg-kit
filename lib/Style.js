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



const colorUtilities = require( './color-utilities.js' ) ;

const camel = require( 'string-kit/lib/camel' ) ;
const escape = require( 'string-kit/lib/escape' ) ;



const DEFAULT_STYLE = {
	fill: null ,
	stroke: null ,
	strokeWidth: 1 ,
	opacity: 1 ,
	paintOrder: [ 'fill' , 'stroke' , 'markers' ]
} ;



function Style( params ) {
	this.fill = null ;
	this.stroke = null ;
	this.strokeWidth = 1 ;
	this.opacity = 1 ;
	this.paintOrder = [ ... DEFAULT_STYLE.paintOrder ] ;

	if ( params ) { this.set( params ) ; }
}

module.exports = Style ;



// Getters/Setters

Style.prototype.set = function( params ) {
	if ( ! params || typeof params !== 'object' ) { return ; }

	if ( params.fill === null || typeof params.fill === 'string' ) { this.fill = params.fill || null ; }
	if ( params.stroke === null || typeof params.stroke === 'string' ) { this.stroke = params.stroke || null ; }
	if ( typeof params.strokeWidth === 'number' ) { this.strokeWidth = + params.strokeWidth || 0 ; }
	if ( typeof params.opacity === 'number' ) { this.opacity = + params.opacity || 0 ; }
	if ( params.paintOrder !== undefined ) { this.setPaintOrder( params.paintOrder ) ; }
} ;



const PAINT_ORDER_VALUES = new Set( [ 'fill' , 'stroke' , 'markers' ] ) ;

Style.prototype.setPaintOrder = function( paintOrder ) {
	if ( typeof paintOrder === 'string' ) {
		paintOrder = paintOrder.trim() ;
		paintOrder = paintOrder === 'normal' ? null : paintOrder.split( / +/ ) ;
	}

	if ( paintOrder === null ) {
		paintOrder = [ ... DEFAULT_STYLE.paintOrder ] ;
		return ;
	}

	if ( ! Array.isArray( paintOrder ) ) { return ; }

	let filteredPaintOrder = new Set() ;

	for ( let value of paintOrder ) {
		if ( PAINT_ORDER_VALUES.has( value ) ) { filteredPaintOrder.add( value ) ; }
	}

	if ( filteredPaintOrder.size < PAINT_ORDER_VALUES.size ) {
		for ( let value of PAINT_ORDER_VALUES ) { filteredPaintOrder.add( value ) ; }
	}

	paintOrder = [ ... filteredPaintOrder ] ;

	this.paintOrder = paintOrder ;
} ;



Style.prototype.export = function( data = {} ) {
	var hasKey = false ;

	for ( let key of Object.keys( DEFAULT_STYLE ) ) {
		if ( Array.isArray( this[ key ] ) ) {
			if ( this[ key ].some( ( v , i ) => DEFAULT_STYLE[ key ][ i ] !== v ) ) {
				data[ key ] = this[ key ] ;
				hasKey = true ;
			}
		}
		else if ( this[ key ] !== DEFAULT_STYLE[ key ] ) {
			data[ key ] = this[ key ] ;
			hasKey = true ;
		}
	}

	if ( ! hasKey ) { return null ; }

	return data ;
} ;



Style.prototype.escape = function( value ) {
	if ( typeof value === 'object' ) { return null ; }
	if ( typeof value !== 'string' ) { return value ; }
	return escape.htmlAttr( value ) ;
} ;



const STYLE_PROPERTY_UNIT = {
	fontSize: 'px'
} ;

const STYLE_PROPERTY_COLOR = {
	fill: true ,
	stroke: true
} ;

const STYLE_PROPERTY_JOIN = {
	paintOrder: true
} ;

Style.prototype.getSvgStyleString = function( palette , addInitialSpace = false ) {
	var str = '' ;

	for ( let key of Object.keys( DEFAULT_STYLE ) ) {
		// Default style does not need to be specified
		if ( Array.isArray( this[ key ] ) ) {
			if ( this[ key ].every( ( v , i ) => DEFAULT_STYLE[ key ][ i ] === v ) ) { continue ; }
		}
		else if ( this[ key ] === DEFAULT_STYLE[ key ] ) { continue ; }

		let value = this[ key ] === null ? '' : this[ key ] ;

		if ( typeof value === 'number' && STYLE_PROPERTY_UNIT[ key ] ) {
			value = '' + value + STYLE_PROPERTY_UNIT[ key ] ;
		}
		else if ( STYLE_PROPERTY_COLOR[ key ] ) {
			value = colorUtilities.colorToString( value , palette ) ;
		}
		else if ( STYLE_PROPERTY_JOIN[ key ] ) {
			value = value.join( ' ' ) ;
		}

		// Key is in camelCase, but should use dash
		str += this.escape( camel.camelCaseToDash( key ) ) + ':' + this.escape( value ) + ';' ;
	}

	if ( str ) {
		str = ( addInitialSpace ? ' ' : '' ) + 'style="' + str + '"' ;
	}

	return str ;
} ;



Style.prototype.setDomSvgStyle = function( $element , palette ) {
	for ( let key of Object.keys( DEFAULT_STYLE ) ) {
		let value = this[ key ] === null ? '' : this[ key ] ;

		if ( typeof value === 'number' && STYLE_PROPERTY_UNIT[ key ] ) {
			value = '' + value + STYLE_PROPERTY_UNIT[ key ] ;
		}
		else if ( STYLE_PROPERTY_COLOR[ key ] ) {
			value = colorUtilities.colorToString( value , palette ) ;
		}
		else if ( STYLE_PROPERTY_JOIN[ key ] ) {
			value = value.join( ' ' ) ;
		}

		// Key is already in camelCase
		$element.style[ key ] = value ;
	}
} ;

