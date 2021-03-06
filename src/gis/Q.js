goog.provide('gis.Q');

/** Empty class just to hold bit twiddling methods.
  * @constructor */
gis.Q=function() {};

/** Decode signed integer, compressed into unsigned with least significant bit as sign.
  * Adapted from Sean Anderson's conditional negate bit twiddling hack.
  * In Out
  *  0  0
  *  1 -1
  *  2  1
  *  3 -2
  *  4  2
  * @param {number} x
  * @return {number}  */
gis.Q.toSigned=function(x) {
	return((x>>>1)^-(x&1));
}

/** Encode signed integer, compressing to unsigned with least significant bit as sign.
  * In Out
  * -2  3
  * -1  1
  *  0  0
  *  1  2
  *  2  4
  * @param {number} x
  * @return {number}  */
gis.Q.fromSigned=function(x) {
	return((x<<1)^-(x>>>31));
}

/** Fast fixed point sin, input [0,2pi[ scaled to [0,65536[ and output [-1,1] to [-65536,65536].
  * Adapted from "Fast and accurate sine/cosine" thread at devmaster.net by Nick.
  * This is 2x the speed of Math.sin and good enough for projecting global maps.
  * Output is continuous and exactly correct at min/max values and zeroes.
  * @param {number} x
  * @return {number}  */
gis.Q.sin16=function(x) {
	var m;

	// Truncate to 16 bits and sign extend.
	x=((x&65535)^32768)-32768;
	// Prepare mask for getting absolute value.
	m=x>>>16;
	// x-=abs(x)*x
	x-=((x+m^m)*x)>>15;
	// Prepare mask for getting absolute value.
	m=x>>>16;
	// x=abs(x)*x*0.225+x*0.775
	x=((((x+m^m)*x)>>13)*115+x*397)>>6;

	return(x);
}

/** Fast fixed point cos, input [0,2pi[ scaled to [0,65536[ and output [-1,1] to [-65536,65536].
  * @param {number} x
  * @return {number}  */
gis.Q.cos16=function(x) {
	return(gis.Q.sin16(x+16384));
}

/** @type {number} Square of a number that definitely fits in the 53-bit integer precision of JavaScript numbers. */
gis.Q.maxSqr=Math.pow(2,102);

/** Return arbitrary number with same sign as cross product a1*a2-b1*b2 (2x2 determinant).
  * Exact for at least 31-bit signed integer input. Note order of parameters.
  * @param {number} a1
  * @param {number} b1
  * @param {number} b2
  * @param {number} a2
  * @return {number} */
gis.Q.detSign64=function(a1,b1,b2,a2) {
	var a,b,d;

	// Try floating point first and return result if products are small enough (check the sum of their squares)
	// or their difference is large enough.
	// Multiplication results have 53 bits of accuracy while 64 may be needed, so after rounding error can be
	// +/- 2^10=1024 for each product and 2048 for their difference, if they don't fit in 53 bits.
	a=a1*a2;
	b=b1*b2;
	d=a-b;
	if(d*d>2048*2048 || a*a+b*b<gis.Q.maxSqr) return(d);

	// Calculate only lowest 15 bits of products, since higher ones were already found to be equal.
	// Signs of products match because they're over 50 bits while their difference is small, so no checks are needed.
	d=(a1&0x7fff)*(a2&0x7fff)-(b1&0x7fff)*(b2&0x7fff);

	// Product high bits can be pairs like 7fff and 0000, while real difference is small (such as +/- 1).
	// To fix this, take only 13 bits of the difference and sign extend.
	return(((d&0x1fff)^0x1000)-0x1000);
};
