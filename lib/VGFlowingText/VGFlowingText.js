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



const VGEntity = require( '../VGEntity.js' ) ;

const StructuredTextPart = require( './StructuredTextPart.js' ) ;
const StructuredTextLine = require( './StructuredTextLine.js' ) ;
const TextAttribute = require( './TextAttribute.js' ) ;
const TextMetrics = require( './TextMetrics.js' ) ;

const fontLib = require( './fontLib.js' ) ;
//const opentype = require( 'opentype.js' ) ;



function VGFlowingText( params = {} ) {
	VGEntity.call( this , params ) ;

	this.x = + params.x || 0 ;
	this.y = + params.y || 0 ;
	this.width = + params.width || 0 ;
	this.height = + params.height || 0 ;
	this.structuredText = [] ;	// Array of StructuredTextPart, the source
	this.attr = new TextAttribute( params.attr ) ;
	this.lineSpacing = + params.lineSpacing || 0 ;
	this.textWrapping = params.textWrapping || null ;	// null/ellipsis/wordWrap
	this.textHorizontalAlignment = this.textHorizontalAlignment || null ;	// null/left/right/center
	//this.textVerticalAlignment = this.textVerticalAlignment || null ;	// null/top/bottom/middle

	// Computed
	this.isDirty = true ;
	this.structuredTextLine = [] ;	// Array of StructuredTextLine
	this.contentWidth = 0 ;
	this.contentHeight = 0 ;
	this.characterCount = 0 ;

	if ( params.structuredText ) { this.setStructuredText( params.structuredText ) ; }
}

module.exports = VGFlowingText ;

VGFlowingText.prototype = Object.create( VGEntity.prototype ) ;
VGFlowingText.prototype.constructor = VGFlowingText ;
VGFlowingText.prototype.__prototypeUID__ = 'svg-kit/VGFlowingText' ;
VGFlowingText.prototype.__prototypeVersion__ = require( '../../package.json' ).version ;



VGFlowingText.prototype.isRenderingContainer = true ;
VGFlowingText.prototype.svgTag = 'g' ;
//VGFlowingText.prototype.svgAttributes = function( root = this ) {} ;

//VGFlowingText.prototype.set = function( params ) {} ;



VGFlowingText.prototype.setStructuredText = function( structuredText ) {
	if ( ! Array.isArray( structuredText ) ) { return ; }

	this.structuredText.length = 0 ;

	for ( let structuredTextPart of structuredText ) {
		if ( structuredTextPart instanceof StructuredTextPart ) { this.structuredText.push( structuredTextPart ) ; }
		else { this.structuredText.push( new StructuredTextPart( structuredTextPart ) ) ; }
	}

	this.isDirty = true ;
} ;



VGFlowingText.prototype.computeLines = function() {
	this.structuredTextLines = this.breakLines( this.width ) ;
	this.computePartsPosition() ;
	//this.structuredTextLinesAreDirty = false ;
} ;



VGFlowingText.parseNewLine = function( structuredText ) {
	var currentLine = [] , // Array of StructuredText
		lines = [ currentLine ] ; // Array of Array of StructuredText

	// First split lines on \n
	for ( let part of structuredText ) {
		if ( part.text.includes( '\n' ) || part.text.includes( '\r' ) ) {
			let splitParts = part.text.split( /\r\n|\r|\n/ ) ;

			for ( let index = 0 ; index < splitParts.length ; index ++ ) {
				let splitPart = splitParts[ index ] ;

				if ( index ) {
					// Create a new line
					currentLine = [] ;
					lines.push( currentLine ) ;
				}

				let newPart = new StructuredTextPart( { text: splitPart , attr: part.attr } ) ;
				currentLine.push( newPart ) ;

			}
		}
		else {
			currentLine.push( part ) ;
		}
	}

	// Then remove the last line if it's empty
	if ( ! currentLine.length ) { lines.pop() ; }
	//console.error( "lines:" , lines ) ;

	return lines ;
} ;



VGFlowingText.prototype.breakLines = function( width = this.width ) {
	var outputLines = [] , // Array of StructuredTextLine
		lines = VGFlowingText.parseNewLine( this.structuredText ) ;

	// Finally split/apply text-wrapping
	if ( this.textWrapping === 'ellipsis' ) {
		for ( let line of lines ) {
			outputLines.push( this.parseStructuredTextLineEllipsis( line , width ) ) ;
		}
	}
	else if ( this.textWrapping === 'wordWrap' ) {
		for ( let line of lines ) {
			outputLines.push( ... this.parseStructuredTextLineWordWrap( line , width ) ) ;
		}
	}
	else {
		for ( let line of lines ) {
			outputLines.push( this.parseStructuredTextLine( line ) ) ;
		}
	}

	return outputLines ;
} ;



