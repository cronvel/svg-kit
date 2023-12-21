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



const misc = require( '../misc.js' ) ;
const format = require( 'string-kit/lib/format.js' ) ;
const bookSource = require( 'book-source' ) ;



const structuredText = {} ;
module.exports = structuredText ;



structuredText.parseMarkup = function( sourceText ) {
	var structuredTextParts = [] ,
		structuredDocument = bookSource.parse( sourceText ) ;
	
	for ( let part of structuredDocument.parts ) {
		if ( part.type !== 'paragraph' ) { continue ; }

		for ( let child of part.parts ) {
			// Don't convert unsupported stuff ATM
			if ( ! ( child instanceof bookSource.InlineTextPart ) ) { continue ; }

			var outputPart = { text: child.text } ;

			if ( child.type === 'emphasisText' ) {
				if ( child.level === 1 ) {
					outputPart.fontStyle = 'italic' ;
				}
				else if ( child.level === 2 ) {
					outputPart.fontWeight = 'bold' ;
				}
				else if ( child.level >= 2 ) {
					outputPart.fontStyle = 'italic' ;
					outputPart.fontWeight = 'bold' ;
				}
			}

			if ( child.type === 'decoratedText' ) {
				// child.level can be 1 or 2, should modify thickness or produce double lines
				outputPart.underline = true ;
			}
			
			if ( child.style ) {
				structuredText.populateStyle( child.style , outputPart ) ;
			}

			structuredTextParts.push( outputPart ) ;
		}
	}
	
	return structuredTextParts ;
} ;



structuredText.populateStyle = function( style , part ) {
	if ( style.italic ) { part.fontStyle = 'italic' ; }
	if ( style.bold ) { part.fontWeight = 'bold' ; }
	if ( style.underline ) { part.underline = true ; }

	if ( style.textColor ) { part.color = style.textColor ; }

	if ( style.backgroundColor ) {
		part.frame = true ;
		part.frameColor = style.backgroundColor ;
		part.frameOutlineColor = "#777" ;	// <-- TEMP
	}
} ;





// Old (deprecated?) Quick-Markup



const MARKUP_COLOR_CODE = {
	black: '#000000' ,
	brightBlack: '#555753' ,
	red: '#cc0000' ,
	brightRed: '#ef2929' ,
	green: '#4e9a06' ,
	brightGreen: '#8ae234' ,
	yellow: '#c4a000' ,
	brightYellow: '#fce94f' ,
	blue: '#3465a4' ,
	brightBlue: '#729fcf' ,
	magenta: '#75507b' ,
	brightMagenta: '#ad7fa8' ,
	cyan: '#06989a' ,
	brightCyan: '#34e2e2' ,
	white: '#d3d7cf' ,
	brightWhite: '#eeeeec'
} ;

MARKUP_COLOR_CODE.grey = MARKUP_COLOR_CODE.gray = MARKUP_COLOR_CODE.brightBlack ;



structuredText.parseQuickMarkup = function( text ) {
	return structuredText.parseStringKitMarkup( text ).map( input => {
		var part = { text: input.text } ;

		if ( input.color ) {
			part.color = input.color[ 0 ] === '#' ? input.color : MARKUP_COLOR_CODE[ input.color ] ;
		}

		if ( input.italic ) { part.fontStyle = 'italic' ; }
		if ( input.bold ) { part.fontWeight = 'bold' ; }
		if ( input.underline ) { part.underline = true ; }
		if ( input.strike ) { part.lineThrough = true ; }
		if ( input.big ) { part.fontSize = '1.4em' ; }
		if ( input.small ) { part.fontSize = '0.7em' ; }

		if ( input.bgColor ) {
			part.frame = true ;
			part.frameColor = input.bgColor[ 0 ] === '#' ? input.bgColor : MARKUP_COLOR_CODE[ input.bgColor ] ;
			part.frameOutlineColor = misc.getContrastColorCode( part.frameColor , 0.7 ) ;
		}

		return part ;
	} ) ;
} ;



