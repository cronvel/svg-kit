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



const VGPseudoContainer = require( '../VGPseudoContainer.js' ) ;

const StructuredTextPart = require( './StructuredTextPart.js' ) ;
const StructuredTextLine = require( './StructuredTextLine.js' ) ;
const TextAttribute = require( './TextAttribute.js' ) ;
const TextMetrics = require( './TextMetrics.js' ) ;
const BoundingBox = require( '../BoundingBox.js' ) ;
const VGFlowingTextPart = require( './VGFlowingTextPart.js' ) ;
const VGFlowingTextImagePart = require( './VGFlowingTextImagePart.js' ) ;

const bookSource = require( 'book-source' ) ;
const StructuredTextRenderer = require( './StructuredTextRenderer.js' ) ;

const fontLib = require( '../fontLib.js' ) ;
const canvas = require( '../canvas.js' ) ;

const dom = require( 'dom-kit' ) ;



function VGFlowingText( params ) {
	VGPseudoContainer.call( this , params ) ;

	this.x = 0 ;
	this.y = 0 ;
	this.width = 0 ;
	this.height = 0 ;
	this.clip = true ;
	this.structuredText = [] ;	// Array of StructuredTextPart, the source
	this.attr = params?.attr ? null : new TextAttribute() ;	// if it's defined, it will be created by this.set()
	this.lineSpacing = 0 ;
	this.textWrapping = null ;	// null/ellipsis/wordWrap
	this.textVerticalAlignment = null ;	// null/top/bottom/center
	this.textHorizontalAlignment = null ;	// null/left/right/center

	// Special FX properties
	this.charLimit = Infinity ;	// Limit how many characters will be displayed, useful for slow-typing effects

	this.debugContainer = false ;

	// Computed
	this.areLinesComputed = false ;
	this.structuredTextLines = [] ;	// Array of StructuredTextLine
	this.contentX = 0 ;
	this.contentY = 0 ;
	this.contentWidth = 0 ;
	this.contentHeight = 0 ;
	this.charCount = 0 ;

	// Render-time
	this.remainingChar = 0 ;	// Set to .charLimit at the start of rendering

	if ( params ) { this.set( params ) ; }
}

module.exports = VGFlowingText ;

VGFlowingText.prototype = Object.create( VGPseudoContainer.prototype ) ;
VGFlowingText.prototype.constructor = VGFlowingText ;
VGFlowingText.prototype.__prototypeUID__ = 'svg-kit/VGFlowingText' ;
VGFlowingText.prototype.__prototypeVersion__ = require( '../../package.json' ).version ;



VGFlowingText.prototype.isRenderingContainer = true ;
VGFlowingText.prototype.svgTag = 'g' ;



const TEXT_WRAPPING = {
	wordWrap: 'wordWrap' ,
	wordwrap: 'wordWrap' ,
	'word-wrap': 'wordWrap' ,
	ellipsis: 'ellipsis'
} ;



VGFlowingText.prototype.set = function( params ) {
	let dirty = false ;

	if ( params.x !== undefined ) { this.boundingBox.x = this.x = + params.x || 0 ; dirty = true ; }
	if ( params.y !== undefined ) { this.boundingBox.y = this.y = + params.y || 0 ; dirty = true ; }
	if ( params.width !== undefined ) { this.boundingBox.width = this.width = + params.width || 0 ; dirty = true ; }
	if ( params.height !== undefined ) { this.boundingBox.height = this.height = + params.height || 0 ; dirty = true ; }

	if ( params.clip !== undefined ) { this.clip = !! params.clip ; }

	if ( params.structuredText ) { this.setStructuredText( params.structuredText ) ; }
	else if ( params.markupText ) { this.setMarkupText( params.markupText ) ; }
	else if ( params.text ) { this.setText( params.text ) ; }

	if ( params.attr ) { this.attr = new TextAttribute( params.attr ) ; dirty = true ; }
	if ( params.lineSpacing !== undefined ) { this.lineSpacing = + params.lineSpacing || 0 ; dirty = true ; }
	if ( params.textVerticalAlignment !== undefined ) { this.textVerticalAlignment = params.textVerticalAlignment ; dirty = true ; }
	if ( params.textHorizontalAlignment !== undefined ) { this.textHorizontalAlignment = params.textHorizontalAlignment ; dirty = true ; }

	if ( params.textWrapping !== undefined ) {
		this.textWrapping = TEXT_WRAPPING[ params.textWrapping ] || null ;
		dirty = true ;
	}

	if ( params.charLimit !== undefined ) {
		this.charLimit = params.charLimit === false ? Infinity : + params.charLimit ;
	}

	if ( params.debugContainer !== undefined ) { this.debugContainer = !! params.debugContainer ; }

	if ( dirty ) { this.shouldComputeAgain() ; }

	VGPseudoContainer.prototype.set.call( this , params ) ;
} ;



