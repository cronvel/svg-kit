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



const VGEntity = require( './VGEntity.js' ) ;
const canvas = require( './canvas.js' ) ;



function VGImage( params ) {
	VGEntity.call( this , params ) ;

	// Basic image
	this.x = 0 ;
	this.y = 0 ;
	this.width = 0 ;
	this.height = 0 ;
	this.url = null ;

	// Crop
	this.sourceX = null ;
	this.sourceY = null ;
	this.sourceWidth = null ;
	this.sourceHeight = null ;
	this.crop = false ;

	// Nine-patch
	this.sourceLeftWidth = null ;
	this.sourceRightWidth = null ;
	this.sourceTopHeight = null ;
	this.sourceBottomHeight = null ;
	this.ninePatch = false ;

	if ( params ) { this.set( params ) ; }
}

module.exports = VGImage ;

VGImage.prototype = Object.create( VGEntity.prototype ) ;
VGImage.prototype.constructor = VGImage ;
VGImage.prototype.__prototypeUID__ = 'svg-kit/VGImage' ;
VGImage.prototype.__prototypeVersion__ = require( '../package.json' ).version ;



VGImage.prototype.set = function( params ) {
	VGEntity.prototype.set.call( this , params ) ;

	if ( params.x !== undefined ) { this.x = params.x ; }
	if ( params.y !== undefined ) { this.y = params.y ; }
	if ( params.width !== undefined ) { this.width = params.width ; }
	if ( params.height !== undefined ) { this.height = params.height ; }
	if ( params.url && typeof params.url === 'string' ) { this.url = params.url ; }

	let cropParams = false ;
	if ( params.sourceX !== undefined ) { this.sourceX = params.sourceX ; cropParams = true ; }
	if ( params.sourceY !== undefined ) { this.sourceY = params.sourceY ; cropParams = true ; }
	if ( params.sourceWidth !== undefined ) { this.sourceWidth = params.sourceWidth ; cropParams = true ; }
	if ( params.sourceHeight !== undefined ) { this.sourceHeight = params.sourceHeight ; cropParams = true ; }
	if ( cropParams ) {
		this.crop =
			this.sourceX !== null && this.sourceY !== null
			&& this.sourceWidth !== null && this.sourceHeight !== null ;
	}

	let ninePatchParams = false ;
	if ( params.sourceLeftWidth !== undefined ) { this.sourceLeftWidth = params.sourceLeftWidth ; ninePatchParams = true ; }
	if ( params.sourceRightWidth !== undefined ) { this.sourceRightWidth = params.sourceRightWidth ; ninePatchParams = true ; }
	if ( params.sourceTopHeight !== undefined ) { this.sourceTopHeight = params.sourceTopHeight ; ninePatchParams = true ; }
	if ( params.sourceBottomHeight !== undefined ) { this.sourceBottomHeight = params.sourceBottomHeight ; ninePatchParams = true ; }
	if ( ninePatchParams ) {
		this.ninePatch =
			this.sourceLeftWidth !== null && this.sourceRightWidth !== null
			&& this.sourceTopHeight !== null && this.sourceBottomHeight !== null ;
	}
} ;



VGImage.prototype.export = function( data = {} ) {
	VGEntity.prototype.export.call( this , data ) ;

	data.x = this.x ;
	data.y = this.y ;
	data.width = this.width ;
	data.height = this.height ;
	data.url = this.url ;

	return data ;
} ;



Object.defineProperties( VGImage.prototype , {
	svgTag: { get: function() { return this.crop || this.ninePatch ? 'g' : 'image' ; } } ,
	isRenderingContainer: { get: function() { return this.crop || this.ninePatch ; } }
} ) ;



VGImage.prototype.svgAttributes = function( root = this ) {
	if ( this.crop || this.ninePatch ) { return {} ; }

	var attr = {
		x: this.x ,
		y: root.invertY ? - this.y - this.height : this.y ,
		width: this.width ,
		height: this.height ,
		preserveAspectRatio: "none" ,
		href: this.url
	} ;

	return attr ;
} ;



