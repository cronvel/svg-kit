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



const VGPseudoEntity = require( '../VGPseudoEntity.js' ) ;

const TextAttribute = require( './TextAttribute.js' ) ;
const TextMetrics = require( './TextMetrics.js' ) ;
//const BoundingBox = require( '../BoundingBox.js' ) ;

const fontLib = require( '../fontLib.js' ) ;
const canvas = require( '../canvas.js' ) ;

//const dom = require( 'dom-kit' ) ;



function VGFlowingTextPart( params ) {
	VGPseudoEntity.call( this , params ) ;

	this.text = '' ;
	this.metrics = null ;
	this.attr = null ;

	if ( params ) { this.set( params ) ; }
}

module.exports = VGFlowingTextPart ;

VGFlowingTextPart.prototype = Object.create( VGPseudoEntity.prototype ) ;
VGFlowingTextPart.prototype.constructor = VGFlowingTextPart ;
VGFlowingTextPart.prototype.__prototypeUID__ = 'svg-kit/VGFlowingTextPart' ;
VGFlowingTextPart.prototype.__prototypeVersion__ = require( '../../package.json' ).version ;



VGFlowingTextPart.prototype.isRenderingContainer = true ;
VGFlowingTextPart.prototype.svgTag = 'g' ;



VGFlowingTextPart.prototype.set = function( params ) {
	console.warn( "VGFlowingTextPart.prototype.set:" , params ) ;
	VGPseudoEntity.prototype.set.call( this , params ) ;

	if ( params.text !== undefined ) { this.text = params.text ; }

	if ( params.metrics ) {
		if ( params.metrics instanceof TextMetrics ) { this.metrics = params.metrics ; }
		// TextMetrics.set() does not exist ATM
		//else { this.metrics.set( params.metrics ) ; }
	}

	if ( params.attr ) {
		if ( params.attr instanceof TextAttribute ) { this.attr = params.attr ; }
		else { this.attr.set( params.attr ) ; }
	}
} ;



// Renderers



VGFlowingTextPart.prototype.svgAttributes = function( master = this ) {
	var attr = {} ;
	return attr ;
} ;



