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



const DynamicArea = require( './DynamicArea.js' ) ;

const fontLib = require( './fontLib.js' ) ;
const misc = require( './misc.js' ) ;

const dom = require( 'dom-kit' ) ;
const camel = require( 'string-kit/lib/camel' ) ;
const escape = require( 'string-kit/lib/escape' ) ;



var autoId = 0 ;



function VGEntity( params ) {
	this._id = '_vgEntId_' + ( autoId ++ ) ;	// Used when a VG has to create unique ID automatically (e.g. creating a <clipPath>)
	this.id = null ;
	this.class = new Set() ;
	this.style = {} ;
	this.data = null ;		// User custom data, e.g. data-* attributes

	// Spellcast data
	this.button = null ;
	this.hint = null ;
	this.area = null ;

	this.morphLog = [] ;
	this.$element = null ;
	this.$style = null ;

	this.dynamicAreas = [] ;

	// Non-enumerable properties (better for displaying the data)
	Object.defineProperties( this , {
		parent: { value: null , writable: true } ,
		root: { value: null , writable: true }
	} ) ;
}

module.exports = VGEntity ;

VGEntity.prototype.__prototypeUID__ = 'svg-kit/VGEntity' ;
VGEntity.prototype.__prototypeVersion__ = require( '../package.json' ).version ;



VGEntity.prototype.NS = VGEntity.NS = 'http://www.w3.org/2000/svg' ;
VGEntity.prototype.isContainer = false ;
VGEntity.prototype.isRenderingContainer = false ;	// If set, it's not a high-level container but it's rendered as a container
VGEntity.prototype.svgTag = 'none' ;
VGEntity.prototype.svgAttributes = ( master = this ) => ( {} ) ;



VGEntity.prototype.set = function( params ) {
	if ( params.id !== undefined ) { this.id = params.id || null ; }

	if ( params.class ) {
		if ( typeof params.class === 'string' ) {
			this.class.clear() ;
			this.class.add( params.class ) ;
		}
		else if ( Array.isArray( params.class ) || ( params.class instanceof Set ) ) {
			this.class.clear() ;

			for ( let className of params.class ) {
				this.class.add( className ) ;
			}
		}
		else if ( typeof params.class === 'object' ) {
			for ( let className in params.class ) {
				if ( params.class[ className ] ) { this.class.add( className ) ; }
				else { this.class.delete( className ) ; }
			}
		}
	}

	if ( params.style ) {
		for ( let key in params.style ) {
			// Stored in the camelCase variant
			this.style[ this.toCamelCase( key ) ] = params.style[ key ] === null ? '' : params.style[ key ] ;
		}
	}

	if ( params.data !== undefined ) {
		// User custom data, e.g. data-* attributes
		if ( ! params.data ) {
			this.data = null ;
		}
		else {
			if ( ! this.data ) { this.data = {} ; }
			Object.assign( this.data , params.data ) ;
		}
	}

	if ( params.dynamic !== undefined ) {
		this.clearDynamicAreas() ;
		this.addDynamicArea( params.dynamic ) ;
	}

	// Useful for Spellcast SVG UI, but maybe somewhat deprecated...
	if ( params.button !== undefined ) { this.button = params.button || null ; }
	if ( params.hint !== undefined ) { this.hint = params.hint || null ; }
	if ( params.area !== undefined ) { this.area = params.area || null ; }
} ;



VGEntity.prototype.export = function( data = {} ) {
	data._type = this.__prototypeUID__ ;
	data._id = this._id ;
	if ( this.id ) { data.id = this.id ; }

	if ( this.class.size ) { data.class = [ ... this.class ] ; }
	if ( Object.keys( this.style ).length ) { data.style = this.style ; }

	if ( this.data ) { data.data = this.data ; }
	if ( this.button ) { data.button = this.button ; }
	if ( this.hint ) { data.hint = this.hint ; }
	if ( this.area ) { data.area = this.area ; }

	return data ;
} ;



VGEntity.prototype.toJSON = function() { return this.export() ; } ;



var morphVersion = 0 ;

VGEntity.prototype.morph = function( data ) {
	var log = Object.assign( {} , data ) ;
	log._v = morphVersion ++ ;
	this.morphLog.push( log ) ;
	this.set( data ) ;
} ;



