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
const BoundingBox = require( '../BoundingBox.js' ) ;

const fontLib = require( '../fontLib.js' ) ;
const canvas = require( '../canvas.js' ) ;
const structuredText = require( './structuredText.js' ) ;



function VGFlowingText( params ) {
	VGEntity.call( this , params ) ;

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

	this.debugContainer = false ;

	// Computed
	this.areLinesComputed = false ;
	this.structuredTextLines = [] ;	// Array of StructuredTextLine
	this.contentX = 0 ;
	this.contentY = 0 ;
	this.contentWidth = 0 ;
	this.contentHeight = 0 ;
	this.characterCount = 0 ;

	if ( params ) { this.set( params ) ; }
}

module.exports = VGFlowingText ;

VGFlowingText.prototype = Object.create( VGEntity.prototype ) ;
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
	VGEntity.prototype.set.call( this , params ) ;

	if ( params.x !== undefined ) { this.x = + params.x || 0 ; this.areLinesComputed = false ; }
	if ( params.y !== undefined ) { this.y = + params.y || 0 ; this.areLinesComputed = false ; }
	if ( params.width !== undefined ) { this.width = + params.width || 0 ; this.areLinesComputed = false ; }
	if ( params.height !== undefined ) { this.height = + params.height || 0 ; this.areLinesComputed = false ; }

	if ( params.clip !== undefined ) { this.clip = !! params.clip ; }

	if ( params.structuredText ) { this.setStructuredText( params.structuredText ) ; }
	else if ( params.markupText ) { this.setMarkupText( params.markupText ) ; }
	else if ( params.quickMarkupText ) { this.setQuickMarkupText( params.quickMarkupText ) ; }
	else if ( params.text ) { this.setText( params.text ) ; }

	if ( params.attr ) { this.attr = new TextAttribute( params.attr ) ; this.areLinesComputed = false ; }
	if ( params.lineSpacing !== undefined ) { this.lineSpacing = + params.lineSpacing || 0 ; this.areLinesComputed = false ; }
	if ( params.textVerticalAlignment !== undefined ) { this.textVerticalAlignment = params.textVerticalAlignment ; this.areLinesComputed = false ; }
	if ( params.textHorizontalAlignment !== undefined ) { this.textHorizontalAlignment = params.textHorizontalAlignment ; this.areLinesComputed = false ; }

	if ( params.textWrapping !== undefined ) {
		this.textWrapping = TEXT_WRAPPING[ params.textWrapping ] || null ;
		this.areLinesComputed = false ;
	}

	if ( params.debugContainer !== undefined ) { this.debugContainer = !! params.debugContainer ; }
} ;