VGFlowingText.prototype.export = function( data = {} ) {
	VGPseudoContainer.prototype.export.call( this , data ) ;

	data.x = this.x ;
	data.y = this.y ;
	data.width = this.width ;
	data.height = this.height ;
	data.clip = this.clip ;

	data.structuredText = this.structuredText.map( part => part.export() ) ;

	let attr = this.attr.export( undefined , true ) ;
	if ( attr ) { data.attr = attr ; }

	if ( this.lineSpacing ) { data.lineSpacing = this.lineSpacing ; }
	if ( this.textWrapping ) { data.textWrapping = this.textWrapping ; }
	if ( this.textVerticalAlignment ) { data.textVerticalAlignment = this.textVerticalAlignment ; }
	if ( this.textHorizontalAlignment ) { data.textHorizontalAlignment = this.textHorizontalAlignment ; }

	return data ;
} ;



VGFlowingText.prototype.shouldComputeAgain = function() {
	this.areLinesComputed = false ;
	this.arePseudoEntitiesReady = false ;
} ;



VGFlowingText.prototype.setStructuredText = function( structuredText_ ) {
	if ( ! Array.isArray( structuredText_ ) ) { return ; }

	this.structuredText.length = 0 ;

	for ( let structuredTextPart of structuredText_ ) {
		if ( structuredTextPart instanceof StructuredTextPart ) { this.structuredText.push( structuredTextPart ) ; }
		else { this.structuredText.push( new StructuredTextPart( structuredTextPart ) ) ; }
	}

	this.shouldComputeAgain() ;
} ;



VGFlowingText.prototype.setMarkupText = function( markupText ) {
	var structuredTextRenderer = new StructuredTextRenderer() ;
	var structuredDocument = bookSource.parse( markupText ) ;
	var parsed = structuredDocument.render( structuredTextRenderer ) ;
	console.warn( "PARSED:" , parsed ) ;

	return this.setStructuredText( parsed ) ;
} ;



VGFlowingText.prototype.setText = function( text ) {
	return this.setStructuredText( [ { text } ] ) ;
} ;



VGFlowingText.prototype.getContentWidth = async function() {
	if ( ! this.areLinesComputed ) { await this.computeLines() ; }
	return this.contentWidth ;
} ;



VGFlowingText.prototype.getContentHeight = async function() {
	if ( ! this.areLinesComputed ) { await this.computeLines() ; }
	return this.contentHeight ;
} ;



VGFlowingText.prototype.getCharacterCount = VGFlowingText.prototype.getCharCount = async function() {
	if ( ! this.areLinesComputed ) { await this.computeLines() ; }
	return this.charCount ;
} ;



VGFlowingText.prototype.getBoundingBox = function() {
	return new BoundingBox( this.x , this.y , this.x + this.width , this.y + this.height ) ;
} ;



VGFlowingText.prototype.getContentBoundingBox = async function() {
	if ( ! this.areLinesComputed ) { await this.computeLines() ; }
	return new BoundingBox( this.contentX , this.contentY , this.contentX + this.contentWidth , this.contentY + this.contentHeight ) ;
} ;



