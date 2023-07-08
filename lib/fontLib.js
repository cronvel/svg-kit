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
const opentype = require( 'opentype.js' ) ;



const fontLib = {} ;
module.exports = fontLib ;



const fontUrl = {} ;
const fontCache = {} ;

fontLib.setFontUrl = ( fontName , url ) => fontUrl[ fontName ] = url ;
fontLib.getFontUrl = fontName => fontUrl[ fontName ] ;



if ( process?.browser ) {
	fontLib.getFontAsync = async ( fontName ) => {
		if ( fontCache[ fontName ] ) { return fontCache[ fontName ] ; }

		var url = fontLib.getFontUrl( fontName ) ;
		if ( ! url ) { return null ; }

		var response = await fetch( url ) ;

		if ( ! response.ok ) {
			throw new Error( "HTTP error! Status: " + response.status ) ;
		}

		var blob = await response.blob() ;
		var arrayBuffer = await blob.arrayBuffer() ;
		var font = await opentype.parse( arrayBuffer ) ;
		fontCache[ fontName ] = font ;
		console.log( "Loaded font: " , fontName , font ) ;

		return font ;
	} ;

	fontLib.getFont = fontName => {
		var font = fontCache[ fontName ] ;
		if ( font ) { return font ; }
		//console.error( "Font not found:" , fontName , fontCache ) ;
		throw new Error( "Font '" + fontName + "' was not preloaded and we can't load synchronously inside a web browser..." ) ;
	} ;
}
else {
	const builtinPath = path.join( __dirname , '..' , '..' , 'fonts' ) ;

	fontUrl['serif'] = builtinPath + '/serif.ttf' ;

	fontLib.getFont = fontName => {
		if ( fontCache[ fontName ] ) { return fontCache[ fontName ] ; }

		var url = fontLib.getFontUrl( fontName ) ;
		if ( ! url ) { return null ; }

		var font = opentype.loadSync( url ) ;
		fontCache[ fontName ] = font ;

		return font ;
	} ;
}