// Set the size of each parts and return the total size
VGFlowingText.prototype.computePartsSizeMetrics = function( structuredTextParts ) {
	var groupMetrics = new TextMetrics() ;

	for ( let part of structuredTextParts ) {
		if ( ! part.metrics ) { part.computeSizeMetrics( this.attr ) ; }
		groupMetrics.fuseWithRightPart( part.metrics ) ;
	}

	return groupMetrics ;
} ;



// Set the position of each part and each line
VGFlowingText.prototype.computePartsPosition = function() {
	this.contentWidth = 0 ;
	this.contentHeight = 0 ;
	this.characterCount = 0 ;

	var lastStructuredTextLine = null ,
		x = 0 ,
		y = 0 ;

	for ( let structuredTextLine of this.structuredTextLines ) {
		if ( lastStructuredTextLine ) {
			// It is a new line, offset it depending on the previous one
			y += - lastStructuredTextLine.metrics.descender + lastStructuredTextLine.metrics.lineGap + this.lineSpacing ;
			this.contentHeight += lastStructuredTextLine.metrics.lineGap + this.lineSpacing ;
		}

		y += structuredTextLine.metrics.ascender ;
		this.contentHeight += structuredTextLine.metrics.ascender - structuredTextLine.metrics.descender ;

		if ( structuredTextLine.metrics.width > this.contentWidth ) { this.contentWidth = structuredTextLine.metrics.width ; }

		x = 0 ;

		switch ( this.textHorizontalAlignment ) {
			case 'right' :
				x = this.width - structuredTextLine.metrics.width ;
				break ;
			case 'center' :
				x = ( this.width - structuredTextLine.metrics.width ) / 2 ;
				break ;
			case 'left' :
			default :
				x = 0 ;
				break ;
		}

		structuredTextLine.metrics.x = x ;
		structuredTextLine.metrics.baselineY = y ;

		for ( let part of structuredTextLine.parts ) {
			// Note that it's always defined at that point
			if ( part.metrics ) {
				part.metrics.x = x ;
				part.metrics.baselineY = y ;
				x += part.metrics.width ;
			}

			this.characterCount += part.text.length ;
		}

		lastStructuredTextLine = structuredTextLine ;
	}
} ;



VGFlowingText.prototype.parseStructuredTextLine = function( line ) {
	//this.splitIntoCharacters( line ) ;
	const metrics = this.computePartsSizeMetrics( line ) ;
	return new StructuredTextLine( line , metrics ) ;
} ;



VGFlowingText.prototype.parseStructuredTextLineEllipsis = function( line , width ) {
	let size = this.computeAllSizes( line , context ) ;

	while ( line.length && size.width > width ) {
		const part = line[ line.length - 1 ] ;
		const characters = Array.from( part.text ) ;

		while ( characters.length && size.width > width ) {
			characters.pop() ;
			part.text = characters.join( '' ) + "…" ;
			delete part.metrics ;    // delete .metrics, so .computeAllSizes() will re-compute it instead of using the existing one
			this.computeAllSizes( line , context , size ) ;
		}

		if ( size.width > width ) {
			line.pop() ;
		}
	}

	this.splitIntoCharacters( line , context ) ;
	return { parts: line , metrics: new TextMetrics( size.width , size.height , size.ascent , size.descent ) } ;
} ;



