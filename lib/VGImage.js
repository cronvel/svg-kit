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

	// Nine-Patch and Source Rect are mutually exclusive

	// Source Rect
	this.sourceX = null ;
	this.sourceY = null ;
	this.sourceWidth = null ;
	this.sourceHeight = null ;
	this.sourceRect = false ;

	// Nine-patch
	this.sliceLeft = null ;
	this.sliceRight = null ;
	this.sliceTop = null ;
	this.sliceBottom = null ;
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

	let sourceRectParams = false ;
	if ( params.sourceX !== undefined ) { this.sourceX = params.sourceX ; sourceRectParams = true ; }
	if ( params.sourceY !== undefined ) { this.sourceY = params.sourceY ; sourceRectParams = true ; }
	if ( params.sourceWidth !== undefined ) { this.sourceWidth = params.sourceWidth ; sourceRectParams = true ; }
	if ( params.sourceHeight !== undefined ) { this.sourceHeight = params.sourceHeight ; sourceRectParams = true ; }
	if ( sourceRectParams ) {
		this.sourceRect =
			this.sourceX !== null && this.sourceY !== null
			&& this.sourceWidth !== null && this.sourceHeight !== null ;
	}

	let ninePatchParams = false ;
	if ( params.sliceLeft !== undefined ) { this.sliceLeft = params.sliceLeft ; ninePatchParams = true ; }
	if ( params.sliceRight !== undefined ) { this.sliceRight = params.sliceRight ; ninePatchParams = true ; }
	if ( params.sliceTop !== undefined ) { this.sliceTop = params.sliceTop ; ninePatchParams = true ; }
	if ( params.sliceBottom !== undefined ) { this.sliceBottom = params.sliceBottom ; ninePatchParams = true ; }
	if ( ninePatchParams ) {
		this.ninePatch =
			this.sliceLeft !== null && this.sliceRight !== null
			&& this.sliceTop !== null && this.sliceBottom !== null ;
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



VGImage.prototype.svgTag = 'image' ;



VGImage.prototype.svgAttributes = function( root = this ) {
	var attr = {
		x: this.x ,
		y: root.invertY ? - this.y - this.height : this.y ,
		width: this.width ,
		height: this.height ,
		href: this.url
	} ;

	return attr ;
} ;



VGImage.prototype.renderHookForCanvas = async function( canvasCtx , options = {} , root = this ) {
	canvasCtx.save() ;

	var image = new Image() ;
	image.src = this.url ;

	await new Promise( resolve => {
		image.onload = () => {
			if ( this.sourceRect ) {
				this.renderCanvasSourceRectImage( canvasCtx , image ) ;
			}
			else if ( this.ninePatch ) {
				this.renderCanvasNinePatchImage( canvasCtx , image ) ;
			}
			else {
				canvasCtx.drawImage( image , this.x , this.y , this.width , this.height ) ;
			}

			resolve() ;
		} ;
	} ) ;

	canvasCtx.restore() ;
} ;



VGImage.prototype.renderCanvasSourceRectImage = function( canvasCtx , image ) {
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
	var coords = [] ,
		leftWidth = this.sliceLeft ,
		rightWidth = image.naturalWidth - this.sliceRight ,
		topHeight = this.sliceTop ,
		bottomHeight = image.naturalHeight - this.sliceBottom ,
		centerWidth = image.naturalWidth - leftWidth - rightWidth ,
		centerHeight = image.naturalHeight - topHeight - bottomHeight ,
		destCenterWidth = this.width - leftWidth - rightWidth ,
		destCenterHeight = this.height - topHeight - bottomHeight ;

	
	// The 4 corners
	
	coords.push( {
		// top-left
		sx: 0 ,
		sy: 0 ,
		sw: leftWidth ,
		sh: topHeight ,
		dx: this.x ,
		dy: this.y ,
		dw: leftWidth ,
		dh: topHeight
	} ) ;

	coords.push( {
		// top-right
		sx: leftWidth + centerWidth ,
		sy: 0 ,
		sw: rightWidth ,
		sh: topHeight ,
		dx: this.x + leftWidth + destCenterWidth ,
		dy: this.y ,
		dw: rightWidth ,
		dh: topHeight
	} ) ;

	coords.push( {
		// bottom-left
		sx: 0 ,
		sy: topHeight + centerHeight ,
		sw: leftWidth ,
		sh: bottomHeight ,
		dx: this.x ,
		dy: this.y + topHeight + destCenterHeight ,
		dw: leftWidth ,
		dh: bottomHeight
	} ) ;

	coords.push( {
		// bottom-right
		sx: leftWidth + centerWidth ,
		sy: topHeight + centerHeight ,
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
		sx: 0 ,
		sy: topHeight ,
		sw: leftWidth ,
		sh: centerHeight ,
		dx: this.x ,
		dy: this.y + topHeight ,
		dw: leftWidth ,
		dh: destCenterHeight
	} ) ;

	coords.push( {
		// right
		sx: leftWidth + centerWidth ,
		sy: topHeight ,
		sw: rightWidth ,
		sh: centerHeight ,
		dx: this.x + leftWidth + destCenterWidth ,
		dy: this.y + topHeight ,
		dw: rightWidth ,
		dh: destCenterHeight
	} ) ;

	coords.push( {
		// top
		sx: leftWidth ,
		sy: 0 ,
		sw: centerWidth ,
		sh: topHeight ,
		dx: this.x + leftWidth ,
		dy: this.y ,
		dw: destCenterWidth ,
		dh: topHeight
	} ) ;

	coords.push( {
		// bottom
		sx: leftWidth ,
		sy: topHeight + centerHeight ,
		sw: centerWidth ,
		sh: bottomHeight ,
		dx: this.x + leftWidth ,
		dy: this.y + topHeight + destCenterHeight ,
		dw: destCenterWidth ,
		dh: bottomHeight
	} ) ;

	coords.push( {
		// center
		sx: leftWidth ,
		sy: topHeight ,
		sw: centerWidth ,
		sh: centerHeight ,
		dx: this.x + leftWidth ,
		dy: this.y + topHeight ,
		dw: destCenterWidth ,
		dh: destCenterHeight
	} ) ;

	return coords ;
} ;