VGFlowingText.prototype.computeLines = async function() {
	this.structuredTextLines = await this.breakLines( this.width ) ;
	this.structuredTextLines.forEach( line => line.fuseEqualAttr() ) ;
	this.computePartsPosition() ;
	console.warn( "Input -> Lines" , this.structuredText , this.structuredTextLines ) ;
	this.areLinesComputed = true ;
} ;



VGFlowingText.prototype.breakLines = async function() {
	var outputLines = [] , // Array of StructuredTextLine
		lines = VGFlowingText.parseNewLine( this.structuredText ) ;

	// Finally split/apply text-wrapping
	if ( this.textWrapping === 'ellipsis' ) {
		for ( let line of lines ) {
			VGFlowingText.appendLine( outputLines , await this.parseStructuredTextLineEllipsis( line ) ) ;
		}
	}
	else if ( this.textWrapping === 'wordWrap' ) {
		for ( let line of lines ) {
			//outputLines.push( ... await this.parseStructuredTextLineWordWrap( line ) ) ;
			( await this.parseStructuredTextLineWordWrap( line ) ).forEach( l => VGFlowingText.appendLine( outputLines , l ) ) ;
		}
	}
	else {
		for ( let line of lines ) {
			VGFlowingText.appendLine( outputLines , await this.parseStructuredTextLine( line ) ) ;
		}
	}

	// No follow-up empty lines for the last line
	if ( outputLines.length ) {
		outputLines[ outputLines.length - 1 ].followUpEmptyLines = 0 ;
	}

	return outputLines ;
} ;



VGFlowingText.appendLine = async function( outputLines , line ) {
	if ( ! line.parts.length ) {
		if ( outputLines.length ) {
			outputLines[ outputLines.length - 1 ].followUpEmptyLines ++ ;
		}

		return ;
	}

	outputLines.push( line ) ;
} ;



VGFlowingText.prototype.parseStructuredTextLine = async function( line ) {
	var metrics = await this.computePartsSizeMetrics( line ) ;
	return new StructuredTextLine( line , metrics ) ;
} ;



VGFlowingText.prototype.parseStructuredTextLineEllipsis = async function( line ) {
	var metrics = await this.computePartsSizeMetrics( line ) ;

	while ( line.length && metrics.width > this.width ) {
		const part = line[ line.length - 1 ] ;
		const characters = Array.from( part.text ) ;

		while ( characters.length && metrics.width > this.width ) {
			characters.pop() ;
			part.text = characters.join( '' ) + "…" ;
			delete part.metrics ;    // delete .metrics, so .computePartsSizeMetrics() will re-compute it instead of using the existing one
			metrics = await this.computePartsSizeMetrics( line ) ;
		}

		if ( metrics.width > this.width ) {
			line.pop() ;
		}
	}

	return new StructuredTextLine( line , metrics ) ;
} ;