// Render the Vector Graphic as a text SVG
VGFlowingTextPart.prototype.renderingContainerHookForSvgText = async function( master = this ) {
	var parentAttr = this.parent.attr ,
		yOffset = this.root.invertY ? - 2 * this.y - this.height : 0 ,
		str = '' ,
		fontFamily = this.attr.getFontFamily( parentAttr ) ,
		fontStyle = this.attr.getFontStyle( parentAttr ) ,
		fontWeight = this.attr.getFontWeight( parentAttr ) ,
		fontSize = this.attr.getFontSize( parentAttr ) ,
		textStyleStr = this.attr.getTextSvgStyleString( parentAttr , fontSize , master?.palette ) ,
		lineStyleStr , lineThickness ,
		underline = this.attr.getUnderline( parentAttr ) ,
		lineThrough = this.attr.getLineThrough( parentAttr ) ,
		frame = this.attr.getFrame( parentAttr ) ;

	var font = await fontLib.getFallbackFontAsync( fontFamily , fontStyle , fontWeight ) ;
	if ( ! font ) { throw new Error( "Font not found: " + fontFamily + ' ' + fontStyle + ' ' + fontWeight ) ; }

	if ( frame ) {
		let frameY = this.metrics.baselineY - this.metrics.ascender + yOffset ,
			frameHeight = this.metrics.ascender - this.metrics.descender ,
			frameStyleStr = this.attr.getFrameSvgStyleString( parentAttr , fontSize , master?.palette ) ,
			cornerRadius = this.attr.getFrameCornerRadius( parentAttr , fontSize ) ;

		//console.error( "frameStyleStr:" , frameStyleStr , this.attr ) ;
		str += '<rect' ;
		str += ' x="' + this.metrics.x + '"' ;
		str += ' y="' + frameY + '"' ;
		str += ' width="' + this.metrics.width + '"' ;
		str += ' height="' + frameHeight + '"' ;
		if ( cornerRadius ) { str += ' rx="' + cornerRadius + '"' ; }
		if ( frameStyleStr ) { str += ' style="' + frameStyleStr + '"' ; }
		str += ' />' ;
	}

	if ( underline || lineThrough ) {
		lineStyleStr = this.attr.getLineSvgStyleString( parentAttr , fontSize , master?.palette ) ;
		lineThickness = this.attr.getLineThickness( parentAttr , fontSize ) ;
	}

	if ( underline ) {
		let underlineY = this.metrics.baselineY - this.metrics.descender * 0.6 - lineThickness + yOffset ;

		str += '<rect' ;
		str += ' x="' + this.metrics.x + '"' ;
		str += ' y="' + underlineY + '"' ;
		str += ' width="' + this.metrics.width + '"' ;
		str += ' height="' + lineThickness + '"' ;
		if ( lineStyleStr ) { str += ' style="' + lineStyleStr + '"' ; }
		str += ' />' ;
	}

	let path = font.getPath( this.text , this.metrics.x , this.metrics.baselineY + yOffset , fontSize ) ;
	let pathData = path.toPathData() ;

	str += '<path' ;
	if ( textStyleStr ) { str += ' style="' + textStyleStr + '"' ; }
	str += ' d="' + pathData + '"' ;
	str += ' />' ;

	if ( lineThrough ) {
		let lineThroughY = this.metrics.baselineY - this.metrics.ascender * 0.25 - lineThickness + yOffset ;

		str += '<rect' ;
		str += ' x="' + this.metrics.x + '"' ;
		str += ' y="' + lineThroughY + '"' ;
		str += ' width="' + this.metrics.width + '"' ;
		str += ' height="' + lineThickness + '"' ;
		if ( lineStyleStr ) { str += ' style="' + lineStyleStr + '"' ; }
		str += ' />' ;
	}

	return str ;
} ;



