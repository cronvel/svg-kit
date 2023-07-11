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
const getImageSize = require( './getImageSize.js' ) ;

const dom = require( 'dom-kit' ) ;



function VGImage( params ) {
	VGEntity.call( this , params ) ;

	// Basic image
	this.x = 0 ;
	this.y = 0 ;
	this.width = 0 ;
	this.height = 0 ;
	this.url = null ;

	// Clip
	this.sourceX = null ;
	this.sourceY = null ;
	this.sourceWidth = null ;
	this.sourceHeight = null ;
	this.clip = false ;

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

	let clipParams = false ;
	if ( params.sourceX !== undefined ) { this.sourceX = params.sourceX ; clipParams = true ; }
	if ( params.sourceY !== undefined ) { this.sourceY = params.sourceY ; clipParams = true ; }
	if ( params.sourceWidth !== undefined ) { this.sourceWidth = params.sourceWidth ; clipParams = true ; }
	if ( params.sourceHeight !== undefined ) { this.sourceHeight = params.sourceHeight ; clipParams = true ; }
	if ( clipParams ) {
		this.clip =
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
	svgTag: { get: function() { return this.clip || this.ninePatch ? 'g' : 'image' ; } } ,
	isRenderingContainer: { get: function() { return this.clip || this.ninePatch ; } }
} ) ;



