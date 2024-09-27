/*
	SVG Kit

	Copyright (c) 2017 - 2024 Cédric Ronvel

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

//const TextMetrics = require( './TextMetrics.js' ) ;
//const BoundingBox = require( '../BoundingBox.js' ) ;

const dom = require( 'dom-kit' ) ;



function VGFlowingTextImagePart( params ) {
	VGPseudoEntity.call( this , params ) ;

	this.imageUrl = '' ;
	this.metrics = null ;

	if ( params ) { this.set( params ) ; }
}

module.exports = VGFlowingTextImagePart ;

VGFlowingTextImagePart.prototype = Object.create( VGPseudoEntity.prototype ) ;
VGFlowingTextImagePart.prototype.constructor = VGFlowingTextImagePart ;
VGFlowingTextImagePart.prototype.__prototypeUID__ = 'svg-kit/VGFlowingTextImagePart' ;
VGFlowingTextImagePart.prototype.__prototypeVersion__ = require( '../../package.json' ).version ;



VGFlowingTextImagePart.prototype.isRenderingContainer = true ;
VGFlowingTextImagePart.prototype.svgTag = 'g' ;



VGFlowingTextImagePart.prototype.set = function( params ) {
	if ( params.imageUrl ) { this.imageUrl = params.imageUrl ; }
	if ( params.metrics ) { this.metrics = params.metrics ; }

	VGPseudoEntity.prototype.set.call( this , params ) ;
} ;



// Renderers



VGFlowingTextImagePart.prototype.svgAttributes = function( master = this ) {
	var attr = {} ;
	return attr ;
} ;



// Render the Vector Graphic as a text SVG
VGFlowingTextImagePart.prototype.renderingContainerHookForSvgText = async function( master = this ) {
	var yOffset = this.root.invertY ? - 2 * this.y - this.height : 0 ,
		str = '' ;

	str += '<image' ;
	str += ' x="' + ( this.metrics.x ) + '"' ;
	str += ' y="' + ( this.metrics.baselineY - this.metrics.ascender + yOffset ) + '"' ;
	str += ' width="' + ( this.metrics.width ) + '"' ;
	str += ' height="' + ( this.metrics.ascender ) + '"' ;
	//str += ' preserveAspectRatio="none"' ;
	str += ' xlink:href="' + this.imageUrl + '"' ;
	str += ' />' ;

	return str ;
} ;



VGFlowingTextImagePart.prototype.renderingContainerHookForSvgDom = async function( master = this ) {
	var yOffset = this.root.invertY ? - 2 * this.y - this.height : 0 ,
		elementList = [] ;

	//console.error( "???" , fontFamily , fontSize , textStyleStr ) ;

	let $image = document.createElementNS( this.NS , 'image' ) ;
	dom.attr( $image , {
		x: this.metrics.x ,
		y: this.metrics.baselineY - this.metrics.ascender + yOffset ,
		width: this.metrics.width ,
		height: this.metrics.ascender ,
		//preserveAspectRatio: 'none' ,
		href: this.imageUrl
	} ) ;
	elementList.push( $image ) ;

	//console.log( "Returning:" , elementList ) ;
	return elementList ;
} ;



VGFlowingTextImagePart.prototype.renderHookForCanvas = async function( canvasCtx , options = {} , isRedraw = false , master = this ) {
	var yOffset = this.root.invertY ? canvasCtx.canvas.height - 1 - 2 * this.y - ( this.height - 1 ) : 0 ;

	//console.error( "???" , fontFamily , fontSize , textStyle ) ;

	canvasCtx.save() ;

	let image = new Image() ;
	image.src = this.imageUrl ;

	await new Promise( resolve => {
		image.onload = () => {
			canvasCtx.drawImage(
				image ,
				this.metrics.x ,
				this.metrics.baselineY - this.metrics.ascender + yOffset
			) ;
			resolve() ;
		} ;
	} ) ;

	canvasCtx.restore() ;
} ;