VGFlowingTextPart.prototype.renderingContainerHookForSvgDom = async function( master = this ) {
	var parentAttr = this.parent.attr ,
		yOffset = this.root.invertY ? - 2 * this.y - this.height : 0 ,
		elementList = [] ,
		fontFamily = this.attr.getFontFamily( parentAttr ) ,
		fontStyle = this.attr.getFontStyle( parentAttr ) ,
		fontWeight = this.attr.getFontWeight( parentAttr ) ,
		fontSize = this.attr.getFontSize( parentAttr ) ,
		textStyleStr = this.attr.getTextSvgStyleString( parentAttr , fontSize , master?.palette ) ,
		lineStyleStr , lineThickness ,
		underline = this.attr.getUnderline( parentAttr ) ,
		lineThrough = this.attr.getLineThrough( parentAttr ) ,
		frame = this.attr.getFrame( parentAttr ) ;

	//console.error( "???" , fontFamily , fontSize , textStyleStr ) ;
	var font = await fontLib.getFallbackFontAsync( fontFamily , fontStyle , fontWeight ) ;
	if ( ! font ) { throw new Error( "Font not found: " + fontFamily + ' ' + fontStyle + ' ' + fontWeight ) ; }

	if ( frame ) {
		let frameY = this.metrics.baselineY - this.metrics.ascender + yOffset ,
			frameHeight = this.metrics.ascender - this.metrics.descender ,
			frameStyleStr = this.attr.getFrameSvgStyleString( parentAttr , fontSize , master?.palette ) ,
			cornerRadius = this.attr.getFrameCornerRadius( parentAttr , fontSize ) ;

		//console.error( "frameStyleStr:" , frameStyleStr , this.attr ) ;
		let $frame = document.createElementNS( this.NS , 'rect' ) ;
		$frame.setAttribute( 'x' , this.metrics.x ) ;
		$frame.setAttribute( 'y' , frameY ) ;
		$frame.setAttribute( 'width' , this.metrics.width ) ;
		$frame.setAttribute( 'height' , frameHeight ) ;
		if ( cornerRadius ) { $frame.setAttribute( 'rx' , cornerRadius ) ; }
		if ( frameStyleStr ) { $frame.setAttribute( 'style' , frameStyleStr ) ; }
		elementList.push( $frame ) ;
	}

	if ( underline || lineThrough ) {
		lineStyleStr = this.attr.getLineSvgStyleString( parentAttr , fontSize , master?.palette ) ;
		lineThickness = this.attr.getLineThickness( parentAttr , fontSize ) ;
	}

	if ( underline ) {
		let underlineY = this.metrics.baselineY - this.metrics.descender * 0.6 - lineThickness + yOffset ;

		let $line = document.createElementNS( this.NS , 'rect' ) ;
		$line.setAttribute( 'x' , this.metrics.x ) ;
		$line.setAttribute( 'y' , underlineY ) ;
		$line.setAttribute( 'width' , this.metrics.width ) ;
		$line.setAttribute( 'height' , lineThickness ) ;
		if ( lineStyleStr ) { $line.setAttribute( 'style' , lineStyleStr ) ; }
		elementList.push( $line ) ;
	}

	let path = font.getPath( this.text , this.metrics.x , this.metrics.baselineY + yOffset , fontSize ) ;
	let pathData = path.toPathData() ;

	let $textPath = document.createElementNS( this.NS , 'path' ) ;
	if ( textStyleStr ) { $textPath.setAttribute( 'style' , textStyleStr ) ; }
	$textPath.setAttribute( 'd' , pathData ) ;
	elementList.push( $textPath ) ;

	if ( lineThrough ) {
		let lineThroughY = this.metrics.baselineY - this.metrics.ascender * 0.25 - lineThickness + yOffset ;

		let $line = document.createElementNS( this.NS , 'rect' ) ;
		$line.setAttribute( 'x' , this.metrics.x ) ;
		$line.setAttribute( 'y' , lineThroughY ) ;
		$line.setAttribute( 'width' , this.metrics.width ) ;
		$line.setAttribute( 'height' , lineThickness ) ;
		if ( lineStyleStr ) { $line.setAttribute( 'style' , lineStyleStr ) ; }
		elementList.push( $line ) ;
	}

	//console.log( "Returning:" , elementList ) ;
	return elementList ;
} ;



