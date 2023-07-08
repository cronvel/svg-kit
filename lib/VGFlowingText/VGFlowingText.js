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

const fontLib = require( '../fontLib.js' ) ;
const canvas = require( '../canvas.js' ) ;



function VGFlowingText( params = {} ) {
	VGEntity.call( this , params ) ;

	this.x = + params.x || 0 ;
	this.y = + params.y || 0 ;
	this.width = + params.width || 0 ;
	this.height = + params.height || 0 ;
	this.clip = !! ( params.clip ?? true ) ;
	this.structuredText = [] ;	// Array of StructuredTextPart, the source
	this.attr = new TextAttribute( params.attr ) ;
	this.lineSpacing = + params.lineSpacing || 0 ;
	this.textWrapping = params.textWrapping || null ;	// null/ellipsis/wordWrap
	this.textHorizontalAlignment = params.textHorizontalAlignment || null ;	// null/left/right/center
	//this.textVerticalAlignment = this.textVerticalAlignment || null ;	// null/top/bottom/center

	this.debugContainer = !! params.debugContainer ;

	// Computed
	this.areLinesComputed = false ;
	this.structuredTextLines = [] ;	// Array of StructuredTextLine
	this._contentWidth = 0 ;
	this._contentHeight = 0 ;
	this._characterCount = 0 ;

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



// Those properties requires computed lines...
Object.defineProperties( VGFlowingText.prototype , {
	contentWidth: { get: function() {
		if ( ! this.areLinesComputed ) { this.computeLines() ; }
		return this._contentWidth ;
	} } ,
	contentHeight: { get: function() {
		if ( ! this.areLinesComputed ) { this.computeLines() ; }
		return this._contentHeight ;
	} } ,
	characterCount: { get: function() {
		if ( ! this.areLinesComputed ) { this.computeLines() ; }
		return this._characterCount ;
	} }
} ) ;



VGFlowingText.prototype.set = function( params ) {
	VGEntity.prototype.set.call( this , params ) ;

	if ( params.x !== undefined ) { this.x = + params.x || 0 ; this.areLinesComputed = false ; }
	if ( params.y !== undefined ) { this.y = + params.y || 0 ; this.areLinesComputed = false ; }
	if ( params.width !== undefined ) { this.width = + params.width || 0 ; this.areLinesComputed = false ; }
	if ( params.height !== undefined ) { this.height = + params.height || 0 ; this.areLinesComputed = false ; }

	if ( params.clip !== undefined ) { this.clip = !! params.clip ; }

	if ( params.structuredText ) { this.setStructuredText( params.structuredText ) ; }
	if ( params.attr ) { this.attr = new TextAttribute( params.attr ) ; this.areLinesComputed = false ; }
	if ( params.lineSpacing !== undefined ) { this.lineSpacing = + params.lineSpacing || 0 ; this.areLinesComputed = false ; }
	if ( params.textWrapping !== undefined ) { this.textWrapping = params.textWrapping ; this.areLinesComputed = false ; }
	if ( params.textHorizontalAlignment !== undefined ) { this.textHorizontalAlignment = params.textHorizontalAlignment ; this.areLinesComputed = false ; }

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
	if ( this.textHorizontalAlignment ) { data.textHorizontalAlignment = this.textHorizontalAlignment ; }
	//if ( this.textVerticalAlignment ) { data.textVerticalAlignment = this.textVerticalAlignment ; }

	return data ;
} ;



VGFlowingText.prototype.setStructuredText = function( structuredText ) {
	if ( ! Array.isArray( structuredText ) ) { return ; }

	this.structuredText.length = 0 ;

	for ( let structuredTextPart of structuredText ) {
		if ( structuredTextPart instanceof StructuredTextPart ) { this.structuredText.push( structuredTextPart ) ; }
		else { this.structuredText.push( new StructuredTextPart( structuredTextPart ) ) ; }
	}

	this.areLinesComputed = false ;
} ;



VGFlowingText.prototype.computeLines = function() {
	this.structuredTextLines = this.breakLines( this.width ) ;
	this.computePartsPosition() ;
	this.structuredTextLines.forEach( line => line.fuseEqualAttr() ) ;
	this.areLinesComputed = true ;
} ;



VGFlowingText.prototype.breakLines = function( width = this.width ) {
	var outputLines = [] , // Array of StructuredTextLine
		lines = VGFlowingText.parseNewLine( this.structuredText ) ;

	// Finally split/apply text-wrapping
	if ( this.textWrapping === 'ellipsis' ) {
		for ( let line of lines ) {
			outputLines.push( this.parseStructuredTextLineEllipsis( line ) ) ;
		}
	}
	else if ( this.textWrapping === 'wordWrap' ) {
		for ( let line of lines ) {
			outputLines.push( ... this.parseStructuredTextLineWordWrap( line ) ) ;
		}
	}
	else {
		for ( let line of lines ) {
			outputLines.push( this.parseStructuredTextLine( line ) ) ;
		}
	}

	return outputLines ;
} ;



VGFlowingText.prototype.parseStructuredTextLine = function( line ) {
	var metrics = this.computePartsSizeMetrics( line ) ;
	return new StructuredTextLine( line , metrics ) ;
} ;



VGFlowingText.prototype.parseStructuredTextLineEllipsis = function( line ) {
	var metrics = this.computePartsSizeMetrics( line ) ;

	while ( line.length && metrics.width > this.width ) {
		const part = line[ line.length - 1 ] ;
		const characters = Array.from( part.text ) ;

		while ( characters.length && metrics.width > this.width ) {
			characters.pop() ;
			part.text = characters.join( '' ) + "…" ;
			delete part.metrics ;    // delete .metrics, so .computePartsSizeMetrics() will re-compute it instead of using the existing one
			metrics = this.computePartsSizeMetrics( line ) ;
		}

		if ( metrics.width > this.width ) {
			line.pop() ;
		}
	}

	return new StructuredTextLine( line , metrics ) ;
} ;



VGFlowingText.prototype.parseStructuredTextLineWordWrap = function( line ) {
	const outputLines = [] ; // Array of Array of StructuredTextPart
	const outputParts = [] ; // Array of StructuredTextPart

	// Split each part of the line
	for ( let part of line ) {
		for ( let newTextPart of this.splitLine( part.text ) ) {
			let newPart = new StructuredTextPart( part ) ;
			newPart.text = newTextPart ;
			newPart.metrics = null ;
			outputParts.push( newPart ) ;
		}
	}

	let lastTestLineMetrics = new TextMetrics() ;
	let testLineMetrics = new TextMetrics() ;
	let testLine = [] ; // Array of StructuredTextPart

	for ( let part of outputParts ) {
		testLine.push( part ) ;

		if ( ! part.metrics ) { part.computeSizeMetrics( this.attr ) ; }
		testLineMetrics.fuseWithRightPart( part.metrics ) ;

		if ( testLineMetrics.width > this.width && testLine.length > 1 ) {
			testLine.pop() ;
			outputLines.push( new StructuredTextLine( testLine , lastTestLineMetrics ) ) ;
			lastTestLineMetrics = new TextMetrics() ;

			// Create a new line with the current part as the first part.
			// We have to left-trim it because it mays contain a space.
			let trimmedText = part.text.trimStart() ;

			if ( trimmedText !== part.text ) {
				part.text = trimmedText ;
				part.computeSizeMetrics( this.attr ) ;
			}

			testLine = [ part ] ;
			testLineMetrics.clear() ;
			testLineMetrics.fuseWithRightPart( part.metrics ) ;
		}

		lastTestLineMetrics.fuseWithRightPart( part.metrics ) ;
	}

	outputLines.push( new StructuredTextLine( testLine , lastTestLineMetrics ) ) ;

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
	this._contentWidth = 0 ;
	this._contentHeight = 0 ;
	this._characterCount = 0 ;

	var x , y = this.y ,
		lastStructuredTextLine = null ;

	for ( let structuredTextLine of this.structuredTextLines ) {
		if ( lastStructuredTextLine ) {
			// It is a new line, offset it depending on the previous one
			y += - lastStructuredTextLine.metrics.descender + lastStructuredTextLine.metrics.lineGap + this.lineSpacing ;
			this._contentHeight += lastStructuredTextLine.metrics.lineGap + this.lineSpacing ;
		}

		y += structuredTextLine.metrics.ascender ;
		this._contentHeight += structuredTextLine.metrics.ascender - structuredTextLine.metrics.descender ;

		if ( structuredTextLine.metrics.width > this._contentWidth ) { this._contentWidth = structuredTextLine.metrics.width ; }

		switch ( this.textHorizontalAlignment ) {
			case 'right' :
				x = this.x + this.width - structuredTextLine.metrics.width ;
				break ;
			case 'center' :
				x = this.x + ( this.width - structuredTextLine.metrics.width ) / 2 ;
				break ;
			case 'left' :
			default :
				x = this.x ;
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

			this._characterCount += part.text.length ;
		}

		lastStructuredTextLine = structuredTextLine ;
	}
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



// Split the line into words, suitable to compute word-wrapping
// Note: This splitting function does not exlude the splitter, it keeps it on the right-side of the split.
VGFlowingText.prototype.splitLine = function( str ) {
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



// Renderers



VGFlowingText.prototype.svgAttributes = function( root = this ) {
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
VGFlowingText.prototype.renderingContainerHookForSvgText = function( root = this ) {
	if ( ! this.areLinesComputed ) { this.computeLines() ; }

	var str = '' ;

	if ( this.clip ) {
		// Nothing inside the <clipPath> is displayed
		str += '<clipPath id="' + this._id + '_clipPath">' ;
		str += '<rect' ;
		str += ' x="' + this.x + '"' ;
		str += ' y="' + this.y + '"' ;
		str += ' width="' + this.width + '"' ;
		str += ' height="' + this.height + '"' ;
		str += ' />' ;
		str += '</clipPath>' ;
	}

	for ( let structuredTextLine of this.structuredTextLines ) {
		for ( let part of structuredTextLine.parts ) {
			let fontFamily = part.attr.getFontFamily( this.attr ) ,
				fontSize = part.attr.getFontSize( this.attr ) ,
				textStyleStr = part.attr.getTextSvgStyleString( this.attr , fontSize ) ,
				lineStyleStr , lineThickness ,
				underline = part.attr.getUnderline( this.attr ) ,
				lineThrough = part.attr.getLineThrough( this.attr ) ,
				frame = part.attr.getFrame( this.attr ) ;

			console.error( "???" , fontFamily , fontSize , textStyleStr ) ;
			let font = fontLib.getFont( fontFamily ) ;
			if ( ! font ) { throw new Error( "Font not found: " + fontFamily ) ; }

			if ( frame ) {
				let frameY = part.metrics.baselineY - part.metrics.ascender ,
					frameHeight = part.metrics.ascender - part.metrics.descender ,
					frameStyleStr = part.attr.getFrameSvgStyleString( this.attr , fontSize ) ,
					cornerRadius = part.attr.getFrameCornerRadius( this.attr , fontSize ) ;

				console.error( "frameStyleStr:" , frameStyleStr , part.attr ) ;
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
				let underlineY = part.metrics.baselineY - part.metrics.descender * 0.6 - lineThickness ;

				str += '<rect' ;
				str += ' x="' + part.metrics.x + '"' ;
				str += ' y="' + underlineY + '"' ;
				str += ' width="' + part.metrics.width + '"' ;
				str += ' height="' + lineThickness + '"' ;
				if ( lineStyleStr ) { str += ' style="' + lineStyleStr + '"' ; }
				str += ' />' ;
			}

			let path = font.getPath( part.text , part.metrics.x , part.metrics.baselineY , fontSize ) ;
			let pathData = path.toPathData() ;

			str += '<path' ;
			if ( textStyleStr ) { str += ' style="' + textStyleStr + '"' ; }
			str += ' d="' + pathData + '"' ;
			str += ' />' ;

			if ( lineThrough ) {
				let lineThroughY = part.metrics.baselineY - part.metrics.ascender * 0.25 - lineThickness ;

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
		str += ' y="' + this.y + '"' ;
		str += ' width="' + this.width + '"' ;
		str += ' height="' + this.height + '"' ;
		str += ' style="fill:none;stroke:#f33"' ;
		str += ' />' ;
	}

	return str ;
} ;



VGFlowingText.prototype.renderingContainerHookForSvgDom = function( root = this ) {
	if ( ! this.areLinesComputed ) { this.computeLines() ; }

	var elementList = [] ;

	if ( this.clip ) {
		// Nothing inside the <clipPath> is displayed
		let $clipPath = document.createElementNS( 'http://www.w3.org/2000/svg' , 'clipPath' ) ;
		$clipPath.setAttribute( 'id' , this._id + '_clipPath' ) ;
		elementList.push( $clipPath ) ;

		let $rect = document.createElementNS( 'http://www.w3.org/2000/svg' , 'rect' ) ;
		$rect.setAttribute( 'x' , this.x ) ;
		$rect.setAttribute( 'y' , this.y ) ;
		$rect.setAttribute( 'width' , this.width ) ;
		$rect.setAttribute( 'height' , this.height ) ;
		$clipPath.appendChild( $rect ) ;
	}

	for ( let structuredTextLine of this.structuredTextLines ) {
		for ( let part of structuredTextLine.parts ) {
			let fontFamily = part.attr.getFontFamily( this.attr ) ,
				fontSize = part.attr.getFontSize( this.attr ) ,
				textStyleStr = part.attr.getTextSvgStyleString( this.attr , fontSize ) ,
				lineStyleStr , lineThickness ,
				underline = part.attr.getUnderline( this.attr ) ,
				lineThrough = part.attr.getLineThrough( this.attr ) ,
				frame = part.attr.getFrame( this.attr ) ;

			console.error( "???" , fontFamily , fontSize , textStyleStr ) ;
			let font = fontLib.getFont( fontFamily ) ;
			if ( ! font ) { throw new Error( "Font not found: " + fontFamily ) ; }

			if ( frame ) {
				let frameY = part.metrics.baselineY - part.metrics.ascender ,
					frameHeight = part.metrics.ascender - part.metrics.descender ,
					frameStyleStr = part.attr.getFrameSvgStyleString( this.attr , fontSize ) ,
					cornerRadius = part.attr.getFrameCornerRadius( this.attr , fontSize ) ;

				console.error( "frameStyleStr:" , frameStyleStr , part.attr ) ;
				let $frame = document.createElementNS( 'http://www.w3.org/2000/svg' , 'rect' ) ;
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
				let underlineY = part.metrics.baselineY - part.metrics.descender * 0.6 - lineThickness ;

				let $line = document.createElementNS( 'http://www.w3.org/2000/svg' , 'rect' ) ;
				$line.setAttribute( 'x' , part.metrics.x ) ;
				$line.setAttribute( 'y' , underlineY ) ;
				$line.setAttribute( 'width' , part.metrics.width ) ;
				$line.setAttribute( 'height' , lineThickness ) ;
				if ( lineStyleStr ) { $line.setAttribute( 'style' , lineStyleStr ) ; }
				elementList.push( $line ) ;
			}

			let path = font.getPath( part.text , part.metrics.x , part.metrics.baselineY , fontSize ) ;
			let pathData = path.toPathData() ;

			let $textPath = document.createElementNS( 'http://www.w3.org/2000/svg' , 'path' ) ;
			if ( textStyleStr ) { $textPath.setAttribute( 'style' , textStyleStr ) ; }
			$textPath.setAttribute( 'd' , pathData ) ;
			elementList.push( $textPath ) ;

			if ( lineThrough ) {
				let lineThroughY = part.metrics.baselineY - part.metrics.ascender * 0.25 - lineThickness ;

				let $line = document.createElementNS( 'http://www.w3.org/2000/svg' , 'rect' ) ;
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
		let $debugRect = document.createElementNS( 'http://www.w3.org/2000/svg' , 'rect' ) ;
		$debugRect.setAttribute( 'x' , this.x ) ;
		$debugRect.setAttribute( 'y' , this.y ) ;
		$debugRect.setAttribute( 'width' , this.width ) ;
		$debugRect.setAttribute( 'height' , this.height ) ;
		$debugRect.setAttribute( 'style' , "fill:none;stroke:#f33;" ) ;
		elementList.push( $debugRect ) ;
	}

	//console.log( "Returning:" , elementList ) ;
	return elementList ;
} ;



VGFlowingText.prototype.renderHookForCanvas = function( canvasCtx , options = {} , root = this ) {
	if ( ! this.areLinesComputed ) { this.computeLines() ; }

	// We have to save context because canvasCtx.clip() is not reversible
	canvasCtx.save() ;

	if ( this.clip ) {
		canvasCtx.beginPath() ;
		canvasCtx.rect( this.x , this.y , this.width , this.height ) ;
		canvasCtx.clip() ;
	}

	for ( let structuredTextLine of this.structuredTextLines ) {
		for ( let part of structuredTextLine.parts ) {
			let fontFamily = part.attr.getFontFamily( this.attr ) ,
				fontSize = part.attr.getFontSize( this.attr ) ,
				textStyle = part.attr.getTextSvgStyle( this.attr , fontSize ) ,
				lineStyle , lineThickness ,
				underline = part.attr.getUnderline( this.attr ) ,
				lineThrough = part.attr.getLineThrough( this.attr ) ,
				frame = part.attr.getFrame( this.attr ) ;

			console.error( "???" , fontFamily , fontSize , textStyle ) ;
			let font = fontLib.getFont( fontFamily ) ;
			if ( ! font ) { throw new Error( "Font not found: " + fontFamily ) ; }

			if ( frame ) {
				let frameY = part.metrics.baselineY - part.metrics.ascender ,
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

				canvas.fillAndStrokeUsingSvgStyle( canvasCtx , frameStyle ) ;
			}

			if ( underline || lineThrough ) {
				lineStyle = part.attr.getLineSvgStyle( this.attr , fontSize ) ;
				lineThickness = part.attr.getLineThickness( this.attr , fontSize ) ;
			}

			if ( underline ) {
				let underlineY = part.metrics.baselineY - part.metrics.descender * 0.6 - lineThickness ;
				canvasCtx.beginPath() ;
				canvasCtx.rect( part.metrics.x , underlineY , part.metrics.width , lineThickness ) ;
				canvas.fillAndStrokeUsingSvgStyle( canvasCtx , lineStyle ) ;
			}

			let path = font.getPath( part.text , part.metrics.x , part.metrics.baselineY , fontSize ) ;
			let pathData = path.toPathData() ;
			let path2d = new Path2D( pathData ) ;
			canvas.fillAndStrokeUsingSvgStyle( canvasCtx , textStyle , path2d ) ;

			if ( lineThrough ) {
				let lineThroughY = part.metrics.baselineY - part.metrics.ascender * 0.25 - lineThickness ;
				canvasCtx.beginPath() ;
				canvasCtx.rect( part.metrics.x , lineThroughY , part.metrics.width , lineThickness ) ;
				canvas.fillAndStrokeUsingSvgStyle( canvasCtx , lineStyle ) ;
			}
		}
	}

	if ( this.debugContainer ) {
		canvasCtx.beginPath() ;
		canvasCtx.rect( this.x , this.y , this.width , this.height ) ;
		canvas.fillAndStrokeUsingSvgStyle( canvasCtx , { fill: 'none' , stroke: '#f33' } ) ;
	}

	canvasCtx.restore() ;
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
			this.yOffset += this.currentMeasure.height - this._contentHeight ;
			break ;
		case Control.VERTICAL_ALIGNMENT_CENTER :
			this.yOffset += ( this.currentMeasure.height - this._contentHeight ) / 2 ;
			break ;
	}
} ;