VGFlowingText.prototype.parseStructuredTextLineWordWrap = async function( line ) {
	//console.log( "Start with:" , line ) ;
	const outputLines = [] ; // Array of Array of StructuredTextPart
	const outputParts = [] ; // Array of StructuredTextPart

	// Split each part of the line
	for ( let part of line ) {
		part.splitIntoWords( outputParts ) ;
	}
	//console.warn( "??? AFT splitIntoWords()" , outputParts.map( e => ( { text: e.text , imageUrl: e.imageUrl } ) ) ) ;

	let lastTestLineMetrics = new TextMetrics() ;
	let testLineMetrics = new TextMetrics() ;
	let testLine = [] ; // Array of StructuredTextPart
	let lastIndex = - 1 ;
	let blockAdded = 0 ;

	for ( let index = 0 ; index < outputParts.length ; index ++ ) {
		//console.log( "index" , index , lastIndex ) ;
		let part = outputParts[ index ] ;
		testLine.push( part ) ;

		if ( ! part.metrics ) { await part.computeSizeMetrics( this.attr ) ; }
		testLineMetrics.fuseWithRightPart( part.metrics ) ;

		if (
			index < outputParts.length - 1
			&& (
				outputParts[ index + 1 ].forceNoLineSplitBefore
				|| ( ! part.canLineSplitAfter && ! outputParts[ index + 1 ].canLineSplitBefore )
			)
		) {
			// It is not splittable after, so we test immediately with more content.
			//console.log( "not splittable after: '" , part.text + "'" ) ;
			continue ;
		}

		if ( testLineMetrics.width > this.width && blockAdded >= 1 ) {
			let removed = index - lastIndex ;
			//console.log( "width overflow for '" + part.text + "': " , testLineMetrics.width , ">" , this.width , "removed:" , removed ) ;
			testLine.length -= removed ;
			outputLines.push( new StructuredTextLine( testLine , lastTestLineMetrics ) ) ;
			lastTestLineMetrics = new TextMetrics() ;

			// Create a new line with the current part as the first part.
			// We have to left-trim it because it may contain spaces.
			// It's a loop, because we can strip multiple space-only parts.
			let indexOfNextLine = index - removed + 1 ;
			for ( ; indexOfNextLine <= index ; indexOfNextLine ++ ) {
				let nextLinePart = outputParts[ indexOfNextLine ] ;
				
				if ( nextLinePart.imageUrl ) { break ; }
				
				//console.log( "nextLinePart: '" + nextLinePart.text + "'" ) ;
				let trimmedText = nextLinePart.text.trimStart() ;

				if ( trimmedText ) {
					if ( trimmedText !== nextLinePart.text ) {
						//console.log( "Left-trim: '" + nextLinePart.text + "'" ) ;
						nextLinePart.text = trimmedText ;
						await nextLinePart.computeSizeMetrics( this.attr ) ;
					}

					break ;
				}
			}

			testLine = [] ;
			testLineMetrics.clear() ;
			blockAdded = 0 ;
			lastIndex = index = indexOfNextLine - 1 ;
			continue ;
		}

		blockAdded ++ ;
		//let dbg = '' ;
		for ( let indexOfPartToAdd = lastIndex + 1 ; indexOfPartToAdd <= index ; indexOfPartToAdd ++ ) {
			//console.log( "indexOfPartToAdd" , indexOfPartToAdd ) ;
			lastTestLineMetrics.fuseWithRightPart( outputParts[ indexOfPartToAdd ].metrics ) ;
			//dbg += outputParts[ indexOfPartToAdd ].text ;
		}
		//console.log( "added:" , lastIndex + 1 , index , "'" + dbg + "'" ) ;

		lastIndex = index ;
	}

	outputLines.push( new StructuredTextLine( testLine , lastTestLineMetrics ) ) ;

	return outputLines ;
} ;



// Set the size of each parts and return the total size
VGFlowingText.prototype.computePartsSizeMetrics = async function( structuredTextParts ) {
	var groupMetrics = new TextMetrics() ;

	for ( let part of structuredTextParts ) {
		if ( ! part.metrics ) { await part.computeSizeMetrics( this.attr ) ; }
		groupMetrics.fuseWithRightPart( part.metrics ) ;
	}

	return groupMetrics ;
} ;



VGFlowingText.prototype.computeContentSize = function() {
	this.contentWidth = 0 ;
	this.contentHeight = 0 ;

	var lastStructuredTextLine = null ;

	for ( let structuredTextLine of this.structuredTextLines ) {
		if ( lastStructuredTextLine ) { this.contentHeight += this.lineSpacing ; }
		this.contentHeight += structuredTextLine.metrics.ascender - structuredTextLine.metrics.descender + structuredTextLine.metrics.lineGap ;
		if ( structuredTextLine.metrics.width > this.contentWidth ) { this.contentWidth = structuredTextLine.metrics.width ; }
	}
} ;