VGImage.prototype.renderingContainerHookForSvgDom = async function( root = this ) {
	var elementList = [] ;

	var image = new Image() ;
	image.src = this.url ;

	await new Promise( resolve => {
		image.onload = () => {
			if ( this.ninePatch ) {
				// Also support crop
				this.renderSvgDomNinePatchImage( image , elementList , root ) ;
			}
			else if ( this.crop ) {
				this.renderSvgDomCropImage( image , elementList , root ) ;
			}
			else {
				let $image = document.createElementNS( 'http://www.w3.org/2000/svg' , 'image' ) ;
				$image.setAttribute( 'x' , this.x ) ;
				$image.setAttribute( 'y' , root.invertY ? - this.y - this.height : this.y ) ;
				$image.setAttribute( 'width' , this.width ) ;
				$image.setAttribute( 'height' , this.height ) ;
				$image.setAttribute( 'preserveAspectRatio' , 'none' ) ;
				$image.setAttribute( 'href' , this.url ) ;
				elementList.push( $image ) ;
			}

			resolve() ;
		} ;
	} ) ;

	return elementList ;
} ;



VGImage.prototype.renderSvgDomCropImage = function( image , elementList , root ) {
	var yOffset = root.invertY ? - 2 * this.y - this.height : 0 ,
		scaleX = this.width / this.sourceWidth ,
		scaleY = this.height / this.sourceHeight ;

	// Nothing inside the <clipPath> is displayed
	var $clipPath = document.createElementNS( 'http://www.w3.org/2000/svg' , 'clipPath' ) ;
	var clipPathId = this._id + '_clipPath' ;
	$clipPath.setAttribute( 'id' , clipPathId ) ;
	elementList.push( $clipPath ) ;

	var $rect = document.createElementNS( 'http://www.w3.org/2000/svg' , 'rect' ) ;
	$rect.setAttribute( 'x' , this.x ) ;
	$rect.setAttribute( 'y' , this.y + yOffset ) ;
	$rect.setAttribute( 'width' , this.width ) ;
	$rect.setAttribute( 'height' , this.height ) ;
	$clipPath.appendChild( $rect ) ;

	var $image = document.createElementNS( 'http://www.w3.org/2000/svg' , 'image' ) ;
	$image.setAttribute( 'x' , this.x - this.sourceX * scaleX ) ;
	$image.setAttribute( 'y' , this.y - this.sourceY * scaleY + yOffset ) ;
	$image.setAttribute( 'width' , image.naturalWidth * scaleX ) ;
	$image.setAttribute( 'height' , image.naturalHeight * scaleY ) ;
	$image.setAttribute( 'preserveAspectRatio' , 'none' ) ;
	$image.setAttribute( 'clip-path' , 'url(#' + clipPathId + ')' ) ;
	$image.setAttribute( 'href' , this.url ) ;
	elementList.push( $image ) ;
} ;



VGImage.prototype.renderSvgDomNinePatchImage = function( image , elementList , root ) {
} ;



VGImage.prototype.renderHookForCanvas = async function( canvasCtx , options = {} , root = this ) {
	canvasCtx.save() ;

	var image = new Image() ;
	image.src = this.url ;

	await new Promise( resolve => {
		image.onload = () => {
			if ( this.ninePatch ) {
				// Also support crop
				this.renderCanvasNinePatchImage( canvasCtx , image ) ;
			}
			else if ( this.crop ) {
				this.renderCanvasCropImage( canvasCtx , image ) ;
			}
			else {
				canvasCtx.drawImage( image , this.x , this.y , this.width , this.height ) ;
			}

			resolve() ;
		} ;
	} ) ;

	canvasCtx.restore() ;
} ;



VGImage.prototype.renderCanvasCropImage = function( canvasCtx , image ) {
	canvasCtx.drawImage(
		image ,
		this.sourceX , this.sourceY , this.sourceWidth , this.sourceHeight ,
		this.x , this.y , this.width , this.height
	) ;
} ;



VGImage.prototype.renderCanvasNinePatchImage = function( canvasCtx , image ) {
	var coords = this.getNinePatchCoords( image ) ;

	for ( let coord of coords ) {
		canvasCtx.drawImage(
			image ,
			coord.sx , coord.sy , coord.sw , coord.sh ,
			coord.dx , coord.dy , coord.dw , coord.dh
		) ;
	}
} ;