VGFlowingText.prototype.parseStructuredTextLineWordWrap = function( line , width ) {
	const lines = [] ; // StructuredTextLines
	const words = [] ; // StructuredText
	const wordSplittingFunction = this.wordSplittingFunction || VGFlowingText.defaultWordSplittingFunction ;

	// Split each part of the line
	for ( let part of line ) {
		for ( let wordText of wordSplittingFunction( part.text ) ) {
			let word = Object.assign( {} , part ) ; // IStructuredTextPart
			word.text = wordText ;
			words.push( word ) ;
		}
	}

	let lastTestSize = {
		width: 0 , height: 0 , ascent: 0 , descent: 0
	} ;
	let testSize = {
		width: 0 , height: 0 , ascent: 0 , descent: 0
	} ;
	let tmp = null ;
	let testLine = [] ; // StructuredText

	for ( let word of words ) {
		testLine.push( word ) ;
		// swap
		tmp = lastTestSize ; lastTestSize = testSize ; testSize = tmp ;
		this.computeAllSizes( testLine , context , testSize ) ;

		if ( testSize.width > width && testLine.length > 1 ) {
			testLine.pop() ;
			lines.push( {
				parts: this.splitIntoCharacters( VGFlowingText.fuseStructuredTextParts( testLine ) , context ) ,
				metrics: new TextMetrics( lastTestSize.width , lastTestSize.height , lastTestSize.ascent , lastTestSize.descent )
			} ) ;

			// Create a new line with the current word as the first word.
			// We have to left-trim it because it mays contain a space.
			word.text = word.text.trimStart() ;
			delete word.metrics ;    // delete .metrics, so .computeAllSizes() will re-compute it instead of using the existing one
			testLine = [ word ] ;
			this.computeAllSizes( testLine , context , testSize ) ;
		}
	}

	lines.push( {
		parts: this.splitIntoCharacters( VGFlowingText.fuseStructuredTextParts( testLine ) , context ) ,
		metrics: new TextMetrics( testSize.width , testSize.height , testSize.ascent , testSize.descent )
	} ) ;

	return lines ;
} ;



// Renderers



// Render the Vector Graphic as a text SVG
VGFlowingText.prototype.subrenderText = function( root = this ) {
	var str = '' ;

	for ( let structuredTextLine of this.structuredTextLines ) {
		for ( let part of structuredTextLine.parts ) {
			let fontFamily = part.attr.getFontFamily( this.attr ) ,
				fontSize = part.attr.getFontSize( this.attr ) ,
				styleStr = part.attr.getSvgStyleString( this.attr , fontSize ) ,
				underline = part.attr.getUnderline( this.attr ) ,
				lineThrough = part.attr.getLineThrough( this.attr ) ,
				frame = part.attr.getFrame( this.attr ) ;

			console.error( "???" , fontFamily , fontSize , styleStr ) ;
			let font = fontLib.getFont( fontFamily ) ;
			if ( ! font ) { throw new Error( "Font not found: " + fontFamily ) ; }

			let path = font.getPath( part.text , part.metrics.x , part.metrics.baselineY , fontSize ) ;
			//console.log( "Path:" , path ) ;
			//str += path.toSVG() ;
			let pathData = path.toPathData() ;

			if ( frame ) {
				let cornerRadius = fontSize * 0.1 ,
					frameY = part.metrics.baselineY - part.metrics.ascender ,
					frameHeight = part.metrics.ascender - part.metrics.descender ,
					frameStyleStr = 'fill:#fee;' ;

				str += '<rect' ;
				str += ' x="' + part.metrics.x + '"' ;
				str += ' width="' + part.metrics.width + '"' ;
				str += ' y="' + frameY + '"' ;
				str += ' height="' + frameHeight + '"' ;
				str += ' rx="' + cornerRadius + '"' ;
				if ( frameStyleStr ) { str += ' style="' + frameStyleStr + '"' ; }
				str += ' />' ;
			}

			if ( underline ) {
				let thickness = fontSize * 0.075 ,
					underlineY = part.metrics.baselineY - part.metrics.descender * 0.6 - thickness ;

				str += '<rect' ;
				str += ' x="' + part.metrics.x + '"' ;
				str += ' width="' + part.metrics.width + '"' ;
				str += ' y="' + underlineY + '"' ;
				str += ' height="' + thickness + '"' ;
				if ( styleStr ) { str += ' style="' + styleStr + '"' ; }
				str += ' />' ;
			}

			str += '<path' ;
			if ( styleStr ) { str += ' style="' + styleStr + '"' ; }
			str += ' d="' + pathData + '"' ;
			str += ' />' ;

			if ( lineThrough ) {
				let thickness = fontSize * 0.075 ,
					lineThroughY = part.metrics.baselineY - part.metrics.ascender * 0.25 - thickness ;

				str += '<rect' ;
				str += ' x="' + part.metrics.x + '"' ;
				str += ' width="' + part.metrics.width + '"' ;
				str += ' y="' + lineThroughY + '"' ;
				str += ' height="' + thickness + '"' ;
				if ( styleStr ) { str += ' style="' + styleStr + '"' ; }
				str += ' />' ;
			}
		}
	}

	return str ;
} ;