VGEntity.prototype.exportMorphLog = function() {
	if ( ! this.morphLog.length ) { return null ; }
	var output = { l: [ ... this.morphLog ] } ;
	this.morphLog.length = 0 ;
	return output ;
} ;



VGEntity.prototype.importMorphLog = function( log ) {
	if ( ! log || ! log.l || ! log.l.length ) { this.morphLog.length = 0 ; }
	else { this.morphLog = log.l ; }
} ;



VGEntity.prototype.clearDynamicAreas = function() {
	this.dynamicAreas.length = 0 ;
} ;



VGEntity.prototype.addDynamicArea = function( params ) {
	var dynamic = new DynamicArea( this , params ) ;
	this.dynamicAreas.push( dynamic ) ;
} ;



VGEntity.prototype.setAllDynamicAreaStatus = function( status ) {
	for ( let dynamic of this.dynamicAreas ) {
		dynamic.setStatus( status ) ;
	}

	if ( this.isContainer ) {
		this.entities.forEach( entity => entity.setAllDynamicAreaStatus( status ) ) ;
	}
} ;



VGEntity.prototype.dynamicAreaIterator = function* () {
	for ( let dynamic of this.dynamicAreas ) {
		yield dynamic ;
	}

	if ( this.isContainer ) {
		for ( let entity of this.entities ) {
			yield * entity.dynamicAreaIterator() ;
		}
	}
} ;



// Use the preserveUpperCase option, cause the value can be in camelCased already
VGEntity.prototype.toCamelCase = value => camel.toCamelCase( value , true ) ;



VGEntity.prototype.escape = function( value ) {
	if ( typeof value === 'object' ) { return null ; }
	if ( typeof value !== 'string' ) { return value ; }
	return escape.htmlAttr( value ) ;
} ;



VGEntity.prototype.attrToString = function( attr , prefix = '' , addInitialSpace = false ) {
	var str = '' ;

	for ( let key in attr ) {
		if ( addInitialSpace || str ) { str += ' ' ; }
		str += prefix + this.escape( key ) + '="' + this.escape( attr[ key ] ) + '"' ;
	}

	return str ;
} ;



const STYLE_PROPERTY_UNIT = {
	fontSize: 'px'
} ;

const STYLE_PROPERTY_COLOR = {
	fill: true ,
	stroke: true
} ;

VGEntity.prototype.styleToString = function( style , palette , addInitialSpace = false ) {
	var str = '' ;

	for ( let key in style ) {
		// Key is in camelCase, but should use dash
		let v = style[ key ] === null ? '' : style[ key ] ;

		if ( typeof v === 'number' && STYLE_PROPERTY_UNIT[ key ] ) {
			v = '' + v + STYLE_PROPERTY_UNIT[ key ] ;
		}
		else if ( STYLE_PROPERTY_COLOR[ key ] ) {
			v = misc.colorToString( v , palette ) ;
		}

		str += this.escape( camel.camelCaseToDash( key ) ) + ':' + this.escape( v ) + ';' ;
	}

	if ( str ) {
		str = ( addInitialSpace ? ' ' : '' ) + 'style="' + str + '"' ;
	}

	return str ;
} ;



VGEntity.prototype.domStyle = function( $element , style , palette ) {
	for ( let key in this.style ) {
		// Key is already in camelCase
		let v = style[ key ] === null ? '' : style[ key ] ;

		if ( typeof v === 'number' && STYLE_PROPERTY_UNIT[ key ] ) {
			v = '' + v + STYLE_PROPERTY_UNIT[ key ] ;
		}
		else if ( STYLE_PROPERTY_COLOR[ key ] ) {
			v = misc.colorToString( v , palette ) ;
		}

		$element.style[ key ] = v ;
	}
} ;