// Set the position of each part and each line
VGFlowingText.prototype.computePartsPosition = function() {
	this.computeContentSize() ;

	this.charCount = 0 ;

	var x , y ,
		lastStructuredTextLine = null ;

	switch ( this.textVerticalAlignment ) {
		case 'bottom' :
			y = this.contentY = this.y + this.height - this.contentHeight ;
			break ;
		case 'center' :
		case 'middle' :
			y = this.contentY = this.y + ( this.height - this.contentHeight ) / 2 ;
			break ;
		case 'top' :
		default :
			y = this.contentY = this.y ;
			break ;
	}

	this.contentX = Infinity ;

	for ( let structuredTextLine of this.structuredTextLines ) {
		if ( lastStructuredTextLine ) {
			// It is a new line, offset it depending on the previous one
			y += - lastStructuredTextLine.metrics.descender + lastStructuredTextLine.metrics.lineGap + this.lineSpacing ;
			
			// Manage empty lines
			if ( lastStructuredTextLine.followUpEmptyLines ) {
				y += lastStructuredTextLine.followUpEmptyLines * this.attr.getFontSize() ;
			}
		}

		y += structuredTextLine.metrics.ascender ;

		switch ( this.textHorizontalAlignment ) {
			case 'right' :
				x = this.x + this.width - structuredTextLine.metrics.width ;
				break ;
			case 'center' :
			case 'middle' :
				x = this.x + ( this.width - structuredTextLine.metrics.width ) / 2 ;
				break ;
			case 'left' :
			default :
				x = this.x ;
				break ;
		}

		if ( x < this.contentX ) { this.contentX = x ; }

		structuredTextLine.metrics.x = x ;
		structuredTextLine.metrics.baselineY = y ;

		for ( let part of structuredTextLine.parts ) {
			// Note that it's always defined at that point
			if ( part.metrics ) {
				part.metrics.x = x ;
				part.metrics.baselineY = y ;
				x += part.metrics.width ;
			}

			this.charCount += part.metrics.charCount ;
		}

		lastStructuredTextLine = structuredTextLine ;
	}
} ;