// Catch-all keywords to key:value
const CATCH_ALL_KEYWORDS = {
	// Foreground colors
	defaultColor: [ 'color' , 'default' ] ,
	black: [ 'color' , 'black' ] ,
	red: [ 'color' , 'red' ] ,
	green: [ 'color' , 'green' ] ,
	yellow: [ 'color' , 'yellow' ] ,
	blue: [ 'color' , 'blue' ] ,
	magenta: [ 'color' , 'magenta' ] ,
	cyan: [ 'color' , 'cyan' ] ,
	white: [ 'color' , 'white' ] ,
	grey: [ 'color' , 'grey' ] ,
	gray: [ 'color' , 'gray' ] ,
	brightBlack: [ 'color' , 'brightBlack' ] ,
	brightRed: [ 'color' , 'brightRed' ] ,
	brightGreen: [ 'color' , 'brightGreen' ] ,
	brightYellow: [ 'color' , 'brightYellow' ] ,
	brightBlue: [ 'color' , 'brightBlue' ] ,
	brightMagenta: [ 'color' , 'brightMagenta' ] ,
	brightCyan: [ 'color' , 'brightCyan' ] ,
	brightWhite: [ 'color' , 'brightWhite' ] ,

	// Background colors
	defaultBgColor: [ 'bgColor' , 'default' ] ,
	bgBlack: [ 'bgColor' , 'black' ] ,
	bgRed: [ 'bgColor' , 'red' ] ,
	bgGreen: [ 'bgColor' , 'green' ] ,
	bgYellow: [ 'bgColor' , 'yellow' ] ,
	bgBlue: [ 'bgColor' , 'blue' ] ,
	bgMagenta: [ 'bgColor' , 'magenta' ] ,
	bgCyan: [ 'bgColor' , 'cyan' ] ,
	bgWhite: [ 'bgColor' , 'white' ] ,
	bgGrey: [ 'bgColor' , 'grey' ] ,
	bgGray: [ 'bgColor' , 'gray' ] ,
	bgBrightBlack: [ 'bgColor' , 'brightBlack' ] ,
	bgBrightRed: [ 'bgColor' , 'brightRed' ] ,
	bgBrightGreen: [ 'bgColor' , 'brightGreen' ] ,
	bgBrightYellow: [ 'bgColor' , 'brightYellow' ] ,
	bgBrightBlue: [ 'bgColor' , 'brightBlue' ] ,
	bgBrightMagenta: [ 'bgColor' , 'brightMagenta' ] ,
	bgBrightCyan: [ 'bgColor' , 'brightCyan' ] ,
	bgBrightWhite: [ 'bgColor' , 'brightWhite' ] ,

	// Other styles
	dim: [ 'dim' , true ] ,
	bold: [ 'bold' , true ] ,
	underline: [ 'underline' , true ] ,
	italic: [ 'italic' , true ] ,
	inverse: [ 'inverse' , true ] ,
	strike: [ 'strike' , true ]
} ;



const parseStringKitMarkupConfig = {
	parse: true ,
	markupReset: markupStack => {
		markupStack.length = 0 ;
	} ,
	//shiftMarkup: { '#': 'background' } ,
	markup: {
		":": null ,
		" ": markupStack => {
			markupStack.length = 0 ;
			return [ null , ' ' ] ;
		} ,

		"-": { dim: true } ,
		"+": { bold: true } ,
		"_": { underline: true } ,
		"/": { italic: true } ,
		"!": { inverse: true } ,
		"~": { strike: true } ,
		"=": { big: true } ,
		".": { small: true } ,

		"b": { color: "blue" } ,
		"B": { color: "brightBlue" } ,
		"c": { color: "cyan" } ,
		"C": { color: "brightCyan" } ,
		"g": { color: "green" } ,
		"G": { color: "brightGreen" } ,
		"k": { color: "black" } ,
		"K": { color: "grey" } ,
		"m": { color: "magenta" } ,
		"M": { color: "brightMagenta" } ,
		"r": { color: "red" } ,
		"R": { color: "brightRed" } ,
		"w": { color: "white" } ,
		"W": { color: "brightWhite" } ,
		"y": { color: "yellow" } ,
		"Y": { color: "brightYellow" }
	} ,
	shiftedMarkup: {
		background: {
			/*
			':': [ null , { defaultColor: true , bgDefaultColor: true } ] ,
			' ': markupStack => {
				markupStack.length = 0 ;
				return [ null , { defaultColor: true , bgDefaultColor: true } , ' ' ] ;
			} ,
			*/
			":": null ,
			" ": markupStack => {
				markupStack.length = 0 ;
				return [ null , ' ' ] ;
			} ,

			"b": { bgColor: "blue" } ,
			"B": { bgColor: "brightBlue" } ,
			"c": { bgColor: "cyan" } ,
			"C": { bgColor: "brightCyan" } ,
			"g": { bgColor: "green" } ,
			"G": { bgColor: "brightGreen" } ,
			"k": { bgColor: "black" } ,
			"K": { bgColor: "grey" } ,
			"m": { bgColor: "magenta" } ,
			"M": { bgColor: "brightMagenta" } ,
			"r": { bgColor: "red" } ,
			"R": { bgColor: "brightRed" } ,
			"w": { bgColor: "white" } ,
			"W": { bgColor: "brightWhite" } ,
			"y": { bgColor: "yellow" } ,
			"Y": { bgColor: "brightYellow" }
		}
	} ,
	dataMarkup: {
		color: 'color' ,
		fgColor: 'color' ,
		fg: 'color' ,
		c: 'color' ,
		bgColor: 'bgColor' ,
		bg: 'bgColor' ,
		fx: 'fx'
	} ,
	markupCatchAll: ( markupStack , key , value ) => {
		var attr = {} ;

		if ( value === undefined ) {
			if ( key[ 0 ] === '#' ) {
				attr.color = key ;
			}
			else if ( CATCH_ALL_KEYWORDS[ key ] ) {
				attr[ CATCH_ALL_KEYWORDS[ key ][ 0 ] ] = CATCH_ALL_KEYWORDS[ key ][ 1 ] ;
			}
			else {
				// Fallback: it's a foreground color
				attr.color = key ;
			}
		}

		markupStack.push( attr ) ;
		return attr || {} ;
	}
} ;



structuredText.parseStringKitMarkup = ( ... args ) => {
	return format.markupMethod.apply( parseStringKitMarkupConfig , args ) ;
} ;



structuredText.stripMarkup = format.stripMarkup ;