// Render the Vector Graphic as a text SVG
VGEntity.prototype.renderSvgText = async function( options = {} , master = this ) {
	var str = '' ;

	if ( options.noGTag && this.isRenderingContainer && this.renderingContainerHookForSvgText ) {
		str += await this.renderingContainerHookForSvgText( master ) ;
		return str ;
	}

	var textNodeStr = '' ,
		attr = this.svgAttributes( master ) ;

	str += '<' + this.svgTag ;

	if ( this.id ) { str += ' id="' + this.escape( this.id ) + '"' ; }
	if ( this.button ) { str += ' button="' + this.escape( this.button ) + '"' ; }
	if ( this.hint ) { str += ' hint="' + this.escape( this.hint ) + '"' ; }
	if ( this.area ) { str += ' area="' + this.escape( this.area ) + '"' ; }

	if ( this.class.size ) {
		str += ' class="' ;
		let first = true ;
		for ( let className of this.class ) {
			if ( ! first ) { str += ' ' ; }
			str += this.escape( className ) ;
			first = false ;
		}
		str += '"' ;
	}

	str += this.attrToString( attr , undefined , true ) ;
	if ( this.data ) { str += this.attrToString( this.data , 'data-' , true ) ; }
	str += this.styleToString( this.style , master?.palette , true ) ;

	if ( this.svgTextNode ) { textNodeStr = this.svgTextNode() ; }

	if ( ! this.isContainer && ! this.isRenderingContainer ) {
		if ( textNodeStr ) { str += '>' + textNodeStr + '</' + this.svgTag + '>' ; }
		else { str += ' />' ; }

		return str ;
	}

	str += '>' ;

	// StyleSheet inside a <style> tag
	if ( this.css && this.css.length ) {
		str += '<style>\n' ;

		for ( let rule of this.css ) {
			str += rule.select + ' {\n' ;
			for ( let key in rule.style ) {
				let v = rule.style[ key ] === null ? '' : rule.style[ key ] ;
				if ( key === 'fontSize' && typeof v === 'number' ) { v = '' + v + 'px' ; }
				str += '    ' + this.escape( camel.camelCaseToDash( key ) ) + ': ' + this.escape( v ) + ';\n' ;
			}
			str += '}\n' ;
		}

		str += '</style>' ;
	}

	// Inner content

	if ( this.isRenderingContainer && this.renderingContainerHookForSvgText ) {
		str += await this.renderingContainerHookForSvgText( master ) ;
	}

	if ( this.supportClippingEntities ) {
		str += '<' + this.svgClippingGroupTag ;
		str += this.attrToString( this.svgClippingGroupAttributes() , undefined , true ) ;
		str += '>' ;

		if ( this.clippingEntities?.length ) {
			for ( let clippingEntity of this.clippingEntities ) {
				str += await clippingEntity.renderSvgText( { noGTag: true } , master ) ;
			}
		}

		str += '</' + this.svgClippingGroupTag + '>' ;

		str += '<' + this.svgContentGroupTag ;
		str += this.attrToString( this.svgContentGroupAttributes() , undefined , true ) ;
		str += '>' ;

		if ( this.isPseudoContainer ) {
			if ( ! this.arePseudoEntitiesReady ) { await this.computePseudoEntities() ; }

			if ( this.renderBeforeHookForSvgText ) {
				str += await this.renderBeforeHookForSvgText( master ) ;
			}

			for ( let pseudoEntity of this.pseudoEntities ) {
				str += await pseudoEntity.renderSvgText( options , master ) ;
			}

			if ( this.renderAfterHookForSvgText ) {
				str += await this.renderAfterHookForSvgText( master ) ;
			}
		}

		if ( this.isContainer && this.entities?.length ) {
			for ( let entity of this.entities ) {
				str += await entity.renderSvgText( options , master ) ;
			}
		}

		str += '</' + this.svgContentGroupTag + '>' ;
	}
	else {
		if ( this.isPseudoContainer ) {
			if ( ! this.arePseudoEntitiesReady ) { await this.computePseudoEntities() ; }

			if ( this.renderBeforeHookForSvgText ) {
				str += await this.renderBeforeHookForSvgText( master ) ;
			}

			for ( let pseudoEntity of this.pseudoEntities ) {
				str += await pseudoEntity.renderSvgText( options , master ) ;
			}

			if ( this.renderAfterHookForSvgText ) {
				str += await this.renderAfterHookForSvgText( master ) ;
			}
		}

		if ( this.isContainer && this.entities ) {
			for ( let entity of this.entities ) {
				str += await entity.renderSvgText( options , master ) ;
			}
		}
	}

	if ( textNodeStr ) { str += textNodeStr ; }

	str += '</' + this.svgTag + '>' ;
	return str ;
} ;