VGImage.prototype.getNinePatchCoords = function( image ) {
	var sourceX , sourceY , sourceWidth , sourceHeight ,
		coords = [] ;

	if ( this.crop ) {
		sourceX = this.sourceX ;
		sourceY = this.sourceY ;
		sourceWidth = this.sourceWidth ;
		sourceHeight = this.sourceHeight ;
	}
	else {
		sourceX = 0 ;
		sourceY = 0 ;
		sourceWidth = image.naturalWidth ;
		sourceHeight = image.naturalHeight ;
	}

	var leftWidth = this.sourceLeftWidth ,
		rightWidth = this.sourceRightWidth ,
		topHeight = this.sourceTopHeight ,
		bottomHeight = this.sourceBottomHeight ,
		centerWidth = sourceWidth - leftWidth - rightWidth ,
		centerHeight = sourceHeight - topHeight - bottomHeight ,
		destCenterWidth = this.width - leftWidth - rightWidth ,
		destCenterHeight = this.height - topHeight - bottomHeight ;


	// The 4 corners

	coords.push( {
		// top-left
		sx: sourceX ,
		sy: sourceY ,
		sw: leftWidth ,
		sh: topHeight ,
		dx: this.x ,
		dy: this.y ,
		dw: leftWidth ,
		dh: topHeight
	} ) ;

	coords.push( {
		// top-right
		sx: sourceX + leftWidth + centerWidth ,
		sy: sourceY ,
		sw: rightWidth ,
		sh: topHeight ,
		dx: this.x + leftWidth + destCenterWidth ,
		dy: this.y ,
		dw: rightWidth ,
		dh: topHeight
	} ) ;

	coords.push( {
		// bottom-left
		sx: sourceX ,
		sy: sourceY + topHeight + centerHeight ,
		sw: leftWidth ,
		sh: bottomHeight ,
		dx: this.x ,
		dy: this.y + topHeight + destCenterHeight ,
		dw: leftWidth ,
		dh: bottomHeight
	} ) ;

	coords.push( {
		// bottom-right
		sx: sourceX + leftWidth + centerWidth ,
		sy: sourceY + topHeight + centerHeight ,
		sw: rightWidth ,
		sh: bottomHeight ,
		dx: this.x + leftWidth + destCenterWidth ,
		dy: this.y + topHeight + destCenterHeight ,
		dw: rightWidth ,
		dh: bottomHeight
	} ) ;


	// The 4 sides

	coords.push( {
		// left
		sx: sourceX ,
		sy: sourceY + topHeight ,
		sw: leftWidth ,
		sh: centerHeight ,
		dx: this.x ,
		dy: this.y + topHeight ,
		dw: leftWidth ,
		dh: destCenterHeight
	} ) ;

	coords.push( {
		// right
		sx: sourceX + leftWidth + centerWidth ,
		sy: sourceY + topHeight ,
		sw: rightWidth ,
		sh: centerHeight ,
		dx: this.x + leftWidth + destCenterWidth ,
		dy: this.y + topHeight ,
		dw: rightWidth ,
		dh: destCenterHeight
	} ) ;

	coords.push( {
		// top
		sx: sourceX + leftWidth ,
		sy: sourceY ,
		sw: centerWidth ,
		sh: topHeight ,
		dx: this.x + leftWidth ,
		dy: this.y ,
		dw: destCenterWidth ,
		dh: topHeight
	} ) ;

	coords.push( {
		// bottom
		sx: sourceX + leftWidth ,
		sy: sourceY + topHeight + centerHeight ,
		sw: centerWidth ,
		sh: bottomHeight ,
		dx: this.x + leftWidth ,
		dy: this.y + topHeight + destCenterHeight ,
		dw: destCenterWidth ,
		dh: bottomHeight
	} ) ;

	coords.push( {
		// center
		sx: sourceX + leftWidth ,
		sy: sourceY + topHeight ,
		sw: centerWidth ,
		sh: centerHeight ,
		dx: this.x + leftWidth ,
		dy: this.y + topHeight ,
		dw: destCenterWidth ,
		dh: destCenterHeight
	} ) ;

	console.warn( "coords:" , coords ) ;
	return coords ;
} ;