VGFlowingText.parseNewLine = function( structuredText_ ) {
	var currentLine = [] , // Array of StructuredText
		lines = [ currentLine ] ; // Array of Array of StructuredText

	// First split lines on \n
	for ( let part of structuredText_ ) {
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



// Renderers



VGFlowingText.prototype.svgAttributes = function( master = this ) {
	var attr = {} ;

	if ( this.clip ) {
		attr['clip-path'] = 'url(#' + this._id + '_clipPath' + ')' ;
	}

	return attr ;
} ;



VGFlowingText.prototype.getUsedFontNames = function() {
	var fontNames = [] ;

	for ( let structuredTextLine of this.structuredTextLines ) {
		for ( let part of structuredTextLine.parts ) {
			fontNames.push( part.attr.getFontFamily( this.attr ) ) ;
		}
	}

	return fontNames ;
} ;



VGFlowingText.prototype.computePseudoEntities = async function() {
	if ( this.arePseudoEntitiesReady ) { return ; }

	if ( ! this.areLinesComputed ) { await this.computeLines() ; }
	
	this.clearPseudoEntities() ;

	for ( let structuredTextLine of this.structuredTextLines ) {
		for ( let part of structuredTextLine.parts ) {
			let pseudoEntity =
				part.imageUrl ? new VGFlowingTextImagePart( part ) :
				new VGFlowingTextPart( part ) ;
			this.addPseudoEntity( pseudoEntity ) ;
		}
	}

	this.arePseudoEntitiesReady = true ;
} ;



VGFlowingText.prototype.initRenderData = function() {
	this.remainingChar = this.charLimit ;
} ;



// Render the Vector Graphic as a text SVG
VGFlowingText.prototype.renderBeforeHookForSvgText = async function( master = this ) {
	var str = '' ;

	this.initRenderData() ;

	if ( this.clip ) {
		let yOffset = this.root.invertY ? - 2 * this.y - this.height : 0 ;

		// Nothing inside the <clipPath> is displayed
		str += '<clipPath id="' + this._id + '_clipPath">' ;
		str += '<rect' ;
		str += ' x="' + this.x + '"' ;
		str += ' y="' + ( this.y + yOffset ) + '"' ;
		str += ' width="' + this.width + '"' ;
		str += ' height="' + this.height + '"' ;
		str += ' />' ;
		str += '</clipPath>' ;
	}

	return str ;
} ;



VGFlowingText.prototype.renderAfterHookForSvgText = async function( master = this ) {
	var str = '' ;

	if ( this.debugContainer ) {
		let yOffset = this.root.invertY ? - 2 * this.y - this.height : 0 ;

		str += '<rect' ;
		str += ' x="' + this.x + '"' ;
		str += ' y="' + ( this.y + yOffset ) + '"' ;
		str += ' width="' + this.width + '"' ;
		str += ' height="' + this.height + '"' ;
		str += ' style="fill:none;stroke:#f33"' ;
		str += ' />' ;
	}

	return str ;
} ;



VGFlowingText.prototype.renderBeforeHookForSvgDom = async function( master = this ) {
	var elementList = [] ;

	this.initRenderData() ;

	if ( this.clip ) {
		let yOffset = this.root.invertY ? - 2 * this.y - this.height : 0 ;

		// Nothing inside the <clipPath> is displayed
		let $clipPath = document.createElementNS( this.NS , 'clipPath' ) ;
		$clipPath.setAttribute( 'id' , this._id + '_clipPath' ) ;
		elementList.push( $clipPath ) ;

		let $rect = document.createElementNS( this.NS , 'rect' ) ;
		$rect.setAttribute( 'x' , this.x ) ;
		$rect.setAttribute( 'y' , this.y + yOffset ) ;
		$rect.setAttribute( 'width' , this.width ) ;
		$rect.setAttribute( 'height' , this.height ) ;
		$clipPath.appendChild( $rect ) ;
	}

	return elementList ;
} ;



VGFlowingText.prototype.renderAfterHookForSvgDom = async function( master = this ) {
	var elementList = [] ;

	if ( this.debugContainer ) {
		let yOffset = this.root.invertY ? - 2 * this.y - this.height : 0 ;

		let $debugRect = document.createElementNS( this.NS , 'rect' ) ;
		$debugRect.setAttribute( 'x' , this.x ) ;
		$debugRect.setAttribute( 'y' , this.y + yOffset ) ;
		$debugRect.setAttribute( 'width' , this.width ) ;
		$debugRect.setAttribute( 'height' , this.height ) ;
		$debugRect.setAttribute( 'style' , "fill:none;stroke:#f33;" ) ;
		elementList.push( $debugRect ) ;
	}

	//console.log( "Returning:" , elementList ) ;
	return elementList ;
} ;



VGFlowingText.prototype.renderBeforeHookForCanvas = async function( canvasCtx , options = {} , isRedraw = false , master = this ) {
	this.initRenderData() ;

	if ( this.clip ) {
		let yOffset = this.root.invertY ? canvasCtx.canvas.height - 1 - 2 * this.y - ( this.height - 1 ) : 0 ;

		canvasCtx.beginPath() ;
		// For some reason, it seems that the first row and column is clipped away, so we have to grow the size by one pixel
		canvasCtx.rect( this.x - 1 , this.y - 1 + yOffset , this.width + 1 , this.height + 1 ) ;
		canvasCtx.clip() ;
	}
} ;



VGFlowingText.prototype.renderAfterHookForCanvas = async function( canvasCtx , options = {} , isRedraw = false , master = this ) {
	if ( this.debugContainer ) {
		let yOffset = this.root.invertY ? canvasCtx.canvas.height - 1 - 2 * this.y - ( this.height - 1 ) : 0 ;

		canvasCtx.beginPath() ;
		canvasCtx.rect( this.x , this.y + yOffset , this.width , this.height ) ;
		canvas.fillAndStrokeUsingSvgStyle( canvasCtx , { fill: 'none' , stroke: '#f33' } ) ;
	}
} ;



/*
	This renderer does not support clipping the text, debugContainer, frame and image.
	Everything is done on the pseudo-entities.
*/
VGFlowingText.prototype.renderBeforeHookForPath2D = async function( path2D , canvasCtx , options = {} , master = this ) {
	this.initRenderData() ;
} ;






// Still Useful?




VGFlowingText.prototype.splitIntoCharacters = function( line ) {
	let splitted = [] , context ;

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



VGFlowingText.prototype.computeXYOffset = function() {
	var Control ;

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