// Render the Vector Graphic inside a browser, as DOM SVG
VGEntity.prototype.renderSvgDom = async function( options = {} , master = this ) {
	let attr = this.svgAttributes( master ) ;

	this.$element = document.createElementNS( this.NS , options.overrideTag || this.svgTag ) ;

	if ( this.id ) { this.$element.setAttribute( 'id' , this.id ) ; }
	if ( this.button ) { this.$element.setAttribute( 'button' , this.button ) ; }
	if ( this.hint ) { this.$element.setAttribute( 'hint' , this.hint ) ; }
	if ( this.area ) { this.$element.setAttribute( 'area' , this.area ) ; }

	if ( this.class.size ) {
		this.class.forEach( className => this.$element.classList.add( className ) ) ;
	}

	dom.attr( this.$element , attr ) ;
	if ( this.data ) { dom.attr( this.$element , this.data , 'data-' ) ; }
	this.domStyle( this.$element , this.style , master?.palette ) ;

	if ( this.svgTextNode ) {
		this.$element.appendChild( document.createTextNode( this.svgTextNode() ) ) ;
	}

	if ( ! this.isContainer && ! this.isPseudoContainer && ! this.isRenderingContainer ) { return this.$element ; }

	// StyleSheet inside a <style> tag
	if ( this.css && this.css.length ) {
		this.$style = document.createElementNS( this.NS , 'style' ) ;
		//this.$style = document.createElement( 'style' ) ;

		let cssStr = '' ;

		for ( let rule of this.css ) {
			cssStr += rule.select + ' {\n' ;

			for ( let key in rule.style ) {
				// Key is in camelCase, but should use dash
				cssStr += this.escape( camel.camelCaseToDash( key ) ) + ': ' + this.escape( rule.style[ key ] ) + ';\n' ;
			}

			cssStr += '}\n' ;

			// WARNING: this.$style.sheet does not work at that moment, it seems to be added only after being inserted into the DOM,
			// so we construct a text-node instead of pure rule insertion
			//this.$style.sheet.insertRule( cssStr , this.$style.sheet.length ) ;
		}

		this.$style.appendChild( document.createTextNode( cssStr ) ) ;
		this.$element.appendChild( this.$style ) ;
	}

	// Inner content

	if ( this.isRenderingContainer && this.renderingContainerHookForSvgDom ) {
		let subElements = await this.renderingContainerHookForSvgDom( master ) ;
		subElements.forEach( $subElement => this.$element.appendChild( $subElement ) ) ;
	}

	if ( this.supportClippingEntities ) {
		let $clippingGroup = document.createElementNS( this.NS , this.svgClippingGroupTag ) ,
			clippingGroupAttr = this.svgClippingGroupAttributes() ;

		let $contentGroup = document.createElementNS( this.NS , this.svgContentGroupTag ) ,
			contentGroupAttr = this.svgContentGroupAttributes() ;

		dom.attr( $clippingGroup , clippingGroupAttr ) ;
		dom.attr( $contentGroup , contentGroupAttr ) ;

		if ( this.clippingEntities?.length ) {
			for ( let clippingEntity of this.clippingEntities ) {
				let $child = await clippingEntity.renderSvgDom( options , master ) ;
				// There is a bug in browser, they do not accept <g> inside <clipPath> (but Inkscape supports it),
				// so we will append children of that group directly
				VGEntity.appendToWithoutGTag( $clippingGroup , $child ) ;
			}
		}

		if ( this.isPseudoContainer ) {
			if ( ! this.arePseudoEntitiesReady ) { await this.computePseudoEntities() ; }

			if ( this.renderBeforeHookForSvgDom ) {
				let subElements = await this.renderBeforeHookForSvgDom( master ) ;
				if ( subElements ) {
					subElements.forEach( $subElement => $contentGroup.appendChild( $subElement ) ) ;
				}
			}

			for ( let pseudoEntity of this.pseudoEntities ) {
				$contentGroup.appendChild( await pseudoEntity.renderSvgDom( options , master ) ) ;
			}

			if ( this.renderAfterHookForSvgDom ) {
				let subElements = await this.renderAfterHookForSvgDom( master ) ;
				if ( subElements ) {
					subElements.forEach( $subElement => $contentGroup.appendChild( $subElement ) ) ;
				}
			}
		}

		if ( this.isContainer && this.entities?.length ) {
			for ( let entity of this.entities ) {
				$contentGroup.appendChild( await entity.renderSvgDom( options , master ) ) ;
			}
		}

		this.$element.appendChild( $clippingGroup ) ;
		this.$element.appendChild( $contentGroup ) ;
	}
	else {
		if ( this.isPseudoContainer ) {
			if ( ! this.arePseudoEntitiesReady ) { await this.computePseudoEntities() ; }

			if ( this.renderBeforeHookForSvgDom ) {
				let subElements = await this.renderBeforeHookForSvgDom( master ) ;
				if ( subElements ) {
					subElements.forEach( $subElement => this.$element.appendChild( $subElement ) ) ;
				}
			}

			for ( let pseudoEntity of this.pseudoEntities ) {
				this.$element.appendChild( await pseudoEntity.renderSvgDom( options , master ) ) ;
			}

			if ( this.renderAfterHookForSvgDom ) {
				let subElements = await this.renderAfterHookForSvgDom( master ) ;
				if ( subElements ) {
					subElements.forEach( $subElement => this.$element.appendChild( $subElement ) ) ;
				}
			}
		}

		if ( this.isContainer && this.entities?.length ) {
			for ( let entity of this.entities ) {
				this.$element.appendChild( await entity.renderSvgDom( options , master ) ) ;
			}
		}
	}

	return this.$element ;
} ;



