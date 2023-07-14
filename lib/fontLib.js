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

/*
	This is a cache for the loaded fonts.
*/

const path = require( 'path' ) ;
const fs = require( 'fs' ) ;
const opentype = require( 'opentype.js' ) ;



const fontLib = {} ;
module.exports = fontLib ;



function FontUrl( family , ... variantsUrl ) {
	this.family = family ;
	this.variantsUrl = {} ;
	if ( variantsUrl ) { this.setUrls( ... variantsUrl ) ; }
}

fontLib.FontUrl = FontUrl ;



FontUrl.getCode = function( style = 'regular' , weight = 'regular' , stretch = 'regular' ) {
	var styleCode = STYLE_MAP[ style ] ,
		weightCode = WEIGHT_MAP[ weight ] ,
		stretchCode = STRETCH_MAP[ stretch ] ;

	if ( styleCode === undefined || weightCode === undefined || stretchCode === undefined ) {
		throw new Error( "FontUrl: bad font variant (" + style + ',' + weight + ',' + stretch + ')' ) ;
	}

	return styleCode * 81 + weightCode * 9 + stretchCode ;
} ;



FontUrl.prototype.setUrls = function( ... variantsUrl ) {
	if ( ! Array.isArray( variantsUrl[ 0 ] ) ) {
		this.setUrl( ... variantsUrl ) ;
	}
	else {
		for ( let variantUrl of variantsUrl ) {
			this.setUrl( ... variantUrl ) ;
		}
	}
} ;



FontUrl.prototype.setUrl = function( ... variantUrl ) {
	var style , weight , stretch ,
		url = variantUrl[ variantUrl.length - 1 ] ;

	style = weight = stretch = 'regular' ;

	for ( let index = 0 ; index < variantUrl.length - 1 ; index ++ ) {
		let property = variantUrl[ index ] ;
		if ( ! NEUTRAL_MAP[ property ] ) {
			if ( STYLE_MAP[ property ] !== undefined ) { style = property ; }
			else if ( WEIGHT_MAP[ property ] !== undefined ) { weight = property ; }
			else if ( STRETCH_MAP[ property ] !== undefined ) { stretch = property ; }
		}
	}

	var code = FontUrl.getCode( style , weight , stretch ) ;

	this.variantsUrl[ code ] = url ;
} ;



FontUrl.prototype.getUrl = function( ... variant ) {
	var style , weight , stretch ;

	style = weight = stretch = 'regular' ;

	for ( let property of variant ) {
		if ( ! NEUTRAL_MAP[ property ] ) {
			if ( STYLE_MAP[ property ] !== undefined ) { style = property ; }
			else if ( WEIGHT_MAP[ property ] !== undefined ) { weight = property ; }
			else if ( STRETCH_MAP[ property ] !== undefined ) { stretch = property ; }
		}
	}

	var code = FontUrl.getCode( style , weight , stretch ) ;

	return this.variantsUrl[ code ] ;
} ;



const fontUrlByFamily = {} ;
fontLib.fontUrlByFamily = fontUrlByFamily ;
const fontCache = {} ;

fontLib.setFontUrl = ( fontFamily , ... variantsUrl ) => {
	var fontUrl = fontUrlByFamily[ fontFamily ] ;

	if ( fontUrl ) {
		fontUrl.setUrls( ... variantsUrl ) ;
	}
	else {
		fontUrlByFamily[ fontFamily ] = new FontUrl( fontFamily , ... variantsUrl ) ;
	}
} ;

fontLib.getFontUrl = ( fontFamily , ... variant ) => {
	var fontUrl = fontUrlByFamily[ fontFamily ] ;
	if ( ! fontUrl ) { return ; }
	return fontUrl.getUrl( ... variant ) ;
} ;



// Neutral and common property names
const NEUTRAL_MAP = {
	normal: true ,
	regular: true ,
	medium: true
} ;

// Font style
const STYLE_MAP = {
	normal: 0 ,
	regular: 0 ,
	oblique: 1 ,
	italic: 2
} ;

// Font weight
const WEIGHT_MAP = {
	thin: 0 ,		// 100
	hairline: 0 ,
	extraLight: 1 ,	// 200
	'extra-light': 1 ,
	ultraLight: 1 ,
	'ultra-light': 1 ,
	light: 2 ,		// 300
	normal: 3 ,		// 400
	regular: 3 ,
	medium: 4 ,		// 500
	semiBold: 5 ,	// 600
	'semi-bold': 5 ,
	demiBold: 5 ,
	'demi-bold': 5 ,
	bold: 6 ,		// 700
	extraBold: 7 ,	// 800
	'extra-bold': 7 ,
	ultraBold: 7 ,
	'ultra-bold': 7 ,
	heavy: 8 ,		// 900
	black: 8
} ;