VGImage.prototype.svgAttributes = function( root = this ) {
	if ( this.clip || this.ninePatch ) { return {} ; }

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



VGImage.prototype.renderingContainerHookForSvgText = async function( root = this ) {
	var imageSize = await getImageSize( this.url ) ;

	if ( this.ninePatch ) {
		// Also support clip
		return this.renderSvgTextNinePatchImage( imageSize , root ) ;
	}
	else if ( this.clip ) {
		return this.renderSvgTextClipImage( imageSize , {
				sx: this.sourceX ,
				sy: this.sourceY ,
				sw: this.sourceWidth ,
				sh: this.sourceHeight ,
				dx: this.x ,
				dy: this.y ,
				dw: this.width ,
				dh: this.height
			} ,
			root
		) ;
	}
	else {
		// Regular image (not clipped, not 9-patch) never reach this place right now
		let str = '' ;
		str += '<image' ;
		str += ' x="' + this.x + '"' ;
		str += ' y="' + ( root.invertY ? - this.y - this.height : this.y ) + '"' ;
		str += ' width="' + this.width + '"' ;
		str += ' height="' + this.height + '"' ;
		str += ' preserveAspectRatio="none"' ;
		str += ' href="' + this.url + '"' ;
		str += ' />' ;

		return str ;
	}

	return elementList ;
} ;



const CLIP_EXTRA_SIZE = 0.5 ;

VGImage.prototype.renderSvgTextClipImage = function( imageSize , coord , root , n = 0 ) {
	var str = '' ,
		yOffset = root.invertY ? - 2 * this.y - this.height : 0 ,
		scaleX = coord.dw / coord.sw ,
		scaleY = coord.dh / coord.sh ;

	// Nothing inside the <clipPath> is displayed
	var clipPathId = this._id + '_clipPath_' + n ;
	str += '<clipPath id="' + clipPathId + '">' ;

	str += '<rect' ;
	str += ' x="' + coord.dx + '"' ;
	str += ' y="' + ( coord.dy + yOffset ) + '"' ;
	// Clip have some issues when multiple clip are supposed to touch themselve,
	// so we add an extra width/height to avoid white lines in-between
	str += ' width="' + ( coord.dw + CLIP_EXTRA_SIZE ) + '"' ;
	str += ' height="' + ( coord.dh + CLIP_EXTRA_SIZE ) + '"' ;
	str += ' />' ;

	str += '</clipPath>' ;

	str += '<image' ;
	str += ' x="' + ( coord.dx - coord.sx * scaleX ) + '"' ;
	str += ' y="' + ( coord.dy - coord.sy * scaleY + yOffset ) + '"' ;
	str += ' width="' + ( imageSize.width * scaleX ) + '"' ;
	str += ' height="' + ( imageSize.height * scaleY ) + '"' ;
	str += ' preserveAspectRatio="none"' ;
	str += ' clip-path="url(#' + clipPathId + ')"' ;
	str += ' xlink:href="' + this.url + '"' ;
	str += ' />' ;

	return str ;
} ;



VGImage.prototype.renderSvgTextNinePatchImage = function( imageSize , root ) {
	var str = '' ,
		n = 0 ,
		coords = this.getNinePatchCoords( imageSize ) ;

	for ( let coord of coords ) {
		str += this.renderSvgTextClipImage( imageSize , coord , root , n ++ ) ;
	}

	return str ;
} ;



VGImage.prototype.renderingContainerHookForSvgDom = async function( root = this ) {
	var elementList = [] ;

	var imageSize = await getImageSize( this.url ) ;

	if ( this.ninePatch ) {
		// Also support clip
		this.renderSvgDomNinePatchImage( imageSize , elementList , root ) ;
	}
	else if ( this.clip ) {
		this.renderSvgDomClipImage( imageSize , {
				sx: this.sourceX ,
				sy: this.sourceY ,
				sw: this.sourceWidth ,
				sh: this.sourceHeight ,
				dx: this.x ,
				dy: this.y ,
				dw: this.width ,
				dh: this.height
			} ,
			elementList , root
		) ;
	}
	else {
		// Regular image (not clipped, not 9-patch) never reach this place right now
		let $image = document.createElementNS( 'http://www.w3.org/2000/svg' , 'image' ) ;
		dom.attr( $image , {
			x: this.x ,
			y: root.invertY ? - this.y - this.height : this.y ,
			width: this.width ,
			height: this.height ,
			preserveAspectRatio: 'none' ,
			href: this.url
		} ) ;
		elementList.push( $image ) ;
	}

	return elementList ;
} ;



VGImage.prototype.renderSvgDomClipImage = function( imageSize , coord , elementList , root , n = 0 ) {
	var yOffset = root.invertY ? - 2 * this.y - this.height : 0 ,
		scaleX = coord.dw / coord.sw ,
		scaleY = coord.dh / coord.sh ;

	// Nothing inside the <clipPath> is displayed
	var $clipPath = document.createElementNS( 'http://www.w3.org/2000/svg' , 'clipPath' ) ;
	var clipPathId = this._id + '_clipPath_' + n ;
	dom.attr( $clipPath , { id: clipPathId } ) ;
	elementList.push( $clipPath ) ;

	var $rect = document.createElementNS( 'http://www.w3.org/2000/svg' , 'rect' ) ;
	dom.attr( $rect , {
		x: coord.dx ,
		y: coord.dy + yOffset ,
		// Clip have some issues when multiple clip are supposed to touch themselves,
		// so we add an extra width/height to avoid white lines in-between
		width: coord.dw + CLIP_EXTRA_SIZE ,
		height: coord.dh + CLIP_EXTRA_SIZE
	} ) ;
	$clipPath.appendChild( $rect ) ;

	var $image = document.createElementNS( 'http://www.w3.org/2000/svg' , 'image' ) ;
	dom.attr( $image , {
		x: coord.dx - coord.sx * scaleX ,
		y: coord.dy - coord.sy * scaleY + yOffset ,
		width: imageSize.width * scaleX ,
		height: imageSize.height * scaleY ,
		preserveAspectRatio: 'none' ,
		'clip-path': 'url(#' + clipPathId + ')' ,
		href: this.url
	} ) ;
	elementList.push( $image ) ;
} ;



VGImage.prototype.renderSvgDomNinePatchImage = function( imageSize , elementList , root ) {
	var n = 0 ,
		coords = this.getNinePatchCoords( imageSize ) ;

	for ( let coord of coords ) {
		this.renderSvgDomClipImage( imageSize , coord , elementList , root , n ++ ) ;
	}
} ;



VGImage.prototype.renderHookForCanvas = async function( canvasCtx , options = {} , root = this ) {
	canvasCtx.save() ;

	var image = new Image() ;
	image.src = this.url ;

	await new Promise( resolve => {
		image.onload = () => {
			if ( this.ninePatch ) {
				// Also support clip
				this.renderCanvasNinePatchImage( canvasCtx , image , root ) ;
			}
			else if ( this.clip ) {
				this.renderCanvasClipImage( canvasCtx , image , root ) ;
			}
			else {
				let yOffset = root.invertY ? canvasCtx.canvas.height - 1 - 2 * this.y - ( this.height - 1 ) : 0 ;
				canvasCtx.drawImage( image , this.x , this.y + yOffset , this.width , this.height ) ;
			}

			resolve() ;
		} ;
	} ) ;

	canvasCtx.restore() ;
} ;



VGImage.prototype.renderCanvasClipImage = function( canvasCtx , image , root ) {
	var yOffset = root.invertY ? canvasCtx.canvas.height - 1 - 2 * this.y - ( this.height - 1 ) : 0 ;

	canvasCtx.drawImage(
		image ,
		this.sourceX , this.sourceY , this.sourceWidth , this.sourceHeight ,
		this.x , this.y + yOffset , this.width , this.height
	) ;
} ;



VGImage.prototype.renderCanvasNinePatchImage = function( canvasCtx , image , root ) {
	var yOffset = root.invertY ? canvasCtx.canvas.height - 1 - 2 * this.y - ( this.height - 1 ) : 0 ,
		coords = this.getNinePatchCoords( { width: image.naturalWidth , height: image.naturalHeight } ) ;

	for ( let coord of coords ) {
		canvasCtx.drawImage(
			image ,
			coord.sx , coord.sy , coord.sw , coord.sh ,
			coord.dx , coord.dy + yOffset , coord.dw , coord.dh
		) ;
	}
} ;



VGImage.prototype.getNinePatchCoords = function( imageSize ) {
	var sourceX , sourceY , sourceWidth , sourceHeight ,
		coords = [] ;

	if ( this.clip ) {
		sourceX = this.sourceX ;
		sourceY = this.sourceY ;
		sourceWidth = this.sourceWidth ;
		sourceHeight = this.sourceHeight ;
	}
	else {
		sourceX = 0 ;
		sourceY = 0 ;
		sourceWidth = imageSize.width ;
		sourceHeight = imageSize.height ;
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

