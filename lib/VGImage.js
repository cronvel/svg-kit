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

	// Only for non-clip/non-9-patch
	this.aspect = 'stretch' ;

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



const ASPECT = {
	stretch: 'stretch' ,
	preserve: 'contain' ,
	contain: 'contain' ,
	meet: 'contain' ,	// SVG uses "meet" while CSS uses "contain"
	cover: 'cover' ,
	slice: 'cover'		// SVG uses "slice" while CSS uses "cover"
} ;



VGImage.prototype.set = function( params ) {
	VGEntity.prototype.set.call( this , params ) ;

	if ( params.x !== undefined ) { this.x = params.x ; }
	if ( params.y !== undefined ) { this.y = params.y ; }
	if ( params.width !== undefined ) { this.width = params.width ; }
	if ( params.height !== undefined ) { this.height = params.height ; }
	if ( params.url && typeof params.url === 'string' ) { this.url = params.url ; }

	if ( params.aspect !== undefined ) { this.aspect = ASPECT[ params.aspect ] || 'stretch' ; }

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
	if ( this.aspect !== 'stretch' ) { data.aspect = this.aspect ; }

	return data ;
} ;



VGImage.prototype.svgTag = 'g' ;
VGImage.prototype.isRenderingContainer = true ;



VGImage.prototype.renderingContainerHookForSvgText = async function( root = this ) {
	var imageSize = await getImageSize( this.url ) ;

	if ( this.ninePatch ) {
		// Also support clip
		return this.renderSvgTextNinePatchImage( imageSize , root ) ;
	}

	if ( this.clip ) {
		return this.renderSvgTextClipImage(
			imageSize , {
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

	// Regular image (not clipped, not 9-patch) never reach this place right now
	let coords = this.getAspectCoords( imageSize ) ;
	return this.renderSvgTextClipImage( imageSize , coords , root ) ;
} ;



const CLIP_EXTRA_SIZE = 0.5 ;

VGImage.prototype.renderSvgTextClipImage = function( imageSize , coords , root , n = 0 ) {
	var str = '' ,
		yOffset = root.invertY ? - 2 * this.y - this.height : 0 ,
		scaleX = coords.dw / coords.sw ,
		scaleY = coords.dh / coords.sh ;

	if ( ! coords.noClip ) {
		// Nothing inside the <clipPath> is displayed
		var clipPathId = this._id + '_clipPath_' + n ;
		str += '<clipPath id="' + clipPathId + '">' ;

		str += '<rect' ;
		str += ' x="' + coords.dx + '"' ;
		str += ' y="' + ( coords.dy + yOffset ) + '"' ;
		// Clip have some issues when multiple clip are supposed to touch themselve,
		// so we add an extra width/height to avoid white lines in-between
		str += ' width="' + ( coords.dw + CLIP_EXTRA_SIZE ) + '"' ;
		str += ' height="' + ( coords.dh + CLIP_EXTRA_SIZE ) + '"' ;
		str += ' />' ;

		str += '</clipPath>' ;
	}

	str += '<image' ;
	str += ' x="' + ( coords.dx - coords.sx * scaleX ) + '"' ;
	str += ' y="' + ( coords.dy - coords.sy * scaleY + yOffset ) + '"' ;
	str += ' width="' + ( imageSize.width * scaleX ) + '"' ;
	str += ' height="' + ( imageSize.height * scaleY ) + '"' ;
	str += ' preserveAspectRatio="none"' ;
	if ( ! coords.noClip ) { str += ' clip-path="url(#' + clipPathId + ')"' ; }
	str += ' xlink:href="' + this.url + '"' ;
	str += ' />' ;

	return str ;
} ;



VGImage.prototype.renderSvgTextNinePatchImage = function( imageSize , root ) {
	var str = '' ,
		n = 0 ,
		coordsList = this.getNinePatchCoordsList( imageSize ) ;

	for ( let coords of coordsList ) {
		str += this.renderSvgTextClipImage( imageSize , coords , root , n ++ ) ;
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
		this.renderSvgDomClipImage(
			imageSize , {
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
		let coords = this.getAspectCoords( imageSize ) ;
		this.renderSvgDomClipImage( imageSize , coords , elementList , root ) ;
	}

	return elementList ;
} ;



VGImage.prototype.renderSvgDomClipImage = function( imageSize , coords , elementList , root , n = 0 ) {
	var yOffset = root.invertY ? - 2 * this.y - this.height : 0 ,
		scaleX = coords.dw / coords.sw ,
		scaleY = coords.dh / coords.sh ;

	if ( ! coords.noClip ) {
		// Nothing inside the <clipPath> is displayed
		var $clipPath = document.createElementNS( this.NS , 'clipPath' ) ;
		var clipPathId = this._id + '_clipPath_' + n ;
		dom.attr( $clipPath , { id: clipPathId } ) ;
		elementList.push( $clipPath ) ;

		var $rect = document.createElementNS( this.NS , 'rect' ) ;
		dom.attr( $rect , {
			x: coords.dx ,
			y: coords.dy + yOffset ,
			// Clip have some issues when multiple clip are supposed to touch themselves,
			// so we add an extra width/height to avoid white lines in-between
			width: coords.dw + CLIP_EXTRA_SIZE ,
			height: coords.dh + CLIP_EXTRA_SIZE
		} ) ;
		$clipPath.appendChild( $rect ) ;
	}

	var $image = document.createElementNS( this.NS , 'image' ) ;
	dom.attr( $image , {
		x: coords.dx - coords.sx * scaleX ,
		y: coords.dy - coords.sy * scaleY + yOffset ,
		width: imageSize.width * scaleX ,
		height: imageSize.height * scaleY ,
		preserveAspectRatio: 'none' ,
		//'clip-path': 'url(#' + clipPathId + ')' ,
		href: this.url
	} ) ;

	if ( ! coords.noClip ) {
		dom.attr( $image , { 'clip-path': 'url(#' + clipPathId + ')' } ) ;
	}

	elementList.push( $image ) ;
} ;



VGImage.prototype.renderSvgDomNinePatchImage = function( imageSize , elementList , root ) {
	var n = 0 ,
		coordsList = this.getNinePatchCoordsList( imageSize ) ;

	for ( let coords of coordsList ) {
		this.renderSvgDomClipImage( imageSize , coords , elementList , root , n ++ ) ;
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
				this.renderCanvasAspectImage( canvasCtx , image , root ) ;
			}

			resolve() ;
		} ;
	} ) ;

	canvasCtx.restore() ;
} ;



VGImage.prototype.renderCanvasAspectImage = function( canvasCtx , image , root ) {
	var yOffset = root.invertY ? canvasCtx.canvas.height - 1 - 2 * this.y - ( this.height - 1 ) : 0 ,
		coords = this.getAspectCoords( { width: image.naturalWidth , height: image.naturalHeight } ) ;

	canvasCtx.drawImage(
		image ,
		coords.sx , coords.sy , coords.sw , coords.sh ,
		coords.dx , coords.dy + yOffset , coords.dw , coords.dh
	) ;
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
		coordsList = this.getNinePatchCoordsList( { width: image.naturalWidth , height: image.naturalHeight } ) ;

	for ( let coords of coordsList ) {
		canvasCtx.drawImage(
			image ,
			coords.sx , coords.sy , coords.sw , coords.sh ,
			coords.dx , coords.dy + yOffset , coords.dw , coords.dh
		) ;
	}
} ;



VGImage.prototype.getAspectCoords = function( imageSize ) {
	var sx = 0 ,
		sy = 0 ,
		sw = imageSize.width ,
		sh = imageSize.height ,
		dx = this.x ,
		dy = this.y ,
		dw = this.width ,
		dh = this.height ,
		noClip = true ,
		ratio = this.width / this.height ,
		sourceRatio = sw / sh ;

	if ( ratio !== sourceRatio ) {
		if ( this.aspect === 'contain' ) {
			if ( ratio > sourceRatio ) {
				// The wanted viewport is wider than the source
				let newDw = dh * sourceRatio ;
				dx += Math.round( ( dw - newDw ) / 2 ) ;
				dw = newDw ;
			}
			else {
				// The wanted viewport is taller than the source
				let newDh = dw / sourceRatio ;
				dy += Math.round( ( dh - newDh ) / 2 ) ;
				dh = newDh ;
			}
		}
		else if ( this.aspect === 'cover' ) {
			noClip = false ;
			if ( ratio > sourceRatio ) {
				// The wanted viewport is wider than the source
				let newSh = sw / ratio ;
				sy += Math.round( ( sh - newSh ) / 2 ) ;
				sh = newSh ;
			}
			else {
				// The wanted viewport is taller than the source
				let newSw = sh * ratio ;
				sx += Math.round( ( sw - newSw ) / 2 ) ;
				sw = newSw ;
			}
		}
	}

	return { sx , sy , sw , sh , dx , dy , dw , dh , noClip } ;	// eslint-disable-line object-curly-newline
} ;



VGImage.prototype.getNinePatchCoordsList = function( imageSize ) {
	var sourceX , sourceY , sourceWidth , sourceHeight ,
		coordsList = [] ;

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

	coordsList.push( {
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

	coordsList.push( {
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

	coordsList.push( {
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

	coordsList.push( {
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

	coordsList.push( {
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

	coordsList.push( {
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

	coordsList.push( {
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

	coordsList.push( {
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

	coordsList.push( {
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

	//console.warn( "coordsList:" , coordsList ) ;
	return coordsList ;
} ;