// Render the Vector Graphic inside a browser's canvas
VGEntity.prototype.renderCanvas = async function( canvasCtx , options = {} , isRedraw = false , master = this ) {
	options.pixelsPerUnit = + options.pixelsPerUnit || 1 ;

	var shouldRender = true ;

	if ( isRedraw ) {
		shouldRender = false ;
		for ( let dynamic of this.dynamicAreas ) {
			if ( dynamic.outdated ) {
				//console.log( "restore 1 area for:" , this.__prototypeUID__ ) ;
				dynamic.restore( canvasCtx ) ;
				shouldRender = true ;
			}
		}
	}
	else {
		for ( let dynamic of this.dynamicAreas ) {
			if ( ! dynamic.noRedraw ) {
				dynamic.save( canvasCtx ) ;
			}
		}
	}


	if ( this.isPseudoContainer ) {
		if ( ! this.arePseudoEntitiesReady ) { await this.computePseudoEntities() ; }

		canvasCtx.save() ;

		if ( this.renderBeforeHookForCanvas ) {
			await this.renderBeforeHookForCanvas( canvasCtx , options , isRedraw , master ) ;
		}

		for ( let pseudoEntity of this.pseudoEntities ) {
			await pseudoEntity.renderCanvas( canvasCtx , options , isRedraw , master ) ;
		}

		if ( this.renderAfterHookForCanvas ) {
			await this.renderAfterHookForCanvas( canvasCtx , options , isRedraw , master ) ;
		}

		canvasCtx.restore() ;
	}
	else if ( this.renderHookForCanvas && shouldRender ) {
		//console.log( "render for:" , this.__prototypeUID__ ) ;
		await this.renderHookForCanvas( canvasCtx , options , isRedraw , master ) ;
		for ( let dynamic of this.dynamicAreas ) { dynamic.outdated = false ; }
	}

	if ( this.isContainer && this.entities?.length ) {
		if ( this.supportClippingEntities && this.clippingEntities?.length ) {
			// We have to save context because canvasCtx.clip() is not reversible
			canvasCtx.save() ;
			let clipPath2D = new Path2D() ;

			for ( let clippingEntity of this.clippingEntities ) {
				await clippingEntity.renderPath2D( clipPath2D , canvasCtx , options , master ) ;
			}

			canvasCtx.clip( clipPath2D ) ;

			for ( let entity of this.entities ) {
				await entity.renderCanvas( canvasCtx , options , isRedraw , master ) ;
			}

			canvasCtx.restore() ;
		}
		else {
			for ( let entity of this.entities ) {
				await entity.renderCanvas( canvasCtx , options , isRedraw , master ) ;
			}
		}
	}
} ;



VGEntity.prototype.redrawCanvas = function( canvasCtx , options = {} ) {
	return this.renderCanvas( canvasCtx , options , true ) ;
} ;