VGFlowingText.prototype.export = function( data = {} ) {
	VGEntity.prototype.export.call( this , data ) ;

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



VGFlowingText.prototype.setStructuredText = function( structuredText_ ) {
	if ( ! Array.isArray( structuredText_ ) ) { return ; }

	this.structuredText.length = 0 ;

	for ( let structuredTextPart of structuredText_ ) {
		if ( structuredTextPart instanceof StructuredTextPart ) { this.structuredText.push( structuredTextPart ) ; }
		else { this.structuredText.push( new StructuredTextPart( structuredTextPart ) ) ; }
	}

	this.areLinesComputed = false ;
} ;



VGFlowingText.prototype.setMarkupText = function( markupText ) {
	var parsed = structuredText.parseMarkup( markupText ) ;
	return this.setStructuredText( parsed ) ;
} ;



VGFlowingText.prototype.setQuickMarkupText = function( quickMarkupText ) {
	var parsed = structuredText.parseQuickMarkup( quickMarkupText ) ;
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



VGFlowingText.prototype.getCharacterCount = async function() {
	if ( ! this.areLinesComputed ) { await this.computeLines() ; }
	return this.characterCount ;
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
			// We have to left-trim it because it mays contain spaces.
			let indexOfNextLine = index - removed + 1 ;
			for ( ; indexOfNextLine <= index ; indexOfNextLine ++ ) {
				let nextLinePart = outputParts[ indexOfNextLine ] ;
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
		let dbg = '' ;
		for ( let indexOfPartToAdd = lastIndex + 1 ; indexOfPartToAdd <= index ; indexOfPartToAdd ++ ) {
			//console.log( "indexOfPartToAdd" , indexOfPartToAdd ) ;
			lastTestLineMetrics.fuseWithRightPart( outputParts[ indexOfPartToAdd ].metrics ) ;
			dbg += outputParts[ indexOfPartToAdd ].text ;
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

	this.characterCount = 0 ;

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
				y += lastStructuredTextLine.followUpEmptyLines * this.attr.fontSize.get() ;
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

			this.characterCount += part.text.length ;
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



// Render the Vector Graphic as a text SVG
VGFlowingText.prototype.renderingContainerHookForSvgText = async function( master = this ) {
	if ( ! this.areLinesComputed ) { await this.computeLines() ; }

	var yOffset = this.root.invertY ? - 2 * this.y - this.height : 0 ,
		str = '' ;

	if ( this.clip ) {
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

	for ( let structuredTextLine of this.structuredTextLines ) {
		for ( let part of structuredTextLine.parts ) {
			let fontFamily = part.attr.getFontFamily( this.attr ) ,
				fontStyle = part.attr.getFontStyle( this.attr ) ,
				fontWeight = part.attr.getFontWeight( this.attr ) ,
				fontSize = part.attr.getFontSize( this.attr ) ,
				textStyleStr = part.attr.getTextSvgStyleString( this.attr , fontSize ) ,
				lineStyleStr , lineThickness ,
				underline = part.attr.getUnderline( this.attr ) ,
				lineThrough = part.attr.getLineThrough( this.attr ) ,
				frame = part.attr.getFrame( this.attr ) ;

			let font = await fontLib.getFallbackFontAsync( fontFamily , fontStyle , fontWeight ) ;
			if ( ! font ) { throw new Error( "Font not found: " + fontFamily + ' ' + fontStyle + ' ' + fontWeight ) ; }

			if ( frame ) {
				let frameY = part.metrics.baselineY - part.metrics.ascender + yOffset ,
					frameHeight = part.metrics.ascender - part.metrics.descender ,
					frameStyleStr = part.attr.getFrameSvgStyleString( this.attr , fontSize ) ,
					cornerRadius = part.attr.getFrameCornerRadius( this.attr , fontSize ) ;

				//console.error( "frameStyleStr:" , frameStyleStr , part.attr ) ;
				str += '<rect' ;
				str += ' x="' + part.metrics.x + '"' ;
				str += ' y="' + frameY + '"' ;
				str += ' width="' + part.metrics.width + '"' ;
				str += ' height="' + frameHeight + '"' ;
				if ( cornerRadius ) { str += ' rx="' + cornerRadius + '"' ; }
				if ( frameStyleStr ) { str += ' style="' + frameStyleStr + '"' ; }
				str += ' />' ;
			}

			if ( underline || lineThrough ) {
				lineStyleStr = part.attr.getLineSvgStyleString( this.attr , fontSize ) ;
				lineThickness = part.attr.getLineThickness( this.attr , fontSize ) ;
			}

			if ( underline ) {
				let underlineY = part.metrics.baselineY - part.metrics.descender * 0.6 - lineThickness + yOffset ;

				str += '<rect' ;
				str += ' x="' + part.metrics.x + '"' ;
				str += ' y="' + underlineY + '"' ;
				str += ' width="' + part.metrics.width + '"' ;
				str += ' height="' + lineThickness + '"' ;
				if ( lineStyleStr ) { str += ' style="' + lineStyleStr + '"' ; }
				str += ' />' ;
			}

			let path = font.getPath( part.text , part.metrics.x , part.metrics.baselineY + yOffset , fontSize ) ;
			let pathData = path.toPathData() ;

			str += '<path' ;
			if ( textStyleStr ) { str += ' style="' + textStyleStr + '"' ; }
			str += ' d="' + pathData + '"' ;
			str += ' />' ;

			if ( lineThrough ) {
				let lineThroughY = part.metrics.baselineY - part.metrics.ascender * 0.25 - lineThickness + yOffset ;

				str += '<rect' ;
				str += ' x="' + part.metrics.x + '"' ;
				str += ' y="' + lineThroughY + '"' ;
				str += ' width="' + part.metrics.width + '"' ;
				str += ' height="' + lineThickness + '"' ;
				if ( lineStyleStr ) { str += ' style="' + lineStyleStr + '"' ; }
				str += ' />' ;
			}
		}
	}

	if ( this.debugContainer ) {
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



VGFlowingText.prototype.renderingContainerHookForSvgDom = async function( master = this ) {
	if ( ! this.areLinesComputed ) { await this.computeLines() ; }

	var yOffset = this.root.invertY ? - 2 * this.y - this.height : 0 ,
		elementList = [] ;

	if ( this.clip ) {
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

	for ( let structuredTextLine of this.structuredTextLines ) {
		for ( let part of structuredTextLine.parts ) {
			let fontFamily = part.attr.getFontFamily( this.attr ) ,
				fontStyle = part.attr.getFontStyle( this.attr ) ,
				fontWeight = part.attr.getFontWeight( this.attr ) ,
				fontSize = part.attr.getFontSize( this.attr ) ,
				textStyleStr = part.attr.getTextSvgStyleString( this.attr , fontSize ) ,
				lineStyleStr , lineThickness ,
				underline = part.attr.getUnderline( this.attr ) ,
				lineThrough = part.attr.getLineThrough( this.attr ) ,
				frame = part.attr.getFrame( this.attr ) ;

			//console.error( "???" , fontFamily , fontSize , textStyleStr ) ;
			let font = await fontLib.getFallbackFontAsync( fontFamily , fontStyle , fontWeight ) ;
			if ( ! font ) { throw new Error( "Font not found: " + fontFamily + ' ' + fontStyle + ' ' + fontWeight ) ; }

			if ( frame ) {
				let frameY = part.metrics.baselineY - part.metrics.ascender + yOffset ,
					frameHeight = part.metrics.ascender - part.metrics.descender ,
					frameStyleStr = part.attr.getFrameSvgStyleString( this.attr , fontSize ) ,
					cornerRadius = part.attr.getFrameCornerRadius( this.attr , fontSize ) ;

				//console.error( "frameStyleStr:" , frameStyleStr , part.attr ) ;
				let $frame = document.createElementNS( this.NS , 'rect' ) ;
				$frame.setAttribute( 'x' , part.metrics.x ) ;
				$frame.setAttribute( 'y' , frameY ) ;
				$frame.setAttribute( 'width' , part.metrics.width ) ;
				$frame.setAttribute( 'height' , frameHeight ) ;
				if ( cornerRadius ) { $frame.setAttribute( 'rx' , cornerRadius ) ; }
				if ( frameStyleStr ) { $frame.setAttribute( 'style' , frameStyleStr ) ; }
				elementList.push( $frame ) ;
			}

			if ( underline || lineThrough ) {
				lineStyleStr = part.attr.getLineSvgStyleString( this.attr , fontSize ) ;
				lineThickness = part.attr.getLineThickness( this.attr , fontSize ) ;
			}

			if ( underline ) {
				let underlineY = part.metrics.baselineY - part.metrics.descender * 0.6 - lineThickness + yOffset ;

				let $line = document.createElementNS( this.NS , 'rect' ) ;
				$line.setAttribute( 'x' , part.metrics.x ) ;
				$line.setAttribute( 'y' , underlineY ) ;
				$line.setAttribute( 'width' , part.metrics.width ) ;
				$line.setAttribute( 'height' , lineThickness ) ;
				if ( lineStyleStr ) { $line.setAttribute( 'style' , lineStyleStr ) ; }
				elementList.push( $line ) ;
			}

			let path = font.getPath( part.text , part.metrics.x , part.metrics.baselineY + yOffset , fontSize ) ;
			let pathData = path.toPathData() ;

			let $textPath = document.createElementNS( this.NS , 'path' ) ;
			if ( textStyleStr ) { $textPath.setAttribute( 'style' , textStyleStr ) ; }
			$textPath.setAttribute( 'd' , pathData ) ;
			elementList.push( $textPath ) ;

			if ( lineThrough ) {
				let lineThroughY = part.metrics.baselineY - part.metrics.ascender * 0.25 - lineThickness + yOffset ;

				let $line = document.createElementNS( this.NS , 'rect' ) ;
				$line.setAttribute( 'x' , part.metrics.x ) ;
				$line.setAttribute( 'y' , lineThroughY ) ;
				$line.setAttribute( 'width' , part.metrics.width ) ;
				$line.setAttribute( 'height' , lineThickness ) ;
				if ( lineStyleStr ) { $line.setAttribute( 'style' , lineStyleStr ) ; }
				elementList.push( $line ) ;
			}
		}
	}

	if ( this.debugContainer ) {
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



VGFlowingText.prototype.renderHookForCanvas = async function( canvasCtx , options = {} , master = this ) {
	if ( ! this.areLinesComputed ) { await this.computeLines() ; }

	var yOffset = this.root.invertY ? canvasCtx.canvas.height - 1 - 2 * this.y - ( this.height - 1 ) : 0 ;

	// We have to save context because canvasCtx.clip() is not reversible
	canvasCtx.save() ;

	if ( this.clip ) {
		canvasCtx.beginPath() ;
		// For some reason, it seems that the first row and column is clipped away, so we have to grow the size by one pixel
		canvasCtx.rect( this.x - 1 , this.y - 1 + yOffset , this.width + 1 , this.height + 1 ) ;
		canvasCtx.clip() ;
	}

	for ( let structuredTextLine of this.structuredTextLines ) {
		for ( let part of structuredTextLine.parts ) {
			let fontFamily = part.attr.getFontFamily( this.attr ) ,
				fontStyle = part.attr.getFontStyle( this.attr ) ,
				fontWeight = part.attr.getFontWeight( this.attr ) ,
				fontSize = part.attr.getFontSize( this.attr ) ,
				textStyle = part.attr.getTextSvgStyle( this.attr , fontSize ) ,
				lineStyle , lineThickness ,
				underline = part.attr.getUnderline( this.attr ) ,
				lineThrough = part.attr.getLineThrough( this.attr ) ,
				frame = part.attr.getFrame( this.attr ) ;

			//console.error( "???" , fontFamily , fontSize , textStyle ) ;
			let font = await fontLib.getFallbackFontAsync( fontFamily , fontStyle , fontWeight ) ;
			if ( ! font ) { throw new Error( "Font not found: " + fontFamily + ' ' + fontStyle + ' ' + fontWeight ) ; }

			if ( frame ) {
				let frameY = part.metrics.baselineY - part.metrics.ascender + yOffset ,
					frameHeight = part.metrics.ascender - part.metrics.descender ,
					frameStyle = part.attr.getFrameSvgStyle( this.attr , fontSize ) ,
					cornerRadius = part.attr.getFrameCornerRadius( this.attr , fontSize ) ;

				canvasCtx.beginPath() ;

				if ( cornerRadius ) {
					canvasCtx.roundRect( part.metrics.x , frameY , part.metrics.width , frameHeight , cornerRadius ) ;
				}
				else {
					canvasCtx.rect( part.metrics.x , frameY , part.metrics.width , frameHeight ) ;
				}

				canvas.fillAndStrokeUsingSvgStyle( canvasCtx , frameStyle , master?.palette ) ;
			}

			if ( underline || lineThrough ) {
				lineStyle = part.attr.getLineSvgStyle( this.attr , fontSize ) ;
				lineThickness = part.attr.getLineThickness( this.attr , fontSize ) ;
			}

			if ( underline ) {
				let underlineY = part.metrics.baselineY - part.metrics.descender * 0.6 - lineThickness + yOffset ;
				canvasCtx.beginPath() ;
				canvasCtx.rect( part.metrics.x , underlineY , part.metrics.width , lineThickness ) ;
				canvas.fillAndStrokeUsingSvgStyle( canvasCtx , lineStyle , master?.palette ) ;
			}

			let path = font.getPath( part.text , part.metrics.x , part.metrics.baselineY + yOffset , fontSize ) ;
			let pathData = path.toPathData() ;
			let path2D = new Path2D( pathData ) ;
			canvas.fillAndStrokeUsingSvgStyle( canvasCtx , textStyle , master?.palette , path2D ) ;

			if ( lineThrough ) {
				let lineThroughY = part.metrics.baselineY - part.metrics.ascender * 0.25 - lineThickness + yOffset ;
				canvasCtx.beginPath() ;
				canvasCtx.rect( part.metrics.x , lineThroughY , part.metrics.width , lineThickness ) ;
				canvas.fillAndStrokeUsingSvgStyle( canvasCtx , lineStyle , master?.palette ) ;
			}
		}
	}

	if ( this.debugContainer ) {
		canvasCtx.beginPath() ;
		canvasCtx.rect( this.x , this.y + yOffset , this.width , this.height ) ;
		canvas.fillAndStrokeUsingSvgStyle( canvasCtx , { fill: 'none' , stroke: '#f33' } ) ;
	}

	canvasCtx.restore() ;
} ;



/*
	This renderer does not support clipping the text, debugContainer, and frame.
*/
VGFlowingText.prototype.renderHookForPath2D = async function( path2D , canvasCtx , options = {} , master = this ) {
	if ( ! this.areLinesComputed ) { await this.computeLines() ; }

	var yOffset = this.root.invertY ? canvasCtx.canvas.height - 1 - 2 * this.y - ( this.height - 1 ) : 0 ;

	for ( let structuredTextLine of this.structuredTextLines ) {
		for ( let part of structuredTextLine.parts ) {
			let fontFamily = part.attr.getFontFamily( this.attr ) ,
				fontStyle = part.attr.getFontStyle( this.attr ) ,
				fontWeight = part.attr.getFontWeight( this.attr ) ,
				fontSize = part.attr.getFontSize( this.attr ) ,
				lineThickness ,
				underline = part.attr.getUnderline( this.attr ) ,
				lineThrough = part.attr.getLineThrough( this.attr ) ;

			//console.error( "???" , fontFamily , fontSize , textStyle ) ;
			let font = await fontLib.getFallbackFontAsync( fontFamily , fontStyle , fontWeight ) ;
			if ( ! font ) { throw new Error( "Font not found: " + fontFamily + ' ' + fontStyle + ' ' + fontWeight ) ; }

			if ( underline || lineThrough ) {
				lineThickness = part.attr.getLineThickness( this.attr , fontSize ) ;
			}

			if ( underline ) {
				let underlineY = part.metrics.baselineY - part.metrics.descender * 0.6 - lineThickness + yOffset ;
				path2D.rect( part.metrics.x , underlineY , part.metrics.width , lineThickness ) ;
			}

			let path = font.getPath( part.text , part.metrics.x , part.metrics.baselineY + yOffset , fontSize ) ;
			let pathData = path.toPathData() ;
			path2D.addPath( new Path2D( pathData ) ) ;

			if ( lineThrough ) {
				let lineThroughY = part.metrics.baselineY - part.metrics.ascender * 0.25 - lineThickness + yOffset ;
				path2D.rect( part.metrics.x , lineThroughY , part.metrics.width , lineThickness ) ;
			}
		}
	}
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

