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

const opentype = require( 'opentype.js' ) ;



function StructuredTextBlock( params ) {
	this.structuredText = [] ;
	this.width = params.width || 100 ;

	this.lines = [] ;
	
	if ( params.structuredText ) { this.setStructuredText( params.structuredText ) ; }
}

module.exports = StructuredTextBlock ;



StructuredTextBlock.prototype.setStructuredText = function( structuredText ) {
	if ( ! Array.isArray( structuredText ) ) { return ; }

	this.structuredText.length = 0 ;

	for ( let structuredTextPart of structuredText ) {
		if ( structuredTextPart instanceof StructuredTextPart ) { this.structuredText.push( structuredTextPart ) ; }
		else { this.structuredText.push( new StructuredTextPart( structuredTextPart ) ) ; }
	}
} ;



StructuredTextBlock.prototype.computeLines = function() {
	this.lines = this.breakLines( refWidth ?? this.currentMeasure.width , context ) ;

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



StructuredTextBlock.prototype.breakLines = function() {
	let newPart ;
	const outputLines = [] ; // StructuredTextLines
	let currentLine = [] ; // StructuredText
	const lines = [ currentLine ] ; // Array<StructuredText>

	// First split on \n
	for ( let part of this.structuredText ) {
		if ( part.text.includes( '\n' ) ) {
			for ( let splitted of part.text.split( '\n' ) ) {
				newPart = Object.assign( {} , part ) ;
				newPart.text = splitted ;
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
	if ( this.textWrapping === TextWrapping.Ellipsis ) {
		for ( let line of lines ) {
			outputLines.push( this.parseStructuredTextLineEllipsis( line , refWidth , context ) ) ;
		}
	}
	else if ( this.textWrapping === TextWrapping.WordWrap ) {
		for ( let line of lines ) {
			outputLines.push( ... this.parseStructuredTextLineWordWrap( line , refWidth , context ) ) ;
		}
	}
	else {
		for ( let line of lines ) {
			outputLines.push( this.parseStructuredTextLine( line , context ) ) ;
		}
	}

	return outputLines ;
} ;



StructuredTextBlock.prototype.splitIntoCharacters = function( line ) {
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



StructuredTextBlock.prototype.parseStructuredTextLine = function( line ) {
	this.splitIntoCharacters( line , context ) ;
	const size = this.computeAllSizes( line , context ) ;
	return { parts: line , metrics: new StructuredTextMetrics( size.width , size.height , size.ascent , size.descent ) } ;
} ;



StructuredTextBlock.prototype.parseStructuredTextLineEllipsis = function( line , width ) {
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
	return { parts: line , metrics: new StructuredTextMetrics( size.width , size.height , size.ascent , size.descent ) } ;
} ;



// This splitting function does not exlude the splitter, it keeps it on the right-side of the split.
StructuredTextBlock.defaultWordSplittingFunction = function( str ) {
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
StructuredTextBlock.fuseStructuredTextParts = function( structuredText ) {
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
StructuredTextBlock.prototype.computeAllSizes = function( structuredText , size = {
	width: 0 , height: 0 , ascent: 0 , descent: 0
} ) {
	let contextSaved = false ;
	size.width = 0 ;
	size.height = 0 ;
	size.ascent = 0 ;
	size.descent = 0 ;

	for ( let part of structuredText ) {
		if ( ! part.metrics ) {
			if ( ! contextSaved ) { context.save() ; }

			const attr = this.inheritAttributes( part ) ;
			this.setContextAttributesForMeasure( context , attr ) ;

			const textMetrics = context.measureText( part.text ) ;
			// .actualBoundingBox* does not work: sometime it skips spaces, also it's not widely supported
			const width = textMetrics.width ;
			const fontOffset = Control.GetFontOffset( context.font ) ;

			part.metrics = new StructuredTextMetrics( width , fontOffset.height , fontOffset.ascent , fontOffset.descent ) ;
		}

		size.width += part.metrics.width ;
		if ( part.metrics.height > size.height ) { size.height = part.metrics.height ; }
		if ( part.metrics.ascent > size.ascent ) { size.ascent = part.metrics.ascent ; }
		if ( part.metrics.descent > size.descent ) { size.descent = part.metrics.descent ; }
	}

	if ( contextSaved ) { context.restore() ; }

	return size ;
} ;



StructuredTextBlock.prototype.parseStructuredTextLineWordWrap = function( line , width ) {
	const lines = [] ; // StructuredTextLines
	const words = [] ; // StructuredText
	const wordSplittingFunction = this.wordSplittingFunction || StructuredTextBlock.defaultWordSplittingFunction ;

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
				parts: this.splitIntoCharacters( StructuredTextBlock.fuseStructuredTextParts( testLine ) , context ) ,
				metrics: new StructuredTextMetrics( lastTestSize.width , lastTestSize.height , lastTestSize.ascent , lastTestSize.descent )
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
		parts: this.splitIntoCharacters( StructuredTextBlock.fuseStructuredTextParts( testLine ) , context ) ,
		metrics: new StructuredTextMetrics( testSize.width , testSize.height , testSize.ascent , testSize.descent )
	} ) ;

	return lines ;
} ;



StructuredTextBlock.prototype.computeXYOffset = function() {
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

