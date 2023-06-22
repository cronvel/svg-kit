(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.svgKit = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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

/*
	A mesure value, either unit-less, or relative, eventually px.
*/

function Metric( value , unit ) {
	this.value = 0 ;
	this.unit = '' ;
	this.set( value , unit ) ;
}

module.exports = Metric ;



const INPUT_UNITS = {
	'': '' ,
	'px': '' ,
	'em': 'em' ,
	'rel': 'em' ,
	'%': {
		value: v => v * 0.01 ,
		unit: 'em'
	}
} ;

const UNITS_CALC = {
	'': v => v ,
	'em': ( v , relativeTo ) => v * relativeTo
} ;

const REGEXP = /^([0-9]+(?:\.[0-9]+)?) *([a-z%]+)?$/ ;

Metric.prototype.set = function( value , unit = '' ) {
	if ( typeof value === 'string' ) {
		let match = value .match( REGEXP ) ;
		if ( ! match ) { return false ; }
		value = parseFloat( match[ 1 ] ) ;
		unit = match[ 2 ] || '' ;
	}

	unit = INPUT_UNITS[ unit ] ;
	if ( unit === undefined ) { return false ; }
	if ( typeof unit === 'object' ) {
		value = unit.value( value ) ;
		unit = unit.unit ;
	}
	
	this.value = value ;
	this.unit = unit ;

	return true ;
} ;



Metric.prototype.get = function( relativeTo , relativeTo2 , ... relativeToN ) {
	if ( relativeTo instanceof Metric ) { relativeTo = relativeTo.get( relativeTo2 , ... relativeToN ) ; }
	return UNITS_CALC[ this.unit ]( this.value , relativeTo ) ;
} ;



Metric.chainedGet = function( ... metrics ) {
	metrics = metrics.filter( m => ( m instanceof Metric ) || typeof m === 'number' ) ;
	if ( ! metrics.length ) { return ; }
	if ( typeof metrics[ 0 ] === 'number' ) { return metrics[ 0 ] ; }
	var metric = metrics.shift() ;
	return metric.get( ... metrics ) ;
} ;


},{}],2:[function(require,module,exports){
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

/*
	VG: Vector Graphics.
	A portable structure describing some vector graphics.
*/

const svgKit = require( './svg-kit.js' ) ;
const VGContainer = require( './VGContainer.js' ) ;

var autoId = 0 ;



function VG( options ) {
	VGContainer.call( this , options ) ;

	this.id = ( options && options.id ) || 'vg_' + ( autoId ++ ) ;
	this.viewBox = {
		x: 0 , y: 0 , width: 100 , height: 100
	} ;

	this.css = [] ;
	this.invertY = false ;

	if ( options ) { this.set( options ) ; }
}

module.exports = VG ;



VG.prototype = Object.create( VGContainer.prototype ) ;
VG.prototype.constructor = VG ;
VG.prototype.__prototypeUID__ = 'svg-kit/VG' ;
VG.prototype.__prototypeVersion__ = require( '../package.json' ).version ;



VG.prototype.svgTag = 'svg' ;



VG.prototype.svgAttributes = function( root = this ) {
	var attr = {
		xmlns: "http://www.w3.org/2000/svg" ,
		viewBox: this.viewBox.x + ' ' + ( root.invertY ? -this.viewBox.y - this.viewBox.height : this.viewBox.y ) + ' ' + this.viewBox.width + ' ' + this.viewBox.height
	} ;

	return attr ;
} ;



VG.prototype.set = function( params ) {
	VGContainer.prototype.set.call( this , params ) ;

	if ( params.viewBox && typeof params.viewBox === 'object' ) {
		if ( params.viewBox.x !== undefined ) { this.viewBox.x = params.viewBox.x ; }
		if ( params.viewBox.y !== undefined ) { this.viewBox.y = params.viewBox.y ; }
		if ( params.viewBox.width !== undefined ) { this.viewBox.width = params.viewBox.width ; }
		if ( params.viewBox.height !== undefined ) { this.viewBox.height = params.viewBox.height ; }
	}

	if ( params.css && Array.isArray( params.css ) ) {
		this.css.length = 0 ;
		for ( let rule of params.css ) {
			this.addCssRule( rule ) ;
		}
	}

	if ( params.invertY !== undefined ) { this.invertY = !! params.invertY ; }
} ;



/*
    To update a style:
    $style = $element.querySelector( 'style' ) ;
    $style.sheet <-- this is a StyleSheet object
    $style.sheet.cssRules
    $style.sheet.cssRules[0].type                   type:1 for style rules, other can be important rules (3), media rule (4), keyframes rule (7)
    $style.sheet.cssRules[0].selectorText           the selector for this rule
    $style.sheet.cssRules[0].style.<cssProperty>    it works like any $element.style
    $style.sheet.insertRule( <cssText> , index )    insert a new CSS rule, passing a pure CSS string, the index is where it should be inserted (default to 0: at the begining)
    $style.sheet.deleteRule( index )                delete the rule at this index, see $style.sheet.length
    ...
*/

VG.prototype.addCssRule = function( rule ) {
	if ( ! rule || typeof rule !== 'object' || ! rule.select || ! rule.style || typeof rule.style !== 'object' ) { return ; }
	this.css.push( rule ) ;
} ;


},{"../package.json":43,"./VGContainer.js":3,"./svg-kit.js":18}],3:[function(require,module,exports){
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



const svgKit = require( './svg-kit.js' ) ;
const VGEntity = require( './VGEntity.js' ) ;



function VGContainer( options ) {
	VGEntity.call( this , options ) ;
	this.entities = [] ;
}

module.exports = VGContainer ;

VGContainer.prototype = Object.create( VGEntity.prototype ) ;
VGContainer.prototype.constructor = VGContainer ;
VGContainer.prototype.__prototypeUID__ = 'svg-kit/VGContainer' ;
VGContainer.prototype.__prototypeVersion__ = require( '../package.json' ).version ;



VGContainer.prototype.isContainer = true ;



VGContainer.prototype.set = function( params ) {
	VGEntity.prototype.set.call( this , params ) ;

	if ( params.entities && Array.isArray( params.entities ) ) {
		this.entities.length = 0 ;
		for ( let entity of params.entities ) {
			this.addEntity( entity ) ;
		}
	}
} ;



VGContainer.prototype.addEntity = function( entity , clone = false ) {
	entity = svgKit.objectToVG( entity , clone ) ;
	if ( entity ) { this.entities.push( entity ) ; }
} ;



VGContainer.prototype.exportMorphLog = function() {
	var hasInner = false , inner = {} ;

	this.entities.forEach( ( entity , index ) => {
		var log = entity.exportMorphLog() ;
		if ( log ) {
			inner[ index ] = log ;
			hasInner = true ;
		}
	} ) ;

	if ( ! hasInner && ! this.morphLog.length ) { return null ; }

	var output = {} ;
	if ( this.morphLog.length ) { output.l = [ ... this.morphLog ] ; }
	if ( hasInner ) { output.i = inner ; }

	this.morphLog.length = 0 ;
	return output ;
} ;



VGContainer.prototype.importMorphLog = function( log ) {
	var key , index ;

	if ( ! log ) {
		this.morphLog.length = 0 ;
		return ;
	}

	if ( ! log.l || ! log.l.length ) { this.morphLog.length = 0 ; }
	else { this.morphLog = log.l ; }

	if ( log.i ) {
		for ( key in log.i ) {
			index = + key ;
			if ( this.entities[ index ] ) {
				this.entities[ index ].importMorphLog( log.i[ key ] ) ;
			}
		}
	}
} ;



// Update the DOM, based upon the morphLog
VGContainer.prototype.morphSvgDom = function( root = this ) {
	this.entities.forEach( entity => entity.morphSvgDom( root ) ) ;
	this.morphLog.forEach( entry => this.morphOneSvgDomEntry( entry , root ) ) ;
	this.morphLog.length = 0 ;
	return this.$element ;
} ;


},{"../package.json":43,"./VGEntity.js":5,"./svg-kit.js":18}],4:[function(require,module,exports){
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



function VGEllipse( params ) {
	VGEntity.call( this , params ) ;

	this.x = 0 ;
	this.y = 0 ;
	this.rx = 0 ;
	this.ry = 0 ;

	if ( params ) { this.set( params ) ; }
}

module.exports = VGEllipse ;

VGEllipse.prototype = Object.create( VGEntity.prototype ) ;
VGEllipse.prototype.constructor = VGEllipse ;
VGEllipse.prototype.__prototypeUID__ = 'svg-kit/VGEllipse' ;
VGEllipse.prototype.__prototypeVersion__ = require( '../package.json' ).version ;



VGEllipse.prototype.svgTag = 'ellipse' ;



VGEllipse.prototype.set = function( params ) {
	VGEntity.prototype.set.call( this , params ) ;

	// Interop'
	if ( params.cx !== undefined ) { this.x = params.cx ; }
	if ( params.cy !== undefined ) { this.y = params.cy ; }

	if ( params.x !== undefined ) { this.x = params.x ; }
	if ( params.y !== undefined ) { this.y = params.y ; }
	if ( params.r !== undefined ) { this.rx = this.ry = params.r ; }
	if ( params.rx !== undefined ) { this.rx = params.rx ; }
	if ( params.ry !== undefined ) { this.ry = params.ry ; }
} ;



VGEllipse.prototype.svgAttributes = function( root = this ) {
	var attr = {
		cx: this.x ,
		cy: root.invertY ? -this.y : this.y ,
		rx: this.rx ,
		ry: this.ry
	} ;

	return attr ;
} ;



VGEllipse.prototype.renderHookForCanvas = function( canvasCtx , options = {} , root = this ) {
	canvasCtx.save() ;
	canvasCtx.beginPath() ;
	canvasCtx.ellipse( this.x , root.invertY ? -this.y : this.y , this.rx , this.ry ) ;
	canvas.fillAndStrokeUsingSvgStyle( canvasCtx , this.style ) ;
	canvasCtx.restore() ;
} ;


},{"../package.json":43,"./VGEntity.js":5}],5:[function(require,module,exports){
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



const camel = require( 'string-kit/lib/camel' ) ;
const escape = require( 'string-kit/lib/escape' ) ;



var autoId = 0 ;



function VGEntity( options ) {
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
}

module.exports = VGEntity ;

VGEntity.prototype.__prototypeUID__ = 'svg-kit/VGEntity' ;
VGEntity.prototype.__prototypeVersion__ = require( '../package.json' ).version ;



VGEntity.prototype.isContainer = false ;
VGEntity.prototype.isRenderingContainer = false ;	// If set, it's not a high-level container but it's rendered as a container
VGEntity.prototype.svgTag = 'none' ;
VGEntity.prototype.svgAttributes = () => ( {} ) ;



VGEntity.prototype.toJSON = function() {
	var object = Object.assign( {} , this ) ;

	object._type = this.__prototypeUID__ ;

	if ( this.class.size ) { object.class = [ ... this.class ] ; }
	else { delete object.class ; }

	if ( ! object.id ) { delete object.id ; }
	if ( ! object.data ) { delete object.data ; }
	if ( ! object.button ) { delete object.button ; }
	if ( ! object.hint ) { delete object.hint ; }
	if ( ! object.area ) { delete object.area ; }

	delete object.morphLog ;
	delete object.$element ;
	delete object.$style ;

	return object ;
} ;



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

	if ( params.button !== undefined ) { this.button = params.button || null ; }
	if ( params.hint !== undefined ) { this.hint = params.hint || null ; }
	if ( params.area !== undefined ) { this.area = params.area || null ; }
} ;



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



// Use the preserveUpperCase option, cause the value can be in camelCased already
VGEntity.prototype.toCamelCase = value => camel.toCamelCase( value , true ) ;

VGEntity.prototype.escape = function( value ) {
	if ( typeof value === 'object' ) { return null ; }
	if ( typeof value !== 'string' ) { return value ; }
	return escape.htmlAttr( value ) ;
} ;



// Render the Vector Graphic as a text SVG
VGEntity.prototype.renderSvgText = function( root = this ) {
	var key , rule , attr , str = '' , textNodeStr = '' , styleStr = '' ;

	attr = this.svgAttributes( root ) ;

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

	for ( key in attr ) {
		str += ' ' + key + '="' + this.escape( attr[ key ] ) + '"' ;
	}

	if ( this.data ) {
		for ( key in this.data ) {
			str += ' data-' + this.escape( key ) + '="' + this.escape( this.data[ key ] ) + '"' ;
		}
	}

	for ( key in this.style ) {
		// Key is in camelCase, but should use dash
		styleStr += this.escape( camel.camelCaseToDash( key ) ) + ':' + this.escape( this.style[ key ] ) + ';' ;
	}

	if ( styleStr ) { str += ' style="' + styleStr + '"' ; }

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

		for ( rule of this.css ) {
			str += rule.select + ' {\n' ;
			for ( key in rule.style ) {
				str += '    ' + this.escape( camel.camelCaseToDash( key ) ) + ': ' + this.escape( rule.style[ key ] ) + ';\n' ;
			}
			str += '}\n' ;
		}

		str += '</style>' ;
	}

	// Inner content

	if ( this.isRenderingContainer && this.renderingContainerHookForSvgText ) {
		str += this.renderingContainerHookForSvgText( root ) ;
	}

	if ( this.isContainer && this.entities ) {
		for ( let entity of this.entities ) {
			str += entity.renderSvgText( root ) ;
		}
	}

	if ( textNodeStr ) { str += textNodeStr ; }

	str += '</' + this.svgTag + '>' ;
	return str ;
} ;



// Render the Vector Graphic inside a browser, as DOM SVG
VGEntity.prototype.renderSvgDom = function( options = {} , root = this ) {
	var key , rule , cssStr ,
		attr = this.svgAttributes( root ) ;

	this.$element = document.createElementNS( 'http://www.w3.org/2000/svg' , options.overrideTag || this.svgTag ) ;

	if ( this.id ) { this.$element.setAttribute( 'id' , this.id ) ; }
	if ( this.button ) { this.$element.setAttribute( 'button' , this.button ) ; }
	if ( this.hint ) { this.$element.setAttribute( 'hint' , this.hint ) ; }
	if ( this.area ) { this.$element.setAttribute( 'area' , this.area ) ; }

	if ( this.class.size ) {
		this.class.forEach( className => this.$element.classList.add( className ) ) ;
	}

	for ( key in attr ) {
		this.$element.setAttribute( key , attr[ key ] ) ;
	}

	if ( this.data ) {
		for ( key in this.data ) {
			this.$element.setAttribute( 'data-' + key , this.data[ key ] ) ;
		}
	}

	for ( key in this.style ) {
		// Key is already in camelCase
		this.$element.style[ key ] = this.style[ key ] ;
	}

	if ( this.svgTextNode ) {
		this.$element.appendChild( document.createTextNode( this.svgTextNode() ) ) ;
	}

	if ( ! this.isContainer && ! this.isRenderingContainer ) { return this.$element ; }

	// StyleSheet inside a <style> tag
	if ( this.css && this.css.length ) {
		this.$style = document.createElementNS( 'http://www.w3.org/2000/svg' , 'style' ) ;
		//this.$style = document.createElement( 'style' ) ;

		cssStr = '' ;

		for ( rule of this.css ) {
			cssStr += rule.select + ' {\n' ;

			for ( key in rule.style ) {
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
		this.renderingContainerHookForSvgDom( root ).forEach( $subElement => this.$element.appendChild( $subElement ) ) ;
	}

	if ( this.isContainer && this.entities ) {
		for ( let entity of this.entities ) {
			this.$element.appendChild( entity.renderSvgDom( undefined , root ) ) ;
		}
	}

	return this.$element ;
} ;



// Render the Vector Graphic inside a browser's canvas
VGEntity.prototype.renderCanvas = function( canvasCtx , options = {} , root = this ) {
	options.pixelsPerUnit = + options.pixelsPerUnit || 1 ;

	if ( this.renderHookForCanvas ) {
		this.renderHookForCanvas( canvasCtx , options , root ) ;
	}

	if ( ! this.isContainer ) { return ; }

	if ( this.isContainer && this.entities ) {
		for ( let entity of this.entities ) {
			entity.renderCanvas( canvasCtx , options , root ) ;
		}
	}
} ;



// Update the DOM, based upon the morphLog
VGEntity.prototype.morphSvgDom = function( root = this ) {
	this.morphLog.forEach( entry => this.morphOneSvgDomEntry( entry , root ) ) ;
	this.morphLog.length = 0 ;
	return this.$element ;
} ;



VGEntity.prototype.morphOneSvgDomEntry = function( data , root = this ) {
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


},{"../package.json":43,"string-kit/lib/camel":28,"string-kit/lib/escape":29}],6:[function(require,module,exports){
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



const TextMetrics = require( './TextMetrics.js' ) ;



function StructuredTextLine( parts , metrics ) {
	this.parts = Array.isArray( parts ) ? parts : [] ;
	this.metrics = metrics instanceof TextMetrics ? metrics : null ;
}

module.exports = StructuredTextLine ;



// Join consecutive parts sharing the exact same attributes.
// It produces better results for underline and line-through, avoiding outline overlaps.
StructuredTextLine.prototype.fuseEqualAttr = function() {
	if ( this.parts.length <= 1 ) { return ; }

	let last = this.parts[ 0 ] ; // IStructuredTextPart
	let lastInserted = last ; // IStructuredTextPart
	const outputParts = [ last ] ; // StructuredText

	for ( let index = 1 ; index < this.parts.length ; index ++ ) {
		const part = this.parts[ index ] ;

		if ( last.attr.isEqual( part.attr ) ) {
			lastInserted.text += part.text ;

			// Note that it's always defined at that point
			if ( lastInserted.metrics && part.metrics ) {
				lastInserted.metrics.fuseWithRightPart( part.metrics ) ;
			}
		}
		else {
			outputParts.push( part ) ;
			lastInserted = part ;
		}

		last = part ;
	}

	this.parts = outputParts ;
} ;


},{"./TextMetrics.js":9}],7:[function(require,module,exports){
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



const TextAttribute = require( './TextAttribute.js' ) ;
const TextMetrics = require( './TextMetrics.js' ) ;



function StructuredTextPart( params = {} ) {
	this.text = params.text || '' ;

	this.attr = ! params.attr ? new TextAttribute( params ) :
		params.attr instanceof TextAttribute ? params.attr :
		new TextAttribute( params.attr ) ;

	// Computed metrics
	this.metrics = params.metrics instanceof TextMetrics ? params.metrics : null ;

	/*
	// From my abandoned StructuredText code for BabylonJS

	// When set, call observers for a click event
	href?: any;

	// Force splitting this part into one part per character.
	// This is useful for special effects.
	splitIntoCharacters?: boolean;


	// Userland data
	staticCustomData?: object;
	dynamicCustomData?: object;
	*/
}

module.exports = StructuredTextPart ;



StructuredTextPart.prototype.computeSizeMetrics = function( inheritedAttr ) {
	this.metrics = TextMetrics.measureStructuredTextPart( this , inheritedAttr ) ;
} ;


},{"./TextAttribute.js":8,"./TextMetrics.js":9}],8:[function(require,module,exports){
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



const Metric = require( '../Metric.js' ) ;



const DEFAULT_ATTR = {
	fontFamily: 'serif' ,
	fontSize: new Metric( 16 ) ,
	color: '#000' ,
	outline: false ,
	outlineWidth: new Metric( 0.025 , 'em' ) ,
	outlineColor: '#fff' ,
	underline: false ,
	lineThrough: false ,
	// line* define things for underline, lineThrough, and eventual future line-based text-decorations
	lineColor: null ,	// fallback to the text color
	lineOutline: null ,	// fallback to the text color
	lineThickness: new Metric( 0.075 , 'em' ) ,	// thickness for underline, lineThrough, etc...
	lineOutlineWidth: null ,	// fallback to text outlineWidth
	lineOutlineColor: null ,	// fallback to text outlineColor
	frame: false ,
	frameColor: '#808080' ,
	frameOutlineWidth: new Metric( 0 ) ,
	frameOutlineColor: '#808080' ,
	frameCornerRadius: new Metric( 0 )
} ;



function TextAttribute( params ) {
	// Font
	this.fontFamily = null ;
	this.fontSize = null ;
	//fontStyle?: string;
	//fontWeight?: string;

	// Styles
	this.color = null ;
	this.outline = null ;
	this.outlineWidth = null ;
	this.outlineColor = null ;

	// Decorations
	this.underline = null ;
	this.lineThrough = null ;
	this.lineColor = null ;
	this.lineThickness = null ;
	this.lineOutline = null ;
	this.lineOutlineWidth = null ;
	this.lineOutlineColor = null ;
	this.frame = null ;
	this.frameColor = null ;
	this.frameOutlineWidth = null ;
	this.frameOutlineColor = null ;
	this.frameCornerRadius = null ;

	if ( params ) { this.set( params ) ; }

	/*
	// Other attributes not ported yet, from my abandoned StructuredText code PR for BabylonJS

	shadowColor?: string;
	shadowBlur?: number;
	shadowOffsetX?: number;
	shadowOffsetY?: number;

	// When set, change appearance of that part when the mouse is hovering it.
	// Only property that does not change the metrics should ever be supported here.
	hover?: {
		color?: string | ICanvasGradient;
		underline?: boolean;
	};
	*/
}

module.exports = TextAttribute ;



// Getters/Setters

TextAttribute.prototype.set = function( params ) {
	if ( ! params || typeof params !== 'object' ) { return ; }

	if ( params.fontFamily ) { this.setFontFamily( params.fontFamily ) ; }
	if ( params.fontSize ) { this.setFontSize( params.fontSize ) ; }

	if ( params.color ) { this.setColor( params.color ) ; }
	if ( params.outline ) { this.setOutline( params.outline ) ; }
	if ( params.outlineWidth ) { this.setOutlineWidth( params.outlineWidth ) ; }
	if ( params.outlineColor ) { this.setOutlineColor( params.outlineColor ) ; }

	if ( params.underline ) { this.setUnderline( params.underline ) ; }
	if ( params.lineThrough ) { this.setLineThrough( params.lineThrough ) ; }
	if ( params.lineColor ) { this.setLineColor( params.lineColor ) ; }
	if ( params.lineThickness ) { this.setLineThickness( params.lineThickness ) ; }
	if ( params.lineOutline ) { this.setLineOutline( params.lineOutline ) ; }
	if ( params.lineOutlineWidth ) { this.setLineOutlineWidth( params.lineOutlineWidth ) ; }
	if ( params.lineOutlineColor ) { this.setLineOutlineColor( params.lineOutlineColor ) ; }
	if ( params.frame ) { this.setFrame( params.frame ) ; }
	if ( params.frameColor ) { this.setFrameColor( params.frameColor ) ; }
	if ( params.frameOutlineWidth ) { this.setFrameOutlineWidth( params.frameOutlineWidth ) ; }
	if ( params.frameOutlineColor ) { this.setFrameOutlineColor( params.frameOutlineColor ) ; }
	if ( params.frameCornerRadius ) { this.setFrameCornerRadius( params.frameCornerRadius ) ; }
} ;



TextAttribute.prototype.isEqual = function( to ) {
	return (
		this.fontFamily === to.fontFamily
		&& this.fontSize === to.fontSize
		//&& this.fontStyle === to.fontStyle
		//&& this.fontWeight === to.fontWeight

		&& this.color === to.color
		&& this.outline === to.outline
		&& ( ! this.outline || (
			this.outlineWidth === to.outlineWidth
			&& this.outlineColor === to.outlineColor
		) )

		&& this.underline === to.underline
		&& this.lineThrough === to.lineThrough
		&& ( ( ! this.underline && ! this.lineThrough ) || (
			this.lineColor === to.lineColor
			&& this.lineThickness === to.lineThickness
			&& this.lineOutline === to.lineOutline
			&& ( ! this.lineOutline || (
				this.lineOutlineWidth === to.lineOutlineWidth
				&& this.lineOutlineColor === to.lineOutlineColor
			) )
		) )

		&& this.frame === to.frame
		&& ( ! this.frame || (
			this.frameColor === to.frameColor
			&& this.frameOutlineWidth === to.frameOutlineWidth
			&& this.frameOutlineColor === to.frameOutlineColor
			&& this.frameCornerRadius === to.frameCornerRadius
		) )
	) ;
} ;



TextAttribute.prototype.setFontFamily = function( v ) {
	this.fontFamily = v && typeof v === 'string' ? v : null ;
} ;

TextAttribute.prototype.getFontFamily = function( inherit = null ) {
	return this.fontFamily ?? inherit?.fontFamily ?? DEFAULT_ATTR.fontFamily ;
} ;



TextAttribute.prototype.setFontSize = function( v ) {
	if ( v instanceof Metric ) { this.fontSize = v ; }
	if ( typeof v === 'number' || typeof v === 'string' ) { this.fontSize = new Metric( v ) ; }
	else { this.fontSize = null ; }
} ;

TextAttribute.prototype.getFontSize = function( inherit = null ) {
	return Metric.chainedGet( this.fontSize , inherit?.fontSize , DEFAULT_ATTR.fontSize ) ;
} ;



TextAttribute.prototype.setColor = function( v ) {
	this.color = v && typeof v === 'string' ? v : null ;
} ;

TextAttribute.prototype.getColor = function( inherit = null ) {
	return this.color ?? inherit?.color ?? DEFAULT_ATTR.color ;
} ;



TextAttribute.prototype.setOutline = function( v ) {
	this.outline = v && typeof v === 'boolean' ? v : null ;
} ;

TextAttribute.prototype.getOutline = function( inherit = null ) {
	return this.outline ?? inherit?.outline ?? DEFAULT_ATTR.outline ;
} ;



TextAttribute.prototype.setOutlineWidth = function( v ) {
	if ( v instanceof Metric ) { this.outlineWidth = v ; }
	if ( typeof v === 'number' || typeof v === 'string' ) { this.outlineWidth = new Metric( v ) ; }
	else { this.outlineWidth = null ; }
} ;

TextAttribute.prototype.getOutlineWidth = function( inherit = null , relTo = null ) {
	var outlineWidth = this.outlineWidth ?? inherit?.outlineWidth ?? DEFAULT_ATTR.outlineWidth ;
	if ( outlineWidth instanceof Metric ) { return outlineWidth.get( relTo ) ; }
	return outlineWidth ;
} ;



TextAttribute.prototype.setOutlineColor = function( v ) {
	this.outlineColor = v && typeof v === 'string' ? v : null ;
} ;

TextAttribute.prototype.getOutlineColor = function( inherit = null ) {
	return this.outlineColor ?? inherit?.outlineColor ?? DEFAULT_ATTR.outlineColor ;
} ;



TextAttribute.prototype.setUnderline = function( v ) {
	this.underline = v && typeof v === 'boolean' ? v : null ;
} ;

TextAttribute.prototype.getUnderline = function( inherit = null ) {
	return this.underline ?? inherit?.underline ?? DEFAULT_ATTR.underline ;
} ;



TextAttribute.prototype.setLineThrough = function( v ) {
	this.lineThrough = v && typeof v === 'boolean' ? v : null ;
} ;

TextAttribute.prototype.getLineThrough = function( inherit = null ) {
	return this.lineThrough ?? inherit?.lineThrough ?? DEFAULT_ATTR.lineThrough ;
} ;



TextAttribute.prototype.setLineColor = function( v ) {
	this.lineColor = v && typeof v === 'string' ? v : null ;
} ;

TextAttribute.prototype.getLineColor = function( inherit = null ) {
	var lineColor =
		this.lineColor ?? inherit?.lineColor ?? DEFAULT_ATTR.lineColor ??
		this.color ?? inherit?.color ?? DEFAULT_ATTR.color ;
	return lineColor ;
} ;



TextAttribute.prototype.setLineThickness = function( v ) {
	if ( v instanceof Metric ) { this.lineThickness = v ; }
	if ( typeof v === 'number' || typeof v === 'string' ) { this.lineThickness = new Metric( v ) ; }
	else { this.lineThickness = null ; }
} ;

TextAttribute.prototype.getLineThickness = function( inherit = null , relTo = null ) {
	var lineThickness = this.lineThickness ?? inherit?.lineThickness ?? DEFAULT_ATTR.lineThickness ;
	if ( lineThickness instanceof Metric ) { return lineThickness.get( relTo ) ; }
	return lineThickness ;
} ;



TextAttribute.prototype.setLineOutline = function( v ) {
	this.lineOutline = v && typeof v === 'boolean' ? v : null ;
} ;

TextAttribute.prototype.getLineOutline = function( inherit = null ) {
	var lineOutline =
		this.lineOutline ?? inherit?.lineOutline ?? DEFAULT_ATTR.lineOutline ??
		this.outline ?? inherit?.outline ?? DEFAULT_ATTR.outline ;
	return lineOutline ;
} ;



TextAttribute.prototype.setLineOutlineWidth = function( v ) {
	if ( v instanceof Metric ) { this.lineOutlineWidth = v ; }
	if ( typeof v === 'number' || typeof v === 'string' ) { this.lineOutlineWidth = new Metric( v ) ; }
	else { this.lineOutlineWidth = null ; }
} ;

TextAttribute.prototype.getLineOutlineWidth = function( inherit = null , relTo = null ) {
	var lineOutlineWidth =
		this.lineOutlineWidth ?? inherit?.lineOutlineWidth ?? DEFAULT_ATTR.lineOutlineWidth ??
		this.outlineWidth ?? inherit?.outlineWidth ?? DEFAULT_ATTR.outlineWidth ;
	if ( lineOutlineWidth instanceof Metric ) { return lineOutlineWidth.get( relTo ) ; }
	return lineOutlineWidth ;
} ;



TextAttribute.prototype.setLineOutlineColor = function( v ) {
	this.lineOutlineColor = v && typeof v === 'string' ? v : null ;
} ;

TextAttribute.prototype.getLineOutlineColor = function( inherit = null ) {
	var lineOutlineColor =
		this.lineOutlineColor ?? inherit?.lineOutlineColor ?? DEFAULT_ATTR.lineOutlineColor ??
		this.outlineColor ?? inherit?.outlineColor ?? DEFAULT_ATTR.outlineColor ;
	return lineOutlineColor ;
} ;



TextAttribute.prototype.setFrame = function( v ) {
	this.frame = v && typeof v === 'boolean' ? v : null ;
} ;

TextAttribute.prototype.getFrame = function( inherit = null ) {
	return this.frame ?? inherit?.frame ?? DEFAULT_ATTR.frame ;
} ;



TextAttribute.prototype.setFrameColor = function( v ) {
	this.frameColor = v && typeof v === 'string' ? v : null ;
} ;

TextAttribute.prototype.getFrameColor = function( inherit = null ) {
	return this.frameColor ?? inherit?.frameColor ?? DEFAULT_ATTR.frameColor ;
} ;



TextAttribute.prototype.setFrameOutlineWidth = function( v ) {
	if ( v instanceof Metric ) { this.frameOutlineWidth = v ; }
	if ( typeof v === 'number' || typeof v === 'string' ) { this.frameOutlineWidth = new Metric( v ) ; }
	else { this.frameOutlineWidth = null ; }
} ;

TextAttribute.prototype.getFrameOutlineWidth = function( inherit = null , relTo = null ) {
	var frameOutlineWidth = this.frameOutlineWidth ?? inherit?.frameOutlineWidth ?? DEFAULT_ATTR.frameOutlineWidth ;
	if ( frameOutlineWidth instanceof Metric ) { return frameOutlineWidth.get( relTo ) ; }
	return frameOutlineWidth ;
} ;



TextAttribute.prototype.setFrameOutlineColor = function( v ) {
	this.frameOutlineColor = v && typeof v === 'string' ? v : null ;
} ;

TextAttribute.prototype.getFrameOutlineColor = function( inherit = null ) {
	return this.frameOutlineColor ?? inherit?.frameOutlineColor ?? DEFAULT_ATTR.frameOutlineColor ;
} ;



TextAttribute.prototype.setFrameCornerRadius = function( v ) {
	if ( v instanceof Metric ) { this.frameCornerRadius = v ; }
	if ( typeof v === 'number' || typeof v === 'string' ) { this.frameCornerRadius = new Metric( v ) ; }
	else { this.frameCornerRadius = null ; }
} ;

TextAttribute.prototype.getFrameCornerRadius = function( inherit = null , relTo = null ) {
	var frameCornerRadius = this.frameCornerRadius ?? inherit?.frameCornerRadius ?? DEFAULT_ATTR.frameCornerRadius ;
	if ( frameCornerRadius instanceof Metric ) { return frameCornerRadius.get( relTo ) ; }
	return frameCornerRadius ;
} ;



// Utilities

TextAttribute.prototype.getTextSvgStyleString = function( inherit = null , relTo = null ) {
	relTo = relTo ?? this.getFontSize( inherit ) ;

	var str = '' ,
		color = this.getColor( inherit ) ,
		outline = this.getOutline( inherit ) ,
		outlineWidth ;

	str += 'fill:' + color + ';' ;

	if ( outline && ( outlineWidth = this.getOutlineWidth( inherit , relTo ) ) ) {
		let outlineColor = this.getOutlineColor( inherit ) ;
		if ( outlineColor ) { str += 'stroke:' + outlineColor + ';' ; }
		else { str += 'stroke:' + color + ';' ; }

		// It should force paint-order to stroke first, or some font will not be displayed as intended:
		// some strokes can happen in the middle of a letter.
		// As a result, outline width is multiplied by 2 because half of the stroke width is overwritten by the fill pass.
		str += 'stroke-width:' + ( outlineWidth * 2 ) + ';' ;
		str += 'paint-order:stroke;' ;
	}

	return str ;
} ;

TextAttribute.prototype.getTextSvgStyle = function( inherit = null , relTo = null ) {
	relTo = relTo ?? this.getFontSize( inherit ) ;

	var style = {} ,
		color = this.getColor( inherit ) ,
		outline = this.getOutline( inherit ) ,
		outlineWidth ;

	style.fill = color ;

	if ( outline && ( outlineWidth = this.getOutlineWidth( inherit , relTo ) ) ) {
		let outlineColor = this.getOutlineColor( inherit ) ;
		if ( outlineColor ) { style.stroke = outlineColor ; }
		else { style.stroke = color ; }

		style.strokeWidth = outlineWidth * 2 ;
		style.paintOrder = 'stroke' ;
	}

	return style ;
} ;



TextAttribute.prototype.getLineSvgStyleString = function( inherit = null , relTo = null ) {
	relTo = relTo ?? this.getFontSize( inherit ) ;

	var str = '' ,
		color = this.getLineColor( inherit ) ,
		outline = this.getLineOutline( inherit ) ,
		outlineWidth ;

	str += 'fill:' + color + ';' ;

	if ( outline && ( outlineWidth = this.getLineOutlineWidth( inherit , relTo ) ) ) {
		let outlineColor = this.getLineOutlineColor( inherit ) ;
		if ( outlineColor ) { str += 'stroke:' + outlineColor + ';' ; }
		else { str += 'stroke:' + color + ';' ; }

		// It should force paint-order to stroke first, so the outline is out of the content.
		// As a result, outline width is multiplied by 2 because half of the stroke width is overwritten by the fill pass.
		str += 'stroke-width:' + ( outlineWidth * 2 ) + ';' ;
		str += 'paint-order:stroke;' ;
	}

	return str ;
} ;

TextAttribute.prototype.getLineSvgStyle = function( inherit = null , relTo = null ) {
	relTo = relTo ?? this.getFontSize( inherit ) ;

	var style = {} ,
		color = this.getLineColor( inherit ) ,
		outline = this.getLineOutline( inherit ) ,
		outlineWidth ;

	style.fill = color ;

	if ( outline && ( outlineWidth = this.getLineOutlineWidth( inherit , relTo ) ) ) {
		let outlineColor = this.getLineOutlineColor( inherit ) ;
		if ( outlineColor ) { style.stroke = outlineColor ; }
		else { style.stroke = color ; }

		style.strokeWidth = outlineWidth * 2 ;
		style.paintOrder = 'stroke' ;
	}

	return style ;
} ;



TextAttribute.prototype.getFrameSvgStyleString = function( inherit = null , relTo = null ) {
	relTo = relTo ?? this.getFontSize( inherit ) ;

	var str = '' ,
		color = this.getFrameColor( inherit ) ,
		outlineWidth = this.getFrameOutlineWidth( inherit , relTo ) ;

	str += 'fill:' + color + ';' ;

	if ( outlineWidth ) {
		let outlineColor = this.getFrameOutlineColor( inherit ) ;
		if ( outlineColor ) { str += 'stroke:' + outlineColor + ';' ; }
		else { str += 'stroke:' + color + ';' ; }

		// It should force paint-order to stroke first, so the outline is out of the content.
		// As a result, outline width is multiplied by 2 because half of the stroke width is overwritten by the fill pass.
		str += 'stroke-width:' + ( outlineWidth * 2 ) + ';' ;
		str += 'paint-order:stroke;' ;
	}

	return str ;
} ;

TextAttribute.prototype.getFrameSvgStyle = function( inherit = null , relTo = null ) {
	relTo = relTo ?? this.getFontSize( inherit ) ;

	var style = {} ,
		color = this.getFrameColor( inherit ) ,
		outlineWidth = this.getFrameOutlineWidth( inherit , relTo ) ;

	style.fill = color ;

	if ( outlineWidth ) {
		let outlineColor = this.getFrameOutlineColor( inherit ) ;
		if ( outlineColor ) { style.stroke = outlineColor ; }
		else { style.stroke = color ; }

		style.strokeWidth = outlineWidth * 2 ;
		style.paintOrder = 'stroke' ;
	}

	return style ;
} ;


},{"../Metric.js":1}],9:[function(require,module,exports){
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



const fontLib = require( './fontLib.js' ) ;



function TextMetrics( ascender , descender , lineGap  , width , x = null , baselineY = null ) {
	this.ascender = + ascender || 0 ;
	this.descender = + descender || 0 ;
	this.lineGap = + lineGap || 0 ;
	this.width = + width || 0 ;

	// Computed properties
	//this.isPositionComputed = x !== null && baselineY !== null ;
	this.x = + x || 0 ;
	this.baselineY = + baselineY || 0 ;
}

module.exports = TextMetrics ;



Object.defineProperties( TextMetrics.prototype , {
	lineHeight: { get: function() { return this.ascender - this.descender + this.lineGap ; } }
	//height: { get: function() { return this.ascender - this.descender ; } }	// Ambiguous?
} ) ;



TextMetrics.prototype.clear = function() {
	this.ascender = this.descender = this.lineGap = this.width = this.x = this.baselineY = 0 ;
} ;



TextMetrics.prototype.fuseWithRightPart = function( metrics ) {
	// widths are summed
	this.width += metrics.width ;

	// .ascender, .descender and .lineGap are maximized
	if ( metrics.ascender > this.ascender ) { this.ascender = metrics.ascender ; }
	if ( metrics.descender < this.descender ) { this.descender = metrics.descender ; }
	if ( metrics.lineGap > this.lineGap ) { this.lineGap = metrics.lineGap ; }

	// .x and .baselineY does not change

	//this.isPositionComputed &&= metrics.isPositionComputed ;
} ;



TextMetrics.measureFontHeights = function( font , fontSize ) {
	//console.log( font.tables.head , font.tables.hhea ) ;
	var factor = fontSize / font.tables.head.unitsPerEm ,
		ascender = font.tables.hhea.ascender * factor ,
		descender = font.tables.hhea.descender * factor ,
		lineGap = font.tables.hhea.lineGap * factor ,
		lineHeight = ascender - descender + lineGap ;

	return new TextMetrics( ascender , descender , lineGap , lineHeight ) ;
} ;



TextMetrics.measureFontText = function( font , fontSize , text ) {
	var fontOptions = null ;
	var metrics = TextMetrics.measureFontHeights( font , fontSize ) ;
	metrics.width = font.getAdvanceWidth( text , fontSize , fontOptions ) ;
	return metrics ;
} ;



TextMetrics.measureStructuredTextPart = function( part , inheritedAttr ) {
	var fontOptions = null ,
		fontFamily = part.attr.getFontFamily( inheritedAttr ) ,
		fontSize = part.attr.getFontSize( inheritedAttr ) ;

	var font = fontLib.getFont( fontFamily ) ;

	var metrics = TextMetrics.measureFontText( font , fontSize , part.text ) ;

	return metrics ;
} ;


},{"./fontLib.js":11}],10:[function(require,module,exports){
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

const fontLib = require( './fontLib.js' ) ;
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
	} } ,
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
	let splitted = [] ;
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


},{"../../package.json":43,"../VGEntity.js":5,"../canvas.js":16,"./StructuredTextLine.js":6,"./StructuredTextPart.js":7,"./TextAttribute.js":8,"./TextMetrics.js":9,"./fontLib.js":11}],11:[function(require,module,exports){
(function (process,__dirname){(function (){
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

/*
	This is a cache for the loaded fonts.
*/

const path = require( 'path' ) ;
const opentype = require( 'opentype.js' ) ;



const fontLib = {} ;
module.exports = fontLib ;


const fontUrl = {} ;
const fontCache = {} ;

fontLib.setFontUrl = ( fontName , url ) => fontUrl[ fontName ] = url ;
fontLib.getFontUrl = fontName => fontUrl[ fontName ] ;


if ( process?.browser ) {
	fontLib.getFontAsync = async ( fontName ) => {
		if ( fontCache[ fontName ] ) { return fontCache[ fontName ] ; }

		var url = fontLib.getFontUrl( fontName ) ;
		if ( ! url ) { return null ; }

		var response = await fetch( url ) ;
		
		if ( ! response.ok ) {
			throw new Error( "HTTP error! Status: " + response.status ) ;
		}
		
		var blob = await response.blob() ;
		var arrayBuffer = await blob.arrayBuffer() ;
		var font = await opentype.parse( arrayBuffer ) ;
		fontCache[ fontName ] = font ;
		console.log( "Loaded font: " , fontName , font ) ;

		return font ;
	} ;

	fontLib.getFont = fontName => {
		var font = fontCache[ fontName ] ;
		if ( font ) { return font ; }
		throw new Error( "Can't load synchronously inside a web browser!" ) ;
	} ;
}
else {
	const builtinPath = path.join( __dirname , '..' , '..' , 'fonts' ) ;

	fontUrl['serif'] = builtinPath + '/serif.ttf' ;

	fontLib.getFont = fontName => {
		if ( fontCache[ fontName ] ) { return fontCache[ fontName ] ; }

		var url = fontLib.getFontUrl( fontName ) ;
		if ( ! url ) { return null ; }

		var font = opentype.loadSync( url ) ;
		fontCache[ fontName ] = font ;

		return font ;
	} ;
}

}).call(this)}).call(this,require('_process'),"/lib/VGFlowingText")
},{"_process":50,"opentype.js":25,"path":49}],12:[function(require,module,exports){
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



const svgKit = require( './svg-kit.js' ) ;
const VGContainer = require( './VGContainer.js' ) ;



function VGGroup( options ) {
	VGContainer.call( this , options ) ;
	if ( options ) { this.set( options ) ; }
}

module.exports = VGGroup ;

VGGroup.prototype = Object.create( VGContainer.prototype ) ;
VGGroup.prototype.constructor = VGGroup ;
VGGroup.prototype.__prototypeUID__ = 'svg-kit/VGGroup' ;
VGGroup.prototype.__prototypeVersion__ = require( '../package.json' ).version ;



VGGroup.prototype.svgTag = 'g' ;

VGGroup.prototype.set = function( params ) {
	VGContainer.prototype.set.call( this , params ) ;
} ;


},{"../package.json":43,"./VGContainer.js":3,"./svg-kit.js":18}],13:[function(require,module,exports){
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



function VGPath( options ) {
	VGEntity.call( this , options ) ;

	this.commands = [] ;

	if ( options ) { this.set( options ) ; }
}

module.exports = VGPath ;

VGPath.prototype = Object.create( VGEntity.prototype ) ;
VGPath.prototype.constructor = VGPath ;
VGPath.prototype.__prototypeUID__ = 'svg-kit/VGPath' ;
VGPath.prototype.__prototypeVersion__ = require( '../package.json' ).version ;



VGPath.prototype.svgTag = 'path' ;



VGPath.prototype.set = function( params ) {
	VGEntity.prototype.set.call( this , params ) ;
	if ( Array.isArray( params.commands ) ) { this.commands = params.commands ; }
} ;



VGPath.prototype.svgAttributes = function( root = this ) {
	var attr = {
		// That enigmatic SVG attribute 'd' probably means 'data' or 'draw'
		d: this.toD( root )
	} ;

	return attr ;
} ;



// Build the SVG 'd' attribute
VGPath.prototype.toD = function( root = this ) {
	var build = {
		root: root ,
		d: '' ,
		pu: false ,	// Pen Up, when true, turtle-like commands move without tracing anything
		cx: 0 ,		// cursor position x
		cy: 0 ,		// cursor position y
		ca: root.invertY ? -Math.PI / 2 : Math.PI / 2		// cursor angle, default to positive Y-axis
	} ;

	this.commands.forEach( ( command , index ) => {
		if ( index ) { build.d += ' ' ; }
		builders[ command.type ]( command , build ) ;
	} ) ;

	return build.d ;
} ;



VGPath.prototype.renderHookForCanvas = function( canvasCtx , options = {} , root = this ) {
	canvasCtx.save() ;
	canvasCtx.beginPath() ;
	canvas.fillAndStrokeUsingSvgStyle( canvasCtx , this.style , new Path2D( this.toD() ) ) ;
	canvasCtx.restore() ;
} ;



const degToRad = deg => deg * Math.PI / 180 ;
const radToDeg = rad => rad * 180 / Math.PI ;



const builders = {} ;

builders.close = ( command , build ) => {
	build.d += 'z' ;
} ;

builders.move = ( command , build ) => {
	var y = build.root.invertY ? -command.y : command.y ;

	if ( command.rel ) {
		build.d += 'm ' + command.x + ' ' + y ;
		build.cx += command.x ;
		build.cy += y ;
	}
	else {
		build.d += 'M ' + command.x + ' ' + y ;
		build.cx = command.x ;
		build.cy = y ;
	}
} ;

builders.line = ( command , build ) => {
	var y = build.root.invertY ? -command.y : command.y ;

	if ( command.rel ) {
		build.d += 'l ' + command.x + ' ' + y ;
		build.cx += command.x ;
		build.cy += y ;
	}
	else {
		build.d += 'L ' + command.x + ' ' + y ;
		build.cx = command.x ;
		build.cy = y ;
	}
} ;

builders.curve = ( command , build ) => {
	var cy1 = build.root.invertY ? -command.cy1 : command.cy1 ,
		cy2 = build.root.invertY ? -command.cy2 : command.cy2 ,
		y = build.root.invertY ? -command.y : command.y ;

	if ( command.rel ) {
		build.d += 'c ' + command.cx1 + ' ' + cy1 + ' ' + command.cx2 + ' ' + cy2 + ' '  + command.x + ' ' + y ;
		build.cx += command.x ;
		build.cy += y ;
	}
	else {
		build.d += 'C ' + command.cx1 + ' ' + cy1 + ' ' + command.cx2 + ' ' + cy2 + ' '  + command.x + ' ' + y ;
		build.cx = command.x ;
		build.cy = y ;
	}
} ;

builders.smoothCurve = ( command , build ) => {
	var cy = build.root.invertY ? -command.cy : command.cy ,
		y = build.root.invertY ? -command.y : command.y ;

	if ( command.rel ) {
		build.d += 's ' + command.cx + ' ' + cy + ' ' + command.x + ' ' + y ;
		build.cx += command.x ;
		build.cy += y ;
	}
	else {
		build.d += 'S ' + command.cx + ' ' + cy + ' ' + command.x + ' ' + y ;
		build.cx = command.x ;
		build.cy = y ;
	}
} ;

builders.qCurve = ( command , build ) => {
	var cy = build.root.invertY ? -command.cy : command.cy ,
		y = build.root.invertY ? -command.y : command.y ;

	if ( command.rel ) {
		build.d += 'q ' + command.cx + ' ' + cy + ' ' + command.x + ' ' + y ;
		build.cx += command.x ;
		build.cy += y ;
	}
	else {
		build.d += 'Q ' + command.cx + ' ' + cy + ' ' + command.x + ' ' + y ;
		build.cx = command.x ;
		build.cy = y ;
	}
} ;

builders.smoothQCurve = ( command , build ) => {
	var y = build.root.invertY ? -command.y : command.y ;

	if ( command.rel ) {
		build.d += 't ' + command.x + ' ' + y ;
		build.cx += command.x ;
		build.cy += y ;
	}
	else {
		build.d += 'T ' + command.x + ' ' + y ;
		build.cx = command.x ;
		build.cy = y ;
	}
} ;

builders.arc = ( command , build ) => {
	var ra = build.root.invertY ? -command.ra : command.ra ,
		pr = build.root.invertY ? ! command.pr : command.pr ,
		y = build.root.invertY ? -command.y : command.y ;

	if ( command.rel ) {
		build.d += 'a ' + command.rx + ' ' + command.ry + ' ' + ra + ' ' + ( + command.la ) + ' '  + ( + pr ) + ' ' + command.x + ' ' + y ;
		build.cx += command.x ;
		build.cy += y ;
	}
	else {
		build.d += 'A ' + command.rx + ' ' + command.ry + ' ' + ra + ' ' + ( + command.la ) + ' '  + ( + pr ) + ' ' + command.x + ' ' + y ;
		build.cx = command.x ;
		build.cy = y ;
	}
} ;

// VG-specific

/*
	Approximation of circles using cubic bezier curves.

	Controle point distance/radius ratio for quarter of circle: 0.55228475 or 4/3 (sqrt(2)-1)
	For half of a circle: 4/3

	From: https://www.tinaja.com/glib/bezcirc2.pdf
	The arc is bissected by the X-axis.
	x0 = cos( / 2)			y0 = sin( / 2)
	x3 = x1					y3 = - y0
	x1 = (4 - x0) / 3		y1 = (1 - x0)(3 - x0) / 3 y0
	x2 = x1					y2 = -y1

	This distance ensure that the mid-time point is exactly on the arc.
	It works very well for angle ranging from 0-90°, can be good enough for 90-180°,
	but it's bad for greater than 180°.
	In fact it's not possible to approximate a 270° arc with a single cubic bezier curve.
*/
function controleDistance( angle ) {
	if ( ! angle ) { return 0 ; }
	var angleRad = degToRad( angle ) ;
	var x0 = Math.cos( angleRad / 2 ) ,
		y0 = Math.sin( angleRad / 2 ) ,
		x1 = ( 4 - x0 ) / 3 ,
		y1 = ( 1 - x0 ) * ( 3 - x0 ) / ( 3 * y0 ) ;
	return Math.sqrt( ( x0 - x1 ) ** 2 + ( y0 - y1 ) ** 2 ) ;
}

builders.centerArc = ( command , build ) => {

	// ---------------------------------------------------------------------------------- NOT CODED ----------------------------------------------------------------

	// It's supposed to ease circle creation inside path, converting them to SVG curves...

	var { x , y , cx , cy } = command ;

	if ( command.rel ) {
		x += build.cx ;
		y += build.cy ;
		cx += build.cx ;
		cy += build.cy ;
	}

	var startAngle = Math.atan2( build.cy - cy , build.cx - cx ) ,
		endAngle = Math.atan2( y - cy , x - cx ) ;

	build.cx = x ;
	build.cy = y ;
} ;

// Turtle-like

builders.pen = ( command , build ) => {
	build.pu = command.u ;
} ;

builders.forward = ( command , build ) => {
	var dx = command.l * Math.cos( build.ca ) ,
		dy = command.l * Math.sin( build.ca ) ;

	if ( build.pu ) { build.d += 'm ' + dx + ' ' + dy ; }
	else { build.d += 'l ' + dx + ' ' + dy ; }

	build.cx += dx ;
	build.cy += dy ;
} ;

builders.turn = ( command , build ) => {
	var a = build.root.invertY ? -command.a : command.a ;

	if ( command.rel ) {
		build.ca += degToRad( a ) ;
	}
	else {
		build.ca = degToRad( a ) ;
	}
} ;

builders.forwardTurn = ( command , build ) => {
	var a = build.root.invertY ? -command.a : command.a ;

	/*
		We will first transpose to a circle of center 0,0 and we are starting at x=radius,y=0 and moving positively
	*/
	var angleRad = degToRad( a ) ,
		angleSign = angleRad >= 0 ? 1 : -1 ,
		alpha = Math.abs( angleRad ) ,
		radius = command.l / alpha ,
		trX = radius * Math.cos( alpha ) ,
		trY = radius * Math.sin( alpha ) ,
		dist = Math.sqrt( ( radius - trX ) ** 2 + trY ** 2 ) ,
		beta = Math.atan2( radius - trX , trY ) ;	// beta is the deviation

	var dx = dist * Math.cos( build.ca + angleSign * beta ) ,
		dy = dist * Math.sin( build.ca + angleSign * beta ) ;

	if ( build.pu ) {
		build.d += 'm ' + dx + ' ' + dy ;
	}
	else {
		build.d += 'a ' + radius + ' ' + radius + ' 0 ' + ( alpha > Math.PI ? 1 : 0 ) + ' '  + ( angleRad >= 0 ? 1 : 0 ) + ' ' + dx + ' ' + dy ;
	}

	build.cx += dx ;
	build.cy += dy ;
	build.ca += angleRad ;
} ;



/*
	First, true SVG path commands
*/

VGPath.prototype.close = function() {
	this.commands.push( { type: 'close' } ) ;
} ;

VGPath.prototype.move = function( data ) {
	this.commands.push( {
		type: 'move' ,
		rel: true ,
		x: data.x || 0 ,
		y: data.y || 0
	} ) ;
} ;

VGPath.prototype.moveTo = function( data ) {
	this.commands.push( {
		type: 'move' ,
		x: data.x || 0 ,
		y: data.y || 0
	} ) ;
} ;

VGPath.prototype.line = function( data ) {
	this.commands.push( {
		type: 'line' ,
		rel: true ,
		x: data.x || 0 ,
		y: data.y || 0
	} ) ;
} ;

VGPath.prototype.lineTo = function( data ) {
	this.commands.push( {
		type: 'line' ,
		x: data.x || 0 ,
		y: data.y || 0
	} ) ;
} ;

VGPath.prototype.curve = function( data ) {
	this.commands.push( {
		type: 'curve' ,
		rel: true ,
		cx1: data.cx1 || 0 ,
		cy1: data.cy1 || 0 ,
		cx2: data.cx2 || 0 ,
		cy2: data.cy2 || 0 ,
		x: data.x || 0 ,
		y: data.y || 0
	} ) ;
} ;

VGPath.prototype.curveTo = function( data ) {
	this.commands.push( {
		type: 'curve' ,
		cx1: data.cx1 || 0 ,
		cy1: data.cy1 || 0 ,
		cx2: data.cx2 || 0 ,
		cy2: data.cy2 || 0 ,
		x: data.x || 0 ,
		y: data.y || 0
	} ) ;
} ;

VGPath.prototype.smoothCurve = function( data ) {
	this.commands.push( {
		type: 'smoothCurve' ,
		rel: true ,
		cx: data.cx || data.cx2 || 0 ,
		cy: data.cy || data.cy2 || 0 ,
		x: data.x || 0 ,
		y: data.y || 0
	} ) ;
} ;

VGPath.prototype.smoothCurveTo = function( data ) {
	this.commands.push( {
		type: 'smoothCurve' ,
		cx: data.cx || data.cx2 || 0 ,
		cy: data.cy || data.cy2 || 0 ,
		x: data.x || 0 ,
		y: data.y || 0
	} ) ;
} ;

// q-curve = Quadratic curve, it uses just one controle point instead of two
VGPath.prototype.qCurve = function( data ) {
	this.commands.push( {
		type: 'qCurve' ,
		rel: true ,
		cx: data.cx || data.cx1 || 0 ,
		cy: data.cy || data.cy1 || 0 ,
		x: data.x || 0 ,
		y: data.y || 0
	} ) ;
} ;

VGPath.prototype.qCurveTo = function( data ) {
	this.commands.push( {
		type: 'qCurve' ,
		cx: data.cx || data.cx1 || 0 ,
		cy: data.cy || data.cy1 || 0 ,
		x: data.x || 0 ,
		y: data.y || 0
	} ) ;
} ;

VGPath.prototype.smoothQCurve = function( data ) {
	this.commands.push( {
		type: 'smoothQCurve' ,
		rel: true ,
		x: data.x || 0 ,
		y: data.y || 0
	} ) ;
} ;

VGPath.prototype.smoothQCurveTo = function( data ) {
	this.commands.push( {
		type: 'smoothQCurve' ,
		x: data.x || 0 ,
		y: data.y || 0
	} ) ;
} ;

VGPath.prototype.arc = function( data ) {
	this.commands.push( {
		type: 'arc' ,
		rel: true ,
		rx: data.rx || 0 ,
		ry: data.ry || 0 ,
		ra: data.ra || data.a || 0 ,	// x-axis rotation
		la:
			data.largeArc !== undefined ? !! data.largeArc :
			data.longArc !== undefined ? !! data.longArc :
			data.la !== undefined ? !! data.la :
			false ,
		pr:
			data.positiveRotation !== undefined ? !! data.positiveRotation :
			data.sweep !== undefined ? !! data.sweep :		// <- this is the SVG term
			data.pr !== undefined ? !! data.pr :
			true ,
		x: data.x || 0 ,
		y: data.y || 0
	} ) ;
} ;

VGPath.prototype.arcTo = function( data ) {
	this.commands.push( {
		type: 'arc' ,
		rx: data.rx || 0 ,
		ry: data.ry || 0 ,
		ra: data.ra || data.a || 0 ,	// x-axis rotation
		la:
			data.largeArc !== undefined ? !! data.largeArc :
			data.longArc !== undefined ? !! data.longArc :
			data.la !== undefined ? !! data.la :
			false ,
		pr:
			data.positiveRotation !== undefined ? !! data.positiveRotation :
			data.sweep !== undefined ? !! data.sweep :		// <- this is the SVG term
			data.pr !== undefined ? !! data.pr :
			true ,
		x: data.x || 0 ,
		y: data.y || 0
	} ) ;
} ;

// All angles use positive as Y-axis to X-axis (Spellcast usage)
VGPath.prototype.negativeArc = function( data ) {
	this.commands.push( {
		type: 'arc' ,
		rel: true ,
		rx: data.rx || 0 ,
		ry: data.ry || 0 ,
		ra: -( data.ra || data.a || 0 ) ,	// x-axis rotation
		la:
			data.largeArc !== undefined ? !! data.largeArc :
			data.longArc !== undefined ? !! data.longArc :
			data.la !== undefined ? !! data.la :
			false ,
		pr: ! (
			data.positiveRotation !== undefined ? !! data.positiveRotation :
			data.sweep !== undefined ? !! data.sweep :		// <- this is the SVG term
			data.pr !== undefined ? !! data.pr :
			true
		) ,
		x: data.x || 0 ,
		y: data.y || 0
	} ) ;
} ;

// All angles use positive as Y-axis to X-axis (Spellcast usage)
VGPath.prototype.negativeArcTo = function( data ) {
	this.commands.push( {
		type: 'arc' ,
		rx: data.rx || 0 ,
		ry: data.ry || 0 ,
		ra: -( data.ra || data.a || 0 ) ,	// x-axis rotation
		la:
			data.largeArc !== undefined ? !! data.largeArc :
			data.longArc !== undefined ? !! data.longArc :
			data.la !== undefined ? !! data.la :
			false ,
		pr: ! (
			data.positiveRotation !== undefined ? !! data.positiveRotation :
			data.sweep !== undefined ? !! data.sweep :		// <- this is the SVG term
			data.pr !== undefined ? !! data.pr :
			true
		) ,
		x: data.x || 0 ,
		y: data.y || 0
	} ) ;
} ;



/*
	VG-specific commands
*/

// Better arc-like command, but use curve behind the scene
VGPath.prototype.centerArc = function( data ) {
	this.commands.push( {
		type: 'centerArc' ,
		rel: true ,
		cx: data.cx || 0 ,
		cy: data.cy || 0 ,
		la: data.largeArc !== undefined ? !! data.largeArc :
		data.longArc !== undefined ? !! data.longArc :
		data.la !== undefined ? !! data.la :
		false ,
		x: data.x || 0 ,
		y: data.y || 0
	} ) ;
} ;

VGPath.prototype.centerArcTo = function( data ) {
	this.commands.push( {
		type: 'centerArc' ,
		cx: data.cx || 0 ,
		cy: data.cy || 0 ,
		la: data.largeArc !== undefined ? !! data.largeArc :
		data.longArc !== undefined ? !! data.longArc :
		data.la !== undefined ? !! data.la :
		false ,
		x: data.x || 0 ,
		y: data.y || 0
	} ) ;
} ;



/*
	Turtle-like commands
*/

VGPath.prototype.penUp = function( data ) {
	this.commands.push( {
		type: 'pen' ,
		u: true
	} ) ;
} ;

VGPath.prototype.penDown = function( data ) {
	this.commands.push( {
		type: 'pen' ,
		u: false
	} ) ;
} ;

VGPath.prototype.forward = function( data ) {
	this.commands.push( {
		type: 'forward' ,
		l: typeof data === 'number' ? data : data.length || data.l || 0
	} ) ;
} ;

VGPath.prototype.backward = function( data ) {
	this.commands.push( {
		type: 'forward' ,
		l: -( typeof data === 'number' ? data : data.length || data.l || 0 )
	} ) ;
} ;

// Turn using positive as X-axis to Y-axis
VGPath.prototype.turn = function( data ) {
	this.commands.push( {
		type: 'turn' ,
		rel: true ,
		a: typeof data === 'number' ? data : data.angle || data.a || 0
	} ) ;
} ;

// Turn from X-axis to Y-axis
VGPath.prototype.turnTo = function( data ) {
	this.commands.push( {
		type: 'turn' ,
		a: typeof data === 'number' ? data : data.angle || data.a || 0
	} ) ;
} ;

// Turn using positive as Y-axis to X-axis (Spellcast usage)
VGPath.prototype.negativeTurn = function( data ) {
	this.commands.push( {
		type: 'turn' ,
		rel: true ,
		a: -( typeof data === 'number' ? data : data.angle || data.a || 0 )
	} ) ;
} ;

// Turn from Y-axis to X-axis (clockwise when Y point upward, the invert of the standard 2D computer graphics) (Spellcast usage)
VGPath.prototype.negativeTurnTo = function( data ) {
	this.commands.push( {
		type: 'turn' ,
		a: 90 - ( typeof data === 'number' ? data : data.angle || data.a || 0 )
	} ) ;
} ;

// A turtle-like way of doing a curve: combine a forward and turn, moving along a circle
VGPath.prototype.forwardTurn = function( data ) {
	this.commands.push( {
		type: 'forwardTurn' ,
		l: data.length || data.l || 0 ,
		a: data.angle || data.a || 0
	} ) ;
} ;

// Turn using positive as Y-axis to X-axis (clockwise when Y point upward, the invert of the standard 2D computer graphics) (Spellcast usage)
VGPath.prototype.forwardNegativeTurn = function( data ) {
	this.commands.push( {
		type: 'forwardTurn' ,
		l: data.length || data.l || 0 ,
		a: -( data.angle || data.a || 0 )
	} ) ;
} ;


},{"../package.json":43,"./VGEntity.js":5}],14:[function(require,module,exports){
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



function VGRect( params ) {
	VGEntity.call( this , params ) ;

	this.x = 0 ;
	this.y = 0 ;
	this.width = 0 ;
	this.height = 0 ;

	// Round corner radius
	this.rx = 0 ;
	this.ry = 0 ;

	if ( params ) { this.set( params ) ; }
}

module.exports = VGRect ;

VGRect.prototype = Object.create( VGEntity.prototype ) ;
VGRect.prototype.constructor = VGRect ;
VGRect.prototype.__prototypeUID__ = 'svg-kit/VGRect' ;
VGRect.prototype.__prototypeVersion__ = require( '../package.json' ).version ;



VGRect.prototype.svgTag = 'rect' ;

VGRect.prototype.set = function( params ) {
	VGEntity.prototype.set.call( this , params ) ;

	if ( params.x !== undefined ) { this.x = params.x ; }
	if ( params.y !== undefined ) { this.y = params.y ; }
	if ( params.width !== undefined ) { this.width = params.width ; }
	if ( params.height !== undefined ) { this.height = params.height ; }

	// Round corner radius
	if ( params.r !== undefined ) { this.rx = this.ry = params.r ; }
	if ( params.rx !== undefined ) { this.rx = params.rx ; }
	if ( params.ry !== undefined ) { this.ry = params.ry ; }
} ;



VGRect.prototype.svgAttributes = function( root = this ) {
	var attr = {
		x: this.x ,
		y: root.invertY ? -this.y : this.y ,
		width: this.width ,
		height: this.height ,
		rx: this.rx ,
		ry: this.ry
	} ;

	return attr ;
} ;



VGRect.prototype.renderHookForCanvas = function( canvasCtx , options = {} , root = this ) {
	canvasCtx.save() ;
	canvasCtx.beginPath() ;
	canvasCtx.rect( this.x , root.invertY ? -this.y : this.y , this.width , this.height ) ;
	canvas.fillAndStrokeUsingSvgStyle( canvasCtx , this.style ) ;
	canvasCtx.restore() ;
} ;


},{"../package.json":43,"./VGEntity.js":5,"./canvas.js":16}],15:[function(require,module,exports){
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



/*
	/!\ Must support text on path
*/

function VGText( params ) {
	VGEntity.call( this , params ) ;

	this.x = 0 ;
	this.y = 0 ;
	this.text = '' ;
	this.anchor = null ;		// the CSS 'text-anchors', can be 'start', 'middle' or 'end', in VG it default to 'middle' instead of 'start'
	this.length = null ;		// the length of the text, textLength in SVG
	this.adjustGlyph = false ;	// true make SVG's 'lengthAdjust' set to 'spacingAndGlyphs', false does not set it (the default for SVG being 'spacing')

	// Position text relative to the previous text element
	//this.dx = 0 ;
	//this.dy = 0 ;

	if ( params ) { this.set( params ) ; }
}

module.exports = VGText ;

VGText.prototype = Object.create( VGEntity.prototype ) ;
VGText.prototype.constructor = VGText ;
VGText.prototype.__prototypeUID__ = 'svg-kit/VGText' ;
VGText.prototype.__prototypeVersion__ = require( '../package.json' ).version ;



VGText.prototype.svgTag = 'text' ;



VGText.prototype.set = function( params ) {
	VGEntity.prototype.set.call( this , params ) ;

	if ( params.x !== undefined ) { this.x = params.x ; }
	if ( params.y !== undefined ) { this.y = params.y ; }

	if ( params.text !== undefined ) { this.text = params.text ; }

	// Interop'
	if ( params.textAnchor !== undefined ) { this.anchor = params.textAnchor ; }
	if ( params.anchor !== undefined ) { this.anchor = params.anchor ; }

	// Interop'
	if ( params.textLength !== undefined ) { this.length = params.textLength ; }
	if ( params.length !== undefined ) { this.length = params.length ; }

	// Interop'
	if ( params.lengthAdjust === 'spacingAndGlyphs' ) { this.adjustGlyph = true ; }
	else if ( params.lengthAdjust === 'spacing' ) { this.adjustGlyph = false ; }
	if ( params.adjustGlyph !== undefined ) { this.adjustGlyph = !! params.adjustGlyph ; }
} ;



VGText.prototype.svgTextNode = function() {
	// Text-formatting should be possible
	return this.text ;
} ;



VGText.prototype.svgAttributes = function( root = this ) {
	var attr = {
		x: this.x ,
		y: root.invertY ? -this.y : this.y ,
		'text-anchor': this.anchor || 'middle'
	} ;

	if ( this.length !== null ) { attr.textLength = this.length ; }
	if ( this.adjustGlyph !== null ) { attr.lengthAdjust = 'spacingAndGlyphs' ; }

	return attr ;
} ;



VGText.prototype.renderHookForCanvas = function( canvasCtx , options = {} , root = this ) {
	var style = this.style ,
		fill = false ,
		stroke = false ,
		fillStyle = style.fill && style.fill !== 'none' ? style.fill : null ,
		strokeStyle = style.stroke && style.stroke !== 'none' ? style.stroke : null ,
		lineWidth = + ( style.strokeWidth ?? 1 ) || 0 ;

	canvasCtx.save() ;
	canvasCtx.font = '' + style.fontSize + 'px ' + style.fontFamily ;
	canvasCtx.textBaseline = 'alphabetic' ;
	canvasCtx.direction = 'ltr' ;

	// /!\ It produces different result when direction is right-to-left, but SVG Kit does not support that for instance...
	canvasCtx.textAlign = 
		this.anchor === 'start' ? 'left' :
		this.anchor === 'end' ? 'right' :
		'center' ;
	
	if ( fillStyle ) {
		fill = true ;
		canvasCtx.fillStyle = fillStyle ;
	}

	if ( strokeStyle && lineWidth ) {
		stroke = true ;
		canvasCtx.strokeStyle = strokeStyle ;
		canvasCtx.lineWidth = lineWidth ;
	}
	
	if ( ! style.paintOrder || style.paintOrder.startsWith( 'fill' ) ) {
		if ( fill ) { canvasCtx.fillText( this.text , this.x , this.y ) ; }
		if ( stroke ) { canvasCtx.strokeText( this.text , this.x , this.y ) ; }
	}
	else {
		if ( stroke ) { canvasCtx.strokeText( this.text , this.x , this.y ) ; }
		if ( fill ) { canvasCtx.fillText( this.text , this.x , this.y ) ; }
	}

	canvasCtx.restore() ;
} ;


},{"../package.json":43,"./VGEntity.js":5}],16:[function(require,module,exports){
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



const canvas = {} ;
module.exports = canvas ;



canvas.fillAndStrokeUsingSvgStyle = ( canvasCtx , style , path2d = null ) => {
	var fill = false ,
		stroke = false ,
		fillStyle = style.fill && style.fill !== 'none' ? style.fill : null ,
		strokeStyle = style.stroke && style.stroke !== 'none' ? style.stroke : null ,
		lineWidth = + ( style.strokeWidth ?? 1 ) || 0 ;

	if ( fillStyle ) {
		fill = true ;
		canvasCtx.fillStyle = fillStyle ;
	}

	if ( strokeStyle && lineWidth ) {
		stroke = true ;
		canvasCtx.strokeStyle = strokeStyle ;
		canvasCtx.lineWidth = lineWidth ;
	}
	
	if ( ! fill && ! stroke ) { return ; }
	
	if ( ! style.paintOrder || style.paintOrder.startsWith( 'fill' ) ) {
		if ( fill ) {
			if ( path2d ) { canvasCtx.fill( path2d ) ; }
			else { canvasCtx.fill() ; }
		}
		if ( stroke ) {
			if ( path2d ) { canvasCtx.stroke( path2d ) ; }
			else { canvasCtx.stroke() ; }
		}
	}
	else {
		if ( stroke ) {
			if ( path2d ) { canvasCtx.stroke( path2d ) ; }
			else { canvasCtx.stroke() ; }
		}
		if ( fill ) {
			if ( path2d ) { canvasCtx.fill( path2d ) ; }
			else { canvasCtx.fill() ; }
		}
	}
} ;


},{}],17:[function(require,module,exports){
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



const path = {} ;
module.exports = path ;



path.dFromPoints = ( points , invertY ) => {
	var yMul = invertY ? -1 : 1 ,
		str = 'M' ;

	points.forEach( point => {
		str += ' ' + point.x + ',' + ( point.y * yMul ) ;
	} ) ;

	return str ;
} ;


},{}],18:[function(require,module,exports){
(function (process){(function (){
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



const fs = require( 'fs' ).promises ;
const domKit = require( 'dom-kit' ) ;
const escape = require( 'string-kit/lib/escape.js' ) ;

function noop() {}



const svgKit = {} ;
module.exports = svgKit ;

svgKit.path = require( './path.js' ) ;
svgKit.canvas = require( './canvas.js' ) ;

svgKit.VG = require( './VG.js' ) ;
svgKit.VGEntity = require( './VGEntity.js' ) ;
svgKit.VGContainer = require( './VGContainer.js' ) ;
svgKit.VGGroup = require( './VGGroup.js' ) ;
svgKit.VGRect = require( './VGRect.js' ) ;
svgKit.VGEllipse = require( './VGEllipse.js' ) ;
svgKit.VGPath = require( './VGPath.js' ) ;
svgKit.VGText = require( './VGText.js' ) ;

svgKit.fontLib = require( './VGFlowingText/fontLib.js' ) ;
svgKit.VGFlowingText = require( './VGFlowingText/VGFlowingText.js' ) ;
svgKit.StructuredTextLine = require( './VGFlowingText/StructuredTextLine.js' ) ;
svgKit.StructuredTextPart = require( './VGFlowingText/StructuredTextPart.js' ) ;
svgKit.TextAttribute = require( './VGFlowingText/TextAttribute.js' ) ;
svgKit.TextMetrics = require( './VGFlowingText/TextMetrics.js' ) ;

svgKit.domKit = domKit ;
svgKit.opentype = require( 'opentype.js' ) ;



/*
	load( url , [options] )

	* url: the URL of the .svg file
	* options: (optional) object of options, transmitted to .inject() and .patch()

	Return a promise resolving to the SVG DOM document.
*/
svgKit.load = async function( url , options = {} ) {
	var content , $doc , $svg ;

	if ( ! process.browser ) {
		// Use Node.js 'fs' module
		if ( url.substring( 0 , 7 ) === 'file://' ) { url = url.slice( 7 ) ; }
		content = await fs.readFile( url , 'utf8' ) ;
		$doc = domKit.fromXml( content ) ;
	}
	else {
		// Use an AJAX HTTP Request
		$doc = await svgKit.ajax( url ) ;
	}

	if ( options.removeComments ) {
		domKit.removeComments( $doc ) ;
		delete options.removeComments ;
	}

	$svg = $doc.documentElement ;
	svgKit.inject( $svg , options ) ;
	return $svg ;
} ;



svgKit.loadFromString = function( content , options = {} ) {
	var $doc = domKit.fromXml( content ) ;

	if ( options.removeComments ) {
		domKit.removeComments( $doc ) ;
		delete options.removeComments ;
	}

	var $svg = $doc.documentElement ;
	svgKit.inject( $svg , options ) ;
	return $svg ;
} ;



svgKit.ajax = function( url ) {
	return new Promise( ( resolve , reject ) => {
		var xhr = new XMLHttpRequest() ;

		xhr.responseType = 'document' ;

		xhr.onreadystatechange = () => {
			// From MDN: In the event of a communication error (such as the webserver going down),
			// an exception will be thrown when attempting to access the 'status' property.

			try {
				if ( xhr.readyState === 4 ) {
					if ( xhr.status === 200 ) {
						resolve( xhr.responseXML ) ;
					}
					else if ( xhr.status === 0 && xhr.responseXML ) {	// Yay, loading with file:// does not provide any status...
						resolve( xhr.responseXML ) ;
					}
					else if ( xhr.status ) { reject( xhr.status ) ; }
					else { reject( new Error( "[svg-kit] ajaxStatus(): Error with falsy status" ) ) ; }
				}
			}
			catch ( error ) {
				reject( error ) ;
			}
		} ;

		xhr.open( 'GET' , url ) ;
		xhr.send() ;
	} ) ;
} ;



/*
	Fix few <svg> things in order to inject it in the dom

	* $svg: the svg element
	* options: options object, where:
		* into: `DOMElement` an element where the .svg file should be loaded into
		* as: `DOMElement` a <svg> element where the .svg file should replace, almost like the "into" option,
		  useful when a <svg> tag should be created synchronously to start doing stuffs on it,
		  and let the asynchronous loading works in the background
		* all other options are passed to .patch()
*/
svgKit.inject = function( $svg , options ) {
	svgKit.patch( $svg , options ) ;

	if ( options.into ) { options.into.appendChild( $svg ) ; }

	// Better to avoid to check the tag name:
	// it's too defensive and it prevents from loading inside a <g> tag
	if ( options.as ) { //&& options.as.tagName.toLowerCase() === 'svg' )
		domKit.moveAttributes( $svg , options.as ) ;
		domKit.moveChildrenInto( $svg , options.as ) ;
	}
} ;



/*
	Fix few <svg> things.

	* $svg: the svg element
	* options: options object, where:
		* id: `string` the id attribute of the <svg> tag (recommanded)
		* removeIds: `boolean` remove all 'id' attributes
		* prefixIds: `string` prefix all IDs and patch url #ref
		* hidden: `boolean` turn the svg hidden (useful to apply modification before the show)
		* class: `string` or `object` (key=class, value=true/false) to add/remove on the <svg> tag
		* removeSize: `boolean` remove the width and height attribute and style from the <svg> tag
		* removeSvgStyle: `boolean` remove the top-level style attribute of the <svg> tag
		* removeDefaultStyles: `boolean` used to removed meaningless style pollution
		* css: `object` a css object to apply on the <svg> tag
		* colorClass: `boolean` a very specialized option. It moves all stroke and fill color inline styles to attribute
		  on all drawing elements and add the "primary" class to those that are class-less.
		  Since CSS has a greater priority than attributes (but lesser than inline styles), this allows us to controle
		  color using CSS.
		* removeComments: `boolean` remove all comment nodes
		* removeWhiteSpaces: `boolean` remove all white-space
		* removeWhiteLines: `boolean` remove all empty lines
		* removeExoticNamespaces: `boolean` remove all tag and attributes that have a namespace different than svg,
		  the svg namespace is stripped
*/
svgKit.patch = function( $svg , options ) {
	var viewBox , width , height ;

	svgKit.lightCleanup( $svg ) ;

	// Fix id, if necessary
	if ( options.id !== undefined ) {
		if ( typeof options.id === 'string' ) { $svg.setAttribute( 'id' , options.id ) ; }
		else if ( ! options.id ) { $svg.removeAttribute( 'id' ) ; }
	}

	if ( options.class ) {
		if ( typeof options.class === 'string' ) { $svg.classList.add( options.class ) ; }
		else if ( typeof options.class === 'object' ) { domKit.class( $svg , options.class ) ; }
	}

	if ( options.hidden ) { $svg.style.visibility = 'hidden' ; }

	if ( options.prefixIds ) { domKit.prefixIds( $svg , options.prefixIds ) ; }
	if ( options.removeIds ) { domKit.removeAllAttributes( $svg , 'id' ) ; }

	if ( options.removeSvgStyle ) { $svg.removeAttribute( 'style' ) ; }
	if ( options.removeDefaultStyles ) { svgKit.removeDefaultStyles( $svg ) ; }
	if ( options.removeComments ) { domKit.removeComments( $svg ) ; }

	if ( options.removeExoticNamespaces ) {
		domKit.filterByNamespace( $svg , { primary: 'svg' , whitelist: [] } ) ;
	}

	if ( options.removeSize ) {
		// Save and remove the width and height attribute
		width = $svg.getAttribute( 'width' ) || $svg.style.width ;
		height = $svg.getAttribute( 'height' ) || $svg.style.height ;

		$svg.removeAttribute( 'height' ) ;
		$svg.removeAttribute( 'width' ) ;
		$svg.style.width = null ;
		$svg.style.height = null ;

		// if the $svg don't have a viewBox attribute, set it now from the width and height (it works most of time)
		if ( ! $svg.getAttribute( 'viewBox' ) && width && height ) {
			viewBox = '0 0 ' + width + ' ' + height ;
			$svg.setAttribute( 'viewBox' , viewBox ) ;
		}
	}

	if ( options.css ) { domKit.css( $svg , options.css ) ; }

	if ( options.colorClass ) { svgKit.colorClass( $svg ) ; }

	if ( options.removeWhiteSpaces ) { domKit.removeWhiteSpaces( $svg ) ; }
	else if ( options.removeWhiteLines ) { domKit.removeWhiteSpaces( $svg , true ) ; }
} ;



svgKit.patchDocument = function( $doc , options ) {
	var removeWhiteSpaces = options.removeWhiteSpaces ,
		removeWhiteLines = options.removeWhiteLines ,
		removeComments = options.removeComments ;

	delete options.removeWhiteSpaces ;
	delete options.removeWhiteLines ;
	delete options.removeComments ;

	if ( removeComments ) { domKit.removeComments( $doc ) ; }

	svgKit.patch( $doc.documentElement , options ) ;

	if ( removeWhiteSpaces ) { domKit.removeWhiteSpaces( $doc ) ; }
	else if ( removeWhiteLines ) { domKit.removeWhiteSpaces( $doc , true ) ; }
} ;



svgKit.lightCleanup = function( $svg ) {
	domKit.removeAllTags( $svg , 'metadata' ) ;
	domKit.removeAllTags( $svg , 'script' ) ;
	domKit.removeAllTags( $svg , 'defs' , true ) ;	// all empty defs
} ;



// List of svg tags that actually display things
const drawingTags = [
	'path' ,
	'circle' ,
	'ellipse' ,
	'line' ,
	'rect' ,
	'polyline' ,
	'polygone' ,
	'text' ,
	'textPath'
] ;



const defaultStyles = [
	[ 'font-style' , 'normal' ] ,
	[ 'font-weight' , 'normal' ] ,
	[ 'font-variant' , 'normal' ] ,
	[ 'font-stretch' , 'normal' ] ,
	[ 'font-size' , 'medium' ] ,
	[ 'line-height' , 'normal' ] ,
	[ 'font-variant-ligatures' , 'normal' ] ,
	//[ 'font-family' , 'sans-serif' ] ,
	[ 'font-variant-position' , 'normal' ] ,
	[ 'font-variant-caps' , 'normal' ] ,
	[ 'font-variant-numeric' , 'normal' ] ,
	[ 'font-variant-alternates' , 'normal' ] ,
	[ 'font-variant-east-asian' , 'normal' ] ,
	[ 'font-feature-settings' , 'normal' ] ,
	[ 'text-indent' , '0' ] ,
	[ 'text-align' , 'start' ] ,
	[ 'text-decoration' , 'none' ] ,
	[ 'text-decoration-line' , 'none' ] ,
	[ 'text-decoration-style' , 'solid' ] ,
	[ 'text-decoration-color' , '#000000' ] ,
	[ 'letter-spacing' , 'normal' ] ,
	[ 'word-spacing' , 'normal' ] ,
	[ 'text-transform' , 'none' ] ,
	[ 'writing-mode' , 'lr-tb' ] ,
	[ 'direction' , 'ltr' ] ,
	[ 'text-orientation' , 'mixed' ] ,
	[ 'dominant-baseline' , 'auto' ] ,
	[ 'baseline-shift' , 'baseline' ] ,
	[ 'text-anchor' , 'start' ] ,
	[ 'white-space' , 'normal' ] ,
	[ 'shape-padding' , '0' ] ,
	[ 'display' , 'inline' ] ,
	[ 'visibility' , 'visible' ] ,
	[ 'overflow' , 'visible' ] ,
	[ 'opacity' , '1' ] ,
	[ 'isolation' , 'auto' ] ,
	[ 'mix-blend-mode' , 'normal' ] ,
	[ 'color-interpolation' , 'sRGB' ] ,
	[ 'color-interpolation-filters' , 'linearRGB' ] ,
	[ 'solid-color' , '#000000' ] ,
	[ 'solid-opacity' , '1' ] ,
	[ 'vector-effect' , 'none' ] ,
	[ 'fill-rule' , 'nonzero' ] ,
	[ 'clip-rule' , 'nonzero' ] ,
	[ 'color-rendering' , 'auto' ] ,
	[ 'image-rendering' , 'auto' ] ,
	[ 'shape-rendering' , 'auto' ] ,
	[ 'text-rendering' , 'auto' ] ,
	[ 'enable-background' , 'accumulate' ] ,
	[ 'stroke-dasharray' , 'none' ] ,
	[ 'stroke-dashoffset' , '0' ] ,
	[ 'paint-order' , 'normal' ] ,
	[ 'paint-order' , 'fill stroke markers' ]
] ;



svgKit.colorClass = function( $svg ) {
	drawingTags.forEach( ( tagName ) => {
		Array.from( $svg.getElementsByTagName( tagName ) ).forEach( ( $element ) => {
			// Beware, $element.className does not work as expected for SVG
			if ( ! $element.getAttribute( 'class' ) ) {
				$element.classList.add( 'primary' ) ;
			}

			// move style to attribute if they are not 'none'
			domKit.styleToAttribute( $element , 'fill' , [ 'none' ] ) ;
			domKit.styleToAttribute( $element , 'stroke' , [ 'none' ] ) ;
		} ) ;
	} ) ;
} ;



// Remove styles set to a default/unused value
svgKit.removeDefaultStyles = function( $svg ) {
	drawingTags.forEach( ( tagName ) => {
		Array.from( $svg.getElementsByTagName( tagName ) ).forEach( ( $element ) => {
			var styles = $element.getAttribute( 'style' ) ;

			defaultStyles.forEach( array => {
				var k = array[ 0 ] ;
				var v = array[ 1 ] ;

				styles = styles.replace(
					new RegExp( '(^|;) *' + escape.regExp( k ) + ' *: *' + escape.regExp( v ) + ' *(?:;|$)' ) ,
					( full , pre ) => pre
				) ;
			} ) ;

			$element.setAttribute( 'style' , styles ) ;
		} ) ;
	} ) ;
} ;



// Should remove all tags and attributes that have non-registered namespace,
// e.g.: sodipodi, inkscape, etc...
//svgKit.heavyCleanup = function( svgElement ) {} ;



svgKit.getViewBox = function( $svg ) {
	var raw = $svg.getAttribute( 'viewBox' ) ;

	if ( ! raw ) { return null ; }

	var array = raw.split( / +/ ) ;

	return {
		x: parseFloat( array[ 0 ] , 10 ) ,
		y: parseFloat( array[ 1 ] , 10 ) ,
		width: parseFloat( array[ 2 ] , 10 ) ,
		height: parseFloat( array[ 3 ] , 10 )
	} ;
} ;



svgKit.setViewBox = function( $svg , viewBox ) {
	$svg.setAttribute( 'viewBox' , viewBox.x + ' ' + viewBox.y + ' ' + viewBox.width + ' ' + viewBox.height ) ;
} ;



svgKit.toAreaArray = function( object ) {
	if ( object.min && object.max ) {
		// Math Kit BoundingBox2D
		return [
			object.min.x ,
			object.min.y ,
			object.max.x - object.min.x ,
			object.max.y - object.min.y
		] ;
	}
	else if ( object.xmin !== undefined && object.xmax !== undefined && object.ymin !== undefined && object.ymax !== undefined ) {
		return [
			object.xmin ,
			object.ymin ,
			object.xmax - object.xmin ,
			object.ymax - object.ymin
		] ;
	}
	else if ( object.x !== undefined && object.y !== undefined && object.width !== undefined && object.height !== undefined ) {
		return [
			object.x ,
			object.y ,
			object.width ,
			object.height
		] ;
	}

	return [ 0 , 0 , 100 , 100 ] ;
} ;



svgKit.standalone = function( content , viewBox ) {
	var output = '<?xml version="1.0" encoding="UTF-8"?>\n' ;

	if ( ! Array.isArray( viewBox ) ) { viewBox = svgKit.toAreaArray( viewBox ) ; }

	output += '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + viewBox.join( ' ' ) + '">\n' ;

	// ?
	// width="500"
	// height="500"

	output += content ;
	output += '\n</svg>\n' ;

	return output ;
} ;



svgKit.unserializeVG = str => svgKit.objectToVG( JSON.parse( str ) ) ;

svgKit.objectToVG = function( object , clone = false ) {
	if ( ! object || typeof object !== 'object' ) { return null ; }

	if ( object instanceof svgKit.VGEntity ) {
		if ( clone ) { return new object.constructor( object ) ; }
		return object ;
	}

	if ( ! object._type || ! object._type.startsWith( 'svg-kit/' ) ) { return null ; }

	var className = object._type.slice( 8 ) ;
	if ( ! svgKit[ className ] ) { return null ; }

	return new svgKit[ className ]( object ) ;
} ;


}).call(this)}).call(this,require('_process'))
},{"./VG.js":2,"./VGContainer.js":3,"./VGEllipse.js":4,"./VGEntity.js":5,"./VGFlowingText/StructuredTextLine.js":6,"./VGFlowingText/StructuredTextPart.js":7,"./VGFlowingText/TextAttribute.js":8,"./VGFlowingText/TextMetrics.js":9,"./VGFlowingText/VGFlowingText.js":10,"./VGFlowingText/fontLib.js":11,"./VGGroup.js":12,"./VGPath.js":13,"./VGRect.js":14,"./VGText.js":15,"./canvas.js":16,"./path.js":17,"_process":50,"dom-kit":23,"fs":44,"opentype.js":25,"string-kit/lib/escape.js":29}],19:[function(require,module,exports){
function DOMParser(options){
	this.options = options ||{locator:{}};
	
}

DOMParser.prototype.parseFromString = function(source,mimeType){
	var options = this.options;
	var sax =  new XMLReader();
	var domBuilder = options.domBuilder || new DOMHandler();//contentHandler and LexicalHandler
	var errorHandler = options.errorHandler;
	var locator = options.locator;
	var defaultNSMap = options.xmlns||{};
	var isHTML = /\/x?html?$/.test(mimeType);//mimeType.toLowerCase().indexOf('html') > -1;
  	var entityMap = isHTML?htmlEntity.entityMap:{'lt':'<','gt':'>','amp':'&','quot':'"','apos':"'"};
	if(locator){
		domBuilder.setDocumentLocator(locator)
	}
	
	sax.errorHandler = buildErrorHandler(errorHandler,domBuilder,locator);
	sax.domBuilder = options.domBuilder || domBuilder;
	if(isHTML){
		defaultNSMap['']= 'http://www.w3.org/1999/xhtml';
	}
	defaultNSMap.xml = defaultNSMap.xml || 'http://www.w3.org/XML/1998/namespace';
	if(source){
		sax.parse(source,defaultNSMap,entityMap);
	}else{
		sax.errorHandler.error("invalid doc source");
	}
	return domBuilder.doc;
}
function buildErrorHandler(errorImpl,domBuilder,locator){
	if(!errorImpl){
		if(domBuilder instanceof DOMHandler){
			return domBuilder;
		}
		errorImpl = domBuilder ;
	}
	var errorHandler = {}
	var isCallback = errorImpl instanceof Function;
	locator = locator||{}
	function build(key){
		var fn = errorImpl[key];
		if(!fn && isCallback){
			fn = errorImpl.length == 2?function(msg){errorImpl(key,msg)}:errorImpl;
		}
		errorHandler[key] = fn && function(msg){
			fn('[xmldom '+key+']\t'+msg+_locator(locator));
		}||function(){};
	}
	build('warning');
	build('error');
	build('fatalError');
	return errorHandler;
}

//console.log('#\n\n\n\n\n\n\n####')
/**
 * +ContentHandler+ErrorHandler
 * +LexicalHandler+EntityResolver2
 * -DeclHandler-DTDHandler 
 * 
 * DefaultHandler:EntityResolver, DTDHandler, ContentHandler, ErrorHandler
 * DefaultHandler2:DefaultHandler,LexicalHandler, DeclHandler, EntityResolver2
 * @link http://www.saxproject.org/apidoc/org/xml/sax/helpers/DefaultHandler.html
 */
function DOMHandler() {
    this.cdata = false;
}
function position(locator,node){
	node.lineNumber = locator.lineNumber;
	node.columnNumber = locator.columnNumber;
}
/**
 * @see org.xml.sax.ContentHandler#startDocument
 * @link http://www.saxproject.org/apidoc/org/xml/sax/ContentHandler.html
 */ 
DOMHandler.prototype = {
	startDocument : function() {
    	this.doc = new DOMImplementation().createDocument(null, null, null);
    	if (this.locator) {
        	this.doc.documentURI = this.locator.systemId;
    	}
	},
	startElement:function(namespaceURI, localName, qName, attrs) {
		var doc = this.doc;
	    var el = doc.createElementNS(namespaceURI, qName||localName);
	    var len = attrs.length;
	    appendElement(this, el);
	    this.currentElement = el;
	    
		this.locator && position(this.locator,el)
	    for (var i = 0 ; i < len; i++) {
	        var namespaceURI = attrs.getURI(i);
	        var value = attrs.getValue(i);
	        var qName = attrs.getQName(i);
			var attr = doc.createAttributeNS(namespaceURI, qName);
			this.locator &&position(attrs.getLocator(i),attr);
			attr.value = attr.nodeValue = value;
			el.setAttributeNode(attr)
	    }
	},
	endElement:function(namespaceURI, localName, qName) {
		var current = this.currentElement
		var tagName = current.tagName;
		this.currentElement = current.parentNode;
	},
	startPrefixMapping:function(prefix, uri) {
	},
	endPrefixMapping:function(prefix) {
	},
	processingInstruction:function(target, data) {
	    var ins = this.doc.createProcessingInstruction(target, data);
	    this.locator && position(this.locator,ins)
	    appendElement(this, ins);
	},
	ignorableWhitespace:function(ch, start, length) {
	},
	characters:function(chars, start, length) {
		chars = _toString.apply(this,arguments)
		//console.log(chars)
		if(chars){
			if (this.cdata) {
				var charNode = this.doc.createCDATASection(chars);
			} else {
				var charNode = this.doc.createTextNode(chars);
			}
			if(this.currentElement){
				this.currentElement.appendChild(charNode);
			}else if(/^\s*$/.test(chars)){
				this.doc.appendChild(charNode);
				//process xml
			}
			this.locator && position(this.locator,charNode)
		}
	},
	skippedEntity:function(name) {
	},
	endDocument:function() {
		this.doc.normalize();
	},
	setDocumentLocator:function (locator) {
	    if(this.locator = locator){// && !('lineNumber' in locator)){
	    	locator.lineNumber = 0;
	    }
	},
	//LexicalHandler
	comment:function(chars, start, length) {
		chars = _toString.apply(this,arguments)
	    var comm = this.doc.createComment(chars);
	    this.locator && position(this.locator,comm)
	    appendElement(this, comm);
	},
	
	startCDATA:function() {
	    //used in characters() methods
	    this.cdata = true;
	},
	endCDATA:function() {
	    this.cdata = false;
	},
	
	startDTD:function(name, publicId, systemId) {
		var impl = this.doc.implementation;
	    if (impl && impl.createDocumentType) {
	        var dt = impl.createDocumentType(name, publicId, systemId);
	        this.locator && position(this.locator,dt)
	        appendElement(this, dt);
	    }
	},
	/**
	 * @see org.xml.sax.ErrorHandler
	 * @link http://www.saxproject.org/apidoc/org/xml/sax/ErrorHandler.html
	 */
	warning:function(error) {
		console.warn('[xmldom warning]\t'+error,_locator(this.locator));
	},
	error:function(error) {
		console.error('[xmldom error]\t'+error,_locator(this.locator));
	},
	fatalError:function(error) {
		console.error('[xmldom fatalError]\t'+error,_locator(this.locator));
	    throw error;
	}
}
function _locator(l){
	if(l){
		return '\n@'+(l.systemId ||'')+'#[line:'+l.lineNumber+',col:'+l.columnNumber+']'
	}
}
function _toString(chars,start,length){
	if(typeof chars == 'string'){
		return chars.substr(start,length)
	}else{//java sax connect width xmldom on rhino(what about: "? && !(chars instanceof String)")
		if(chars.length >= start+length || start){
			return new java.lang.String(chars,start,length)+'';
		}
		return chars;
	}
}

/*
 * @link http://www.saxproject.org/apidoc/org/xml/sax/ext/LexicalHandler.html
 * used method of org.xml.sax.ext.LexicalHandler:
 *  #comment(chars, start, length)
 *  #startCDATA()
 *  #endCDATA()
 *  #startDTD(name, publicId, systemId)
 *
 *
 * IGNORED method of org.xml.sax.ext.LexicalHandler:
 *  #endDTD()
 *  #startEntity(name)
 *  #endEntity(name)
 *
 *
 * @link http://www.saxproject.org/apidoc/org/xml/sax/ext/DeclHandler.html
 * IGNORED method of org.xml.sax.ext.DeclHandler
 * 	#attributeDecl(eName, aName, type, mode, value)
 *  #elementDecl(name, model)
 *  #externalEntityDecl(name, publicId, systemId)
 *  #internalEntityDecl(name, value)
 * @link http://www.saxproject.org/apidoc/org/xml/sax/ext/EntityResolver2.html
 * IGNORED method of org.xml.sax.EntityResolver2
 *  #resolveEntity(String name,String publicId,String baseURI,String systemId)
 *  #resolveEntity(publicId, systemId)
 *  #getExternalSubset(name, baseURI)
 * @link http://www.saxproject.org/apidoc/org/xml/sax/DTDHandler.html
 * IGNORED method of org.xml.sax.DTDHandler
 *  #notationDecl(name, publicId, systemId) {};
 *  #unparsedEntityDecl(name, publicId, systemId, notationName) {};
 */
"endDTD,startEntity,endEntity,attributeDecl,elementDecl,externalEntityDecl,internalEntityDecl,resolveEntity,getExternalSubset,notationDecl,unparsedEntityDecl".replace(/\w+/g,function(key){
	DOMHandler.prototype[key] = function(){return null}
})

/* Private static helpers treated below as private instance methods, so don't need to add these to the public API; we might use a Relator to also get rid of non-standard public properties */
function appendElement (hander,node) {
    if (!hander.currentElement) {
        hander.doc.appendChild(node);
    } else {
        hander.currentElement.appendChild(node);
    }
}//appendChild and setAttributeNS are preformance key

//if(typeof require == 'function'){
var htmlEntity = require('./entities');
var XMLReader = require('./sax').XMLReader;
var DOMImplementation = exports.DOMImplementation = require('./dom').DOMImplementation;
exports.XMLSerializer = require('./dom').XMLSerializer ;
exports.DOMParser = DOMParser;
//}

},{"./dom":20,"./entities":21,"./sax":22}],20:[function(require,module,exports){

"use strict" ;

// +++ cronvel
const stringKit = require( 'string-kit' ) ;
// --- cronvel

/*
 * DOM Level 2
 * Object DOMException
 * @see http://www.w3.org/TR/REC-DOM-Level-1/ecma-script-language-binding.html
 * @see http://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/ecma-script-binding.html
 */

function copy(src,dest){
	// +++ cronvel
	/*
	for(var p in src){
		dest[p] = src[p];
	}
	*/
	
	Object.getOwnPropertyNames( src ).forEach( key => {
		Object.defineProperty( dest , key , Object.getOwnPropertyDescriptor( src , key ) ) ;
	} ) ;
	// --- cronvel
}
/**
^\w+\.prototype\.([_\w]+)\s*=\s*((?:.*\{\s*?[\r\n][\s\S]*?^})|\S.*?(?=[;\r\n]));?
^\w+\.prototype\.([_\w]+)\s*=\s*(\S.*?(?=[;\r\n]));?
 */
function _extends(Class,Super){
	var pt = Class.prototype;
	if(!(pt instanceof Super)){
		function t(){};
		t.prototype = Super.prototype;
		t = new t();
		copy(pt,t);
		Class.prototype = pt = t;
	}
	if(pt.constructor != Class){
		if(typeof Class != 'function'){
			console.error("unknow Class:"+Class)
		}
		pt.constructor = Class
	}
}
var htmlns = 'http://www.w3.org/1999/xhtml' ;
// Node Types
var NodeType = {}
var ELEMENT_NODE                = NodeType.ELEMENT_NODE                = 1;
var ATTRIBUTE_NODE              = NodeType.ATTRIBUTE_NODE              = 2;
var TEXT_NODE                   = NodeType.TEXT_NODE                   = 3;
var CDATA_SECTION_NODE          = NodeType.CDATA_SECTION_NODE          = 4;
var ENTITY_REFERENCE_NODE       = NodeType.ENTITY_REFERENCE_NODE       = 5;
var ENTITY_NODE                 = NodeType.ENTITY_NODE                 = 6;
var PROCESSING_INSTRUCTION_NODE = NodeType.PROCESSING_INSTRUCTION_NODE = 7;
var COMMENT_NODE                = NodeType.COMMENT_NODE                = 8;
var DOCUMENT_NODE               = NodeType.DOCUMENT_NODE               = 9;
var DOCUMENT_TYPE_NODE          = NodeType.DOCUMENT_TYPE_NODE          = 10;
var DOCUMENT_FRAGMENT_NODE      = NodeType.DOCUMENT_FRAGMENT_NODE      = 11;
var NOTATION_NODE               = NodeType.NOTATION_NODE               = 12;

// ExceptionCode
var ExceptionCode = {}
var ExceptionMessage = {};
var INDEX_SIZE_ERR              = ExceptionCode.INDEX_SIZE_ERR              = ((ExceptionMessage[1]="Index size error"),1);
var DOMSTRING_SIZE_ERR          = ExceptionCode.DOMSTRING_SIZE_ERR          = ((ExceptionMessage[2]="DOMString size error"),2);
var HIERARCHY_REQUEST_ERR       = ExceptionCode.HIERARCHY_REQUEST_ERR       = ((ExceptionMessage[3]="Hierarchy request error"),3);
var WRONG_DOCUMENT_ERR          = ExceptionCode.WRONG_DOCUMENT_ERR          = ((ExceptionMessage[4]="Wrong document"),4);
var INVALID_CHARACTER_ERR       = ExceptionCode.INVALID_CHARACTER_ERR       = ((ExceptionMessage[5]="Invalid character"),5);
var NO_DATA_ALLOWED_ERR         = ExceptionCode.NO_DATA_ALLOWED_ERR         = ((ExceptionMessage[6]="No data allowed"),6);
var NO_MODIFICATION_ALLOWED_ERR = ExceptionCode.NO_MODIFICATION_ALLOWED_ERR = ((ExceptionMessage[7]="No modification allowed"),7);
var NOT_FOUND_ERR               = ExceptionCode.NOT_FOUND_ERR               = ((ExceptionMessage[8]="Not found"),8);
var NOT_SUPPORTED_ERR           = ExceptionCode.NOT_SUPPORTED_ERR           = ((ExceptionMessage[9]="Not supported"),9);
var INUSE_ATTRIBUTE_ERR         = ExceptionCode.INUSE_ATTRIBUTE_ERR         = ((ExceptionMessage[10]="Attribute in use"),10);
//level2
var INVALID_STATE_ERR        	= ExceptionCode.INVALID_STATE_ERR        	= ((ExceptionMessage[11]="Invalid state"),11);
var SYNTAX_ERR               	= ExceptionCode.SYNTAX_ERR               	= ((ExceptionMessage[12]="Syntax error"),12);
var INVALID_MODIFICATION_ERR 	= ExceptionCode.INVALID_MODIFICATION_ERR 	= ((ExceptionMessage[13]="Invalid modification"),13);
var NAMESPACE_ERR            	= ExceptionCode.NAMESPACE_ERR           	= ((ExceptionMessage[14]="Invalid namespace"),14);
var INVALID_ACCESS_ERR       	= ExceptionCode.INVALID_ACCESS_ERR      	= ((ExceptionMessage[15]="Invalid access"),15);


function DOMException(code, message) {
	if(message instanceof Error){
		var error = message;
	}else{
		error = this;
		Error.call(this, ExceptionMessage[code]);
		this.message = ExceptionMessage[code];
		if(Error.captureStackTrace) Error.captureStackTrace(this, DOMException);
	}
	error.code = code;
	if(message) this.message = this.message + ": " + message;
	return error;
};
DOMException.prototype = Error.prototype;
copy(ExceptionCode,DOMException)
/**
 * @see http://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/core.html#ID-536297177
 * The NodeList interface provides the abstraction of an ordered collection of nodes, without defining or constraining how this collection is implemented. NodeList objects in the DOM are live.
 * The items in the NodeList are accessible via an integral index, starting from 0.
 */
function NodeList() {
};
NodeList.prototype = {
	/**
	 * The number of nodes in the list. The range of valid child node indices is 0 to length-1 inclusive.
	 * @standard level1
	 */
	length:0, 
	/**
	 * Returns the indexth item in the collection. If index is greater than or equal to the number of nodes in the list, this returns null.
	 * @standard level1
	 * @param index  unsigned long 
	 *   Index into the collection.
	 * @return Node
	 * 	The node at the indexth position in the NodeList, or null if that is not a valid index. 
	 */
	item: function(index) {
		return this[index] || null;
	},
	toString:function(isHTML,nodeFilter){
		for(var buf = [], i = 0;i<this.length;i++){
			serializeToString(this[i],buf,isHTML,nodeFilter);
		}
		return buf.join('');
	}
};
function LiveNodeList(node,refresh){
	this._node = node;
	this._refresh = refresh
	_updateLiveList(this);
}
function _updateLiveList(list){
	var inc = list._node._inc || list._node.ownerDocument._inc;
	if(list._inc != inc){
		var ls = list._refresh(list._node);
		//console.log(ls.length)
		__set__(list,'length',ls.length);
		copy(ls,list);
		list._inc = inc;
	}
}
LiveNodeList.prototype.item = function(i){
	_updateLiveList(this);
	return this[i];
}

_extends(LiveNodeList,NodeList);
/**
 * 
 * Objects implementing the NamedNodeMap interface are used to represent collections of nodes that can be accessed by name. Note that NamedNodeMap does not inherit from NodeList; NamedNodeMaps are not maintained in any particular order. Objects contained in an object implementing NamedNodeMap may also be accessed by an ordinal index, but this is simply to allow convenient enumeration of the contents of a NamedNodeMap, and does not imply that the DOM specifies an order to these Nodes.
 * NamedNodeMap objects in the DOM are live.
 * used for attributes or DocumentType entities 
 */
function NamedNodeMap() {
};

function _findNodeIndex(list,node){
	var i = list.length;
	while(i--){
		if(list[i] === node){return i}
	}
}

function _addNamedNode(el,list,newAttr,oldAttr){
	if(oldAttr){
		list[_findNodeIndex(list,oldAttr)] = newAttr;
	}else{
		list[list.length++] = newAttr;
	}
	if(el){
		newAttr.ownerElement = el;
		var doc = el.ownerDocument;
		if(doc){
			oldAttr && _onRemoveAttribute(doc,el,oldAttr);
			_onAddAttribute(doc,el,newAttr);
		}
	}
}
function _removeNamedNode(el,list,attr){
	//console.log('remove attr:'+attr)
	var i = _findNodeIndex(list,attr);
	if(i>=0){
		var lastIndex = list.length-1
		while(i<lastIndex){
			list[i] = list[++i]
		}
		list.length = lastIndex;
		if(el){
			var doc = el.ownerDocument;
			if(doc){
				_onRemoveAttribute(doc,el,attr);
				attr.ownerElement = null;
			}
		}
	}else{
		throw DOMException(NOT_FOUND_ERR,new Error(el.tagName+'@'+attr))
	}
}
NamedNodeMap.prototype = {
	length:0,
	item:NodeList.prototype.item,
	getNamedItem: function(key) {
//		if(key.indexOf(':')>0 || key == 'xmlns'){
//			return null;
//		}
		//console.log()
		var i = this.length;
		while(i--){
			var attr = this[i];
			//console.log(attr.nodeName,key)
			if(attr.nodeName == key){
				return attr;
			}
		}
	},
	setNamedItem: function(attr) {
		var el = attr.ownerElement;
		if(el && el!=this._ownerElement){
			throw new DOMException(INUSE_ATTRIBUTE_ERR);
		}
		var oldAttr = this.getNamedItem(attr.nodeName);
		_addNamedNode(this._ownerElement,this,attr,oldAttr);
		return oldAttr;
	},
	/* returns Node */
	setNamedItemNS: function(attr) {// raises: WRONG_DOCUMENT_ERR,NO_MODIFICATION_ALLOWED_ERR,INUSE_ATTRIBUTE_ERR
		var el = attr.ownerElement, oldAttr;
		if(el && el!=this._ownerElement){
			throw new DOMException(INUSE_ATTRIBUTE_ERR);
		}
		oldAttr = this.getNamedItemNS(attr.namespaceURI,attr.localName);
		_addNamedNode(this._ownerElement,this,attr,oldAttr);
		return oldAttr;
	},

	/* returns Node */
	removeNamedItem: function(key) {
		var attr = this.getNamedItem(key);
		_removeNamedNode(this._ownerElement,this,attr);
		return attr;
		
		
	},// raises: NOT_FOUND_ERR,NO_MODIFICATION_ALLOWED_ERR
	
	//for level2
	removeNamedItemNS:function(namespaceURI,localName){
		var attr = this.getNamedItemNS(namespaceURI,localName);
		_removeNamedNode(this._ownerElement,this,attr);
		return attr;
	},
	getNamedItemNS: function(namespaceURI, localName) {
		var i = this.length;
		while(i--){
			var node = this[i];
			if(node.localName == localName && node.namespaceURI == namespaceURI){
				return node;
			}
		}
		return null;
	}
};
/**
 * @see http://www.w3.org/TR/REC-DOM-Level-1/level-one-core.html#ID-102161490
 */
function DOMImplementation(/* Object */ features) {
	this._features = {};
	if (features) {
		for (var feature in features) {
			 this._features = features[feature];
		}
	}
};

DOMImplementation.prototype = {
	hasFeature: function(/* string */ feature, /* string */ version) {
		var versions = this._features[feature.toLowerCase()];
		if (versions && (!version || version in versions)) {
			return true;
		} else {
			return false;
		}
	},
	// Introduced in DOM Level 2:
	createDocument:function(namespaceURI,  qualifiedName, doctype){// raises:INVALID_CHARACTER_ERR,NAMESPACE_ERR,WRONG_DOCUMENT_ERR
		var doc = new Document();
		doc.implementation = this;
		doc.childNodes = new NodeList();
		doc.doctype = doctype;
		if(doctype){
			doc.appendChild(doctype);
		}
		if(qualifiedName){
			var root = doc.createElementNS(namespaceURI,qualifiedName);
			doc.appendChild(root);
		}
		return doc;
	},
	// Introduced in DOM Level 2:
	createDocumentType:function(qualifiedName, publicId, systemId){// raises:INVALID_CHARACTER_ERR,NAMESPACE_ERR
		var node = new DocumentType();
		node.name = qualifiedName;
		node.nodeName = qualifiedName;
		node.publicId = publicId;
		node.systemId = systemId;
		// Introduced in DOM Level 2:
		//readonly attribute DOMString        internalSubset;
		
		//TODO:..
		//  readonly attribute NamedNodeMap     entities;
		//  readonly attribute NamedNodeMap     notations;
		return node;
	}
};


/**
 * @see http://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/core.html#ID-1950641247
 */

function Node() {
};

Node.prototype = {
	firstChild : null,
	lastChild : null,
	previousSibling : null,
	nextSibling : null,
	attributes : null,
	parentNode : null,
	childNodes : null,
	ownerDocument : null,
	nodeValue : null,
	namespaceURI : null,
	prefix : null,
	localName : null,
	// Modified in DOM Level 2:
	insertBefore:function(newChild, refChild){//raises 
		return _insertBefore(this,newChild,refChild);
	},
	replaceChild:function(newChild, oldChild){//raises 
		this.insertBefore(newChild,oldChild);
		if(oldChild){
			this.removeChild(oldChild);
		}
	},
	removeChild:function(oldChild){
		return _removeChild(this,oldChild);
	},
	appendChild:function(newChild){
		return this.insertBefore(newChild,null);
	},
	hasChildNodes:function(){
		return this.firstChild != null;
	},
	cloneNode:function(deep){
		return cloneNode(this.ownerDocument||this,this,deep);
	},
	// Modified in DOM Level 2:
	normalize:function(){
		var child = this.firstChild;
		while(child){
			var next = child.nextSibling;
			if(next && next.nodeType == TEXT_NODE && child.nodeType == TEXT_NODE){
				this.removeChild(next);
				child.appendData(next.data);
			}else{
				child.normalize();
				child = next;
			}
		}
	},
  	// Introduced in DOM Level 2:
	isSupported:function(feature, version){
		return this.ownerDocument.implementation.hasFeature(feature,version);
	},
    // Introduced in DOM Level 2:
    hasAttributes:function(){
    	return this.attributes.length>0;
    },
    lookupPrefix:function(namespaceURI){
    	var el = this;
    	while(el){
    		var map = el._nsMap;
    		//console.dir(map)
    		if(map){
    			for(var n in map){
    				if(map[n] == namespaceURI){
    					return n;
    				}
    			}
    		}
    		el = el.nodeType == ATTRIBUTE_NODE?el.ownerDocument : el.parentNode;
    	}
    	return null;
    },
    // Introduced in DOM Level 3:
    lookupNamespaceURI:function(prefix){
    	var el = this;
    	while(el){
    		var map = el._nsMap;
    		//console.dir(map)
    		if(map){
    			if(prefix in map){
    				return map[prefix] ;
    			}
    		}
    		el = el.nodeType == ATTRIBUTE_NODE?el.ownerDocument : el.parentNode;
    	}
    	return null;
    },
    // Introduced in DOM Level 3:
    isDefaultNamespace:function(namespaceURI){
    	var prefix = this.lookupPrefix(namespaceURI);
    	return prefix == null;
    }
};


function _xmlEncoder(c){
	return c == '<' && '&lt;' ||
         c == '>' && '&gt;' ||
         c == '&' && '&amp;' ||
         c == '"' && '&quot;' ||
         '&#'+c.charCodeAt()+';'
}


copy(NodeType,Node);
copy(NodeType,Node.prototype);

/**
 * @param callback return true for continue,false for break
 * @return boolean true: break visit;
 */
function _visitNode(node,callback){
	if(callback(node)){
		return true;
	}
	if(node = node.firstChild){
		do{
			if(_visitNode(node,callback)){return true}
        }while(node=node.nextSibling)
    }
}



function Document(){
}

function _onAddAttribute(doc,el,newAttr){
	doc && doc._inc++;
	var ns = newAttr.namespaceURI ;
	if(ns == 'http://www.w3.org/2000/xmlns/'){
		//update namespace
		el._nsMap[newAttr.prefix?newAttr.localName:''] = newAttr.value
	}
}
function _onRemoveAttribute(doc,el,newAttr,remove){
	doc && doc._inc++;
	var ns = newAttr.namespaceURI ;
	if(ns == 'http://www.w3.org/2000/xmlns/'){
		//update namespace
		delete el._nsMap[newAttr.prefix?newAttr.localName:'']
	}
}
function _onUpdateChild(doc,el,newChild){
	if(doc && doc._inc){
		doc._inc++;
		//update childNodes
		var cs = el.childNodes;
		if(newChild){
			cs[cs.length++] = newChild;
		}else{
			//console.log(1)
			var child = el.firstChild;
			var i = 0;
			while(child){
				cs[i++] = child;
				child =child.nextSibling;
			}
			cs.length = i;
		}
	}
}

/**
 * attributes;
 * children;
 * 
 * writeable properties:
 * nodeValue,Attr:value,CharacterData:data
 * prefix
 */
function _removeChild(parentNode,child){
	var previous = child.previousSibling;
	var next = child.nextSibling;
	if(previous){
		previous.nextSibling = next;
	}else{
		parentNode.firstChild = next
	}
	if(next){
		next.previousSibling = previous;
	}else{
		parentNode.lastChild = previous;
	}
	_onUpdateChild(parentNode.ownerDocument,parentNode);
	return child;
}
/**
 * preformance key(refChild == null)
 */
function _insertBefore(parentNode,newChild,nextChild){
	var cp = newChild.parentNode;
	if(cp){
		cp.removeChild(newChild);//remove and update
	}
	if(newChild.nodeType === DOCUMENT_FRAGMENT_NODE){
		var newFirst = newChild.firstChild;
		if (newFirst == null) {
			return newChild;
		}
		var newLast = newChild.lastChild;
	}else{
		newFirst = newLast = newChild;
	}
	var pre = nextChild ? nextChild.previousSibling : parentNode.lastChild;

	newFirst.previousSibling = pre;
	newLast.nextSibling = nextChild;
	
	
	if(pre){
		pre.nextSibling = newFirst;
	}else{
		parentNode.firstChild = newFirst;
	}
	if(nextChild == null){
		parentNode.lastChild = newLast;
	}else{
		nextChild.previousSibling = newLast;
	}
	do{
		newFirst.parentNode = parentNode;
	}while(newFirst !== newLast && (newFirst= newFirst.nextSibling))
	_onUpdateChild(parentNode.ownerDocument||parentNode,parentNode);
	//console.log(parentNode.lastChild.nextSibling == null)
	if (newChild.nodeType == DOCUMENT_FRAGMENT_NODE) {
		newChild.firstChild = newChild.lastChild = null;
	}
	return newChild;
}
function _appendSingleChild(parentNode,newChild){
	var cp = newChild.parentNode;
	if(cp){
		var pre = parentNode.lastChild;
		cp.removeChild(newChild);//remove and update
		var pre = parentNode.lastChild;
	}
	var pre = parentNode.lastChild;
	newChild.parentNode = parentNode;
	newChild.previousSibling = pre;
	newChild.nextSibling = null;
	if(pre){
		pre.nextSibling = newChild;
	}else{
		parentNode.firstChild = newChild;
	}
	parentNode.lastChild = newChild;
	_onUpdateChild(parentNode.ownerDocument,parentNode,newChild);
	return newChild;
	//console.log("__aa",parentNode.lastChild.nextSibling == null)
}
Document.prototype = {
	//implementation : null,
	nodeName :  '#document',
	nodeType :  DOCUMENT_NODE,
	doctype :  null,
	documentElement :  null,
	_inc : 1,
	
	insertBefore :  function(newChild, refChild){//raises 
		if(newChild.nodeType == DOCUMENT_FRAGMENT_NODE){
			var child = newChild.firstChild;
			while(child){
				var next = child.nextSibling;
				this.insertBefore(child,refChild);
				child = next;
			}
			return newChild;
		}
		if(this.documentElement == null && newChild.nodeType == ELEMENT_NODE){
			this.documentElement = newChild;
		}
		
		return _insertBefore(this,newChild,refChild),(newChild.ownerDocument = this),newChild;
	},
	removeChild :  function(oldChild){
		if(this.documentElement == oldChild){
			this.documentElement = null;
		}
		return _removeChild(this,oldChild);
	},
	// Introduced in DOM Level 2:
	importNode : function(importedNode,deep){
		return importNode(this,importedNode,deep);
	},
	// Introduced in DOM Level 2:
	getElementById :	function(id){
		var rtv = null;
		_visitNode(this.documentElement,function(node){
			if(node.nodeType == ELEMENT_NODE){
				if(node.getAttribute('id') == id){
					rtv = node;
					return true;
				}
			}
		})
		return rtv;
	},
	
	//document factory method:
	createElement :	function(tagName){
		var node = new Element();
		node.ownerDocument = this;
		node.nodeName = tagName;
		node.tagName = tagName;
		node.childNodes = new NodeList();
		var attrs	= node.attributes = new NamedNodeMap();
		attrs._ownerElement = node;
		return node;
	},
	createDocumentFragment :	function(){
		var node = new DocumentFragment();
		node.ownerDocument = this;
		node.childNodes = new NodeList();
		return node;
	},
	createTextNode :	function(data){
		var node = new Text();
		node.ownerDocument = this;
		node.appendData(data)
		return node;
	},
	createComment :	function(data){
		var node = new Comment();
		node.ownerDocument = this;
		node.appendData(data)
		return node;
	},
	createCDATASection :	function(data){
		var node = new CDATASection();
		node.ownerDocument = this;
		node.appendData(data)
		return node;
	},
	createProcessingInstruction :	function(target,data){
		var node = new ProcessingInstruction();
		node.ownerDocument = this;
		node.tagName = node.target = target;
		node.nodeValue= node.data = data;
		return node;
	},
	createAttribute :	function(name){
		var node = new Attr();
		node.ownerDocument	= this;
		node.name = name;
		node.nodeName	= name;
		node.localName = name;
		node.specified = true;
		return node;
	},
	createEntityReference :	function(name){
		var node = new EntityReference();
		node.ownerDocument	= this;
		node.nodeName	= name;
		return node;
	},
	// Introduced in DOM Level 2:
	createElementNS :	function(namespaceURI,qualifiedName){
		var node = new Element();
		var pl = qualifiedName.split(':');
		var attrs	= node.attributes = new NamedNodeMap();
		node.childNodes = new NodeList();
		node.ownerDocument = this;
		node.nodeName = qualifiedName;
		node.tagName = qualifiedName;
		node.namespaceURI = namespaceURI;
		if(pl.length == 2){
			node.prefix = pl[0];
			node.localName = pl[1];
		}else{
			//el.prefix = null;
			node.localName = qualifiedName;
		}
		attrs._ownerElement = node;
		return node;
	},
	// Introduced in DOM Level 2:
	createAttributeNS :	function(namespaceURI,qualifiedName){
		var node = new Attr();
		var pl = qualifiedName.split(':');
		node.ownerDocument = this;
		node.nodeName = qualifiedName;
		node.name = qualifiedName;
		node.namespaceURI = namespaceURI;
		node.specified = true;
		if(pl.length == 2){
			node.prefix = pl[0];
			node.localName = pl[1];
		}else{
			//el.prefix = null;
			node.localName = qualifiedName;
		}
		return node;
	},
	
	// +++ cronvel
	// Add querySelector and querySelectorAll
	querySelector: function( selectors ) {
		return this.nwmatcher.first( selectors , this ) ;
	},
	querySelectorAll: function( selectors ) {
		return this.nwmatcher.select( selectors , this ) ;
	}
	// --- cronvel
};

// +++ cronvel
const nwmatcher = require( 'nwmatcher' ) ;

Object.defineProperty( Document.prototype , 'nwmatcher' , {
	//enumerable: true ,
	configurable: true ,
	get: function() {
		//console.log( 'getter called' ) ;
		
		// nwmatcher works in browser, this little hack make it work inside node.js
		var matcher ;
		var ctx = {} ;
		ctx.document = this ;
		ctx.document.addEventListener = function() {} ;
		
		try {
			matcher = nwmatcher( ctx ) ;
		}
		catch ( error ) {
			return null ;
		}
		
		Object.defineProperty( this , 'nwmatcher' , {
			value: matcher
		} ) ;
		
		return matcher ;
	}
} ) ;
// --- cronvel

_extends(Document,Node);


function Element() {
	this._nsMap = {};
	
	// +++ cronvel
	this.classList = new ClassList( this ) ;
	this.style = new Proxy( this , StyleHandler ) ;
	// --- cronvel
};
Element.prototype = {
	nodeType : ELEMENT_NODE,
	hasAttribute : function(name){
		return this.getAttributeNode(name)!=null;
	},
	getAttribute : function(name){
		var attr = this.getAttributeNode(name);
		return attr && attr.value || '';
	},
	getAttributeNode : function(name){
		return this.attributes.getNamedItem(name);
	},
	setAttribute : function(name, value){
		var attr = this.ownerDocument.createAttribute(name);
		attr.value = attr.nodeValue = "" + value;
		this.setAttributeNode(attr)
	},
	removeAttribute : function(name){
		var attr = this.getAttributeNode(name)
		attr && this.removeAttributeNode(attr);
	},
	
	//four real opeartion method
	appendChild:function(newChild){
		if(newChild.nodeType === DOCUMENT_FRAGMENT_NODE){
			return this.insertBefore(newChild,null);
		}else{
			return _appendSingleChild(this,newChild);
		}
	},
	setAttributeNode : function(newAttr){
		return this.attributes.setNamedItem(newAttr);
	},
	setAttributeNodeNS : function(newAttr){
		return this.attributes.setNamedItemNS(newAttr);
	},
	removeAttributeNode : function(oldAttr){
		//console.log(this == oldAttr.ownerElement)
		return this.attributes.removeNamedItem(oldAttr.nodeName);
	},
	//get real attribute name,and remove it by removeAttributeNode
	removeAttributeNS : function(namespaceURI, localName){
		var old = this.getAttributeNodeNS(namespaceURI, localName);
		old && this.removeAttributeNode(old);
	},
	
	hasAttributeNS : function(namespaceURI, localName){
		return this.getAttributeNodeNS(namespaceURI, localName)!=null;
	},
	getAttributeNS : function(namespaceURI, localName){
		var attr = this.getAttributeNodeNS(namespaceURI, localName);
		return attr && attr.value || '';
	},
	setAttributeNS : function(namespaceURI, qualifiedName, value){
		var attr = this.ownerDocument.createAttributeNS(namespaceURI, qualifiedName);
		attr.value = attr.nodeValue = "" + value;
		this.setAttributeNode(attr)
	},
	getAttributeNodeNS : function(namespaceURI, localName){
		return this.attributes.getNamedItemNS(namespaceURI, localName);
	},
	
	getElementsByTagName : function(tagName){
		return new LiveNodeList(this,function(base){
			var ls = [];
			_visitNode(base,function(node){
				if(node !== base && node.nodeType == ELEMENT_NODE && (tagName === '*' || node.tagName == tagName)){
					ls.push(node);
				}
			});
			return ls;
		});
	},
	getElementsByTagNameNS : function(namespaceURI, localName){
		return new LiveNodeList(this,function(base){
			var ls = [];
			_visitNode(base,function(node){
				if(node !== base && node.nodeType === ELEMENT_NODE && (namespaceURI === '*' || node.namespaceURI === namespaceURI) && (localName === '*' || node.localName == localName)){
					ls.push(node);
				}
			});
			return ls;
			
		});
	},
	
	// +++ cronvel
	// Add querySelector and querySelectorAll
	querySelector: function( selectors ) {
		return this.ownerDocument.nwmatcher.first( selectors , this ) ;
	},
	querySelectorAll: function( selectors ) {
		return this.ownerDocument.nwmatcher.select( selectors , this ) ;
	}
	// --- cronvel
};
Document.prototype.getElementsByTagName = Element.prototype.getElementsByTagName;
Document.prototype.getElementsByTagNameNS = Element.prototype.getElementsByTagNameNS;


_extends(Element,Node);


// +++ cronvel
// Rough hack to support .classList.add() and .classList.remove()
function ClassList( element ) {
	this.__element = element ;
};
ClassList.prototype = {
	add: function( className ) {
		var classes = this.__element.getAttribute( 'class' ).trim() ;
		
		if ( classes ) {
			classes = classes.split( / +/ ) ;
			if ( classes.indexOf( className ) === -1 ) {
				classes.push( className ) ;
				this.__element.setAttribute( 'class' , classes.join( ' ' ) ) ;
			}
		}
		else {
			this.__element.setAttribute( 'class' , className ) ;
		}
	} ,
	remove: function( className ) {
		var indexOf ,
			classes = this.__element.getAttribute( 'class' ).trim() ;
		
		if ( classes ) {
			classes = classes.split( / +/ ) ;
			indexOf = classes.indexOf( className ) ;
			
			if ( indexOf !== -1 ) {
				classes.splice( indexOf , 1 ) ;
				this.__element.setAttribute( 'class' , classes.join( ' ' ) ) ;
			}
		}
	}
} ;
// --- cronvel


// +++ cronvel
// Rough hack to support .style access
const StyleHandler = {
	get: function( target , property ) {
		var styles = target.getAttribute( 'style' ).trim() ;
		if ( ! styles ) { return ; }
		
		property = stringKit.camelCaseToDashed( property ) ;
		
		var match = styles.match( new RegExp( '(?:^|;) *' + property + ' *: *([^;]+?) *(?:;|$)' ) ) ;
		
		if ( match ) {
			return match[ 1 ] ;
		}
		else {
			return undefined ;
		}
	} ,
	set: function( target , property , value , receiver ) {
		var styles = target.getAttribute( 'style' ).trim() ;
		
		property = stringKit.camelCaseToDashed( property ) ;
		
		if ( ! styles ) {
			if ( value ) { target.setAttribute( 'style' , property + ':' + value ) ; }
			return true ;
		}
		
		var found = false ;
		
		styles = styles.replace(
			//new RegExp( '(^|;) *' + string.escape.regExp( property ) + ' *: *([^;]+?) *(;|$)' ) ,
			new RegExp( '(^|;) *' + property + ' *: *([^;]+?) *(;|$)' ) ,
			( full , pre , val , post ) => {
				found = true ;
				if ( value ) { return pre + property + ':' + value + post ; }
				else { return pre ; }
			}
		) ;
		
		if ( found ) {
			target.setAttribute( 'style' , styles.trim() ) ;
		}
		else if ( value ) {
			target.setAttribute( 'style' , styles + ';' + property + ':' + value ) ;
		}
		
		return true ;
	}
} ;
// --- cronvel


function Attr() {
};
Attr.prototype.nodeType = ATTRIBUTE_NODE;
_extends(Attr,Node);


function CharacterData() {
};
CharacterData.prototype = {
	data : '',
	substringData : function(offset, count) {
		return this.data.substring(offset, offset+count);
	},
	appendData: function(text) {
		text = this.data+text;
		this.nodeValue = this.data = text;
		this.length = text.length;
	},
	insertData: function(offset,text) {
		this.replaceData(offset,0,text);
	
	},
	appendChild:function(newChild){
		throw new Error(ExceptionMessage[HIERARCHY_REQUEST_ERR])
	},
	deleteData: function(offset, count) {
		this.replaceData(offset,count,"");
	},
	replaceData: function(offset, count, text) {
		var start = this.data.substring(0,offset);
		var end = this.data.substring(offset+count);
		text = start + text + end;
		this.nodeValue = this.data = text;
		this.length = text.length;
	}
}
_extends(CharacterData,Node);
function Text() {
};
Text.prototype = {
	nodeName : "#text",
	nodeType : TEXT_NODE,
	splitText : function(offset) {
		var text = this.data;
		var newText = text.substring(offset);
		text = text.substring(0, offset);
		this.data = this.nodeValue = text;
		this.length = text.length;
		var newNode = this.ownerDocument.createTextNode(newText);
		if(this.parentNode){
			this.parentNode.insertBefore(newNode, this.nextSibling);
		}
		return newNode;
	}
}
_extends(Text,CharacterData);
function Comment() {
};
Comment.prototype = {
	nodeName : "#comment",
	nodeType : COMMENT_NODE
}
_extends(Comment,CharacterData);

function CDATASection() {
};
CDATASection.prototype = {
	nodeName : "#cdata-section",
	nodeType : CDATA_SECTION_NODE
}
_extends(CDATASection,CharacterData);


function DocumentType() {
};
DocumentType.prototype.nodeType = DOCUMENT_TYPE_NODE;
_extends(DocumentType,Node);

function Notation() {
};
Notation.prototype.nodeType = NOTATION_NODE;
_extends(Notation,Node);

function Entity() {
};
Entity.prototype.nodeType = ENTITY_NODE;
_extends(Entity,Node);

function EntityReference() {
};
EntityReference.prototype.nodeType = ENTITY_REFERENCE_NODE;
_extends(EntityReference,Node);

function DocumentFragment() {
};
DocumentFragment.prototype.nodeName =	"#document-fragment";
DocumentFragment.prototype.nodeType =	DOCUMENT_FRAGMENT_NODE;
_extends(DocumentFragment,Node);


function ProcessingInstruction() {
}
ProcessingInstruction.prototype.nodeType = PROCESSING_INSTRUCTION_NODE;
_extends(ProcessingInstruction,Node);
function XMLSerializer(){}
XMLSerializer.prototype.serializeToString = function(node,isHtml,nodeFilter){
	return nodeSerializeToString.call(node,isHtml,nodeFilter);
}
Node.prototype.toString = nodeSerializeToString;
function nodeSerializeToString(isHtml,nodeFilter){
	var buf = [];
	var refNode = this.nodeType == 9 && this.documentElement || this;
	var prefix = refNode.prefix;
	var uri = refNode.namespaceURI;
	
	if(uri && prefix == null){
		//console.log(prefix)
		var prefix = refNode.lookupPrefix(uri);
		if(prefix == null){
			//isHTML = true;
			var visibleNamespaces=[
			{namespace:uri,prefix:null}
			//{namespace:uri,prefix:''}
			]
		}
	}
	serializeToString(this,buf,isHtml,nodeFilter,visibleNamespaces);
	//console.log('###',this.nodeType,uri,prefix,buf.join(''))
	return buf.join('');
}
function needNamespaceDefine(node,isHTML, visibleNamespaces) {
	var prefix = node.prefix||'';
	var uri = node.namespaceURI;
	if (!prefix && !uri){
		return false;
	}
	if (prefix === "xml" && uri === "http://www.w3.org/XML/1998/namespace" 
		|| uri == 'http://www.w3.org/2000/xmlns/'){
		return false;
	}
	
	var i = visibleNamespaces.length 
	//console.log('@@@@',node.tagName,prefix,uri,visibleNamespaces)
	while (i--) {
		var ns = visibleNamespaces[i];
		// get namespace prefix
		//console.log(node.nodeType,node.tagName,ns.prefix,prefix)
		if (ns.prefix == prefix){
			return ns.namespace != uri;
		}
	}
	//console.log(isHTML,uri,prefix=='')
	//if(isHTML && prefix ==null && uri == 'http://www.w3.org/1999/xhtml'){
	//	return false;
	//}
	//node.flag = '11111'
	//console.error(3,true,node.flag,node.prefix,node.namespaceURI)
	return true;
}
function serializeToString(node,buf,isHTML,nodeFilter,visibleNamespaces){
	if(nodeFilter){
		node = nodeFilter(node);
		if(node){
			if(typeof node == 'string'){
				buf.push(node);
				return;
			}
		}else{
			return;
		}
		//buf.sort.apply(attrs, attributeSorter);
	}
	switch(node.nodeType){
	case ELEMENT_NODE:
		if (!visibleNamespaces) visibleNamespaces = [];
		var startVisibleNamespaces = visibleNamespaces.length;
		var attrs = node.attributes;
		var len = attrs.length;
		var child = node.firstChild;
		var nodeName = node.tagName;
		
		isHTML =  (htmlns === node.namespaceURI) ||isHTML 
		buf.push('<',nodeName);
		
		
		
		for(var i=0;i<len;i++){
			// add namespaces for attributes
			var attr = attrs.item(i);
			if (attr.prefix == 'xmlns') {
				visibleNamespaces.push({ prefix: attr.localName, namespace: attr.value });
			}else if(attr.nodeName == 'xmlns'){
				visibleNamespaces.push({ prefix: '', namespace: attr.value });
			}
		}
		for(var i=0;i<len;i++){
			var attr = attrs.item(i);
			if (needNamespaceDefine(attr,isHTML, visibleNamespaces)) {
				var prefix = attr.prefix||'';
				var uri = attr.namespaceURI;
				var ns = prefix ? ' xmlns:' + prefix : " xmlns";
				buf.push(ns, '="' , uri , '"');
				visibleNamespaces.push({ prefix: prefix, namespace:uri });
			}
			serializeToString(attr,buf,isHTML,nodeFilter,visibleNamespaces);
		}
		// add namespace for current node		
		if (needNamespaceDefine(node,isHTML, visibleNamespaces)) {
			var prefix = node.prefix||'';
			var uri = node.namespaceURI;
			var ns = prefix ? ' xmlns:' + prefix : " xmlns";
			buf.push(ns, '="' , uri , '"');
			visibleNamespaces.push({ prefix: prefix, namespace:uri });
		}
		
		if(child || isHTML && !/^(?:meta|link|img|br|hr|input)$/i.test(nodeName)){
			buf.push('>');
			//if is cdata child node
			if(isHTML && /^script$/i.test(nodeName)){
				while(child){
					if(child.data){
						buf.push(child.data);
					}else{
						serializeToString(child,buf,isHTML,nodeFilter,visibleNamespaces);
					}
					child = child.nextSibling;
				}
			}else
			{
				while(child){
					serializeToString(child,buf,isHTML,nodeFilter,visibleNamespaces);
					child = child.nextSibling;
				}
			}
			buf.push('</',nodeName,'>');
		}else{
			buf.push('/>');
		}
		// remove added visible namespaces
		//visibleNamespaces.length = startVisibleNamespaces;
		return;
	case DOCUMENT_NODE:
	case DOCUMENT_FRAGMENT_NODE:
		var child = node.firstChild;
		while(child){
			serializeToString(child,buf,isHTML,nodeFilter,visibleNamespaces);
			child = child.nextSibling;
		}
		return;
	case ATTRIBUTE_NODE:
		return buf.push(' ',node.name,'="',node.value.replace(/[<&"]/g,_xmlEncoder),'"');
	case TEXT_NODE:
		return buf.push(node.data.replace(/[<&]/g,_xmlEncoder));
	case CDATA_SECTION_NODE:
		return buf.push( '<![CDATA[',node.data,']]>');
	case COMMENT_NODE:
		return buf.push( "<!--",node.data,"-->");
	case DOCUMENT_TYPE_NODE:
		var pubid = node.publicId;
		var sysid = node.systemId;
		buf.push('<!DOCTYPE ',node.name);
		if(pubid){
			buf.push(' PUBLIC "',pubid);
			if (sysid && sysid!='.') {
				buf.push( '" "',sysid);
			}
			buf.push('">');
		}else if(sysid && sysid!='.'){
			buf.push(' SYSTEM "',sysid,'">');
		}else{
			var sub = node.internalSubset;
			if(sub){
				buf.push(" [",sub,"]");
			}
			buf.push(">");
		}
		return;
	case PROCESSING_INSTRUCTION_NODE:
		return buf.push( "<?",node.target," ",node.data,"?>");
	case ENTITY_REFERENCE_NODE:
		return buf.push( '&',node.nodeName,';');
	//case ENTITY_NODE:
	//case NOTATION_NODE:
	default:
		buf.push('??',node.nodeName);
	}
}
function importNode(doc,node,deep){
	var node2;
	switch (node.nodeType) {
	case ELEMENT_NODE:
		node2 = node.cloneNode(false);
		node2.ownerDocument = doc;
		//var attrs = node2.attributes;
		//var len = attrs.length;
		//for(var i=0;i<len;i++){
			//node2.setAttributeNodeNS(importNode(doc,attrs.item(i),deep));
		//}
	case DOCUMENT_FRAGMENT_NODE:
		break;
	case ATTRIBUTE_NODE:
		deep = true;
		break;
	//case ENTITY_REFERENCE_NODE:
	//case PROCESSING_INSTRUCTION_NODE:
	////case TEXT_NODE:
	//case CDATA_SECTION_NODE:
	//case COMMENT_NODE:
	//	deep = false;
	//	break;
	//case DOCUMENT_NODE:
	//case DOCUMENT_TYPE_NODE:
	//cannot be imported.
	//case ENTITY_NODE:
	//case NOTATION_NODE：
	//can not hit in level3
	//default:throw e;
	}
	if(!node2){
		node2 = node.cloneNode(false);//false
	}
	node2.ownerDocument = doc;
	node2.parentNode = null;
	if(deep){
		var child = node.firstChild;
		while(child){
			node2.appendChild(importNode(doc,child,deep));
			child = child.nextSibling;
		}
	}
	return node2;
}
//
//var _relationMap = {firstChild:1,lastChild:1,previousSibling:1,nextSibling:1,
//					attributes:1,childNodes:1,parentNode:1,documentElement:1,doctype,};
function cloneNode(doc,node,deep){
	var node2 = new node.constructor();
	for(var n in node){
		var v = node[n];
		if(typeof v != 'object' ){
			if(v != node2[n]){
				node2[n] = v;
			}
		}
	}
	if(node.childNodes){
		node2.childNodes = new NodeList();
	}
	node2.ownerDocument = doc;
	switch (node2.nodeType) {
	case ELEMENT_NODE:
		var attrs	= node.attributes;
		var attrs2	= node2.attributes = new NamedNodeMap();
		var len = attrs.length
		attrs2._ownerElement = node2;
		for(var i=0;i<len;i++){
			node2.setAttributeNode(cloneNode(doc,attrs.item(i),true));
		}
		break;;
	case ATTRIBUTE_NODE:
		deep = true;
	}
	if(deep){
		var child = node.firstChild;
		while(child){
			node2.appendChild(cloneNode(doc,child,deep));
			child = child.nextSibling;
		}
	}
	return node2;
}

function __set__(object,key,value){
	object[key] = value
}
//do dynamic
try{
	if(Object.defineProperty){
		Object.defineProperty(LiveNodeList.prototype,'length',{
			get:function(){
				_updateLiveList(this);
				return this.$$length;
			}
		});
		Object.defineProperty(Node.prototype,'textContent',{
			get:function(){
				return getTextContent(this);
			},
			set:function(data){
				switch(this.nodeType){
				case ELEMENT_NODE:
				case DOCUMENT_FRAGMENT_NODE:
					while(this.firstChild){
						this.removeChild(this.firstChild);
					}
					if(data || String(data)){
						this.appendChild(this.ownerDocument.createTextNode(data));
					}
					break;
				default:
					//TODO:
					this.data = data;
					this.value = data;
					this.nodeValue = data;
				}
			}
		})
		
		function getTextContent(node){
			switch(node.nodeType){
			case ELEMENT_NODE:
			case DOCUMENT_FRAGMENT_NODE:
				var buf = [];
				node = node.firstChild;
				while(node){
					if(node.nodeType!==7 && node.nodeType !==8){
						buf.push(getTextContent(node));
					}
					node = node.nextSibling;
				}
				return buf.join('');
			default:
				return node.nodeValue;
			}
		}
		__set__ = function(object,key,value){
			//console.log(value)
			object['$$'+key] = value
		}
	}
}catch(e){//ie8
}

//if(typeof require == 'function'){
	exports.DOMImplementation = DOMImplementation;
	exports.XMLSerializer = XMLSerializer;
//}

},{"nwmatcher":24,"string-kit":38}],21:[function(require,module,exports){
exports.entityMap = {
       lt: '<',
       gt: '>',
       amp: '&',
       quot: '"',
       apos: "'",
       Agrave: "À",
       Aacute: "Á",
       Acirc: "Â",
       Atilde: "Ã",
       Auml: "Ä",
       Aring: "Å",
       AElig: "Æ",
       Ccedil: "Ç",
       Egrave: "È",
       Eacute: "É",
       Ecirc: "Ê",
       Euml: "Ë",
       Igrave: "Ì",
       Iacute: "Í",
       Icirc: "Î",
       Iuml: "Ï",
       ETH: "Ð",
       Ntilde: "Ñ",
       Ograve: "Ò",
       Oacute: "Ó",
       Ocirc: "Ô",
       Otilde: "Õ",
       Ouml: "Ö",
       Oslash: "Ø",
       Ugrave: "Ù",
       Uacute: "Ú",
       Ucirc: "Û",
       Uuml: "Ü",
       Yacute: "Ý",
       THORN: "Þ",
       szlig: "ß",
       agrave: "à",
       aacute: "á",
       acirc: "â",
       atilde: "ã",
       auml: "ä",
       aring: "å",
       aelig: "æ",
       ccedil: "ç",
       egrave: "è",
       eacute: "é",
       ecirc: "ê",
       euml: "ë",
       igrave: "ì",
       iacute: "í",
       icirc: "î",
       iuml: "ï",
       eth: "ð",
       ntilde: "ñ",
       ograve: "ò",
       oacute: "ó",
       ocirc: "ô",
       otilde: "õ",
       ouml: "ö",
       oslash: "ø",
       ugrave: "ù",
       uacute: "ú",
       ucirc: "û",
       uuml: "ü",
       yacute: "ý",
       thorn: "þ",
       yuml: "ÿ",
       nbsp: " ",
       iexcl: "¡",
       cent: "¢",
       pound: "£",
       curren: "¤",
       yen: "¥",
       brvbar: "¦",
       sect: "§",
       uml: "¨",
       copy: "©",
       ordf: "ª",
       laquo: "«",
       not: "¬",
       shy: "­­",
       reg: "®",
       macr: "¯",
       deg: "°",
       plusmn: "±",
       sup2: "²",
       sup3: "³",
       acute: "´",
       micro: "µ",
       para: "¶",
       middot: "·",
       cedil: "¸",
       sup1: "¹",
       ordm: "º",
       raquo: "»",
       frac14: "¼",
       frac12: "½",
       frac34: "¾",
       iquest: "¿",
       times: "×",
       divide: "÷",
       forall: "∀",
       part: "∂",
       exist: "∃",
       empty: "∅",
       nabla: "∇",
       isin: "∈",
       notin: "∉",
       ni: "∋",
       prod: "∏",
       sum: "∑",
       minus: "−",
       lowast: "∗",
       radic: "√",
       prop: "∝",
       infin: "∞",
       ang: "∠",
       and: "∧",
       or: "∨",
       cap: "∩",
       cup: "∪",
       'int': "∫",
       there4: "∴",
       sim: "∼",
       cong: "≅",
       asymp: "≈",
       ne: "≠",
       equiv: "≡",
       le: "≤",
       ge: "≥",
       sub: "⊂",
       sup: "⊃",
       nsub: "⊄",
       sube: "⊆",
       supe: "⊇",
       oplus: "⊕",
       otimes: "⊗",
       perp: "⊥",
       sdot: "⋅",
       Alpha: "Α",
       Beta: "Β",
       Gamma: "Γ",
       Delta: "Δ",
       Epsilon: "Ε",
       Zeta: "Ζ",
       Eta: "Η",
       Theta: "Θ",
       Iota: "Ι",
       Kappa: "Κ",
       Lambda: "Λ",
       Mu: "Μ",
       Nu: "Ν",
       Xi: "Ξ",
       Omicron: "Ο",
       Pi: "Π",
       Rho: "Ρ",
       Sigma: "Σ",
       Tau: "Τ",
       Upsilon: "Υ",
       Phi: "Φ",
       Chi: "Χ",
       Psi: "Ψ",
       Omega: "Ω",
       alpha: "α",
       beta: "β",
       gamma: "γ",
       delta: "δ",
       epsilon: "ε",
       zeta: "ζ",
       eta: "η",
       theta: "θ",
       iota: "ι",
       kappa: "κ",
       lambda: "λ",
       mu: "μ",
       nu: "ν",
       xi: "ξ",
       omicron: "ο",
       pi: "π",
       rho: "ρ",
       sigmaf: "ς",
       sigma: "σ",
       tau: "τ",
       upsilon: "υ",
       phi: "φ",
       chi: "χ",
       psi: "ψ",
       omega: "ω",
       thetasym: "ϑ",
       upsih: "ϒ",
       piv: "ϖ",
       OElig: "Œ",
       oelig: "œ",
       Scaron: "Š",
       scaron: "š",
       Yuml: "Ÿ",
       fnof: "ƒ",
       circ: "ˆ",
       tilde: "˜",
       ensp: " ",
       emsp: " ",
       thinsp: " ",
       zwnj: "‌",
       zwj: "‍",
       lrm: "‎",
       rlm: "‏",
       ndash: "–",
       mdash: "—",
       lsquo: "‘",
       rsquo: "’",
       sbquo: "‚",
       ldquo: "“",
       rdquo: "”",
       bdquo: "„",
       dagger: "†",
       Dagger: "‡",
       bull: "•",
       hellip: "…",
       permil: "‰",
       prime: "′",
       Prime: "″",
       lsaquo: "‹",
       rsaquo: "›",
       oline: "‾",
       euro: "€",
       trade: "™",
       larr: "←",
       uarr: "↑",
       rarr: "→",
       darr: "↓",
       harr: "↔",
       crarr: "↵",
       lceil: "⌈",
       rceil: "⌉",
       lfloor: "⌊",
       rfloor: "⌋",
       loz: "◊",
       spades: "♠",
       clubs: "♣",
       hearts: "♥",
       diams: "♦"
};
//for(var  n in exports.entityMap){console.log(exports.entityMap[n].charCodeAt())}
},{}],22:[function(require,module,exports){
//[4]   	NameStartChar	   ::=   	":" | [A-Z] | "_" | [a-z] | [#xC0-#xD6] | [#xD8-#xF6] | [#xF8-#x2FF] | [#x370-#x37D] | [#x37F-#x1FFF] | [#x200C-#x200D] | [#x2070-#x218F] | [#x2C00-#x2FEF] | [#x3001-#xD7FF] | [#xF900-#xFDCF] | [#xFDF0-#xFFFD] | [#x10000-#xEFFFF]
//[4a]   	NameChar	   ::=   	NameStartChar | "-" | "." | [0-9] | #xB7 | [#x0300-#x036F] | [#x203F-#x2040]
//[5]   	Name	   ::=   	NameStartChar (NameChar)*
var nameStartChar = /[A-Z_a-z\xC0-\xD6\xD8-\xF6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]///\u10000-\uEFFFF
var nameChar = new RegExp("[\\-\\.0-9"+nameStartChar.source.slice(1,-1)+"\\u00B7\\u0300-\\u036F\\u203F-\\u2040]");
var tagNamePattern = new RegExp('^'+nameStartChar.source+nameChar.source+'*(?:\:'+nameStartChar.source+nameChar.source+'*)?$');
//var tagNamePattern = /^[a-zA-Z_][\w\-\.]*(?:\:[a-zA-Z_][\w\-\.]*)?$/
//var handlers = 'resolveEntity,getExternalSubset,characters,endDocument,endElement,endPrefixMapping,ignorableWhitespace,processingInstruction,setDocumentLocator,skippedEntity,startDocument,startElement,startPrefixMapping,notationDecl,unparsedEntityDecl,error,fatalError,warning,attributeDecl,elementDecl,externalEntityDecl,internalEntityDecl,comment,endCDATA,endDTD,endEntity,startCDATA,startDTD,startEntity'.split(',')

//S_TAG,	S_ATTR,	S_EQ,	S_ATTR_NOQUOT_VALUE
//S_ATTR_SPACE,	S_ATTR_END,	S_TAG_SPACE, S_TAG_CLOSE
var S_TAG = 0;//tag name offerring
var S_ATTR = 1;//attr name offerring 
var S_ATTR_SPACE=2;//attr name end and space offer
var S_EQ = 3;//=space?
var S_ATTR_NOQUOT_VALUE = 4;//attr value(no quot value only)
var S_ATTR_END = 5;//attr value end and no space(quot end)
var S_TAG_SPACE = 6;//(attr value end || tag end ) && (space offer)
var S_TAG_CLOSE = 7;//closed el<el />

function XMLReader(){
	
}

XMLReader.prototype = {
	parse:function(source,defaultNSMap,entityMap){
		var domBuilder = this.domBuilder;
		domBuilder.startDocument();
		_copy(defaultNSMap ,defaultNSMap = {})
		parse(source,defaultNSMap,entityMap,
				domBuilder,this.errorHandler);
		domBuilder.endDocument();
	}
}
function parse(source,defaultNSMapCopy,entityMap,domBuilder,errorHandler){
	function fixedFromCharCode(code) {
		// String.prototype.fromCharCode does not supports
		// > 2 bytes unicode chars directly
		if (code > 0xffff) {
			code -= 0x10000;
			var surrogate1 = 0xd800 + (code >> 10)
				, surrogate2 = 0xdc00 + (code & 0x3ff);

			return String.fromCharCode(surrogate1, surrogate2);
		} else {
			return String.fromCharCode(code);
		}
	}
	function entityReplacer(a){
		var k = a.slice(1,-1);
		if(k in entityMap){
			return entityMap[k]; 
		}else if(k.charAt(0) === '#'){
			return fixedFromCharCode(parseInt(k.substr(1).replace('x','0x')))
		}else{
			errorHandler.error('entity not found:'+a);
			return a;
		}
	}
	function appendText(end){//has some bugs
		if(end>start){
			var xt = source.substring(start,end).replace(/&#?\w+;/g,entityReplacer);
			locator&&position(start);
			domBuilder.characters(xt,0,end-start);
			start = end
		}
	}
	function position(p,m){
		while(p>=lineEnd && (m = linePattern.exec(source))){
			lineStart = m.index;
			lineEnd = lineStart + m[0].length;
			locator.lineNumber++;
			//console.log('line++:',locator,startPos,endPos)
		}
		locator.columnNumber = p-lineStart+1;
	}
	var lineStart = 0;
	var lineEnd = 0;
	var linePattern = /.*(?:\r\n?|\n)|.*$/g
	var locator = domBuilder.locator;
	
	var parseStack = [{currentNSMap:defaultNSMapCopy}]
	var closeMap = {};
	var start = 0;
	while(true){
		try{
			var tagStart = source.indexOf('<',start);
			if(tagStart<0){
				if(!source.substr(start).match(/^\s*$/)){
					var doc = domBuilder.doc;
	    			var text = doc.createTextNode(source.substr(start));
	    			doc.appendChild(text);
	    			domBuilder.currentElement = text;
				}
				return;
			}
			if(tagStart>start){
				appendText(tagStart);
			}
			switch(source.charAt(tagStart+1)){
			case '/':
				var end = source.indexOf('>',tagStart+3);
				var tagName = source.substring(tagStart+2,end);
				var config = parseStack.pop();
				if(end<0){
					
	        		tagName = source.substring(tagStart+2).replace(/[\s<].*/,'');
	        		//console.error('#@@@@@@'+tagName)
	        		errorHandler.error("end tag name: "+tagName+' is not complete:'+config.tagName);
	        		end = tagStart+1+tagName.length;
	        	}else if(tagName.match(/\s</)){
	        		tagName = tagName.replace(/[\s<].*/,'');
	        		errorHandler.error("end tag name: "+tagName+' maybe not complete');
	        		end = tagStart+1+tagName.length;
				}
				//console.error(parseStack.length,parseStack)
				//console.error(config);
				var localNSMap = config.localNSMap;
				var endMatch = config.tagName == tagName;
				var endIgnoreCaseMach = endMatch || config.tagName&&config.tagName.toLowerCase() == tagName.toLowerCase()
		        if(endIgnoreCaseMach){
		        	domBuilder.endElement(config.uri,config.localName,tagName);
					if(localNSMap){
						for(var prefix in localNSMap){
							domBuilder.endPrefixMapping(prefix) ;
						}
					}
					if(!endMatch){
		            	errorHandler.fatalError("end tag name: "+tagName+' is not match the current start tagName:'+config.tagName );
					}
		        }else{
		        	parseStack.push(config)
		        }
				
				end++;
				break;
				// end elment
			case '?':// <?...?>
				locator&&position(tagStart);
				end = parseInstruction(source,tagStart,domBuilder);
				break;
			case '!':// <!doctype,<![CDATA,<!--
				locator&&position(tagStart);
				end = parseDCC(source,tagStart,domBuilder,errorHandler);
				break;
			default:
				locator&&position(tagStart);
				var el = new ElementAttributes();
				var currentNSMap = parseStack[parseStack.length-1].currentNSMap;
				//elStartEnd
				var end = parseElementStartPart(source,tagStart,el,currentNSMap,entityReplacer,errorHandler);
				var len = el.length;
				
				
				if(!el.closed && fixSelfClosed(source,end,el.tagName,closeMap)){
					el.closed = true;
					if(!entityMap.nbsp){
						errorHandler.warning('unclosed xml attribute');
					}
				}
				if(locator && len){
					var locator2 = copyLocator(locator,{});
					//try{//attribute position fixed
					for(var i = 0;i<len;i++){
						var a = el[i];
						position(a.offset);
						a.locator = copyLocator(locator,{});
					}
					//}catch(e){console.error('@@@@@'+e)}
					domBuilder.locator = locator2
					if(appendElement(el,domBuilder,currentNSMap)){
						parseStack.push(el)
					}
					domBuilder.locator = locator;
				}else{
					if(appendElement(el,domBuilder,currentNSMap)){
						parseStack.push(el)
					}
				}
				
				
				
				if(el.uri === 'http://www.w3.org/1999/xhtml' && !el.closed){
					end = parseHtmlSpecialContent(source,end,el.tagName,entityReplacer,domBuilder)
				}else{
					end++;
				}
			}
		}catch(e){
			errorHandler.error('element parse error: '+e)
			//errorHandler.error('element parse error: '+e);
			end = -1;
			//throw e;
		}
		if(end>start){
			start = end;
		}else{
			//TODO: 这里有可能sax回退，有位置错误风险
			appendText(Math.max(tagStart,start)+1);
		}
	}
}
function copyLocator(f,t){
	t.lineNumber = f.lineNumber;
	t.columnNumber = f.columnNumber;
	return t;
}

/**
 * @see #appendElement(source,elStartEnd,el,selfClosed,entityReplacer,domBuilder,parseStack);
 * @return end of the elementStartPart(end of elementEndPart for selfClosed el)
 */
function parseElementStartPart(source,start,el,currentNSMap,entityReplacer,errorHandler){
	var attrName;
	var value;
	var p = ++start;
	var s = S_TAG;//status
	while(true){
		var c = source.charAt(p);
		switch(c){
		case '=':
			if(s === S_ATTR){//attrName
				attrName = source.slice(start,p);
				s = S_EQ;
			}else if(s === S_ATTR_SPACE){
				s = S_EQ;
			}else{
				//fatalError: equal must after attrName or space after attrName
				throw new Error('attribute equal must after attrName');
			}
			break;
		case '\'':
		case '"':
			if(s === S_EQ || s === S_ATTR //|| s == S_ATTR_SPACE
				){//equal
				if(s === S_ATTR){
					errorHandler.warning('attribute value must after "="')
					attrName = source.slice(start,p)
				}
				start = p+1;
				p = source.indexOf(c,start)
				if(p>0){
					value = source.slice(start,p).replace(/&#?\w+;/g,entityReplacer);
					el.add(attrName,value,start-1);
					s = S_ATTR_END;
				}else{
					//fatalError: no end quot match
					throw new Error('attribute value no end \''+c+'\' match');
				}
			}else if(s == S_ATTR_NOQUOT_VALUE){
				value = source.slice(start,p).replace(/&#?\w+;/g,entityReplacer);
				//console.log(attrName,value,start,p)
				el.add(attrName,value,start);
				//console.dir(el)
				errorHandler.warning('attribute "'+attrName+'" missed start quot('+c+')!!');
				start = p+1;
				s = S_ATTR_END
			}else{
				//fatalError: no equal before
				throw new Error('attribute value must after "="');
			}
			break;
		case '/':
			switch(s){
			case S_TAG:
				el.setTagName(source.slice(start,p));
			case S_ATTR_END:
			case S_TAG_SPACE:
			case S_TAG_CLOSE:
				s =S_TAG_CLOSE;
				el.closed = true;
			case S_ATTR_NOQUOT_VALUE:
			case S_ATTR:
			case S_ATTR_SPACE:
				break;
			//case S_EQ:
			default:
				throw new Error("attribute invalid close char('/')")
			}
			break;
		case ''://end document
			//throw new Error('unexpected end of input')
			errorHandler.error('unexpected end of input');
			if(s == S_TAG){
				el.setTagName(source.slice(start,p));
			}
			return p;
		case '>':
			switch(s){
			case S_TAG:
				el.setTagName(source.slice(start,p));
			case S_ATTR_END:
			case S_TAG_SPACE:
			case S_TAG_CLOSE:
				break;//normal
			case S_ATTR_NOQUOT_VALUE://Compatible state
			case S_ATTR:
				value = source.slice(start,p);
				if(value.slice(-1) === '/'){
					el.closed  = true;
					value = value.slice(0,-1)
				}
			case S_ATTR_SPACE:
				if(s === S_ATTR_SPACE){
					value = attrName;
				}
				if(s == S_ATTR_NOQUOT_VALUE){
					errorHandler.warning('attribute "'+value+'" missed quot(")!!');
					el.add(attrName,value.replace(/&#?\w+;/g,entityReplacer),start)
				}else{
					if(currentNSMap[''] !== 'http://www.w3.org/1999/xhtml' || !value.match(/^(?:disabled|checked|selected)$/i)){
						errorHandler.warning('attribute "'+value+'" missed value!! "'+value+'" instead!!')
					}
					el.add(value,value,start)
				}
				break;
			case S_EQ:
				throw new Error('attribute value missed!!');
			}
//			console.log(tagName,tagNamePattern,tagNamePattern.test(tagName))
			return p;
		/*xml space '\x20' | #x9 | #xD | #xA; */
		case '\u0080':
			c = ' ';
		default:
			if(c<= ' '){//space
				switch(s){
				case S_TAG:
					el.setTagName(source.slice(start,p));//tagName
					s = S_TAG_SPACE;
					break;
				case S_ATTR:
					attrName = source.slice(start,p)
					s = S_ATTR_SPACE;
					break;
				case S_ATTR_NOQUOT_VALUE:
					var value = source.slice(start,p).replace(/&#?\w+;/g,entityReplacer);
					errorHandler.warning('attribute "'+value+'" missed quot(")!!');
					el.add(attrName,value,start)
				case S_ATTR_END:
					s = S_TAG_SPACE;
					break;
				//case S_TAG_SPACE:
				//case S_EQ:
				//case S_ATTR_SPACE:
				//	void();break;
				//case S_TAG_CLOSE:
					//ignore warning
				}
			}else{//not space
//S_TAG,	S_ATTR,	S_EQ,	S_ATTR_NOQUOT_VALUE
//S_ATTR_SPACE,	S_ATTR_END,	S_TAG_SPACE, S_TAG_CLOSE
				switch(s){
				//case S_TAG:void();break;
				//case S_ATTR:void();break;
				//case S_ATTR_NOQUOT_VALUE:void();break;
				case S_ATTR_SPACE:
					var tagName =  el.tagName;
					if(currentNSMap[''] !== 'http://www.w3.org/1999/xhtml' || !attrName.match(/^(?:disabled|checked|selected)$/i)){
						errorHandler.warning('attribute "'+attrName+'" missed value!! "'+attrName+'" instead2!!')
					}
					el.add(attrName,attrName,start);
					start = p;
					s = S_ATTR;
					break;
				case S_ATTR_END:
					errorHandler.warning('attribute space is required"'+attrName+'"!!')
				case S_TAG_SPACE:
					s = S_ATTR;
					start = p;
					break;
				case S_EQ:
					s = S_ATTR_NOQUOT_VALUE;
					start = p;
					break;
				case S_TAG_CLOSE:
					throw new Error("elements closed character '/' and '>' must be connected to");
				}
			}
		}//end outer switch
		//console.log('p++',p)
		p++;
	}
}
/**
 * @return true if has new namespace define
 */
function appendElement(el,domBuilder,currentNSMap){
	var tagName = el.tagName;
	var localNSMap = null;
	//var currentNSMap = parseStack[parseStack.length-1].currentNSMap;
	var i = el.length;
	while(i--){
		var a = el[i];
		var qName = a.qName;
		var value = a.value;
		var nsp = qName.indexOf(':');
		if(nsp>0){
			var prefix = a.prefix = qName.slice(0,nsp);
			var localName = qName.slice(nsp+1);
			var nsPrefix = prefix === 'xmlns' && localName
		}else{
			localName = qName;
			prefix = null
			nsPrefix = qName === 'xmlns' && ''
		}
		//can not set prefix,because prefix !== ''
		a.localName = localName ;
		//prefix == null for no ns prefix attribute 
		if(nsPrefix !== false){//hack!!
			if(localNSMap == null){
				localNSMap = {}
				//console.log(currentNSMap,0)
				_copy(currentNSMap,currentNSMap={})
				//console.log(currentNSMap,1)
			}
			currentNSMap[nsPrefix] = localNSMap[nsPrefix] = value;
			a.uri = 'http://www.w3.org/2000/xmlns/'
			domBuilder.startPrefixMapping(nsPrefix, value) 
		}
	}
	var i = el.length;
	while(i--){
		a = el[i];
		var prefix = a.prefix;
		if(prefix){//no prefix attribute has no namespace
			if(prefix === 'xml'){
				a.uri = 'http://www.w3.org/XML/1998/namespace';
			}if(prefix !== 'xmlns'){
				a.uri = currentNSMap[prefix || '']
				
				//{console.log('###'+a.qName,domBuilder.locator.systemId+'',currentNSMap,a.uri)}
			}
		}
	}
	var nsp = tagName.indexOf(':');
	if(nsp>0){
		prefix = el.prefix = tagName.slice(0,nsp);
		localName = el.localName = tagName.slice(nsp+1);
	}else{
		prefix = null;//important!!
		localName = el.localName = tagName;
	}
	//no prefix element has default namespace
	var ns = el.uri = currentNSMap[prefix || ''];
	domBuilder.startElement(ns,localName,tagName,el);
	//endPrefixMapping and startPrefixMapping have not any help for dom builder
	//localNSMap = null
	if(el.closed){
		domBuilder.endElement(ns,localName,tagName);
		if(localNSMap){
			for(prefix in localNSMap){
				domBuilder.endPrefixMapping(prefix) 
			}
		}
	}else{
		el.currentNSMap = currentNSMap;
		el.localNSMap = localNSMap;
		//parseStack.push(el);
		return true;
	}
}
function parseHtmlSpecialContent(source,elStartEnd,tagName,entityReplacer,domBuilder){
	if(/^(?:script|textarea)$/i.test(tagName)){
		var elEndStart =  source.indexOf('</'+tagName+'>',elStartEnd);
		var text = source.substring(elStartEnd+1,elEndStart);
		if(/[&<]/.test(text)){
			if(/^script$/i.test(tagName)){
				//if(!/\]\]>/.test(text)){
					//lexHandler.startCDATA();
					domBuilder.characters(text,0,text.length);
					//lexHandler.endCDATA();
					return elEndStart;
				//}
			}//}else{//text area
				text = text.replace(/&#?\w+;/g,entityReplacer);
				domBuilder.characters(text,0,text.length);
				return elEndStart;
			//}
			
		}
	}
	return elStartEnd+1;
}
function fixSelfClosed(source,elStartEnd,tagName,closeMap){
	//if(tagName in closeMap){
	var pos = closeMap[tagName];
	if(pos == null){
		//console.log(tagName)
		pos =  source.lastIndexOf('</'+tagName+'>')
		if(pos<elStartEnd){//忘记闭合
			pos = source.lastIndexOf('</'+tagName)
		}
		closeMap[tagName] =pos
	}
	return pos<elStartEnd;
	//} 
}
function _copy(source,target){
	for(var n in source){target[n] = source[n]}
}
function parseDCC(source,start,domBuilder,errorHandler){//sure start with '<!'
	var next= source.charAt(start+2)
	switch(next){
	case '-':
		if(source.charAt(start + 3) === '-'){
			var end = source.indexOf('-->',start+4);
			//append comment source.substring(4,end)//<!--
			if(end>start){
				domBuilder.comment(source,start+4,end-start-4);
				return end+3;
			}else{
				errorHandler.error("Unclosed comment");
				return -1;
			}
		}else{
			//error
			return -1;
		}
	default:
		if(source.substr(start+3,6) == 'CDATA['){
			var end = source.indexOf(']]>',start+9);
			domBuilder.startCDATA();
			domBuilder.characters(source,start+9,end-start-9);
			domBuilder.endCDATA() 
			return end+3;
		}
		//<!DOCTYPE
		//startDTD(java.lang.String name, java.lang.String publicId, java.lang.String systemId) 
		var matchs = split(source,start);
		var len = matchs.length;
		if(len>1 && /!doctype/i.test(matchs[0][0])){
			var name = matchs[1][0];
			var pubid = len>3 && /^public$/i.test(matchs[2][0]) && matchs[3][0]
			var sysid = len>4 && matchs[4][0];
			var lastMatch = matchs[len-1]
			domBuilder.startDTD(name,pubid && pubid.replace(/^(['"])(.*?)\1$/,'$2'),
					sysid && sysid.replace(/^(['"])(.*?)\1$/,'$2'));
			domBuilder.endDTD();
			
			return lastMatch.index+lastMatch[0].length
		}
	}
	return -1;
}



function parseInstruction(source,start,domBuilder){
	var end = source.indexOf('?>',start);
	if(end){
		var match = source.substring(start,end).match(/^<\?(\S*)\s*([\s\S]*?)\s*$/);
		if(match){
			var len = match[0].length;
			domBuilder.processingInstruction(match[1], match[2]) ;
			return end+2;
		}else{//error
			return -1;
		}
	}
	return -1;
}

/**
 * @param source
 */
function ElementAttributes(source){
	
}
ElementAttributes.prototype = {
	setTagName:function(tagName){
		if(!tagNamePattern.test(tagName)){
			throw new Error('invalid tagName:'+tagName)
		}
		this.tagName = tagName
	},
	add:function(qName,value,offset){
		if(!tagNamePattern.test(qName)){
			throw new Error('invalid attribute:'+qName)
		}
		this[this.length++] = {qName:qName,value:value,offset:offset}
	},
	length:0,
	getLocalName:function(i){return this[i].localName},
	getLocator:function(i){return this[i].locator},
	getQName:function(i){return this[i].qName},
	getURI:function(i){return this[i].uri},
	getValue:function(i){return this[i].value}
//	,getIndex:function(uri, localName)){
//		if(localName){
//			
//		}else{
//			var qName = uri
//		}
//	},
//	getValue:function(){return this.getValue(this.getIndex.apply(this,arguments))},
//	getType:function(uri,localName){}
//	getType:function(i){},
}



function split(source,start){
	var match;
	var buf = [];
	var reg = /'[^']+'|"[^"]+"|[^\s<>\/=]+=?|(\/?\s*>|<)/g;
	reg.lastIndex = start;
	reg.exec(source);//skip <
	while(match = reg.exec(source)){
		buf.push(match);
		if(match[1])return buf;
	}
}

exports.XMLReader = XMLReader;


},{}],23:[function(require,module,exports){
(function (process){(function (){
/*
	Dom Kit

	Copyright (c) 2015 - 2018 Cédric Ronvel

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



var domParser , xmlSerializer ;

if ( process.browser ) {
	domParser = new DOMParser() ;
	xmlSerializer = new XMLSerializer() ;
}
else {
	var xmldom = require( '@cronvel/xmldom' ) ;
	domParser = new xmldom.DOMParser() ;
	xmlSerializer = new xmldom.XMLSerializer() ;
}



const domKit = {} ;
module.exports = domKit ;



// Like jQuery's $(document).ready()
domKit.ready = callback => {
	document.addEventListener( 'DOMContentLoaded' , function internalCallback() {
		document.removeEventListener( 'DOMContentLoaded' , internalCallback , false ) ;
		callback() ;
	} , false ) ;
} ;



domKit.fromXml = xml => domParser.parseFromString( xml , 'application/xml' ) ;
domKit.toXml = $doc => xmlSerializer.serializeToString( $doc ) ;



// Return a fragment from html code
domKit.fromHtml = html => {
	var i , $doc , $fragment ;

	// Fragment allow us to return a collection that... well... is not a collection,
	// and that's fine because the html code may contains multiple top-level element
	$fragment = document.createDocumentFragment() ;

	$doc = document.createElement( 'div' ) ;	// whatever type...

	// either .innerHTML or .insertAdjacentHTML()
	//$doc.innerHTML = html ;
	$doc.insertAdjacentHTML( 'beforeend' , html ) ;

	for ( i = 0 ; i < $doc.children.length ; i ++ ) {
		$fragment.appendChild( $doc.children[ i ] ) ;
	}

	return $fragment ;
} ;



// Add a JS script, return a promise when done
domKit.addJsScript = ( url , $element = document.body ) => {
	return new Promise( ( resolve , reject ) => {
		var $script = document.createElement( 'script' ) ;
		$script.src = url ;
		$script.async = true ;
		$script.onload = resolve ;
		$script.onerror = reject ;
		$element.appendChild( $script ) ;
	} ) ;
} ;


// Batch processing, like array, HTMLCollection, and so on...
domKit.batch = ( method , elements , ... args ) => {
	var i ;

	if ( elements instanceof Element ) {
		method( elements , ... args ) ;
	}
	else if ( Array.isArray( elements ) ) {
		for ( i = 0 ; i < elements.length ; i ++ ) {
			method( elements[ i ] , ... args ) ;
		}
	}
	else if ( elements instanceof NodeList || elements instanceof NamedNodeMap ) {
		for ( i = 0 ; i < elements.length ; i ++ ) {
			method( elements[ i ] , ... args ) ;
		}
	}
} ;



// Set a bunch of css properties given as an object
domKit.css = ( $element , object ) => {
	var key ;

	for ( key in object ) {
		$element.style[ key ] = object[ key ] ;
	}
} ;



// Set a bunch of attributes given as an object
domKit.attr = ( $element , object , prefix ) => {
	var key ;

	prefix = prefix || '' ;

	for ( key in object ) {
		if ( object[ key ] === null ) { $element.removeAttribute( prefix + key ) ; }
		else { $element.setAttribute( prefix + key , object[ key ] ) ; }
	}
} ;



// Set/unset a bunch of classes given as an object
domKit.class = ( $element , object , prefix ) => {
	var key ;

	prefix = prefix || '' ;

	for ( key in object ) {
		if ( object[ key ] ) { $element.classList.add( prefix + key ) ; }
		else { $element.classList.remove( prefix + key ) ; }
	}
} ;



// Remove an element. A little shortcut that ease life...
domKit.remove = $element => $element.parentNode.removeChild( $element ) ;



// Remove all children of an element
domKit.empty = $element => {
	// $element.innerHTML = '' ;	// <-- According to jsPerf, this is 96% slower
	while ( $element.firstChild ) { $element.removeChild( $element.firstChild ) ; }
} ;



// Clone a source DOM tree and replace children of the destination
domKit.cloneInto = ( $source , $destination ) => {
	domKit.empty( $destination ) ;
	$destination.appendChild( $source.cloneNode( true ) ) ;
} ;



// Same than cloneInto() without cloning anything
domKit.insertInto = ( $source , $destination ) => {
	domKit.empty( $destination ) ;
	$destination.appendChild( $source ) ;
} ;



// Move all children of a node into another, after removing existing target's children
domKit.moveChildrenInto = ( $source , $destination ) => {
	domKit.empty( $destination ) ;
	while ( $source.firstChild ) { $destination.appendChild( $source.firstChild ) ; }
} ;



// Move all attributes of an element into the destination
domKit.moveAttributes = ( $source , $destination ) => {
	Array.from( $source.attributes ).forEach( ( attr ) => {
		var name = attr.name ;
		var value = attr.value ;

		$source.removeAttribute( name ) ;

		// Do not copy namespaced attributes for instance,
		// should probably protect this behind a third argument
		if ( name !== 'xmlns' && name.indexOf( ':' ) === -1 && value ) {
			//console.warn( 'moving: ' , name, value , $destination.getAttribute( name ) ) ;
			$destination.setAttribute( name , value ) ;
		}
	} ) ;
} ;



domKit.styleToAttribute = ( $element , property , blacklistedValues ) => {
	if ( $element.style[ property ] && ( ! blacklistedValues || blacklistedValues.indexOf( $element.style[ property ] ) === -1 ) ) {
		$element.setAttribute( property , $element.style[ property ] ) ;
		$element.style[ property ] = null ;
	}
} ;



// Children of this element get all their ID prefixed, any url(#id) references are patched accordingly
domKit.prefixIds = ( $element , prefix ) => {
	var elements , replacement = {} ;

	elements = $element.querySelectorAll( '*' ) ;

	domKit.batch( domKit.prefixIds.idAttributePass , elements , prefix , replacement ) ;
	domKit.batch( domKit.prefixIds.otherAttributesPass , elements , replacement ) ;
} ;



// Callbacks for domKit.prefixIds(), cleanly hidden behind its prefix

domKit.prefixIds.idAttributePass = ( $element , prefix , replacement ) => {
	replacement[ $element.id ] = prefix + '.' + $element.id ;
	$element.id = replacement[ $element.id ] ;
} ;



domKit.prefixIds.otherAttributesPass = ( $element , replacement ) => {
	domKit.batch( domKit.prefixIds.oneAttributeSubPass , $element.attributes , replacement ) ;
} ;



domKit.prefixIds.oneAttributeSubPass = ( attr , replacement ) => {
	// We have to search all url(#id) like substring in the current attribute's value
	attr.value = attr.value.replace( /url\(#([^)]+)\)/g , ( match , id ) => {

		// No replacement? return the matched string
		if ( ! replacement[ id ] ) { return match ; }

		// Or return the replacement ID
		return 'url(#' + replacement[ id ] + ')' ;
	} ) ;
} ;



domKit.removeAllTags = ( $container , tagName , onlyIfEmpty ) => {
	Array.from( $container.getElementsByTagName( tagName ) ).forEach( ( $element ) => {
		if ( ! onlyIfEmpty || ! $element.firstChild ) { $element.parentNode.removeChild( $element ) ; }
	} ) ;
} ;



domKit.removeAllAttributes = ( $container , attrName ) => {
	// Don't forget to remove the ID of the container itself
	$container.removeAttribute( attrName ) ;

	Array.from( $container.querySelectorAll( '[' + attrName + ']' ) ).forEach( ( $element ) => {
		$element.removeAttribute( attrName ) ;
	} ) ;
} ;



domKit.preload = urls => {
	if ( ! Array.isArray( urls ) ) { urls = [ urls ] ; }

	urls.forEach( ( url ) => {
		if ( domKit.preload.preloaded[ url ] ) { return ; }
		domKit.preload.preloaded[ url ] = new Image() ;
		domKit.preload.preloaded[ url ].src = url ;
	} ) ;
} ;

domKit.preload.preloaded = {} ;



/*
	Filter namespaces:

	* options `object` where:
		* blacklist `array` of `string` namespace of elements/attributes to remove
		* whitelist `array` of `string` namespace to elements/attributes to keep
		* primary `string` keep those elements but remove the namespace
*/
domKit.filterByNamespace = ( $container , options ) => {
	var i , $child , namespace , tagName , split ;

	// Nothing to do? return now...
	if ( ! options || typeof options !== 'object' ) { return ; }

	domKit.filterAttributesByNamespace( $container , options ) ;

	for ( i = $container.childNodes.length - 1 ; i >= 0 ; i -- ) {
		$child = $container.childNodes[ i ] ;

		if ( $child.nodeType === 1 ) {
			if ( $child.tagName.indexOf( ':' ) !== -1 ) {
				split = $child.tagName.split( ':' ) ;
				namespace = split[ 0 ] ;
				tagName = split[ 1 ] ;

				if ( namespace === options.primary ) {
					$child.tagName = tagName ;
					domKit.filterByNamespace( $child , options ) ;
				}
				else if ( options.whitelist ) {
					if ( options.whitelist.indexOf( namespace ) !== -1 ) {
						domKit.filterByNamespace( $child , options ) ;
					}
					else {
						$container.removeChild( $child ) ;
					}
				}
				else if ( options.blacklist ) {
					if ( options.blacklist.indexOf( namespace ) !== -1 ) {
						$container.removeChild( $child ) ;
					}
					else {
						domKit.filterByNamespace( $child , options ) ;
					}
				}
				else {
					domKit.filterByNamespace( $child , options ) ;
				}
			}
			else {
				domKit.filterByNamespace( $child , options ) ;
			}
		}
	}
} ;



// Filter attributes by namespace
domKit.filterAttributesByNamespace = ( $container , options ) => {
	var i , attr , namespace , attrName , value , split ;

	// Nothing to do? return now...
	if ( ! options || typeof options !== 'object' ) { return ; }

	for ( i = $container.attributes.length - 1 ; i >= 0 ; i -- ) {
		attr = $container.attributes[ i ] ;

		if ( attr.name.indexOf( ':' ) !== -1 ) {
			split = attr.name.split( ':' ) ;
			namespace = split[ 0 ] ;
			attrName = split[ 1 ] ;
			value = attr.value ;

			if ( namespace === options.primary ) {
				$container.removeAttributeNode( attr ) ;
				$container.setAttribute( attrName , value ) ;
			}
			else if ( options.whitelist ) {
				if ( options.whitelist.indexOf( namespace ) === -1 ) {
					$container.removeAttributeNode( attr ) ;
				}
			}
			else if ( options.blacklist ) {
				if ( options.blacklist.indexOf( namespace ) !== -1 ) {
					$container.removeAttributeNode( attr ) ;
				}
			}
		}
	}
} ;



// Remove comments
domKit.removeComments = $container => {
	var i , $child ;

	for ( i = $container.childNodes.length - 1 ; i >= 0 ; i -- ) {
		$child = $container.childNodes[ i ] ;

		if ( $child.nodeType === 8 ) {
			$container.removeChild( $child ) ;
		}
		else if ( $child.nodeType === 1 ) {
			domKit.removeComments( $child ) ;
		}
	}
} ;



// Remove white-space-only text-node
domKit.removeWhiteSpaces = ( $container , onlyWhiteLines ) => {
	var i , $child , $lastTextNode = null ;

	for ( i = $container.childNodes.length - 1 ; i >= 0 ; i -- ) {
		$child = $container.childNodes[ i ] ;
		//console.log( '$child.nodeType' , $child.nodeType ) ;

		if ( $child.nodeType === 3 ) {
			if ( onlyWhiteLines ) {
				if ( $lastTextNode ) {
					// When multiple text-node in a row
					$lastTextNode.nodeValue = ( $child.nodeValue + $lastTextNode.nodeValue ).replace( /^\s*(\n[\t ]*)$/ , '$1' ) ;
					$container.removeChild( $child ) ;
				}
				else {
					//console.log( "deb1: '" + $child.nodeValue + "'" ) ;
					$child.nodeValue = $child.nodeValue.replace( /^\s*(\n[\t ]*)$/ , '$1' ) ;
					$lastTextNode = $child ;
					//console.log( "deb2: '" + $child.nodeValue + "'" ) ;
				}
			}
			else if ( ! /\S/.test( $child.nodeValue ) ) {
				$container.removeChild( $child ) ;
			}
		}
		else if ( $child.nodeType === 1 ) {
			$lastTextNode = null ;
			domKit.removeWhiteSpaces( $child , onlyWhiteLines ) ;
		}
		else {
			$lastTextNode = null ;
		}
	}
} ;



// Transform-related method

domKit.parseMatrix = str => {
	var matches = str.match( /(matrix|matrix3d)\(([0-9., -]+)\)/ ) ;

	if ( ! matches ) { return null ; }

	return matches[ 2 ].trim().split( / ?, ?/ ).map( ( e ) => {
		return parseFloat( e ) ;
	} ) ;
} ;



domKit.decomposeMatrix = matrix => {
	if ( matrix.length === 6 ) { return domKit.decomposeMatrix2d( matrix ) ; }
	if ( matrix.length === 16 ) { return domKit.decomposeMatrix3d( matrix ) ; }
	return null ;
} ;



// From: https://stackoverflow.com/questions/16359246/how-to-extract-position-rotation-and-scale-from-matrix-svg
domKit.decomposeMatrix2d = matrix => {
	var angle = Math.atan2( matrix[1] , matrix[0] ) ,
		denom = matrix[0] * matrix[0] + matrix[1] * matrix[1] ,
		scaleX = Math.sqrt( denom ) ,
		scaleY = ( matrix[0] * matrix[3] - matrix[2] * matrix[1] ) / scaleX ,
		skewX = Math.atan2( matrix[0] * matrix[2] + matrix[1] * matrix[3] , denom ) ;

	return {
		rotate: 180 * angle / Math.PI ,  // in degrees
		scaleX: scaleX ,
		scaleY: scaleY ,
		skewX: 180 * skewX / Math.PI ,  // in degree
		skewY: 0 ,  // always 0 in this decomposition
		translateX: matrix[4] ,
		translateY: matrix[5]
	} ;
} ;



// https://stackoverflow.com/questions/15024828/transforming-3d-matrix-into-readable-format
// supports only scale*rotate*translate matrix
domKit.decomposeMatrix3d = matrix => {
	var radians = Math.PI / 180 ;

	var sX = Math.sqrt( matrix[0] * matrix[0] + matrix[1] * matrix[1] + matrix[2] * matrix[2] ) ,
		sY = Math.sqrt( matrix[4] * matrix[4] + matrix[5] * matrix[5] + matrix[6] * matrix[6] ) ,
		sZ = Math.sqrt( matrix[8] * matrix[8] + matrix[9] * matrix[9] + matrix[10] * matrix[10] ) ;

	var rX = Math.atan2( -matrix[9] / sZ , matrix[10] / sZ ) / radians ,
		rY = Math.asin( matrix[8] / sZ ) / radians ,
		rZ = Math.atan2( -matrix[4] / sY , matrix[0] / sX ) / radians ;

	if ( matrix[4] === 1 || matrix[4] === -1 ) {
		rX = 0 ;
		rY = matrix[4] * -Math.PI / 2 ;
		rZ = matrix[4] * Math.atan2( matrix[6] / sY , matrix[5] / sY ) / radians ;
	}

	var tX = matrix[12] / sX ,
		tY = matrix[13] / sX ,
		tZ = matrix[14] / sX ;

	return {
		translateX: tX ,
		translateY: tY ,
		translateZ: tZ ,
		rotateX: rX ,
		rotateY: rY ,
		rotateZ: rZ ,
		scaleX: sX ,
		scaleY: sY ,
		scaleZ: sZ
	} ;
} ;



const AXIS_TO_ROT = {
	x: 'rotateX' ,
	X: 'rotateX' ,
	y: 'rotateY' ,
	Y: 'rotateY' ,
	z: 'rotateZ' ,
	Z: 'rotateZ'
} ;



domKit.stringifyTransform = object => {
	var str = [] , eulerOrder , i , rot ;

	if ( object.translateX ) { str.push( 'translateX(' + object.translateX + 'px)' ) ; }
	if ( object.translateY ) { str.push( 'translateY(' + object.translateY + 'px)' ) ; }
	if ( object.translateZ ) { str.push( 'translateZ(' + object.translateZ + 'px)' ) ; }

	if ( object.rotate ) {
		str.push( 'rotate(' + object.rotate + 'deg)' ) ;
	}
	else {
		eulerOrder = object.eulerOrder || 'zyx' ;
		for ( i = 0 ; i < 3 ; i ++ ) {
			rot = AXIS_TO_ROT[ eulerOrder[ i ] ] ;
			if ( object[ rot ] ) { str.push( rot + '(' + object[ rot ] + 'deg)' ) ; }
		}
	}

	if ( object.scale ) {
		str.push( 'scale(' + object.scale + ')' ) ;
	}
	else {
		if ( object.scaleX ) { str.push( 'scaleX(' + object.scaleX + ')' ) ; }
		if ( object.scaleY ) { str.push( 'scaleY(' + object.scaleY + ')' ) ; }
		if ( object.scaleZ ) { str.push( 'scaleZ(' + object.scaleZ + ')' ) ; }
	}

	if ( object.skewX ) { str.push( 'skewX(' + object.skewX + 'deg)' ) ; }
	if ( object.skewY ) { str.push( 'skewY(' + object.skewY + 'deg)' ) ; }

	return str.join( ' ' ) ;
} ;

domKit.transform = ( $element , transformObject ) => $element.style.transform = domKit.stringifyTransform( transformObject ) ;





/* Function useful for .batch() as callback */
/* ... to avoid defining again and again the same callback function */

// Change id
domKit.id = ( $element , id ) => $element.id = id ;

// Like jQuery .text().
domKit.text = ( $element , text ) => $element.textContent = text ;

// Like jQuery .html().
domKit.html = ( $element , html ) => $element.innerHTML = html ;


}).call(this)}).call(this,require('_process'))
},{"@cronvel/xmldom":19,"_process":50}],24:[function(require,module,exports){
/*
 * Copyright (C) 2007-2018 Diego Perini
 * All rights reserved.
 *
 * nwmatcher.js - A fast CSS selector engine and matcher
 *
 * Author: Diego Perini <diego.perini at gmail com>
 * Version: 1.4.4
 * Created: 20070722
 * Release: 20180305
 *
 * License:
 *  http://javascript.nwbox.com/NWMatcher/MIT-LICENSE
 * Download:
 *  http://javascript.nwbox.com/NWMatcher/nwmatcher.js
 */

(function(global, factory) {

  if (typeof module == 'object' && typeof exports == 'object') {
    module.exports = factory;
  } else if (typeof define === 'function' && define["amd"]) {
    define(factory);
  } else {
    global.NW || (global.NW = { });
    global.NW.Dom = factory(global);
  }

})(this, function(global) {

  var version = 'nwmatcher-1.4.4',

  // processing context & root element
  doc = global.document,
  root = doc.documentElement,

  // save utility methods references
  slice = [ ].slice,

  // persist previous parsed data
  isSingleMatch,
  isSingleSelect,

  lastSlice,
  lastContext,
  lastPosition,

  lastMatcher,
  lastSelector,

  lastPartsMatch,
  lastPartsSelect,

  // accepted prefix identifiers
  // (id, class & pseudo-class)
  prefixes = '(?:[#.:]|::)?',

  // accepted attribute operators
  operators = '([~*^$|!]?={1})',

  // accepted whitespace characters
  whitespace = '[\\x20\\t\\n\\r\\f]',

  // 4 combinators F E, F>E, F+E, F~E
  combinators = '\\x20|[>+~](?=[^>+~])',

  // an+b format params for pseudo-classes
  pseudoparms = '(?:[-+]?\\d*n)?[-+]?\\d*',

  // skip [ ], ( ), { } brackets groups
  skip_groups = '\\[.*\\]|\\(.*\\)|\\{.*\\}',

  // any escaped char
  any_esc_chr = '\\\\.',
  // alpha chars & low dash
  alphalodash = '[_a-zA-Z]',
  // non-ascii chars (utf-8)
  non_asc_chr = '[^\\x00-\\x9f]',
  // escape sequences in strings
  escaped_chr = '\\\\[^\\n\\r\\f0-9a-fA-F]',
  // Unicode chars including trailing whitespace
  unicode_chr = '\\\\[0-9a-fA-F]{1,6}(?:\\r\\n|' + whitespace + ')?',

  // CSS quoted string values
  quotedvalue = '"[^"\\\\]*(?:\\\\.[^"\\\\]*)*"' + "|'[^'\\\\]*(?:\\\\.[^'\\\\]*)*'",

  // regular expression used to skip single/nested brackets groups (round, square, curly)
  // used to split comma groups excluding commas inside quotes '' "" or brackets () [] {}
  reSplitGroup = /([^,\\()[\]]+|\[[^[\]]*\]|\[.*\]|\([^()]+\)|\(.*\)|\{[^{}]+\}|\{.*\}|\\.)+/g,

  // regular expression to trim extra leading/trailing whitespace in selector strings
  // whitespace is any combination of these 5 character [\x20\t\n\r\f]
  // http://www.w3.org/TR/css3-selectors/#selector-syntax
  reTrimSpaces = RegExp('[\\n\\r\\f]|^' + whitespace + '+|' + whitespace + '+$', 'g'),

  // regular expression used in convertEscapes and unescapeIdentifier
  reEscapedChars = /\\([0-9a-fA-F]{1,6}[\x20\t\n\r\f]?|.)|([\x22\x27])/g,

  // for in excess whitespace removal
  reWhiteSpace = /[\x20\t\n\r\f]+/g,

  standardValidator, extendedValidator, reValidator,

  attrcheck, attributes, attrmatcher, pseudoclass,

  reOptimizeSelector, reSimpleNot, reSplitToken,

  Optimize, reClass, reSimpleSelector,

  // http://www.w3.org/TR/css3-syntax/#characters
  // unicode/ISO 10646 characters \xA0 and higher
  // NOTE: Safari 2.0.x crashes with escaped (\\)
  // Unicode ranges in regular expressions so we
  // use a negated character range class instead
  // now assigned at runtime from config options
  identifier,

  // placeholder for extensions
  extensions = '.+',

  // precompiled Regular Expressions
  Patterns = {
    // structural pseudo-classes and child selectors
    spseudos: /^\:(root|empty|(?:first|last|only)(?:-child|-of-type)|nth(?:-last)?(?:-child|-of-type)\(\s?(even|odd|(?:[-+]{0,1}\d*n\s?)?[-+]{0,1}\s?\d*)\s?\))?(.*)/i,
    // uistates + dynamic + negation pseudo-classes
    dpseudos: /^\:(link|visited|target|active|focus|hover|checked|disabled|enabled|selected|lang\(([-\w]{2,})\)|(?:matches|not)\(\s?(:nth(?:-last)?(?:-child|-of-type)\(\s?(?:even|odd|(?:[-+]{0,1}\d*n\s?)?[-+]{0,1}\s?\d*)\s?\)|[^()]*)\s?\))?(.*)/i,
    // pseudo-elements selectors
    epseudos: /^((?:[:]{1,2}(?:after|before|first-letter|first-line))|(?:[:]{2,2}(?:selection|backdrop|placeholder)))?(.*)/i,
    // E > F
    children: RegExp('^' + whitespace + '?\\>' + whitespace + '?(.*)'),
    // E + F
    adjacent: RegExp('^' + whitespace + '?\\+' + whitespace + '?(.*)'),
    // E ~ F
    relative: RegExp('^' + whitespace + '?\\~' + whitespace + '?(.*)'),
    // E F
    ancestor: RegExp('^' + whitespace + '+(.*)'),
    // all
    universal: RegExp('^\\*(.*)')
  },

  Tokens = {
    prefixes: prefixes,
    identifier: identifier,
    attributes: attributes
  },

  /*----------------------------- FEATURE TESTING ----------------------------*/

  // detect native methods
  isNative = (function() {
    var re = / \w+\(/,
    isnative = String(({ }).toString).replace(re, ' (');
    return function(method) {
      return method && typeof method != 'string' &&
        isnative == String(method).replace(re, ' (');
    };
  })(),

  // NATIVE_XXXXX true if method exist and is callable
  // detect if DOM methods are native in browsers
  NATIVE_FOCUS = isNative(doc.hasFocus),
  NATIVE_QSAPI = isNative(doc.querySelector),
  NATIVE_GEBID = isNative(doc.getElementById),
  NATIVE_GEBTN = isNative(root.getElementsByTagName),
  NATIVE_GEBCN = isNative(root.getElementsByClassName),

  // detect native getAttribute/hasAttribute methods,
  // frameworks extend these to elements, but it seems
  // this does not work for XML namespaced attributes,
  // used to check both getAttribute/hasAttribute in IE
  NATIVE_GET_ATTRIBUTE = isNative(root.getAttribute),
  NATIVE_HAS_ATTRIBUTE = isNative(root.hasAttribute),

  // check if slice() can convert nodelist to array
  // see http://yura.thinkweb2.com/cft/
  NATIVE_SLICE_PROTO =
    (function() {
      var isBuggy = false;
      try {
        isBuggy = !!slice.call(doc.childNodes, 0)[0];
      } catch(e) { }
      return isBuggy;
    })(),

  // supports the new traversal API
  NATIVE_TRAVERSAL_API =
    'nextElementSibling' in root && 'previousElementSibling' in root,

  // BUGGY_XXXXX true if method is feature tested and has known bugs
  // detect buggy gEBID
  BUGGY_GEBID = NATIVE_GEBID ?
    (function() {
      var isBuggy = true, x = 'x' + String(+new Date),
        a = doc.createElementNS ? 'a' : '<a name="' + x + '">';
      (a = doc.createElement(a)).name = x;
      root.insertBefore(a, root.firstChild);
      isBuggy = !!doc.getElementById(x);
      root.removeChild(a);
      return isBuggy;
    })() :
    true,

  // detect IE gEBTN comment nodes bug
  BUGGY_GEBTN = NATIVE_GEBTN ?
    (function() {
      var div = doc.createElement('div');
      div.appendChild(doc.createComment(''));
      return !!div.getElementsByTagName('*')[0];
    })() :
    true,

  // detect Opera gEBCN second class and/or UTF8 bugs as well as Safari 3.2
  // caching class name results and not detecting when changed,
  // tests are based on the jQuery selector test suite
  BUGGY_GEBCN = NATIVE_GEBCN ?
    (function() {
      var isBuggy, div = doc.createElement('div'), test = '\u53f0\u5317';

      // Opera tests
      div.appendChild(doc.createElement('span')).
        setAttribute('class', test + 'abc ' + test);
      div.appendChild(doc.createElement('span')).
        setAttribute('class', 'x');

      isBuggy = !div.getElementsByClassName(test)[0];

      // Safari test
      div.lastChild.className = test;
      return isBuggy || div.getElementsByClassName(test).length != 2;
    })() :
    true,

  // detect IE bug with dynamic attributes
  BUGGY_GET_ATTRIBUTE = NATIVE_GET_ATTRIBUTE ?
    (function() {
      var input = doc.createElement('input');
      input.setAttribute('value', 5);
      return input.defaultValue != 5;
    })() :
    true,

  // detect IE bug with non-standard boolean attributes
  BUGGY_HAS_ATTRIBUTE = NATIVE_HAS_ATTRIBUTE ?
    (function() {
      var option = doc.createElement('option');
      option.setAttribute('selected', 'selected');
      return !option.hasAttribute('selected');
    })() :
    true,

  // detect Safari bug with selected option elements
  BUGGY_SELECTED =
    (function() {
      var select = doc.createElement('select');
      select.appendChild(doc.createElement('option'));
      return !select.firstChild.selected;
    })(),

  // initialized with the loading context
  // and reset for each different context
  BUGGY_QUIRKS_GEBCN,
  BUGGY_QUIRKS_QSAPI,

  QUIRKS_MODE,
  XML_DOCUMENT,

  // detect Opera browser
  OPERA = typeof global.opera != 'undefined' &&
    (/opera/i).test(({ }).toString.call(global.opera)),

  // skip simple selector optimizations for Opera >= 11
  OPERA_QSAPI = OPERA && parseFloat(global.opera.version()) >= 11,

  // check Selector API implementations
  RE_BUGGY_QSAPI = NATIVE_QSAPI ?
    (function() {
      var pattern = [ ], context, element,

      expect = function(selector, element, n) {
        var result = false;
        context.appendChild(element);
        try { result = context.querySelectorAll(selector).length == n; } catch(e) { }
        while (context.firstChild) { context.removeChild(context.firstChild); }
        return result;
      };

      // certain bugs can only be detected in standard documents
      // to avoid writing a live loading document create a fake one
      if (doc.implementation && doc.implementation.createDocument) {
        // use a shadow document body as context
        context = doc.implementation.createDocument('', '', null).
          appendChild(doc.createElement('html')).
          appendChild(doc.createElement('head')).parentNode.
          appendChild(doc.createElement('body'));
      } else {
        // use an unattached div node as context
        context = doc.createElement('div');
      }

      // fix for Safari 8.x and other engines that
      // fail querying filtered sibling combinators
      element = doc.createElement('div');
      element.innerHTML = '<p id="a"></p><br>';
      expect('p#a+*', element, 0) &&
        pattern.push('\\w+#\\w+.*[+~]');

      // ^= $= *= operators bugs with empty values (Opera 10 / IE8)
      element = doc.createElement('p');
      element.setAttribute('class', '');
      expect('[class^=""]', element, 1) &&
        pattern.push('[*^$]=[\\x20\\t\\n\\r\\f]*(?:""|' + "'')");

      // :checked bug with option elements (Firefox 3.6.x)
      // it wrongly includes 'selected' options elements
      // HTML5 rules says selected options also match
      element = doc.createElement('option');
      element.setAttribute('selected', 'selected');
      expect(':checked', element, 0) &&
        pattern.push(':checked');

      // :enabled :disabled bugs with hidden fields (Firefox 3.5)
      // http://www.w3.org/TR/html5/links.html#selector-enabled
      // http://www.w3.org/TR/css3-selectors/#enableddisabled
      // not supported by IE8 Query Selector
      element = doc.createElement('input');
      element.setAttribute('type', 'hidden');
      expect(':enabled', element, 0) &&
        pattern.push(':enabled', ':disabled');

      // :link bugs with hyperlinks matching (Firefox/Safari)
      element = doc.createElement('link');
      element.setAttribute('href', 'x');
      expect(':link', element, 1) ||
        pattern.push(':link');

      // avoid attribute selectors for IE QSA
      if (BUGGY_HAS_ATTRIBUTE) {
        // IE fails in reading:
        // - original values for input/textarea
        // - original boolean values for controls
        pattern.push('\\[[\\x20\\t\\n\\r\\f]*(?:checked|disabled|ismap|multiple|readonly|selected|value)');
      }

      return pattern.length ?
        RegExp(pattern.join('|')) :
        { 'test': function() { return false; } };

    })() :
    true,

  /*----------------------------- LOOKUP OBJECTS -----------------------------*/

  IE_LT_9 = typeof doc.addEventListener != 'function',

  LINK_NODES = { 'a': 1, 'A': 1, 'area': 1, 'AREA': 1, 'link': 1, 'LINK': 1 },

  // boolean attributes should return attribute name instead of true/false
  ATTR_BOOLEAN = {
    'checked': 1, 'disabled': 1, 'ismap': 1,
    'multiple': 1, 'readonly': 1, 'selected': 1
  },

  // dynamic attributes that needs to be checked against original HTML value
  ATTR_DEFAULT = {
    'value': 'defaultValue',
    'checked': 'defaultChecked',
    'selected': 'defaultSelected'
  },

  // attributes referencing URI data values need special treatment in IE
  ATTR_URIDATA = {
    'action': 2, 'cite': 2, 'codebase': 2, 'data': 2, 'href': 2,
    'longdesc': 2, 'lowsrc': 2, 'src': 2, 'usemap': 2
  },

  // HTML 5 draft specifications
  // http://www.whatwg.org/specs/web-apps/current-work/#selectors
  HTML_TABLE = {
    // NOTE: class name attribute selectors must always be treated using a
    // case-sensitive match, this has changed from previous specifications
    'accept': 1, 'accept-charset': 1, 'align': 1, 'alink': 1, 'axis': 1,
    'bgcolor': 1, 'charset': 1, 'checked': 1, 'clear': 1, 'codetype': 1, 'color': 1,
    'compact': 1, 'declare': 1, 'defer': 1, 'dir': 1, 'direction': 1, 'disabled': 1,
    'enctype': 1, 'face': 1, 'frame': 1, 'hreflang': 1, 'http-equiv': 1, 'lang': 1,
    'language': 1, 'link': 1, 'media': 1, 'method': 1, 'multiple': 1, 'nohref': 1,
    'noresize': 1, 'noshade': 1, 'nowrap': 1, 'readonly': 1, 'rel': 1, 'rev': 1,
    'rules': 1, 'scope': 1, 'scrolling': 1, 'selected': 1, 'shape': 1, 'target': 1,
    'text': 1, 'type': 1, 'valign': 1, 'valuetype': 1, 'vlink': 1
  },

  /*-------------------------- REGULAR EXPRESSIONS ---------------------------*/

  // placeholder to add functionalities
  Selectors = {
    // as a simple example this will check
    // for chars not in standard ascii table
    //
    // 'mySpecialSelector': {
    //  'Expression': /\u0080-\uffff/,
    //  'Callback': mySelectorCallback
    // }
    //
    // 'mySelectorCallback' will be invoked
    // only after passing all other standard
    // checks and only if none of them worked
  },

  // attribute operators
  Operators = {
     '=': "n=='%m'",
    '^=': "n.indexOf('%m')==0",
    '*=': "n.indexOf('%m')>-1",
    '|=': "(n+'-').indexOf('%m-')==0",
    '~=': "(' '+n+' ').indexOf(' %m ')>-1",
    '$=': "n.substr(n.length-'%m'.length)=='%m'"
  },

  /*------------------------------ UTIL METHODS ------------------------------*/

  // concat elements to data
  concatList =
    function(data, elements) {
      var i = -1, element;
      if (!data.length && Array.slice)
        return Array.slice(elements);
      while ((element = elements[++i]))
        data[data.length] = element;
      return data;
    },

  // concat elements to data and callback
  concatCall =
    function(data, elements, callback) {
      var i = -1, element;
      while ((element = elements[++i])) {
        if (false === callback(data[data.length] = element)) { break; }
      }
      return data;
    },

  // change context specific variables
  switchContext =
    function(from, force) {
      var div, oldDoc = doc;
      // save passed context
      lastContext = from;
      // set new context document
      doc = from.ownerDocument || from;
      if (force || oldDoc !== doc) {
        // set document root
        root = doc.documentElement;
        // set host environment flags
        XML_DOCUMENT = doc.createElement('DiV').nodeName == 'DiV';

        // In quirks mode css class names are case insensitive.
        // In standards mode they are case sensitive. See docs:
        // https://developer.mozilla.org/en/Mozilla_Quirks_Mode_Behavior
        // http://www.whatwg.org/specs/web-apps/current-work/#selectors
        QUIRKS_MODE = !XML_DOCUMENT &&
          typeof doc.compatMode == 'string' ?
          doc.compatMode.indexOf('CSS') < 0 :
          (function() {
            var style = doc.createElement('div').style;
            return style && (style.width = 1) && style.width == '1px';
          })();

        div = doc.createElement('div');
        div.appendChild(doc.createElement('p')).setAttribute('class', 'xXx');
        div.appendChild(doc.createElement('p')).setAttribute('class', 'xxx');

        // GEBCN buggy in quirks mode, match count is:
        // Firefox 3.0+ [xxx = 1, xXx = 1]
        // Opera 10.63+ [xxx = 0, xXx = 2]
        BUGGY_QUIRKS_GEBCN =
          !XML_DOCUMENT && NATIVE_GEBCN && QUIRKS_MODE &&
          (div.getElementsByClassName('xxx').length != 2 ||
          div.getElementsByClassName('xXx').length != 2);

        // QSAPI buggy in quirks mode, match count is:
        // At least Chrome 4+, Firefox 3.5+, Opera 10.x+, Safari 4+ [xxx = 1, xXx = 2]
        // Safari 3.2 QSA doesn't work with mixedcase in quirksmode [xxx = 1, xXx = 0]
        // https://bugs.webkit.org/show_bug.cgi?id=19047
        // must test the attribute selector '[class~=xxx]'
        // before '.xXx' or the bug may not present itself
        BUGGY_QUIRKS_QSAPI =
          !XML_DOCUMENT && NATIVE_QSAPI && QUIRKS_MODE &&
          (div.querySelectorAll('[class~=xxx]').length != 2 ||
          div.querySelectorAll('.xXx').length != 2);

        Config.CACHING && Dom.setCache(true, doc);
      }
    },

  // convert single codepoint to UTF-16 encoding
  codePointToUTF16 =
    function(codePoint) {
      // out of range, use replacement character
      if (codePoint < 1 || codePoint > 0x10ffff ||
        (codePoint > 0xd7ff && codePoint < 0xe000)) {
        return '\\ufffd';
      }
      // javascript strings are UTF-16 encoded
      if (codePoint < 0x10000) {
        var lowHex = '000' + codePoint.toString(16);
        return '\\u' + lowHex.substr(lowHex.length - 4);
      }
      // supplementary high + low surrogates
      return '\\u' + (((codePoint - 0x10000) >> 0x0a) + 0xd800).toString(16) +
             '\\u' + (((codePoint - 0x10000) % 0x400) + 0xdc00).toString(16);
    },

  // convert single codepoint to string
  stringFromCodePoint =
    function(codePoint) {
      // out of range, use replacement character
      if (codePoint < 1 || codePoint > 0x10ffff ||
        (codePoint > 0xd7ff && codePoint < 0xe000)) {
        return '\ufffd';
      }
      if (codePoint < 0x10000) {
        return String.fromCharCode(codePoint);
      }
      return String.fromCodePoint ?
        String.fromCodePoint(codePoint) :
        String.fromCharCode(
          ((codePoint - 0x10000) >> 0x0a) + 0xd800,
          ((codePoint - 0x10000) % 0x400) + 0xdc00);
    },

  // convert escape sequence in a CSS string or identifier
  // to javascript string with javascript escape sequences
  convertEscapes =
    function(str) {
      return str.replace(reEscapedChars,
          function(substring, p1, p2) {
            // unescaped " or '
            return p2 ? '\\' + p2 :
              // javascript strings are UTF-16 encoded
              (/^[0-9a-fA-F]/).test(p1) ? codePointToUTF16(parseInt(p1, 16)) :
              // \' \"
              (/^[\\\x22\x27]/).test(p1) ? substring :
              // \g \h \. \# etc
              p1;
          }
        );
    },

  // convert escape sequence in a CSS string or identifier
  // to javascript string with characters representations
  unescapeIdentifier =
    function(str) {
      return str.replace(reEscapedChars,
          function(substring, p1, p2) {
            // unescaped " or '
            return p2 ? p2 :
              // javascript strings are UTF-16 encoded
              (/^[0-9a-fA-F]/).test(p1) ? stringFromCodePoint(parseInt(p1, 16)) :
              // \' \"
              (/^[\\\x22\x27]/).test(p1) ? substring :
              // \g \h \. \# etc
              p1;
          }
        );
    },

  /*------------------------------ DOM METHODS -------------------------------*/

  // element by id (raw)
  // @return reference or null
  byIdRaw =
    function(id, elements) {
      var i = -1, element;
      while ((element = elements[++i])) {
        if (element.getAttribute('id') == id) {
          break;
        }
      }
      return element || null;
    },

  // element by id
  // @return reference or null
  _byId = !BUGGY_GEBID ?
    function(id, from) {
      id = (/\\/).test(id) ? unescapeIdentifier(id) : id;
      return from.getElementById && from.getElementById(id) ||
        byIdRaw(id, from.getElementsByTagName('*'));
    } :
    function(id, from) {
      var element = null;
      id = (/\\/).test(id) ? unescapeIdentifier(id) : id;
      if (XML_DOCUMENT || from.nodeType != 9) {
        return byIdRaw(id, from.getElementsByTagName('*'));
      }
      if ((element = from.getElementById(id)) &&
        element.name == id && from.getElementsByName) {
        return byIdRaw(id, from.getElementsByName(id));
      }
      return element;
    },

  // publicly exposed byId
  // @return reference or null
  byId =
    function(id, from) {
      from || (from = doc);
      if (lastContext !== from) { switchContext(from); }
      return _byId(id, from);
    },

  // elements by tag (raw)
  // @return array
  byTagRaw =
    function(tag, from) {
      var any = tag == '*', element = from, elements = [ ], next = element.firstChild;
      any || (tag = tag.toUpperCase());
      while ((element = next)) {
        if (element.tagName > '@' && (any || element.tagName.toUpperCase() == tag)) {
          elements[elements.length] = element;
        }
        if ((next = element.firstChild || element.nextSibling)) continue;
        while (!next && (element = element.parentNode) && element !== from) {
          next = element.nextSibling;
        }
      }
      return elements;
    },

  // elements by tag
  // @return array
  _byTag = !BUGGY_GEBTN && NATIVE_SLICE_PROTO ?
    function(tag, from) {
      return XML_DOCUMENT || from.nodeType == 11 ? byTagRaw(tag, from) :
        slice.call(from.getElementsByTagName(tag), 0);
    } :
    function(tag, from) {
      var i = -1, j = i, data = [ ], element,
        elements = XML_DOCUMENT || from.nodeType == 11 ?
        byTagRaw(tag, from) : from.getElementsByTagName(tag);
      if (tag == '*') {
        while ((element = elements[++i])) {
          if (element.nodeName > '@') {
            data[++j] = element;
          }
        }
      } else {
        while ((element = elements[++i])) {
          data[i] = element;
        }
      }
      return data;
    },

  // publicly exposed byTag
  // @return array
  byTag =
    function(tag, from) {
      from || (from = doc);
      if (lastContext !== from) { switchContext(from); }
      return _byTag(tag, from);
    },

  // publicly exposed byName
  // @return array
  byName =
    function(name, from) {
      return select('[name="' + name.replace(/\\([^\\]{1})/g, '$1') + '"]', from);
    },

  // elements by class (raw)
  // @return array
  byClassRaw =
    function(name, from) {
      var i = -1, j = i, data = [ ], element, elements = _byTag('*', from), n;
      name = ' ' + (QUIRKS_MODE ? name.toLowerCase() : name) + ' ';
      while ((element = elements[++i])) {
        n = XML_DOCUMENT ? element.getAttribute('class') : element.className;
        if (n && n.length && (' ' + (QUIRKS_MODE ? n.toLowerCase() : n).
          replace(reWhiteSpace, ' ') + ' ').indexOf(name) > -1) {
          data[++j] = element;
        }
      }
      return data;
    },

  // elements by class
  // @return array
  _byClass =
    function(name, from) {
      name = QUIRKS_MODE ? name.toLowerCase() : name;
      name = (/\\/).test(name) ? unescapeIdentifier(name) : name;
      return (BUGGY_GEBCN || BUGGY_QUIRKS_GEBCN || XML_DOCUMENT || !from.getElementsByClassName) ?
        byClassRaw(name, from) : slice.call(from.getElementsByClassName(name));
    },

  // publicly exposed byClass
  // @return array
  byClass =
    function(name, from) {
      from || (from = doc);
      if (lastContext !== from) { switchContext(from); }
      return _byClass(name, from);
    },

  // check element is descendant of container
  // @return boolean
  contains = 'compareDocumentPosition' in root ?
    function(container, element) {
      return (container.compareDocumentPosition(element) & 16) == 16;
    } : 'contains' in root ?
    function(container, element) {
      return container !== element && container.contains(element);
    } :
    function(container, element) {
      while ((element = element.parentNode)) {
        if (element === container) return true;
      }
      return false;
    },

  // attribute value
  // @return string
  getAttribute = !BUGGY_GET_ATTRIBUTE && !IE_LT_9 ?
    function(node, attribute) {
      return node.getAttribute(attribute);
    } :
    function(node, attribute) {
      attribute = attribute.toLowerCase();
      if (typeof node[attribute] == 'object') {
        return node.attributes[attribute] &&
          node.attributes[attribute].value;
      }
      return (
        // 'type' can only be read by using native getAttribute
        attribute == 'type' ? node.getAttribute(attribute) :
        // specific URI data attributes (parameter 2 to fix IE bug)
        ATTR_URIDATA[attribute] ? node.getAttribute(attribute, 2) :
        // boolean attributes should return name instead of true/false
        ATTR_BOOLEAN[attribute] ? node.getAttribute(attribute) ? attribute : 'false' :
          (node = node.getAttributeNode(attribute)) && node.value);
    },

  // attribute presence
  // @return boolean
  hasAttribute = !BUGGY_HAS_ATTRIBUTE && !IE_LT_9 ?
    function(node, attribute) {
      return XML_DOCUMENT ?
        !!node.getAttribute(attribute) :
        node.hasAttribute(attribute);
    } :
    function(node, attribute) {
      // read the node attribute object
      var obj = node.getAttributeNode(attribute = attribute.toLowerCase());
      return ATTR_DEFAULT[attribute] && attribute != 'value' ?
        node[ATTR_DEFAULT[attribute]] : obj && obj.specified;
    },

  // check node emptyness
  // @return boolean
  isEmpty =
    function(node) {
      node = node.firstChild;
      while (node) {
        if (node.nodeType == 3 || node.nodeName > '@') return false;
        node = node.nextSibling;
      }
      return true;
    },

  // check if element matches the :link pseudo
  // @return boolean
  isLink =
    function(element) {
      return hasAttribute(element,'href') && LINK_NODES[element.nodeName];
    },

  // child position by nodeType
  // @return number
  nthElement =
    function(element, last) {
      var count = 1, succ = last ? 'nextSibling' : 'previousSibling';
      while ((element = element[succ])) {
        if (element.nodeName > '@') ++count;
      }
      return count;
    },

  // child position by nodeName
  // @return number
  nthOfType =
    function(element, last) {
      var count = 1, succ = last ? 'nextSibling' : 'previousSibling', type = element.nodeName;
      while ((element = element[succ])) {
        if (element.nodeName == type) ++count;
      }
      return count;
    },

  /*------------------------------- DEBUGGING --------------------------------*/

  // get/set (string/object) working modes
  configure =
    function(option) {
      if (typeof option == 'string') { return !!Config[option]; }
      if (typeof option != 'object') { return Config; }
      for (var i in option) {
        Config[i] = !!option[i];
        if (i == 'SIMPLENOT') {
          matchContexts = { };
          matchResolvers = { };
          selectContexts = { };
          selectResolvers = { };
          if (!Config[i]) { Config['USE_QSAPI'] = false; }
        } else if (i == 'USE_QSAPI') {
          Config[i] = !!option[i] && NATIVE_QSAPI;
        }
      }
      setIdentifierSyntax();
      reValidator = RegExp(Config.SIMPLENOT ?
        standardValidator : extendedValidator);
      return true;
    },

  // control user notifications
  emit =
    function(message) {
      if (Config.VERBOSITY) { throw Error(message); }
      if (Config.LOGERRORS && console && console.log) {
        console.log(message);
      }
    },

  Config = {

    // true to enable caching of result sets, false to disable
    CACHING: false,

    // true to allow CSS escaped identifiers, false to disallow
    ESCAPECHR: true,

    // true to allow identifiers containing non-ASCII (utf-8) chars
    NON_ASCII: true,

    // switch syntax RE, true to use Level 3, false to use Level 2
    SELECTOR3: true,

    // true to allow identifiers containing Unicode (utf-16) chars
    UNICODE16: true,

    // by default do not add missing left/right context
    // to mangled selector strings like "+div" or "ul>"
    // callable Dom.shortcuts method has to be available
    SHORTCUTS: false,

    // true to disable complex selectors nested in
    // ':not()' pseudo-classes as for specifications
    SIMPLENOT: true,

    // true to match lowercase tag names of SVG elements in HTML
    SVG_LCASE: false,

    // strict QSA match all non-unique IDs (false)
    // speed & libs compat match unique ID (true)
    UNIQUE_ID: true,

    // true to follow HTML5 specs handling of ":checked"
    // pseudo-class and similar UI states (indeterminate)
    USE_HTML5: true,

    // true to use browsers native Query Selector API if available
    USE_QSAPI: NATIVE_QSAPI,

    // true to throw exceptions, false to skip throwing exceptions
    VERBOSITY: true,

    // true to print console errors or warnings, false to mute them
    LOGERRORS: true

  },

  /*---------------------------- COMPILER METHODS ----------------------------*/

  // init REs and context
  initialize =
    function(doc) {
      setIdentifierSyntax();
      switchContext(doc, true);
    },

  // set/reset default identifier syntax
  // based on user configuration options
  // rebuild the validator and other REs
  setIdentifierSyntax =
    function() {

      var syntax = '', start = Config['SELECTOR3'] ? '-{2}|' : '';

      Config['NON_ASCII'] && (syntax += '|' + non_asc_chr);
      Config['UNICODE16'] && (syntax += '|' + unicode_chr);
      Config['ESCAPECHR'] && (syntax += '|' + escaped_chr);

      syntax += (Config['UNICODE16'] || Config['ESCAPECHR']) ? '' : '|' + any_esc_chr;

      identifier = '-?(?:' + start + alphalodash + syntax + ')(?:-|[0-9]|' + alphalodash + syntax + ')*';

      // build attribute string
      attrcheck = '(' + quotedvalue + '|' + identifier + ')';
      attributes = whitespace + '*(' + identifier + '(?::' + identifier + ')?)' +
        whitespace + '*(?:' + operators + whitespace + '*' + attrcheck + ')?' + whitespace + '*' + '(i)?' + whitespace + '*';
      attrmatcher = attributes.replace(attrcheck, '([\\x22\\x27]*)((?:\\\\?.)*?)\\3');

      // build pseudoclass string
      pseudoclass = '((?:' +
        // an+b parameters or quoted string
        pseudoparms + '|' + quotedvalue + '|' +
        // id, class, pseudo-class selector
        prefixes + identifier + '|' +
        // nested HTML attribute selector
        '\\[' + attributes + '\\]|' +
        // nested pseudo-class selector
        '\\(.+\\)|' + whitespace + '*|' +
        // nested pseudos/separators
        ',)+)';

      // CSS3: syntax scanner and
      // one pass validation only
      // using regular expression
      standardValidator =
        // discard start
        '(?=[\\x20\\t\\n\\r\\f]*[^>+~(){}<>])' +
        // open match group
        '(' +
        //universal selector
        '\\*' +
        // id/class/tag/pseudo-class identifier
        '|(?:' + prefixes + identifier + ')' +
        // combinator selector
        '|' + combinators +
        // HTML attribute selector
        '|\\[' + attributes + '\\]' +
        // pseudo-classes parameters
        '|\\(' + pseudoclass + '\\)' +
        // dom properties selector (extension)
        '|\\{' + extensions + '\\}' +
        // selector group separator (comma)
        '|(?:,|' + whitespace + '*)' +
        // close match group
        ')+';

      // only allow simple selectors nested in ':not()' pseudo-classes
      reSimpleNot = RegExp('^(' +
        '(?!:not)' +
        '(' + prefixes + identifier +
        '|\\([^()]*\\))+' +
        '|\\[' + attributes + '\\]' +
        ')$');

      // split last, right most, selector group token
      reSplitToken = RegExp('(' +
        prefixes + identifier + '|' +
        '\\[' + attributes + '\\]|' +
        '\\(' + pseudoclass + '\\)|' +
        '\\\\.|[^\\x20\\t\\n\\r\\f>+~])+', 'g');

      reOptimizeSelector = RegExp(identifier + '|^$');

      reSimpleSelector = RegExp(
        BUGGY_GEBTN && BUGGY_GEBCN || OPERA ?
          '^#?' + identifier + '$' : BUGGY_GEBTN ?
          '^[.#]?' + identifier + '$' : BUGGY_GEBCN ?
          '^(?:\\*|#' + identifier + ')$' :
          '^(?:\\*|[.#]?' + identifier + ')$');

      // matches class selectors
      reClass = RegExp('(?:\\[[\\x20\\t\\n\\r\\f]*class\\b|\\.' + identifier + ')');

      Optimize = {
        ID: RegExp('^\\*?#(' + identifier + ')|' + skip_groups),
        TAG: RegExp('^(' + identifier + ')|' + skip_groups),
        CLASS: RegExp('^\\.(' + identifier + '$)|' + skip_groups)
      };

      Patterns.id = RegExp('^#(' + identifier + ')(.*)');
      Patterns.tagName = RegExp('^(' + identifier + ')(.*)');
      Patterns.className = RegExp('^\\.(' + identifier + ')(.*)');
      Patterns.attribute = RegExp('^\\[' + attrmatcher + '\\](.*)');

      Tokens.identifier = identifier;
      Tokens.attributes = attributes;

      // validator for complex selectors in ':not()' pseudo-classes
      extendedValidator = standardValidator.replace(pseudoclass, '.*');

      // validator for standard selectors as default
      reValidator = RegExp(standardValidator);
    },

  // code string reused to build compiled functions
  ACCEPT_NODE = 'r[r.length]=c[k];if(f&&false===f(c[k]))break main;else continue main;',

  // compile a comma separated group of selector
  // @mode boolean true for select, false for match
  // return a compiled function
  compile =
    function(selector, source, mode) {

      var parts = typeof selector == 'string' ? selector.match(reSplitGroup) : selector;

      // ensures that source is a string
      typeof source == 'string' || (source = '');

      if (parts.length == 1) {
        source += compileSelector(parts[0], mode ? ACCEPT_NODE : 'f&&f(k);return true;', mode);
      } else {
        // for each selector in the group
        var i = -1, seen = { }, token;
        while ((token = parts[++i])) {
          token = token.replace(reTrimSpaces, '');
          // avoid repeating the same token
          // in comma separated group (p, p)
          if (!seen[token] && (seen[token] = true)) {
            source += compileSelector(token, mode ? ACCEPT_NODE : 'f&&f(k);return true;', mode);
          }
        }
      }

      if (mode) {
        // for select method
        return Function('c,s,d,h,g,f',
          'var N,n,x=0,k=-1,e,r=[];main:while((e=c[++k])){' + source + '}return r;');
      } else {
        // for match method
        return Function('e,s,d,h,g,f',
          'var N,n,x=0,k=e;' + source + 'return false;');
      }
    },

  // compile a CSS3 string selector into ad-hoc javascript matching function
  // @return string (to be compiled)
  compileSelector =
    function(selector, source, mode) {

      var a, b, n, k = 0, expr, match, result, status, test, type;

      while (selector) {

        k++;

        // *** Universal selector
        // * match all (empty block, do not remove)
        if ((match = selector.match(Patterns.universal))) {
          // do nothing, handled in the compiler where
          // BUGGY_GEBTN return comment nodes (ex: IE)
          expr = '';
        }

        // *** ID selector
        // #Foo Id case sensitive
        else if ((match = selector.match(Patterns.id))) {
          // document can contain conflicting elements (id/name)
          // prototype selector unit need this method to recover bad HTML forms
          match[1] = (/\\/).test(match[1]) ? convertEscapes(match[1]) : match[1];
          source = 'if(' + (XML_DOCUMENT ?
            's.getAttribute(e,"id")' :
            '(e.submit?s.getAttribute(e,"id"):e.id)') +
            '=="' + match[1] + '"' +
            '){' + source + '}';
        }

        // *** Type selector
        // Foo Tag (case insensitive)
        else if ((match = selector.match(Patterns.tagName))) {
          // both tagName and nodeName properties may be upper/lower case
          // depending on their creation NAMESPACE in createElementNS()
          test = Config.SVG_LCASE ? '||e.nodeName=="' + match[1].toLowerCase() + '"' : '';
          source = 'if(e.nodeName' + (XML_DOCUMENT ?
            '=="' + match[1] + '"' : '.toUpperCase()' +
            '=="' + match[1].toUpperCase() + '"' + test) +
            '){' + source + '}';
        }

        // *** Class selector
        // .Foo Class (case sensitive)
        else if ((match = selector.match(Patterns.className))) {
          // W3C CSS3 specs: element whose "class" attribute has been assigned a
          // list of whitespace-separated values, see section 6.4 Class selectors
          // and notes at the bottom; explicitly non-normative in this specification.
          match[1] = (/\\/).test(match[1]) ? convertEscapes(match[1]) : match[1];
          match[1] = QUIRKS_MODE ? match[1].toLowerCase() : match[1];
          source = 'if((n=' + (XML_DOCUMENT ?
            's.getAttribute(e,"class")' : 'e.className') +
            ')&&n.length&&(" "+' + (QUIRKS_MODE ? 'n.toLowerCase()' : 'n') +
            '.replace(/' + whitespace + '+/g," ")+" ").indexOf(" ' + match[1] + ' ")>-1' +
            '){' + source + '}';
        }

        // *** Attribute selector
        // [attr] [attr=value] [attr="value"] [attr='value'] and !=, *=, ~=, |=, ^=, $=
        // case sensitivity is treated differently depending on the document type (see map)
        else if ((match = selector.match(Patterns.attribute))) {

          // xml namespaced attribute ?
          expr = match[1].split(':');
          expr = expr.length == 2 ? expr[1] : expr[0] + '';

          if (match[2] && !Operators[match[2]]) {
            emit('Unsupported operator in attribute selectors "' + selector + '"');
            return '';
          }

          test = 'false';

          // replace Operators parameter if needed
          if (match[2] && match[4] && (test = Operators[match[2]])) {
            match[4] = (/\\/).test(match[4]) ? convertEscapes(match[4]) : match[4];
            // case treatment depends on document type
            type = match[5] == 'i' || HTML_TABLE[expr.toLowerCase()];
            test = test.replace(/\%m/g, type ? match[4].toLowerCase() : match[4]);
          } else if (match[2] == '!=' || match[2] == '=') {
            test = 'n' + match[2] + '=""';
          }

          source = 'if(n=s.hasAttribute(e,"' + match[1] + '")){' +
            (match[2] ? 'n=s.getAttribute(e,"' + match[1] + '")' : '') +
            (type && match[2] ? '.toLowerCase();' : ';') +
            'if(' + (match[2] ? test : 'n') + '){' + source + '}}';

        }

        // *** Adjacent sibling combinator
        // E + F (F adiacent sibling of E)
        else if ((match = selector.match(Patterns.adjacent))) {
          source = NATIVE_TRAVERSAL_API ?
            'var N' + k + '=e;if((e=e.previousElementSibling)){' + source + '}e=N' + k + ';' :
            'var N' + k + '=e;while((e=e.previousSibling)){if(e.nodeType==1){' + source + 'break;}}e=N' + k + ';';
        }

        // *** General sibling combinator
        // E ~ F (F relative sibling of E)
        else if ((match = selector.match(Patterns.relative))) {
          source = NATIVE_TRAVERSAL_API ?
            'var N' + k + '=e;while((e=e.previousElementSibling)){' + source + '}e=N' + k + ';' :
            'var N' + k + '=e;while((e=e.previousSibling)){if(e.nodeType==1){' + source + '}}e=N' + k + ';';
        }

        // *** Child combinator
        // E > F (F children of E)
        else if ((match = selector.match(Patterns.children))) {
          source = 'var N' + k + '=e;if((e=e.parentNode)&&e.nodeType==1){' + source + '}e=N' + k + ';';
        }

        // *** Descendant combinator
        // E F (E ancestor of F)
        else if ((match = selector.match(Patterns.ancestor))) {
          source = 'var N' + k + '=e;while((e=e.parentNode)&&e.nodeType==1){' + source + '}e=N' + k + ';';
        }

        // *** Structural pseudo-classes
        // :root, :empty,
        // :first-child, :last-child, :only-child,
        // :first-of-type, :last-of-type, :only-of-type,
        // :nth-child(), :nth-last-child(), :nth-of-type(), :nth-last-of-type()
        else if ((match = selector.match(Patterns.spseudos)) && match[1]) {

          switch (match[1]) {
            case 'root':
              // element root of the document
              if (match[3]) {
                source = 'if(e===h||s.contains(h,e)){' + source + '}';
              } else {
                source = 'if(e===h){' + source + '}';
              }
              break;

            case 'empty':
              // element that has no children
              source = 'if(s.isEmpty(e)){' + source + '}';
              break;

            default:
              if (match[1] && match[2]) {
                if (match[2] == 'n') {
                  source = 'if(e!==h){' + source + '}';
                  break;
                } else if (match[2] == 'even') {
                  a = 2;
                  b = 0;
                } else if (match[2] == 'odd') {
                  a = 2;
                  b = 1;
                } else {
                  // assumes correct "an+b" format, "b" before "a" to keep "n" values
                  b = ((n = match[2].match(/(-?\d+)$/)) ? parseInt(n[1], 10) : 0);
                  a = ((n = match[2].match(/(-?\d*)n/i)) ? parseInt(n[1], 10) : 0);
                  if (n && n[1] == '-') a = -1;
                }

                // build test expression out of structural pseudo (an+b) parameters
                // see here: http://www.w3.org/TR/css3-selectors/#nth-child-pseudo
                test = a > 1 ?
                  (/last/i.test(match[1])) ? '(n-(' + b + '))%' + a + '==0' :
                  'n>=' + b + '&&(n-(' + b + '))%' + a + '==0' : a < -1 ?
                  (/last/i.test(match[1])) ? '(n-(' + b + '))%' + a + '==0' :
                  'n<=' + b + '&&(n-(' + b + '))%' + a + '==0' : a === 0 ?
                  'n==' + b : a == -1 ? 'n<=' + b : 'n>=' + b;

                // 4 cases: 1 (nth) x 4 (child, of-type, last-child, last-of-type)
                source =
                  'if(e!==h){' +
                    'n=s[' + (/-of-type/i.test(match[1]) ? '"nthOfType"' : '"nthElement"') + ']' +
                      '(e,' + (/last/i.test(match[1]) ? 'true' : 'false') + ');' +
                    'if(' + test + '){' + source + '}' +
                  '}';

              } else {
                // 6 cases: 3 (first, last, only) x 1 (child) x 2 (-of-type)
                a = /first/i.test(match[1]) ? 'previous' : 'next';
                n = /only/i.test(match[1]) ? 'previous' : 'next';
                b = /first|last/i.test(match[1]);

                type = /-of-type/i.test(match[1]) ? '&&n.nodeName!=e.nodeName' : '&&n.nodeName<"@"';

                source = 'if(e!==h){' +
                  ( 'n=e;while((n=n.' + a + 'Sibling)' + type + ');if(!n){' + (b ? source :
                    'n=e;while((n=n.' + n + 'Sibling)' + type + ');if(!n){' + source + '}') + '}' ) + '}';
              }
              break;
          }

        }

        // *** negation, user action and target pseudo-classes
        // *** UI element states and dynamic pseudo-classes
        // CSS4 :matches 
        // CSS3 :not, :checked, :enabled, :disabled, :target
        // CSS3 :active, :hover, :focus
        // CSS3 :link, :visited
        else if ((match = selector.match(Patterns.dpseudos)) && match[1]) {

          switch (match[1].match(/^\w+/)[0]) {
            // CSS4 matches pseudo-class
            case 'matches':
              expr = match[3].replace(reTrimSpaces, '');
              source = 'if(s.match(e, "' + expr.replace(/\x22/g, '\\"') + '",g)){' + source +'}';
              break;

            // CSS3 negation pseudo-class
            case 'not':
              // compile nested selectors, DO NOT pass the callback parameter
              // SIMPLENOT allow disabling complex selectors nested
              // in ':not()' pseudo-classes, breaks some test units
              expr = match[3].replace(reTrimSpaces, '');

              if (Config.SIMPLENOT && !reSimpleNot.test(expr)) {
                // see above, log error but continue execution
                emit('Negation pseudo-class only accepts simple selectors "' + selector + '"');
                return '';
              } else {
                if ('compatMode' in doc) {
                  source = 'if(!' + compile(expr, '', false) + '(e,s,d,h,g)){' + source + '}';
                } else {
                  source = 'if(!s.match(e, "' + expr.replace(/\x22/g, '\\"') + '",g)){' + source +'}';
                }
              }
              break;

            // CSS3 UI element states
            case 'checked':
              // for radio buttons checkboxes (HTML4) and options (HTML5)
              source = 'if((typeof e.form!=="undefined"&&(/^(?:radio|checkbox)$/i).test(e.type)&&e.checked)' +
                (Config.USE_HTML5 ? '||(/^option$/i.test(e.nodeName)&&(e.selected||e.checked))' : '') +
                '){' + source + '}';
              break;
            case 'disabled':
              // does not consider hidden input fields
              source = 'if(((typeof e.form!=="undefined"' +
                (Config.USE_HTML5 ? '' : '&&!(/^hidden$/i).test(e.type)') +
                ')||s.isLink(e))&&e.disabled===true){' + source + '}';
              break;
            case 'enabled':
              // does not consider hidden input fields
              source = 'if(((typeof e.form!=="undefined"' +
                (Config.USE_HTML5 ? '' : '&&!(/^hidden$/i).test(e.type)') +
                ')||s.isLink(e))&&e.disabled===false){' + source + '}';
              break;

            // CSS3 lang pseudo-class
            case 'lang':
              test = '';
              if (match[2]) test = match[2].substr(0, 2) + '-';
              source = 'do{(n=e.lang||"").toLowerCase();' +
                'if((n==""&&h.lang=="' + match[2].toLowerCase() + '")||' +
                '(n&&(n=="' + match[2].toLowerCase() +
                '"||n.substr(0,3)=="' + test.toLowerCase() + '")))' +
                '{' + source + 'break;}}while((e=e.parentNode)&&e!==g);';
              break;

            // CSS3 target pseudo-class
            case 'target':
              source = 'if(e.id==d.location.hash.slice(1)){' + source + '}';
              break;

            // CSS3 dynamic pseudo-classes
            case 'link':
              source = 'if(s.isLink(e)&&!e.visited){' + source + '}';
              break;
            case 'visited':
              source = 'if(s.isLink(e)&&e.visited){' + source + '}';
              break;

            // CSS3 user action pseudo-classes IE & FF3 have native support
            // these capabilities may be emulated by some event managers
            case 'active':
              if (XML_DOCUMENT) break;
              source = 'if(e===d.activeElement){' + source + '}';
              break;
            case 'hover':
              if (XML_DOCUMENT) break;
              source = 'if(e===d.hoverElement){' + source + '}';
              break;
            case 'focus':
              if (XML_DOCUMENT) break;
              source = NATIVE_FOCUS ?
                'if(e===d.activeElement&&d.hasFocus()&&(e.type||e.href||typeof e.tabIndex=="number")){' + source + '}' :
                'if(e===d.activeElement&&(e.type||e.href)){' + source + '}';
              break;

            // CSS2 selected pseudo-classes, not part of current CSS3 drafts
            // the 'selected' property is only available for option elements
            case 'selected':
              // fix Safari selectedIndex property bug
              expr = BUGGY_SELECTED ? '||(n=e.parentNode)&&n.options[n.selectedIndex]===e' : '';
              source = 'if(/^option$/i.test(e.nodeName)&&(e.selected||e.checked' + expr + ')){' + source + '}';
              break;

            default:
              break;
          }

        }

        else if ((match = selector.match(Patterns.epseudos)) && match[1]) {
          source = 'if(!(/1|11/).test(e.nodeType)){' + source + '}';
        }

        else {

          // this is where external extensions are
          // invoked if expressions match selectors
          expr = false;
          status = false;
          for (expr in Selectors) {
            if ((match = selector.match(Selectors[expr].Expression)) && match[1]) {
              result = Selectors[expr].Callback(match, source);
              if ('match' in result) { match = result.match; }
              source = result.source;
              status = result.status;
              if (status) { break; }
            }
          }

          // if an extension fails to parse the selector
          // it must return a false boolean in "status"
          if (!status) {
            // log error but continue execution, don't throw real exceptions
            // because blocking following processes maybe is not a good idea
            emit('Unknown pseudo-class selector "' + selector + '"');
            return '';
          }

          if (!expr) {
            // see above, log error but continue execution
            emit('Unknown token in selector "' + selector + '"');
            return '';
          }

        }

        // error if no matches found by the pattern scan
        if (!match) {
          emit('Invalid syntax in selector "' + selector + '"');
          return '';
        }

        // ensure "match" is not null or empty since
        // we do not throw real DOMExceptions above
        selector = match && match[match.length - 1];
      }

      return source;
    },

  /*----------------------------- QUERY METHODS ------------------------------*/

  // match element with selector
  // @return boolean
  match =
    function(element, selector, from, callback) {

      var parts;

      if (!(element && element.nodeType == 1)) {
        emit('Invalid element argument');
        return false;
      } else if (typeof selector != 'string') {
        emit('Invalid selector argument');
        return false;
      } else if (from && from.nodeType == 1 && !contains(from, element)) {
        return false;
      } else if (lastContext !== from) {
        // reset context data when it changes
        // and ensure context is set to a default
        switchContext(from || (from = element.ownerDocument));
      }

      // normalize the selector string, remove [\n\r\f]
      // whitespace, replace codepoints 0 with '\ufffd'
      // trim non-relevant leading/trailing whitespaces
      selector = selector.
        replace(reTrimSpaces, '').
        replace(/\x00|\\$/g, '\ufffd');

      Config.SHORTCUTS && (selector = Dom.shortcuts(selector, element, from));

      if (lastMatcher != selector) {
        // process valid selector strings
        if ((parts = selector.match(reValidator)) && parts[0] == selector) {
          isSingleMatch = (parts = selector.match(reSplitGroup)).length < 2;
          // save passed selector
          lastMatcher = selector;
          lastPartsMatch = parts;
        } else {
          emit('The string "' + selector + '", is not a valid CSS selector');
          return false;
        }
      } else parts = lastPartsMatch;

      // compile matcher resolvers if necessary
      if (!matchResolvers[selector] || matchContexts[selector] !== from) {
        matchResolvers[selector] = compile(isSingleMatch ? [selector] : parts, '', false);
        matchContexts[selector] = from;
      }

      return matchResolvers[selector](element, Snapshot, doc, root, from, callback);
    },

  // select only the first element
  // matching selector (document ordered)
  first =
    function(selector, from) {
      return select(selector, from, function() { return false; })[0] || null;
    },

  // select elements matching selector
  // using new Query Selector API
  // or cross-browser client API
  // @return array
  select =
    function(selector, from, callback) {

      var i, changed, element, elements, parts, token, original = selector;

      if (arguments.length === 0) {
        emit('Not enough arguments');
        return [ ];
      } else if (typeof selector != 'string') {
        return [ ];
      } else if (from && !(/1|9|11/).test(from.nodeType)) {
        emit('Invalid or illegal context element');
        return [ ];
      } else if (lastContext !== from) {
        // reset context data when it changes
        // and ensure context is set to a default
        switchContext(from || (from = doc));
      }

      if (Config.CACHING && (elements = Dom.loadResults(original, from, doc, root))) {
        return callback ? concatCall([ ], elements, callback) : elements;
      }

      // normalize the selector string, remove [\n\r\f]
      // whitespace, replace codepoints 0 with '\ufffd'
      // trim non-relevant leading/trailing whitespaces
      selector = selector.
        replace(reTrimSpaces, '').
        replace(/\x00|\\$/g, '\ufffd');

      if (!OPERA_QSAPI && reSimpleSelector.test(selector)) {
        switch (selector.charAt(0)) {
          case '#':
            if (Config.UNIQUE_ID) {
              elements = (element = _byId(selector.slice(1), from)) ? [ element ] : [ ];
            }
            break;
          case '.':
            elements = _byClass(selector.slice(1), from);
            break;
          default:
            elements = _byTag(selector, from);
            break;
        }
      }

      else if (!XML_DOCUMENT && Config.USE_QSAPI &&
        !(BUGGY_QUIRKS_QSAPI && reClass.test(selector)) &&
        !RE_BUGGY_QSAPI.test(selector)) {
        try {
          elements = from.querySelectorAll(selector);
        } catch(e) { }
      }

      if (elements) {
        elements = callback ? concatCall([ ], elements, callback) :
          NATIVE_SLICE_PROTO ? slice.call(elements) : concatList([ ], elements);
        Config.CACHING && Dom.saveResults(original, from, doc, elements);
        return elements;
      }

      Config.SHORTCUTS && (selector = Dom.shortcuts(selector, from));

      if ((changed = lastSelector != selector)) {
        // process valid selector strings
        if ((parts = selector.match(reValidator)) && parts[0] == selector) {
          isSingleSelect = (parts = selector.match(reSplitGroup)).length < 2;
          // save passed selector
          lastSelector = selector;
          lastPartsSelect = parts;
        } else {
          emit('The string "' + selector + '", is not a valid CSS selector');
          return [ ];
        }
      } else parts = lastPartsSelect;

      // commas separators are treated sequentially to maintain order
      if (from.nodeType == 11) {

        elements = byTagRaw('*', from);

      } else if (!XML_DOCUMENT && isSingleSelect) {

        if (changed) {
          // get right most selector token
          parts = selector.match(reSplitToken);
          token = parts[parts.length - 1];

          // only last slice before :not rules
          lastSlice = token.split(':not');
          lastSlice = lastSlice[lastSlice.length - 1];

          // position where token was found
          lastPosition = selector.length - token.length;
        }

        // ID optimization RTL, to reduce number of elements to visit
        if (Config.UNIQUE_ID && lastSlice && (parts = lastSlice.match(Optimize.ID)) && (token = parts[1])) {
          if ((element = _byId(token, from))) {
            if (match(element, selector)) {
              callback && callback(element);
              elements = [element];
            } else elements = [ ];
          }
        }

        // ID optimization LTR, to reduce selection context searches
        else if (Config.UNIQUE_ID && (parts = selector.match(Optimize.ID)) && (token = parts[1])) {
          if ((element = _byId(token, doc))) {
            if ('#' + token == selector) {
              callback && callback(element);
              elements = [element];
            } else if (/[>+~]/.test(selector)) {
              from = element.parentNode;
            } else {
              from = element;
            }
          } else elements = [ ];
        }

        if (elements) {
          Config.CACHING && Dom.saveResults(original, from, doc, elements);
          return elements;
        }

        if (!NATIVE_GEBCN && lastSlice && (parts = lastSlice.match(Optimize.TAG)) && (token = parts[1])) {
          if ((elements = _byTag(token, from)).length === 0) { return [ ]; }
          selector = selector.slice(0, lastPosition) + selector.slice(lastPosition).replace(token, '*');
        }

        else if (lastSlice && (parts = lastSlice.match(Optimize.CLASS)) && (token = parts[1])) {
          if ((elements = _byClass(token, from)).length === 0) { return [ ]; }
          selector = selector.slice(0, lastPosition) + selector.slice(lastPosition).replace('.' + token,
            reOptimizeSelector.test(selector.charAt(selector.indexOf(token) - 1)) ? '' : '*');
        }

        else if ((parts = selector.match(Optimize.CLASS)) && (token = parts[1])) {
          if ((elements = _byClass(token, from)).length === 0) { return [ ]; }
          for (i = 0, els = [ ]; elements.length > i; ++i) {
            els = concatList(els, elements[i].getElementsByTagName('*'));
          }
          elements = els;
          selector = selector.slice(0, lastPosition) + selector.slice(lastPosition).replace('.' + token,
            reOptimizeSelector.test(selector.charAt(selector.indexOf(token) - 1)) ? '' : '*');
        }

        else if (NATIVE_GEBCN && lastSlice && (parts = lastSlice.match(Optimize.TAG)) && (token = parts[1])) {
          if ((elements = _byTag(token, from)).length === 0) { return [ ]; }
          selector = selector.slice(0, lastPosition) + selector.slice(lastPosition).replace(token, '*');
        }

      }

      if (!elements) {
        if (IE_LT_9) {
          elements = /^(?:applet|object)$/i.test(from.nodeName) ? from.children : byTagRaw('*', from);
        } else {
          elements = from.getElementsByTagName('*');
        }
      }
      // end of prefiltering pass

      // compile selector resolver if necessary
      if (!selectResolvers[selector] || selectContexts[selector] !== from) {
        selectResolvers[selector] = compile(isSingleSelect ? [selector] : parts, '', true);
        selectContexts[selector] = from;
      }

      elements = selectResolvers[selector](elements, Snapshot, doc, root, from, callback);

      Config.CACHING && Dom.saveResults(original, from, doc, elements);

      return elements;
    },

  /*-------------------------------- STORAGE ---------------------------------*/

  // empty function handler
  FN = function(x) { return x; },

  // compiled match functions returning booleans
  matchContexts = { },
  matchResolvers = { },

  // compiled select functions returning collections
  selectContexts = { },
  selectResolvers = { },

  // used to pass methods to compiled functions
  Snapshot = {

    // element indexing methods
    nthElement: nthElement,
    nthOfType: nthOfType,

    // element inspection methods
    getAttribute: getAttribute,
    hasAttribute: hasAttribute,

    // element selection methods
    byClass: _byClass,
    byName: byName,
    byTag: _byTag,
    byId: _byId,

    // helper/check methods
    contains: contains,
    isEmpty: isEmpty,
    isLink: isLink,

    // selection/matching
    select: select,
    match: match
  },

  /*------------------------------- PUBLIC API -------------------------------*/

  // code referenced by extensions
  Dom = {

    ACCEPT_NODE: ACCEPT_NODE,

    // retrieve element by id attr
    byId: byId,

    // retrieve elements by tag name
    byTag: byTag,

    // retrieve elements by name attr
    byName: byName,

    // retrieve elements by class name
    byClass: byClass,

    // read the value of the attribute
    // as was in the original HTML code
    getAttribute: getAttribute,

    // check for the attribute presence
    // as was in the original HTML code
    hasAttribute: hasAttribute,

    // element match selector, return boolean true/false
    match: match,

    // first element match only, return element or null
    first: first,

    // elements matching selector, starting from element
    select: select,

    // compile selector into ad-hoc javascript resolver
    compile: compile,

    // check that two elements are ancestor/descendant
    contains: contains,

    // handle selector engine configuration settings
    configure: configure,

    // initialize caching for each document
    setCache: FN,

    // load previously collected result set
    loadResults: FN,

    // save previously collected result set
    saveResults: FN,

    // handle missing context in selector strings
    shortcuts: FN,

    // log resolvers errors/warnings
    emit: emit,

    // options enabing specific engine functionality
    Config: Config,

    // pass methods references to compiled resolvers
    Snapshot: Snapshot,

    // operators descriptor
    // for attribute operators extensions
    Operators: Operators,

    // selectors descriptor
    // for pseudo-class selectors extensions
    Selectors: Selectors,

    // export validators REs
    Tokens: Tokens,

    // export version string
    Version: version,

    // add or overwrite user defined operators
    registerOperator:
      function(symbol, resolver) {
        Operators[symbol] || (Operators[symbol] = resolver);
      },

    // add selector patterns for user defined callbacks
    registerSelector:
      function(name, rexp, func) {
        Selectors[name] || (Selectors[name] = {
          Expression: rexp,
          Callback: func
        });
      }

  };

  /*---------------------------------- INIT ----------------------------------*/

  // init context specific variables
  initialize(doc);

  return Dom;
});

},{}],25:[function(require,module,exports){
(function (Buffer){(function (){
/**
 * https://opentype.js.org v1.3.4 | (c) Frederik De Bleser and other contributors | MIT License | Uses tiny-inflate by Devon Govett and string.prototype.codepointat polyfill by Mathias Bynens
 */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = global || self, factory(global.opentype = {}));
}(this, (function (exports) { 'use strict';

	/*! https://mths.be/codepointat v0.2.0 by @mathias */
	if (!String.prototype.codePointAt) {
		(function() {
			var defineProperty = (function() {
				// IE 8 only supports `Object.defineProperty` on DOM elements
				try {
					var object = {};
					var $defineProperty = Object.defineProperty;
					var result = $defineProperty(object, object, object) && $defineProperty;
				} catch(error) {}
				return result;
			}());
			var codePointAt = function(position) {
				if (this == null) {
					throw TypeError();
				}
				var string = String(this);
				var size = string.length;
				// `ToInteger`
				var index = position ? Number(position) : 0;
				if (index != index) { // better `isNaN`
					index = 0;
				}
				// Account for out-of-bounds indices:
				if (index < 0 || index >= size) {
					return undefined;
				}
				// Get the first code unit
				var first = string.charCodeAt(index);
				var second;
				if ( // check if it’s the start of a surrogate pair
					first >= 0xD800 && first <= 0xDBFF && // high surrogate
					size > index + 1 // there is a next code unit
				) {
					second = string.charCodeAt(index + 1);
					if (second >= 0xDC00 && second <= 0xDFFF) { // low surrogate
						// https://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
						return (first - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
					}
				}
				return first;
			};
			if (defineProperty) {
				defineProperty(String.prototype, 'codePointAt', {
					'value': codePointAt,
					'configurable': true,
					'writable': true
				});
			} else {
				String.prototype.codePointAt = codePointAt;
			}
		}());
	}

	var TINF_OK = 0;
	var TINF_DATA_ERROR = -3;

	function Tree() {
	  this.table = new Uint16Array(16);   /* table of code length counts */
	  this.trans = new Uint16Array(288);  /* code -> symbol translation table */
	}

	function Data(source, dest) {
	  this.source = source;
	  this.sourceIndex = 0;
	  this.tag = 0;
	  this.bitcount = 0;
	  
	  this.dest = dest;
	  this.destLen = 0;
	  
	  this.ltree = new Tree();  /* dynamic length/symbol tree */
	  this.dtree = new Tree();  /* dynamic distance tree */
	}

	/* --------------------------------------------------- *
	 * -- uninitialized global data (static structures) -- *
	 * --------------------------------------------------- */

	var sltree = new Tree();
	var sdtree = new Tree();

	/* extra bits and base tables for length codes */
	var length_bits = new Uint8Array(30);
	var length_base = new Uint16Array(30);

	/* extra bits and base tables for distance codes */
	var dist_bits = new Uint8Array(30);
	var dist_base = new Uint16Array(30);

	/* special ordering of code length codes */
	var clcidx = new Uint8Array([
	  16, 17, 18, 0, 8, 7, 9, 6,
	  10, 5, 11, 4, 12, 3, 13, 2,
	  14, 1, 15
	]);

	/* used by tinf_decode_trees, avoids allocations every call */
	var code_tree = new Tree();
	var lengths = new Uint8Array(288 + 32);

	/* ----------------------- *
	 * -- utility functions -- *
	 * ----------------------- */

	/* build extra bits and base tables */
	function tinf_build_bits_base(bits, base, delta, first) {
	  var i, sum;

	  /* build bits table */
	  for (i = 0; i < delta; ++i) { bits[i] = 0; }
	  for (i = 0; i < 30 - delta; ++i) { bits[i + delta] = i / delta | 0; }

	  /* build base table */
	  for (sum = first, i = 0; i < 30; ++i) {
	    base[i] = sum;
	    sum += 1 << bits[i];
	  }
	}

	/* build the fixed huffman trees */
	function tinf_build_fixed_trees(lt, dt) {
	  var i;

	  /* build fixed length tree */
	  for (i = 0; i < 7; ++i) { lt.table[i] = 0; }

	  lt.table[7] = 24;
	  lt.table[8] = 152;
	  lt.table[9] = 112;

	  for (i = 0; i < 24; ++i) { lt.trans[i] = 256 + i; }
	  for (i = 0; i < 144; ++i) { lt.trans[24 + i] = i; }
	  for (i = 0; i < 8; ++i) { lt.trans[24 + 144 + i] = 280 + i; }
	  for (i = 0; i < 112; ++i) { lt.trans[24 + 144 + 8 + i] = 144 + i; }

	  /* build fixed distance tree */
	  for (i = 0; i < 5; ++i) { dt.table[i] = 0; }

	  dt.table[5] = 32;

	  for (i = 0; i < 32; ++i) { dt.trans[i] = i; }
	}

	/* given an array of code lengths, build a tree */
	var offs = new Uint16Array(16);

	function tinf_build_tree(t, lengths, off, num) {
	  var i, sum;

	  /* clear code length count table */
	  for (i = 0; i < 16; ++i) { t.table[i] = 0; }

	  /* scan symbol lengths, and sum code length counts */
	  for (i = 0; i < num; ++i) { t.table[lengths[off + i]]++; }

	  t.table[0] = 0;

	  /* compute offset table for distribution sort */
	  for (sum = 0, i = 0; i < 16; ++i) {
	    offs[i] = sum;
	    sum += t.table[i];
	  }

	  /* create code->symbol translation table (symbols sorted by code) */
	  for (i = 0; i < num; ++i) {
	    if (lengths[off + i]) { t.trans[offs[lengths[off + i]]++] = i; }
	  }
	}

	/* ---------------------- *
	 * -- decode functions -- *
	 * ---------------------- */

	/* get one bit from source stream */
	function tinf_getbit(d) {
	  /* check if tag is empty */
	  if (!d.bitcount--) {
	    /* load next tag */
	    d.tag = d.source[d.sourceIndex++];
	    d.bitcount = 7;
	  }

	  /* shift bit out of tag */
	  var bit = d.tag & 1;
	  d.tag >>>= 1;

	  return bit;
	}

	/* read a num bit value from a stream and add base */
	function tinf_read_bits(d, num, base) {
	  if (!num)
	    { return base; }

	  while (d.bitcount < 24) {
	    d.tag |= d.source[d.sourceIndex++] << d.bitcount;
	    d.bitcount += 8;
	  }

	  var val = d.tag & (0xffff >>> (16 - num));
	  d.tag >>>= num;
	  d.bitcount -= num;
	  return val + base;
	}

	/* given a data stream and a tree, decode a symbol */
	function tinf_decode_symbol(d, t) {
	  while (d.bitcount < 24) {
	    d.tag |= d.source[d.sourceIndex++] << d.bitcount;
	    d.bitcount += 8;
	  }
	  
	  var sum = 0, cur = 0, len = 0;
	  var tag = d.tag;

	  /* get more bits while code value is above sum */
	  do {
	    cur = 2 * cur + (tag & 1);
	    tag >>>= 1;
	    ++len;

	    sum += t.table[len];
	    cur -= t.table[len];
	  } while (cur >= 0);
	  
	  d.tag = tag;
	  d.bitcount -= len;

	  return t.trans[sum + cur];
	}

	/* given a data stream, decode dynamic trees from it */
	function tinf_decode_trees(d, lt, dt) {
	  var hlit, hdist, hclen;
	  var i, num, length;

	  /* get 5 bits HLIT (257-286) */
	  hlit = tinf_read_bits(d, 5, 257);

	  /* get 5 bits HDIST (1-32) */
	  hdist = tinf_read_bits(d, 5, 1);

	  /* get 4 bits HCLEN (4-19) */
	  hclen = tinf_read_bits(d, 4, 4);

	  for (i = 0; i < 19; ++i) { lengths[i] = 0; }

	  /* read code lengths for code length alphabet */
	  for (i = 0; i < hclen; ++i) {
	    /* get 3 bits code length (0-7) */
	    var clen = tinf_read_bits(d, 3, 0);
	    lengths[clcidx[i]] = clen;
	  }

	  /* build code length tree */
	  tinf_build_tree(code_tree, lengths, 0, 19);

	  /* decode code lengths for the dynamic trees */
	  for (num = 0; num < hlit + hdist;) {
	    var sym = tinf_decode_symbol(d, code_tree);

	    switch (sym) {
	      case 16:
	        /* copy previous code length 3-6 times (read 2 bits) */
	        var prev = lengths[num - 1];
	        for (length = tinf_read_bits(d, 2, 3); length; --length) {
	          lengths[num++] = prev;
	        }
	        break;
	      case 17:
	        /* repeat code length 0 for 3-10 times (read 3 bits) */
	        for (length = tinf_read_bits(d, 3, 3); length; --length) {
	          lengths[num++] = 0;
	        }
	        break;
	      case 18:
	        /* repeat code length 0 for 11-138 times (read 7 bits) */
	        for (length = tinf_read_bits(d, 7, 11); length; --length) {
	          lengths[num++] = 0;
	        }
	        break;
	      default:
	        /* values 0-15 represent the actual code lengths */
	        lengths[num++] = sym;
	        break;
	    }
	  }

	  /* build dynamic trees */
	  tinf_build_tree(lt, lengths, 0, hlit);
	  tinf_build_tree(dt, lengths, hlit, hdist);
	}

	/* ----------------------------- *
	 * -- block inflate functions -- *
	 * ----------------------------- */

	/* given a stream and two trees, inflate a block of data */
	function tinf_inflate_block_data(d, lt, dt) {
	  while (1) {
	    var sym = tinf_decode_symbol(d, lt);

	    /* check for end of block */
	    if (sym === 256) {
	      return TINF_OK;
	    }

	    if (sym < 256) {
	      d.dest[d.destLen++] = sym;
	    } else {
	      var length, dist, offs;
	      var i;

	      sym -= 257;

	      /* possibly get more bits from length code */
	      length = tinf_read_bits(d, length_bits[sym], length_base[sym]);

	      dist = tinf_decode_symbol(d, dt);

	      /* possibly get more bits from distance code */
	      offs = d.destLen - tinf_read_bits(d, dist_bits[dist], dist_base[dist]);

	      /* copy match */
	      for (i = offs; i < offs + length; ++i) {
	        d.dest[d.destLen++] = d.dest[i];
	      }
	    }
	  }
	}

	/* inflate an uncompressed block of data */
	function tinf_inflate_uncompressed_block(d) {
	  var length, invlength;
	  var i;
	  
	  /* unread from bitbuffer */
	  while (d.bitcount > 8) {
	    d.sourceIndex--;
	    d.bitcount -= 8;
	  }

	  /* get length */
	  length = d.source[d.sourceIndex + 1];
	  length = 256 * length + d.source[d.sourceIndex];

	  /* get one's complement of length */
	  invlength = d.source[d.sourceIndex + 3];
	  invlength = 256 * invlength + d.source[d.sourceIndex + 2];

	  /* check length */
	  if (length !== (~invlength & 0x0000ffff))
	    { return TINF_DATA_ERROR; }

	  d.sourceIndex += 4;

	  /* copy block */
	  for (i = length; i; --i)
	    { d.dest[d.destLen++] = d.source[d.sourceIndex++]; }

	  /* make sure we start next block on a byte boundary */
	  d.bitcount = 0;

	  return TINF_OK;
	}

	/* inflate stream from source to dest */
	function tinf_uncompress(source, dest) {
	  var d = new Data(source, dest);
	  var bfinal, btype, res;

	  do {
	    /* read final block flag */
	    bfinal = tinf_getbit(d);

	    /* read block type (2 bits) */
	    btype = tinf_read_bits(d, 2, 0);

	    /* decompress block */
	    switch (btype) {
	      case 0:
	        /* decompress uncompressed block */
	        res = tinf_inflate_uncompressed_block(d);
	        break;
	      case 1:
	        /* decompress block with fixed huffman trees */
	        res = tinf_inflate_block_data(d, sltree, sdtree);
	        break;
	      case 2:
	        /* decompress block with dynamic huffman trees */
	        tinf_decode_trees(d, d.ltree, d.dtree);
	        res = tinf_inflate_block_data(d, d.ltree, d.dtree);
	        break;
	      default:
	        res = TINF_DATA_ERROR;
	    }

	    if (res !== TINF_OK)
	      { throw new Error('Data error'); }

	  } while (!bfinal);

	  if (d.destLen < d.dest.length) {
	    if (typeof d.dest.slice === 'function')
	      { return d.dest.slice(0, d.destLen); }
	    else
	      { return d.dest.subarray(0, d.destLen); }
	  }
	  
	  return d.dest;
	}

	/* -------------------- *
	 * -- initialization -- *
	 * -------------------- */

	/* build fixed huffman trees */
	tinf_build_fixed_trees(sltree, sdtree);

	/* build extra bits and base tables */
	tinf_build_bits_base(length_bits, length_base, 4, 3);
	tinf_build_bits_base(dist_bits, dist_base, 2, 1);

	/* fix a special case */
	length_bits[28] = 0;
	length_base[28] = 258;

	var tinyInflate = tinf_uncompress;

	// The Bounding Box object

	function derive(v0, v1, v2, v3, t) {
	    return Math.pow(1 - t, 3) * v0 +
	        3 * Math.pow(1 - t, 2) * t * v1 +
	        3 * (1 - t) * Math.pow(t, 2) * v2 +
	        Math.pow(t, 3) * v3;
	}
	/**
	 * A bounding box is an enclosing box that describes the smallest measure within which all the points lie.
	 * It is used to calculate the bounding box of a glyph or text path.
	 *
	 * On initialization, x1/y1/x2/y2 will be NaN. Check if the bounding box is empty using `isEmpty()`.
	 *
	 * @exports opentype.BoundingBox
	 * @class
	 * @constructor
	 */
	function BoundingBox() {
	    this.x1 = Number.NaN;
	    this.y1 = Number.NaN;
	    this.x2 = Number.NaN;
	    this.y2 = Number.NaN;
	}

	/**
	 * Returns true if the bounding box is empty, that is, no points have been added to the box yet.
	 */
	BoundingBox.prototype.isEmpty = function() {
	    return isNaN(this.x1) || isNaN(this.y1) || isNaN(this.x2) || isNaN(this.y2);
	};

	/**
	 * Add the point to the bounding box.
	 * The x1/y1/x2/y2 coordinates of the bounding box will now encompass the given point.
	 * @param {number} x - The X coordinate of the point.
	 * @param {number} y - The Y coordinate of the point.
	 */
	BoundingBox.prototype.addPoint = function(x, y) {
	    if (typeof x === 'number') {
	        if (isNaN(this.x1) || isNaN(this.x2)) {
	            this.x1 = x;
	            this.x2 = x;
	        }
	        if (x < this.x1) {
	            this.x1 = x;
	        }
	        if (x > this.x2) {
	            this.x2 = x;
	        }
	    }
	    if (typeof y === 'number') {
	        if (isNaN(this.y1) || isNaN(this.y2)) {
	            this.y1 = y;
	            this.y2 = y;
	        }
	        if (y < this.y1) {
	            this.y1 = y;
	        }
	        if (y > this.y2) {
	            this.y2 = y;
	        }
	    }
	};

	/**
	 * Add a X coordinate to the bounding box.
	 * This extends the bounding box to include the X coordinate.
	 * This function is used internally inside of addBezier.
	 * @param {number} x - The X coordinate of the point.
	 */
	BoundingBox.prototype.addX = function(x) {
	    this.addPoint(x, null);
	};

	/**
	 * Add a Y coordinate to the bounding box.
	 * This extends the bounding box to include the Y coordinate.
	 * This function is used internally inside of addBezier.
	 * @param {number} y - The Y coordinate of the point.
	 */
	BoundingBox.prototype.addY = function(y) {
	    this.addPoint(null, y);
	};

	/**
	 * Add a Bézier curve to the bounding box.
	 * This extends the bounding box to include the entire Bézier.
	 * @param {number} x0 - The starting X coordinate.
	 * @param {number} y0 - The starting Y coordinate.
	 * @param {number} x1 - The X coordinate of the first control point.
	 * @param {number} y1 - The Y coordinate of the first control point.
	 * @param {number} x2 - The X coordinate of the second control point.
	 * @param {number} y2 - The Y coordinate of the second control point.
	 * @param {number} x - The ending X coordinate.
	 * @param {number} y - The ending Y coordinate.
	 */
	BoundingBox.prototype.addBezier = function(x0, y0, x1, y1, x2, y2, x, y) {
	    // This code is based on http://nishiohirokazu.blogspot.com/2009/06/how-to-calculate-bezier-curves-bounding.html
	    // and https://github.com/icons8/svg-path-bounding-box

	    var p0 = [x0, y0];
	    var p1 = [x1, y1];
	    var p2 = [x2, y2];
	    var p3 = [x, y];

	    this.addPoint(x0, y0);
	    this.addPoint(x, y);

	    for (var i = 0; i <= 1; i++) {
	        var b = 6 * p0[i] - 12 * p1[i] + 6 * p2[i];
	        var a = -3 * p0[i] + 9 * p1[i] - 9 * p2[i] + 3 * p3[i];
	        var c = 3 * p1[i] - 3 * p0[i];

	        if (a === 0) {
	            if (b === 0) { continue; }
	            var t = -c / b;
	            if (0 < t && t < 1) {
	                if (i === 0) { this.addX(derive(p0[i], p1[i], p2[i], p3[i], t)); }
	                if (i === 1) { this.addY(derive(p0[i], p1[i], p2[i], p3[i], t)); }
	            }
	            continue;
	        }

	        var b2ac = Math.pow(b, 2) - 4 * c * a;
	        if (b2ac < 0) { continue; }
	        var t1 = (-b + Math.sqrt(b2ac)) / (2 * a);
	        if (0 < t1 && t1 < 1) {
	            if (i === 0) { this.addX(derive(p0[i], p1[i], p2[i], p3[i], t1)); }
	            if (i === 1) { this.addY(derive(p0[i], p1[i], p2[i], p3[i], t1)); }
	        }
	        var t2 = (-b - Math.sqrt(b2ac)) / (2 * a);
	        if (0 < t2 && t2 < 1) {
	            if (i === 0) { this.addX(derive(p0[i], p1[i], p2[i], p3[i], t2)); }
	            if (i === 1) { this.addY(derive(p0[i], p1[i], p2[i], p3[i], t2)); }
	        }
	    }
	};

	/**
	 * Add a quadratic curve to the bounding box.
	 * This extends the bounding box to include the entire quadratic curve.
	 * @param {number} x0 - The starting X coordinate.
	 * @param {number} y0 - The starting Y coordinate.
	 * @param {number} x1 - The X coordinate of the control point.
	 * @param {number} y1 - The Y coordinate of the control point.
	 * @param {number} x - The ending X coordinate.
	 * @param {number} y - The ending Y coordinate.
	 */
	BoundingBox.prototype.addQuad = function(x0, y0, x1, y1, x, y) {
	    var cp1x = x0 + 2 / 3 * (x1 - x0);
	    var cp1y = y0 + 2 / 3 * (y1 - y0);
	    var cp2x = cp1x + 1 / 3 * (x - x0);
	    var cp2y = cp1y + 1 / 3 * (y - y0);
	    this.addBezier(x0, y0, cp1x, cp1y, cp2x, cp2y, x, y);
	};

	// Geometric objects

	/**
	 * A bézier path containing a set of path commands similar to a SVG path.
	 * Paths can be drawn on a context using `draw`.
	 * @exports opentype.Path
	 * @class
	 * @constructor
	 */
	function Path() {
	    this.commands = [];
	    this.fill = 'black';
	    this.stroke = null;
	    this.strokeWidth = 1;
	}

	/**
	 * @param  {number} x
	 * @param  {number} y
	 */
	Path.prototype.moveTo = function(x, y) {
	    this.commands.push({
	        type: 'M',
	        x: x,
	        y: y
	    });
	};

	/**
	 * @param  {number} x
	 * @param  {number} y
	 */
	Path.prototype.lineTo = function(x, y) {
	    this.commands.push({
	        type: 'L',
	        x: x,
	        y: y
	    });
	};

	/**
	 * Draws cubic curve
	 * @function
	 * curveTo
	 * @memberof opentype.Path.prototype
	 * @param  {number} x1 - x of control 1
	 * @param  {number} y1 - y of control 1
	 * @param  {number} x2 - x of control 2
	 * @param  {number} y2 - y of control 2
	 * @param  {number} x - x of path point
	 * @param  {number} y - y of path point
	 */

	/**
	 * Draws cubic curve
	 * @function
	 * bezierCurveTo
	 * @memberof opentype.Path.prototype
	 * @param  {number} x1 - x of control 1
	 * @param  {number} y1 - y of control 1
	 * @param  {number} x2 - x of control 2
	 * @param  {number} y2 - y of control 2
	 * @param  {number} x - x of path point
	 * @param  {number} y - y of path point
	 * @see curveTo
	 */
	Path.prototype.curveTo = Path.prototype.bezierCurveTo = function(x1, y1, x2, y2, x, y) {
	    this.commands.push({
	        type: 'C',
	        x1: x1,
	        y1: y1,
	        x2: x2,
	        y2: y2,
	        x: x,
	        y: y
	    });
	};

	/**
	 * Draws quadratic curve
	 * @function
	 * quadraticCurveTo
	 * @memberof opentype.Path.prototype
	 * @param  {number} x1 - x of control
	 * @param  {number} y1 - y of control
	 * @param  {number} x - x of path point
	 * @param  {number} y - y of path point
	 */

	/**
	 * Draws quadratic curve
	 * @function
	 * quadTo
	 * @memberof opentype.Path.prototype
	 * @param  {number} x1 - x of control
	 * @param  {number} y1 - y of control
	 * @param  {number} x - x of path point
	 * @param  {number} y - y of path point
	 */
	Path.prototype.quadTo = Path.prototype.quadraticCurveTo = function(x1, y1, x, y) {
	    this.commands.push({
	        type: 'Q',
	        x1: x1,
	        y1: y1,
	        x: x,
	        y: y
	    });
	};

	/**
	 * Closes the path
	 * @function closePath
	 * @memberof opentype.Path.prototype
	 */

	/**
	 * Close the path
	 * @function close
	 * @memberof opentype.Path.prototype
	 */
	Path.prototype.close = Path.prototype.closePath = function() {
	    this.commands.push({
	        type: 'Z'
	    });
	};

	/**
	 * Add the given path or list of commands to the commands of this path.
	 * @param  {Array} pathOrCommands - another opentype.Path, an opentype.BoundingBox, or an array of commands.
	 */
	Path.prototype.extend = function(pathOrCommands) {
	    if (pathOrCommands.commands) {
	        pathOrCommands = pathOrCommands.commands;
	    } else if (pathOrCommands instanceof BoundingBox) {
	        var box = pathOrCommands;
	        this.moveTo(box.x1, box.y1);
	        this.lineTo(box.x2, box.y1);
	        this.lineTo(box.x2, box.y2);
	        this.lineTo(box.x1, box.y2);
	        this.close();
	        return;
	    }

	    Array.prototype.push.apply(this.commands, pathOrCommands);
	};

	/**
	 * Calculate the bounding box of the path.
	 * @returns {opentype.BoundingBox}
	 */
	Path.prototype.getBoundingBox = function() {
	    var box = new BoundingBox();

	    var startX = 0;
	    var startY = 0;
	    var prevX = 0;
	    var prevY = 0;
	    for (var i = 0; i < this.commands.length; i++) {
	        var cmd = this.commands[i];
	        switch (cmd.type) {
	            case 'M':
	                box.addPoint(cmd.x, cmd.y);
	                startX = prevX = cmd.x;
	                startY = prevY = cmd.y;
	                break;
	            case 'L':
	                box.addPoint(cmd.x, cmd.y);
	                prevX = cmd.x;
	                prevY = cmd.y;
	                break;
	            case 'Q':
	                box.addQuad(prevX, prevY, cmd.x1, cmd.y1, cmd.x, cmd.y);
	                prevX = cmd.x;
	                prevY = cmd.y;
	                break;
	            case 'C':
	                box.addBezier(prevX, prevY, cmd.x1, cmd.y1, cmd.x2, cmd.y2, cmd.x, cmd.y);
	                prevX = cmd.x;
	                prevY = cmd.y;
	                break;
	            case 'Z':
	                prevX = startX;
	                prevY = startY;
	                break;
	            default:
	                throw new Error('Unexpected path command ' + cmd.type);
	        }
	    }
	    if (box.isEmpty()) {
	        box.addPoint(0, 0);
	    }
	    return box;
	};

	/**
	 * Draw the path to a 2D context.
	 * @param {CanvasRenderingContext2D} ctx - A 2D drawing context.
	 */
	Path.prototype.draw = function(ctx) {
	    ctx.beginPath();
	    for (var i = 0; i < this.commands.length; i += 1) {
	        var cmd = this.commands[i];
	        if (cmd.type === 'M') {
	            ctx.moveTo(cmd.x, cmd.y);
	        } else if (cmd.type === 'L') {
	            ctx.lineTo(cmd.x, cmd.y);
	        } else if (cmd.type === 'C') {
	            ctx.bezierCurveTo(cmd.x1, cmd.y1, cmd.x2, cmd.y2, cmd.x, cmd.y);
	        } else if (cmd.type === 'Q') {
	            ctx.quadraticCurveTo(cmd.x1, cmd.y1, cmd.x, cmd.y);
	        } else if (cmd.type === 'Z') {
	            ctx.closePath();
	        }
	    }

	    if (this.fill) {
	        ctx.fillStyle = this.fill;
	        ctx.fill();
	    }

	    if (this.stroke) {
	        ctx.strokeStyle = this.stroke;
	        ctx.lineWidth = this.strokeWidth;
	        ctx.stroke();
	    }
	};

	/**
	 * Convert the Path to a string of path data instructions
	 * See http://www.w3.org/TR/SVG/paths.html#PathData
	 * @param  {number} [decimalPlaces=2] - The amount of decimal places for floating-point values
	 * @return {string}
	 */
	Path.prototype.toPathData = function(decimalPlaces) {
	    decimalPlaces = decimalPlaces !== undefined ? decimalPlaces : 2;

	    function floatToString(v) {
	        if (Math.round(v) === v) {
	            return '' + Math.round(v);
	        } else {
	            return v.toFixed(decimalPlaces);
	        }
	    }

	    function packValues() {
	        var arguments$1 = arguments;

	        var s = '';
	        for (var i = 0; i < arguments.length; i += 1) {
	            var v = arguments$1[i];
	            if (v >= 0 && i > 0) {
	                s += ' ';
	            }

	            s += floatToString(v);
	        }

	        return s;
	    }

	    var d = '';
	    for (var i = 0; i < this.commands.length; i += 1) {
	        var cmd = this.commands[i];
	        if (cmd.type === 'M') {
	            d += 'M' + packValues(cmd.x, cmd.y);
	        } else if (cmd.type === 'L') {
	            d += 'L' + packValues(cmd.x, cmd.y);
	        } else if (cmd.type === 'C') {
	            d += 'C' + packValues(cmd.x1, cmd.y1, cmd.x2, cmd.y2, cmd.x, cmd.y);
	        } else if (cmd.type === 'Q') {
	            d += 'Q' + packValues(cmd.x1, cmd.y1, cmd.x, cmd.y);
	        } else if (cmd.type === 'Z') {
	            d += 'Z';
	        }
	    }

	    return d;
	};

	/**
	 * Convert the path to an SVG <path> element, as a string.
	 * @param  {number} [decimalPlaces=2] - The amount of decimal places for floating-point values
	 * @return {string}
	 */
	Path.prototype.toSVG = function(decimalPlaces) {
	    var svg = '<path d="';
	    svg += this.toPathData(decimalPlaces);
	    svg += '"';
	    if (this.fill && this.fill !== 'black') {
	        if (this.fill === null) {
	            svg += ' fill="none"';
	        } else {
	            svg += ' fill="' + this.fill + '"';
	        }
	    }

	    if (this.stroke) {
	        svg += ' stroke="' + this.stroke + '" stroke-width="' + this.strokeWidth + '"';
	    }

	    svg += '/>';
	    return svg;
	};

	/**
	 * Convert the path to a DOM element.
	 * @param  {number} [decimalPlaces=2] - The amount of decimal places for floating-point values
	 * @return {SVGPathElement}
	 */
	Path.prototype.toDOMElement = function(decimalPlaces) {
	    var temporaryPath = this.toPathData(decimalPlaces);
	    var newPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');

	    newPath.setAttribute('d', temporaryPath);

	    return newPath;
	};

	// Run-time checking of preconditions.

	function fail(message) {
	    throw new Error(message);
	}

	// Precondition function that checks if the given predicate is true.
	// If not, it will throw an error.
	function argument(predicate, message) {
	    if (!predicate) {
	        fail(message);
	    }
	}
	var check = { fail: fail, argument: argument, assert: argument };

	// Data types used in the OpenType font file.

	var LIMIT16 = 32768; // The limit at which a 16-bit number switches signs == 2^15
	var LIMIT32 = 2147483648; // The limit at which a 32-bit number switches signs == 2 ^ 31

	/**
	 * @exports opentype.decode
	 * @class
	 */
	var decode = {};
	/**
	 * @exports opentype.encode
	 * @class
	 */
	var encode = {};
	/**
	 * @exports opentype.sizeOf
	 * @class
	 */
	var sizeOf = {};

	// Return a function that always returns the same value.
	function constant(v) {
	    return function() {
	        return v;
	    };
	}

	// OpenType data types //////////////////////////////////////////////////////

	/**
	 * Convert an 8-bit unsigned integer to a list of 1 byte.
	 * @param {number}
	 * @returns {Array}
	 */
	encode.BYTE = function(v) {
	    check.argument(v >= 0 && v <= 255, 'Byte value should be between 0 and 255.');
	    return [v];
	};
	/**
	 * @constant
	 * @type {number}
	 */
	sizeOf.BYTE = constant(1);

	/**
	 * Convert a 8-bit signed integer to a list of 1 byte.
	 * @param {string}
	 * @returns {Array}
	 */
	encode.CHAR = function(v) {
	    return [v.charCodeAt(0)];
	};

	/**
	 * @constant
	 * @type {number}
	 */
	sizeOf.CHAR = constant(1);

	/**
	 * Convert an ASCII string to a list of bytes.
	 * @param {string}
	 * @returns {Array}
	 */
	encode.CHARARRAY = function(v) {
	    if (typeof v === 'undefined') {
	        v = '';
	        console.warn('Undefined CHARARRAY encountered and treated as an empty string. This is probably caused by a missing glyph name.');
	    }
	    var b = [];
	    for (var i = 0; i < v.length; i += 1) {
	        b[i] = v.charCodeAt(i);
	    }

	    return b;
	};

	/**
	 * @param {Array}
	 * @returns {number}
	 */
	sizeOf.CHARARRAY = function(v) {
	    if (typeof v === 'undefined') {
	        return 0;
	    }
	    return v.length;
	};

	/**
	 * Convert a 16-bit unsigned integer to a list of 2 bytes.
	 * @param {number}
	 * @returns {Array}
	 */
	encode.USHORT = function(v) {
	    return [(v >> 8) & 0xFF, v & 0xFF];
	};

	/**
	 * @constant
	 * @type {number}
	 */
	sizeOf.USHORT = constant(2);

	/**
	 * Convert a 16-bit signed integer to a list of 2 bytes.
	 * @param {number}
	 * @returns {Array}
	 */
	encode.SHORT = function(v) {
	    // Two's complement
	    if (v >= LIMIT16) {
	        v = -(2 * LIMIT16 - v);
	    }

	    return [(v >> 8) & 0xFF, v & 0xFF];
	};

	/**
	 * @constant
	 * @type {number}
	 */
	sizeOf.SHORT = constant(2);

	/**
	 * Convert a 24-bit unsigned integer to a list of 3 bytes.
	 * @param {number}
	 * @returns {Array}
	 */
	encode.UINT24 = function(v) {
	    return [(v >> 16) & 0xFF, (v >> 8) & 0xFF, v & 0xFF];
	};

	/**
	 * @constant
	 * @type {number}
	 */
	sizeOf.UINT24 = constant(3);

	/**
	 * Convert a 32-bit unsigned integer to a list of 4 bytes.
	 * @param {number}
	 * @returns {Array}
	 */
	encode.ULONG = function(v) {
	    return [(v >> 24) & 0xFF, (v >> 16) & 0xFF, (v >> 8) & 0xFF, v & 0xFF];
	};

	/**
	 * @constant
	 * @type {number}
	 */
	sizeOf.ULONG = constant(4);

	/**
	 * Convert a 32-bit unsigned integer to a list of 4 bytes.
	 * @param {number}
	 * @returns {Array}
	 */
	encode.LONG = function(v) {
	    // Two's complement
	    if (v >= LIMIT32) {
	        v = -(2 * LIMIT32 - v);
	    }

	    return [(v >> 24) & 0xFF, (v >> 16) & 0xFF, (v >> 8) & 0xFF, v & 0xFF];
	};

	/**
	 * @constant
	 * @type {number}
	 */
	sizeOf.LONG = constant(4);

	encode.FIXED = encode.ULONG;
	sizeOf.FIXED = sizeOf.ULONG;

	encode.FWORD = encode.SHORT;
	sizeOf.FWORD = sizeOf.SHORT;

	encode.UFWORD = encode.USHORT;
	sizeOf.UFWORD = sizeOf.USHORT;

	/**
	 * Convert a 32-bit Apple Mac timestamp integer to a list of 8 bytes, 64-bit timestamp.
	 * @param {number}
	 * @returns {Array}
	 */
	encode.LONGDATETIME = function(v) {
	    return [0, 0, 0, 0, (v >> 24) & 0xFF, (v >> 16) & 0xFF, (v >> 8) & 0xFF, v & 0xFF];
	};

	/**
	 * @constant
	 * @type {number}
	 */
	sizeOf.LONGDATETIME = constant(8);

	/**
	 * Convert a 4-char tag to a list of 4 bytes.
	 * @param {string}
	 * @returns {Array}
	 */
	encode.TAG = function(v) {
	    check.argument(v.length === 4, 'Tag should be exactly 4 ASCII characters.');
	    return [v.charCodeAt(0),
	            v.charCodeAt(1),
	            v.charCodeAt(2),
	            v.charCodeAt(3)];
	};

	/**
	 * @constant
	 * @type {number}
	 */
	sizeOf.TAG = constant(4);

	// CFF data types ///////////////////////////////////////////////////////////

	encode.Card8 = encode.BYTE;
	sizeOf.Card8 = sizeOf.BYTE;

	encode.Card16 = encode.USHORT;
	sizeOf.Card16 = sizeOf.USHORT;

	encode.OffSize = encode.BYTE;
	sizeOf.OffSize = sizeOf.BYTE;

	encode.SID = encode.USHORT;
	sizeOf.SID = sizeOf.USHORT;

	// Convert a numeric operand or charstring number to a variable-size list of bytes.
	/**
	 * Convert a numeric operand or charstring number to a variable-size list of bytes.
	 * @param {number}
	 * @returns {Array}
	 */
	encode.NUMBER = function(v) {
	    if (v >= -107 && v <= 107) {
	        return [v + 139];
	    } else if (v >= 108 && v <= 1131) {
	        v = v - 108;
	        return [(v >> 8) + 247, v & 0xFF];
	    } else if (v >= -1131 && v <= -108) {
	        v = -v - 108;
	        return [(v >> 8) + 251, v & 0xFF];
	    } else if (v >= -32768 && v <= 32767) {
	        return encode.NUMBER16(v);
	    } else {
	        return encode.NUMBER32(v);
	    }
	};

	/**
	 * @param {number}
	 * @returns {number}
	 */
	sizeOf.NUMBER = function(v) {
	    return encode.NUMBER(v).length;
	};

	/**
	 * Convert a signed number between -32768 and +32767 to a three-byte value.
	 * This ensures we always use three bytes, but is not the most compact format.
	 * @param {number}
	 * @returns {Array}
	 */
	encode.NUMBER16 = function(v) {
	    return [28, (v >> 8) & 0xFF, v & 0xFF];
	};

	/**
	 * @constant
	 * @type {number}
	 */
	sizeOf.NUMBER16 = constant(3);

	/**
	 * Convert a signed number between -(2^31) and +(2^31-1) to a five-byte value.
	 * This is useful if you want to be sure you always use four bytes,
	 * at the expense of wasting a few bytes for smaller numbers.
	 * @param {number}
	 * @returns {Array}
	 */
	encode.NUMBER32 = function(v) {
	    return [29, (v >> 24) & 0xFF, (v >> 16) & 0xFF, (v >> 8) & 0xFF, v & 0xFF];
	};

	/**
	 * @constant
	 * @type {number}
	 */
	sizeOf.NUMBER32 = constant(5);

	/**
	 * @param {number}
	 * @returns {Array}
	 */
	encode.REAL = function(v) {
	    var value = v.toString();

	    // Some numbers use an epsilon to encode the value. (e.g. JavaScript will store 0.0000001 as 1e-7)
	    // This code converts it back to a number without the epsilon.
	    var m = /\.(\d*?)(?:9{5,20}|0{5,20})\d{0,2}(?:e(.+)|$)/.exec(value);
	    if (m) {
	        var epsilon = parseFloat('1e' + ((m[2] ? +m[2] : 0) + m[1].length));
	        value = (Math.round(v * epsilon) / epsilon).toString();
	    }

	    var nibbles = '';
	    for (var i = 0, ii = value.length; i < ii; i += 1) {
	        var c = value[i];
	        if (c === 'e') {
	            nibbles += value[++i] === '-' ? 'c' : 'b';
	        } else if (c === '.') {
	            nibbles += 'a';
	        } else if (c === '-') {
	            nibbles += 'e';
	        } else {
	            nibbles += c;
	        }
	    }

	    nibbles += (nibbles.length & 1) ? 'f' : 'ff';
	    var out = [30];
	    for (var i$1 = 0, ii$1 = nibbles.length; i$1 < ii$1; i$1 += 2) {
	        out.push(parseInt(nibbles.substr(i$1, 2), 16));
	    }

	    return out;
	};

	/**
	 * @param {number}
	 * @returns {number}
	 */
	sizeOf.REAL = function(v) {
	    return encode.REAL(v).length;
	};

	encode.NAME = encode.CHARARRAY;
	sizeOf.NAME = sizeOf.CHARARRAY;

	encode.STRING = encode.CHARARRAY;
	sizeOf.STRING = sizeOf.CHARARRAY;

	/**
	 * @param {DataView} data
	 * @param {number} offset
	 * @param {number} numBytes
	 * @returns {string}
	 */
	decode.UTF8 = function(data, offset, numBytes) {
	    var codePoints = [];
	    var numChars = numBytes;
	    for (var j = 0; j < numChars; j++, offset += 1) {
	        codePoints[j] = data.getUint8(offset);
	    }

	    return String.fromCharCode.apply(null, codePoints);
	};

	/**
	 * @param {DataView} data
	 * @param {number} offset
	 * @param {number} numBytes
	 * @returns {string}
	 */
	decode.UTF16 = function(data, offset, numBytes) {
	    var codePoints = [];
	    var numChars = numBytes / 2;
	    for (var j = 0; j < numChars; j++, offset += 2) {
	        codePoints[j] = data.getUint16(offset);
	    }

	    return String.fromCharCode.apply(null, codePoints);
	};

	/**
	 * Convert a JavaScript string to UTF16-BE.
	 * @param {string}
	 * @returns {Array}
	 */
	encode.UTF16 = function(v) {
	    var b = [];
	    for (var i = 0; i < v.length; i += 1) {
	        var codepoint = v.charCodeAt(i);
	        b[b.length] = (codepoint >> 8) & 0xFF;
	        b[b.length] = codepoint & 0xFF;
	    }

	    return b;
	};

	/**
	 * @param {string}
	 * @returns {number}
	 */
	sizeOf.UTF16 = function(v) {
	    return v.length * 2;
	};

	// Data for converting old eight-bit Macintosh encodings to Unicode.
	// This representation is optimized for decoding; encoding is slower
	// and needs more memory. The assumption is that all opentype.js users
	// want to open fonts, but saving a font will be comparatively rare
	// so it can be more expensive. Keyed by IANA character set name.
	//
	// Python script for generating these strings:
	//
	//     s = u''.join([chr(c).decode('mac_greek') for c in range(128, 256)])
	//     print(s.encode('utf-8'))
	/**
	 * @private
	 */
	var eightBitMacEncodings = {
	    'x-mac-croatian':  // Python: 'mac_croatian'
	    'ÄÅÇÉÑÖÜáàâäãåçéèêëíìîïñóòôöõúùûü†°¢£§•¶ß®Š™´¨≠ŽØ∞±≤≥∆µ∂∑∏š∫ªºΩžø' +
	    '¿¡¬√ƒ≈Ć«Č… ÀÃÕŒœĐ—“”‘’÷◊©⁄€‹›Æ»–·‚„‰ÂćÁčÈÍÎÏÌÓÔđÒÚÛÙıˆ˜¯πË˚¸Êæˇ',
	    'x-mac-cyrillic':  // Python: 'mac_cyrillic'
	    'АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ†°Ґ£§•¶І®©™Ђђ≠Ѓѓ∞±≤≥іµґЈЄєЇїЉљЊњ' +
	    'јЅ¬√ƒ≈∆«»… ЋћЌќѕ–—“”‘’÷„ЎўЏџ№Ёёяабвгдежзийклмнопрстуфхцчшщъыьэю',
	    'x-mac-gaelic': // http://unicode.org/Public/MAPPINGS/VENDORS/APPLE/GAELIC.TXT
	    'ÄÅÇÉÑÖÜáàâäãåçéèêëíìîïñóòôöõúùûü†°¢£§•¶ß®©™´¨≠ÆØḂ±≤≥ḃĊċḊḋḞḟĠġṀæø' +
	    'ṁṖṗɼƒſṠ«»… ÀÃÕŒœ–—“”‘’ṡẛÿŸṪ€‹›Ŷŷṫ·Ỳỳ⁊ÂÊÁËÈÍÎÏÌÓÔ♣ÒÚÛÙıÝýŴŵẄẅẀẁẂẃ',
	    'x-mac-greek':  // Python: 'mac_greek'
	    'Ä¹²É³ÖÜ΅àâä΄¨çéèêë£™îï•½‰ôö¦€ùûü†ΓΔΘΛΞΠß®©ΣΪ§≠°·Α±≤≥¥ΒΕΖΗΙΚΜΦΫΨΩ' +
	    'άΝ¬ΟΡ≈Τ«»… ΥΧΆΈœ–―“”‘’÷ΉΊΌΎέήίόΏύαβψδεφγηιξκλμνοπώρστθωςχυζϊϋΐΰ\u00AD',
	    'x-mac-icelandic':  // Python: 'mac_iceland'
	    'ÄÅÇÉÑÖÜáàâäãåçéèêëíìîïñóòôöõúùûüÝ°¢£§•¶ß®©™´¨≠ÆØ∞±≤≥¥µ∂∑∏π∫ªºΩæø' +
	    '¿¡¬√ƒ≈∆«»… ÀÃÕŒœ–—“”‘’÷◊ÿŸ⁄€ÐðÞþý·‚„‰ÂÊÁËÈÍÎÏÌÓÔÒÚÛÙıˆ˜¯˘˙˚¸˝˛ˇ',
	    'x-mac-inuit': // http://unicode.org/Public/MAPPINGS/VENDORS/APPLE/INUIT.TXT
	    'ᐃᐄᐅᐆᐊᐋᐱᐲᐳᐴᐸᐹᑉᑎᑏᑐᑑᑕᑖᑦᑭᑮᑯᑰᑲᑳᒃᒋᒌᒍᒎᒐᒑ°ᒡᒥᒦ•¶ᒧ®©™ᒨᒪᒫᒻᓂᓃᓄᓅᓇᓈᓐᓯᓰᓱᓲᓴᓵᔅᓕᓖᓗ' +
	    'ᓘᓚᓛᓪᔨᔩᔪᔫᔭ… ᔮᔾᕕᕖᕗ–—“”‘’ᕘᕙᕚᕝᕆᕇᕈᕉᕋᕌᕐᕿᖀᖁᖂᖃᖄᖅᖏᖐᖑᖒᖓᖔᖕᙱᙲᙳᙴᙵᙶᖖᖠᖡᖢᖣᖤᖥᖦᕼŁł',
	    'x-mac-ce':  // Python: 'mac_latin2'
	    'ÄĀāÉĄÖÜáąČäčĆćéŹźĎíďĒēĖóėôöõúĚěü†°Ę£§•¶ß®©™ę¨≠ģĮįĪ≤≥īĶ∂∑łĻļĽľĹĺŅ' +
	    'ņŃ¬√ńŇ∆«»… ňŐÕőŌ–—“”‘’÷◊ōŔŕŘ‹›řŖŗŠ‚„šŚśÁŤťÍŽžŪÓÔūŮÚůŰűŲųÝýķŻŁżĢˇ',
	    macintosh:  // Python: 'mac_roman'
	    'ÄÅÇÉÑÖÜáàâäãåçéèêëíìîïñóòôöõúùûü†°¢£§•¶ß®©™´¨≠ÆØ∞±≤≥¥µ∂∑∏π∫ªºΩæø' +
	    '¿¡¬√ƒ≈∆«»… ÀÃÕŒœ–—“”‘’÷◊ÿŸ⁄€‹›ﬁﬂ‡·‚„‰ÂÊÁËÈÍÎÏÌÓÔÒÚÛÙıˆ˜¯˘˙˚¸˝˛ˇ',
	    'x-mac-romanian':  // Python: 'mac_romanian'
	    'ÄÅÇÉÑÖÜáàâäãåçéèêëíìîïñóòôöõúùûü†°¢£§•¶ß®©™´¨≠ĂȘ∞±≤≥¥µ∂∑∏π∫ªºΩăș' +
	    '¿¡¬√ƒ≈∆«»… ÀÃÕŒœ–—“”‘’÷◊ÿŸ⁄€‹›Țț‡·‚„‰ÂÊÁËÈÍÎÏÌÓÔÒÚÛÙıˆ˜¯˘˙˚¸˝˛ˇ',
	    'x-mac-turkish':  // Python: 'mac_turkish'
	    'ÄÅÇÉÑÖÜáàâäãåçéèêëíìîïñóòôöõúùûü†°¢£§•¶ß®©™´¨≠ÆØ∞±≤≥¥µ∂∑∏π∫ªºΩæø' +
	    '¿¡¬√ƒ≈∆«»… ÀÃÕŒœ–—“”‘’÷◊ÿŸĞğİıŞş‡·‚„‰ÂÊÁËÈÍÎÏÌÓÔÒÚÛÙˆ˜¯˘˙˚¸˝˛ˇ'
	};

	/**
	 * Decodes an old-style Macintosh string. Returns either a Unicode JavaScript
	 * string, or 'undefined' if the encoding is unsupported. For example, we do
	 * not support Chinese, Japanese or Korean because these would need large
	 * mapping tables.
	 * @param {DataView} dataView
	 * @param {number} offset
	 * @param {number} dataLength
	 * @param {string} encoding
	 * @returns {string}
	 */
	decode.MACSTRING = function(dataView, offset, dataLength, encoding) {
	    var table = eightBitMacEncodings[encoding];
	    if (table === undefined) {
	        return undefined;
	    }

	    var result = '';
	    for (var i = 0; i < dataLength; i++) {
	        var c = dataView.getUint8(offset + i);
	        // In all eight-bit Mac encodings, the characters 0x00..0x7F are
	        // mapped to U+0000..U+007F; we only need to look up the others.
	        if (c <= 0x7F) {
	            result += String.fromCharCode(c);
	        } else {
	            result += table[c & 0x7F];
	        }
	    }

	    return result;
	};

	// Helper function for encode.MACSTRING. Returns a dictionary for mapping
	// Unicode character codes to their 8-bit MacOS equivalent. This table
	// is not exactly a super cheap data structure, but we do not care because
	// encoding Macintosh strings is only rarely needed in typical applications.
	var macEncodingTableCache = typeof WeakMap === 'function' && new WeakMap();
	var macEncodingCacheKeys;
	var getMacEncodingTable = function (encoding) {
	    // Since we use encoding as a cache key for WeakMap, it has to be
	    // a String object and not a literal. And at least on NodeJS 2.10.1,
	    // WeakMap requires that the same String instance is passed for cache hits.
	    if (!macEncodingCacheKeys) {
	        macEncodingCacheKeys = {};
	        for (var e in eightBitMacEncodings) {
	            /*jshint -W053 */  // Suppress "Do not use String as a constructor."
	            macEncodingCacheKeys[e] = new String(e);
	        }
	    }

	    var cacheKey = macEncodingCacheKeys[encoding];
	    if (cacheKey === undefined) {
	        return undefined;
	    }

	    // We can't do "if (cache.has(key)) {return cache.get(key)}" here:
	    // since garbage collection may run at any time, it could also kick in
	    // between the calls to cache.has() and cache.get(). In that case,
	    // we would return 'undefined' even though we do support the encoding.
	    if (macEncodingTableCache) {
	        var cachedTable = macEncodingTableCache.get(cacheKey);
	        if (cachedTable !== undefined) {
	            return cachedTable;
	        }
	    }

	    var decodingTable = eightBitMacEncodings[encoding];
	    if (decodingTable === undefined) {
	        return undefined;
	    }

	    var encodingTable = {};
	    for (var i = 0; i < decodingTable.length; i++) {
	        encodingTable[decodingTable.charCodeAt(i)] = i + 0x80;
	    }

	    if (macEncodingTableCache) {
	        macEncodingTableCache.set(cacheKey, encodingTable);
	    }

	    return encodingTable;
	};

	/**
	 * Encodes an old-style Macintosh string. Returns a byte array upon success.
	 * If the requested encoding is unsupported, or if the input string contains
	 * a character that cannot be expressed in the encoding, the function returns
	 * 'undefined'.
	 * @param {string} str
	 * @param {string} encoding
	 * @returns {Array}
	 */
	encode.MACSTRING = function(str, encoding) {
	    var table = getMacEncodingTable(encoding);
	    if (table === undefined) {
	        return undefined;
	    }

	    var result = [];
	    for (var i = 0; i < str.length; i++) {
	        var c = str.charCodeAt(i);

	        // In all eight-bit Mac encodings, the characters 0x00..0x7F are
	        // mapped to U+0000..U+007F; we only need to look up the others.
	        if (c >= 0x80) {
	            c = table[c];
	            if (c === undefined) {
	                // str contains a Unicode character that cannot be encoded
	                // in the requested encoding.
	                return undefined;
	            }
	        }
	        result[i] = c;
	        // result.push(c);
	    }

	    return result;
	};

	/**
	 * @param {string} str
	 * @param {string} encoding
	 * @returns {number}
	 */
	sizeOf.MACSTRING = function(str, encoding) {
	    var b = encode.MACSTRING(str, encoding);
	    if (b !== undefined) {
	        return b.length;
	    } else {
	        return 0;
	    }
	};

	// Helper for encode.VARDELTAS
	function isByteEncodable(value) {
	    return value >= -128 && value <= 127;
	}

	// Helper for encode.VARDELTAS
	function encodeVarDeltaRunAsZeroes(deltas, pos, result) {
	    var runLength = 0;
	    var numDeltas = deltas.length;
	    while (pos < numDeltas && runLength < 64 && deltas[pos] === 0) {
	        ++pos;
	        ++runLength;
	    }
	    result.push(0x80 | (runLength - 1));
	    return pos;
	}

	// Helper for encode.VARDELTAS
	function encodeVarDeltaRunAsBytes(deltas, offset, result) {
	    var runLength = 0;
	    var numDeltas = deltas.length;
	    var pos = offset;
	    while (pos < numDeltas && runLength < 64) {
	        var value = deltas[pos];
	        if (!isByteEncodable(value)) {
	            break;
	        }

	        // Within a byte-encoded run of deltas, a single zero is best
	        // stored literally as 0x00 value. However, if we have two or
	        // more zeroes in a sequence, it is better to start a new run.
	        // Fore example, the sequence of deltas [15, 15, 0, 15, 15]
	        // becomes 6 bytes (04 0F 0F 00 0F 0F) when storing the zero
	        // within the current run, but 7 bytes (01 0F 0F 80 01 0F 0F)
	        // when starting a new run.
	        if (value === 0 && pos + 1 < numDeltas && deltas[pos + 1] === 0) {
	            break;
	        }

	        ++pos;
	        ++runLength;
	    }
	    result.push(runLength - 1);
	    for (var i = offset; i < pos; ++i) {
	        result.push((deltas[i] + 256) & 0xff);
	    }
	    return pos;
	}

	// Helper for encode.VARDELTAS
	function encodeVarDeltaRunAsWords(deltas, offset, result) {
	    var runLength = 0;
	    var numDeltas = deltas.length;
	    var pos = offset;
	    while (pos < numDeltas && runLength < 64) {
	        var value = deltas[pos];

	        // Within a word-encoded run of deltas, it is easiest to start
	        // a new run (with a different encoding) whenever we encounter
	        // a zero value. For example, the sequence [0x6666, 0, 0x7777]
	        // needs 7 bytes when storing the zero inside the current run
	        // (42 66 66 00 00 77 77), and equally 7 bytes when starting a
	        // new run (40 66 66 80 40 77 77).
	        if (value === 0) {
	            break;
	        }

	        // Within a word-encoded run of deltas, a single value in the
	        // range (-128..127) should be encoded within the current run
	        // because it is more compact. For example, the sequence
	        // [0x6666, 2, 0x7777] becomes 7 bytes when storing the value
	        // literally (42 66 66 00 02 77 77), but 8 bytes when starting
	        // a new run (40 66 66 00 02 40 77 77).
	        if (isByteEncodable(value) && pos + 1 < numDeltas && isByteEncodable(deltas[pos + 1])) {
	            break;
	        }

	        ++pos;
	        ++runLength;
	    }
	    result.push(0x40 | (runLength - 1));
	    for (var i = offset; i < pos; ++i) {
	        var val = deltas[i];
	        result.push(((val + 0x10000) >> 8) & 0xff, (val + 0x100) & 0xff);
	    }
	    return pos;
	}

	/**
	 * Encode a list of variation adjustment deltas.
	 *
	 * Variation adjustment deltas are used in ‘gvar’ and ‘cvar’ tables.
	 * They indicate how points (in ‘gvar’) or values (in ‘cvar’) get adjusted
	 * when generating instances of variation fonts.
	 *
	 * @see https://www.microsoft.com/typography/otspec/gvar.htm
	 * @see https://developer.apple.com/fonts/TrueType-Reference-Manual/RM06/Chap6gvar.html
	 * @param {Array}
	 * @return {Array}
	 */
	encode.VARDELTAS = function(deltas) {
	    var pos = 0;
	    var result = [];
	    while (pos < deltas.length) {
	        var value = deltas[pos];
	        if (value === 0) {
	            pos = encodeVarDeltaRunAsZeroes(deltas, pos, result);
	        } else if (value >= -128 && value <= 127) {
	            pos = encodeVarDeltaRunAsBytes(deltas, pos, result);
	        } else {
	            pos = encodeVarDeltaRunAsWords(deltas, pos, result);
	        }
	    }
	    return result;
	};

	// Convert a list of values to a CFF INDEX structure.
	// The values should be objects containing name / type / value.
	/**
	 * @param {Array} l
	 * @returns {Array}
	 */
	encode.INDEX = function(l) {
	    //var offset, offsets, offsetEncoder, encodedOffsets, encodedOffset, data,
	    //    i, v;
	    // Because we have to know which data type to use to encode the offsets,
	    // we have to go through the values twice: once to encode the data and
	    // calculate the offsets, then again to encode the offsets using the fitting data type.
	    var offset = 1; // First offset is always 1.
	    var offsets = [offset];
	    var data = [];
	    for (var i = 0; i < l.length; i += 1) {
	        var v = encode.OBJECT(l[i]);
	        Array.prototype.push.apply(data, v);
	        offset += v.length;
	        offsets.push(offset);
	    }

	    if (data.length === 0) {
	        return [0, 0];
	    }

	    var encodedOffsets = [];
	    var offSize = (1 + Math.floor(Math.log(offset) / Math.log(2)) / 8) | 0;
	    var offsetEncoder = [undefined, encode.BYTE, encode.USHORT, encode.UINT24, encode.ULONG][offSize];
	    for (var i$1 = 0; i$1 < offsets.length; i$1 += 1) {
	        var encodedOffset = offsetEncoder(offsets[i$1]);
	        Array.prototype.push.apply(encodedOffsets, encodedOffset);
	    }

	    return Array.prototype.concat(encode.Card16(l.length),
	                           encode.OffSize(offSize),
	                           encodedOffsets,
	                           data);
	};

	/**
	 * @param {Array}
	 * @returns {number}
	 */
	sizeOf.INDEX = function(v) {
	    return encode.INDEX(v).length;
	};

	/**
	 * Convert an object to a CFF DICT structure.
	 * The keys should be numeric.
	 * The values should be objects containing name / type / value.
	 * @param {Object} m
	 * @returns {Array}
	 */
	encode.DICT = function(m) {
	    var d = [];
	    var keys = Object.keys(m);
	    var length = keys.length;

	    for (var i = 0; i < length; i += 1) {
	        // Object.keys() return string keys, but our keys are always numeric.
	        var k = parseInt(keys[i], 0);
	        var v = m[k];
	        // Value comes before the key.
	        d = d.concat(encode.OPERAND(v.value, v.type));
	        d = d.concat(encode.OPERATOR(k));
	    }

	    return d;
	};

	/**
	 * @param {Object}
	 * @returns {number}
	 */
	sizeOf.DICT = function(m) {
	    return encode.DICT(m).length;
	};

	/**
	 * @param {number}
	 * @returns {Array}
	 */
	encode.OPERATOR = function(v) {
	    if (v < 1200) {
	        return [v];
	    } else {
	        return [12, v - 1200];
	    }
	};

	/**
	 * @param {Array} v
	 * @param {string}
	 * @returns {Array}
	 */
	encode.OPERAND = function(v, type) {
	    var d = [];
	    if (Array.isArray(type)) {
	        for (var i = 0; i < type.length; i += 1) {
	            check.argument(v.length === type.length, 'Not enough arguments given for type' + type);
	            d = d.concat(encode.OPERAND(v[i], type[i]));
	        }
	    } else {
	        if (type === 'SID') {
	            d = d.concat(encode.NUMBER(v));
	        } else if (type === 'offset') {
	            // We make it easy for ourselves and always encode offsets as
	            // 4 bytes. This makes offset calculation for the top dict easier.
	            d = d.concat(encode.NUMBER32(v));
	        } else if (type === 'number') {
	            d = d.concat(encode.NUMBER(v));
	        } else if (type === 'real') {
	            d = d.concat(encode.REAL(v));
	        } else {
	            throw new Error('Unknown operand type ' + type);
	            // FIXME Add support for booleans
	        }
	    }

	    return d;
	};

	encode.OP = encode.BYTE;
	sizeOf.OP = sizeOf.BYTE;

	// memoize charstring encoding using WeakMap if available
	var wmm = typeof WeakMap === 'function' && new WeakMap();

	/**
	 * Convert a list of CharString operations to bytes.
	 * @param {Array}
	 * @returns {Array}
	 */
	encode.CHARSTRING = function(ops) {
	    // See encode.MACSTRING for why we don't do "if (wmm && wmm.has(ops))".
	    if (wmm) {
	        var cachedValue = wmm.get(ops);
	        if (cachedValue !== undefined) {
	            return cachedValue;
	        }
	    }

	    var d = [];
	    var length = ops.length;

	    for (var i = 0; i < length; i += 1) {
	        var op = ops[i];
	        d = d.concat(encode[op.type](op.value));
	    }

	    if (wmm) {
	        wmm.set(ops, d);
	    }

	    return d;
	};

	/**
	 * @param {Array}
	 * @returns {number}
	 */
	sizeOf.CHARSTRING = function(ops) {
	    return encode.CHARSTRING(ops).length;
	};

	// Utility functions ////////////////////////////////////////////////////////

	/**
	 * Convert an object containing name / type / value to bytes.
	 * @param {Object}
	 * @returns {Array}
	 */
	encode.OBJECT = function(v) {
	    var encodingFunction = encode[v.type];
	    check.argument(encodingFunction !== undefined, 'No encoding function for type ' + v.type);
	    return encodingFunction(v.value);
	};

	/**
	 * @param {Object}
	 * @returns {number}
	 */
	sizeOf.OBJECT = function(v) {
	    var sizeOfFunction = sizeOf[v.type];
	    check.argument(sizeOfFunction !== undefined, 'No sizeOf function for type ' + v.type);
	    return sizeOfFunction(v.value);
	};

	/**
	 * Convert a table object to bytes.
	 * A table contains a list of fields containing the metadata (name, type and default value).
	 * The table itself has the field values set as attributes.
	 * @param {opentype.Table}
	 * @returns {Array}
	 */
	encode.TABLE = function(table) {
	    var d = [];
	    var length = table.fields.length;
	    var subtables = [];
	    var subtableOffsets = [];

	    for (var i = 0; i < length; i += 1) {
	        var field = table.fields[i];
	        var encodingFunction = encode[field.type];
	        check.argument(encodingFunction !== undefined, 'No encoding function for field type ' + field.type + ' (' + field.name + ')');
	        var value = table[field.name];
	        if (value === undefined) {
	            value = field.value;
	        }

	        var bytes = encodingFunction(value);

	        if (field.type === 'TABLE') {
	            subtableOffsets.push(d.length);
	            d = d.concat([0, 0]);
	            subtables.push(bytes);
	        } else {
	            d = d.concat(bytes);
	        }
	    }

	    for (var i$1 = 0; i$1 < subtables.length; i$1 += 1) {
	        var o = subtableOffsets[i$1];
	        var offset = d.length;
	        check.argument(offset < 65536, 'Table ' + table.tableName + ' too big.');
	        d[o] = offset >> 8;
	        d[o + 1] = offset & 0xff;
	        d = d.concat(subtables[i$1]);
	    }

	    return d;
	};

	/**
	 * @param {opentype.Table}
	 * @returns {number}
	 */
	sizeOf.TABLE = function(table) {
	    var numBytes = 0;
	    var length = table.fields.length;

	    for (var i = 0; i < length; i += 1) {
	        var field = table.fields[i];
	        var sizeOfFunction = sizeOf[field.type];
	        check.argument(sizeOfFunction !== undefined, 'No sizeOf function for field type ' + field.type + ' (' + field.name + ')');
	        var value = table[field.name];
	        if (value === undefined) {
	            value = field.value;
	        }

	        numBytes += sizeOfFunction(value);

	        // Subtables take 2 more bytes for offsets.
	        if (field.type === 'TABLE') {
	            numBytes += 2;
	        }
	    }

	    return numBytes;
	};

	encode.RECORD = encode.TABLE;
	sizeOf.RECORD = sizeOf.TABLE;

	// Merge in a list of bytes.
	encode.LITERAL = function(v) {
	    return v;
	};

	sizeOf.LITERAL = function(v) {
	    return v.length;
	};

	// Table metadata

	/**
	 * @exports opentype.Table
	 * @class
	 * @param {string} tableName
	 * @param {Array} fields
	 * @param {Object} options
	 * @constructor
	 */
	function Table(tableName, fields, options) {
	    // For coverage tables with coverage format 2, we do not want to add the coverage data directly to the table object,
	    // as this will result in wrong encoding order of the coverage data on serialization to bytes.
	    // The fallback of using the field values directly when not present on the table is handled in types.encode.TABLE() already.
	    if (fields.length && (fields[0].name !== 'coverageFormat' || fields[0].value === 1)) {
	        for (var i = 0; i < fields.length; i += 1) {
	            var field = fields[i];
	            this[field.name] = field.value;
	        }
	    }

	    this.tableName = tableName;
	    this.fields = fields;
	    if (options) {
	        var optionKeys = Object.keys(options);
	        for (var i$1 = 0; i$1 < optionKeys.length; i$1 += 1) {
	            var k = optionKeys[i$1];
	            var v = options[k];
	            if (this[k] !== undefined) {
	                this[k] = v;
	            }
	        }
	    }
	}

	/**
	 * Encodes the table and returns an array of bytes
	 * @return {Array}
	 */
	Table.prototype.encode = function() {
	    return encode.TABLE(this);
	};

	/**
	 * Get the size of the table.
	 * @return {number}
	 */
	Table.prototype.sizeOf = function() {
	    return sizeOf.TABLE(this);
	};

	/**
	 * @private
	 */
	function ushortList(itemName, list, count) {
	    if (count === undefined) {
	        count = list.length;
	    }
	    var fields = new Array(list.length + 1);
	    fields[0] = {name: itemName + 'Count', type: 'USHORT', value: count};
	    for (var i = 0; i < list.length; i++) {
	        fields[i + 1] = {name: itemName + i, type: 'USHORT', value: list[i]};
	    }
	    return fields;
	}

	/**
	 * @private
	 */
	function tableList(itemName, records, itemCallback) {
	    var count = records.length;
	    var fields = new Array(count + 1);
	    fields[0] = {name: itemName + 'Count', type: 'USHORT', value: count};
	    for (var i = 0; i < count; i++) {
	        fields[i + 1] = {name: itemName + i, type: 'TABLE', value: itemCallback(records[i], i)};
	    }
	    return fields;
	}

	/**
	 * @private
	 */
	function recordList(itemName, records, itemCallback) {
	    var count = records.length;
	    var fields = [];
	    fields[0] = {name: itemName + 'Count', type: 'USHORT', value: count};
	    for (var i = 0; i < count; i++) {
	        fields = fields.concat(itemCallback(records[i], i));
	    }
	    return fields;
	}

	// Common Layout Tables

	/**
	 * @exports opentype.Coverage
	 * @class
	 * @param {opentype.Table}
	 * @constructor
	 * @extends opentype.Table
	 */
	function Coverage(coverageTable) {
	    if (coverageTable.format === 1) {
	        Table.call(this, 'coverageTable',
	            [{name: 'coverageFormat', type: 'USHORT', value: 1}]
	            .concat(ushortList('glyph', coverageTable.glyphs))
	        );
	    } else if (coverageTable.format === 2) {
	        Table.call(this, 'coverageTable',
	            [{name: 'coverageFormat', type: 'USHORT', value: 2}]
	            .concat(recordList('rangeRecord', coverageTable.ranges, function(RangeRecord) {
	                return [
	                    {name: 'startGlyphID', type: 'USHORT', value: RangeRecord.start},
	                    {name: 'endGlyphID', type: 'USHORT', value: RangeRecord.end},
	                    {name: 'startCoverageIndex', type: 'USHORT', value: RangeRecord.index} ];
	            }))
	        );
	    } else {
	        check.assert(false, 'Coverage format must be 1 or 2.');
	    }
	}
	Coverage.prototype = Object.create(Table.prototype);
	Coverage.prototype.constructor = Coverage;

	function ScriptList(scriptListTable) {
	    Table.call(this, 'scriptListTable',
	        recordList('scriptRecord', scriptListTable, function(scriptRecord, i) {
	            var script = scriptRecord.script;
	            var defaultLangSys = script.defaultLangSys;
	            check.assert(!!defaultLangSys, 'Unable to write GSUB: script ' + scriptRecord.tag + ' has no default language system.');
	            return [
	                {name: 'scriptTag' + i, type: 'TAG', value: scriptRecord.tag},
	                {name: 'script' + i, type: 'TABLE', value: new Table('scriptTable', [
	                    {name: 'defaultLangSys', type: 'TABLE', value: new Table('defaultLangSys', [
	                        {name: 'lookupOrder', type: 'USHORT', value: 0},
	                        {name: 'reqFeatureIndex', type: 'USHORT', value: defaultLangSys.reqFeatureIndex}]
	                        .concat(ushortList('featureIndex', defaultLangSys.featureIndexes)))}
	                    ].concat(recordList('langSys', script.langSysRecords, function(langSysRecord, i) {
	                        var langSys = langSysRecord.langSys;
	                        return [
	                            {name: 'langSysTag' + i, type: 'TAG', value: langSysRecord.tag},
	                            {name: 'langSys' + i, type: 'TABLE', value: new Table('langSys', [
	                                {name: 'lookupOrder', type: 'USHORT', value: 0},
	                                {name: 'reqFeatureIndex', type: 'USHORT', value: langSys.reqFeatureIndex}
	                                ].concat(ushortList('featureIndex', langSys.featureIndexes)))}
	                        ];
	                    })))}
	            ];
	        })
	    );
	}
	ScriptList.prototype = Object.create(Table.prototype);
	ScriptList.prototype.constructor = ScriptList;

	/**
	 * @exports opentype.FeatureList
	 * @class
	 * @param {opentype.Table}
	 * @constructor
	 * @extends opentype.Table
	 */
	function FeatureList(featureListTable) {
	    Table.call(this, 'featureListTable',
	        recordList('featureRecord', featureListTable, function(featureRecord, i) {
	            var feature = featureRecord.feature;
	            return [
	                {name: 'featureTag' + i, type: 'TAG', value: featureRecord.tag},
	                {name: 'feature' + i, type: 'TABLE', value: new Table('featureTable', [
	                    {name: 'featureParams', type: 'USHORT', value: feature.featureParams} ].concat(ushortList('lookupListIndex', feature.lookupListIndexes)))}
	            ];
	        })
	    );
	}
	FeatureList.prototype = Object.create(Table.prototype);
	FeatureList.prototype.constructor = FeatureList;

	/**
	 * @exports opentype.LookupList
	 * @class
	 * @param {opentype.Table}
	 * @param {Object}
	 * @constructor
	 * @extends opentype.Table
	 */
	function LookupList(lookupListTable, subtableMakers) {
	    Table.call(this, 'lookupListTable', tableList('lookup', lookupListTable, function(lookupTable) {
	        var subtableCallback = subtableMakers[lookupTable.lookupType];
	        check.assert(!!subtableCallback, 'Unable to write GSUB lookup type ' + lookupTable.lookupType + ' tables.');
	        return new Table('lookupTable', [
	            {name: 'lookupType', type: 'USHORT', value: lookupTable.lookupType},
	            {name: 'lookupFlag', type: 'USHORT', value: lookupTable.lookupFlag}
	        ].concat(tableList('subtable', lookupTable.subtables, subtableCallback)));
	    }));
	}
	LookupList.prototype = Object.create(Table.prototype);
	LookupList.prototype.constructor = LookupList;

	// Record = same as Table, but inlined (a Table has an offset and its data is further in the stream)
	// Don't use offsets inside Records (probable bug), only in Tables.
	var table = {
	    Table: Table,
	    Record: Table,
	    Coverage: Coverage,
	    ScriptList: ScriptList,
	    FeatureList: FeatureList,
	    LookupList: LookupList,
	    ushortList: ushortList,
	    tableList: tableList,
	    recordList: recordList,
	};

	// Parsing utility functions

	// Retrieve an unsigned byte from the DataView.
	function getByte(dataView, offset) {
	    return dataView.getUint8(offset);
	}

	// Retrieve an unsigned 16-bit short from the DataView.
	// The value is stored in big endian.
	function getUShort(dataView, offset) {
	    return dataView.getUint16(offset, false);
	}

	// Retrieve a signed 16-bit short from the DataView.
	// The value is stored in big endian.
	function getShort(dataView, offset) {
	    return dataView.getInt16(offset, false);
	}

	// Retrieve an unsigned 32-bit long from the DataView.
	// The value is stored in big endian.
	function getULong(dataView, offset) {
	    return dataView.getUint32(offset, false);
	}

	// Retrieve a 32-bit signed fixed-point number (16.16) from the DataView.
	// The value is stored in big endian.
	function getFixed(dataView, offset) {
	    var decimal = dataView.getInt16(offset, false);
	    var fraction = dataView.getUint16(offset + 2, false);
	    return decimal + fraction / 65535;
	}

	// Retrieve a 4-character tag from the DataView.
	// Tags are used to identify tables.
	function getTag(dataView, offset) {
	    var tag = '';
	    for (var i = offset; i < offset + 4; i += 1) {
	        tag += String.fromCharCode(dataView.getInt8(i));
	    }

	    return tag;
	}

	// Retrieve an offset from the DataView.
	// Offsets are 1 to 4 bytes in length, depending on the offSize argument.
	function getOffset(dataView, offset, offSize) {
	    var v = 0;
	    for (var i = 0; i < offSize; i += 1) {
	        v <<= 8;
	        v += dataView.getUint8(offset + i);
	    }

	    return v;
	}

	// Retrieve a number of bytes from start offset to the end offset from the DataView.
	function getBytes(dataView, startOffset, endOffset) {
	    var bytes = [];
	    for (var i = startOffset; i < endOffset; i += 1) {
	        bytes.push(dataView.getUint8(i));
	    }

	    return bytes;
	}

	// Convert the list of bytes to a string.
	function bytesToString(bytes) {
	    var s = '';
	    for (var i = 0; i < bytes.length; i += 1) {
	        s += String.fromCharCode(bytes[i]);
	    }

	    return s;
	}

	var typeOffsets = {
	    byte: 1,
	    uShort: 2,
	    short: 2,
	    uLong: 4,
	    fixed: 4,
	    longDateTime: 8,
	    tag: 4
	};

	// A stateful parser that changes the offset whenever a value is retrieved.
	// The data is a DataView.
	function Parser(data, offset) {
	    this.data = data;
	    this.offset = offset;
	    this.relativeOffset = 0;
	}

	Parser.prototype.parseByte = function() {
	    var v = this.data.getUint8(this.offset + this.relativeOffset);
	    this.relativeOffset += 1;
	    return v;
	};

	Parser.prototype.parseChar = function() {
	    var v = this.data.getInt8(this.offset + this.relativeOffset);
	    this.relativeOffset += 1;
	    return v;
	};

	Parser.prototype.parseCard8 = Parser.prototype.parseByte;

	Parser.prototype.parseUShort = function() {
	    var v = this.data.getUint16(this.offset + this.relativeOffset);
	    this.relativeOffset += 2;
	    return v;
	};

	Parser.prototype.parseCard16 = Parser.prototype.parseUShort;
	Parser.prototype.parseSID = Parser.prototype.parseUShort;
	Parser.prototype.parseOffset16 = Parser.prototype.parseUShort;

	Parser.prototype.parseShort = function() {
	    var v = this.data.getInt16(this.offset + this.relativeOffset);
	    this.relativeOffset += 2;
	    return v;
	};

	Parser.prototype.parseF2Dot14 = function() {
	    var v = this.data.getInt16(this.offset + this.relativeOffset) / 16384;
	    this.relativeOffset += 2;
	    return v;
	};

	Parser.prototype.parseULong = function() {
	    var v = getULong(this.data, this.offset + this.relativeOffset);
	    this.relativeOffset += 4;
	    return v;
	};

	Parser.prototype.parseOffset32 = Parser.prototype.parseULong;

	Parser.prototype.parseFixed = function() {
	    var v = getFixed(this.data, this.offset + this.relativeOffset);
	    this.relativeOffset += 4;
	    return v;
	};

	Parser.prototype.parseString = function(length) {
	    var dataView = this.data;
	    var offset = this.offset + this.relativeOffset;
	    var string = '';
	    this.relativeOffset += length;
	    for (var i = 0; i < length; i++) {
	        string += String.fromCharCode(dataView.getUint8(offset + i));
	    }

	    return string;
	};

	Parser.prototype.parseTag = function() {
	    return this.parseString(4);
	};

	// LONGDATETIME is a 64-bit integer.
	// JavaScript and unix timestamps traditionally use 32 bits, so we
	// only take the last 32 bits.
	// + Since until 2038 those bits will be filled by zeros we can ignore them.
	Parser.prototype.parseLongDateTime = function() {
	    var v = getULong(this.data, this.offset + this.relativeOffset + 4);
	    // Subtract seconds between 01/01/1904 and 01/01/1970
	    // to convert Apple Mac timestamp to Standard Unix timestamp
	    v -= 2082844800;
	    this.relativeOffset += 8;
	    return v;
	};

	Parser.prototype.parseVersion = function(minorBase) {
	    var major = getUShort(this.data, this.offset + this.relativeOffset);

	    // How to interpret the minor version is very vague in the spec. 0x5000 is 5, 0x1000 is 1
	    // Default returns the correct number if minor = 0xN000 where N is 0-9
	    // Set minorBase to 1 for tables that use minor = N where N is 0-9
	    var minor = getUShort(this.data, this.offset + this.relativeOffset + 2);
	    this.relativeOffset += 4;
	    if (minorBase === undefined) { minorBase = 0x1000; }
	    return major + minor / minorBase / 10;
	};

	Parser.prototype.skip = function(type, amount) {
	    if (amount === undefined) {
	        amount = 1;
	    }

	    this.relativeOffset += typeOffsets[type] * amount;
	};

	///// Parsing lists and records ///////////////////////////////

	// Parse a list of 32 bit unsigned integers.
	Parser.prototype.parseULongList = function(count) {
	    if (count === undefined) { count = this.parseULong(); }
	    var offsets = new Array(count);
	    var dataView = this.data;
	    var offset = this.offset + this.relativeOffset;
	    for (var i = 0; i < count; i++) {
	        offsets[i] = dataView.getUint32(offset);
	        offset += 4;
	    }

	    this.relativeOffset += count * 4;
	    return offsets;
	};

	// Parse a list of 16 bit unsigned integers. The length of the list can be read on the stream
	// or provided as an argument.
	Parser.prototype.parseOffset16List =
	Parser.prototype.parseUShortList = function(count) {
	    if (count === undefined) { count = this.parseUShort(); }
	    var offsets = new Array(count);
	    var dataView = this.data;
	    var offset = this.offset + this.relativeOffset;
	    for (var i = 0; i < count; i++) {
	        offsets[i] = dataView.getUint16(offset);
	        offset += 2;
	    }

	    this.relativeOffset += count * 2;
	    return offsets;
	};

	// Parses a list of 16 bit signed integers.
	Parser.prototype.parseShortList = function(count) {
	    var list = new Array(count);
	    var dataView = this.data;
	    var offset = this.offset + this.relativeOffset;
	    for (var i = 0; i < count; i++) {
	        list[i] = dataView.getInt16(offset);
	        offset += 2;
	    }

	    this.relativeOffset += count * 2;
	    return list;
	};

	// Parses a list of bytes.
	Parser.prototype.parseByteList = function(count) {
	    var list = new Array(count);
	    var dataView = this.data;
	    var offset = this.offset + this.relativeOffset;
	    for (var i = 0; i < count; i++) {
	        list[i] = dataView.getUint8(offset++);
	    }

	    this.relativeOffset += count;
	    return list;
	};

	/**
	 * Parse a list of items.
	 * Record count is optional, if omitted it is read from the stream.
	 * itemCallback is one of the Parser methods.
	 */
	Parser.prototype.parseList = function(count, itemCallback) {
	    if (!itemCallback) {
	        itemCallback = count;
	        count = this.parseUShort();
	    }
	    var list = new Array(count);
	    for (var i = 0; i < count; i++) {
	        list[i] = itemCallback.call(this);
	    }
	    return list;
	};

	Parser.prototype.parseList32 = function(count, itemCallback) {
	    if (!itemCallback) {
	        itemCallback = count;
	        count = this.parseULong();
	    }
	    var list = new Array(count);
	    for (var i = 0; i < count; i++) {
	        list[i] = itemCallback.call(this);
	    }
	    return list;
	};

	/**
	 * Parse a list of records.
	 * Record count is optional, if omitted it is read from the stream.
	 * Example of recordDescription: { sequenceIndex: Parser.uShort, lookupListIndex: Parser.uShort }
	 */
	Parser.prototype.parseRecordList = function(count, recordDescription) {
	    // If the count argument is absent, read it in the stream.
	    if (!recordDescription) {
	        recordDescription = count;
	        count = this.parseUShort();
	    }
	    var records = new Array(count);
	    var fields = Object.keys(recordDescription);
	    for (var i = 0; i < count; i++) {
	        var rec = {};
	        for (var j = 0; j < fields.length; j++) {
	            var fieldName = fields[j];
	            var fieldType = recordDescription[fieldName];
	            rec[fieldName] = fieldType.call(this);
	        }
	        records[i] = rec;
	    }
	    return records;
	};

	Parser.prototype.parseRecordList32 = function(count, recordDescription) {
	    // If the count argument is absent, read it in the stream.
	    if (!recordDescription) {
	        recordDescription = count;
	        count = this.parseULong();
	    }
	    var records = new Array(count);
	    var fields = Object.keys(recordDescription);
	    for (var i = 0; i < count; i++) {
	        var rec = {};
	        for (var j = 0; j < fields.length; j++) {
	            var fieldName = fields[j];
	            var fieldType = recordDescription[fieldName];
	            rec[fieldName] = fieldType.call(this);
	        }
	        records[i] = rec;
	    }
	    return records;
	};

	// Parse a data structure into an object
	// Example of description: { sequenceIndex: Parser.uShort, lookupListIndex: Parser.uShort }
	Parser.prototype.parseStruct = function(description) {
	    if (typeof description === 'function') {
	        return description.call(this);
	    } else {
	        var fields = Object.keys(description);
	        var struct = {};
	        for (var j = 0; j < fields.length; j++) {
	            var fieldName = fields[j];
	            var fieldType = description[fieldName];
	            struct[fieldName] = fieldType.call(this);
	        }
	        return struct;
	    }
	};

	/**
	 * Parse a GPOS valueRecord
	 * https://docs.microsoft.com/en-us/typography/opentype/spec/gpos#value-record
	 * valueFormat is optional, if omitted it is read from the stream.
	 */
	Parser.prototype.parseValueRecord = function(valueFormat) {
	    if (valueFormat === undefined) {
	        valueFormat = this.parseUShort();
	    }
	    if (valueFormat === 0) {
	        // valueFormat2 in kerning pairs is most often 0
	        // in this case return undefined instead of an empty object, to save space
	        return;
	    }
	    var valueRecord = {};

	    if (valueFormat & 0x0001) { valueRecord.xPlacement = this.parseShort(); }
	    if (valueFormat & 0x0002) { valueRecord.yPlacement = this.parseShort(); }
	    if (valueFormat & 0x0004) { valueRecord.xAdvance = this.parseShort(); }
	    if (valueFormat & 0x0008) { valueRecord.yAdvance = this.parseShort(); }

	    // Device table (non-variable font) / VariationIndex table (variable font) not supported
	    // https://docs.microsoft.com/fr-fr/typography/opentype/spec/chapter2#devVarIdxTbls
	    if (valueFormat & 0x0010) { valueRecord.xPlaDevice = undefined; this.parseShort(); }
	    if (valueFormat & 0x0020) { valueRecord.yPlaDevice = undefined; this.parseShort(); }
	    if (valueFormat & 0x0040) { valueRecord.xAdvDevice = undefined; this.parseShort(); }
	    if (valueFormat & 0x0080) { valueRecord.yAdvDevice = undefined; this.parseShort(); }

	    return valueRecord;
	};

	/**
	 * Parse a list of GPOS valueRecords
	 * https://docs.microsoft.com/en-us/typography/opentype/spec/gpos#value-record
	 * valueFormat and valueCount are read from the stream.
	 */
	Parser.prototype.parseValueRecordList = function() {
	    var valueFormat = this.parseUShort();
	    var valueCount = this.parseUShort();
	    var values = new Array(valueCount);
	    for (var i = 0; i < valueCount; i++) {
	        values[i] = this.parseValueRecord(valueFormat);
	    }
	    return values;
	};

	Parser.prototype.parsePointer = function(description) {
	    var structOffset = this.parseOffset16();
	    if (structOffset > 0) {
	        // NULL offset => return undefined
	        return new Parser(this.data, this.offset + structOffset).parseStruct(description);
	    }
	    return undefined;
	};

	Parser.prototype.parsePointer32 = function(description) {
	    var structOffset = this.parseOffset32();
	    if (structOffset > 0) {
	        // NULL offset => return undefined
	        return new Parser(this.data, this.offset + structOffset).parseStruct(description);
	    }
	    return undefined;
	};

	/**
	 * Parse a list of offsets to lists of 16-bit integers,
	 * or a list of offsets to lists of offsets to any kind of items.
	 * If itemCallback is not provided, a list of list of UShort is assumed.
	 * If provided, itemCallback is called on each item and must parse the item.
	 * See examples in tables/gsub.js
	 */
	Parser.prototype.parseListOfLists = function(itemCallback) {
	    var offsets = this.parseOffset16List();
	    var count = offsets.length;
	    var relativeOffset = this.relativeOffset;
	    var list = new Array(count);
	    for (var i = 0; i < count; i++) {
	        var start = offsets[i];
	        if (start === 0) {
	            // NULL offset
	            // Add i as owned property to list. Convenient with assert.
	            list[i] = undefined;
	            continue;
	        }
	        this.relativeOffset = start;
	        if (itemCallback) {
	            var subOffsets = this.parseOffset16List();
	            var subList = new Array(subOffsets.length);
	            for (var j = 0; j < subOffsets.length; j++) {
	                this.relativeOffset = start + subOffsets[j];
	                subList[j] = itemCallback.call(this);
	            }
	            list[i] = subList;
	        } else {
	            list[i] = this.parseUShortList();
	        }
	    }
	    this.relativeOffset = relativeOffset;
	    return list;
	};

	///// Complex tables parsing //////////////////////////////////

	// Parse a coverage table in a GSUB, GPOS or GDEF table.
	// https://www.microsoft.com/typography/OTSPEC/chapter2.htm
	// parser.offset must point to the start of the table containing the coverage.
	Parser.prototype.parseCoverage = function() {
	    var startOffset = this.offset + this.relativeOffset;
	    var format = this.parseUShort();
	    var count = this.parseUShort();
	    if (format === 1) {
	        return {
	            format: 1,
	            glyphs: this.parseUShortList(count)
	        };
	    } else if (format === 2) {
	        var ranges = new Array(count);
	        for (var i = 0; i < count; i++) {
	            ranges[i] = {
	                start: this.parseUShort(),
	                end: this.parseUShort(),
	                index: this.parseUShort()
	            };
	        }
	        return {
	            format: 2,
	            ranges: ranges
	        };
	    }
	    throw new Error('0x' + startOffset.toString(16) + ': Coverage format must be 1 or 2.');
	};

	// Parse a Class Definition Table in a GSUB, GPOS or GDEF table.
	// https://www.microsoft.com/typography/OTSPEC/chapter2.htm
	Parser.prototype.parseClassDef = function() {
	    var startOffset = this.offset + this.relativeOffset;
	    var format = this.parseUShort();
	    if (format === 1) {
	        return {
	            format: 1,
	            startGlyph: this.parseUShort(),
	            classes: this.parseUShortList()
	        };
	    } else if (format === 2) {
	        return {
	            format: 2,
	            ranges: this.parseRecordList({
	                start: Parser.uShort,
	                end: Parser.uShort,
	                classId: Parser.uShort
	            })
	        };
	    }
	    throw new Error('0x' + startOffset.toString(16) + ': ClassDef format must be 1 or 2.');
	};

	///// Static methods ///////////////////////////////////
	// These convenience methods can be used as callbacks and should be called with "this" context set to a Parser instance.

	Parser.list = function(count, itemCallback) {
	    return function() {
	        return this.parseList(count, itemCallback);
	    };
	};

	Parser.list32 = function(count, itemCallback) {
	    return function() {
	        return this.parseList32(count, itemCallback);
	    };
	};

	Parser.recordList = function(count, recordDescription) {
	    return function() {
	        return this.parseRecordList(count, recordDescription);
	    };
	};

	Parser.recordList32 = function(count, recordDescription) {
	    return function() {
	        return this.parseRecordList32(count, recordDescription);
	    };
	};

	Parser.pointer = function(description) {
	    return function() {
	        return this.parsePointer(description);
	    };
	};

	Parser.pointer32 = function(description) {
	    return function() {
	        return this.parsePointer32(description);
	    };
	};

	Parser.tag = Parser.prototype.parseTag;
	Parser.byte = Parser.prototype.parseByte;
	Parser.uShort = Parser.offset16 = Parser.prototype.parseUShort;
	Parser.uShortList = Parser.prototype.parseUShortList;
	Parser.uLong = Parser.offset32 = Parser.prototype.parseULong;
	Parser.uLongList = Parser.prototype.parseULongList;
	Parser.struct = Parser.prototype.parseStruct;
	Parser.coverage = Parser.prototype.parseCoverage;
	Parser.classDef = Parser.prototype.parseClassDef;

	///// Script, Feature, Lookup lists ///////////////////////////////////////////////
	// https://www.microsoft.com/typography/OTSPEC/chapter2.htm

	var langSysTable = {
	    reserved: Parser.uShort,
	    reqFeatureIndex: Parser.uShort,
	    featureIndexes: Parser.uShortList
	};

	Parser.prototype.parseScriptList = function() {
	    return this.parsePointer(Parser.recordList({
	        tag: Parser.tag,
	        script: Parser.pointer({
	            defaultLangSys: Parser.pointer(langSysTable),
	            langSysRecords: Parser.recordList({
	                tag: Parser.tag,
	                langSys: Parser.pointer(langSysTable)
	            })
	        })
	    })) || [];
	};

	Parser.prototype.parseFeatureList = function() {
	    return this.parsePointer(Parser.recordList({
	        tag: Parser.tag,
	        feature: Parser.pointer({
	            featureParams: Parser.offset16,
	            lookupListIndexes: Parser.uShortList
	        })
	    })) || [];
	};

	Parser.prototype.parseLookupList = function(lookupTableParsers) {
	    return this.parsePointer(Parser.list(Parser.pointer(function() {
	        var lookupType = this.parseUShort();
	        check.argument(1 <= lookupType && lookupType <= 9, 'GPOS/GSUB lookup type ' + lookupType + ' unknown.');
	        var lookupFlag = this.parseUShort();
	        var useMarkFilteringSet = lookupFlag & 0x10;
	        return {
	            lookupType: lookupType,
	            lookupFlag: lookupFlag,
	            subtables: this.parseList(Parser.pointer(lookupTableParsers[lookupType])),
	            markFilteringSet: useMarkFilteringSet ? this.parseUShort() : undefined
	        };
	    }))) || [];
	};

	Parser.prototype.parseFeatureVariationsList = function() {
	    return this.parsePointer32(function() {
	        var majorVersion = this.parseUShort();
	        var minorVersion = this.parseUShort();
	        check.argument(majorVersion === 1 && minorVersion < 1, 'GPOS/GSUB feature variations table unknown.');
	        var featureVariations = this.parseRecordList32({
	            conditionSetOffset: Parser.offset32,
	            featureTableSubstitutionOffset: Parser.offset32
	        });
	        return featureVariations;
	    }) || [];
	};

	var parse = {
	    getByte: getByte,
	    getCard8: getByte,
	    getUShort: getUShort,
	    getCard16: getUShort,
	    getShort: getShort,
	    getULong: getULong,
	    getFixed: getFixed,
	    getTag: getTag,
	    getOffset: getOffset,
	    getBytes: getBytes,
	    bytesToString: bytesToString,
	    Parser: Parser,
	};

	// The `cmap` table stores the mappings from characters to glyphs.

	function parseCmapTableFormat12(cmap, p) {
	    //Skip reserved.
	    p.parseUShort();

	    // Length in bytes of the sub-tables.
	    cmap.length = p.parseULong();
	    cmap.language = p.parseULong();

	    var groupCount;
	    cmap.groupCount = groupCount = p.parseULong();
	    cmap.glyphIndexMap = {};

	    for (var i = 0; i < groupCount; i += 1) {
	        var startCharCode = p.parseULong();
	        var endCharCode = p.parseULong();
	        var startGlyphId = p.parseULong();

	        for (var c = startCharCode; c <= endCharCode; c += 1) {
	            cmap.glyphIndexMap[c] = startGlyphId;
	            startGlyphId++;
	        }
	    }
	}

	function parseCmapTableFormat4(cmap, p, data, start, offset) {
	    // Length in bytes of the sub-tables.
	    cmap.length = p.parseUShort();
	    cmap.language = p.parseUShort();

	    // segCount is stored x 2.
	    var segCount;
	    cmap.segCount = segCount = p.parseUShort() >> 1;

	    // Skip searchRange, entrySelector, rangeShift.
	    p.skip('uShort', 3);

	    // The "unrolled" mapping from character codes to glyph indices.
	    cmap.glyphIndexMap = {};
	    var endCountParser = new parse.Parser(data, start + offset + 14);
	    var startCountParser = new parse.Parser(data, start + offset + 16 + segCount * 2);
	    var idDeltaParser = new parse.Parser(data, start + offset + 16 + segCount * 4);
	    var idRangeOffsetParser = new parse.Parser(data, start + offset + 16 + segCount * 6);
	    var glyphIndexOffset = start + offset + 16 + segCount * 8;
	    for (var i = 0; i < segCount - 1; i += 1) {
	        var glyphIndex = (void 0);
	        var endCount = endCountParser.parseUShort();
	        var startCount = startCountParser.parseUShort();
	        var idDelta = idDeltaParser.parseShort();
	        var idRangeOffset = idRangeOffsetParser.parseUShort();
	        for (var c = startCount; c <= endCount; c += 1) {
	            if (idRangeOffset !== 0) {
	                // The idRangeOffset is relative to the current position in the idRangeOffset array.
	                // Take the current offset in the idRangeOffset array.
	                glyphIndexOffset = (idRangeOffsetParser.offset + idRangeOffsetParser.relativeOffset - 2);

	                // Add the value of the idRangeOffset, which will move us into the glyphIndex array.
	                glyphIndexOffset += idRangeOffset;

	                // Then add the character index of the current segment, multiplied by 2 for USHORTs.
	                glyphIndexOffset += (c - startCount) * 2;
	                glyphIndex = parse.getUShort(data, glyphIndexOffset);
	                if (glyphIndex !== 0) {
	                    glyphIndex = (glyphIndex + idDelta) & 0xFFFF;
	                }
	            } else {
	                glyphIndex = (c + idDelta) & 0xFFFF;
	            }

	            cmap.glyphIndexMap[c] = glyphIndex;
	        }
	    }
	}

	// Parse the `cmap` table. This table stores the mappings from characters to glyphs.
	// There are many available formats, but we only support the Windows format 4 and 12.
	// This function returns a `CmapEncoding` object or null if no supported format could be found.
	function parseCmapTable(data, start) {
	    var cmap = {};
	    cmap.version = parse.getUShort(data, start);
	    check.argument(cmap.version === 0, 'cmap table version should be 0.');

	    // The cmap table can contain many sub-tables, each with their own format.
	    // We're only interested in a "platform 0" (Unicode format) and "platform 3" (Windows format) table.
	    cmap.numTables = parse.getUShort(data, start + 2);
	    var offset = -1;
	    for (var i = cmap.numTables - 1; i >= 0; i -= 1) {
	        var platformId = parse.getUShort(data, start + 4 + (i * 8));
	        var encodingId = parse.getUShort(data, start + 4 + (i * 8) + 2);
	        if ((platformId === 3 && (encodingId === 0 || encodingId === 1 || encodingId === 10)) ||
	            (platformId === 0 && (encodingId === 0 || encodingId === 1 || encodingId === 2 || encodingId === 3 || encodingId === 4))) {
	            offset = parse.getULong(data, start + 4 + (i * 8) + 4);
	            break;
	        }
	    }

	    if (offset === -1) {
	        // There is no cmap table in the font that we support.
	        throw new Error('No valid cmap sub-tables found.');
	    }

	    var p = new parse.Parser(data, start + offset);
	    cmap.format = p.parseUShort();

	    if (cmap.format === 12) {
	        parseCmapTableFormat12(cmap, p);
	    } else if (cmap.format === 4) {
	        parseCmapTableFormat4(cmap, p, data, start, offset);
	    } else {
	        throw new Error('Only format 4 and 12 cmap tables are supported (found format ' + cmap.format + ').');
	    }

	    return cmap;
	}

	function addSegment(t, code, glyphIndex) {
	    t.segments.push({
	        end: code,
	        start: code,
	        delta: -(code - glyphIndex),
	        offset: 0,
	        glyphIndex: glyphIndex
	    });
	}

	function addTerminatorSegment(t) {
	    t.segments.push({
	        end: 0xFFFF,
	        start: 0xFFFF,
	        delta: 1,
	        offset: 0
	    });
	}

	// Make cmap table, format 4 by default, 12 if needed only
	function makeCmapTable(glyphs) {
	    // Plan 0 is the base Unicode Plan but emojis, for example are on another plan, and needs cmap 12 format (with 32bit)
	    var isPlan0Only = true;
	    var i;

	    // Check if we need to add cmap format 12 or if format 4 only is fine
	    for (i = glyphs.length - 1; i > 0; i -= 1) {
	        var g = glyphs.get(i);
	        if (g.unicode > 65535) {
	            console.log('Adding CMAP format 12 (needed!)');
	            isPlan0Only = false;
	            break;
	        }
	    }

	    var cmapTable = [
	        {name: 'version', type: 'USHORT', value: 0},
	        {name: 'numTables', type: 'USHORT', value: isPlan0Only ? 1 : 2},

	        // CMAP 4 header
	        {name: 'platformID', type: 'USHORT', value: 3},
	        {name: 'encodingID', type: 'USHORT', value: 1},
	        {name: 'offset', type: 'ULONG', value: isPlan0Only ? 12 : (12 + 8)}
	    ];

	    if (!isPlan0Only)
	        { cmapTable = cmapTable.concat([
	            // CMAP 12 header
	            {name: 'cmap12PlatformID', type: 'USHORT', value: 3}, // We encode only for PlatformID = 3 (Windows) because it is supported everywhere
	            {name: 'cmap12EncodingID', type: 'USHORT', value: 10},
	            {name: 'cmap12Offset', type: 'ULONG', value: 0}
	        ]); }

	    cmapTable = cmapTable.concat([
	        // CMAP 4 Subtable
	        {name: 'format', type: 'USHORT', value: 4},
	        {name: 'cmap4Length', type: 'USHORT', value: 0},
	        {name: 'language', type: 'USHORT', value: 0},
	        {name: 'segCountX2', type: 'USHORT', value: 0},
	        {name: 'searchRange', type: 'USHORT', value: 0},
	        {name: 'entrySelector', type: 'USHORT', value: 0},
	        {name: 'rangeShift', type: 'USHORT', value: 0}
	    ]);

	    var t = new table.Table('cmap', cmapTable);

	    t.segments = [];
	    for (i = 0; i < glyphs.length; i += 1) {
	        var glyph = glyphs.get(i);
	        for (var j = 0; j < glyph.unicodes.length; j += 1) {
	            addSegment(t, glyph.unicodes[j], i);
	        }

	        t.segments = t.segments.sort(function (a, b) {
	            return a.start - b.start;
	        });
	    }

	    addTerminatorSegment(t);

	    var segCount = t.segments.length;
	    var segCountToRemove = 0;

	    // CMAP 4
	    // Set up parallel segment arrays.
	    var endCounts = [];
	    var startCounts = [];
	    var idDeltas = [];
	    var idRangeOffsets = [];
	    var glyphIds = [];

	    // CMAP 12
	    var cmap12Groups = [];

	    // Reminder this loop is not following the specification at 100%
	    // The specification -> find suites of characters and make a group
	    // Here we're doing one group for each letter
	    // Doing as the spec can save 8 times (or more) space
	    for (i = 0; i < segCount; i += 1) {
	        var segment = t.segments[i];

	        // CMAP 4
	        if (segment.end <= 65535 && segment.start <= 65535) {
	            endCounts = endCounts.concat({name: 'end_' + i, type: 'USHORT', value: segment.end});
	            startCounts = startCounts.concat({name: 'start_' + i, type: 'USHORT', value: segment.start});
	            idDeltas = idDeltas.concat({name: 'idDelta_' + i, type: 'SHORT', value: segment.delta});
	            idRangeOffsets = idRangeOffsets.concat({name: 'idRangeOffset_' + i, type: 'USHORT', value: segment.offset});
	            if (segment.glyphId !== undefined) {
	                glyphIds = glyphIds.concat({name: 'glyph_' + i, type: 'USHORT', value: segment.glyphId});
	            }
	        } else {
	            // Skip Unicode > 65535 (16bit unsigned max) for CMAP 4, will be added in CMAP 12
	            segCountToRemove += 1;
	        }

	        // CMAP 12
	        // Skip Terminator Segment
	        if (!isPlan0Only && segment.glyphIndex !== undefined) {
	            cmap12Groups = cmap12Groups.concat({name: 'cmap12Start_' + i, type: 'ULONG', value: segment.start});
	            cmap12Groups = cmap12Groups.concat({name: 'cmap12End_' + i, type: 'ULONG', value: segment.end});
	            cmap12Groups = cmap12Groups.concat({name: 'cmap12Glyph_' + i, type: 'ULONG', value: segment.glyphIndex});
	        }
	    }

	    // CMAP 4 Subtable
	    t.segCountX2 = (segCount - segCountToRemove) * 2;
	    t.searchRange = Math.pow(2, Math.floor(Math.log((segCount - segCountToRemove)) / Math.log(2))) * 2;
	    t.entrySelector = Math.log(t.searchRange / 2) / Math.log(2);
	    t.rangeShift = t.segCountX2 - t.searchRange;

	    t.fields = t.fields.concat(endCounts);
	    t.fields.push({name: 'reservedPad', type: 'USHORT', value: 0});
	    t.fields = t.fields.concat(startCounts);
	    t.fields = t.fields.concat(idDeltas);
	    t.fields = t.fields.concat(idRangeOffsets);
	    t.fields = t.fields.concat(glyphIds);

	    t.cmap4Length = 14 + // Subtable header
	        endCounts.length * 2 +
	        2 + // reservedPad
	        startCounts.length * 2 +
	        idDeltas.length * 2 +
	        idRangeOffsets.length * 2 +
	        glyphIds.length * 2;

	    if (!isPlan0Only) {
	        // CMAP 12 Subtable
	        var cmap12Length = 16 + // Subtable header
	            cmap12Groups.length * 4;

	        t.cmap12Offset = 12 + (2 * 2) + 4 + t.cmap4Length;
	        t.fields = t.fields.concat([
	            {name: 'cmap12Format', type: 'USHORT', value: 12},
	            {name: 'cmap12Reserved', type: 'USHORT', value: 0},
	            {name: 'cmap12Length', type: 'ULONG', value: cmap12Length},
	            {name: 'cmap12Language', type: 'ULONG', value: 0},
	            {name: 'cmap12nGroups', type: 'ULONG', value: cmap12Groups.length / 3}
	        ]);

	        t.fields = t.fields.concat(cmap12Groups);
	    }

	    return t;
	}

	var cmap = { parse: parseCmapTable, make: makeCmapTable };

	// Glyph encoding

	var cffStandardStrings = [
	    '.notdef', 'space', 'exclam', 'quotedbl', 'numbersign', 'dollar', 'percent', 'ampersand', 'quoteright',
	    'parenleft', 'parenright', 'asterisk', 'plus', 'comma', 'hyphen', 'period', 'slash', 'zero', 'one', 'two',
	    'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'colon', 'semicolon', 'less', 'equal', 'greater',
	    'question', 'at', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S',
	    'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'bracketleft', 'backslash', 'bracketright', 'asciicircum', 'underscore',
	    'quoteleft', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't',
	    'u', 'v', 'w', 'x', 'y', 'z', 'braceleft', 'bar', 'braceright', 'asciitilde', 'exclamdown', 'cent', 'sterling',
	    'fraction', 'yen', 'florin', 'section', 'currency', 'quotesingle', 'quotedblleft', 'guillemotleft',
	    'guilsinglleft', 'guilsinglright', 'fi', 'fl', 'endash', 'dagger', 'daggerdbl', 'periodcentered', 'paragraph',
	    'bullet', 'quotesinglbase', 'quotedblbase', 'quotedblright', 'guillemotright', 'ellipsis', 'perthousand',
	    'questiondown', 'grave', 'acute', 'circumflex', 'tilde', 'macron', 'breve', 'dotaccent', 'dieresis', 'ring',
	    'cedilla', 'hungarumlaut', 'ogonek', 'caron', 'emdash', 'AE', 'ordfeminine', 'Lslash', 'Oslash', 'OE',
	    'ordmasculine', 'ae', 'dotlessi', 'lslash', 'oslash', 'oe', 'germandbls', 'onesuperior', 'logicalnot', 'mu',
	    'trademark', 'Eth', 'onehalf', 'plusminus', 'Thorn', 'onequarter', 'divide', 'brokenbar', 'degree', 'thorn',
	    'threequarters', 'twosuperior', 'registered', 'minus', 'eth', 'multiply', 'threesuperior', 'copyright',
	    'Aacute', 'Acircumflex', 'Adieresis', 'Agrave', 'Aring', 'Atilde', 'Ccedilla', 'Eacute', 'Ecircumflex',
	    'Edieresis', 'Egrave', 'Iacute', 'Icircumflex', 'Idieresis', 'Igrave', 'Ntilde', 'Oacute', 'Ocircumflex',
	    'Odieresis', 'Ograve', 'Otilde', 'Scaron', 'Uacute', 'Ucircumflex', 'Udieresis', 'Ugrave', 'Yacute',
	    'Ydieresis', 'Zcaron', 'aacute', 'acircumflex', 'adieresis', 'agrave', 'aring', 'atilde', 'ccedilla', 'eacute',
	    'ecircumflex', 'edieresis', 'egrave', 'iacute', 'icircumflex', 'idieresis', 'igrave', 'ntilde', 'oacute',
	    'ocircumflex', 'odieresis', 'ograve', 'otilde', 'scaron', 'uacute', 'ucircumflex', 'udieresis', 'ugrave',
	    'yacute', 'ydieresis', 'zcaron', 'exclamsmall', 'Hungarumlautsmall', 'dollaroldstyle', 'dollarsuperior',
	    'ampersandsmall', 'Acutesmall', 'parenleftsuperior', 'parenrightsuperior', '266 ff', 'onedotenleader',
	    'zerooldstyle', 'oneoldstyle', 'twooldstyle', 'threeoldstyle', 'fouroldstyle', 'fiveoldstyle', 'sixoldstyle',
	    'sevenoldstyle', 'eightoldstyle', 'nineoldstyle', 'commasuperior', 'threequartersemdash', 'periodsuperior',
	    'questionsmall', 'asuperior', 'bsuperior', 'centsuperior', 'dsuperior', 'esuperior', 'isuperior', 'lsuperior',
	    'msuperior', 'nsuperior', 'osuperior', 'rsuperior', 'ssuperior', 'tsuperior', 'ff', 'ffi', 'ffl',
	    'parenleftinferior', 'parenrightinferior', 'Circumflexsmall', 'hyphensuperior', 'Gravesmall', 'Asmall',
	    'Bsmall', 'Csmall', 'Dsmall', 'Esmall', 'Fsmall', 'Gsmall', 'Hsmall', 'Ismall', 'Jsmall', 'Ksmall', 'Lsmall',
	    'Msmall', 'Nsmall', 'Osmall', 'Psmall', 'Qsmall', 'Rsmall', 'Ssmall', 'Tsmall', 'Usmall', 'Vsmall', 'Wsmall',
	    'Xsmall', 'Ysmall', 'Zsmall', 'colonmonetary', 'onefitted', 'rupiah', 'Tildesmall', 'exclamdownsmall',
	    'centoldstyle', 'Lslashsmall', 'Scaronsmall', 'Zcaronsmall', 'Dieresissmall', 'Brevesmall', 'Caronsmall',
	    'Dotaccentsmall', 'Macronsmall', 'figuredash', 'hypheninferior', 'Ogoneksmall', 'Ringsmall', 'Cedillasmall',
	    'questiondownsmall', 'oneeighth', 'threeeighths', 'fiveeighths', 'seveneighths', 'onethird', 'twothirds',
	    'zerosuperior', 'foursuperior', 'fivesuperior', 'sixsuperior', 'sevensuperior', 'eightsuperior', 'ninesuperior',
	    'zeroinferior', 'oneinferior', 'twoinferior', 'threeinferior', 'fourinferior', 'fiveinferior', 'sixinferior',
	    'seveninferior', 'eightinferior', 'nineinferior', 'centinferior', 'dollarinferior', 'periodinferior',
	    'commainferior', 'Agravesmall', 'Aacutesmall', 'Acircumflexsmall', 'Atildesmall', 'Adieresissmall',
	    'Aringsmall', 'AEsmall', 'Ccedillasmall', 'Egravesmall', 'Eacutesmall', 'Ecircumflexsmall', 'Edieresissmall',
	    'Igravesmall', 'Iacutesmall', 'Icircumflexsmall', 'Idieresissmall', 'Ethsmall', 'Ntildesmall', 'Ogravesmall',
	    'Oacutesmall', 'Ocircumflexsmall', 'Otildesmall', 'Odieresissmall', 'OEsmall', 'Oslashsmall', 'Ugravesmall',
	    'Uacutesmall', 'Ucircumflexsmall', 'Udieresissmall', 'Yacutesmall', 'Thornsmall', 'Ydieresissmall', '001.000',
	    '001.001', '001.002', '001.003', 'Black', 'Bold', 'Book', 'Light', 'Medium', 'Regular', 'Roman', 'Semibold'];

	var cffStandardEncoding = [
	    '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
	    '', '', '', '', 'space', 'exclam', 'quotedbl', 'numbersign', 'dollar', 'percent', 'ampersand', 'quoteright',
	    'parenleft', 'parenright', 'asterisk', 'plus', 'comma', 'hyphen', 'period', 'slash', 'zero', 'one', 'two',
	    'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'colon', 'semicolon', 'less', 'equal', 'greater',
	    'question', 'at', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S',
	    'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'bracketleft', 'backslash', 'bracketright', 'asciicircum', 'underscore',
	    'quoteleft', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't',
	    'u', 'v', 'w', 'x', 'y', 'z', 'braceleft', 'bar', 'braceright', 'asciitilde', '', '', '', '', '', '', '', '',
	    '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
	    'exclamdown', 'cent', 'sterling', 'fraction', 'yen', 'florin', 'section', 'currency', 'quotesingle',
	    'quotedblleft', 'guillemotleft', 'guilsinglleft', 'guilsinglright', 'fi', 'fl', '', 'endash', 'dagger',
	    'daggerdbl', 'periodcentered', '', 'paragraph', 'bullet', 'quotesinglbase', 'quotedblbase', 'quotedblright',
	    'guillemotright', 'ellipsis', 'perthousand', '', 'questiondown', '', 'grave', 'acute', 'circumflex', 'tilde',
	    'macron', 'breve', 'dotaccent', 'dieresis', '', 'ring', 'cedilla', '', 'hungarumlaut', 'ogonek', 'caron',
	    'emdash', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'AE', '', 'ordfeminine', '', '', '',
	    '', 'Lslash', 'Oslash', 'OE', 'ordmasculine', '', '', '', '', '', 'ae', '', '', '', 'dotlessi', '', '',
	    'lslash', 'oslash', 'oe', 'germandbls'];

	var cffExpertEncoding = [
	    '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
	    '', '', '', '', 'space', 'exclamsmall', 'Hungarumlautsmall', '', 'dollaroldstyle', 'dollarsuperior',
	    'ampersandsmall', 'Acutesmall', 'parenleftsuperior', 'parenrightsuperior', 'twodotenleader', 'onedotenleader',
	    'comma', 'hyphen', 'period', 'fraction', 'zerooldstyle', 'oneoldstyle', 'twooldstyle', 'threeoldstyle',
	    'fouroldstyle', 'fiveoldstyle', 'sixoldstyle', 'sevenoldstyle', 'eightoldstyle', 'nineoldstyle', 'colon',
	    'semicolon', 'commasuperior', 'threequartersemdash', 'periodsuperior', 'questionsmall', '', 'asuperior',
	    'bsuperior', 'centsuperior', 'dsuperior', 'esuperior', '', '', 'isuperior', '', '', 'lsuperior', 'msuperior',
	    'nsuperior', 'osuperior', '', '', 'rsuperior', 'ssuperior', 'tsuperior', '', 'ff', 'fi', 'fl', 'ffi', 'ffl',
	    'parenleftinferior', '', 'parenrightinferior', 'Circumflexsmall', 'hyphensuperior', 'Gravesmall', 'Asmall',
	    'Bsmall', 'Csmall', 'Dsmall', 'Esmall', 'Fsmall', 'Gsmall', 'Hsmall', 'Ismall', 'Jsmall', 'Ksmall', 'Lsmall',
	    'Msmall', 'Nsmall', 'Osmall', 'Psmall', 'Qsmall', 'Rsmall', 'Ssmall', 'Tsmall', 'Usmall', 'Vsmall', 'Wsmall',
	    'Xsmall', 'Ysmall', 'Zsmall', 'colonmonetary', 'onefitted', 'rupiah', 'Tildesmall', '', '', '', '', '', '', '',
	    '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
	    'exclamdownsmall', 'centoldstyle', 'Lslashsmall', '', '', 'Scaronsmall', 'Zcaronsmall', 'Dieresissmall',
	    'Brevesmall', 'Caronsmall', '', 'Dotaccentsmall', '', '', 'Macronsmall', '', '', 'figuredash', 'hypheninferior',
	    '', '', 'Ogoneksmall', 'Ringsmall', 'Cedillasmall', '', '', '', 'onequarter', 'onehalf', 'threequarters',
	    'questiondownsmall', 'oneeighth', 'threeeighths', 'fiveeighths', 'seveneighths', 'onethird', 'twothirds', '',
	    '', 'zerosuperior', 'onesuperior', 'twosuperior', 'threesuperior', 'foursuperior', 'fivesuperior',
	    'sixsuperior', 'sevensuperior', 'eightsuperior', 'ninesuperior', 'zeroinferior', 'oneinferior', 'twoinferior',
	    'threeinferior', 'fourinferior', 'fiveinferior', 'sixinferior', 'seveninferior', 'eightinferior',
	    'nineinferior', 'centinferior', 'dollarinferior', 'periodinferior', 'commainferior', 'Agravesmall',
	    'Aacutesmall', 'Acircumflexsmall', 'Atildesmall', 'Adieresissmall', 'Aringsmall', 'AEsmall', 'Ccedillasmall',
	    'Egravesmall', 'Eacutesmall', 'Ecircumflexsmall', 'Edieresissmall', 'Igravesmall', 'Iacutesmall',
	    'Icircumflexsmall', 'Idieresissmall', 'Ethsmall', 'Ntildesmall', 'Ogravesmall', 'Oacutesmall',
	    'Ocircumflexsmall', 'Otildesmall', 'Odieresissmall', 'OEsmall', 'Oslashsmall', 'Ugravesmall', 'Uacutesmall',
	    'Ucircumflexsmall', 'Udieresissmall', 'Yacutesmall', 'Thornsmall', 'Ydieresissmall'];

	var standardNames = [
	    '.notdef', '.null', 'nonmarkingreturn', 'space', 'exclam', 'quotedbl', 'numbersign', 'dollar', 'percent',
	    'ampersand', 'quotesingle', 'parenleft', 'parenright', 'asterisk', 'plus', 'comma', 'hyphen', 'period', 'slash',
	    'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'colon', 'semicolon', 'less',
	    'equal', 'greater', 'question', 'at', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O',
	    'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'bracketleft', 'backslash', 'bracketright',
	    'asciicircum', 'underscore', 'grave', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o',
	    'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'braceleft', 'bar', 'braceright', 'asciitilde',
	    'Adieresis', 'Aring', 'Ccedilla', 'Eacute', 'Ntilde', 'Odieresis', 'Udieresis', 'aacute', 'agrave',
	    'acircumflex', 'adieresis', 'atilde', 'aring', 'ccedilla', 'eacute', 'egrave', 'ecircumflex', 'edieresis',
	    'iacute', 'igrave', 'icircumflex', 'idieresis', 'ntilde', 'oacute', 'ograve', 'ocircumflex', 'odieresis',
	    'otilde', 'uacute', 'ugrave', 'ucircumflex', 'udieresis', 'dagger', 'degree', 'cent', 'sterling', 'section',
	    'bullet', 'paragraph', 'germandbls', 'registered', 'copyright', 'trademark', 'acute', 'dieresis', 'notequal',
	    'AE', 'Oslash', 'infinity', 'plusminus', 'lessequal', 'greaterequal', 'yen', 'mu', 'partialdiff', 'summation',
	    'product', 'pi', 'integral', 'ordfeminine', 'ordmasculine', 'Omega', 'ae', 'oslash', 'questiondown',
	    'exclamdown', 'logicalnot', 'radical', 'florin', 'approxequal', 'Delta', 'guillemotleft', 'guillemotright',
	    'ellipsis', 'nonbreakingspace', 'Agrave', 'Atilde', 'Otilde', 'OE', 'oe', 'endash', 'emdash', 'quotedblleft',
	    'quotedblright', 'quoteleft', 'quoteright', 'divide', 'lozenge', 'ydieresis', 'Ydieresis', 'fraction',
	    'currency', 'guilsinglleft', 'guilsinglright', 'fi', 'fl', 'daggerdbl', 'periodcentered', 'quotesinglbase',
	    'quotedblbase', 'perthousand', 'Acircumflex', 'Ecircumflex', 'Aacute', 'Edieresis', 'Egrave', 'Iacute',
	    'Icircumflex', 'Idieresis', 'Igrave', 'Oacute', 'Ocircumflex', 'apple', 'Ograve', 'Uacute', 'Ucircumflex',
	    'Ugrave', 'dotlessi', 'circumflex', 'tilde', 'macron', 'breve', 'dotaccent', 'ring', 'cedilla', 'hungarumlaut',
	    'ogonek', 'caron', 'Lslash', 'lslash', 'Scaron', 'scaron', 'Zcaron', 'zcaron', 'brokenbar', 'Eth', 'eth',
	    'Yacute', 'yacute', 'Thorn', 'thorn', 'minus', 'multiply', 'onesuperior', 'twosuperior', 'threesuperior',
	    'onehalf', 'onequarter', 'threequarters', 'franc', 'Gbreve', 'gbreve', 'Idotaccent', 'Scedilla', 'scedilla',
	    'Cacute', 'cacute', 'Ccaron', 'ccaron', 'dcroat'];

	/**
	 * This is the encoding used for fonts created from scratch.
	 * It loops through all glyphs and finds the appropriate unicode value.
	 * Since it's linear time, other encodings will be faster.
	 * @exports opentype.DefaultEncoding
	 * @class
	 * @constructor
	 * @param {opentype.Font}
	 */
	function DefaultEncoding(font) {
	    this.font = font;
	}

	DefaultEncoding.prototype.charToGlyphIndex = function(c) {
	    var code = c.codePointAt(0);
	    var glyphs = this.font.glyphs;
	    if (glyphs) {
	        for (var i = 0; i < glyphs.length; i += 1) {
	            var glyph = glyphs.get(i);
	            for (var j = 0; j < glyph.unicodes.length; j += 1) {
	                if (glyph.unicodes[j] === code) {
	                    return i;
	                }
	            }
	        }
	    }
	    return null;
	};

	/**
	 * @exports opentype.CmapEncoding
	 * @class
	 * @constructor
	 * @param {Object} cmap - a object with the cmap encoded data
	 */
	function CmapEncoding(cmap) {
	    this.cmap = cmap;
	}

	/**
	 * @param  {string} c - the character
	 * @return {number} The glyph index.
	 */
	CmapEncoding.prototype.charToGlyphIndex = function(c) {
	    return this.cmap.glyphIndexMap[c.codePointAt(0)] || 0;
	};

	/**
	 * @exports opentype.CffEncoding
	 * @class
	 * @constructor
	 * @param {string} encoding - The encoding
	 * @param {Array} charset - The character set.
	 */
	function CffEncoding(encoding, charset) {
	    this.encoding = encoding;
	    this.charset = charset;
	}

	/**
	 * @param  {string} s - The character
	 * @return {number} The index.
	 */
	CffEncoding.prototype.charToGlyphIndex = function(s) {
	    var code = s.codePointAt(0);
	    var charName = this.encoding[code];
	    return this.charset.indexOf(charName);
	};

	/**
	 * @exports opentype.GlyphNames
	 * @class
	 * @constructor
	 * @param {Object} post
	 */
	function GlyphNames(post) {
	    switch (post.version) {
	        case 1:
	            this.names = standardNames.slice();
	            break;
	        case 2:
	            this.names = new Array(post.numberOfGlyphs);
	            for (var i = 0; i < post.numberOfGlyphs; i++) {
	                if (post.glyphNameIndex[i] < standardNames.length) {
	                    this.names[i] = standardNames[post.glyphNameIndex[i]];
	                } else {
	                    this.names[i] = post.names[post.glyphNameIndex[i] - standardNames.length];
	                }
	            }

	            break;
	        case 2.5:
	            this.names = new Array(post.numberOfGlyphs);
	            for (var i$1 = 0; i$1 < post.numberOfGlyphs; i$1++) {
	                this.names[i$1] = standardNames[i$1 + post.glyphNameIndex[i$1]];
	            }

	            break;
	        case 3:
	            this.names = [];
	            break;
	        default:
	            this.names = [];
	            break;
	    }
	}

	/**
	 * Gets the index of a glyph by name.
	 * @param  {string} name - The glyph name
	 * @return {number} The index
	 */
	GlyphNames.prototype.nameToGlyphIndex = function(name) {
	    return this.names.indexOf(name);
	};

	/**
	 * @param  {number} gid
	 * @return {string}
	 */
	GlyphNames.prototype.glyphIndexToName = function(gid) {
	    return this.names[gid];
	};

	function addGlyphNamesAll(font) {
	    var glyph;
	    var glyphIndexMap = font.tables.cmap.glyphIndexMap;
	    var charCodes = Object.keys(glyphIndexMap);

	    for (var i = 0; i < charCodes.length; i += 1) {
	        var c = charCodes[i];
	        var glyphIndex = glyphIndexMap[c];
	        glyph = font.glyphs.get(glyphIndex);
	        glyph.addUnicode(parseInt(c));
	    }

	    for (var i$1 = 0; i$1 < font.glyphs.length; i$1 += 1) {
	        glyph = font.glyphs.get(i$1);
	        if (font.cffEncoding) {
	            if (font.isCIDFont) {
	                glyph.name = 'gid' + i$1;
	            } else {
	                glyph.name = font.cffEncoding.charset[i$1];
	            }
	        } else if (font.glyphNames.names) {
	            glyph.name = font.glyphNames.glyphIndexToName(i$1);
	        }
	    }
	}

	function addGlyphNamesToUnicodeMap(font) {
	    font._IndexToUnicodeMap = {};

	    var glyphIndexMap = font.tables.cmap.glyphIndexMap;
	    var charCodes = Object.keys(glyphIndexMap);

	    for (var i = 0; i < charCodes.length; i += 1) {
	        var c = charCodes[i];
	        var glyphIndex = glyphIndexMap[c];
	        if (font._IndexToUnicodeMap[glyphIndex] === undefined) {
	            font._IndexToUnicodeMap[glyphIndex] = {
	                unicodes: [parseInt(c)]
	            };
	        } else {
	            font._IndexToUnicodeMap[glyphIndex].unicodes.push(parseInt(c));
	        }
	    }
	}

	/**
	 * @alias opentype.addGlyphNames
	 * @param {opentype.Font}
	 * @param {Object}
	 */
	function addGlyphNames(font, opt) {
	    if (opt.lowMemory) {
	        addGlyphNamesToUnicodeMap(font);
	    } else {
	        addGlyphNamesAll(font);
	    }
	}

	// Drawing utility functions.

	// Draw a line on the given context from point `x1,y1` to point `x2,y2`.
	function line(ctx, x1, y1, x2, y2) {
	    ctx.beginPath();
	    ctx.moveTo(x1, y1);
	    ctx.lineTo(x2, y2);
	    ctx.stroke();
	}

	var draw = { line: line };

	// The Glyph object
	// import glyf from './tables/glyf' Can't be imported here, because it's a circular dependency

	function getPathDefinition(glyph, path) {
	    var _path = path || new Path();
	    return {
	        configurable: true,

	        get: function() {
	            if (typeof _path === 'function') {
	                _path = _path();
	            }

	            return _path;
	        },

	        set: function(p) {
	            _path = p;
	        }
	    };
	}
	/**
	 * @typedef GlyphOptions
	 * @type Object
	 * @property {string} [name] - The glyph name
	 * @property {number} [unicode]
	 * @property {Array} [unicodes]
	 * @property {number} [xMin]
	 * @property {number} [yMin]
	 * @property {number} [xMax]
	 * @property {number} [yMax]
	 * @property {number} [advanceWidth]
	 */

	// A Glyph is an individual mark that often corresponds to a character.
	// Some glyphs, such as ligatures, are a combination of many characters.
	// Glyphs are the basic building blocks of a font.
	//
	// The `Glyph` class contains utility methods for drawing the path and its points.
	/**
	 * @exports opentype.Glyph
	 * @class
	 * @param {GlyphOptions}
	 * @constructor
	 */
	function Glyph(options) {
	    // By putting all the code on a prototype function (which is only declared once)
	    // we reduce the memory requirements for larger fonts by some 2%
	    this.bindConstructorValues(options);
	}

	/**
	 * @param  {GlyphOptions}
	 */
	Glyph.prototype.bindConstructorValues = function(options) {
	    this.index = options.index || 0;

	    // These three values cannot be deferred for memory optimization:
	    this.name = options.name || null;
	    this.unicode = options.unicode || undefined;
	    this.unicodes = options.unicodes || options.unicode !== undefined ? [options.unicode] : [];

	    // But by binding these values only when necessary, we reduce can
	    // the memory requirements by almost 3% for larger fonts.
	    if ('xMin' in options) {
	        this.xMin = options.xMin;
	    }

	    if ('yMin' in options) {
	        this.yMin = options.yMin;
	    }

	    if ('xMax' in options) {
	        this.xMax = options.xMax;
	    }

	    if ('yMax' in options) {
	        this.yMax = options.yMax;
	    }

	    if ('advanceWidth' in options) {
	        this.advanceWidth = options.advanceWidth;
	    }

	    // The path for a glyph is the most memory intensive, and is bound as a value
	    // with a getter/setter to ensure we actually do path parsing only once the
	    // path is actually needed by anything.
	    Object.defineProperty(this, 'path', getPathDefinition(this, options.path));
	};

	/**
	 * @param {number}
	 */
	Glyph.prototype.addUnicode = function(unicode) {
	    if (this.unicodes.length === 0) {
	        this.unicode = unicode;
	    }

	    this.unicodes.push(unicode);
	};

	/**
	 * Calculate the minimum bounding box for this glyph.
	 * @return {opentype.BoundingBox}
	 */
	Glyph.prototype.getBoundingBox = function() {
	    return this.path.getBoundingBox();
	};

	/**
	 * Convert the glyph to a Path we can draw on a drawing context.
	 * @param  {number} [x=0] - Horizontal position of the beginning of the text.
	 * @param  {number} [y=0] - Vertical position of the *baseline* of the text.
	 * @param  {number} [fontSize=72] - Font size in pixels. We scale the glyph units by `1 / unitsPerEm * fontSize`.
	 * @param  {Object=} options - xScale, yScale to stretch the glyph.
	 * @param  {opentype.Font} if hinting is to be used, the font
	 * @return {opentype.Path}
	 */
	Glyph.prototype.getPath = function(x, y, fontSize, options, font) {
	    x = x !== undefined ? x : 0;
	    y = y !== undefined ? y : 0;
	    fontSize = fontSize !== undefined ? fontSize : 72;
	    var commands;
	    var hPoints;
	    if (!options) { options = { }; }
	    var xScale = options.xScale;
	    var yScale = options.yScale;

	    if (options.hinting && font && font.hinting) {
	        // in case of hinting, the hinting engine takes care
	        // of scaling the points (not the path) before hinting.
	        hPoints = this.path && font.hinting.exec(this, fontSize);
	        // in case the hinting engine failed hPoints is undefined
	        // and thus reverts to plain rending
	    }

	    if (hPoints) {
	        // Call font.hinting.getCommands instead of `glyf.getPath(hPoints).commands` to avoid a circular dependency
	        commands = font.hinting.getCommands(hPoints);
	        x = Math.round(x);
	        y = Math.round(y);
	        // TODO in case of hinting xyScaling is not yet supported
	        xScale = yScale = 1;
	    } else {
	        commands = this.path.commands;
	        var scale = 1 / (this.path.unitsPerEm || 1000) * fontSize;
	        if (xScale === undefined) { xScale = scale; }
	        if (yScale === undefined) { yScale = scale; }
	    }

	    var p = new Path();
	    for (var i = 0; i < commands.length; i += 1) {
	        var cmd = commands[i];
	        if (cmd.type === 'M') {
	            p.moveTo(x + (cmd.x * xScale), y + (-cmd.y * yScale));
	        } else if (cmd.type === 'L') {
	            p.lineTo(x + (cmd.x * xScale), y + (-cmd.y * yScale));
	        } else if (cmd.type === 'Q') {
	            p.quadraticCurveTo(x + (cmd.x1 * xScale), y + (-cmd.y1 * yScale),
	                               x + (cmd.x * xScale), y + (-cmd.y * yScale));
	        } else if (cmd.type === 'C') {
	            p.curveTo(x + (cmd.x1 * xScale), y + (-cmd.y1 * yScale),
	                      x + (cmd.x2 * xScale), y + (-cmd.y2 * yScale),
	                      x + (cmd.x * xScale), y + (-cmd.y * yScale));
	        } else if (cmd.type === 'Z') {
	            p.closePath();
	        }
	    }

	    return p;
	};

	/**
	 * Split the glyph into contours.
	 * This function is here for backwards compatibility, and to
	 * provide raw access to the TrueType glyph outlines.
	 * @return {Array}
	 */
	Glyph.prototype.getContours = function() {
	    if (this.points === undefined) {
	        return [];
	    }

	    var contours = [];
	    var currentContour = [];
	    for (var i = 0; i < this.points.length; i += 1) {
	        var pt = this.points[i];
	        currentContour.push(pt);
	        if (pt.lastPointOfContour) {
	            contours.push(currentContour);
	            currentContour = [];
	        }
	    }

	    check.argument(currentContour.length === 0, 'There are still points left in the current contour.');
	    return contours;
	};

	/**
	 * Calculate the xMin/yMin/xMax/yMax/lsb/rsb for a Glyph.
	 * @return {Object}
	 */
	Glyph.prototype.getMetrics = function() {
	    var commands = this.path.commands;
	    var xCoords = [];
	    var yCoords = [];
	    for (var i = 0; i < commands.length; i += 1) {
	        var cmd = commands[i];
	        if (cmd.type !== 'Z') {
	            xCoords.push(cmd.x);
	            yCoords.push(cmd.y);
	        }

	        if (cmd.type === 'Q' || cmd.type === 'C') {
	            xCoords.push(cmd.x1);
	            yCoords.push(cmd.y1);
	        }

	        if (cmd.type === 'C') {
	            xCoords.push(cmd.x2);
	            yCoords.push(cmd.y2);
	        }
	    }

	    var metrics = {
	        xMin: Math.min.apply(null, xCoords),
	        yMin: Math.min.apply(null, yCoords),
	        xMax: Math.max.apply(null, xCoords),
	        yMax: Math.max.apply(null, yCoords),
	        leftSideBearing: this.leftSideBearing
	    };

	    if (!isFinite(metrics.xMin)) {
	        metrics.xMin = 0;
	    }

	    if (!isFinite(metrics.xMax)) {
	        metrics.xMax = this.advanceWidth;
	    }

	    if (!isFinite(metrics.yMin)) {
	        metrics.yMin = 0;
	    }

	    if (!isFinite(metrics.yMax)) {
	        metrics.yMax = 0;
	    }

	    metrics.rightSideBearing = this.advanceWidth - metrics.leftSideBearing - (metrics.xMax - metrics.xMin);
	    return metrics;
	};

	/**
	 * Draw the glyph on the given context.
	 * @param  {CanvasRenderingContext2D} ctx - A 2D drawing context, like Canvas.
	 * @param  {number} [x=0] - Horizontal position of the beginning of the text.
	 * @param  {number} [y=0] - Vertical position of the *baseline* of the text.
	 * @param  {number} [fontSize=72] - Font size in pixels. We scale the glyph units by `1 / unitsPerEm * fontSize`.
	 * @param  {Object=} options - xScale, yScale to stretch the glyph.
	 */
	Glyph.prototype.draw = function(ctx, x, y, fontSize, options) {
	    this.getPath(x, y, fontSize, options).draw(ctx);
	};

	/**
	 * Draw the points of the glyph.
	 * On-curve points will be drawn in blue, off-curve points will be drawn in red.
	 * @param  {CanvasRenderingContext2D} ctx - A 2D drawing context, like Canvas.
	 * @param  {number} [x=0] - Horizontal position of the beginning of the text.
	 * @param  {number} [y=0] - Vertical position of the *baseline* of the text.
	 * @param  {number} [fontSize=72] - Font size in pixels. We scale the glyph units by `1 / unitsPerEm * fontSize`.
	 */
	Glyph.prototype.drawPoints = function(ctx, x, y, fontSize) {
	    function drawCircles(l, x, y, scale) {
	        ctx.beginPath();
	        for (var j = 0; j < l.length; j += 1) {
	            ctx.moveTo(x + (l[j].x * scale), y + (l[j].y * scale));
	            ctx.arc(x + (l[j].x * scale), y + (l[j].y * scale), 2, 0, Math.PI * 2, false);
	        }

	        ctx.closePath();
	        ctx.fill();
	    }

	    x = x !== undefined ? x : 0;
	    y = y !== undefined ? y : 0;
	    fontSize = fontSize !== undefined ? fontSize : 24;
	    var scale = 1 / this.path.unitsPerEm * fontSize;

	    var blueCircles = [];
	    var redCircles = [];
	    var path = this.path;
	    for (var i = 0; i < path.commands.length; i += 1) {
	        var cmd = path.commands[i];
	        if (cmd.x !== undefined) {
	            blueCircles.push({x: cmd.x, y: -cmd.y});
	        }

	        if (cmd.x1 !== undefined) {
	            redCircles.push({x: cmd.x1, y: -cmd.y1});
	        }

	        if (cmd.x2 !== undefined) {
	            redCircles.push({x: cmd.x2, y: -cmd.y2});
	        }
	    }

	    ctx.fillStyle = 'blue';
	    drawCircles(blueCircles, x, y, scale);
	    ctx.fillStyle = 'red';
	    drawCircles(redCircles, x, y, scale);
	};

	/**
	 * Draw lines indicating important font measurements.
	 * Black lines indicate the origin of the coordinate system (point 0,0).
	 * Blue lines indicate the glyph bounding box.
	 * Green line indicates the advance width of the glyph.
	 * @param  {CanvasRenderingContext2D} ctx - A 2D drawing context, like Canvas.
	 * @param  {number} [x=0] - Horizontal position of the beginning of the text.
	 * @param  {number} [y=0] - Vertical position of the *baseline* of the text.
	 * @param  {number} [fontSize=72] - Font size in pixels. We scale the glyph units by `1 / unitsPerEm * fontSize`.
	 */
	Glyph.prototype.drawMetrics = function(ctx, x, y, fontSize) {
	    var scale;
	    x = x !== undefined ? x : 0;
	    y = y !== undefined ? y : 0;
	    fontSize = fontSize !== undefined ? fontSize : 24;
	    scale = 1 / this.path.unitsPerEm * fontSize;
	    ctx.lineWidth = 1;

	    // Draw the origin
	    ctx.strokeStyle = 'black';
	    draw.line(ctx, x, -10000, x, 10000);
	    draw.line(ctx, -10000, y, 10000, y);

	    // This code is here due to memory optimization: by not using
	    // defaults in the constructor, we save a notable amount of memory.
	    var xMin = this.xMin || 0;
	    var yMin = this.yMin || 0;
	    var xMax = this.xMax || 0;
	    var yMax = this.yMax || 0;
	    var advanceWidth = this.advanceWidth || 0;

	    // Draw the glyph box
	    ctx.strokeStyle = 'blue';
	    draw.line(ctx, x + (xMin * scale), -10000, x + (xMin * scale), 10000);
	    draw.line(ctx, x + (xMax * scale), -10000, x + (xMax * scale), 10000);
	    draw.line(ctx, -10000, y + (-yMin * scale), 10000, y + (-yMin * scale));
	    draw.line(ctx, -10000, y + (-yMax * scale), 10000, y + (-yMax * scale));

	    // Draw the advance width
	    ctx.strokeStyle = 'green';
	    draw.line(ctx, x + (advanceWidth * scale), -10000, x + (advanceWidth * scale), 10000);
	};

	// The GlyphSet object

	// Define a property on the glyph that depends on the path being loaded.
	function defineDependentProperty(glyph, externalName, internalName) {
	    Object.defineProperty(glyph, externalName, {
	        get: function() {
	            // Request the path property to make sure the path is loaded.
	            glyph.path; // jshint ignore:line
	            return glyph[internalName];
	        },
	        set: function(newValue) {
	            glyph[internalName] = newValue;
	        },
	        enumerable: true,
	        configurable: true
	    });
	}

	/**
	 * A GlyphSet represents all glyphs available in the font, but modelled using
	 * a deferred glyph loader, for retrieving glyphs only once they are absolutely
	 * necessary, to keep the memory footprint down.
	 * @exports opentype.GlyphSet
	 * @class
	 * @param {opentype.Font}
	 * @param {Array}
	 */
	function GlyphSet(font, glyphs) {
	    this.font = font;
	    this.glyphs = {};
	    if (Array.isArray(glyphs)) {
	        for (var i = 0; i < glyphs.length; i++) {
	            var glyph = glyphs[i];
	            glyph.path.unitsPerEm = font.unitsPerEm;
	            this.glyphs[i] = glyph;
	        }
	    }

	    this.length = (glyphs && glyphs.length) || 0;
	}

	/**
	 * @param  {number} index
	 * @return {opentype.Glyph}
	 */
	GlyphSet.prototype.get = function(index) {
	    // this.glyphs[index] is 'undefined' when low memory mode is on. glyph is pushed on request only.
	    if (this.glyphs[index] === undefined) {
	        this.font._push(index);
	        if (typeof this.glyphs[index] === 'function') {
	            this.glyphs[index] = this.glyphs[index]();
	        }

	        var glyph = this.glyphs[index];
	        var unicodeObj = this.font._IndexToUnicodeMap[index];

	        if (unicodeObj) {
	            for (var j = 0; j < unicodeObj.unicodes.length; j++)
	                { glyph.addUnicode(unicodeObj.unicodes[j]); }
	        }

	        if (this.font.cffEncoding) {
	            if (this.font.isCIDFont) {
	                glyph.name = 'gid' + index;
	            } else {
	                glyph.name = this.font.cffEncoding.charset[index];
	            }
	        } else if (this.font.glyphNames.names) {
	            glyph.name = this.font.glyphNames.glyphIndexToName(index);
	        }

	        this.glyphs[index].advanceWidth = this.font._hmtxTableData[index].advanceWidth;
	        this.glyphs[index].leftSideBearing = this.font._hmtxTableData[index].leftSideBearing;
	    } else {
	        if (typeof this.glyphs[index] === 'function') {
	            this.glyphs[index] = this.glyphs[index]();
	        }
	    }

	    return this.glyphs[index];
	};

	/**
	 * @param  {number} index
	 * @param  {Object}
	 */
	GlyphSet.prototype.push = function(index, loader) {
	    this.glyphs[index] = loader;
	    this.length++;
	};

	/**
	 * @alias opentype.glyphLoader
	 * @param  {opentype.Font} font
	 * @param  {number} index
	 * @return {opentype.Glyph}
	 */
	function glyphLoader(font, index) {
	    return new Glyph({index: index, font: font});
	}

	/**
	 * Generate a stub glyph that can be filled with all metadata *except*
	 * the "points" and "path" properties, which must be loaded only once
	 * the glyph's path is actually requested for text shaping.
	 * @alias opentype.ttfGlyphLoader
	 * @param  {opentype.Font} font
	 * @param  {number} index
	 * @param  {Function} parseGlyph
	 * @param  {Object} data
	 * @param  {number} position
	 * @param  {Function} buildPath
	 * @return {opentype.Glyph}
	 */
	function ttfGlyphLoader(font, index, parseGlyph, data, position, buildPath) {
	    return function() {
	        var glyph = new Glyph({index: index, font: font});

	        glyph.path = function() {
	            parseGlyph(glyph, data, position);
	            var path = buildPath(font.glyphs, glyph);
	            path.unitsPerEm = font.unitsPerEm;
	            return path;
	        };

	        defineDependentProperty(glyph, 'xMin', '_xMin');
	        defineDependentProperty(glyph, 'xMax', '_xMax');
	        defineDependentProperty(glyph, 'yMin', '_yMin');
	        defineDependentProperty(glyph, 'yMax', '_yMax');

	        return glyph;
	    };
	}
	/**
	 * @alias opentype.cffGlyphLoader
	 * @param  {opentype.Font} font
	 * @param  {number} index
	 * @param  {Function} parseCFFCharstring
	 * @param  {string} charstring
	 * @return {opentype.Glyph}
	 */
	function cffGlyphLoader(font, index, parseCFFCharstring, charstring) {
	    return function() {
	        var glyph = new Glyph({index: index, font: font});

	        glyph.path = function() {
	            var path = parseCFFCharstring(font, glyph, charstring);
	            path.unitsPerEm = font.unitsPerEm;
	            return path;
	        };

	        return glyph;
	    };
	}

	var glyphset = { GlyphSet: GlyphSet, glyphLoader: glyphLoader, ttfGlyphLoader: ttfGlyphLoader, cffGlyphLoader: cffGlyphLoader };

	// The `CFF` table contains the glyph outlines in PostScript format.

	// Custom equals function that can also check lists.
	function equals(a, b) {
	    if (a === b) {
	        return true;
	    } else if (Array.isArray(a) && Array.isArray(b)) {
	        if (a.length !== b.length) {
	            return false;
	        }

	        for (var i = 0; i < a.length; i += 1) {
	            if (!equals(a[i], b[i])) {
	                return false;
	            }
	        }

	        return true;
	    } else {
	        return false;
	    }
	}

	// Subroutines are encoded using the negative half of the number space.
	// See type 2 chapter 4.7 "Subroutine operators".
	function calcCFFSubroutineBias(subrs) {
	    var bias;
	    if (subrs.length < 1240) {
	        bias = 107;
	    } else if (subrs.length < 33900) {
	        bias = 1131;
	    } else {
	        bias = 32768;
	    }

	    return bias;
	}

	// Parse a `CFF` INDEX array.
	// An index array consists of a list of offsets, then a list of objects at those offsets.
	function parseCFFIndex(data, start, conversionFn) {
	    var offsets = [];
	    var objects = [];
	    var count = parse.getCard16(data, start);
	    var objectOffset;
	    var endOffset;
	    if (count !== 0) {
	        var offsetSize = parse.getByte(data, start + 2);
	        objectOffset = start + ((count + 1) * offsetSize) + 2;
	        var pos = start + 3;
	        for (var i = 0; i < count + 1; i += 1) {
	            offsets.push(parse.getOffset(data, pos, offsetSize));
	            pos += offsetSize;
	        }

	        // The total size of the index array is 4 header bytes + the value of the last offset.
	        endOffset = objectOffset + offsets[count];
	    } else {
	        endOffset = start + 2;
	    }

	    for (var i$1 = 0; i$1 < offsets.length - 1; i$1 += 1) {
	        var value = parse.getBytes(data, objectOffset + offsets[i$1], objectOffset + offsets[i$1 + 1]);
	        if (conversionFn) {
	            value = conversionFn(value);
	        }

	        objects.push(value);
	    }

	    return {objects: objects, startOffset: start, endOffset: endOffset};
	}

	function parseCFFIndexLowMemory(data, start) {
	    var offsets = [];
	    var count = parse.getCard16(data, start);
	    var objectOffset;
	    var endOffset;
	    if (count !== 0) {
	        var offsetSize = parse.getByte(data, start + 2);
	        objectOffset = start + ((count + 1) * offsetSize) + 2;
	        var pos = start + 3;
	        for (var i = 0; i < count + 1; i += 1) {
	            offsets.push(parse.getOffset(data, pos, offsetSize));
	            pos += offsetSize;
	        }

	        // The total size of the index array is 4 header bytes + the value of the last offset.
	        endOffset = objectOffset + offsets[count];
	    } else {
	        endOffset = start + 2;
	    }

	    return {offsets: offsets, startOffset: start, endOffset: endOffset};
	}
	function getCffIndexObject(i, offsets, data, start, conversionFn) {
	    var count = parse.getCard16(data, start);
	    var objectOffset = 0;
	    if (count !== 0) {
	        var offsetSize = parse.getByte(data, start + 2);
	        objectOffset = start + ((count + 1) * offsetSize) + 2;
	    }

	    var value = parse.getBytes(data, objectOffset + offsets[i], objectOffset + offsets[i + 1]);
	    if (conversionFn) {
	        value = conversionFn(value);
	    }
	    return value;
	}

	// Parse a `CFF` DICT real value.
	function parseFloatOperand(parser) {
	    var s = '';
	    var eof = 15;
	    var lookup = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.', 'E', 'E-', null, '-'];
	    while (true) {
	        var b = parser.parseByte();
	        var n1 = b >> 4;
	        var n2 = b & 15;

	        if (n1 === eof) {
	            break;
	        }

	        s += lookup[n1];

	        if (n2 === eof) {
	            break;
	        }

	        s += lookup[n2];
	    }

	    return parseFloat(s);
	}

	// Parse a `CFF` DICT operand.
	function parseOperand(parser, b0) {
	    var b1;
	    var b2;
	    var b3;
	    var b4;
	    if (b0 === 28) {
	        b1 = parser.parseByte();
	        b2 = parser.parseByte();
	        return b1 << 8 | b2;
	    }

	    if (b0 === 29) {
	        b1 = parser.parseByte();
	        b2 = parser.parseByte();
	        b3 = parser.parseByte();
	        b4 = parser.parseByte();
	        return b1 << 24 | b2 << 16 | b3 << 8 | b4;
	    }

	    if (b0 === 30) {
	        return parseFloatOperand(parser);
	    }

	    if (b0 >= 32 && b0 <= 246) {
	        return b0 - 139;
	    }

	    if (b0 >= 247 && b0 <= 250) {
	        b1 = parser.parseByte();
	        return (b0 - 247) * 256 + b1 + 108;
	    }

	    if (b0 >= 251 && b0 <= 254) {
	        b1 = parser.parseByte();
	        return -(b0 - 251) * 256 - b1 - 108;
	    }

	    throw new Error('Invalid b0 ' + b0);
	}

	// Convert the entries returned by `parseDict` to a proper dictionary.
	// If a value is a list of one, it is unpacked.
	function entriesToObject(entries) {
	    var o = {};
	    for (var i = 0; i < entries.length; i += 1) {
	        var key = entries[i][0];
	        var values = entries[i][1];
	        var value = (void 0);
	        if (values.length === 1) {
	            value = values[0];
	        } else {
	            value = values;
	        }

	        if (o.hasOwnProperty(key) && !isNaN(o[key])) {
	            throw new Error('Object ' + o + ' already has key ' + key);
	        }

	        o[key] = value;
	    }

	    return o;
	}

	// Parse a `CFF` DICT object.
	// A dictionary contains key-value pairs in a compact tokenized format.
	function parseCFFDict(data, start, size) {
	    start = start !== undefined ? start : 0;
	    var parser = new parse.Parser(data, start);
	    var entries = [];
	    var operands = [];
	    size = size !== undefined ? size : data.length;

	    while (parser.relativeOffset < size) {
	        var op = parser.parseByte();

	        // The first byte for each dict item distinguishes between operator (key) and operand (value).
	        // Values <= 21 are operators.
	        if (op <= 21) {
	            // Two-byte operators have an initial escape byte of 12.
	            if (op === 12) {
	                op = 1200 + parser.parseByte();
	            }

	            entries.push([op, operands]);
	            operands = [];
	        } else {
	            // Since the operands (values) come before the operators (keys), we store all operands in a list
	            // until we encounter an operator.
	            operands.push(parseOperand(parser, op));
	        }
	    }

	    return entriesToObject(entries);
	}

	// Given a String Index (SID), return the value of the string.
	// Strings below index 392 are standard CFF strings and are not encoded in the font.
	function getCFFString(strings, index) {
	    if (index <= 390) {
	        index = cffStandardStrings[index];
	    } else {
	        index = strings[index - 391];
	    }

	    return index;
	}

	// Interpret a dictionary and return a new dictionary with readable keys and values for missing entries.
	// This function takes `meta` which is a list of objects containing `operand`, `name` and `default`.
	function interpretDict(dict, meta, strings) {
	    var newDict = {};
	    var value;

	    // Because we also want to include missing values, we start out from the meta list
	    // and lookup values in the dict.
	    for (var i = 0; i < meta.length; i += 1) {
	        var m = meta[i];

	        if (Array.isArray(m.type)) {
	            var values = [];
	            values.length = m.type.length;
	            for (var j = 0; j < m.type.length; j++) {
	                value = dict[m.op] !== undefined ? dict[m.op][j] : undefined;
	                if (value === undefined) {
	                    value = m.value !== undefined && m.value[j] !== undefined ? m.value[j] : null;
	                }
	                if (m.type[j] === 'SID') {
	                    value = getCFFString(strings, value);
	                }
	                values[j] = value;
	            }
	            newDict[m.name] = values;
	        } else {
	            value = dict[m.op];
	            if (value === undefined) {
	                value = m.value !== undefined ? m.value : null;
	            }

	            if (m.type === 'SID') {
	                value = getCFFString(strings, value);
	            }
	            newDict[m.name] = value;
	        }
	    }

	    return newDict;
	}

	// Parse the CFF header.
	function parseCFFHeader(data, start) {
	    var header = {};
	    header.formatMajor = parse.getCard8(data, start);
	    header.formatMinor = parse.getCard8(data, start + 1);
	    header.size = parse.getCard8(data, start + 2);
	    header.offsetSize = parse.getCard8(data, start + 3);
	    header.startOffset = start;
	    header.endOffset = start + 4;
	    return header;
	}

	var TOP_DICT_META = [
	    {name: 'version', op: 0, type: 'SID'},
	    {name: 'notice', op: 1, type: 'SID'},
	    {name: 'copyright', op: 1200, type: 'SID'},
	    {name: 'fullName', op: 2, type: 'SID'},
	    {name: 'familyName', op: 3, type: 'SID'},
	    {name: 'weight', op: 4, type: 'SID'},
	    {name: 'isFixedPitch', op: 1201, type: 'number', value: 0},
	    {name: 'italicAngle', op: 1202, type: 'number', value: 0},
	    {name: 'underlinePosition', op: 1203, type: 'number', value: -100},
	    {name: 'underlineThickness', op: 1204, type: 'number', value: 50},
	    {name: 'paintType', op: 1205, type: 'number', value: 0},
	    {name: 'charstringType', op: 1206, type: 'number', value: 2},
	    {
	        name: 'fontMatrix',
	        op: 1207,
	        type: ['real', 'real', 'real', 'real', 'real', 'real'],
	        value: [0.001, 0, 0, 0.001, 0, 0]
	    },
	    {name: 'uniqueId', op: 13, type: 'number'},
	    {name: 'fontBBox', op: 5, type: ['number', 'number', 'number', 'number'], value: [0, 0, 0, 0]},
	    {name: 'strokeWidth', op: 1208, type: 'number', value: 0},
	    {name: 'xuid', op: 14, type: [], value: null},
	    {name: 'charset', op: 15, type: 'offset', value: 0},
	    {name: 'encoding', op: 16, type: 'offset', value: 0},
	    {name: 'charStrings', op: 17, type: 'offset', value: 0},
	    {name: 'private', op: 18, type: ['number', 'offset'], value: [0, 0]},
	    {name: 'ros', op: 1230, type: ['SID', 'SID', 'number']},
	    {name: 'cidFontVersion', op: 1231, type: 'number', value: 0},
	    {name: 'cidFontRevision', op: 1232, type: 'number', value: 0},
	    {name: 'cidFontType', op: 1233, type: 'number', value: 0},
	    {name: 'cidCount', op: 1234, type: 'number', value: 8720},
	    {name: 'uidBase', op: 1235, type: 'number'},
	    {name: 'fdArray', op: 1236, type: 'offset'},
	    {name: 'fdSelect', op: 1237, type: 'offset'},
	    {name: 'fontName', op: 1238, type: 'SID'}
	];

	var PRIVATE_DICT_META = [
	    {name: 'subrs', op: 19, type: 'offset', value: 0},
	    {name: 'defaultWidthX', op: 20, type: 'number', value: 0},
	    {name: 'nominalWidthX', op: 21, type: 'number', value: 0}
	];

	// Parse the CFF top dictionary. A CFF table can contain multiple fonts, each with their own top dictionary.
	// The top dictionary contains the essential metadata for the font, together with the private dictionary.
	function parseCFFTopDict(data, strings) {
	    var dict = parseCFFDict(data, 0, data.byteLength);
	    return interpretDict(dict, TOP_DICT_META, strings);
	}

	// Parse the CFF private dictionary. We don't fully parse out all the values, only the ones we need.
	function parseCFFPrivateDict(data, start, size, strings) {
	    var dict = parseCFFDict(data, start, size);
	    return interpretDict(dict, PRIVATE_DICT_META, strings);
	}

	// Returns a list of "Top DICT"s found using an INDEX list.
	// Used to read both the usual high-level Top DICTs and also the FDArray
	// discovered inside CID-keyed fonts.  When a Top DICT has a reference to
	// a Private DICT that is read and saved into the Top DICT.
	//
	// In addition to the expected/optional values as outlined in TOP_DICT_META
	// the following values might be saved into the Top DICT.
	//
	//    _subrs []        array of local CFF subroutines from Private DICT
	//    _subrsBias       bias value computed from number of subroutines
	//                      (see calcCFFSubroutineBias() and parseCFFCharstring())
	//    _defaultWidthX   default widths for CFF characters
	//    _nominalWidthX   bias added to width embedded within glyph description
	//
	//    _privateDict     saved copy of parsed Private DICT from Top DICT
	function gatherCFFTopDicts(data, start, cffIndex, strings) {
	    var topDictArray = [];
	    for (var iTopDict = 0; iTopDict < cffIndex.length; iTopDict += 1) {
	        var topDictData = new DataView(new Uint8Array(cffIndex[iTopDict]).buffer);
	        var topDict = parseCFFTopDict(topDictData, strings);
	        topDict._subrs = [];
	        topDict._subrsBias = 0;
	        topDict._defaultWidthX = 0;
	        topDict._nominalWidthX = 0;
	        var privateSize = topDict.private[0];
	        var privateOffset = topDict.private[1];
	        if (privateSize !== 0 && privateOffset !== 0) {
	            var privateDict = parseCFFPrivateDict(data, privateOffset + start, privateSize, strings);
	            topDict._defaultWidthX = privateDict.defaultWidthX;
	            topDict._nominalWidthX = privateDict.nominalWidthX;
	            if (privateDict.subrs !== 0) {
	                var subrOffset = privateOffset + privateDict.subrs;
	                var subrIndex = parseCFFIndex(data, subrOffset + start);
	                topDict._subrs = subrIndex.objects;
	                topDict._subrsBias = calcCFFSubroutineBias(topDict._subrs);
	            }
	            topDict._privateDict = privateDict;
	        }
	        topDictArray.push(topDict);
	    }
	    return topDictArray;
	}

	// Parse the CFF charset table, which contains internal names for all the glyphs.
	// This function will return a list of glyph names.
	// See Adobe TN #5176 chapter 13, "Charsets".
	function parseCFFCharset(data, start, nGlyphs, strings) {
	    var sid;
	    var count;
	    var parser = new parse.Parser(data, start);

	    // The .notdef glyph is not included, so subtract 1.
	    nGlyphs -= 1;
	    var charset = ['.notdef'];

	    var format = parser.parseCard8();
	    if (format === 0) {
	        for (var i = 0; i < nGlyphs; i += 1) {
	            sid = parser.parseSID();
	            charset.push(getCFFString(strings, sid));
	        }
	    } else if (format === 1) {
	        while (charset.length <= nGlyphs) {
	            sid = parser.parseSID();
	            count = parser.parseCard8();
	            for (var i$1 = 0; i$1 <= count; i$1 += 1) {
	                charset.push(getCFFString(strings, sid));
	                sid += 1;
	            }
	        }
	    } else if (format === 2) {
	        while (charset.length <= nGlyphs) {
	            sid = parser.parseSID();
	            count = parser.parseCard16();
	            for (var i$2 = 0; i$2 <= count; i$2 += 1) {
	                charset.push(getCFFString(strings, sid));
	                sid += 1;
	            }
	        }
	    } else {
	        throw new Error('Unknown charset format ' + format);
	    }

	    return charset;
	}

	// Parse the CFF encoding data. Only one encoding can be specified per font.
	// See Adobe TN #5176 chapter 12, "Encodings".
	function parseCFFEncoding(data, start, charset) {
	    var code;
	    var enc = {};
	    var parser = new parse.Parser(data, start);
	    var format = parser.parseCard8();
	    if (format === 0) {
	        var nCodes = parser.parseCard8();
	        for (var i = 0; i < nCodes; i += 1) {
	            code = parser.parseCard8();
	            enc[code] = i;
	        }
	    } else if (format === 1) {
	        var nRanges = parser.parseCard8();
	        code = 1;
	        for (var i$1 = 0; i$1 < nRanges; i$1 += 1) {
	            var first = parser.parseCard8();
	            var nLeft = parser.parseCard8();
	            for (var j = first; j <= first + nLeft; j += 1) {
	                enc[j] = code;
	                code += 1;
	            }
	        }
	    } else {
	        throw new Error('Unknown encoding format ' + format);
	    }

	    return new CffEncoding(enc, charset);
	}

	// Take in charstring code and return a Glyph object.
	// The encoding is described in the Type 2 Charstring Format
	// https://www.microsoft.com/typography/OTSPEC/charstr2.htm
	function parseCFFCharstring(font, glyph, code) {
	    var c1x;
	    var c1y;
	    var c2x;
	    var c2y;
	    var p = new Path();
	    var stack = [];
	    var nStems = 0;
	    var haveWidth = false;
	    var open = false;
	    var x = 0;
	    var y = 0;
	    var subrs;
	    var subrsBias;
	    var defaultWidthX;
	    var nominalWidthX;
	    if (font.isCIDFont) {
	        var fdIndex = font.tables.cff.topDict._fdSelect[glyph.index];
	        var fdDict = font.tables.cff.topDict._fdArray[fdIndex];
	        subrs = fdDict._subrs;
	        subrsBias = fdDict._subrsBias;
	        defaultWidthX = fdDict._defaultWidthX;
	        nominalWidthX = fdDict._nominalWidthX;
	    } else {
	        subrs = font.tables.cff.topDict._subrs;
	        subrsBias = font.tables.cff.topDict._subrsBias;
	        defaultWidthX = font.tables.cff.topDict._defaultWidthX;
	        nominalWidthX = font.tables.cff.topDict._nominalWidthX;
	    }
	    var width = defaultWidthX;

	    function newContour(x, y) {
	        if (open) {
	            p.closePath();
	        }

	        p.moveTo(x, y);
	        open = true;
	    }

	    function parseStems() {
	        var hasWidthArg;

	        // The number of stem operators on the stack is always even.
	        // If the value is uneven, that means a width is specified.
	        hasWidthArg = stack.length % 2 !== 0;
	        if (hasWidthArg && !haveWidth) {
	            width = stack.shift() + nominalWidthX;
	        }

	        nStems += stack.length >> 1;
	        stack.length = 0;
	        haveWidth = true;
	    }

	    function parse(code) {
	        var b1;
	        var b2;
	        var b3;
	        var b4;
	        var codeIndex;
	        var subrCode;
	        var jpx;
	        var jpy;
	        var c3x;
	        var c3y;
	        var c4x;
	        var c4y;

	        var i = 0;
	        while (i < code.length) {
	            var v = code[i];
	            i += 1;
	            switch (v) {
	                case 1: // hstem
	                    parseStems();
	                    break;
	                case 3: // vstem
	                    parseStems();
	                    break;
	                case 4: // vmoveto
	                    if (stack.length > 1 && !haveWidth) {
	                        width = stack.shift() + nominalWidthX;
	                        haveWidth = true;
	                    }

	                    y += stack.pop();
	                    newContour(x, y);
	                    break;
	                case 5: // rlineto
	                    while (stack.length > 0) {
	                        x += stack.shift();
	                        y += stack.shift();
	                        p.lineTo(x, y);
	                    }

	                    break;
	                case 6: // hlineto
	                    while (stack.length > 0) {
	                        x += stack.shift();
	                        p.lineTo(x, y);
	                        if (stack.length === 0) {
	                            break;
	                        }

	                        y += stack.shift();
	                        p.lineTo(x, y);
	                    }

	                    break;
	                case 7: // vlineto
	                    while (stack.length > 0) {
	                        y += stack.shift();
	                        p.lineTo(x, y);
	                        if (stack.length === 0) {
	                            break;
	                        }

	                        x += stack.shift();
	                        p.lineTo(x, y);
	                    }

	                    break;
	                case 8: // rrcurveto
	                    while (stack.length > 0) {
	                        c1x = x + stack.shift();
	                        c1y = y + stack.shift();
	                        c2x = c1x + stack.shift();
	                        c2y = c1y + stack.shift();
	                        x = c2x + stack.shift();
	                        y = c2y + stack.shift();
	                        p.curveTo(c1x, c1y, c2x, c2y, x, y);
	                    }

	                    break;
	                case 10: // callsubr
	                    codeIndex = stack.pop() + subrsBias;
	                    subrCode = subrs[codeIndex];
	                    if (subrCode) {
	                        parse(subrCode);
	                    }

	                    break;
	                case 11: // return
	                    return;
	                case 12: // flex operators
	                    v = code[i];
	                    i += 1;
	                    switch (v) {
	                        case 35: // flex
	                            // |- dx1 dy1 dx2 dy2 dx3 dy3 dx4 dy4 dx5 dy5 dx6 dy6 fd flex (12 35) |-
	                            c1x = x   + stack.shift();    // dx1
	                            c1y = y   + stack.shift();    // dy1
	                            c2x = c1x + stack.shift();    // dx2
	                            c2y = c1y + stack.shift();    // dy2
	                            jpx = c2x + stack.shift();    // dx3
	                            jpy = c2y + stack.shift();    // dy3
	                            c3x = jpx + stack.shift();    // dx4
	                            c3y = jpy + stack.shift();    // dy4
	                            c4x = c3x + stack.shift();    // dx5
	                            c4y = c3y + stack.shift();    // dy5
	                            x = c4x   + stack.shift();    // dx6
	                            y = c4y   + stack.shift();    // dy6
	                            stack.shift();                // flex depth
	                            p.curveTo(c1x, c1y, c2x, c2y, jpx, jpy);
	                            p.curveTo(c3x, c3y, c4x, c4y, x, y);
	                            break;
	                        case 34: // hflex
	                            // |- dx1 dx2 dy2 dx3 dx4 dx5 dx6 hflex (12 34) |-
	                            c1x = x   + stack.shift();    // dx1
	                            c1y = y;                      // dy1
	                            c2x = c1x + stack.shift();    // dx2
	                            c2y = c1y + stack.shift();    // dy2
	                            jpx = c2x + stack.shift();    // dx3
	                            jpy = c2y;                    // dy3
	                            c3x = jpx + stack.shift();    // dx4
	                            c3y = c2y;                    // dy4
	                            c4x = c3x + stack.shift();    // dx5
	                            c4y = y;                      // dy5
	                            x = c4x + stack.shift();      // dx6
	                            p.curveTo(c1x, c1y, c2x, c2y, jpx, jpy);
	                            p.curveTo(c3x, c3y, c4x, c4y, x, y);
	                            break;
	                        case 36: // hflex1
	                            // |- dx1 dy1 dx2 dy2 dx3 dx4 dx5 dy5 dx6 hflex1 (12 36) |-
	                            c1x = x   + stack.shift();    // dx1
	                            c1y = y   + stack.shift();    // dy1
	                            c2x = c1x + stack.shift();    // dx2
	                            c2y = c1y + stack.shift();    // dy2
	                            jpx = c2x + stack.shift();    // dx3
	                            jpy = c2y;                    // dy3
	                            c3x = jpx + stack.shift();    // dx4
	                            c3y = c2y;                    // dy4
	                            c4x = c3x + stack.shift();    // dx5
	                            c4y = c3y + stack.shift();    // dy5
	                            x = c4x + stack.shift();      // dx6
	                            p.curveTo(c1x, c1y, c2x, c2y, jpx, jpy);
	                            p.curveTo(c3x, c3y, c4x, c4y, x, y);
	                            break;
	                        case 37: // flex1
	                            // |- dx1 dy1 dx2 dy2 dx3 dy3 dx4 dy4 dx5 dy5 d6 flex1 (12 37) |-
	                            c1x = x   + stack.shift();    // dx1
	                            c1y = y   + stack.shift();    // dy1
	                            c2x = c1x + stack.shift();    // dx2
	                            c2y = c1y + stack.shift();    // dy2
	                            jpx = c2x + stack.shift();    // dx3
	                            jpy = c2y + stack.shift();    // dy3
	                            c3x = jpx + stack.shift();    // dx4
	                            c3y = jpy + stack.shift();    // dy4
	                            c4x = c3x + stack.shift();    // dx5
	                            c4y = c3y + stack.shift();    // dy5
	                            if (Math.abs(c4x - x) > Math.abs(c4y - y)) {
	                                x = c4x + stack.shift();
	                            } else {
	                                y = c4y + stack.shift();
	                            }

	                            p.curveTo(c1x, c1y, c2x, c2y, jpx, jpy);
	                            p.curveTo(c3x, c3y, c4x, c4y, x, y);
	                            break;
	                        default:
	                            console.log('Glyph ' + glyph.index + ': unknown operator ' + 1200 + v);
	                            stack.length = 0;
	                    }
	                    break;
	                case 14: // endchar
	                    if (stack.length > 0 && !haveWidth) {
	                        width = stack.shift() + nominalWidthX;
	                        haveWidth = true;
	                    }

	                    if (open) {
	                        p.closePath();
	                        open = false;
	                    }

	                    break;
	                case 18: // hstemhm
	                    parseStems();
	                    break;
	                case 19: // hintmask
	                case 20: // cntrmask
	                    parseStems();
	                    i += (nStems + 7) >> 3;
	                    break;
	                case 21: // rmoveto
	                    if (stack.length > 2 && !haveWidth) {
	                        width = stack.shift() + nominalWidthX;
	                        haveWidth = true;
	                    }

	                    y += stack.pop();
	                    x += stack.pop();
	                    newContour(x, y);
	                    break;
	                case 22: // hmoveto
	                    if (stack.length > 1 && !haveWidth) {
	                        width = stack.shift() + nominalWidthX;
	                        haveWidth = true;
	                    }

	                    x += stack.pop();
	                    newContour(x, y);
	                    break;
	                case 23: // vstemhm
	                    parseStems();
	                    break;
	                case 24: // rcurveline
	                    while (stack.length > 2) {
	                        c1x = x + stack.shift();
	                        c1y = y + stack.shift();
	                        c2x = c1x + stack.shift();
	                        c2y = c1y + stack.shift();
	                        x = c2x + stack.shift();
	                        y = c2y + stack.shift();
	                        p.curveTo(c1x, c1y, c2x, c2y, x, y);
	                    }

	                    x += stack.shift();
	                    y += stack.shift();
	                    p.lineTo(x, y);
	                    break;
	                case 25: // rlinecurve
	                    while (stack.length > 6) {
	                        x += stack.shift();
	                        y += stack.shift();
	                        p.lineTo(x, y);
	                    }

	                    c1x = x + stack.shift();
	                    c1y = y + stack.shift();
	                    c2x = c1x + stack.shift();
	                    c2y = c1y + stack.shift();
	                    x = c2x + stack.shift();
	                    y = c2y + stack.shift();
	                    p.curveTo(c1x, c1y, c2x, c2y, x, y);
	                    break;
	                case 26: // vvcurveto
	                    if (stack.length % 2) {
	                        x += stack.shift();
	                    }

	                    while (stack.length > 0) {
	                        c1x = x;
	                        c1y = y + stack.shift();
	                        c2x = c1x + stack.shift();
	                        c2y = c1y + stack.shift();
	                        x = c2x;
	                        y = c2y + stack.shift();
	                        p.curveTo(c1x, c1y, c2x, c2y, x, y);
	                    }

	                    break;
	                case 27: // hhcurveto
	                    if (stack.length % 2) {
	                        y += stack.shift();
	                    }

	                    while (stack.length > 0) {
	                        c1x = x + stack.shift();
	                        c1y = y;
	                        c2x = c1x + stack.shift();
	                        c2y = c1y + stack.shift();
	                        x = c2x + stack.shift();
	                        y = c2y;
	                        p.curveTo(c1x, c1y, c2x, c2y, x, y);
	                    }

	                    break;
	                case 28: // shortint
	                    b1 = code[i];
	                    b2 = code[i + 1];
	                    stack.push(((b1 << 24) | (b2 << 16)) >> 16);
	                    i += 2;
	                    break;
	                case 29: // callgsubr
	                    codeIndex = stack.pop() + font.gsubrsBias;
	                    subrCode = font.gsubrs[codeIndex];
	                    if (subrCode) {
	                        parse(subrCode);
	                    }

	                    break;
	                case 30: // vhcurveto
	                    while (stack.length > 0) {
	                        c1x = x;
	                        c1y = y + stack.shift();
	                        c2x = c1x + stack.shift();
	                        c2y = c1y + stack.shift();
	                        x = c2x + stack.shift();
	                        y = c2y + (stack.length === 1 ? stack.shift() : 0);
	                        p.curveTo(c1x, c1y, c2x, c2y, x, y);
	                        if (stack.length === 0) {
	                            break;
	                        }

	                        c1x = x + stack.shift();
	                        c1y = y;
	                        c2x = c1x + stack.shift();
	                        c2y = c1y + stack.shift();
	                        y = c2y + stack.shift();
	                        x = c2x + (stack.length === 1 ? stack.shift() : 0);
	                        p.curveTo(c1x, c1y, c2x, c2y, x, y);
	                    }

	                    break;
	                case 31: // hvcurveto
	                    while (stack.length > 0) {
	                        c1x = x + stack.shift();
	                        c1y = y;
	                        c2x = c1x + stack.shift();
	                        c2y = c1y + stack.shift();
	                        y = c2y + stack.shift();
	                        x = c2x + (stack.length === 1 ? stack.shift() : 0);
	                        p.curveTo(c1x, c1y, c2x, c2y, x, y);
	                        if (stack.length === 0) {
	                            break;
	                        }

	                        c1x = x;
	                        c1y = y + stack.shift();
	                        c2x = c1x + stack.shift();
	                        c2y = c1y + stack.shift();
	                        x = c2x + stack.shift();
	                        y = c2y + (stack.length === 1 ? stack.shift() : 0);
	                        p.curveTo(c1x, c1y, c2x, c2y, x, y);
	                    }

	                    break;
	                default:
	                    if (v < 32) {
	                        console.log('Glyph ' + glyph.index + ': unknown operator ' + v);
	                    } else if (v < 247) {
	                        stack.push(v - 139);
	                    } else if (v < 251) {
	                        b1 = code[i];
	                        i += 1;
	                        stack.push((v - 247) * 256 + b1 + 108);
	                    } else if (v < 255) {
	                        b1 = code[i];
	                        i += 1;
	                        stack.push(-(v - 251) * 256 - b1 - 108);
	                    } else {
	                        b1 = code[i];
	                        b2 = code[i + 1];
	                        b3 = code[i + 2];
	                        b4 = code[i + 3];
	                        i += 4;
	                        stack.push(((b1 << 24) | (b2 << 16) | (b3 << 8) | b4) / 65536);
	                    }
	            }
	        }
	    }

	    parse(code);

	    glyph.advanceWidth = width;
	    return p;
	}

	function parseCFFFDSelect(data, start, nGlyphs, fdArrayCount) {
	    var fdSelect = [];
	    var fdIndex;
	    var parser = new parse.Parser(data, start);
	    var format = parser.parseCard8();
	    if (format === 0) {
	        // Simple list of nGlyphs elements
	        for (var iGid = 0; iGid < nGlyphs; iGid++) {
	            fdIndex = parser.parseCard8();
	            if (fdIndex >= fdArrayCount) {
	                throw new Error('CFF table CID Font FDSelect has bad FD index value ' + fdIndex + ' (FD count ' + fdArrayCount + ')');
	            }
	            fdSelect.push(fdIndex);
	        }
	    } else if (format === 3) {
	        // Ranges
	        var nRanges = parser.parseCard16();
	        var first = parser.parseCard16();
	        if (first !== 0) {
	            throw new Error('CFF Table CID Font FDSelect format 3 range has bad initial GID ' + first);
	        }
	        var next;
	        for (var iRange = 0; iRange < nRanges; iRange++) {
	            fdIndex = parser.parseCard8();
	            next = parser.parseCard16();
	            if (fdIndex >= fdArrayCount) {
	                throw new Error('CFF table CID Font FDSelect has bad FD index value ' + fdIndex + ' (FD count ' + fdArrayCount + ')');
	            }
	            if (next > nGlyphs) {
	                throw new Error('CFF Table CID Font FDSelect format 3 range has bad GID ' + next);
	            }
	            for (; first < next; first++) {
	                fdSelect.push(fdIndex);
	            }
	            first = next;
	        }
	        if (next !== nGlyphs) {
	            throw new Error('CFF Table CID Font FDSelect format 3 range has bad final GID ' + next);
	        }
	    } else {
	        throw new Error('CFF Table CID Font FDSelect table has unsupported format ' + format);
	    }
	    return fdSelect;
	}

	// Parse the `CFF` table, which contains the glyph outlines in PostScript format.
	function parseCFFTable(data, start, font, opt) {
	    font.tables.cff = {};
	    var header = parseCFFHeader(data, start);
	    var nameIndex = parseCFFIndex(data, header.endOffset, parse.bytesToString);
	    var topDictIndex = parseCFFIndex(data, nameIndex.endOffset);
	    var stringIndex = parseCFFIndex(data, topDictIndex.endOffset, parse.bytesToString);
	    var globalSubrIndex = parseCFFIndex(data, stringIndex.endOffset);
	    font.gsubrs = globalSubrIndex.objects;
	    font.gsubrsBias = calcCFFSubroutineBias(font.gsubrs);

	    var topDictArray = gatherCFFTopDicts(data, start, topDictIndex.objects, stringIndex.objects);
	    if (topDictArray.length !== 1) {
	        throw new Error('CFF table has too many fonts in \'FontSet\' - count of fonts NameIndex.length = ' + topDictArray.length);
	    }

	    var topDict = topDictArray[0];
	    font.tables.cff.topDict = topDict;

	    if (topDict._privateDict) {
	        font.defaultWidthX = topDict._privateDict.defaultWidthX;
	        font.nominalWidthX = topDict._privateDict.nominalWidthX;
	    }

	    if (topDict.ros[0] !== undefined && topDict.ros[1] !== undefined) {
	        font.isCIDFont = true;
	    }

	    if (font.isCIDFont) {
	        var fdArrayOffset = topDict.fdArray;
	        var fdSelectOffset = topDict.fdSelect;
	        if (fdArrayOffset === 0 || fdSelectOffset === 0) {
	            throw new Error('Font is marked as a CID font, but FDArray and/or FDSelect information is missing');
	        }
	        fdArrayOffset += start;
	        var fdArrayIndex = parseCFFIndex(data, fdArrayOffset);
	        var fdArray = gatherCFFTopDicts(data, start, fdArrayIndex.objects, stringIndex.objects);
	        topDict._fdArray = fdArray;
	        fdSelectOffset += start;
	        topDict._fdSelect = parseCFFFDSelect(data, fdSelectOffset, font.numGlyphs, fdArray.length);
	    }

	    var privateDictOffset = start + topDict.private[1];
	    var privateDict = parseCFFPrivateDict(data, privateDictOffset, topDict.private[0], stringIndex.objects);
	    font.defaultWidthX = privateDict.defaultWidthX;
	    font.nominalWidthX = privateDict.nominalWidthX;

	    if (privateDict.subrs !== 0) {
	        var subrOffset = privateDictOffset + privateDict.subrs;
	        var subrIndex = parseCFFIndex(data, subrOffset);
	        font.subrs = subrIndex.objects;
	        font.subrsBias = calcCFFSubroutineBias(font.subrs);
	    } else {
	        font.subrs = [];
	        font.subrsBias = 0;
	    }

	    // Offsets in the top dict are relative to the beginning of the CFF data, so add the CFF start offset.
	    var charStringsIndex;
	    if (opt.lowMemory) {
	        charStringsIndex = parseCFFIndexLowMemory(data, start + topDict.charStrings);
	        font.nGlyphs = charStringsIndex.offsets.length;
	    } else {
	        charStringsIndex = parseCFFIndex(data, start + topDict.charStrings);
	        font.nGlyphs = charStringsIndex.objects.length;
	    }

	    var charset = parseCFFCharset(data, start + topDict.charset, font.nGlyphs, stringIndex.objects);
	    if (topDict.encoding === 0) {
	        // Standard encoding
	        font.cffEncoding = new CffEncoding(cffStandardEncoding, charset);
	    } else if (topDict.encoding === 1) {
	        // Expert encoding
	        font.cffEncoding = new CffEncoding(cffExpertEncoding, charset);
	    } else {
	        font.cffEncoding = parseCFFEncoding(data, start + topDict.encoding, charset);
	    }

	    // Prefer the CMAP encoding to the CFF encoding.
	    font.encoding = font.encoding || font.cffEncoding;

	    font.glyphs = new glyphset.GlyphSet(font);
	    if (opt.lowMemory) {
	        font._push = function(i) {
	            var charString = getCffIndexObject(i, charStringsIndex.offsets, data, start + topDict.charStrings);
	            font.glyphs.push(i, glyphset.cffGlyphLoader(font, i, parseCFFCharstring, charString));
	        };
	    } else {
	        for (var i = 0; i < font.nGlyphs; i += 1) {
	            var charString = charStringsIndex.objects[i];
	            font.glyphs.push(i, glyphset.cffGlyphLoader(font, i, parseCFFCharstring, charString));
	        }
	    }
	}

	// Convert a string to a String ID (SID).
	// The list of strings is modified in place.
	function encodeString(s, strings) {
	    var sid;

	    // Is the string in the CFF standard strings?
	    var i = cffStandardStrings.indexOf(s);
	    if (i >= 0) {
	        sid = i;
	    }

	    // Is the string already in the string index?
	    i = strings.indexOf(s);
	    if (i >= 0) {
	        sid = i + cffStandardStrings.length;
	    } else {
	        sid = cffStandardStrings.length + strings.length;
	        strings.push(s);
	    }

	    return sid;
	}

	function makeHeader() {
	    return new table.Record('Header', [
	        {name: 'major', type: 'Card8', value: 1},
	        {name: 'minor', type: 'Card8', value: 0},
	        {name: 'hdrSize', type: 'Card8', value: 4},
	        {name: 'major', type: 'Card8', value: 1}
	    ]);
	}

	function makeNameIndex(fontNames) {
	    var t = new table.Record('Name INDEX', [
	        {name: 'names', type: 'INDEX', value: []}
	    ]);
	    t.names = [];
	    for (var i = 0; i < fontNames.length; i += 1) {
	        t.names.push({name: 'name_' + i, type: 'NAME', value: fontNames[i]});
	    }

	    return t;
	}

	// Given a dictionary's metadata, create a DICT structure.
	function makeDict(meta, attrs, strings) {
	    var m = {};
	    for (var i = 0; i < meta.length; i += 1) {
	        var entry = meta[i];
	        var value = attrs[entry.name];
	        if (value !== undefined && !equals(value, entry.value)) {
	            if (entry.type === 'SID') {
	                value = encodeString(value, strings);
	            }

	            m[entry.op] = {name: entry.name, type: entry.type, value: value};
	        }
	    }

	    return m;
	}

	// The Top DICT houses the global font attributes.
	function makeTopDict(attrs, strings) {
	    var t = new table.Record('Top DICT', [
	        {name: 'dict', type: 'DICT', value: {}}
	    ]);
	    t.dict = makeDict(TOP_DICT_META, attrs, strings);
	    return t;
	}

	function makeTopDictIndex(topDict) {
	    var t = new table.Record('Top DICT INDEX', [
	        {name: 'topDicts', type: 'INDEX', value: []}
	    ]);
	    t.topDicts = [{name: 'topDict_0', type: 'TABLE', value: topDict}];
	    return t;
	}

	function makeStringIndex(strings) {
	    var t = new table.Record('String INDEX', [
	        {name: 'strings', type: 'INDEX', value: []}
	    ]);
	    t.strings = [];
	    for (var i = 0; i < strings.length; i += 1) {
	        t.strings.push({name: 'string_' + i, type: 'STRING', value: strings[i]});
	    }

	    return t;
	}

	function makeGlobalSubrIndex() {
	    // Currently we don't use subroutines.
	    return new table.Record('Global Subr INDEX', [
	        {name: 'subrs', type: 'INDEX', value: []}
	    ]);
	}

	function makeCharsets(glyphNames, strings) {
	    var t = new table.Record('Charsets', [
	        {name: 'format', type: 'Card8', value: 0}
	    ]);
	    for (var i = 0; i < glyphNames.length; i += 1) {
	        var glyphName = glyphNames[i];
	        var glyphSID = encodeString(glyphName, strings);
	        t.fields.push({name: 'glyph_' + i, type: 'SID', value: glyphSID});
	    }

	    return t;
	}

	function glyphToOps(glyph) {
	    var ops = [];
	    var path = glyph.path;
	    ops.push({name: 'width', type: 'NUMBER', value: glyph.advanceWidth});
	    var x = 0;
	    var y = 0;
	    for (var i = 0; i < path.commands.length; i += 1) {
	        var dx = (void 0);
	        var dy = (void 0);
	        var cmd = path.commands[i];
	        if (cmd.type === 'Q') {
	            // CFF only supports bézier curves, so convert the quad to a bézier.
	            var _13 = 1 / 3;
	            var _23 = 2 / 3;

	            // We're going to create a new command so we don't change the original path.
	            // Since all coordinates are relative, we round() them ASAP to avoid propagating errors.
	            cmd = {
	                type: 'C',
	                x: cmd.x,
	                y: cmd.y,
	                x1: Math.round(_13 * x + _23 * cmd.x1),
	                y1: Math.round(_13 * y + _23 * cmd.y1),
	                x2: Math.round(_13 * cmd.x + _23 * cmd.x1),
	                y2: Math.round(_13 * cmd.y + _23 * cmd.y1)
	            };
	        }

	        if (cmd.type === 'M') {
	            dx = Math.round(cmd.x - x);
	            dy = Math.round(cmd.y - y);
	            ops.push({name: 'dx', type: 'NUMBER', value: dx});
	            ops.push({name: 'dy', type: 'NUMBER', value: dy});
	            ops.push({name: 'rmoveto', type: 'OP', value: 21});
	            x = Math.round(cmd.x);
	            y = Math.round(cmd.y);
	        } else if (cmd.type === 'L') {
	            dx = Math.round(cmd.x - x);
	            dy = Math.round(cmd.y - y);
	            ops.push({name: 'dx', type: 'NUMBER', value: dx});
	            ops.push({name: 'dy', type: 'NUMBER', value: dy});
	            ops.push({name: 'rlineto', type: 'OP', value: 5});
	            x = Math.round(cmd.x);
	            y = Math.round(cmd.y);
	        } else if (cmd.type === 'C') {
	            var dx1 = Math.round(cmd.x1 - x);
	            var dy1 = Math.round(cmd.y1 - y);
	            var dx2 = Math.round(cmd.x2 - cmd.x1);
	            var dy2 = Math.round(cmd.y2 - cmd.y1);
	            dx = Math.round(cmd.x - cmd.x2);
	            dy = Math.round(cmd.y - cmd.y2);
	            ops.push({name: 'dx1', type: 'NUMBER', value: dx1});
	            ops.push({name: 'dy1', type: 'NUMBER', value: dy1});
	            ops.push({name: 'dx2', type: 'NUMBER', value: dx2});
	            ops.push({name: 'dy2', type: 'NUMBER', value: dy2});
	            ops.push({name: 'dx', type: 'NUMBER', value: dx});
	            ops.push({name: 'dy', type: 'NUMBER', value: dy});
	            ops.push({name: 'rrcurveto', type: 'OP', value: 8});
	            x = Math.round(cmd.x);
	            y = Math.round(cmd.y);
	        }

	        // Contours are closed automatically.
	    }

	    ops.push({name: 'endchar', type: 'OP', value: 14});
	    return ops;
	}

	function makeCharStringsIndex(glyphs) {
	    var t = new table.Record('CharStrings INDEX', [
	        {name: 'charStrings', type: 'INDEX', value: []}
	    ]);

	    for (var i = 0; i < glyphs.length; i += 1) {
	        var glyph = glyphs.get(i);
	        var ops = glyphToOps(glyph);
	        t.charStrings.push({name: glyph.name, type: 'CHARSTRING', value: ops});
	    }

	    return t;
	}

	function makePrivateDict(attrs, strings) {
	    var t = new table.Record('Private DICT', [
	        {name: 'dict', type: 'DICT', value: {}}
	    ]);
	    t.dict = makeDict(PRIVATE_DICT_META, attrs, strings);
	    return t;
	}

	function makeCFFTable(glyphs, options) {
	    var t = new table.Table('CFF ', [
	        {name: 'header', type: 'RECORD'},
	        {name: 'nameIndex', type: 'RECORD'},
	        {name: 'topDictIndex', type: 'RECORD'},
	        {name: 'stringIndex', type: 'RECORD'},
	        {name: 'globalSubrIndex', type: 'RECORD'},
	        {name: 'charsets', type: 'RECORD'},
	        {name: 'charStringsIndex', type: 'RECORD'},
	        {name: 'privateDict', type: 'RECORD'}
	    ]);

	    var fontScale = 1 / options.unitsPerEm;
	    // We use non-zero values for the offsets so that the DICT encodes them.
	    // This is important because the size of the Top DICT plays a role in offset calculation,
	    // and the size shouldn't change after we've written correct offsets.
	    var attrs = {
	        version: options.version,
	        fullName: options.fullName,
	        familyName: options.familyName,
	        weight: options.weightName,
	        fontBBox: options.fontBBox || [0, 0, 0, 0],
	        fontMatrix: [fontScale, 0, 0, fontScale, 0, 0],
	        charset: 999,
	        encoding: 0,
	        charStrings: 999,
	        private: [0, 999]
	    };

	    var privateAttrs = {};

	    var glyphNames = [];
	    var glyph;

	    // Skip first glyph (.notdef)
	    for (var i = 1; i < glyphs.length; i += 1) {
	        glyph = glyphs.get(i);
	        glyphNames.push(glyph.name);
	    }

	    var strings = [];

	    t.header = makeHeader();
	    t.nameIndex = makeNameIndex([options.postScriptName]);
	    var topDict = makeTopDict(attrs, strings);
	    t.topDictIndex = makeTopDictIndex(topDict);
	    t.globalSubrIndex = makeGlobalSubrIndex();
	    t.charsets = makeCharsets(glyphNames, strings);
	    t.charStringsIndex = makeCharStringsIndex(glyphs);
	    t.privateDict = makePrivateDict(privateAttrs, strings);

	    // Needs to come at the end, to encode all custom strings used in the font.
	    t.stringIndex = makeStringIndex(strings);

	    var startOffset = t.header.sizeOf() +
	        t.nameIndex.sizeOf() +
	        t.topDictIndex.sizeOf() +
	        t.stringIndex.sizeOf() +
	        t.globalSubrIndex.sizeOf();
	    attrs.charset = startOffset;

	    // We use the CFF standard encoding; proper encoding will be handled in cmap.
	    attrs.encoding = 0;
	    attrs.charStrings = attrs.charset + t.charsets.sizeOf();
	    attrs.private[1] = attrs.charStrings + t.charStringsIndex.sizeOf();

	    // Recreate the Top DICT INDEX with the correct offsets.
	    topDict = makeTopDict(attrs, strings);
	    t.topDictIndex = makeTopDictIndex(topDict);

	    return t;
	}

	var cff = { parse: parseCFFTable, make: makeCFFTable };

	// The `head` table contains global information about the font.

	// Parse the header `head` table
	function parseHeadTable(data, start) {
	    var head = {};
	    var p = new parse.Parser(data, start);
	    head.version = p.parseVersion();
	    head.fontRevision = Math.round(p.parseFixed() * 1000) / 1000;
	    head.checkSumAdjustment = p.parseULong();
	    head.magicNumber = p.parseULong();
	    check.argument(head.magicNumber === 0x5F0F3CF5, 'Font header has wrong magic number.');
	    head.flags = p.parseUShort();
	    head.unitsPerEm = p.parseUShort();
	    head.created = p.parseLongDateTime();
	    head.modified = p.parseLongDateTime();
	    head.xMin = p.parseShort();
	    head.yMin = p.parseShort();
	    head.xMax = p.parseShort();
	    head.yMax = p.parseShort();
	    head.macStyle = p.parseUShort();
	    head.lowestRecPPEM = p.parseUShort();
	    head.fontDirectionHint = p.parseShort();
	    head.indexToLocFormat = p.parseShort();
	    head.glyphDataFormat = p.parseShort();
	    return head;
	}

	function makeHeadTable(options) {
	    // Apple Mac timestamp epoch is 01/01/1904 not 01/01/1970
	    var timestamp = Math.round(new Date().getTime() / 1000) + 2082844800;
	    var createdTimestamp = timestamp;

	    if (options.createdTimestamp) {
	        createdTimestamp = options.createdTimestamp + 2082844800;
	    }

	    return new table.Table('head', [
	        {name: 'version', type: 'FIXED', value: 0x00010000},
	        {name: 'fontRevision', type: 'FIXED', value: 0x00010000},
	        {name: 'checkSumAdjustment', type: 'ULONG', value: 0},
	        {name: 'magicNumber', type: 'ULONG', value: 0x5F0F3CF5},
	        {name: 'flags', type: 'USHORT', value: 0},
	        {name: 'unitsPerEm', type: 'USHORT', value: 1000},
	        {name: 'created', type: 'LONGDATETIME', value: createdTimestamp},
	        {name: 'modified', type: 'LONGDATETIME', value: timestamp},
	        {name: 'xMin', type: 'SHORT', value: 0},
	        {name: 'yMin', type: 'SHORT', value: 0},
	        {name: 'xMax', type: 'SHORT', value: 0},
	        {name: 'yMax', type: 'SHORT', value: 0},
	        {name: 'macStyle', type: 'USHORT', value: 0},
	        {name: 'lowestRecPPEM', type: 'USHORT', value: 0},
	        {name: 'fontDirectionHint', type: 'SHORT', value: 2},
	        {name: 'indexToLocFormat', type: 'SHORT', value: 0},
	        {name: 'glyphDataFormat', type: 'SHORT', value: 0}
	    ], options);
	}

	var head = { parse: parseHeadTable, make: makeHeadTable };

	// The `hhea` table contains information for horizontal layout.

	// Parse the horizontal header `hhea` table
	function parseHheaTable(data, start) {
	    var hhea = {};
	    var p = new parse.Parser(data, start);
	    hhea.version = p.parseVersion();
	    hhea.ascender = p.parseShort();
	    hhea.descender = p.parseShort();
	    hhea.lineGap = p.parseShort();
	    hhea.advanceWidthMax = p.parseUShort();
	    hhea.minLeftSideBearing = p.parseShort();
	    hhea.minRightSideBearing = p.parseShort();
	    hhea.xMaxExtent = p.parseShort();
	    hhea.caretSlopeRise = p.parseShort();
	    hhea.caretSlopeRun = p.parseShort();
	    hhea.caretOffset = p.parseShort();
	    p.relativeOffset += 8;
	    hhea.metricDataFormat = p.parseShort();
	    hhea.numberOfHMetrics = p.parseUShort();
	    return hhea;
	}

	function makeHheaTable(options) {
	    return new table.Table('hhea', [
	        {name: 'version', type: 'FIXED', value: 0x00010000},
	        {name: 'ascender', type: 'FWORD', value: 0},
	        {name: 'descender', type: 'FWORD', value: 0},
	        {name: 'lineGap', type: 'FWORD', value: 0},
	        {name: 'advanceWidthMax', type: 'UFWORD', value: 0},
	        {name: 'minLeftSideBearing', type: 'FWORD', value: 0},
	        {name: 'minRightSideBearing', type: 'FWORD', value: 0},
	        {name: 'xMaxExtent', type: 'FWORD', value: 0},
	        {name: 'caretSlopeRise', type: 'SHORT', value: 1},
	        {name: 'caretSlopeRun', type: 'SHORT', value: 0},
	        {name: 'caretOffset', type: 'SHORT', value: 0},
	        {name: 'reserved1', type: 'SHORT', value: 0},
	        {name: 'reserved2', type: 'SHORT', value: 0},
	        {name: 'reserved3', type: 'SHORT', value: 0},
	        {name: 'reserved4', type: 'SHORT', value: 0},
	        {name: 'metricDataFormat', type: 'SHORT', value: 0},
	        {name: 'numberOfHMetrics', type: 'USHORT', value: 0}
	    ], options);
	}

	var hhea = { parse: parseHheaTable, make: makeHheaTable };

	// The `hmtx` table contains the horizontal metrics for all glyphs.

	function parseHmtxTableAll(data, start, numMetrics, numGlyphs, glyphs) {
	    var advanceWidth;
	    var leftSideBearing;
	    var p = new parse.Parser(data, start);
	    for (var i = 0; i < numGlyphs; i += 1) {
	        // If the font is monospaced, only one entry is needed. This last entry applies to all subsequent glyphs.
	        if (i < numMetrics) {
	            advanceWidth = p.parseUShort();
	            leftSideBearing = p.parseShort();
	        }

	        var glyph = glyphs.get(i);
	        glyph.advanceWidth = advanceWidth;
	        glyph.leftSideBearing = leftSideBearing;
	    }
	}

	function parseHmtxTableOnLowMemory(font, data, start, numMetrics, numGlyphs) {
	    font._hmtxTableData = {};

	    var advanceWidth;
	    var leftSideBearing;
	    var p = new parse.Parser(data, start);
	    for (var i = 0; i < numGlyphs; i += 1) {
	        // If the font is monospaced, only one entry is needed. This last entry applies to all subsequent glyphs.
	        if (i < numMetrics) {
	            advanceWidth = p.parseUShort();
	            leftSideBearing = p.parseShort();
	        }

	        font._hmtxTableData[i] = {
	            advanceWidth: advanceWidth,
	            leftSideBearing: leftSideBearing
	        };
	    }
	}

	// Parse the `hmtx` table, which contains the horizontal metrics for all glyphs.
	// This function augments the glyph array, adding the advanceWidth and leftSideBearing to each glyph.
	function parseHmtxTable(font, data, start, numMetrics, numGlyphs, glyphs, opt) {
	    if (opt.lowMemory)
	        { parseHmtxTableOnLowMemory(font, data, start, numMetrics, numGlyphs); }
	    else
	        { parseHmtxTableAll(data, start, numMetrics, numGlyphs, glyphs); }
	}

	function makeHmtxTable(glyphs) {
	    var t = new table.Table('hmtx', []);
	    for (var i = 0; i < glyphs.length; i += 1) {
	        var glyph = glyphs.get(i);
	        var advanceWidth = glyph.advanceWidth || 0;
	        var leftSideBearing = glyph.leftSideBearing || 0;
	        t.fields.push({name: 'advanceWidth_' + i, type: 'USHORT', value: advanceWidth});
	        t.fields.push({name: 'leftSideBearing_' + i, type: 'SHORT', value: leftSideBearing});
	    }

	    return t;
	}

	var hmtx = { parse: parseHmtxTable, make: makeHmtxTable };

	// The `ltag` table stores IETF BCP-47 language tags. It allows supporting

	function makeLtagTable(tags) {
	    var result = new table.Table('ltag', [
	        {name: 'version', type: 'ULONG', value: 1},
	        {name: 'flags', type: 'ULONG', value: 0},
	        {name: 'numTags', type: 'ULONG', value: tags.length}
	    ]);

	    var stringPool = '';
	    var stringPoolOffset = 12 + tags.length * 4;
	    for (var i = 0; i < tags.length; ++i) {
	        var pos = stringPool.indexOf(tags[i]);
	        if (pos < 0) {
	            pos = stringPool.length;
	            stringPool += tags[i];
	        }

	        result.fields.push({name: 'offset ' + i, type: 'USHORT', value: stringPoolOffset + pos});
	        result.fields.push({name: 'length ' + i, type: 'USHORT', value: tags[i].length});
	    }

	    result.fields.push({name: 'stringPool', type: 'CHARARRAY', value: stringPool});
	    return result;
	}

	function parseLtagTable(data, start) {
	    var p = new parse.Parser(data, start);
	    var tableVersion = p.parseULong();
	    check.argument(tableVersion === 1, 'Unsupported ltag table version.');
	    // The 'ltag' specification does not define any flags; skip the field.
	    p.skip('uLong', 1);
	    var numTags = p.parseULong();

	    var tags = [];
	    for (var i = 0; i < numTags; i++) {
	        var tag = '';
	        var offset = start + p.parseUShort();
	        var length = p.parseUShort();
	        for (var j = offset; j < offset + length; ++j) {
	            tag += String.fromCharCode(data.getInt8(j));
	        }

	        tags.push(tag);
	    }

	    return tags;
	}

	var ltag = { make: makeLtagTable, parse: parseLtagTable };

	// The `maxp` table establishes the memory requirements for the font.

	// Parse the maximum profile `maxp` table.
	function parseMaxpTable(data, start) {
	    var maxp = {};
	    var p = new parse.Parser(data, start);
	    maxp.version = p.parseVersion();
	    maxp.numGlyphs = p.parseUShort();
	    if (maxp.version === 1.0) {
	        maxp.maxPoints = p.parseUShort();
	        maxp.maxContours = p.parseUShort();
	        maxp.maxCompositePoints = p.parseUShort();
	        maxp.maxCompositeContours = p.parseUShort();
	        maxp.maxZones = p.parseUShort();
	        maxp.maxTwilightPoints = p.parseUShort();
	        maxp.maxStorage = p.parseUShort();
	        maxp.maxFunctionDefs = p.parseUShort();
	        maxp.maxInstructionDefs = p.parseUShort();
	        maxp.maxStackElements = p.parseUShort();
	        maxp.maxSizeOfInstructions = p.parseUShort();
	        maxp.maxComponentElements = p.parseUShort();
	        maxp.maxComponentDepth = p.parseUShort();
	    }

	    return maxp;
	}

	function makeMaxpTable(numGlyphs) {
	    return new table.Table('maxp', [
	        {name: 'version', type: 'FIXED', value: 0x00005000},
	        {name: 'numGlyphs', type: 'USHORT', value: numGlyphs}
	    ]);
	}

	var maxp = { parse: parseMaxpTable, make: makeMaxpTable };

	// The `name` naming table.

	// NameIDs for the name table.
	var nameTableNames = [
	    'copyright',              // 0
	    'fontFamily',             // 1
	    'fontSubfamily',          // 2
	    'uniqueID',               // 3
	    'fullName',               // 4
	    'version',                // 5
	    'postScriptName',         // 6
	    'trademark',              // 7
	    'manufacturer',           // 8
	    'designer',               // 9
	    'description',            // 10
	    'manufacturerURL',        // 11
	    'designerURL',            // 12
	    'license',                // 13
	    'licenseURL',             // 14
	    'reserved',               // 15
	    'preferredFamily',        // 16
	    'preferredSubfamily',     // 17
	    'compatibleFullName',     // 18
	    'sampleText',             // 19
	    'postScriptFindFontName', // 20
	    'wwsFamily',              // 21
	    'wwsSubfamily'            // 22
	];

	var macLanguages = {
	    0: 'en',
	    1: 'fr',
	    2: 'de',
	    3: 'it',
	    4: 'nl',
	    5: 'sv',
	    6: 'es',
	    7: 'da',
	    8: 'pt',
	    9: 'no',
	    10: 'he',
	    11: 'ja',
	    12: 'ar',
	    13: 'fi',
	    14: 'el',
	    15: 'is',
	    16: 'mt',
	    17: 'tr',
	    18: 'hr',
	    19: 'zh-Hant',
	    20: 'ur',
	    21: 'hi',
	    22: 'th',
	    23: 'ko',
	    24: 'lt',
	    25: 'pl',
	    26: 'hu',
	    27: 'es',
	    28: 'lv',
	    29: 'se',
	    30: 'fo',
	    31: 'fa',
	    32: 'ru',
	    33: 'zh',
	    34: 'nl-BE',
	    35: 'ga',
	    36: 'sq',
	    37: 'ro',
	    38: 'cz',
	    39: 'sk',
	    40: 'si',
	    41: 'yi',
	    42: 'sr',
	    43: 'mk',
	    44: 'bg',
	    45: 'uk',
	    46: 'be',
	    47: 'uz',
	    48: 'kk',
	    49: 'az-Cyrl',
	    50: 'az-Arab',
	    51: 'hy',
	    52: 'ka',
	    53: 'mo',
	    54: 'ky',
	    55: 'tg',
	    56: 'tk',
	    57: 'mn-CN',
	    58: 'mn',
	    59: 'ps',
	    60: 'ks',
	    61: 'ku',
	    62: 'sd',
	    63: 'bo',
	    64: 'ne',
	    65: 'sa',
	    66: 'mr',
	    67: 'bn',
	    68: 'as',
	    69: 'gu',
	    70: 'pa',
	    71: 'or',
	    72: 'ml',
	    73: 'kn',
	    74: 'ta',
	    75: 'te',
	    76: 'si',
	    77: 'my',
	    78: 'km',
	    79: 'lo',
	    80: 'vi',
	    81: 'id',
	    82: 'tl',
	    83: 'ms',
	    84: 'ms-Arab',
	    85: 'am',
	    86: 'ti',
	    87: 'om',
	    88: 'so',
	    89: 'sw',
	    90: 'rw',
	    91: 'rn',
	    92: 'ny',
	    93: 'mg',
	    94: 'eo',
	    128: 'cy',
	    129: 'eu',
	    130: 'ca',
	    131: 'la',
	    132: 'qu',
	    133: 'gn',
	    134: 'ay',
	    135: 'tt',
	    136: 'ug',
	    137: 'dz',
	    138: 'jv',
	    139: 'su',
	    140: 'gl',
	    141: 'af',
	    142: 'br',
	    143: 'iu',
	    144: 'gd',
	    145: 'gv',
	    146: 'ga',
	    147: 'to',
	    148: 'el-polyton',
	    149: 'kl',
	    150: 'az',
	    151: 'nn'
	};

	// MacOS language ID → MacOS script ID
	//
	// Note that the script ID is not sufficient to determine what encoding
	// to use in TrueType files. For some languages, MacOS used a modification
	// of a mainstream script. For example, an Icelandic name would be stored
	// with smRoman in the TrueType naming table, but the actual encoding
	// is a special Icelandic version of the normal Macintosh Roman encoding.
	// As another example, Inuktitut uses an 8-bit encoding for Canadian Aboriginal
	// Syllables but MacOS had run out of available script codes, so this was
	// done as a (pretty radical) "modification" of Ethiopic.
	//
	// http://unicode.org/Public/MAPPINGS/VENDORS/APPLE/Readme.txt
	var macLanguageToScript = {
	    0: 0,  // langEnglish → smRoman
	    1: 0,  // langFrench → smRoman
	    2: 0,  // langGerman → smRoman
	    3: 0,  // langItalian → smRoman
	    4: 0,  // langDutch → smRoman
	    5: 0,  // langSwedish → smRoman
	    6: 0,  // langSpanish → smRoman
	    7: 0,  // langDanish → smRoman
	    8: 0,  // langPortuguese → smRoman
	    9: 0,  // langNorwegian → smRoman
	    10: 5,  // langHebrew → smHebrew
	    11: 1,  // langJapanese → smJapanese
	    12: 4,  // langArabic → smArabic
	    13: 0,  // langFinnish → smRoman
	    14: 6,  // langGreek → smGreek
	    15: 0,  // langIcelandic → smRoman (modified)
	    16: 0,  // langMaltese → smRoman
	    17: 0,  // langTurkish → smRoman (modified)
	    18: 0,  // langCroatian → smRoman (modified)
	    19: 2,  // langTradChinese → smTradChinese
	    20: 4,  // langUrdu → smArabic
	    21: 9,  // langHindi → smDevanagari
	    22: 21,  // langThai → smThai
	    23: 3,  // langKorean → smKorean
	    24: 29,  // langLithuanian → smCentralEuroRoman
	    25: 29,  // langPolish → smCentralEuroRoman
	    26: 29,  // langHungarian → smCentralEuroRoman
	    27: 29,  // langEstonian → smCentralEuroRoman
	    28: 29,  // langLatvian → smCentralEuroRoman
	    29: 0,  // langSami → smRoman
	    30: 0,  // langFaroese → smRoman (modified)
	    31: 4,  // langFarsi → smArabic (modified)
	    32: 7,  // langRussian → smCyrillic
	    33: 25,  // langSimpChinese → smSimpChinese
	    34: 0,  // langFlemish → smRoman
	    35: 0,  // langIrishGaelic → smRoman (modified)
	    36: 0,  // langAlbanian → smRoman
	    37: 0,  // langRomanian → smRoman (modified)
	    38: 29,  // langCzech → smCentralEuroRoman
	    39: 29,  // langSlovak → smCentralEuroRoman
	    40: 0,  // langSlovenian → smRoman (modified)
	    41: 5,  // langYiddish → smHebrew
	    42: 7,  // langSerbian → smCyrillic
	    43: 7,  // langMacedonian → smCyrillic
	    44: 7,  // langBulgarian → smCyrillic
	    45: 7,  // langUkrainian → smCyrillic (modified)
	    46: 7,  // langByelorussian → smCyrillic
	    47: 7,  // langUzbek → smCyrillic
	    48: 7,  // langKazakh → smCyrillic
	    49: 7,  // langAzerbaijani → smCyrillic
	    50: 4,  // langAzerbaijanAr → smArabic
	    51: 24,  // langArmenian → smArmenian
	    52: 23,  // langGeorgian → smGeorgian
	    53: 7,  // langMoldavian → smCyrillic
	    54: 7,  // langKirghiz → smCyrillic
	    55: 7,  // langTajiki → smCyrillic
	    56: 7,  // langTurkmen → smCyrillic
	    57: 27,  // langMongolian → smMongolian
	    58: 7,  // langMongolianCyr → smCyrillic
	    59: 4,  // langPashto → smArabic
	    60: 4,  // langKurdish → smArabic
	    61: 4,  // langKashmiri → smArabic
	    62: 4,  // langSindhi → smArabic
	    63: 26,  // langTibetan → smTibetan
	    64: 9,  // langNepali → smDevanagari
	    65: 9,  // langSanskrit → smDevanagari
	    66: 9,  // langMarathi → smDevanagari
	    67: 13,  // langBengali → smBengali
	    68: 13,  // langAssamese → smBengali
	    69: 11,  // langGujarati → smGujarati
	    70: 10,  // langPunjabi → smGurmukhi
	    71: 12,  // langOriya → smOriya
	    72: 17,  // langMalayalam → smMalayalam
	    73: 16,  // langKannada → smKannada
	    74: 14,  // langTamil → smTamil
	    75: 15,  // langTelugu → smTelugu
	    76: 18,  // langSinhalese → smSinhalese
	    77: 19,  // langBurmese → smBurmese
	    78: 20,  // langKhmer → smKhmer
	    79: 22,  // langLao → smLao
	    80: 30,  // langVietnamese → smVietnamese
	    81: 0,  // langIndonesian → smRoman
	    82: 0,  // langTagalog → smRoman
	    83: 0,  // langMalayRoman → smRoman
	    84: 4,  // langMalayArabic → smArabic
	    85: 28,  // langAmharic → smEthiopic
	    86: 28,  // langTigrinya → smEthiopic
	    87: 28,  // langOromo → smEthiopic
	    88: 0,  // langSomali → smRoman
	    89: 0,  // langSwahili → smRoman
	    90: 0,  // langKinyarwanda → smRoman
	    91: 0,  // langRundi → smRoman
	    92: 0,  // langNyanja → smRoman
	    93: 0,  // langMalagasy → smRoman
	    94: 0,  // langEsperanto → smRoman
	    128: 0,  // langWelsh → smRoman (modified)
	    129: 0,  // langBasque → smRoman
	    130: 0,  // langCatalan → smRoman
	    131: 0,  // langLatin → smRoman
	    132: 0,  // langQuechua → smRoman
	    133: 0,  // langGuarani → smRoman
	    134: 0,  // langAymara → smRoman
	    135: 7,  // langTatar → smCyrillic
	    136: 4,  // langUighur → smArabic
	    137: 26,  // langDzongkha → smTibetan
	    138: 0,  // langJavaneseRom → smRoman
	    139: 0,  // langSundaneseRom → smRoman
	    140: 0,  // langGalician → smRoman
	    141: 0,  // langAfrikaans → smRoman
	    142: 0,  // langBreton → smRoman (modified)
	    143: 28,  // langInuktitut → smEthiopic (modified)
	    144: 0,  // langScottishGaelic → smRoman (modified)
	    145: 0,  // langManxGaelic → smRoman (modified)
	    146: 0,  // langIrishGaelicScript → smRoman (modified)
	    147: 0,  // langTongan → smRoman
	    148: 6,  // langGreekAncient → smRoman
	    149: 0,  // langGreenlandic → smRoman
	    150: 0,  // langAzerbaijanRoman → smRoman
	    151: 0   // langNynorsk → smRoman
	};

	// While Microsoft indicates a region/country for all its language
	// IDs, we omit the region code if it's equal to the "most likely
	// region subtag" according to Unicode CLDR. For scripts, we omit
	// the subtag if it is equal to the Suppress-Script entry in the
	// IANA language subtag registry for IETF BCP 47.
	//
	// For example, Microsoft states that its language code 0x041A is
	// Croatian in Croatia. We transform this to the BCP 47 language code 'hr'
	// and not 'hr-HR' because Croatia is the default country for Croatian,
	// according to Unicode CLDR. As another example, Microsoft states
	// that 0x101A is Croatian (Latin) in Bosnia-Herzegovina. We transform
	// this to 'hr-BA' and not 'hr-Latn-BA' because Latin is the default script
	// for the Croatian language, according to IANA.
	//
	// http://www.unicode.org/cldr/charts/latest/supplemental/likely_subtags.html
	// http://www.iana.org/assignments/language-subtag-registry/language-subtag-registry
	var windowsLanguages = {
	    0x0436: 'af',
	    0x041C: 'sq',
	    0x0484: 'gsw',
	    0x045E: 'am',
	    0x1401: 'ar-DZ',
	    0x3C01: 'ar-BH',
	    0x0C01: 'ar',
	    0x0801: 'ar-IQ',
	    0x2C01: 'ar-JO',
	    0x3401: 'ar-KW',
	    0x3001: 'ar-LB',
	    0x1001: 'ar-LY',
	    0x1801: 'ary',
	    0x2001: 'ar-OM',
	    0x4001: 'ar-QA',
	    0x0401: 'ar-SA',
	    0x2801: 'ar-SY',
	    0x1C01: 'aeb',
	    0x3801: 'ar-AE',
	    0x2401: 'ar-YE',
	    0x042B: 'hy',
	    0x044D: 'as',
	    0x082C: 'az-Cyrl',
	    0x042C: 'az',
	    0x046D: 'ba',
	    0x042D: 'eu',
	    0x0423: 'be',
	    0x0845: 'bn',
	    0x0445: 'bn-IN',
	    0x201A: 'bs-Cyrl',
	    0x141A: 'bs',
	    0x047E: 'br',
	    0x0402: 'bg',
	    0x0403: 'ca',
	    0x0C04: 'zh-HK',
	    0x1404: 'zh-MO',
	    0x0804: 'zh',
	    0x1004: 'zh-SG',
	    0x0404: 'zh-TW',
	    0x0483: 'co',
	    0x041A: 'hr',
	    0x101A: 'hr-BA',
	    0x0405: 'cs',
	    0x0406: 'da',
	    0x048C: 'prs',
	    0x0465: 'dv',
	    0x0813: 'nl-BE',
	    0x0413: 'nl',
	    0x0C09: 'en-AU',
	    0x2809: 'en-BZ',
	    0x1009: 'en-CA',
	    0x2409: 'en-029',
	    0x4009: 'en-IN',
	    0x1809: 'en-IE',
	    0x2009: 'en-JM',
	    0x4409: 'en-MY',
	    0x1409: 'en-NZ',
	    0x3409: 'en-PH',
	    0x4809: 'en-SG',
	    0x1C09: 'en-ZA',
	    0x2C09: 'en-TT',
	    0x0809: 'en-GB',
	    0x0409: 'en',
	    0x3009: 'en-ZW',
	    0x0425: 'et',
	    0x0438: 'fo',
	    0x0464: 'fil',
	    0x040B: 'fi',
	    0x080C: 'fr-BE',
	    0x0C0C: 'fr-CA',
	    0x040C: 'fr',
	    0x140C: 'fr-LU',
	    0x180C: 'fr-MC',
	    0x100C: 'fr-CH',
	    0x0462: 'fy',
	    0x0456: 'gl',
	    0x0437: 'ka',
	    0x0C07: 'de-AT',
	    0x0407: 'de',
	    0x1407: 'de-LI',
	    0x1007: 'de-LU',
	    0x0807: 'de-CH',
	    0x0408: 'el',
	    0x046F: 'kl',
	    0x0447: 'gu',
	    0x0468: 'ha',
	    0x040D: 'he',
	    0x0439: 'hi',
	    0x040E: 'hu',
	    0x040F: 'is',
	    0x0470: 'ig',
	    0x0421: 'id',
	    0x045D: 'iu',
	    0x085D: 'iu-Latn',
	    0x083C: 'ga',
	    0x0434: 'xh',
	    0x0435: 'zu',
	    0x0410: 'it',
	    0x0810: 'it-CH',
	    0x0411: 'ja',
	    0x044B: 'kn',
	    0x043F: 'kk',
	    0x0453: 'km',
	    0x0486: 'quc',
	    0x0487: 'rw',
	    0x0441: 'sw',
	    0x0457: 'kok',
	    0x0412: 'ko',
	    0x0440: 'ky',
	    0x0454: 'lo',
	    0x0426: 'lv',
	    0x0427: 'lt',
	    0x082E: 'dsb',
	    0x046E: 'lb',
	    0x042F: 'mk',
	    0x083E: 'ms-BN',
	    0x043E: 'ms',
	    0x044C: 'ml',
	    0x043A: 'mt',
	    0x0481: 'mi',
	    0x047A: 'arn',
	    0x044E: 'mr',
	    0x047C: 'moh',
	    0x0450: 'mn',
	    0x0850: 'mn-CN',
	    0x0461: 'ne',
	    0x0414: 'nb',
	    0x0814: 'nn',
	    0x0482: 'oc',
	    0x0448: 'or',
	    0x0463: 'ps',
	    0x0415: 'pl',
	    0x0416: 'pt',
	    0x0816: 'pt-PT',
	    0x0446: 'pa',
	    0x046B: 'qu-BO',
	    0x086B: 'qu-EC',
	    0x0C6B: 'qu',
	    0x0418: 'ro',
	    0x0417: 'rm',
	    0x0419: 'ru',
	    0x243B: 'smn',
	    0x103B: 'smj-NO',
	    0x143B: 'smj',
	    0x0C3B: 'se-FI',
	    0x043B: 'se',
	    0x083B: 'se-SE',
	    0x203B: 'sms',
	    0x183B: 'sma-NO',
	    0x1C3B: 'sms',
	    0x044F: 'sa',
	    0x1C1A: 'sr-Cyrl-BA',
	    0x0C1A: 'sr',
	    0x181A: 'sr-Latn-BA',
	    0x081A: 'sr-Latn',
	    0x046C: 'nso',
	    0x0432: 'tn',
	    0x045B: 'si',
	    0x041B: 'sk',
	    0x0424: 'sl',
	    0x2C0A: 'es-AR',
	    0x400A: 'es-BO',
	    0x340A: 'es-CL',
	    0x240A: 'es-CO',
	    0x140A: 'es-CR',
	    0x1C0A: 'es-DO',
	    0x300A: 'es-EC',
	    0x440A: 'es-SV',
	    0x100A: 'es-GT',
	    0x480A: 'es-HN',
	    0x080A: 'es-MX',
	    0x4C0A: 'es-NI',
	    0x180A: 'es-PA',
	    0x3C0A: 'es-PY',
	    0x280A: 'es-PE',
	    0x500A: 'es-PR',

	    // Microsoft has defined two different language codes for
	    // “Spanish with modern sorting” and “Spanish with traditional
	    // sorting”. This makes sense for collation APIs, and it would be
	    // possible to express this in BCP 47 language tags via Unicode
	    // extensions (eg., es-u-co-trad is Spanish with traditional
	    // sorting). However, for storing names in fonts, the distinction
	    // does not make sense, so we give “es” in both cases.
	    0x0C0A: 'es',
	    0x040A: 'es',

	    0x540A: 'es-US',
	    0x380A: 'es-UY',
	    0x200A: 'es-VE',
	    0x081D: 'sv-FI',
	    0x041D: 'sv',
	    0x045A: 'syr',
	    0x0428: 'tg',
	    0x085F: 'tzm',
	    0x0449: 'ta',
	    0x0444: 'tt',
	    0x044A: 'te',
	    0x041E: 'th',
	    0x0451: 'bo',
	    0x041F: 'tr',
	    0x0442: 'tk',
	    0x0480: 'ug',
	    0x0422: 'uk',
	    0x042E: 'hsb',
	    0x0420: 'ur',
	    0x0843: 'uz-Cyrl',
	    0x0443: 'uz',
	    0x042A: 'vi',
	    0x0452: 'cy',
	    0x0488: 'wo',
	    0x0485: 'sah',
	    0x0478: 'ii',
	    0x046A: 'yo'
	};

	// Returns a IETF BCP 47 language code, for example 'zh-Hant'
	// for 'Chinese in the traditional script'.
	function getLanguageCode(platformID, languageID, ltag) {
	    switch (platformID) {
	        case 0:  // Unicode
	            if (languageID === 0xFFFF) {
	                return 'und';
	            } else if (ltag) {
	                return ltag[languageID];
	            }

	            break;

	        case 1:  // Macintosh
	            return macLanguages[languageID];

	        case 3:  // Windows
	            return windowsLanguages[languageID];
	    }

	    return undefined;
	}

	var utf16 = 'utf-16';

	// MacOS script ID → encoding. This table stores the default case,
	// which can be overridden by macLanguageEncodings.
	var macScriptEncodings = {
	    0: 'macintosh',           // smRoman
	    1: 'x-mac-japanese',      // smJapanese
	    2: 'x-mac-chinesetrad',   // smTradChinese
	    3: 'x-mac-korean',        // smKorean
	    6: 'x-mac-greek',         // smGreek
	    7: 'x-mac-cyrillic',      // smCyrillic
	    9: 'x-mac-devanagai',     // smDevanagari
	    10: 'x-mac-gurmukhi',     // smGurmukhi
	    11: 'x-mac-gujarati',     // smGujarati
	    12: 'x-mac-oriya',        // smOriya
	    13: 'x-mac-bengali',      // smBengali
	    14: 'x-mac-tamil',        // smTamil
	    15: 'x-mac-telugu',       // smTelugu
	    16: 'x-mac-kannada',      // smKannada
	    17: 'x-mac-malayalam',    // smMalayalam
	    18: 'x-mac-sinhalese',    // smSinhalese
	    19: 'x-mac-burmese',      // smBurmese
	    20: 'x-mac-khmer',        // smKhmer
	    21: 'x-mac-thai',         // smThai
	    22: 'x-mac-lao',          // smLao
	    23: 'x-mac-georgian',     // smGeorgian
	    24: 'x-mac-armenian',     // smArmenian
	    25: 'x-mac-chinesesimp',  // smSimpChinese
	    26: 'x-mac-tibetan',      // smTibetan
	    27: 'x-mac-mongolian',    // smMongolian
	    28: 'x-mac-ethiopic',     // smEthiopic
	    29: 'x-mac-ce',           // smCentralEuroRoman
	    30: 'x-mac-vietnamese',   // smVietnamese
	    31: 'x-mac-extarabic'     // smExtArabic
	};

	// MacOS language ID → encoding. This table stores the exceptional
	// cases, which override macScriptEncodings. For writing MacOS naming
	// tables, we need to emit a MacOS script ID. Therefore, we cannot
	// merge macScriptEncodings into macLanguageEncodings.
	//
	// http://unicode.org/Public/MAPPINGS/VENDORS/APPLE/Readme.txt
	var macLanguageEncodings = {
	    15: 'x-mac-icelandic',    // langIcelandic
	    17: 'x-mac-turkish',      // langTurkish
	    18: 'x-mac-croatian',     // langCroatian
	    24: 'x-mac-ce',           // langLithuanian
	    25: 'x-mac-ce',           // langPolish
	    26: 'x-mac-ce',           // langHungarian
	    27: 'x-mac-ce',           // langEstonian
	    28: 'x-mac-ce',           // langLatvian
	    30: 'x-mac-icelandic',    // langFaroese
	    37: 'x-mac-romanian',     // langRomanian
	    38: 'x-mac-ce',           // langCzech
	    39: 'x-mac-ce',           // langSlovak
	    40: 'x-mac-ce',           // langSlovenian
	    143: 'x-mac-inuit',       // langInuktitut
	    146: 'x-mac-gaelic'       // langIrishGaelicScript
	};

	function getEncoding(platformID, encodingID, languageID) {
	    switch (platformID) {
	        case 0:  // Unicode
	            return utf16;

	        case 1:  // Apple Macintosh
	            return macLanguageEncodings[languageID] || macScriptEncodings[encodingID];

	        case 3:  // Microsoft Windows
	            if (encodingID === 1 || encodingID === 10) {
	                return utf16;
	            }

	            break;
	    }

	    return undefined;
	}

	// Parse the naming `name` table.
	// FIXME: Format 1 additional fields are not supported yet.
	// ltag is the content of the `ltag' table, such as ['en', 'zh-Hans', 'de-CH-1904'].
	function parseNameTable(data, start, ltag) {
	    var name = {};
	    var p = new parse.Parser(data, start);
	    var format = p.parseUShort();
	    var count = p.parseUShort();
	    var stringOffset = p.offset + p.parseUShort();
	    for (var i = 0; i < count; i++) {
	        var platformID = p.parseUShort();
	        var encodingID = p.parseUShort();
	        var languageID = p.parseUShort();
	        var nameID = p.parseUShort();
	        var property = nameTableNames[nameID] || nameID;
	        var byteLength = p.parseUShort();
	        var offset = p.parseUShort();
	        var language = getLanguageCode(platformID, languageID, ltag);
	        var encoding = getEncoding(platformID, encodingID, languageID);
	        if (encoding !== undefined && language !== undefined) {
	            var text = (void 0);
	            if (encoding === utf16) {
	                text = decode.UTF16(data, stringOffset + offset, byteLength);
	            } else {
	                text = decode.MACSTRING(data, stringOffset + offset, byteLength, encoding);
	            }

	            if (text) {
	                var translations = name[property];
	                if (translations === undefined) {
	                    translations = name[property] = {};
	                }

	                translations[language] = text;
	            }
	        }
	    }

	    var langTagCount = 0;
	    if (format === 1) {
	        // FIXME: Also handle Microsoft's 'name' table 1.
	        langTagCount = p.parseUShort();
	    }

	    return name;
	}

	// {23: 'foo'} → {'foo': 23}
	// ['bar', 'baz'] → {'bar': 0, 'baz': 1}
	function reverseDict(dict) {
	    var result = {};
	    for (var key in dict) {
	        result[dict[key]] = parseInt(key);
	    }

	    return result;
	}

	function makeNameRecord(platformID, encodingID, languageID, nameID, length, offset) {
	    return new table.Record('NameRecord', [
	        {name: 'platformID', type: 'USHORT', value: platformID},
	        {name: 'encodingID', type: 'USHORT', value: encodingID},
	        {name: 'languageID', type: 'USHORT', value: languageID},
	        {name: 'nameID', type: 'USHORT', value: nameID},
	        {name: 'length', type: 'USHORT', value: length},
	        {name: 'offset', type: 'USHORT', value: offset}
	    ]);
	}

	// Finds the position of needle in haystack, or -1 if not there.
	// Like String.indexOf(), but for arrays.
	function findSubArray(needle, haystack) {
	    var needleLength = needle.length;
	    var limit = haystack.length - needleLength + 1;

	    loop:
	    for (var pos = 0; pos < limit; pos++) {
	        for (; pos < limit; pos++) {
	            for (var k = 0; k < needleLength; k++) {
	                if (haystack[pos + k] !== needle[k]) {
	                    continue loop;
	                }
	            }

	            return pos;
	        }
	    }

	    return -1;
	}

	function addStringToPool(s, pool) {
	    var offset = findSubArray(s, pool);
	    if (offset < 0) {
	        offset = pool.length;
	        var i = 0;
	        var len = s.length;
	        for (; i < len; ++i) {
	            pool.push(s[i]);
	        }

	    }

	    return offset;
	}

	function makeNameTable(names, ltag) {
	    var nameID;
	    var nameIDs = [];

	    var namesWithNumericKeys = {};
	    var nameTableIds = reverseDict(nameTableNames);
	    for (var key in names) {
	        var id = nameTableIds[key];
	        if (id === undefined) {
	            id = key;
	        }

	        nameID = parseInt(id);

	        if (isNaN(nameID)) {
	            throw new Error('Name table entry "' + key + '" does not exist, see nameTableNames for complete list.');
	        }

	        namesWithNumericKeys[nameID] = names[key];
	        nameIDs.push(nameID);
	    }

	    var macLanguageIds = reverseDict(macLanguages);
	    var windowsLanguageIds = reverseDict(windowsLanguages);

	    var nameRecords = [];
	    var stringPool = [];

	    for (var i = 0; i < nameIDs.length; i++) {
	        nameID = nameIDs[i];
	        var translations = namesWithNumericKeys[nameID];
	        for (var lang in translations) {
	            var text = translations[lang];

	            // For MacOS, we try to emit the name in the form that was introduced
	            // in the initial version of the TrueType spec (in the late 1980s).
	            // However, this can fail for various reasons: the requested BCP 47
	            // language code might not have an old-style Mac equivalent;
	            // we might not have a codec for the needed character encoding;
	            // or the name might contain characters that cannot be expressed
	            // in the old-style Macintosh encoding. In case of failure, we emit
	            // the name in a more modern fashion (Unicode encoding with BCP 47
	            // language tags) that is recognized by MacOS 10.5, released in 2009.
	            // If fonts were only read by operating systems, we could simply
	            // emit all names in the modern form; this would be much easier.
	            // However, there are many applications and libraries that read
	            // 'name' tables directly, and these will usually only recognize
	            // the ancient form (silently skipping the unrecognized names).
	            var macPlatform = 1;  // Macintosh
	            var macLanguage = macLanguageIds[lang];
	            var macScript = macLanguageToScript[macLanguage];
	            var macEncoding = getEncoding(macPlatform, macScript, macLanguage);
	            var macName = encode.MACSTRING(text, macEncoding);
	            if (macName === undefined) {
	                macPlatform = 0;  // Unicode
	                macLanguage = ltag.indexOf(lang);
	                if (macLanguage < 0) {
	                    macLanguage = ltag.length;
	                    ltag.push(lang);
	                }

	                macScript = 4;  // Unicode 2.0 and later
	                macName = encode.UTF16(text);
	            }

	            var macNameOffset = addStringToPool(macName, stringPool);
	            nameRecords.push(makeNameRecord(macPlatform, macScript, macLanguage,
	                                            nameID, macName.length, macNameOffset));

	            var winLanguage = windowsLanguageIds[lang];
	            if (winLanguage !== undefined) {
	                var winName = encode.UTF16(text);
	                var winNameOffset = addStringToPool(winName, stringPool);
	                nameRecords.push(makeNameRecord(3, 1, winLanguage,
	                                                nameID, winName.length, winNameOffset));
	            }
	        }
	    }

	    nameRecords.sort(function(a, b) {
	        return ((a.platformID - b.platformID) ||
	                (a.encodingID - b.encodingID) ||
	                (a.languageID - b.languageID) ||
	                (a.nameID - b.nameID));
	    });

	    var t = new table.Table('name', [
	        {name: 'format', type: 'USHORT', value: 0},
	        {name: 'count', type: 'USHORT', value: nameRecords.length},
	        {name: 'stringOffset', type: 'USHORT', value: 6 + nameRecords.length * 12}
	    ]);

	    for (var r = 0; r < nameRecords.length; r++) {
	        t.fields.push({name: 'record_' + r, type: 'RECORD', value: nameRecords[r]});
	    }

	    t.fields.push({name: 'strings', type: 'LITERAL', value: stringPool});
	    return t;
	}

	var _name = { parse: parseNameTable, make: makeNameTable };

	// The `OS/2` table contains metrics required in OpenType fonts.

	var unicodeRanges = [
	    {begin: 0x0000, end: 0x007F}, // Basic Latin
	    {begin: 0x0080, end: 0x00FF}, // Latin-1 Supplement
	    {begin: 0x0100, end: 0x017F}, // Latin Extended-A
	    {begin: 0x0180, end: 0x024F}, // Latin Extended-B
	    {begin: 0x0250, end: 0x02AF}, // IPA Extensions
	    {begin: 0x02B0, end: 0x02FF}, // Spacing Modifier Letters
	    {begin: 0x0300, end: 0x036F}, // Combining Diacritical Marks
	    {begin: 0x0370, end: 0x03FF}, // Greek and Coptic
	    {begin: 0x2C80, end: 0x2CFF}, // Coptic
	    {begin: 0x0400, end: 0x04FF}, // Cyrillic
	    {begin: 0x0530, end: 0x058F}, // Armenian
	    {begin: 0x0590, end: 0x05FF}, // Hebrew
	    {begin: 0xA500, end: 0xA63F}, // Vai
	    {begin: 0x0600, end: 0x06FF}, // Arabic
	    {begin: 0x07C0, end: 0x07FF}, // NKo
	    {begin: 0x0900, end: 0x097F}, // Devanagari
	    {begin: 0x0980, end: 0x09FF}, // Bengali
	    {begin: 0x0A00, end: 0x0A7F}, // Gurmukhi
	    {begin: 0x0A80, end: 0x0AFF}, // Gujarati
	    {begin: 0x0B00, end: 0x0B7F}, // Oriya
	    {begin: 0x0B80, end: 0x0BFF}, // Tamil
	    {begin: 0x0C00, end: 0x0C7F}, // Telugu
	    {begin: 0x0C80, end: 0x0CFF}, // Kannada
	    {begin: 0x0D00, end: 0x0D7F}, // Malayalam
	    {begin: 0x0E00, end: 0x0E7F}, // Thai
	    {begin: 0x0E80, end: 0x0EFF}, // Lao
	    {begin: 0x10A0, end: 0x10FF}, // Georgian
	    {begin: 0x1B00, end: 0x1B7F}, // Balinese
	    {begin: 0x1100, end: 0x11FF}, // Hangul Jamo
	    {begin: 0x1E00, end: 0x1EFF}, // Latin Extended Additional
	    {begin: 0x1F00, end: 0x1FFF}, // Greek Extended
	    {begin: 0x2000, end: 0x206F}, // General Punctuation
	    {begin: 0x2070, end: 0x209F}, // Superscripts And Subscripts
	    {begin: 0x20A0, end: 0x20CF}, // Currency Symbol
	    {begin: 0x20D0, end: 0x20FF}, // Combining Diacritical Marks For Symbols
	    {begin: 0x2100, end: 0x214F}, // Letterlike Symbols
	    {begin: 0x2150, end: 0x218F}, // Number Forms
	    {begin: 0x2190, end: 0x21FF}, // Arrows
	    {begin: 0x2200, end: 0x22FF}, // Mathematical Operators
	    {begin: 0x2300, end: 0x23FF}, // Miscellaneous Technical
	    {begin: 0x2400, end: 0x243F}, // Control Pictures
	    {begin: 0x2440, end: 0x245F}, // Optical Character Recognition
	    {begin: 0x2460, end: 0x24FF}, // Enclosed Alphanumerics
	    {begin: 0x2500, end: 0x257F}, // Box Drawing
	    {begin: 0x2580, end: 0x259F}, // Block Elements
	    {begin: 0x25A0, end: 0x25FF}, // Geometric Shapes
	    {begin: 0x2600, end: 0x26FF}, // Miscellaneous Symbols
	    {begin: 0x2700, end: 0x27BF}, // Dingbats
	    {begin: 0x3000, end: 0x303F}, // CJK Symbols And Punctuation
	    {begin: 0x3040, end: 0x309F}, // Hiragana
	    {begin: 0x30A0, end: 0x30FF}, // Katakana
	    {begin: 0x3100, end: 0x312F}, // Bopomofo
	    {begin: 0x3130, end: 0x318F}, // Hangul Compatibility Jamo
	    {begin: 0xA840, end: 0xA87F}, // Phags-pa
	    {begin: 0x3200, end: 0x32FF}, // Enclosed CJK Letters And Months
	    {begin: 0x3300, end: 0x33FF}, // CJK Compatibility
	    {begin: 0xAC00, end: 0xD7AF}, // Hangul Syllables
	    {begin: 0xD800, end: 0xDFFF}, // Non-Plane 0 *
	    {begin: 0x10900, end: 0x1091F}, // Phoenicia
	    {begin: 0x4E00, end: 0x9FFF}, // CJK Unified Ideographs
	    {begin: 0xE000, end: 0xF8FF}, // Private Use Area (plane 0)
	    {begin: 0x31C0, end: 0x31EF}, // CJK Strokes
	    {begin: 0xFB00, end: 0xFB4F}, // Alphabetic Presentation Forms
	    {begin: 0xFB50, end: 0xFDFF}, // Arabic Presentation Forms-A
	    {begin: 0xFE20, end: 0xFE2F}, // Combining Half Marks
	    {begin: 0xFE10, end: 0xFE1F}, // Vertical Forms
	    {begin: 0xFE50, end: 0xFE6F}, // Small Form Variants
	    {begin: 0xFE70, end: 0xFEFF}, // Arabic Presentation Forms-B
	    {begin: 0xFF00, end: 0xFFEF}, // Halfwidth And Fullwidth Forms
	    {begin: 0xFFF0, end: 0xFFFF}, // Specials
	    {begin: 0x0F00, end: 0x0FFF}, // Tibetan
	    {begin: 0x0700, end: 0x074F}, // Syriac
	    {begin: 0x0780, end: 0x07BF}, // Thaana
	    {begin: 0x0D80, end: 0x0DFF}, // Sinhala
	    {begin: 0x1000, end: 0x109F}, // Myanmar
	    {begin: 0x1200, end: 0x137F}, // Ethiopic
	    {begin: 0x13A0, end: 0x13FF}, // Cherokee
	    {begin: 0x1400, end: 0x167F}, // Unified Canadian Aboriginal Syllabics
	    {begin: 0x1680, end: 0x169F}, // Ogham
	    {begin: 0x16A0, end: 0x16FF}, // Runic
	    {begin: 0x1780, end: 0x17FF}, // Khmer
	    {begin: 0x1800, end: 0x18AF}, // Mongolian
	    {begin: 0x2800, end: 0x28FF}, // Braille Patterns
	    {begin: 0xA000, end: 0xA48F}, // Yi Syllables
	    {begin: 0x1700, end: 0x171F}, // Tagalog
	    {begin: 0x10300, end: 0x1032F}, // Old Italic
	    {begin: 0x10330, end: 0x1034F}, // Gothic
	    {begin: 0x10400, end: 0x1044F}, // Deseret
	    {begin: 0x1D000, end: 0x1D0FF}, // Byzantine Musical Symbols
	    {begin: 0x1D400, end: 0x1D7FF}, // Mathematical Alphanumeric Symbols
	    {begin: 0xFF000, end: 0xFFFFD}, // Private Use (plane 15)
	    {begin: 0xFE00, end: 0xFE0F}, // Variation Selectors
	    {begin: 0xE0000, end: 0xE007F}, // Tags
	    {begin: 0x1900, end: 0x194F}, // Limbu
	    {begin: 0x1950, end: 0x197F}, // Tai Le
	    {begin: 0x1980, end: 0x19DF}, // New Tai Lue
	    {begin: 0x1A00, end: 0x1A1F}, // Buginese
	    {begin: 0x2C00, end: 0x2C5F}, // Glagolitic
	    {begin: 0x2D30, end: 0x2D7F}, // Tifinagh
	    {begin: 0x4DC0, end: 0x4DFF}, // Yijing Hexagram Symbols
	    {begin: 0xA800, end: 0xA82F}, // Syloti Nagri
	    {begin: 0x10000, end: 0x1007F}, // Linear B Syllabary
	    {begin: 0x10140, end: 0x1018F}, // Ancient Greek Numbers
	    {begin: 0x10380, end: 0x1039F}, // Ugaritic
	    {begin: 0x103A0, end: 0x103DF}, // Old Persian
	    {begin: 0x10450, end: 0x1047F}, // Shavian
	    {begin: 0x10480, end: 0x104AF}, // Osmanya
	    {begin: 0x10800, end: 0x1083F}, // Cypriot Syllabary
	    {begin: 0x10A00, end: 0x10A5F}, // Kharoshthi
	    {begin: 0x1D300, end: 0x1D35F}, // Tai Xuan Jing Symbols
	    {begin: 0x12000, end: 0x123FF}, // Cuneiform
	    {begin: 0x1D360, end: 0x1D37F}, // Counting Rod Numerals
	    {begin: 0x1B80, end: 0x1BBF}, // Sundanese
	    {begin: 0x1C00, end: 0x1C4F}, // Lepcha
	    {begin: 0x1C50, end: 0x1C7F}, // Ol Chiki
	    {begin: 0xA880, end: 0xA8DF}, // Saurashtra
	    {begin: 0xA900, end: 0xA92F}, // Kayah Li
	    {begin: 0xA930, end: 0xA95F}, // Rejang
	    {begin: 0xAA00, end: 0xAA5F}, // Cham
	    {begin: 0x10190, end: 0x101CF}, // Ancient Symbols
	    {begin: 0x101D0, end: 0x101FF}, // Phaistos Disc
	    {begin: 0x102A0, end: 0x102DF}, // Carian
	    {begin: 0x1F030, end: 0x1F09F}  // Domino Tiles
	];

	function getUnicodeRange(unicode) {
	    for (var i = 0; i < unicodeRanges.length; i += 1) {
	        var range = unicodeRanges[i];
	        if (unicode >= range.begin && unicode < range.end) {
	            return i;
	        }
	    }

	    return -1;
	}

	// Parse the OS/2 and Windows metrics `OS/2` table
	function parseOS2Table(data, start) {
	    var os2 = {};
	    var p = new parse.Parser(data, start);
	    os2.version = p.parseUShort();
	    os2.xAvgCharWidth = p.parseShort();
	    os2.usWeightClass = p.parseUShort();
	    os2.usWidthClass = p.parseUShort();
	    os2.fsType = p.parseUShort();
	    os2.ySubscriptXSize = p.parseShort();
	    os2.ySubscriptYSize = p.parseShort();
	    os2.ySubscriptXOffset = p.parseShort();
	    os2.ySubscriptYOffset = p.parseShort();
	    os2.ySuperscriptXSize = p.parseShort();
	    os2.ySuperscriptYSize = p.parseShort();
	    os2.ySuperscriptXOffset = p.parseShort();
	    os2.ySuperscriptYOffset = p.parseShort();
	    os2.yStrikeoutSize = p.parseShort();
	    os2.yStrikeoutPosition = p.parseShort();
	    os2.sFamilyClass = p.parseShort();
	    os2.panose = [];
	    for (var i = 0; i < 10; i++) {
	        os2.panose[i] = p.parseByte();
	    }

	    os2.ulUnicodeRange1 = p.parseULong();
	    os2.ulUnicodeRange2 = p.parseULong();
	    os2.ulUnicodeRange3 = p.parseULong();
	    os2.ulUnicodeRange4 = p.parseULong();
	    os2.achVendID = String.fromCharCode(p.parseByte(), p.parseByte(), p.parseByte(), p.parseByte());
	    os2.fsSelection = p.parseUShort();
	    os2.usFirstCharIndex = p.parseUShort();
	    os2.usLastCharIndex = p.parseUShort();
	    os2.sTypoAscender = p.parseShort();
	    os2.sTypoDescender = p.parseShort();
	    os2.sTypoLineGap = p.parseShort();
	    os2.usWinAscent = p.parseUShort();
	    os2.usWinDescent = p.parseUShort();
	    if (os2.version >= 1) {
	        os2.ulCodePageRange1 = p.parseULong();
	        os2.ulCodePageRange2 = p.parseULong();
	    }

	    if (os2.version >= 2) {
	        os2.sxHeight = p.parseShort();
	        os2.sCapHeight = p.parseShort();
	        os2.usDefaultChar = p.parseUShort();
	        os2.usBreakChar = p.parseUShort();
	        os2.usMaxContent = p.parseUShort();
	    }

	    return os2;
	}

	function makeOS2Table(options) {
	    return new table.Table('OS/2', [
	        {name: 'version', type: 'USHORT', value: 0x0003},
	        {name: 'xAvgCharWidth', type: 'SHORT', value: 0},
	        {name: 'usWeightClass', type: 'USHORT', value: 0},
	        {name: 'usWidthClass', type: 'USHORT', value: 0},
	        {name: 'fsType', type: 'USHORT', value: 0},
	        {name: 'ySubscriptXSize', type: 'SHORT', value: 650},
	        {name: 'ySubscriptYSize', type: 'SHORT', value: 699},
	        {name: 'ySubscriptXOffset', type: 'SHORT', value: 0},
	        {name: 'ySubscriptYOffset', type: 'SHORT', value: 140},
	        {name: 'ySuperscriptXSize', type: 'SHORT', value: 650},
	        {name: 'ySuperscriptYSize', type: 'SHORT', value: 699},
	        {name: 'ySuperscriptXOffset', type: 'SHORT', value: 0},
	        {name: 'ySuperscriptYOffset', type: 'SHORT', value: 479},
	        {name: 'yStrikeoutSize', type: 'SHORT', value: 49},
	        {name: 'yStrikeoutPosition', type: 'SHORT', value: 258},
	        {name: 'sFamilyClass', type: 'SHORT', value: 0},
	        {name: 'bFamilyType', type: 'BYTE', value: 0},
	        {name: 'bSerifStyle', type: 'BYTE', value: 0},
	        {name: 'bWeight', type: 'BYTE', value: 0},
	        {name: 'bProportion', type: 'BYTE', value: 0},
	        {name: 'bContrast', type: 'BYTE', value: 0},
	        {name: 'bStrokeVariation', type: 'BYTE', value: 0},
	        {name: 'bArmStyle', type: 'BYTE', value: 0},
	        {name: 'bLetterform', type: 'BYTE', value: 0},
	        {name: 'bMidline', type: 'BYTE', value: 0},
	        {name: 'bXHeight', type: 'BYTE', value: 0},
	        {name: 'ulUnicodeRange1', type: 'ULONG', value: 0},
	        {name: 'ulUnicodeRange2', type: 'ULONG', value: 0},
	        {name: 'ulUnicodeRange3', type: 'ULONG', value: 0},
	        {name: 'ulUnicodeRange4', type: 'ULONG', value: 0},
	        {name: 'achVendID', type: 'CHARARRAY', value: 'XXXX'},
	        {name: 'fsSelection', type: 'USHORT', value: 0},
	        {name: 'usFirstCharIndex', type: 'USHORT', value: 0},
	        {name: 'usLastCharIndex', type: 'USHORT', value: 0},
	        {name: 'sTypoAscender', type: 'SHORT', value: 0},
	        {name: 'sTypoDescender', type: 'SHORT', value: 0},
	        {name: 'sTypoLineGap', type: 'SHORT', value: 0},
	        {name: 'usWinAscent', type: 'USHORT', value: 0},
	        {name: 'usWinDescent', type: 'USHORT', value: 0},
	        {name: 'ulCodePageRange1', type: 'ULONG', value: 0},
	        {name: 'ulCodePageRange2', type: 'ULONG', value: 0},
	        {name: 'sxHeight', type: 'SHORT', value: 0},
	        {name: 'sCapHeight', type: 'SHORT', value: 0},
	        {name: 'usDefaultChar', type: 'USHORT', value: 0},
	        {name: 'usBreakChar', type: 'USHORT', value: 0},
	        {name: 'usMaxContext', type: 'USHORT', value: 0}
	    ], options);
	}

	var os2 = { parse: parseOS2Table, make: makeOS2Table, unicodeRanges: unicodeRanges, getUnicodeRange: getUnicodeRange };

	// The `post` table stores additional PostScript information, such as glyph names.

	// Parse the PostScript `post` table
	function parsePostTable(data, start) {
	    var post = {};
	    var p = new parse.Parser(data, start);
	    post.version = p.parseVersion();
	    post.italicAngle = p.parseFixed();
	    post.underlinePosition = p.parseShort();
	    post.underlineThickness = p.parseShort();
	    post.isFixedPitch = p.parseULong();
	    post.minMemType42 = p.parseULong();
	    post.maxMemType42 = p.parseULong();
	    post.minMemType1 = p.parseULong();
	    post.maxMemType1 = p.parseULong();
	    switch (post.version) {
	        case 1:
	            post.names = standardNames.slice();
	            break;
	        case 2:
	            post.numberOfGlyphs = p.parseUShort();
	            post.glyphNameIndex = new Array(post.numberOfGlyphs);
	            for (var i = 0; i < post.numberOfGlyphs; i++) {
	                post.glyphNameIndex[i] = p.parseUShort();
	            }

	            post.names = [];
	            for (var i$1 = 0; i$1 < post.numberOfGlyphs; i$1++) {
	                if (post.glyphNameIndex[i$1] >= standardNames.length) {
	                    var nameLength = p.parseChar();
	                    post.names.push(p.parseString(nameLength));
	                }
	            }

	            break;
	        case 2.5:
	            post.numberOfGlyphs = p.parseUShort();
	            post.offset = new Array(post.numberOfGlyphs);
	            for (var i$2 = 0; i$2 < post.numberOfGlyphs; i$2++) {
	                post.offset[i$2] = p.parseChar();
	            }

	            break;
	    }
	    return post;
	}

	function makePostTable() {
	    return new table.Table('post', [
	        {name: 'version', type: 'FIXED', value: 0x00030000},
	        {name: 'italicAngle', type: 'FIXED', value: 0},
	        {name: 'underlinePosition', type: 'FWORD', value: 0},
	        {name: 'underlineThickness', type: 'FWORD', value: 0},
	        {name: 'isFixedPitch', type: 'ULONG', value: 0},
	        {name: 'minMemType42', type: 'ULONG', value: 0},
	        {name: 'maxMemType42', type: 'ULONG', value: 0},
	        {name: 'minMemType1', type: 'ULONG', value: 0},
	        {name: 'maxMemType1', type: 'ULONG', value: 0}
	    ]);
	}

	var post = { parse: parsePostTable, make: makePostTable };

	// The `GSUB` table contains ligatures, among other things.

	var subtableParsers = new Array(9);         // subtableParsers[0] is unused

	// https://www.microsoft.com/typography/OTSPEC/GSUB.htm#SS
	subtableParsers[1] = function parseLookup1() {
	    var start = this.offset + this.relativeOffset;
	    var substFormat = this.parseUShort();
	    if (substFormat === 1) {
	        return {
	            substFormat: 1,
	            coverage: this.parsePointer(Parser.coverage),
	            deltaGlyphId: this.parseUShort()
	        };
	    } else if (substFormat === 2) {
	        return {
	            substFormat: 2,
	            coverage: this.parsePointer(Parser.coverage),
	            substitute: this.parseOffset16List()
	        };
	    }
	    check.assert(false, '0x' + start.toString(16) + ': lookup type 1 format must be 1 or 2.');
	};

	// https://www.microsoft.com/typography/OTSPEC/GSUB.htm#MS
	subtableParsers[2] = function parseLookup2() {
	    var substFormat = this.parseUShort();
	    check.argument(substFormat === 1, 'GSUB Multiple Substitution Subtable identifier-format must be 1');
	    return {
	        substFormat: substFormat,
	        coverage: this.parsePointer(Parser.coverage),
	        sequences: this.parseListOfLists()
	    };
	};

	// https://www.microsoft.com/typography/OTSPEC/GSUB.htm#AS
	subtableParsers[3] = function parseLookup3() {
	    var substFormat = this.parseUShort();
	    check.argument(substFormat === 1, 'GSUB Alternate Substitution Subtable identifier-format must be 1');
	    return {
	        substFormat: substFormat,
	        coverage: this.parsePointer(Parser.coverage),
	        alternateSets: this.parseListOfLists()
	    };
	};

	// https://www.microsoft.com/typography/OTSPEC/GSUB.htm#LS
	subtableParsers[4] = function parseLookup4() {
	    var substFormat = this.parseUShort();
	    check.argument(substFormat === 1, 'GSUB ligature table identifier-format must be 1');
	    return {
	        substFormat: substFormat,
	        coverage: this.parsePointer(Parser.coverage),
	        ligatureSets: this.parseListOfLists(function() {
	            return {
	                ligGlyph: this.parseUShort(),
	                components: this.parseUShortList(this.parseUShort() - 1)
	            };
	        })
	    };
	};

	var lookupRecordDesc = {
	    sequenceIndex: Parser.uShort,
	    lookupListIndex: Parser.uShort
	};

	// https://www.microsoft.com/typography/OTSPEC/GSUB.htm#CSF
	subtableParsers[5] = function parseLookup5() {
	    var start = this.offset + this.relativeOffset;
	    var substFormat = this.parseUShort();

	    if (substFormat === 1) {
	        return {
	            substFormat: substFormat,
	            coverage: this.parsePointer(Parser.coverage),
	            ruleSets: this.parseListOfLists(function() {
	                var glyphCount = this.parseUShort();
	                var substCount = this.parseUShort();
	                return {
	                    input: this.parseUShortList(glyphCount - 1),
	                    lookupRecords: this.parseRecordList(substCount, lookupRecordDesc)
	                };
	            })
	        };
	    } else if (substFormat === 2) {
	        return {
	            substFormat: substFormat,
	            coverage: this.parsePointer(Parser.coverage),
	            classDef: this.parsePointer(Parser.classDef),
	            classSets: this.parseListOfLists(function() {
	                var glyphCount = this.parseUShort();
	                var substCount = this.parseUShort();
	                return {
	                    classes: this.parseUShortList(glyphCount - 1),
	                    lookupRecords: this.parseRecordList(substCount, lookupRecordDesc)
	                };
	            })
	        };
	    } else if (substFormat === 3) {
	        var glyphCount = this.parseUShort();
	        var substCount = this.parseUShort();
	        return {
	            substFormat: substFormat,
	            coverages: this.parseList(glyphCount, Parser.pointer(Parser.coverage)),
	            lookupRecords: this.parseRecordList(substCount, lookupRecordDesc)
	        };
	    }
	    check.assert(false, '0x' + start.toString(16) + ': lookup type 5 format must be 1, 2 or 3.');
	};

	// https://www.microsoft.com/typography/OTSPEC/GSUB.htm#CC
	subtableParsers[6] = function parseLookup6() {
	    var start = this.offset + this.relativeOffset;
	    var substFormat = this.parseUShort();
	    if (substFormat === 1) {
	        return {
	            substFormat: 1,
	            coverage: this.parsePointer(Parser.coverage),
	            chainRuleSets: this.parseListOfLists(function() {
	                return {
	                    backtrack: this.parseUShortList(),
	                    input: this.parseUShortList(this.parseShort() - 1),
	                    lookahead: this.parseUShortList(),
	                    lookupRecords: this.parseRecordList(lookupRecordDesc)
	                };
	            })
	        };
	    } else if (substFormat === 2) {
	        return {
	            substFormat: 2,
	            coverage: this.parsePointer(Parser.coverage),
	            backtrackClassDef: this.parsePointer(Parser.classDef),
	            inputClassDef: this.parsePointer(Parser.classDef),
	            lookaheadClassDef: this.parsePointer(Parser.classDef),
	            chainClassSet: this.parseListOfLists(function() {
	                return {
	                    backtrack: this.parseUShortList(),
	                    input: this.parseUShortList(this.parseShort() - 1),
	                    lookahead: this.parseUShortList(),
	                    lookupRecords: this.parseRecordList(lookupRecordDesc)
	                };
	            })
	        };
	    } else if (substFormat === 3) {
	        return {
	            substFormat: 3,
	            backtrackCoverage: this.parseList(Parser.pointer(Parser.coverage)),
	            inputCoverage: this.parseList(Parser.pointer(Parser.coverage)),
	            lookaheadCoverage: this.parseList(Parser.pointer(Parser.coverage)),
	            lookupRecords: this.parseRecordList(lookupRecordDesc)
	        };
	    }
	    check.assert(false, '0x' + start.toString(16) + ': lookup type 6 format must be 1, 2 or 3.');
	};

	// https://www.microsoft.com/typography/OTSPEC/GSUB.htm#ES
	subtableParsers[7] = function parseLookup7() {
	    // Extension Substitution subtable
	    var substFormat = this.parseUShort();
	    check.argument(substFormat === 1, 'GSUB Extension Substitution subtable identifier-format must be 1');
	    var extensionLookupType = this.parseUShort();
	    var extensionParser = new Parser(this.data, this.offset + this.parseULong());
	    return {
	        substFormat: 1,
	        lookupType: extensionLookupType,
	        extension: subtableParsers[extensionLookupType].call(extensionParser)
	    };
	};

	// https://www.microsoft.com/typography/OTSPEC/GSUB.htm#RCCS
	subtableParsers[8] = function parseLookup8() {
	    var substFormat = this.parseUShort();
	    check.argument(substFormat === 1, 'GSUB Reverse Chaining Contextual Single Substitution Subtable identifier-format must be 1');
	    return {
	        substFormat: substFormat,
	        coverage: this.parsePointer(Parser.coverage),
	        backtrackCoverage: this.parseList(Parser.pointer(Parser.coverage)),
	        lookaheadCoverage: this.parseList(Parser.pointer(Parser.coverage)),
	        substitutes: this.parseUShortList()
	    };
	};

	// https://www.microsoft.com/typography/OTSPEC/gsub.htm
	function parseGsubTable(data, start) {
	    start = start || 0;
	    var p = new Parser(data, start);
	    var tableVersion = p.parseVersion(1);
	    check.argument(tableVersion === 1 || tableVersion === 1.1, 'Unsupported GSUB table version.');
	    if (tableVersion === 1) {
	        return {
	            version: tableVersion,
	            scripts: p.parseScriptList(),
	            features: p.parseFeatureList(),
	            lookups: p.parseLookupList(subtableParsers)
	        };
	    } else {
	        return {
	            version: tableVersion,
	            scripts: p.parseScriptList(),
	            features: p.parseFeatureList(),
	            lookups: p.parseLookupList(subtableParsers),
	            variations: p.parseFeatureVariationsList()
	        };
	    }

	}

	// GSUB Writing //////////////////////////////////////////////
	var subtableMakers = new Array(9);

	subtableMakers[1] = function makeLookup1(subtable) {
	    if (subtable.substFormat === 1) {
	        return new table.Table('substitutionTable', [
	            {name: 'substFormat', type: 'USHORT', value: 1},
	            {name: 'coverage', type: 'TABLE', value: new table.Coverage(subtable.coverage)},
	            {name: 'deltaGlyphID', type: 'USHORT', value: subtable.deltaGlyphId}
	        ]);
	    } else {
	        return new table.Table('substitutionTable', [
	            {name: 'substFormat', type: 'USHORT', value: 2},
	            {name: 'coverage', type: 'TABLE', value: new table.Coverage(subtable.coverage)}
	        ].concat(table.ushortList('substitute', subtable.substitute)));
	    }
	};

	subtableMakers[2] = function makeLookup2(subtable) {
	    check.assert(subtable.substFormat === 1, 'Lookup type 2 substFormat must be 1.');
	    return new table.Table('substitutionTable', [
	        {name: 'substFormat', type: 'USHORT', value: 1},
	        {name: 'coverage', type: 'TABLE', value: new table.Coverage(subtable.coverage)}
	    ].concat(table.tableList('seqSet', subtable.sequences, function(sequenceSet) {
	        return new table.Table('sequenceSetTable', table.ushortList('sequence', sequenceSet));
	    })));
	};

	subtableMakers[3] = function makeLookup3(subtable) {
	    check.assert(subtable.substFormat === 1, 'Lookup type 3 substFormat must be 1.');
	    return new table.Table('substitutionTable', [
	        {name: 'substFormat', type: 'USHORT', value: 1},
	        {name: 'coverage', type: 'TABLE', value: new table.Coverage(subtable.coverage)}
	    ].concat(table.tableList('altSet', subtable.alternateSets, function(alternateSet) {
	        return new table.Table('alternateSetTable', table.ushortList('alternate', alternateSet));
	    })));
	};

	subtableMakers[4] = function makeLookup4(subtable) {
	    check.assert(subtable.substFormat === 1, 'Lookup type 4 substFormat must be 1.');
	    return new table.Table('substitutionTable', [
	        {name: 'substFormat', type: 'USHORT', value: 1},
	        {name: 'coverage', type: 'TABLE', value: new table.Coverage(subtable.coverage)}
	    ].concat(table.tableList('ligSet', subtable.ligatureSets, function(ligatureSet) {
	        return new table.Table('ligatureSetTable', table.tableList('ligature', ligatureSet, function(ligature) {
	            return new table.Table('ligatureTable',
	                [{name: 'ligGlyph', type: 'USHORT', value: ligature.ligGlyph}]
	                .concat(table.ushortList('component', ligature.components, ligature.components.length + 1))
	            );
	        }));
	    })));
	};

	subtableMakers[6] = function makeLookup6(subtable) {
	    if (subtable.substFormat === 1) {
	        var returnTable = new table.Table('chainContextTable', [
	            {name: 'substFormat', type: 'USHORT', value: subtable.substFormat},
	            {name: 'coverage', type: 'TABLE', value: new table.Coverage(subtable.coverage)}
	        ].concat(table.tableList('chainRuleSet', subtable.chainRuleSets, function(chainRuleSet) {
	            return new table.Table('chainRuleSetTable', table.tableList('chainRule', chainRuleSet, function(chainRule) {
	                var tableData = table.ushortList('backtrackGlyph', chainRule.backtrack, chainRule.backtrack.length)
	                    .concat(table.ushortList('inputGlyph', chainRule.input, chainRule.input.length + 1))
	                    .concat(table.ushortList('lookaheadGlyph', chainRule.lookahead, chainRule.lookahead.length))
	                    .concat(table.ushortList('substitution', [], chainRule.lookupRecords.length));

	                chainRule.lookupRecords.forEach(function (record, i) {
	                    tableData = tableData
	                        .concat({name: 'sequenceIndex' + i, type: 'USHORT', value: record.sequenceIndex})
	                        .concat({name: 'lookupListIndex' + i, type: 'USHORT', value: record.lookupListIndex});
	                });
	                return new table.Table('chainRuleTable', tableData);
	            }));
	        })));
	        return returnTable;
	    } else if (subtable.substFormat === 2) {
	        check.assert(false, 'lookup type 6 format 2 is not yet supported.');
	    } else if (subtable.substFormat === 3) {
	        var tableData = [
	            {name: 'substFormat', type: 'USHORT', value: subtable.substFormat} ];

	        tableData.push({name: 'backtrackGlyphCount', type: 'USHORT', value: subtable.backtrackCoverage.length});
	        subtable.backtrackCoverage.forEach(function (coverage, i) {
	            tableData.push({name: 'backtrackCoverage' + i, type: 'TABLE', value: new table.Coverage(coverage)});
	        });
	        tableData.push({name: 'inputGlyphCount', type: 'USHORT', value: subtable.inputCoverage.length});
	        subtable.inputCoverage.forEach(function (coverage, i) {
	            tableData.push({name: 'inputCoverage' + i, type: 'TABLE', value: new table.Coverage(coverage)});
	        });
	        tableData.push({name: 'lookaheadGlyphCount', type: 'USHORT', value: subtable.lookaheadCoverage.length});
	        subtable.lookaheadCoverage.forEach(function (coverage, i) {
	            tableData.push({name: 'lookaheadCoverage' + i, type: 'TABLE', value: new table.Coverage(coverage)});
	        });

	        tableData.push({name: 'substitutionCount', type: 'USHORT', value: subtable.lookupRecords.length});
	        subtable.lookupRecords.forEach(function (record, i) {
	            tableData = tableData
	                .concat({name: 'sequenceIndex' + i, type: 'USHORT', value: record.sequenceIndex})
	                .concat({name: 'lookupListIndex' + i, type: 'USHORT', value: record.lookupListIndex});
	        });

	        var returnTable$1 = new table.Table('chainContextTable', tableData);

	        return returnTable$1;
	    }

	    check.assert(false, 'lookup type 6 format must be 1, 2 or 3.');
	};

	function makeGsubTable(gsub) {
	    return new table.Table('GSUB', [
	        {name: 'version', type: 'ULONG', value: 0x10000},
	        {name: 'scripts', type: 'TABLE', value: new table.ScriptList(gsub.scripts)},
	        {name: 'features', type: 'TABLE', value: new table.FeatureList(gsub.features)},
	        {name: 'lookups', type: 'TABLE', value: new table.LookupList(gsub.lookups, subtableMakers)}
	    ]);
	}

	var gsub = { parse: parseGsubTable, make: makeGsubTable };

	// The `GPOS` table contains kerning pairs, among other things.

	// Parse the metadata `meta` table.
	// https://developer.apple.com/fonts/TrueType-Reference-Manual/RM06/Chap6meta.html
	function parseMetaTable(data, start) {
	    var p = new parse.Parser(data, start);
	    var tableVersion = p.parseULong();
	    check.argument(tableVersion === 1, 'Unsupported META table version.');
	    p.parseULong(); // flags - currently unused and set to 0
	    p.parseULong(); // tableOffset
	    var numDataMaps = p.parseULong();

	    var tags = {};
	    for (var i = 0; i < numDataMaps; i++) {
	        var tag = p.parseTag();
	        var dataOffset = p.parseULong();
	        var dataLength = p.parseULong();
	        var text = decode.UTF8(data, start + dataOffset, dataLength);

	        tags[tag] = text;
	    }
	    return tags;
	}

	function makeMetaTable(tags) {
	    var numTags = Object.keys(tags).length;
	    var stringPool = '';
	    var stringPoolOffset = 16 + numTags * 12;

	    var result = new table.Table('meta', [
	        {name: 'version', type: 'ULONG', value: 1},
	        {name: 'flags', type: 'ULONG', value: 0},
	        {name: 'offset', type: 'ULONG', value: stringPoolOffset},
	        {name: 'numTags', type: 'ULONG', value: numTags}
	    ]);

	    for (var tag in tags) {
	        var pos = stringPool.length;
	        stringPool += tags[tag];

	        result.fields.push({name: 'tag ' + tag, type: 'TAG', value: tag});
	        result.fields.push({name: 'offset ' + tag, type: 'ULONG', value: stringPoolOffset + pos});
	        result.fields.push({name: 'length ' + tag, type: 'ULONG', value: tags[tag].length});
	    }

	    result.fields.push({name: 'stringPool', type: 'CHARARRAY', value: stringPool});

	    return result;
	}

	var meta = { parse: parseMetaTable, make: makeMetaTable };

	// The `sfnt` wrapper provides organization for the tables in the font.

	function log2(v) {
	    return Math.log(v) / Math.log(2) | 0;
	}

	function computeCheckSum(bytes) {
	    while (bytes.length % 4 !== 0) {
	        bytes.push(0);
	    }

	    var sum = 0;
	    for (var i = 0; i < bytes.length; i += 4) {
	        sum += (bytes[i] << 24) +
	            (bytes[i + 1] << 16) +
	            (bytes[i + 2] << 8) +
	            (bytes[i + 3]);
	    }

	    sum %= Math.pow(2, 32);
	    return sum;
	}

	function makeTableRecord(tag, checkSum, offset, length) {
	    return new table.Record('Table Record', [
	        {name: 'tag', type: 'TAG', value: tag !== undefined ? tag : ''},
	        {name: 'checkSum', type: 'ULONG', value: checkSum !== undefined ? checkSum : 0},
	        {name: 'offset', type: 'ULONG', value: offset !== undefined ? offset : 0},
	        {name: 'length', type: 'ULONG', value: length !== undefined ? length : 0}
	    ]);
	}

	function makeSfntTable(tables) {
	    var sfnt = new table.Table('sfnt', [
	        {name: 'version', type: 'TAG', value: 'OTTO'},
	        {name: 'numTables', type: 'USHORT', value: 0},
	        {name: 'searchRange', type: 'USHORT', value: 0},
	        {name: 'entrySelector', type: 'USHORT', value: 0},
	        {name: 'rangeShift', type: 'USHORT', value: 0}
	    ]);
	    sfnt.tables = tables;
	    sfnt.numTables = tables.length;
	    var highestPowerOf2 = Math.pow(2, log2(sfnt.numTables));
	    sfnt.searchRange = 16 * highestPowerOf2;
	    sfnt.entrySelector = log2(highestPowerOf2);
	    sfnt.rangeShift = sfnt.numTables * 16 - sfnt.searchRange;

	    var recordFields = [];
	    var tableFields = [];

	    var offset = sfnt.sizeOf() + (makeTableRecord().sizeOf() * sfnt.numTables);
	    while (offset % 4 !== 0) {
	        offset += 1;
	        tableFields.push({name: 'padding', type: 'BYTE', value: 0});
	    }

	    for (var i = 0; i < tables.length; i += 1) {
	        var t = tables[i];
	        check.argument(t.tableName.length === 4, 'Table name' + t.tableName + ' is invalid.');
	        var tableLength = t.sizeOf();
	        var tableRecord = makeTableRecord(t.tableName, computeCheckSum(t.encode()), offset, tableLength);
	        recordFields.push({name: tableRecord.tag + ' Table Record', type: 'RECORD', value: tableRecord});
	        tableFields.push({name: t.tableName + ' table', type: 'RECORD', value: t});
	        offset += tableLength;
	        check.argument(!isNaN(offset), 'Something went wrong calculating the offset.');
	        while (offset % 4 !== 0) {
	            offset += 1;
	            tableFields.push({name: 'padding', type: 'BYTE', value: 0});
	        }
	    }

	    // Table records need to be sorted alphabetically.
	    recordFields.sort(function(r1, r2) {
	        if (r1.value.tag > r2.value.tag) {
	            return 1;
	        } else {
	            return -1;
	        }
	    });

	    sfnt.fields = sfnt.fields.concat(recordFields);
	    sfnt.fields = sfnt.fields.concat(tableFields);
	    return sfnt;
	}

	// Get the metrics for a character. If the string has more than one character
	// this function returns metrics for the first available character.
	// You can provide optional fallback metrics if no characters are available.
	function metricsForChar(font, chars, notFoundMetrics) {
	    for (var i = 0; i < chars.length; i += 1) {
	        var glyphIndex = font.charToGlyphIndex(chars[i]);
	        if (glyphIndex > 0) {
	            var glyph = font.glyphs.get(glyphIndex);
	            return glyph.getMetrics();
	        }
	    }

	    return notFoundMetrics;
	}

	function average(vs) {
	    var sum = 0;
	    for (var i = 0; i < vs.length; i += 1) {
	        sum += vs[i];
	    }

	    return sum / vs.length;
	}

	// Convert the font object to a SFNT data structure.
	// This structure contains all the necessary tables and metadata to create a binary OTF file.
	function fontToSfntTable(font) {
	    var xMins = [];
	    var yMins = [];
	    var xMaxs = [];
	    var yMaxs = [];
	    var advanceWidths = [];
	    var leftSideBearings = [];
	    var rightSideBearings = [];
	    var firstCharIndex;
	    var lastCharIndex = 0;
	    var ulUnicodeRange1 = 0;
	    var ulUnicodeRange2 = 0;
	    var ulUnicodeRange3 = 0;
	    var ulUnicodeRange4 = 0;

	    for (var i = 0; i < font.glyphs.length; i += 1) {
	        var glyph = font.glyphs.get(i);
	        var unicode = glyph.unicode | 0;

	        if (isNaN(glyph.advanceWidth)) {
	            throw new Error('Glyph ' + glyph.name + ' (' + i + '): advanceWidth is not a number.');
	        }

	        if (firstCharIndex > unicode || firstCharIndex === undefined) {
	            // ignore .notdef char
	            if (unicode > 0) {
	                firstCharIndex = unicode;
	            }
	        }

	        if (lastCharIndex < unicode) {
	            lastCharIndex = unicode;
	        }

	        var position = os2.getUnicodeRange(unicode);
	        if (position < 32) {
	            ulUnicodeRange1 |= 1 << position;
	        } else if (position < 64) {
	            ulUnicodeRange2 |= 1 << position - 32;
	        } else if (position < 96) {
	            ulUnicodeRange3 |= 1 << position - 64;
	        } else if (position < 123) {
	            ulUnicodeRange4 |= 1 << position - 96;
	        } else {
	            throw new Error('Unicode ranges bits > 123 are reserved for internal usage');
	        }
	        // Skip non-important characters.
	        if (glyph.name === '.notdef') { continue; }
	        var metrics = glyph.getMetrics();
	        xMins.push(metrics.xMin);
	        yMins.push(metrics.yMin);
	        xMaxs.push(metrics.xMax);
	        yMaxs.push(metrics.yMax);
	        leftSideBearings.push(metrics.leftSideBearing);
	        rightSideBearings.push(metrics.rightSideBearing);
	        advanceWidths.push(glyph.advanceWidth);
	    }

	    var globals = {
	        xMin: Math.min.apply(null, xMins),
	        yMin: Math.min.apply(null, yMins),
	        xMax: Math.max.apply(null, xMaxs),
	        yMax: Math.max.apply(null, yMaxs),
	        advanceWidthMax: Math.max.apply(null, advanceWidths),
	        advanceWidthAvg: average(advanceWidths),
	        minLeftSideBearing: Math.min.apply(null, leftSideBearings),
	        maxLeftSideBearing: Math.max.apply(null, leftSideBearings),
	        minRightSideBearing: Math.min.apply(null, rightSideBearings)
	    };
	    globals.ascender = font.ascender;
	    globals.descender = font.descender;

	    var headTable = head.make({
	        flags: 3, // 00000011 (baseline for font at y=0; left sidebearing point at x=0)
	        unitsPerEm: font.unitsPerEm,
	        xMin: globals.xMin,
	        yMin: globals.yMin,
	        xMax: globals.xMax,
	        yMax: globals.yMax,
	        lowestRecPPEM: 3,
	        createdTimestamp: font.createdTimestamp
	    });

	    var hheaTable = hhea.make({
	        ascender: globals.ascender,
	        descender: globals.descender,
	        advanceWidthMax: globals.advanceWidthMax,
	        minLeftSideBearing: globals.minLeftSideBearing,
	        minRightSideBearing: globals.minRightSideBearing,
	        xMaxExtent: globals.maxLeftSideBearing + (globals.xMax - globals.xMin),
	        numberOfHMetrics: font.glyphs.length
	    });

	    var maxpTable = maxp.make(font.glyphs.length);

	    var os2Table = os2.make(Object.assign({
	        xAvgCharWidth: Math.round(globals.advanceWidthAvg),
	        usFirstCharIndex: firstCharIndex,
	        usLastCharIndex: lastCharIndex,
	        ulUnicodeRange1: ulUnicodeRange1,
	        ulUnicodeRange2: ulUnicodeRange2,
	        ulUnicodeRange3: ulUnicodeRange3,
	        ulUnicodeRange4: ulUnicodeRange4,
	        // See http://typophile.com/node/13081 for more info on vertical metrics.
	        // We get metrics for typical characters (such as "x" for xHeight).
	        // We provide some fallback characters if characters are unavailable: their
	        // ordering was chosen experimentally.
	        sTypoAscender: globals.ascender,
	        sTypoDescender: globals.descender,
	        sTypoLineGap: 0,
	        usWinAscent: globals.yMax,
	        usWinDescent: Math.abs(globals.yMin),
	        ulCodePageRange1: 1, // FIXME: hard-code Latin 1 support for now
	        sxHeight: metricsForChar(font, 'xyvw', {yMax: Math.round(globals.ascender / 2)}).yMax,
	        sCapHeight: metricsForChar(font, 'HIKLEFJMNTZBDPRAGOQSUVWXY', globals).yMax,
	        usDefaultChar: font.hasChar(' ') ? 32 : 0, // Use space as the default character, if available.
	        usBreakChar: font.hasChar(' ') ? 32 : 0, // Use space as the break character, if available.
	    }, font.tables.os2));

	    var hmtxTable = hmtx.make(font.glyphs);
	    var cmapTable = cmap.make(font.glyphs);

	    var englishFamilyName = font.getEnglishName('fontFamily');
	    var englishStyleName = font.getEnglishName('fontSubfamily');
	    var englishFullName = englishFamilyName + ' ' + englishStyleName;
	    var postScriptName = font.getEnglishName('postScriptName');
	    if (!postScriptName) {
	        postScriptName = englishFamilyName.replace(/\s/g, '') + '-' + englishStyleName;
	    }

	    var names = {};
	    for (var n in font.names) {
	        names[n] = font.names[n];
	    }

	    if (!names.uniqueID) {
	        names.uniqueID = {en: font.getEnglishName('manufacturer') + ':' + englishFullName};
	    }

	    if (!names.postScriptName) {
	        names.postScriptName = {en: postScriptName};
	    }

	    if (!names.preferredFamily) {
	        names.preferredFamily = font.names.fontFamily;
	    }

	    if (!names.preferredSubfamily) {
	        names.preferredSubfamily = font.names.fontSubfamily;
	    }

	    var languageTags = [];
	    var nameTable = _name.make(names, languageTags);
	    var ltagTable = (languageTags.length > 0 ? ltag.make(languageTags) : undefined);

	    var postTable = post.make();
	    var cffTable = cff.make(font.glyphs, {
	        version: font.getEnglishName('version'),
	        fullName: englishFullName,
	        familyName: englishFamilyName,
	        weightName: englishStyleName,
	        postScriptName: postScriptName,
	        unitsPerEm: font.unitsPerEm,
	        fontBBox: [0, globals.yMin, globals.ascender, globals.advanceWidthMax]
	    });

	    var metaTable = (font.metas && Object.keys(font.metas).length > 0) ? meta.make(font.metas) : undefined;

	    // The order does not matter because makeSfntTable() will sort them.
	    var tables = [headTable, hheaTable, maxpTable, os2Table, nameTable, cmapTable, postTable, cffTable, hmtxTable];
	    if (ltagTable) {
	        tables.push(ltagTable);
	    }
	    // Optional tables
	    if (font.tables.gsub) {
	        tables.push(gsub.make(font.tables.gsub));
	    }
	    if (metaTable) {
	        tables.push(metaTable);
	    }

	    var sfntTable = makeSfntTable(tables);

	    // Compute the font's checkSum and store it in head.checkSumAdjustment.
	    var bytes = sfntTable.encode();
	    var checkSum = computeCheckSum(bytes);
	    var tableFields = sfntTable.fields;
	    var checkSumAdjusted = false;
	    for (var i$1 = 0; i$1 < tableFields.length; i$1 += 1) {
	        if (tableFields[i$1].name === 'head table') {
	            tableFields[i$1].value.checkSumAdjustment = 0xB1B0AFBA - checkSum;
	            checkSumAdjusted = true;
	            break;
	        }
	    }

	    if (!checkSumAdjusted) {
	        throw new Error('Could not find head table with checkSum to adjust.');
	    }

	    return sfntTable;
	}

	var sfnt = { make: makeSfntTable, fontToTable: fontToSfntTable, computeCheckSum: computeCheckSum };

	// The Layout object is the prototype of Substitution objects, and provides

	function searchTag(arr, tag) {
	    /* jshint bitwise: false */
	    var imin = 0;
	    var imax = arr.length - 1;
	    while (imin <= imax) {
	        var imid = (imin + imax) >>> 1;
	        var val = arr[imid].tag;
	        if (val === tag) {
	            return imid;
	        } else if (val < tag) {
	            imin = imid + 1;
	        } else { imax = imid - 1; }
	    }
	    // Not found: return -1-insertion point
	    return -imin - 1;
	}

	function binSearch(arr, value) {
	    /* jshint bitwise: false */
	    var imin = 0;
	    var imax = arr.length - 1;
	    while (imin <= imax) {
	        var imid = (imin + imax) >>> 1;
	        var val = arr[imid];
	        if (val === value) {
	            return imid;
	        } else if (val < value) {
	            imin = imid + 1;
	        } else { imax = imid - 1; }
	    }
	    // Not found: return -1-insertion point
	    return -imin - 1;
	}

	// binary search in a list of ranges (coverage, class definition)
	function searchRange(ranges, value) {
	    // jshint bitwise: false
	    var range;
	    var imin = 0;
	    var imax = ranges.length - 1;
	    while (imin <= imax) {
	        var imid = (imin + imax) >>> 1;
	        range = ranges[imid];
	        var start = range.start;
	        if (start === value) {
	            return range;
	        } else if (start < value) {
	            imin = imid + 1;
	        } else { imax = imid - 1; }
	    }
	    if (imin > 0) {
	        range = ranges[imin - 1];
	        if (value > range.end) { return 0; }
	        return range;
	    }
	}

	/**
	 * @exports opentype.Layout
	 * @class
	 */
	function Layout(font, tableName) {
	    this.font = font;
	    this.tableName = tableName;
	}

	Layout.prototype = {

	    /**
	     * Binary search an object by "tag" property
	     * @instance
	     * @function searchTag
	     * @memberof opentype.Layout
	     * @param  {Array} arr
	     * @param  {string} tag
	     * @return {number}
	     */
	    searchTag: searchTag,

	    /**
	     * Binary search in a list of numbers
	     * @instance
	     * @function binSearch
	     * @memberof opentype.Layout
	     * @param  {Array} arr
	     * @param  {number} value
	     * @return {number}
	     */
	    binSearch: binSearch,

	    /**
	     * Get or create the Layout table (GSUB, GPOS etc).
	     * @param  {boolean} create - Whether to create a new one.
	     * @return {Object} The GSUB or GPOS table.
	     */
	    getTable: function(create) {
	        var layout = this.font.tables[this.tableName];
	        if (!layout && create) {
	            layout = this.font.tables[this.tableName] = this.createDefaultTable();
	        }
	        return layout;
	    },

	    /**
	     * Returns all scripts in the substitution table.
	     * @instance
	     * @return {Array}
	     */
	    getScriptNames: function() {
	        var layout = this.getTable();
	        if (!layout) { return []; }
	        return layout.scripts.map(function(script) {
	            return script.tag;
	        });
	    },

	    /**
	     * Returns the best bet for a script name.
	     * Returns 'DFLT' if it exists.
	     * If not, returns 'latn' if it exists.
	     * If neither exist, returns undefined.
	     */
	    getDefaultScriptName: function() {
	        var layout = this.getTable();
	        if (!layout) { return; }
	        var hasLatn = false;
	        for (var i = 0; i < layout.scripts.length; i++) {
	            var name = layout.scripts[i].tag;
	            if (name === 'DFLT') { return name; }
	            if (name === 'latn') { hasLatn = true; }
	        }
	        if (hasLatn) { return 'latn'; }
	    },

	    /**
	     * Returns all LangSysRecords in the given script.
	     * @instance
	     * @param {string} [script='DFLT']
	     * @param {boolean} create - forces the creation of this script table if it doesn't exist.
	     * @return {Object} An object with tag and script properties.
	     */
	    getScriptTable: function(script, create) {
	        var layout = this.getTable(create);
	        if (layout) {
	            script = script || 'DFLT';
	            var scripts = layout.scripts;
	            var pos = searchTag(layout.scripts, script);
	            if (pos >= 0) {
	                return scripts[pos].script;
	            } else if (create) {
	                var scr = {
	                    tag: script,
	                    script: {
	                        defaultLangSys: {reserved: 0, reqFeatureIndex: 0xffff, featureIndexes: []},
	                        langSysRecords: []
	                    }
	                };
	                scripts.splice(-1 - pos, 0, scr);
	                return scr.script;
	            }
	        }
	    },

	    /**
	     * Returns a language system table
	     * @instance
	     * @param {string} [script='DFLT']
	     * @param {string} [language='dlft']
	     * @param {boolean} create - forces the creation of this langSysTable if it doesn't exist.
	     * @return {Object}
	     */
	    getLangSysTable: function(script, language, create) {
	        var scriptTable = this.getScriptTable(script, create);
	        if (scriptTable) {
	            if (!language || language === 'dflt' || language === 'DFLT') {
	                return scriptTable.defaultLangSys;
	            }
	            var pos = searchTag(scriptTable.langSysRecords, language);
	            if (pos >= 0) {
	                return scriptTable.langSysRecords[pos].langSys;
	            } else if (create) {
	                var langSysRecord = {
	                    tag: language,
	                    langSys: {reserved: 0, reqFeatureIndex: 0xffff, featureIndexes: []}
	                };
	                scriptTable.langSysRecords.splice(-1 - pos, 0, langSysRecord);
	                return langSysRecord.langSys;
	            }
	        }
	    },

	    /**
	     * Get a specific feature table.
	     * @instance
	     * @param {string} [script='DFLT']
	     * @param {string} [language='dlft']
	     * @param {string} feature - One of the codes listed at https://www.microsoft.com/typography/OTSPEC/featurelist.htm
	     * @param {boolean} create - forces the creation of the feature table if it doesn't exist.
	     * @return {Object}
	     */
	    getFeatureTable: function(script, language, feature, create) {
	        var langSysTable = this.getLangSysTable(script, language, create);
	        if (langSysTable) {
	            var featureRecord;
	            var featIndexes = langSysTable.featureIndexes;
	            var allFeatures = this.font.tables[this.tableName].features;
	            // The FeatureIndex array of indices is in arbitrary order,
	            // even if allFeatures is sorted alphabetically by feature tag.
	            for (var i = 0; i < featIndexes.length; i++) {
	                featureRecord = allFeatures[featIndexes[i]];
	                if (featureRecord.tag === feature) {
	                    return featureRecord.feature;
	                }
	            }
	            if (create) {
	                var index = allFeatures.length;
	                // Automatic ordering of features would require to shift feature indexes in the script list.
	                check.assert(index === 0 || feature >= allFeatures[index - 1].tag, 'Features must be added in alphabetical order.');
	                featureRecord = {
	                    tag: feature,
	                    feature: { params: 0, lookupListIndexes: [] }
	                };
	                allFeatures.push(featureRecord);
	                featIndexes.push(index);
	                return featureRecord.feature;
	            }
	        }
	    },

	    /**
	     * Get the lookup tables of a given type for a script/language/feature.
	     * @instance
	     * @param {string} [script='DFLT']
	     * @param {string} [language='dlft']
	     * @param {string} feature - 4-letter feature code
	     * @param {number} lookupType - 1 to 9
	     * @param {boolean} create - forces the creation of the lookup table if it doesn't exist, with no subtables.
	     * @return {Object[]}
	     */
	    getLookupTables: function(script, language, feature, lookupType, create) {
	        var featureTable = this.getFeatureTable(script, language, feature, create);
	        var tables = [];
	        if (featureTable) {
	            var lookupTable;
	            var lookupListIndexes = featureTable.lookupListIndexes;
	            var allLookups = this.font.tables[this.tableName].lookups;
	            // lookupListIndexes are in no particular order, so use naive search.
	            for (var i = 0; i < lookupListIndexes.length; i++) {
	                lookupTable = allLookups[lookupListIndexes[i]];
	                if (lookupTable.lookupType === lookupType) {
	                    tables.push(lookupTable);
	                }
	            }
	            if (tables.length === 0 && create) {
	                lookupTable = {
	                    lookupType: lookupType,
	                    lookupFlag: 0,
	                    subtables: [],
	                    markFilteringSet: undefined
	                };
	                var index = allLookups.length;
	                allLookups.push(lookupTable);
	                lookupListIndexes.push(index);
	                return [lookupTable];
	            }
	        }
	        return tables;
	    },

	    /**
	     * Find a glyph in a class definition table
	     * https://docs.microsoft.com/en-us/typography/opentype/spec/chapter2#class-definition-table
	     * @param {object} classDefTable - an OpenType Layout class definition table
	     * @param {number} glyphIndex - the index of the glyph to find
	     * @returns {number} -1 if not found
	     */
	    getGlyphClass: function(classDefTable, glyphIndex) {
	        switch (classDefTable.format) {
	            case 1:
	                if (classDefTable.startGlyph <= glyphIndex && glyphIndex < classDefTable.startGlyph + classDefTable.classes.length) {
	                    return classDefTable.classes[glyphIndex - classDefTable.startGlyph];
	                }
	                return 0;
	            case 2:
	                var range = searchRange(classDefTable.ranges, glyphIndex);
	                return range ? range.classId : 0;
	        }
	    },

	    /**
	     * Find a glyph in a coverage table
	     * https://docs.microsoft.com/en-us/typography/opentype/spec/chapter2#coverage-table
	     * @param {object} coverageTable - an OpenType Layout coverage table
	     * @param {number} glyphIndex - the index of the glyph to find
	     * @returns {number} -1 if not found
	     */
	    getCoverageIndex: function(coverageTable, glyphIndex) {
	        switch (coverageTable.format) {
	            case 1:
	                var index = binSearch(coverageTable.glyphs, glyphIndex);
	                return index >= 0 ? index : -1;
	            case 2:
	                var range = searchRange(coverageTable.ranges, glyphIndex);
	                return range ? range.index + glyphIndex - range.start : -1;
	        }
	    },

	    /**
	     * Returns the list of glyph indexes of a coverage table.
	     * Format 1: the list is stored raw
	     * Format 2: compact list as range records.
	     * @instance
	     * @param  {Object} coverageTable
	     * @return {Array}
	     */
	    expandCoverage: function(coverageTable) {
	        if (coverageTable.format === 1) {
	            return coverageTable.glyphs;
	        } else {
	            var glyphs = [];
	            var ranges = coverageTable.ranges;
	            for (var i = 0; i < ranges.length; i++) {
	                var range = ranges[i];
	                var start = range.start;
	                var end = range.end;
	                for (var j = start; j <= end; j++) {
	                    glyphs.push(j);
	                }
	            }
	            return glyphs;
	        }
	    }

	};

	// The Position object provides utility methods to manipulate

	/**
	 * @exports opentype.Position
	 * @class
	 * @extends opentype.Layout
	 * @param {opentype.Font}
	 * @constructor
	 */
	function Position(font) {
	    Layout.call(this, font, 'gpos');
	}

	Position.prototype = Layout.prototype;

	/**
	 * Init some data for faster and easier access later.
	 */
	Position.prototype.init = function() {
	    var script = this.getDefaultScriptName();
	    this.defaultKerningTables = this.getKerningTables(script);
	};

	/**
	 * Find a glyph pair in a list of lookup tables of type 2 and retrieve the xAdvance kerning value.
	 *
	 * @param {integer} leftIndex - left glyph index
	 * @param {integer} rightIndex - right glyph index
	 * @returns {integer}
	 */
	Position.prototype.getKerningValue = function(kerningLookups, leftIndex, rightIndex) {
	    for (var i = 0; i < kerningLookups.length; i++) {
	        var subtables = kerningLookups[i].subtables;
	        for (var j = 0; j < subtables.length; j++) {
	            var subtable = subtables[j];
	            var covIndex = this.getCoverageIndex(subtable.coverage, leftIndex);
	            if (covIndex < 0) { continue; }
	            switch (subtable.posFormat) {
	                case 1:
	                    // Search Pair Adjustment Positioning Format 1
	                    var pairSet = subtable.pairSets[covIndex];
	                    for (var k = 0; k < pairSet.length; k++) {
	                        var pair = pairSet[k];
	                        if (pair.secondGlyph === rightIndex) {
	                            return pair.value1 && pair.value1.xAdvance || 0;
	                        }
	                    }
	                    break;      // left glyph found, not right glyph - try next subtable
	                case 2:
	                    // Search Pair Adjustment Positioning Format 2
	                    var class1 = this.getGlyphClass(subtable.classDef1, leftIndex);
	                    var class2 = this.getGlyphClass(subtable.classDef2, rightIndex);
	                    var pair$1 = subtable.classRecords[class1][class2];
	                    return pair$1.value1 && pair$1.value1.xAdvance || 0;
	            }
	        }
	    }
	    return 0;
	};

	/**
	 * List all kerning lookup tables.
	 *
	 * @param {string} [script='DFLT'] - use font.position.getDefaultScriptName() for a better default value
	 * @param {string} [language='dflt']
	 * @return {object[]} The list of kerning lookup tables (may be empty), or undefined if there is no GPOS table (and we should use the kern table)
	 */
	Position.prototype.getKerningTables = function(script, language) {
	    if (this.font.tables.gpos) {
	        return this.getLookupTables(script, language, 'kern', 2);
	    }
	};

	// The Substitution object provides utility methods to manipulate

	/**
	 * @exports opentype.Substitution
	 * @class
	 * @extends opentype.Layout
	 * @param {opentype.Font}
	 * @constructor
	 */
	function Substitution(font) {
	    Layout.call(this, font, 'gsub');
	}

	// Check if 2 arrays of primitives are equal.
	function arraysEqual(ar1, ar2) {
	    var n = ar1.length;
	    if (n !== ar2.length) { return false; }
	    for (var i = 0; i < n; i++) {
	        if (ar1[i] !== ar2[i]) { return false; }
	    }
	    return true;
	}

	// Find the first subtable of a lookup table in a particular format.
	function getSubstFormat(lookupTable, format, defaultSubtable) {
	    var subtables = lookupTable.subtables;
	    for (var i = 0; i < subtables.length; i++) {
	        var subtable = subtables[i];
	        if (subtable.substFormat === format) {
	            return subtable;
	        }
	    }
	    if (defaultSubtable) {
	        subtables.push(defaultSubtable);
	        return defaultSubtable;
	    }
	    return undefined;
	}

	Substitution.prototype = Layout.prototype;

	/**
	 * Create a default GSUB table.
	 * @return {Object} gsub - The GSUB table.
	 */
	Substitution.prototype.createDefaultTable = function() {
	    // Generate a default empty GSUB table with just a DFLT script and dflt lang sys.
	    return {
	        version: 1,
	        scripts: [{
	            tag: 'DFLT',
	            script: {
	                defaultLangSys: { reserved: 0, reqFeatureIndex: 0xffff, featureIndexes: [] },
	                langSysRecords: []
	            }
	        }],
	        features: [],
	        lookups: []
	    };
	};

	/**
	 * List all single substitutions (lookup type 1) for a given script, language, and feature.
	 * @param {string} [script='DFLT']
	 * @param {string} [language='dflt']
	 * @param {string} feature - 4-character feature name ('aalt', 'salt', 'ss01'...)
	 * @return {Array} substitutions - The list of substitutions.
	 */
	Substitution.prototype.getSingle = function(feature, script, language) {
	    var substitutions = [];
	    var lookupTables = this.getLookupTables(script, language, feature, 1);
	    for (var idx = 0; idx < lookupTables.length; idx++) {
	        var subtables = lookupTables[idx].subtables;
	        for (var i = 0; i < subtables.length; i++) {
	            var subtable = subtables[i];
	            var glyphs = this.expandCoverage(subtable.coverage);
	            var j = (void 0);
	            if (subtable.substFormat === 1) {
	                var delta = subtable.deltaGlyphId;
	                for (j = 0; j < glyphs.length; j++) {
	                    var glyph = glyphs[j];
	                    substitutions.push({ sub: glyph, by: glyph + delta });
	                }
	            } else {
	                var substitute = subtable.substitute;
	                for (j = 0; j < glyphs.length; j++) {
	                    substitutions.push({ sub: glyphs[j], by: substitute[j] });
	                }
	            }
	        }
	    }
	    return substitutions;
	};

	/**
	 * List all multiple substitutions (lookup type 2) for a given script, language, and feature.
	 * @param {string} [script='DFLT']
	 * @param {string} [language='dflt']
	 * @param {string} feature - 4-character feature name ('ccmp', 'stch')
	 * @return {Array} substitutions - The list of substitutions.
	 */
	Substitution.prototype.getMultiple = function(feature, script, language) {
	    var substitutions = [];
	    var lookupTables = this.getLookupTables(script, language, feature, 2);
	    for (var idx = 0; idx < lookupTables.length; idx++) {
	        var subtables = lookupTables[idx].subtables;
	        for (var i = 0; i < subtables.length; i++) {
	            var subtable = subtables[i];
	            var glyphs = this.expandCoverage(subtable.coverage);
	            var j = (void 0);

	            for (j = 0; j < glyphs.length; j++) {
	                var glyph = glyphs[j];
	                var replacements = subtable.sequences[j];
	                substitutions.push({ sub: glyph, by: replacements });
	            }
	        }
	    }
	    return substitutions;
	};

	/**
	 * List all alternates (lookup type 3) for a given script, language, and feature.
	 * @param {string} [script='DFLT']
	 * @param {string} [language='dflt']
	 * @param {string} feature - 4-character feature name ('aalt', 'salt'...)
	 * @return {Array} alternates - The list of alternates
	 */
	Substitution.prototype.getAlternates = function(feature, script, language) {
	    var alternates = [];
	    var lookupTables = this.getLookupTables(script, language, feature, 3);
	    for (var idx = 0; idx < lookupTables.length; idx++) {
	        var subtables = lookupTables[idx].subtables;
	        for (var i = 0; i < subtables.length; i++) {
	            var subtable = subtables[i];
	            var glyphs = this.expandCoverage(subtable.coverage);
	            var alternateSets = subtable.alternateSets;
	            for (var j = 0; j < glyphs.length; j++) {
	                alternates.push({ sub: glyphs[j], by: alternateSets[j] });
	            }
	        }
	    }
	    return alternates;
	};

	/**
	 * List all ligatures (lookup type 4) for a given script, language, and feature.
	 * The result is an array of ligature objects like { sub: [ids], by: id }
	 * @param {string} feature - 4-letter feature name ('liga', 'rlig', 'dlig'...)
	 * @param {string} [script='DFLT']
	 * @param {string} [language='dflt']
	 * @return {Array} ligatures - The list of ligatures.
	 */
	Substitution.prototype.getLigatures = function(feature, script, language) {
	    var ligatures = [];
	    var lookupTables = this.getLookupTables(script, language, feature, 4);
	    for (var idx = 0; idx < lookupTables.length; idx++) {
	        var subtables = lookupTables[idx].subtables;
	        for (var i = 0; i < subtables.length; i++) {
	            var subtable = subtables[i];
	            var glyphs = this.expandCoverage(subtable.coverage);
	            var ligatureSets = subtable.ligatureSets;
	            for (var j = 0; j < glyphs.length; j++) {
	                var startGlyph = glyphs[j];
	                var ligSet = ligatureSets[j];
	                for (var k = 0; k < ligSet.length; k++) {
	                    var lig = ligSet[k];
	                    ligatures.push({
	                        sub: [startGlyph].concat(lig.components),
	                        by: lig.ligGlyph
	                    });
	                }
	            }
	        }
	    }
	    return ligatures;
	};

	/**
	 * Add or modify a single substitution (lookup type 1)
	 * Format 2, more flexible, is always used.
	 * @param {string} feature - 4-letter feature name ('liga', 'rlig', 'dlig'...)
	 * @param {Object} substitution - { sub: id, by: id } (format 1 is not supported)
	 * @param {string} [script='DFLT']
	 * @param {string} [language='dflt']
	 */
	Substitution.prototype.addSingle = function(feature, substitution, script, language) {
	    var lookupTable = this.getLookupTables(script, language, feature, 1, true)[0];
	    var subtable = getSubstFormat(lookupTable, 2, {                // lookup type 1 subtable, format 2, coverage format 1
	        substFormat: 2,
	        coverage: {format: 1, glyphs: []},
	        substitute: []
	    });
	    check.assert(subtable.coverage.format === 1, 'Single: unable to modify coverage table format ' + subtable.coverage.format);
	    var coverageGlyph = substitution.sub;
	    var pos = this.binSearch(subtable.coverage.glyphs, coverageGlyph);
	    if (pos < 0) {
	        pos = -1 - pos;
	        subtable.coverage.glyphs.splice(pos, 0, coverageGlyph);
	        subtable.substitute.splice(pos, 0, 0);
	    }
	    subtable.substitute[pos] = substitution.by;
	};

	/**
	 * Add or modify a multiple substitution (lookup type 2)
	 * @param {string} feature - 4-letter feature name ('ccmp', 'stch')
	 * @param {Object} substitution - { sub: id, by: [id] } for format 2.
	 * @param {string} [script='DFLT']
	 * @param {string} [language='dflt']
	 */
	Substitution.prototype.addMultiple = function(feature, substitution, script, language) {
	    check.assert(substitution.by instanceof Array && substitution.by.length > 1, 'Multiple: "by" must be an array of two or more ids');
	    var lookupTable = this.getLookupTables(script, language, feature, 2, true)[0];
	    var subtable = getSubstFormat(lookupTable, 1, {                // lookup type 2 subtable, format 1, coverage format 1
	        substFormat: 1,
	        coverage: {format: 1, glyphs: []},
	        sequences: []
	    });
	    check.assert(subtable.coverage.format === 1, 'Multiple: unable to modify coverage table format ' + subtable.coverage.format);
	    var coverageGlyph = substitution.sub;
	    var pos = this.binSearch(subtable.coverage.glyphs, coverageGlyph);
	    if (pos < 0) {
	        pos = -1 - pos;
	        subtable.coverage.glyphs.splice(pos, 0, coverageGlyph);
	        subtable.sequences.splice(pos, 0, 0);
	    }
	    subtable.sequences[pos] = substitution.by;
	};

	/**
	 * Add or modify an alternate substitution (lookup type 3)
	 * @param {string} feature - 4-letter feature name ('liga', 'rlig', 'dlig'...)
	 * @param {Object} substitution - { sub: id, by: [ids] }
	 * @param {string} [script='DFLT']
	 * @param {string} [language='dflt']
	 */
	Substitution.prototype.addAlternate = function(feature, substitution, script, language) {
	    var lookupTable = this.getLookupTables(script, language, feature, 3, true)[0];
	    var subtable = getSubstFormat(lookupTable, 1, {                // lookup type 3 subtable, format 1, coverage format 1
	        substFormat: 1,
	        coverage: {format: 1, glyphs: []},
	        alternateSets: []
	    });
	    check.assert(subtable.coverage.format === 1, 'Alternate: unable to modify coverage table format ' + subtable.coverage.format);
	    var coverageGlyph = substitution.sub;
	    var pos = this.binSearch(subtable.coverage.glyphs, coverageGlyph);
	    if (pos < 0) {
	        pos = -1 - pos;
	        subtable.coverage.glyphs.splice(pos, 0, coverageGlyph);
	        subtable.alternateSets.splice(pos, 0, 0);
	    }
	    subtable.alternateSets[pos] = substitution.by;
	};

	/**
	 * Add a ligature (lookup type 4)
	 * Ligatures with more components must be stored ahead of those with fewer components in order to be found
	 * @param {string} feature - 4-letter feature name ('liga', 'rlig', 'dlig'...)
	 * @param {Object} ligature - { sub: [ids], by: id }
	 * @param {string} [script='DFLT']
	 * @param {string} [language='dflt']
	 */
	Substitution.prototype.addLigature = function(feature, ligature, script, language) {
	    var lookupTable = this.getLookupTables(script, language, feature, 4, true)[0];
	    var subtable = lookupTable.subtables[0];
	    if (!subtable) {
	        subtable = {                // lookup type 4 subtable, format 1, coverage format 1
	            substFormat: 1,
	            coverage: { format: 1, glyphs: [] },
	            ligatureSets: []
	        };
	        lookupTable.subtables[0] = subtable;
	    }
	    check.assert(subtable.coverage.format === 1, 'Ligature: unable to modify coverage table format ' + subtable.coverage.format);
	    var coverageGlyph = ligature.sub[0];
	    var ligComponents = ligature.sub.slice(1);
	    var ligatureTable = {
	        ligGlyph: ligature.by,
	        components: ligComponents
	    };
	    var pos = this.binSearch(subtable.coverage.glyphs, coverageGlyph);
	    if (pos >= 0) {
	        // ligatureSet already exists
	        var ligatureSet = subtable.ligatureSets[pos];
	        for (var i = 0; i < ligatureSet.length; i++) {
	            // If ligature already exists, return.
	            if (arraysEqual(ligatureSet[i].components, ligComponents)) {
	                return;
	            }
	        }
	        // ligature does not exist: add it.
	        ligatureSet.push(ligatureTable);
	    } else {
	        // Create a new ligatureSet and add coverage for the first glyph.
	        pos = -1 - pos;
	        subtable.coverage.glyphs.splice(pos, 0, coverageGlyph);
	        subtable.ligatureSets.splice(pos, 0, [ligatureTable]);
	    }
	};

	/**
	 * List all feature data for a given script and language.
	 * @param {string} feature - 4-letter feature name
	 * @param {string} [script='DFLT']
	 * @param {string} [language='dflt']
	 * @return {Array} substitutions - The list of substitutions.
	 */
	Substitution.prototype.getFeature = function(feature, script, language) {
	    if (/ss\d\d/.test(feature)) {
	        // ss01 - ss20
	        return this.getSingle(feature, script, language);
	    }
	    switch (feature) {
	        case 'aalt':
	        case 'salt':
	            return this.getSingle(feature, script, language)
	                    .concat(this.getAlternates(feature, script, language));
	        case 'dlig':
	        case 'liga':
	        case 'rlig':
	            return this.getLigatures(feature, script, language);
	        case 'ccmp':
	            return this.getMultiple(feature, script, language)
	                .concat(this.getLigatures(feature, script, language));
	        case 'stch':
	            return this.getMultiple(feature, script, language);
	    }
	    return undefined;
	};

	/**
	 * Add a substitution to a feature for a given script and language.
	 * @param {string} feature - 4-letter feature name
	 * @param {Object} sub - the substitution to add (an object like { sub: id or [ids], by: id or [ids] })
	 * @param {string} [script='DFLT']
	 * @param {string} [language='dflt']
	 */
	Substitution.prototype.add = function(feature, sub, script, language) {
	    if (/ss\d\d/.test(feature)) {
	        // ss01 - ss20
	        return this.addSingle(feature, sub, script, language);
	    }
	    switch (feature) {
	        case 'aalt':
	        case 'salt':
	            if (typeof sub.by === 'number') {
	                return this.addSingle(feature, sub, script, language);
	            }
	            return this.addAlternate(feature, sub, script, language);
	        case 'dlig':
	        case 'liga':
	        case 'rlig':
	            return this.addLigature(feature, sub, script, language);
	        case 'ccmp':
	            if (sub.by instanceof Array) {
	                return this.addMultiple(feature, sub, script, language);
	            }
	            return this.addLigature(feature, sub, script, language);
	    }
	    return undefined;
	};

	function isBrowser() {
	    return typeof window !== 'undefined';
	}

	function nodeBufferToArrayBuffer(buffer) {
	    var ab = new ArrayBuffer(buffer.length);
	    var view = new Uint8Array(ab);
	    for (var i = 0; i < buffer.length; ++i) {
	        view[i] = buffer[i];
	    }

	    return ab;
	}

	function arrayBufferToNodeBuffer(ab) {
	    var buffer = new Buffer(ab.byteLength);
	    var view = new Uint8Array(ab);
	    for (var i = 0; i < buffer.length; ++i) {
	        buffer[i] = view[i];
	    }

	    return buffer;
	}

	function checkArgument(expression, message) {
	    if (!expression) {
	        throw message;
	    }
	}

	// The `glyf` table describes the glyphs in TrueType outline format.

	// Parse the coordinate data for a glyph.
	function parseGlyphCoordinate(p, flag, previousValue, shortVectorBitMask, sameBitMask) {
	    var v;
	    if ((flag & shortVectorBitMask) > 0) {
	        // The coordinate is 1 byte long.
	        v = p.parseByte();
	        // The `same` bit is re-used for short values to signify the sign of the value.
	        if ((flag & sameBitMask) === 0) {
	            v = -v;
	        }

	        v = previousValue + v;
	    } else {
	        //  The coordinate is 2 bytes long.
	        // If the `same` bit is set, the coordinate is the same as the previous coordinate.
	        if ((flag & sameBitMask) > 0) {
	            v = previousValue;
	        } else {
	            // Parse the coordinate as a signed 16-bit delta value.
	            v = previousValue + p.parseShort();
	        }
	    }

	    return v;
	}

	// Parse a TrueType glyph.
	function parseGlyph(glyph, data, start) {
	    var p = new parse.Parser(data, start);
	    glyph.numberOfContours = p.parseShort();
	    glyph._xMin = p.parseShort();
	    glyph._yMin = p.parseShort();
	    glyph._xMax = p.parseShort();
	    glyph._yMax = p.parseShort();
	    var flags;
	    var flag;

	    if (glyph.numberOfContours > 0) {
	        // This glyph is not a composite.
	        var endPointIndices = glyph.endPointIndices = [];
	        for (var i = 0; i < glyph.numberOfContours; i += 1) {
	            endPointIndices.push(p.parseUShort());
	        }

	        glyph.instructionLength = p.parseUShort();
	        glyph.instructions = [];
	        for (var i$1 = 0; i$1 < glyph.instructionLength; i$1 += 1) {
	            glyph.instructions.push(p.parseByte());
	        }

	        var numberOfCoordinates = endPointIndices[endPointIndices.length - 1] + 1;
	        flags = [];
	        for (var i$2 = 0; i$2 < numberOfCoordinates; i$2 += 1) {
	            flag = p.parseByte();
	            flags.push(flag);
	            // If bit 3 is set, we repeat this flag n times, where n is the next byte.
	            if ((flag & 8) > 0) {
	                var repeatCount = p.parseByte();
	                for (var j = 0; j < repeatCount; j += 1) {
	                    flags.push(flag);
	                    i$2 += 1;
	                }
	            }
	        }

	        check.argument(flags.length === numberOfCoordinates, 'Bad flags.');

	        if (endPointIndices.length > 0) {
	            var points = [];
	            var point;
	            // X/Y coordinates are relative to the previous point, except for the first point which is relative to 0,0.
	            if (numberOfCoordinates > 0) {
	                for (var i$3 = 0; i$3 < numberOfCoordinates; i$3 += 1) {
	                    flag = flags[i$3];
	                    point = {};
	                    point.onCurve = !!(flag & 1);
	                    point.lastPointOfContour = endPointIndices.indexOf(i$3) >= 0;
	                    points.push(point);
	                }

	                var px = 0;
	                for (var i$4 = 0; i$4 < numberOfCoordinates; i$4 += 1) {
	                    flag = flags[i$4];
	                    point = points[i$4];
	                    point.x = parseGlyphCoordinate(p, flag, px, 2, 16);
	                    px = point.x;
	                }

	                var py = 0;
	                for (var i$5 = 0; i$5 < numberOfCoordinates; i$5 += 1) {
	                    flag = flags[i$5];
	                    point = points[i$5];
	                    point.y = parseGlyphCoordinate(p, flag, py, 4, 32);
	                    py = point.y;
	                }
	            }

	            glyph.points = points;
	        } else {
	            glyph.points = [];
	        }
	    } else if (glyph.numberOfContours === 0) {
	        glyph.points = [];
	    } else {
	        glyph.isComposite = true;
	        glyph.points = [];
	        glyph.components = [];
	        var moreComponents = true;
	        while (moreComponents) {
	            flags = p.parseUShort();
	            var component = {
	                glyphIndex: p.parseUShort(),
	                xScale: 1,
	                scale01: 0,
	                scale10: 0,
	                yScale: 1,
	                dx: 0,
	                dy: 0
	            };
	            if ((flags & 1) > 0) {
	                // The arguments are words
	                if ((flags & 2) > 0) {
	                    // values are offset
	                    component.dx = p.parseShort();
	                    component.dy = p.parseShort();
	                } else {
	                    // values are matched points
	                    component.matchedPoints = [p.parseUShort(), p.parseUShort()];
	                }

	            } else {
	                // The arguments are bytes
	                if ((flags & 2) > 0) {
	                    // values are offset
	                    component.dx = p.parseChar();
	                    component.dy = p.parseChar();
	                } else {
	                    // values are matched points
	                    component.matchedPoints = [p.parseByte(), p.parseByte()];
	                }
	            }

	            if ((flags & 8) > 0) {
	                // We have a scale
	                component.xScale = component.yScale = p.parseF2Dot14();
	            } else if ((flags & 64) > 0) {
	                // We have an X / Y scale
	                component.xScale = p.parseF2Dot14();
	                component.yScale = p.parseF2Dot14();
	            } else if ((flags & 128) > 0) {
	                // We have a 2x2 transformation
	                component.xScale = p.parseF2Dot14();
	                component.scale01 = p.parseF2Dot14();
	                component.scale10 = p.parseF2Dot14();
	                component.yScale = p.parseF2Dot14();
	            }

	            glyph.components.push(component);
	            moreComponents = !!(flags & 32);
	        }
	        if (flags & 0x100) {
	            // We have instructions
	            glyph.instructionLength = p.parseUShort();
	            glyph.instructions = [];
	            for (var i$6 = 0; i$6 < glyph.instructionLength; i$6 += 1) {
	                glyph.instructions.push(p.parseByte());
	            }
	        }
	    }
	}

	// Transform an array of points and return a new array.
	function transformPoints(points, transform) {
	    var newPoints = [];
	    for (var i = 0; i < points.length; i += 1) {
	        var pt = points[i];
	        var newPt = {
	            x: transform.xScale * pt.x + transform.scale01 * pt.y + transform.dx,
	            y: transform.scale10 * pt.x + transform.yScale * pt.y + transform.dy,
	            onCurve: pt.onCurve,
	            lastPointOfContour: pt.lastPointOfContour
	        };
	        newPoints.push(newPt);
	    }

	    return newPoints;
	}

	function getContours(points) {
	    var contours = [];
	    var currentContour = [];
	    for (var i = 0; i < points.length; i += 1) {
	        var pt = points[i];
	        currentContour.push(pt);
	        if (pt.lastPointOfContour) {
	            contours.push(currentContour);
	            currentContour = [];
	        }
	    }

	    check.argument(currentContour.length === 0, 'There are still points left in the current contour.');
	    return contours;
	}

	// Convert the TrueType glyph outline to a Path.
	function getPath(points) {
	    var p = new Path();
	    if (!points) {
	        return p;
	    }

	    var contours = getContours(points);

	    for (var contourIndex = 0; contourIndex < contours.length; ++contourIndex) {
	        var contour = contours[contourIndex];

	        var prev = null;
	        var curr = contour[contour.length - 1];
	        var next = contour[0];

	        if (curr.onCurve) {
	            p.moveTo(curr.x, curr.y);
	        } else {
	            if (next.onCurve) {
	                p.moveTo(next.x, next.y);
	            } else {
	                // If both first and last points are off-curve, start at their middle.
	                var start = {x: (curr.x + next.x) * 0.5, y: (curr.y + next.y) * 0.5};
	                p.moveTo(start.x, start.y);
	            }
	        }

	        for (var i = 0; i < contour.length; ++i) {
	            prev = curr;
	            curr = next;
	            next = contour[(i + 1) % contour.length];

	            if (curr.onCurve) {
	                // This is a straight line.
	                p.lineTo(curr.x, curr.y);
	            } else {
	                var prev2 = prev;
	                var next2 = next;

	                if (!prev.onCurve) {
	                    prev2 = { x: (curr.x + prev.x) * 0.5, y: (curr.y + prev.y) * 0.5 };
	                }

	                if (!next.onCurve) {
	                    next2 = { x: (curr.x + next.x) * 0.5, y: (curr.y + next.y) * 0.5 };
	                }

	                p.quadraticCurveTo(curr.x, curr.y, next2.x, next2.y);
	            }
	        }

	        p.closePath();
	    }
	    return p;
	}

	function buildPath(glyphs, glyph) {
	    if (glyph.isComposite) {
	        for (var j = 0; j < glyph.components.length; j += 1) {
	            var component = glyph.components[j];
	            var componentGlyph = glyphs.get(component.glyphIndex);
	            // Force the ttfGlyphLoader to parse the glyph.
	            componentGlyph.getPath();
	            if (componentGlyph.points) {
	                var transformedPoints = (void 0);
	                if (component.matchedPoints === undefined) {
	                    // component positioned by offset
	                    transformedPoints = transformPoints(componentGlyph.points, component);
	                } else {
	                    // component positioned by matched points
	                    if ((component.matchedPoints[0] > glyph.points.length - 1) ||
	                        (component.matchedPoints[1] > componentGlyph.points.length - 1)) {
	                        throw Error('Matched points out of range in ' + glyph.name);
	                    }
	                    var firstPt = glyph.points[component.matchedPoints[0]];
	                    var secondPt = componentGlyph.points[component.matchedPoints[1]];
	                    var transform = {
	                        xScale: component.xScale, scale01: component.scale01,
	                        scale10: component.scale10, yScale: component.yScale,
	                        dx: 0, dy: 0
	                    };
	                    secondPt = transformPoints([secondPt], transform)[0];
	                    transform.dx = firstPt.x - secondPt.x;
	                    transform.dy = firstPt.y - secondPt.y;
	                    transformedPoints = transformPoints(componentGlyph.points, transform);
	                }
	                glyph.points = glyph.points.concat(transformedPoints);
	            }
	        }
	    }

	    return getPath(glyph.points);
	}

	function parseGlyfTableAll(data, start, loca, font) {
	    var glyphs = new glyphset.GlyphSet(font);

	    // The last element of the loca table is invalid.
	    for (var i = 0; i < loca.length - 1; i += 1) {
	        var offset = loca[i];
	        var nextOffset = loca[i + 1];
	        if (offset !== nextOffset) {
	            glyphs.push(i, glyphset.ttfGlyphLoader(font, i, parseGlyph, data, start + offset, buildPath));
	        } else {
	            glyphs.push(i, glyphset.glyphLoader(font, i));
	        }
	    }

	    return glyphs;
	}

	function parseGlyfTableOnLowMemory(data, start, loca, font) {
	    var glyphs = new glyphset.GlyphSet(font);

	    font._push = function(i) {
	        var offset = loca[i];
	        var nextOffset = loca[i + 1];
	        if (offset !== nextOffset) {
	            glyphs.push(i, glyphset.ttfGlyphLoader(font, i, parseGlyph, data, start + offset, buildPath));
	        } else {
	            glyphs.push(i, glyphset.glyphLoader(font, i));
	        }
	    };

	    return glyphs;
	}

	// Parse all the glyphs according to the offsets from the `loca` table.
	function parseGlyfTable(data, start, loca, font, opt) {
	    if (opt.lowMemory)
	        { return parseGlyfTableOnLowMemory(data, start, loca, font); }
	    else
	        { return parseGlyfTableAll(data, start, loca, font); }
	}

	var glyf = { getPath: getPath, parse: parseGlyfTable};

	/* A TrueType font hinting interpreter.
	*
	* (c) 2017 Axel Kittenberger
	*
	* This interpreter has been implemented according to this documentation:
	* https://developer.apple.com/fonts/TrueType-Reference-Manual/RM05/Chap5.html
	*
	* According to the documentation F24DOT6 values are used for pixels.
	* That means calculation is 1/64 pixel accurate and uses integer operations.
	* However, Javascript has floating point operations by default and only
	* those are available. One could make a case to simulate the 1/64 accuracy
	* exactly by truncating after every division operation
	* (for example with << 0) to get pixel exactly results as other TrueType
	* implementations. It may make sense since some fonts are pixel optimized
	* by hand using DELTAP instructions. The current implementation doesn't
	* and rather uses full floating point precision.
	*
	* xScale, yScale and rotation is currently ignored.
	*
	* A few non-trivial instructions are missing as I didn't encounter yet
	* a font that used them to test a possible implementation.
	*
	* Some fonts seem to use undocumented features regarding the twilight zone.
	* Only some of them are implemented as they were encountered.
	*
	* The exports.DEBUG statements are removed on the minified distribution file.
	*/

	var instructionTable;
	var exec;
	var execGlyph;
	var execComponent;

	/*
	* Creates a hinting object.
	*
	* There ought to be exactly one
	* for each truetype font that is used for hinting.
	*/
	function Hinting(font) {
	    // the font this hinting object is for
	    this.font = font;

	    this.getCommands = function (hPoints) {
	        return glyf.getPath(hPoints).commands;
	    };

	    // cached states
	    this._fpgmState  =
	    this._prepState  =
	        undefined;

	    // errorState
	    // 0 ... all okay
	    // 1 ... had an error in a glyf,
	    //       continue working but stop spamming
	    //       the console
	    // 2 ... error at prep, stop hinting at this ppem
	    // 3 ... error at fpeg, stop hinting for this font at all
	    this._errorState = 0;
	}

	/*
	* Not rounding.
	*/
	function roundOff(v) {
	    return v;
	}

	/*
	* Rounding to grid.
	*/
	function roundToGrid(v) {
	    //Rounding in TT is supposed to "symmetrical around zero"
	    return Math.sign(v) * Math.round(Math.abs(v));
	}

	/*
	* Rounding to double grid.
	*/
	function roundToDoubleGrid(v) {
	    return Math.sign(v) * Math.round(Math.abs(v * 2)) / 2;
	}

	/*
	* Rounding to half grid.
	*/
	function roundToHalfGrid(v) {
	    return Math.sign(v) * (Math.round(Math.abs(v) + 0.5) - 0.5);
	}

	/*
	* Rounding to up to grid.
	*/
	function roundUpToGrid(v) {
	    return Math.sign(v) * Math.ceil(Math.abs(v));
	}

	/*
	* Rounding to down to grid.
	*/
	function roundDownToGrid(v) {
	    return Math.sign(v) * Math.floor(Math.abs(v));
	}

	/*
	* Super rounding.
	*/
	var roundSuper = function (v) {
	    var period = this.srPeriod;
	    var phase = this.srPhase;
	    var threshold = this.srThreshold;
	    var sign = 1;

	    if (v < 0) {
	        v = -v;
	        sign = -1;
	    }

	    v += threshold - phase;

	    v = Math.trunc(v / period) * period;

	    v += phase;

	    // according to http://xgridfit.sourceforge.net/round.html
	    if (v < 0) { return phase * sign; }

	    return v * sign;
	};

	/*
	* Unit vector of x-axis.
	*/
	var xUnitVector = {
	    x: 1,

	    y: 0,

	    axis: 'x',

	    // Gets the projected distance between two points.
	    // o1/o2 ... if true, respective original position is used.
	    distance: function (p1, p2, o1, o2) {
	        return (o1 ? p1.xo : p1.x) - (o2 ? p2.xo : p2.x);
	    },

	    // Moves point p so the moved position has the same relative
	    // position to the moved positions of rp1 and rp2 than the
	    // original positions had.
	    //
	    // See APPENDIX on INTERPOLATE at the bottom of this file.
	    interpolate: function (p, rp1, rp2, pv) {
	        var do1;
	        var do2;
	        var doa1;
	        var doa2;
	        var dm1;
	        var dm2;
	        var dt;

	        if (!pv || pv === this) {
	            do1 = p.xo - rp1.xo;
	            do2 = p.xo - rp2.xo;
	            dm1 = rp1.x - rp1.xo;
	            dm2 = rp2.x - rp2.xo;
	            doa1 = Math.abs(do1);
	            doa2 = Math.abs(do2);
	            dt = doa1 + doa2;

	            if (dt === 0) {
	                p.x = p.xo + (dm1 + dm2) / 2;
	                return;
	            }

	            p.x = p.xo + (dm1 * doa2 + dm2 * doa1) / dt;
	            return;
	        }

	        do1 = pv.distance(p, rp1, true, true);
	        do2 = pv.distance(p, rp2, true, true);
	        dm1 = pv.distance(rp1, rp1, false, true);
	        dm2 = pv.distance(rp2, rp2, false, true);
	        doa1 = Math.abs(do1);
	        doa2 = Math.abs(do2);
	        dt = doa1 + doa2;

	        if (dt === 0) {
	            xUnitVector.setRelative(p, p, (dm1 + dm2) / 2, pv, true);
	            return;
	        }

	        xUnitVector.setRelative(p, p, (dm1 * doa2 + dm2 * doa1) / dt, pv, true);
	    },

	    // Slope of line normal to this
	    normalSlope: Number.NEGATIVE_INFINITY,

	    // Sets the point 'p' relative to point 'rp'
	    // by the distance 'd'.
	    //
	    // See APPENDIX on SETRELATIVE at the bottom of this file.
	    //
	    // p   ... point to set
	    // rp  ... reference point
	    // d   ... distance on projection vector
	    // pv  ... projection vector (undefined = this)
	    // org ... if true, uses the original position of rp as reference.
	    setRelative: function (p, rp, d, pv, org) {
	        if (!pv || pv === this) {
	            p.x = (org ? rp.xo : rp.x) + d;
	            return;
	        }

	        var rpx = org ? rp.xo : rp.x;
	        var rpy = org ? rp.yo : rp.y;
	        var rpdx = rpx + d * pv.x;
	        var rpdy = rpy + d * pv.y;

	        p.x = rpdx + (p.y - rpdy) / pv.normalSlope;
	    },

	    // Slope of vector line.
	    slope: 0,

	    // Touches the point p.
	    touch: function (p) {
	        p.xTouched = true;
	    },

	    // Tests if a point p is touched.
	    touched: function (p) {
	        return p.xTouched;
	    },

	    // Untouches the point p.
	    untouch: function (p) {
	        p.xTouched = false;
	    }
	};

	/*
	* Unit vector of y-axis.
	*/
	var yUnitVector = {
	    x: 0,

	    y: 1,

	    axis: 'y',

	    // Gets the projected distance between two points.
	    // o1/o2 ... if true, respective original position is used.
	    distance: function (p1, p2, o1, o2) {
	        return (o1 ? p1.yo : p1.y) - (o2 ? p2.yo : p2.y);
	    },

	    // Moves point p so the moved position has the same relative
	    // position to the moved positions of rp1 and rp2 than the
	    // original positions had.
	    //
	    // See APPENDIX on INTERPOLATE at the bottom of this file.
	    interpolate: function (p, rp1, rp2, pv) {
	        var do1;
	        var do2;
	        var doa1;
	        var doa2;
	        var dm1;
	        var dm2;
	        var dt;

	        if (!pv || pv === this) {
	            do1 = p.yo - rp1.yo;
	            do2 = p.yo - rp2.yo;
	            dm1 = rp1.y - rp1.yo;
	            dm2 = rp2.y - rp2.yo;
	            doa1 = Math.abs(do1);
	            doa2 = Math.abs(do2);
	            dt = doa1 + doa2;

	            if (dt === 0) {
	                p.y = p.yo + (dm1 + dm2) / 2;
	                return;
	            }

	            p.y = p.yo + (dm1 * doa2 + dm2 * doa1) / dt;
	            return;
	        }

	        do1 = pv.distance(p, rp1, true, true);
	        do2 = pv.distance(p, rp2, true, true);
	        dm1 = pv.distance(rp1, rp1, false, true);
	        dm2 = pv.distance(rp2, rp2, false, true);
	        doa1 = Math.abs(do1);
	        doa2 = Math.abs(do2);
	        dt = doa1 + doa2;

	        if (dt === 0) {
	            yUnitVector.setRelative(p, p, (dm1 + dm2) / 2, pv, true);
	            return;
	        }

	        yUnitVector.setRelative(p, p, (dm1 * doa2 + dm2 * doa1) / dt, pv, true);
	    },

	    // Slope of line normal to this.
	    normalSlope: 0,

	    // Sets the point 'p' relative to point 'rp'
	    // by the distance 'd'
	    //
	    // See APPENDIX on SETRELATIVE at the bottom of this file.
	    //
	    // p   ... point to set
	    // rp  ... reference point
	    // d   ... distance on projection vector
	    // pv  ... projection vector (undefined = this)
	    // org ... if true, uses the original position of rp as reference.
	    setRelative: function (p, rp, d, pv, org) {
	        if (!pv || pv === this) {
	            p.y = (org ? rp.yo : rp.y) + d;
	            return;
	        }

	        var rpx = org ? rp.xo : rp.x;
	        var rpy = org ? rp.yo : rp.y;
	        var rpdx = rpx + d * pv.x;
	        var rpdy = rpy + d * pv.y;

	        p.y = rpdy + pv.normalSlope * (p.x - rpdx);
	    },

	    // Slope of vector line.
	    slope: Number.POSITIVE_INFINITY,

	    // Touches the point p.
	    touch: function (p) {
	        p.yTouched = true;
	    },

	    // Tests if a point p is touched.
	    touched: function (p) {
	        return p.yTouched;
	    },

	    // Untouches the point p.
	    untouch: function (p) {
	        p.yTouched = false;
	    }
	};

	Object.freeze(xUnitVector);
	Object.freeze(yUnitVector);

	/*
	* Creates a unit vector that is not x- or y-axis.
	*/
	function UnitVector(x, y) {
	    this.x = x;
	    this.y = y;
	    this.axis = undefined;
	    this.slope = y / x;
	    this.normalSlope = -x / y;
	    Object.freeze(this);
	}

	/*
	* Gets the projected distance between two points.
	* o1/o2 ... if true, respective original position is used.
	*/
	UnitVector.prototype.distance = function(p1, p2, o1, o2) {
	    return (
	        this.x * xUnitVector.distance(p1, p2, o1, o2) +
	        this.y * yUnitVector.distance(p1, p2, o1, o2)
	    );
	};

	/*
	* Moves point p so the moved position has the same relative
	* position to the moved positions of rp1 and rp2 than the
	* original positions had.
	*
	* See APPENDIX on INTERPOLATE at the bottom of this file.
	*/
	UnitVector.prototype.interpolate = function(p, rp1, rp2, pv) {
	    var dm1;
	    var dm2;
	    var do1;
	    var do2;
	    var doa1;
	    var doa2;
	    var dt;

	    do1 = pv.distance(p, rp1, true, true);
	    do2 = pv.distance(p, rp2, true, true);
	    dm1 = pv.distance(rp1, rp1, false, true);
	    dm2 = pv.distance(rp2, rp2, false, true);
	    doa1 = Math.abs(do1);
	    doa2 = Math.abs(do2);
	    dt = doa1 + doa2;

	    if (dt === 0) {
	        this.setRelative(p, p, (dm1 + dm2) / 2, pv, true);
	        return;
	    }

	    this.setRelative(p, p, (dm1 * doa2 + dm2 * doa1) / dt, pv, true);
	};

	/*
	* Sets the point 'p' relative to point 'rp'
	* by the distance 'd'
	*
	* See APPENDIX on SETRELATIVE at the bottom of this file.
	*
	* p   ...  point to set
	* rp  ... reference point
	* d   ... distance on projection vector
	* pv  ... projection vector (undefined = this)
	* org ... if true, uses the original position of rp as reference.
	*/
	UnitVector.prototype.setRelative = function(p, rp, d, pv, org) {
	    pv = pv || this;

	    var rpx = org ? rp.xo : rp.x;
	    var rpy = org ? rp.yo : rp.y;
	    var rpdx = rpx + d * pv.x;
	    var rpdy = rpy + d * pv.y;

	    var pvns = pv.normalSlope;
	    var fvs = this.slope;

	    var px = p.x;
	    var py = p.y;

	    p.x = (fvs * px - pvns * rpdx + rpdy - py) / (fvs - pvns);
	    p.y = fvs * (p.x - px) + py;
	};

	/*
	* Touches the point p.
	*/
	UnitVector.prototype.touch = function(p) {
	    p.xTouched = true;
	    p.yTouched = true;
	};

	/*
	* Returns a unit vector with x/y coordinates.
	*/
	function getUnitVector(x, y) {
	    var d = Math.sqrt(x * x + y * y);

	    x /= d;
	    y /= d;

	    if (x === 1 && y === 0) { return xUnitVector; }
	    else if (x === 0 && y === 1) { return yUnitVector; }
	    else { return new UnitVector(x, y); }
	}

	/*
	* Creates a point in the hinting engine.
	*/
	function HPoint(
	    x,
	    y,
	    lastPointOfContour,
	    onCurve
	) {
	    this.x = this.xo = Math.round(x * 64) / 64; // hinted x value and original x-value
	    this.y = this.yo = Math.round(y * 64) / 64; // hinted y value and original y-value

	    this.lastPointOfContour = lastPointOfContour;
	    this.onCurve = onCurve;
	    this.prevPointOnContour = undefined;
	    this.nextPointOnContour = undefined;
	    this.xTouched = false;
	    this.yTouched = false;

	    Object.preventExtensions(this);
	}

	/*
	* Returns the next touched point on the contour.
	*
	* v  ... unit vector to test touch axis.
	*/
	HPoint.prototype.nextTouched = function(v) {
	    var p = this.nextPointOnContour;

	    while (!v.touched(p) && p !== this) { p = p.nextPointOnContour; }

	    return p;
	};

	/*
	* Returns the previous touched point on the contour
	*
	* v  ... unit vector to test touch axis.
	*/
	HPoint.prototype.prevTouched = function(v) {
	    var p = this.prevPointOnContour;

	    while (!v.touched(p) && p !== this) { p = p.prevPointOnContour; }

	    return p;
	};

	/*
	* The zero point.
	*/
	var HPZero = Object.freeze(new HPoint(0, 0));

	/*
	* The default state of the interpreter.
	*
	* Note: Freezing the defaultState and then deriving from it
	* makes the V8 Javascript engine going awkward,
	* so this is avoided, albeit the defaultState shouldn't
	* ever change.
	*/
	var defaultState = {
	    cvCutIn: 17 / 16,    // control value cut in
	    deltaBase: 9,
	    deltaShift: 0.125,
	    loop: 1,             // loops some instructions
	    minDis: 1,           // minimum distance
	    autoFlip: true
	};

	/*
	* The current state of the interpreter.
	*
	* env  ... 'fpgm' or 'prep' or 'glyf'
	* prog ... the program
	*/
	function State(env, prog) {
	    this.env = env;
	    this.stack = [];
	    this.prog = prog;

	    switch (env) {
	        case 'glyf' :
	            this.zp0 = this.zp1 = this.zp2 = 1;
	            this.rp0 = this.rp1 = this.rp2 = 0;
	            /* fall through */
	        case 'prep' :
	            this.fv = this.pv = this.dpv = xUnitVector;
	            this.round = roundToGrid;
	    }
	}

	/*
	* Executes a glyph program.
	*
	* This does the hinting for each glyph.
	*
	* Returns an array of moved points.
	*
	* glyph: the glyph to hint
	* ppem: the size the glyph is rendered for
	*/
	Hinting.prototype.exec = function(glyph, ppem) {
	    if (typeof ppem !== 'number') {
	        throw new Error('Point size is not a number!');
	    }

	    // Received a fatal error, don't do any hinting anymore.
	    if (this._errorState > 2) { return; }

	    var font = this.font;
	    var prepState = this._prepState;

	    if (!prepState || prepState.ppem !== ppem) {
	        var fpgmState = this._fpgmState;

	        if (!fpgmState) {
	            // Executes the fpgm state.
	            // This is used by fonts to define functions.
	            State.prototype = defaultState;

	            fpgmState =
	            this._fpgmState =
	                new State('fpgm', font.tables.fpgm);

	            fpgmState.funcs = [ ];
	            fpgmState.font = font;

	            if (exports.DEBUG) {
	                console.log('---EXEC FPGM---');
	                fpgmState.step = -1;
	            }

	            try {
	                exec(fpgmState);
	            } catch (e) {
	                console.log('Hinting error in FPGM:' + e);
	                this._errorState = 3;
	                return;
	            }
	        }

	        // Executes the prep program for this ppem setting.
	        // This is used by fonts to set cvt values
	        // depending on to be rendered font size.

	        State.prototype = fpgmState;
	        prepState =
	        this._prepState =
	            new State('prep', font.tables.prep);

	        prepState.ppem = ppem;

	        // Creates a copy of the cvt table
	        // and scales it to the current ppem setting.
	        var oCvt = font.tables.cvt;
	        if (oCvt) {
	            var cvt = prepState.cvt = new Array(oCvt.length);
	            var scale = ppem / font.unitsPerEm;
	            for (var c = 0; c < oCvt.length; c++) {
	                cvt[c] = oCvt[c] * scale;
	            }
	        } else {
	            prepState.cvt = [];
	        }

	        if (exports.DEBUG) {
	            console.log('---EXEC PREP---');
	            prepState.step = -1;
	        }

	        try {
	            exec(prepState);
	        } catch (e) {
	            if (this._errorState < 2) {
	                console.log('Hinting error in PREP:' + e);
	            }
	            this._errorState = 2;
	        }
	    }

	    if (this._errorState > 1) { return; }

	    try {
	        return execGlyph(glyph, prepState);
	    } catch (e) {
	        if (this._errorState < 1) {
	            console.log('Hinting error:' + e);
	            console.log('Note: further hinting errors are silenced');
	        }
	        this._errorState = 1;
	        return undefined;
	    }
	};

	/*
	* Executes the hinting program for a glyph.
	*/
	execGlyph = function(glyph, prepState) {
	    // original point positions
	    var xScale = prepState.ppem / prepState.font.unitsPerEm;
	    var yScale = xScale;
	    var components = glyph.components;
	    var contours;
	    var gZone;
	    var state;

	    State.prototype = prepState;
	    if (!components) {
	        state = new State('glyf', glyph.instructions);
	        if (exports.DEBUG) {
	            console.log('---EXEC GLYPH---');
	            state.step = -1;
	        }
	        execComponent(glyph, state, xScale, yScale);
	        gZone = state.gZone;
	    } else {
	        var font = prepState.font;
	        gZone = [];
	        contours = [];
	        for (var i = 0; i < components.length; i++) {
	            var c = components[i];
	            var cg = font.glyphs.get(c.glyphIndex);

	            state = new State('glyf', cg.instructions);

	            if (exports.DEBUG) {
	                console.log('---EXEC COMP ' + i + '---');
	                state.step = -1;
	            }

	            execComponent(cg, state, xScale, yScale);
	            // appends the computed points to the result array
	            // post processes the component points
	            var dx = Math.round(c.dx * xScale);
	            var dy = Math.round(c.dy * yScale);
	            var gz = state.gZone;
	            var cc = state.contours;
	            for (var pi = 0; pi < gz.length; pi++) {
	                var p = gz[pi];
	                p.xTouched = p.yTouched = false;
	                p.xo = p.x = p.x + dx;
	                p.yo = p.y = p.y + dy;
	            }

	            var gLen = gZone.length;
	            gZone.push.apply(gZone, gz);
	            for (var j = 0; j < cc.length; j++) {
	                contours.push(cc[j] + gLen);
	            }
	        }

	        if (glyph.instructions && !state.inhibitGridFit) {
	            // the composite has instructions on its own
	            state = new State('glyf', glyph.instructions);

	            state.gZone = state.z0 = state.z1 = state.z2 = gZone;

	            state.contours = contours;

	            // note: HPZero cannot be used here, since
	            //       the point might be modified
	            gZone.push(
	                new HPoint(0, 0),
	                new HPoint(Math.round(glyph.advanceWidth * xScale), 0)
	            );

	            if (exports.DEBUG) {
	                console.log('---EXEC COMPOSITE---');
	                state.step = -1;
	            }

	            exec(state);

	            gZone.length -= 2;
	        }
	    }

	    return gZone;
	};

	/*
	* Executes the hinting program for a component of a multi-component glyph
	* or of the glyph itself for a non-component glyph.
	*/
	execComponent = function(glyph, state, xScale, yScale)
	{
	    var points = glyph.points || [];
	    var pLen = points.length;
	    var gZone = state.gZone = state.z0 = state.z1 = state.z2 = [];
	    var contours = state.contours = [];

	    // Scales the original points and
	    // makes copies for the hinted points.
	    var cp; // current point
	    for (var i = 0; i < pLen; i++) {
	        cp = points[i];

	        gZone[i] = new HPoint(
	            cp.x * xScale,
	            cp.y * yScale,
	            cp.lastPointOfContour,
	            cp.onCurve
	        );
	    }

	    // Chain links the contours.
	    var sp; // start point
	    var np; // next point

	    for (var i$1 = 0; i$1 < pLen; i$1++) {
	        cp = gZone[i$1];

	        if (!sp) {
	            sp = cp;
	            contours.push(i$1);
	        }

	        if (cp.lastPointOfContour) {
	            cp.nextPointOnContour = sp;
	            sp.prevPointOnContour = cp;
	            sp = undefined;
	        } else {
	            np = gZone[i$1 + 1];
	            cp.nextPointOnContour = np;
	            np.prevPointOnContour = cp;
	        }
	    }

	    if (state.inhibitGridFit) { return; }

	    if (exports.DEBUG) {
	        console.log('PROCESSING GLYPH', state.stack);
	        for (var i$2 = 0; i$2 < pLen; i$2++) {
	            console.log(i$2, gZone[i$2].x, gZone[i$2].y);
	        }
	    }

	    gZone.push(
	        new HPoint(0, 0),
	        new HPoint(Math.round(glyph.advanceWidth * xScale), 0)
	    );

	    exec(state);

	    // Removes the extra points.
	    gZone.length -= 2;

	    if (exports.DEBUG) {
	        console.log('FINISHED GLYPH', state.stack);
	        for (var i$3 = 0; i$3 < pLen; i$3++) {
	            console.log(i$3, gZone[i$3].x, gZone[i$3].y);
	        }
	    }
	};

	/*
	* Executes the program loaded in state.
	*/
	exec = function(state) {
	    var prog = state.prog;

	    if (!prog) { return; }

	    var pLen = prog.length;
	    var ins;

	    for (state.ip = 0; state.ip < pLen; state.ip++) {
	        if (exports.DEBUG) { state.step++; }
	        ins = instructionTable[prog[state.ip]];

	        if (!ins) {
	            throw new Error(
	                'unknown instruction: 0x' +
	                Number(prog[state.ip]).toString(16)
	            );
	        }

	        ins(state);

	        // very extensive debugging for each step
	        /*
	        if (exports.DEBUG) {
	            var da;
	            if (state.gZone) {
	                da = [];
	                for (let i = 0; i < state.gZone.length; i++)
	                {
	                    da.push(i + ' ' +
	                        state.gZone[i].x * 64 + ' ' +
	                        state.gZone[i].y * 64 + ' ' +
	                        (state.gZone[i].xTouched ? 'x' : '') +
	                        (state.gZone[i].yTouched ? 'y' : '')
	                    );
	                }
	                console.log('GZ', da);
	            }

	            if (state.tZone) {
	                da = [];
	                for (let i = 0; i < state.tZone.length; i++) {
	                    da.push(i + ' ' +
	                        state.tZone[i].x * 64 + ' ' +
	                        state.tZone[i].y * 64 + ' ' +
	                        (state.tZone[i].xTouched ? 'x' : '') +
	                        (state.tZone[i].yTouched ? 'y' : '')
	                    );
	                }
	                console.log('TZ', da);
	            }

	            if (state.stack.length > 10) {
	                console.log(
	                    state.stack.length,
	                    '...', state.stack.slice(state.stack.length - 10)
	                );
	            } else {
	                console.log(state.stack.length, state.stack);
	            }
	        }
	        */
	    }
	};

	/*
	* Initializes the twilight zone.
	*
	* This is only done if a SZPx instruction
	* refers to the twilight zone.
	*/
	function initTZone(state)
	{
	    var tZone = state.tZone = new Array(state.gZone.length);

	    // no idea if this is actually correct...
	    for (var i = 0; i < tZone.length; i++)
	    {
	        tZone[i] = new HPoint(0, 0);
	    }
	}

	/*
	* Skips the instruction pointer ahead over an IF/ELSE block.
	* handleElse .. if true breaks on matching ELSE
	*/
	function skip(state, handleElse)
	{
	    var prog = state.prog;
	    var ip = state.ip;
	    var nesting = 1;
	    var ins;

	    do {
	        ins = prog[++ip];
	        if (ins === 0x58) // IF
	            { nesting++; }
	        else if (ins === 0x59) // EIF
	            { nesting--; }
	        else if (ins === 0x40) // NPUSHB
	            { ip += prog[ip + 1] + 1; }
	        else if (ins === 0x41) // NPUSHW
	            { ip += 2 * prog[ip + 1] + 1; }
	        else if (ins >= 0xB0 && ins <= 0xB7) // PUSHB
	            { ip += ins - 0xB0 + 1; }
	        else if (ins >= 0xB8 && ins <= 0xBF) // PUSHW
	            { ip += (ins - 0xB8 + 1) * 2; }
	        else if (handleElse && nesting === 1 && ins === 0x1B) // ELSE
	            { break; }
	    } while (nesting > 0);

	    state.ip = ip;
	}

	/*----------------------------------------------------------*
	*          And then a lot of instructions...                *
	*----------------------------------------------------------*/

	// SVTCA[a] Set freedom and projection Vectors To Coordinate Axis
	// 0x00-0x01
	function SVTCA(v, state) {
	    if (exports.DEBUG) { console.log(state.step, 'SVTCA[' + v.axis + ']'); }

	    state.fv = state.pv = state.dpv = v;
	}

	// SPVTCA[a] Set Projection Vector to Coordinate Axis
	// 0x02-0x03
	function SPVTCA(v, state) {
	    if (exports.DEBUG) { console.log(state.step, 'SPVTCA[' + v.axis + ']'); }

	    state.pv = state.dpv = v;
	}

	// SFVTCA[a] Set Freedom Vector to Coordinate Axis
	// 0x04-0x05
	function SFVTCA(v, state) {
	    if (exports.DEBUG) { console.log(state.step, 'SFVTCA[' + v.axis + ']'); }

	    state.fv = v;
	}

	// SPVTL[a] Set Projection Vector To Line
	// 0x06-0x07
	function SPVTL(a, state) {
	    var stack = state.stack;
	    var p2i = stack.pop();
	    var p1i = stack.pop();
	    var p2 = state.z2[p2i];
	    var p1 = state.z1[p1i];

	    if (exports.DEBUG) { console.log('SPVTL[' + a + ']', p2i, p1i); }

	    var dx;
	    var dy;

	    if (!a) {
	        dx = p1.x - p2.x;
	        dy = p1.y - p2.y;
	    } else {
	        dx = p2.y - p1.y;
	        dy = p1.x - p2.x;
	    }

	    state.pv = state.dpv = getUnitVector(dx, dy);
	}

	// SFVTL[a] Set Freedom Vector To Line
	// 0x08-0x09
	function SFVTL(a, state) {
	    var stack = state.stack;
	    var p2i = stack.pop();
	    var p1i = stack.pop();
	    var p2 = state.z2[p2i];
	    var p1 = state.z1[p1i];

	    if (exports.DEBUG) { console.log('SFVTL[' + a + ']', p2i, p1i); }

	    var dx;
	    var dy;

	    if (!a) {
	        dx = p1.x - p2.x;
	        dy = p1.y - p2.y;
	    } else {
	        dx = p2.y - p1.y;
	        dy = p1.x - p2.x;
	    }

	    state.fv = getUnitVector(dx, dy);
	}

	// SPVFS[] Set Projection Vector From Stack
	// 0x0A
	function SPVFS(state) {
	    var stack = state.stack;
	    var y = stack.pop();
	    var x = stack.pop();

	    if (exports.DEBUG) { console.log(state.step, 'SPVFS[]', y, x); }

	    state.pv = state.dpv = getUnitVector(x, y);
	}

	// SFVFS[] Set Freedom Vector From Stack
	// 0x0B
	function SFVFS(state) {
	    var stack = state.stack;
	    var y = stack.pop();
	    var x = stack.pop();

	    if (exports.DEBUG) { console.log(state.step, 'SPVFS[]', y, x); }

	    state.fv = getUnitVector(x, y);
	}

	// GPV[] Get Projection Vector
	// 0x0C
	function GPV(state) {
	    var stack = state.stack;
	    var pv = state.pv;

	    if (exports.DEBUG) { console.log(state.step, 'GPV[]'); }

	    stack.push(pv.x * 0x4000);
	    stack.push(pv.y * 0x4000);
	}

	// GFV[] Get Freedom Vector
	// 0x0C
	function GFV(state) {
	    var stack = state.stack;
	    var fv = state.fv;

	    if (exports.DEBUG) { console.log(state.step, 'GFV[]'); }

	    stack.push(fv.x * 0x4000);
	    stack.push(fv.y * 0x4000);
	}

	// SFVTPV[] Set Freedom Vector To Projection Vector
	// 0x0E
	function SFVTPV(state) {
	    state.fv = state.pv;

	    if (exports.DEBUG) { console.log(state.step, 'SFVTPV[]'); }
	}

	// ISECT[] moves point p to the InterSECTion of two lines
	// 0x0F
	function ISECT(state)
	{
	    var stack = state.stack;
	    var pa0i = stack.pop();
	    var pa1i = stack.pop();
	    var pb0i = stack.pop();
	    var pb1i = stack.pop();
	    var pi = stack.pop();
	    var z0 = state.z0;
	    var z1 = state.z1;
	    var pa0 = z0[pa0i];
	    var pa1 = z0[pa1i];
	    var pb0 = z1[pb0i];
	    var pb1 = z1[pb1i];
	    var p = state.z2[pi];

	    if (exports.DEBUG) { console.log('ISECT[], ', pa0i, pa1i, pb0i, pb1i, pi); }

	    // math from
	    // en.wikipedia.org/wiki/Line%E2%80%93line_intersection#Given_two_points_on_each_line

	    var x1 = pa0.x;
	    var y1 = pa0.y;
	    var x2 = pa1.x;
	    var y2 = pa1.y;
	    var x3 = pb0.x;
	    var y3 = pb0.y;
	    var x4 = pb1.x;
	    var y4 = pb1.y;

	    var div = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
	    var f1 = x1 * y2 - y1 * x2;
	    var f2 = x3 * y4 - y3 * x4;

	    p.x = (f1 * (x3 - x4) - f2 * (x1 - x2)) / div;
	    p.y = (f1 * (y3 - y4) - f2 * (y1 - y2)) / div;
	}

	// SRP0[] Set Reference Point 0
	// 0x10
	function SRP0(state) {
	    state.rp0 = state.stack.pop();

	    if (exports.DEBUG) { console.log(state.step, 'SRP0[]', state.rp0); }
	}

	// SRP1[] Set Reference Point 1
	// 0x11
	function SRP1(state) {
	    state.rp1 = state.stack.pop();

	    if (exports.DEBUG) { console.log(state.step, 'SRP1[]', state.rp1); }
	}

	// SRP1[] Set Reference Point 2
	// 0x12
	function SRP2(state) {
	    state.rp2 = state.stack.pop();

	    if (exports.DEBUG) { console.log(state.step, 'SRP2[]', state.rp2); }
	}

	// SZP0[] Set Zone Pointer 0
	// 0x13
	function SZP0(state) {
	    var n = state.stack.pop();

	    if (exports.DEBUG) { console.log(state.step, 'SZP0[]', n); }

	    state.zp0 = n;

	    switch (n) {
	        case 0:
	            if (!state.tZone) { initTZone(state); }
	            state.z0 = state.tZone;
	            break;
	        case 1 :
	            state.z0 = state.gZone;
	            break;
	        default :
	            throw new Error('Invalid zone pointer');
	    }
	}

	// SZP1[] Set Zone Pointer 1
	// 0x14
	function SZP1(state) {
	    var n = state.stack.pop();

	    if (exports.DEBUG) { console.log(state.step, 'SZP1[]', n); }

	    state.zp1 = n;

	    switch (n) {
	        case 0:
	            if (!state.tZone) { initTZone(state); }
	            state.z1 = state.tZone;
	            break;
	        case 1 :
	            state.z1 = state.gZone;
	            break;
	        default :
	            throw new Error('Invalid zone pointer');
	    }
	}

	// SZP2[] Set Zone Pointer 2
	// 0x15
	function SZP2(state) {
	    var n = state.stack.pop();

	    if (exports.DEBUG) { console.log(state.step, 'SZP2[]', n); }

	    state.zp2 = n;

	    switch (n) {
	        case 0:
	            if (!state.tZone) { initTZone(state); }
	            state.z2 = state.tZone;
	            break;
	        case 1 :
	            state.z2 = state.gZone;
	            break;
	        default :
	            throw new Error('Invalid zone pointer');
	    }
	}

	// SZPS[] Set Zone PointerS
	// 0x16
	function SZPS(state) {
	    var n = state.stack.pop();

	    if (exports.DEBUG) { console.log(state.step, 'SZPS[]', n); }

	    state.zp0 = state.zp1 = state.zp2 = n;

	    switch (n) {
	        case 0:
	            if (!state.tZone) { initTZone(state); }
	            state.z0 = state.z1 = state.z2 = state.tZone;
	            break;
	        case 1 :
	            state.z0 = state.z1 = state.z2 = state.gZone;
	            break;
	        default :
	            throw new Error('Invalid zone pointer');
	    }
	}

	// SLOOP[] Set LOOP variable
	// 0x17
	function SLOOP(state) {
	    state.loop = state.stack.pop();

	    if (exports.DEBUG) { console.log(state.step, 'SLOOP[]', state.loop); }
	}

	// RTG[] Round To Grid
	// 0x18
	function RTG(state) {
	    if (exports.DEBUG) { console.log(state.step, 'RTG[]'); }

	    state.round = roundToGrid;
	}

	// RTHG[] Round To Half Grid
	// 0x19
	function RTHG(state) {
	    if (exports.DEBUG) { console.log(state.step, 'RTHG[]'); }

	    state.round = roundToHalfGrid;
	}

	// SMD[] Set Minimum Distance
	// 0x1A
	function SMD(state) {
	    var d = state.stack.pop();

	    if (exports.DEBUG) { console.log(state.step, 'SMD[]', d); }

	    state.minDis = d / 0x40;
	}

	// ELSE[] ELSE clause
	// 0x1B
	function ELSE(state) {
	    // This instruction has been reached by executing a then branch
	    // so it just skips ahead until matching EIF.
	    //
	    // In case the IF was negative the IF[] instruction already
	    // skipped forward over the ELSE[]

	    if (exports.DEBUG) { console.log(state.step, 'ELSE[]'); }

	    skip(state, false);
	}

	// JMPR[] JuMP Relative
	// 0x1C
	function JMPR(state) {
	    var o = state.stack.pop();

	    if (exports.DEBUG) { console.log(state.step, 'JMPR[]', o); }

	    // A jump by 1 would do nothing.
	    state.ip += o - 1;
	}

	// SCVTCI[] Set Control Value Table Cut-In
	// 0x1D
	function SCVTCI(state) {
	    var n = state.stack.pop();

	    if (exports.DEBUG) { console.log(state.step, 'SCVTCI[]', n); }

	    state.cvCutIn = n / 0x40;
	}

	// DUP[] DUPlicate top stack element
	// 0x20
	function DUP(state) {
	    var stack = state.stack;

	    if (exports.DEBUG) { console.log(state.step, 'DUP[]'); }

	    stack.push(stack[stack.length - 1]);
	}

	// POP[] POP top stack element
	// 0x21
	function POP(state) {
	    if (exports.DEBUG) { console.log(state.step, 'POP[]'); }

	    state.stack.pop();
	}

	// CLEAR[] CLEAR the stack
	// 0x22
	function CLEAR(state) {
	    if (exports.DEBUG) { console.log(state.step, 'CLEAR[]'); }

	    state.stack.length = 0;
	}

	// SWAP[] SWAP the top two elements on the stack
	// 0x23
	function SWAP(state) {
	    var stack = state.stack;

	    var a = stack.pop();
	    var b = stack.pop();

	    if (exports.DEBUG) { console.log(state.step, 'SWAP[]'); }

	    stack.push(a);
	    stack.push(b);
	}

	// DEPTH[] DEPTH of the stack
	// 0x24
	function DEPTH(state) {
	    var stack = state.stack;

	    if (exports.DEBUG) { console.log(state.step, 'DEPTH[]'); }

	    stack.push(stack.length);
	}

	// LOOPCALL[] LOOPCALL function
	// 0x2A
	function LOOPCALL(state) {
	    var stack = state.stack;
	    var fn = stack.pop();
	    var c = stack.pop();

	    if (exports.DEBUG) { console.log(state.step, 'LOOPCALL[]', fn, c); }

	    // saves callers program
	    var cip = state.ip;
	    var cprog = state.prog;

	    state.prog = state.funcs[fn];

	    // executes the function
	    for (var i = 0; i < c; i++) {
	        exec(state);

	        if (exports.DEBUG) { console.log(
	            ++state.step,
	            i + 1 < c ? 'next loopcall' : 'done loopcall',
	            i
	        ); }
	    }

	    // restores the callers program
	    state.ip = cip;
	    state.prog = cprog;
	}

	// CALL[] CALL function
	// 0x2B
	function CALL(state) {
	    var fn = state.stack.pop();

	    if (exports.DEBUG) { console.log(state.step, 'CALL[]', fn); }

	    // saves callers program
	    var cip = state.ip;
	    var cprog = state.prog;

	    state.prog = state.funcs[fn];

	    // executes the function
	    exec(state);

	    // restores the callers program
	    state.ip = cip;
	    state.prog = cprog;

	    if (exports.DEBUG) { console.log(++state.step, 'returning from', fn); }
	}

	// CINDEX[] Copy the INDEXed element to the top of the stack
	// 0x25
	function CINDEX(state) {
	    var stack = state.stack;
	    var k = stack.pop();

	    if (exports.DEBUG) { console.log(state.step, 'CINDEX[]', k); }

	    // In case of k == 1, it copies the last element after popping
	    // thus stack.length - k.
	    stack.push(stack[stack.length - k]);
	}

	// MINDEX[] Move the INDEXed element to the top of the stack
	// 0x26
	function MINDEX(state) {
	    var stack = state.stack;
	    var k = stack.pop();

	    if (exports.DEBUG) { console.log(state.step, 'MINDEX[]', k); }

	    stack.push(stack.splice(stack.length - k, 1)[0]);
	}

	// FDEF[] Function DEFinition
	// 0x2C
	function FDEF(state) {
	    if (state.env !== 'fpgm') { throw new Error('FDEF not allowed here'); }
	    var stack = state.stack;
	    var prog = state.prog;
	    var ip = state.ip;

	    var fn = stack.pop();
	    var ipBegin = ip;

	    if (exports.DEBUG) { console.log(state.step, 'FDEF[]', fn); }

	    while (prog[++ip] !== 0x2D){ }

	    state.ip = ip;
	    state.funcs[fn] = prog.slice(ipBegin + 1, ip);
	}

	// MDAP[a] Move Direct Absolute Point
	// 0x2E-0x2F
	function MDAP(round, state) {
	    var pi = state.stack.pop();
	    var p = state.z0[pi];
	    var fv = state.fv;
	    var pv = state.pv;

	    if (exports.DEBUG) { console.log(state.step, 'MDAP[' + round + ']', pi); }

	    var d = pv.distance(p, HPZero);

	    if (round) { d = state.round(d); }

	    fv.setRelative(p, HPZero, d, pv);
	    fv.touch(p);

	    state.rp0 = state.rp1 = pi;
	}

	// IUP[a] Interpolate Untouched Points through the outline
	// 0x30
	function IUP(v, state) {
	    var z2 = state.z2;
	    var pLen = z2.length - 2;
	    var cp;
	    var pp;
	    var np;

	    if (exports.DEBUG) { console.log(state.step, 'IUP[' + v.axis + ']'); }

	    for (var i = 0; i < pLen; i++) {
	        cp = z2[i]; // current point

	        // if this point has been touched go on
	        if (v.touched(cp)) { continue; }

	        pp = cp.prevTouched(v);

	        // no point on the contour has been touched?
	        if (pp === cp) { continue; }

	        np = cp.nextTouched(v);

	        if (pp === np) {
	            // only one point on the contour has been touched
	            // so simply moves the point like that

	            v.setRelative(cp, cp, v.distance(pp, pp, false, true), v, true);
	        }

	        v.interpolate(cp, pp, np, v);
	    }
	}

	// SHP[] SHift Point using reference point
	// 0x32-0x33
	function SHP(a, state) {
	    var stack = state.stack;
	    var rpi = a ? state.rp1 : state.rp2;
	    var rp = (a ? state.z0 : state.z1)[rpi];
	    var fv = state.fv;
	    var pv = state.pv;
	    var loop = state.loop;
	    var z2 = state.z2;

	    while (loop--)
	    {
	        var pi = stack.pop();
	        var p = z2[pi];

	        var d = pv.distance(rp, rp, false, true);
	        fv.setRelative(p, p, d, pv);
	        fv.touch(p);

	        if (exports.DEBUG) {
	            console.log(
	                state.step,
	                (state.loop > 1 ?
	                   'loop ' + (state.loop - loop) + ': ' :
	                   ''
	                ) +
	                'SHP[' + (a ? 'rp1' : 'rp2') + ']', pi
	            );
	        }
	    }

	    state.loop = 1;
	}

	// SHC[] SHift Contour using reference point
	// 0x36-0x37
	function SHC(a, state) {
	    var stack = state.stack;
	    var rpi = a ? state.rp1 : state.rp2;
	    var rp = (a ? state.z0 : state.z1)[rpi];
	    var fv = state.fv;
	    var pv = state.pv;
	    var ci = stack.pop();
	    var sp = state.z2[state.contours[ci]];
	    var p = sp;

	    if (exports.DEBUG) { console.log(state.step, 'SHC[' + a + ']', ci); }

	    var d = pv.distance(rp, rp, false, true);

	    do {
	        if (p !== rp) { fv.setRelative(p, p, d, pv); }
	        p = p.nextPointOnContour;
	    } while (p !== sp);
	}

	// SHZ[] SHift Zone using reference point
	// 0x36-0x37
	function SHZ(a, state) {
	    var stack = state.stack;
	    var rpi = a ? state.rp1 : state.rp2;
	    var rp = (a ? state.z0 : state.z1)[rpi];
	    var fv = state.fv;
	    var pv = state.pv;

	    var e = stack.pop();

	    if (exports.DEBUG) { console.log(state.step, 'SHZ[' + a + ']', e); }

	    var z;
	    switch (e) {
	        case 0 : z = state.tZone; break;
	        case 1 : z = state.gZone; break;
	        default : throw new Error('Invalid zone');
	    }

	    var p;
	    var d = pv.distance(rp, rp, false, true);
	    var pLen = z.length - 2;
	    for (var i = 0; i < pLen; i++)
	    {
	        p = z[i];
	        fv.setRelative(p, p, d, pv);
	        //if (p !== rp) fv.setRelative(p, p, d, pv);
	    }
	}

	// SHPIX[] SHift point by a PIXel amount
	// 0x38
	function SHPIX(state) {
	    var stack = state.stack;
	    var loop = state.loop;
	    var fv = state.fv;
	    var d = stack.pop() / 0x40;
	    var z2 = state.z2;

	    while (loop--) {
	        var pi = stack.pop();
	        var p = z2[pi];

	        if (exports.DEBUG) {
	            console.log(
	                state.step,
	                (state.loop > 1 ? 'loop ' + (state.loop - loop) + ': ' : '') +
	                'SHPIX[]', pi, d
	            );
	        }

	        fv.setRelative(p, p, d);
	        fv.touch(p);
	    }

	    state.loop = 1;
	}

	// IP[] Interpolate Point
	// 0x39
	function IP(state) {
	    var stack = state.stack;
	    var rp1i = state.rp1;
	    var rp2i = state.rp2;
	    var loop = state.loop;
	    var rp1 = state.z0[rp1i];
	    var rp2 = state.z1[rp2i];
	    var fv = state.fv;
	    var pv = state.dpv;
	    var z2 = state.z2;

	    while (loop--) {
	        var pi = stack.pop();
	        var p = z2[pi];

	        if (exports.DEBUG) {
	            console.log(
	                state.step,
	                (state.loop > 1 ? 'loop ' + (state.loop - loop) + ': ' : '') +
	                'IP[]', pi, rp1i, '<->', rp2i
	            );
	        }

	        fv.interpolate(p, rp1, rp2, pv);

	        fv.touch(p);
	    }

	    state.loop = 1;
	}

	// MSIRP[a] Move Stack Indirect Relative Point
	// 0x3A-0x3B
	function MSIRP(a, state) {
	    var stack = state.stack;
	    var d = stack.pop() / 64;
	    var pi = stack.pop();
	    var p = state.z1[pi];
	    var rp0 = state.z0[state.rp0];
	    var fv = state.fv;
	    var pv = state.pv;

	    fv.setRelative(p, rp0, d, pv);
	    fv.touch(p);

	    if (exports.DEBUG) { console.log(state.step, 'MSIRP[' + a + ']', d, pi); }

	    state.rp1 = state.rp0;
	    state.rp2 = pi;
	    if (a) { state.rp0 = pi; }
	}

	// ALIGNRP[] Align to reference point.
	// 0x3C
	function ALIGNRP(state) {
	    var stack = state.stack;
	    var rp0i = state.rp0;
	    var rp0 = state.z0[rp0i];
	    var loop = state.loop;
	    var fv = state.fv;
	    var pv = state.pv;
	    var z1 = state.z1;

	    while (loop--) {
	        var pi = stack.pop();
	        var p = z1[pi];

	        if (exports.DEBUG) {
	            console.log(
	                state.step,
	                (state.loop > 1 ? 'loop ' + (state.loop - loop) + ': ' : '') +
	                'ALIGNRP[]', pi
	            );
	        }

	        fv.setRelative(p, rp0, 0, pv);
	        fv.touch(p);
	    }

	    state.loop = 1;
	}

	// RTG[] Round To Double Grid
	// 0x3D
	function RTDG(state) {
	    if (exports.DEBUG) { console.log(state.step, 'RTDG[]'); }

	    state.round = roundToDoubleGrid;
	}

	// MIAP[a] Move Indirect Absolute Point
	// 0x3E-0x3F
	function MIAP(round, state) {
	    var stack = state.stack;
	    var n = stack.pop();
	    var pi = stack.pop();
	    var p = state.z0[pi];
	    var fv = state.fv;
	    var pv = state.pv;
	    var cv = state.cvt[n];

	    if (exports.DEBUG) {
	        console.log(
	            state.step,
	            'MIAP[' + round + ']',
	            n, '(', cv, ')', pi
	        );
	    }

	    var d = pv.distance(p, HPZero);

	    if (round) {
	        if (Math.abs(d - cv) < state.cvCutIn) { d = cv; }

	        d = state.round(d);
	    }

	    fv.setRelative(p, HPZero, d, pv);

	    if (state.zp0 === 0) {
	        p.xo = p.x;
	        p.yo = p.y;
	    }

	    fv.touch(p);

	    state.rp0 = state.rp1 = pi;
	}

	// NPUSB[] PUSH N Bytes
	// 0x40
	function NPUSHB(state) {
	    var prog = state.prog;
	    var ip = state.ip;
	    var stack = state.stack;

	    var n = prog[++ip];

	    if (exports.DEBUG) { console.log(state.step, 'NPUSHB[]', n); }

	    for (var i = 0; i < n; i++) { stack.push(prog[++ip]); }

	    state.ip = ip;
	}

	// NPUSHW[] PUSH N Words
	// 0x41
	function NPUSHW(state) {
	    var ip = state.ip;
	    var prog = state.prog;
	    var stack = state.stack;
	    var n = prog[++ip];

	    if (exports.DEBUG) { console.log(state.step, 'NPUSHW[]', n); }

	    for (var i = 0; i < n; i++) {
	        var w = (prog[++ip] << 8) | prog[++ip];
	        if (w & 0x8000) { w = -((w ^ 0xffff) + 1); }
	        stack.push(w);
	    }

	    state.ip = ip;
	}

	// WS[] Write Store
	// 0x42
	function WS(state) {
	    var stack = state.stack;
	    var store = state.store;

	    if (!store) { store = state.store = []; }

	    var v = stack.pop();
	    var l = stack.pop();

	    if (exports.DEBUG) { console.log(state.step, 'WS', v, l); }

	    store[l] = v;
	}

	// RS[] Read Store
	// 0x43
	function RS(state) {
	    var stack = state.stack;
	    var store = state.store;

	    var l = stack.pop();

	    if (exports.DEBUG) { console.log(state.step, 'RS', l); }

	    var v = (store && store[l]) || 0;

	    stack.push(v);
	}

	// WCVTP[] Write Control Value Table in Pixel units
	// 0x44
	function WCVTP(state) {
	    var stack = state.stack;

	    var v = stack.pop();
	    var l = stack.pop();

	    if (exports.DEBUG) { console.log(state.step, 'WCVTP', v, l); }

	    state.cvt[l] = v / 0x40;
	}

	// RCVT[] Read Control Value Table entry
	// 0x45
	function RCVT(state) {
	    var stack = state.stack;
	    var cvte = stack.pop();

	    if (exports.DEBUG) { console.log(state.step, 'RCVT', cvte); }

	    stack.push(state.cvt[cvte] * 0x40);
	}

	// GC[] Get Coordinate projected onto the projection vector
	// 0x46-0x47
	function GC(a, state) {
	    var stack = state.stack;
	    var pi = stack.pop();
	    var p = state.z2[pi];

	    if (exports.DEBUG) { console.log(state.step, 'GC[' + a + ']', pi); }

	    stack.push(state.dpv.distance(p, HPZero, a, false) * 0x40);
	}

	// MD[a] Measure Distance
	// 0x49-0x4A
	function MD(a, state) {
	    var stack = state.stack;
	    var pi2 = stack.pop();
	    var pi1 = stack.pop();
	    var p2 = state.z1[pi2];
	    var p1 = state.z0[pi1];
	    var d = state.dpv.distance(p1, p2, a, a);

	    if (exports.DEBUG) { console.log(state.step, 'MD[' + a + ']', pi2, pi1, '->', d); }

	    state.stack.push(Math.round(d * 64));
	}

	// MPPEM[] Measure Pixels Per EM
	// 0x4B
	function MPPEM(state) {
	    if (exports.DEBUG) { console.log(state.step, 'MPPEM[]'); }
	    state.stack.push(state.ppem);
	}

	// FLIPON[] set the auto FLIP Boolean to ON
	// 0x4D
	function FLIPON(state) {
	    if (exports.DEBUG) { console.log(state.step, 'FLIPON[]'); }
	    state.autoFlip = true;
	}

	// LT[] Less Than
	// 0x50
	function LT(state) {
	    var stack = state.stack;
	    var e2 = stack.pop();
	    var e1 = stack.pop();

	    if (exports.DEBUG) { console.log(state.step, 'LT[]', e2, e1); }

	    stack.push(e1 < e2 ? 1 : 0);
	}

	// LTEQ[] Less Than or EQual
	// 0x53
	function LTEQ(state) {
	    var stack = state.stack;
	    var e2 = stack.pop();
	    var e1 = stack.pop();

	    if (exports.DEBUG) { console.log(state.step, 'LTEQ[]', e2, e1); }

	    stack.push(e1 <= e2 ? 1 : 0);
	}

	// GTEQ[] Greater Than
	// 0x52
	function GT(state) {
	    var stack = state.stack;
	    var e2 = stack.pop();
	    var e1 = stack.pop();

	    if (exports.DEBUG) { console.log(state.step, 'GT[]', e2, e1); }

	    stack.push(e1 > e2 ? 1 : 0);
	}

	// GTEQ[] Greater Than or EQual
	// 0x53
	function GTEQ(state) {
	    var stack = state.stack;
	    var e2 = stack.pop();
	    var e1 = stack.pop();

	    if (exports.DEBUG) { console.log(state.step, 'GTEQ[]', e2, e1); }

	    stack.push(e1 >= e2 ? 1 : 0);
	}

	// EQ[] EQual
	// 0x54
	function EQ(state) {
	    var stack = state.stack;
	    var e2 = stack.pop();
	    var e1 = stack.pop();

	    if (exports.DEBUG) { console.log(state.step, 'EQ[]', e2, e1); }

	    stack.push(e2 === e1 ? 1 : 0);
	}

	// NEQ[] Not EQual
	// 0x55
	function NEQ(state) {
	    var stack = state.stack;
	    var e2 = stack.pop();
	    var e1 = stack.pop();

	    if (exports.DEBUG) { console.log(state.step, 'NEQ[]', e2, e1); }

	    stack.push(e2 !== e1 ? 1 : 0);
	}

	// ODD[] ODD
	// 0x56
	function ODD(state) {
	    var stack = state.stack;
	    var n = stack.pop();

	    if (exports.DEBUG) { console.log(state.step, 'ODD[]', n); }

	    stack.push(Math.trunc(n) % 2 ? 1 : 0);
	}

	// EVEN[] EVEN
	// 0x57
	function EVEN(state) {
	    var stack = state.stack;
	    var n = stack.pop();

	    if (exports.DEBUG) { console.log(state.step, 'EVEN[]', n); }

	    stack.push(Math.trunc(n) % 2 ? 0 : 1);
	}

	// IF[] IF test
	// 0x58
	function IF(state) {
	    var test = state.stack.pop();

	    if (exports.DEBUG) { console.log(state.step, 'IF[]', test); }

	    // if test is true it just continues
	    // if not the ip is skipped until matching ELSE or EIF
	    if (!test) {
	        skip(state, true);

	        if (exports.DEBUG) { console.log(state.step,  'EIF[]'); }
	    }
	}

	// EIF[] End IF
	// 0x59
	function EIF(state) {
	    // this can be reached normally when
	    // executing an else branch.
	    // -> just ignore it

	    if (exports.DEBUG) { console.log(state.step, 'EIF[]'); }
	}

	// AND[] logical AND
	// 0x5A
	function AND(state) {
	    var stack = state.stack;
	    var e2 = stack.pop();
	    var e1 = stack.pop();

	    if (exports.DEBUG) { console.log(state.step, 'AND[]', e2, e1); }

	    stack.push(e2 && e1 ? 1 : 0);
	}

	// OR[] logical OR
	// 0x5B
	function OR(state) {
	    var stack = state.stack;
	    var e2 = stack.pop();
	    var e1 = stack.pop();

	    if (exports.DEBUG) { console.log(state.step, 'OR[]', e2, e1); }

	    stack.push(e2 || e1 ? 1 : 0);
	}

	// NOT[] logical NOT
	// 0x5C
	function NOT(state) {
	    var stack = state.stack;
	    var e = stack.pop();

	    if (exports.DEBUG) { console.log(state.step, 'NOT[]', e); }

	    stack.push(e ? 0 : 1);
	}

	// DELTAP1[] DELTA exception P1
	// DELTAP2[] DELTA exception P2
	// DELTAP3[] DELTA exception P3
	// 0x5D, 0x71, 0x72
	function DELTAP123(b, state) {
	    var stack = state.stack;
	    var n = stack.pop();
	    var fv = state.fv;
	    var pv = state.pv;
	    var ppem = state.ppem;
	    var base = state.deltaBase + (b - 1) * 16;
	    var ds = state.deltaShift;
	    var z0 = state.z0;

	    if (exports.DEBUG) { console.log(state.step, 'DELTAP[' + b + ']', n, stack); }

	    for (var i = 0; i < n; i++) {
	        var pi = stack.pop();
	        var arg = stack.pop();
	        var appem = base + ((arg & 0xF0) >> 4);
	        if (appem !== ppem) { continue; }

	        var mag = (arg & 0x0F) - 8;
	        if (mag >= 0) { mag++; }
	        if (exports.DEBUG) { console.log(state.step, 'DELTAPFIX', pi, 'by', mag * ds); }

	        var p = z0[pi];
	        fv.setRelative(p, p, mag * ds, pv);
	    }
	}

	// SDB[] Set Delta Base in the graphics state
	// 0x5E
	function SDB(state) {
	    var stack = state.stack;
	    var n = stack.pop();

	    if (exports.DEBUG) { console.log(state.step, 'SDB[]', n); }

	    state.deltaBase = n;
	}

	// SDS[] Set Delta Shift in the graphics state
	// 0x5F
	function SDS(state) {
	    var stack = state.stack;
	    var n = stack.pop();

	    if (exports.DEBUG) { console.log(state.step, 'SDS[]', n); }

	    state.deltaShift = Math.pow(0.5, n);
	}

	// ADD[] ADD
	// 0x60
	function ADD(state) {
	    var stack = state.stack;
	    var n2 = stack.pop();
	    var n1 = stack.pop();

	    if (exports.DEBUG) { console.log(state.step, 'ADD[]', n2, n1); }

	    stack.push(n1 + n2);
	}

	// SUB[] SUB
	// 0x61
	function SUB(state) {
	    var stack = state.stack;
	    var n2 = stack.pop();
	    var n1 = stack.pop();

	    if (exports.DEBUG) { console.log(state.step, 'SUB[]', n2, n1); }

	    stack.push(n1 - n2);
	}

	// DIV[] DIV
	// 0x62
	function DIV(state) {
	    var stack = state.stack;
	    var n2 = stack.pop();
	    var n1 = stack.pop();

	    if (exports.DEBUG) { console.log(state.step, 'DIV[]', n2, n1); }

	    stack.push(n1 * 64 / n2);
	}

	// MUL[] MUL
	// 0x63
	function MUL(state) {
	    var stack = state.stack;
	    var n2 = stack.pop();
	    var n1 = stack.pop();

	    if (exports.DEBUG) { console.log(state.step, 'MUL[]', n2, n1); }

	    stack.push(n1 * n2 / 64);
	}

	// ABS[] ABSolute value
	// 0x64
	function ABS(state) {
	    var stack = state.stack;
	    var n = stack.pop();

	    if (exports.DEBUG) { console.log(state.step, 'ABS[]', n); }

	    stack.push(Math.abs(n));
	}

	// NEG[] NEGate
	// 0x65
	function NEG(state) {
	    var stack = state.stack;
	    var n = stack.pop();

	    if (exports.DEBUG) { console.log(state.step, 'NEG[]', n); }

	    stack.push(-n);
	}

	// FLOOR[] FLOOR
	// 0x66
	function FLOOR(state) {
	    var stack = state.stack;
	    var n = stack.pop();

	    if (exports.DEBUG) { console.log(state.step, 'FLOOR[]', n); }

	    stack.push(Math.floor(n / 0x40) * 0x40);
	}

	// CEILING[] CEILING
	// 0x67
	function CEILING(state) {
	    var stack = state.stack;
	    var n = stack.pop();

	    if (exports.DEBUG) { console.log(state.step, 'CEILING[]', n); }

	    stack.push(Math.ceil(n / 0x40) * 0x40);
	}

	// ROUND[ab] ROUND value
	// 0x68-0x6B
	function ROUND(dt, state) {
	    var stack = state.stack;
	    var n = stack.pop();

	    if (exports.DEBUG) { console.log(state.step, 'ROUND[]'); }

	    stack.push(state.round(n / 0x40) * 0x40);
	}

	// WCVTF[] Write Control Value Table in Funits
	// 0x70
	function WCVTF(state) {
	    var stack = state.stack;
	    var v = stack.pop();
	    var l = stack.pop();

	    if (exports.DEBUG) { console.log(state.step, 'WCVTF[]', v, l); }

	    state.cvt[l] = v * state.ppem / state.font.unitsPerEm;
	}

	// DELTAC1[] DELTA exception C1
	// DELTAC2[] DELTA exception C2
	// DELTAC3[] DELTA exception C3
	// 0x73, 0x74, 0x75
	function DELTAC123(b, state) {
	    var stack = state.stack;
	    var n = stack.pop();
	    var ppem = state.ppem;
	    var base = state.deltaBase + (b - 1) * 16;
	    var ds = state.deltaShift;

	    if (exports.DEBUG) { console.log(state.step, 'DELTAC[' + b + ']', n, stack); }

	    for (var i = 0; i < n; i++) {
	        var c = stack.pop();
	        var arg = stack.pop();
	        var appem = base + ((arg & 0xF0) >> 4);
	        if (appem !== ppem) { continue; }

	        var mag = (arg & 0x0F) - 8;
	        if (mag >= 0) { mag++; }

	        var delta = mag * ds;

	        if (exports.DEBUG) { console.log(state.step, 'DELTACFIX', c, 'by', delta); }

	        state.cvt[c] += delta;
	    }
	}

	// SROUND[] Super ROUND
	// 0x76
	function SROUND(state) {
	    var n = state.stack.pop();

	    if (exports.DEBUG) { console.log(state.step, 'SROUND[]', n); }

	    state.round = roundSuper;

	    var period;

	    switch (n & 0xC0) {
	        case 0x00:
	            period = 0.5;
	            break;
	        case 0x40:
	            period = 1;
	            break;
	        case 0x80:
	            period = 2;
	            break;
	        default:
	            throw new Error('invalid SROUND value');
	    }

	    state.srPeriod = period;

	    switch (n & 0x30) {
	        case 0x00:
	            state.srPhase = 0;
	            break;
	        case 0x10:
	            state.srPhase = 0.25 * period;
	            break;
	        case 0x20:
	            state.srPhase = 0.5  * period;
	            break;
	        case 0x30:
	            state.srPhase = 0.75 * period;
	            break;
	        default: throw new Error('invalid SROUND value');
	    }

	    n &= 0x0F;

	    if (n === 0) { state.srThreshold = 0; }
	    else { state.srThreshold = (n / 8 - 0.5) * period; }
	}

	// S45ROUND[] Super ROUND 45 degrees
	// 0x77
	function S45ROUND(state) {
	    var n = state.stack.pop();

	    if (exports.DEBUG) { console.log(state.step, 'S45ROUND[]', n); }

	    state.round = roundSuper;

	    var period;

	    switch (n & 0xC0) {
	        case 0x00:
	            period = Math.sqrt(2) / 2;
	            break;
	        case 0x40:
	            period = Math.sqrt(2);
	            break;
	        case 0x80:
	            period = 2 * Math.sqrt(2);
	            break;
	        default:
	            throw new Error('invalid S45ROUND value');
	    }

	    state.srPeriod = period;

	    switch (n & 0x30) {
	        case 0x00:
	            state.srPhase = 0;
	            break;
	        case 0x10:
	            state.srPhase = 0.25 * period;
	            break;
	        case 0x20:
	            state.srPhase = 0.5  * period;
	            break;
	        case 0x30:
	            state.srPhase = 0.75 * period;
	            break;
	        default:
	            throw new Error('invalid S45ROUND value');
	    }

	    n &= 0x0F;

	    if (n === 0) { state.srThreshold = 0; }
	    else { state.srThreshold = (n / 8 - 0.5) * period; }
	}

	// ROFF[] Round Off
	// 0x7A
	function ROFF(state) {
	    if (exports.DEBUG) { console.log(state.step, 'ROFF[]'); }

	    state.round = roundOff;
	}

	// RUTG[] Round Up To Grid
	// 0x7C
	function RUTG(state) {
	    if (exports.DEBUG) { console.log(state.step, 'RUTG[]'); }

	    state.round = roundUpToGrid;
	}

	// RDTG[] Round Down To Grid
	// 0x7D
	function RDTG(state) {
	    if (exports.DEBUG) { console.log(state.step, 'RDTG[]'); }

	    state.round = roundDownToGrid;
	}

	// SCANCTRL[] SCAN conversion ConTRoL
	// 0x85
	function SCANCTRL(state) {
	    var n = state.stack.pop();

	    // ignored by opentype.js

	    if (exports.DEBUG) { console.log(state.step, 'SCANCTRL[]', n); }
	}

	// SDPVTL[a] Set Dual Projection Vector To Line
	// 0x86-0x87
	function SDPVTL(a, state) {
	    var stack = state.stack;
	    var p2i = stack.pop();
	    var p1i = stack.pop();
	    var p2 = state.z2[p2i];
	    var p1 = state.z1[p1i];

	    if (exports.DEBUG) { console.log(state.step, 'SDPVTL[' + a + ']', p2i, p1i); }

	    var dx;
	    var dy;

	    if (!a) {
	        dx = p1.x - p2.x;
	        dy = p1.y - p2.y;
	    } else {
	        dx = p2.y - p1.y;
	        dy = p1.x - p2.x;
	    }

	    state.dpv = getUnitVector(dx, dy);
	}

	// GETINFO[] GET INFOrmation
	// 0x88
	function GETINFO(state) {
	    var stack = state.stack;
	    var sel = stack.pop();
	    var r = 0;

	    if (exports.DEBUG) { console.log(state.step, 'GETINFO[]', sel); }

	    // v35 as in no subpixel hinting
	    if (sel & 0x01) { r = 35; }

	    // TODO rotation and stretch currently not supported
	    // and thus those GETINFO are always 0.

	    // opentype.js is always gray scaling
	    if (sel & 0x20) { r |= 0x1000; }

	    stack.push(r);
	}

	// ROLL[] ROLL the top three stack elements
	// 0x8A
	function ROLL(state) {
	    var stack = state.stack;
	    var a = stack.pop();
	    var b = stack.pop();
	    var c = stack.pop();

	    if (exports.DEBUG) { console.log(state.step, 'ROLL[]'); }

	    stack.push(b);
	    stack.push(a);
	    stack.push(c);
	}

	// MAX[] MAXimum of top two stack elements
	// 0x8B
	function MAX(state) {
	    var stack = state.stack;
	    var e2 = stack.pop();
	    var e1 = stack.pop();

	    if (exports.DEBUG) { console.log(state.step, 'MAX[]', e2, e1); }

	    stack.push(Math.max(e1, e2));
	}

	// MIN[] MINimum of top two stack elements
	// 0x8C
	function MIN(state) {
	    var stack = state.stack;
	    var e2 = stack.pop();
	    var e1 = stack.pop();

	    if (exports.DEBUG) { console.log(state.step, 'MIN[]', e2, e1); }

	    stack.push(Math.min(e1, e2));
	}

	// SCANTYPE[] SCANTYPE
	// 0x8D
	function SCANTYPE(state) {
	    var n = state.stack.pop();
	    // ignored by opentype.js
	    if (exports.DEBUG) { console.log(state.step, 'SCANTYPE[]', n); }
	}

	// INSTCTRL[] INSTCTRL
	// 0x8D
	function INSTCTRL(state) {
	    var s = state.stack.pop();
	    var v = state.stack.pop();

	    if (exports.DEBUG) { console.log(state.step, 'INSTCTRL[]', s, v); }

	    switch (s) {
	        case 1 : state.inhibitGridFit = !!v; return;
	        case 2 : state.ignoreCvt = !!v; return;
	        default: throw new Error('invalid INSTCTRL[] selector');
	    }
	}

	// PUSHB[abc] PUSH Bytes
	// 0xB0-0xB7
	function PUSHB(n, state) {
	    var stack = state.stack;
	    var prog = state.prog;
	    var ip = state.ip;

	    if (exports.DEBUG) { console.log(state.step, 'PUSHB[' + n + ']'); }

	    for (var i = 0; i < n; i++) { stack.push(prog[++ip]); }

	    state.ip = ip;
	}

	// PUSHW[abc] PUSH Words
	// 0xB8-0xBF
	function PUSHW(n, state) {
	    var ip = state.ip;
	    var prog = state.prog;
	    var stack = state.stack;

	    if (exports.DEBUG) { console.log(state.ip, 'PUSHW[' + n + ']'); }

	    for (var i = 0; i < n; i++) {
	        var w = (prog[++ip] << 8) | prog[++ip];
	        if (w & 0x8000) { w = -((w ^ 0xffff) + 1); }
	        stack.push(w);
	    }

	    state.ip = ip;
	}

	// MDRP[abcde] Move Direct Relative Point
	// 0xD0-0xEF
	// (if indirect is 0)
	//
	// and
	//
	// MIRP[abcde] Move Indirect Relative Point
	// 0xE0-0xFF
	// (if indirect is 1)

	function MDRP_MIRP(indirect, setRp0, keepD, ro, dt, state) {
	    var stack = state.stack;
	    var cvte = indirect && stack.pop();
	    var pi = stack.pop();
	    var rp0i = state.rp0;
	    var rp = state.z0[rp0i];
	    var p = state.z1[pi];

	    var md = state.minDis;
	    var fv = state.fv;
	    var pv = state.dpv;
	    var od; // original distance
	    var d; // moving distance
	    var sign; // sign of distance
	    var cv;

	    d = od = pv.distance(p, rp, true, true);
	    sign = d >= 0 ? 1 : -1; // Math.sign would be 0 in case of 0

	    // TODO consider autoFlip
	    d = Math.abs(d);

	    if (indirect) {
	        cv = state.cvt[cvte];

	        if (ro && Math.abs(d - cv) < state.cvCutIn) { d = cv; }
	    }

	    if (keepD && d < md) { d = md; }

	    if (ro) { d = state.round(d); }

	    fv.setRelative(p, rp, sign * d, pv);
	    fv.touch(p);

	    if (exports.DEBUG) {
	        console.log(
	            state.step,
	            (indirect ? 'MIRP[' : 'MDRP[') +
	            (setRp0 ? 'M' : 'm') +
	            (keepD ? '>' : '_') +
	            (ro ? 'R' : '_') +
	            (dt === 0 ? 'Gr' : (dt === 1 ? 'Bl' : (dt === 2 ? 'Wh' : ''))) +
	            ']',
	            indirect ?
	                cvte + '(' + state.cvt[cvte] + ',' +  cv + ')' :
	                '',
	            pi,
	            '(d =', od, '->', sign * d, ')'
	        );
	    }

	    state.rp1 = state.rp0;
	    state.rp2 = pi;
	    if (setRp0) { state.rp0 = pi; }
	}

	/*
	* The instruction table.
	*/
	instructionTable = [
	    /* 0x00 */ SVTCA.bind(undefined, yUnitVector),
	    /* 0x01 */ SVTCA.bind(undefined, xUnitVector),
	    /* 0x02 */ SPVTCA.bind(undefined, yUnitVector),
	    /* 0x03 */ SPVTCA.bind(undefined, xUnitVector),
	    /* 0x04 */ SFVTCA.bind(undefined, yUnitVector),
	    /* 0x05 */ SFVTCA.bind(undefined, xUnitVector),
	    /* 0x06 */ SPVTL.bind(undefined, 0),
	    /* 0x07 */ SPVTL.bind(undefined, 1),
	    /* 0x08 */ SFVTL.bind(undefined, 0),
	    /* 0x09 */ SFVTL.bind(undefined, 1),
	    /* 0x0A */ SPVFS,
	    /* 0x0B */ SFVFS,
	    /* 0x0C */ GPV,
	    /* 0x0D */ GFV,
	    /* 0x0E */ SFVTPV,
	    /* 0x0F */ ISECT,
	    /* 0x10 */ SRP0,
	    /* 0x11 */ SRP1,
	    /* 0x12 */ SRP2,
	    /* 0x13 */ SZP0,
	    /* 0x14 */ SZP1,
	    /* 0x15 */ SZP2,
	    /* 0x16 */ SZPS,
	    /* 0x17 */ SLOOP,
	    /* 0x18 */ RTG,
	    /* 0x19 */ RTHG,
	    /* 0x1A */ SMD,
	    /* 0x1B */ ELSE,
	    /* 0x1C */ JMPR,
	    /* 0x1D */ SCVTCI,
	    /* 0x1E */ undefined,   // TODO SSWCI
	    /* 0x1F */ undefined,   // TODO SSW
	    /* 0x20 */ DUP,
	    /* 0x21 */ POP,
	    /* 0x22 */ CLEAR,
	    /* 0x23 */ SWAP,
	    /* 0x24 */ DEPTH,
	    /* 0x25 */ CINDEX,
	    /* 0x26 */ MINDEX,
	    /* 0x27 */ undefined,   // TODO ALIGNPTS
	    /* 0x28 */ undefined,
	    /* 0x29 */ undefined,   // TODO UTP
	    /* 0x2A */ LOOPCALL,
	    /* 0x2B */ CALL,
	    /* 0x2C */ FDEF,
	    /* 0x2D */ undefined,   // ENDF (eaten by FDEF)
	    /* 0x2E */ MDAP.bind(undefined, 0),
	    /* 0x2F */ MDAP.bind(undefined, 1),
	    /* 0x30 */ IUP.bind(undefined, yUnitVector),
	    /* 0x31 */ IUP.bind(undefined, xUnitVector),
	    /* 0x32 */ SHP.bind(undefined, 0),
	    /* 0x33 */ SHP.bind(undefined, 1),
	    /* 0x34 */ SHC.bind(undefined, 0),
	    /* 0x35 */ SHC.bind(undefined, 1),
	    /* 0x36 */ SHZ.bind(undefined, 0),
	    /* 0x37 */ SHZ.bind(undefined, 1),
	    /* 0x38 */ SHPIX,
	    /* 0x39 */ IP,
	    /* 0x3A */ MSIRP.bind(undefined, 0),
	    /* 0x3B */ MSIRP.bind(undefined, 1),
	    /* 0x3C */ ALIGNRP,
	    /* 0x3D */ RTDG,
	    /* 0x3E */ MIAP.bind(undefined, 0),
	    /* 0x3F */ MIAP.bind(undefined, 1),
	    /* 0x40 */ NPUSHB,
	    /* 0x41 */ NPUSHW,
	    /* 0x42 */ WS,
	    /* 0x43 */ RS,
	    /* 0x44 */ WCVTP,
	    /* 0x45 */ RCVT,
	    /* 0x46 */ GC.bind(undefined, 0),
	    /* 0x47 */ GC.bind(undefined, 1),
	    /* 0x48 */ undefined,   // TODO SCFS
	    /* 0x49 */ MD.bind(undefined, 0),
	    /* 0x4A */ MD.bind(undefined, 1),
	    /* 0x4B */ MPPEM,
	    /* 0x4C */ undefined,   // TODO MPS
	    /* 0x4D */ FLIPON,
	    /* 0x4E */ undefined,   // TODO FLIPOFF
	    /* 0x4F */ undefined,   // TODO DEBUG
	    /* 0x50 */ LT,
	    /* 0x51 */ LTEQ,
	    /* 0x52 */ GT,
	    /* 0x53 */ GTEQ,
	    /* 0x54 */ EQ,
	    /* 0x55 */ NEQ,
	    /* 0x56 */ ODD,
	    /* 0x57 */ EVEN,
	    /* 0x58 */ IF,
	    /* 0x59 */ EIF,
	    /* 0x5A */ AND,
	    /* 0x5B */ OR,
	    /* 0x5C */ NOT,
	    /* 0x5D */ DELTAP123.bind(undefined, 1),
	    /* 0x5E */ SDB,
	    /* 0x5F */ SDS,
	    /* 0x60 */ ADD,
	    /* 0x61 */ SUB,
	    /* 0x62 */ DIV,
	    /* 0x63 */ MUL,
	    /* 0x64 */ ABS,
	    /* 0x65 */ NEG,
	    /* 0x66 */ FLOOR,
	    /* 0x67 */ CEILING,
	    /* 0x68 */ ROUND.bind(undefined, 0),
	    /* 0x69 */ ROUND.bind(undefined, 1),
	    /* 0x6A */ ROUND.bind(undefined, 2),
	    /* 0x6B */ ROUND.bind(undefined, 3),
	    /* 0x6C */ undefined,   // TODO NROUND[ab]
	    /* 0x6D */ undefined,   // TODO NROUND[ab]
	    /* 0x6E */ undefined,   // TODO NROUND[ab]
	    /* 0x6F */ undefined,   // TODO NROUND[ab]
	    /* 0x70 */ WCVTF,
	    /* 0x71 */ DELTAP123.bind(undefined, 2),
	    /* 0x72 */ DELTAP123.bind(undefined, 3),
	    /* 0x73 */ DELTAC123.bind(undefined, 1),
	    /* 0x74 */ DELTAC123.bind(undefined, 2),
	    /* 0x75 */ DELTAC123.bind(undefined, 3),
	    /* 0x76 */ SROUND,
	    /* 0x77 */ S45ROUND,
	    /* 0x78 */ undefined,   // TODO JROT[]
	    /* 0x79 */ undefined,   // TODO JROF[]
	    /* 0x7A */ ROFF,
	    /* 0x7B */ undefined,
	    /* 0x7C */ RUTG,
	    /* 0x7D */ RDTG,
	    /* 0x7E */ POP, // actually SANGW, supposed to do only a pop though
	    /* 0x7F */ POP, // actually AA, supposed to do only a pop though
	    /* 0x80 */ undefined,   // TODO FLIPPT
	    /* 0x81 */ undefined,   // TODO FLIPRGON
	    /* 0x82 */ undefined,   // TODO FLIPRGOFF
	    /* 0x83 */ undefined,
	    /* 0x84 */ undefined,
	    /* 0x85 */ SCANCTRL,
	    /* 0x86 */ SDPVTL.bind(undefined, 0),
	    /* 0x87 */ SDPVTL.bind(undefined, 1),
	    /* 0x88 */ GETINFO,
	    /* 0x89 */ undefined,   // TODO IDEF
	    /* 0x8A */ ROLL,
	    /* 0x8B */ MAX,
	    /* 0x8C */ MIN,
	    /* 0x8D */ SCANTYPE,
	    /* 0x8E */ INSTCTRL,
	    /* 0x8F */ undefined,
	    /* 0x90 */ undefined,
	    /* 0x91 */ undefined,
	    /* 0x92 */ undefined,
	    /* 0x93 */ undefined,
	    /* 0x94 */ undefined,
	    /* 0x95 */ undefined,
	    /* 0x96 */ undefined,
	    /* 0x97 */ undefined,
	    /* 0x98 */ undefined,
	    /* 0x99 */ undefined,
	    /* 0x9A */ undefined,
	    /* 0x9B */ undefined,
	    /* 0x9C */ undefined,
	    /* 0x9D */ undefined,
	    /* 0x9E */ undefined,
	    /* 0x9F */ undefined,
	    /* 0xA0 */ undefined,
	    /* 0xA1 */ undefined,
	    /* 0xA2 */ undefined,
	    /* 0xA3 */ undefined,
	    /* 0xA4 */ undefined,
	    /* 0xA5 */ undefined,
	    /* 0xA6 */ undefined,
	    /* 0xA7 */ undefined,
	    /* 0xA8 */ undefined,
	    /* 0xA9 */ undefined,
	    /* 0xAA */ undefined,
	    /* 0xAB */ undefined,
	    /* 0xAC */ undefined,
	    /* 0xAD */ undefined,
	    /* 0xAE */ undefined,
	    /* 0xAF */ undefined,
	    /* 0xB0 */ PUSHB.bind(undefined, 1),
	    /* 0xB1 */ PUSHB.bind(undefined, 2),
	    /* 0xB2 */ PUSHB.bind(undefined, 3),
	    /* 0xB3 */ PUSHB.bind(undefined, 4),
	    /* 0xB4 */ PUSHB.bind(undefined, 5),
	    /* 0xB5 */ PUSHB.bind(undefined, 6),
	    /* 0xB6 */ PUSHB.bind(undefined, 7),
	    /* 0xB7 */ PUSHB.bind(undefined, 8),
	    /* 0xB8 */ PUSHW.bind(undefined, 1),
	    /* 0xB9 */ PUSHW.bind(undefined, 2),
	    /* 0xBA */ PUSHW.bind(undefined, 3),
	    /* 0xBB */ PUSHW.bind(undefined, 4),
	    /* 0xBC */ PUSHW.bind(undefined, 5),
	    /* 0xBD */ PUSHW.bind(undefined, 6),
	    /* 0xBE */ PUSHW.bind(undefined, 7),
	    /* 0xBF */ PUSHW.bind(undefined, 8),
	    /* 0xC0 */ MDRP_MIRP.bind(undefined, 0, 0, 0, 0, 0),
	    /* 0xC1 */ MDRP_MIRP.bind(undefined, 0, 0, 0, 0, 1),
	    /* 0xC2 */ MDRP_MIRP.bind(undefined, 0, 0, 0, 0, 2),
	    /* 0xC3 */ MDRP_MIRP.bind(undefined, 0, 0, 0, 0, 3),
	    /* 0xC4 */ MDRP_MIRP.bind(undefined, 0, 0, 0, 1, 0),
	    /* 0xC5 */ MDRP_MIRP.bind(undefined, 0, 0, 0, 1, 1),
	    /* 0xC6 */ MDRP_MIRP.bind(undefined, 0, 0, 0, 1, 2),
	    /* 0xC7 */ MDRP_MIRP.bind(undefined, 0, 0, 0, 1, 3),
	    /* 0xC8 */ MDRP_MIRP.bind(undefined, 0, 0, 1, 0, 0),
	    /* 0xC9 */ MDRP_MIRP.bind(undefined, 0, 0, 1, 0, 1),
	    /* 0xCA */ MDRP_MIRP.bind(undefined, 0, 0, 1, 0, 2),
	    /* 0xCB */ MDRP_MIRP.bind(undefined, 0, 0, 1, 0, 3),
	    /* 0xCC */ MDRP_MIRP.bind(undefined, 0, 0, 1, 1, 0),
	    /* 0xCD */ MDRP_MIRP.bind(undefined, 0, 0, 1, 1, 1),
	    /* 0xCE */ MDRP_MIRP.bind(undefined, 0, 0, 1, 1, 2),
	    /* 0xCF */ MDRP_MIRP.bind(undefined, 0, 0, 1, 1, 3),
	    /* 0xD0 */ MDRP_MIRP.bind(undefined, 0, 1, 0, 0, 0),
	    /* 0xD1 */ MDRP_MIRP.bind(undefined, 0, 1, 0, 0, 1),
	    /* 0xD2 */ MDRP_MIRP.bind(undefined, 0, 1, 0, 0, 2),
	    /* 0xD3 */ MDRP_MIRP.bind(undefined, 0, 1, 0, 0, 3),
	    /* 0xD4 */ MDRP_MIRP.bind(undefined, 0, 1, 0, 1, 0),
	    /* 0xD5 */ MDRP_MIRP.bind(undefined, 0, 1, 0, 1, 1),
	    /* 0xD6 */ MDRP_MIRP.bind(undefined, 0, 1, 0, 1, 2),
	    /* 0xD7 */ MDRP_MIRP.bind(undefined, 0, 1, 0, 1, 3),
	    /* 0xD8 */ MDRP_MIRP.bind(undefined, 0, 1, 1, 0, 0),
	    /* 0xD9 */ MDRP_MIRP.bind(undefined, 0, 1, 1, 0, 1),
	    /* 0xDA */ MDRP_MIRP.bind(undefined, 0, 1, 1, 0, 2),
	    /* 0xDB */ MDRP_MIRP.bind(undefined, 0, 1, 1, 0, 3),
	    /* 0xDC */ MDRP_MIRP.bind(undefined, 0, 1, 1, 1, 0),
	    /* 0xDD */ MDRP_MIRP.bind(undefined, 0, 1, 1, 1, 1),
	    /* 0xDE */ MDRP_MIRP.bind(undefined, 0, 1, 1, 1, 2),
	    /* 0xDF */ MDRP_MIRP.bind(undefined, 0, 1, 1, 1, 3),
	    /* 0xE0 */ MDRP_MIRP.bind(undefined, 1, 0, 0, 0, 0),
	    /* 0xE1 */ MDRP_MIRP.bind(undefined, 1, 0, 0, 0, 1),
	    /* 0xE2 */ MDRP_MIRP.bind(undefined, 1, 0, 0, 0, 2),
	    /* 0xE3 */ MDRP_MIRP.bind(undefined, 1, 0, 0, 0, 3),
	    /* 0xE4 */ MDRP_MIRP.bind(undefined, 1, 0, 0, 1, 0),
	    /* 0xE5 */ MDRP_MIRP.bind(undefined, 1, 0, 0, 1, 1),
	    /* 0xE6 */ MDRP_MIRP.bind(undefined, 1, 0, 0, 1, 2),
	    /* 0xE7 */ MDRP_MIRP.bind(undefined, 1, 0, 0, 1, 3),
	    /* 0xE8 */ MDRP_MIRP.bind(undefined, 1, 0, 1, 0, 0),
	    /* 0xE9 */ MDRP_MIRP.bind(undefined, 1, 0, 1, 0, 1),
	    /* 0xEA */ MDRP_MIRP.bind(undefined, 1, 0, 1, 0, 2),
	    /* 0xEB */ MDRP_MIRP.bind(undefined, 1, 0, 1, 0, 3),
	    /* 0xEC */ MDRP_MIRP.bind(undefined, 1, 0, 1, 1, 0),
	    /* 0xED */ MDRP_MIRP.bind(undefined, 1, 0, 1, 1, 1),
	    /* 0xEE */ MDRP_MIRP.bind(undefined, 1, 0, 1, 1, 2),
	    /* 0xEF */ MDRP_MIRP.bind(undefined, 1, 0, 1, 1, 3),
	    /* 0xF0 */ MDRP_MIRP.bind(undefined, 1, 1, 0, 0, 0),
	    /* 0xF1 */ MDRP_MIRP.bind(undefined, 1, 1, 0, 0, 1),
	    /* 0xF2 */ MDRP_MIRP.bind(undefined, 1, 1, 0, 0, 2),
	    /* 0xF3 */ MDRP_MIRP.bind(undefined, 1, 1, 0, 0, 3),
	    /* 0xF4 */ MDRP_MIRP.bind(undefined, 1, 1, 0, 1, 0),
	    /* 0xF5 */ MDRP_MIRP.bind(undefined, 1, 1, 0, 1, 1),
	    /* 0xF6 */ MDRP_MIRP.bind(undefined, 1, 1, 0, 1, 2),
	    /* 0xF7 */ MDRP_MIRP.bind(undefined, 1, 1, 0, 1, 3),
	    /* 0xF8 */ MDRP_MIRP.bind(undefined, 1, 1, 1, 0, 0),
	    /* 0xF9 */ MDRP_MIRP.bind(undefined, 1, 1, 1, 0, 1),
	    /* 0xFA */ MDRP_MIRP.bind(undefined, 1, 1, 1, 0, 2),
	    /* 0xFB */ MDRP_MIRP.bind(undefined, 1, 1, 1, 0, 3),
	    /* 0xFC */ MDRP_MIRP.bind(undefined, 1, 1, 1, 1, 0),
	    /* 0xFD */ MDRP_MIRP.bind(undefined, 1, 1, 1, 1, 1),
	    /* 0xFE */ MDRP_MIRP.bind(undefined, 1, 1, 1, 1, 2),
	    /* 0xFF */ MDRP_MIRP.bind(undefined, 1, 1, 1, 1, 3)
	];

	/*****************************
	  Mathematical Considerations
	******************************

	fv ... refers to freedom vector
	pv ... refers to projection vector
	rp ... refers to reference point
	p  ... refers to to point being operated on
	d  ... refers to distance

	SETRELATIVE:
	============

	case freedom vector == x-axis:
	------------------------------

	                        (pv)
	                     .-'
	              rpd .-'
	               .-*
	          d .-'90°'
	         .-'       '
	      .-'           '
	   *-'               ' b
	  rp                  '
	                       '
	                        '
	            p *----------*-------------- (fv)
	                          pm

	  rpdx = rpx + d * pv.x
	  rpdy = rpy + d * pv.y

	  equation of line b

	   y - rpdy = pvns * (x- rpdx)

	   y = p.y

	   x = rpdx + ( p.y - rpdy ) / pvns


	case freedom vector == y-axis:
	------------------------------

	    * pm
	    |\
	    | \
	    |  \
	    |   \
	    |    \
	    |     \
	    |      \
	    |       \
	    |        \
	    |         \ b
	    |          \
	    |           \
	    |            \    .-' (pv)
	    |         90° \.-'
	    |           .-'* rpd
	    |        .-'
	    *     *-'  d
	    p     rp

	  rpdx = rpx + d * pv.x
	  rpdy = rpy + d * pv.y

	  equation of line b:
	           pvns ... normal slope to pv

	   y - rpdy = pvns * (x - rpdx)

	   x = p.x

	   y = rpdy +  pvns * (p.x - rpdx)



	generic case:
	-------------


	                              .'(fv)
	                            .'
	                          .* pm
	                        .' !
	                      .'    .
	                    .'      !
	                  .'         . b
	                .'           !
	               *              .
	              p               !
	                         90°   .    ... (pv)
	                           ...-*-'''
	                  ...---'''    rpd
	         ...---'''   d
	   *--'''
	  rp

	    rpdx = rpx + d * pv.x
	    rpdy = rpy + d * pv.y

	 equation of line b:
	    pvns... normal slope to pv

	    y - rpdy = pvns * (x - rpdx)

	 equation of freedom vector line:
	    fvs ... slope of freedom vector (=fy/fx)

	    y - py = fvs * (x - px)


	  on pm both equations are true for same x/y

	    y - rpdy = pvns * (x - rpdx)

	    y - py = fvs * (x - px)

	  form to y and set equal:

	    pvns * (x - rpdx) + rpdy = fvs * (x - px) + py

	  expand:

	    pvns * x - pvns * rpdx + rpdy = fvs * x - fvs * px + py

	  switch:

	    fvs * x - fvs * px + py = pvns * x - pvns * rpdx + rpdy

	  solve for x:

	    fvs * x - pvns * x = fvs * px - pvns * rpdx - py + rpdy



	          fvs * px - pvns * rpdx + rpdy - py
	    x =  -----------------------------------
	                 fvs - pvns

	  and:

	    y = fvs * (x - px) + py



	INTERPOLATE:
	============

	Examples of point interpolation.

	The weight of the movement of the reference point gets bigger
	the further the other reference point is away, thus the safest
	option (that is avoiding 0/0 divisions) is to weight the
	original distance of the other point by the sum of both distances.

	If the sum of both distances is 0, then move the point by the
	arithmetic average of the movement of both reference points.




	           (+6)
	    rp1o *---->*rp1
	         .     .                          (+12)
	         .     .                  rp2o *---------->* rp2
	         .     .                       .           .
	         .     .                       .           .
	         .    10          20           .           .
	         |.........|...................|           .
	               .   .                               .
	               .   . (+8)                          .
	                po *------>*p                      .
	               .           .                       .
	               .    12     .          24           .
	               |...........|.......................|
	                                  36


	-------



	           (+10)
	    rp1o *-------->*rp1
	         .         .                      (-10)
	         .         .              rp2 *<---------* rpo2
	         .         .                   .         .
	         .         .                   .         .
	         .    10   .          30       .         .
	         |.........|.............................|
	                   .                   .
	                   . (+5)              .
	                po *--->* p            .
	                   .    .              .
	                   .    .   20         .
	                   |....|..............|
	                     5        15


	-------


	           (+10)
	    rp1o *-------->*rp1
	         .         .
	         .         .
	    rp2o *-------->*rp2


	                               (+10)
	                          po *-------->* p

	-------


	           (+10)
	    rp1o *-------->*rp1
	         .         .
	         .         .(+30)
	    rp2o *---------------------------->*rp2


	                                        (+25)
	                          po *----------------------->* p



	vim: set ts=4 sw=4 expandtab:
	*****/

	/**
	 * Converts a string into a list of tokens.
	 */

	/**
	 * Create a new token
	 * @param {string} char a single char
	 */
	function Token(char) {
	    this.char = char;
	    this.state = {};
	    this.activeState = null;
	}

	/**
	 * Create a new context range
	 * @param {number} startIndex range start index
	 * @param {number} endOffset range end index offset
	 * @param {string} contextName owner context name
	 */
	function ContextRange(startIndex, endOffset, contextName) {
	    this.contextName = contextName;
	    this.startIndex = startIndex;
	    this.endOffset = endOffset;
	}

	/**
	 * Check context start and end
	 * @param {string} contextName a unique context name
	 * @param {function} checkStart a predicate function the indicates a context's start
	 * @param {function} checkEnd a predicate function the indicates a context's end
	 */
	function ContextChecker(contextName, checkStart, checkEnd) {
	    this.contextName = contextName;
	    this.openRange = null;
	    this.ranges = [];
	    this.checkStart = checkStart;
	    this.checkEnd = checkEnd;
	}

	/**
	 * @typedef ContextParams
	 * @type Object
	 * @property {array} context context items
	 * @property {number} currentIndex current item index
	 */

	/**
	 * Create a context params
	 * @param {array} context a list of items
	 * @param {number} currentIndex current item index
	 */
	function ContextParams(context, currentIndex) {
	    this.context = context;
	    this.index = currentIndex;
	    this.length = context.length;
	    this.current = context[currentIndex];
	    this.backtrack = context.slice(0, currentIndex);
	    this.lookahead = context.slice(currentIndex + 1);
	}

	/**
	 * Create an event instance
	 * @param {string} eventId event unique id
	 */
	function Event(eventId) {
	    this.eventId = eventId;
	    this.subscribers = [];
	}

	/**
	 * Initialize a core events and auto subscribe required event handlers
	 * @param {any} events an object that enlists core events handlers
	 */
	function initializeCoreEvents(events) {
	    var this$1 = this;

	    var coreEvents = [
	        'start', 'end', 'next', 'newToken', 'contextStart',
	        'contextEnd', 'insertToken', 'removeToken', 'removeRange',
	        'replaceToken', 'replaceRange', 'composeRUD', 'updateContextsRanges'
	    ];

	    coreEvents.forEach(function (eventId) {
	        Object.defineProperty(this$1.events, eventId, {
	            value: new Event(eventId)
	        });
	    });

	    if (!!events) {
	        coreEvents.forEach(function (eventId) {
	            var event = events[eventId];
	            if (typeof event === 'function') {
	                this$1.events[eventId].subscribe(event);
	            }
	        });
	    }
	    var requiresContextUpdate = [
	        'insertToken', 'removeToken', 'removeRange',
	        'replaceToken', 'replaceRange', 'composeRUD'
	    ];
	    requiresContextUpdate.forEach(function (eventId) {
	        this$1.events[eventId].subscribe(
	            this$1.updateContextsRanges
	        );
	    });
	}

	/**
	 * Converts a string into a list of tokens
	 * @param {any} events tokenizer core events
	 */
	function Tokenizer(events) {
	    this.tokens = [];
	    this.registeredContexts = {};
	    this.contextCheckers = [];
	    this.events = {};
	    this.registeredModifiers = [];

	    initializeCoreEvents.call(this, events);
	}

	/**
	 * Sets the state of a token, usually called by a state modifier.
	 * @param {string} key state item key
	 * @param {any} value state item value
	 */
	Token.prototype.setState = function(key, value) {
	    this.state[key] = value;
	    this.activeState = { key: key, value: this.state[key] };
	    return this.activeState;
	};

	Token.prototype.getState = function (stateId) {
	    return this.state[stateId] || null;
	};

	/**
	 * Checks if an index exists in the tokens list.
	 * @param {number} index token index
	 */
	Tokenizer.prototype.inboundIndex = function(index) {
	    return index >= 0 && index < this.tokens.length;
	};

	/**
	 * Compose and apply a list of operations (replace, update, delete)
	 * @param {array} RUDs replace, update and delete operations
	 * TODO: Perf. Optimization (lengthBefore === lengthAfter ? dispatch once)
	 */
	Tokenizer.prototype.composeRUD = function (RUDs) {
	    var this$1 = this;

	    var silent = true;
	    var state = RUDs.map(function (RUD) { return (
	        this$1[RUD[0]].apply(this$1, RUD.slice(1).concat(silent))
	    ); });
	    var hasFAILObject = function (obj) { return (
	        typeof obj === 'object' &&
	        obj.hasOwnProperty('FAIL')
	    ); };
	    if (state.every(hasFAILObject)) {
	        return {
	            FAIL: "composeRUD: one or more operations hasn't completed successfully",
	            report: state.filter(hasFAILObject)
	        };
	    }
	    this.dispatch('composeRUD', [state.filter(function (op) { return !hasFAILObject(op); })]);
	};

	/**
	 * Replace a range of tokens with a list of tokens
	 * @param {number} startIndex range start index
	 * @param {number} offset range offset
	 * @param {token} tokens a list of tokens to replace
	 * @param {boolean} silent dispatch events and update context ranges
	 */
	Tokenizer.prototype.replaceRange = function (startIndex, offset, tokens, silent) {
	    offset = offset !== null ? offset : this.tokens.length;
	    var isTokenType = tokens.every(function (token) { return token instanceof Token; });
	    if (!isNaN(startIndex) && this.inboundIndex(startIndex) && isTokenType) {
	        var replaced = this.tokens.splice.apply(
	            this.tokens, [startIndex, offset].concat(tokens)
	        );
	        if (!silent) { this.dispatch('replaceToken', [startIndex, offset, tokens]); }
	        return [replaced, tokens];
	    } else {
	        return { FAIL: 'replaceRange: invalid tokens or startIndex.' };
	    }
	};

	/**
	 * Replace a token with another token
	 * @param {number} index token index
	 * @param {token} token a token to replace
	 * @param {boolean} silent dispatch events and update context ranges
	 */
	Tokenizer.prototype.replaceToken = function (index, token, silent) {
	    if (!isNaN(index) && this.inboundIndex(index) && token instanceof Token) {
	        var replaced = this.tokens.splice(index, 1, token);
	        if (!silent) { this.dispatch('replaceToken', [index, token]); }
	        return [replaced[0], token];
	    } else {
	        return { FAIL: 'replaceToken: invalid token or index.' };
	    }
	};

	/**
	 * Removes a range of tokens
	 * @param {number} startIndex range start index
	 * @param {number} offset range offset
	 * @param {boolean} silent dispatch events and update context ranges
	 */
	Tokenizer.prototype.removeRange = function(startIndex, offset, silent) {
	    offset = !isNaN(offset) ? offset : this.tokens.length;
	    var tokens = this.tokens.splice(startIndex, offset);
	    if (!silent) { this.dispatch('removeRange', [tokens, startIndex, offset]); }
	    return tokens;
	};

	/**
	 * Remove a token at a certain index
	 * @param {number} index token index
	 * @param {boolean} silent dispatch events and update context ranges
	 */
	Tokenizer.prototype.removeToken = function(index, silent) {
	    if (!isNaN(index) && this.inboundIndex(index)) {
	        var token = this.tokens.splice(index, 1);
	        if (!silent) { this.dispatch('removeToken', [token, index]); }
	        return token;
	    } else {
	        return { FAIL: 'removeToken: invalid token index.' };
	    }
	};

	/**
	 * Insert a list of tokens at a certain index
	 * @param {array} tokens a list of tokens to insert
	 * @param {number} index insert the list of tokens at index
	 * @param {boolean} silent dispatch events and update context ranges
	 */
	Tokenizer.prototype.insertToken = function (tokens, index, silent) {
	    var tokenType = tokens.every(
	        function (token) { return token instanceof Token; }
	    );
	    if (tokenType) {
	        this.tokens.splice.apply(
	            this.tokens, [index, 0].concat(tokens)
	        );
	        if (!silent) { this.dispatch('insertToken', [tokens, index]); }
	        return tokens;
	    } else {
	        return { FAIL: 'insertToken: invalid token(s).' };
	    }
	};

	/**
	 * A state modifier that is called on 'newToken' event
	 * @param {string} modifierId state modifier id
	 * @param {function} condition a predicate function that returns true or false
	 * @param {function} modifier a function to update token state
	 */
	Tokenizer.prototype.registerModifier = function(modifierId, condition, modifier) {
	    this.events.newToken.subscribe(function(token, contextParams) {
	        var conditionParams = [token, contextParams];
	        var canApplyModifier = (
	            condition === null ||
	            condition.apply(this, conditionParams) === true
	        );
	        var modifierParams = [token, contextParams];
	        if (canApplyModifier) {
	            var newStateValue = modifier.apply(this, modifierParams);
	            token.setState(modifierId, newStateValue);
	        }
	    });
	    this.registeredModifiers.push(modifierId);
	};

	/**
	 * Subscribe a handler to an event
	 * @param {function} eventHandler an event handler function
	 */
	Event.prototype.subscribe = function (eventHandler) {
	    if (typeof eventHandler === 'function') {
	        return ((this.subscribers.push(eventHandler)) - 1);
	    } else {
	        return { FAIL: ("invalid '" + (this.eventId) + "' event handler")};
	    }
	};

	/**
	 * Unsubscribe an event handler
	 * @param {string} subsId subscription id
	 */
	Event.prototype.unsubscribe = function (subsId) {
	    this.subscribers.splice(subsId, 1);
	};

	/**
	 * Sets context params current value index
	 * @param {number} index context params current value index
	 */
	ContextParams.prototype.setCurrentIndex = function(index) {
	    this.index = index;
	    this.current = this.context[index];
	    this.backtrack = this.context.slice(0, index);
	    this.lookahead = this.context.slice(index + 1);
	};

	/**
	 * Get an item at an offset from the current value
	 * example (current value is 3):
	 *  1    2   [3]   4    5   |   items values
	 * -2   -1    0    1    2   |   offset values
	 * @param {number} offset an offset from current value index
	 */
	ContextParams.prototype.get = function (offset) {
	    switch (true) {
	        case (offset === 0):
	            return this.current;
	        case (offset < 0 && Math.abs(offset) <= this.backtrack.length):
	            return this.backtrack.slice(offset)[0];
	        case (offset > 0 && offset <= this.lookahead.length):
	            return this.lookahead[offset - 1];
	        default:
	            return null;
	    }
	};

	/**
	 * Converts a context range into a string value
	 * @param {contextRange} range a context range
	 */
	Tokenizer.prototype.rangeToText = function (range) {
	    if (range instanceof ContextRange) {
	        return (
	            this.getRangeTokens(range)
	                .map(function (token) { return token.char; }).join('')
	        );
	    }
	};

	/**
	 * Converts all tokens into a string
	 */
	Tokenizer.prototype.getText = function () {
	    return this.tokens.map(function (token) { return token.char; }).join('');
	};

	/**
	 * Get a context by name
	 * @param {string} contextName context name to get
	 */
	Tokenizer.prototype.getContext = function (contextName) {
	    var context = this.registeredContexts[contextName];
	    return !!context ? context : null;
	};

	/**
	 * Subscribes a new event handler to an event
	 * @param {string} eventName event name to subscribe to
	 * @param {function} eventHandler a function to be invoked on event
	 */
	Tokenizer.prototype.on = function(eventName, eventHandler) {
	    var event = this.events[eventName];
	    if (!!event) {
	        return event.subscribe(eventHandler);
	    } else {
	        return null;
	    }
	};

	/**
	 * Dispatches an event
	 * @param {string} eventName event name
	 * @param {any} args event handler arguments
	 */
	Tokenizer.prototype.dispatch = function(eventName, args) {
	    var this$1 = this;

	    var event = this.events[eventName];
	    if (event instanceof Event) {
	        event.subscribers.forEach(function (subscriber) {
	            subscriber.apply(this$1, args || []);
	        });
	    }
	};

	/**
	 * Register a new context checker
	 * @param {string} contextName a unique context name
	 * @param {function} contextStartCheck a predicate function that returns true on context start
	 * @param {function} contextEndCheck  a predicate function that returns true on context end
	 * TODO: call tokenize on registration to update context ranges with the new context.
	 */
	Tokenizer.prototype.registerContextChecker = function(contextName, contextStartCheck, contextEndCheck) {
	    if (!!this.getContext(contextName)) { return {
	        FAIL:
	        ("context name '" + contextName + "' is already registered.")
	    }; }
	    if (typeof contextStartCheck !== 'function') { return {
	        FAIL:
	        "missing context start check."
	    }; }
	    if (typeof contextEndCheck !== 'function') { return {
	        FAIL:
	        "missing context end check."
	    }; }
	    var contextCheckers = new ContextChecker(
	        contextName, contextStartCheck, contextEndCheck
	    );
	    this.registeredContexts[contextName] = contextCheckers;
	    this.contextCheckers.push(contextCheckers);
	    return contextCheckers;
	};

	/**
	 * Gets a context range tokens
	 * @param {contextRange} range a context range
	 */
	Tokenizer.prototype.getRangeTokens = function(range) {
	    var endIndex = range.startIndex + range.endOffset;
	    return [].concat(
	        this.tokens
	            .slice(range.startIndex, endIndex)
	    );
	};

	/**
	 * Gets the ranges of a context
	 * @param {string} contextName context name
	 */
	Tokenizer.prototype.getContextRanges = function(contextName) {
	    var context = this.getContext(contextName);
	    if (!!context) {
	        return context.ranges;
	    } else {
	        return { FAIL: ("context checker '" + contextName + "' is not registered.") };
	    }
	};

	/**
	 * Resets context ranges to run context update
	 */
	Tokenizer.prototype.resetContextsRanges = function () {
	    var registeredContexts = this.registeredContexts;
	    for (var contextName in registeredContexts) {
	        if (registeredContexts.hasOwnProperty(contextName)) {
	            var context = registeredContexts[contextName];
	            context.ranges = [];
	        }
	    }
	};

	/**
	 * Updates context ranges
	 */
	Tokenizer.prototype.updateContextsRanges = function () {
	    this.resetContextsRanges();
	    var chars = this.tokens.map(function (token) { return token.char; });
	    for (var i = 0; i < chars.length; i++) {
	        var contextParams = new ContextParams(chars, i);
	        this.runContextCheck(contextParams);
	    }
	    this.dispatch('updateContextsRanges', [this.registeredContexts]);
	};

	/**
	 * Sets the end offset of an open range
	 * @param {number} offset range end offset
	 * @param {string} contextName context name
	 */
	Tokenizer.prototype.setEndOffset = function (offset, contextName) {
	    var startIndex = this.getContext(contextName).openRange.startIndex;
	    var range = new ContextRange(startIndex, offset, contextName);
	    var ranges = this.getContext(contextName).ranges;
	    range.rangeId = contextName + "." + (ranges.length);
	    ranges.push(range);
	    this.getContext(contextName).openRange = null;
	    return range;
	};

	/**
	 * Runs a context check on the current context
	 * @param {contextParams} contextParams current context params
	 */
	Tokenizer.prototype.runContextCheck = function(contextParams) {
	    var this$1 = this;

	    var index = contextParams.index;
	    this.contextCheckers.forEach(function (contextChecker) {
	        var contextName = contextChecker.contextName;
	        var openRange = this$1.getContext(contextName).openRange;
	        if (!openRange && contextChecker.checkStart(contextParams)) {
	            openRange = new ContextRange(index, null, contextName);
	            this$1.getContext(contextName).openRange = openRange;
	            this$1.dispatch('contextStart', [contextName, index]);
	        }
	        if (!!openRange && contextChecker.checkEnd(contextParams)) {
	            var offset = (index - openRange.startIndex) + 1;
	            var range = this$1.setEndOffset(offset, contextName);
	            this$1.dispatch('contextEnd', [contextName, range]);
	        }
	    });
	};

	/**
	 * Converts a text into a list of tokens
	 * @param {string} text a text to tokenize
	 */
	Tokenizer.prototype.tokenize = function (text) {
	    this.tokens = [];
	    this.resetContextsRanges();
	    var chars = Array.from(text);
	    this.dispatch('start');
	    for (var i = 0; i < chars.length; i++) {
	        var char = chars[i];
	        var contextParams = new ContextParams(chars, i);
	        this.dispatch('next', [contextParams]);
	        this.runContextCheck(contextParams);
	        var token = new Token(char);
	        this.tokens.push(token);
	        this.dispatch('newToken', [token, contextParams]);
	    }
	    this.dispatch('end', [this.tokens]);
	    return this.tokens;
	};

	// ╭─┄┄┄────────────────────────┄─────────────────────────────────────────────╮
	// ┊ Character Class Assertions ┊ Checks if a char belongs to a certain class ┊
	// ╰─╾──────────────────────────┄─────────────────────────────────────────────╯
	// jscs:disable maximumLineLength
	/**
	 * Check if a char is Arabic
	 * @param {string} c a single char
	 */
	function isArabicChar(c) {
	    return /[\u0600-\u065F\u066A-\u06D2\u06FA-\u06FF]/.test(c);
	}

	/**
	 * Check if a char is an isolated arabic char
	 * @param {string} c a single char
	 */
	function isIsolatedArabicChar(char) {
	    return /[\u0630\u0690\u0621\u0631\u0661\u0671\u0622\u0632\u0672\u0692\u06C2\u0623\u0673\u0693\u06C3\u0624\u0694\u06C4\u0625\u0675\u0695\u06C5\u06E5\u0676\u0696\u06C6\u0627\u0677\u0697\u06C7\u0648\u0688\u0698\u06C8\u0689\u0699\u06C9\u068A\u06CA\u066B\u068B\u06CB\u068C\u068D\u06CD\u06FD\u068E\u06EE\u06FE\u062F\u068F\u06CF\u06EF]/.test(char);
	}

	/**
	 * Check if a char is an Arabic Tashkeel char
	 * @param {string} c a single char
	 */
	function isTashkeelArabicChar(char) {
	    return /[\u0600-\u0605\u060C-\u060E\u0610-\u061B\u061E\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED]/.test(char);
	}

	/**
	 * Check if a char is Latin
	 * @param {string} c a single char
	 */
	function isLatinChar(c) {
	    return /[A-z]/.test(c);
	}

	/**
	 * Check if a char is whitespace char
	 * @param {string} c a single char
	 */
	function isWhiteSpace(c) {
	    return /\s/.test(c);
	}

	/**
	 * Query a feature by some of it's properties to lookup a glyph substitution.
	 */

	/**
	 * Create feature query instance
	 * @param {Font} font opentype font instance
	 */
	function FeatureQuery(font) {
	    this.font = font;
	    this.features = {};
	}

	/**
	 * @typedef SubstitutionAction
	 * @type Object
	 * @property {number} id substitution type
	 * @property {string} tag feature tag
	 * @property {any} substitution substitution value(s)
	 */

	/**
	 * Create a substitution action instance
	 * @param {SubstitutionAction} action
	 */
	function SubstitutionAction(action) {
	    this.id = action.id;
	    this.tag = action.tag;
	    this.substitution = action.substitution;
	}

	/**
	 * Lookup a coverage table
	 * @param {number} glyphIndex glyph index
	 * @param {CoverageTable} coverage coverage table
	 */
	function lookupCoverage(glyphIndex, coverage) {
	    if (!glyphIndex) { return -1; }
	    switch (coverage.format) {
	        case 1:
	            return coverage.glyphs.indexOf(glyphIndex);

	        case 2:
	            var ranges = coverage.ranges;
	            for (var i = 0; i < ranges.length; i++) {
	                var range = ranges[i];
	                if (glyphIndex >= range.start && glyphIndex <= range.end) {
	                    var offset = glyphIndex - range.start;
	                    return range.index + offset;
	                }
	            }
	            break;
	        default:
	            return -1; // not found
	    }
	    return -1;
	}

	/**
	 * Handle a single substitution - format 1
	 * @param {ContextParams} contextParams context params to lookup
	 */
	function singleSubstitutionFormat1(glyphIndex, subtable) {
	    var substituteIndex = lookupCoverage(glyphIndex, subtable.coverage);
	    if (substituteIndex === -1) { return null; }
	    return glyphIndex + subtable.deltaGlyphId;
	}

	/**
	 * Handle a single substitution - format 2
	 * @param {ContextParams} contextParams context params to lookup
	 */
	function singleSubstitutionFormat2(glyphIndex, subtable) {
	    var substituteIndex = lookupCoverage(glyphIndex, subtable.coverage);
	    if (substituteIndex === -1) { return null; }
	    return subtable.substitute[substituteIndex];
	}

	/**
	 * Lookup a list of coverage tables
	 * @param {any} coverageList a list of coverage tables
	 * @param {ContextParams} contextParams context params to lookup
	 */
	function lookupCoverageList(coverageList, contextParams) {
	    var lookupList = [];
	    for (var i = 0; i < coverageList.length; i++) {
	        var coverage = coverageList[i];
	        var glyphIndex = contextParams.current;
	        glyphIndex = Array.isArray(glyphIndex) ? glyphIndex[0] : glyphIndex;
	        var lookupIndex = lookupCoverage(glyphIndex, coverage);
	        if (lookupIndex !== -1) {
	            lookupList.push(lookupIndex);
	        }
	    }
	    if (lookupList.length !== coverageList.length) { return -1; }
	    return lookupList;
	}

	/**
	 * Handle chaining context substitution - format 3
	 * @param {ContextParams} contextParams context params to lookup
	 */
	function chainingSubstitutionFormat3(contextParams, subtable) {
	    var lookupsCount = (
	        subtable.inputCoverage.length +
	        subtable.lookaheadCoverage.length +
	        subtable.backtrackCoverage.length
	    );
	    if (contextParams.context.length < lookupsCount) { return []; }
	    // INPUT LOOKUP //
	    var inputLookups = lookupCoverageList(
	        subtable.inputCoverage, contextParams
	    );
	    if (inputLookups === -1) { return []; }
	    // LOOKAHEAD LOOKUP //
	    var lookaheadOffset = subtable.inputCoverage.length - 1;
	    if (contextParams.lookahead.length < subtable.lookaheadCoverage.length) { return []; }
	    var lookaheadContext = contextParams.lookahead.slice(lookaheadOffset);
	    while (lookaheadContext.length && isTashkeelArabicChar(lookaheadContext[0].char)) {
	        lookaheadContext.shift();
	    }
	    var lookaheadParams = new ContextParams(lookaheadContext, 0);
	    var lookaheadLookups = lookupCoverageList(
	        subtable.lookaheadCoverage, lookaheadParams
	    );
	    // BACKTRACK LOOKUP //
	    var backtrackContext = [].concat(contextParams.backtrack);
	    backtrackContext.reverse();
	    while (backtrackContext.length && isTashkeelArabicChar(backtrackContext[0].char)) {
	        backtrackContext.shift();
	    }
	    if (backtrackContext.length < subtable.backtrackCoverage.length) { return []; }
	    var backtrackParams = new ContextParams(backtrackContext, 0);
	    var backtrackLookups = lookupCoverageList(
	        subtable.backtrackCoverage, backtrackParams
	    );
	    var contextRulesMatch = (
	        inputLookups.length === subtable.inputCoverage.length &&
	        lookaheadLookups.length === subtable.lookaheadCoverage.length &&
	        backtrackLookups.length === subtable.backtrackCoverage.length
	    );
	    var substitutions = [];
	    if (contextRulesMatch) {
	        for (var i = 0; i < subtable.lookupRecords.length; i++) {
	            var lookupRecord = subtable.lookupRecords[i];
	            var lookupListIndex = lookupRecord.lookupListIndex;
	            var lookupTable = this.getLookupByIndex(lookupListIndex);
	            for (var s = 0; s < lookupTable.subtables.length; s++) {
	                var subtable$1 = lookupTable.subtables[s];
	                var lookup = this.getLookupMethod(lookupTable, subtable$1);
	                var substitutionType = this.getSubstitutionType(lookupTable, subtable$1);
	                if (substitutionType === '12') {
	                    for (var n = 0; n < inputLookups.length; n++) {
	                        var glyphIndex = contextParams.get(n);
	                        var substitution = lookup(glyphIndex);
	                        if (substitution) { substitutions.push(substitution); }
	                    }
	                }
	            }
	        }
	    }
	    return substitutions;
	}

	/**
	 * Handle ligature substitution - format 1
	 * @param {ContextParams} contextParams context params to lookup
	 */
	function ligatureSubstitutionFormat1(contextParams, subtable) {
	    // COVERAGE LOOKUP //
	    var glyphIndex = contextParams.current;
	    var ligSetIndex = lookupCoverage(glyphIndex, subtable.coverage);
	    if (ligSetIndex === -1) { return null; }
	    // COMPONENTS LOOKUP
	    // (!) note, components are ordered in the written direction.
	    var ligature;
	    var ligatureSet = subtable.ligatureSets[ligSetIndex];
	    for (var s = 0; s < ligatureSet.length; s++) {
	        ligature = ligatureSet[s];
	        for (var l = 0; l < ligature.components.length; l++) {
	            var lookaheadItem = contextParams.lookahead[l];
	            var component = ligature.components[l];
	            if (lookaheadItem !== component) { break; }
	            if (l === ligature.components.length - 1) { return ligature; }
	        }
	    }
	    return null;
	}

	/**
	 * Handle decomposition substitution - format 1
	 * @param {number} glyphIndex glyph index
	 * @param {any} subtable subtable
	 */
	function decompositionSubstitutionFormat1(glyphIndex, subtable) {
	    var substituteIndex = lookupCoverage(glyphIndex, subtable.coverage);
	    if (substituteIndex === -1) { return null; }
	    return subtable.sequences[substituteIndex];
	}

	/**
	 * Get default script features indexes
	 */
	FeatureQuery.prototype.getDefaultScriptFeaturesIndexes = function () {
	    var scripts = this.font.tables.gsub.scripts;
	    for (var s = 0; s < scripts.length; s++) {
	        var script = scripts[s];
	        if (script.tag === 'DFLT') { return (
	            script.script.defaultLangSys.featureIndexes
	        ); }
	    }
	    return [];
	};

	/**
	 * Get feature indexes of a specific script
	 * @param {string} scriptTag script tag
	 */
	FeatureQuery.prototype.getScriptFeaturesIndexes = function(scriptTag) {
	    var tables = this.font.tables;
	    if (!tables.gsub) { return []; }
	    if (!scriptTag) { return this.getDefaultScriptFeaturesIndexes(); }
	    var scripts = this.font.tables.gsub.scripts;
	    for (var i = 0; i < scripts.length; i++) {
	        var script = scripts[i];
	        if (script.tag === scriptTag && script.script.defaultLangSys) {
	            return script.script.defaultLangSys.featureIndexes;
	        } else {
	            var langSysRecords = script.langSysRecords;
	            if (!!langSysRecords) {
	                for (var j = 0; j < langSysRecords.length; j++) {
	                    var langSysRecord = langSysRecords[j];
	                    if (langSysRecord.tag === scriptTag) {
	                        var langSys = langSysRecord.langSys;
	                        return langSys.featureIndexes;
	                    }
	                }
	            }
	        }
	    }
	    return this.getDefaultScriptFeaturesIndexes();
	};

	/**
	 * Map a feature tag to a gsub feature
	 * @param {any} features gsub features
	 * @param {string} scriptTag script tag
	 */
	FeatureQuery.prototype.mapTagsToFeatures = function (features, scriptTag) {
	    var tags = {};
	    for (var i = 0; i < features.length; i++) {
	        var tag = features[i].tag;
	        var feature = features[i].feature;
	        tags[tag] = feature;
	    }
	    this.features[scriptTag].tags = tags;
	};

	/**
	 * Get features of a specific script
	 * @param {string} scriptTag script tag
	 */
	FeatureQuery.prototype.getScriptFeatures = function (scriptTag) {
	    var features = this.features[scriptTag];
	    if (this.features.hasOwnProperty(scriptTag)) { return features; }
	    var featuresIndexes = this.getScriptFeaturesIndexes(scriptTag);
	    if (!featuresIndexes) { return null; }
	    var gsub = this.font.tables.gsub;
	    features = featuresIndexes.map(function (index) { return gsub.features[index]; });
	    this.features[scriptTag] = features;
	    this.mapTagsToFeatures(features, scriptTag);
	    return features;
	};

	/**
	 * Get substitution type
	 * @param {any} lookupTable lookup table
	 * @param {any} subtable subtable
	 */
	FeatureQuery.prototype.getSubstitutionType = function(lookupTable, subtable) {
	    var lookupType = lookupTable.lookupType.toString();
	    var substFormat = subtable.substFormat.toString();
	    return lookupType + substFormat;
	};

	/**
	 * Get lookup method
	 * @param {any} lookupTable lookup table
	 * @param {any} subtable subtable
	 */
	FeatureQuery.prototype.getLookupMethod = function(lookupTable, subtable) {
	    var this$1 = this;

	    var substitutionType = this.getSubstitutionType(lookupTable, subtable);
	    switch (substitutionType) {
	        case '11':
	            return function (glyphIndex) { return singleSubstitutionFormat1.apply(
	                this$1, [glyphIndex, subtable]
	            ); };
	        case '12':
	            return function (glyphIndex) { return singleSubstitutionFormat2.apply(
	                this$1, [glyphIndex, subtable]
	            ); };
	        case '63':
	            return function (contextParams) { return chainingSubstitutionFormat3.apply(
	                this$1, [contextParams, subtable]
	            ); };
	        case '41':
	            return function (contextParams) { return ligatureSubstitutionFormat1.apply(
	                this$1, [contextParams, subtable]
	            ); };
	        case '21':
	            return function (glyphIndex) { return decompositionSubstitutionFormat1.apply(
	                this$1, [glyphIndex, subtable]
	            ); };
	        default:
	            throw new Error(
	                "lookupType: " + (lookupTable.lookupType) + " - " +
	                "substFormat: " + (subtable.substFormat) + " " +
	                "is not yet supported"
	            );
	    }
	};

	/**
	 * [ LOOKUP TYPES ]
	 * -------------------------------
	 * Single                        1;
	 * Multiple                      2;
	 * Alternate                     3;
	 * Ligature                      4;
	 * Context                       5;
	 * ChainingContext               6;
	 * ExtensionSubstitution         7;
	 * ReverseChainingContext        8;
	 * -------------------------------
	 *
	 */

	/**
	 * @typedef FQuery
	 * @type Object
	 * @param {string} tag feature tag
	 * @param {string} script feature script
	 * @param {ContextParams} contextParams context params
	 */

	/**
	 * Lookup a feature using a query parameters
	 * @param {FQuery} query feature query
	 */
	FeatureQuery.prototype.lookupFeature = function (query) {
	    var contextParams = query.contextParams;
	    var currentIndex = contextParams.index;
	    var feature = this.getFeature({
	        tag: query.tag, script: query.script
	    });
	    if (!feature) { return new Error(
	        "font '" + (this.font.names.fullName.en) + "' " +
	        "doesn't support feature '" + (query.tag) + "' " +
	        "for script '" + (query.script) + "'."
	    ); }
	    var lookups = this.getFeatureLookups(feature);
	    var substitutions = [].concat(contextParams.context);
	    for (var l = 0; l < lookups.length; l++) {
	        var lookupTable = lookups[l];
	        var subtables = this.getLookupSubtables(lookupTable);
	        for (var s = 0; s < subtables.length; s++) {
	            var subtable = subtables[s];
	            var substType = this.getSubstitutionType(lookupTable, subtable);
	            var lookup = this.getLookupMethod(lookupTable, subtable);
	            var substitution = (void 0);
	            switch (substType) {
	                case '11':
	                    substitution = lookup(contextParams.current);
	                    if (substitution) {
	                        substitutions.splice(currentIndex, 1, new SubstitutionAction({
	                            id: 11, tag: query.tag, substitution: substitution
	                        }));
	                    }
	                    break;
	                case '12':
	                    substitution = lookup(contextParams.current);
	                    if (substitution) {
	                        substitutions.splice(currentIndex, 1, new SubstitutionAction({
	                            id: 12, tag: query.tag, substitution: substitution
	                        }));
	                    }
	                    break;
	                case '63':
	                    substitution = lookup(contextParams);
	                    if (Array.isArray(substitution) && substitution.length) {
	                        substitutions.splice(currentIndex, 1, new SubstitutionAction({
	                            id: 63, tag: query.tag, substitution: substitution
	                        }));
	                    }
	                    break;
	                case '41':
	                    substitution = lookup(contextParams);
	                    if (substitution) {
	                        substitutions.splice(currentIndex, 1, new SubstitutionAction({
	                            id: 41, tag: query.tag, substitution: substitution
	                        }));
	                    }
	                    break;
	                case '21':
	                    substitution = lookup(contextParams.current);
	                    if (substitution) {
	                        substitutions.splice(currentIndex, 1, new SubstitutionAction({
	                            id: 21, tag: query.tag, substitution: substitution
	                        }));
	                    }
	                    break;
	            }
	            contextParams = new ContextParams(substitutions, currentIndex);
	            if (Array.isArray(substitution) && !substitution.length) { continue; }
	            substitution = null;
	        }
	    }
	    return substitutions.length ? substitutions : null;
	};

	/**
	 * Checks if a font supports a specific features
	 * @param {FQuery} query feature query object
	 */
	FeatureQuery.prototype.supports = function (query) {
	    if (!query.script) { return false; }
	    this.getScriptFeatures(query.script);
	    var supportedScript = this.features.hasOwnProperty(query.script);
	    if (!query.tag) { return supportedScript; }
	    var supportedFeature = (
	        this.features[query.script].some(function (feature) { return feature.tag === query.tag; })
	    );
	    return supportedScript && supportedFeature;
	};

	/**
	 * Get lookup table subtables
	 * @param {any} lookupTable lookup table
	 */
	FeatureQuery.prototype.getLookupSubtables = function (lookupTable) {
	    return lookupTable.subtables || null;
	};

	/**
	 * Get lookup table by index
	 * @param {number} index lookup table index
	 */
	FeatureQuery.prototype.getLookupByIndex = function (index) {
	    var lookups = this.font.tables.gsub.lookups;
	    return lookups[index] || null;
	};

	/**
	 * Get lookup tables for a feature
	 * @param {string} feature
	 */
	FeatureQuery.prototype.getFeatureLookups = function (feature) {
	    // TODO: memoize
	    return feature.lookupListIndexes.map(this.getLookupByIndex.bind(this));
	};

	/**
	 * Query a feature by it's properties
	 * @param {any} query an object that describes the properties of a query
	 */
	FeatureQuery.prototype.getFeature = function getFeature(query) {
	    if (!this.font) { return { FAIL: "No font was found"}; }
	    if (!this.features.hasOwnProperty(query.script)) {
	        this.getScriptFeatures(query.script);
	    }
	    var scriptFeatures = this.features[query.script];
	    if (!scriptFeatures) { return (
	        { FAIL: ("No feature for script " + (query.script))}
	    ); }
	    if (!scriptFeatures.tags[query.tag]) { return null; }
	    return this.features[query.script].tags[query.tag];
	};

	/**
	 * Arabic word context checkers
	 */

	function arabicWordStartCheck(contextParams) {
	    var char = contextParams.current;
	    var prevChar = contextParams.get(-1);
	    return (
	        // ? arabic first char
	        (prevChar === null && isArabicChar(char)) ||
	        // ? arabic char preceded with a non arabic char
	        (!isArabicChar(prevChar) && isArabicChar(char))
	    );
	}

	function arabicWordEndCheck(contextParams) {
	    var nextChar = contextParams.get(1);
	    return (
	        // ? last arabic char
	        (nextChar === null) ||
	        // ? next char is not arabic
	        (!isArabicChar(nextChar))
	    );
	}

	var arabicWordCheck = {
	    startCheck: arabicWordStartCheck,
	    endCheck: arabicWordEndCheck
	};

	/**
	 * Arabic sentence context checkers
	 */

	function arabicSentenceStartCheck(contextParams) {
	    var char = contextParams.current;
	    var prevChar = contextParams.get(-1);
	    return (
	        // ? an arabic char preceded with a non arabic char
	        (isArabicChar(char) || isTashkeelArabicChar(char)) &&
	        !isArabicChar(prevChar)
	    );
	}

	function arabicSentenceEndCheck(contextParams) {
	    var nextChar = contextParams.get(1);
	    switch (true) {
	        case nextChar === null:
	            return true;
	        case (!isArabicChar(nextChar) && !isTashkeelArabicChar(nextChar)):
	            var nextIsWhitespace = isWhiteSpace(nextChar);
	            if (!nextIsWhitespace) { return true; }
	            if (nextIsWhitespace) {
	                var arabicCharAhead = false;
	                arabicCharAhead = (
	                    contextParams.lookahead.some(
	                        function (c) { return isArabicChar(c) || isTashkeelArabicChar(c); }
	                    )
	                );
	                if (!arabicCharAhead) { return true; }
	            }
	            break;
	        default:
	            return false;
	    }
	}

	var arabicSentenceCheck = {
	    startCheck: arabicSentenceStartCheck,
	    endCheck: arabicSentenceEndCheck
	};

	/**
	 * Apply single substitution format 1
	 * @param {Array} substitutions substitutions
	 * @param {any} tokens a list of tokens
	 * @param {number} index token index
	 */
	function singleSubstitutionFormat1$1(action, tokens, index) {
	    tokens[index].setState(action.tag, action.substitution);
	}

	/**
	 * Apply single substitution format 2
	 * @param {Array} substitutions substitutions
	 * @param {any} tokens a list of tokens
	 * @param {number} index token index
	 */
	function singleSubstitutionFormat2$1(action, tokens, index) {
	    tokens[index].setState(action.tag, action.substitution);
	}

	/**
	 * Apply chaining context substitution format 3
	 * @param {Array} substitutions substitutions
	 * @param {any} tokens a list of tokens
	 * @param {number} index token index
	 */
	function chainingSubstitutionFormat3$1(action, tokens, index) {
	    action.substitution.forEach(function (subst, offset) {
	        var token = tokens[index + offset];
	        token.setState(action.tag, subst);
	    });
	}

	/**
	 * Apply ligature substitution format 1
	 * @param {Array} substitutions substitutions
	 * @param {any} tokens a list of tokens
	 * @param {number} index token index
	 */
	function ligatureSubstitutionFormat1$1(action, tokens, index) {
	    var token = tokens[index];
	    token.setState(action.tag, action.substitution.ligGlyph);
	    var compsCount = action.substitution.components.length;
	    for (var i = 0; i < compsCount; i++) {
	        token = tokens[index + i + 1];
	        token.setState('deleted', true);
	    }
	}

	/**
	 * Supported substitutions
	 */
	var SUBSTITUTIONS = {
	    11: singleSubstitutionFormat1$1,
	    12: singleSubstitutionFormat2$1,
	    63: chainingSubstitutionFormat3$1,
	    41: ligatureSubstitutionFormat1$1
	};

	/**
	 * Apply substitutions to a list of tokens
	 * @param {Array} substitutions substitutions
	 * @param {any} tokens a list of tokens
	 * @param {number} index token index
	 */
	function applySubstitution(action, tokens, index) {
	    if (action instanceof SubstitutionAction && SUBSTITUTIONS[action.id]) {
	        SUBSTITUTIONS[action.id](action, tokens, index);
	    }
	}

	/**
	 * Apply Arabic presentation forms to a range of tokens
	 */

	/**
	 * Check if a char can be connected to it's preceding char
	 * @param {ContextParams} charContextParams context params of a char
	 */
	function willConnectPrev(charContextParams) {
	    var backtrack = [].concat(charContextParams.backtrack);
	    for (var i = backtrack.length - 1; i >= 0; i--) {
	        var prevChar = backtrack[i];
	        var isolated = isIsolatedArabicChar(prevChar);
	        var tashkeel = isTashkeelArabicChar(prevChar);
	        if (!isolated && !tashkeel) { return true; }
	        if (isolated) { return false; }
	    }
	    return false;
	}

	/**
	 * Check if a char can be connected to it's proceeding char
	 * @param {ContextParams} charContextParams context params of a char
	 */
	function willConnectNext(charContextParams) {
	    if (isIsolatedArabicChar(charContextParams.current)) { return false; }
	    for (var i = 0; i < charContextParams.lookahead.length; i++) {
	        var nextChar = charContextParams.lookahead[i];
	        var tashkeel = isTashkeelArabicChar(nextChar);
	        if (!tashkeel) { return true; }
	    }
	    return false;
	}

	/**
	 * Apply arabic presentation forms to a list of tokens
	 * @param {ContextRange} range a range of tokens
	 */
	function arabicPresentationForms(range) {
	    var this$1 = this;

	    var script = 'arab';
	    var tags = this.featuresTags[script];
	    var tokens = this.tokenizer.getRangeTokens(range);
	    if (tokens.length === 1) { return; }
	    var contextParams = new ContextParams(
	        tokens.map(function (token) { return token.getState('glyphIndex'); }
	    ), 0);
	    var charContextParams = new ContextParams(
	        tokens.map(function (token) { return token.char; }
	    ), 0);
	    tokens.forEach(function (token, index) {
	        if (isTashkeelArabicChar(token.char)) { return; }
	        contextParams.setCurrentIndex(index);
	        charContextParams.setCurrentIndex(index);
	        var CONNECT = 0; // 2 bits 00 (10: can connect next) (01: can connect prev)
	        if (willConnectPrev(charContextParams)) { CONNECT |= 1; }
	        if (willConnectNext(charContextParams)) { CONNECT |= 2; }
	        var tag;
	        switch (CONNECT) {
	            case 1: (tag = 'fina'); break;
	            case 2: (tag = 'init'); break;
	            case 3: (tag = 'medi'); break;
	        }
	        if (tags.indexOf(tag) === -1) { return; }
	        var substitutions = this$1.query.lookupFeature({
	            tag: tag, script: script, contextParams: contextParams
	        });
	        if (substitutions instanceof Error) { return console.info(substitutions.message); }
	        substitutions.forEach(function (action, index) {
	            if (action instanceof SubstitutionAction) {
	                applySubstitution(action, tokens, index);
	                contextParams.context[index] = action.substitution;
	            }
	        });
	    });
	}

	/**
	 * Apply Arabic required ligatures feature to a range of tokens
	 */

	/**
	 * Update context params
	 * @param {any} tokens a list of tokens
	 * @param {number} index current item index
	 */
	function getContextParams(tokens, index) {
	    var context = tokens.map(function (token) { return token.activeState.value; });
	    return new ContextParams(context, index || 0);
	}

	/**
	 * Apply Arabic required ligatures to a context range
	 * @param {ContextRange} range a range of tokens
	 */
	function arabicRequiredLigatures(range) {
	    var this$1 = this;

	    var script = 'arab';
	    var tokens = this.tokenizer.getRangeTokens(range);
	    var contextParams = getContextParams(tokens);
	    contextParams.context.forEach(function (glyphIndex, index) {
	        contextParams.setCurrentIndex(index);
	        var substitutions = this$1.query.lookupFeature({
	            tag: 'rlig', script: script, contextParams: contextParams
	        });
	        if (substitutions.length) {
	            substitutions.forEach(
	                function (action) { return applySubstitution(action, tokens, index); }
	            );
	            contextParams = getContextParams(tokens);
	        }
	    });
	}

	/**
	 * Latin word context checkers
	 */

	function latinWordStartCheck(contextParams) {
	    var char = contextParams.current;
	    var prevChar = contextParams.get(-1);
	    return (
	        // ? latin first char
	        (prevChar === null && isLatinChar(char)) ||
	        // ? latin char preceded with a non latin char
	        (!isLatinChar(prevChar) && isLatinChar(char))
	    );
	}

	function latinWordEndCheck(contextParams) {
	    var nextChar = contextParams.get(1);
	    return (
	        // ? last latin char
	        (nextChar === null) ||
	        // ? next char is not latin
	        (!isLatinChar(nextChar))
	    );
	}

	var latinWordCheck = {
	    startCheck: latinWordStartCheck,
	    endCheck: latinWordEndCheck
	};

	/**
	 * Apply Latin ligature feature to a range of tokens
	 */

	/**
	 * Update context params
	 * @param {any} tokens a list of tokens
	 * @param {number} index current item index
	 */
	function getContextParams$1(tokens, index) {
	    var context = tokens.map(function (token) { return token.activeState.value; });
	    return new ContextParams(context, index || 0);
	}

	/**
	 * Apply Arabic required ligatures to a context range
	 * @param {ContextRange} range a range of tokens
	 */
	function latinLigature(range) {
	    var this$1 = this;

	    var script = 'latn';
	    var tokens = this.tokenizer.getRangeTokens(range);
	    var contextParams = getContextParams$1(tokens);
	    contextParams.context.forEach(function (glyphIndex, index) {
	        contextParams.setCurrentIndex(index);
	        var substitutions = this$1.query.lookupFeature({
	            tag: 'liga', script: script, contextParams: contextParams
	        });
	        if (substitutions.length) {
	            substitutions.forEach(
	                function (action) { return applySubstitution(action, tokens, index); }
	            );
	            contextParams = getContextParams$1(tokens);
	        }
	    });
	}

	/**
	 * Infer bidirectional properties for a given text and apply
	 * the corresponding layout rules.
	 */

	/**
	 * Create Bidi. features
	 * @param {string} baseDir text base direction. value either 'ltr' or 'rtl'
	 */
	function Bidi(baseDir) {
	    this.baseDir = baseDir || 'ltr';
	    this.tokenizer = new Tokenizer();
	    this.featuresTags = {};
	}

	/**
	 * Sets Bidi text
	 * @param {string} text a text input
	 */
	Bidi.prototype.setText = function (text) {
	    this.text = text;
	};

	/**
	 * Store essential context checks:
	 * arabic word check for applying gsub features
	 * arabic sentence check for adjusting arabic layout
	 */
	Bidi.prototype.contextChecks = ({
	    latinWordCheck: latinWordCheck,
	    arabicWordCheck: arabicWordCheck,
	    arabicSentenceCheck: arabicSentenceCheck
	});

	/**
	 * Register arabic word check
	 */
	function registerContextChecker(checkId) {
	    var check = this.contextChecks[(checkId + "Check")];
	    return this.tokenizer.registerContextChecker(
	        checkId, check.startCheck, check.endCheck
	    );
	}

	/**
	 * Perform pre tokenization procedure then
	 * tokenize text input
	 */
	function tokenizeText() {
	    registerContextChecker.call(this, 'latinWord');
	    registerContextChecker.call(this, 'arabicWord');
	    registerContextChecker.call(this, 'arabicSentence');
	    return this.tokenizer.tokenize(this.text);
	}

	/**
	 * Reverse arabic sentence layout
	 * TODO: check base dir before applying adjustments - priority low
	 */
	function reverseArabicSentences() {
	    var this$1 = this;

	    var ranges = this.tokenizer.getContextRanges('arabicSentence');
	    ranges.forEach(function (range) {
	        var rangeTokens = this$1.tokenizer.getRangeTokens(range);
	        this$1.tokenizer.replaceRange(
	            range.startIndex,
	            range.endOffset,
	            rangeTokens.reverse()
	        );
	    });
	}

	/**
	 * Register supported features tags
	 * @param {script} script script tag
	 * @param {Array} tags features tags list
	 */
	Bidi.prototype.registerFeatures = function (script, tags) {
	    var this$1 = this;

	    var supportedTags = tags.filter(
	        function (tag) { return this$1.query.supports({script: script, tag: tag}); }
	    );
	    if (!this.featuresTags.hasOwnProperty(script)) {
	        this.featuresTags[script] = supportedTags;
	    } else {
	        this.featuresTags[script] =
	        this.featuresTags[script].concat(supportedTags);
	    }
	};

	/**
	 * Apply GSUB features
	 * @param {Array} tagsList a list of features tags
	 * @param {string} script a script tag
	 * @param {Font} font opentype font instance
	 */
	Bidi.prototype.applyFeatures = function (font, features) {
	    if (!font) { throw new Error(
	        'No valid font was provided to apply features'
	    ); }
	    if (!this.query) { this.query = new FeatureQuery(font); }
	    for (var f = 0; f < features.length; f++) {
	        var feature = features[f];
	        if (!this.query.supports({script: feature.script})) { continue; }
	        this.registerFeatures(feature.script, feature.tags);
	    }
	};

	/**
	 * Register a state modifier
	 * @param {string} modifierId state modifier id
	 * @param {function} condition a predicate function that returns true or false
	 * @param {function} modifier a modifier function to set token state
	 */
	Bidi.prototype.registerModifier = function (modifierId, condition, modifier) {
	    this.tokenizer.registerModifier(modifierId, condition, modifier);
	};

	/**
	 * Check if 'glyphIndex' is registered
	 */
	function checkGlyphIndexStatus() {
	    if (this.tokenizer.registeredModifiers.indexOf('glyphIndex') === -1) {
	        throw new Error(
	            'glyphIndex modifier is required to apply ' +
	            'arabic presentation features.'
	        );
	    }
	}

	/**
	 * Apply arabic presentation forms features
	 */
	function applyArabicPresentationForms() {
	    var this$1 = this;

	    var script = 'arab';
	    if (!this.featuresTags.hasOwnProperty(script)) { return; }
	    checkGlyphIndexStatus.call(this);
	    var ranges = this.tokenizer.getContextRanges('arabicWord');
	    ranges.forEach(function (range) {
	        arabicPresentationForms.call(this$1, range);
	    });
	}

	/**
	 * Apply required arabic ligatures
	 */
	function applyArabicRequireLigatures() {
	    var this$1 = this;

	    var script = 'arab';
	    if (!this.featuresTags.hasOwnProperty(script)) { return; }
	    var tags = this.featuresTags[script];
	    if (tags.indexOf('rlig') === -1) { return; }
	    checkGlyphIndexStatus.call(this);
	    var ranges = this.tokenizer.getContextRanges('arabicWord');
	    ranges.forEach(function (range) {
	        arabicRequiredLigatures.call(this$1, range);
	    });
	}

	/**
	 * Apply required arabic ligatures
	 */
	function applyLatinLigatures() {
	    var this$1 = this;

	    var script = 'latn';
	    if (!this.featuresTags.hasOwnProperty(script)) { return; }
	    var tags = this.featuresTags[script];
	    if (tags.indexOf('liga') === -1) { return; }
	    checkGlyphIndexStatus.call(this);
	    var ranges = this.tokenizer.getContextRanges('latinWord');
	    ranges.forEach(function (range) {
	        latinLigature.call(this$1, range);
	    });
	}

	/**
	 * Check if a context is registered
	 * @param {string} contextId context id
	 */
	Bidi.prototype.checkContextReady = function (contextId) {
	    return !!this.tokenizer.getContext(contextId);
	};

	/**
	 * Apply features to registered contexts
	 */
	Bidi.prototype.applyFeaturesToContexts = function () {
	    if (this.checkContextReady('arabicWord')) {
	        applyArabicPresentationForms.call(this);
	        applyArabicRequireLigatures.call(this);
	    }
	    if (this.checkContextReady('latinWord')) {
	        applyLatinLigatures.call(this);
	    }
	    if (this.checkContextReady('arabicSentence')) {
	        reverseArabicSentences.call(this);
	    }
	};

	/**
	 * process text input
	 * @param {string} text an input text
	 */
	Bidi.prototype.processText = function(text) {
	    if (!this.text || this.text !== text) {
	        this.setText(text);
	        tokenizeText.call(this);
	        this.applyFeaturesToContexts();
	    }
	};

	/**
	 * Process a string of text to identify and adjust
	 * bidirectional text entities.
	 * @param {string} text input text
	 */
	Bidi.prototype.getBidiText = function (text) {
	    this.processText(text);
	    return this.tokenizer.getText();
	};

	/**
	 * Get the current state index of each token
	 * @param {text} text an input text
	 */
	Bidi.prototype.getTextGlyphs = function (text) {
	    this.processText(text);
	    var indexes = [];
	    for (var i = 0; i < this.tokenizer.tokens.length; i++) {
	        var token = this.tokenizer.tokens[i];
	        if (token.state.deleted) { continue; }
	        var index = token.activeState.value;
	        indexes.push(Array.isArray(index) ? index[0] : index);
	    }
	    return indexes;
	};

	// The Font object

	/**
	 * @typedef FontOptions
	 * @type Object
	 * @property {Boolean} empty - whether to create a new empty font
	 * @property {string} familyName
	 * @property {string} styleName
	 * @property {string=} fullName
	 * @property {string=} postScriptName
	 * @property {string=} designer
	 * @property {string=} designerURL
	 * @property {string=} manufacturer
	 * @property {string=} manufacturerURL
	 * @property {string=} license
	 * @property {string=} licenseURL
	 * @property {string=} version
	 * @property {string=} description
	 * @property {string=} copyright
	 * @property {string=} trademark
	 * @property {Number} unitsPerEm
	 * @property {Number} ascender
	 * @property {Number} descender
	 * @property {Number} createdTimestamp
	 * @property {string=} weightClass
	 * @property {string=} widthClass
	 * @property {string=} fsSelection
	 */

	/**
	 * A Font represents a loaded OpenType font file.
	 * It contains a set of glyphs and methods to draw text on a drawing context,
	 * or to get a path representing the text.
	 * @exports opentype.Font
	 * @class
	 * @param {FontOptions}
	 * @constructor
	 */
	function Font(options) {
	    options = options || {};
	    options.tables = options.tables || {};

	    if (!options.empty) {
	        // Check that we've provided the minimum set of names.
	        checkArgument(options.familyName, 'When creating a new Font object, familyName is required.');
	        checkArgument(options.styleName, 'When creating a new Font object, styleName is required.');
	        checkArgument(options.unitsPerEm, 'When creating a new Font object, unitsPerEm is required.');
	        checkArgument(options.ascender, 'When creating a new Font object, ascender is required.');
	        checkArgument(options.descender <= 0, 'When creating a new Font object, negative descender value is required.');

	        // OS X will complain if the names are empty, so we put a single space everywhere by default.
	        this.names = {
	            fontFamily: {en: options.familyName || ' '},
	            fontSubfamily: {en: options.styleName || ' '},
	            fullName: {en: options.fullName || options.familyName + ' ' + options.styleName},
	            // postScriptName may not contain any whitespace
	            postScriptName: {en: options.postScriptName || (options.familyName + options.styleName).replace(/\s/g, '')},
	            designer: {en: options.designer || ' '},
	            designerURL: {en: options.designerURL || ' '},
	            manufacturer: {en: options.manufacturer || ' '},
	            manufacturerURL: {en: options.manufacturerURL || ' '},
	            license: {en: options.license || ' '},
	            licenseURL: {en: options.licenseURL || ' '},
	            version: {en: options.version || 'Version 0.1'},
	            description: {en: options.description || ' '},
	            copyright: {en: options.copyright || ' '},
	            trademark: {en: options.trademark || ' '}
	        };
	        this.unitsPerEm = options.unitsPerEm || 1000;
	        this.ascender = options.ascender;
	        this.descender = options.descender;
	        this.createdTimestamp = options.createdTimestamp;
	        this.tables = Object.assign(options.tables, {
	            os2: Object.assign({
	                usWeightClass: options.weightClass || this.usWeightClasses.MEDIUM,
	                usWidthClass: options.widthClass || this.usWidthClasses.MEDIUM,
	                fsSelection: options.fsSelection || this.fsSelectionValues.REGULAR,
	            }, options.tables.os2)
	        });
	    }

	    this.supported = true; // Deprecated: parseBuffer will throw an error if font is not supported.
	    this.glyphs = new glyphset.GlyphSet(this, options.glyphs || []);
	    this.encoding = new DefaultEncoding(this);
	    this.position = new Position(this);
	    this.substitution = new Substitution(this);
	    this.tables = this.tables || {};

	    // needed for low memory mode only.
	    this._push = null;
	    this._hmtxTableData = {};

	    Object.defineProperty(this, 'hinting', {
	        get: function() {
	            if (this._hinting) { return this._hinting; }
	            if (this.outlinesFormat === 'truetype') {
	                return (this._hinting = new Hinting(this));
	            }
	        }
	    });
	}

	/**
	 * Check if the font has a glyph for the given character.
	 * @param  {string}
	 * @return {Boolean}
	 */
	Font.prototype.hasChar = function(c) {
	    return this.encoding.charToGlyphIndex(c) !== null;
	};

	/**
	 * Convert the given character to a single glyph index.
	 * Note that this function assumes that there is a one-to-one mapping between
	 * the given character and a glyph; for complex scripts this might not be the case.
	 * @param  {string}
	 * @return {Number}
	 */
	Font.prototype.charToGlyphIndex = function(s) {
	    return this.encoding.charToGlyphIndex(s);
	};

	/**
	 * Convert the given character to a single Glyph object.
	 * Note that this function assumes that there is a one-to-one mapping between
	 * the given character and a glyph; for complex scripts this might not be the case.
	 * @param  {string}
	 * @return {opentype.Glyph}
	 */
	Font.prototype.charToGlyph = function(c) {
	    var glyphIndex = this.charToGlyphIndex(c);
	    var glyph = this.glyphs.get(glyphIndex);
	    if (!glyph) {
	        // .notdef
	        glyph = this.glyphs.get(0);
	    }

	    return glyph;
	};

	/**
	 * Update features
	 * @param {any} options features options
	 */
	Font.prototype.updateFeatures = function (options) {
	    // TODO: update all features options not only 'latn'.
	    return this.defaultRenderOptions.features.map(function (feature) {
	        if (feature.script === 'latn') {
	            return {
	                script: 'latn',
	                tags: feature.tags.filter(function (tag) { return options[tag]; })
	            };
	        } else {
	            return feature;
	        }
	    });
	};

	/**
	 * Convert the given text to a list of Glyph objects.
	 * Note that there is no strict one-to-one mapping between characters and
	 * glyphs, so the list of returned glyphs can be larger or smaller than the
	 * length of the given string.
	 * @param  {string}
	 * @param  {GlyphRenderOptions} [options]
	 * @return {opentype.Glyph[]}
	 */
	Font.prototype.stringToGlyphs = function(s, options) {
	    var this$1 = this;


	    var bidi = new Bidi();

	    // Create and register 'glyphIndex' state modifier
	    var charToGlyphIndexMod = function (token) { return this$1.charToGlyphIndex(token.char); };
	    bidi.registerModifier('glyphIndex', null, charToGlyphIndexMod);

	    // roll-back to default features
	    var features = options ?
	    this.updateFeatures(options.features) :
	    this.defaultRenderOptions.features;

	    bidi.applyFeatures(this, features);

	    var indexes = bidi.getTextGlyphs(s);

	    var length = indexes.length;

	    // convert glyph indexes to glyph objects
	    var glyphs = new Array(length);
	    var notdef = this.glyphs.get(0);
	    for (var i = 0; i < length; i += 1) {
	        glyphs[i] = this.glyphs.get(indexes[i]) || notdef;
	    }
	    return glyphs;
	};

	/**
	 * @param  {string}
	 * @return {Number}
	 */
	Font.prototype.nameToGlyphIndex = function(name) {
	    return this.glyphNames.nameToGlyphIndex(name);
	};

	/**
	 * @param  {string}
	 * @return {opentype.Glyph}
	 */
	Font.prototype.nameToGlyph = function(name) {
	    var glyphIndex = this.nameToGlyphIndex(name);
	    var glyph = this.glyphs.get(glyphIndex);
	    if (!glyph) {
	        // .notdef
	        glyph = this.glyphs.get(0);
	    }

	    return glyph;
	};

	/**
	 * @param  {Number}
	 * @return {String}
	 */
	Font.prototype.glyphIndexToName = function(gid) {
	    if (!this.glyphNames.glyphIndexToName) {
	        return '';
	    }

	    return this.glyphNames.glyphIndexToName(gid);
	};

	/**
	 * Retrieve the value of the kerning pair between the left glyph (or its index)
	 * and the right glyph (or its index). If no kerning pair is found, return 0.
	 * The kerning value gets added to the advance width when calculating the spacing
	 * between glyphs.
	 * For GPOS kerning, this method uses the default script and language, which covers
	 * most use cases. To have greater control, use font.position.getKerningValue .
	 * @param  {opentype.Glyph} leftGlyph
	 * @param  {opentype.Glyph} rightGlyph
	 * @return {Number}
	 */
	Font.prototype.getKerningValue = function(leftGlyph, rightGlyph) {
	    leftGlyph = leftGlyph.index || leftGlyph;
	    rightGlyph = rightGlyph.index || rightGlyph;
	    var gposKerning = this.position.defaultKerningTables;
	    if (gposKerning) {
	        return this.position.getKerningValue(gposKerning, leftGlyph, rightGlyph);
	    }
	    // "kern" table
	    return this.kerningPairs[leftGlyph + ',' + rightGlyph] || 0;
	};

	/**
	 * @typedef GlyphRenderOptions
	 * @type Object
	 * @property {string} [script] - script used to determine which features to apply. By default, 'DFLT' or 'latn' is used.
	 *                               See https://www.microsoft.com/typography/otspec/scripttags.htm
	 * @property {string} [language='dflt'] - language system used to determine which features to apply.
	 *                                        See https://www.microsoft.com/typography/developers/opentype/languagetags.aspx
	 * @property {boolean} [kerning=true] - whether to include kerning values
	 * @property {object} [features] - OpenType Layout feature tags. Used to enable or disable the features of the given script/language system.
	 *                                 See https://www.microsoft.com/typography/otspec/featuretags.htm
	 */
	Font.prototype.defaultRenderOptions = {
	    kerning: true,
	    features: [
	        /**
	         * these 4 features are required to render Arabic text properly
	         * and shouldn't be turned off when rendering arabic text.
	         */
	        { script: 'arab', tags: ['init', 'medi', 'fina', 'rlig'] },
	        { script: 'latn', tags: ['liga', 'rlig'] }
	    ]
	};

	/**
	 * Helper function that invokes the given callback for each glyph in the given text.
	 * The callback gets `(glyph, x, y, fontSize, options)`.* @param  {string} text
	 * @param {string} text - The text to apply.
	 * @param  {number} [x=0] - Horizontal position of the beginning of the text.
	 * @param  {number} [y=0] - Vertical position of the *baseline* of the text.
	 * @param  {number} [fontSize=72] - Font size in pixels. We scale the glyph units by `1 / unitsPerEm * fontSize`.
	 * @param  {GlyphRenderOptions=} options
	 * @param  {Function} callback
	 */
	Font.prototype.forEachGlyph = function(text, x, y, fontSize, options, callback) {
	    x = x !== undefined ? x : 0;
	    y = y !== undefined ? y : 0;
	    fontSize = fontSize !== undefined ? fontSize : 72;
	    options = Object.assign({}, this.defaultRenderOptions, options);
	    var fontScale = 1 / this.unitsPerEm * fontSize;
	    var glyphs = this.stringToGlyphs(text, options);
	    var kerningLookups;
	    if (options.kerning) {
	        var script = options.script || this.position.getDefaultScriptName();
	        kerningLookups = this.position.getKerningTables(script, options.language);
	    }
	    for (var i = 0; i < glyphs.length; i += 1) {
	        var glyph = glyphs[i];
	        callback.call(this, glyph, x, y, fontSize, options);
	        if (glyph.advanceWidth) {
	            x += glyph.advanceWidth * fontScale;
	        }

	        if (options.kerning && i < glyphs.length - 1) {
	            // We should apply position adjustment lookups in a more generic way.
	            // Here we only use the xAdvance value.
	            var kerningValue = kerningLookups ?
	                  this.position.getKerningValue(kerningLookups, glyph.index, glyphs[i + 1].index) :
	                  this.getKerningValue(glyph, glyphs[i + 1]);
	            x += kerningValue * fontScale;
	        }

	        if (options.letterSpacing) {
	            x += options.letterSpacing * fontSize;
	        } else if (options.tracking) {
	            x += (options.tracking / 1000) * fontSize;
	        }
	    }
	    return x;
	};

	/**
	 * Create a Path object that represents the given text.
	 * @param  {string} text - The text to create.
	 * @param  {number} [x=0] - Horizontal position of the beginning of the text.
	 * @param  {number} [y=0] - Vertical position of the *baseline* of the text.
	 * @param  {number} [fontSize=72] - Font size in pixels. We scale the glyph units by `1 / unitsPerEm * fontSize`.
	 * @param  {GlyphRenderOptions=} options
	 * @return {opentype.Path}
	 */
	Font.prototype.getPath = function(text, x, y, fontSize, options) {
	    var fullPath = new Path();
	    this.forEachGlyph(text, x, y, fontSize, options, function(glyph, gX, gY, gFontSize) {
	        var glyphPath = glyph.getPath(gX, gY, gFontSize, options, this);
	        fullPath.extend(glyphPath);
	    });
	    return fullPath;
	};

	/**
	 * Create an array of Path objects that represent the glyphs of a given text.
	 * @param  {string} text - The text to create.
	 * @param  {number} [x=0] - Horizontal position of the beginning of the text.
	 * @param  {number} [y=0] - Vertical position of the *baseline* of the text.
	 * @param  {number} [fontSize=72] - Font size in pixels. We scale the glyph units by `1 / unitsPerEm * fontSize`.
	 * @param  {GlyphRenderOptions=} options
	 * @return {opentype.Path[]}
	 */
	Font.prototype.getPaths = function(text, x, y, fontSize, options) {
	    var glyphPaths = [];
	    this.forEachGlyph(text, x, y, fontSize, options, function(glyph, gX, gY, gFontSize) {
	        var glyphPath = glyph.getPath(gX, gY, gFontSize, options, this);
	        glyphPaths.push(glyphPath);
	    });

	    return glyphPaths;
	};

	/**
	 * Returns the advance width of a text.
	 *
	 * This is something different than Path.getBoundingBox() as for example a
	 * suffixed whitespace increases the advanceWidth but not the bounding box
	 * or an overhanging letter like a calligraphic 'f' might have a quite larger
	 * bounding box than its advance width.
	 *
	 * This corresponds to canvas2dContext.measureText(text).width
	 *
	 * @param  {string} text - The text to create.
	 * @param  {number} [fontSize=72] - Font size in pixels. We scale the glyph units by `1 / unitsPerEm * fontSize`.
	 * @param  {GlyphRenderOptions=} options
	 * @return advance width
	 */
	Font.prototype.getAdvanceWidth = function(text, fontSize, options) {
	    return this.forEachGlyph(text, 0, 0, fontSize, options, function() {});
	};

	/**
	 * Draw the text on the given drawing context.
	 * @param  {CanvasRenderingContext2D} ctx - A 2D drawing context, like Canvas.
	 * @param  {string} text - The text to create.
	 * @param  {number} [x=0] - Horizontal position of the beginning of the text.
	 * @param  {number} [y=0] - Vertical position of the *baseline* of the text.
	 * @param  {number} [fontSize=72] - Font size in pixels. We scale the glyph units by `1 / unitsPerEm * fontSize`.
	 * @param  {GlyphRenderOptions=} options
	 */
	Font.prototype.draw = function(ctx, text, x, y, fontSize, options) {
	    this.getPath(text, x, y, fontSize, options).draw(ctx);
	};

	/**
	 * Draw the points of all glyphs in the text.
	 * On-curve points will be drawn in blue, off-curve points will be drawn in red.
	 * @param {CanvasRenderingContext2D} ctx - A 2D drawing context, like Canvas.
	 * @param {string} text - The text to create.
	 * @param {number} [x=0] - Horizontal position of the beginning of the text.
	 * @param {number} [y=0] - Vertical position of the *baseline* of the text.
	 * @param {number} [fontSize=72] - Font size in pixels. We scale the glyph units by `1 / unitsPerEm * fontSize`.
	 * @param {GlyphRenderOptions=} options
	 */
	Font.prototype.drawPoints = function(ctx, text, x, y, fontSize, options) {
	    this.forEachGlyph(text, x, y, fontSize, options, function(glyph, gX, gY, gFontSize) {
	        glyph.drawPoints(ctx, gX, gY, gFontSize);
	    });
	};

	/**
	 * Draw lines indicating important font measurements for all glyphs in the text.
	 * Black lines indicate the origin of the coordinate system (point 0,0).
	 * Blue lines indicate the glyph bounding box.
	 * Green line indicates the advance width of the glyph.
	 * @param {CanvasRenderingContext2D} ctx - A 2D drawing context, like Canvas.
	 * @param {string} text - The text to create.
	 * @param {number} [x=0] - Horizontal position of the beginning of the text.
	 * @param {number} [y=0] - Vertical position of the *baseline* of the text.
	 * @param {number} [fontSize=72] - Font size in pixels. We scale the glyph units by `1 / unitsPerEm * fontSize`.
	 * @param {GlyphRenderOptions=} options
	 */
	Font.prototype.drawMetrics = function(ctx, text, x, y, fontSize, options) {
	    this.forEachGlyph(text, x, y, fontSize, options, function(glyph, gX, gY, gFontSize) {
	        glyph.drawMetrics(ctx, gX, gY, gFontSize);
	    });
	};

	/**
	 * @param  {string}
	 * @return {string}
	 */
	Font.prototype.getEnglishName = function(name) {
	    var translations = this.names[name];
	    if (translations) {
	        return translations.en;
	    }
	};

	/**
	 * Validate
	 */
	Font.prototype.validate = function() {
	    var _this = this;

	    function assert(predicate, message) {
	    }

	    function assertNamePresent(name) {
	        var englishName = _this.getEnglishName(name);
	        assert(englishName && englishName.trim().length > 0);
	    }

	    // Identification information
	    assertNamePresent('fontFamily');
	    assertNamePresent('weightName');
	    assertNamePresent('manufacturer');
	    assertNamePresent('copyright');
	    assertNamePresent('version');

	    // Dimension information
	    assert(this.unitsPerEm > 0);
	};

	/**
	 * Convert the font object to a SFNT data structure.
	 * This structure contains all the necessary tables and metadata to create a binary OTF file.
	 * @return {opentype.Table}
	 */
	Font.prototype.toTables = function() {
	    return sfnt.fontToTable(this);
	};
	/**
	 * @deprecated Font.toBuffer is deprecated. Use Font.toArrayBuffer instead.
	 */
	Font.prototype.toBuffer = function() {
	    console.warn('Font.toBuffer is deprecated. Use Font.toArrayBuffer instead.');
	    return this.toArrayBuffer();
	};
	/**
	 * Converts a `opentype.Font` into an `ArrayBuffer`
	 * @return {ArrayBuffer}
	 */
	Font.prototype.toArrayBuffer = function() {
	    var sfntTable = this.toTables();
	    var bytes = sfntTable.encode();
	    var buffer = new ArrayBuffer(bytes.length);
	    var intArray = new Uint8Array(buffer);
	    for (var i = 0; i < bytes.length; i++) {
	        intArray[i] = bytes[i];
	    }

	    return buffer;
	};

	/**
	 * Initiate a download of the OpenType font.
	 */
	Font.prototype.download = function(fileName) {
	    var familyName = this.getEnglishName('fontFamily');
	    var styleName = this.getEnglishName('fontSubfamily');
	    fileName = fileName || familyName.replace(/\s/g, '') + '-' + styleName + '.otf';
	    var arrayBuffer = this.toArrayBuffer();

	    if (isBrowser()) {
	        window.URL = window.URL || window.webkitURL;

	        if (window.URL) {
	            var dataView = new DataView(arrayBuffer);
	            var blob = new Blob([dataView], {type: 'font/opentype'});

	            var link = document.createElement('a');
	            link.href = window.URL.createObjectURL(blob);
	            link.download = fileName;

	            var event = document.createEvent('MouseEvents');
	            event.initEvent('click', true, false);
	            link.dispatchEvent(event);
	        } else {
	            console.warn('Font file could not be downloaded. Try using a different browser.');
	        }
	    } else {
	        var fs = require('fs');
	        var buffer = arrayBufferToNodeBuffer(arrayBuffer);
	        fs.writeFileSync(fileName, buffer);
	    }
	};
	/**
	 * @private
	 */
	Font.prototype.fsSelectionValues = {
	    ITALIC:              0x001, //1
	    UNDERSCORE:          0x002, //2
	    NEGATIVE:            0x004, //4
	    OUTLINED:            0x008, //8
	    STRIKEOUT:           0x010, //16
	    BOLD:                0x020, //32
	    REGULAR:             0x040, //64
	    USER_TYPO_METRICS:   0x080, //128
	    WWS:                 0x100, //256
	    OBLIQUE:             0x200  //512
	};

	/**
	 * @private
	 */
	Font.prototype.usWidthClasses = {
	    ULTRA_CONDENSED: 1,
	    EXTRA_CONDENSED: 2,
	    CONDENSED: 3,
	    SEMI_CONDENSED: 4,
	    MEDIUM: 5,
	    SEMI_EXPANDED: 6,
	    EXPANDED: 7,
	    EXTRA_EXPANDED: 8,
	    ULTRA_EXPANDED: 9
	};

	/**
	 * @private
	 */
	Font.prototype.usWeightClasses = {
	    THIN: 100,
	    EXTRA_LIGHT: 200,
	    LIGHT: 300,
	    NORMAL: 400,
	    MEDIUM: 500,
	    SEMI_BOLD: 600,
	    BOLD: 700,
	    EXTRA_BOLD: 800,
	    BLACK:    900
	};

	// The `fvar` table stores font variation axes and instances.

	function addName(name, names) {
	    var nameString = JSON.stringify(name);
	    var nameID = 256;
	    for (var nameKey in names) {
	        var n = parseInt(nameKey);
	        if (!n || n < 256) {
	            continue;
	        }

	        if (JSON.stringify(names[nameKey]) === nameString) {
	            return n;
	        }

	        if (nameID <= n) {
	            nameID = n + 1;
	        }
	    }

	    names[nameID] = name;
	    return nameID;
	}

	function makeFvarAxis(n, axis, names) {
	    var nameID = addName(axis.name, names);
	    return [
	        {name: 'tag_' + n, type: 'TAG', value: axis.tag},
	        {name: 'minValue_' + n, type: 'FIXED', value: axis.minValue << 16},
	        {name: 'defaultValue_' + n, type: 'FIXED', value: axis.defaultValue << 16},
	        {name: 'maxValue_' + n, type: 'FIXED', value: axis.maxValue << 16},
	        {name: 'flags_' + n, type: 'USHORT', value: 0},
	        {name: 'nameID_' + n, type: 'USHORT', value: nameID}
	    ];
	}

	function parseFvarAxis(data, start, names) {
	    var axis = {};
	    var p = new parse.Parser(data, start);
	    axis.tag = p.parseTag();
	    axis.minValue = p.parseFixed();
	    axis.defaultValue = p.parseFixed();
	    axis.maxValue = p.parseFixed();
	    p.skip('uShort', 1);  // reserved for flags; no values defined
	    axis.name = names[p.parseUShort()] || {};
	    return axis;
	}

	function makeFvarInstance(n, inst, axes, names) {
	    var nameID = addName(inst.name, names);
	    var fields = [
	        {name: 'nameID_' + n, type: 'USHORT', value: nameID},
	        {name: 'flags_' + n, type: 'USHORT', value: 0}
	    ];

	    for (var i = 0; i < axes.length; ++i) {
	        var axisTag = axes[i].tag;
	        fields.push({
	            name: 'axis_' + n + ' ' + axisTag,
	            type: 'FIXED',
	            value: inst.coordinates[axisTag] << 16
	        });
	    }

	    return fields;
	}

	function parseFvarInstance(data, start, axes, names) {
	    var inst = {};
	    var p = new parse.Parser(data, start);
	    inst.name = names[p.parseUShort()] || {};
	    p.skip('uShort', 1);  // reserved for flags; no values defined

	    inst.coordinates = {};
	    for (var i = 0; i < axes.length; ++i) {
	        inst.coordinates[axes[i].tag] = p.parseFixed();
	    }

	    return inst;
	}

	function makeFvarTable(fvar, names) {
	    var result = new table.Table('fvar', [
	        {name: 'version', type: 'ULONG', value: 0x10000},
	        {name: 'offsetToData', type: 'USHORT', value: 0},
	        {name: 'countSizePairs', type: 'USHORT', value: 2},
	        {name: 'axisCount', type: 'USHORT', value: fvar.axes.length},
	        {name: 'axisSize', type: 'USHORT', value: 20},
	        {name: 'instanceCount', type: 'USHORT', value: fvar.instances.length},
	        {name: 'instanceSize', type: 'USHORT', value: 4 + fvar.axes.length * 4}
	    ]);
	    result.offsetToData = result.sizeOf();

	    for (var i = 0; i < fvar.axes.length; i++) {
	        result.fields = result.fields.concat(makeFvarAxis(i, fvar.axes[i], names));
	    }

	    for (var j = 0; j < fvar.instances.length; j++) {
	        result.fields = result.fields.concat(makeFvarInstance(j, fvar.instances[j], fvar.axes, names));
	    }

	    return result;
	}

	function parseFvarTable(data, start, names) {
	    var p = new parse.Parser(data, start);
	    var tableVersion = p.parseULong();
	    check.argument(tableVersion === 0x00010000, 'Unsupported fvar table version.');
	    var offsetToData = p.parseOffset16();
	    // Skip countSizePairs.
	    p.skip('uShort', 1);
	    var axisCount = p.parseUShort();
	    var axisSize = p.parseUShort();
	    var instanceCount = p.parseUShort();
	    var instanceSize = p.parseUShort();

	    var axes = [];
	    for (var i = 0; i < axisCount; i++) {
	        axes.push(parseFvarAxis(data, start + offsetToData + i * axisSize, names));
	    }

	    var instances = [];
	    var instanceStart = start + offsetToData + axisCount * axisSize;
	    for (var j = 0; j < instanceCount; j++) {
	        instances.push(parseFvarInstance(data, instanceStart + j * instanceSize, axes, names));
	    }

	    return {axes: axes, instances: instances};
	}

	var fvar = { make: makeFvarTable, parse: parseFvarTable };

	// The `GDEF` table contains various glyph properties

	var attachList = function() {
	    return {
	        coverage: this.parsePointer(Parser.coverage),
	        attachPoints: this.parseList(Parser.pointer(Parser.uShortList))
	    };
	};

	var caretValue = function() {
	    var format = this.parseUShort();
	    check.argument(format === 1 || format === 2 || format === 3,
	        'Unsupported CaretValue table version.');
	    if (format === 1) {
	        return { coordinate: this.parseShort() };
	    } else if (format === 2) {
	        return { pointindex: this.parseShort() };
	    } else if (format === 3) {
	        // Device / Variation Index tables unsupported
	        return { coordinate: this.parseShort() };
	    }
	};

	var ligGlyph = function() {
	    return this.parseList(Parser.pointer(caretValue));
	};

	var ligCaretList = function() {
	    return {
	        coverage: this.parsePointer(Parser.coverage),
	        ligGlyphs: this.parseList(Parser.pointer(ligGlyph))
	    };
	};

	var markGlyphSets = function() {
	    this.parseUShort(); // Version
	    return this.parseList(Parser.pointer(Parser.coverage));
	};

	function parseGDEFTable(data, start) {
	    start = start || 0;
	    var p = new Parser(data, start);
	    var tableVersion = p.parseVersion(1);
	    check.argument(tableVersion === 1 || tableVersion === 1.2 || tableVersion === 1.3,
	        'Unsupported GDEF table version.');
	    var gdef = {
	        version: tableVersion,
	        classDef: p.parsePointer(Parser.classDef),
	        attachList: p.parsePointer(attachList),
	        ligCaretList: p.parsePointer(ligCaretList),
	        markAttachClassDef: p.parsePointer(Parser.classDef)
	    };
	    if (tableVersion >= 1.2) {
	        gdef.markGlyphSets = p.parsePointer(markGlyphSets);
	    }
	    return gdef;
	}
	var gdef = { parse: parseGDEFTable };

	// The `GPOS` table contains kerning pairs, among other things.

	var subtableParsers$1 = new Array(10);         // subtableParsers[0] is unused

	// https://docs.microsoft.com/en-us/typography/opentype/spec/gpos#lookup-type-1-single-adjustment-positioning-subtable
	// this = Parser instance
	subtableParsers$1[1] = function parseLookup1() {
	    var start = this.offset + this.relativeOffset;
	    var posformat = this.parseUShort();
	    if (posformat === 1) {
	        return {
	            posFormat: 1,
	            coverage: this.parsePointer(Parser.coverage),
	            value: this.parseValueRecord()
	        };
	    } else if (posformat === 2) {
	        return {
	            posFormat: 2,
	            coverage: this.parsePointer(Parser.coverage),
	            values: this.parseValueRecordList()
	        };
	    }
	    check.assert(false, '0x' + start.toString(16) + ': GPOS lookup type 1 format must be 1 or 2.');
	};

	// https://docs.microsoft.com/en-us/typography/opentype/spec/gpos#lookup-type-2-pair-adjustment-positioning-subtable
	subtableParsers$1[2] = function parseLookup2() {
	    var start = this.offset + this.relativeOffset;
	    var posFormat = this.parseUShort();
	    check.assert(posFormat === 1 || posFormat === 2, '0x' + start.toString(16) + ': GPOS lookup type 2 format must be 1 or 2.');
	    var coverage = this.parsePointer(Parser.coverage);
	    var valueFormat1 = this.parseUShort();
	    var valueFormat2 = this.parseUShort();
	    if (posFormat === 1) {
	        // Adjustments for Glyph Pairs
	        return {
	            posFormat: posFormat,
	            coverage: coverage,
	            valueFormat1: valueFormat1,
	            valueFormat2: valueFormat2,
	            pairSets: this.parseList(Parser.pointer(Parser.list(function() {
	                return {        // pairValueRecord
	                    secondGlyph: this.parseUShort(),
	                    value1: this.parseValueRecord(valueFormat1),
	                    value2: this.parseValueRecord(valueFormat2)
	                };
	            })))
	        };
	    } else if (posFormat === 2) {
	        var classDef1 = this.parsePointer(Parser.classDef);
	        var classDef2 = this.parsePointer(Parser.classDef);
	        var class1Count = this.parseUShort();
	        var class2Count = this.parseUShort();
	        return {
	            // Class Pair Adjustment
	            posFormat: posFormat,
	            coverage: coverage,
	            valueFormat1: valueFormat1,
	            valueFormat2: valueFormat2,
	            classDef1: classDef1,
	            classDef2: classDef2,
	            class1Count: class1Count,
	            class2Count: class2Count,
	            classRecords: this.parseList(class1Count, Parser.list(class2Count, function() {
	                return {
	                    value1: this.parseValueRecord(valueFormat1),
	                    value2: this.parseValueRecord(valueFormat2)
	                };
	            }))
	        };
	    }
	};

	subtableParsers$1[3] = function parseLookup3() { return { error: 'GPOS Lookup 3 not supported' }; };
	subtableParsers$1[4] = function parseLookup4() { return { error: 'GPOS Lookup 4 not supported' }; };
	subtableParsers$1[5] = function parseLookup5() { return { error: 'GPOS Lookup 5 not supported' }; };
	subtableParsers$1[6] = function parseLookup6() { return { error: 'GPOS Lookup 6 not supported' }; };
	subtableParsers$1[7] = function parseLookup7() { return { error: 'GPOS Lookup 7 not supported' }; };
	subtableParsers$1[8] = function parseLookup8() { return { error: 'GPOS Lookup 8 not supported' }; };
	subtableParsers$1[9] = function parseLookup9() { return { error: 'GPOS Lookup 9 not supported' }; };

	// https://docs.microsoft.com/en-us/typography/opentype/spec/gpos
	function parseGposTable(data, start) {
	    start = start || 0;
	    var p = new Parser(data, start);
	    var tableVersion = p.parseVersion(1);
	    check.argument(tableVersion === 1 || tableVersion === 1.1, 'Unsupported GPOS table version ' + tableVersion);

	    if (tableVersion === 1) {
	        return {
	            version: tableVersion,
	            scripts: p.parseScriptList(),
	            features: p.parseFeatureList(),
	            lookups: p.parseLookupList(subtableParsers$1)
	        };
	    } else {
	        return {
	            version: tableVersion,
	            scripts: p.parseScriptList(),
	            features: p.parseFeatureList(),
	            lookups: p.parseLookupList(subtableParsers$1),
	            variations: p.parseFeatureVariationsList()
	        };
	    }

	}

	// GPOS Writing //////////////////////////////////////////////
	// NOT SUPPORTED
	var subtableMakers$1 = new Array(10);

	function makeGposTable(gpos) {
	    return new table.Table('GPOS', [
	        {name: 'version', type: 'ULONG', value: 0x10000},
	        {name: 'scripts', type: 'TABLE', value: new table.ScriptList(gpos.scripts)},
	        {name: 'features', type: 'TABLE', value: new table.FeatureList(gpos.features)},
	        {name: 'lookups', type: 'TABLE', value: new table.LookupList(gpos.lookups, subtableMakers$1)}
	    ]);
	}

	var gpos = { parse: parseGposTable, make: makeGposTable };

	// The `kern` table contains kerning pairs.

	function parseWindowsKernTable(p) {
	    var pairs = {};
	    // Skip nTables.
	    p.skip('uShort');
	    var subtableVersion = p.parseUShort();
	    check.argument(subtableVersion === 0, 'Unsupported kern sub-table version.');
	    // Skip subtableLength, subtableCoverage
	    p.skip('uShort', 2);
	    var nPairs = p.parseUShort();
	    // Skip searchRange, entrySelector, rangeShift.
	    p.skip('uShort', 3);
	    for (var i = 0; i < nPairs; i += 1) {
	        var leftIndex = p.parseUShort();
	        var rightIndex = p.parseUShort();
	        var value = p.parseShort();
	        pairs[leftIndex + ',' + rightIndex] = value;
	    }
	    return pairs;
	}

	function parseMacKernTable(p) {
	    var pairs = {};
	    // The Mac kern table stores the version as a fixed (32 bits) but we only loaded the first 16 bits.
	    // Skip the rest.
	    p.skip('uShort');
	    var nTables = p.parseULong();
	    //check.argument(nTables === 1, 'Only 1 subtable is supported (got ' + nTables + ').');
	    if (nTables > 1) {
	        console.warn('Only the first kern subtable is supported.');
	    }
	    p.skip('uLong');
	    var coverage = p.parseUShort();
	    var subtableVersion = coverage & 0xFF;
	    p.skip('uShort');
	    if (subtableVersion === 0) {
	        var nPairs = p.parseUShort();
	        // Skip searchRange, entrySelector, rangeShift.
	        p.skip('uShort', 3);
	        for (var i = 0; i < nPairs; i += 1) {
	            var leftIndex = p.parseUShort();
	            var rightIndex = p.parseUShort();
	            var value = p.parseShort();
	            pairs[leftIndex + ',' + rightIndex] = value;
	        }
	    }
	    return pairs;
	}

	// Parse the `kern` table which contains kerning pairs.
	function parseKernTable(data, start) {
	    var p = new parse.Parser(data, start);
	    var tableVersion = p.parseUShort();
	    if (tableVersion === 0) {
	        return parseWindowsKernTable(p);
	    } else if (tableVersion === 1) {
	        return parseMacKernTable(p);
	    } else {
	        throw new Error('Unsupported kern table version (' + tableVersion + ').');
	    }
	}

	var kern = { parse: parseKernTable };

	// The `loca` table stores the offsets to the locations of the glyphs in the font.

	// Parse the `loca` table. This table stores the offsets to the locations of the glyphs in the font,
	// relative to the beginning of the glyphData table.
	// The number of glyphs stored in the `loca` table is specified in the `maxp` table (under numGlyphs)
	// The loca table has two versions: a short version where offsets are stored as uShorts, and a long
	// version where offsets are stored as uLongs. The `head` table specifies which version to use
	// (under indexToLocFormat).
	function parseLocaTable(data, start, numGlyphs, shortVersion) {
	    var p = new parse.Parser(data, start);
	    var parseFn = shortVersion ? p.parseUShort : p.parseULong;
	    // There is an extra entry after the last index element to compute the length of the last glyph.
	    // That's why we use numGlyphs + 1.
	    var glyphOffsets = [];
	    for (var i = 0; i < numGlyphs + 1; i += 1) {
	        var glyphOffset = parseFn.call(p);
	        if (shortVersion) {
	            // The short table version stores the actual offset divided by 2.
	            glyphOffset *= 2;
	        }

	        glyphOffsets.push(glyphOffset);
	    }

	    return glyphOffsets;
	}

	var loca = { parse: parseLocaTable };

	// opentype.js

	/**
	 * The opentype library.
	 * @namespace opentype
	 */

	// File loaders /////////////////////////////////////////////////////////
	/**
	 * Loads a font from a file. The callback throws an error message as the first parameter if it fails
	 * and the font as an ArrayBuffer in the second parameter if it succeeds.
	 * @param  {string} path - The path of the file
	 * @param  {Function} callback - The function to call when the font load completes
	 */
	function loadFromFile(path, callback) {
	    var fs = require('fs');
	    fs.readFile(path, function(err, buffer) {
	        if (err) {
	            return callback(err.message);
	        }

	        callback(null, nodeBufferToArrayBuffer(buffer));
	    });
	}
	/**
	 * Loads a font from a URL. The callback throws an error message as the first parameter if it fails
	 * and the font as an ArrayBuffer in the second parameter if it succeeds.
	 * @param  {string} url - The URL of the font file.
	 * @param  {Function} callback - The function to call when the font load completes
	 */
	function loadFromUrl(url, callback) {
	    var request = new XMLHttpRequest();
	    request.open('get', url, true);
	    request.responseType = 'arraybuffer';
	    request.onload = function() {
	        if (request.response) {
	            return callback(null, request.response);
	        } else {
	            return callback('Font could not be loaded: ' + request.statusText);
	        }
	    };

	    request.onerror = function () {
	        callback('Font could not be loaded');
	    };

	    request.send();
	}

	// Table Directory Entries //////////////////////////////////////////////
	/**
	 * Parses OpenType table entries.
	 * @param  {DataView}
	 * @param  {Number}
	 * @return {Object[]}
	 */
	function parseOpenTypeTableEntries(data, numTables) {
	    var tableEntries = [];
	    var p = 12;
	    for (var i = 0; i < numTables; i += 1) {
	        var tag = parse.getTag(data, p);
	        var checksum = parse.getULong(data, p + 4);
	        var offset = parse.getULong(data, p + 8);
	        var length = parse.getULong(data, p + 12);
	        tableEntries.push({tag: tag, checksum: checksum, offset: offset, length: length, compression: false});
	        p += 16;
	    }

	    return tableEntries;
	}

	/**
	 * Parses WOFF table entries.
	 * @param  {DataView}
	 * @param  {Number}
	 * @return {Object[]}
	 */
	function parseWOFFTableEntries(data, numTables) {
	    var tableEntries = [];
	    var p = 44; // offset to the first table directory entry.
	    for (var i = 0; i < numTables; i += 1) {
	        var tag = parse.getTag(data, p);
	        var offset = parse.getULong(data, p + 4);
	        var compLength = parse.getULong(data, p + 8);
	        var origLength = parse.getULong(data, p + 12);
	        var compression = (void 0);
	        if (compLength < origLength) {
	            compression = 'WOFF';
	        } else {
	            compression = false;
	        }

	        tableEntries.push({tag: tag, offset: offset, compression: compression,
	            compressedLength: compLength, length: origLength});
	        p += 20;
	    }

	    return tableEntries;
	}

	/**
	 * @typedef TableData
	 * @type Object
	 * @property {DataView} data - The DataView
	 * @property {number} offset - The data offset.
	 */

	/**
	 * @param  {DataView}
	 * @param  {Object}
	 * @return {TableData}
	 */
	function uncompressTable(data, tableEntry) {
	    if (tableEntry.compression === 'WOFF') {
	        var inBuffer = new Uint8Array(data.buffer, tableEntry.offset + 2, tableEntry.compressedLength - 2);
	        var outBuffer = new Uint8Array(tableEntry.length);
	        tinyInflate(inBuffer, outBuffer);
	        if (outBuffer.byteLength !== tableEntry.length) {
	            throw new Error('Decompression error: ' + tableEntry.tag + ' decompressed length doesn\'t match recorded length');
	        }

	        var view = new DataView(outBuffer.buffer, 0);
	        return {data: view, offset: 0};
	    } else {
	        return {data: data, offset: tableEntry.offset};
	    }
	}

	// Public API ///////////////////////////////////////////////////////////

	/**
	 * Parse the OpenType file data (as an ArrayBuffer) and return a Font object.
	 * Throws an error if the font could not be parsed.
	 * @param  {ArrayBuffer}
	 * @param  {Object} opt - options for parsing
	 * @return {opentype.Font}
	 */
	function parseBuffer(buffer, opt) {
	    opt = (opt === undefined || opt === null) ?  {} : opt;

	    var indexToLocFormat;
	    var ltagTable;

	    // Since the constructor can also be called to create new fonts from scratch, we indicate this
	    // should be an empty font that we'll fill with our own data.
	    var font = new Font({empty: true});

	    // OpenType fonts use big endian byte ordering.
	    // We can't rely on typed array view types, because they operate with the endianness of the host computer.
	    // Instead we use DataViews where we can specify endianness.
	    var data = new DataView(buffer, 0);
	    var numTables;
	    var tableEntries = [];
	    var signature = parse.getTag(data, 0);
	    if (signature === String.fromCharCode(0, 1, 0, 0) || signature === 'true' || signature === 'typ1') {
	        font.outlinesFormat = 'truetype';
	        numTables = parse.getUShort(data, 4);
	        tableEntries = parseOpenTypeTableEntries(data, numTables);
	    } else if (signature === 'OTTO') {
	        font.outlinesFormat = 'cff';
	        numTables = parse.getUShort(data, 4);
	        tableEntries = parseOpenTypeTableEntries(data, numTables);
	    } else if (signature === 'wOFF') {
	        var flavor = parse.getTag(data, 4);
	        if (flavor === String.fromCharCode(0, 1, 0, 0)) {
	            font.outlinesFormat = 'truetype';
	        } else if (flavor === 'OTTO') {
	            font.outlinesFormat = 'cff';
	        } else {
	            throw new Error('Unsupported OpenType flavor ' + signature);
	        }

	        numTables = parse.getUShort(data, 12);
	        tableEntries = parseWOFFTableEntries(data, numTables);
	    } else {
	        throw new Error('Unsupported OpenType signature ' + signature);
	    }

	    var cffTableEntry;
	    var fvarTableEntry;
	    var glyfTableEntry;
	    var gdefTableEntry;
	    var gposTableEntry;
	    var gsubTableEntry;
	    var hmtxTableEntry;
	    var kernTableEntry;
	    var locaTableEntry;
	    var nameTableEntry;
	    var metaTableEntry;
	    var p;

	    for (var i = 0; i < numTables; i += 1) {
	        var tableEntry = tableEntries[i];
	        var table = (void 0);
	        switch (tableEntry.tag) {
	            case 'cmap':
	                table = uncompressTable(data, tableEntry);
	                font.tables.cmap = cmap.parse(table.data, table.offset);
	                font.encoding = new CmapEncoding(font.tables.cmap);
	                break;
	            case 'cvt ' :
	                table = uncompressTable(data, tableEntry);
	                p = new parse.Parser(table.data, table.offset);
	                font.tables.cvt = p.parseShortList(tableEntry.length / 2);
	                break;
	            case 'fvar':
	                fvarTableEntry = tableEntry;
	                break;
	            case 'fpgm' :
	                table = uncompressTable(data, tableEntry);
	                p = new parse.Parser(table.data, table.offset);
	                font.tables.fpgm = p.parseByteList(tableEntry.length);
	                break;
	            case 'head':
	                table = uncompressTable(data, tableEntry);
	                font.tables.head = head.parse(table.data, table.offset);
	                font.unitsPerEm = font.tables.head.unitsPerEm;
	                indexToLocFormat = font.tables.head.indexToLocFormat;
	                break;
	            case 'hhea':
	                table = uncompressTable(data, tableEntry);
	                font.tables.hhea = hhea.parse(table.data, table.offset);
	                font.ascender = font.tables.hhea.ascender;
	                font.descender = font.tables.hhea.descender;
	                font.numberOfHMetrics = font.tables.hhea.numberOfHMetrics;
	                break;
	            case 'hmtx':
	                hmtxTableEntry = tableEntry;
	                break;
	            case 'ltag':
	                table = uncompressTable(data, tableEntry);
	                ltagTable = ltag.parse(table.data, table.offset);
	                break;
	            case 'maxp':
	                table = uncompressTable(data, tableEntry);
	                font.tables.maxp = maxp.parse(table.data, table.offset);
	                font.numGlyphs = font.tables.maxp.numGlyphs;
	                break;
	            case 'name':
	                nameTableEntry = tableEntry;
	                break;
	            case 'OS/2':
	                table = uncompressTable(data, tableEntry);
	                font.tables.os2 = os2.parse(table.data, table.offset);
	                break;
	            case 'post':
	                table = uncompressTable(data, tableEntry);
	                font.tables.post = post.parse(table.data, table.offset);
	                font.glyphNames = new GlyphNames(font.tables.post);
	                break;
	            case 'prep' :
	                table = uncompressTable(data, tableEntry);
	                p = new parse.Parser(table.data, table.offset);
	                font.tables.prep = p.parseByteList(tableEntry.length);
	                break;
	            case 'glyf':
	                glyfTableEntry = tableEntry;
	                break;
	            case 'loca':
	                locaTableEntry = tableEntry;
	                break;
	            case 'CFF ':
	                cffTableEntry = tableEntry;
	                break;
	            case 'kern':
	                kernTableEntry = tableEntry;
	                break;
	            case 'GDEF':
	                gdefTableEntry = tableEntry;
	                break;
	            case 'GPOS':
	                gposTableEntry = tableEntry;
	                break;
	            case 'GSUB':
	                gsubTableEntry = tableEntry;
	                break;
	            case 'meta':
	                metaTableEntry = tableEntry;
	                break;
	        }
	    }

	    var nameTable = uncompressTable(data, nameTableEntry);
	    font.tables.name = _name.parse(nameTable.data, nameTable.offset, ltagTable);
	    font.names = font.tables.name;

	    if (glyfTableEntry && locaTableEntry) {
	        var shortVersion = indexToLocFormat === 0;
	        var locaTable = uncompressTable(data, locaTableEntry);
	        var locaOffsets = loca.parse(locaTable.data, locaTable.offset, font.numGlyphs, shortVersion);
	        var glyfTable = uncompressTable(data, glyfTableEntry);
	        font.glyphs = glyf.parse(glyfTable.data, glyfTable.offset, locaOffsets, font, opt);
	    } else if (cffTableEntry) {
	        var cffTable = uncompressTable(data, cffTableEntry);
	        cff.parse(cffTable.data, cffTable.offset, font, opt);
	    } else {
	        throw new Error('Font doesn\'t contain TrueType or CFF outlines.');
	    }

	    var hmtxTable = uncompressTable(data, hmtxTableEntry);
	    hmtx.parse(font, hmtxTable.data, hmtxTable.offset, font.numberOfHMetrics, font.numGlyphs, font.glyphs, opt);
	    addGlyphNames(font, opt);

	    if (kernTableEntry) {
	        var kernTable = uncompressTable(data, kernTableEntry);
	        font.kerningPairs = kern.parse(kernTable.data, kernTable.offset);
	    } else {
	        font.kerningPairs = {};
	    }

	    if (gdefTableEntry) {
	        var gdefTable = uncompressTable(data, gdefTableEntry);
	        font.tables.gdef = gdef.parse(gdefTable.data, gdefTable.offset);
	    }

	    if (gposTableEntry) {
	        var gposTable = uncompressTable(data, gposTableEntry);
	        font.tables.gpos = gpos.parse(gposTable.data, gposTable.offset);
	        font.position.init();
	    }

	    if (gsubTableEntry) {
	        var gsubTable = uncompressTable(data, gsubTableEntry);
	        font.tables.gsub = gsub.parse(gsubTable.data, gsubTable.offset);
	    }

	    if (fvarTableEntry) {
	        var fvarTable = uncompressTable(data, fvarTableEntry);
	        font.tables.fvar = fvar.parse(fvarTable.data, fvarTable.offset, font.names);
	    }

	    if (metaTableEntry) {
	        var metaTable = uncompressTable(data, metaTableEntry);
	        font.tables.meta = meta.parse(metaTable.data, metaTable.offset);
	        font.metas = font.tables.meta;
	    }

	    return font;
	}

	/**
	 * Asynchronously load the font from a URL or a filesystem. When done, call the callback
	 * with two arguments `(err, font)`. The `err` will be null on success,
	 * the `font` is a Font object.
	 * We use the node.js callback convention so that
	 * opentype.js can integrate with frameworks like async.js.
	 * @alias opentype.load
	 * @param  {string} url - The URL of the font to load.
	 * @param  {Function} callback - The callback.
	 */
	function load(url, callback, opt) {
	    opt = (opt === undefined || opt === null) ?  {} : opt;
	    var isNode = typeof window === 'undefined';
	    var loadFn = isNode && !opt.isUrl ? loadFromFile : loadFromUrl;

	    return new Promise(function (resolve, reject) {
	        loadFn(url, function(err, arrayBuffer) {
	            if (err) {
	                if (callback) {
	                    return callback(err);
	                } else {
	                    reject(err);
	                }
	            }
	            var font;
	            try {
	                font = parseBuffer(arrayBuffer, opt);
	            } catch (e) {
	                if (callback) {
	                    return callback(e, null);
	                } else {
	                    reject(e);
	                }
	            }
	            if (callback) {
	                return callback(null, font);
	            } else {
	                resolve(font);
	            }
	        });
	    });
	}

	/**
	 * Synchronously load the font from a URL or file.
	 * When done, returns the font object or throws an error.
	 * @alias opentype.loadSync
	 * @param  {string} url - The URL of the font to load.
	 * @param  {Object} opt - opt.lowMemory
	 * @return {opentype.Font}
	 */
	function loadSync(url, opt) {
	    var fs = require('fs');
	    var buffer = fs.readFileSync(url);
	    return parseBuffer(nodeBufferToArrayBuffer(buffer), opt);
	}

	var opentype = /*#__PURE__*/Object.freeze({
		__proto__: null,
		Font: Font,
		Glyph: Glyph,
		Path: Path,
		BoundingBox: BoundingBox,
		_parse: parse,
		parse: parseBuffer,
		load: load,
		loadSync: loadSync
	});

	exports.BoundingBox = BoundingBox;
	exports.Font = Font;
	exports.Glyph = Glyph;
	exports.Path = Path;
	exports._parse = parse;
	exports.default = opentype;
	exports.load = load;
	exports.loadSync = loadSync;
	exports.parse = parseBuffer;

	Object.defineProperty(exports, '__esModule', { value: true });

})));


}).call(this)}).call(this,require("buffer").Buffer)
},{"buffer":46,"fs":44}],26:[function(require,module,exports){
/*
	String Kit

	Copyright (c) 2014 - 2021 Cédric Ronvel

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



/*
	Number formatting class.
	.format() should entirely use it for everything related to number formatting.
	It avoids unsolvable rounding error with epsilon.
	It is dedicated for number display, not for computing.
*/



function StringNumber( number , decimalSeparator = '.' , groupSeparator = '' , forceDecimalSeparator = false ) {
	this.sign = 1 ;
	this.digits = [] ;
	this.exposant = 0 ;
	this.special = null ;	// 'special' store special values like NaN, Infinity, etc

	this.decimalSeparator = decimalSeparator ;
	this.forceDecimalSeparator = !! forceDecimalSeparator ;
	this.groupSeparator = groupSeparator ;

	this.set( number ) ;
}

module.exports = StringNumber ;



StringNumber.prototype.set = function( number ) {
	var matches , digits , exposant , v , i , iMax , index , hasNonZeroHead , tailIndex ;

	number = + number ;

	// Reset anything, if it was already used...
	this.sign = 1 ;
	this.digits.length = 0 ;
	this.exposant = 0 ;
	this.special = null ;

	if ( ! Number.isFinite( number ) ) {
		this.special = number ;
		return null ;
	}

	number = '' + number ;
	matches = number.match( /(-)?([0-9]+)(?:.([0-9]+))?(?:e([+-][0-9]+))?/ ) ;
	if ( ! matches ) { throw new Error( 'Unexpected error' ) ; }

	this.sign = matches[ 1 ] ? -1 : 1 ;
	this.exposant = matches[ 2 ].length + ( parseInt( matches[ 4 ] , 10 ) || 0 ) ;

	// Copy each digits and cast them back into a number
	index = 0 ;
	hasNonZeroHead = false ;
	tailIndex = 0 ;	// used to cut trailing zero

	for ( i = 0 , iMax = matches[ 2 ].length ; i < iMax ; i ++ ) {
		v = + matches[ 2 ][ i ] ;
		if ( v !== 0 ) {
			hasNonZeroHead = true ;
			this.digits[ index ] = v ;
			index ++ ;
			tailIndex = index ;
		}
		else if ( hasNonZeroHead ) {
			this.digits[ index ] = v ;
			index ++ ;
		}
		else {
			this.exposant -- ;
		}
	}

	if ( matches[ 3 ] ) {
		for ( i = 0 , iMax = matches[ 3 ].length ; i < iMax ; i ++ ) {
			v = + matches[ 3 ][ i ] ;

			if ( v !== 0 ) {
				hasNonZeroHead = true ;
				this.digits[ index ] = v ;
				index ++ ;
				tailIndex = index ;
			}
			else if ( hasNonZeroHead ) {
				this.digits[ index ] = v ;
				index ++ ;
			}
			else {
				this.exposant -- ;
			}
		}
	}

	if ( tailIndex !== index ) {
		this.digits.length = tailIndex ;
	}
} ;



StringNumber.prototype.toNumber = function() {
	// Using a string representation
	if ( this.special !== null ) { return this.special ; }
	return parseFloat( ( this.sign < 0 ? '-' : '' ) + '0.' + this.digits.join( '' ) + 'e' + this.exposant ) ;
} ;



StringNumber.prototype.toString = function( ... args ) {
	if ( this.special !== null ) { return '' + this.special ; }
	if ( this.exposant > 20 || this.exposant < -20 ) { return this.toScientificString( ... args ) ; }
	return this.toNoExpString( ... args ) ;
} ;



StringNumber.prototype.toExponential =
StringNumber.prototype.toExponentialString = function() {
	if ( this.special !== null ) { return '' + this.special ; }

	var str = this.sign < 0 ? '-' : '' ;
	if ( ! this.digits.length ) { return str + '0' ; }

	str += this.digits[ 0 ] ;

	if ( this.digits.length > 1 ) {
		str += this.decimalSeparator + this.digits.join( '' ).slice( 1 ) ;
	}

	str += 'e' + ( this.exposant > 0 ? '+' : '' ) + ( this.exposant - 1 ) ;
	return str ;
} ;



const SUPER_NUMBER = [ '⁰' , '¹' , '²' , '³' , '⁴' , '⁵' , '⁶' , '⁷' , '⁸' , '⁹' ] ;
const SUPER_PLUS = '⁺' ;
const SUPER_MINUS = '⁻' ;
const ZERO_CHAR_CODE = '0'.charCodeAt( 0 ) ;

StringNumber.prototype.toScientific =
StringNumber.prototype.toScientificString = function() {
	if ( this.special !== null ) { return '' + this.special ; }

	var str = this.sign < 0 ? '-' : '' ;
	if ( ! this.digits.length ) { return str + '0' ; }

	str += this.digits[ 0 ] ;

	if ( this.digits.length > 1 ) {
		str += this.decimalSeparator + this.digits.join( '' ).slice( 1 ) ;
	}

	var exposantStr =
		( this.exposant <= 0 ? SUPER_MINUS : '' ) +
		( '' + Math.abs( this.exposant - 1 ) ).split( '' ).map( c => SUPER_NUMBER[ c.charCodeAt( 0 ) - ZERO_CHAR_CODE ] )
			.join( '' ) ;

	str += ' × 10' + exposantStr ;
	return str ;
} ;



// leadingZero = minimal number of numbers before the dot, they will be left-padded with zero if needed.
// trailingZero = minimal number of numbers after the dot, they will be right-padded with zero if needed.
// onlyIfDecimal: set it to true if you don't want right padding zero when there is no decimal
StringNumber.prototype.toNoExp =
StringNumber.prototype.toNoExpString = function( leadingZero = 1 , trailingZero = 0 , onlyIfDecimal = false , forcePlusSign = false , exposant = this.exposant ) {
	if ( this.special !== null ) { return '' + this.special ; }

	var integerDigits = [] , decimalDigits = [] ,
		str = this.sign < 0 ? '-' : forcePlusSign ? '+' : '' ;

	if ( ! this.digits.length ) {
		arrayFill( integerDigits , 0 , leadingZero ) ;

		if ( trailingZero && ! onlyIfDecimal ) {
			arrayFill( decimalDigits , 0 , trailingZero ) ;
		}
	}
	else if ( exposant <= 0 ) {
		// This number is of type 0.[0...]xyz
		arrayFill( integerDigits , 0 , leadingZero ) ;

		arrayFill( decimalDigits , 0 , -exposant ) ;
		arrayConcatSlice( decimalDigits , this.digits ) ;

		if ( trailingZero && this.digits.length - exposant < trailingZero ) {
			arrayFill( decimalDigits , 0 , trailingZero - this.digits.length + exposant ) ;
		}
	}
	else if ( exposant >= this.digits.length ) {
		// This number is of type xyz[0...]
		if ( exposant < leadingZero ) { arrayFill( integerDigits , 0 , leadingZero - exposant ) ; }
		arrayConcatSlice( integerDigits , this.digits ) ;
		arrayFill( integerDigits , 0 , exposant - this.digits.length ) ;

		if ( trailingZero && ! onlyIfDecimal ) {
			arrayFill( decimalDigits , 0 , trailingZero ) ;
		}
	}
	else {
		// Here the digits are splitted with a dot in the middle
		if ( exposant < leadingZero ) { arrayFill( integerDigits , 0 , leadingZero - exposant ) ; }
		arrayConcatSlice( integerDigits , this.digits , 0 , exposant ) ;

		arrayConcatSlice( decimalDigits , this.digits , exposant ) ;

		if (
			trailingZero && this.digits.length - exposant < trailingZero
			&& ( ! onlyIfDecimal || this.digits.length - exposant > 0 )
		) {
			arrayFill( decimalDigits , 0 , trailingZero - this.digits.length + exposant ) ;
		}
	}

	str += this.groupSeparator ?
		this.groupDigits( integerDigits , this.groupSeparator ) :
		integerDigits.join( '' ) ;

	if ( decimalDigits.length ) {
		str += this.decimalSeparator + (
			this.decimalGroupSeparator ?
				this.groupDigits( decimalDigits , this.decimalGroupSeparator ) :
				decimalDigits.join( '' )
		) ;
	}
	else if ( this.forceDecimalSeparator ) {
		str += this.decimalSeparator ;
	}

	return str ;
} ;



// Metric prefix
const MUL_PREFIX = [ '' , 'k' , 'M' , 'G' , 'T' , 'P' , 'E' , 'Z' , 'Y' ] ;
const SUB_MUL_PREFIX = [ '' , 'm' , 'µ' , 'n' , 'p' , 'f' , 'a' , 'z' , 'y' ] ;



StringNumber.prototype.toMetric =
StringNumber.prototype.toMetricString = function( leadingZero = 1 , trailingZero = 0 , onlyIfDecimal = false , forcePlusSign = false ) {
	if ( this.special !== null ) { return '' + this.special ; }
	if ( ! this.digits.length ) { return this.sign > 0 ? '0' : '-0' ; }

	var prefix = '' , fakeExposant ;

	if ( this.exposant > 0 ) {
		fakeExposant = 1 + ( ( this.exposant - 1 ) % 3 ) ;
		prefix = MUL_PREFIX[ Math.floor( ( this.exposant - 1 ) / 3 ) ] ;
		// Fallback to scientific if the number is to big
		if ( prefix === undefined ) { return this.toScientificString() ; }
	}
	else {
		fakeExposant = 3 - ( -this.exposant % 3 ) ;
		prefix = SUB_MUL_PREFIX[ 1 + Math.floor( -this.exposant / 3 ) ] ;
		// Fallback to scientific if the number is to small
		if ( prefix === undefined ) { return this.toScientificString() ; }
	}

	return this.toNoExpString( leadingZero , trailingZero , onlyIfDecimal , forcePlusSign , fakeExposant ) + prefix ;
} ;



/*
	type: 0=round, -1=floor, 1=ceil
	Floor if < .99999
	Ceil if >= .00001
*/
StringNumber.prototype.precision = function( n , type = 0 ) {
	var roundUp ;

	if ( this.special !== null || n >= this.digits.length ) { return this ; }

	if ( n < 0 ) { this.digits.length = 0 ; return this ; }

	type *= this.sign ;

	if ( type < 0 ) {
		roundUp =
			this.digits.length > n + 4
			&& this.digits[ n ] === 9 && this.digits[ n + 1 ] === 9
			&& this.digits[ n + 2 ] === 9 && this.digits[ n + 3 ] === 9 && this.digits[ n + 4 ] === 9 ;
	}
	else if ( type > 0 ) {
		roundUp =
			this.digits[ n ] > 0 || this.digits[ n + 1 ] > 0
			|| this.digits[ n + 2 ] > 0 || this.digits[ n + 3 ] > 0 || this.digits[ n + 4 ] > 0 ;
	}
	else {
		roundUp = this.digits[ n ] >= 5 ;
	}

	if ( roundUp ) {
		let i = n - 1 ,
			done = false ;

		// Cascading increase
		for ( ; i >= 0 ; i -- ) {
			if ( this.digits[ i ] < 9 ) { this.digits[ i ] ++ ; done = true ; break ; }
			else { this.digits[ i ] = 0 ; }
		}

		if ( ! done ) {
			this.exposant ++ ;
			this.digits[ 0 ] = 1 ;
			this.digits.length = 1 ;
		}
		else {
			this.digits.length = i + 1 ;
		}
	}
	else {
		this.digits.length = n ;
		this.removeTrailingZero() ;
	}

	return this ;
} ;



StringNumber.prototype.round = function( decimalPlace = 0 , type = 0 ) {
	var n = this.exposant + decimalPlace ;
	return this.precision( n , type ) ;
} ;



StringNumber.prototype.floor = function( decimalPlace = 0 ) {
	var n = this.exposant + decimalPlace ;
	return this.precision( n , -1 ) ;
} ;



StringNumber.prototype.ceil = function( decimalPlace = 0 ) {
	var n = this.exposant + decimalPlace ;
	return this.precision( n , 1 ) ;
} ;



StringNumber.prototype.removeTrailingZero = function() {
	var i = this.digits.length - 1 ;
	while( i >= 0 && this.digits[ i ] === 0 ) { i -- ; }
	this.digits.length = i + 1 ;
} ;



const GROUP_SIZE = 3 ;

StringNumber.prototype.groupDigits = function( digits , separator , inverseOrder = false ) {
	var str = '' ,
		offset = inverseOrder ? 0 : GROUP_SIZE - ( digits.length % GROUP_SIZE ) ,
		i = 0 ,
		iMax = digits.length ;

	for ( ; i < iMax ; i ++ ) {
		str += i && ( ( i + offset ) % GROUP_SIZE === 0 ) ? separator + digits[ i ] : digits[ i ] ;
	}

	return str ;
} ;



function arrayFill( intoArray , value , repeat ) {
	while ( repeat -- ) { intoArray[ intoArray.length ] = value ; }
	return intoArray ;
}



function arrayConcatSlice( intoArray , sourceArray , start = 0 , end = sourceArray.length ) {
	for ( let i = start ; i < end ; i ++ ) { intoArray[ intoArray.length ] = sourceArray[ i ] ; }
	return intoArray ;
}


},{}],27:[function(require,module,exports){
/*
	String Kit

	Copyright (c) 2014 - 2021 Cédric Ronvel

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



// To solve dependency hell, we do not rely on terminal-kit anymore.
const ansi = {
	reset: '\x1b[0m' ,
	bold: '\x1b[1m' ,
	dim: '\x1b[2m' ,
	italic: '\x1b[3m' ,
	underline: '\x1b[4m' ,
	inverse: '\x1b[7m' ,

	defaultColor: '\x1b[39m' ,
	black: '\x1b[30m' ,
	red: '\x1b[31m' ,
	green: '\x1b[32m' ,
	yellow: '\x1b[33m' ,
	blue: '\x1b[34m' ,
	magenta: '\x1b[35m' ,
	cyan: '\x1b[36m' ,
	white: '\x1b[37m' ,
	grey: '\x1b[90m' ,
	gray: '\x1b[90m' ,
	brightBlack: '\x1b[90m' ,
	brightRed: '\x1b[91m' ,
	brightGreen: '\x1b[92m' ,
	brightYellow: '\x1b[93m' ,
	brightBlue: '\x1b[94m' ,
	brightMagenta: '\x1b[95m' ,
	brightCyan: '\x1b[96m' ,
	brightWhite: '\x1b[97m' ,

	defaultBgColor: '\x1b[49m' ,
	bgBlack: '\x1b[40m' ,
	bgRed: '\x1b[41m' ,
	bgGreen: '\x1b[42m' ,
	bgYellow: '\x1b[43m' ,
	bgBlue: '\x1b[44m' ,
	bgMagenta: '\x1b[45m' ,
	bgCyan: '\x1b[46m' ,
	bgWhite: '\x1b[47m' ,
	bgGrey: '\x1b[100m' ,
	bgGray: '\x1b[100m' ,
	bgBrightBlack: '\x1b[100m' ,
	bgBrightRed: '\x1b[101m' ,
	bgBrightGreen: '\x1b[102m' ,
	bgBrightYellow: '\x1b[103m' ,
	bgBrightBlue: '\x1b[104m' ,
	bgBrightMagenta: '\x1b[105m' ,
	bgBrightCyan: '\x1b[106m' ,
	bgBrightWhite: '\x1b[107m'
} ;

module.exports = ansi ;



ansi.fgColor = {
	defaultColor: ansi.defaultColor ,
	black: ansi.black ,
	red: ansi.red ,
	green: ansi.green ,
	yellow: ansi.yellow ,
	blue: ansi.blue ,
	magenta: ansi.magenta ,
	cyan: ansi.cyan ,
	white: ansi.white ,
	grey: ansi.grey ,
	gray: ansi.gray ,
	brightBlack: ansi.brightBlack ,
	brightRed: ansi.brightRed ,
	brightGreen: ansi.brightGreen ,
	brightYellow: ansi.brightYellow ,
	brightBlue: ansi.brightBlue ,
	brightMagenta: ansi.brightMagenta ,
	brightCyan: ansi.brightCyan ,
	brightWhite: ansi.brightWhite
} ;



ansi.bgColor = {
	defaultColor: ansi.defaultBgColor ,
	black: ansi.bgBlack ,
	red: ansi.bgRed ,
	green: ansi.bgGreen ,
	yellow: ansi.bgYellow ,
	blue: ansi.bgBlue ,
	magenta: ansi.bgMagenta ,
	cyan: ansi.bgCyan ,
	white: ansi.bgWhite ,
	grey: ansi.bgGrey ,
	gray: ansi.bgGray ,
	brightBlack: ansi.bgBrightBlack ,
	brightRed: ansi.bgBrightRed ,
	brightGreen: ansi.bgBrightGreen ,
	brightYellow: ansi.bgBrightYellow ,
	brightBlue: ansi.bgBrightBlue ,
	brightMagenta: ansi.bgBrightMagenta ,
	brightCyan: ansi.bgBrightCyan ,
	brightWhite: ansi.bgBrightWhite
} ;



ansi.trueColor = ( r , g , b ) => {
	if ( g === undefined && typeof r === 'string' ) {
		let hex = r ;
		if ( hex[ 0 ] === '#' ) { hex = hex.slice( 1 ) ; }	// Strip the # if necessary
		if ( hex.length === 3 ) { hex = hex[ 0 ] + hex[ 0 ] + hex[ 1 ] + hex[ 1 ] + hex[ 2 ] + hex[ 2 ] ; }
		r = parseInt( hex.slice( 0 , 2 ) , 16 ) || 0 ;
		g = parseInt( hex.slice( 2 , 4 ) , 16 ) || 0 ;
		b = parseInt( hex.slice( 4 , 6 ) , 16 ) || 0 ;
	}

	return '\x1b[38;2;' + r + ';' + g + ';' + b + 'm' ;
} ;



ansi.bgTrueColor = ( r , g , b ) => {
	if ( g === undefined && typeof r === 'string' ) {
		let hex = r ;
		if ( hex[ 0 ] === '#' ) { hex = hex.slice( 1 ) ; }	// Strip the # if necessary
		if ( hex.length === 3 ) { hex = hex[ 0 ] + hex[ 0 ] + hex[ 1 ] + hex[ 1 ] + hex[ 2 ] + hex[ 2 ] ; }
		r = parseInt( hex.slice( 0 , 2 ) , 16 ) || 0 ;
		g = parseInt( hex.slice( 2 , 4 ) , 16 ) || 0 ;
		b = parseInt( hex.slice( 4 , 6 ) , 16 ) || 0 ;
	}

	return '\x1b[48;2;' + r + ';' + g + ';' + b + 'm' ;
} ;



const ANSI_CODES = {
	'0': null ,

	'1': { bold: true } ,
	'2': { dim: true } ,
	'22': { bold: false , dim: false } ,
	'3': { italic: true } ,
	'23': { italic: false } ,
	'4': { underline: true } ,
	'24': { underline: false } ,
	'5': { blink: true } ,
	'25': { blink: false } ,
	'7': { inverse: true } ,
	'27': { inverse: false } ,
	'8': { hidden: true } ,
	'28': { hidden: false } ,
	'9': { strike: true } ,
	'29': { strike: false } ,

	'30': { color: 0 } ,
	'31': { color: 1 } ,
	'32': { color: 2 } ,
	'33': { color: 3 } ,
	'34': { color: 4 } ,
	'35': { color: 5 } ,
	'36': { color: 6 } ,
	'37': { color: 7 } ,
	//'39': { defaultColor: true } ,
	'39': { color: 'default' } ,

	'90': { color: 8 } ,
	'91': { color: 9 } ,
	'92': { color: 10 } ,
	'93': { color: 11 } ,
	'94': { color: 12 } ,
	'95': { color: 13 } ,
	'96': { color: 14 } ,
	'97': { color: 15 } ,

	'40': { bgColor: 0 } ,
	'41': { bgColor: 1 } ,
	'42': { bgColor: 2 } ,
	'43': { bgColor: 3 } ,
	'44': { bgColor: 4 } ,
	'45': { bgColor: 5 } ,
	'46': { bgColor: 6 } ,
	'47': { bgColor: 7 } ,
	//'49': { bgDefaultColor: true } ,
	'49': { bgColor: 'default' } ,

	'100': { bgColor: 8 } ,
	'101': { bgColor: 9 } ,
	'102': { bgColor: 10 } ,
	'103': { bgColor: 11 } ,
	'104': { bgColor: 12 } ,
	'105': { bgColor: 13 } ,
	'106': { bgColor: 14 } ,
	'107': { bgColor: 15 }
} ;



// Parse ANSI codes, output is compatible with the markup parser
ansi.parse = str => {
	var ansiCodes , raw , part , style , output = [] ;

	for ( [ , ansiCodes , raw ] of str.matchAll( /\x1b\[([0-9;]+)m|(.[^\x1b]*)/g ) ) {
		if ( raw ) {
			if ( output.length ) { output[ output.length - 1 ].text += raw ; }
			else { output.push( { text: raw } ) ; }
		}
		else {
			ansiCodes.split( ';' ).forEach( ansiCode => {
				style = ANSI_CODES[ ansiCode ] ;
				if ( style === undefined ) { return ; }

				if ( ! output.length || output[ output.length - 1 ].text ) {
					if ( ! style ) {
						part = { text: '' } ;
					}
					else {
						part = Object.assign( {} , part , style ) ;
						part.text = '' ;
					}

					output.push( part ) ;
				}
				else {
					// There is no text, no need to create a new part
					if ( ! style ) {
						// Replace the last part
						output[ output.length - 1 ] = { text: '' } ;
					}
					else {
						// update the last part
						Object.assign( part , style ) ;
					}
				}
			} ) ;
		}
	}

	return output ;
} ;


},{}],28:[function(require,module,exports){
/*
	String Kit

	Copyright (c) 2014 - 2021 Cédric Ronvel

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



var camel = {} ;
module.exports = camel ;



// Transform alphanum separated by underscore or minus to camel case
camel.toCamelCase = function( str , preserveUpperCase = false , initialUpperCase = false ) {
	if ( ! str || typeof str !== 'string' ) { return '' ; }

	return str.replace(
		/(?:^[\s_-]*|([\s_-]+))(([^\s_-]?)([^\s_-]*))/g ,
		( match , isNotFirstWord , word , firstLetter , endOfWord ) => {
			if ( preserveUpperCase ) {
				if ( ! isNotFirstWord && ! initialUpperCase ) { return word ; }
				if ( ! firstLetter ) { return '' ; }
				return firstLetter.toUpperCase() + endOfWord ;
			}

			if ( ! isNotFirstWord && ! initialUpperCase ) { return word.toLowerCase() ; }
			if ( ! firstLetter ) { return '' ; }
			return firstLetter.toUpperCase() + endOfWord.toLowerCase() ;
		}
	) ;
} ;



camel.camelCaseToSeparated = function( str , separator = ' ' , acronym = true ) {
	if ( ! str || typeof str !== 'string' ) { return '' ; }

	if ( ! acronym ) {
		return str.replace( /^([A-Z])|([A-Z])/g , ( match , firstLetter , letter ) => {
			if ( firstLetter ) { return firstLetter.toLowerCase() ; }
			return separator + letter.toLowerCase() ;
		} ) ;
	}

	// (^)? and (^)? does not work, so we have to use (?:(^)|)) and (?:($)|)) to capture end or not
	return str.replace( /(?:(^)|)([A-Z]+)(?:($)|(?=[a-z]))/g , ( match , isStart , letters , isEnd ) => {
		isStart = isStart === '' ;
		isEnd = isEnd === '' ;

		var prefix = isStart ? '' : separator ;

		return letters.length === 1 ? prefix + letters.toLowerCase() :
			isEnd ? prefix + letters :
			letters.length === 2 ? prefix + letters[ 0 ].toLowerCase() + separator + letters[ 1 ].toLowerCase() :
			prefix + letters.slice( 0 , -1 ) + separator + letters.slice( -1 ).toLowerCase() ;
	} ) ;
} ;



// Transform camel case to alphanum separated by minus
camel.camelCaseToDash =
camel.camelCaseToDashed = ( str ) => camel.camelCaseToSeparated( str , '-' , false ) ;


},{}],29:[function(require,module,exports){
/*
	String Kit

	Copyright (c) 2014 - 2021 Cédric Ronvel

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

/*
	Escape collection.
*/



"use strict" ;



// From Mozilla Developper Network
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
exports.regExp = exports.regExpPattern = str => str.replace( /([.*+?^${}()|[\]/\\])/g , '\\$1' ) ;

// This replace any single $ by a double $$
exports.regExpReplacement = str => str.replace( /\$/g , '$$$$' ) ;

// Escape for string.format()
// This replace any single % by a double %%
exports.format = str => str.replace( /%/g , '%%' ) ;

exports.jsSingleQuote = str => exports.control( str ).replace( /'/g , "\\'" ) ;
exports.jsDoubleQuote = str => exports.control( str ).replace( /"/g , '\\"' ) ;

exports.shellArg = str => '\'' + str.replace( /'/g , "'\\''" ) + '\'' ;



var escapeControlMap = {
	'\r': '\\r' ,
	'\n': '\\n' ,
	'\t': '\\t' ,
	'\x7f': '\\x7f'
} ;

// Escape \r \n \t so they become readable again, escape all ASCII control character as well, using \x syntaxe
exports.control = ( str , keepNewLineAndTab = false ) => str.replace( /[\x00-\x1f\x7f]/g , match => {
	if ( keepNewLineAndTab && ( match === '\n' || match === '\t' ) ) { return match ; }
	if ( escapeControlMap[ match ] !== undefined ) { return escapeControlMap[ match ] ; }
	var hex = match.charCodeAt( 0 ).toString( 16 ) ;
	if ( hex.length % 2 ) { hex = '0' + hex ; }
	return '\\x' + hex ;
} ) ;



var escapeHtmlMap = {
	'&': '&amp;' ,
	'<': '&lt;' ,
	'>': '&gt;' ,
	'"': '&quot;' ,
	"'": '&#039;'
} ;

// Only escape & < > so this is suited for content outside tags
exports.html = str => str.replace( /[&<>]/g , match => escapeHtmlMap[ match ] ) ;

// Escape & < > " so this is suited for content inside a double-quoted attribute
exports.htmlAttr = str => str.replace( /[&<>"]/g , match => escapeHtmlMap[ match ] ) ;

// Escape all html special characters & < > " '
exports.htmlSpecialChars = str => str.replace( /[&<>"']/g , match => escapeHtmlMap[ match ] ) ;

// Percent-encode all control chars and codepoint greater than 255 using percent encoding
exports.unicodePercentEncode = str => str.replace( /[\x00-\x1f\u0100-\uffff\x7f%]/g , match => {
	try {
		return encodeURI( match ) ;
	}
	catch ( error ) {
		// encodeURI can throw on bad surrogate pairs, but we just strip those characters
		return '' ;
	}
} ) ;

// Encode HTTP header value
exports.httpHeaderValue = str => exports.unicodePercentEncode( str ) ;


},{}],30:[function(require,module,exports){
(function (Buffer){(function (){
/*
	String Kit

	Copyright (c) 2014 - 2021 Cédric Ronvel

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

/*
	String formater, inspired by C's sprintf().
*/



"use strict" ;



const inspect = require( './inspect.js' ).inspect ;
const inspectError = require( './inspect.js' ).inspectError ;
const escape = require( './escape.js' ) ;
const ansi = require( './ansi.js' ) ;
const unicode = require( './unicode.js' ) ;
const naturalSort = require( './naturalSort.js' ) ;
const StringNumber = require( './StringNumber.js' ) ;



/*
	%%		a single %
	%s		string
	%S		string, interpret ^ formatting
	%r		raw string: without sanitizer
	%n		natural: output the most natural representation for this type, object entries are sorted by keys
	%N		even more natural: avoid type hinting marks like bracket for array
	%f		float
	%k		number with metric system prefixes
	%e		for exponential notation (e.g. 1.23e+2)
	%K		for scientific notation (e.g. 1.23 × 10²)
	%i	%d	integer
	%u		unsigned integer
	%U		unsigned positive integer (>0)
	%P		number to (absolute) percent (e.g.: 0.75 -> 75%)
	%p		number to relative percent (e.g.: 1.25 -> +25% ; 0.75 -> -25%)
	%t		time duration, convert ms into h min s, e.g.: 2h14min52s or 2:14:52
	%m		convert degree into degree, minutes and seconds
	%h		hexadecimal (input is a number)
	%x		hexadecimal (input is a number), force pair of symbols (e.g. 'f' -> '0f')
	%o		octal
	%b		binary
	%X		hexadecimal: convert a string into hex charcode, force pair of symbols (e.g. 'f' -> '0f')
	%z		base64
	%Z		base64url
	%I		call string-kit's inspect()
	%Y		call string-kit's inspect(), but do not inspect non-enumerable
	%O		object (like inspect, but with ultra minimal options)
	%E		call string-kit's inspectError()
	%J		JSON.stringify()
	%D		drop
	%F		filter function existing in the 'this' context, e.g. %[filter:%a%a]F
	%a		argument for a function

	Candidate format:
	%A		for automatic type? probably not good: it's like %n Natural
	%c		for char? (can receive a string or an integer translated into an UTF8 chars)
	%C		for currency formating?
	%B		for Buffer objects?
*/

exports.formatMethod = function( ... args ) {
	var arg ,
		str = args[ 0 ] ,
		autoIndex = 1 ,
		length = args.length ;

	if ( typeof str !== 'string' ) {
		if ( ! str ) { str = '' ; }
		else if ( typeof str.toString === 'function' ) { str = str.toString() ; }
		else { str = '' ; }
	}

	var runtime = {
		hasMarkup: false ,
		shift: null ,
		markupStack: []
	} ;

	if ( this.markupReset && this.startingMarkupReset ) {
		str = ( typeof this.markupReset === 'function' ? this.markupReset( runtime.markupStack ) : this.markupReset ) + str ;
	}

	//console.log( 'format args:' , arguments ) ;

	// /!\ each changes here should be reported on string.format.count() and string.format.hasFormatting() too /!\
	// Note: the closing bracket is optional to prevent ReDoS
	str = str.replace( /\^\[([^\]]*)]?|\^(.)|(%%)|%([+-]?)([0-9]*)(?:\[([^\]]*)\])?([a-zA-Z])/g ,
		( match , complexMarkup , markup , doublePercent , relative , index , modeArg , mode ) => {
			var replacement , i , tmp , fn , fnArgString , argMatches , argList = [] ;

			//console.log( 'replaceArgs:' , arguments ) ;
			if ( doublePercent ) { return '%' ; }

			if ( complexMarkup ) { markup = complexMarkup ; }
			if ( markup ) {
				if ( this.noMarkup ) { return '^' + markup ; }
				return markupReplace.call( this , runtime , match , markup ) ;
			}

			if ( index ) {
				index = parseInt( index , 10 ) ;

				if ( relative ) {
					if ( relative === '+' ) { index = autoIndex + index ; }
					else if ( relative === '-' ) { index = autoIndex - index ; }
				}
			}
			else {
				index = autoIndex ;
			}

			autoIndex ++ ;

			if ( index >= length || index < 1 ) { arg = undefined ; }
			else { arg = args[ index ] ; }

			if ( modes[ mode ] ) {
				replacement = modes[ mode ]( arg , modeArg , this ) ;
				if ( this.argumentSanitizer && ! modes[ mode ].noSanitize ) { replacement = this.argumentSanitizer( replacement ) ; }
				if ( this.escapeMarkup && ! modes[ mode ].noEscapeMarkup ) { replacement = exports.escapeMarkup( replacement ) ; }
				if ( modeArg && ! modes[ mode ].noCommonModeArg ) { replacement = commonModeArg( replacement , modeArg ) ; }
				return replacement ;
			}

			// Function mode
			if ( mode === 'F' ) {
				autoIndex -- ;	// %F does not eat any arg

				if ( modeArg === undefined ) { return '' ; }
				tmp = modeArg.split( ':' ) ;
				fn = tmp[ 0 ] ;
				fnArgString = tmp[ 1 ] ;
				if ( ! fn ) { return '' ; }

				if ( fnArgString && ( argMatches = fnArgString.match( /%([+-]?)([0-9]*)[a-zA-Z]/g ) ) ) {
					//console.log( argMatches ) ;
					//console.log( fnArgString ) ;
					for ( i = 0 ; i < argMatches.length ; i ++ ) {
						relative = argMatches[ i ][ 1 ] ;
						index = argMatches[ i ][ 2 ] ;

						if ( index ) {
							index = parseInt( index , 10 ) ;

							if ( relative ) {
								if ( relative === '+' ) { index = autoIndex + index ; }		// jshint ignore:line
								else if ( relative === '-' ) { index = autoIndex - index ; }	// jshint ignore:line
							}
						}
						else {
							index = autoIndex ;
						}

						autoIndex ++ ;

						if ( index >= length || index < 1 ) { argList[ i ] = undefined ; }
						else { argList[ i ] = args[ index ] ; }
					}
				}

				if ( ! this || ! this.fn || typeof this.fn[ fn ] !== 'function' ) { return '' ; }
				return this.fn[ fn ].apply( this , argList ) ;
			}

			return '' ;
		}
	) ;

	if ( runtime.hasMarkup && this.markupReset && this.endingMarkupReset ) {
		str += typeof this.markupReset === 'function' ? this.markupReset( runtime.markupStack ) : this.markupReset ;
	}

	if ( this.extraArguments ) {
		for ( ; autoIndex < length ; autoIndex ++ ) {
			arg = args[ autoIndex ] ;
			if ( arg === null || arg === undefined ) { continue ; }
			else if ( typeof arg === 'string' ) { str += arg ; }
			else if ( typeof arg === 'number' ) { str += arg ; }
			else if ( typeof arg.toString === 'function' ) { str += arg.toString() ; }
		}
	}

	return str ;
} ;



exports.markupMethod = function( str ) {
	if ( typeof str !== 'string' ) {
		if ( ! str ) { str = '' ; }
		else if ( typeof str.toString === 'function' ) { str = str.toString() ; }
		else { str = '' ; }
	}

	var runtime = {
		hasMarkup: false ,
		shift: null ,
		markupStack: []
	} ;

	if ( this.parse ) {
		let markupObjects , markupObject , match , complexMarkup , markup , raw , lastChunk ,
			output = [] ;

		// Note: the closing bracket is optional to prevent ReDoS
		for ( [ match , complexMarkup , markup , raw ] of str.matchAll( /\^\[([^\]]*)]?|\^(.)|([^^]+)/g ) ) {
			if ( raw ) {
				if ( output.length ) { output[ output.length - 1 ].text += raw ; }
				else { output.push( { text: raw } ) ; }
				continue ;
			}

			if ( complexMarkup ) { markup = complexMarkup ; }
			markupObjects = markupReplace.call( this , runtime , match , markup ) ;

			if ( ! Array.isArray( markupObjects ) ) { markupObjects = [ markupObjects ] ; }

			for ( markupObject of markupObjects ) {
				lastChunk = output.length ? output[ output.length - 1 ] : null ;
				if ( typeof markupObject === 'string' ) {
					// This markup is actually a text to add to the last chunk (e.g. "^^" markup is converted to a single "^")
					if ( lastChunk ) { lastChunk.text += markupObject ; }
					else { output.push( { text: markupObject } ) ; }
				}
				else if ( ! markupObject ) {
					// Null is for a markup's style reset
					if ( lastChunk && lastChunk.text.length && Object.keys( lastChunk ).length > 1 ) {
						// If there was style and text on the last chunk, then this means that the new markup starts a new chunk
						// markupObject can be null for markup reset function, but we have to create a new chunk
						output.push( { text: '' } ) ;
					}
				}
				else {
					if ( lastChunk && lastChunk.text.length ) {
						// If there was text on the last chunk, then this means that the new markup starts a new chunk
						output.push( Object.assign( { text: '' } , ... runtime.markupStack ) ) ;
					}
					else {
						// There wasn't any text added, so append the current markup style to the current chunk
						if ( lastChunk ) { Object.assign( lastChunk , markupObject ) ; }
						else { output.push( Object.assign( { text: '' } , markupObject ) ) ; }
					}
				}
			}
		}

		return output ;
	}

	if ( this.markupReset && this.startingMarkupReset ) {
		str = ( typeof this.markupReset === 'function' ? this.markupReset( runtime.markupStack ) : this.markupReset ) + str ;
	}

	str = str.replace( /\^\[([^\]]*)]?|\^(.)/g , ( match , complexMarkup , markup ) => markupReplace.call( this , runtime , match , complexMarkup || markup ) ) ;

	if ( runtime.hasMarkup && this.markupReset && this.endingMarkupReset ) {
		str += typeof this.markupReset === 'function' ? this.markupReset( runtime.markupStack ) : this.markupReset ;
	}

	return str ;
} ;



// Used by both formatMethod and markupMethod
function markupReplace( runtime , match , markup ) {
	var markupTarget , key , value , replacement , colonIndex ;

	if ( markup === '^' ) { return '^' ; }

	if ( this.shiftMarkup && this.shiftMarkup[ markup ] ) {
		runtime.shift = this.shiftMarkup[ markup ] ;
		return '' ;
	}

	if ( markup.length > 1 && this.dataMarkup && ( colonIndex = markup.indexOf( ':' ) ) !== -1 ) {
		key = markup.slice( 0 , colonIndex ) ;
		markupTarget = this.dataMarkup[ key ] ;

		if ( markupTarget === undefined ) {
			if ( this.markupCatchAll === undefined ) { return '' ; }
			markupTarget = this.markupCatchAll ;
		}

		runtime.hasMarkup = true ;
		value = markup.slice( colonIndex + 1 ) ;

		if ( typeof markupTarget === 'function' ) {
			replacement = markupTarget( runtime.markupStack , key , value ) ;
			// method should manage markup stack themselves
		}
		else {
			replacement = { [ markupTarget ]: value } ;
			stackMarkup( runtime , replacement ) ;
		}

		return replacement ;
	}

	if ( runtime.shift ) {
		markupTarget = this.shiftedMarkup?.[ runtime.shift ]?.[ markup ] ;
		runtime.shift = null ;
	}
	else {
		markupTarget = this.markup?.[ markup ] ;
	}

	if ( markupTarget === undefined ) {
		if ( this.markupCatchAll === undefined ) { return '' ; }
		markupTarget = this.markupCatchAll ;
	}

	runtime.hasMarkup = true ;

	if ( typeof markupTarget === 'function' ) {
		replacement = markupTarget( runtime.markupStack , markup ) ;
		// method should manage markup stack themselves
	}
	else {
		replacement = markupTarget ;
		stackMarkup( runtime , replacement ) ;
	}

	return replacement ;
}



// internal method for markupReplace()
function stackMarkup( runtime , replacement ) {
	if ( Array.isArray( replacement ) ) {
		for ( let item of replacement ) {
			if ( item === null ) { runtime.markupStack.length = 0 ; }
			else { runtime.markupStack.push( item ) ; }
		}
	}
	else {
		if ( replacement === null ) { runtime.markupStack.length = 0 ; }
		else { runtime.markupStack.push( replacement ) ; }
	}
}



// Note: the closing bracket is optional to prevent ReDoS
exports.stripMarkup = str => str.replace( /\^\[[^\]]*]?|\^./g , match =>
	match === '^^' ? '^' :
	match === '^ ' ? ' ' :
	''
) ;

exports.escapeMarkup = str => str.replace( /\^/g , '^^' ) ;



const DEFAULT_FORMATTER = {
	argumentSanitizer: str => escape.control( str , true ) ,
	extraArguments: true ,
	color: false ,
	noMarkup: false ,
	escapeMarkup: false ,
	endingMarkupReset: true ,
	startingMarkupReset: false ,
	markupReset: ansi.reset ,
	shiftMarkup: {
		'#': 'background'
	} ,
	markup: {
		":": ansi.reset ,
		" ": ansi.reset + " " ,

		"-": ansi.dim ,
		"+": ansi.bold ,
		"_": ansi.underline ,
		"/": ansi.italic ,
		"!": ansi.inverse ,

		"b": ansi.blue ,
		"B": ansi.brightBlue ,
		"c": ansi.cyan ,
		"C": ansi.brightCyan ,
		"g": ansi.green ,
		"G": ansi.brightGreen ,
		"k": ansi.black ,
		"K": ansi.brightBlack ,
		"m": ansi.magenta ,
		"M": ansi.brightMagenta ,
		"r": ansi.red ,
		"R": ansi.brightRed ,
		"w": ansi.white ,
		"W": ansi.brightWhite ,
		"y": ansi.yellow ,
		"Y": ansi.brightYellow
	} ,
	shiftedMarkup: {
		background: {
			":": ansi.reset ,
			" ": ansi.reset + " " ,

			"b": ansi.bgBlue ,
			"B": ansi.bgBrightBlue ,
			"c": ansi.bgCyan ,
			"C": ansi.bgBrightCyan ,
			"g": ansi.bgGreen ,
			"G": ansi.bgBrightGreen ,
			"k": ansi.bgBlack ,
			"K": ansi.bgBrightBlack ,
			"m": ansi.bgMagenta ,
			"M": ansi.bgBrightMagenta ,
			"r": ansi.bgRed ,
			"R": ansi.bgBrightRed ,
			"w": ansi.bgWhite ,
			"W": ansi.bgBrightWhite ,
			"y": ansi.bgYellow ,
			"Y": ansi.bgBrightYellow
		}
	} ,
	dataMarkup: {
		fg: ( markupStack , key , value ) => {
			var str = ansi.fgColor[ value ] || ansi.trueColor( value ) ;
			markupStack.push( str ) ;
			return str ;
		} ,
		bg: ( markupStack , key , value ) => {
			var str = ansi.bgColor[ value ] || ansi.bgTrueColor( value ) ;
			markupStack.push( str ) ;
			return str ;
		}
	} ,
	markupCatchAll: ( markupStack , key , value ) => {
		var str = '' ;

		if ( value === undefined ) {
			if ( key[ 0 ] === '#' ) {
				str = ansi.trueColor( key ) ;
			}
			else if ( typeof ansi[ key ] === 'string' ) {
				str = ansi[ key ] ;
			}
		}

		markupStack.push( str ) ;
		return str ;
	}
} ;

// Aliases
DEFAULT_FORMATTER.dataMarkup.color = DEFAULT_FORMATTER.dataMarkup.c = DEFAULT_FORMATTER.dataMarkup.fgColor = DEFAULT_FORMATTER.dataMarkup.fg ;
DEFAULT_FORMATTER.dataMarkup.bgColor = DEFAULT_FORMATTER.dataMarkup.bg ;



exports.createFormatter = ( options ) => exports.formatMethod.bind( Object.assign( {} , DEFAULT_FORMATTER , options ) ) ;
exports.format = exports.formatMethod.bind( DEFAULT_FORMATTER ) ;
exports.format.default = DEFAULT_FORMATTER ;

exports.formatNoMarkup = exports.formatMethod.bind( Object.assign( {} , DEFAULT_FORMATTER , { noMarkup: true } ) ) ;
// For passing string to Terminal-Kit, it will interpret markup on its own
exports.formatThirdPartyMarkup = exports.formatMethod.bind( Object.assign( {} , DEFAULT_FORMATTER , { noMarkup: true , escapeMarkup: true } ) ) ;

exports.createMarkup = ( options ) => exports.markupMethod.bind( Object.assign( {} , DEFAULT_FORMATTER , options ) ) ;
exports.markup = exports.markupMethod.bind( DEFAULT_FORMATTER ) ;



// Count the number of parameters needed for this string
exports.format.count = function( str , noMarkup = false ) {
	var markup , index , relative , autoIndex = 1 , maxIndex = 0 ;

	if ( typeof str !== 'string' ) { return 0 ; }

	// This regex differs slightly from the main regex: we do not count '%%' and %F is excluded
	// Note: the closing bracket is optional to prevent ReDoS
	var regexp = noMarkup ?
		/%([+-]?)([0-9]*)(?:\[[^\]]*\])?[a-zA-EG-Z]/g :
		/%([+-]?)([0-9]*)(?:\[[^\]]*\])?[a-zA-EG-Z]|(\^\[[^\]]*]?|\^.)/g ;

	for ( [ , relative , index , markup ] of str.matchAll( regexp ) ) {
		if ( markup ) { continue ; }

		if ( index ) {
			index = parseInt( index , 10 ) ;

			if ( relative ) {
				if ( relative === '+' ) { index = autoIndex + index ; }
				else if ( relative === '-' ) { index = autoIndex - index ; }
			}
		}
		else {
			index = autoIndex ;
		}

		autoIndex ++ ;

		if ( maxIndex < index ) { maxIndex = index ; }
	}

	return maxIndex ;
} ;



// Tell if this string contains formatter chars
exports.format.hasFormatting = function( str ) {
	if ( str.search( /\^(.?)|(%%)|%([+-]?)([0-9]*)(?:\[([^\]]*)\])?([a-zA-Z])/ ) !== -1 ) { return true ; }
	return false ;
} ;



// --- Format MODES ---

const modes = {} ;
exports.format.modes = modes ;	// <-- expose modes, used by Babel-Tower for String Kit interop'



// string
modes.s = arg => {
	if ( typeof arg === 'string' ) { return arg ; }
	if ( arg === null || arg === undefined || arg === true || arg === false ) { return '(' + arg + ')' ; }
	if ( typeof arg === 'number' ) { return '' + arg ; }
	if ( typeof arg.toString === 'function' ) { return arg.toString() ; }
	return '(' + arg + ')' ;
} ;

modes.r = arg => modes.s( arg ) ;
modes.r.noSanitize = true ;



// string, interpret ^ formatting
modes.S = ( arg , modeArg , options ) => {
	// We do the sanitizing part on our own
	var interpret = options.escapeMarkup ? str => ( options.argumentSanitizer ? options.argumentSanitizer( str ) : str ) :
		str => exports.markupMethod.call( options , options.argumentSanitizer ? options.argumentSanitizer( str ) : str ) ;

	if ( typeof arg === 'string' ) { return interpret( arg ) ; }
	if ( arg === null || arg === undefined || arg === true || arg === false ) { return '(' + arg + ')' ; }
	if ( typeof arg === 'number' ) { return '' + arg ; }
	if ( typeof arg.toString === 'function' ) { return interpret( arg.toString() ) ; }
	return interpret( '(' + arg + ')' ) ;
} ;

modes.S.noSanitize = true ;
modes.S.noEscapeMarkup = true ;
modes.S.noCommonModeArg = true ;



// natural (WIP)
modes.N = ( arg , isSubCall ) => {
	if ( typeof arg === 'string' ) { return arg ; }

	if ( arg === null || arg === undefined || arg === true || arg === false ) {
		return '' + arg ;
	}

	if ( typeof arg === 'number' ) {
		return modes.f( arg , '.3g ' ) ;
	}

	if ( Array.isArray( arg ) ) {
		arg = arg.map( e => modes.N( e , true ) ) ;

		if ( isSubCall ) {
			return '[' + arg.join( ',' ) + ']' ;
		}

		return arg.join( ', ' ) ;
	}

	if ( Buffer.isBuffer( arg ) ) {
		arg = [ ... arg ].map( e => {
			e = e.toString( 16 ) ;
			if ( e.length === 1 ) { e = '0' + e ; }
			return e ;
		} ) ;
		return '<' + arg.join( ' ' ) + '>' ;
	}

	var proto = Object.getPrototypeOf( arg ) ;

	if ( proto === null || proto === Object.prototype ) {
		// Plain objects
		arg = Object.entries( arg ).sort( naturalSort )
			.map( e => e[ 0 ] + ': ' + modes.N( e[ 1 ] , true ) ) ;

		if ( isSubCall ) {
			return '{' + arg.join( ', ' ) + '}' ;
		}

		return arg.join( ', ' ) ;
	}

	if ( typeof arg.inspect === 'function' ) { return arg.inspect() ; }
	if ( typeof arg.toString === 'function' ) { return arg.toString() ; }

	return '(' + arg + ')' ;
} ;

modes.n = arg => modes.N( arg , true ) ;



// float
modes.f = ( arg , modeArg ) => {
	if ( typeof arg === 'string' ) { arg = parseFloat( arg ) ; }
	if ( typeof arg !== 'number' ) { arg = 0 ; }

	var subModes = floatModeArg( modeArg ) ,
		sn = new StringNumber( arg , '.' , subModes.groupSeparator ) ;

	if ( subModes.rounding !== null ) { sn.round( subModes.rounding ) ; }
	if ( subModes.precision ) { sn.precision( subModes.precision ) ; }

	return sn.toString( subModes.leftPadding , subModes.rightPadding , subModes.rightPaddingOnlyIfDecimal ) ;
} ;

modes.f.noSanitize = true ;



// absolute percent
modes.P = ( arg , modeArg ) => {
	if ( typeof arg === 'string' ) { arg = parseFloat( arg ) ; }
	if ( typeof arg !== 'number' ) { arg = 0 ; }

	arg *= 100 ;

	var subModes = floatModeArg( modeArg ) ,
		sn = new StringNumber( arg , '.' , subModes.groupSeparator ) ;

	// Force rounding to zero by default
	if ( subModes.rounding !== null || ! subModes.precision ) { sn.round( subModes.rounding || 0 ) ; }
	if ( subModes.precision ) { sn.precision( subModes.precision ) ; }

	return sn.toNoExpString( subModes.leftPadding , subModes.rightPadding , subModes.rightPaddingOnlyIfDecimal ) + '%' ;
} ;

modes.P.noSanitize = true ;



// relative percent
modes.p = ( arg , modeArg ) => {
	if ( typeof arg === 'string' ) { arg = parseFloat( arg ) ; }
	if ( typeof arg !== 'number' ) { arg = 0 ; }

	arg = ( arg - 1 ) * 100 ;

	var subModes = floatModeArg( modeArg ) ,
		sn = new StringNumber( arg , '.' , subModes.groupSeparator ) ;

	// Force rounding to zero by default
	if ( subModes.rounding !== null || ! subModes.precision ) { sn.round( subModes.rounding || 0 ) ; }
	if ( subModes.precision ) { sn.precision( subModes.precision ) ; }

	// 4th argument force a '+' sign
	return sn.toNoExpString( subModes.leftPadding , subModes.rightPadding , subModes.rightPaddingOnlyIfDecimal , true ) + '%' ;
} ;

modes.p.noSanitize = true ;



// metric system
modes.k = ( arg , modeArg ) => {
	if ( typeof arg === 'string' ) { arg = parseFloat( arg ) ; }
	if ( typeof arg !== 'number' ) { return '0' ; }

	var subModes = floatModeArg( modeArg ) ,
		sn = new StringNumber( arg , '.' , subModes.groupSeparator ) ;

	if ( subModes.rounding !== null ) { sn.round( subModes.rounding ) ; }
	// Default to 3 numbers precision
	if ( subModes.precision || subModes.rounding === null ) { sn.precision( subModes.precision || 3 ) ; }

	return sn.toMetricString( subModes.leftPadding , subModes.rightPadding , subModes.rightPaddingOnlyIfDecimal ) ;
} ;

modes.k.noSanitize = true ;



// exponential notation, a.k.a. "E notation" (e.g. 1.23e+2)
modes.e = ( arg , modeArg ) => {
	if ( typeof arg === 'string' ) { arg = parseFloat( arg ) ; }
	if ( typeof arg !== 'number' ) { arg = 0 ; }

	var subModes = floatModeArg( modeArg ) ,
		sn = new StringNumber( arg , '.' , subModes.groupSeparator ) ;

	if ( subModes.rounding !== null ) { sn.round( subModes.rounding ) ; }
	if ( subModes.precision ) { sn.precision( subModes.precision ) ; }

	return sn.toExponential() ;
} ;

modes.e.noSanitize = true ;



// scientific notation (e.g. 1.23 × 10²)
modes.K = ( arg , modeArg ) => {
	if ( typeof arg === 'string' ) { arg = parseFloat( arg ) ; }
	if ( typeof arg !== 'number' ) { arg = 0 ; }

	var subModes = floatModeArg( modeArg ) ,
		sn = new StringNumber( arg , '.' , subModes.groupSeparator ) ;

	if ( subModes.rounding !== null ) { sn.round( subModes.rounding ) ; }
	if ( subModes.precision ) { sn.precision( subModes.precision ) ; }

	return sn.toScientific() ;
} ;

modes.K.noSanitize = true ;



// integer
modes.d = modes.i = arg => {
	if ( typeof arg === 'string' ) { arg = parseFloat( arg ) ; }
	if ( typeof arg === 'number' ) { return '' + Math.floor( arg ) ; }
	return '0' ;
} ;

modes.i.noSanitize = true ;



// unsigned integer
modes.u = arg => {
	if ( typeof arg === 'string' ) { arg = parseFloat( arg ) ; }
	if ( typeof arg === 'number' ) { return '' + Math.max( Math.floor( arg ) , 0 ) ; }
	return '0' ;
} ;

modes.u.noSanitize = true ;



// unsigned positive integer
modes.U = arg => {
	if ( typeof arg === 'string' ) { arg = parseFloat( arg ) ; }
	if ( typeof arg === 'number' ) { return '' + Math.max( Math.floor( arg ) , 1 ) ; }
	return '1' ;
} ;

modes.U.noSanitize = true ;



// /!\ Should use StringNumber???
// Degree, minutes and seconds.
// Unlike %t which receive ms, here the input is in degree.
modes.m = arg => {
	if ( typeof arg === 'string' ) { arg = parseFloat( arg ) ; }
	if ( typeof arg !== 'number' ) { return '(NaN)' ; }

	var minus = '' ;
	if ( arg < 0 ) { minus = '-' ; arg = -arg ; }

	var degrees = epsilonFloor( arg ) ,
		frac = arg - degrees ;

	if ( ! frac ) { return minus + degrees + '°' ; }

	var minutes = epsilonFloor( frac * 60 ) ,
		seconds = epsilonFloor( frac * 3600 - minutes * 60 ) ;

	if ( seconds ) {
		return minus + degrees + '°' + ( '' + minutes ).padStart( 2 , '0' ) + '′' + ( '' + seconds ).padStart( 2 , '0' ) + '″' ;
	}

	return minus + degrees + '°' + ( '' + minutes ).padStart( 2 , '0' ) + '′' ;

} ;

modes.m.noSanitize = true ;



// time duration, transform ms into H:min:s
// Later it should format Date as well: number=duration, date object=date
// Note that it would not replace moment.js, but it could uses it.
modes.t = ( arg , modeArg ) => {
	if ( typeof arg === 'string' ) { arg = parseFloat( arg ) ; }
	if ( typeof arg !== 'number' ) { return '(NaN)' ; }

	var h , min , s , sn , sStr ,
		sign = '' ,
		subModes = timeModeArg( modeArg ) ,
		roundingType = subModes.roundingType ,
		hSeparator = subModes.useAbbreviation ? 'h' : ':' ,
		minSeparator = subModes.useAbbreviation ? 'min' : ':' ,
		sSeparator = subModes.useAbbreviation ? 's' : '.' ,
		forceDecimalSeparator = subModes.useAbbreviation ;

	s = arg / 1000 ;

	if ( s < 0 ) {
		s = -s ;
		roundingType *= -1 ;
		sign = '-' ;
	}

	if ( s < 60 && ! subModes.forceMinutes ) {
		sn = new StringNumber( s , sSeparator , undefined , forceDecimalSeparator ) ;
		sn.round( subModes.rounding , roundingType ) ;

		// Check if rounding has made it reach 60
		if ( sn.toNumber() < 60 ) {
			sStr = sn.toString( 1 , subModes.rightPadding , subModes.rightPaddingOnlyIfDecimal ) ;
			return sign + sStr ;
		}

		s = 60 ;

	}

	min = Math.floor( s / 60 ) ;
	s = s % 60 ;

	sn = new StringNumber( s , sSeparator , undefined , forceDecimalSeparator ) ;
	sn.round( subModes.rounding , roundingType ) ;

	// Check if rounding has made it reach 60
	if ( sn.toNumber() < 60 ) {
		sStr = sn.toString( 2 , subModes.rightPadding , subModes.rightPaddingOnlyIfDecimal ) ;
	}
	else {
		min ++ ;
		s = 0 ;
		sn.set( s ) ;
		sStr = sn.toString( 2 , subModes.rightPadding , subModes.rightPaddingOnlyIfDecimal ) ;
	}

	if ( min < 60 && ! subModes.forceHours ) {
		return sign + min + minSeparator + sStr ;
	}

	h = Math.floor( min / 60 ) ;
	min = min % 60 ;

	return sign + h + hSeparator + ( '' + min ).padStart( 2 , '0' ) + minSeparator + sStr ;
} ;

modes.t.noSanitize = true ;



// unsigned hexadecimal
modes.h = arg => {
	if ( typeof arg === 'string' ) { arg = parseFloat( arg ) ; }
	if ( typeof arg === 'number' ) { return '' + Math.max( Math.floor( arg ) , 0 ).toString( 16 ) ; }
	return '0' ;
} ;

modes.h.noSanitize = true ;



// unsigned hexadecimal, force pair of symboles
modes.x = arg => {
	if ( typeof arg === 'string' ) { arg = parseFloat( arg ) ; }
	if ( typeof arg !== 'number' ) { return '00' ; }

	var value = '' + Math.max( Math.floor( arg ) , 0 ).toString( 16 ) ;

	if ( value.length % 2 ) { value = '0' + value ; }
	return value ;
} ;

modes.x.noSanitize = true ;



// unsigned octal
modes.o = arg => {
	if ( typeof arg === 'string' ) { arg = parseFloat( arg ) ; }
	if ( typeof arg === 'number' ) { return '' + Math.max( Math.floor( arg ) , 0 ).toString( 8 ) ; }
	return '0' ;
} ;

modes.o.noSanitize = true ;



// unsigned binary
modes.b = arg => {
	if ( typeof arg === 'string' ) { arg = parseFloat( arg ) ; }
	if ( typeof arg === 'number' ) { return '' + Math.max( Math.floor( arg ) , 0 ).toString( 2 ) ; }
	return '0' ;
} ;

modes.b.noSanitize = true ;



// String to hexadecimal, force pair of symboles
modes.X = arg => {
	if ( typeof arg === 'string' ) { arg = Buffer.from( arg ) ; }
	else if ( ! Buffer.isBuffer( arg ) ) { return '' ; }
	return arg.toString( 'hex' ) ;
} ;

modes.X.noSanitize = true ;



// base64
modes.z = arg => {
	if ( typeof arg === 'string' ) { arg = Buffer.from( arg ) ; }
	else if ( ! Buffer.isBuffer( arg ) ) { return '' ; }
	return arg.toString( 'base64' ) ;
} ;



// base64url
modes.Z = arg => {
	if ( typeof arg === 'string' ) { arg = Buffer.from( arg ) ; }
	else if ( ! Buffer.isBuffer( arg ) ) { return '' ; }
	return arg.toString( 'base64' ).replace( /\+/g , '-' )
		.replace( /\//g , '_' )
		.replace( /[=]{1,2}$/g , '' ) ;
} ;



// Inspect
const I_OPTIONS = {} ;
modes.I = ( arg , modeArg , options ) => genericInspectMode( arg , modeArg , options , I_OPTIONS ) ;
modes.I.noSanitize = true ;



// More minimalist inspect
const Y_OPTIONS = {
	noFunc: true ,
	enumOnly: true ,
	noDescriptor: true ,
	useInspect: true ,
	useInspectPropertyBlackList: true
} ;
modes.Y = ( arg , modeArg , options ) => genericInspectMode( arg , modeArg , options , Y_OPTIONS ) ;
modes.Y.noSanitize = true ;



// Even more minimalist inspect
const O_OPTIONS = { minimal: true , bulletIndex: true , noMarkup: true } ;
modes.O = ( arg , modeArg , options ) => genericInspectMode( arg , modeArg , options , O_OPTIONS ) ;
modes.O.noSanitize = true ;



// Inspect error
const E_OPTIONS = {} ;
modes.E = ( arg , modeArg , options ) => genericInspectMode( arg , modeArg , options , E_OPTIONS , true ) ;
modes.E.noSanitize = true ;



// JSON
modes.J = arg => arg === undefined ? 'null' : JSON.stringify( arg ) ;



// drop
modes.D = () => '' ;
modes.D.noSanitize = true ;



// ModeArg formats

// The format for commonModeArg
const COMMON_MODE_ARG_FORMAT_REGEX = /([a-zA-Z])(.[^a-zA-Z]*)/g ;

// The format for specific mode arg
const MODE_ARG_FORMAT_REGEX = /([a-zA-Z]|^)([^a-zA-Z]*)/g ;



// Called when there is a modeArg and the mode allow common mode arg
// CONVENTION: reserve upper-cased letters for common mode arg
function commonModeArg( str , modeArg ) {
	for ( let [ , k , v ] of modeArg.matchAll( COMMON_MODE_ARG_FORMAT_REGEX ) ) {
		if ( k === 'L' ) {
			let width = unicode.width( str ) ;
			v = + v || 1 ;

			if ( width > v ) {
				str = unicode.truncateWidth( str , v - 1 ).trim() + '…' ;
				width = unicode.width( str ) ;
			}

			if ( width < v ) { str = ' '.repeat( v - width ) + str ; }
		}
		else if ( k === 'R' ) {
			let width = unicode.width( str ) ;
			v = + v || 1 ;

			if ( width > v ) {
				str = unicode.truncateWidth( str , v - 1 ).trim() + '…' ;
				width = unicode.width( str ) ;
			}

			if ( width < v ) { str = str + ' '.repeat( v - width ) ; }
		}
	}

	return str ;
}



const FLOAT_MODES = {
	leftPadding: 1 ,
	rightPadding: 0 ,
	rightPaddingOnlyIfDecimal: false ,
	rounding: null ,
	precision: null ,
	groupSeparator: ''
} ;

// Generic number modes
function floatModeArg( modeArg ) {
	FLOAT_MODES.leftPadding = 1 ;
	FLOAT_MODES.rightPadding = 0 ;
	FLOAT_MODES.rightPaddingOnlyIfDecimal = false ;
	FLOAT_MODES.rounding = null ;
	FLOAT_MODES.precision = null ;
	FLOAT_MODES.groupSeparator = '' ;

	if ( modeArg ) {
		for ( let [ , k , v ] of modeArg.matchAll( MODE_ARG_FORMAT_REGEX ) ) {
			if ( k === 'z' ) {
				// Zero-left padding
				FLOAT_MODES.leftPadding = + v ;
			}
			else if ( k === 'g' ) {
				// Group separator
				FLOAT_MODES.groupSeparator = v || ' ' ;
			}
			else if ( ! k ) {
				if ( v[ 0 ] === '.' ) {
					// Rounding after the decimal
					let lv = v[ v.length - 1 ] ;

					// Zero-right padding?
					if ( lv === '!' ) {
						FLOAT_MODES.rounding = FLOAT_MODES.rightPadding = parseInt( v.slice( 1 , -1 ) , 10 ) || 0 ;
					}
					else if ( lv === '?' ) {
						FLOAT_MODES.rounding = FLOAT_MODES.rightPadding = parseInt( v.slice( 1 , -1 ) , 10 ) || 0 ;
						FLOAT_MODES.rightPaddingOnlyIfDecimal = true ;
					}
					else {
						FLOAT_MODES.rounding = parseInt( v.slice( 1 ) , 10 ) || 0 ;
					}
				}
				else if ( v[ v.length - 1 ] === '.' ) {
					// Rounding before the decimal
					FLOAT_MODES.rounding = -parseInt( v.slice( 0 , -1 ) , 10 ) || 0 ;
				}
				else {
					// Precision, but only if integer
					FLOAT_MODES.precision = parseInt( v , 10 ) || null ;
				}
			}
		}
	}

	return FLOAT_MODES ;
}



const TIME_MODES = {
	useAbbreviation: false ,
	rightPadding: 0 ,
	rightPaddingOnlyIfDecimal: false ,
	rounding: 0 ,
	roundingType: -1 ,	// -1: floor, 0: round, 1: ceil
	forceHours: false ,
	forceMinutes: false
} ;

// Generic number modes
function timeModeArg( modeArg ) {
	TIME_MODES.rightPadding = 0 ;
	TIME_MODES.rightPaddingOnlyIfDecimal = false ;
	TIME_MODES.rounding = 0 ;
	TIME_MODES.roundingType = -1 ;
	TIME_MODES.useAbbreviation = TIME_MODES.forceHours = TIME_MODES.forceMinutes = false ;

	if ( modeArg ) {
		for ( let [ , k , v ] of modeArg.matchAll( MODE_ARG_FORMAT_REGEX ) ) {
			if ( k === 'h' ) {
				TIME_MODES.forceHours = TIME_MODES.forceMinutes = true ;
			}
			else if ( k === 'm' ) {
				TIME_MODES.forceMinutes = true ;
			}
			else if ( k === 'r' ) {
				TIME_MODES.roundingType = 0 ;
			}
			else if ( k === 'f' ) {
				TIME_MODES.roundingType = -1 ;
			}
			else if ( k === 'c' ) {
				TIME_MODES.roundingType = 1 ;
			}
			else if ( k === 'a' ) {
				TIME_MODES.useAbbreviation = true ;
			}
			else if ( ! k ) {
				if ( v[ 0 ] === '.' ) {
					// Rounding after the decimal
					let lv = v[ v.length - 1 ] ;

					// Zero-right padding?
					if ( lv === '!' ) {
						TIME_MODES.rounding = TIME_MODES.rightPadding = parseInt( v.slice( 1 , -1 ) , 10 ) || 0 ;
					}
					else if ( lv === '?' ) {
						TIME_MODES.rounding = TIME_MODES.rightPadding = parseInt( v.slice( 1 , -1 ) , 10 ) || 0 ;
						TIME_MODES.rightPaddingOnlyIfDecimal = true ;
					}
					else {
						TIME_MODES.rounding = parseInt( v.slice( 1 ) , 10 ) || 0 ;
					}
				}
			}
		}
	}

	return TIME_MODES ;
}



// Generic inspect
function genericInspectMode( arg , modeArg , options , modeOptions , isInspectError = false ) {
	var outputMaxLength ,
		maxLength ,
		depth = 3 ,
		style = options && options.color ? 'color' : 'none' ;

	if ( modeArg ) {
		for ( let [ , k , v ] of modeArg.matchAll( MODE_ARG_FORMAT_REGEX ) ) {
			if ( k === 'c' ) {
				if ( v === '+' ) { style = 'color' ; }
				else if ( v === '-' ) { style = 'none' ; }
			}
			else if ( k === 'i' ) {
				style = 'inline' ;
			}
			else if ( k === 'l' ) {
				// total output max length
				outputMaxLength = parseInt( v , 10 ) || undefined ;
			}
			else if ( k === 's' ) {
				// string max length
				maxLength = parseInt( v , 10 ) || undefined ;
			}
			else if ( ! k ) {
				depth = parseInt( v , 10 ) || 1 ;
			}
		}
	}

	if ( isInspectError ) {
		return inspectError( Object.assign( {
			depth , style , outputMaxLength , maxLength
		} , modeOptions ) , arg ) ;
	}

	return inspect( Object.assign( {
		depth , style , outputMaxLength , maxLength
	} , modeOptions ) , arg ) ;
}



// From math-kit module
// /!\ Should be updated with the new way the math-kit module do it!!! /!\
const EPSILON = 0.0000000001 ;
const INVERSE_EPSILON = Math.round( 1 / EPSILON ) ;

function epsilonRound( v ) {
	return Math.round( v * INVERSE_EPSILON ) / INVERSE_EPSILON ;
}

function epsilonFloor( v ) {
	return Math.floor( v + EPSILON ) ;
}

// Round with precision
function round( v , step ) {
	// use: v * ( 1 / step )
	// not: v / step
	// reason: epsilon rounding errors
	return epsilonRound( step * Math.round( v * ( 1 / step ) ) ) ;
}


}).call(this)}).call(this,require("buffer").Buffer)
},{"./StringNumber.js":26,"./ansi.js":27,"./escape.js":29,"./inspect.js":32,"./naturalSort.js":36,"./unicode.js":41,"buffer":46}],31:[function(require,module,exports){
/*
	String Kit

	Copyright (c) 2014 - 2021 Cédric Ronvel

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


const fuzzy = {} ;
module.exports = fuzzy ;



fuzzy.score = ( input , pattern ) => {
	if ( input === pattern ) { return 1 ; }
	if ( input.length === 0 || pattern.length === 0 ) { return 0 ; }
	//return 1 - fuzzy.levenshtein( input , pattern ) / ( pattern.length >= input.length ? pattern.length : input.length ) ;
	return Math.max( 0 , 1 - fuzzy.levenshtein( input , pattern ) / pattern.length ) ;
} ;



const DEFAULT_SCORE_LIMIT = 0 ;
const DEFAULT_TOKEN_DISPARITY_PENALTY = 0.88 ;
// deltaRate should be just above tokenDisparityPenalty
const DEFAULT_DELTA_RATE = 0.9 ;



fuzzy.bestMatch = ( input , patterns , options = {} ) => {
	var bestScore = options.scoreLimit || DEFAULT_SCORE_LIMIT ,
		i , iMax , currentScore , currentPattern ,
		bestIndex = -1 ,
		bestPattern = null ;

	for ( i = 0 , iMax = patterns.length ; i < iMax ; i ++ ) {
		currentPattern = patterns[ i ] ;
		currentScore = fuzzy.score( input , currentPattern ) ;
		if ( currentScore === 1 ) { return options.indexOf ? i : currentPattern ; }
		if ( currentScore > bestScore ) {
			bestScore = currentScore ;
			bestPattern = currentPattern ;
			bestIndex = i ;
		}
	}

	return options.indexOf ? bestIndex : bestPattern ;
} ;



fuzzy.topMatch = ( input , patterns , options = {} ) => {
	var scoreLimit = options.scoreLimit || DEFAULT_SCORE_LIMIT ,
		deltaRate = options.deltaRate || DEFAULT_DELTA_RATE ,
		i , iMax , patternScores ;

	patternScores = patterns.map( ( pattern , index ) => ( { pattern , index , score: fuzzy.score( input , pattern ) } ) ) ;
	patternScores.sort( ( a , b ) => b.score - a.score ) ;

	//console.log( patternScores ) ;

	if ( patternScores[ 0 ].score <= scoreLimit ) { return [] ; }
	scoreLimit = Math.max( scoreLimit , patternScores[ 0 ].score * deltaRate ) ;

	for ( i = 1 , iMax = patternScores.length ; i < iMax ; i ++ ) {
		if ( patternScores[ i ].score < scoreLimit ) {
			patternScores.length = i ;
			break ;
		}
	}

	return options.indexOf ?
		patternScores.map( e => e.index ) :
		patternScores.map( e => e.pattern ) ;
} ;



const englishBlackList = new Set( [
	'a' , 'an' , 'the' , 'this' , 'that' , 'those' , 'some' ,
	'of' , 'in' , 'on' , 'at' ,
	'my' , 'your' , 'her' , 'his' , 'its' , 'our' , 'their'
] ) ;

function tokenize( str , blackList = englishBlackList ) {
	return str.split( /[ '"/|,:_-]+/g ).filter( s => s && ! blackList.has( s ) ) ;
}



// This is almost the same code than .topTokenMatch(): both must be in sync
fuzzy.bestTokenMatch = ( input , patterns , options = {} ) => {
	var scoreLimit = options.scoreLimit || DEFAULT_SCORE_LIMIT ,
		tokenDisparityPenalty = options.tokenDisparityPenalty || DEFAULT_TOKEN_DISPARITY_PENALTY ,
		i , iMax , j , jMax , z , zMax ,
		currentPattern , currentPatternTokens , currentPatternToken , currentPatternScore ,
		bestPatternScore = scoreLimit ,
		//currentPatternScores = [] ,
		currentInputToken , currentScore ,
		inputTokens = tokenize( input ) ,
		bestScore ,
		bestIndex = -1 ,
		bestPattern = null ;

	//console.log( inputTokens ) ;
	if ( ! inputTokens.length || ! patterns.length ) { return options.indexOf ? bestIndex : bestPattern ; }

	for ( i = 0 , iMax = patterns.length ; i < iMax ; i ++ ) {
		currentPattern = patterns[ i ] ;
		currentPatternTokens = tokenize( currentPattern ) ;
		//currentPatternScores.length = 0 ;
		currentPatternScore = 0 ;

		for ( j = 0 , jMax = inputTokens.length ; j < jMax ; j ++ ) {
			currentInputToken = inputTokens[ j ] ;
			bestScore = 0 ;

			for ( z = 0 , zMax = currentPatternTokens.length ; z < zMax ; z ++ ) {
				currentPatternToken = currentPatternTokens[ z ] ;
				currentScore = fuzzy.score( currentInputToken , currentPatternToken ) ;

				if ( currentScore > bestScore ) {
					bestScore = currentScore ;
					if ( currentScore === 1 ) { break ; }
				}
			}

			//currentPatternScores[ j ] = bestScore ;
			currentPatternScore += bestScore ;
		}

		//currentPatternScore = Math.hypot( ... currentPatternScores ) ;
		currentPatternScore /= inputTokens.length ;

		// Apply a small penalty if there isn't enough tokens
		if ( inputTokens.length !== currentPatternTokens.length ) {
			currentPatternScore *= tokenDisparityPenalty ** Math.abs( currentPatternTokens.length - inputTokens.length ) ;
		}

		//console.log( currentPattern + ': ' + currentPatternScore ) ;
		if ( currentPatternScore > bestPatternScore ) {
			bestPatternScore = currentPatternScore ;
			bestPattern = currentPattern ;
			bestIndex = i ;
		}
	}

	return options.indexOf ? bestIndex : bestPattern ;
} ;



// This is almost the same code than .bestTokenMatch(): both must be in sync
// deltaRate should be just above tokenDisparityPenalty
fuzzy.topTokenMatch = ( input , patterns , options = {} ) => {
	var scoreLimit = options.scoreLimit || DEFAULT_SCORE_LIMIT ,
		tokenDisparityPenalty = options.tokenDisparityPenalty || DEFAULT_TOKEN_DISPARITY_PENALTY ,
		deltaRate = options.deltaRate || DEFAULT_DELTA_RATE ,
		i , iMax , j , jMax , z , zMax ,
		currentPattern , currentPatternTokens , currentPatternToken , currentPatternScore ,
		currentInputToken , currentScore ,
		inputTokens = tokenize( input ) ,
		bestScore ,
		patternScores = [] ;

	//console.log( inputTokens ) ;
	if ( ! inputTokens.length || ! patterns.length ) { return [] ; }

	for ( i = 0 , iMax = patterns.length ; i < iMax ; i ++ ) {
		currentPattern = patterns[ i ] ;
		currentPatternTokens = tokenize( currentPattern ) ;
		//currentPatternScores.length = 0 ;
		currentPatternScore = 0 ;

		for ( j = 0 , jMax = inputTokens.length ; j < jMax ; j ++ ) {
			currentInputToken = inputTokens[ j ] ;
			bestScore = 0 ;

			for ( z = 0 , zMax = currentPatternTokens.length ; z < zMax ; z ++ ) {
				currentPatternToken = currentPatternTokens[ z ] ;
				currentScore = fuzzy.score( currentInputToken , currentPatternToken ) ;

				if ( currentScore > bestScore ) {
					bestScore = currentScore ;
					if ( currentScore === 1 ) { break ; }
				}
			}

			//currentPatternScores[ j ] = bestScore ;
			currentPatternScore += bestScore ;
		}

		//currentPatternScore = Math.hypot( ... currentPatternScores ) ;
		currentPatternScore /= inputTokens.length ;

		// Apply a small penalty if there isn't enough tokens
		if ( inputTokens.length !== currentPatternTokens.length ) {
			currentPatternScore *= tokenDisparityPenalty ** Math.abs( currentPatternTokens.length - inputTokens.length ) ;
		}

		patternScores.push( { pattern: currentPattern , index: i , score: currentPatternScore } ) ;
	}

	patternScores.sort( ( a , b ) => b.score - a.score ) ;
	//console.log( "Before truncating:" , patternScores ) ;

	if ( patternScores[ 0 ].score <= scoreLimit ) { return [] ; }
	scoreLimit = Math.max( scoreLimit , patternScores[ 0 ].score * deltaRate ) ;

	for ( i = 1 , iMax = patternScores.length ; i < iMax ; i ++ ) {
		if ( patternScores[ i ].score < scoreLimit ) {
			patternScores.length = i ;
			break ;
		}
	}

	//console.log( "After truncating:" , patternScores ) ;

	return options.indexOf ?
		patternScores.map( e => e.index ) :
		patternScores.map( e => e.pattern ) ;
} ;



// The .levenshtein() function is derivated from https://github.com/sindresorhus/leven by Sindre Sorhus (MIT License)
const _tracker = [] ;
const _leftCharCodeCache = [] ;

fuzzy.levenshtein = ( left , right ) => {
	if ( left === right ) { return 0 ; }

	// Swapping the strings if `a` is longer than `b` so we know which one is the
	// shortest & which one is the longest
	if ( left.length > right.length ) {
		let swap = left ;
		left = right ;
		right = swap ;
	}

	let leftLength = left.length ;
	let rightLength = right.length ;

	// Performing suffix trimming:
	// We can linearly drop suffix common to both strings since they
	// don't increase distance at all
	while ( leftLength > 0 && ( left.charCodeAt( leftLength - 1 ) === right.charCodeAt( rightLength - 1 ) ) ) {
		leftLength -- ;
		rightLength -- ;
	}

	// Performing prefix trimming
	// We can linearly drop prefix common to both strings since they
	// don't increase distance at all
	let start = 0 ;

	while ( start < leftLength && ( left.charCodeAt( start ) === right.charCodeAt( start ) ) ) {
		start ++ ;
	}

	leftLength -= start ;
	rightLength -= start ;

	if ( leftLength === 0 ) { return rightLength ; }

	let rightCharCode ;
	let result ;
	let temp ;
	let temp2 ;
	let i = 0 ;
	let j = 0 ;

	while ( i < leftLength ) {
		_leftCharCodeCache[ i ] = left.charCodeAt( start + i ) ;
		_tracker[ i ] = ++ i ;
	}

	while ( j < rightLength ) {
		rightCharCode = right.charCodeAt( start + j ) ;
		temp = j ++ ;
		result = j ;

		for ( i = 0 ; i < leftLength ; i ++ ) {
			temp2 = rightCharCode === _leftCharCodeCache[ i ] ? temp : temp + 1 ;
			temp = _tracker[ i ] ;
			// eslint-disable-next-line no-nested-ternary
			result = _tracker[ i ] = temp > result   ?   temp2 > result ? result + 1 : temp2   :   temp2 > temp ? temp + 1 : temp2 ;
		}
	}

	return result ;
} ;


},{}],32:[function(require,module,exports){
(function (Buffer,process){(function (){
/*
	String Kit

	Copyright (c) 2014 - 2021 Cédric Ronvel

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

/*
	Variable inspector.
*/

"use strict" ;



const escape = require( './escape.js' ) ;
const ansi = require( './ansi.js' ) ;

const EMPTY = {} ;
const TRIVIAL_CONSTRUCTOR = new Set( [ Object , Array ] ) ;



/*
	Inspect a variable, return a string ready to be displayed with console.log(), or even as an HTML output.

	Options:
		* style:
			* 'none': (default) normal output suitable for console.log() or writing in a file
			* 'inline': like 'none', but without newlines
			* 'color': colorful output suitable for terminal
			* 'html': html output
			* any object: full controle, inheriting from 'none'
		* tab: `string` override the tab of the style
		* depth: depth limit, default: 3
		* maxLength: length limit for strings, default: 250
		* outputMaxLength: length limit for the inspect output string, default: 5000
		* noFunc: do not display functions
		* noDescriptor: do not display descriptor information
		* noArrayProperty: do not display array properties
		* noIndex: do not display array indexes
		* bulletIndex: do not display array indexes, instead display a bullet: *
		* noType: do not display type and constructor
		* noTypeButConstructor: do not display type, display non-trivial constructor (not Object or Array, but all others)
		* enumOnly: only display enumerable properties
		* funcDetails: display function's details
		* proto: display object's prototype
		* sort: sort the keys
		* noMarkup: don't add Javascript/JSON markup: {}[],"
		* minimal: imply noFunc: true, noDescriptor: true, noType: true, noArrayProperty: true, enumOnly: true, proto: false and funcDetails: false.
		  Display a minimal JSON-like output
		* minimalPlusConstructor: like minimal, but output non-trivial constructor
		* protoBlackList: `Set` of blacklisted object prototype (will not recurse inside it)
		* propertyBlackList: `Set` of blacklisted property names (will not even display it)
		* useInspect: use .inspect() method when available on an object (default to false)
		* useInspectPropertyBlackList: if set and if the object to be inspected has an 'inspectPropertyBlackList' property which value is a `Set`,
		  use it like the 'propertyBlackList' option
*/

function inspect( options , variable ) {
	if ( arguments.length < 2 ) { variable = options ; options = {} ; }
	else if ( ! options || typeof options !== 'object' ) { options = {} ; }

	var runtime = { depth: 0 , ancestors: [] } ;

	if ( ! options.style ) { options.style = inspectStyle.none ; }
	else if ( typeof options.style === 'string' ) { options.style = inspectStyle[ options.style ] ; }
	// Too slow:
	//else { options.style = Object.assign( {} , inspectStyle.none , options.style ) ; }

	if ( options.depth === undefined ) { options.depth = 3 ; }
	if ( options.maxLength === undefined ) { options.maxLength = 250 ; }
	if ( options.outputMaxLength === undefined ) { options.outputMaxLength = 5000 ; }

	// /!\ nofunc is deprecated
	if ( options.nofunc ) { options.noFunc = true ; }

	if ( options.minimal ) {
		options.noFunc = true ;
		options.noDescriptor = true ;
		options.noType = true ;
		options.noArrayProperty = true ;
		options.enumOnly = true ;
		options.proto = false ;
		options.funcDetails = false ;
	}

	if ( options.minimalPlusConstructor ) {
		options.noFunc = true ;
		options.noDescriptor = true ;
		options.noTypeButConstructor = true ;
		options.noArrayProperty = true ;
		options.enumOnly = true ;
		options.proto = false ;
		options.funcDetails = false ;
	}

	var str = inspect_( runtime , options , variable ) ;

	if ( str.length > options.outputMaxLength ) {
		str = options.style.truncate( str , options.outputMaxLength ) ;
	}

	return str ;
}

exports.inspect = inspect ;



function inspect_( runtime , options , variable ) {
	var i , funcName , length , proto , propertyList , isTrivialConstructor , constructor , keyIsProperty ,
		type , pre , isArray , isFunc , specialObject ,
		str = '' , key = '' , descriptorStr = '' , indent = '' ,
		descriptor , nextAncestors ;

	// Prepare things (indentation, key, descriptor, ... )

	type = typeof variable ;

	if ( runtime.depth ) {
		indent = ( options.tab ?? options.style.tab ).repeat( options.noMarkup ? runtime.depth - 1 : runtime.depth ) ;
	}

	if ( type === 'function' && options.noFunc ) { return '' ; }

	if ( runtime.key !== undefined ) {
		if ( runtime.descriptor ) {
			descriptorStr = [] ;

			if ( runtime.descriptor.error ) {
				descriptorStr = '[' + runtime.descriptor.error + ']' ;
			}
			else {
				if ( ! runtime.descriptor.configurable ) { descriptorStr.push( '-conf' ) ; }
				if ( ! runtime.descriptor.enumerable ) { descriptorStr.push( '-enum' ) ; }

				// Already displayed by runtime.forceType
				//if ( runtime.descriptor.get || runtime.descriptor.set ) { descriptorStr.push( 'getter/setter' ) ; } else
				if ( ! runtime.descriptor.writable ) { descriptorStr.push( '-w' ) ; }

				//if ( descriptorStr.length ) { descriptorStr = '(' + descriptorStr.join( ' ' ) + ')' ; }
				if ( descriptorStr.length ) { descriptorStr = descriptorStr.join( ' ' ) ; }
				else { descriptorStr = '' ; }
			}
		}

		if ( runtime.keyIsProperty ) {
			if ( ! options.noMarkup && keyNeedingQuotes( runtime.key ) ) {
				key = '"' + options.style.key( runtime.key ) + '": ' ;
			}
			else {
				key = options.style.key( runtime.key ) + ': ' ;
			}
		}
		else if ( options.bulletIndex ) {
			key = ( typeof options.bulletIndex === 'string' ? options.bulletIndex : '*' ) + ' ' ;
		}
		else if ( ! options.noIndex ) {
			key = options.style.index( runtime.key ) ;
		}

		if ( descriptorStr ) { descriptorStr = ' ' + options.style.type( descriptorStr ) ; }
	}

	pre = runtime.noPre ? '' : indent + key ;


	// Describe the current variable

	if ( variable === undefined ) {
		str += pre + options.style.constant( 'undefined' ) + descriptorStr + options.style.newline ;
	}
	else if ( variable === EMPTY ) {
		str += pre + options.style.constant( '[empty]' ) + descriptorStr + options.style.newline ;
	}
	else if ( variable === null ) {
		str += pre + options.style.constant( 'null' ) + descriptorStr + options.style.newline ;
	}
	else if ( variable === false ) {
		str += pre + options.style.constant( 'false' ) + descriptorStr + options.style.newline ;
	}
	else if ( variable === true ) {
		str += pre + options.style.constant( 'true' ) + descriptorStr + options.style.newline ;
	}
	else if ( type === 'number' ) {
		str += pre + options.style.number( variable.toString() ) +
			( options.noType || options.noTypeButConstructor ? '' : ' ' + options.style.type( 'number' ) ) +
			descriptorStr + options.style.newline ;
	}
	else if ( type === 'string' ) {
		if ( variable.length > options.maxLength ) {
			str += pre + ( options.noMarkup ? '' : '"' ) + options.style.string( escape.control( variable.slice( 0 , options.maxLength - 1 ) ) ) + '…' + ( options.noMarkup ? '' : '"' ) +
				( options.noType || options.noTypeButConstructor ? '' : ' ' + options.style.type( 'string' ) + options.style.length( '(' + variable.length + ' - TRUNCATED)' ) ) +
				descriptorStr + options.style.newline ;
		}
		else {
			str += pre + ( options.noMarkup ? '' : '"' ) + options.style.string( escape.control( variable ) ) + ( options.noMarkup ? '' : '"' ) +
				( options.noType || options.noTypeButConstructor ? '' : ' ' + options.style.type( 'string' ) + options.style.length( '(' + variable.length + ')' ) ) +
				descriptorStr + options.style.newline ;
		}
	}
	else if ( Buffer.isBuffer( variable ) ) {
		str += pre + options.style.inspect( variable.inspect() ) +
			( options.noType ? '' : ' ' + options.style.type( 'Buffer' ) + options.style.length( '(' + variable.length + ')' ) ) +
			descriptorStr + options.style.newline ;
	}
	else if ( type === 'object' || type === 'function' ) {
		funcName = length = '' ;
		isFunc = false ;

		if ( type === 'function' ) {
			isFunc = true ;
			funcName = ' ' + options.style.funcName( ( variable.name ? variable.name : '(anonymous)' ) ) ;
			length = options.style.length( '(' + variable.length + ')' ) ;
		}

		isArray = false ;

		if ( Array.isArray( variable ) ) {
			isArray = true ;
			length = options.style.length( '(' + variable.length + ')' ) ;
		}

		if ( ! variable.constructor ) { constructor = '(no constructor)' ; }
		else if ( ! variable.constructor.name ) { constructor = '(anonymous)' ; }
		else { constructor = variable.constructor.name ; }

		isTrivialConstructor = ! variable.constructor || TRIVIAL_CONSTRUCTOR.has( variable.constructor ) ;

		constructor = options.style.constructorName( constructor ) ;
		proto = Object.getPrototypeOf( variable ) ;

		str += pre ;

		if ( ! options.noType && ( ! options.noTypeButConstructor || ! isTrivialConstructor ) ) {
			if ( runtime.forceType && ! options.noType && ! options.noTypeButConstructor ) {
				str += options.style.type( runtime.forceType ) ;
			}
			else if ( options.noTypeButConstructor ) {
				str += constructor ;
			}
			else {
				str += constructor + funcName + length + ' ' + options.style.type( type ) + descriptorStr ;
			}

			if ( ! isFunc || options.funcDetails ) { str += ' ' ; }	// if no funcDetails imply no space here
		}

		if ( isArray && options.noArrayProperty ) {
			propertyList = [ ... Array( variable.length ).keys() ] ;
		}
		else {
			propertyList = Object.getOwnPropertyNames( variable ) ;
		}

		if ( options.sort ) { propertyList.sort() ; }

		// Special Objects
		specialObject = specialObjectSubstitution( variable , runtime , options ) ;

		if ( options.protoBlackList && options.protoBlackList.has( proto ) ) {
			str += options.style.limit( '[skip]' ) + options.style.newline ;
		}
		else if ( specialObject !== undefined ) {
			if ( typeof specialObject === 'string' ) {
				str += '=> ' + specialObject + options.style.newline ;
			}
			else {
				str += '=> ' + inspect_(
					{
						depth: runtime.depth ,
						ancestors: runtime.ancestors ,
						noPre: true
					} ,
					options ,
					specialObject
				) ;
			}
		}
		else if ( isFunc && ! options.funcDetails ) {
			str += options.style.newline ;
		}
		else if ( ! propertyList.length && ! options.proto ) {
			str += ( options.noMarkup ? '' : isArray ? '[]' : '{}' ) + options.style.newline ;
		}
		else if ( runtime.depth >= options.depth ) {
			str += options.style.limit( '[depth limit]' ) + options.style.newline ;
		}
		else if ( runtime.ancestors.indexOf( variable ) !== -1 ) {
			str += options.style.limit( '[circular]' ) + options.style.newline ;
		}
		else {
			/*
			str +=
				options.noMarkup ? ( isArray && options.noIndex && ! runtime.keyIsProperty ? '' : options.style.newline ) :
				( isArray ? '[' : '{' ) + options.style.newline ;
			//*/
			//*
			str += ( options.noMarkup ? '' : isArray ? '[' : '{'  ) + options.style.newline ;
			//*/

			// Do not use .concat() here, it doesn't works as expected with arrays...
			nextAncestors = runtime.ancestors.slice() ;
			nextAncestors.push( variable ) ;

			for ( i = 0 ; i < propertyList.length && str.length < options.outputMaxLength ; i ++ ) {
				if ( ! isArray && (
					( options.propertyBlackList && options.propertyBlackList.has( propertyList[ i ] ) )
					|| ( options.useInspectPropertyBlackList && ( variable.inspectPropertyBlackList instanceof Set ) && variable.inspectPropertyBlackList.has( propertyList[ i ] ) )
				) ) {
					//str += options.style.limit( '[skip]' ) + options.style.newline ;
					continue ;
				}

				if ( isArray && options.noArrayProperty && ! ( propertyList[ i ] in variable ) ) {
					// Hole in the array (sparse array, item deleted, ...)
					str += inspect_(
						{
							depth: runtime.depth + 1 ,
							ancestors: nextAncestors ,
							key: propertyList[ i ] ,
							keyIsProperty: false
						} ,
						options ,
						EMPTY
					) ;
				}
				else {
					try {
						descriptor = Object.getOwnPropertyDescriptor( variable , propertyList[ i ] ) ;
						// Note: descriptor can be undefined, this happens when the object is a Proxy with a bad implementation:
						// it reports that key (Object.keys()) but doesn't give the descriptor for it.

						if ( descriptor && ! descriptor.enumerable && options.enumOnly ) { continue ; }
						keyIsProperty = ! isArray || ! descriptor.enumerable || isNaN( propertyList[ i ] ) ;

						if ( ! options.noDescriptor && descriptor && ( descriptor.get || descriptor.set ) ) {
							str += inspect_(
								{
									depth: runtime.depth + 1 ,
									ancestors: nextAncestors ,
									key: propertyList[ i ] ,
									keyIsProperty: keyIsProperty ,
									descriptor: descriptor ,
									forceType: 'getter/setter'
								} ,
								options ,
								{ get: descriptor.get , set: descriptor.set }
							) ;
						}
						else {
							str += inspect_(
								{
									depth: runtime.depth + 1 ,
									ancestors: nextAncestors ,
									key: propertyList[ i ] ,
									keyIsProperty: keyIsProperty ,
									descriptor: options.noDescriptor ? undefined : descriptor || { error: "Bad Proxy Descriptor" }
								} ,
								options ,
								variable[ propertyList[ i ] ]
							) ;
						}
					}
					catch ( error ) {
						str += inspect_(
							{
								depth: runtime.depth + 1 ,
								ancestors: nextAncestors ,
								key: propertyList[ i ] ,
								keyIsProperty: keyIsProperty ,
								descriptor: options.noDescriptor ? undefined : descriptor
							} ,
							options ,
							error
						) ;
					}
				}

				if ( i < propertyList.length - 1 ) { str += options.style.comma ; }
			}

			if ( options.proto ) {
				str += inspect_(
					{
						depth: runtime.depth + 1 ,
						ancestors: nextAncestors ,
						key: '__proto__' ,
						keyIsProperty: true
					} ,
					options ,
					proto
				) ;
			}

			str += options.noMarkup ? '' : indent + ( isArray ? ']' : '}' ) + options.style.newline ;
		}
	}


	// Finalizing


	if ( runtime.depth === 0 ) {
		if ( options.style.trim ) { str = str.trim() ; }
		if ( options.style === 'html' ) { str = escape.html( str ) ; }
	}

	return str ;
}



function keyNeedingQuotes( key ) {
	if ( ! key.length ) { return true ; }
	return false ;
}



var promiseStates = [ 'pending' , 'fulfilled' , 'rejected' ] ;



// Some special object are better written down when substituted by something else
function specialObjectSubstitution( object , runtime , options ) {
	if ( typeof object.constructor !== 'function' ) {
		// Some objects have no constructor, e.g.: Object.create(null)
		//console.error( object ) ;
		return ;
	}

	if ( object instanceof String ) {
		return object.toString() ;
	}

	if ( object instanceof RegExp ) {
		return object.toString() ;
	}

	if ( object instanceof Date ) {
		return object.toString() + ' [' + object.getTime() + ']' ;
	}

	if ( typeof Set === 'function' && object instanceof Set ) {
		// This is an ES6 'Set' Object
		return Array.from( object ) ;
	}

	if ( typeof Map === 'function' && object instanceof Map ) {
		// This is an ES6 'Map' Object
		return Array.from( object ) ;
	}

	if ( object instanceof Promise ) {
		if ( process && process.binding && process.binding( 'util' ) && process.binding( 'util' ).getPromiseDetails ) {
			let details = process.binding( 'util' ).getPromiseDetails( object ) ;
			let state =  promiseStates[ details[ 0 ] ] ;
			let str = 'Promise <' + state + '>' ;

			if ( state === 'fulfilled' ) {
				str += ' ' + inspect_(
					{
						depth: runtime.depth ,
						ancestors: runtime.ancestors ,
						noPre: true
					} ,
					options ,
					details[ 1 ]
				) ;
			}
			else if ( state === 'rejected' ) {
				if ( details[ 1 ] instanceof Error ) {
					str += ' ' + inspectError(
						{
							style: options.style ,
							noErrorStack: true
						} ,
						details[ 1 ]
					) ;
				}
				else {
					str += ' ' + inspect_(
						{
							depth: runtime.depth ,
							ancestors: runtime.ancestors ,
							noPre: true
						} ,
						options ,
						details[ 1 ]
					) ;
				}
			}

			return str ;
		}
	}

	if ( object._bsontype ) {
		// This is a MongoDB ObjectID, rather boring to display in its original form
		// due to esoteric characters that confuse both the user and the terminal displaying it.
		// Substitute it to its string representation
		return object.toString() ;
	}

	if ( options.useInspect && typeof object.inspect === 'function' ) {
		return object.inspect() ;
	}

	return ;
}



/*
	Options:
		noErrorStack: set to true if the stack should not be displayed
*/
function inspectError( options , error ) {
	var str = '' , stack , type , code ;

	if ( arguments.length < 2 ) { error = options ; options = {} ; }
	else if ( ! options || typeof options !== 'object' ) { options = {} ; }

	if ( ! options.style ) { options.style = inspectStyle.none ; }
	else if ( typeof options.style === 'string' ) { options.style = inspectStyle[ options.style ] ; }

	if ( ! ( error instanceof Error ) ) {
		str += '[not an Error] ' ;

		if ( typeof error === 'string' ) {
			let maxLength = 5000 ;

			if ( error.length > maxLength ) {
				str += options.style.errorMessage( escape.control( error.slice( 0 , maxLength - 1 ) , true ) ) + '…'
					+ options.style.length( '(' + error.length + ' - TRUNCATED)' )
					+ options.style.newline ;
			}
			else {
				str += options.style.errorMessage( escape.control( error , true ) )
					+ options.style.newline ;
			}

			return str ;
		}
		else if ( ! error || typeof error !== 'object' || ! error.name || typeof error.name !== 'string' || ! error.message || typeof error.message !== 'string' ) {
			str += inspect( options , error ) ;
			return str ;
		}

		// It's an object, but it's compatible with Error, so we can move on...
	}

	if ( error.stack && ! options.noErrorStack ) { stack = inspectStack( options , error.stack ) ; }

	type = error.type || error.constructor.name ;
	code = error.code || error.name || error.errno || error.number ;

	str += options.style.errorType( type ) +
		( code ? ' [' + options.style.errorType( code ) + ']' : '' ) + ': ' ;
	str += options.style.errorMessage( error.message ) + '\n' ;

	if ( stack ) { str += options.style.errorStack( stack ) + '\n' ; }

	if ( error.from ) {
		str += options.style.newline + options.style.errorFromMessage( 'From error:' ) + options.style.newline + inspectError( options , error.from ) ;
	}

	return str ;
}

exports.inspectError = inspectError ;



function inspectStack( options , stack ) {
	if ( arguments.length < 2 ) { stack = options ; options = {} ; }
	else if ( ! options || typeof options !== 'object' ) { options = {} ; }

	if ( ! options.style ) { options.style = inspectStyle.none ; }
	else if ( typeof options.style === 'string' ) { options.style = inspectStyle[ options.style ] ; }

	if ( ! stack ) { return ; }

	if ( ( options.browser || process.browser ) && stack.indexOf( '@' ) !== -1 ) {
		// Assume a Firefox-compatible stack-trace here...
		stack = stack
			.replace( /[</]*(?=@)/g , '' )	// Firefox output some WTF </</</</< stuff in its stack trace -- removing that
			.replace(
				/^\s*([^@]*)\s*@\s*([^\n]*)(?::([0-9]+):([0-9]+))?$/mg ,
				( matches , method , file , line , column ) => {
					return options.style.errorStack( '    at ' ) +
						( method ? options.style.errorStackMethod( method ) + ' ' : '' ) +
						options.style.errorStack( '(' ) +
						( file ? options.style.errorStackFile( file ) : options.style.errorStack( 'unknown' ) ) +
						( line ? options.style.errorStack( ':' ) + options.style.errorStackLine( line ) : '' ) +
						( column ? options.style.errorStack( ':' ) + options.style.errorStackColumn( column ) : '' ) +
						options.style.errorStack( ')' ) ;
				}
			) ;
	}
	else {
		stack = stack.replace( /^[^\n]*\n/ , '' ) ;
		stack = stack.replace(
			/^\s*(at)\s+(?:(?:(async|new)\s+)?([^\s:()[\]\n]+(?:\([^)]+\))?)\s)?(?:\[as ([^\s:()[\]\n]+)\]\s)?(?:\(?([^:()[\]\n]+):([0-9]+):([0-9]+)\)?)?$/mg ,
			( matches , at , keyword , method , as , file , line , column ) => {
				return options.style.errorStack( '    at ' ) +
					( keyword ? options.style.errorStackKeyword( keyword ) + ' ' : '' ) +
					( method ? options.style.errorStackMethod( method ) + ' ' : '' ) +
					( as ? options.style.errorStack( '[as ' ) + options.style.errorStackMethodAs( as ) + options.style.errorStack( '] ' ) : '' ) +
					options.style.errorStack( '(' ) +
					( file ? options.style.errorStackFile( file ) : options.style.errorStack( 'unknown' ) ) +
					( line ? options.style.errorStack( ':' ) + options.style.errorStackLine( line ) : '' ) +
					( column ? options.style.errorStack( ':' ) + options.style.errorStackColumn( column ) : '' ) +
					options.style.errorStack( ')' ) ;
			}
		) ;
	}

	return stack ;
}

exports.inspectStack = inspectStack ;



// Inspect's styles

var inspectStyle = {} ;

var inspectStyleNoop = str => str ;



inspectStyle.none = {
	trim: false ,
	tab: '    ' ,
	newline: '\n' ,
	comma: '' ,
	limit: inspectStyleNoop ,
	type: str => '<' + str + '>' ,
	constant: inspectStyleNoop ,
	funcName: inspectStyleNoop ,
	constructorName: str => '<' + str + '>' ,
	length: inspectStyleNoop ,
	key: inspectStyleNoop ,
	index: str => '[' + str + '] ' ,
	number: inspectStyleNoop ,
	inspect: inspectStyleNoop ,
	string: inspectStyleNoop ,
	errorType: inspectStyleNoop ,
	errorMessage: inspectStyleNoop ,
	errorStack: inspectStyleNoop ,
	errorStackKeyword: inspectStyleNoop ,
	errorStackMethod: inspectStyleNoop ,
	errorStackMethodAs: inspectStyleNoop ,
	errorStackFile: inspectStyleNoop ,
	errorStackLine: inspectStyleNoop ,
	errorStackColumn: inspectStyleNoop ,
	errorFromMessage: inspectStyleNoop ,
	truncate: ( str , maxLength ) => str.slice( 0 , maxLength - 1 ) + '…'
} ;



inspectStyle.inline = Object.assign( {} , inspectStyle.none , {
	trim: true ,
	tab: '' ,
	newline: ' ' ,
	comma: ', ' ,
	length: () => '' ,
	index: () => ''
	//type: () => '' ,
} ) ;



inspectStyle.color = Object.assign( {} , inspectStyle.none , {
	limit: str => ansi.bold + ansi.brightRed + str + ansi.reset ,
	type: str => ansi.italic + ansi.brightBlack + str + ansi.reset ,
	constant: str => ansi.cyan + str + ansi.reset ,
	funcName: str => ansi.italic + ansi.magenta + str + ansi.reset ,
	constructorName: str => ansi.magenta + str + ansi.reset ,
	length: str => ansi.italic + ansi.brightBlack + str + ansi.reset ,
	key: str => ansi.green + str + ansi.reset ,
	index: str => ansi.blue + '[' + str + ']' + ansi.reset + ' ' ,
	number: str => ansi.cyan + str + ansi.reset ,
	inspect: str => ansi.cyan + str + ansi.reset ,
	string: str => ansi.blue + str + ansi.reset ,
	errorType: str => ansi.red + ansi.bold + str + ansi.reset ,
	errorMessage: str => ansi.red + ansi.italic + str + ansi.reset ,
	errorStack: str => ansi.brightBlack + str + ansi.reset ,
	errorStackKeyword: str => ansi.italic + ansi.bold + str + ansi.reset ,
	errorStackMethod: str => ansi.brightYellow + str + ansi.reset ,
	errorStackMethodAs: str => ansi.yellow + str + ansi.reset ,
	errorStackFile: str => ansi.brightCyan + str + ansi.reset ,
	errorStackLine: str => ansi.blue + str + ansi.reset ,
	errorStackColumn: str => ansi.magenta + str + ansi.reset ,
	errorFromMessage: str => ansi.yellow + ansi.underline + str + ansi.reset ,
	truncate: ( str , maxLength ) => {
		var trail = ansi.gray + '…' + ansi.reset ;
		str = str.slice( 0 , maxLength - trail.length ) ;

		// Search for an ansi escape sequence at the end, that could be truncated.
		// The longest one is '\x1b[107m': 6 characters.
		var lastEscape = str.lastIndexOf( '\x1b' ) ;
		if ( lastEscape >= str.length - 6 ) { str = str.slice( 0 , lastEscape ) ; }

		return str + trail ;
	}
} ) ;



inspectStyle.html = Object.assign( {} , inspectStyle.none , {
	tab: '&nbsp;&nbsp;&nbsp;&nbsp;' ,
	newline: '<br />' ,
	limit: str => '<span style="color:red">' + str + '</span>' ,
	type: str => '<i style="color:gray">' + str + '</i>' ,
	constant: str => '<span style="color:cyan">' + str + '</span>' ,
	funcName: str => '<i style="color:magenta">' + str + '</i>' ,
	constructorName: str => '<span style="color:magenta">' + str + '</span>' ,
	length: str => '<i style="color:gray">' + str + '</i>' ,
	key: str => '<span style="color:green">' + str + '</span>' ,
	index: str => '<span style="color:blue">[' + str + ']</span> ' ,
	number: str => '<span style="color:cyan">' + str + '</span>' ,
	inspect: str => '<span style="color:cyan">' + str + '</span>' ,
	string: str => '<span style="color:blue">' + str + '</span>' ,
	errorType: str => '<span style="color:red">' + str + '</span>' ,
	errorMessage: str => '<span style="color:red">' + str + '</span>' ,
	errorStack: str => '<span style="color:gray">' + str + '</span>' ,
	errorStackKeyword: str => '<i>' + str + '</i>' ,
	errorStackMethod: str => '<span style="color:yellow">' + str + '</span>' ,
	errorStackMethodAs: str => '<span style="color:yellow">' + str + '</span>' ,
	errorStackFile: str => '<span style="color:cyan">' + str + '</span>' ,
	errorStackLine: str => '<span style="color:blue">' + str + '</span>' ,
	errorStackColumn: str => '<span style="color:gray">' + str + '</span>' ,
	errorFromMessage: str => '<span style="color:yellow">' + str + '</span>'
} ) ;


}).call(this)}).call(this,{"isBuffer":require("../../../../../../../../opt/node-v14.15.4/lib/node_modules/browserify/node_modules/is-buffer/index.js")},require('_process'))
},{"../../../../../../../../opt/node-v14.15.4/lib/node_modules/browserify/node_modules/is-buffer/index.js":48,"./ansi.js":27,"./escape.js":29,"_process":50}],33:[function(require,module,exports){
module.exports={"߀":"0","́":""," ":" ","Ⓐ":"A","Ａ":"A","À":"A","Á":"A","Â":"A","Ầ":"A","Ấ":"A","Ẫ":"A","Ẩ":"A","Ã":"A","Ā":"A","Ă":"A","Ằ":"A","Ắ":"A","Ẵ":"A","Ẳ":"A","Ȧ":"A","Ǡ":"A","Ä":"A","Ǟ":"A","Ả":"A","Å":"A","Ǻ":"A","Ǎ":"A","Ȁ":"A","Ȃ":"A","Ạ":"A","Ậ":"A","Ặ":"A","Ḁ":"A","Ą":"A","Ⱥ":"A","Ɐ":"A","Ꜳ":"AA","Æ":"AE","Ǽ":"AE","Ǣ":"AE","Ꜵ":"AO","Ꜷ":"AU","Ꜹ":"AV","Ꜻ":"AV","Ꜽ":"AY","Ⓑ":"B","Ｂ":"B","Ḃ":"B","Ḅ":"B","Ḇ":"B","Ƀ":"B","Ɓ":"B","ｃ":"C","Ⓒ":"C","Ｃ":"C","Ꜿ":"C","Ḉ":"C","Ç":"C","Ⓓ":"D","Ｄ":"D","Ḋ":"D","Ď":"D","Ḍ":"D","Ḑ":"D","Ḓ":"D","Ḏ":"D","Đ":"D","Ɗ":"D","Ɖ":"D","ᴅ":"D","Ꝺ":"D","Ð":"Dh","Ǳ":"DZ","Ǆ":"DZ","ǲ":"Dz","ǅ":"Dz","ɛ":"E","Ⓔ":"E","Ｅ":"E","È":"E","É":"E","Ê":"E","Ề":"E","Ế":"E","Ễ":"E","Ể":"E","Ẽ":"E","Ē":"E","Ḕ":"E","Ḗ":"E","Ĕ":"E","Ė":"E","Ë":"E","Ẻ":"E","Ě":"E","Ȅ":"E","Ȇ":"E","Ẹ":"E","Ệ":"E","Ȩ":"E","Ḝ":"E","Ę":"E","Ḙ":"E","Ḛ":"E","Ɛ":"E","Ǝ":"E","ᴇ":"E","ꝼ":"F","Ⓕ":"F","Ｆ":"F","Ḟ":"F","Ƒ":"F","Ꝼ":"F","Ⓖ":"G","Ｇ":"G","Ǵ":"G","Ĝ":"G","Ḡ":"G","Ğ":"G","Ġ":"G","Ǧ":"G","Ģ":"G","Ǥ":"G","Ɠ":"G","Ꞡ":"G","Ᵹ":"G","Ꝿ":"G","ɢ":"G","Ⓗ":"H","Ｈ":"H","Ĥ":"H","Ḣ":"H","Ḧ":"H","Ȟ":"H","Ḥ":"H","Ḩ":"H","Ḫ":"H","Ħ":"H","Ⱨ":"H","Ⱶ":"H","Ɥ":"H","Ⓘ":"I","Ｉ":"I","Ì":"I","Í":"I","Î":"I","Ĩ":"I","Ī":"I","Ĭ":"I","İ":"I","Ï":"I","Ḯ":"I","Ỉ":"I","Ǐ":"I","Ȉ":"I","Ȋ":"I","Ị":"I","Į":"I","Ḭ":"I","Ɨ":"I","Ⓙ":"J","Ｊ":"J","Ĵ":"J","Ɉ":"J","ȷ":"J","Ⓚ":"K","Ｋ":"K","Ḱ":"K","Ǩ":"K","Ḳ":"K","Ķ":"K","Ḵ":"K","Ƙ":"K","Ⱪ":"K","Ꝁ":"K","Ꝃ":"K","Ꝅ":"K","Ꞣ":"K","Ⓛ":"L","Ｌ":"L","Ŀ":"L","Ĺ":"L","Ľ":"L","Ḷ":"L","Ḹ":"L","Ļ":"L","Ḽ":"L","Ḻ":"L","Ł":"L","Ƚ":"L","Ɫ":"L","Ⱡ":"L","Ꝉ":"L","Ꝇ":"L","Ꞁ":"L","Ǉ":"LJ","ǈ":"Lj","Ⓜ":"M","Ｍ":"M","Ḿ":"M","Ṁ":"M","Ṃ":"M","Ɱ":"M","Ɯ":"M","ϻ":"M","Ꞥ":"N","Ƞ":"N","Ⓝ":"N","Ｎ":"N","Ǹ":"N","Ń":"N","Ñ":"N","Ṅ":"N","Ň":"N","Ṇ":"N","Ņ":"N","Ṋ":"N","Ṉ":"N","Ɲ":"N","Ꞑ":"N","ᴎ":"N","Ǌ":"NJ","ǋ":"Nj","Ⓞ":"O","Ｏ":"O","Ò":"O","Ó":"O","Ô":"O","Ồ":"O","Ố":"O","Ỗ":"O","Ổ":"O","Õ":"O","Ṍ":"O","Ȭ":"O","Ṏ":"O","Ō":"O","Ṑ":"O","Ṓ":"O","Ŏ":"O","Ȯ":"O","Ȱ":"O","Ö":"O","Ȫ":"O","Ỏ":"O","Ő":"O","Ǒ":"O","Ȍ":"O","Ȏ":"O","Ơ":"O","Ờ":"O","Ớ":"O","Ỡ":"O","Ở":"O","Ợ":"O","Ọ":"O","Ộ":"O","Ǫ":"O","Ǭ":"O","Ø":"O","Ǿ":"O","Ɔ":"O","Ɵ":"O","Ꝋ":"O","Ꝍ":"O","Œ":"OE","Ƣ":"OI","Ꝏ":"OO","Ȣ":"OU","Ⓟ":"P","Ｐ":"P","Ṕ":"P","Ṗ":"P","Ƥ":"P","Ᵽ":"P","Ꝑ":"P","Ꝓ":"P","Ꝕ":"P","Ⓠ":"Q","Ｑ":"Q","Ꝗ":"Q","Ꝙ":"Q","Ɋ":"Q","Ⓡ":"R","Ｒ":"R","Ŕ":"R","Ṙ":"R","Ř":"R","Ȑ":"R","Ȓ":"R","Ṛ":"R","Ṝ":"R","Ŗ":"R","Ṟ":"R","Ɍ":"R","Ɽ":"R","Ꝛ":"R","Ꞧ":"R","Ꞃ":"R","Ⓢ":"S","Ｓ":"S","ẞ":"S","Ś":"S","Ṥ":"S","Ŝ":"S","Ṡ":"S","Š":"S","Ṧ":"S","Ṣ":"S","Ṩ":"S","Ș":"S","Ş":"S","Ȿ":"S","Ꞩ":"S","Ꞅ":"S","Ⓣ":"T","Ｔ":"T","Ṫ":"T","Ť":"T","Ṭ":"T","Ț":"T","Ţ":"T","Ṱ":"T","Ṯ":"T","Ŧ":"T","Ƭ":"T","Ʈ":"T","Ⱦ":"T","Ꞇ":"T","Þ":"Th","Ꜩ":"TZ","Ⓤ":"U","Ｕ":"U","Ù":"U","Ú":"U","Û":"U","Ũ":"U","Ṹ":"U","Ū":"U","Ṻ":"U","Ŭ":"U","Ü":"U","Ǜ":"U","Ǘ":"U","Ǖ":"U","Ǚ":"U","Ủ":"U","Ů":"U","Ű":"U","Ǔ":"U","Ȕ":"U","Ȗ":"U","Ư":"U","Ừ":"U","Ứ":"U","Ữ":"U","Ử":"U","Ự":"U","Ụ":"U","Ṳ":"U","Ų":"U","Ṷ":"U","Ṵ":"U","Ʉ":"U","Ⓥ":"V","Ｖ":"V","Ṽ":"V","Ṿ":"V","Ʋ":"V","Ꝟ":"V","Ʌ":"V","Ꝡ":"VY","Ⓦ":"W","Ｗ":"W","Ẁ":"W","Ẃ":"W","Ŵ":"W","Ẇ":"W","Ẅ":"W","Ẉ":"W","Ⱳ":"W","Ⓧ":"X","Ｘ":"X","Ẋ":"X","Ẍ":"X","Ⓨ":"Y","Ｙ":"Y","Ỳ":"Y","Ý":"Y","Ŷ":"Y","Ỹ":"Y","Ȳ":"Y","Ẏ":"Y","Ÿ":"Y","Ỷ":"Y","Ỵ":"Y","Ƴ":"Y","Ɏ":"Y","Ỿ":"Y","Ⓩ":"Z","Ｚ":"Z","Ź":"Z","Ẑ":"Z","Ż":"Z","Ž":"Z","Ẓ":"Z","Ẕ":"Z","Ƶ":"Z","Ȥ":"Z","Ɀ":"Z","Ⱬ":"Z","Ꝣ":"Z","ⓐ":"a","ａ":"a","ẚ":"a","à":"a","á":"a","â":"a","ầ":"a","ấ":"a","ẫ":"a","ẩ":"a","ã":"a","ā":"a","ă":"a","ằ":"a","ắ":"a","ẵ":"a","ẳ":"a","ȧ":"a","ǡ":"a","ä":"a","ǟ":"a","ả":"a","å":"a","ǻ":"a","ǎ":"a","ȁ":"a","ȃ":"a","ạ":"a","ậ":"a","ặ":"a","ḁ":"a","ą":"a","ⱥ":"a","ɐ":"a","ɑ":"a","ꜳ":"aa","æ":"ae","ǽ":"ae","ǣ":"ae","ꜵ":"ao","ꜷ":"au","ꜹ":"av","ꜻ":"av","ꜽ":"ay","ⓑ":"b","ｂ":"b","ḃ":"b","ḅ":"b","ḇ":"b","ƀ":"b","ƃ":"b","ɓ":"b","Ƃ":"b","ⓒ":"c","ć":"c","ĉ":"c","ċ":"c","č":"c","ç":"c","ḉ":"c","ƈ":"c","ȼ":"c","ꜿ":"c","ↄ":"c","C":"c","Ć":"c","Ĉ":"c","Ċ":"c","Č":"c","Ƈ":"c","Ȼ":"c","ⓓ":"d","ｄ":"d","ḋ":"d","ď":"d","ḍ":"d","ḑ":"d","ḓ":"d","ḏ":"d","đ":"d","ƌ":"d","ɖ":"d","ɗ":"d","Ƌ":"d","Ꮷ":"d","ԁ":"d","Ɦ":"d","ð":"dh","ǳ":"dz","ǆ":"dz","ⓔ":"e","ｅ":"e","è":"e","é":"e","ê":"e","ề":"e","ế":"e","ễ":"e","ể":"e","ẽ":"e","ē":"e","ḕ":"e","ḗ":"e","ĕ":"e","ė":"e","ë":"e","ẻ":"e","ě":"e","ȅ":"e","ȇ":"e","ẹ":"e","ệ":"e","ȩ":"e","ḝ":"e","ę":"e","ḙ":"e","ḛ":"e","ɇ":"e","ǝ":"e","ⓕ":"f","ｆ":"f","ḟ":"f","ƒ":"f","ﬀ":"ff","ﬁ":"fi","ﬂ":"fl","ﬃ":"ffi","ﬄ":"ffl","ⓖ":"g","ｇ":"g","ǵ":"g","ĝ":"g","ḡ":"g","ğ":"g","ġ":"g","ǧ":"g","ģ":"g","ǥ":"g","ɠ":"g","ꞡ":"g","ꝿ":"g","ᵹ":"g","ⓗ":"h","ｈ":"h","ĥ":"h","ḣ":"h","ḧ":"h","ȟ":"h","ḥ":"h","ḩ":"h","ḫ":"h","ẖ":"h","ħ":"h","ⱨ":"h","ⱶ":"h","ɥ":"h","ƕ":"hv","ⓘ":"i","ｉ":"i","ì":"i","í":"i","î":"i","ĩ":"i","ī":"i","ĭ":"i","ï":"i","ḯ":"i","ỉ":"i","ǐ":"i","ȉ":"i","ȋ":"i","ị":"i","į":"i","ḭ":"i","ɨ":"i","ı":"i","ⓙ":"j","ｊ":"j","ĵ":"j","ǰ":"j","ɉ":"j","ⓚ":"k","ｋ":"k","ḱ":"k","ǩ":"k","ḳ":"k","ķ":"k","ḵ":"k","ƙ":"k","ⱪ":"k","ꝁ":"k","ꝃ":"k","ꝅ":"k","ꞣ":"k","ⓛ":"l","ｌ":"l","ŀ":"l","ĺ":"l","ľ":"l","ḷ":"l","ḹ":"l","ļ":"l","ḽ":"l","ḻ":"l","ſ":"l","ł":"l","ƚ":"l","ɫ":"l","ⱡ":"l","ꝉ":"l","ꞁ":"l","ꝇ":"l","ɭ":"l","ǉ":"lj","ⓜ":"m","ｍ":"m","ḿ":"m","ṁ":"m","ṃ":"m","ɱ":"m","ɯ":"m","ⓝ":"n","ｎ":"n","ǹ":"n","ń":"n","ñ":"n","ṅ":"n","ň":"n","ṇ":"n","ņ":"n","ṋ":"n","ṉ":"n","ƞ":"n","ɲ":"n","ŉ":"n","ꞑ":"n","ꞥ":"n","ԉ":"n","ǌ":"nj","ⓞ":"o","ｏ":"o","ò":"o","ó":"o","ô":"o","ồ":"o","ố":"o","ỗ":"o","ổ":"o","õ":"o","ṍ":"o","ȭ":"o","ṏ":"o","ō":"o","ṑ":"o","ṓ":"o","ŏ":"o","ȯ":"o","ȱ":"o","ö":"o","ȫ":"o","ỏ":"o","ő":"o","ǒ":"o","ȍ":"o","ȏ":"o","ơ":"o","ờ":"o","ớ":"o","ỡ":"o","ở":"o","ợ":"o","ọ":"o","ộ":"o","ǫ":"o","ǭ":"o","ø":"o","ǿ":"o","ꝋ":"o","ꝍ":"o","ɵ":"o","ɔ":"o","ᴑ":"o","œ":"oe","ƣ":"oi","ꝏ":"oo","ȣ":"ou","ⓟ":"p","ｐ":"p","ṕ":"p","ṗ":"p","ƥ":"p","ᵽ":"p","ꝑ":"p","ꝓ":"p","ꝕ":"p","ρ":"p","ⓠ":"q","ｑ":"q","ɋ":"q","ꝗ":"q","ꝙ":"q","ⓡ":"r","ｒ":"r","ŕ":"r","ṙ":"r","ř":"r","ȑ":"r","ȓ":"r","ṛ":"r","ṝ":"r","ŗ":"r","ṟ":"r","ɍ":"r","ɽ":"r","ꝛ":"r","ꞧ":"r","ꞃ":"r","ⓢ":"s","ｓ":"s","ś":"s","ṥ":"s","ŝ":"s","ṡ":"s","š":"s","ṧ":"s","ṣ":"s","ṩ":"s","ș":"s","ş":"s","ȿ":"s","ꞩ":"s","ꞅ":"s","ẛ":"s","ʂ":"s","ß":"ss","ⓣ":"t","ｔ":"t","ṫ":"t","ẗ":"t","ť":"t","ṭ":"t","ț":"t","ţ":"t","ṱ":"t","ṯ":"t","ŧ":"t","ƭ":"t","ʈ":"t","ⱦ":"t","ꞇ":"t","þ":"th","ꜩ":"tz","ⓤ":"u","ｕ":"u","ù":"u","ú":"u","û":"u","ũ":"u","ṹ":"u","ū":"u","ṻ":"u","ŭ":"u","ü":"u","ǜ":"u","ǘ":"u","ǖ":"u","ǚ":"u","ủ":"u","ů":"u","ű":"u","ǔ":"u","ȕ":"u","ȗ":"u","ư":"u","ừ":"u","ứ":"u","ữ":"u","ử":"u","ự":"u","ụ":"u","ṳ":"u","ų":"u","ṷ":"u","ṵ":"u","ʉ":"u","ⓥ":"v","ｖ":"v","ṽ":"v","ṿ":"v","ʋ":"v","ꝟ":"v","ʌ":"v","ꝡ":"vy","ⓦ":"w","ｗ":"w","ẁ":"w","ẃ":"w","ŵ":"w","ẇ":"w","ẅ":"w","ẘ":"w","ẉ":"w","ⱳ":"w","ⓧ":"x","ｘ":"x","ẋ":"x","ẍ":"x","ⓨ":"y","ｙ":"y","ỳ":"y","ý":"y","ŷ":"y","ỹ":"y","ȳ":"y","ẏ":"y","ÿ":"y","ỷ":"y","ẙ":"y","ỵ":"y","ƴ":"y","ɏ":"y","ỿ":"y","ⓩ":"z","ｚ":"z","ź":"z","ẑ":"z","ż":"z","ž":"z","ẓ":"z","ẕ":"z","ƶ":"z","ȥ":"z","ɀ":"z","ⱬ":"z","ꝣ":"z"}
},{}],34:[function(require,module,exports){
/*
	String Kit

	Copyright (c) 2014 - 2021 Cédric Ronvel

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



var map = require( './latinize-map.json' ) ;

module.exports = function( str ) {
	return str.replace( /[^\u0000-\u007e]/g , ( c ) => { return map[ c ] || c ; } ) ;
} ;



},{"./latinize-map.json":33}],35:[function(require,module,exports){
/*
	String Kit

	Copyright (c) 2014 - 2021 Cédric Ronvel

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



exports.resize = function( str , length ) {
	if ( str.length === length ) {
		return str ;
	}
	else if ( str.length > length ) {
		return str.slice( 0 , length ) ;
	}

	return str + ' '.repeat( length - str.length ) ;

} ;



exports.occurrenceCount = function( str , subStr , overlap = false ) {
	if ( ! str || ! subStr ) { return 0 ; }

	var count = 0 , index = 0 ,
		inc = overlap ? 1 : subStr.length ;

	while ( ( index = str.indexOf( subStr , index ) ) !== -1 ) {
		count ++ ;
		index += inc ;
	}

	return count ;
} ;


},{}],36:[function(require,module,exports){
/*
	String Kit

	Copyright (c) 2014 - 2021 Cédric Ronvel

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



const CONTROL_CLASS = 1 ;
const WORD_SEPARATOR_CLASS = 2 ;
const LETTER_CLASS = 3 ;
const NUMBER_CLASS = 4 ;
const SYMBOL_CLASS = 5 ;



function getCharacterClass( char , code ) {
	if ( isWordSeparator( code ) ) { return WORD_SEPARATOR_CLASS ; }
	if ( code <= 0x1f || code === 0x7f ) { return CONTROL_CLASS ; }
	if ( isNumber( code ) ) { return NUMBER_CLASS ; }
	// Here we assume that a letter is a char with a “case”
	if ( char.toUpperCase() !== char.toLowerCase() ) { return LETTER_CLASS ; }
	return SYMBOL_CLASS ;
}



function isWordSeparator( code ) {
	if (
		// space, tab, no-break space
		code === 0x20 || code === 0x09 || code === 0xa0 ||
		// hyphen, underscore
		code === 0x2d || code === 0x5f
	) {
		return true ;
	}

	return false ;
}



function isNumber( code ) {
	if ( code >= 0x30 && code <= 0x39 ) { return true ; }
	return false ;
}



function naturalSort( a , b ) {
	a = '' + a ;
	b = '' + b ;

	var aIndex , aEndIndex , aChar , aCode , aClass , aCharLc , aNumber ,
		aTrim = a.trim() ,
		aLength = aTrim.length ,
		bIndex , bEndIndex , bChar , bCode , bClass , bCharLc , bNumber ,
		bTrim = b.trim() ,
		bLength = bTrim.length ,
		advantage = 0 ;

	for ( aIndex = bIndex = 0 ; aIndex < aLength && bIndex < bLength ; aIndex ++ , bIndex ++ ) {
		aChar = aTrim[ aIndex ] ;
		bChar = bTrim[ bIndex ] ;
		aCode = aTrim.charCodeAt( aIndex ) ;
		bCode = bTrim.charCodeAt( bIndex ) ;
		aClass = getCharacterClass( aChar , aCode ) ;
		bClass = getCharacterClass( bChar , bCode ) ;
		if ( aClass !== bClass ) { return aClass - bClass ; }

		switch ( aClass ) {
			case WORD_SEPARATOR_CLASS :
				// Eat all white chars and continue
				while ( isWordSeparator( aTrim.charCodeAt( aIndex + 1 ) ) ) { aIndex ++ ; }
				while ( isWordSeparator( bTrim.charCodeAt( bIndex + 1 ) ) ) { bIndex ++ ; }
				break ;

			case CONTROL_CLASS :
			case SYMBOL_CLASS :
				if ( aCode !== bCode ) { return aCode - bCode ; }
				break ;

			case LETTER_CLASS :
				aCharLc = aChar.toLowerCase() ;
				bCharLc = bChar.toLowerCase() ;
				if ( aCharLc !== bCharLc ) { return aCharLc > bCharLc ? 1 : -1 ; }

				// As a last resort, we would sort uppercase first
				if ( ! advantage && aChar !== bChar ) { advantage = aChar !== aCharLc ? -1 : 1 ; }

				break ;

			case NUMBER_CLASS :
				// Lookup for a whole number and parse it
				aEndIndex = aIndex + 1 ;
				while ( isNumber( aTrim.charCodeAt( aEndIndex ) ) ) { aEndIndex ++ ; }
				aNumber = parseFloat( aTrim.slice( aIndex , aEndIndex ) ) ;

				bEndIndex = bIndex + 1 ;
				while ( isNumber( bTrim.charCodeAt( bEndIndex ) ) ) { bEndIndex ++ ; }
				bNumber = parseFloat( bTrim.slice( bIndex , bEndIndex ) ) ;

				if ( aNumber !== bNumber ) { return aNumber - bNumber ; }

				// As a last resort, we would sort the number with the less char first
				if ( ! advantage && aEndIndex - aIndex !== bEndIndex - bIndex ) { advantage = ( aEndIndex - aIndex ) - ( bEndIndex - bIndex ) ; }

				// Advance the index at the end of the number area
				aIndex = aEndIndex - 1 ;
				bIndex = bEndIndex - 1 ;
				break ;
		}
	}

	// If there was an “advantage”, use it now
	if ( advantage ) { return advantage ; }

	// Finally, sort by remaining char, or by trimmed length or by full length
	return ( aLength - aIndex ) - ( bLength - bIndex ) || aLength - bLength || a.length - b.length ;
}

module.exports = naturalSort ;


},{}],37:[function(require,module,exports){
/*
	String Kit

	Copyright (c) 2014 - 2021 Cédric Ronvel

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



var escape = require( './escape.js' ) ;



exports.regexp = {} ;



exports.regexp.array2alternatives = function array2alternatives( array ) {
	var i , sorted = array.slice() ;

	// Sort descending by string length
	sorted.sort( ( a , b ) => {
		return b.length - a.length ;
	} ) ;

	// Then escape what should be
	for ( i = 0 ; i < sorted.length ; i ++ ) {
		sorted[ i ] = escape.regExpPattern( sorted[ i ] ) ;
	}

	return sorted.join( '|' ) ;
} ;



},{"./escape.js":29}],38:[function(require,module,exports){
/*
	String Kit

	Copyright (c) 2014 - 2021 Cédric Ronvel

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



const stringKit = {} ;
module.exports = stringKit ;



/*
// Tier 0: add polyfills to stringKit
const polyfill = require( './polyfill.js' ) ;

for ( let fn_ in polyfill ) {
	stringKit[ fn ] = function( str , ... args ) {
		return polyfill[ fn ].call( str , ... args ) ;
	} ;
}
//*/



Object.assign( stringKit ,

	// Tier 1
	{ escape: require( './escape.js' ) } ,
	{ ansi: require( './ansi.js' ) } ,
	{ unicode: require( './unicode.js' ) }
) ;



Object.assign( stringKit ,

	// Tier 2
	require( './format.js' ) ,

	// Tier 3
	require( './misc.js' ) ,
	require( './inspect.js' ) ,
	require( './regexp.js' ) ,
	require( './camel.js' ) ,
	{
		latinize: require( './latinize.js' ) ,
		toTitleCase: require( './toTitleCase.js' ) ,
		wordwrap: require( './wordwrap.js' ) ,
		naturalSort: require( './naturalSort.js' ) ,
		fuzzy: require( './fuzzy.js' ) ,
		StringNumber: require( './StringNumber.js' )
	}
) ;



/*
// Install all polyfill into String.prototype
stringKit.installPolyfills = function installPolyfills() {
	for ( let fn in polyfill ) {
		if ( ! String.prototype[ fn ] ) {
			String.prototype[ fn ] = polyfill[ fn ] ;
		}
	}
} ;
//*/


},{"./StringNumber.js":26,"./ansi.js":27,"./camel.js":28,"./escape.js":29,"./format.js":30,"./fuzzy.js":31,"./inspect.js":32,"./latinize.js":34,"./misc.js":35,"./naturalSort.js":36,"./regexp.js":37,"./toTitleCase.js":39,"./unicode.js":41,"./wordwrap.js":42}],39:[function(require,module,exports){
/*
	String Kit

	Copyright (c) 2014 - 2021 Cédric Ronvel

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



const DEFAULT_OPTIONS = {
	underscoreToSpace: true ,
	lowerCaseWords: new Set( [
		// Articles
		'a' , 'an' , 'the' ,
		// Conjunctions (only coordinating conjunctions, maybe we will have to add subordinating and correlative conjunctions)
		'for' , 'and' , 'nor' , 'but' , 'or' , 'yet' , 'so' ,
		// Prepositions (there are more, but usually only preposition with 2 or 3 letters are lower-cased)
		'of' , 'on' , 'off' , 'in' , 'into' , 'by' , 'with' , 'to' , 'at' , 'up' , 'down' , 'as'
	] )
} ;



module.exports = ( str , options = DEFAULT_OPTIONS ) => {
	if ( ! str || typeof str !== 'string' ) { return '' ; }

	// Manage options
	var dashToSpace = options.dashToSpace ?? DEFAULT_OPTIONS.dashToSpace ,
		underscoreToSpace = options.underscoreToSpace ?? DEFAULT_OPTIONS.underscoreToSpace ,
		zealous = options.zealous ?? DEFAULT_OPTIONS.zealous ,
		preserveAllCaps = options.preserveAllCaps ?? DEFAULT_OPTIONS.preserveAllCaps ,
		lowerCaseWords = options.lowerCaseWords ?? DEFAULT_OPTIONS.lowerCaseWords ;

	lowerCaseWords =
		lowerCaseWords instanceof Set ? lowerCaseWords :
		Array.isArray( lowerCaseWords ) ? new Set( lowerCaseWords ) :
		null ;


	if ( dashToSpace ) { str = str.replace( /-+/g , ' ' ) ; }
	if ( underscoreToSpace ) { str = str.replace( /_+/g , ' ' ) ; }

	// Squash multiple spaces into only one, and trim
	str = str.replace( / +/g , ' ' ).trim() ;


	return str.replace( /[^\s_-]+/g , ( part , position ) => {
		// Check word that must be lower-cased (excluding the first and the last word)
		if ( lowerCaseWords && position && position + part.length < str.length ) {
			let lowerCased = part.toLowerCase() ;
			if ( lowerCaseWords.has( lowerCased ) ) { return lowerCased ; }
		}

		if ( zealous ) {
			if ( preserveAllCaps && part === part.toUpperCase() ) {
				// This is a ALLCAPS word
				return part ;
			}

			return part[ 0 ].toUpperCase() + part.slice( 1 ).toLowerCase() ;
		}

		return part[ 0 ].toUpperCase() + part.slice( 1 ) ;
	} ) ;
} ;


},{}],40:[function(require,module,exports){
module.exports=[{"s":9728,"e":9747,"w":1},{"s":9748,"e":9749,"w":2},{"s":9750,"e":9799,"w":1},{"s":9800,"e":9811,"w":2},{"s":9812,"e":9854,"w":1},{"s":9855,"e":9855,"w":2},{"s":9856,"e":9874,"w":1},{"s":9875,"e":9875,"w":2},{"s":9876,"e":9888,"w":1},{"s":9889,"e":9889,"w":2},{"s":9890,"e":9897,"w":1},{"s":9898,"e":9899,"w":2},{"s":9900,"e":9916,"w":1},{"s":9917,"e":9918,"w":2},{"s":9919,"e":9923,"w":1},{"s":9924,"e":9925,"w":2},{"s":9926,"e":9933,"w":1},{"s":9934,"e":9934,"w":2},{"s":9935,"e":9939,"w":1},{"s":9940,"e":9940,"w":2},{"s":9941,"e":9961,"w":1},{"s":9962,"e":9962,"w":2},{"s":9963,"e":9969,"w":1},{"s":9970,"e":9971,"w":2},{"s":9972,"e":9972,"w":1},{"s":9973,"e":9973,"w":2},{"s":9974,"e":9977,"w":1},{"s":9978,"e":9978,"w":2},{"s":9979,"e":9980,"w":1},{"s":9981,"e":9981,"w":2},{"s":9982,"e":9983,"w":1},{"s":9984,"e":9988,"w":1},{"s":9989,"e":9989,"w":2},{"s":9990,"e":9993,"w":1},{"s":9994,"e":9995,"w":2},{"s":9996,"e":10023,"w":1},{"s":10024,"e":10024,"w":2},{"s":10025,"e":10059,"w":1},{"s":10060,"e":10060,"w":2},{"s":10061,"e":10061,"w":1},{"s":10062,"e":10062,"w":2},{"s":10063,"e":10066,"w":1},{"s":10067,"e":10069,"w":2},{"s":10070,"e":10070,"w":1},{"s":10071,"e":10071,"w":2},{"s":10072,"e":10132,"w":1},{"s":10133,"e":10135,"w":2},{"s":10136,"e":10159,"w":1},{"s":10160,"e":10160,"w":2},{"s":10161,"e":10174,"w":1},{"s":10175,"e":10175,"w":2},{"s":126976,"e":126979,"w":1},{"s":126980,"e":126980,"w":2},{"s":126981,"e":127182,"w":1},{"s":127183,"e":127183,"w":2},{"s":127184,"e":127373,"w":1},{"s":127374,"e":127374,"w":2},{"s":127375,"e":127376,"w":1},{"s":127377,"e":127386,"w":2},{"s":127387,"e":127487,"w":1},{"s":127744,"e":127776,"w":2},{"s":127777,"e":127788,"w":1},{"s":127789,"e":127797,"w":2},{"s":127798,"e":127798,"w":1},{"s":127799,"e":127868,"w":2},{"s":127869,"e":127869,"w":1},{"s":127870,"e":127891,"w":2},{"s":127892,"e":127903,"w":1},{"s":127904,"e":127946,"w":2},{"s":127947,"e":127950,"w":1},{"s":127951,"e":127955,"w":2},{"s":127956,"e":127967,"w":1},{"s":127968,"e":127984,"w":2},{"s":127985,"e":127987,"w":1},{"s":127988,"e":127988,"w":2},{"s":127989,"e":127991,"w":1},{"s":127992,"e":127994,"w":2},{"s":128000,"e":128062,"w":2},{"s":128063,"e":128063,"w":1},{"s":128064,"e":128064,"w":2},{"s":128065,"e":128065,"w":1},{"s":128066,"e":128252,"w":2},{"s":128253,"e":128254,"w":1},{"s":128255,"e":128317,"w":2},{"s":128318,"e":128330,"w":1},{"s":128331,"e":128334,"w":2},{"s":128335,"e":128335,"w":1},{"s":128336,"e":128359,"w":2},{"s":128360,"e":128377,"w":1},{"s":128378,"e":128378,"w":2},{"s":128379,"e":128404,"w":1},{"s":128405,"e":128406,"w":2},{"s":128407,"e":128419,"w":1},{"s":128420,"e":128420,"w":2},{"s":128421,"e":128506,"w":1},{"s":128507,"e":128591,"w":2},{"s":128592,"e":128639,"w":1},{"s":128640,"e":128709,"w":2},{"s":128710,"e":128715,"w":1},{"s":128716,"e":128716,"w":2},{"s":128717,"e":128719,"w":1},{"s":128720,"e":128722,"w":2},{"s":128723,"e":128724,"w":1},{"s":128725,"e":128727,"w":2},{"s":128728,"e":128746,"w":1},{"s":128747,"e":128748,"w":2},{"s":128749,"e":128755,"w":1},{"s":128756,"e":128764,"w":2},{"s":128765,"e":128991,"w":1},{"s":128992,"e":129003,"w":2},{"s":129004,"e":129291,"w":1},{"s":129292,"e":129338,"w":2},{"s":129339,"e":129339,"w":1},{"s":129340,"e":129349,"w":2},{"s":129350,"e":129350,"w":1},{"s":129351,"e":129400,"w":2},{"s":129401,"e":129401,"w":1},{"s":129402,"e":129483,"w":2},{"s":129484,"e":129484,"w":1},{"s":129485,"e":129535,"w":2},{"s":129536,"e":129647,"w":1},{"s":129648,"e":129652,"w":2},{"s":129653,"e":129655,"w":1},{"s":129656,"e":129658,"w":2},{"s":129659,"e":129663,"w":1},{"s":129664,"e":129670,"w":2},{"s":129671,"e":129679,"w":1},{"s":129680,"e":129704,"w":2},{"s":129705,"e":129711,"w":1},{"s":129712,"e":129718,"w":2},{"s":129719,"e":129727,"w":1},{"s":129728,"e":129730,"w":2},{"s":129731,"e":129743,"w":1},{"s":129744,"e":129750,"w":2},{"s":129751,"e":129791,"w":1}]

},{}],41:[function(require,module,exports){
/*
	String Kit

	Copyright (c) 2014 - 2021 Cédric Ronvel

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



/*
	Javascript does not use UTF-8 but UCS-2.
	The purpose of this module is to process correctly strings containing UTF-8 characters that take more than 2 bytes.

	Since the punycode module is deprecated in Node.js v8.x, this is an adaptation of punycode.ucs2.x
	as found on Aug 16th 2017 at: https://github.com/bestiejs/punycode.js/blob/master/punycode.js.

	2021 note -- Modern Javascript is way more unicode friendly since many years, e.g. `Array.from( string )` and `for ( char of string )` are unicode aware.
	Some methods here are now useless, but have been modernized to use the correct ES features.
*/



// Create the module and export it
const unicode = {} ;
module.exports = unicode ;



unicode.encode = array => String.fromCodePoint( ... array ) ;

// Decode a string into an array of unicode codepoints.
// The 2nd argument of Array.from() is a map function, it avoids creating intermediate array.
unicode.decode = str => Array.from( str , c => c.codePointAt( 0 ) ) ;

// DEPRECATED: This function is totally useless now, with modern JS.
unicode.firstCodePoint = str => str.codePointAt( 0 ) ;

// Extract only the first char.
unicode.firstChar = str => str.length ? String.fromCodePoint( str.codePointAt( 0 ) ) : undefined ;

// DEPRECATED: This function is totally useless now, with modern JS.
unicode.toArray = str => Array.from( str ) ;



// Decode a string into an array of Cell (used by Terminal-kit).
// Wide chars have an additionnal filler cell, so position is correct
unicode.toCells = ( Cell , str , tabWidth = 4 , linePosition = 0 , ... extraCellArgs ) => {
	var char , code , fillSize , width ,
		output = [] ;

	for ( char of str ) {
		code = char.codePointAt( 0 ) ;

		if ( code === 0x0a ) {	// New line
			linePosition = 0 ;
		}
		else if ( code === 0x09 ) {	// Tab
			// Depends upon the next tab-stop
			fillSize = tabWidth - ( linePosition % tabWidth ) - 1 ;
			//output.push( new Cell( '\t' , ... extraCellArgs ) ) ;
			output.push( new Cell( '\t' , 1 , ... extraCellArgs ) ) ;
			linePosition += 1 + fillSize ;

			// Add a filler cell
			while ( fillSize -- ) { output.push( new Cell( ' ' , -2 , ... extraCellArgs ) ) ; }
		}
		else {
			width = unicode.codePointWidth( code ) ,
			output.push( new Cell( char , width , ... extraCellArgs ) ) ;
			linePosition += width ;

			// Add an anti-filler cell (a cell with 0 width, following a wide char)
			while ( -- width > 0 ) { output.push( new Cell( ' ' , -1 , ... extraCellArgs ) ) ; }
		}
	}

	return output ;
} ;



unicode.fromCells = ( cells ) => {
	var cell , str = '' ;

	for ( cell of cells ) {
		if ( ! cell.filler ) { str += cell.char ; }
	}

	return str ;
} ;



// Get the length of an unicode string
// Mostly an adaptation of .decode(), not factorized for performance's sake (used by Terminal-kit)
// /!\ Use Array.from().length instead??? Not using it is potentially faster, but it needs benchmark to be sure.
unicode.length = str => {
	// for ... of is unicode-aware
	var char , length = 0 ;
	for ( char of str ) { length ++ ; }		/* eslint-disable-line no-unused-vars */
	return length ;
} ;



// Return the width of a string in a terminal/monospace font
unicode.width = str => {
	// for ... of is unicode-aware
	var char , count = 0 ;
	for ( char of str ) { count += unicode.codePointWidth( char.codePointAt( 0 ) ) ; }
	return count ;
} ;



// Return the width of an array of string in a terminal/monospace font
unicode.arrayWidth = ( array , limit ) => {
	var index , count = 0 ;

	if ( limit === undefined ) { limit = array.length ; }

	for ( index = 0 ; index < limit ; index ++ ) {
		count += unicode.isFullWidth( array[ index ] ) ? 2 : 1 ;
	}

	return count ;
} ;



// Userland may use this, it is more efficient than .truncateWidth() + .width(),
// and BTW even more than testing .width() then .truncateWidth() + .width()
var lastTruncateWidth = 0 ;
unicode.getLastTruncateWidth = () => lastTruncateWidth ;



// Return a string that does not exceed the limit.
unicode.widthLimit =	// DEPRECATED
unicode.truncateWidth = ( str , limit ) => {
	var char , charWidth , position = 0 ;

	// Module global:
	lastTruncateWidth = 0 ;

	for ( char of str ) {
		charWidth = unicode.codePointWidth( char.codePointAt( 0 ) ) ;

		if ( lastTruncateWidth + charWidth > limit ) {
			return str.slice( 0 , position ) ;
		}

		lastTruncateWidth += charWidth ;
		position += char.length ;
	}

	// The string remains unchanged
	return str ;
} ;



/*
	** PROBABLY DEPRECATED **

	Check if a UCS2 char is a surrogate pair.

	Returns:
		0: single char
		1: leading surrogate
		-1: trailing surrogate

	Note: it does not check input, to gain perfs.
*/
unicode.surrogatePair = char => {
	var code = char.charCodeAt( 0 ) ;

	if ( code < 0xd800 || code >= 0xe000 ) { return 0 ; }
	else if ( code < 0xdc00 ) { return 1 ; }
	return -1 ;
} ;



// Check if a character is a full-width char or not
unicode.isFullWidth = char => unicode.isFullWidthCodePoint( char.codePointAt( 0 ) ) ;

// Return the width of a char, leaner than .width() for one char
unicode.charWidth = char => unicode.codePointWidth( char.codePointAt( 0 ) ) ;



/*
	Build the Emoji width lookup.
	The ranges file (./lib/unicode-emoji-width-ranges.json) is produced by a Terminal-Kit script ([terminal-kit]/utilities/build-emoji-width-lookup.js),
	that writes each emoji and check the cursor location.
*/
const emojiWidthLookup = new Map() ;

( function() {
	var ranges = require( './unicode-emoji-width-ranges.json' ) ;
	for ( let range of ranges ) {
		for ( let i = range.s ; i <= range.e ; i ++ ) {
			emojiWidthLookup.set( i , range.w ) ;
		}
	}
} )() ;

/*
	Check if a codepoint represent a full-width char or not.
*/
unicode.codePointWidth = code => {
	// Assuming all emoji are wide here
	if ( unicode.isEmojiCodePoint( code ) ) {
		return emojiWidthLookup.get( code ) ?? 2 ;
	}

	// Code points are derived from:
	// http://www.unicode.org/Public/UNIDATA/EastAsianWidth.txt
	if ( code >= 0x1100 && (
		code <= 0x115f ||	// Hangul Jamo
		code === 0x2329 || // LEFT-POINTING ANGLE BRACKET
		code === 0x232a || // RIGHT-POINTING ANGLE BRACKET
		// CJK Radicals Supplement .. Enclosed CJK Letters and Months
		( 0x2e80 <= code && code <= 0x3247 && code !== 0x303f ) ||
		// Enclosed CJK Letters and Months .. CJK Unified Ideographs Extension A
		( 0x3250 <= code && code <= 0x4dbf ) ||
		// CJK Unified Ideographs .. Yi Radicals
		( 0x4e00 <= code && code <= 0xa4c6 ) ||
		// Hangul Jamo Extended-A
		( 0xa960 <= code && code <= 0xa97c ) ||
		// Hangul Syllables
		( 0xac00 <= code && code <= 0xd7a3 ) ||
		// CJK Compatibility Ideographs
		( 0xf900 <= code && code <= 0xfaff ) ||
		// Vertical Forms
		( 0xfe10 <= code && code <= 0xfe19 ) ||
		// CJK Compatibility Forms .. Small Form Variants
		( 0xfe30 <= code && code <= 0xfe6b ) ||
		// Halfwidth and Fullwidth Forms
		( 0xff01 <= code && code <= 0xff60 ) ||
		( 0xffe0 <= code && code <= 0xffe6 ) ||
		// Kana Supplement
		( 0x1b000 <= code && code <= 0x1b001 ) ||
		// Enclosed Ideographic Supplement
		( 0x1f200 <= code && code <= 0x1f251 ) ||
		// CJK Unified Ideographs Extension B .. Tertiary Ideographic Plane
		( 0x20000 <= code && code <= 0x3fffd )
	) ) {
		return 2 ;
	}

	if (
		unicode.isEmojiModifierCodePoint( code ) ||
		unicode.isZeroWidthDiacriticCodePoint( code )
	) {
		return 0 ;
	}

	return 1 ;
} ;

// For a true/false type of result
unicode.isFullWidthCodePoint = code => unicode.codePointWidth( code ) === 2 ;



// Convert normal ASCII chars to their full-width counterpart
unicode.toFullWidth = str => {
	return String.fromCodePoint( ... Array.from( str , char => {
		var code = char.codePointAt( 0 ) ;
		return code >= 33 && code <= 126  ?  0xff00 + code - 0x20  :  code ;
	} ) ) ;
} ;



// Check if a character is a diacritic with zero-width or not
unicode.isZeroWidthDiacritic = char => unicode.isZeroWidthDiacriticCodePoint( char.codePointAt( 0 ) ) ;

// Some doc found here: https://en.wikipedia.org/wiki/Combining_character
// Diacritics and other characters that combines with previous one (zero-width)
unicode.isZeroWidthDiacriticCodePoint = code =>
	// Combining Diacritical Marks
	( 0x300 <= code && code <= 0x36f ) ||
	// Combining Diacritical Marks Extended
	( 0x1ab0 <= code && code <= 0x1aff ) ||
	// Combining Diacritical Marks Supplement
	( 0x1dc0 <= code && code <= 0x1dff ) ||
	// Combining Diacritical Marks for Symbols
	( 0x20d0 <= code && code <= 0x20ff ) ||
	// Combining Half Marks
	( 0xfe20 <= code && code <= 0xfe2f ) ||
	// Dakuten and handakuten (japanese)
	code === 0x3099 || code === 0x309a ||
	// Devanagari
	( 0x900 <= code && code <= 0x903 ) ||
	( 0x93a <= code && code <= 0x957 && code !== 0x93d && code !== 0x950 ) ||
	code === 0x962 || code === 0x963 ||
	// Thai
	code === 0xe31 ||
	( 0xe34 <= code && code <= 0xe3a ) ||
	( 0xe47 <= code && code <= 0xe4e ) ;

// Check if a character is an emoji or not
unicode.isEmoji = char => unicode.isEmojiCodePoint( char.codePointAt( 0 ) ) ;

// Some doc found here: https://stackoverflow.com/questions/30470079/emoji-value-range
unicode.isEmojiCodePoint = code =>
	// Miscellaneous symbols
	( 0x2600 <= code && code <= 0x26ff ) ||
	// Dingbats
	( 0x2700 <= code && code <= 0x27bf ) ||
	// Emoji
	( 0x1f000 <= code && code <= 0x1f1ff ) ||
	( 0x1f300 <= code && code <= 0x1f3fa ) ||
	( 0x1f400 <= code && code <= 0x1faff ) ;

// Emoji modifier
unicode.isEmojiModifier = char => unicode.isEmojiModifierCodePoint( char.codePointAt( 0 ) ) ;
unicode.isEmojiModifierCodePoint = code =>
	( 0x1f3fb <= code && code <= 0x1f3ff ) ||	// (Fitzpatrick): https://en.wikipedia.org/wiki/Miscellaneous_Symbols_and_Pictographs#Emoji_modifiers
	code === 0xfe0f ;	// VARIATION SELECTOR-16 [VS16] {emoji variation selector}


},{"./unicode-emoji-width-ranges.json":40}],42:[function(require,module,exports){
/*
	String Kit

	Copyright (c) 2014 - 2021 Cédric Ronvel

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



const unicode = require( './unicode.js' ) ;



// French typography rules with '!', '?', ':' and ';'
const FRENCH_DOUBLE_GRAPH_TYPO = {
	'!': true ,
	'?': true ,
	':': true ,
	';': true
} ;



/*
	.wordwrap( str , width )
	.wordwrap( str , options )

	str: the string to process
	width: the max width (default to 80)
	options: object, where:
		width: the max width (default to 80)
		glue: (optional) the char used to join lines, by default: lines are joined with '\n',
		noJoin: (optional) if set: don't join, instead return an array of lines
		offset: (optional) offset of the first-line
		updateOffset: (optional) if set, options.offset is updated with the last line width
		noTrim: (optional) if set, don't right-trim lines, if not set, right-trim all lines except the last
		fill: (optional) if set, fill the remaining width with space (it forces noTrim)
		skipFn: (optional) a function used to skip a whole sequence, useful for special sequences
			like ANSI escape sequence, and so on...
		charWidthFn: (optional) a function used to compute the width of one char/group of chars
		regroupFn: (optional) a function used to regroup chars together
*/
module.exports = function wordwrap( str , options ) {
	var start = 0 , end , skipEnd , lineWidth , currentLine , currentWidth , length ,
		lastEnd , lastWidth , lastWasSpace , charWidthFn ,
		explicitNewLine = true ,
		strArray = unicode.toArray( str ) ,
		trimNewLine = false ,
		line , lines = [] ;

	if ( typeof options !== 'object' ) {
		options = { width: options } ;
	}

	// Catch NaN, zero or negative and non-number
	if ( ! options.width || typeof options.width !== 'number' || options.width <= 0 ) { options.width = 80 ; }

	lineWidth = options.offset ? options.width - options.offset : options.width ;

	if ( typeof options.glue !== 'string' ) { options.glue = '\n' ; }

	if ( options.regroupFn ) {
		strArray = options.regroupFn( strArray ) ;
		// If char are grouped, use unicode.width() as a default
		charWidthFn = options.charWidthFn || unicode.width ;
	}
	else {
		// If char are not grouped, use unicode.charWidth() as a default
		charWidthFn = options.charWidthFn || unicode.charWidth ;
	}

	length = strArray.length ;

	var getNextLine = () => {
		//originStart = start ;

		if ( ! explicitNewLine || trimNewLine ) {
			// Find the first non-space char
			while ( strArray[ start ] === ' ' ) { start ++ ; }

			if ( trimNewLine && strArray[ start ] === '\n' ) {
				explicitNewLine = true ;
				start ++ ;
				/*
				originStart = start ;
				while ( strArray[ start ] === ' ' ) { start ++ ; }
				*/
			}
		}

		if ( start >= length ) { return null ; }

		explicitNewLine = false ;
		trimNewLine = false ;
		lastWasSpace = false ;
		end = lastEnd = start ;
		currentWidth = lastWidth = 0 ;

		for ( ;; ) {
			if ( end >= length ) {
				return strArray.slice( start , end ).join( '' ) ;
			}

			if ( strArray[ end ] === '\n' ) {
				explicitNewLine = true ;
				currentLine = strArray.slice( start , end ++ ).join( '' ) ;

				if ( options.fill ) {
					currentLine += ' '.repeat( lineWidth - currentWidth ) ;
				}

				return currentLine ;
			}

			if ( options.skipFn ) {
				skipEnd = options.skipFn( strArray , end ) ;
				if ( skipEnd !== end ) {
					end = skipEnd ;
					continue ;
				}
			}

			if ( strArray[ end ] === ' ' && ! lastWasSpace && ! FRENCH_DOUBLE_GRAPH_TYPO[ strArray[ end + 1 ] ] ) {
				// This is the first space of a group of space
				lastEnd = end ;
				lastWidth = currentWidth ;
			}
			else {
				lastWasSpace = false ;
			}

			currentWidth += charWidthFn( strArray[ end ] ) ;

			if ( currentWidth > lineWidth ) {
				// If lastEnd === start, this is a word that takes the whole line: cut it
				// If not, use the lastEnd
				trimNewLine = true ;

				if ( lastEnd !== start ) {
					end = lastEnd ;
				}
				else if ( lineWidth < options.width ) {
					// This is the first line with an offset, so just start over in line two
					end = start ;
					return '' ;
				}

				currentLine = strArray.slice( start , end ).join( '' ) ;

				if ( options.fill ) {
					currentLine += ' '.repeat( lineWidth - lastWidth ) ;
				}

				return currentLine ;
			}

			// Do not move that inside the for(;;), some part are using a continue statement and manage the end value by themself
			end ++ ;
		}
	} ;

	while ( start < length && ( line = getNextLine() ) !== null ) {
		lines.push( line ) ;
		start = end ;
		lineWidth = options.width ;
	}

	// If it ends with an explicit newline, we have to reproduce it now!
	if ( explicitNewLine ) { lines.push( '' ) ; }

	if ( ! options.noTrim && ! options.fill ) {
		lines = lines.map( ( line_ , index ) => index === lines.length - 1 ? line_ : line_.trimRight() ) ;
	}

	if ( ! options.noJoin ) { lines = lines.join( options.glue ) ; }

	if ( options.updateOffset ) { options.offset = currentWidth ; }

	return lines ;
} ;


},{"./unicode.js":41}],43:[function(require,module,exports){
module.exports={
  "name": "svg-kit",
  "version": "0.4.0",
  "description": "A small SVG toolkit.",
  "main": "lib/svg-kit.js",
  "directories": {
    "test": "test"
  },
  "dependencies": {
    "@cronvel/xmldom": "^0.1.32",
    "dom-kit": "^0.5.1",
    "opentype.js": "^1.3.4",
    "string-kit": "^0.17.10"
  },
  "scripts": {
    "test": "tea-time -R dot"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/cronvel/svg-kit.git"
  },
  "keywords": [
    "svg"
  ],
  "author": "Cédric Ronvel",
  "license": "MIT",
  "bugs": {
    "url": "https://github.com/cronvel/svg-kit/issues"
  },
  "copyright": {
    "title": "SVG Kit",
    "years": [
      2017,
      2023
    ],
    "owner": "Cédric Ronvel"
  }
}

},{}],44:[function(require,module,exports){

},{}],45:[function(require,module,exports){
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function getLens (b64) {
  var len = b64.length

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42
  var validLen = b64.indexOf('=')
  if (validLen === -1) validLen = len

  var placeHoldersLen = validLen === len
    ? 0
    : 4 - (validLen % 4)

  return [validLen, placeHoldersLen]
}

// base64 is 4/3 + up to two characters of the original data
function byteLength (b64) {
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function _byteLength (b64, validLen, placeHoldersLen) {
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function toByteArray (b64) {
  var tmp
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]

  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))

  var curByte = 0

  // if there are placeholders, only get up to the last complete 4 chars
  var len = placeHoldersLen > 0
    ? validLen - 4
    : validLen

  var i
  for (i = 0; i < len; i += 4) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 18) |
      (revLookup[b64.charCodeAt(i + 1)] << 12) |
      (revLookup[b64.charCodeAt(i + 2)] << 6) |
      revLookup[b64.charCodeAt(i + 3)]
    arr[curByte++] = (tmp >> 16) & 0xFF
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 2) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 2) |
      (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 1) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 10) |
      (revLookup[b64.charCodeAt(i + 1)] << 4) |
      (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] +
    lookup[num >> 12 & 0x3F] +
    lookup[num >> 6 & 0x3F] +
    lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp =
      ((uint8[i] << 16) & 0xFF0000) +
      ((uint8[i + 1] << 8) & 0xFF00) +
      (uint8[i + 2] & 0xFF)
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    parts.push(
      lookup[tmp >> 2] +
      lookup[(tmp << 4) & 0x3F] +
      '=='
    )
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1]
    parts.push(
      lookup[tmp >> 10] +
      lookup[(tmp >> 4) & 0x3F] +
      lookup[(tmp << 2) & 0x3F] +
      '='
    )
  }

  return parts.join('')
}

},{}],46:[function(require,module,exports){
(function (Buffer){(function (){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

var K_MAX_LENGTH = 0x7fffffff
exports.kMaxLength = K_MAX_LENGTH

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
 *               implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * We report that the browser does not support typed arrays if the are not subclassable
 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
 * for __proto__ and has a buggy typed array implementation.
 */
Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()

if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
    typeof console.error === 'function') {
  console.error(
    'This browser lacks typed array (Uint8Array) support which is required by ' +
    '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
  )
}

function typedArraySupport () {
  // Can typed array instances can be augmented?
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = { __proto__: Uint8Array.prototype, foo: function () { return 42 } }
    return arr.foo() === 42
  } catch (e) {
    return false
  }
}

Object.defineProperty(Buffer.prototype, 'parent', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.buffer
  }
})

Object.defineProperty(Buffer.prototype, 'offset', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.byteOffset
  }
})

function createBuffer (length) {
  if (length > K_MAX_LENGTH) {
    throw new RangeError('The value "' + length + '" is invalid for option "size"')
  }
  // Return an augmented `Uint8Array` instance
  var buf = new Uint8Array(length)
  buf.__proto__ = Buffer.prototype
  return buf
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new TypeError(
        'The "string" argument must be of type string. Received type number'
      )
    }
    return allocUnsafe(arg)
  }
  return from(arg, encodingOrOffset, length)
}

// Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
if (typeof Symbol !== 'undefined' && Symbol.species != null &&
    Buffer[Symbol.species] === Buffer) {
  Object.defineProperty(Buffer, Symbol.species, {
    value: null,
    configurable: true,
    enumerable: false,
    writable: false
  })
}

Buffer.poolSize = 8192 // not used by this implementation

function from (value, encodingOrOffset, length) {
  if (typeof value === 'string') {
    return fromString(value, encodingOrOffset)
  }

  if (ArrayBuffer.isView(value)) {
    return fromArrayLike(value)
  }

  if (value == null) {
    throw TypeError(
      'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
      'or Array-like Object. Received type ' + (typeof value)
    )
  }

  if (isInstance(value, ArrayBuffer) ||
      (value && isInstance(value.buffer, ArrayBuffer))) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof value === 'number') {
    throw new TypeError(
      'The "value" argument must not be of type number. Received type number'
    )
  }

  var valueOf = value.valueOf && value.valueOf()
  if (valueOf != null && valueOf !== value) {
    return Buffer.from(valueOf, encodingOrOffset, length)
  }

  var b = fromObject(value)
  if (b) return b

  if (typeof Symbol !== 'undefined' && Symbol.toPrimitive != null &&
      typeof value[Symbol.toPrimitive] === 'function') {
    return Buffer.from(
      value[Symbol.toPrimitive]('string'), encodingOrOffset, length
    )
  }

  throw new TypeError(
    'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
    'or Array-like Object. Received type ' + (typeof value)
  )
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(value, encodingOrOffset, length)
}

// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// https://github.com/feross/buffer/pull/148
Buffer.prototype.__proto__ = Uint8Array.prototype
Buffer.__proto__ = Uint8Array

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be of type number')
  } else if (size < 0) {
    throw new RangeError('The value "' + size + '" is invalid for option "size"')
  }
}

function alloc (size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(size).fill(fill, encoding)
      : createBuffer(size).fill(fill)
  }
  return createBuffer(size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(size, fill, encoding)
}

function allocUnsafe (size) {
  assertSize(size)
  return createBuffer(size < 0 ? 0 : checked(size) | 0)
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(size)
}

function fromString (string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('Unknown encoding: ' + encoding)
  }

  var length = byteLength(string, encoding) | 0
  var buf = createBuffer(length)

  var actual = buf.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    buf = buf.slice(0, actual)
  }

  return buf
}

function fromArrayLike (array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  var buf = createBuffer(length)
  for (var i = 0; i < length; i += 1) {
    buf[i] = array[i] & 255
  }
  return buf
}

function fromArrayBuffer (array, byteOffset, length) {
  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('"offset" is outside of buffer bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('"length" is outside of buffer bounds')
  }

  var buf
  if (byteOffset === undefined && length === undefined) {
    buf = new Uint8Array(array)
  } else if (length === undefined) {
    buf = new Uint8Array(array, byteOffset)
  } else {
    buf = new Uint8Array(array, byteOffset, length)
  }

  // Return an augmented `Uint8Array` instance
  buf.__proto__ = Buffer.prototype
  return buf
}

function fromObject (obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    var buf = createBuffer(len)

    if (buf.length === 0) {
      return buf
    }

    obj.copy(buf, 0, 0, len)
    return buf
  }

  if (obj.length !== undefined) {
    if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
      return createBuffer(0)
    }
    return fromArrayLike(obj)
  }

  if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
    return fromArrayLike(obj.data)
  }
}

function checked (length) {
  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= K_MAX_LENGTH) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return b != null && b._isBuffer === true &&
    b !== Buffer.prototype // so Buffer.isBuffer(Buffer.prototype) will be false
}

Buffer.compare = function compare (a, b) {
  if (isInstance(a, Uint8Array)) a = Buffer.from(a, a.offset, a.byteLength)
  if (isInstance(b, Uint8Array)) b = Buffer.from(b, b.offset, b.byteLength)
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError(
      'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
    )
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!Array.isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (isInstance(buf, Uint8Array)) {
      buf = Buffer.from(buf)
    }
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    throw new TypeError(
      'The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' +
      'Received type ' + typeof string
    )
  }

  var len = string.length
  var mustMatch = (arguments.length > 2 && arguments[2] === true)
  if (!mustMatch && len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) {
          return mustMatch ? -1 : utf8ToBytes(string).length // assume utf8
        }
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
// reliably in a browserify context because there could be multiple different
// copies of the 'buffer' package in use. This method works even for Buffer
// instances that were created from another copy of the `buffer` package.
// See: https://github.com/feross/buffer/issues/154
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.toLocaleString = Buffer.prototype.toString

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  str = this.toString('hex', 0, max).replace(/(.{2})/g, '$1 ').trim()
  if (this.length > max) str += ' ... '
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (isInstance(target, Uint8Array)) {
    target = Buffer.from(target, target.offset, target.byteLength)
  }
  if (!Buffer.isBuffer(target)) {
    throw new TypeError(
      'The "target" argument must be one of type Buffer or Uint8Array. ' +
      'Received type ' + (typeof target)
    )
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset // Coerce to Number.
  if (numberIsNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  var strLen = string.length

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (numberIsNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset >>> 0
    if (isFinite(length)) {
      length = length >>> 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
        : (firstByte > 0xBF) ? 2
          : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf = this.subarray(start, end)
  // Return an augmented `Uint8Array` instance
  newBuf.__proto__ = Buffer.prototype
  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset + 3] = (value >>> 24)
  this[offset + 2] = (value >>> 16)
  this[offset + 1] = (value >>> 8)
  this[offset] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  this[offset + 2] = (value >>> 16)
  this[offset + 3] = (value >>> 24)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer')
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('Index out of range')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start

  if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
    // Use built-in when available, missing from IE11
    this.copyWithin(targetStart, start, end)
  } else if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (var i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, end),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if ((encoding === 'utf8' && code < 128) ||
          encoding === 'latin1') {
        // Fast path: If `val` fits into a single byte, use that numeric value.
        val = code
      }
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : Buffer.from(val, encoding)
    var len = bytes.length
    if (len === 0) {
      throw new TypeError('The value "' + val +
        '" is invalid for argument "value"')
    }
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node takes equal signs as end of the Base64 encoding
  str = str.split('=')[0]
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = str.trim().replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

// ArrayBuffer or Uint8Array objects from other contexts (i.e. iframes) do not pass
// the `instanceof` check but they should be treated as of that type.
// See: https://github.com/feross/buffer/issues/166
function isInstance (obj, type) {
  return obj instanceof type ||
    (obj != null && obj.constructor != null && obj.constructor.name != null &&
      obj.constructor.name === type.name)
}
function numberIsNaN (obj) {
  // For IE11 support
  return obj !== obj // eslint-disable-line no-self-compare
}

}).call(this)}).call(this,require("buffer").Buffer)
},{"base64-js":45,"buffer":46,"ieee754":47}],47:[function(require,module,exports){
/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],48:[function(require,module,exports){
/*!
 * Determine if an object is a Buffer
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */

// The _isBuffer check is for Safari 5-7 support, because it's missing
// Object.prototype.constructor. Remove this eventually
module.exports = function (obj) {
  return obj != null && (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer)
}

function isBuffer (obj) {
  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
}

// For Node v0.10 support. Remove this eventually.
function isSlowBuffer (obj) {
  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isBuffer(obj.slice(0, 0))
}

},{}],49:[function(require,module,exports){
(function (process){(function (){
// 'path' module extracted from Node.js v8.11.1 (only the posix part)
// transplited with Babel

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

function assertPath(path) {
  if (typeof path !== 'string') {
    throw new TypeError('Path must be a string. Received ' + JSON.stringify(path));
  }
}

// Resolves . and .. elements in a path with directory names
function normalizeStringPosix(path, allowAboveRoot) {
  var res = '';
  var lastSegmentLength = 0;
  var lastSlash = -1;
  var dots = 0;
  var code;
  for (var i = 0; i <= path.length; ++i) {
    if (i < path.length)
      code = path.charCodeAt(i);
    else if (code === 47 /*/*/)
      break;
    else
      code = 47 /*/*/;
    if (code === 47 /*/*/) {
      if (lastSlash === i - 1 || dots === 1) {
        // NOOP
      } else if (lastSlash !== i - 1 && dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== 46 /*.*/ || res.charCodeAt(res.length - 2) !== 46 /*.*/) {
          if (res.length > 2) {
            var lastSlashIndex = res.lastIndexOf('/');
            if (lastSlashIndex !== res.length - 1) {
              if (lastSlashIndex === -1) {
                res = '';
                lastSegmentLength = 0;
              } else {
                res = res.slice(0, lastSlashIndex);
                lastSegmentLength = res.length - 1 - res.lastIndexOf('/');
              }
              lastSlash = i;
              dots = 0;
              continue;
            }
          } else if (res.length === 2 || res.length === 1) {
            res = '';
            lastSegmentLength = 0;
            lastSlash = i;
            dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          if (res.length > 0)
            res += '/..';
          else
            res = '..';
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0)
          res += '/' + path.slice(lastSlash + 1, i);
        else
          res = path.slice(lastSlash + 1, i);
        lastSegmentLength = i - lastSlash - 1;
      }
      lastSlash = i;
      dots = 0;
    } else if (code === 46 /*.*/ && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
}

function _format(sep, pathObject) {
  var dir = pathObject.dir || pathObject.root;
  var base = pathObject.base || (pathObject.name || '') + (pathObject.ext || '');
  if (!dir) {
    return base;
  }
  if (dir === pathObject.root) {
    return dir + base;
  }
  return dir + sep + base;
}

var posix = {
  // path.resolve([from ...], to)
  resolve: function resolve() {
    var resolvedPath = '';
    var resolvedAbsolute = false;
    var cwd;

    for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
      var path;
      if (i >= 0)
        path = arguments[i];
      else {
        if (cwd === undefined)
          cwd = process.cwd();
        path = cwd;
      }

      assertPath(path);

      // Skip empty entries
      if (path.length === 0) {
        continue;
      }

      resolvedPath = path + '/' + resolvedPath;
      resolvedAbsolute = path.charCodeAt(0) === 47 /*/*/;
    }

    // At this point the path should be resolved to a full absolute path, but
    // handle relative paths to be safe (might happen when process.cwd() fails)

    // Normalize the path
    resolvedPath = normalizeStringPosix(resolvedPath, !resolvedAbsolute);

    if (resolvedAbsolute) {
      if (resolvedPath.length > 0)
        return '/' + resolvedPath;
      else
        return '/';
    } else if (resolvedPath.length > 0) {
      return resolvedPath;
    } else {
      return '.';
    }
  },

  normalize: function normalize(path) {
    assertPath(path);

    if (path.length === 0) return '.';

    var isAbsolute = path.charCodeAt(0) === 47 /*/*/;
    var trailingSeparator = path.charCodeAt(path.length - 1) === 47 /*/*/;

    // Normalize the path
    path = normalizeStringPosix(path, !isAbsolute);

    if (path.length === 0 && !isAbsolute) path = '.';
    if (path.length > 0 && trailingSeparator) path += '/';

    if (isAbsolute) return '/' + path;
    return path;
  },

  isAbsolute: function isAbsolute(path) {
    assertPath(path);
    return path.length > 0 && path.charCodeAt(0) === 47 /*/*/;
  },

  join: function join() {
    if (arguments.length === 0)
      return '.';
    var joined;
    for (var i = 0; i < arguments.length; ++i) {
      var arg = arguments[i];
      assertPath(arg);
      if (arg.length > 0) {
        if (joined === undefined)
          joined = arg;
        else
          joined += '/' + arg;
      }
    }
    if (joined === undefined)
      return '.';
    return posix.normalize(joined);
  },

  relative: function relative(from, to) {
    assertPath(from);
    assertPath(to);

    if (from === to) return '';

    from = posix.resolve(from);
    to = posix.resolve(to);

    if (from === to) return '';

    // Trim any leading backslashes
    var fromStart = 1;
    for (; fromStart < from.length; ++fromStart) {
      if (from.charCodeAt(fromStart) !== 47 /*/*/)
        break;
    }
    var fromEnd = from.length;
    var fromLen = fromEnd - fromStart;

    // Trim any leading backslashes
    var toStart = 1;
    for (; toStart < to.length; ++toStart) {
      if (to.charCodeAt(toStart) !== 47 /*/*/)
        break;
    }
    var toEnd = to.length;
    var toLen = toEnd - toStart;

    // Compare paths to find the longest common path from root
    var length = fromLen < toLen ? fromLen : toLen;
    var lastCommonSep = -1;
    var i = 0;
    for (; i <= length; ++i) {
      if (i === length) {
        if (toLen > length) {
          if (to.charCodeAt(toStart + i) === 47 /*/*/) {
            // We get here if `from` is the exact base path for `to`.
            // For example: from='/foo/bar'; to='/foo/bar/baz'
            return to.slice(toStart + i + 1);
          } else if (i === 0) {
            // We get here if `from` is the root
            // For example: from='/'; to='/foo'
            return to.slice(toStart + i);
          }
        } else if (fromLen > length) {
          if (from.charCodeAt(fromStart + i) === 47 /*/*/) {
            // We get here if `to` is the exact base path for `from`.
            // For example: from='/foo/bar/baz'; to='/foo/bar'
            lastCommonSep = i;
          } else if (i === 0) {
            // We get here if `to` is the root.
            // For example: from='/foo'; to='/'
            lastCommonSep = 0;
          }
        }
        break;
      }
      var fromCode = from.charCodeAt(fromStart + i);
      var toCode = to.charCodeAt(toStart + i);
      if (fromCode !== toCode)
        break;
      else if (fromCode === 47 /*/*/)
        lastCommonSep = i;
    }

    var out = '';
    // Generate the relative path based on the path difference between `to`
    // and `from`
    for (i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i) {
      if (i === fromEnd || from.charCodeAt(i) === 47 /*/*/) {
        if (out.length === 0)
          out += '..';
        else
          out += '/..';
      }
    }

    // Lastly, append the rest of the destination (`to`) path that comes after
    // the common path parts
    if (out.length > 0)
      return out + to.slice(toStart + lastCommonSep);
    else {
      toStart += lastCommonSep;
      if (to.charCodeAt(toStart) === 47 /*/*/)
        ++toStart;
      return to.slice(toStart);
    }
  },

  _makeLong: function _makeLong(path) {
    return path;
  },

  dirname: function dirname(path) {
    assertPath(path);
    if (path.length === 0) return '.';
    var code = path.charCodeAt(0);
    var hasRoot = code === 47 /*/*/;
    var end = -1;
    var matchedSlash = true;
    for (var i = path.length - 1; i >= 1; --i) {
      code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          if (!matchedSlash) {
            end = i;
            break;
          }
        } else {
        // We saw the first non-path separator
        matchedSlash = false;
      }
    }

    if (end === -1) return hasRoot ? '/' : '.';
    if (hasRoot && end === 1) return '//';
    return path.slice(0, end);
  },

  basename: function basename(path, ext) {
    if (ext !== undefined && typeof ext !== 'string') throw new TypeError('"ext" argument must be a string');
    assertPath(path);

    var start = 0;
    var end = -1;
    var matchedSlash = true;
    var i;

    if (ext !== undefined && ext.length > 0 && ext.length <= path.length) {
      if (ext.length === path.length && ext === path) return '';
      var extIdx = ext.length - 1;
      var firstNonSlashEnd = -1;
      for (i = path.length - 1; i >= 0; --i) {
        var code = path.charCodeAt(i);
        if (code === 47 /*/*/) {
            // If we reached a path separator that was not part of a set of path
            // separators at the end of the string, stop now
            if (!matchedSlash) {
              start = i + 1;
              break;
            }
          } else {
          if (firstNonSlashEnd === -1) {
            // We saw the first non-path separator, remember this index in case
            // we need it if the extension ends up not matching
            matchedSlash = false;
            firstNonSlashEnd = i + 1;
          }
          if (extIdx >= 0) {
            // Try to match the explicit extension
            if (code === ext.charCodeAt(extIdx)) {
              if (--extIdx === -1) {
                // We matched the extension, so mark this as the end of our path
                // component
                end = i;
              }
            } else {
              // Extension does not match, so our result is the entire path
              // component
              extIdx = -1;
              end = firstNonSlashEnd;
            }
          }
        }
      }

      if (start === end) end = firstNonSlashEnd;else if (end === -1) end = path.length;
      return path.slice(start, end);
    } else {
      for (i = path.length - 1; i >= 0; --i) {
        if (path.charCodeAt(i) === 47 /*/*/) {
            // If we reached a path separator that was not part of a set of path
            // separators at the end of the string, stop now
            if (!matchedSlash) {
              start = i + 1;
              break;
            }
          } else if (end === -1) {
          // We saw the first non-path separator, mark this as the end of our
          // path component
          matchedSlash = false;
          end = i + 1;
        }
      }

      if (end === -1) return '';
      return path.slice(start, end);
    }
  },

  extname: function extname(path) {
    assertPath(path);
    var startDot = -1;
    var startPart = 0;
    var end = -1;
    var matchedSlash = true;
    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find
    var preDotState = 0;
    for (var i = path.length - 1; i >= 0; --i) {
      var code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          // If we reached a path separator that was not part of a set of path
          // separators at the end of the string, stop now
          if (!matchedSlash) {
            startPart = i + 1;
            break;
          }
          continue;
        }
      if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // extension
        matchedSlash = false;
        end = i + 1;
      }
      if (code === 46 /*.*/) {
          // If this is our first dot, mark it as the start of our extension
          if (startDot === -1)
            startDot = i;
          else if (preDotState !== 1)
            preDotState = 1;
      } else if (startDot !== -1) {
        // We saw a non-dot and non-path separator before our dot, so we should
        // have a good chance at having a non-empty extension
        preDotState = -1;
      }
    }

    if (startDot === -1 || end === -1 ||
        // We saw a non-dot character immediately before the dot
        preDotState === 0 ||
        // The (right-most) trimmed path component is exactly '..'
        preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
      return '';
    }
    return path.slice(startDot, end);
  },

  format: function format(pathObject) {
    if (pathObject === null || typeof pathObject !== 'object') {
      throw new TypeError('The "pathObject" argument must be of type Object. Received type ' + typeof pathObject);
    }
    return _format('/', pathObject);
  },

  parse: function parse(path) {
    assertPath(path);

    var ret = { root: '', dir: '', base: '', ext: '', name: '' };
    if (path.length === 0) return ret;
    var code = path.charCodeAt(0);
    var isAbsolute = code === 47 /*/*/;
    var start;
    if (isAbsolute) {
      ret.root = '/';
      start = 1;
    } else {
      start = 0;
    }
    var startDot = -1;
    var startPart = 0;
    var end = -1;
    var matchedSlash = true;
    var i = path.length - 1;

    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find
    var preDotState = 0;

    // Get non-dir info
    for (; i >= start; --i) {
      code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          // If we reached a path separator that was not part of a set of path
          // separators at the end of the string, stop now
          if (!matchedSlash) {
            startPart = i + 1;
            break;
          }
          continue;
        }
      if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // extension
        matchedSlash = false;
        end = i + 1;
      }
      if (code === 46 /*.*/) {
          // If this is our first dot, mark it as the start of our extension
          if (startDot === -1) startDot = i;else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
        // We saw a non-dot and non-path separator before our dot, so we should
        // have a good chance at having a non-empty extension
        preDotState = -1;
      }
    }

    if (startDot === -1 || end === -1 ||
    // We saw a non-dot character immediately before the dot
    preDotState === 0 ||
    // The (right-most) trimmed path component is exactly '..'
    preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
      if (end !== -1) {
        if (startPart === 0 && isAbsolute) ret.base = ret.name = path.slice(1, end);else ret.base = ret.name = path.slice(startPart, end);
      }
    } else {
      if (startPart === 0 && isAbsolute) {
        ret.name = path.slice(1, startDot);
        ret.base = path.slice(1, end);
      } else {
        ret.name = path.slice(startPart, startDot);
        ret.base = path.slice(startPart, end);
      }
      ret.ext = path.slice(startDot, end);
    }

    if (startPart > 0) ret.dir = path.slice(0, startPart - 1);else if (isAbsolute) ret.dir = '/';

    return ret;
  },

  sep: '/',
  delimiter: ':',
  win32: null,
  posix: null
};

posix.posix = posix;

module.exports = posix;

}).call(this)}).call(this,require('_process'))
},{"_process":50}],50:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}]},{},[18])(18)
});
