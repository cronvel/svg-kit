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



const StructuredTextPart = require( './StructuredTextPart.js' ) ;
const StructuredTextLine = require( './StructuredTextLine.js' ) ;
const TextAttribute = require( './TextAttribute.js' ) ;
const TextMetrics = require( './TextMetrics.js' ) ;

const opentype = require( 'opentype.js' ) ;



function StructuredTextArea( params = {} ) {
	this.x = + params.x || 0 ;
	this.y = + params.y || 0 ;
	this.width = + params.width || 0 ;
	this.height = + params.height || 0 ;
	this.structuredText = [] ;	// Array of StructuredTextPart, the source
	this.attr = new TextAttribute( params.attr ) ;
	this.textWrapping = params.textWrapping || null ;

	// Computed
	this.lines = [] ;	// Array of StructuredTextLine
	this.isDirty = true ;
	
	if ( params.structuredText ) { this.setStructuredText( params.structuredText ) ; }
}

module.exports = StructuredTextArea ;



StructuredTextArea.prototype.setStructuredText = function( structuredText ) {
	if ( ! Array.isArray( structuredText ) ) { return ; }

	this.structuredText.length = 0 ;

	for ( let structuredTextPart of structuredText ) {
		if ( structuredTextPart instanceof StructuredTextPart ) { this.structuredText.push( structuredTextPart ) ; }
		else { this.structuredText.push( new StructuredTextPart( structuredTextPart ) ) ; }
	}
	
	this.isDirty = true ;
} ;



StructuredTextArea.prototype.computeLines = function() {
	this.lines = this.breakLines( this.width ) ;
	return ;

	if ( ! this.fontOffset ) {
		this.fontOffset = Control.GetFontOffset( context.font ) ;
	}

	this.characterCount = 0 ;
	this.hoveringPart = null ;
	this.hasHoverStyle = false ;
	this.hasHref = false ;
	this.contentWidth = 0 ;
	this.contentHeight = 0 ;
	let y = 0 ;
	const width = this.currentMeasure.width ;
	const lineSpacing = this.lineSpacing.isPixel ? this.lineSpacing.getValue( this.host ) : this.lineSpacing.getValue( this.host ) * this.height.getValueInPixel( this.host , this.cachedParentMeasure.height ) ;

	for ( let i = 0 ; i < this.lines.length ; i ++ ) {
		const line = this.lines[i] ;
		y += line.metrics.ascent ;
		this.contentHeight += line.metrics.height ;
		if ( line.metrics.width > this.contentWidth ) { this.contentWidth = line.metrics.width ; }
		let x = 0 ;

		switch ( this.textHorizontalAlignment ) {
			case Control.HORIZONTAL_ALIGNMENT_LEFT :
				x = 0 ;
				break ;
			case Control.HORIZONTAL_ALIGNMENT_RIGHT :
				x = width - line.metrics.width ;
				break ;
			case Control.HORIZONTAL_ALIGNMENT_CENTER :
				x = ( width - line.metrics.width ) / 2 ;
				break ;
		}

		line.metrics.x = x ;
		line.metrics.baselineY = y ;

		for ( let part of line.parts ) {
			delete part.dynamicCustomData ;  // Always nullify it
			if ( part.hover ) { this.hasHoverStyle = true ; }
			if ( part.href ) { this.hasHref = true ; }

			// Note that it's always defined at that point
			if ( part.metrics ) {
				part.metrics.x = x ;
				part.metrics.baselineY = y ;
				x += part.metrics.width ;
			}

			this.characterCount += part.text.length ;
		}

		y += line.metrics.descent + lineSpacing ;
	}

	this.linesAreDirty = false ;
	this.onLinesReadyObservable.notifyObservers( this ) ;
} ;



StructuredTextArea.prototype.breakLines = function( width = this.width ) {
	var outputLines = [] , // StructuredTextLines
		currentLine = [] , // StructuredText
		lines = [ currentLine ] ; // Array<StructuredText>

	// First split lines on \n
	for ( let part of this.structuredText ) {
		if ( part.text.includes( '\n' ) || part.text.includes( '\r' ) ) {
			for ( let splitted of part.text.split( '\r\n|\r|\n' ) ) {
				let newPart = new StructuredTextPart( { text: splitted , attr: part.attr } ) ;
				currentLine.push( newPart ) ;

				// Create a new line
				currentLine = [] ;
				lines.push( currentLine ) ;
			}
		}
		else {
			currentLine.push( part ) ;
		}
	}

	// Then split/apply text-wrapping
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



StructuredTextArea.prototype.parseStructuredTextLine = function( line ) {
	//this.splitIntoCharacters( line ) ;
	const metrics = this.computePartsSizeMetrics( line ) ;
	return new StructuredTextLine( line , metrics ) ;
} ;



StructuredTextArea.prototype.parseStructuredTextLineEllipsis = function( line , width ) {
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



StructuredTextArea.prototype.parseStructuredTextLineWordWrap = function( line , width ) {
	const lines = [] ; // StructuredTextLines
	const words = [] ; // StructuredText
	const wordSplittingFunction = this.wordSplittingFunction || StructuredTextArea.defaultWordSplittingFunction ;

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
				parts: this.splitIntoCharacters( StructuredTextArea.fuseStructuredTextParts( testLine ) , context ) ,
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
		parts: this.splitIntoCharacters( StructuredTextArea.fuseStructuredTextParts( testLine ) , context ) ,
		metrics: new TextMetrics( testSize.width , testSize.height , testSize.ascent , testSize.descent )
	} ) ;

	return lines ;
} ;



StructuredTextArea.prototype.splitIntoCharacters = function( line ) {
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
StructuredTextArea.defaultWordSplittingFunction = function( str ) {
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
StructuredTextArea.fuseStructuredTextParts = function( structuredText ) {
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



// Set the width of each parts and return the total width
StructuredTextArea.prototype.computePartsSizeMetrics = function( structuredTextParts ) {
	var groupMetrics = new TextMetrics() ;

	for ( let part of structuredTextParts ) {
		if ( ! part.metrics ) { part.computeSizeMetrics( this.attr ) ; }
		groupMetrics.fuseWithRightPart( part.metrics ) ;
	}

	return groupMetrics ;
} ;



StructuredTextArea.prototype.computeXYOffset = function() {
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

