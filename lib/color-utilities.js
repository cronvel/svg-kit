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



const Color = require( 'palette-shade' ).Color ;



const colorUtilities = {} ;
module.exports = colorUtilities ;



const FALLBACK_COLOR = '#f0f' ;

colorUtilities.colorToString = ( color , palette = null ) => {
	if ( ! color ) { return FALLBACK_COLOR ; }

	if ( typeof color === 'string' ) {
		if ( color[ 0 ] === '%' ) {
			if ( ! palette ) { return FALLBACK_COLOR ; }
			return palette.getHex( Color.parse( color.slice( 1 ) ) ) ;
		}

		return color ;
	}

	if ( typeof color === 'object' ) {
		if ( ! palette ) { return FALLBACK_COLOR ; }
		return palette.getHex( color ) ;
	}

	return FALLBACK_COLOR ;
} ;



// From Terminal-kit's misc.hexToRgba()
colorUtilities.hexToRgba = hex => {
	// Strip the # if necessary
	if ( hex[ 0 ] === '#' ) { hex = hex.slice( 1 ) ; }

	if ( hex.length === 3 ) {
		hex = hex[ 0 ] + hex[ 0 ] + hex[ 1 ] + hex[ 1 ] + hex[ 2 ] + hex[ 2 ] ;
	}

	return {
		r: parseInt( hex.slice( 0 , 2 ) , 16 ) || 0 ,
		g: parseInt( hex.slice( 2 , 4 ) , 16 ) || 0 ,
		b: parseInt( hex.slice( 4 , 6 ) , 16 ) || 0 ,
		a: hex.length > 6 ? parseInt( hex.slice( 6 , 8 ) , 16 ) || 0 : 255
	} ;
} ;



colorUtilities.hexToRgb = hex => {
	// Strip the # if necessary
	if ( hex[ 0 ] === '#' ) { hex = hex.slice( 1 ) ; }

	if ( hex.length === 3 ) {
		hex = hex[ 0 ] + hex[ 0 ] + hex[ 1 ] + hex[ 1 ] + hex[ 2 ] + hex[ 2 ] ;
	}

	return {
		r: parseInt( hex.slice( 0 , 2 ) , 16 ) || 0 ,
		g: parseInt( hex.slice( 2 , 4 ) , 16 ) || 0 ,
		b: parseInt( hex.slice( 4 , 6 ) , 16 ) || 0
	} ;
} ;



function to2HexDigits( n ) {
	if ( ! n || n < 0 ) { return '00' ; }
	if ( n < 16 ) { return '0' + n.toString( 16 ) ; }
	if ( n > 255 ) { return 'ff' ; }
	return n.toString( 16 ) ;
}



colorUtilities.rgbToHex =
colorUtilities.rgbaToHex = ( r , g , b , a = null ) => {
	if ( r && typeof r === 'object' ) {
		return typeof r.a !== 'number' ? '#' + to2HexDigits( r.r ) + to2HexDigits( r.g ) + to2HexDigits( r.b ) :
			'#' + to2HexDigits( r.r ) + to2HexDigits( r.g ) + to2HexDigits( r.b ) + to2HexDigits( r.a ) ;
	}

	return a === null ? '#' + to2HexDigits( r ) + to2HexDigits( g ) + to2HexDigits( b ) :
		'#' + to2HexDigits( r ) + to2HexDigits( g ) + to2HexDigits( b ) + to2HexDigits( a ) ;
} ;



colorUtilities.getContrastColorCode = ( colorStr , rate = 0.5 ) => {
	var color = colorUtilities.hexToRgb( colorStr ) ;

	if ( color.r + color.g + color.b >= 192 ) {
		// This is a light color, we will contrast it with a darker color
		color.r = Math.round( color.r * rate ) ;
		color.g = Math.round( color.g * rate ) ;
		color.b = Math.round( color.b * rate ) ;
	}
	else {
		// This is a dark color, we will contrast it with a lighter color
		color.r = Math.round( 255 - ( ( 255 - color.r ) * rate ) ) ;
		color.g = Math.round( 255 - ( ( 255 - color.g ) * rate ) ) ;
		color.b = Math.round( 255 - ( ( 255 - color.b ) * rate ) ) ;
	}

	return colorUtilities.rgbToHex( color ) ;
} ;

