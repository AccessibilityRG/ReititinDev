goog.provide('reach.trans.SimpleTrip');
goog.require('reach.route.Conf');

/** @constructor
  * @param {reach.trans.Line} line
  * @param {{line:reach.trans.Line,mode:number,longCode:?string,shortCode:?string,name:?string}=} key */
reach.trans.SimpleTrip=function(line,key) {
	/** @type {{line:reach.trans.Line,mode:number,longCode:?string,shortCode:?string,name:?string}} */
	this.key=key?key:{
		line:line,
		mode:0,
		longCode:null,
		shortCode:null,
		name:null
	};

	/** @type {number} Unit: minutes. */
	this.startTime;
	/** @type {number} */
	this.num;
};

/** @param {number} stopNum
  * @return {number} Minutes from midnight. */
reach.trans.SimpleTrip.prototype.guessArrival=function(stopNum) {
	var stopCount;
	var totalMeanDuration,totalVarianceSum;
	var correction,delta;
	var line;

	line=this.key.line;

	return(this.startTime+line.meanDuration[stopNum]);
};

/** @param {number} pos
  * @param {boolean} enter
  * @param {reach.route.Conf} conf
  * @return {number} */
reach.trans.SimpleTrip.prototype.getTransferCost=function(pos,enter,conf) {
	var transferCost;

	transferCost=0;

	if(enter) transferCost=conf.enterCost;
	else transferCost=conf.leaveCost;

	transferCost*=60*conf.timeDiv;
	transferCost=~~(transferCost+0.5);
	if(transferCost==0) transferCost=1;

	return(transferCost);
};

/** @param {reach.route.Conf} conf
  * @return {number} */
reach.trans.SimpleTrip.prototype.getTransitCost=function(conf) {
	return(conf.transitCost);
};

/** @param {boolean} enter
  * @param {reach.route.Conf} conf
  * @return {number} */
reach.trans.SimpleTrip.prototype.getTransferTime=function(enter,conf) {
	if(enter) return(conf.enterTime);
	else return(-conf.leaveTime);
};
