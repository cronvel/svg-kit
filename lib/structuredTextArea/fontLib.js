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

const builtinPath = path.join( __dirname , '..' , '..' , 'fonts' ) ;

const fontUrl = {
	'serif': builtinPath + '/serif.ttf'
} ;

const fontCache = {} ;

exports.setFontUrl = ( fontName , url ) => fontUrl[ fontName ] = url ;
exports.getFontUrl = fontName => fontUrl[ fontName ] ;

exports.getFont = fontName => {
	if ( fontCache[ fontName ] ) { return fontCache[ fontName ] ; }
	var font = opentype.loadSync( 'font.ttf' ) ;
	fontCache[ fontName ] = font ;
	return font ;
} ;