VGEntity.prototype.renderPath2D = async function( path2D , canvasCtx , options = {} , master = this ) {
	if ( this.isPseudoContainer ) {
		if ( ! this.arePseudoEntitiesReady ) { await this.computePseudoEntities() ; }

		if ( this.renderBeforeHookForPath2D ) {
			await this.renderBeforeHookForPath2D( path2D , canvasCtx , options , master ) ;
		}

		for ( let pseudoEntity of this.pseudoEntities ) {
			await pseudoEntity.renderPath2D( path2D , canvasCtx , options , master ) ;
		}

		if ( this.renderAfterHookForPath2D ) {
			await this.renderAfterHookForPath2D( path2D , canvasCtx , options , master ) ;
		}
	}
	else if ( this.renderHookForPath2D ) {
		await this.renderHookForPath2D( path2D , canvasCtx , options , master ) ;
	}

	if ( this.isContainer && this.entities?.length ) {
		for ( let entity of this.entities ) {
			await entity.renderPath2D( path2D , canvasCtx , options , master ) ;
		}
	}
} ;



// Append a child to a parent, but if the child is a <g> tag, append all children of <g> instead.
// Useful because of a browser bug, not supporting <g> inside <clipPath> (but Inkscape supports it).
VGEntity.appendToWithoutGTag = function( $parent , $child ) {
	if ( $child.tagName === 'g' ) {
		for ( let $child2 of $child.childNodes ) { 
			VGEntity.appendToWithoutGTag( $parent , $child2 ) ;
		}
	}
	else {
		$parent.appendChild( $child ) ;
	}
} ;



// Update the DOM, based upon the morphLog
VGEntity.prototype.morphSvgDom = function() {
	this.morphLog.forEach( entry => this.morphOneSvgDomEntry( entry ) ) ;
	this.morphLog.length = 0 ;
	return this.$element ;
} ;



VGEntity.prototype.morphOneSvgDomEntry = function( data ) {
	var key ;

	// Disallow id changes?
	//if ( data.id ) { this.$element.setAttribute( 'id' , data.id ) ; }

	if ( data.button ) { this.$element.setAttribute( 'button' , data.button ) ; }
	if ( data.hint ) { this.$element.setAttribute( 'hint' , data.hint ) ; }
	if ( data.area ) { this.$element.setAttribute( 'area' , data.area ) ; }

	if ( data.class ) {
		if ( Array.isArray( data.class ) ) {
			this.$element.setAttribute( 'class' , data.class.join( ' ' ) ) ;
		}
		else if ( data.class instanceof Set ) {
			this.$element.setAttribute( 'class' , [ ... data.class ].join( ' ' ) ) ;
		}
		else if ( typeof data.class === 'object' ) {
			for ( let className in data.class ) {
				if ( data.class[ className ] ) { this.$element.classList.add( className ) ; }
				else { this.$element.classList.remove( className ) ; }
			}
		}
	}

	if ( data.attr ) {
		for ( key in data.attr ) {
			this.$element.setAttribute( key , data.attr[ key ] ) ;
		}
	}

	if ( data.data ) {
		for ( key in data.data ) {
			this.$element.setAttribute( 'data-' + key , data.data[ key ] ) ;
		}
	}

	if ( data.style ) {
		for ( key in data.style ) {
			// Key is already in camelCase
			this.$element.style[ key ] = data.style[ key ] === null ? '' : data.style[ key ] ;
		}
	}
} ;



// Preload fonts, should be done before rendering anything needed OpenType.js on the browser-side, since .fetch() is asynchronous.
// Preload should handle all the async stuff.
VGEntity.prototype.preloadFonts = async function() {
	if ( ! process?.browser ) {
		console.error( 'VGEntity#preloadFonts() is a browser-only method' ) ;
		return ;
	}

	var fontNames = [] ,
		nodeFontNames = this.getUsedFontNames() ;

	if ( nodeFontNames ) { fontNames.push( ... nodeFontNames ) ; }

	if ( this.isContainer && this.entities?.length ) {
		for ( let entity of this.entities ) {
			let childFontNames = entity.getUsedFontNames() ;
			if ( childFontNames ) { fontNames.push( ... childFontNames ) ; }
		}
	}

	console.warn( "fontNames:" , fontNames ) ;

	await Promise.all( fontNames.map( fontName => fontLib.getFontAsync( fontName ) ) ) ;
} ;



// Should be derived
// Return null or an array of font names used by this entity
VGEntity.prototype.getUsedFontNames = function() { return null ; } ;
// Return null or a BoundingBox instance
VGEntity.prototype.getBoundingBox = function() { return null ; } ;