VGFlowingTextPart.prototype.renderHookForCanvas = async function( canvasCtx , options = {} , isRedraw = false , master = this ) {
	var parentAttr = this.parent.attr ,
		yOffset = this.root.invertY ? canvasCtx.canvas.height - 1 - 2 * this.y - ( this.height - 1 ) : 0 ,
		fontFamily = this.attr.getFontFamily( parentAttr ) ,
		fontStyle = this.attr.getFontStyle( parentAttr ) ,
		fontWeight = this.attr.getFontWeight( parentAttr ) ,
		fontSize = this.attr.getFontSize( parentAttr ) ,
		textStyle = this.attr.getTextSvgStyle( parentAttr , fontSize , master?.palette ) ,
		lineStyle , lineThickness ,
		underline = this.attr.getUnderline( parentAttr ) ,
		lineThrough = this.attr.getLineThrough( parentAttr ) ,
		frame = this.attr.getFrame( parentAttr ) ;

	//console.error( "???" , fontFamily , fontSize , textStyle ) ;
	var font = await fontLib.getFallbackFontAsync( fontFamily , fontStyle , fontWeight ) ;
	if ( ! font ) { throw new Error( "Font not found: " + fontFamily + ' ' + fontStyle + ' ' + fontWeight ) ; }

	if ( frame ) {
		let frameY = this.metrics.baselineY - this.metrics.ascender + yOffset ,
			frameHeight = this.metrics.ascender - this.metrics.descender ,
			frameStyle = this.attr.getFrameSvgStyle( parentAttr , fontSize , master?.palette ) ,
			cornerRadius = this.attr.getFrameCornerRadius( parentAttr , fontSize ) ;

		canvasCtx.beginPath() ;

		if ( cornerRadius ) {
			canvasCtx.roundRect( this.metrics.x , frameY , this.metrics.width , frameHeight , cornerRadius ) ;
		}
		else {
			canvasCtx.rect( this.metrics.x , frameY , this.metrics.width , frameHeight ) ;
		}

		canvas.fillAndStrokeUsingSvgStyle( canvasCtx , frameStyle ) ;
	}

	if ( underline || lineThrough ) {
		lineStyle = this.attr.getLineSvgStyle( parentAttr , fontSize , master?.palette ) ;
		lineThickness = this.attr.getLineThickness( parentAttr , fontSize ) ;
	}

	if ( underline ) {
		let underlineY = this.metrics.baselineY - this.metrics.descender * 0.6 - lineThickness + yOffset ;
		canvasCtx.beginPath() ;
		canvasCtx.rect( this.metrics.x , underlineY , this.metrics.width , lineThickness ) ;
		canvas.fillAndStrokeUsingSvgStyle( canvasCtx , lineStyle ) ;
	}

	let path = font.getPath( this.text , this.metrics.x , this.metrics.baselineY + yOffset , fontSize ) ;
	let pathData = path.toPathData() ;
	let path2D = new Path2D( pathData ) ;
	canvas.fillAndStrokeUsingSvgStyle( canvasCtx , textStyle , path2D ) ;

	if ( lineThrough ) {
		let lineThroughY = this.metrics.baselineY - this.metrics.ascender * 0.25 - lineThickness + yOffset ;
		canvasCtx.beginPath() ;
		canvasCtx.rect( this.metrics.x , lineThroughY , this.metrics.width , lineThickness ) ;
		canvas.fillAndStrokeUsingSvgStyle( canvasCtx , lineStyle ) ;
	}
} ;



/*
	This renderer does not support clipping the text, debugContainer, and frame.
*/
VGFlowingTextPart.prototype.renderHookForPath2D = async function( path2D , canvasCtx , options = {} , master = this ) {
	var parentAttr = this.parent.attr ,
		yOffset = this.root.invertY ? canvasCtx.canvas.height - 1 - 2 * this.y - ( this.height - 1 ) : 0 ,
		fontFamily = this.attr.getFontFamily( parentAttr ) ,
		fontStyle = this.attr.getFontStyle( parentAttr ) ,
		fontWeight = this.attr.getFontWeight( parentAttr ) ,
		fontSize = this.attr.getFontSize( parentAttr ) ,
		lineThickness ,
		underline = this.attr.getUnderline( parentAttr ) ,
		lineThrough = this.attr.getLineThrough( parentAttr ) ;

	//console.error( "???" , fontFamily , fontSize , textStyle ) ;
	var font = await fontLib.getFallbackFontAsync( fontFamily , fontStyle , fontWeight ) ;
	if ( ! font ) { throw new Error( "Font not found: " + fontFamily + ' ' + fontStyle + ' ' + fontWeight ) ; }

	if ( underline || lineThrough ) {
		lineThickness = this.attr.getLineThickness( parentAttr , fontSize ) ;
	}

	if ( underline ) {
		let underlineY = this.metrics.baselineY - this.metrics.descender * 0.6 - lineThickness + yOffset ;
		path2D.rect( this.metrics.x , underlineY , this.metrics.width , lineThickness ) ;
	}

	let path = font.getPath( this.text , this.metrics.x , this.metrics.baselineY + yOffset , fontSize ) ;
	let pathData = path.toPathData() ;
	path2D.addPath( new Path2D( pathData ) ) ;

	if ( lineThrough ) {
		let lineThroughY = this.metrics.baselineY - this.metrics.ascender * 0.25 - lineThickness + yOffset ;
		path2D.rect( this.metrics.x , lineThroughY , this.metrics.width , lineThickness ) ;
	}
} ;