// Useful?




VGFlowingText.prototype.splitIntoCharacters = function( line ) {
	let splitted = [] ;
	const reusableSize = {
		width: 0 , height: 0 , ascent: 0 , descent: 0
	} ;

	for ( let i = 0 ; i < line.length ; i ++ ) {
		let part = line[ i ] ;
		if ( part.splitIntoCharacters && part.text.length > 1 ) {
			splitted.length = 0 ;
			const attr = this.inheritAttributes( part ) ;
			this.setContextAttributesForMeasure( context , attr ) ;

			for ( let character of part.text ) {
				let newPart = Object.assign( {} , part ) ;
				newPart.text = character ;
				delete newPart.metrics ;
				splitted.push( newPart ) ;
			}

			this.computeAllSizes( splitted , context , reusableSize ) ;
			line.splice( i , 1 , ... splitted ) ;
			i += splitted.length - 1 ;
		}
	}

	return line ;
} ;



// This splitting function does not exlude the splitter, it keeps it on the right-side of the split.
VGFlowingText.defaultWordSplittingFunction = function( str ) {
	let match ;
	let lastIndex = 0 ;
	const splitted = [] ;
	const regexp = / +/g ;

	while ( ( match = regexp.exec( str ) ) ) {
		if ( lastIndex < match.index ) {
			splitted.push( str.slice( lastIndex , match.index ) ) ;
		}

		lastIndex = match.index ;
	}

	if ( lastIndex < str.length ) {
		splitted.push( str.slice( lastIndex ) ) ;
	}

	return splitted ;
} ;



// Join consecutive parts sharing the exact same attributes.
// It produces better results for underline and line-through, avoiding outline overlaps.
VGFlowingText.fuseStructuredTextParts = function( structuredText ) {
	if ( structuredText.length <= 1 ) { return structuredText ; }

	let last = structuredText[ 0 ] ; // IStructuredTextPart
	let lastInserted = last ; // IStructuredTextPart
	const output = [ last ] ; // StructuredText

	for ( let index = 1 ; index < structuredText.length ; index ++ ) {
		const part = structuredText[ index ] ;

		if (
			! last.splitIntoCharacters && ! part.splitIntoCharacters
			&& last.color === part.color
			&& last.underline === part.underline
			&& last.lineThrough === part.lineThrough
			&& last.frame === part.frame && ( ! part.frame || (
				last.frameColor === part.frameColor
				&& last.frameCornerRadius === part.frameCornerRadius
				&& last.frameOutlineWidth === part.frameOutlineWidth
				&& last.frameOutlineColor === part.frameOutlineColor
			) )
			&& last.fontFamily === part.fontFamily
			&& last.fontSize === part.fontSize
			&& last.fontStyle === part.fontStyle
			&& last.fontWeight === part.fontWeight
			&& last.outlineWidth === part.outlineWidth && last.outlineColor === part.outlineColor
			&& last.shadowColor === part.shadowColor && last.shadowBlur === part.shadowBlur
			&& last.shadowOffsetX === part.shadowOffsetX && last.shadowOffsetY === part.shadowOffsetY
			&& last.hover?.color === part.hover?.color
			&& last.hover?.underline === part.hover?.underline
			&& last.href === part.href
			&& last.staticCustomData === part.staticCustomData
		) {
			lastInserted.text += part.text ;

			// Note that it's always defined at that point
			if ( lastInserted.metrics && part.metrics ) {
				lastInserted.metrics.fuseWithRightPart( part.metrics ) ;
			}
		}
		else {
			output.push( part ) ;
			lastInserted = part ;
		}

		last = part ;
	}

	return output ;
} ;



VGFlowingText.prototype.computeXYOffset = function() {
	this.xOffset = this.currentMeasure.left + this.scrollX ;
	this.yOffset = this.currentMeasure.top + this.scrollY ;

	switch ( this.textVerticalAlignment ) {
		// No offset, so nothing to do for top alignment
		//case Control.VERTICAL_ALIGNMENT_TOP:
		case Control.VERTICAL_ALIGNMENT_BOTTOM :
			this.yOffset += this.currentMeasure.height - this.contentHeight ;
			break ;
		case Control.VERTICAL_ALIGNMENT_CENTER :
			this.yOffset += ( this.currentMeasure.height - this.contentHeight ) / 2 ;
			break ;
	}
} ;