// Font stretch/font width
const STRETCH_MAP = {
	ultraCondensed: 0 ,		// 50%
	'ultra-condensed': 0 ,
	extraCondensed: 1 ,		// 62.5%
	'extra-condensed': 1 ,
	condensed: 2 ,			// 75%
	semiCondensed: 3 , 		// 87.5%
	'semi-condensed': 3 ,
	medium: 4 ,				// 100%
	normal: 4 ,
	regular: 4 ,
	semiExpanded: 5 ,		// 112.5%
	'semi-expanded': 5 ,
	expanded: 6 ,			// 125%
	extraExpanded: 7 ,		// 150%
	'extra-expanded': 7 ,
	ultraExpanded: 8 ,		// 200%
	'ultra-expanded': 8
} ;



if ( process?.browser ) {
	fontLib.getFontAsync = ( fontFamily , ... variant ) => {
		var url = fontLib.getFontUrl( fontFamily , ... variant ) ;
		if ( ! url ) { return null ; }
		return fontLib.getFontByUrlAsync( url ) ;
	} ;

	fontLib.getFontByUrlAsync = async ( url ) => {
		if ( fontCache[ url ] ) { return fontCache[ url ] ; }

		var response = await fetch( url ) ;

		if ( ! response.ok ) {
			throw new Error( "HTTP error! Status: " + response.status ) ;
		}

		var blob = await response.blob() ;
		var arrayBuffer = await blob.arrayBuffer() ;
		var font = await opentype.parse( arrayBuffer ) ;
		fontCache[ url ] = font ;
		console.log( "Loaded font: " , url , font ) ;

		return font ;
	} ;

	fontLib.getFont = ( fontFamily , ... variant ) => {
		var url = fontLib.getFontUrl( fontFamily , ... variant ) ;
		if ( ! url ) { return null ; }

		if ( fontCache[ url ] ) { return fontCache[ url ] ; }

		//console.error( "Font not found:" , fontName , fontCache ) ;
		throw new Error( "Font " + [ fontFamily , ... variant ].join( ', ' ) + " was not preloaded and we can't load synchronously inside a web browser..." ) ;
	} ;
}
else {
	const builtinPath = path.join( __dirname , '..' , 'fonts' ) ;

	fontLib.setFontUrl( 'serif' , builtinPath + '/serif.ttf' ) ;
	fontLib.setFontUrl( 'serif' , 'italic' , builtinPath + '/serif-italic.ttf' ) ;
	fontLib.setFontUrl( 'serif' , 'bold' , builtinPath + '/serif-bold.ttf' ) ;
	fontLib.setFontUrl( 'serif' , 'bold' , 'italic' , builtinPath + '/serif-bold+italic.ttf' ) ;

	fontLib.getFontAsync = ( fontFamily , ... variant ) => {
		var url = fontLib.getFontUrl( fontFamily , ... variant ) ;
		if ( ! url ) { return null ; }
		return fontLib.getFontByUrlAsync( url ) ;
	} ;

	fontLib.getFontByUrlAsync = async ( url ) => {
		if ( fontCache[ url ] ) { return fontCache[ url ] ; }

		var buffer = await fs.promises.readFile( url ) ;
		var font = await opentype.parse( buffer ) ;
		fontCache[ url ] = font ;
		console.log( "Loaded (async) font: " , url , font ) ;

		return font ;
	} ;

	fontLib.getFont = ( fontFamily , ... variant ) => {
		var url = fontLib.getFontUrl( fontFamily , ... variant ) ;
		if ( ! url ) { return null ; }

		if ( fontCache[ url ] ) { return fontCache[ url ] ; }

		var font = opentype.loadSync( url ) ;
		fontCache[ url ] = font ;
		console.log( "Loaded (sync) font: " , fontFamily , ... variant , font ) ;

		return font ;
	} ;
}



fontLib.preloadFontFamily = async ( fontFamily ) => {
	var fontUrl = fontUrlByFamily[ fontFamily ] ;
	if ( ! fontUrl ) { throw new Error( "Font family not found: " + fontFamily ) ; }
	return Promise.all( Object.values( fontUrl.variantsUrl ).map( url => fontLib.getFontByUrlAsync( url ) ) ) ;
} ;

