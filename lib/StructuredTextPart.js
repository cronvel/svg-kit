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



function StructuredTextPart( params ) {
	this.text = params.text || '' ;

	this.color = params.color || '#000' ;

	/*
	// From my abandoned StructuredText code for BabylonJS

	underline?: boolean;
	lineThrough?: boolean;

	frame?: boolean;
	frameColor?: string;
	frameOutlineWidth?: number;
	frameOutlineColor?: string;
	frameCornerRadius?: number;

	fontFamily?: string;
	fontSize?: string;
	fontStyle?: string;
	fontWeight?: string;

	outlineWidth?: number;
	outlineColor?: string;

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

	// When set, call observers for a click event
	href?: any;

	// Force splitting this part into one part per character.
	// This is useful for special effects.
	splitIntoCharacters?: boolean;

	// Computed metrics
	metrics?: StructuredTextMetrics;

	// Userland data
	staticCustomData?: object;
	dynamicCustomData?: object;
	*/
}

module.exports = StructuredTextPart ;


