(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["chunk-vendors~ef4b7b69"],{

/***/ "18c0":
/***/ (function(module, exports, __webpack_require__) {


/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

var zrUtil = __webpack_require__("6d8b");

var Scale = __webpack_require__("e0d8");

var OrdinalMeta = __webpack_require__("8e43");

/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

/**
 * Linear continuous scale
 * @module echarts/coord/scale/Ordinal
 *
 * http://en.wikipedia.org/wiki/Level_of_measurement
 */
// FIXME only one data
var scaleProto = Scale.prototype;
var OrdinalScale = Scale.extend({
  type: 'ordinal',

  /**
   * @param {module:echarts/data/OrdianlMeta|Array.<string>} ordinalMeta
   */
  init: function (ordinalMeta, extent) {
    // Caution: Should not use instanceof, consider ec-extensions using
    // import approach to get OrdinalMeta class.
    if (!ordinalMeta || zrUtil.isArray(ordinalMeta)) {
      ordinalMeta = new OrdinalMeta({
        categories: ordinalMeta
      });
    }

    this._ordinalMeta = ordinalMeta;
    this._extent = extent || [0, ordinalMeta.categories.length - 1];
  },
  parse: function (val) {
    return typeof val === 'string' ? this._ordinalMeta.getOrdinal(val) // val might be float.
    : Math.round(val);
  },
  contain: function (rank) {
    rank = this.parse(rank);
    return scaleProto.contain.call(this, rank) && this._ordinalMeta.categories[rank] != null;
  },

  /**
   * Normalize given rank or name to linear [0, 1]
   * @param {number|string} [val]
   * @return {number}
   */
  normalize: function (val) {
    return scaleProto.normalize.call(this, this.parse(val));
  },
  scale: function (val) {
    return Math.round(scaleProto.scale.call(this, val));
  },

  /**
   * @return {Array}
   */
  getTicks: function () {
    var ticks = [];
    var extent = this._extent;
    var rank = extent[0];

    while (rank <= extent[1]) {
      ticks.push(rank);
      rank++;
    }

    return ticks;
  },

  /**
   * Get item on rank n
   * @param {number} n
   * @return {string}
   */
  getLabel: function (n) {
    if (!this.isBlank()) {
      // Note that if no data, ordinalMeta.categories is an empty array.
      return this._ordinalMeta.categories[n];
    }
  },

  /**
   * @return {number}
   */
  count: function () {
    return this._extent[1] - this._extent[0] + 1;
  },

  /**
   * @override
   */
  unionExtentFromData: function (data, dim) {
    this.unionExtent(data.getApproximateExtent(dim));
  },
  getOrdinalMeta: function () {
    return this._ordinalMeta;
  },
  niceTicks: zrUtil.noop,
  niceExtent: zrUtil.noop
});
/**
 * @return {module:echarts/scale/Time}
 */

OrdinalScale.create = function () {
  return new OrdinalScale();
};

var _default = OrdinalScale;
module.exports = _default;

/***/ }),

/***/ "1e32":
/***/ (function(module, exports, __webpack_require__) {


/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

var zrUtil = __webpack_require__("6d8b");

var _number = __webpack_require__("3842");

var parsePercent = _number.parsePercent;

var _dataStackHelper = __webpack_require__("ee1a");

var isDimensionStacked = _dataStackHelper.isDimensionStacked;

/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/
function getSeriesStackId(seriesModel) {
  return seriesModel.get('stack') || '__ec_stack_' + seriesModel.seriesIndex;
}

function getAxisKey(polar, axis) {
  return axis.dim + polar.model.componentIndex;
}
/**
 * @param {string} seriesType
 * @param {module:echarts/model/Global} ecModel
 * @param {module:echarts/ExtensionAPI} api
 */


function barLayoutPolar(seriesType, ecModel, api) {
  var lastStackCoords = {};
  var barWidthAndOffset = calRadialBar(zrUtil.filter(ecModel.getSeriesByType(seriesType), function (seriesModel) {
    return !ecModel.isSeriesFiltered(seriesModel) && seriesModel.coordinateSystem && seriesModel.coordinateSystem.type === 'polar';
  }));
  ecModel.eachSeriesByType(seriesType, function (seriesModel) {
    // Check series coordinate, do layout for polar only
    if (seriesModel.coordinateSystem.type !== 'polar') {
      return;
    }

    var data = seriesModel.getData();
    var polar = seriesModel.coordinateSystem;
    var baseAxis = polar.getBaseAxis();
    var axisKey = getAxisKey(polar, baseAxis);
    var stackId = getSeriesStackId(seriesModel);
    var columnLayoutInfo = barWidthAndOffset[axisKey][stackId];
    var columnOffset = columnLayoutInfo.offset;
    var columnWidth = columnLayoutInfo.width;
    var valueAxis = polar.getOtherAxis(baseAxis);
    var cx = seriesModel.coordinateSystem.cx;
    var cy = seriesModel.coordinateSystem.cy;
    var barMinHeight = seriesModel.get('barMinHeight') || 0;
    var barMinAngle = seriesModel.get('barMinAngle') || 0;
    lastStackCoords[stackId] = lastStackCoords[stackId] || [];
    var valueDim = data.mapDimension(valueAxis.dim);
    var baseDim = data.mapDimension(baseAxis.dim);
    var stacked = isDimensionStacked(data, valueDim
    /*, baseDim*/
    );
    var clampLayout = baseAxis.dim !== 'radius' || !seriesModel.get('roundCap', true);
    var valueAxisStart = valueAxis.getExtent()[0];

    for (var idx = 0, len = data.count(); idx < len; idx++) {
      var value = data.get(valueDim, idx);
      var baseValue = data.get(baseDim, idx);

      if (isNaN(value)) {
        continue;
      }

      var sign = value >= 0 ? 'p' : 'n';
      var baseCoord = valueAxisStart; // Because of the barMinHeight, we can not use the value in
      // stackResultDimension directly.
      // Only ordinal axis can be stacked.

      if (stacked) {
        if (!lastStackCoords[stackId][baseValue]) {
          lastStackCoords[stackId][baseValue] = {
            p: valueAxisStart,
            // Positive stack
            n: valueAxisStart // Negative stack

          };
        } // Should also consider #4243


        baseCoord = lastStackCoords[stackId][baseValue][sign];
      }

      var r0;
      var r;
      var startAngle;
      var endAngle; // radial sector

      if (valueAxis.dim === 'radius') {
        var radiusSpan = valueAxis.dataToRadius(value) - valueAxisStart;
        var angle = baseAxis.dataToAngle(baseValue);

        if (Math.abs(radiusSpan) < barMinHeight) {
          radiusSpan = (radiusSpan < 0 ? -1 : 1) * barMinHeight;
        }

        r0 = baseCoord;
        r = baseCoord + radiusSpan;
        startAngle = angle - columnOffset;
        endAngle = startAngle - columnWidth;
        stacked && (lastStackCoords[stackId][baseValue][sign] = r);
      } // tangential sector
      else {
          var angleSpan = valueAxis.dataToAngle(value, clampLayout) - valueAxisStart;
          var radius = baseAxis.dataToRadius(baseValue);

          if (Math.abs(angleSpan) < barMinAngle) {
            angleSpan = (angleSpan < 0 ? -1 : 1) * barMinAngle;
          }

          r0 = radius + columnOffset;
          r = r0 + columnWidth;
          startAngle = baseCoord;
          endAngle = baseCoord + angleSpan; // if the previous stack is at the end of the ring,
          // add a round to differentiate it from origin
          // var extent = angleAxis.getExtent();
          // var stackCoord = angle;
          // if (stackCoord === extent[0] && value > 0) {
          //     stackCoord = extent[1];
          // }
          // else if (stackCoord === extent[1] && value < 0) {
          //     stackCoord = extent[0];
          // }

          stacked && (lastStackCoords[stackId][baseValue][sign] = endAngle);
        }

      data.setItemLayout(idx, {
        cx: cx,
        cy: cy,
        r0: r0,
        r: r,
        // Consider that positive angle is anti-clockwise,
        // while positive radian of sector is clockwise
        startAngle: -startAngle * Math.PI / 180,
        endAngle: -endAngle * Math.PI / 180
      });
    }
  }, this);
}
/**
 * Calculate bar width and offset for radial bar charts
 */


function calRadialBar(barSeries, api) {
  // Columns info on each category axis. Key is polar name
  var columnsMap = {};
  zrUtil.each(barSeries, function (seriesModel, idx) {
    var data = seriesModel.getData();
    var polar = seriesModel.coordinateSystem;
    var baseAxis = polar.getBaseAxis();
    var axisKey = getAxisKey(polar, baseAxis);
    var axisExtent = baseAxis.getExtent();
    var bandWidth = baseAxis.type === 'category' ? baseAxis.getBandWidth() : Math.abs(axisExtent[1] - axisExtent[0]) / data.count();
    var columnsOnAxis = columnsMap[axisKey] || {
      bandWidth: bandWidth,
      remainedWidth: bandWidth,
      autoWidthCount: 0,
      categoryGap: '20%',
      gap: '30%',
      stacks: {}
    };
    var stacks = columnsOnAxis.stacks;
    columnsMap[axisKey] = columnsOnAxis;
    var stackId = getSeriesStackId(seriesModel);

    if (!stacks[stackId]) {
      columnsOnAxis.autoWidthCount++;
    }

    stacks[stackId] = stacks[stackId] || {
      width: 0,
      maxWidth: 0
    };
    var barWidth = parsePercent(seriesModel.get('barWidth'), bandWidth);
    var barMaxWidth = parsePercent(seriesModel.get('barMaxWidth'), bandWidth);
    var barGap = seriesModel.get('barGap');
    var barCategoryGap = seriesModel.get('barCategoryGap');

    if (barWidth && !stacks[stackId].width) {
      barWidth = Math.min(columnsOnAxis.remainedWidth, barWidth);
      stacks[stackId].width = barWidth;
      columnsOnAxis.remainedWidth -= barWidth;
    }

    barMaxWidth && (stacks[stackId].maxWidth = barMaxWidth);
    barGap != null && (columnsOnAxis.gap = barGap);
    barCategoryGap != null && (columnsOnAxis.categoryGap = barCategoryGap);
  });
  var result = {};
  zrUtil.each(columnsMap, function (columnsOnAxis, coordSysName) {
    result[coordSysName] = {};
    var stacks = columnsOnAxis.stacks;
    var bandWidth = columnsOnAxis.bandWidth;
    var categoryGap = parsePercent(columnsOnAxis.categoryGap, bandWidth);
    var barGapPercent = parsePercent(columnsOnAxis.gap, 1);
    var remainedWidth = columnsOnAxis.remainedWidth;
    var autoWidthCount = columnsOnAxis.autoWidthCount;
    var autoWidth = (remainedWidth - categoryGap) / (autoWidthCount + (autoWidthCount - 1) * barGapPercent);
    autoWidth = Math.max(autoWidth, 0); // Find if any auto calculated bar exceeded maxBarWidth

    zrUtil.each(stacks, function (column, stack) {
      var maxWidth = column.maxWidth;

      if (maxWidth && maxWidth < autoWidth) {
        maxWidth = Math.min(maxWidth, remainedWidth);

        if (column.width) {
          maxWidth = Math.min(maxWidth, column.width);
        }

        remainedWidth -= maxWidth;
        column.width = maxWidth;
        autoWidthCount--;
      }
    }); // Recalculate width again

    autoWidth = (remainedWidth - categoryGap) / (autoWidthCount + (autoWidthCount - 1) * barGapPercent);
    autoWidth = Math.max(autoWidth, 0);
    var widthSum = 0;
    var lastColumn;
    zrUtil.each(stacks, function (column, idx) {
      if (!column.width) {
        column.width = autoWidth;
      }

      lastColumn = column;
      widthSum += column.width * (1 + barGapPercent);
    });

    if (lastColumn) {
      widthSum -= lastColumn.width * barGapPercent;
    }

    var offset = -widthSum / 2;
    zrUtil.each(stacks, function (column, stackId) {
      result[coordSysName][stackId] = result[coordSysName][stackId] || {
        offset: offset,
        width: column.width
      };
      offset += column.width * (1 + barGapPercent);
    });
  });
  return result;
}

var _default = barLayoutPolar;
module.exports = _default;

/***/ }),

/***/ "216a":
/***/ (function(module, exports, __webpack_require__) {


/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

var zrUtil = __webpack_require__("6d8b");

var numberUtil = __webpack_require__("3842");

var formatUtil = __webpack_require__("eda2");

var scaleHelper = __webpack_require__("944e");

var IntervalScale = __webpack_require__("89e3");

/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

/*
* A third-party license is embeded for some of the code in this file:
* The "scaleLevels" was originally copied from "d3.js" with some
* modifications made for this project.
* (See more details in the comment on the definition of "scaleLevels" below.)
* The use of the source code of this file is also subject to the terms
* and consitions of the license of "d3.js" (BSD-3Clause, see
* </licenses/LICENSE-d3>).
*/
// [About UTC and local time zone]:
// In most cases, `number.parseDate` will treat input data string as local time
// (except time zone is specified in time string). And `format.formateTime` returns
// local time by default. option.useUTC is false by default. This design have
// concidered these common case:
// (1) Time that is persistent in server is in UTC, but it is needed to be diplayed
// in local time by default.
// (2) By default, the input data string (e.g., '2011-01-02') should be displayed
// as its original time, without any time difference.
var intervalScaleProto = IntervalScale.prototype;
var mathCeil = Math.ceil;
var mathFloor = Math.floor;
var ONE_SECOND = 1000;
var ONE_MINUTE = ONE_SECOND * 60;
var ONE_HOUR = ONE_MINUTE * 60;
var ONE_DAY = ONE_HOUR * 24; // FIXME 公用？

var bisect = function (a, x, lo, hi) {
  while (lo < hi) {
    var mid = lo + hi >>> 1;

    if (a[mid][1] < x) {
      lo = mid + 1;
    } else {
      hi = mid;
    }
  }

  return lo;
};
/**
 * @alias module:echarts/coord/scale/Time
 * @constructor
 */


var TimeScale = IntervalScale.extend({
  type: 'time',

  /**
   * @override
   */
  getLabel: function (val) {
    var stepLvl = this._stepLvl;
    var date = new Date(val);
    return formatUtil.formatTime(stepLvl[0], date, this.getSetting('useUTC'));
  },

  /**
   * @override
   */
  niceExtent: function (opt) {
    var extent = this._extent; // If extent start and end are same, expand them

    if (extent[0] === extent[1]) {
      // Expand extent
      extent[0] -= ONE_DAY;
      extent[1] += ONE_DAY;
    } // If there are no data and extent are [Infinity, -Infinity]


    if (extent[1] === -Infinity && extent[0] === Infinity) {
      var d = new Date();
      extent[1] = +new Date(d.getFullYear(), d.getMonth(), d.getDate());
      extent[0] = extent[1] - ONE_DAY;
    }

    this.niceTicks(opt.splitNumber, opt.minInterval, opt.maxInterval); // var extent = this._extent;

    var interval = this._interval;

    if (!opt.fixMin) {
      extent[0] = numberUtil.round(mathFloor(extent[0] / interval) * interval);
    }

    if (!opt.fixMax) {
      extent[1] = numberUtil.round(mathCeil(extent[1] / interval) * interval);
    }
  },

  /**
   * @override
   */
  niceTicks: function (approxTickNum, minInterval, maxInterval) {
    approxTickNum = approxTickNum || 10;
    var extent = this._extent;
    var span = extent[1] - extent[0];
    var approxInterval = span / approxTickNum;

    if (minInterval != null && approxInterval < minInterval) {
      approxInterval = minInterval;
    }

    if (maxInterval != null && approxInterval > maxInterval) {
      approxInterval = maxInterval;
    }

    var scaleLevelsLen = scaleLevels.length;
    var idx = bisect(scaleLevels, approxInterval, 0, scaleLevelsLen);
    var level = scaleLevels[Math.min(idx, scaleLevelsLen - 1)];
    var interval = level[1]; // Same with interval scale if span is much larger than 1 year

    if (level[0] === 'year') {
      var yearSpan = span / interval; // From "Nice Numbers for Graph Labels" of Graphic Gems
      // var niceYearSpan = numberUtil.nice(yearSpan, false);

      var yearStep = numberUtil.nice(yearSpan / approxTickNum, true);
      interval *= yearStep;
    }

    var timezoneOffset = this.getSetting('useUTC') ? 0 : new Date(+extent[0] || +extent[1]).getTimezoneOffset() * 60 * 1000;
    var niceExtent = [Math.round(mathCeil((extent[0] - timezoneOffset) / interval) * interval + timezoneOffset), Math.round(mathFloor((extent[1] - timezoneOffset) / interval) * interval + timezoneOffset)];
    scaleHelper.fixExtent(niceExtent, extent);
    this._stepLvl = level; // Interval will be used in getTicks

    this._interval = interval;
    this._niceExtent = niceExtent;
  },
  parse: function (val) {
    // val might be float.
    return +numberUtil.parseDate(val);
  }
});
zrUtil.each(['contain', 'normalize'], function (methodName) {
  TimeScale.prototype[methodName] = function (val) {
    return intervalScaleProto[methodName].call(this, this.parse(val));
  };
});
/**
 * This implementation was originally copied from "d3.js"
 * <https://github.com/d3/d3/blob/b516d77fb8566b576088e73410437494717ada26/src/time/scale.js>
 * with some modifications made for this program.
 * See the license statement at the head of this file.
 */

var scaleLevels = [// Format              interval
['hh:mm:ss', ONE_SECOND], // 1s
['hh:mm:ss', ONE_SECOND * 5], // 5s
['hh:mm:ss', ONE_SECOND * 10], // 10s
['hh:mm:ss', ONE_SECOND * 15], // 15s
['hh:mm:ss', ONE_SECOND * 30], // 30s
['hh:mm\nMM-dd', ONE_MINUTE], // 1m
['hh:mm\nMM-dd', ONE_MINUTE * 5], // 5m
['hh:mm\nMM-dd', ONE_MINUTE * 10], // 10m
['hh:mm\nMM-dd', ONE_MINUTE * 15], // 15m
['hh:mm\nMM-dd', ONE_MINUTE * 30], // 30m
['hh:mm\nMM-dd', ONE_HOUR], // 1h
['hh:mm\nMM-dd', ONE_HOUR * 2], // 2h
['hh:mm\nMM-dd', ONE_HOUR * 6], // 6h
['hh:mm\nMM-dd', ONE_HOUR * 12], // 12h
['MM-dd\nyyyy', ONE_DAY], // 1d
['MM-dd\nyyyy', ONE_DAY * 2], // 2d
['MM-dd\nyyyy', ONE_DAY * 3], // 3d
['MM-dd\nyyyy', ONE_DAY * 4], // 4d
['MM-dd\nyyyy', ONE_DAY * 5], // 5d
['MM-dd\nyyyy', ONE_DAY * 6], // 6d
['week', ONE_DAY * 7], // 7d
['MM-dd\nyyyy', ONE_DAY * 10], // 10d
['week', ONE_DAY * 14], // 2w
['week', ONE_DAY * 21], // 3w
['month', ONE_DAY * 31], // 1M
['week', ONE_DAY * 42], // 6w
['month', ONE_DAY * 62], // 2M
['week', ONE_DAY * 70], // 10w
['quarter', ONE_DAY * 95], // 3M
['month', ONE_DAY * 31 * 4], // 4M
['month', ONE_DAY * 31 * 5], // 5M
['half-year', ONE_DAY * 380 / 2], // 6M
['month', ONE_DAY * 31 * 8], // 8M
['month', ONE_DAY * 31 * 10], // 10M
['year', ONE_DAY * 380] // 1Y
];
/**
 * @param {module:echarts/model/Model}
 * @return {module:echarts/scale/Time}
 */

TimeScale.create = function (model) {
  return new TimeScale({
    useUTC: model.ecModel.get('useUTC')
  });
};

var _default = TimeScale;
module.exports = _default;

/***/ }),

/***/ "2306":
/***/ (function(module, exports, __webpack_require__) {


/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

var zrUtil = __webpack_require__("6d8b");

var pathTool = __webpack_require__("342d");

var colorTool = __webpack_require__("41ef");

var matrix = __webpack_require__("1687");

var vector = __webpack_require__("401b");

var Path = __webpack_require__("cbe5");

var Transformable = __webpack_require__("0cde");

var ZImage = __webpack_require__("0da8");

exports.Image = ZImage;

var Group = __webpack_require__("e1fc");

exports.Group = Group;

var Text = __webpack_require__("76a5");

exports.Text = Text;

var Circle = __webpack_require__("d9fc");

exports.Circle = Circle;

var Sector = __webpack_require__("4aa2");

exports.Sector = Sector;

var Ring = __webpack_require__("4573");

exports.Ring = Ring;

var Polygon = __webpack_require__("87b1");

exports.Polygon = Polygon;

var Polyline = __webpack_require__("d498");

exports.Polyline = Polyline;

var Rect = __webpack_require__("c7a2");

exports.Rect = Rect;

var Line = __webpack_require__("cb11");

exports.Line = Line;

var BezierCurve = __webpack_require__("ac0f");

exports.BezierCurve = BezierCurve;

var Arc = __webpack_require__("8d32");

exports.Arc = Arc;

var CompoundPath = __webpack_require__("d4c6");

exports.CompoundPath = CompoundPath;

var LinearGradient = __webpack_require__("48a9");

exports.LinearGradient = LinearGradient;

var RadialGradient = __webpack_require__("dded");

exports.RadialGradient = RadialGradient;

var BoundingRect = __webpack_require__("9850");

exports.BoundingRect = BoundingRect;

var IncrementalDisplayable = __webpack_require__("392f");

exports.IncrementalDisplayable = IncrementalDisplayable;

var subPixelOptimizeUtil = __webpack_require__("9cf9");

/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/
var mathMax = Math.max;
var mathMin = Math.min;
var EMPTY_OBJ = {};
var Z2_EMPHASIS_LIFT = 1; // key: label model property nane, value: style property name.

var CACHED_LABEL_STYLE_PROPERTIES = {
  color: 'textFill',
  textBorderColor: 'textStroke',
  textBorderWidth: 'textStrokeWidth'
};
var EMPHASIS = 'emphasis';
var NORMAL = 'normal'; // Reserve 0 as default.

var _highlightNextDigit = 1;
var _highlightKeyMap = {};
var _customShapeMap = {};
/**
 * Extend shape with parameters
 */

function extendShape(opts) {
  return Path.extend(opts);
}
/**
 * Extend path
 */


function extendPath(pathData, opts) {
  return pathTool.extendFromString(pathData, opts);
}
/**
 * Register a user defined shape.
 * The shape class can be fetched by `getShapeClass`
 * This method will overwrite the registered shapes, including
 * the registered built-in shapes, if using the same `name`.
 * The shape can be used in `custom series` and
 * `graphic component` by declaring `{type: name}`.
 *
 * @param {string} name
 * @param {Object} ShapeClass Can be generated by `extendShape`.
 */


function registerShape(name, ShapeClass) {
  _customShapeMap[name] = ShapeClass;
}
/**
 * Find shape class registered by `registerShape`. Usually used in
 * fetching user defined shape.
 *
 * [Caution]:
 * (1) This method **MUST NOT be used inside echarts !!!**, unless it is prepared
 * to use user registered shapes.
 * Because the built-in shape (see `getBuiltInShape`) will be registered by
 * `registerShape` by default. That enables users to get both built-in
 * shapes as well as the shapes belonging to themsleves. But users can overwrite
 * the built-in shapes by using names like 'circle', 'rect' via calling
 * `registerShape`. So the echarts inner featrues should not fetch shapes from here
 * in case that it is overwritten by users, except that some features, like
 * `custom series`, `graphic component`, do it deliberately.
 *
 * (2) In the features like `custom series`, `graphic component`, the user input
 * `{tpye: 'xxx'}` does not only specify shapes but also specify other graphic
 * elements like `'group'`, `'text'`, `'image'` or event `'path'`. Those names
 * are reserved names, that is, if some user register a shape named `'image'`,
 * the shape will not be used. If we intending to add some more reserved names
 * in feature, that might bring break changes (disable some existing user shape
 * names). But that case probably rearly happen. So we dont make more mechanism
 * to resolve this issue here.
 *
 * @param {string} name
 * @return {Object} The shape class. If not found, return nothing.
 */


function getShapeClass(name) {
  if (_customShapeMap.hasOwnProperty(name)) {
    return _customShapeMap[name];
  }
}
/**
 * Create a path element from path data string
 * @param {string} pathData
 * @param {Object} opts
 * @param {module:zrender/core/BoundingRect} rect
 * @param {string} [layout=cover] 'center' or 'cover'
 */


function makePath(pathData, opts, rect, layout) {
  var path = pathTool.createFromString(pathData, opts);

  if (rect) {
    if (layout === 'center') {
      rect = centerGraphic(rect, path.getBoundingRect());
    }

    resizePath(path, rect);
  }

  return path;
}
/**
 * Create a image element from image url
 * @param {string} imageUrl image url
 * @param {Object} opts options
 * @param {module:zrender/core/BoundingRect} rect constrain rect
 * @param {string} [layout=cover] 'center' or 'cover'
 */


function makeImage(imageUrl, rect, layout) {
  var path = new ZImage({
    style: {
      image: imageUrl,
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height
    },
    onload: function (img) {
      if (layout === 'center') {
        var boundingRect = {
          width: img.width,
          height: img.height
        };
        path.setStyle(centerGraphic(rect, boundingRect));
      }
    }
  });
  return path;
}
/**
 * Get position of centered element in bounding box.
 *
 * @param  {Object} rect         element local bounding box
 * @param  {Object} boundingRect constraint bounding box
 * @return {Object} element position containing x, y, width, and height
 */


function centerGraphic(rect, boundingRect) {
  // Set rect to center, keep width / height ratio.
  var aspect = boundingRect.width / boundingRect.height;
  var width = rect.height * aspect;
  var height;

  if (width <= rect.width) {
    height = rect.height;
  } else {
    width = rect.width;
    height = width / aspect;
  }

  var cx = rect.x + rect.width / 2;
  var cy = rect.y + rect.height / 2;
  return {
    x: cx - width / 2,
    y: cy - height / 2,
    width: width,
    height: height
  };
}

var mergePath = pathTool.mergePath;
/**
 * Resize a path to fit the rect
 * @param {module:zrender/graphic/Path} path
 * @param {Object} rect
 */

function resizePath(path, rect) {
  if (!path.applyTransform) {
    return;
  }

  var pathRect = path.getBoundingRect();
  var m = pathRect.calculateTransform(rect);
  path.applyTransform(m);
}
/**
 * Sub pixel optimize line for canvas
 *
 * @param {Object} param
 * @param {Object} [param.shape]
 * @param {number} [param.shape.x1]
 * @param {number} [param.shape.y1]
 * @param {number} [param.shape.x2]
 * @param {number} [param.shape.y2]
 * @param {Object} [param.style]
 * @param {number} [param.style.lineWidth]
 * @return {Object} Modified param
 */


function subPixelOptimizeLine(param) {
  subPixelOptimizeUtil.subPixelOptimizeLine(param.shape, param.shape, param.style);
  return param;
}
/**
 * Sub pixel optimize rect for canvas
 *
 * @param {Object} param
 * @param {Object} [param.shape]
 * @param {number} [param.shape.x]
 * @param {number} [param.shape.y]
 * @param {number} [param.shape.width]
 * @param {number} [param.shape.height]
 * @param {Object} [param.style]
 * @param {number} [param.style.lineWidth]
 * @return {Object} Modified param
 */


function subPixelOptimizeRect(param) {
  subPixelOptimizeUtil.subPixelOptimizeRect(param.shape, param.shape, param.style);
  return param;
}
/**
 * Sub pixel optimize for canvas
 *
 * @param {number} position Coordinate, such as x, y
 * @param {number} lineWidth Should be nonnegative integer.
 * @param {boolean=} positiveOrNegative Default false (negative).
 * @return {number} Optimized position.
 */


var subPixelOptimize = subPixelOptimizeUtil.subPixelOptimize;

function hasFillOrStroke(fillOrStroke) {
  return fillOrStroke != null && fillOrStroke !== 'none';
} // Most lifted color are duplicated.


var liftedColorMap = zrUtil.createHashMap();
var liftedColorCount = 0;

function liftColor(color) {
  if (typeof color !== 'string') {
    return color;
  }

  var liftedColor = liftedColorMap.get(color);

  if (!liftedColor) {
    liftedColor = colorTool.lift(color, -0.1);

    if (liftedColorCount < 10000) {
      liftedColorMap.set(color, liftedColor);
      liftedColorCount++;
    }
  }

  return liftedColor;
}

function cacheElementStl(el) {
  if (!el.__hoverStlDirty) {
    return;
  }

  el.__hoverStlDirty = false;
  var hoverStyle = el.__hoverStl;

  if (!hoverStyle) {
    el.__cachedNormalStl = el.__cachedNormalZ2 = null;
    return;
  }

  var normalStyle = el.__cachedNormalStl = {};
  el.__cachedNormalZ2 = el.z2;
  var elStyle = el.style;

  for (var name in hoverStyle) {
    // See comment in `singleEnterEmphasis`.
    if (hoverStyle[name] != null) {
      normalStyle[name] = elStyle[name];
    }
  } // Always cache fill and stroke to normalStyle for lifting color.


  normalStyle.fill = elStyle.fill;
  normalStyle.stroke = elStyle.stroke;
}

function singleEnterEmphasis(el) {
  var hoverStl = el.__hoverStl;

  if (!hoverStl || el.__highlighted) {
    return;
  }

  var zr = el.__zr;
  var useHoverLayer = el.useHoverLayer && zr && zr.painter.type === 'canvas';
  el.__highlighted = useHoverLayer ? 'layer' : 'plain';

  if (el.isGroup || !zr && el.useHoverLayer) {
    return;
  }

  var elTarget = el;
  var targetStyle = el.style;

  if (useHoverLayer) {
    elTarget = zr.addHover(el);
    targetStyle = elTarget.style;
  }

  rollbackDefaultTextStyle(targetStyle);

  if (!useHoverLayer) {
    cacheElementStl(elTarget);
  } // styles can be:
  // {
  //    label: {
  //        show: false,
  //        position: 'outside',
  //        fontSize: 18
  //    },
  //    emphasis: {
  //        label: {
  //            show: true
  //        }
  //    }
  // },
  // where properties of `emphasis` may not appear in `normal`. We previously use
  // module:echarts/util/model#defaultEmphasis to merge `normal` to `emphasis`.
  // But consider rich text and setOption in merge mode, it is impossible to cover
  // all properties in merge. So we use merge mode when setting style here.
  // But we choose the merge strategy that only properties that is not `null/undefined`.
  // Because when making a textStyle (espacially rich text), it is not easy to distinguish
  // `hasOwnProperty` and `null/undefined` in code, so we trade them as the same for simplicity.
  // But this strategy brings a trouble that `null/undefined` can not be used to remove
  // style any more in `emphasis`. Users can both set properties directly on normal and
  // emphasis to avoid this issue, or we might support `'none'` for this case if required.


  targetStyle.extendFrom(hoverStl);
  setDefaultHoverFillStroke(targetStyle, hoverStl, 'fill');
  setDefaultHoverFillStroke(targetStyle, hoverStl, 'stroke');
  applyDefaultTextStyle(targetStyle);

  if (!useHoverLayer) {
    el.dirty(false);
    el.z2 += Z2_EMPHASIS_LIFT;
  }
}

function setDefaultHoverFillStroke(targetStyle, hoverStyle, prop) {
  if (!hasFillOrStroke(hoverStyle[prop]) && hasFillOrStroke(targetStyle[prop])) {
    targetStyle[prop] = liftColor(targetStyle[prop]);
  }
}

function singleEnterNormal(el) {
  var highlighted = el.__highlighted;

  if (!highlighted) {
    return;
  }

  el.__highlighted = false;

  if (el.isGroup) {
    return;
  }

  if (highlighted === 'layer') {
    el.__zr && el.__zr.removeHover(el);
  } else {
    var style = el.style;
    var normalStl = el.__cachedNormalStl;

    if (normalStl) {
      rollbackDefaultTextStyle(style);
      el.setStyle(normalStl);
      applyDefaultTextStyle(style);
    } // `__cachedNormalZ2` will not be reset if calling `setElementHoverStyle`
    // when `el` is on emphasis state. So here by comparing with 1, we try
    // hard to make the bug case rare.


    var normalZ2 = el.__cachedNormalZ2;

    if (normalZ2 != null && el.z2 - normalZ2 === Z2_EMPHASIS_LIFT) {
      el.z2 = normalZ2;
    }
  }
}

function traverseUpdate(el, updater, commonParam) {
  // If root is group, also enter updater for `highDownOnUpdate`.
  var fromState = NORMAL;
  var toState = NORMAL;
  var trigger; // See the rule of `highDownOnUpdate` on `graphic.setAsHighDownDispatcher`.

  el.__highlighted && (fromState = EMPHASIS, trigger = true);
  updater(el, commonParam);
  el.__highlighted && (toState = EMPHASIS, trigger = true);
  el.isGroup && el.traverse(function (child) {
    !child.isGroup && updater(child, commonParam);
  });
  trigger && el.__highDownOnUpdate && el.__highDownOnUpdate(fromState, toState);
}
/**
 * Set hover style (namely "emphasis style") of element, based on the current
 * style of the given `el`.
 * This method should be called after all of the normal styles have been adopted
 * to the `el`. See the reason on `setHoverStyle`.
 *
 * @param {module:zrender/Element} el Should not be `zrender/container/Group`.
 * @param {Object} [el.hoverStyle] Can be set on el or its descendants,
 *        e.g., `el.hoverStyle = ...; graphic.setHoverStyle(el); `.
 *        Often used when item group has a label element and it's hoverStyle is different.
 * @param {Object|boolean} [hoverStl] The specified hover style.
 *        If set as `false`, disable the hover style.
 *        Similarly, The `el.hoverStyle` can alse be set
 *        as `false` to disable the hover style.
 *        Otherwise, use the default hover style if not provided.
 */


function setElementHoverStyle(el, hoverStl) {
  // For performance consideration, it might be better to make the "hover style" only the
  // difference properties from the "normal style", but not a entire copy of all styles.
  hoverStl = el.__hoverStl = hoverStl !== false && (el.hoverStyle || hoverStl || {});
  el.__hoverStlDirty = true; // FIXME
  // It is not completely right to save "normal"/"emphasis" flag on elements.
  // It probably should be saved on `data` of series. Consider the cases:
  // (1) A highlighted elements are moved out of the view port and re-enter
  // again by dataZoom.
  // (2) call `setOption` and replace elements totally when they are highlighted.

  if (el.__highlighted) {
    // Consider the case:
    // The styles of a highlighted `el` is being updated. The new "emphasis style"
    // should be adapted to the `el`. Notice here new "normal styles" should have
    // been set outside and the cached "normal style" is out of date.
    el.__cachedNormalStl = null; // Do not clear `__cachedNormalZ2` here, because setting `z2` is not a constraint
    // of this method. In most cases, `z2` is not set and hover style should be able
    // to rollback. Of course, that would bring bug, but only in a rare case, see
    // `doSingleLeaveHover` for details.

    singleEnterNormal(el);
    singleEnterEmphasis(el);
  }
}

function onElementMouseOver(e) {
  !shouldSilent(this, e) // "emphasis" event highlight has higher priority than mouse highlight.
  && !this.__highByOuter && traverseUpdate(this, singleEnterEmphasis);
}

function onElementMouseOut(e) {
  !shouldSilent(this, e) // "emphasis" event highlight has higher priority than mouse highlight.
  && !this.__highByOuter && traverseUpdate(this, singleEnterNormal);
}

function onElementEmphasisEvent(highlightDigit) {
  this.__highByOuter |= 1 << (highlightDigit || 0);
  traverseUpdate(this, singleEnterEmphasis);
}

function onElementNormalEvent(highlightDigit) {
  !(this.__highByOuter &= ~(1 << (highlightDigit || 0))) && traverseUpdate(this, singleEnterNormal);
}

function shouldSilent(el, e) {
  return el.__highDownSilentOnTouch && e.zrByTouch;
}
/**
 * Set hover style (namely "emphasis style") of element,
 * based on the current style of the given `el`.
 *
 * (1)
 * **CONSTRAINTS** for this method:
 * <A> This method MUST be called after all of the normal styles having been adopted
 * to the `el`.
 * <B> The input `hoverStyle` (that is, "emphasis style") MUST be the subset of the
 * "normal style" having been set to the el.
 * <C> `color` MUST be one of the "normal styles" (because color might be lifted as
 * a default hover style).
 *
 * The reason: this method treat the current style of the `el` as the "normal style"
 * and cache them when enter/update the "emphasis style". Consider the case: the `el`
 * is in "emphasis" state and `setOption`/`dispatchAction` trigger the style updating
 * logic, where the el should shift from the original emphasis style to the new
 * "emphasis style" and should be able to "downplay" back to the new "normal style".
 *
 * Indeed, it is error-prone to make a interface has so many constraints, but I have
 * not found a better solution yet to fit the backward compatibility, performance and
 * the current programming style.
 *
 * (2)
 * Call the method for a "root" element once. Do not call it for each descendants.
 * If the descendants elemenets of a group has itself hover style different from the
 * root group, we can simply mount the style on `el.hoverStyle` for them, but should
 * not call this method for them.
 *
 * (3) These input parameters can be set directly on `el`:
 *
 * @param {module:zrender/Element} el
 * @param {Object} [el.hoverStyle] See `graphic.setElementHoverStyle`.
 * @param {boolean} [el.highDownSilentOnTouch=false] See `graphic.setAsHighDownDispatcher`.
 * @param {Function} [el.highDownOnUpdate] See `graphic.setAsHighDownDispatcher`.
 * @param {Object|boolean} [hoverStyle] See `graphic.setElementHoverStyle`.
 */


function setHoverStyle(el, hoverStyle) {
  setAsHighDownDispatcher(el, true);
  traverseUpdate(el, setElementHoverStyle, hoverStyle);
}
/**
 * @param {module:zrender/Element} el
 * @param {Function} [el.highDownOnUpdate] Called when state updated.
 *        Since `setHoverStyle` has the constraint that it must be called after
 *        all of the normal style updated, `highDownOnUpdate` is not needed to
 *        trigger if both `fromState` and `toState` is 'normal', and needed to
 *        trigger if both `fromState` and `toState` is 'emphasis', which enables
 *        to sync outside style settings to "emphasis" state.
 *        @this {string} This dispatcher `el`.
 *        @param {string} fromState Can be "normal" or "emphasis".
 *               `fromState` might equal to `toState`,
 *               for example, when this method is called when `el` is
 *               on "emphasis" state.
 *        @param {string} toState Can be "normal" or "emphasis".
 *
 *        FIXME
 *        CAUTION: Do not expose `highDownOnUpdate` outside echarts.
 *        Because it is not a complete solution. The update
 *        listener should not have been mount in element,
 *        and the normal/emphasis state should not have
 *        mantained on elements.
 *
 * @param {boolean} [el.highDownSilentOnTouch=false]
 *        In touch device, mouseover event will be trigger on touchstart event
 *        (see module:zrender/dom/HandlerProxy). By this mechanism, we can
 *        conveniently use hoverStyle when tap on touch screen without additional
 *        code for compatibility.
 *        But if the chart/component has select feature, which usually also use
 *        hoverStyle, there might be conflict between 'select-highlight' and
 *        'hover-highlight' especially when roam is enabled (see geo for example).
 *        In this case, `highDownSilentOnTouch` should be used to disable
 *        hover-highlight on touch device.
 * @param {boolean} [asDispatcher=true] If `false`, do not set as "highDownDispatcher".
 */


function setAsHighDownDispatcher(el, asDispatcher) {
  var disable = asDispatcher === false; // Make `highDownSilentOnTouch` and `highDownOnUpdate` only work after
  // `setAsHighDownDispatcher` called. Avoid it is modified by user unexpectedly.

  el.__highDownSilentOnTouch = el.highDownSilentOnTouch;
  el.__highDownOnUpdate = el.highDownOnUpdate; // Simple optimize, since this method might be
  // called for each elements of a group in some cases.

  if (!disable || el.__highDownDispatcher) {
    var method = disable ? 'off' : 'on'; // Duplicated function will be auto-ignored, see Eventful.js.

    el[method]('mouseover', onElementMouseOver)[method]('mouseout', onElementMouseOut); // Emphasis, normal can be triggered manually by API or other components like hover link.

    el[method]('emphasis', onElementEmphasisEvent)[method]('normal', onElementNormalEvent); // Also keep previous record.

    el.__highByOuter = el.__highByOuter || 0;
    el.__highDownDispatcher = !disable;
  }
}
/**
 * @param {module:zrender/src/Element} el
 * @return {boolean}
 */


function isHighDownDispatcher(el) {
  return !!(el && el.__highDownDispatcher);
}
/**
 * Support hightlight/downplay record on each elements.
 * For the case: hover highlight/downplay (legend, visualMap, ...) and
 * user triggerred hightlight/downplay should not conflict.
 * Only all of the highlightDigit cleared, return to normal.
 * @param {string} highlightKey
 * @return {number} highlightDigit
 */


function getHighlightDigit(highlightKey) {
  var highlightDigit = _highlightKeyMap[highlightKey];

  if (highlightDigit == null && _highlightNextDigit <= 32) {
    highlightDigit = _highlightKeyMap[highlightKey] = _highlightNextDigit++;
  }

  return highlightDigit;
}
/**
 * See more info in `setTextStyleCommon`.
 * @param {Object|module:zrender/graphic/Style} normalStyle
 * @param {Object} emphasisStyle
 * @param {module:echarts/model/Model} normalModel
 * @param {module:echarts/model/Model} emphasisModel
 * @param {Object} opt Check `opt` of `setTextStyleCommon` to find other props.
 * @param {string|Function} [opt.defaultText]
 * @param {module:echarts/model/Model} [opt.labelFetcher] Fetch text by
 *      `opt.labelFetcher.getFormattedLabel(opt.labelDataIndex, 'normal'/'emphasis', null, opt.labelDimIndex)`
 * @param {module:echarts/model/Model} [opt.labelDataIndex] Fetch text by
 *      `opt.textFetcher.getFormattedLabel(opt.labelDataIndex, 'normal'/'emphasis', null, opt.labelDimIndex)`
 * @param {module:echarts/model/Model} [opt.labelDimIndex] Fetch text by
 *      `opt.textFetcher.getFormattedLabel(opt.labelDataIndex, 'normal'/'emphasis', null, opt.labelDimIndex)`
 * @param {Object} [normalSpecified]
 * @param {Object} [emphasisSpecified]
 */


function setLabelStyle(normalStyle, emphasisStyle, normalModel, emphasisModel, opt, normalSpecified, emphasisSpecified) {
  opt = opt || EMPTY_OBJ;
  var labelFetcher = opt.labelFetcher;
  var labelDataIndex = opt.labelDataIndex;
  var labelDimIndex = opt.labelDimIndex; // This scenario, `label.normal.show = true; label.emphasis.show = false`,
  // is not supported util someone requests.

  var showNormal = normalModel.getShallow('show');
  var showEmphasis = emphasisModel.getShallow('show'); // Consider performance, only fetch label when necessary.
  // If `normal.show` is `false` and `emphasis.show` is `true` and `emphasis.formatter` is not set,
  // label should be displayed, where text is fetched by `normal.formatter` or `opt.defaultText`.

  var baseText;

  if (showNormal || showEmphasis) {
    if (labelFetcher) {
      baseText = labelFetcher.getFormattedLabel(labelDataIndex, 'normal', null, labelDimIndex);
    }

    if (baseText == null) {
      baseText = zrUtil.isFunction(opt.defaultText) ? opt.defaultText(labelDataIndex, opt) : opt.defaultText;
    }
  }

  var normalStyleText = showNormal ? baseText : null;
  var emphasisStyleText = showEmphasis ? zrUtil.retrieve2(labelFetcher ? labelFetcher.getFormattedLabel(labelDataIndex, 'emphasis', null, labelDimIndex) : null, baseText) : null; // Optimize: If style.text is null, text will not be drawn.

  if (normalStyleText != null || emphasisStyleText != null) {
    // Always set `textStyle` even if `normalStyle.text` is null, because default
    // values have to be set on `normalStyle`.
    // If we set default values on `emphasisStyle`, consider case:
    // Firstly, `setOption(... label: {normal: {text: null}, emphasis: {show: true}} ...);`
    // Secondly, `setOption(... label: {noraml: {show: true, text: 'abc', color: 'red'} ...);`
    // Then the 'red' will not work on emphasis.
    setTextStyle(normalStyle, normalModel, normalSpecified, opt);
    setTextStyle(emphasisStyle, emphasisModel, emphasisSpecified, opt, true);
  }

  normalStyle.text = normalStyleText;
  emphasisStyle.text = emphasisStyleText;
}
/**
 * Modify label style manually.
 * Only works after `setLabelStyle` and `setElementHoverStyle` called.
 *
 * @param {module:zrender/src/Element} el
 * @param {Object} [normalStyleProps] optional
 * @param {Object} [emphasisStyleProps] optional
 */


function modifyLabelStyle(el, normalStyleProps, emphasisStyleProps) {
  var elStyle = el.style;

  if (normalStyleProps) {
    rollbackDefaultTextStyle(elStyle);
    el.setStyle(normalStyleProps);
    applyDefaultTextStyle(elStyle);
  }

  elStyle = el.__hoverStl;

  if (emphasisStyleProps && elStyle) {
    rollbackDefaultTextStyle(elStyle);
    zrUtil.extend(elStyle, emphasisStyleProps);
    applyDefaultTextStyle(elStyle);
  }
}
/**
 * Set basic textStyle properties.
 * See more info in `setTextStyleCommon`.
 * @param {Object|module:zrender/graphic/Style} textStyle
 * @param {module:echarts/model/Model} model
 * @param {Object} [specifiedTextStyle] Can be overrided by settings in model.
 * @param {Object} [opt] See `opt` of `setTextStyleCommon`.
 * @param {boolean} [isEmphasis]
 */


function setTextStyle(textStyle, textStyleModel, specifiedTextStyle, opt, isEmphasis) {
  setTextStyleCommon(textStyle, textStyleModel, opt, isEmphasis);
  specifiedTextStyle && zrUtil.extend(textStyle, specifiedTextStyle); // textStyle.host && textStyle.host.dirty && textStyle.host.dirty(false);

  return textStyle;
}
/**
 * Set text option in the style.
 * See more info in `setTextStyleCommon`.
 * @deprecated
 * @param {Object} textStyle
 * @param {module:echarts/model/Model} labelModel
 * @param {string|boolean} defaultColor Default text color.
 *        If set as false, it will be processed as a emphasis style.
 */


function setText(textStyle, labelModel, defaultColor) {
  var opt = {
    isRectText: true
  };
  var isEmphasis;

  if (defaultColor === false) {
    isEmphasis = true;
  } else {
    // Support setting color as 'auto' to get visual color.
    opt.autoColor = defaultColor;
  }

  setTextStyleCommon(textStyle, labelModel, opt, isEmphasis); // textStyle.host && textStyle.host.dirty && textStyle.host.dirty(false);
}
/**
 * The uniform entry of set text style, that is, retrieve style definitions
 * from `model` and set to `textStyle` object.
 *
 * Never in merge mode, but in overwrite mode, that is, all of the text style
 * properties will be set. (Consider the states of normal and emphasis and
 * default value can be adopted, merge would make the logic too complicated
 * to manage.)
 *
 * The `textStyle` object can either be a plain object or an instance of
 * `zrender/src/graphic/Style`, and either be the style of normal or emphasis.
 * After this mothod called, the `textStyle` object can then be used in
 * `el.setStyle(textStyle)` or `el.hoverStyle = textStyle`.
 *
 * Default value will be adopted and `insideRollbackOpt` will be created.
 * See `applyDefaultTextStyle` `rollbackDefaultTextStyle` for more details.
 *
 * opt: {
 *      disableBox: boolean, Whether diable drawing box of block (outer most).
 *      isRectText: boolean,
 *      autoColor: string, specify a color when color is 'auto',
 *              for textFill, textStroke, textBackgroundColor, and textBorderColor.
 *              If autoColor specified, it is used as default textFill.
 *      useInsideStyle:
 *              `true`: Use inside style (textFill, textStroke, textStrokeWidth)
 *                  if `textFill` is not specified.
 *              `false`: Do not use inside style.
 *              `null/undefined`: use inside style if `isRectText` is true and
 *                  `textFill` is not specified and textPosition contains `'inside'`.
 *      forceRich: boolean
 * }
 */


function setTextStyleCommon(textStyle, textStyleModel, opt, isEmphasis) {
  // Consider there will be abnormal when merge hover style to normal style if given default value.
  opt = opt || EMPTY_OBJ;

  if (opt.isRectText) {
    var textPosition;

    if (opt.getTextPosition) {
      textPosition = opt.getTextPosition(textStyleModel, isEmphasis);
    } else {
      textPosition = textStyleModel.getShallow('position') || (isEmphasis ? null : 'inside'); // 'outside' is not a valid zr textPostion value, but used
      // in bar series, and magric type should be considered.

      textPosition === 'outside' && (textPosition = 'top');
    }

    textStyle.textPosition = textPosition;
    textStyle.textOffset = textStyleModel.getShallow('offset');
    var labelRotate = textStyleModel.getShallow('rotate');
    labelRotate != null && (labelRotate *= Math.PI / 180);
    textStyle.textRotation = labelRotate;
    textStyle.textDistance = zrUtil.retrieve2(textStyleModel.getShallow('distance'), isEmphasis ? null : 5);
  }

  var ecModel = textStyleModel.ecModel;
  var globalTextStyle = ecModel && ecModel.option.textStyle; // Consider case:
  // {
  //     data: [{
  //         value: 12,
  //         label: {
  //             rich: {
  //                 // no 'a' here but using parent 'a'.
  //             }
  //         }
  //     }],
  //     rich: {
  //         a: { ... }
  //     }
  // }

  var richItemNames = getRichItemNames(textStyleModel);
  var richResult;

  if (richItemNames) {
    richResult = {};

    for (var name in richItemNames) {
      if (richItemNames.hasOwnProperty(name)) {
        // Cascade is supported in rich.
        var richTextStyle = textStyleModel.getModel(['rich', name]); // In rich, never `disableBox`.
        // FIXME: consider `label: {formatter: '{a|xx}', color: 'blue', rich: {a: {}}}`,
        // the default color `'blue'` will not be adopted if no color declared in `rich`.
        // That might confuses users. So probably we should put `textStyleModel` as the
        // root ancestor of the `richTextStyle`. But that would be a break change.

        setTokenTextStyle(richResult[name] = {}, richTextStyle, globalTextStyle, opt, isEmphasis);
      }
    }
  }

  textStyle.rich = richResult;
  setTokenTextStyle(textStyle, textStyleModel, globalTextStyle, opt, isEmphasis, true);

  if (opt.forceRich && !opt.textStyle) {
    opt.textStyle = {};
  }

  return textStyle;
} // Consider case:
// {
//     data: [{
//         value: 12,
//         label: {
//             rich: {
//                 // no 'a' here but using parent 'a'.
//             }
//         }
//     }],
//     rich: {
//         a: { ... }
//     }
// }


function getRichItemNames(textStyleModel) {
  // Use object to remove duplicated names.
  var richItemNameMap;

  while (textStyleModel && textStyleModel !== textStyleModel.ecModel) {
    var rich = (textStyleModel.option || EMPTY_OBJ).rich;

    if (rich) {
      richItemNameMap = richItemNameMap || {};

      for (var name in rich) {
        if (rich.hasOwnProperty(name)) {
          richItemNameMap[name] = 1;
        }
      }
    }

    textStyleModel = textStyleModel.parentModel;
  }

  return richItemNameMap;
}

function setTokenTextStyle(textStyle, textStyleModel, globalTextStyle, opt, isEmphasis, isBlock) {
  // In merge mode, default value should not be given.
  globalTextStyle = !isEmphasis && globalTextStyle || EMPTY_OBJ;
  textStyle.textFill = getAutoColor(textStyleModel.getShallow('color'), opt) || globalTextStyle.color;
  textStyle.textStroke = getAutoColor(textStyleModel.getShallow('textBorderColor'), opt) || globalTextStyle.textBorderColor;
  textStyle.textStrokeWidth = zrUtil.retrieve2(textStyleModel.getShallow('textBorderWidth'), globalTextStyle.textBorderWidth);

  if (!isEmphasis) {
    if (isBlock) {
      textStyle.insideRollbackOpt = opt;
      applyDefaultTextStyle(textStyle);
    } // Set default finally.


    if (textStyle.textFill == null) {
      textStyle.textFill = opt.autoColor;
    }
  } // Do not use `getFont` here, because merge should be supported, where
  // part of these properties may be changed in emphasis style, and the
  // others should remain their original value got from normal style.


  textStyle.fontStyle = textStyleModel.getShallow('fontStyle') || globalTextStyle.fontStyle;
  textStyle.fontWeight = textStyleModel.getShallow('fontWeight') || globalTextStyle.fontWeight;
  textStyle.fontSize = textStyleModel.getShallow('fontSize') || globalTextStyle.fontSize;
  textStyle.fontFamily = textStyleModel.getShallow('fontFamily') || globalTextStyle.fontFamily;
  textStyle.textAlign = textStyleModel.getShallow('align');
  textStyle.textVerticalAlign = textStyleModel.getShallow('verticalAlign') || textStyleModel.getShallow('baseline');
  textStyle.textLineHeight = textStyleModel.getShallow('lineHeight');
  textStyle.textWidth = textStyleModel.getShallow('width');
  textStyle.textHeight = textStyleModel.getShallow('height');
  textStyle.textTag = textStyleModel.getShallow('tag');

  if (!isBlock || !opt.disableBox) {
    textStyle.textBackgroundColor = getAutoColor(textStyleModel.getShallow('backgroundColor'), opt);
    textStyle.textPadding = textStyleModel.getShallow('padding');
    textStyle.textBorderColor = getAutoColor(textStyleModel.getShallow('borderColor'), opt);
    textStyle.textBorderWidth = textStyleModel.getShallow('borderWidth');
    textStyle.textBorderRadius = textStyleModel.getShallow('borderRadius');
    textStyle.textBoxShadowColor = textStyleModel.getShallow('shadowColor');
    textStyle.textBoxShadowBlur = textStyleModel.getShallow('shadowBlur');
    textStyle.textBoxShadowOffsetX = textStyleModel.getShallow('shadowOffsetX');
    textStyle.textBoxShadowOffsetY = textStyleModel.getShallow('shadowOffsetY');
  }

  textStyle.textShadowColor = textStyleModel.getShallow('textShadowColor') || globalTextStyle.textShadowColor;
  textStyle.textShadowBlur = textStyleModel.getShallow('textShadowBlur') || globalTextStyle.textShadowBlur;
  textStyle.textShadowOffsetX = textStyleModel.getShallow('textShadowOffsetX') || globalTextStyle.textShadowOffsetX;
  textStyle.textShadowOffsetY = textStyleModel.getShallow('textShadowOffsetY') || globalTextStyle.textShadowOffsetY;
}

function getAutoColor(color, opt) {
  return color !== 'auto' ? color : opt && opt.autoColor ? opt.autoColor : null;
}
/**
 * Give some default value to the input `textStyle` object, based on the current settings
 * in this `textStyle` object.
 *
 * The Scenario:
 * when text position is `inside` and `textFill` is not specified, we show
 * text border by default for better view. But it should be considered that text position
 * might be changed when hovering or being emphasis, where the `insideRollback` is used to
 * restore the style.
 *
 * Usage (& NOTICE):
 * When a style object (eithor plain object or instance of `zrender/src/graphic/Style`) is
 * about to be modified on its text related properties, `rollbackDefaultTextStyle` should
 * be called before the modification and `applyDefaultTextStyle` should be called after that.
 * (For the case that all of the text related properties is reset, like `setTextStyleCommon`
 * does, `rollbackDefaultTextStyle` is not needed to be called).
 */


function applyDefaultTextStyle(textStyle) {
  var textPosition = textStyle.textPosition;
  var opt = textStyle.insideRollbackOpt;
  var insideRollback;

  if (opt && textStyle.textFill == null) {
    var autoColor = opt.autoColor;
    var isRectText = opt.isRectText;
    var useInsideStyle = opt.useInsideStyle;
    var useInsideStyleCache = useInsideStyle !== false && (useInsideStyle === true || isRectText && textPosition // textPosition can be [10, 30]
    && typeof textPosition === 'string' && textPosition.indexOf('inside') >= 0);
    var useAutoColorCache = !useInsideStyleCache && autoColor != null; // All of the props declared in `CACHED_LABEL_STYLE_PROPERTIES` are to be cached.

    if (useInsideStyleCache || useAutoColorCache) {
      insideRollback = {
        textFill: textStyle.textFill,
        textStroke: textStyle.textStroke,
        textStrokeWidth: textStyle.textStrokeWidth
      };
    }

    if (useInsideStyleCache) {
      textStyle.textFill = '#fff'; // Consider text with #fff overflow its container.

      if (textStyle.textStroke == null) {
        textStyle.textStroke = autoColor;
        textStyle.textStrokeWidth == null && (textStyle.textStrokeWidth = 2);
      }
    }

    if (useAutoColorCache) {
      textStyle.textFill = autoColor;
    }
  } // Always set `insideRollback`, so that the previous one can be cleared.


  textStyle.insideRollback = insideRollback;
}
/**
 * Consider the case: in a scatter,
 * label: {
 *     normal: {position: 'inside'},
 *     emphasis: {position: 'top'}
 * }
 * In the normal state, the `textFill` will be set as '#fff' for pretty view (see
 * `applyDefaultTextStyle`), but when switching to emphasis state, the `textFill`
 * should be retured to 'autoColor', but not keep '#fff'.
 */


function rollbackDefaultTextStyle(style) {
  var insideRollback = style.insideRollback;

  if (insideRollback) {
    // Reset all of the props in `CACHED_LABEL_STYLE_PROPERTIES`.
    style.textFill = insideRollback.textFill;
    style.textStroke = insideRollback.textStroke;
    style.textStrokeWidth = insideRollback.textStrokeWidth;
    style.insideRollback = null;
  }
}

function getFont(opt, ecModel) {
  var gTextStyleModel = ecModel && ecModel.getModel('textStyle');
  return zrUtil.trim([// FIXME in node-canvas fontWeight is before fontStyle
  opt.fontStyle || gTextStyleModel && gTextStyleModel.getShallow('fontStyle') || '', opt.fontWeight || gTextStyleModel && gTextStyleModel.getShallow('fontWeight') || '', (opt.fontSize || gTextStyleModel && gTextStyleModel.getShallow('fontSize') || 12) + 'px', opt.fontFamily || gTextStyleModel && gTextStyleModel.getShallow('fontFamily') || 'sans-serif'].join(' '));
}

function animateOrSetProps(isUpdate, el, props, animatableModel, dataIndex, cb) {
  if (typeof dataIndex === 'function') {
    cb = dataIndex;
    dataIndex = null;
  } // Do not check 'animation' property directly here. Consider this case:
  // animation model is an `itemModel`, whose does not have `isAnimationEnabled`
  // but its parent model (`seriesModel`) does.


  var animationEnabled = animatableModel && animatableModel.isAnimationEnabled();

  if (animationEnabled) {
    var postfix = isUpdate ? 'Update' : '';
    var duration = animatableModel.getShallow('animationDuration' + postfix);
    var animationEasing = animatableModel.getShallow('animationEasing' + postfix);
    var animationDelay = animatableModel.getShallow('animationDelay' + postfix);

    if (typeof animationDelay === 'function') {
      animationDelay = animationDelay(dataIndex, animatableModel.getAnimationDelayParams ? animatableModel.getAnimationDelayParams(el, dataIndex) : null);
    }

    if (typeof duration === 'function') {
      duration = duration(dataIndex);
    }

    duration > 0 ? el.animateTo(props, duration, animationDelay || 0, animationEasing, cb, !!cb) : (el.stopAnimation(), el.attr(props), cb && cb());
  } else {
    el.stopAnimation();
    el.attr(props);
    cb && cb();
  }
}
/**
 * Update graphic element properties with or without animation according to the
 * configuration in series.
 *
 * Caution: this method will stop previous animation.
 * So if do not use this method to one element twice before
 * animation starts, unless you know what you are doing.
 *
 * @param {module:zrender/Element} el
 * @param {Object} props
 * @param {module:echarts/model/Model} [animatableModel]
 * @param {number} [dataIndex]
 * @param {Function} [cb]
 * @example
 *     graphic.updateProps(el, {
 *         position: [100, 100]
 *     }, seriesModel, dataIndex, function () { console.log('Animation done!'); });
 *     // Or
 *     graphic.updateProps(el, {
 *         position: [100, 100]
 *     }, seriesModel, function () { console.log('Animation done!'); });
 */


function updateProps(el, props, animatableModel, dataIndex, cb) {
  animateOrSetProps(true, el, props, animatableModel, dataIndex, cb);
}
/**
 * Init graphic element properties with or without animation according to the
 * configuration in series.
 *
 * Caution: this method will stop previous animation.
 * So if do not use this method to one element twice before
 * animation starts, unless you know what you are doing.
 *
 * @param {module:zrender/Element} el
 * @param {Object} props
 * @param {module:echarts/model/Model} [animatableModel]
 * @param {number} [dataIndex]
 * @param {Function} cb
 */


function initProps(el, props, animatableModel, dataIndex, cb) {
  animateOrSetProps(false, el, props, animatableModel, dataIndex, cb);
}
/**
 * Get transform matrix of target (param target),
 * in coordinate of its ancestor (param ancestor)
 *
 * @param {module:zrender/mixin/Transformable} target
 * @param {module:zrender/mixin/Transformable} [ancestor]
 */


function getTransform(target, ancestor) {
  var mat = matrix.identity([]);

  while (target && target !== ancestor) {
    matrix.mul(mat, target.getLocalTransform(), mat);
    target = target.parent;
  }

  return mat;
}
/**
 * Apply transform to an vertex.
 * @param {Array.<number>} target [x, y]
 * @param {Array.<number>|TypedArray.<number>|Object} transform Can be:
 *      + Transform matrix: like [1, 0, 0, 1, 0, 0]
 *      + {position, rotation, scale}, the same as `zrender/Transformable`.
 * @param {boolean=} invert Whether use invert matrix.
 * @return {Array.<number>} [x, y]
 */


function applyTransform(target, transform, invert) {
  if (transform && !zrUtil.isArrayLike(transform)) {
    transform = Transformable.getLocalTransform(transform);
  }

  if (invert) {
    transform = matrix.invert([], transform);
  }

  return vector.applyTransform([], target, transform);
}
/**
 * @param {string} direction 'left' 'right' 'top' 'bottom'
 * @param {Array.<number>} transform Transform matrix: like [1, 0, 0, 1, 0, 0]
 * @param {boolean=} invert Whether use invert matrix.
 * @return {string} Transformed direction. 'left' 'right' 'top' 'bottom'
 */


function transformDirection(direction, transform, invert) {
  // Pick a base, ensure that transform result will not be (0, 0).
  var hBase = transform[4] === 0 || transform[5] === 0 || transform[0] === 0 ? 1 : Math.abs(2 * transform[4] / transform[0]);
  var vBase = transform[4] === 0 || transform[5] === 0 || transform[2] === 0 ? 1 : Math.abs(2 * transform[4] / transform[2]);
  var vertex = [direction === 'left' ? -hBase : direction === 'right' ? hBase : 0, direction === 'top' ? -vBase : direction === 'bottom' ? vBase : 0];
  vertex = applyTransform(vertex, transform, invert);
  return Math.abs(vertex[0]) > Math.abs(vertex[1]) ? vertex[0] > 0 ? 'right' : 'left' : vertex[1] > 0 ? 'bottom' : 'top';
}
/**
 * Apply group transition animation from g1 to g2.
 * If no animatableModel, no animation.
 */


function groupTransition(g1, g2, animatableModel, cb) {
  if (!g1 || !g2) {
    return;
  }

  function getElMap(g) {
    var elMap = {};
    g.traverse(function (el) {
      if (!el.isGroup && el.anid) {
        elMap[el.anid] = el;
      }
    });
    return elMap;
  }

  function getAnimatableProps(el) {
    var obj = {
      position: vector.clone(el.position),
      rotation: el.rotation
    };

    if (el.shape) {
      obj.shape = zrUtil.extend({}, el.shape);
    }

    return obj;
  }

  var elMap1 = getElMap(g1);
  g2.traverse(function (el) {
    if (!el.isGroup && el.anid) {
      var oldEl = elMap1[el.anid];

      if (oldEl) {
        var newProp = getAnimatableProps(el);
        el.attr(getAnimatableProps(oldEl));
        updateProps(el, newProp, animatableModel, el.dataIndex);
      } // else {
      //     if (el.previousProps) {
      //         graphic.updateProps
      //     }
      // }

    }
  });
}
/**
 * @param {Array.<Array.<number>>} points Like: [[23, 44], [53, 66], ...]
 * @param {Object} rect {x, y, width, height}
 * @return {Array.<Array.<number>>} A new clipped points.
 */


function clipPointsByRect(points, rect) {
  // FIXME: this way migth be incorrect when grpahic clipped by a corner.
  // and when element have border.
  return zrUtil.map(points, function (point) {
    var x = point[0];
    x = mathMax(x, rect.x);
    x = mathMin(x, rect.x + rect.width);
    var y = point[1];
    y = mathMax(y, rect.y);
    y = mathMin(y, rect.y + rect.height);
    return [x, y];
  });
}
/**
 * @param {Object} targetRect {x, y, width, height}
 * @param {Object} rect {x, y, width, height}
 * @return {Object} A new clipped rect. If rect size are negative, return undefined.
 */


function clipRectByRect(targetRect, rect) {
  var x = mathMax(targetRect.x, rect.x);
  var x2 = mathMin(targetRect.x + targetRect.width, rect.x + rect.width);
  var y = mathMax(targetRect.y, rect.y);
  var y2 = mathMin(targetRect.y + targetRect.height, rect.y + rect.height); // If the total rect is cliped, nothing, including the border,
  // should be painted. So return undefined.

  if (x2 >= x && y2 >= y) {
    return {
      x: x,
      y: y,
      width: x2 - x,
      height: y2 - y
    };
  }
}
/**
 * @param {string} iconStr Support 'image://' or 'path://' or direct svg path.
 * @param {Object} [opt] Properties of `module:zrender/Element`, except `style`.
 * @param {Object} [rect] {x, y, width, height}
 * @return {module:zrender/Element} Icon path or image element.
 */


function createIcon(iconStr, opt, rect) {
  opt = zrUtil.extend({
    rectHover: true
  }, opt);
  var style = opt.style = {
    strokeNoScale: true
  };
  rect = rect || {
    x: -1,
    y: -1,
    width: 2,
    height: 2
  };

  if (iconStr) {
    return iconStr.indexOf('image://') === 0 ? (style.image = iconStr.slice(8), zrUtil.defaults(style, rect), new ZImage(opt)) : makePath(iconStr.replace('path://', ''), opt, rect, 'center');
  }
}
/**
 * Return `true` if the given line (line `a`) and the given polygon
 * are intersect.
 * Note that we do not count colinear as intersect here because no
 * requirement for that. We could do that if required in future.
 *
 * @param {number} a1x
 * @param {number} a1y
 * @param {number} a2x
 * @param {number} a2y
 * @param {Array.<Array.<number>>} points Points of the polygon.
 * @return {boolean}
 */


function linePolygonIntersect(a1x, a1y, a2x, a2y, points) {
  for (var i = 0, p2 = points[points.length - 1]; i < points.length; i++) {
    var p = points[i];

    if (lineLineIntersect(a1x, a1y, a2x, a2y, p[0], p[1], p2[0], p2[1])) {
      return true;
    }

    p2 = p;
  }
}
/**
 * Return `true` if the given two lines (line `a` and line `b`)
 * are intersect.
 * Note that we do not count colinear as intersect here because no
 * requirement for that. We could do that if required in future.
 *
 * @param {number} a1x
 * @param {number} a1y
 * @param {number} a2x
 * @param {number} a2y
 * @param {number} b1x
 * @param {number} b1y
 * @param {number} b2x
 * @param {number} b2y
 * @return {boolean}
 */


function lineLineIntersect(a1x, a1y, a2x, a2y, b1x, b1y, b2x, b2y) {
  // let `vec_m` to be `vec_a2 - vec_a1` and `vec_n` to be `vec_b2 - vec_b1`.
  var mx = a2x - a1x;
  var my = a2y - a1y;
  var nx = b2x - b1x;
  var ny = b2y - b1y; // `vec_m` and `vec_n` are parallel iff
  //     exising `k` such that `vec_m = k · vec_n`, equivalent to `vec_m X vec_n = 0`.

  var nmCrossProduct = crossProduct2d(nx, ny, mx, my);

  if (nearZero(nmCrossProduct)) {
    return false;
  } // `vec_m` and `vec_n` are intersect iff
  //     existing `p` and `q` in [0, 1] such that `vec_a1 + p * vec_m = vec_b1 + q * vec_n`,
  //     such that `q = ((vec_a1 - vec_b1) X vec_m) / (vec_n X vec_m)`
  //           and `p = ((vec_a1 - vec_b1) X vec_n) / (vec_n X vec_m)`.


  var b1a1x = a1x - b1x;
  var b1a1y = a1y - b1y;
  var q = crossProduct2d(b1a1x, b1a1y, mx, my) / nmCrossProduct;

  if (q < 0 || q > 1) {
    return false;
  }

  var p = crossProduct2d(b1a1x, b1a1y, nx, ny) / nmCrossProduct;

  if (p < 0 || p > 1) {
    return false;
  }

  return true;
}
/**
 * Cross product of 2-dimension vector.
 */


function crossProduct2d(x1, y1, x2, y2) {
  return x1 * y2 - x2 * y1;
}

function nearZero(val) {
  return val <= 1e-6 && val >= -1e-6;
} // Register built-in shapes. These shapes might be overwirtten
// by users, although we do not recommend that.


registerShape('circle', Circle);
registerShape('sector', Sector);
registerShape('ring', Ring);
registerShape('polygon', Polygon);
registerShape('polyline', Polyline);
registerShape('rect', Rect);
registerShape('line', Line);
registerShape('bezierCurve', BezierCurve);
registerShape('arc', Arc);
exports.Z2_EMPHASIS_LIFT = Z2_EMPHASIS_LIFT;
exports.CACHED_LABEL_STYLE_PROPERTIES = CACHED_LABEL_STYLE_PROPERTIES;
exports.extendShape = extendShape;
exports.extendPath = extendPath;
exports.registerShape = registerShape;
exports.getShapeClass = getShapeClass;
exports.makePath = makePath;
exports.makeImage = makeImage;
exports.mergePath = mergePath;
exports.resizePath = resizePath;
exports.subPixelOptimizeLine = subPixelOptimizeLine;
exports.subPixelOptimizeRect = subPixelOptimizeRect;
exports.subPixelOptimize = subPixelOptimize;
exports.setElementHoverStyle = setElementHoverStyle;
exports.setHoverStyle = setHoverStyle;
exports.setAsHighDownDispatcher = setAsHighDownDispatcher;
exports.isHighDownDispatcher = isHighDownDispatcher;
exports.getHighlightDigit = getHighlightDigit;
exports.setLabelStyle = setLabelStyle;
exports.modifyLabelStyle = modifyLabelStyle;
exports.setTextStyle = setTextStyle;
exports.setText = setText;
exports.getFont = getFont;
exports.updateProps = updateProps;
exports.initProps = initProps;
exports.getTransform = getTransform;
exports.applyTransform = applyTransform;
exports.transformDirection = transformDirection;
exports.groupTransition = groupTransition;
exports.clipPointsByRect = clipPointsByRect;
exports.clipRectByRect = clipRectByRect;
exports.createIcon = createIcon;
exports.linePolygonIntersect = linePolygonIntersect;
exports.lineLineIntersect = lineLineIntersect;

/***/ }),

/***/ "26e1":
/***/ (function(module, exports, __webpack_require__) {


/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

var zrUtil = __webpack_require__("6d8b");

var modelUtil = __webpack_require__("e0d3");

/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/
var each = zrUtil.each;
var isObject = zrUtil.isObject;
var POSSIBLE_STYLES = ['areaStyle', 'lineStyle', 'nodeStyle', 'linkStyle', 'chordStyle', 'label', 'labelLine'];

function compatEC2ItemStyle(opt) {
  var itemStyleOpt = opt && opt.itemStyle;

  if (!itemStyleOpt) {
    return;
  }

  for (var i = 0, len = POSSIBLE_STYLES.length; i < len; i++) {
    var styleName = POSSIBLE_STYLES[i];
    var normalItemStyleOpt = itemStyleOpt.normal;
    var emphasisItemStyleOpt = itemStyleOpt.emphasis;

    if (normalItemStyleOpt && normalItemStyleOpt[styleName]) {
      opt[styleName] = opt[styleName] || {};

      if (!opt[styleName].normal) {
        opt[styleName].normal = normalItemStyleOpt[styleName];
      } else {
        zrUtil.merge(opt[styleName].normal, normalItemStyleOpt[styleName]);
      }

      normalItemStyleOpt[styleName] = null;
    }

    if (emphasisItemStyleOpt && emphasisItemStyleOpt[styleName]) {
      opt[styleName] = opt[styleName] || {};

      if (!opt[styleName].emphasis) {
        opt[styleName].emphasis = emphasisItemStyleOpt[styleName];
      } else {
        zrUtil.merge(opt[styleName].emphasis, emphasisItemStyleOpt[styleName]);
      }

      emphasisItemStyleOpt[styleName] = null;
    }
  }
}

function convertNormalEmphasis(opt, optType, useExtend) {
  if (opt && opt[optType] && (opt[optType].normal || opt[optType].emphasis)) {
    var normalOpt = opt[optType].normal;
    var emphasisOpt = opt[optType].emphasis;

    if (normalOpt) {
      // Timeline controlStyle has other properties besides normal and emphasis
      if (useExtend) {
        opt[optType].normal = opt[optType].emphasis = null;
        zrUtil.defaults(opt[optType], normalOpt);
      } else {
        opt[optType] = normalOpt;
      }
    }

    if (emphasisOpt) {
      opt.emphasis = opt.emphasis || {};
      opt.emphasis[optType] = emphasisOpt;
    }
  }
}

function removeEC3NormalStatus(opt) {
  convertNormalEmphasis(opt, 'itemStyle');
  convertNormalEmphasis(opt, 'lineStyle');
  convertNormalEmphasis(opt, 'areaStyle');
  convertNormalEmphasis(opt, 'label');
  convertNormalEmphasis(opt, 'labelLine'); // treemap

  convertNormalEmphasis(opt, 'upperLabel'); // graph

  convertNormalEmphasis(opt, 'edgeLabel');
}

function compatTextStyle(opt, propName) {
  // Check whether is not object (string\null\undefined ...)
  var labelOptSingle = isObject(opt) && opt[propName];
  var textStyle = isObject(labelOptSingle) && labelOptSingle.textStyle;

  if (textStyle) {
    for (var i = 0, len = modelUtil.TEXT_STYLE_OPTIONS.length; i < len; i++) {
      var propName = modelUtil.TEXT_STYLE_OPTIONS[i];

      if (textStyle.hasOwnProperty(propName)) {
        labelOptSingle[propName] = textStyle[propName];
      }
    }
  }
}

function compatEC3CommonStyles(opt) {
  if (opt) {
    removeEC3NormalStatus(opt);
    compatTextStyle(opt, 'label');
    opt.emphasis && compatTextStyle(opt.emphasis, 'label');
  }
}

function processSeries(seriesOpt) {
  if (!isObject(seriesOpt)) {
    return;
  }

  compatEC2ItemStyle(seriesOpt);
  removeEC3NormalStatus(seriesOpt);
  compatTextStyle(seriesOpt, 'label'); // treemap

  compatTextStyle(seriesOpt, 'upperLabel'); // graph

  compatTextStyle(seriesOpt, 'edgeLabel');

  if (seriesOpt.emphasis) {
    compatTextStyle(seriesOpt.emphasis, 'label'); // treemap

    compatTextStyle(seriesOpt.emphasis, 'upperLabel'); // graph

    compatTextStyle(seriesOpt.emphasis, 'edgeLabel');
  }

  var markPoint = seriesOpt.markPoint;

  if (markPoint) {
    compatEC2ItemStyle(markPoint);
    compatEC3CommonStyles(markPoint);
  }

  var markLine = seriesOpt.markLine;

  if (markLine) {
    compatEC2ItemStyle(markLine);
    compatEC3CommonStyles(markLine);
  }

  var markArea = seriesOpt.markArea;

  if (markArea) {
    compatEC3CommonStyles(markArea);
  }

  var data = seriesOpt.data; // Break with ec3: if `setOption` again, there may be no `type` in option,
  // then the backward compat based on option type will not be performed.

  if (seriesOpt.type === 'graph') {
    data = data || seriesOpt.nodes;
    var edgeData = seriesOpt.links || seriesOpt.edges;

    if (edgeData && !zrUtil.isTypedArray(edgeData)) {
      for (var i = 0; i < edgeData.length; i++) {
        compatEC3CommonStyles(edgeData[i]);
      }
    }

    zrUtil.each(seriesOpt.categories, function (opt) {
      removeEC3NormalStatus(opt);
    });
  }

  if (data && !zrUtil.isTypedArray(data)) {
    for (var i = 0; i < data.length; i++) {
      compatEC3CommonStyles(data[i]);
    }
  } // mark point data


  var markPoint = seriesOpt.markPoint;

  if (markPoint && markPoint.data) {
    var mpData = markPoint.data;

    for (var i = 0; i < mpData.length; i++) {
      compatEC3CommonStyles(mpData[i]);
    }
  } // mark line data


  var markLine = seriesOpt.markLine;

  if (markLine && markLine.data) {
    var mlData = markLine.data;

    for (var i = 0; i < mlData.length; i++) {
      if (zrUtil.isArray(mlData[i])) {
        compatEC3CommonStyles(mlData[i][0]);
        compatEC3CommonStyles(mlData[i][1]);
      } else {
        compatEC3CommonStyles(mlData[i]);
      }
    }
  } // Series


  if (seriesOpt.type === 'gauge') {
    compatTextStyle(seriesOpt, 'axisLabel');
    compatTextStyle(seriesOpt, 'title');
    compatTextStyle(seriesOpt, 'detail');
  } else if (seriesOpt.type === 'treemap') {
    convertNormalEmphasis(seriesOpt.breadcrumb, 'itemStyle');
    zrUtil.each(seriesOpt.levels, function (opt) {
      removeEC3NormalStatus(opt);
    });
  } else if (seriesOpt.type === 'tree') {
    removeEC3NormalStatus(seriesOpt.leaves);
  } // sunburst starts from ec4, so it does not need to compat levels.

}

function toArr(o) {
  return zrUtil.isArray(o) ? o : o ? [o] : [];
}

function toObj(o) {
  return (zrUtil.isArray(o) ? o[0] : o) || {};
}

function _default(option, isTheme) {
  each(toArr(option.series), function (seriesOpt) {
    isObject(seriesOpt) && processSeries(seriesOpt);
  });
  var axes = ['xAxis', 'yAxis', 'radiusAxis', 'angleAxis', 'singleAxis', 'parallelAxis', 'radar'];
  isTheme && axes.push('valueAxis', 'categoryAxis', 'logAxis', 'timeAxis');
  each(axes, function (axisName) {
    each(toArr(option[axisName]), function (axisOpt) {
      if (axisOpt) {
        compatTextStyle(axisOpt, 'axisLabel');
        compatTextStyle(axisOpt.axisPointer, 'label');
      }
    });
  });
  each(toArr(option.parallel), function (parallelOpt) {
    var parallelAxisDefault = parallelOpt && parallelOpt.parallelAxisDefault;
    compatTextStyle(parallelAxisDefault, 'axisLabel');
    compatTextStyle(parallelAxisDefault && parallelAxisDefault.axisPointer, 'label');
  });
  each(toArr(option.calendar), function (calendarOpt) {
    convertNormalEmphasis(calendarOpt, 'itemStyle');
    compatTextStyle(calendarOpt, 'dayLabel');
    compatTextStyle(calendarOpt, 'monthLabel');
    compatTextStyle(calendarOpt, 'yearLabel');
  }); // radar.name.textStyle

  each(toArr(option.radar), function (radarOpt) {
    compatTextStyle(radarOpt, 'name');
  });
  each(toArr(option.geo), function (geoOpt) {
    if (isObject(geoOpt)) {
      compatEC3CommonStyles(geoOpt);
      each(toArr(geoOpt.regions), function (regionObj) {
        compatEC3CommonStyles(regionObj);
      });
    }
  });
  each(toArr(option.timeline), function (timelineOpt) {
    compatEC3CommonStyles(timelineOpt);
    convertNormalEmphasis(timelineOpt, 'label');
    convertNormalEmphasis(timelineOpt, 'itemStyle');
    convertNormalEmphasis(timelineOpt, 'controlStyle', true);
    var data = timelineOpt.data;
    zrUtil.isArray(data) && zrUtil.each(data, function (item) {
      if (zrUtil.isObject(item)) {
        convertNormalEmphasis(item, 'label');
        convertNormalEmphasis(item, 'itemStyle');
      }
    });
  });
  each(toArr(option.toolbox), function (toolboxOpt) {
    convertNormalEmphasis(toolboxOpt, 'iconStyle');
    each(toolboxOpt.feature, function (featureOpt) {
      convertNormalEmphasis(featureOpt, 'iconStyle');
    });
  });
  compatTextStyle(toObj(option.axisPointer), 'label');
  compatTextStyle(toObj(option.tooltip).axisPointer, 'label');
}

module.exports = _default;

/***/ }),

/***/ "282b":
/***/ (function(module, exports, __webpack_require__) {


/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

var zrUtil = __webpack_require__("6d8b");

/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/
// TODO Parse shadow style
// TODO Only shallow path support
function _default(properties) {
  // Normalize
  for (var i = 0; i < properties.length; i++) {
    if (!properties[i][1]) {
      properties[i][1] = properties[i][0];
    }
  }

  return function (model, excludes, includes) {
    var style = {};

    for (var i = 0; i < properties.length; i++) {
      var propName = properties[i][1];

      if (excludes && zrUtil.indexOf(excludes, propName) >= 0 || includes && zrUtil.indexOf(includes, propName) < 0) {
        continue;
      }

      var val = model.getShallow(propName);

      if (val != null) {
        style[properties[i][0]] = val;
      }
    }

    return style;
  };
}

module.exports = _default;

/***/ }),

/***/ "2b8c":
/***/ (function(module, exports, __webpack_require__) {


/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

var zrUtil = __webpack_require__("6d8b");

var VisualMapping = __webpack_require__("5f14");

/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

/**
 * @file Visual solution, for consistent option specification.
 */
var each = zrUtil.each;

function hasKeys(obj) {
  if (obj) {
    for (var name in obj) {
      if (obj.hasOwnProperty(name)) {
        return true;
      }
    }
  }
}
/**
 * @param {Object} option
 * @param {Array.<string>} stateList
 * @param {Function} [supplementVisualOption]
 * @return {Object} visualMappings <state, <visualType, module:echarts/visual/VisualMapping>>
 */


function createVisualMappings(option, stateList, supplementVisualOption) {
  var visualMappings = {};
  each(stateList, function (state) {
    var mappings = visualMappings[state] = createMappings();
    each(option[state], function (visualData, visualType) {
      if (!VisualMapping.isValidType(visualType)) {
        return;
      }

      var mappingOption = {
        type: visualType,
        visual: visualData
      };
      supplementVisualOption && supplementVisualOption(mappingOption, state);
      mappings[visualType] = new VisualMapping(mappingOption); // Prepare a alpha for opacity, for some case that opacity
      // is not supported, such as rendering using gradient color.

      if (visualType === 'opacity') {
        mappingOption = zrUtil.clone(mappingOption);
        mappingOption.type = 'colorAlpha';
        mappings.__hidden.__alphaForOpacity = new VisualMapping(mappingOption);
      }
    });
  });
  return visualMappings;

  function createMappings() {
    var Creater = function () {}; // Make sure hidden fields will not be visited by
    // object iteration (with hasOwnProperty checking).


    Creater.prototype.__hidden = Creater.prototype;
    var obj = new Creater();
    return obj;
  }
}
/**
 * @param {Object} thisOption
 * @param {Object} newOption
 * @param {Array.<string>} keys
 */


function replaceVisualOption(thisOption, newOption, keys) {
  // Visual attributes merge is not supported, otherwise it
  // brings overcomplicated merge logic. See #2853. So if
  // newOption has anyone of these keys, all of these keys
  // will be reset. Otherwise, all keys remain.
  var has;
  zrUtil.each(keys, function (key) {
    if (newOption.hasOwnProperty(key) && hasKeys(newOption[key])) {
      has = true;
    }
  });
  has && zrUtil.each(keys, function (key) {
    if (newOption.hasOwnProperty(key) && hasKeys(newOption[key])) {
      thisOption[key] = zrUtil.clone(newOption[key]);
    } else {
      delete thisOption[key];
    }
  });
}
/**
 * @param {Array.<string>} stateList
 * @param {Object} visualMappings <state, Object.<visualType, module:echarts/visual/VisualMapping>>
 * @param {module:echarts/data/List} list
 * @param {Function} getValueState param: valueOrIndex, return: state.
 * @param {object} [scope] Scope for getValueState
 * @param {string} [dimension] Concrete dimension, if used.
 */
// ???! handle brush?


function applyVisual(stateList, visualMappings, data, getValueState, scope, dimension) {
  var visualTypesMap = {};
  zrUtil.each(stateList, function (state) {
    var visualTypes = VisualMapping.prepareVisualTypes(visualMappings[state]);
    visualTypesMap[state] = visualTypes;
  });
  var dataIndex;

  function getVisual(key) {
    return data.getItemVisual(dataIndex, key);
  }

  function setVisual(key, value) {
    data.setItemVisual(dataIndex, key, value);
  }

  if (dimension == null) {
    data.each(eachItem);
  } else {
    data.each([dimension], eachItem);
  }

  function eachItem(valueOrIndex, index) {
    dataIndex = dimension == null ? valueOrIndex : index;
    var rawDataItem = data.getRawDataItem(dataIndex); // Consider performance

    if (rawDataItem && rawDataItem.visualMap === false) {
      return;
    }

    var valueState = getValueState.call(scope, valueOrIndex);
    var mappings = visualMappings[valueState];
    var visualTypes = visualTypesMap[valueState];

    for (var i = 0, len = visualTypes.length; i < len; i++) {
      var type = visualTypes[i];
      mappings[type] && mappings[type].applyVisual(valueOrIndex, getVisual, setVisual);
    }
  }
}
/**
 * @param {module:echarts/data/List} data
 * @param {Array.<string>} stateList
 * @param {Object} visualMappings <state, Object.<visualType, module:echarts/visual/VisualMapping>>
 * @param {Function} getValueState param: valueOrIndex, return: state.
 * @param {number} [dim] dimension or dimension index.
 */


function incrementalApplyVisual(stateList, visualMappings, getValueState, dim) {
  var visualTypesMap = {};
  zrUtil.each(stateList, function (state) {
    var visualTypes = VisualMapping.prepareVisualTypes(visualMappings[state]);
    visualTypesMap[state] = visualTypes;
  });

  function progress(params, data) {
    if (dim != null) {
      dim = data.getDimension(dim);
    }

    function getVisual(key) {
      return data.getItemVisual(dataIndex, key);
    }

    function setVisual(key, value) {
      data.setItemVisual(dataIndex, key, value);
    }

    var dataIndex;

    while ((dataIndex = params.next()) != null) {
      var rawDataItem = data.getRawDataItem(dataIndex); // Consider performance

      if (rawDataItem && rawDataItem.visualMap === false) {
        continue;
      }

      var value = dim != null ? data.get(dim, dataIndex, true) : dataIndex;
      var valueState = getValueState(value);
      var mappings = visualMappings[valueState];
      var visualTypes = visualTypesMap[valueState];

      for (var i = 0, len = visualTypes.length; i < len; i++) {
        var type = visualTypes[i];
        mappings[type] && mappings[type].applyVisual(value, getVisual, setVisual);
      }
    }
  }

  return {
    progress: progress
  };
}

exports.createVisualMappings = createVisualMappings;
exports.replaceVisualOption = replaceVisualOption;
exports.applyVisual = applyVisual;
exports.incrementalApplyVisual = incrementalApplyVisual;

/***/ }),

/***/ "3842":
/***/ (function(module, exports, __webpack_require__) {


/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

var zrUtil = __webpack_require__("6d8b");

/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

/*
* A third-party license is embeded for some of the code in this file:
* The method "quantile" was copied from "d3.js".
* (See more details in the comment of the method below.)
* The use of the source code of this file is also subject to the terms
* and consitions of the license of "d3.js" (BSD-3Clause, see
* </licenses/LICENSE-d3>).
*/
var RADIAN_EPSILON = 1e-4;

function _trim(str) {
  return str.replace(/^\s+|\s+$/g, '');
}
/**
 * Linear mapping a value from domain to range
 * @memberOf module:echarts/util/number
 * @param  {(number|Array.<number>)} val
 * @param  {Array.<number>} domain Domain extent domain[0] can be bigger than domain[1]
 * @param  {Array.<number>} range  Range extent range[0] can be bigger than range[1]
 * @param  {boolean} clamp
 * @return {(number|Array.<number>}
 */


function linearMap(val, domain, range, clamp) {
  var subDomain = domain[1] - domain[0];
  var subRange = range[1] - range[0];

  if (subDomain === 0) {
    return subRange === 0 ? range[0] : (range[0] + range[1]) / 2;
  } // Avoid accuracy problem in edge, such as
  // 146.39 - 62.83 === 83.55999999999999.
  // See echarts/test/ut/spec/util/number.js#linearMap#accuracyError
  // It is a little verbose for efficiency considering this method
  // is a hotspot.


  if (clamp) {
    if (subDomain > 0) {
      if (val <= domain[0]) {
        return range[0];
      } else if (val >= domain[1]) {
        return range[1];
      }
    } else {
      if (val >= domain[0]) {
        return range[0];
      } else if (val <= domain[1]) {
        return range[1];
      }
    }
  } else {
    if (val === domain[0]) {
      return range[0];
    }

    if (val === domain[1]) {
      return range[1];
    }
  }

  return (val - domain[0]) / subDomain * subRange + range[0];
}
/**
 * Convert a percent string to absolute number.
 * Returns NaN if percent is not a valid string or number
 * @memberOf module:echarts/util/number
 * @param {string|number} percent
 * @param {number} all
 * @return {number}
 */


function parsePercent(percent, all) {
  switch (percent) {
    case 'center':
    case 'middle':
      percent = '50%';
      break;

    case 'left':
    case 'top':
      percent = '0%';
      break;

    case 'right':
    case 'bottom':
      percent = '100%';
      break;
  }

  if (typeof percent === 'string') {
    if (_trim(percent).match(/%$/)) {
      return parseFloat(percent) / 100 * all;
    }

    return parseFloat(percent);
  }

  return percent == null ? NaN : +percent;
}
/**
 * (1) Fix rounding error of float numbers.
 * (2) Support return string to avoid scientific notation like '3.5e-7'.
 *
 * @param {number} x
 * @param {number} [precision]
 * @param {boolean} [returnStr]
 * @return {number|string}
 */


function round(x, precision, returnStr) {
  if (precision == null) {
    precision = 10;
  } // Avoid range error


  precision = Math.min(Math.max(0, precision), 20);
  x = (+x).toFixed(precision);
  return returnStr ? x : +x;
}
/**
 * asc sort arr.
 * The input arr will be modified.
 *
 * @param {Array} arr
 * @return {Array} The input arr.
 */


function asc(arr) {
  arr.sort(function (a, b) {
    return a - b;
  });
  return arr;
}
/**
 * Get precision
 * @param {number} val
 */


function getPrecision(val) {
  val = +val;

  if (isNaN(val)) {
    return 0;
  } // It is much faster than methods converting number to string as follows
  //      var tmp = val.toString();
  //      return tmp.length - 1 - tmp.indexOf('.');
  // especially when precision is low


  var e = 1;
  var count = 0;

  while (Math.round(val * e) / e !== val) {
    e *= 10;
    count++;
  }

  return count;
}
/**
 * @param {string|number} val
 * @return {number}
 */


function getPrecisionSafe(val) {
  var str = val.toString(); // Consider scientific notation: '3.4e-12' '3.4e+12'

  var eIndex = str.indexOf('e');

  if (eIndex > 0) {
    var precision = +str.slice(eIndex + 1);
    return precision < 0 ? -precision : 0;
  } else {
    var dotIndex = str.indexOf('.');
    return dotIndex < 0 ? 0 : str.length - 1 - dotIndex;
  }
}
/**
 * Minimal dicernible data precisioin according to a single pixel.
 *
 * @param {Array.<number>} dataExtent
 * @param {Array.<number>} pixelExtent
 * @return {number} precision
 */


function getPixelPrecision(dataExtent, pixelExtent) {
  var log = Math.log;
  var LN10 = Math.LN10;
  var dataQuantity = Math.floor(log(dataExtent[1] - dataExtent[0]) / LN10);
  var sizeQuantity = Math.round(log(Math.abs(pixelExtent[1] - pixelExtent[0])) / LN10); // toFixed() digits argument must be between 0 and 20.

  var precision = Math.min(Math.max(-dataQuantity + sizeQuantity, 0), 20);
  return !isFinite(precision) ? 20 : precision;
}
/**
 * Get a data of given precision, assuring the sum of percentages
 * in valueList is 1.
 * The largest remainer method is used.
 * https://en.wikipedia.org/wiki/Largest_remainder_method
 *
 * @param {Array.<number>} valueList a list of all data
 * @param {number} idx index of the data to be processed in valueList
 * @param {number} precision integer number showing digits of precision
 * @return {number} percent ranging from 0 to 100
 */


function getPercentWithPrecision(valueList, idx, precision) {
  if (!valueList[idx]) {
    return 0;
  }

  var sum = zrUtil.reduce(valueList, function (acc, val) {
    return acc + (isNaN(val) ? 0 : val);
  }, 0);

  if (sum === 0) {
    return 0;
  }

  var digits = Math.pow(10, precision);
  var votesPerQuota = zrUtil.map(valueList, function (val) {
    return (isNaN(val) ? 0 : val) / sum * digits * 100;
  });
  var targetSeats = digits * 100;
  var seats = zrUtil.map(votesPerQuota, function (votes) {
    // Assign automatic seats.
    return Math.floor(votes);
  });
  var currentSum = zrUtil.reduce(seats, function (acc, val) {
    return acc + val;
  }, 0);
  var remainder = zrUtil.map(votesPerQuota, function (votes, idx) {
    return votes - seats[idx];
  }); // Has remainding votes.

  while (currentSum < targetSeats) {
    // Find next largest remainder.
    var max = Number.NEGATIVE_INFINITY;
    var maxId = null;

    for (var i = 0, len = remainder.length; i < len; ++i) {
      if (remainder[i] > max) {
        max = remainder[i];
        maxId = i;
      }
    } // Add a vote to max remainder.


    ++seats[maxId];
    remainder[maxId] = 0;
    ++currentSum;
  }

  return seats[idx] / digits;
} // Number.MAX_SAFE_INTEGER, ie do not support.


var MAX_SAFE_INTEGER = 9007199254740991;
/**
 * To 0 - 2 * PI, considering negative radian.
 * @param {number} radian
 * @return {number}
 */

function remRadian(radian) {
  var pi2 = Math.PI * 2;
  return (radian % pi2 + pi2) % pi2;
}
/**
 * @param {type} radian
 * @return {boolean}
 */


function isRadianAroundZero(val) {
  return val > -RADIAN_EPSILON && val < RADIAN_EPSILON;
}
/* eslint-disable */


var TIME_REG = /^(?:(\d{4})(?:[-\/](\d{1,2})(?:[-\/](\d{1,2})(?:[T ](\d{1,2})(?::(\d\d)(?::(\d\d)(?:[.,](\d+))?)?)?(Z|[\+\-]\d\d:?\d\d)?)?)?)?)?$/; // jshint ignore:line

/* eslint-enable */

/**
 * @param {string|Date|number} value These values can be accepted:
 *   + An instance of Date, represent a time in its own time zone.
 *   + Or string in a subset of ISO 8601, only including:
 *     + only year, month, date: '2012-03', '2012-03-01', '2012-03-01 05', '2012-03-01 05:06',
 *     + separated with T or space: '2012-03-01T12:22:33.123', '2012-03-01 12:22:33.123',
 *     + time zone: '2012-03-01T12:22:33Z', '2012-03-01T12:22:33+8000', '2012-03-01T12:22:33-05:00',
 *     all of which will be treated as local time if time zone is not specified
 *     (see <https://momentjs.com/>).
 *   + Or other string format, including (all of which will be treated as loacal time):
 *     '2012', '2012-3-1', '2012/3/1', '2012/03/01',
 *     '2009/6/12 2:00', '2009/6/12 2:05:08', '2009/6/12 2:05:08.123'
 *   + a timestamp, which represent a time in UTC.
 * @return {Date} date
 */

function parseDate(value) {
  if (value instanceof Date) {
    return value;
  } else if (typeof value === 'string') {
    // Different browsers parse date in different way, so we parse it manually.
    // Some other issues:
    // new Date('1970-01-01') is UTC,
    // new Date('1970/01/01') and new Date('1970-1-01') is local.
    // See issue #3623
    var match = TIME_REG.exec(value);

    if (!match) {
      // return Invalid Date.
      return new Date(NaN);
    } // Use local time when no timezone offset specifed.


    if (!match[8]) {
      // match[n] can only be string or undefined.
      // But take care of '12' + 1 => '121'.
      return new Date(+match[1], +(match[2] || 1) - 1, +match[3] || 1, +match[4] || 0, +(match[5] || 0), +match[6] || 0, +match[7] || 0);
    } // Timezoneoffset of Javascript Date has considered DST (Daylight Saving Time,
    // https://tc39.github.io/ecma262/#sec-daylight-saving-time-adjustment).
    // For example, system timezone is set as "Time Zone: America/Toronto",
    // then these code will get different result:
    // `new Date(1478411999999).getTimezoneOffset();  // get 240`
    // `new Date(1478412000000).getTimezoneOffset();  // get 300`
    // So we should not use `new Date`, but use `Date.UTC`.
    else {
        var hour = +match[4] || 0;

        if (match[8].toUpperCase() !== 'Z') {
          hour -= match[8].slice(0, 3);
        }

        return new Date(Date.UTC(+match[1], +(match[2] || 1) - 1, +match[3] || 1, hour, +(match[5] || 0), +match[6] || 0, +match[7] || 0));
      }
  } else if (value == null) {
    return new Date(NaN);
  }

  return new Date(Math.round(value));
}
/**
 * Quantity of a number. e.g. 0.1, 1, 10, 100
 *
 * @param  {number} val
 * @return {number}
 */


function quantity(val) {
  return Math.pow(10, quantityExponent(val));
}
/**
 * Exponent of the quantity of a number
 * e.g., 1234 equals to 1.234*10^3, so quantityExponent(1234) is 3
 *
 * @param  {number} val non-negative value
 * @return {number}
 */


function quantityExponent(val) {
  if (val === 0) {
    return 0;
  }

  var exp = Math.floor(Math.log(val) / Math.LN10);
  /**
   * exp is expected to be the rounded-down result of the base-10 log of val.
   * But due to the precision loss with Math.log(val), we need to restore it
   * using 10^exp to make sure we can get val back from exp. #11249
   */

  if (val / Math.pow(10, exp) >= 10) {
    exp++;
  }

  return exp;
}
/**
 * find a “nice” number approximately equal to x. Round the number if round = true,
 * take ceiling if round = false. The primary observation is that the “nicest”
 * numbers in decimal are 1, 2, and 5, and all power-of-ten multiples of these numbers.
 *
 * See "Nice Numbers for Graph Labels" of Graphic Gems.
 *
 * @param  {number} val Non-negative value.
 * @param  {boolean} round
 * @return {number}
 */


function nice(val, round) {
  var exponent = quantityExponent(val);
  var exp10 = Math.pow(10, exponent);
  var f = val / exp10; // 1 <= f < 10

  var nf;

  if (round) {
    if (f < 1.5) {
      nf = 1;
    } else if (f < 2.5) {
      nf = 2;
    } else if (f < 4) {
      nf = 3;
    } else if (f < 7) {
      nf = 5;
    } else {
      nf = 10;
    }
  } else {
    if (f < 1) {
      nf = 1;
    } else if (f < 2) {
      nf = 2;
    } else if (f < 3) {
      nf = 3;
    } else if (f < 5) {
      nf = 5;
    } else {
      nf = 10;
    }
  }

  val = nf * exp10; // Fix 3 * 0.1 === 0.30000000000000004 issue (see IEEE 754).
  // 20 is the uppper bound of toFixed.

  return exponent >= -20 ? +val.toFixed(exponent < 0 ? -exponent : 0) : val;
}
/**
 * This code was copied from "d3.js"
 * <https://github.com/d3/d3/blob/9cc9a875e636a1dcf36cc1e07bdf77e1ad6e2c74/src/arrays/quantile.js>.
 * See the license statement at the head of this file.
 * @param {Array.<number>} ascArr
 */


function quantile(ascArr, p) {
  var H = (ascArr.length - 1) * p + 1;
  var h = Math.floor(H);
  var v = +ascArr[h - 1];
  var e = H - h;
  return e ? v + e * (ascArr[h] - v) : v;
}
/**
 * Order intervals asc, and split them when overlap.
 * expect(numberUtil.reformIntervals([
 *     {interval: [18, 62], close: [1, 1]},
 *     {interval: [-Infinity, -70], close: [0, 0]},
 *     {interval: [-70, -26], close: [1, 1]},
 *     {interval: [-26, 18], close: [1, 1]},
 *     {interval: [62, 150], close: [1, 1]},
 *     {interval: [106, 150], close: [1, 1]},
 *     {interval: [150, Infinity], close: [0, 0]}
 * ])).toEqual([
 *     {interval: [-Infinity, -70], close: [0, 0]},
 *     {interval: [-70, -26], close: [1, 1]},
 *     {interval: [-26, 18], close: [0, 1]},
 *     {interval: [18, 62], close: [0, 1]},
 *     {interval: [62, 150], close: [0, 1]},
 *     {interval: [150, Infinity], close: [0, 0]}
 * ]);
 * @param {Array.<Object>} list, where `close` mean open or close
 *        of the interval, and Infinity can be used.
 * @return {Array.<Object>} The origin list, which has been reformed.
 */


function reformIntervals(list) {
  list.sort(function (a, b) {
    return littleThan(a, b, 0) ? -1 : 1;
  });
  var curr = -Infinity;
  var currClose = 1;

  for (var i = 0; i < list.length;) {
    var interval = list[i].interval;
    var close = list[i].close;

    for (var lg = 0; lg < 2; lg++) {
      if (interval[lg] <= curr) {
        interval[lg] = curr;
        close[lg] = !lg ? 1 - currClose : 1;
      }

      curr = interval[lg];
      currClose = close[lg];
    }

    if (interval[0] === interval[1] && close[0] * close[1] !== 1) {
      list.splice(i, 1);
    } else {
      i++;
    }
  }

  return list;

  function littleThan(a, b, lg) {
    return a.interval[lg] < b.interval[lg] || a.interval[lg] === b.interval[lg] && (a.close[lg] - b.close[lg] === (!lg ? 1 : -1) || !lg && littleThan(a, b, 1));
  }
}
/**
 * parseFloat NaNs numeric-cast false positives (null|true|false|"")
 * ...but misinterprets leading-number strings, particularly hex literals ("0x...")
 * subtraction forces infinities to NaN
 *
 * @param {*} v
 * @return {boolean}
 */


function isNumeric(v) {
  return v - parseFloat(v) >= 0;
}

exports.linearMap = linearMap;
exports.parsePercent = parsePercent;
exports.round = round;
exports.asc = asc;
exports.getPrecision = getPrecision;
exports.getPrecisionSafe = getPrecisionSafe;
exports.getPixelPrecision = getPixelPrecision;
exports.getPercentWithPrecision = getPercentWithPrecision;
exports.MAX_SAFE_INTEGER = MAX_SAFE_INTEGER;
exports.remRadian = remRadian;
exports.isRadianAroundZero = isRadianAroundZero;
exports.parseDate = parseDate;
exports.quantity = quantity;
exports.quantityExponent = quantityExponent;
exports.nice = nice;
exports.quantile = quantile;
exports.reformIntervals = reformIntervals;
exports.isNumeric = isNumeric;

/***/ }),

/***/ "38a2":
/***/ (function(module, exports, __webpack_require__) {


/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

var _dataProvider = __webpack_require__("2b17");

var retrieveRawValue = _dataProvider.retrieveRawValue;

var _format = __webpack_require__("eda2");

var getTooltipMarker = _format.getTooltipMarker;
var formatTpl = _format.formatTpl;

var _model = __webpack_require__("e0d3");

var getTooltipRenderMode = _model.getTooltipRenderMode;

/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/
var DIMENSION_LABEL_REG = /\{@(.+?)\}/g; // PENDING A little ugly

var _default = {
  /**
   * Get params for formatter
   * @param {number} dataIndex
   * @param {string} [dataType]
   * @return {Object}
   */
  getDataParams: function (dataIndex, dataType) {
    var data = this.getData(dataType);
    var rawValue = this.getRawValue(dataIndex, dataType);
    var rawDataIndex = data.getRawIndex(dataIndex);
    var name = data.getName(dataIndex);
    var itemOpt = data.getRawDataItem(dataIndex);
    var color = data.getItemVisual(dataIndex, 'color');
    var borderColor = data.getItemVisual(dataIndex, 'borderColor');
    var tooltipModel = this.ecModel.getComponent('tooltip');
    var renderModeOption = tooltipModel && tooltipModel.get('renderMode');
    var renderMode = getTooltipRenderMode(renderModeOption);
    var mainType = this.mainType;
    var isSeries = mainType === 'series';
    var userOutput = data.userOutput;
    return {
      componentType: mainType,
      componentSubType: this.subType,
      componentIndex: this.componentIndex,
      seriesType: isSeries ? this.subType : null,
      seriesIndex: this.seriesIndex,
      seriesId: isSeries ? this.id : null,
      seriesName: isSeries ? this.name : null,
      name: name,
      dataIndex: rawDataIndex,
      data: itemOpt,
      dataType: dataType,
      value: rawValue,
      color: color,
      borderColor: borderColor,
      dimensionNames: userOutput ? userOutput.dimensionNames : null,
      encode: userOutput ? userOutput.encode : null,
      marker: getTooltipMarker({
        color: color,
        renderMode: renderMode
      }),
      // Param name list for mapping `a`, `b`, `c`, `d`, `e`
      $vars: ['seriesName', 'name', 'value']
    };
  },

  /**
   * Format label
   * @param {number} dataIndex
   * @param {string} [status='normal'] 'normal' or 'emphasis'
   * @param {string} [dataType]
   * @param {number} [dimIndex] Only used in some chart that
   *        use formatter in different dimensions, like radar.
   * @param {string} [labelProp='label']
   * @return {string} If not formatter, return null/undefined
   */
  getFormattedLabel: function (dataIndex, status, dataType, dimIndex, labelProp) {
    status = status || 'normal';
    var data = this.getData(dataType);
    var itemModel = data.getItemModel(dataIndex);
    var params = this.getDataParams(dataIndex, dataType);

    if (dimIndex != null && params.value instanceof Array) {
      params.value = params.value[dimIndex];
    }

    var formatter = itemModel.get(status === 'normal' ? [labelProp || 'label', 'formatter'] : [status, labelProp || 'label', 'formatter']);

    if (typeof formatter === 'function') {
      params.status = status;
      params.dimensionIndex = dimIndex;
      return formatter(params);
    } else if (typeof formatter === 'string') {
      var str = formatTpl(formatter, params); // Support 'aaa{@[3]}bbb{@product}ccc'.
      // Do not support '}' in dim name util have to.

      return str.replace(DIMENSION_LABEL_REG, function (origin, dim) {
        var len = dim.length;

        if (dim.charAt(0) === '[' && dim.charAt(len - 1) === ']') {
          dim = +dim.slice(1, len - 1); // Also: '[]' => 0
        }

        return retrieveRawValue(data, dataIndex, dim);
      });
    }
  },

  /**
   * Get raw value in option
   * @param {number} idx
   * @param {string} [dataType]
   * @return {Array|number|string}
   */
  getRawValue: function (idx, dataType) {
    return retrieveRawValue(this.getData(dataType), idx);
  },

  /**
   * Should be implemented.
   * @param {number} dataIndex
   * @param {boolean} [multipleSeries=false]
   * @param {number} [dataType]
   * @return {string} tooltip string
   */
  formatTooltip: function () {// Empty function
  }
};
module.exports = _default;

/***/ }),

/***/ "3901":
/***/ (function(module, exports, __webpack_require__) {


/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

var makeStyleMapper = __webpack_require__("282b");

/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/
var getLineStyle = makeStyleMapper([['lineWidth', 'width'], ['stroke', 'color'], ['opacity'], ['shadowBlur'], ['shadowOffsetX'], ['shadowOffsetY'], ['shadowColor']]);
var _default = {
  getLineStyle: function (excludes) {
    var style = getLineStyle(this, excludes); // Always set lineDash whether dashed, otherwise we can not
    // erase the previous style when assigning to el.style.

    style.lineDash = this.getLineDash(style.lineWidth);
    return style;
  },
  getLineDash: function (lineWidth) {
    if (lineWidth == null) {
      lineWidth = 1;
    }

    var lineType = this.get('type');
    var dotSize = Math.max(lineWidth, 2);
    var dashSize = lineWidth * 4;
    return lineType === 'solid' || lineType == null ? // Use `false` but not `null` for the solid line here, because `null` might be
    // ignored when assigning to `el.style`. e.g., when setting `lineStyle.type` as
    // `'dashed'` and `emphasis.lineStyle.type` as `'solid'` in graph series, the
    // `lineDash` gotten form the latter one is not able to erase that from the former
    // one if using `null` here according to the emhpsis strategy in `util/graphic.js`.
    false : lineType === 'dashed' ? [dashSize, dashSize] : [dotSize, dotSize];
  }
};
module.exports = _default;

/***/ }),

/***/ "4319":
/***/ (function(module, exports, __webpack_require__) {


/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

var zrUtil = __webpack_require__("6d8b");

var env = __webpack_require__("22d1");

var _model = __webpack_require__("e0d3");

var makeInner = _model.makeInner;

var _clazz = __webpack_require__("625e");

var enableClassExtend = _clazz.enableClassExtend;
var enableClassCheck = _clazz.enableClassCheck;

var lineStyleMixin = __webpack_require__("3901");

var areaStyleMixin = __webpack_require__("9bdb");

var textStyleMixin = __webpack_require__("fe21");

var itemStyleMixin = __webpack_require__("551f");

/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

/**
 * @module echarts/model/Model
 */
var mixin = zrUtil.mixin;
var inner = makeInner();
/**
 * @alias module:echarts/model/Model
 * @constructor
 * @param {Object} [option]
 * @param {module:echarts/model/Model} [parentModel]
 * @param {module:echarts/model/Global} [ecModel]
 */

function Model(option, parentModel, ecModel) {
  /**
   * @type {module:echarts/model/Model}
   * @readOnly
   */
  this.parentModel = parentModel;
  /**
   * @type {module:echarts/model/Global}
   * @readOnly
   */

  this.ecModel = ecModel;
  /**
   * @type {Object}
   * @protected
   */

  this.option = option; // Simple optimization
  // if (this.init) {
  //     if (arguments.length <= 4) {
  //         this.init(option, parentModel, ecModel, extraOpt);
  //     }
  //     else {
  //         this.init.apply(this, arguments);
  //     }
  // }
}

Model.prototype = {
  constructor: Model,

  /**
   * Model 的初始化函数
   * @param {Object} option
   */
  init: null,

  /**
   * 从新的 Option merge
   */
  mergeOption: function (option) {
    zrUtil.merge(this.option, option, true);
  },

  /**
   * @param {string|Array.<string>} path
   * @param {boolean} [ignoreParent=false]
   * @return {*}
   */
  get: function (path, ignoreParent) {
    if (path == null) {
      return this.option;
    }

    return doGet(this.option, this.parsePath(path), !ignoreParent && getParent(this, path));
  },

  /**
   * @param {string} key
   * @param {boolean} [ignoreParent=false]
   * @return {*}
   */
  getShallow: function (key, ignoreParent) {
    var option = this.option;
    var val = option == null ? option : option[key];
    var parentModel = !ignoreParent && getParent(this, key);

    if (val == null && parentModel) {
      val = parentModel.getShallow(key);
    }

    return val;
  },

  /**
   * @param {string|Array.<string>} [path]
   * @param {module:echarts/model/Model} [parentModel]
   * @return {module:echarts/model/Model}
   */
  getModel: function (path, parentModel) {
    var obj = path == null ? this.option : doGet(this.option, path = this.parsePath(path));
    var thisParentModel;
    parentModel = parentModel || (thisParentModel = getParent(this, path)) && thisParentModel.getModel(path);
    return new Model(obj, parentModel, this.ecModel);
  },

  /**
   * If model has option
   */
  isEmpty: function () {
    return this.option == null;
  },
  restoreData: function () {},
  // Pending
  clone: function () {
    var Ctor = this.constructor;
    return new Ctor(zrUtil.clone(this.option));
  },
  setReadOnly: function (properties) {// clazzUtil.setReadOnly(this, properties);
  },
  // If path is null/undefined, return null/undefined.
  parsePath: function (path) {
    if (typeof path === 'string') {
      path = path.split('.');
    }

    return path;
  },

  /**
   * @param {Function} getParentMethod
   *        param {Array.<string>|string} path
   *        return {module:echarts/model/Model}
   */
  customizeGetParent: function (getParentMethod) {
    inner(this).getParent = getParentMethod;
  },
  isAnimationEnabled: function () {
    if (!env.node) {
      if (this.option.animation != null) {
        return !!this.option.animation;
      } else if (this.parentModel) {
        return this.parentModel.isAnimationEnabled();
      }
    }
  }
};

function doGet(obj, pathArr, parentModel) {
  for (var i = 0; i < pathArr.length; i++) {
    // Ignore empty
    if (!pathArr[i]) {
      continue;
    } // obj could be number/string/... (like 0)


    obj = obj && typeof obj === 'object' ? obj[pathArr[i]] : null;

    if (obj == null) {
      break;
    }
  }

  if (obj == null && parentModel) {
    obj = parentModel.get(pathArr);
  }

  return obj;
} // `path` can be null/undefined


function getParent(model, path) {
  var getParentMethod = inner(model).getParent;
  return getParentMethod ? getParentMethod.call(model, path) : model.parentModel;
} // Enable Model.extend.


enableClassExtend(Model);
enableClassCheck(Model);
mixin(Model, lineStyleMixin);
mixin(Model, areaStyleMixin);
mixin(Model, textStyleMixin);
mixin(Model, itemStyleMixin);
var _default = Model;
module.exports = _default;

/***/ }),

/***/ "4f85":
/***/ (function(module, exports, __webpack_require__) {


/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

var _config = __webpack_require__("4e08");

var __DEV__ = _config.__DEV__;

var zrUtil = __webpack_require__("6d8b");

var env = __webpack_require__("22d1");

var _format = __webpack_require__("eda2");

var formatTime = _format.formatTime;
var encodeHTML = _format.encodeHTML;
var addCommas = _format.addCommas;
var getTooltipMarker = _format.getTooltipMarker;

var modelUtil = __webpack_require__("e0d3");

var ComponentModel = __webpack_require__("6cb7");

var colorPaletteMixin = __webpack_require__("e47b");

var dataFormatMixin = __webpack_require__("38a2");

var _layout = __webpack_require__("f934");

var getLayoutParams = _layout.getLayoutParams;
var mergeLayoutParam = _layout.mergeLayoutParam;

var _task = __webpack_require__("f47d");

var createTask = _task.createTask;

var _sourceHelper = __webpack_require__("0f99");

var prepareSource = _sourceHelper.prepareSource;
var getSource = _sourceHelper.getSource;

var _dataProvider = __webpack_require__("2b17");

var retrieveRawValue = _dataProvider.retrieveRawValue;

/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/
var inner = modelUtil.makeInner();
var SeriesModel = ComponentModel.extend({
  type: 'series.__base__',

  /**
   * @readOnly
   */
  seriesIndex: 0,
  // coodinateSystem will be injected in the echarts/CoordinateSystem
  coordinateSystem: null,

  /**
   * @type {Object}
   * @protected
   */
  defaultOption: null,

  /**
   * legend visual provider to the legend component
   * @type {Object}
   */
  // PENDING
  legendVisualProvider: null,

  /**
   * Access path of color for visual
   */
  visualColorAccessPath: 'itemStyle.color',

  /**
   * Access path of borderColor for visual
   */
  visualBorderColorAccessPath: 'itemStyle.borderColor',

  /**
   * Support merge layout params.
   * Only support 'box' now (left/right/top/bottom/width/height).
   * @type {string|Object} Object can be {ignoreSize: true}
   * @readOnly
   */
  layoutMode: null,
  init: function (option, parentModel, ecModel, extraOpt) {
    /**
     * @type {number}
     * @readOnly
     */
    this.seriesIndex = this.componentIndex;
    this.dataTask = createTask({
      count: dataTaskCount,
      reset: dataTaskReset
    });
    this.dataTask.context = {
      model: this
    };
    this.mergeDefaultAndTheme(option, ecModel);
    prepareSource(this);
    var data = this.getInitialData(option, ecModel);
    wrapData(data, this);
    this.dataTask.context.data = data;

    /**
     * @type {module:echarts/data/List|module:echarts/data/Tree|module:echarts/data/Graph}
     * @private
     */
    inner(this).dataBeforeProcessed = data; // If we reverse the order (make data firstly, and then make
    // dataBeforeProcessed by cloneShallow), cloneShallow will
    // cause data.graph.data !== data when using
    // module:echarts/data/Graph or module:echarts/data/Tree.
    // See module:echarts/data/helper/linkList
    // Theoretically, it is unreasonable to call `seriesModel.getData()` in the model
    // init or merge stage, because the data can be restored. So we do not `restoreData`
    // and `setData` here, which forbids calling `seriesModel.getData()` in this stage.
    // Call `seriesModel.getRawData()` instead.
    // this.restoreData();

    autoSeriesName(this);
  },

  /**
   * Util for merge default and theme to option
   * @param  {Object} option
   * @param  {module:echarts/model/Global} ecModel
   */
  mergeDefaultAndTheme: function (option, ecModel) {
    var layoutMode = this.layoutMode;
    var inputPositionParams = layoutMode ? getLayoutParams(option) : {}; // Backward compat: using subType on theme.
    // But if name duplicate between series subType
    // (for example: parallel) add component mainType,
    // add suffix 'Series'.

    var themeSubType = this.subType;

    if (ComponentModel.hasClass(themeSubType)) {
      themeSubType += 'Series';
    }

    zrUtil.merge(option, ecModel.getTheme().get(this.subType));
    zrUtil.merge(option, this.getDefaultOption()); // Default label emphasis `show`

    modelUtil.defaultEmphasis(option, 'label', ['show']);
    this.fillDataTextStyle(option.data);

    if (layoutMode) {
      mergeLayoutParam(option, inputPositionParams, layoutMode);
    }
  },
  mergeOption: function (newSeriesOption, ecModel) {
    // this.settingTask.dirty();
    newSeriesOption = zrUtil.merge(this.option, newSeriesOption, true);
    this.fillDataTextStyle(newSeriesOption.data);
    var layoutMode = this.layoutMode;

    if (layoutMode) {
      mergeLayoutParam(this.option, newSeriesOption, layoutMode);
    }

    prepareSource(this);
    var data = this.getInitialData(newSeriesOption, ecModel);
    wrapData(data, this);
    this.dataTask.dirty();
    this.dataTask.context.data = data;
    inner(this).dataBeforeProcessed = data;
    autoSeriesName(this);
  },
  fillDataTextStyle: function (data) {
    // Default data label emphasis `show`
    // FIXME Tree structure data ?
    // FIXME Performance ?
    if (data && !zrUtil.isTypedArray(data)) {
      var props = ['show'];

      for (var i = 0; i < data.length; i++) {
        if (data[i] && data[i].label) {
          modelUtil.defaultEmphasis(data[i], 'label', props);
        }
      }
    }
  },

  /**
   * Init a data structure from data related option in series
   * Must be overwritten
   */
  getInitialData: function () {},

  /**
   * Append data to list
   * @param {Object} params
   * @param {Array|TypedArray} params.data
   */
  appendData: function (params) {
    // FIXME ???
    // (1) If data from dataset, forbidden append.
    // (2) support append data of dataset.
    var data = this.getRawData();
    data.appendData(params.data);
  },

  /**
   * Consider some method like `filter`, `map` need make new data,
   * We should make sure that `seriesModel.getData()` get correct
   * data in the stream procedure. So we fetch data from upstream
   * each time `task.perform` called.
   * @param {string} [dataType]
   * @return {module:echarts/data/List}
   */
  getData: function (dataType) {
    var task = getCurrentTask(this);

    if (task) {
      var data = task.context.data;
      return dataType == null ? data : data.getLinkedData(dataType);
    } else {
      // When series is not alive (that may happen when click toolbox
      // restore or setOption with not merge mode), series data may
      // be still need to judge animation or something when graphic
      // elements want to know whether fade out.
      return inner(this).data;
    }
  },

  /**
   * @param {module:echarts/data/List} data
   */
  setData: function (data) {
    var task = getCurrentTask(this);

    if (task) {
      var context = task.context; // Consider case: filter, data sample.

      if (context.data !== data && task.modifyOutputEnd) {
        task.setOutputEnd(data.count());
      }

      context.outputData = data; // Caution: setData should update context.data,
      // Because getData may be called multiply in a
      // single stage and expect to get the data just
      // set. (For example, AxisProxy, x y both call
      // getData and setDate sequentially).
      // So the context.data should be fetched from
      // upstream each time when a stage starts to be
      // performed.

      if (task !== this.dataTask) {
        context.data = data;
      }
    }

    inner(this).data = data;
  },

  /**
   * @see {module:echarts/data/helper/sourceHelper#getSource}
   * @return {module:echarts/data/Source} source
   */
  getSource: function () {
    return getSource(this);
  },

  /**
   * Get data before processed
   * @return {module:echarts/data/List}
   */
  getRawData: function () {
    return inner(this).dataBeforeProcessed;
  },

  /**
   * Get base axis if has coordinate system and has axis.
   * By default use coordSys.getBaseAxis();
   * Can be overrided for some chart.
   * @return {type} description
   */
  getBaseAxis: function () {
    var coordSys = this.coordinateSystem;
    return coordSys && coordSys.getBaseAxis && coordSys.getBaseAxis();
  },
  // FIXME

  /**
   * Default tooltip formatter
   *
   * @param {number} dataIndex
   * @param {boolean} [multipleSeries=false]
   * @param {number} [dataType]
   * @param {string} [renderMode='html'] valid values: 'html' and 'richText'.
   *                                     'html' is used for rendering tooltip in extra DOM form, and the result
   *                                     string is used as DOM HTML content.
   *                                     'richText' is used for rendering tooltip in rich text form, for those where
   *                                     DOM operation is not supported.
   * @return {Object} formatted tooltip with `html` and `markers`
   */
  formatTooltip: function (dataIndex, multipleSeries, dataType, renderMode) {
    var series = this;
    renderMode = renderMode || 'html';
    var newLine = renderMode === 'html' ? '<br/>' : '\n';
    var isRichText = renderMode === 'richText';
    var markers = {};
    var markerId = 0;

    function formatArrayValue(value) {
      // ??? TODO refactor these logic.
      // check: category-no-encode-has-axis-data in dataset.html
      var vertially = zrUtil.reduce(value, function (vertially, val, idx) {
        var dimItem = data.getDimensionInfo(idx);
        return vertially |= dimItem && dimItem.tooltip !== false && dimItem.displayName != null;
      }, 0);
      var result = [];
      tooltipDims.length ? zrUtil.each(tooltipDims, function (dim) {
        setEachItem(retrieveRawValue(data, dataIndex, dim), dim);
      }) // By default, all dims is used on tooltip.
      : zrUtil.each(value, setEachItem);

      function setEachItem(val, dim) {
        var dimInfo = data.getDimensionInfo(dim); // If `dimInfo.tooltip` is not set, show tooltip.

        if (!dimInfo || dimInfo.otherDims.tooltip === false) {
          return;
        }

        var dimType = dimInfo.type;
        var markName = 'sub' + series.seriesIndex + 'at' + markerId;
        var dimHead = getTooltipMarker({
          color: color,
          type: 'subItem',
          renderMode: renderMode,
          markerId: markName
        });
        var dimHeadStr = typeof dimHead === 'string' ? dimHead : dimHead.content;
        var valStr = (vertially ? dimHeadStr + encodeHTML(dimInfo.displayName || '-') + ': ' : '') + // FIXME should not format time for raw data?
        encodeHTML(dimType === 'ordinal' ? val + '' : dimType === 'time' ? multipleSeries ? '' : formatTime('yyyy/MM/dd hh:mm:ss', val) : addCommas(val));
        valStr && result.push(valStr);

        if (isRichText) {
          markers[markName] = color;
          ++markerId;
        }
      }

      var newLine = vertially ? isRichText ? '\n' : '<br/>' : '';
      var content = newLine + result.join(newLine || ', ');
      return {
        renderMode: renderMode,
        content: content,
        style: markers
      };
    }

    function formatSingleValue(val) {
      // return encodeHTML(addCommas(val));
      return {
        renderMode: renderMode,
        content: encodeHTML(addCommas(val)),
        style: markers
      };
    }

    var data = this.getData();
    var tooltipDims = data.mapDimension('defaultedTooltip', true);
    var tooltipDimLen = tooltipDims.length;
    var value = this.getRawValue(dataIndex);
    var isValueArr = zrUtil.isArray(value);
    var color = data.getItemVisual(dataIndex, 'color');

    if (zrUtil.isObject(color) && color.colorStops) {
      color = (color.colorStops[0] || {}).color;
    }

    color = color || 'transparent'; // Complicated rule for pretty tooltip.

    var formattedValue = tooltipDimLen > 1 || isValueArr && !tooltipDimLen ? formatArrayValue(value) : tooltipDimLen ? formatSingleValue(retrieveRawValue(data, dataIndex, tooltipDims[0])) : formatSingleValue(isValueArr ? value[0] : value);
    var content = formattedValue.content;
    var markName = series.seriesIndex + 'at' + markerId;
    var colorEl = getTooltipMarker({
      color: color,
      type: 'item',
      renderMode: renderMode,
      markerId: markName
    });
    markers[markName] = color;
    ++markerId;
    var name = data.getName(dataIndex);
    var seriesName = this.name;

    if (!modelUtil.isNameSpecified(this)) {
      seriesName = '';
    }

    seriesName = seriesName ? encodeHTML(seriesName) + (!multipleSeries ? newLine : ': ') : '';
    var colorStr = typeof colorEl === 'string' ? colorEl : colorEl.content;
    var html = !multipleSeries ? seriesName + colorStr + (name ? encodeHTML(name) + ': ' + content : content) : colorStr + seriesName + content;
    return {
      html: html,
      markers: markers
    };
  },

  /**
   * @return {boolean}
   */
  isAnimationEnabled: function () {
    if (env.node) {
      return false;
    }

    var animationEnabled = this.getShallow('animation');

    if (animationEnabled) {
      if (this.getData().count() > this.getShallow('animationThreshold')) {
        animationEnabled = false;
      }
    }

    return animationEnabled;
  },
  restoreData: function () {
    this.dataTask.dirty();
  },
  getColorFromPalette: function (name, scope, requestColorNum) {
    var ecModel = this.ecModel; // PENDING

    var color = colorPaletteMixin.getColorFromPalette.call(this, name, scope, requestColorNum);

    if (!color) {
      color = ecModel.getColorFromPalette(name, scope, requestColorNum);
    }

    return color;
  },

  /**
   * Use `data.mapDimension(coordDim, true)` instead.
   * @deprecated
   */
  coordDimToDataDim: function (coordDim) {
    return this.getRawData().mapDimension(coordDim, true);
  },

  /**
   * Get progressive rendering count each step
   * @return {number}
   */
  getProgressive: function () {
    return this.get('progressive');
  },

  /**
   * Get progressive rendering count each step
   * @return {number}
   */
  getProgressiveThreshold: function () {
    return this.get('progressiveThreshold');
  },

  /**
   * Get data indices for show tooltip content. See tooltip.
   * @abstract
   * @param {Array.<string>|string} dim
   * @param {Array.<number>} value
   * @param {module:echarts/coord/single/SingleAxis} baseAxis
   * @return {Object} {dataIndices, nestestValue}.
   */
  getAxisTooltipData: null,

  /**
   * See tooltip.
   * @abstract
   * @param {number} dataIndex
   * @return {Array.<number>} Point of tooltip. null/undefined can be returned.
   */
  getTooltipPosition: null,

  /**
   * @see {module:echarts/stream/Scheduler}
   */
  pipeTask: null,

  /**
   * Convinient for override in extended class.
   * @protected
   * @type {Function}
   */
  preventIncremental: null,

  /**
   * @public
   * @readOnly
   * @type {Object}
   */
  pipelineContext: null
});
zrUtil.mixin(SeriesModel, dataFormatMixin);
zrUtil.mixin(SeriesModel, colorPaletteMixin);
/**
 * MUST be called after `prepareSource` called
 * Here we need to make auto series, especially for auto legend. But we
 * do not modify series.name in option to avoid side effects.
 */

function autoSeriesName(seriesModel) {
  // User specified name has higher priority, otherwise it may cause
  // series can not be queried unexpectedly.
  var name = seriesModel.name;

  if (!modelUtil.isNameSpecified(seriesModel)) {
    seriesModel.name = getSeriesAutoName(seriesModel) || name;
  }
}

function getSeriesAutoName(seriesModel) {
  var data = seriesModel.getRawData();
  var dataDims = data.mapDimension('seriesName', true);
  var nameArr = [];
  zrUtil.each(dataDims, function (dataDim) {
    var dimInfo = data.getDimensionInfo(dataDim);
    dimInfo.displayName && nameArr.push(dimInfo.displayName);
  });
  return nameArr.join(' ');
}

function dataTaskCount(context) {
  return context.model.getRawData().count();
}

function dataTaskReset(context) {
  var seriesModel = context.model;
  seriesModel.setData(seriesModel.getRawData().cloneShallow());
  return dataTaskProgress;
}

function dataTaskProgress(param, context) {
  // Avoid repead cloneShallow when data just created in reset.
  if (param.end > context.outputData.count()) {
    context.model.getRawData().cloneShallow(context.outputData);
  }
} // TODO refactor


function wrapData(data, seriesModel) {
  zrUtil.each(data.CHANGABLE_METHODS, function (methodName) {
    data.wrapMethod(methodName, zrUtil.curry(onDataSelfChange, seriesModel));
  });
}

function onDataSelfChange(seriesModel) {
  var task = getCurrentTask(seriesModel);

  if (task) {
    // Consider case: filter, selectRange
    task.setOutputEnd(this.count());
  }
}

function getCurrentTask(seriesModel) {
  var scheduler = (seriesModel.ecModel || {}).scheduler;
  var pipeline = scheduler && scheduler.getPipeline(seriesModel.uid);

  if (pipeline) {
    // When pipline finished, the currrentTask keep the last
    // task (renderTask).
    var task = pipeline.currentTask;

    if (task) {
      var agentStubMap = task.agentStubMap;

      if (agentStubMap) {
        task = agentStubMap.get(seriesModel.uid);
      }
    }

    return task;
  }
}

var _default = SeriesModel;
module.exports = _default;

/***/ }),

/***/ "551f":
/***/ (function(module, exports, __webpack_require__) {


/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

var makeStyleMapper = __webpack_require__("282b");

/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/
var getItemStyle = makeStyleMapper([['fill', 'color'], ['stroke', 'borderColor'], ['lineWidth', 'borderWidth'], ['opacity'], ['shadowBlur'], ['shadowOffsetX'], ['shadowOffsetY'], ['shadowColor'], ['textPosition'], ['textAlign']]);
var _default = {
  getItemStyle: function (excludes, includes) {
    var style = getItemStyle(this, excludes, includes);
    var lineDash = this.getBorderLineDash();
    lineDash && (style.lineDash = lineDash);
    return style;
  },
  getBorderLineDash: function () {
    var lineType = this.get('borderType');
    return lineType === 'solid' || lineType == null ? null : lineType === 'dashed' ? [5, 5] : [1, 1];
  }
};
module.exports = _default;

/***/ }),

/***/ "5f14":
/***/ (function(module, exports, __webpack_require__) {


/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

var zrUtil = __webpack_require__("6d8b");

var zrColor = __webpack_require__("41ef");

var _number = __webpack_require__("3842");

var linearMap = _number.linearMap;

/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/
var each = zrUtil.each;
var isObject = zrUtil.isObject;
var CATEGORY_DEFAULT_VISUAL_INDEX = -1;
/**
 * @param {Object} option
 * @param {string} [option.type] See visualHandlers.
 * @param {string} [option.mappingMethod] 'linear' or 'piecewise' or 'category' or 'fixed'
 * @param {Array.<number>=} [option.dataExtent] [minExtent, maxExtent],
 *                                              required when mappingMethod is 'linear'
 * @param {Array.<Object>=} [option.pieceList] [
 *                                             {value: someValue},
 *                                             {interval: [min1, max1], visual: {...}},
 *                                             {interval: [min2, max2]}
 *                                             ],
 *                                            required when mappingMethod is 'piecewise'.
 *                                            Visual for only each piece can be specified.
 * @param {Array.<string|Object>=} [option.categories] ['cate1', 'cate2']
 *                                            required when mappingMethod is 'category'.
 *                                            If no option.categories, categories is set
 *                                            as [0, 1, 2, ...].
 * @param {boolean} [option.loop=false] Whether loop mapping when mappingMethod is 'category'.
 * @param {(Array|Object|*)} [option.visual]  Visual data.
 *                                            when mappingMethod is 'category',
 *                                            visual data can be array or object
 *                                            (like: {cate1: '#222', none: '#fff'})
 *                                            or primary types (which represents
 *                                            defualt category visual), otherwise visual
 *                                            can be array or primary (which will be
 *                                            normalized to array).
 *
 */

var VisualMapping = function (option) {
  var mappingMethod = option.mappingMethod;
  var visualType = option.type;
  /**
   * @readOnly
   * @type {Object}
   */

  var thisOption = this.option = zrUtil.clone(option);
  /**
   * @readOnly
   * @type {string}
   */

  this.type = visualType;
  /**
   * @readOnly
   * @type {string}
   */

  this.mappingMethod = mappingMethod;
  /**
   * @private
   * @type {Function}
   */

  this._normalizeData = normalizers[mappingMethod];
  var visualHandler = visualHandlers[visualType];
  /**
   * @public
   * @type {Function}
   */

  this.applyVisual = visualHandler.applyVisual;
  /**
   * @public
   * @type {Function}
   */

  this.getColorMapper = visualHandler.getColorMapper;
  /**
   * @private
   * @type {Function}
   */

  this._doMap = visualHandler._doMap[mappingMethod];

  if (mappingMethod === 'piecewise') {
    normalizeVisualRange(thisOption);
    preprocessForPiecewise(thisOption);
  } else if (mappingMethod === 'category') {
    thisOption.categories ? preprocessForSpecifiedCategory(thisOption) // categories is ordinal when thisOption.categories not specified,
    // which need no more preprocess except normalize visual.
    : normalizeVisualRange(thisOption, true);
  } else {
    // mappingMethod === 'linear' or 'fixed'
    zrUtil.assert(mappingMethod !== 'linear' || thisOption.dataExtent);
    normalizeVisualRange(thisOption);
  }
};

VisualMapping.prototype = {
  constructor: VisualMapping,
  mapValueToVisual: function (value) {
    var normalized = this._normalizeData(value);

    return this._doMap(normalized, value);
  },
  getNormalizer: function () {
    return zrUtil.bind(this._normalizeData, this);
  }
};
var visualHandlers = VisualMapping.visualHandlers = {
  color: {
    applyVisual: makeApplyVisual('color'),

    /**
     * Create a mapper function
     * @return {Function}
     */
    getColorMapper: function () {
      var thisOption = this.option;
      return zrUtil.bind(thisOption.mappingMethod === 'category' ? function (value, isNormalized) {
        !isNormalized && (value = this._normalizeData(value));
        return doMapCategory.call(this, value);
      } : function (value, isNormalized, out) {
        // If output rgb array
        // which will be much faster and useful in pixel manipulation
        var returnRGBArray = !!out;
        !isNormalized && (value = this._normalizeData(value));
        out = zrColor.fastLerp(value, thisOption.parsedVisual, out);
        return returnRGBArray ? out : zrColor.stringify(out, 'rgba');
      }, this);
    },
    _doMap: {
      linear: function (normalized) {
        return zrColor.stringify(zrColor.fastLerp(normalized, this.option.parsedVisual), 'rgba');
      },
      category: doMapCategory,
      piecewise: function (normalized, value) {
        var result = getSpecifiedVisual.call(this, value);

        if (result == null) {
          result = zrColor.stringify(zrColor.fastLerp(normalized, this.option.parsedVisual), 'rgba');
        }

        return result;
      },
      fixed: doMapFixed
    }
  },
  colorHue: makePartialColorVisualHandler(function (color, value) {
    return zrColor.modifyHSL(color, value);
  }),
  colorSaturation: makePartialColorVisualHandler(function (color, value) {
    return zrColor.modifyHSL(color, null, value);
  }),
  colorLightness: makePartialColorVisualHandler(function (color, value) {
    return zrColor.modifyHSL(color, null, null, value);
  }),
  colorAlpha: makePartialColorVisualHandler(function (color, value) {
    return zrColor.modifyAlpha(color, value);
  }),
  opacity: {
    applyVisual: makeApplyVisual('opacity'),
    _doMap: makeDoMap([0, 1])
  },
  liftZ: {
    applyVisual: makeApplyVisual('liftZ'),
    _doMap: {
      linear: doMapFixed,
      category: doMapFixed,
      piecewise: doMapFixed,
      fixed: doMapFixed
    }
  },
  symbol: {
    applyVisual: function (value, getter, setter) {
      var symbolCfg = this.mapValueToVisual(value);

      if (zrUtil.isString(symbolCfg)) {
        setter('symbol', symbolCfg);
      } else if (isObject(symbolCfg)) {
        for (var name in symbolCfg) {
          if (symbolCfg.hasOwnProperty(name)) {
            setter(name, symbolCfg[name]);
          }
        }
      }
    },
    _doMap: {
      linear: doMapToArray,
      category: doMapCategory,
      piecewise: function (normalized, value) {
        var result = getSpecifiedVisual.call(this, value);

        if (result == null) {
          result = doMapToArray.call(this, normalized);
        }

        return result;
      },
      fixed: doMapFixed
    }
  },
  symbolSize: {
    applyVisual: makeApplyVisual('symbolSize'),
    _doMap: makeDoMap([0, 1])
  }
};

function preprocessForPiecewise(thisOption) {
  var pieceList = thisOption.pieceList;
  thisOption.hasSpecialVisual = false;
  zrUtil.each(pieceList, function (piece, index) {
    piece.originIndex = index; // piece.visual is "result visual value" but not
    // a visual range, so it does not need to be normalized.

    if (piece.visual != null) {
      thisOption.hasSpecialVisual = true;
    }
  });
}

function preprocessForSpecifiedCategory(thisOption) {
  // Hash categories.
  var categories = thisOption.categories;
  var visual = thisOption.visual;
  var categoryMap = thisOption.categoryMap = {};
  each(categories, function (cate, index) {
    categoryMap[cate] = index;
  }); // Process visual map input.

  if (!zrUtil.isArray(visual)) {
    var visualArr = [];

    if (zrUtil.isObject(visual)) {
      each(visual, function (v, cate) {
        var index = categoryMap[cate];
        visualArr[index != null ? index : CATEGORY_DEFAULT_VISUAL_INDEX] = v;
      });
    } else {
      // Is primary type, represents default visual.
      visualArr[CATEGORY_DEFAULT_VISUAL_INDEX] = visual;
    }

    visual = setVisualToOption(thisOption, visualArr);
  } // Remove categories that has no visual,
  // then we can mapping them to CATEGORY_DEFAULT_VISUAL_INDEX.


  for (var i = categories.length - 1; i >= 0; i--) {
    if (visual[i] == null) {
      delete categoryMap[categories[i]];
      categories.pop();
    }
  }
}

function normalizeVisualRange(thisOption, isCategory) {
  var visual = thisOption.visual;
  var visualArr = [];

  if (zrUtil.isObject(visual)) {
    each(visual, function (v) {
      visualArr.push(v);
    });
  } else if (visual != null) {
    visualArr.push(visual);
  }

  var doNotNeedPair = {
    color: 1,
    symbol: 1
  };

  if (!isCategory && visualArr.length === 1 && !doNotNeedPair.hasOwnProperty(thisOption.type)) {
    // Do not care visualArr.length === 0, which is illegal.
    visualArr[1] = visualArr[0];
  }

  setVisualToOption(thisOption, visualArr);
}

function makePartialColorVisualHandler(applyValue) {
  return {
    applyVisual: function (value, getter, setter) {
      value = this.mapValueToVisual(value); // Must not be array value

      setter('color', applyValue(getter('color'), value));
    },
    _doMap: makeDoMap([0, 1])
  };
}

function doMapToArray(normalized) {
  var visual = this.option.visual;
  return visual[Math.round(linearMap(normalized, [0, 1], [0, visual.length - 1], true))] || {};
}

function makeApplyVisual(visualType) {
  return function (value, getter, setter) {
    setter(visualType, this.mapValueToVisual(value));
  };
}

function doMapCategory(normalized) {
  var visual = this.option.visual;
  return visual[this.option.loop && normalized !== CATEGORY_DEFAULT_VISUAL_INDEX ? normalized % visual.length : normalized];
}

function doMapFixed() {
  return this.option.visual[0];
}

function makeDoMap(sourceExtent) {
  return {
    linear: function (normalized) {
      return linearMap(normalized, sourceExtent, this.option.visual, true);
    },
    category: doMapCategory,
    piecewise: function (normalized, value) {
      var result = getSpecifiedVisual.call(this, value);

      if (result == null) {
        result = linearMap(normalized, sourceExtent, this.option.visual, true);
      }

      return result;
    },
    fixed: doMapFixed
  };
}

function getSpecifiedVisual(value) {
  var thisOption = this.option;
  var pieceList = thisOption.pieceList;

  if (thisOption.hasSpecialVisual) {
    var pieceIndex = VisualMapping.findPieceIndex(value, pieceList);
    var piece = pieceList[pieceIndex];

    if (piece && piece.visual) {
      return piece.visual[this.type];
    }
  }
}

function setVisualToOption(thisOption, visualArr) {
  thisOption.visual = visualArr;

  if (thisOption.type === 'color') {
    thisOption.parsedVisual = zrUtil.map(visualArr, function (item) {
      return zrColor.parse(item);
    });
  }

  return visualArr;
}
/**
 * Normalizers by mapping methods.
 */


var normalizers = {
  linear: function (value) {
    return linearMap(value, this.option.dataExtent, [0, 1], true);
  },
  piecewise: function (value) {
    var pieceList = this.option.pieceList;
    var pieceIndex = VisualMapping.findPieceIndex(value, pieceList, true);

    if (pieceIndex != null) {
      return linearMap(pieceIndex, [0, pieceList.length - 1], [0, 1], true);
    }
  },
  category: function (value) {
    var index = this.option.categories ? this.option.categoryMap[value] : value; // ordinal

    return index == null ? CATEGORY_DEFAULT_VISUAL_INDEX : index;
  },
  fixed: zrUtil.noop
};
/**
 * List available visual types.
 *
 * @public
 * @return {Array.<string>}
 */

VisualMapping.listVisualTypes = function () {
  var visualTypes = [];
  zrUtil.each(visualHandlers, function (handler, key) {
    visualTypes.push(key);
  });
  return visualTypes;
};
/**
 * @public
 */


VisualMapping.addVisualHandler = function (name, handler) {
  visualHandlers[name] = handler;
};
/**
 * @public
 */


VisualMapping.isValidType = function (visualType) {
  return visualHandlers.hasOwnProperty(visualType);
};
/**
 * Convinent method.
 * Visual can be Object or Array or primary type.
 *
 * @public
 */


VisualMapping.eachVisual = function (visual, callback, context) {
  if (zrUtil.isObject(visual)) {
    zrUtil.each(visual, callback, context);
  } else {
    callback.call(context, visual);
  }
};

VisualMapping.mapVisual = function (visual, callback, context) {
  var isPrimary;
  var newVisual = zrUtil.isArray(visual) ? [] : zrUtil.isObject(visual) ? {} : (isPrimary = true, null);
  VisualMapping.eachVisual(visual, function (v, key) {
    var newVal = callback.call(context, v, key);
    isPrimary ? newVisual = newVal : newVisual[key] = newVal;
  });
  return newVisual;
};
/**
 * @public
 * @param {Object} obj
 * @return {Object} new object containers visual values.
 *                 If no visuals, return null.
 */


VisualMapping.retrieveVisuals = function (obj) {
  var ret = {};
  var hasVisual;
  obj && each(visualHandlers, function (h, visualType) {
    if (obj.hasOwnProperty(visualType)) {
      ret[visualType] = obj[visualType];
      hasVisual = true;
    }
  });
  return hasVisual ? ret : null;
};
/**
 * Give order to visual types, considering colorSaturation, colorAlpha depends on color.
 *
 * @public
 * @param {(Object|Array)} visualTypes If Object, like: {color: ..., colorSaturation: ...}
 *                                     IF Array, like: ['color', 'symbol', 'colorSaturation']
 * @return {Array.<string>} Sorted visual types.
 */


VisualMapping.prepareVisualTypes = function (visualTypes) {
  if (isObject(visualTypes)) {
    var types = [];
    each(visualTypes, function (item, type) {
      types.push(type);
    });
    visualTypes = types;
  } else if (zrUtil.isArray(visualTypes)) {
    visualTypes = visualTypes.slice();
  } else {
    return [];
  }

  visualTypes.sort(function (type1, type2) {
    // color should be front of colorSaturation, colorAlpha, ...
    // symbol and symbolSize do not matter.
    return type2 === 'color' && type1 !== 'color' && type1.indexOf('color') === 0 ? 1 : -1;
  });
  return visualTypes;
};
/**
 * 'color', 'colorSaturation', 'colorAlpha', ... are depends on 'color'.
 * Other visuals are only depends on themself.
 *
 * @public
 * @param {string} visualType1
 * @param {string} visualType2
 * @return {boolean}
 */


VisualMapping.dependsOn = function (visualType1, visualType2) {
  return visualType2 === 'color' ? !!(visualType1 && visualType1.indexOf(visualType2) === 0) : visualType1 === visualType2;
};
/**
 * @param {number} value
 * @param {Array.<Object>} pieceList [{value: ..., interval: [min, max]}, ...]
 *                         Always from small to big.
 * @param {boolean} [findClosestWhenOutside=false]
 * @return {number} index
 */


VisualMapping.findPieceIndex = function (value, pieceList, findClosestWhenOutside) {
  var possibleI;
  var abs = Infinity; // value has the higher priority.

  for (var i = 0, len = pieceList.length; i < len; i++) {
    var pieceValue = pieceList[i].value;

    if (pieceValue != null) {
      if (pieceValue === value // FIXME
      // It is supposed to compare value according to value type of dimension,
      // but currently value type can exactly be string or number.
      // Compromise for numeric-like string (like '12'), especially
      // in the case that visualMap.categories is ['22', '33'].
      || typeof pieceValue === 'string' && pieceValue === value + '') {
        return i;
      }

      findClosestWhenOutside && updatePossible(pieceValue, i);
    }
  }

  for (var i = 0, len = pieceList.length; i < len; i++) {
    var piece = pieceList[i];
    var interval = piece.interval;
    var close = piece.close;

    if (interval) {
      if (interval[0] === -Infinity) {
        if (littleThan(close[1], value, interval[1])) {
          return i;
        }
      } else if (interval[1] === Infinity) {
        if (littleThan(close[0], interval[0], value)) {
          return i;
        }
      } else if (littleThan(close[0], interval[0], value) && littleThan(close[1], value, interval[1])) {
        return i;
      }

      findClosestWhenOutside && updatePossible(interval[0], i);
      findClosestWhenOutside && updatePossible(interval[1], i);
    }
  }

  if (findClosestWhenOutside) {
    return value === Infinity ? pieceList.length - 1 : value === -Infinity ? 0 : possibleI;
  }

  function updatePossible(val, index) {
    var newAbs = Math.abs(val - value);

    if (newAbs < abs) {
      abs = newAbs;
      possibleI = index;
    }
  }
};

function littleThan(close, a, b) {
  return close ? a <= b : a < b;
}

var _default = VisualMapping;
module.exports = _default;

/***/ }),

/***/ "60e3":
/***/ (function(module, exports, __webpack_require__) {


/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

var zrUtil = __webpack_require__("6d8b");

/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

/**
 * @file Visual mapping.
 */
var visualDefault = {
  /**
   * @public
   */
  get: function (visualType, key, isCategory) {
    var value = zrUtil.clone((defaultOption[visualType] || {})[key]);
    return isCategory ? zrUtil.isArray(value) ? value[value.length - 1] : value : value;
  }
};
var defaultOption = {
  color: {
    active: ['#006edd', '#e0ffff'],
    inactive: ['rgba(0,0,0,0)']
  },
  colorHue: {
    active: [0, 360],
    inactive: [0, 0]
  },
  colorSaturation: {
    active: [0.3, 1],
    inactive: [0, 0]
  },
  colorLightness: {
    active: [0.9, 0.5],
    inactive: [0, 0]
  },
  colorAlpha: {
    active: [0.3, 1],
    inactive: [0, 0]
  },
  opacity: {
    active: [0.3, 1],
    inactive: [0, 0]
  },
  symbol: {
    active: ['circle', 'roundRect', 'diamond'],
    inactive: ['none']
  },
  symbolSize: {
    active: [10, 50],
    inactive: [0, 0]
  }
};
var _default = visualDefault;
module.exports = _default;

/***/ }),

/***/ "625e":
/***/ (function(module, exports, __webpack_require__) {


/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

var _config = __webpack_require__("4e08");

var __DEV__ = _config.__DEV__;

var zrUtil = __webpack_require__("6d8b");

/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/
var TYPE_DELIMITER = '.';
var IS_CONTAINER = '___EC__COMPONENT__CONTAINER___';
/**
 * Notice, parseClassType('') should returns {main: '', sub: ''}
 * @public
 */

function parseClassType(componentType) {
  var ret = {
    main: '',
    sub: ''
  };

  if (componentType) {
    componentType = componentType.split(TYPE_DELIMITER);
    ret.main = componentType[0] || '';
    ret.sub = componentType[1] || '';
  }

  return ret;
}
/**
 * @public
 */


function checkClassType(componentType) {
  zrUtil.assert(/^[a-zA-Z0-9_]+([.][a-zA-Z0-9_]+)?$/.test(componentType), 'componentType "' + componentType + '" illegal');
}
/**
 * @public
 */


function enableClassExtend(RootClass, mandatoryMethods) {
  RootClass.$constructor = RootClass;

  RootClass.extend = function (proto) {
    var superClass = this;

    var ExtendedClass = function () {
      if (!proto.$constructor) {
        superClass.apply(this, arguments);
      } else {
        proto.$constructor.apply(this, arguments);
      }
    };

    zrUtil.extend(ExtendedClass.prototype, proto);
    ExtendedClass.extend = this.extend;
    ExtendedClass.superCall = superCall;
    ExtendedClass.superApply = superApply;
    zrUtil.inherits(ExtendedClass, this);
    ExtendedClass.superClass = superClass;
    return ExtendedClass;
  };
}

var classBase = 0;
/**
 * Can not use instanceof, consider different scope by
 * cross domain or es module import in ec extensions.
 * Mount a method "isInstance()" to Clz.
 */

function enableClassCheck(Clz) {
  var classAttr = ['__\0is_clz', classBase++, Math.random().toFixed(3)].join('_');
  Clz.prototype[classAttr] = true;

  Clz.isInstance = function (obj) {
    return !!(obj && obj[classAttr]);
  };
} // superCall should have class info, which can not be fetch from 'this'.
// Consider this case:
// class A has method f,
// class B inherits class A, overrides method f, f call superApply('f'),
// class C inherits class B, do not overrides method f,
// then when method of class C is called, dead loop occured.


function superCall(context, methodName) {
  var args = zrUtil.slice(arguments, 2);
  return this.superClass.prototype[methodName].apply(context, args);
}

function superApply(context, methodName, args) {
  return this.superClass.prototype[methodName].apply(context, args);
}
/**
 * @param {Object} entity
 * @param {Object} options
 * @param {boolean} [options.registerWhenExtend]
 * @public
 */


function enableClassManagement(entity, options) {
  options = options || {};
  /**
   * Component model classes
   * key: componentType,
   * value:
   *     componentClass, when componentType is 'xxx'
   *     or Object.<subKey, componentClass>, when componentType is 'xxx.yy'
   * @type {Object}
   */

  var storage = {};

  entity.registerClass = function (Clazz, componentType) {
    if (componentType) {
      checkClassType(componentType);
      componentType = parseClassType(componentType);

      if (!componentType.sub) {
        storage[componentType.main] = Clazz;
      } else if (componentType.sub !== IS_CONTAINER) {
        var container = makeContainer(componentType);
        container[componentType.sub] = Clazz;
      }
    }

    return Clazz;
  };

  entity.getClass = function (componentMainType, subType, throwWhenNotFound) {
    var Clazz = storage[componentMainType];

    if (Clazz && Clazz[IS_CONTAINER]) {
      Clazz = subType ? Clazz[subType] : null;
    }

    if (throwWhenNotFound && !Clazz) {
      throw new Error(!subType ? componentMainType + '.' + 'type should be specified.' : 'Component ' + componentMainType + '.' + (subType || '') + ' not exists. Load it first.');
    }

    return Clazz;
  };

  entity.getClassesByMainType = function (componentType) {
    componentType = parseClassType(componentType);
    var result = [];
    var obj = storage[componentType.main];

    if (obj && obj[IS_CONTAINER]) {
      zrUtil.each(obj, function (o, type) {
        type !== IS_CONTAINER && result.push(o);
      });
    } else {
      result.push(obj);
    }

    return result;
  };

  entity.hasClass = function (componentType) {
    // Just consider componentType.main.
    componentType = parseClassType(componentType);
    return !!storage[componentType.main];
  };
  /**
   * @return {Array.<string>} Like ['aa', 'bb'], but can not be ['aa.xx']
   */


  entity.getAllClassMainTypes = function () {
    var types = [];
    zrUtil.each(storage, function (obj, type) {
      types.push(type);
    });
    return types;
  };
  /**
   * If a main type is container and has sub types
   * @param  {string}  mainType
   * @return {boolean}
   */


  entity.hasSubTypes = function (componentType) {
    componentType = parseClassType(componentType);
    var obj = storage[componentType.main];
    return obj && obj[IS_CONTAINER];
  };

  entity.parseClassType = parseClassType;

  function makeContainer(componentType) {
    var container = storage[componentType.main];

    if (!container || !container[IS_CONTAINER]) {
      container = storage[componentType.main] = {};
      container[IS_CONTAINER] = true;
    }

    return container;
  }

  if (options.registerWhenExtend) {
    var originalExtend = entity.extend;

    if (originalExtend) {
      entity.extend = function (proto) {
        var ExtendedClass = originalExtend.call(this, proto);
        return entity.registerClass(ExtendedClass, proto.type);
      };
    }
  }

  return entity;
}
/**
 * @param {string|Array.<string>} properties
 */


function setReadOnly(obj, properties) {// FIXME It seems broken in IE8 simulation of IE11
  // if (!zrUtil.isArray(properties)) {
  //     properties = properties != null ? [properties] : [];
  // }
  // zrUtil.each(properties, function (prop) {
  //     var value = obj[prop];
  //     Object.defineProperty
  //         && Object.defineProperty(obj, prop, {
  //             value: value, writable: false
  //         });
  //     zrUtil.isArray(obj[prop])
  //         && Object.freeze
  //         && Object.freeze(obj[prop]);
  // });
}

exports.parseClassType = parseClassType;
exports.enableClassExtend = enableClassExtend;
exports.enableClassCheck = enableClassCheck;
exports.enableClassManagement = enableClassManagement;
exports.setReadOnly = setReadOnly;

/***/ }),

/***/ "69ff":
/***/ (function(module, exports, __webpack_require__) {


/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

var _util = __webpack_require__("6d8b");

var each = _util.each;
var map = _util.map;
var isFunction = _util.isFunction;
var createHashMap = _util.createHashMap;
var noop = _util.noop;

var _task = __webpack_require__("f47d");

var createTask = _task.createTask;

var _component = __webpack_require__("8918");

var getUID = _component.getUID;

var GlobalModel = __webpack_require__("7e63");

var ExtensionAPI = __webpack_require__("843e");

var _model = __webpack_require__("e0d3");

var normalizeToArray = _model.normalizeToArray;

/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

/**
 * @module echarts/stream/Scheduler
 */

/**
 * @constructor
 */
function Scheduler(ecInstance, api, dataProcessorHandlers, visualHandlers) {
  this.ecInstance = ecInstance;
  this.api = api;
  this.unfinished; // Fix current processors in case that in some rear cases that
  // processors might be registered after echarts instance created.
  // Register processors incrementally for a echarts instance is
  // not supported by this stream architecture.

  var dataProcessorHandlers = this._dataProcessorHandlers = dataProcessorHandlers.slice();
  var visualHandlers = this._visualHandlers = visualHandlers.slice();
  this._allHandlers = dataProcessorHandlers.concat(visualHandlers);
  /**
   * @private
   * @type {
   *     [handlerUID: string]: {
   *         seriesTaskMap?: {
   *             [seriesUID: string]: Task
   *         },
   *         overallTask?: Task
   *     }
   * }
   */

  this._stageTaskMap = createHashMap();
}

var proto = Scheduler.prototype;
/**
 * @param {module:echarts/model/Global} ecModel
 * @param {Object} payload
 */

proto.restoreData = function (ecModel, payload) {
  // TODO: Only restroe needed series and components, but not all components.
  // Currently `restoreData` of all of the series and component will be called.
  // But some independent components like `title`, `legend`, `graphic`, `toolbox`,
  // `tooltip`, `axisPointer`, etc, do not need series refresh when `setOption`,
  // and some components like coordinate system, axes, dataZoom, visualMap only
  // need their target series refresh.
  // (1) If we are implementing this feature some day, we should consider these cases:
  // if a data processor depends on a component (e.g., dataZoomProcessor depends
  // on the settings of `dataZoom`), it should be re-performed if the component
  // is modified by `setOption`.
  // (2) If a processor depends on sevral series, speicified by its `getTargetSeries`,
  // it should be re-performed when the result array of `getTargetSeries` changed.
  // We use `dependencies` to cover these issues.
  // (3) How to update target series when coordinate system related components modified.
  // TODO: simply the dirty mechanism? Check whether only the case here can set tasks dirty,
  // and this case all of the tasks will be set as dirty.
  ecModel.restoreData(payload); // Theoretically an overall task not only depends on each of its target series, but also
  // depends on all of the series.
  // The overall task is not in pipeline, and `ecModel.restoreData` only set pipeline tasks
  // dirty. If `getTargetSeries` of an overall task returns nothing, we should also ensure
  // that the overall task is set as dirty and to be performed, otherwise it probably cause
  // state chaos. So we have to set dirty of all of the overall tasks manually, otherwise it
  // probably cause state chaos (consider `dataZoomProcessor`).

  this._stageTaskMap.each(function (taskRecord) {
    var overallTask = taskRecord.overallTask;
    overallTask && overallTask.dirty();
  });
}; // If seriesModel provided, incremental threshold is check by series data.


proto.getPerformArgs = function (task, isBlock) {
  // For overall task
  if (!task.__pipeline) {
    return;
  }

  var pipeline = this._pipelineMap.get(task.__pipeline.id);

  var pCtx = pipeline.context;
  var incremental = !isBlock && pipeline.progressiveEnabled && (!pCtx || pCtx.progressiveRender) && task.__idxInPipeline > pipeline.blockIndex;
  var step = incremental ? pipeline.step : null;
  var modDataCount = pCtx && pCtx.modDataCount;
  var modBy = modDataCount != null ? Math.ceil(modDataCount / step) : null;
  return {
    step: step,
    modBy: modBy,
    modDataCount: modDataCount
  };
};

proto.getPipeline = function (pipelineId) {
  return this._pipelineMap.get(pipelineId);
};
/**
 * Current, progressive rendering starts from visual and layout.
 * Always detect render mode in the same stage, avoiding that incorrect
 * detection caused by data filtering.
 * Caution:
 * `updateStreamModes` use `seriesModel.getData()`.
 */


proto.updateStreamModes = function (seriesModel, view) {
  var pipeline = this._pipelineMap.get(seriesModel.uid);

  var data = seriesModel.getData();
  var dataLen = data.count(); // `progressiveRender` means that can render progressively in each
  // animation frame. Note that some types of series do not provide
  // `view.incrementalPrepareRender` but support `chart.appendData`. We
  // use the term `incremental` but not `progressive` to describe the
  // case that `chart.appendData`.

  var progressiveRender = pipeline.progressiveEnabled && view.incrementalPrepareRender && dataLen >= pipeline.threshold;
  var large = seriesModel.get('large') && dataLen >= seriesModel.get('largeThreshold'); // TODO: modDataCount should not updated if `appendData`, otherwise cause whole repaint.
  // see `test/candlestick-large3.html`

  var modDataCount = seriesModel.get('progressiveChunkMode') === 'mod' ? dataLen : null;
  seriesModel.pipelineContext = pipeline.context = {
    progressiveRender: progressiveRender,
    modDataCount: modDataCount,
    large: large
  };
};

proto.restorePipelines = function (ecModel) {
  var scheduler = this;
  var pipelineMap = scheduler._pipelineMap = createHashMap();
  ecModel.eachSeries(function (seriesModel) {
    var progressive = seriesModel.getProgressive();
    var pipelineId = seriesModel.uid;
    pipelineMap.set(pipelineId, {
      id: pipelineId,
      head: null,
      tail: null,
      threshold: seriesModel.getProgressiveThreshold(),
      progressiveEnabled: progressive && !(seriesModel.preventIncremental && seriesModel.preventIncremental()),
      blockIndex: -1,
      step: Math.round(progressive || 700),
      count: 0
    });
    pipe(scheduler, seriesModel, seriesModel.dataTask);
  });
};

proto.prepareStageTasks = function () {
  var stageTaskMap = this._stageTaskMap;
  var ecModel = this.ecInstance.getModel();
  var api = this.api;
  each(this._allHandlers, function (handler) {
    var record = stageTaskMap.get(handler.uid) || stageTaskMap.set(handler.uid, []);
    handler.reset && createSeriesStageTask(this, handler, record, ecModel, api);
    handler.overallReset && createOverallStageTask(this, handler, record, ecModel, api);
  }, this);
};

proto.prepareView = function (view, model, ecModel, api) {
  var renderTask = view.renderTask;
  var context = renderTask.context;
  context.model = model;
  context.ecModel = ecModel;
  context.api = api;
  renderTask.__block = !view.incrementalPrepareRender;
  pipe(this, model, renderTask);
};

proto.performDataProcessorTasks = function (ecModel, payload) {
  // If we do not use `block` here, it should be considered when to update modes.
  performStageTasks(this, this._dataProcessorHandlers, ecModel, payload, {
    block: true
  });
}; // opt
// opt.visualType: 'visual' or 'layout'
// opt.setDirty


proto.performVisualTasks = function (ecModel, payload, opt) {
  performStageTasks(this, this._visualHandlers, ecModel, payload, opt);
};

function performStageTasks(scheduler, stageHandlers, ecModel, payload, opt) {
  opt = opt || {};
  var unfinished;
  each(stageHandlers, function (stageHandler, idx) {
    if (opt.visualType && opt.visualType !== stageHandler.visualType) {
      return;
    }

    var stageHandlerRecord = scheduler._stageTaskMap.get(stageHandler.uid);

    var seriesTaskMap = stageHandlerRecord.seriesTaskMap;
    var overallTask = stageHandlerRecord.overallTask;

    if (overallTask) {
      var overallNeedDirty;
      var agentStubMap = overallTask.agentStubMap;
      agentStubMap.each(function (stub) {
        if (needSetDirty(opt, stub)) {
          stub.dirty();
          overallNeedDirty = true;
        }
      });
      overallNeedDirty && overallTask.dirty();
      updatePayload(overallTask, payload);
      var performArgs = scheduler.getPerformArgs(overallTask, opt.block); // Execute stubs firstly, which may set the overall task dirty,
      // then execute the overall task. And stub will call seriesModel.setData,
      // which ensures that in the overallTask seriesModel.getData() will not
      // return incorrect data.

      agentStubMap.each(function (stub) {
        stub.perform(performArgs);
      });
      unfinished |= overallTask.perform(performArgs);
    } else if (seriesTaskMap) {
      seriesTaskMap.each(function (task, pipelineId) {
        if (needSetDirty(opt, task)) {
          task.dirty();
        }

        var performArgs = scheduler.getPerformArgs(task, opt.block);
        performArgs.skip = !stageHandler.performRawSeries && ecModel.isSeriesFiltered(task.context.model);
        updatePayload(task, payload);
        unfinished |= task.perform(performArgs);
      });
    }
  });

  function needSetDirty(opt, task) {
    return opt.setDirty && (!opt.dirtyMap || opt.dirtyMap.get(task.__pipeline.id));
  }

  scheduler.unfinished |= unfinished;
}

proto.performSeriesTasks = function (ecModel) {
  var unfinished;
  ecModel.eachSeries(function (seriesModel) {
    // Progress to the end for dataInit and dataRestore.
    unfinished |= seriesModel.dataTask.perform();
  });
  this.unfinished |= unfinished;
};

proto.plan = function () {
  // Travel pipelines, check block.
  this._pipelineMap.each(function (pipeline) {
    var task = pipeline.tail;

    do {
      if (task.__block) {
        pipeline.blockIndex = task.__idxInPipeline;
        break;
      }

      task = task.getUpstream();
    } while (task);
  });
};

var updatePayload = proto.updatePayload = function (task, payload) {
  payload !== 'remain' && (task.context.payload = payload);
};

function createSeriesStageTask(scheduler, stageHandler, stageHandlerRecord, ecModel, api) {
  var seriesTaskMap = stageHandlerRecord.seriesTaskMap || (stageHandlerRecord.seriesTaskMap = createHashMap());
  var seriesType = stageHandler.seriesType;
  var getTargetSeries = stageHandler.getTargetSeries; // If a stageHandler should cover all series, `createOnAllSeries` should be declared mandatorily,
  // to avoid some typo or abuse. Otherwise if an extension do not specify a `seriesType`,
  // it works but it may cause other irrelevant charts blocked.

  if (stageHandler.createOnAllSeries) {
    ecModel.eachRawSeries(create);
  } else if (seriesType) {
    ecModel.eachRawSeriesByType(seriesType, create);
  } else if (getTargetSeries) {
    getTargetSeries(ecModel, api).each(create);
  }

  function create(seriesModel) {
    var pipelineId = seriesModel.uid; // Init tasks for each seriesModel only once.
    // Reuse original task instance.

    var task = seriesTaskMap.get(pipelineId) || seriesTaskMap.set(pipelineId, createTask({
      plan: seriesTaskPlan,
      reset: seriesTaskReset,
      count: seriesTaskCount
    }));
    task.context = {
      model: seriesModel,
      ecModel: ecModel,
      api: api,
      useClearVisual: stageHandler.isVisual && !stageHandler.isLayout,
      plan: stageHandler.plan,
      reset: stageHandler.reset,
      scheduler: scheduler
    };
    pipe(scheduler, seriesModel, task);
  } // Clear unused series tasks.


  var pipelineMap = scheduler._pipelineMap;
  seriesTaskMap.each(function (task, pipelineId) {
    if (!pipelineMap.get(pipelineId)) {
      task.dispose();
      seriesTaskMap.removeKey(pipelineId);
    }
  });
}

function createOverallStageTask(scheduler, stageHandler, stageHandlerRecord, ecModel, api) {
  var overallTask = stageHandlerRecord.overallTask = stageHandlerRecord.overallTask // For overall task, the function only be called on reset stage.
  || createTask({
    reset: overallTaskReset
  });
  overallTask.context = {
    ecModel: ecModel,
    api: api,
    overallReset: stageHandler.overallReset,
    scheduler: scheduler
  }; // Reuse orignal stubs.

  var agentStubMap = overallTask.agentStubMap = overallTask.agentStubMap || createHashMap();
  var seriesType = stageHandler.seriesType;
  var getTargetSeries = stageHandler.getTargetSeries;
  var overallProgress = true;
  var modifyOutputEnd = stageHandler.modifyOutputEnd; // An overall task with seriesType detected or has `getTargetSeries`, we add
  // stub in each pipelines, it will set the overall task dirty when the pipeline
  // progress. Moreover, to avoid call the overall task each frame (too frequent),
  // we set the pipeline block.

  if (seriesType) {
    ecModel.eachRawSeriesByType(seriesType, createStub);
  } else if (getTargetSeries) {
    getTargetSeries(ecModel, api).each(createStub);
  } // Otherwise, (usually it is legancy case), the overall task will only be
  // executed when upstream dirty. Otherwise the progressive rendering of all
  // pipelines will be disabled unexpectedly. But it still needs stubs to receive
  // dirty info from upsteam.
  else {
      overallProgress = false;
      each(ecModel.getSeries(), createStub);
    }

  function createStub(seriesModel) {
    var pipelineId = seriesModel.uid;
    var stub = agentStubMap.get(pipelineId);

    if (!stub) {
      stub = agentStubMap.set(pipelineId, createTask({
        reset: stubReset,
        onDirty: stubOnDirty
      })); // When the result of `getTargetSeries` changed, the overallTask
      // should be set as dirty and re-performed.

      overallTask.dirty();
    }

    stub.context = {
      model: seriesModel,
      overallProgress: overallProgress,
      modifyOutputEnd: modifyOutputEnd
    };
    stub.agent = overallTask;
    stub.__block = overallProgress;
    pipe(scheduler, seriesModel, stub);
  } // Clear unused stubs.


  var pipelineMap = scheduler._pipelineMap;
  agentStubMap.each(function (stub, pipelineId) {
    if (!pipelineMap.get(pipelineId)) {
      stub.dispose(); // When the result of `getTargetSeries` changed, the overallTask
      // should be set as dirty and re-performed.

      overallTask.dirty();
      agentStubMap.removeKey(pipelineId);
    }
  });
}

function overallTaskReset(context) {
  context.overallReset(context.ecModel, context.api, context.payload);
}

function stubReset(context, upstreamContext) {
  return context.overallProgress && stubProgress;
}

function stubProgress() {
  this.agent.dirty();
  this.getDownstream().dirty();
}

function stubOnDirty() {
  this.agent && this.agent.dirty();
}

function seriesTaskPlan(context) {
  return context.plan && context.plan(context.model, context.ecModel, context.api, context.payload);
}

function seriesTaskReset(context) {
  if (context.useClearVisual) {
    context.data.clearAllVisual();
  }

  var resetDefines = context.resetDefines = normalizeToArray(context.reset(context.model, context.ecModel, context.api, context.payload));
  return resetDefines.length > 1 ? map(resetDefines, function (v, idx) {
    return makeSeriesTaskProgress(idx);
  }) : singleSeriesTaskProgress;
}

var singleSeriesTaskProgress = makeSeriesTaskProgress(0);

function makeSeriesTaskProgress(resetDefineIdx) {
  return function (params, context) {
    var data = context.data;
    var resetDefine = context.resetDefines[resetDefineIdx];

    if (resetDefine && resetDefine.dataEach) {
      for (var i = params.start; i < params.end; i++) {
        resetDefine.dataEach(data, i);
      }
    } else if (resetDefine && resetDefine.progress) {
      resetDefine.progress(params, data);
    }
  };
}

function seriesTaskCount(context) {
  return context.data.count();
}

function pipe(scheduler, seriesModel, task) {
  var pipelineId = seriesModel.uid;

  var pipeline = scheduler._pipelineMap.get(pipelineId);

  !pipeline.head && (pipeline.head = task);
  pipeline.tail && pipeline.tail.pipe(task);
  pipeline.tail = task;
  task.__idxInPipeline = pipeline.count++;
  task.__pipeline = pipeline;
}

Scheduler.wrapStageHandler = function (stageHandler, visualType) {
  if (isFunction(stageHandler)) {
    stageHandler = {
      overallReset: stageHandler,
      seriesType: detectSeriseType(stageHandler)
    };
  }

  stageHandler.uid = getUID('stageHandler');
  visualType && (stageHandler.visualType = visualType);
  return stageHandler;
};
/**
 * Only some legacy stage handlers (usually in echarts extensions) are pure function.
 * To ensure that they can work normally, they should work in block mode, that is,
 * they should not be started util the previous tasks finished. So they cause the
 * progressive rendering disabled. We try to detect the series type, to narrow down
 * the block range to only the series type they concern, but not all series.
 */


function detectSeriseType(legacyFunc) {
  seriesType = null;

  try {
    // Assume there is no async when calling `eachSeriesByType`.
    legacyFunc(ecModelMock, apiMock);
  } catch (e) {}

  return seriesType;
}

var ecModelMock = {};
var apiMock = {};
var seriesType;
mockMethods(ecModelMock, GlobalModel);
mockMethods(apiMock, ExtensionAPI);

ecModelMock.eachSeriesByType = ecModelMock.eachRawSeriesByType = function (type) {
  seriesType = type;
};

ecModelMock.eachComponent = function (cond) {
  if (cond.mainType === 'series' && cond.subType) {
    seriesType = cond.subType;
  }
};

function mockMethods(target, Clz) {
  /* eslint-disable */
  for (var name in Clz.prototype) {
    // Do not use hasOwnProperty
    target[name] = noop;
  }
  /* eslint-enable */

}

var _default = Scheduler;
module.exports = _default;

/***/ }),

/***/ "6cb7":
/***/ (function(module, exports, __webpack_require__) {


/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

var zrUtil = __webpack_require__("6d8b");

var Model = __webpack_require__("4319");

var componentUtil = __webpack_require__("8918");

var _clazz = __webpack_require__("625e");

var enableClassManagement = _clazz.enableClassManagement;
var parseClassType = _clazz.parseClassType;

var _model = __webpack_require__("e0d3");

var makeInner = _model.makeInner;

var layout = __webpack_require__("f934");

var boxLayoutMixin = __webpack_require__("de1c");

/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

/**
 * Component model
 *
 * @module echarts/model/Component
 */
var inner = makeInner();
/**
 * @alias module:echarts/model/Component
 * @constructor
 * @param {Object} option
 * @param {module:echarts/model/Model} parentModel
 * @param {module:echarts/model/Model} ecModel
 */

var ComponentModel = Model.extend({
  type: 'component',

  /**
   * @readOnly
   * @type {string}
   */
  id: '',

  /**
   * Because simplified concept is probably better, series.name (or component.name)
   * has been having too many resposibilities:
   * (1) Generating id (which requires name in option should not be modified).
   * (2) As an index to mapping series when merging option or calling API (a name
   * can refer to more then one components, which is convinient is some case).
   * (3) Display.
   * @readOnly
   */
  name: '',

  /**
   * @readOnly
   * @type {string}
   */
  mainType: '',

  /**
   * @readOnly
   * @type {string}
   */
  subType: '',

  /**
   * @readOnly
   * @type {number}
   */
  componentIndex: 0,

  /**
   * @type {Object}
   * @protected
   */
  defaultOption: null,

  /**
   * @type {module:echarts/model/Global}
   * @readOnly
   */
  ecModel: null,

  /**
   * key: componentType
   * value:  Component model list, can not be null.
   * @type {Object.<string, Array.<module:echarts/model/Model>>}
   * @readOnly
   */
  dependentModels: [],

  /**
   * @type {string}
   * @readOnly
   */
  uid: null,

  /**
   * Support merge layout params.
   * Only support 'box' now (left/right/top/bottom/width/height).
   * @type {string|Object} Object can be {ignoreSize: true}
   * @readOnly
   */
  layoutMode: null,
  $constructor: function (option, parentModel, ecModel, extraOpt) {
    Model.call(this, option, parentModel, ecModel, extraOpt);
    this.uid = componentUtil.getUID('ec_cpt_model');
  },
  init: function (option, parentModel, ecModel, extraOpt) {
    this.mergeDefaultAndTheme(option, ecModel);
  },
  mergeDefaultAndTheme: function (option, ecModel) {
    var layoutMode = this.layoutMode;
    var inputPositionParams = layoutMode ? layout.getLayoutParams(option) : {};
    var themeModel = ecModel.getTheme();
    zrUtil.merge(option, themeModel.get(this.mainType));
    zrUtil.merge(option, this.getDefaultOption());

    if (layoutMode) {
      layout.mergeLayoutParam(option, inputPositionParams, layoutMode);
    }
  },
  mergeOption: function (option, extraOpt) {
    zrUtil.merge(this.option, option, true);
    var layoutMode = this.layoutMode;

    if (layoutMode) {
      layout.mergeLayoutParam(this.option, option, layoutMode);
    }
  },
  // Hooker after init or mergeOption
  optionUpdated: function (newCptOption, isInit) {},
  getDefaultOption: function () {
    var fields = inner(this);

    if (!fields.defaultOption) {
      var optList = [];
      var Class = this.constructor;

      while (Class) {
        var opt = Class.prototype.defaultOption;
        opt && optList.push(opt);
        Class = Class.superClass;
      }

      var defaultOption = {};

      for (var i = optList.length - 1; i >= 0; i--) {
        defaultOption = zrUtil.merge(defaultOption, optList[i], true);
      }

      fields.defaultOption = defaultOption;
    }

    return fields.defaultOption;
  },
  getReferringComponents: function (mainType) {
    return this.ecModel.queryComponents({
      mainType: mainType,
      index: this.get(mainType + 'Index', true),
      id: this.get(mainType + 'Id', true)
    });
  }
}); // Reset ComponentModel.extend, add preConstruct.
// clazzUtil.enableClassExtend(
//     ComponentModel,
//     function (option, parentModel, ecModel, extraOpt) {
//         // Set dependentModels, componentIndex, name, id, mainType, subType.
//         zrUtil.extend(this, extraOpt);
//         this.uid = componentUtil.getUID('componentModel');
//         // this.setReadOnly([
//         //     'type', 'id', 'uid', 'name', 'mainType', 'subType',
//         //     'dependentModels', 'componentIndex'
//         // ]);
//     }
// );
// Add capability of registerClass, getClass, hasClass, registerSubTypeDefaulter and so on.

enableClassManagement(ComponentModel, {
  registerWhenExtend: true
});
componentUtil.enableSubTypeDefaulter(ComponentModel); // Add capability of ComponentModel.topologicalTravel.

componentUtil.enableTopologicalTravel(ComponentModel, getDependencies);

function getDependencies(componentType) {
  var deps = [];
  zrUtil.each(ComponentModel.getClassesByMainType(componentType), function (Clazz) {
    deps = deps.concat(Clazz.prototype.dependencies || []);
  }); // Ensure main type.

  deps = zrUtil.map(deps, function (type) {
    return parseClassType(type).main;
  }); // Hack dataset for convenience.

  if (componentType !== 'dataset' && zrUtil.indexOf(deps, 'dataset') <= 0) {
    deps.unshift('dataset');
  }

  return deps;
}

zrUtil.mixin(ComponentModel, boxLayoutMixin);
var _default = ComponentModel;
module.exports = _default;

/***/ }),

/***/ "7e63":
/***/ (function(module, exports, __webpack_require__) {


/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

var _config = __webpack_require__("4e08");

var __DEV__ = _config.__DEV__;

var _util = __webpack_require__("6d8b");

var each = _util.each;
var filter = _util.filter;
var map = _util.map;
var isArray = _util.isArray;
var indexOf = _util.indexOf;
var isObject = _util.isObject;
var isString = _util.isString;
var createHashMap = _util.createHashMap;
var assert = _util.assert;
var clone = _util.clone;
var merge = _util.merge;
var extend = _util.extend;
var mixin = _util.mixin;

var modelUtil = __webpack_require__("e0d3");

var Model = __webpack_require__("4319");

var ComponentModel = __webpack_require__("6cb7");

var globalDefault = __webpack_require__("8971");

var colorPaletteMixin = __webpack_require__("e47b");

var _sourceHelper = __webpack_require__("0f99");

var resetSourceDefaulter = _sourceHelper.resetSourceDefaulter;

/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

/**
 * ECharts global model
 *
 * @module {echarts/model/Global}
 */

/**
 * Caution: If the mechanism should be changed some day, these cases
 * should be considered:
 *
 * (1) In `merge option` mode, if using the same option to call `setOption`
 * many times, the result should be the same (try our best to ensure that).
 * (2) In `merge option` mode, if a component has no id/name specified, it
 * will be merged by index, and the result sequence of the components is
 * consistent to the original sequence.
 * (3) `reset` feature (in toolbox). Find detailed info in comments about
 * `mergeOption` in module:echarts/model/OptionManager.
 */
var OPTION_INNER_KEY = '\0_ec_inner';
/**
 * @alias module:echarts/model/Global
 *
 * @param {Object} option
 * @param {module:echarts/model/Model} parentModel
 * @param {Object} theme
 */

var GlobalModel = Model.extend({
  init: function (option, parentModel, theme, optionManager) {
    theme = theme || {};
    this.option = null; // Mark as not initialized.

    /**
     * @type {module:echarts/model/Model}
     * @private
     */

    this._theme = new Model(theme);
    /**
     * @type {module:echarts/model/OptionManager}
     */

    this._optionManager = optionManager;
  },
  setOption: function (option, optionPreprocessorFuncs) {
    assert(!(OPTION_INNER_KEY in option), 'please use chart.getOption()');

    this._optionManager.setOption(option, optionPreprocessorFuncs);

    this.resetOption(null);
  },

  /**
   * @param {string} type null/undefined: reset all.
   *                      'recreate': force recreate all.
   *                      'timeline': only reset timeline option
   *                      'media': only reset media query option
   * @return {boolean} Whether option changed.
   */
  resetOption: function (type) {
    var optionChanged = false;
    var optionManager = this._optionManager;

    if (!type || type === 'recreate') {
      var baseOption = optionManager.mountOption(type === 'recreate');

      if (!this.option || type === 'recreate') {
        initBase.call(this, baseOption);
      } else {
        this.restoreData();
        this.mergeOption(baseOption);
      }

      optionChanged = true;
    }

    if (type === 'timeline' || type === 'media') {
      this.restoreData();
    }

    if (!type || type === 'recreate' || type === 'timeline') {
      var timelineOption = optionManager.getTimelineOption(this);
      timelineOption && (this.mergeOption(timelineOption), optionChanged = true);
    }

    if (!type || type === 'recreate' || type === 'media') {
      var mediaOptions = optionManager.getMediaOption(this, this._api);

      if (mediaOptions.length) {
        each(mediaOptions, function (mediaOption) {
          this.mergeOption(mediaOption, optionChanged = true);
        }, this);
      }
    }

    return optionChanged;
  },

  /**
   * @protected
   */
  mergeOption: function (newOption) {
    var option = this.option;
    var componentsMap = this._componentsMap;
    var newCptTypes = [];
    resetSourceDefaulter(this); // If no component class, merge directly.
    // For example: color, animaiton options, etc.

    each(newOption, function (componentOption, mainType) {
      if (componentOption == null) {
        return;
      }

      if (!ComponentModel.hasClass(mainType)) {
        // globalSettingTask.dirty();
        option[mainType] = option[mainType] == null ? clone(componentOption) : merge(option[mainType], componentOption, true);
      } else if (mainType) {
        newCptTypes.push(mainType);
      }
    });
    ComponentModel.topologicalTravel(newCptTypes, ComponentModel.getAllClassMainTypes(), visitComponent, this);

    function visitComponent(mainType, dependencies) {
      var newCptOptionList = modelUtil.normalizeToArray(newOption[mainType]);
      var mapResult = modelUtil.mappingToExists(componentsMap.get(mainType), newCptOptionList);
      modelUtil.makeIdAndName(mapResult); // Set mainType and complete subType.

      each(mapResult, function (item, index) {
        var opt = item.option;

        if (isObject(opt)) {
          item.keyInfo.mainType = mainType;
          item.keyInfo.subType = determineSubType(mainType, opt, item.exist);
        }
      });
      var dependentModels = getComponentsByTypes(componentsMap, dependencies);
      option[mainType] = [];
      componentsMap.set(mainType, []);
      each(mapResult, function (resultItem, index) {
        var componentModel = resultItem.exist;
        var newCptOption = resultItem.option;
        assert(isObject(newCptOption) || componentModel, 'Empty component definition'); // Consider where is no new option and should be merged using {},
        // see removeEdgeAndAdd in topologicalTravel and
        // ComponentModel.getAllClassMainTypes.

        if (!newCptOption) {
          componentModel.mergeOption({}, this);
          componentModel.optionUpdated({}, false);
        } else {
          var ComponentModelClass = ComponentModel.getClass(mainType, resultItem.keyInfo.subType, true);

          if (componentModel && componentModel.constructor === ComponentModelClass) {
            componentModel.name = resultItem.keyInfo.name; // componentModel.settingTask && componentModel.settingTask.dirty();

            componentModel.mergeOption(newCptOption, this);
            componentModel.optionUpdated(newCptOption, false);
          } else {
            // PENDING Global as parent ?
            var extraOpt = extend({
              dependentModels: dependentModels,
              componentIndex: index
            }, resultItem.keyInfo);
            componentModel = new ComponentModelClass(newCptOption, this, this, extraOpt);
            extend(componentModel, extraOpt);
            componentModel.init(newCptOption, this, this, extraOpt); // Call optionUpdated after init.
            // newCptOption has been used as componentModel.option
            // and may be merged with theme and default, so pass null
            // to avoid confusion.

            componentModel.optionUpdated(null, true);
          }
        }

        componentsMap.get(mainType)[index] = componentModel;
        option[mainType][index] = componentModel.option;
      }, this); // Backup series for filtering.

      if (mainType === 'series') {
        createSeriesIndices(this, componentsMap.get('series'));
      }
    }

    this._seriesIndicesMap = createHashMap(this._seriesIndices = this._seriesIndices || []);
  },

  /**
   * Get option for output (cloned option and inner info removed)
   * @public
   * @return {Object}
   */
  getOption: function () {
    var option = clone(this.option);
    each(option, function (opts, mainType) {
      if (ComponentModel.hasClass(mainType)) {
        var opts = modelUtil.normalizeToArray(opts);

        for (var i = opts.length - 1; i >= 0; i--) {
          // Remove options with inner id.
          if (modelUtil.isIdInner(opts[i])) {
            opts.splice(i, 1);
          }
        }

        option[mainType] = opts;
      }
    });
    delete option[OPTION_INNER_KEY];
    return option;
  },

  /**
   * @return {module:echarts/model/Model}
   */
  getTheme: function () {
    return this._theme;
  },

  /**
   * @param {string} mainType
   * @param {number} [idx=0]
   * @return {module:echarts/model/Component}
   */
  getComponent: function (mainType, idx) {
    var list = this._componentsMap.get(mainType);

    if (list) {
      return list[idx || 0];
    }
  },

  /**
   * If none of index and id and name used, return all components with mainType.
   * @param {Object} condition
   * @param {string} condition.mainType
   * @param {string} [condition.subType] If ignore, only query by mainType
   * @param {number|Array.<number>} [condition.index] Either input index or id or name.
   * @param {string|Array.<string>} [condition.id] Either input index or id or name.
   * @param {string|Array.<string>} [condition.name] Either input index or id or name.
   * @return {Array.<module:echarts/model/Component>}
   */
  queryComponents: function (condition) {
    var mainType = condition.mainType;

    if (!mainType) {
      return [];
    }

    var index = condition.index;
    var id = condition.id;
    var name = condition.name;

    var cpts = this._componentsMap.get(mainType);

    if (!cpts || !cpts.length) {
      return [];
    }

    var result;

    if (index != null) {
      if (!isArray(index)) {
        index = [index];
      }

      result = filter(map(index, function (idx) {
        return cpts[idx];
      }), function (val) {
        return !!val;
      });
    } else if (id != null) {
      var isIdArray = isArray(id);
      result = filter(cpts, function (cpt) {
        return isIdArray && indexOf(id, cpt.id) >= 0 || !isIdArray && cpt.id === id;
      });
    } else if (name != null) {
      var isNameArray = isArray(name);
      result = filter(cpts, function (cpt) {
        return isNameArray && indexOf(name, cpt.name) >= 0 || !isNameArray && cpt.name === name;
      });
    } else {
      // Return all components with mainType
      result = cpts.slice();
    }

    return filterBySubType(result, condition);
  },

  /**
   * The interface is different from queryComponents,
   * which is convenient for inner usage.
   *
   * @usage
   * var result = findComponents(
   *     {mainType: 'dataZoom', query: {dataZoomId: 'abc'}}
   * );
   * var result = findComponents(
   *     {mainType: 'series', subType: 'pie', query: {seriesName: 'uio'}}
   * );
   * var result = findComponents(
   *     {mainType: 'series',
   *     filter: function (model, index) {...}}
   * );
   * // result like [component0, componnet1, ...]
   *
   * @param {Object} condition
   * @param {string} condition.mainType Mandatory.
   * @param {string} [condition.subType] Optional.
   * @param {Object} [condition.query] like {xxxIndex, xxxId, xxxName},
   *        where xxx is mainType.
   *        If query attribute is null/undefined or has no index/id/name,
   *        do not filtering by query conditions, which is convenient for
   *        no-payload situations or when target of action is global.
   * @param {Function} [condition.filter] parameter: component, return boolean.
   * @return {Array.<module:echarts/model/Component>}
   */
  findComponents: function (condition) {
    var query = condition.query;
    var mainType = condition.mainType;
    var queryCond = getQueryCond(query);
    var result = queryCond ? this.queryComponents(queryCond) : this._componentsMap.get(mainType);
    return doFilter(filterBySubType(result, condition));

    function getQueryCond(q) {
      var indexAttr = mainType + 'Index';
      var idAttr = mainType + 'Id';
      var nameAttr = mainType + 'Name';
      return q && (q[indexAttr] != null || q[idAttr] != null || q[nameAttr] != null) ? {
        mainType: mainType,
        // subType will be filtered finally.
        index: q[indexAttr],
        id: q[idAttr],
        name: q[nameAttr]
      } : null;
    }

    function doFilter(res) {
      return condition.filter ? filter(res, condition.filter) : res;
    }
  },

  /**
   * @usage
   * eachComponent('legend', function (legendModel, index) {
   *     ...
   * });
   * eachComponent(function (componentType, model, index) {
   *     // componentType does not include subType
   *     // (componentType is 'xxx' but not 'xxx.aa')
   * });
   * eachComponent(
   *     {mainType: 'dataZoom', query: {dataZoomId: 'abc'}},
   *     function (model, index) {...}
   * );
   * eachComponent(
   *     {mainType: 'series', subType: 'pie', query: {seriesName: 'uio'}},
   *     function (model, index) {...}
   * );
   *
   * @param {string|Object=} mainType When mainType is object, the definition
   *                                  is the same as the method 'findComponents'.
   * @param {Function} cb
   * @param {*} context
   */
  eachComponent: function (mainType, cb, context) {
    var componentsMap = this._componentsMap;

    if (typeof mainType === 'function') {
      context = cb;
      cb = mainType;
      componentsMap.each(function (components, componentType) {
        each(components, function (component, index) {
          cb.call(context, componentType, component, index);
        });
      });
    } else if (isString(mainType)) {
      each(componentsMap.get(mainType), cb, context);
    } else if (isObject(mainType)) {
      var queryResult = this.findComponents(mainType);
      each(queryResult, cb, context);
    }
  },

  /**
   * @param {string} name
   * @return {Array.<module:echarts/model/Series>}
   */
  getSeriesByName: function (name) {
    var series = this._componentsMap.get('series');

    return filter(series, function (oneSeries) {
      return oneSeries.name === name;
    });
  },

  /**
   * @param {number} seriesIndex
   * @return {module:echarts/model/Series}
   */
  getSeriesByIndex: function (seriesIndex) {
    return this._componentsMap.get('series')[seriesIndex];
  },

  /**
   * Get series list before filtered by type.
   * FIXME: rename to getRawSeriesByType?
   *
   * @param {string} subType
   * @return {Array.<module:echarts/model/Series>}
   */
  getSeriesByType: function (subType) {
    var series = this._componentsMap.get('series');

    return filter(series, function (oneSeries) {
      return oneSeries.subType === subType;
    });
  },

  /**
   * @return {Array.<module:echarts/model/Series>}
   */
  getSeries: function () {
    return this._componentsMap.get('series').slice();
  },

  /**
   * @return {number}
   */
  getSeriesCount: function () {
    return this._componentsMap.get('series').length;
  },

  /**
   * After filtering, series may be different
   * frome raw series.
   *
   * @param {Function} cb
   * @param {*} context
   */
  eachSeries: function (cb, context) {
    assertSeriesInitialized(this);
    each(this._seriesIndices, function (rawSeriesIndex) {
      var series = this._componentsMap.get('series')[rawSeriesIndex];

      cb.call(context, series, rawSeriesIndex);
    }, this);
  },

  /**
   * Iterate raw series before filtered.
   *
   * @param {Function} cb
   * @param {*} context
   */
  eachRawSeries: function (cb, context) {
    each(this._componentsMap.get('series'), cb, context);
  },

  /**
   * After filtering, series may be different.
   * frome raw series.
   *
   * @param {string} subType.
   * @param {Function} cb
   * @param {*} context
   */
  eachSeriesByType: function (subType, cb, context) {
    assertSeriesInitialized(this);
    each(this._seriesIndices, function (rawSeriesIndex) {
      var series = this._componentsMap.get('series')[rawSeriesIndex];

      if (series.subType === subType) {
        cb.call(context, series, rawSeriesIndex);
      }
    }, this);
  },

  /**
   * Iterate raw series before filtered of given type.
   *
   * @parma {string} subType
   * @param {Function} cb
   * @param {*} context
   */
  eachRawSeriesByType: function (subType, cb, context) {
    return each(this.getSeriesByType(subType), cb, context);
  },

  /**
   * @param {module:echarts/model/Series} seriesModel
   */
  isSeriesFiltered: function (seriesModel) {
    assertSeriesInitialized(this);
    return this._seriesIndicesMap.get(seriesModel.componentIndex) == null;
  },

  /**
   * @return {Array.<number>}
   */
  getCurrentSeriesIndices: function () {
    return (this._seriesIndices || []).slice();
  },

  /**
   * @param {Function} cb
   * @param {*} context
   */
  filterSeries: function (cb, context) {
    assertSeriesInitialized(this);
    var filteredSeries = filter(this._componentsMap.get('series'), cb, context);
    createSeriesIndices(this, filteredSeries);
  },
  restoreData: function (payload) {
    var componentsMap = this._componentsMap;
    createSeriesIndices(this, componentsMap.get('series'));
    var componentTypes = [];
    componentsMap.each(function (components, componentType) {
      componentTypes.push(componentType);
    });
    ComponentModel.topologicalTravel(componentTypes, ComponentModel.getAllClassMainTypes(), function (componentType, dependencies) {
      each(componentsMap.get(componentType), function (component) {
        (componentType !== 'series' || !isNotTargetSeries(component, payload)) && component.restoreData();
      });
    });
  }
});

function isNotTargetSeries(seriesModel, payload) {
  if (payload) {
    var index = payload.seiresIndex;
    var id = payload.seriesId;
    var name = payload.seriesName;
    return index != null && seriesModel.componentIndex !== index || id != null && seriesModel.id !== id || name != null && seriesModel.name !== name;
  }
}
/**
 * @inner
 */


function mergeTheme(option, theme) {
  // PENDING
  // NOT use `colorLayer` in theme if option has `color`
  var notMergeColorLayer = option.color && !option.colorLayer;
  each(theme, function (themeItem, name) {
    if (name === 'colorLayer' && notMergeColorLayer) {
      return;
    } // 如果有 component model 则把具体的 merge 逻辑交给该 model 处理


    if (!ComponentModel.hasClass(name)) {
      if (typeof themeItem === 'object') {
        option[name] = !option[name] ? clone(themeItem) : merge(option[name], themeItem, false);
      } else {
        if (option[name] == null) {
          option[name] = themeItem;
        }
      }
    }
  });
}

function initBase(baseOption) {
  baseOption = baseOption; // Using OPTION_INNER_KEY to mark that this option can not be used outside,
  // i.e. `chart.setOption(chart.getModel().option);` is forbiden.

  this.option = {};
  this.option[OPTION_INNER_KEY] = 1;
  /**
   * Init with series: [], in case of calling findSeries method
   * before series initialized.
   * @type {Object.<string, Array.<module:echarts/model/Model>>}
   * @private
   */

  this._componentsMap = createHashMap({
    series: []
  });
  /**
   * Mapping between filtered series list and raw series list.
   * key: filtered series indices, value: raw series indices.
   * @type {Array.<nubmer>}
   * @private
   */

  this._seriesIndices;
  this._seriesIndicesMap;
  mergeTheme(baseOption, this._theme.option); // TODO Needs clone when merging to the unexisted property

  merge(baseOption, globalDefault, false);
  this.mergeOption(baseOption);
}
/**
 * @inner
 * @param {Array.<string>|string} types model types
 * @return {Object} key: {string} type, value: {Array.<Object>} models
 */


function getComponentsByTypes(componentsMap, types) {
  if (!isArray(types)) {
    types = types ? [types] : [];
  }

  var ret = {};
  each(types, function (type) {
    ret[type] = (componentsMap.get(type) || []).slice();
  });
  return ret;
}
/**
 * @inner
 */


function determineSubType(mainType, newCptOption, existComponent) {
  var subType = newCptOption.type ? newCptOption.type : existComponent ? existComponent.subType // Use determineSubType only when there is no existComponent.
  : ComponentModel.determineSubType(mainType, newCptOption); // tooltip, markline, markpoint may always has no subType

  return subType;
}
/**
 * @inner
 */


function createSeriesIndices(ecModel, seriesModels) {
  ecModel._seriesIndicesMap = createHashMap(ecModel._seriesIndices = map(seriesModels, function (series) {
    return series.componentIndex;
  }) || []);
}
/**
 * @inner
 */


function filterBySubType(components, condition) {
  // Using hasOwnProperty for restrict. Consider
  // subType is undefined in user payload.
  return condition.hasOwnProperty('subType') ? filter(components, function (cpt) {
    return cpt.subType === condition.subType;
  }) : components;
}
/**
 * @inner
 */


function assertSeriesInitialized(ecModel) {}

mixin(GlobalModel, colorPaletteMixin);
var _default = GlobalModel;
module.exports = _default;

/***/ }),

/***/ "7f96":
/***/ (function(module, exports, __webpack_require__) {


/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

var _util = __webpack_require__("6d8b");

var isFunction = _util.isFunction;

/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/
function _default(seriesType, defaultSymbolType, legendSymbol) {
  // Encoding visual for all series include which is filtered for legend drawing
  return {
    seriesType: seriesType,
    // For legend.
    performRawSeries: true,
    reset: function (seriesModel, ecModel, api) {
      var data = seriesModel.getData();
      var symbolType = seriesModel.get('symbol');
      var symbolSize = seriesModel.get('symbolSize');
      var keepAspect = seriesModel.get('symbolKeepAspect');
      var hasSymbolTypeCallback = isFunction(symbolType);
      var hasSymbolSizeCallback = isFunction(symbolSize);
      var hasCallback = hasSymbolTypeCallback || hasSymbolSizeCallback;
      var seriesSymbol = !hasSymbolTypeCallback && symbolType ? symbolType : defaultSymbolType;
      var seriesSymbolSize = !hasSymbolSizeCallback ? symbolSize : null;
      data.setVisual({
        legendSymbol: legendSymbol || seriesSymbol,
        // If seting callback functions on `symbol` or `symbolSize`, for simplicity and avoiding
        // to bring trouble, we do not pick a reuslt from one of its calling on data item here,
        // but just use the default value. Callback on `symbol` or `symbolSize` is convenient in
        // some cases but generally it is not recommanded.
        symbol: seriesSymbol,
        symbolSize: seriesSymbolSize,
        symbolKeepAspect: keepAspect
      }); // Only visible series has each data be visual encoded

      if (ecModel.isSeriesFiltered(seriesModel)) {
        return;
      }

      function dataEach(data, idx) {
        if (hasCallback) {
          var rawValue = seriesModel.getRawValue(idx);
          var params = seriesModel.getDataParams(idx);
          hasSymbolTypeCallback && data.setItemVisual(idx, 'symbol', symbolType(rawValue, params));
          hasSymbolSizeCallback && data.setItemVisual(idx, 'symbolSize', symbolSize(rawValue, params));
        }

        if (data.hasItemOption) {
          var itemModel = data.getItemModel(idx);
          var itemSymbolType = itemModel.getShallow('symbol', true);
          var itemSymbolSize = itemModel.getShallow('symbolSize', true);
          var itemSymbolKeepAspect = itemModel.getShallow('symbolKeepAspect', true); // If has item symbol

          if (itemSymbolType != null) {
            data.setItemVisual(idx, 'symbol', itemSymbolType);
          }

          if (itemSymbolSize != null) {
            // PENDING Transform symbolSize ?
            data.setItemVisual(idx, 'symbolSize', itemSymbolSize);
          }

          if (itemSymbolKeepAspect != null) {
            data.setItemVisual(idx, 'symbolKeepAspect', itemSymbolKeepAspect);
          }
        }
      }

      return {
        dataEach: data.hasItemOption || hasCallback ? dataEach : null
      };
    }
  };
}

module.exports = _default;

/***/ }),

/***/ "87c3":
/***/ (function(module, exports, __webpack_require__) {


/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

var _util = __webpack_require__("6d8b");

var map = _util.map;

var createRenderPlanner = __webpack_require__("cccd");

var _dataStackHelper = __webpack_require__("ee1a");

var isDimensionStacked = _dataStackHelper.isDimensionStacked;

/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

/* global Float32Array */
function _default(seriesType) {
  return {
    seriesType: seriesType,
    plan: createRenderPlanner(),
    reset: function (seriesModel) {
      var data = seriesModel.getData();
      var coordSys = seriesModel.coordinateSystem;
      var pipelineContext = seriesModel.pipelineContext;
      var isLargeRender = pipelineContext.large;

      if (!coordSys) {
        return;
      }

      var dims = map(coordSys.dimensions, function (dim) {
        return data.mapDimension(dim);
      }).slice(0, 2);
      var dimLen = dims.length;
      var stackResultDim = data.getCalculationInfo('stackResultDimension');

      if (isDimensionStacked(data, dims[0]
      /*, dims[1]*/
      )) {
        dims[0] = stackResultDim;
      }

      if (isDimensionStacked(data, dims[1]
      /*, dims[0]*/
      )) {
        dims[1] = stackResultDim;
      }

      function progress(params, data) {
        var segCount = params.end - params.start;
        var points = isLargeRender && new Float32Array(segCount * dimLen);

        for (var i = params.start, offset = 0, tmpIn = [], tmpOut = []; i < params.end; i++) {
          var point;

          if (dimLen === 1) {
            var x = data.get(dims[0], i);
            point = !isNaN(x) && coordSys.dataToPoint(x, null, tmpOut);
          } else {
            var x = tmpIn[0] = data.get(dims[0], i);
            var y = tmpIn[1] = data.get(dims[1], i); // Also {Array.<number>}, not undefined to avoid if...else... statement

            point = !isNaN(x) && !isNaN(y) && coordSys.dataToPoint(tmpIn, null, tmpOut);
          }

          if (isLargeRender) {
            points[offset++] = point ? point[0] : NaN;
            points[offset++] = point ? point[1] : NaN;
          } else {
            data.setItemLayout(i, point && point.slice() || [NaN, NaN]);
          }
        }

        isLargeRender && data.setLayout('symbolPoints', points);
      }

      return dimLen && {
        progress: progress
      };
    }
  };
}

module.exports = _default;

/***/ }),

/***/ "88b3":
/***/ (function(module, exports) {


/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/
var ORIGIN_METHOD = '\0__throttleOriginMethod';
var RATE = '\0__throttleRate';
var THROTTLE_TYPE = '\0__throttleType';
/**
 * @public
 * @param {(Function)} fn
 * @param {number} [delay=0] Unit: ms.
 * @param {boolean} [debounce=false]
 *        true: If call interval less than `delay`, only the last call works.
 *        false: If call interval less than `delay, call works on fixed rate.
 * @return {(Function)} throttled fn.
 */

function throttle(fn, delay, debounce) {
  var currCall;
  var lastCall = 0;
  var lastExec = 0;
  var timer = null;
  var diff;
  var scope;
  var args;
  var debounceNextCall;
  delay = delay || 0;

  function exec() {
    lastExec = new Date().getTime();
    timer = null;
    fn.apply(scope, args || []);
  }

  var cb = function () {
    currCall = new Date().getTime();
    scope = this;
    args = arguments;
    var thisDelay = debounceNextCall || delay;
    var thisDebounce = debounceNextCall || debounce;
    debounceNextCall = null;
    diff = currCall - (thisDebounce ? lastCall : lastExec) - thisDelay;
    clearTimeout(timer); // Here we should make sure that: the `exec` SHOULD NOT be called later
    // than a new call of `cb`, that is, preserving the command order. Consider
    // calculating "scale rate" when roaming as an example. When a call of `cb`
    // happens, either the `exec` is called dierectly, or the call is delayed.
    // But the delayed call should never be later than next call of `cb`. Under
    // this assurance, we can simply update view state each time `dispatchAction`
    // triggered by user roaming, but not need to add extra code to avoid the
    // state being "rolled-back".

    if (thisDebounce) {
      timer = setTimeout(exec, thisDelay);
    } else {
      if (diff >= 0) {
        exec();
      } else {
        timer = setTimeout(exec, -diff);
      }
    }

    lastCall = currCall;
  };
  /**
   * Clear throttle.
   * @public
   */


  cb.clear = function () {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };
  /**
   * Enable debounce once.
   */


  cb.debounceNextCall = function (debounceDelay) {
    debounceNextCall = debounceDelay;
  };

  return cb;
}
/**
 * Create throttle method or update throttle rate.
 *
 * @example
 * ComponentView.prototype.render = function () {
 *     ...
 *     throttle.createOrUpdate(
 *         this,
 *         '_dispatchAction',
 *         this.model.get('throttle'),
 *         'fixRate'
 *     );
 * };
 * ComponentView.prototype.remove = function () {
 *     throttle.clear(this, '_dispatchAction');
 * };
 * ComponentView.prototype.dispose = function () {
 *     throttle.clear(this, '_dispatchAction');
 * };
 *
 * @public
 * @param {Object} obj
 * @param {string} fnAttr
 * @param {number} [rate]
 * @param {string} [throttleType='fixRate'] 'fixRate' or 'debounce'
 * @return {Function} throttled function.
 */


function createOrUpdate(obj, fnAttr, rate, throttleType) {
  var fn = obj[fnAttr];

  if (!fn) {
    return;
  }

  var originFn = fn[ORIGIN_METHOD] || fn;
  var lastThrottleType = fn[THROTTLE_TYPE];
  var lastRate = fn[RATE];

  if (lastRate !== rate || lastThrottleType !== throttleType) {
    if (rate == null || !throttleType) {
      return obj[fnAttr] = originFn;
    }

    fn = obj[fnAttr] = throttle(originFn, rate, throttleType === 'debounce');
    fn[ORIGIN_METHOD] = originFn;
    fn[THROTTLE_TYPE] = throttleType;
    fn[RATE] = rate;
  }

  return fn;
}
/**
 * Clear throttle. Example see throttle.createOrUpdate.
 *
 * @public
 * @param {Object} obj
 * @param {string} fnAttr
 */


function clear(obj, fnAttr) {
  var fn = obj[fnAttr];

  if (fn && fn[ORIGIN_METHOD]) {
    obj[fnAttr] = fn[ORIGIN_METHOD];
  }
}

exports.throttle = throttle;
exports.createOrUpdate = createOrUpdate;
exports.clear = clear;

/***/ }),

/***/ "8918":
/***/ (function(module, exports, __webpack_require__) {


/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

var zrUtil = __webpack_require__("6d8b");

var _clazz = __webpack_require__("625e");

var parseClassType = _clazz.parseClassType;

/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/
var base = 0;
/**
 * @public
 * @param {string} type
 * @return {string}
 */

function getUID(type) {
  // Considering the case of crossing js context,
  // use Math.random to make id as unique as possible.
  return [type || '', base++, Math.random().toFixed(5)].join('_');
}
/**
 * @inner
 */


function enableSubTypeDefaulter(entity) {
  var subTypeDefaulters = {};

  entity.registerSubTypeDefaulter = function (componentType, defaulter) {
    componentType = parseClassType(componentType);
    subTypeDefaulters[componentType.main] = defaulter;
  };

  entity.determineSubType = function (componentType, option) {
    var type = option.type;

    if (!type) {
      var componentTypeMain = parseClassType(componentType).main;

      if (entity.hasSubTypes(componentType) && subTypeDefaulters[componentTypeMain]) {
        type = subTypeDefaulters[componentTypeMain](option);
      }
    }

    return type;
  };

  return entity;
}
/**
 * Topological travel on Activity Network (Activity On Vertices).
 * Dependencies is defined in Model.prototype.dependencies, like ['xAxis', 'yAxis'].
 *
 * If 'xAxis' or 'yAxis' is absent in componentTypeList, just ignore it in topology.
 *
 * If there is circle dependencey, Error will be thrown.
 *
 */


function enableTopologicalTravel(entity, dependencyGetter) {
  /**
   * @public
   * @param {Array.<string>} targetNameList Target Component type list.
   *                                           Can be ['aa', 'bb', 'aa.xx']
   * @param {Array.<string>} fullNameList By which we can build dependency graph.
   * @param {Function} callback Params: componentType, dependencies.
   * @param {Object} context Scope of callback.
   */
  entity.topologicalTravel = function (targetNameList, fullNameList, callback, context) {
    if (!targetNameList.length) {
      return;
    }

    var result = makeDepndencyGraph(fullNameList);
    var graph = result.graph;
    var stack = result.noEntryList;
    var targetNameSet = {};
    zrUtil.each(targetNameList, function (name) {
      targetNameSet[name] = true;
    });

    while (stack.length) {
      var currComponentType = stack.pop();
      var currVertex = graph[currComponentType];
      var isInTargetNameSet = !!targetNameSet[currComponentType];

      if (isInTargetNameSet) {
        callback.call(context, currComponentType, currVertex.originalDeps.slice());
        delete targetNameSet[currComponentType];
      }

      zrUtil.each(currVertex.successor, isInTargetNameSet ? removeEdgeAndAdd : removeEdge);
    }

    zrUtil.each(targetNameSet, function () {
      throw new Error('Circle dependency may exists');
    });

    function removeEdge(succComponentType) {
      graph[succComponentType].entryCount--;

      if (graph[succComponentType].entryCount === 0) {
        stack.push(succComponentType);
      }
    } // Consider this case: legend depends on series, and we call
    // chart.setOption({series: [...]}), where only series is in option.
    // If we do not have 'removeEdgeAndAdd', legendModel.mergeOption will
    // not be called, but only sereis.mergeOption is called. Thus legend
    // have no chance to update its local record about series (like which
    // name of series is available in legend).


    function removeEdgeAndAdd(succComponentType) {
      targetNameSet[succComponentType] = true;
      removeEdge(succComponentType);
    }
  };
  /**
   * DepndencyGraph: {Object}
   * key: conponentType,
   * value: {
   *     successor: [conponentTypes...],
   *     originalDeps: [conponentTypes...],
   *     entryCount: {number}
   * }
   */


  function makeDepndencyGraph(fullNameList) {
    var graph = {};
    var noEntryList = [];
    zrUtil.each(fullNameList, function (name) {
      var thisItem = createDependencyGraphItem(graph, name);
      var originalDeps = thisItem.originalDeps = dependencyGetter(name);
      var availableDeps = getAvailableDependencies(originalDeps, fullNameList);
      thisItem.entryCount = availableDeps.length;

      if (thisItem.entryCount === 0) {
        noEntryList.push(name);
      }

      zrUtil.each(availableDeps, function (dependentName) {
        if (zrUtil.indexOf(thisItem.predecessor, dependentName) < 0) {
          thisItem.predecessor.push(dependentName);
        }

        var thatItem = createDependencyGraphItem(graph, dependentName);

        if (zrUtil.indexOf(thatItem.successor, dependentName) < 0) {
          thatItem.successor.push(name);
        }
      });
    });
    return {
      graph: graph,
      noEntryList: noEntryList
    };
  }

  function createDependencyGraphItem(graph, name) {
    if (!graph[name]) {
      graph[name] = {
        predecessor: [],
        successor: []
      };
    }

    return graph[name];
  }

  function getAvailableDependencies(originalDeps, fullNameList) {
    var availableDeps = [];
    zrUtil.each(originalDeps, function (dep) {
      zrUtil.indexOf(fullNameList, dep) >= 0 && availableDeps.push(dep);
    });
    return availableDeps;
  }
}

exports.getUID = getUID;
exports.enableSubTypeDefaulter = enableSubTypeDefaulter;
exports.enableTopologicalTravel = enableTopologicalTravel;

/***/ }),

/***/ "8971":
/***/ (function(module, exports) {


/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/
var platform = ''; // Navigator not exists in node

if (typeof navigator !== 'undefined') {
  platform = navigator.platform || '';
}

var _default = {
  // backgroundColor: 'rgba(0,0,0,0)',
  // https://dribbble.com/shots/1065960-Infographic-Pie-chart-visualization
  // color: ['#5793f3', '#d14a61', '#fd9c35', '#675bba', '#fec42c', '#dd4444', '#d4df5a', '#cd4870'],
  // Light colors:
  // color: ['#bcd3bb', '#e88f70', '#edc1a5', '#9dc5c8', '#e1e8c8', '#7b7c68', '#e5b5b5', '#f0b489', '#928ea8', '#bda29a'],
  // color: ['#cc5664', '#9bd6ec', '#ea946e', '#8acaaa', '#f1ec64', '#ee8686', '#a48dc1', '#5da6bc', '#b9dcae'],
  // Dark colors:
  color: ['#c23531', '#2f4554', '#61a0a8', '#d48265', '#91c7ae', '#749f83', '#ca8622', '#bda29a', '#6e7074', '#546570', '#c4ccd3'],
  gradientColor: ['#f6efa6', '#d88273', '#bf444c'],
  // If xAxis and yAxis declared, grid is created by default.
  // grid: {},
  textStyle: {
    // color: '#000',
    // decoration: 'none',
    // PENDING
    fontFamily: platform.match(/^Win/) ? 'Microsoft YaHei' : 'sans-serif',
    // fontFamily: 'Arial, Verdana, sans-serif',
    fontSize: 12,
    fontStyle: 'normal',
    fontWeight: 'normal'
  },
  // http://blogs.adobe.com/webplatform/2014/02/24/using-blend-modes-in-html-canvas/
  // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation
  // Default is source-over
  blendMode: null,
  animation: 'auto',
  animationDuration: 1000,
  animationDurationUpdate: 300,
  animationEasing: 'exponentialOut',
  animationEasingUpdate: 'cubicOut',
  animationThreshold: 2000,
  // Configuration for progressive/incremental rendering
  progressiveThreshold: 3000,
  progressive: 400,
  // Threshold of if use single hover layer to optimize.
  // It is recommended that `hoverLayerThreshold` is equivalent to or less than
  // `progressiveThreshold`, otherwise hover will cause restart of progressive,
  // which is unexpected.
  // see example <echarts/test/heatmap-large.html>.
  hoverLayerThreshold: 3000,
  // See: module:echarts/scale/Time
  useUTC: false
};
module.exports = _default;

/***/ }),

/***/ "89e3":
/***/ (function(module, exports, __webpack_require__) {


/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

var numberUtil = __webpack_require__("3842");

var formatUtil = __webpack_require__("eda2");

var Scale = __webpack_require__("e0d8");

var helper = __webpack_require__("944e");

/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

/**
 * Interval scale
 * @module echarts/scale/Interval
 */
var roundNumber = numberUtil.round;
/**
 * @alias module:echarts/coord/scale/Interval
 * @constructor
 */

var IntervalScale = Scale.extend({
  type: 'interval',
  _interval: 0,
  _intervalPrecision: 2,
  setExtent: function (start, end) {
    var thisExtent = this._extent; //start,end may be a Number like '25',so...

    if (!isNaN(start)) {
      thisExtent[0] = parseFloat(start);
    }

    if (!isNaN(end)) {
      thisExtent[1] = parseFloat(end);
    }
  },
  unionExtent: function (other) {
    var extent = this._extent;
    other[0] < extent[0] && (extent[0] = other[0]);
    other[1] > extent[1] && (extent[1] = other[1]); // unionExtent may called by it's sub classes

    IntervalScale.prototype.setExtent.call(this, extent[0], extent[1]);
  },

  /**
   * Get interval
   */
  getInterval: function () {
    return this._interval;
  },

  /**
   * Set interval
   */
  setInterval: function (interval) {
    this._interval = interval; // Dropped auto calculated niceExtent and use user setted extent
    // We assume user wan't to set both interval, min, max to get a better result

    this._niceExtent = this._extent.slice();
    this._intervalPrecision = helper.getIntervalPrecision(interval);
  },

  /**
   * @param {boolean} [expandToNicedExtent=false] If expand the ticks to niced extent.
   * @return {Array.<number>}
   */
  getTicks: function (expandToNicedExtent) {
    var interval = this._interval;
    var extent = this._extent;
    var niceTickExtent = this._niceExtent;
    var intervalPrecision = this._intervalPrecision;
    var ticks = []; // If interval is 0, return [];

    if (!interval) {
      return ticks;
    } // Consider this case: using dataZoom toolbox, zoom and zoom.


    var safeLimit = 10000;

    if (extent[0] < niceTickExtent[0]) {
      if (expandToNicedExtent) {
        ticks.push(roundNumber(niceTickExtent[0] - interval));
      } else {
        ticks.push(extent[0]);
      }
    }

    var tick = niceTickExtent[0];

    while (tick <= niceTickExtent[1]) {
      ticks.push(tick); // Avoid rounding error

      tick = roundNumber(tick + interval, intervalPrecision);

      if (tick === ticks[ticks.length - 1]) {
        // Consider out of safe float point, e.g.,
        // -3711126.9907707 + 2e-10 === -3711126.9907707
        break;
      }

      if (ticks.length > safeLimit) {
        return [];
      }
    } // Consider this case: the last item of ticks is smaller
    // than niceTickExtent[1] and niceTickExtent[1] === extent[1].


    var lastNiceTick = ticks.length ? ticks[ticks.length - 1] : niceTickExtent[1];

    if (extent[1] > lastNiceTick) {
      if (expandToNicedExtent) {
        ticks.push(lastNiceTick + interval);
      } else {
        ticks.push(extent[1]);
      }
    }

    return ticks;
  },

  /**
   * @param {number} [splitNumber=5]
   * @return {Array.<Array.<number>>}
   */
  getMinorTicks: function (splitNumber) {
    var ticks = this.getTicks(true);
    var minorTicks = [];
    var extent = this.getExtent();

    for (var i = 1; i < ticks.length; i++) {
      var nextTick = ticks[i];
      var prevTick = ticks[i - 1];
      var count = 0;
      var minorTicksGroup = [];
      var interval = nextTick - prevTick;
      var minorInterval = interval / splitNumber;

      while (count < splitNumber - 1) {
        var minorTick = numberUtil.round(prevTick + (count + 1) * minorInterval); // For the first and last interval. The count may be less than splitNumber.

        if (minorTick > extent[0] && minorTick < extent[1]) {
          minorTicksGroup.push(minorTick);
        }

        count++;
      }

      minorTicks.push(minorTicksGroup);
    }

    return minorTicks;
  },

  /**
   * @param {number} data
   * @param {Object} [opt]
   * @param {number|string} [opt.precision] If 'auto', use nice presision.
   * @param {boolean} [opt.pad] returns 1.50 but not 1.5 if precision is 2.
   * @return {string}
   */
  getLabel: function (data, opt) {
    if (data == null) {
      return '';
    }

    var precision = opt && opt.precision;

    if (precision == null) {
      precision = numberUtil.getPrecisionSafe(data) || 0;
    } else if (precision === 'auto') {
      // Should be more precise then tick.
      precision = this._intervalPrecision;
    } // (1) If `precision` is set, 12.005 should be display as '12.00500'.
    // (2) Use roundNumber (toFixed) to avoid scientific notation like '3.5e-7'.


    data = roundNumber(data, precision, true);
    return formatUtil.addCommas(data);
  },

  /**
   * Update interval and extent of intervals for nice ticks
   *
   * @param {number} [splitNumber = 5] Desired number of ticks
   * @param {number} [minInterval]
   * @param {number} [maxInterval]
   */
  niceTicks: function (splitNumber, minInterval, maxInterval) {
    splitNumber = splitNumber || 5;
    var extent = this._extent;
    var span = extent[1] - extent[0];

    if (!isFinite(span)) {
      return;
    } // User may set axis min 0 and data are all negative
    // FIXME If it needs to reverse ?


    if (span < 0) {
      span = -span;
      extent.reverse();
    }

    var result = helper.intervalScaleNiceTicks(extent, splitNumber, minInterval, maxInterval);
    this._intervalPrecision = result.intervalPrecision;
    this._interval = result.interval;
    this._niceExtent = result.niceTickExtent;
  },

  /**
   * Nice extent.
   * @param {Object} opt
   * @param {number} [opt.splitNumber = 5] Given approx tick number
   * @param {boolean} [opt.fixMin=false]
   * @param {boolean} [opt.fixMax=false]
   * @param {boolean} [opt.minInterval]
   * @param {boolean} [opt.maxInterval]
   */
  niceExtent: function (opt) {
    var extent = this._extent; // If extent start and end are same, expand them

    if (extent[0] === extent[1]) {
      if (extent[0] !== 0) {
        // Expand extent
        var expandSize = extent[0]; // In the fowllowing case
        //      Axis has been fixed max 100
        //      Plus data are all 100 and axis extent are [100, 100].
        // Extend to the both side will cause expanded max is larger than fixed max.
        // So only expand to the smaller side.

        if (!opt.fixMax) {
          extent[1] += expandSize / 2;
          extent[0] -= expandSize / 2;
        } else {
          extent[0] -= expandSize / 2;
        }
      } else {
        extent[1] = 1;
      }
    }

    var span = extent[1] - extent[0]; // If there are no data and extent are [Infinity, -Infinity]

    if (!isFinite(span)) {
      extent[0] = 0;
      extent[1] = 1;
    }

    this.niceTicks(opt.splitNumber, opt.minInterval, opt.maxInterval); // var extent = this._extent;

    var interval = this._interval;

    if (!opt.fixMin) {
      extent[0] = roundNumber(Math.floor(extent[0] / interval) * interval);
    }

    if (!opt.fixMax) {
      extent[1] = roundNumber(Math.ceil(extent[1] / interval) * interval);
    }
  }
});
/**
 * @return {module:echarts/scale/Time}
 */

IntervalScale.create = function () {
  return new IntervalScale();
};

var _default = IntervalScale;
module.exports = _default;

/***/ }),

/***/ "8b7f":
/***/ (function(module, exports, __webpack_require__) {


/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

var _config = __webpack_require__("4e08");

var __DEV__ = _config.__DEV__;

var _util = __webpack_require__("6d8b");

var createHashMap = _util.createHashMap;
var retrieve = _util.retrieve;
var each = _util.each;

/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

/**
 * Helper for model references.
 * There are many manners to refer axis/coordSys.
 */
// TODO
// merge relevant logic to this file?
// check: "modelHelper" of tooltip and "BrushTargetManager".

/**
 * @class
 * For example:
 * {
 *     coordSysName: 'cartesian2d',
 *     coordSysDims: ['x', 'y', ...],
 *     axisMap: HashMap({
 *         x: xAxisModel,
 *         y: yAxisModel
 *     }),
 *     categoryAxisMap: HashMap({
 *         x: xAxisModel,
 *         y: undefined
 *     }),
 *     // The index of the first category axis in `coordSysDims`.
 *     // `null/undefined` means no category axis exists.
 *     firstCategoryDimIndex: 1,
 *     // To replace user specified encode.
 * }
 */
function CoordSysInfo(coordSysName) {
  /**
   * @type {string}
   */
  this.coordSysName = coordSysName;
  /**
   * @type {Array.<string>}
   */

  this.coordSysDims = [];
  /**
   * @type {module:zrender/core/util#HashMap}
   */

  this.axisMap = createHashMap();
  /**
   * @type {module:zrender/core/util#HashMap}
   */

  this.categoryAxisMap = createHashMap();
  /**
   * @type {number}
   */

  this.firstCategoryDimIndex = null;
}
/**
 * @return {module:model/referHelper#CoordSysInfo}
 */


function getCoordSysInfoBySeries(seriesModel) {
  var coordSysName = seriesModel.get('coordinateSystem');
  var result = new CoordSysInfo(coordSysName);
  var fetch = fetchers[coordSysName];

  if (fetch) {
    fetch(seriesModel, result, result.axisMap, result.categoryAxisMap);
    return result;
  }
}

var fetchers = {
  cartesian2d: function (seriesModel, result, axisMap, categoryAxisMap) {
    var xAxisModel = seriesModel.getReferringComponents('xAxis')[0];
    var yAxisModel = seriesModel.getReferringComponents('yAxis')[0];
    result.coordSysDims = ['x', 'y'];
    axisMap.set('x', xAxisModel);
    axisMap.set('y', yAxisModel);

    if (isCategory(xAxisModel)) {
      categoryAxisMap.set('x', xAxisModel);
      result.firstCategoryDimIndex = 0;
    }

    if (isCategory(yAxisModel)) {
      categoryAxisMap.set('y', yAxisModel);
      result.firstCategoryDimIndex == null & (result.firstCategoryDimIndex = 1);
    }
  },
  singleAxis: function (seriesModel, result, axisMap, categoryAxisMap) {
    var singleAxisModel = seriesModel.getReferringComponents('singleAxis')[0];
    result.coordSysDims = ['single'];
    axisMap.set('single', singleAxisModel);

    if (isCategory(singleAxisModel)) {
      categoryAxisMap.set('single', singleAxisModel);
      result.firstCategoryDimIndex = 0;
    }
  },
  polar: function (seriesModel, result, axisMap, categoryAxisMap) {
    var polarModel = seriesModel.getReferringComponents('polar')[0];
    var radiusAxisModel = polarModel.findAxisModel('radiusAxis');
    var angleAxisModel = polarModel.findAxisModel('angleAxis');
    result.coordSysDims = ['radius', 'angle'];
    axisMap.set('radius', radiusAxisModel);
    axisMap.set('angle', angleAxisModel);

    if (isCategory(radiusAxisModel)) {
      categoryAxisMap.set('radius', radiusAxisModel);
      result.firstCategoryDimIndex = 0;
    }

    if (isCategory(angleAxisModel)) {
      categoryAxisMap.set('angle', angleAxisModel);
      result.firstCategoryDimIndex == null && (result.firstCategoryDimIndex = 1);
    }
  },
  geo: function (seriesModel, result, axisMap, categoryAxisMap) {
    result.coordSysDims = ['lng', 'lat'];
  },
  parallel: function (seriesModel, result, axisMap, categoryAxisMap) {
    var ecModel = seriesModel.ecModel;
    var parallelModel = ecModel.getComponent('parallel', seriesModel.get('parallelIndex'));
    var coordSysDims = result.coordSysDims = parallelModel.dimensions.slice();
    each(parallelModel.parallelAxisIndex, function (axisIndex, index) {
      var axisModel = ecModel.getComponent('parallelAxis', axisIndex);
      var axisDim = coordSysDims[index];
      axisMap.set(axisDim, axisModel);

      if (isCategory(axisModel) && result.firstCategoryDimIndex == null) {
        categoryAxisMap.set(axisDim, axisModel);
        result.firstCategoryDimIndex = index;
      }
    });
  }
};

function isCategory(axisModel) {
  return axisModel.get('type') === 'category';
}

exports.getCoordSysInfoBySeries = getCoordSysInfoBySeries;

/***/ }),

/***/ "8c2a":
/***/ (function(module, exports, __webpack_require__) {


/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

var zrUtil = __webpack_require__("6d8b");

var Scale = __webpack_require__("e0d8");

var numberUtil = __webpack_require__("3842");

var IntervalScale = __webpack_require__("89e3");

/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

/**
 * Log scale
 * @module echarts/scale/Log
 */
// Use some method of IntervalScale
var scaleProto = Scale.prototype;
var intervalScaleProto = IntervalScale.prototype;
var getPrecisionSafe = numberUtil.getPrecisionSafe;
var roundingErrorFix = numberUtil.round;
var mathFloor = Math.floor;
var mathCeil = Math.ceil;
var mathPow = Math.pow;
var mathLog = Math.log;
var LogScale = Scale.extend({
  type: 'log',
  base: 10,
  $constructor: function () {
    Scale.apply(this, arguments);
    this._originalScale = new IntervalScale();
  },

  /**
   * @param {boolean} [expandToNicedExtent=false] If expand the ticks to niced extent.
   * @return {Array.<number>}
   */
  getTicks: function (expandToNicedExtent) {
    var originalScale = this._originalScale;
    var extent = this._extent;
    var originalExtent = originalScale.getExtent();
    return zrUtil.map(intervalScaleProto.getTicks.call(this, expandToNicedExtent), function (val) {
      var powVal = numberUtil.round(mathPow(this.base, val)); // Fix #4158

      powVal = val === extent[0] && originalScale.__fixMin ? fixRoundingError(powVal, originalExtent[0]) : powVal;
      powVal = val === extent[1] && originalScale.__fixMax ? fixRoundingError(powVal, originalExtent[1]) : powVal;
      return powVal;
    }, this);
  },

  /**
   * @param {number} splitNumber
   * @return {Array.<Array.<number>>}
   */
  getMinorTicks: intervalScaleProto.getMinorTicks,

  /**
   * @param {number} val
   * @return {string}
   */
  getLabel: intervalScaleProto.getLabel,

  /**
   * @param  {number} val
   * @return {number}
   */
  scale: function (val) {
    val = scaleProto.scale.call(this, val);
    return mathPow(this.base, val);
  },

  /**
   * @param {number} start
   * @param {number} end
   */
  setExtent: function (start, end) {
    var base = this.base;
    start = mathLog(start) / mathLog(base);
    end = mathLog(end) / mathLog(base);
    intervalScaleProto.setExtent.call(this, start, end);
  },

  /**
   * @return {number} end
   */
  getExtent: function () {
    var base = this.base;
    var extent = scaleProto.getExtent.call(this);
    extent[0] = mathPow(base, extent[0]);
    extent[1] = mathPow(base, extent[1]); // Fix #4158

    var originalScale = this._originalScale;
    var originalExtent = originalScale.getExtent();
    originalScale.__fixMin && (extent[0] = fixRoundingError(extent[0], originalExtent[0]));
    originalScale.__fixMax && (extent[1] = fixRoundingError(extent[1], originalExtent[1]));
    return extent;
  },

  /**
   * @param  {Array.<number>} extent
   */
  unionExtent: function (extent) {
    this._originalScale.unionExtent(extent);

    var base = this.base;
    extent[0] = mathLog(extent[0]) / mathLog(base);
    extent[1] = mathLog(extent[1]) / mathLog(base);
    scaleProto.unionExtent.call(this, extent);
  },

  /**
   * @override
   */
  unionExtentFromData: function (data, dim) {
    // TODO
    // filter value that <= 0
    this.unionExtent(data.getApproximateExtent(dim));
  },

  /**
   * Update interval and extent of intervals for nice ticks
   * @param  {number} [approxTickNum = 10] Given approx tick number
   */
  niceTicks: function (approxTickNum) {
    approxTickNum = approxTickNum || 10;
    var extent = this._extent;
    var span = extent[1] - extent[0];

    if (span === Infinity || span <= 0) {
      return;
    }

    var interval = numberUtil.quantity(span);
    var err = approxTickNum / span * interval; // Filter ticks to get closer to the desired count.

    if (err <= 0.5) {
      interval *= 10;
    } // Interval should be integer


    while (!isNaN(interval) && Math.abs(interval) < 1 && Math.abs(interval) > 0) {
      interval *= 10;
    }

    var niceExtent = [numberUtil.round(mathCeil(extent[0] / interval) * interval), numberUtil.round(mathFloor(extent[1] / interval) * interval)];
    this._interval = interval;
    this._niceExtent = niceExtent;
  },

  /**
   * Nice extent.
   * @override
   */
  niceExtent: function (opt) {
    intervalScaleProto.niceExtent.call(this, opt);
    var originalScale = this._originalScale;
    originalScale.__fixMin = opt.fixMin;
    originalScale.__fixMax = opt.fixMax;
  }
});
zrUtil.each(['contain', 'normalize'], function (methodName) {
  LogScale.prototype[methodName] = function (val) {
    val = mathLog(val) / mathLog(this.base);
    return scaleProto[methodName].call(this, val);
  };
});

LogScale.create = function () {
  return new LogScale();
};

function fixRoundingError(val, originalVal) {
  return roundingErrorFix(val, getPrecisionSafe(originalVal));
}

var _default = LogScale;
module.exports = _default;

/***/ }),

/***/ "944e":
/***/ (function(module, exports, __webpack_require__) {


/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

var numberUtil = __webpack_require__("3842");

/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

/**
 * For testable.
 */
var roundNumber = numberUtil.round;
/**
 * @param {Array.<number>} extent Both extent[0] and extent[1] should be valid number.
 *                                Should be extent[0] < extent[1].
 * @param {number} splitNumber splitNumber should be >= 1.
 * @param {number} [minInterval]
 * @param {number} [maxInterval]
 * @return {Object} {interval, intervalPrecision, niceTickExtent}
 */

function intervalScaleNiceTicks(extent, splitNumber, minInterval, maxInterval) {
  var result = {};
  var span = extent[1] - extent[0];
  var interval = result.interval = numberUtil.nice(span / splitNumber, true);

  if (minInterval != null && interval < minInterval) {
    interval = result.interval = minInterval;
  }

  if (maxInterval != null && interval > maxInterval) {
    interval = result.interval = maxInterval;
  } // Tow more digital for tick.


  var precision = result.intervalPrecision = getIntervalPrecision(interval); // Niced extent inside original extent

  var niceTickExtent = result.niceTickExtent = [roundNumber(Math.ceil(extent[0] / interval) * interval, precision), roundNumber(Math.floor(extent[1] / interval) * interval, precision)];
  fixExtent(niceTickExtent, extent);
  return result;
}
/**
 * @param {number} interval
 * @return {number} interval precision
 */


function getIntervalPrecision(interval) {
  // Tow more digital for tick.
  return numberUtil.getPrecisionSafe(interval) + 2;
}

function clamp(niceTickExtent, idx, extent) {
  niceTickExtent[idx] = Math.max(Math.min(niceTickExtent[idx], extent[1]), extent[0]);
} // In some cases (e.g., splitNumber is 1), niceTickExtent may be out of extent.


function fixExtent(niceTickExtent, extent) {
  !isFinite(niceTickExtent[0]) && (niceTickExtent[0] = extent[0]);
  !isFinite(niceTickExtent[1]) && (niceTickExtent[1] = extent[1]);
  clamp(niceTickExtent, 0, extent);
  clamp(niceTickExtent, 1, extent);

  if (niceTickExtent[0] > niceTickExtent[1]) {
    niceTickExtent[0] = niceTickExtent[1];
  }
}

exports.intervalScaleNiceTicks = intervalScaleNiceTicks;
exports.getIntervalPrecision = getIntervalPrecision;
exports.fixExtent = fixExtent;

/***/ }),

/***/ "98e7":
/***/ (function(module, exports, __webpack_require__) {


/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

var _util = __webpack_require__("6d8b");

var createHashMap = _util.createHashMap;

/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/
// Pick color from palette for each data item.
// Applicable for charts that require applying color palette
// in data level (like pie, funnel, chord).
function _default(seriesType) {
  return {
    getTargetSeries: function (ecModel) {
      // Pie and funnel may use diferrent scope
      var paletteScope = {};
      var seiresModelMap = createHashMap();
      ecModel.eachSeriesByType(seriesType, function (seriesModel) {
        seriesModel.__paletteScope = paletteScope;
        seiresModelMap.set(seriesModel.uid, seriesModel);
      });
      return seiresModelMap;
    },
    reset: function (seriesModel, ecModel) {
      var dataAll = seriesModel.getRawData();
      var idxMap = {};
      var data = seriesModel.getData();
      data.each(function (idx) {
        var rawIdx = data.getRawIndex(idx);
        idxMap[rawIdx] = idx;
      });
      dataAll.each(function (rawIdx) {
        var filteredIdx = idxMap[rawIdx]; // If series.itemStyle.normal.color is a function. itemVisual may be encoded

        var singleDataColor = filteredIdx != null && data.getItemVisual(filteredIdx, 'color', true);
        var singleDataBorderColor = filteredIdx != null && data.getItemVisual(filteredIdx, 'borderColor', true);
        var itemModel;

        if (!singleDataColor || !singleDataBorderColor) {
          // FIXME Performance
          itemModel = dataAll.getItemModel(rawIdx);
        }

        if (!singleDataColor) {
          var color = itemModel.get('itemStyle.color') || seriesModel.getColorFromPalette(dataAll.getName(rawIdx) || rawIdx + '', seriesModel.__paletteScope, dataAll.count()); // Data is not filtered

          if (filteredIdx != null) {
            data.setItemVisual(filteredIdx, 'color', color);
          }
        }

        if (!singleDataBorderColor) {
          var borderColor = itemModel.get('itemStyle.borderColor'); // Data is not filtered

          if (filteredIdx != null) {
            data.setItemVisual(filteredIdx, 'borderColor', borderColor);
          }
        }
      });
    }
  };
}

module.exports = _default;

/***/ }),

/***/ "998c":
/***/ (function(module, exports, __webpack_require__) {


/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

var zrUtil = __webpack_require__("6d8b");

var graphic = __webpack_require__("2306");

/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/
var PI = Math.PI;
/**
 * @param {module:echarts/ExtensionAPI} api
 * @param {Object} [opts]
 * @param {string} [opts.text]
 * @param {string} [opts.color]
 * @param {string} [opts.textColor]
 * @return {module:zrender/Element}
 */

function _default(api, opts) {
  opts = opts || {};
  zrUtil.defaults(opts, {
    text: 'loading',
    color: '#c23531',
    textColor: '#000',
    maskColor: 'rgba(255, 255, 255, 0.8)',
    zlevel: 0
  });
  var mask = new graphic.Rect({
    style: {
      fill: opts.maskColor
    },
    zlevel: opts.zlevel,
    z: 10000
  });
  var arc = new graphic.Arc({
    shape: {
      startAngle: -PI / 2,
      endAngle: -PI / 2 + 0.1,
      r: 10
    },
    style: {
      stroke: opts.color,
      lineCap: 'round',
      lineWidth: 5
    },
    zlevel: opts.zlevel,
    z: 10001
  });
  var labelRect = new graphic.Rect({
    style: {
      fill: 'none',
      text: opts.text,
      textPosition: 'right',
      textDistance: 10,
      textFill: opts.textColor
    },
    zlevel: opts.zlevel,
    z: 10001
  });
  arc.animateShape(true).when(1000, {
    endAngle: PI * 3 / 2
  }).start('circularInOut');
  arc.animateShape(true).when(1000, {
    startAngle: PI * 3 / 2
  }).delay(300).start('circularInOut');
  var group = new graphic.Group();
  group.add(arc);
  group.add(labelRect);
  group.add(mask); // Inject resize

  group.resize = function () {
    var cx = api.getWidth() / 2;
    var cy = api.getHeight() / 2;
    arc.setShape({
      cx: cx,
      cy: cy
    });
    var r = arc.shape.r;
    labelRect.setShape({
      x: cx - r,
      y: cy - r,
      width: r * 2,
      height: r * 2
    });
    mask.setShape({
      x: 0,
      y: 0,
      width: api.getWidth(),
      height: api.getHeight()
    });
  };

  group.resize();
  return group;
}

module.exports = _default;

/***/ }),

/***/ "9bdb":
/***/ (function(module, exports, __webpack_require__) {


/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

var makeStyleMapper = __webpack_require__("282b");

/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/
var getAreaStyle = makeStyleMapper([['fill', 'color'], ['shadowBlur'], ['shadowOffsetX'], ['shadowOffsetY'], ['opacity'], ['shadowColor']]);
var _default = {
  getAreaStyle: function (excludes, includes) {
    return getAreaStyle(this, excludes, includes);
  }
};
module.exports = _default;

/***/ }),

/***/ "9d57":
/***/ (function(module, exports, __webpack_require__) {


/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

var zrUtil = __webpack_require__("6d8b");

var _number = __webpack_require__("3842");

var parsePercent = _number.parsePercent;

var _dataStackHelper = __webpack_require__("ee1a");

var isDimensionStacked = _dataStackHelper.isDimensionStacked;

var createRenderPlanner = __webpack_require__("cccd");

/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

/* global Float32Array */
var STACK_PREFIX = '__ec_stack_';
var LARGE_BAR_MIN_WIDTH = 0.5;
var LargeArr = typeof Float32Array !== 'undefined' ? Float32Array : Array;

function getSeriesStackId(seriesModel) {
  return seriesModel.get('stack') || STACK_PREFIX + seriesModel.seriesIndex;
}

function getAxisKey(axis) {
  return axis.dim + axis.index;
}
/**
 * @param {Object} opt
 * @param {module:echarts/coord/Axis} opt.axis Only support category axis currently.
 * @param {number} opt.count Positive interger.
 * @param {number} [opt.barWidth]
 * @param {number} [opt.barMaxWidth]
 * @param {number} [opt.barMinWidth]
 * @param {number} [opt.barGap]
 * @param {number} [opt.barCategoryGap]
 * @return {Object} {width, offset, offsetCenter} If axis.type is not 'category', return undefined.
 */


function getLayoutOnAxis(opt) {
  var params = [];
  var baseAxis = opt.axis;
  var axisKey = 'axis0';

  if (baseAxis.type !== 'category') {
    return;
  }

  var bandWidth = baseAxis.getBandWidth();

  for (var i = 0; i < opt.count || 0; i++) {
    params.push(zrUtil.defaults({
      bandWidth: bandWidth,
      axisKey: axisKey,
      stackId: STACK_PREFIX + i
    }, opt));
  }

  var widthAndOffsets = doCalBarWidthAndOffset(params);
  var result = [];

  for (var i = 0; i < opt.count; i++) {
    var item = widthAndOffsets[axisKey][STACK_PREFIX + i];
    item.offsetCenter = item.offset + item.width / 2;
    result.push(item);
  }

  return result;
}

function prepareLayoutBarSeries(seriesType, ecModel) {
  var seriesModels = [];
  ecModel.eachSeriesByType(seriesType, function (seriesModel) {
    // Check series coordinate, do layout for cartesian2d only
    if (isOnCartesian(seriesModel) && !isInLargeMode(seriesModel)) {
      seriesModels.push(seriesModel);
    }
  });
  return seriesModels;
}
/**
 * Map from (baseAxis.dim + '_' + baseAxis.index) to min gap of two adjacent
 * values.
 * This works for time axes, value axes, and log axes.
 * For a single time axis, return value is in the form like
 * {'x_0': [1000000]}.
 * The value of 1000000 is in milliseconds.
 */


function getValueAxesMinGaps(barSeries) {
  /**
   * Map from axis.index to values.
   * For a single time axis, axisValues is in the form like
   * {'x_0': [1495555200000, 1495641600000, 1495728000000]}.
   * Items in axisValues[x], e.g. 1495555200000, are time values of all
   * series.
   */
  var axisValues = {};
  zrUtil.each(barSeries, function (seriesModel) {
    var cartesian = seriesModel.coordinateSystem;
    var baseAxis = cartesian.getBaseAxis();

    if (baseAxis.type !== 'time' && baseAxis.type !== 'value') {
      return;
    }

    var data = seriesModel.getData();
    var key = baseAxis.dim + '_' + baseAxis.index;
    var dim = data.mapDimension(baseAxis.dim);

    for (var i = 0, cnt = data.count(); i < cnt; ++i) {
      var value = data.get(dim, i);

      if (!axisValues[key]) {
        // No previous data for the axis
        axisValues[key] = [value];
      } else {
        // No value in previous series
        axisValues[key].push(value);
      } // Ignore duplicated time values in the same axis

    }
  });
  var axisMinGaps = [];

  for (var key in axisValues) {
    if (axisValues.hasOwnProperty(key)) {
      var valuesInAxis = axisValues[key];

      if (valuesInAxis) {
        // Sort axis values into ascending order to calculate gaps
        valuesInAxis.sort(function (a, b) {
          return a - b;
        });
        var min = null;

        for (var j = 1; j < valuesInAxis.length; ++j) {
          var delta = valuesInAxis[j] - valuesInAxis[j - 1];

          if (delta > 0) {
            // Ignore 0 delta because they are of the same axis value
            min = min === null ? delta : Math.min(min, delta);
          }
        } // Set to null if only have one data


        axisMinGaps[key] = min;
      }
    }
  }

  return axisMinGaps;
}

function makeColumnLayout(barSeries) {
  var axisMinGaps = getValueAxesMinGaps(barSeries);
  var seriesInfoList = [];
  zrUtil.each(barSeries, function (seriesModel) {
    var cartesian = seriesModel.coordinateSystem;
    var baseAxis = cartesian.getBaseAxis();
    var axisExtent = baseAxis.getExtent();
    var bandWidth;

    if (baseAxis.type === 'category') {
      bandWidth = baseAxis.getBandWidth();
    } else if (baseAxis.type === 'value' || baseAxis.type === 'time') {
      var key = baseAxis.dim + '_' + baseAxis.index;
      var minGap = axisMinGaps[key];
      var extentSpan = Math.abs(axisExtent[1] - axisExtent[0]);
      var scale = baseAxis.scale.getExtent();
      var scaleSpan = Math.abs(scale[1] - scale[0]);
      bandWidth = minGap ? extentSpan / scaleSpan * minGap : extentSpan; // When there is only one data value
    } else {
      var data = seriesModel.getData();
      bandWidth = Math.abs(axisExtent[1] - axisExtent[0]) / data.count();
    }

    var barWidth = parsePercent(seriesModel.get('barWidth'), bandWidth);
    var barMaxWidth = parsePercent(seriesModel.get('barMaxWidth'), bandWidth);
    var barMinWidth = parsePercent( // barMinWidth by default is 1 in cartesian. Because in value axis,
    // the auto-calculated bar width might be less than 1.
    seriesModel.get('barMinWidth') || 1, bandWidth);
    var barGap = seriesModel.get('barGap');
    var barCategoryGap = seriesModel.get('barCategoryGap');
    seriesInfoList.push({
      bandWidth: bandWidth,
      barWidth: barWidth,
      barMaxWidth: barMaxWidth,
      barMinWidth: barMinWidth,
      barGap: barGap,
      barCategoryGap: barCategoryGap,
      axisKey: getAxisKey(baseAxis),
      stackId: getSeriesStackId(seriesModel)
    });
  });
  return doCalBarWidthAndOffset(seriesInfoList);
}

function doCalBarWidthAndOffset(seriesInfoList) {
  // Columns info on each category axis. Key is cartesian name
  var columnsMap = {};
  zrUtil.each(seriesInfoList, function (seriesInfo, idx) {
    var axisKey = seriesInfo.axisKey;
    var bandWidth = seriesInfo.bandWidth;
    var columnsOnAxis = columnsMap[axisKey] || {
      bandWidth: bandWidth,
      remainedWidth: bandWidth,
      autoWidthCount: 0,
      categoryGap: '20%',
      gap: '30%',
      stacks: {}
    };
    var stacks = columnsOnAxis.stacks;
    columnsMap[axisKey] = columnsOnAxis;
    var stackId = seriesInfo.stackId;

    if (!stacks[stackId]) {
      columnsOnAxis.autoWidthCount++;
    }

    stacks[stackId] = stacks[stackId] || {
      width: 0,
      maxWidth: 0
    }; // Caution: In a single coordinate system, these barGrid attributes
    // will be shared by series. Consider that they have default values,
    // only the attributes set on the last series will work.
    // Do not change this fact unless there will be a break change.

    var barWidth = seriesInfo.barWidth;

    if (barWidth && !stacks[stackId].width) {
      // See #6312, do not restrict width.
      stacks[stackId].width = barWidth;
      barWidth = Math.min(columnsOnAxis.remainedWidth, barWidth);
      columnsOnAxis.remainedWidth -= barWidth;
    }

    var barMaxWidth = seriesInfo.barMaxWidth;
    barMaxWidth && (stacks[stackId].maxWidth = barMaxWidth);
    var barMinWidth = seriesInfo.barMinWidth;
    barMinWidth && (stacks[stackId].minWidth = barMinWidth);
    var barGap = seriesInfo.barGap;
    barGap != null && (columnsOnAxis.gap = barGap);
    var barCategoryGap = seriesInfo.barCategoryGap;
    barCategoryGap != null && (columnsOnAxis.categoryGap = barCategoryGap);
  });
  var result = {};
  zrUtil.each(columnsMap, function (columnsOnAxis, coordSysName) {
    result[coordSysName] = {};
    var stacks = columnsOnAxis.stacks;
    var bandWidth = columnsOnAxis.bandWidth;
    var categoryGap = parsePercent(columnsOnAxis.categoryGap, bandWidth);
    var barGapPercent = parsePercent(columnsOnAxis.gap, 1);
    var remainedWidth = columnsOnAxis.remainedWidth;
    var autoWidthCount = columnsOnAxis.autoWidthCount;
    var autoWidth = (remainedWidth - categoryGap) / (autoWidthCount + (autoWidthCount - 1) * barGapPercent);
    autoWidth = Math.max(autoWidth, 0); // Find if any auto calculated bar exceeded maxBarWidth

    zrUtil.each(stacks, function (column) {
      var maxWidth = column.maxWidth;
      var minWidth = column.minWidth;

      if (!column.width) {
        var finalWidth = autoWidth;

        if (maxWidth && maxWidth < finalWidth) {
          finalWidth = Math.min(maxWidth, remainedWidth);
        } // `minWidth` has higher priority. `minWidth` decide that wheter the
        // bar is able to be visible. So `minWidth` should not be restricted
        // by `maxWidth` or `remainedWidth` (which is from `bandWidth`). In
        // the extreme cases for `value` axis, bars are allowed to overlap
        // with each other if `minWidth` specified.


        if (minWidth && minWidth > finalWidth) {
          finalWidth = minWidth;
        }

        if (finalWidth !== autoWidth) {
          column.width = finalWidth;
          remainedWidth -= finalWidth + barGapPercent * finalWidth;
          autoWidthCount--;
        }
      } else {
        // `barMinWidth/barMaxWidth` has higher priority than `barWidth`, as
        // CSS does. Becuase barWidth can be a percent value, where
        // `barMaxWidth` can be used to restrict the final width.
        var finalWidth = column.width;

        if (maxWidth) {
          finalWidth = Math.min(finalWidth, maxWidth);
        } // `minWidth` has higher priority, as described above


        if (minWidth) {
          finalWidth = Math.max(finalWidth, minWidth);
        }

        column.width = finalWidth;
        remainedWidth -= finalWidth + barGapPercent * finalWidth;
        autoWidthCount--;
      }
    }); // Recalculate width again

    autoWidth = (remainedWidth - categoryGap) / (autoWidthCount + (autoWidthCount - 1) * barGapPercent);
    autoWidth = Math.max(autoWidth, 0);
    var widthSum = 0;
    var lastColumn;
    zrUtil.each(stacks, function (column, idx) {
      if (!column.width) {
        column.width = autoWidth;
      }

      lastColumn = column;
      widthSum += column.width * (1 + barGapPercent);
    });

    if (lastColumn) {
      widthSum -= lastColumn.width * barGapPercent;
    }

    var offset = -widthSum / 2;
    zrUtil.each(stacks, function (column, stackId) {
      result[coordSysName][stackId] = result[coordSysName][stackId] || {
        bandWidth: bandWidth,
        offset: offset,
        width: column.width
      };
      offset += column.width * (1 + barGapPercent);
    });
  });
  return result;
}
/**
 * @param {Object} barWidthAndOffset The result of makeColumnLayout
 * @param {module:echarts/coord/Axis} axis
 * @param {module:echarts/model/Series} [seriesModel] If not provided, return all.
 * @return {Object} {stackId: {offset, width}} or {offset, width} if seriesModel provided.
 */


function retrieveColumnLayout(barWidthAndOffset, axis, seriesModel) {
  if (barWidthAndOffset && axis) {
    var result = barWidthAndOffset[getAxisKey(axis)];

    if (result != null && seriesModel != null) {
      result = result[getSeriesStackId(seriesModel)];
    }

    return result;
  }
}
/**
 * @param {string} seriesType
 * @param {module:echarts/model/Global} ecModel
 */


function layout(seriesType, ecModel) {
  var seriesModels = prepareLayoutBarSeries(seriesType, ecModel);
  var barWidthAndOffset = makeColumnLayout(seriesModels);
  var lastStackCoords = {};
  var lastStackCoordsOrigin = {};
  zrUtil.each(seriesModels, function (seriesModel) {
    var data = seriesModel.getData();
    var cartesian = seriesModel.coordinateSystem;
    var baseAxis = cartesian.getBaseAxis();
    var stackId = getSeriesStackId(seriesModel);
    var columnLayoutInfo = barWidthAndOffset[getAxisKey(baseAxis)][stackId];
    var columnOffset = columnLayoutInfo.offset;
    var columnWidth = columnLayoutInfo.width;
    var valueAxis = cartesian.getOtherAxis(baseAxis);
    var barMinHeight = seriesModel.get('barMinHeight') || 0;
    lastStackCoords[stackId] = lastStackCoords[stackId] || [];
    lastStackCoordsOrigin[stackId] = lastStackCoordsOrigin[stackId] || []; // Fix #4243

    data.setLayout({
      bandWidth: columnLayoutInfo.bandWidth,
      offset: columnOffset,
      size: columnWidth
    });
    var valueDim = data.mapDimension(valueAxis.dim);
    var baseDim = data.mapDimension(baseAxis.dim);
    var stacked = isDimensionStacked(data, valueDim
    /*, baseDim*/
    );
    var isValueAxisH = valueAxis.isHorizontal();
    var valueAxisStart = getValueAxisStart(baseAxis, valueAxis, stacked);

    for (var idx = 0, len = data.count(); idx < len; idx++) {
      var value = data.get(valueDim, idx);
      var baseValue = data.get(baseDim, idx); // If dataZoom in filteMode: 'empty', the baseValue can be set as NaN in "axisProxy".

      if (isNaN(value) || isNaN(baseValue)) {
        continue;
      }

      var sign = value >= 0 ? 'p' : 'n';
      var baseCoord = valueAxisStart; // Because of the barMinHeight, we can not use the value in
      // stackResultDimension directly.

      if (stacked) {
        // Only ordinal axis can be stacked.
        if (!lastStackCoords[stackId][baseValue]) {
          lastStackCoords[stackId][baseValue] = {
            p: valueAxisStart,
            // Positive stack
            n: valueAxisStart // Negative stack

          };
        } // Should also consider #4243


        baseCoord = lastStackCoords[stackId][baseValue][sign];
      }

      var x;
      var y;
      var width;
      var height;

      if (isValueAxisH) {
        var coord = cartesian.dataToPoint([value, baseValue]);
        x = baseCoord;
        y = coord[1] + columnOffset;
        width = coord[0] - valueAxisStart;
        height = columnWidth;

        if (Math.abs(width) < barMinHeight) {
          width = (width < 0 ? -1 : 1) * barMinHeight;
        }

        stacked && (lastStackCoords[stackId][baseValue][sign] += width);
      } else {
        var coord = cartesian.dataToPoint([baseValue, value]);
        x = coord[0] + columnOffset;
        y = baseCoord;
        width = columnWidth;
        height = coord[1] - valueAxisStart;

        if (Math.abs(height) < barMinHeight) {
          // Include zero to has a positive bar
          height = (height <= 0 ? -1 : 1) * barMinHeight;
        }

        stacked && (lastStackCoords[stackId][baseValue][sign] += height);
      }

      data.setItemLayout(idx, {
        x: x,
        y: y,
        width: width,
        height: height
      });
    }
  }, this);
} // TODO: Do not support stack in large mode yet.


var largeLayout = {
  seriesType: 'bar',
  plan: createRenderPlanner(),
  reset: function (seriesModel) {
    if (!isOnCartesian(seriesModel) || !isInLargeMode(seriesModel)) {
      return;
    }

    var data = seriesModel.getData();
    var cartesian = seriesModel.coordinateSystem;
    var baseAxis = cartesian.getBaseAxis();
    var valueAxis = cartesian.getOtherAxis(baseAxis);
    var valueDim = data.mapDimension(valueAxis.dim);
    var baseDim = data.mapDimension(baseAxis.dim);
    var valueAxisHorizontal = valueAxis.isHorizontal();
    var valueDimIdx = valueAxisHorizontal ? 0 : 1;
    var barWidth = retrieveColumnLayout(makeColumnLayout([seriesModel]), baseAxis, seriesModel).width;

    if (!(barWidth > LARGE_BAR_MIN_WIDTH)) {
      // jshint ignore:line
      barWidth = LARGE_BAR_MIN_WIDTH;
    }

    return {
      progress: progress
    };

    function progress(params, data) {
      var count = params.count;
      var largePoints = new LargeArr(count * 2);
      var largeDataIndices = new LargeArr(count);
      var dataIndex;
      var coord = [];
      var valuePair = [];
      var pointsOffset = 0;
      var idxOffset = 0;

      while ((dataIndex = params.next()) != null) {
        valuePair[valueDimIdx] = data.get(valueDim, dataIndex);
        valuePair[1 - valueDimIdx] = data.get(baseDim, dataIndex);
        coord = cartesian.dataToPoint(valuePair, null, coord); // Data index might not be in order, depends on `progressiveChunkMode`.

        largePoints[pointsOffset++] = coord[0];
        largePoints[pointsOffset++] = coord[1];
        largeDataIndices[idxOffset++] = dataIndex;
      }

      data.setLayout({
        largePoints: largePoints,
        largeDataIndices: largeDataIndices,
        barWidth: barWidth,
        valueAxisStart: getValueAxisStart(baseAxis, valueAxis, false),
        valueAxisHorizontal: valueAxisHorizontal
      });
    }
  }
};

function isOnCartesian(seriesModel) {
  return seriesModel.coordinateSystem && seriesModel.coordinateSystem.type === 'cartesian2d';
}

function isInLargeMode(seriesModel) {
  return seriesModel.pipelineContext && seriesModel.pipelineContext.large;
} // See cases in `test/bar-start.html` and `#7412`, `#8747`.


function getValueAxisStart(baseAxis, valueAxis, stacked) {
  return valueAxis.toGlobalCoord(valueAxis.dataToCoord(valueAxis.type === 'log' ? 1 : 0));
}

exports.getLayoutOnAxis = getLayoutOnAxis;
exports.prepareLayoutBarSeries = prepareLayoutBarSeries;
exports.makeColumnLayout = makeColumnLayout;
exports.retrieveColumnLayout = retrieveColumnLayout;
exports.layout = layout;
exports.largeLayout = largeLayout;

/***/ }),

/***/ "a15a":
/***/ (function(module, exports, __webpack_require__) {


/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

var zrUtil = __webpack_require__("6d8b");

var graphic = __webpack_require__("2306");

var BoundingRect = __webpack_require__("9850");

var _text = __webpack_require__("e86a");

var calculateTextPosition = _text.calculateTextPosition;

/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/
// Symbol factory

/**
 * Triangle shape
 * @inner
 */
var Triangle = graphic.extendShape({
  type: 'triangle',
  shape: {
    cx: 0,
    cy: 0,
    width: 0,
    height: 0
  },
  buildPath: function (path, shape) {
    var cx = shape.cx;
    var cy = shape.cy;
    var width = shape.width / 2;
    var height = shape.height / 2;
    path.moveTo(cx, cy - height);
    path.lineTo(cx + width, cy + height);
    path.lineTo(cx - width, cy + height);
    path.closePath();
  }
});
/**
 * Diamond shape
 * @inner
 */

var Diamond = graphic.extendShape({
  type: 'diamond',
  shape: {
    cx: 0,
    cy: 0,
    width: 0,
    height: 0
  },
  buildPath: function (path, shape) {
    var cx = shape.cx;
    var cy = shape.cy;
    var width = shape.width / 2;
    var height = shape.height / 2;
    path.moveTo(cx, cy - height);
    path.lineTo(cx + width, cy);
    path.lineTo(cx, cy + height);
    path.lineTo(cx - width, cy);
    path.closePath();
  }
});
/**
 * Pin shape
 * @inner
 */

var Pin = graphic.extendShape({
  type: 'pin',
  shape: {
    // x, y on the cusp
    x: 0,
    y: 0,
    width: 0,
    height: 0
  },
  buildPath: function (path, shape) {
    var x = shape.x;
    var y = shape.y;
    var w = shape.width / 5 * 3; // Height must be larger than width

    var h = Math.max(w, shape.height);
    var r = w / 2; // Dist on y with tangent point and circle center

    var dy = r * r / (h - r);
    var cy = y - h + r + dy;
    var angle = Math.asin(dy / r); // Dist on x with tangent point and circle center

    var dx = Math.cos(angle) * r;
    var tanX = Math.sin(angle);
    var tanY = Math.cos(angle);
    var cpLen = r * 0.6;
    var cpLen2 = r * 0.7;
    path.moveTo(x - dx, cy + dy);
    path.arc(x, cy, r, Math.PI - angle, Math.PI * 2 + angle);
    path.bezierCurveTo(x + dx - tanX * cpLen, cy + dy + tanY * cpLen, x, y - cpLen2, x, y);
    path.bezierCurveTo(x, y - cpLen2, x - dx + tanX * cpLen, cy + dy + tanY * cpLen, x - dx, cy + dy);
    path.closePath();
  }
});
/**
 * Arrow shape
 * @inner
 */

var Arrow = graphic.extendShape({
  type: 'arrow',
  shape: {
    x: 0,
    y: 0,
    width: 0,
    height: 0
  },
  buildPath: function (ctx, shape) {
    var height = shape.height;
    var width = shape.width;
    var x = shape.x;
    var y = shape.y;
    var dx = width / 3 * 2;
    ctx.moveTo(x, y);
    ctx.lineTo(x + dx, y + height);
    ctx.lineTo(x, y + height / 4 * 3);
    ctx.lineTo(x - dx, y + height);
    ctx.lineTo(x, y);
    ctx.closePath();
  }
});
/**
 * Map of path contructors
 * @type {Object.<string, module:zrender/graphic/Path>}
 */

var symbolCtors = {
  line: graphic.Line,
  rect: graphic.Rect,
  roundRect: graphic.Rect,
  square: graphic.Rect,
  circle: graphic.Circle,
  diamond: Diamond,
  pin: Pin,
  arrow: Arrow,
  triangle: Triangle
};
var symbolShapeMakers = {
  line: function (x, y, w, h, shape) {
    // FIXME
    shape.x1 = x;
    shape.y1 = y + h / 2;
    shape.x2 = x + w;
    shape.y2 = y + h / 2;
  },
  rect: function (x, y, w, h, shape) {
    shape.x = x;
    shape.y = y;
    shape.width = w;
    shape.height = h;
  },
  roundRect: function (x, y, w, h, shape) {
    shape.x = x;
    shape.y = y;
    shape.width = w;
    shape.height = h;
    shape.r = Math.min(w, h) / 4;
  },
  square: function (x, y, w, h, shape) {
    var size = Math.min(w, h);
    shape.x = x;
    shape.y = y;
    shape.width = size;
    shape.height = size;
  },
  circle: function (x, y, w, h, shape) {
    // Put circle in the center of square
    shape.cx = x + w / 2;
    shape.cy = y + h / 2;
    shape.r = Math.min(w, h) / 2;
  },
  diamond: function (x, y, w, h, shape) {
    shape.cx = x + w / 2;
    shape.cy = y + h / 2;
    shape.width = w;
    shape.height = h;
  },
  pin: function (x, y, w, h, shape) {
    shape.x = x + w / 2;
    shape.y = y + h / 2;
    shape.width = w;
    shape.height = h;
  },
  arrow: function (x, y, w, h, shape) {
    shape.x = x + w / 2;
    shape.y = y + h / 2;
    shape.width = w;
    shape.height = h;
  },
  triangle: function (x, y, w, h, shape) {
    shape.cx = x + w / 2;
    shape.cy = y + h / 2;
    shape.width = w;
    shape.height = h;
  }
};
var symbolBuildProxies = {};
zrUtil.each(symbolCtors, function (Ctor, name) {
  symbolBuildProxies[name] = new Ctor();
});
var SymbolClz = graphic.extendShape({
  type: 'symbol',
  shape: {
    symbolType: '',
    x: 0,
    y: 0,
    width: 0,
    height: 0
  },
  calculateTextPosition: function (out, style, rect) {
    var res = calculateTextPosition(out, style, rect);
    var shape = this.shape;

    if (shape && shape.symbolType === 'pin' && style.textPosition === 'inside') {
      res.y = rect.y + rect.height * 0.4;
    }

    return res;
  },
  buildPath: function (ctx, shape, inBundle) {
    var symbolType = shape.symbolType;

    if (symbolType !== 'none') {
      var proxySymbol = symbolBuildProxies[symbolType];

      if (!proxySymbol) {
        // Default rect
        symbolType = 'rect';
        proxySymbol = symbolBuildProxies[symbolType];
      }

      symbolShapeMakers[symbolType](shape.x, shape.y, shape.width, shape.height, proxySymbol.shape);
      proxySymbol.buildPath(ctx, proxySymbol.shape, inBundle);
    }
  }
}); // Provide setColor helper method to avoid determine if set the fill or stroke outside

function symbolPathSetColor(color, innerColor) {
  if (this.type !== 'image') {
    var symbolStyle = this.style;
    var symbolShape = this.shape;

    if (symbolShape && symbolShape.symbolType === 'line') {
      symbolStyle.stroke = color;
    } else if (this.__isEmptyBrush) {
      symbolStyle.stroke = color;
      symbolStyle.fill = innerColor || '#fff';
    } else {
      // FIXME 判断图形默认是填充还是描边，使用 onlyStroke ?
      symbolStyle.fill && (symbolStyle.fill = color);
      symbolStyle.stroke && (symbolStyle.stroke = color);
    }

    this.dirty(false);
  }
}
/**
 * Create a symbol element with given symbol configuration: shape, x, y, width, height, color
 * @param {string} symbolType
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @param {string} color
 * @param {boolean} [keepAspect=false] whether to keep the ratio of w/h,
 *                            for path and image only.
 */


function createSymbol(symbolType, x, y, w, h, color, keepAspect) {
  // TODO Support image object, DynamicImage.
  var isEmpty = symbolType.indexOf('empty') === 0;

  if (isEmpty) {
    symbolType = symbolType.substr(5, 1).toLowerCase() + symbolType.substr(6);
  }

  var symbolPath;

  if (symbolType.indexOf('image://') === 0) {
    symbolPath = graphic.makeImage(symbolType.slice(8), new BoundingRect(x, y, w, h), keepAspect ? 'center' : 'cover');
  } else if (symbolType.indexOf('path://') === 0) {
    symbolPath = graphic.makePath(symbolType.slice(7), {}, new BoundingRect(x, y, w, h), keepAspect ? 'center' : 'cover');
  } else {
    symbolPath = new SymbolClz({
      shape: {
        symbolType: symbolType,
        x: x,
        y: y,
        width: w,
        height: h
      }
    });
  }

  symbolPath.__isEmptyBrush = isEmpty;
  symbolPath.setColor = symbolPathSetColor;
  symbolPath.setColor(color);
  return symbolPath;
}

exports.createSymbol = createSymbol;

/***/ }),

/***/ "b12f":
/***/ (function(module, exports, __webpack_require__) {


/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

var Group = __webpack_require__("e1fc");

var componentUtil = __webpack_require__("8918");

var clazzUtil = __webpack_require__("625e");

/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/
var Component = function () {
  /**
   * @type {module:zrender/container/Group}
   * @readOnly
   */
  this.group = new Group();
  /**
   * @type {string}
   * @readOnly
   */

  this.uid = componentUtil.getUID('viewComponent');
};

Component.prototype = {
  constructor: Component,
  init: function (ecModel, api) {},
  render: function (componentModel, ecModel, api, payload) {},
  dispose: function () {},

  /**
   * @param {string} eventType
   * @param {Object} query
   * @param {module:zrender/Element} targetEl
   * @param {Object} packedEvent
   * @return {boolen} Pass only when return `true`.
   */
  filterForExposedEvent: null
};
var componentProto = Component.prototype;

componentProto.updateView = componentProto.updateLayout = componentProto.updateVisual = function (seriesModel, ecModel, api, payload) {// Do nothing;
}; // Enable Component.extend.


clazzUtil.enableClassExtend(Component); // Enable capability of registerClass, getClass, hasClass, registerSubTypeDefaulter and so on.

clazzUtil.enableClassManagement(Component, {
  registerWhenExtend: true
});
var _default = Component;
module.exports = _default;

/***/ }),

/***/ "b809":
/***/ (function(module, exports, __webpack_require__) {


/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

var zrUtil = __webpack_require__("6d8b");

var lang = __webpack_require__("29a8");

var _dataProvider = __webpack_require__("2b17");

var retrieveRawValue = _dataProvider.retrieveRawValue;

/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/
function _default(dom, ecModel) {
  var ariaModel = ecModel.getModel('aria');

  if (!ariaModel.get('show')) {
    return;
  } else if (ariaModel.get('description')) {
    dom.setAttribute('aria-label', ariaModel.get('description'));
    return;
  }

  var seriesCnt = 0;
  ecModel.eachSeries(function (seriesModel, idx) {
    ++seriesCnt;
  }, this);
  var maxDataCnt = ariaModel.get('data.maxCount') || 10;
  var maxSeriesCnt = ariaModel.get('series.maxCount') || 10;
  var displaySeriesCnt = Math.min(seriesCnt, maxSeriesCnt);
  var ariaLabel;

  if (seriesCnt < 1) {
    // No series, no aria label
    return;
  } else {
    var title = getTitle();

    if (title) {
      ariaLabel = replace(getConfig('general.withTitle'), {
        title: title
      });
    } else {
      ariaLabel = getConfig('general.withoutTitle');
    }

    var seriesLabels = [];
    var prefix = seriesCnt > 1 ? 'series.multiple.prefix' : 'series.single.prefix';
    ariaLabel += replace(getConfig(prefix), {
      seriesCount: seriesCnt
    });
    ecModel.eachSeries(function (seriesModel, idx) {
      if (idx < displaySeriesCnt) {
        var seriesLabel;
        var seriesName = seriesModel.get('name');
        var seriesTpl = 'series.' + (seriesCnt > 1 ? 'multiple' : 'single') + '.';
        seriesLabel = getConfig(seriesName ? seriesTpl + 'withName' : seriesTpl + 'withoutName');
        seriesLabel = replace(seriesLabel, {
          seriesId: seriesModel.seriesIndex,
          seriesName: seriesModel.get('name'),
          seriesType: getSeriesTypeName(seriesModel.subType)
        });
        var data = seriesModel.getData();
        window.data = data;

        if (data.count() > maxDataCnt) {
          // Show part of data
          seriesLabel += replace(getConfig('data.partialData'), {
            displayCnt: maxDataCnt
          });
        } else {
          seriesLabel += getConfig('data.allData');
        }

        var dataLabels = [];

        for (var i = 0; i < data.count(); i++) {
          if (i < maxDataCnt) {
            var name = data.getName(i);
            var value = retrieveRawValue(data, i);
            dataLabels.push(replace(name ? getConfig('data.withName') : getConfig('data.withoutName'), {
              name: name,
              value: value
            }));
          }
        }

        seriesLabel += dataLabels.join(getConfig('data.separator.middle')) + getConfig('data.separator.end');
        seriesLabels.push(seriesLabel);
      }
    });
    ariaLabel += seriesLabels.join(getConfig('series.multiple.separator.middle')) + getConfig('series.multiple.separator.end');
    dom.setAttribute('aria-label', ariaLabel);
  }

  function replace(str, keyValues) {
    if (typeof str !== 'string') {
      return str;
    }

    var result = str;
    zrUtil.each(keyValues, function (value, key) {
      result = result.replace(new RegExp('\\{\\s*' + key + '\\s*\\}', 'g'), value);
    });
    return result;
  }

  function getConfig(path) {
    var userConfig = ariaModel.get(path);

    if (userConfig == null) {
      var pathArr = path.split('.');
      var result = lang.aria;

      for (var i = 0; i < pathArr.length; ++i) {
        result = result[pathArr[i]];
      }

      return result;
    } else {
      return userConfig;
    }
  }

  function getTitle() {
    var title = ecModel.getModel('title').option;

    if (title && title.length) {
      title = title[0];
    }

    return title && title.text;
  }

  function getSeriesTypeName(type) {
    return lang.series.typeNames[type] || '自定义图';
  }
}

module.exports = _default;

/***/ }),

/***/ "c2be":
/***/ (function(module, exports, __webpack_require__) {


/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

var _graphic = __webpack_require__("2306");

var extendShape = _graphic.extendShape;

/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

/**
 * Sausage: similar to sector, but have half circle on both sides
 * @public
 */
var _default = extendShape({
  type: 'sausage',
  shape: {
    cx: 0,
    cy: 0,
    r0: 0,
    r: 0,
    startAngle: 0,
    endAngle: Math.PI * 2,
    clockwise: true
  },
  buildPath: function (ctx, shape) {
    var x = shape.cx;
    var y = shape.cy;
    var r0 = Math.max(shape.r0 || 0, 0);
    var r = Math.max(shape.r, 0);
    var dr = (r - r0) * 0.5;
    var rCenter = r0 + dr;
    var startAngle = shape.startAngle;
    var endAngle = shape.endAngle;
    var clockwise = shape.clockwise;
    var unitStartX = Math.cos(startAngle);
    var unitStartY = Math.sin(startAngle);
    var unitEndX = Math.cos(endAngle);
    var unitEndY = Math.sin(endAngle);
    var lessThanCircle = clockwise ? endAngle - startAngle < Math.PI * 2 : startAngle - endAngle < Math.PI * 2;

    if (lessThanCircle) {
      ctx.moveTo(unitStartX * r0 + x, unitStartY * r0 + y);
      ctx.arc(unitStartX * rCenter + x, unitStartY * rCenter + y, dr, -Math.PI + startAngle, startAngle, !clockwise);
    }

    ctx.arc(x, y, r, startAngle, endAngle, !clockwise);
    ctx.moveTo(unitEndX * r + x, unitEndY * r + y);
    ctx.arc(unitEndX * rCenter + x, unitEndY * rCenter + y, dr, endAngle - Math.PI * 2, endAngle - Math.PI, !clockwise);

    if (r0 !== 0) {
      ctx.arc(x, y, r0, endAngle, startAngle, clockwise);
      ctx.moveTo(unitStartX * r0 + x, unitEndY * r0 + y);
    }

    ctx.closePath();
  }
});

module.exports = _default;

/***/ }),

/***/ "c4a3":
/***/ (function(module, exports) {


/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

/**
 * LegendVisualProvider is an bridge that pick encoded color from data and
 * provide to the legend component.
 * @param {Function} getDataWithEncodedVisual Function to get data after filtered. It stores all the encoding info
 * @param {Function} getRawData Function to get raw data before filtered.
 */
function LegendVisualProvider(getDataWithEncodedVisual, getRawData) {
  this.getAllNames = function () {
    var rawData = getRawData(); // We find the name from the raw data. In case it's filtered by the legend component.
    // Normally, the name can be found in rawData, but can't be found in filtered data will display as gray.

    return rawData.mapArray(rawData.getName);
  };

  this.containName = function (name) {
    var rawData = getRawData();
    return rawData.indexOfName(name) >= 0;
  };

  this.indexOfName = function (name) {
    // Only get data when necessary.
    // Because LegendVisualProvider constructor may be new in the stage that data is not prepared yet.
    // Invoking Series#getData immediately will throw an error.
    var dataWithEncodedVisual = getDataWithEncodedVisual();
    return dataWithEncodedVisual.indexOfName(name);
  };

  this.getItemVisual = function (dataIndex, key) {
    // Get encoded visual properties from final filtered data.
    var dataWithEncodedVisual = getDataWithEncodedVisual();
    return dataWithEncodedVisual.getItemVisual(dataIndex, key);
  };
}

var _default = LegendVisualProvider;
module.exports = _default;

/***/ }),

/***/ "c533":
/***/ (function(module, exports) {


/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/
var colorAll = ['#37A2DA', '#32C5E9', '#67E0E3', '#9FE6B8', '#FFDB5C', '#ff9f7f', '#fb7293', '#E062AE', '#E690D1', '#e7bcf3', '#9d96f5', '#8378EA', '#96BFFF'];
var _default = {
  color: colorAll,
  colorLayer: [['#37A2DA', '#ffd85c', '#fd7b5f'], ['#37A2DA', '#67E0E3', '#FFDB5C', '#ff9f7f', '#E062AE', '#9d96f5'], ['#37A2DA', '#32C5E9', '#9FE6B8', '#FFDB5C', '#ff9f7f', '#fb7293', '#e7bcf3', '#8378EA', '#96BFFF'], colorAll]
};
module.exports = _default;

/***/ }),

/***/ "ca98":
/***/ (function(module, exports, __webpack_require__) {


/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

var zrUtil = __webpack_require__("6d8b");

var modelUtil = __webpack_require__("e0d3");

var ComponentModel = __webpack_require__("6cb7");

/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

/**
 * ECharts option manager
 *
 * @module {echarts/model/OptionManager}
 */
var each = zrUtil.each;
var clone = zrUtil.clone;
var map = zrUtil.map;
var merge = zrUtil.merge;
var QUERY_REG = /^(min|max)?(.+)$/;
/**
 * TERM EXPLANATIONS:
 *
 * [option]:
 *
 *     An object that contains definitions of components. For example:
 *     var option = {
 *         title: {...},
 *         legend: {...},
 *         visualMap: {...},
 *         series: [
 *             {data: [...]},
 *             {data: [...]},
 *             ...
 *         ]
 *     };
 *
 * [rawOption]:
 *
 *     An object input to echarts.setOption. 'rawOption' may be an
 *     'option', or may be an object contains multi-options. For example:
 *     var option = {
 *         baseOption: {
 *             title: {...},
 *             legend: {...},
 *             series: [
 *                 {data: [...]},
 *                 {data: [...]},
 *                 ...
 *             ]
 *         },
 *         timeline: {...},
 *         options: [
 *             {title: {...}, series: {data: [...]}},
 *             {title: {...}, series: {data: [...]}},
 *             ...
 *         ],
 *         media: [
 *             {
 *                 query: {maxWidth: 320},
 *                 option: {series: {x: 20}, visualMap: {show: false}}
 *             },
 *             {
 *                 query: {minWidth: 320, maxWidth: 720},
 *                 option: {series: {x: 500}, visualMap: {show: true}}
 *             },
 *             {
 *                 option: {series: {x: 1200}, visualMap: {show: true}}
 *             }
 *         ]
 *     };
 *
 * @alias module:echarts/model/OptionManager
 * @param {module:echarts/ExtensionAPI} api
 */

function OptionManager(api) {
  /**
   * @private
   * @type {module:echarts/ExtensionAPI}
   */
  this._api = api;
  /**
   * @private
   * @type {Array.<number>}
   */

  this._timelineOptions = [];
  /**
   * @private
   * @type {Array.<Object>}
   */

  this._mediaList = [];
  /**
   * @private
   * @type {Object}
   */

  this._mediaDefault;
  /**
   * -1, means default.
   * empty means no media.
   * @private
   * @type {Array.<number>}
   */

  this._currentMediaIndices = [];
  /**
   * @private
   * @type {Object}
   */

  this._optionBackup;
  /**
   * @private
   * @type {Object}
   */

  this._newBaseOption;
} // timeline.notMerge is not supported in ec3. Firstly there is rearly
// case that notMerge is needed. Secondly supporting 'notMerge' requires
// rawOption cloned and backuped when timeline changed, which does no
// good to performance. What's more, that both timeline and setOption
// method supply 'notMerge' brings complex and some problems.
// Consider this case:
// (step1) chart.setOption({timeline: {notMerge: false}, ...}, false);
// (step2) chart.setOption({timeline: {notMerge: true}, ...}, false);


OptionManager.prototype = {
  constructor: OptionManager,

  /**
   * @public
   * @param {Object} rawOption Raw option.
   * @param {module:echarts/model/Global} ecModel
   * @param {Array.<Function>} optionPreprocessorFuncs
   * @return {Object} Init option
   */
  setOption: function (rawOption, optionPreprocessorFuncs) {
    if (rawOption) {
      // That set dat primitive is dangerous if user reuse the data when setOption again.
      zrUtil.each(modelUtil.normalizeToArray(rawOption.series), function (series) {
        series && series.data && zrUtil.isTypedArray(series.data) && zrUtil.setAsPrimitive(series.data);
      });
    } // Caution: some series modify option data, if do not clone,
    // it should ensure that the repeat modify correctly
    // (create a new object when modify itself).


    rawOption = clone(rawOption); // FIXME
    // 如果 timeline options 或者 media 中设置了某个属性，而baseOption中没有设置，则进行警告。

    var oldOptionBackup = this._optionBackup;
    var newParsedOption = parseRawOption.call(this, rawOption, optionPreprocessorFuncs, !oldOptionBackup);
    this._newBaseOption = newParsedOption.baseOption; // For setOption at second time (using merge mode);

    if (oldOptionBackup) {
      // Only baseOption can be merged.
      mergeOption(oldOptionBackup.baseOption, newParsedOption.baseOption); // For simplicity, timeline options and media options do not support merge,
      // that is, if you `setOption` twice and both has timeline options, the latter
      // timeline opitons will not be merged to the formers, but just substitude them.

      if (newParsedOption.timelineOptions.length) {
        oldOptionBackup.timelineOptions = newParsedOption.timelineOptions;
      }

      if (newParsedOption.mediaList.length) {
        oldOptionBackup.mediaList = newParsedOption.mediaList;
      }

      if (newParsedOption.mediaDefault) {
        oldOptionBackup.mediaDefault = newParsedOption.mediaDefault;
      }
    } else {
      this._optionBackup = newParsedOption;
    }
  },

  /**
   * @param {boolean} isRecreate
   * @return {Object}
   */
  mountOption: function (isRecreate) {
    var optionBackup = this._optionBackup; // TODO
    // 如果没有reset功能则不clone。

    this._timelineOptions = map(optionBackup.timelineOptions, clone);
    this._mediaList = map(optionBackup.mediaList, clone);
    this._mediaDefault = clone(optionBackup.mediaDefault);
    this._currentMediaIndices = [];
    return clone(isRecreate // this._optionBackup.baseOption, which is created at the first `setOption`
    // called, and is merged into every new option by inner method `mergeOption`
    // each time `setOption` called, can be only used in `isRecreate`, because
    // its reliability is under suspicion. In other cases option merge is
    // performed by `model.mergeOption`.
    ? optionBackup.baseOption : this._newBaseOption);
  },

  /**
   * @param {module:echarts/model/Global} ecModel
   * @return {Object}
   */
  getTimelineOption: function (ecModel) {
    var option;
    var timelineOptions = this._timelineOptions;

    if (timelineOptions.length) {
      // getTimelineOption can only be called after ecModel inited,
      // so we can get currentIndex from timelineModel.
      var timelineModel = ecModel.getComponent('timeline');

      if (timelineModel) {
        option = clone(timelineOptions[timelineModel.getCurrentIndex()], true);
      }
    }

    return option;
  },

  /**
   * @param {module:echarts/model/Global} ecModel
   * @return {Array.<Object>}
   */
  getMediaOption: function (ecModel) {
    var ecWidth = this._api.getWidth();

    var ecHeight = this._api.getHeight();

    var mediaList = this._mediaList;
    var mediaDefault = this._mediaDefault;
    var indices = [];
    var result = []; // No media defined.

    if (!mediaList.length && !mediaDefault) {
      return result;
    } // Multi media may be applied, the latter defined media has higher priority.


    for (var i = 0, len = mediaList.length; i < len; i++) {
      if (applyMediaQuery(mediaList[i].query, ecWidth, ecHeight)) {
        indices.push(i);
      }
    } // FIXME
    // 是否mediaDefault应该强制用户设置，否则可能修改不能回归。


    if (!indices.length && mediaDefault) {
      indices = [-1];
    }

    if (indices.length && !indicesEquals(indices, this._currentMediaIndices)) {
      result = map(indices, function (index) {
        return clone(index === -1 ? mediaDefault.option : mediaList[index].option);
      });
    } // Otherwise return nothing.


    this._currentMediaIndices = indices;
    return result;
  }
};

function parseRawOption(rawOption, optionPreprocessorFuncs, isNew) {
  var timelineOptions = [];
  var mediaList = [];
  var mediaDefault;
  var baseOption; // Compatible with ec2.

  var timelineOpt = rawOption.timeline;

  if (rawOption.baseOption) {
    baseOption = rawOption.baseOption;
  } // For timeline


  if (timelineOpt || rawOption.options) {
    baseOption = baseOption || {};
    timelineOptions = (rawOption.options || []).slice();
  } // For media query


  if (rawOption.media) {
    baseOption = baseOption || {};
    var media = rawOption.media;
    each(media, function (singleMedia) {
      if (singleMedia && singleMedia.option) {
        if (singleMedia.query) {
          mediaList.push(singleMedia);
        } else if (!mediaDefault) {
          // Use the first media default.
          mediaDefault = singleMedia;
        }
      }
    });
  } // For normal option


  if (!baseOption) {
    baseOption = rawOption;
  } // Set timelineOpt to baseOption in ec3,
  // which is convenient for merge option.


  if (!baseOption.timeline) {
    baseOption.timeline = timelineOpt;
  } // Preprocess.


  each([baseOption].concat(timelineOptions).concat(zrUtil.map(mediaList, function (media) {
    return media.option;
  })), function (option) {
    each(optionPreprocessorFuncs, function (preProcess) {
      preProcess(option, isNew);
    });
  });
  return {
    baseOption: baseOption,
    timelineOptions: timelineOptions,
    mediaDefault: mediaDefault,
    mediaList: mediaList
  };
}
/**
 * @see <http://www.w3.org/TR/css3-mediaqueries/#media1>
 * Support: width, height, aspectRatio
 * Can use max or min as prefix.
 */


function applyMediaQuery(query, ecWidth, ecHeight) {
  var realMap = {
    width: ecWidth,
    height: ecHeight,
    aspectratio: ecWidth / ecHeight // lowser case for convenientce.

  };
  var applicatable = true;
  zrUtil.each(query, function (value, attr) {
    var matched = attr.match(QUERY_REG);

    if (!matched || !matched[1] || !matched[2]) {
      return;
    }

    var operator = matched[1];
    var realAttr = matched[2].toLowerCase();

    if (!compare(realMap[realAttr], value, operator)) {
      applicatable = false;
    }
  });
  return applicatable;
}

function compare(real, expect, operator) {
  if (operator === 'min') {
    return real >= expect;
  } else if (operator === 'max') {
    return real <= expect;
  } else {
    // Equals
    return real === expect;
  }
}

function indicesEquals(indices1, indices2) {
  // indices is always order by asc and has only finite number.
  return indices1.join(',') === indices2.join(',');
}
/**
 * Consider case:
 * `chart.setOption(opt1);`
 * Then user do some interaction like dataZoom, dataView changing.
 * `chart.setOption(opt2);`
 * Then user press 'reset button' in toolbox.
 *
 * After doing that all of the interaction effects should be reset, the
 * chart should be the same as the result of invoke
 * `chart.setOption(opt1); chart.setOption(opt2);`.
 *
 * Although it is not able ensure that
 * `chart.setOption(opt1); chart.setOption(opt2);` is equivalents to
 * `chart.setOption(merge(opt1, opt2));` exactly,
 * this might be the only simple way to implement that feature.
 *
 * MEMO: We've considered some other approaches:
 * 1. Each model handle its self restoration but not uniform treatment.
 *     (Too complex in logic and error-prone)
 * 2. Use a shadow ecModel. (Performace expensive)
 */


function mergeOption(oldOption, newOption) {
  newOption = newOption || {};
  each(newOption, function (newCptOpt, mainType) {
    if (newCptOpt == null) {
      return;
    }

    var oldCptOpt = oldOption[mainType];

    if (!ComponentModel.hasClass(mainType)) {
      oldOption[mainType] = merge(oldCptOpt, newCptOpt, true);
    } else {
      newCptOpt = modelUtil.normalizeToArray(newCptOpt);
      oldCptOpt = modelUtil.normalizeToArray(oldCptOpt);
      var mapResult = modelUtil.mappingToExists(oldCptOpt, newCptOpt);
      oldOption[mainType] = map(mapResult, function (item) {
        return item.option && item.exist ? merge(item.exist, item.option, true) : item.exist || item.option;
      });
    }
  });
}

var _default = OptionManager;
module.exports = _default;

/***/ }),

/***/ "d15d":
/***/ (function(module, exports, __webpack_require__) {


/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

var _util = __webpack_require__("6d8b");

var createHashMap = _util.createHashMap;
var each = _util.each;

/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/
// (1) [Caution]: the logic is correct based on the premises:
//     data processing stage is blocked in stream.
//     See <module:echarts/stream/Scheduler#performDataProcessorTasks>
// (2) Only register once when import repeatly.
//     Should be executed after series filtered and before stack calculation.
function _default(ecModel) {
  var stackInfoMap = createHashMap();
  ecModel.eachSeries(function (seriesModel) {
    var stack = seriesModel.get('stack'); // Compatibal: when `stack` is set as '', do not stack.

    if (stack) {
      var stackInfoList = stackInfoMap.get(stack) || stackInfoMap.set(stack, []);
      var data = seriesModel.getData();
      var stackInfo = {
        // Used for calculate axis extent automatically.
        stackResultDimension: data.getCalculationInfo('stackResultDimension'),
        stackedOverDimension: data.getCalculationInfo('stackedOverDimension'),
        stackedDimension: data.getCalculationInfo('stackedDimension'),
        stackedByDimension: data.getCalculationInfo('stackedByDimension'),
        isStackedByIndex: data.getCalculationInfo('isStackedByIndex'),
        data: data,
        seriesModel: seriesModel
      }; // If stacked on axis that do not support data stack.

      if (!stackInfo.stackedDimension || !(stackInfo.isStackedByIndex || stackInfo.stackedByDimension)) {
        return;
      }

      stackInfoList.length && data.setCalculationInfo('stackedOnSeries', stackInfoList[stackInfoList.length - 1].seriesModel);
      stackInfoList.push(stackInfo);
    }
  });
  stackInfoMap.each(calculateStack);
}

function calculateStack(stackInfoList) {
  each(stackInfoList, function (targetStackInfo, idxInStack) {
    var resultVal = [];
    var resultNaN = [NaN, NaN];
    var dims = [targetStackInfo.stackResultDimension, targetStackInfo.stackedOverDimension];
    var targetData = targetStackInfo.data;
    var isStackedByIndex = targetStackInfo.isStackedByIndex; // Should not write on raw data, because stack series model list changes
    // depending on legend selection.

    var newData = targetData.map(dims, function (v0, v1, dataIndex) {
      var sum = targetData.get(targetStackInfo.stackedDimension, dataIndex); // Consider `connectNulls` of line area, if value is NaN, stackedOver
      // should also be NaN, to draw a appropriate belt area.

      if (isNaN(sum)) {
        return resultNaN;
      }

      var byValue;
      var stackedDataRawIndex;

      if (isStackedByIndex) {
        stackedDataRawIndex = targetData.getRawIndex(dataIndex);
      } else {
        byValue = targetData.get(targetStackInfo.stackedByDimension, dataIndex);
      } // If stackOver is NaN, chart view will render point on value start.


      var stackedOver = NaN;

      for (var j = idxInStack - 1; j >= 0; j--) {
        var stackInfo = stackInfoList[j]; // Has been optimized by inverted indices on `stackedByDimension`.

        if (!isStackedByIndex) {
          stackedDataRawIndex = stackInfo.data.rawIndexOf(stackInfo.stackedByDimension, byValue);
        }

        if (stackedDataRawIndex >= 0) {
          var val = stackInfo.data.getByRawIndex(stackInfo.stackResultDimension, stackedDataRawIndex); // Considering positive stack, negative stack and empty data

          if (sum >= 0 && val > 0 || // Positive stack
          sum <= 0 && val < 0 // Negative stack
          ) {
              sum += val;
              stackedOver = val;
              break;
            }
        }
      }

      resultVal[0] = sum;
      resultVal[1] = stackedOver;
      return resultVal;
    });
    targetData.hostModel.setData(newData); // Update for consequent calculation

    targetStackInfo.data = newData;
  });
}

module.exports = _default;

/***/ }),

/***/ "d3f4":
/***/ (function(module, exports) {


/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/
function _default(seriesType) {
  return {
    seriesType: seriesType,
    reset: function (seriesModel, ecModel) {
      var legendModels = ecModel.findComponents({
        mainType: 'legend'
      });

      if (!legendModels || !legendModels.length) {
        return;
      }

      var data = seriesModel.getData();
      data.filterSelf(function (idx) {
        var name = data.getName(idx); // If in any legend component the status is not selected.

        for (var i = 0; i < legendModels.length; i++) {
          if (!legendModels[i].isSelected(name)) {
            return false;
          }
        }

        return true;
      });
    }
  };
}

module.exports = _default;

/***/ }),

/***/ "de1c":
/***/ (function(module, exports) {


/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/
var _default = {
  getBoxLayoutParams: function () {
    return {
      left: this.get('left'),
      top: this.get('top'),
      right: this.get('right'),
      bottom: this.get('bottom'),
      width: this.get('width'),
      height: this.get('height')
    };
  }
};
module.exports = _default;

/***/ }),

/***/ "e0d3":
/***/ (function(module, exports, __webpack_require__) {


/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

var zrUtil = __webpack_require__("6d8b");

var env = __webpack_require__("22d1");

/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/
var each = zrUtil.each;
var isObject = zrUtil.isObject;
var isArray = zrUtil.isArray;
/**
 * Make the name displayable. But we should
 * make sure it is not duplicated with user
 * specified name, so use '\0';
 */

var DUMMY_COMPONENT_NAME_PREFIX = 'series\0';
/**
 * If value is not array, then translate it to array.
 * @param  {*} value
 * @return {Array} [value] or value
 */

function normalizeToArray(value) {
  return value instanceof Array ? value : value == null ? [] : [value];
}
/**
 * Sync default option between normal and emphasis like `position` and `show`
 * In case some one will write code like
 *     label: {
 *          show: false,
 *          position: 'outside',
 *          fontSize: 18
 *     },
 *     emphasis: {
 *          label: { show: true }
 *     }
 * @param {Object} opt
 * @param {string} key
 * @param {Array.<string>} subOpts
 */


function defaultEmphasis(opt, key, subOpts) {
  // Caution: performance sensitive.
  if (opt) {
    opt[key] = opt[key] || {};
    opt.emphasis = opt.emphasis || {};
    opt.emphasis[key] = opt.emphasis[key] || {}; // Default emphasis option from normal

    for (var i = 0, len = subOpts.length; i < len; i++) {
      var subOptName = subOpts[i];

      if (!opt.emphasis[key].hasOwnProperty(subOptName) && opt[key].hasOwnProperty(subOptName)) {
        opt.emphasis[key][subOptName] = opt[key][subOptName];
      }
    }
  }
}

var TEXT_STYLE_OPTIONS = ['fontStyle', 'fontWeight', 'fontSize', 'fontFamily', 'rich', 'tag', 'color', 'textBorderColor', 'textBorderWidth', 'width', 'height', 'lineHeight', 'align', 'verticalAlign', 'baseline', 'shadowColor', 'shadowBlur', 'shadowOffsetX', 'shadowOffsetY', 'textShadowColor', 'textShadowBlur', 'textShadowOffsetX', 'textShadowOffsetY', 'backgroundColor', 'borderColor', 'borderWidth', 'borderRadius', 'padding']; // modelUtil.LABEL_OPTIONS = modelUtil.TEXT_STYLE_OPTIONS.concat([
//     'position', 'offset', 'rotate', 'origin', 'show', 'distance', 'formatter',
//     'fontStyle', 'fontWeight', 'fontSize', 'fontFamily',
//     // FIXME: deprecated, check and remove it.
//     'textStyle'
// ]);

/**
 * The method do not ensure performance.
 * data could be [12, 2323, {value: 223}, [1221, 23], {value: [2, 23]}]
 * This helper method retieves value from data.
 * @param {string|number|Date|Array|Object} dataItem
 * @return {number|string|Date|Array.<number|string|Date>}
 */

function getDataItemValue(dataItem) {
  return isObject(dataItem) && !isArray(dataItem) && !(dataItem instanceof Date) ? dataItem.value : dataItem;
}
/**
 * data could be [12, 2323, {value: 223}, [1221, 23], {value: [2, 23]}]
 * This helper method determine if dataItem has extra option besides value
 * @param {string|number|Date|Array|Object} dataItem
 */


function isDataItemOption(dataItem) {
  return isObject(dataItem) && !(dataItem instanceof Array); // // markLine data can be array
  // && !(dataItem[0] && isObject(dataItem[0]) && !(dataItem[0] instanceof Array));
}
/**
 * Mapping to exists for merge.
 *
 * @public
 * @param {Array.<Object>|Array.<module:echarts/model/Component>} exists
 * @param {Object|Array.<Object>} newCptOptions
 * @return {Array.<Object>} Result, like [{exist: ..., option: ...}, {}],
 *                          index of which is the same as exists.
 */


function mappingToExists(exists, newCptOptions) {
  // Mapping by the order by original option (but not order of
  // new option) in merge mode. Because we should ensure
  // some specified index (like xAxisIndex) is consistent with
  // original option, which is easy to understand, espatially in
  // media query. And in most case, merge option is used to
  // update partial option but not be expected to change order.
  newCptOptions = (newCptOptions || []).slice();
  var result = zrUtil.map(exists || [], function (obj, index) {
    return {
      exist: obj
    };
  }); // Mapping by id or name if specified.

  each(newCptOptions, function (cptOption, index) {
    if (!isObject(cptOption)) {
      return;
    } // id has highest priority.


    for (var i = 0; i < result.length; i++) {
      if (!result[i].option // Consider name: two map to one.
      && cptOption.id != null && result[i].exist.id === cptOption.id + '') {
        result[i].option = cptOption;
        newCptOptions[index] = null;
        return;
      }
    }

    for (var i = 0; i < result.length; i++) {
      var exist = result[i].exist;

      if (!result[i].option // Consider name: two map to one.
      // Can not match when both ids exist but different.
      && (exist.id == null || cptOption.id == null) && cptOption.name != null && !isIdInner(cptOption) && !isIdInner(exist) && exist.name === cptOption.name + '') {
        result[i].option = cptOption;
        newCptOptions[index] = null;
        return;
      }
    }
  }); // Otherwise mapping by index.

  each(newCptOptions, function (cptOption, index) {
    if (!isObject(cptOption)) {
      return;
    }

    var i = 0;

    for (; i < result.length; i++) {
      var exist = result[i].exist;

      if (!result[i].option // Existing model that already has id should be able to
      // mapped to (because after mapping performed model may
      // be assigned with a id, whish should not affect next
      // mapping), except those has inner id.
      && !isIdInner(exist) // Caution:
      // Do not overwrite id. But name can be overwritten,
      // because axis use name as 'show label text'.
      // 'exist' always has id and name and we dont
      // need to check it.
      && cptOption.id == null) {
        result[i].option = cptOption;
        break;
      }
    }

    if (i >= result.length) {
      result.push({
        option: cptOption
      });
    }
  });
  return result;
}
/**
 * Make id and name for mapping result (result of mappingToExists)
 * into `keyInfo` field.
 *
 * @public
 * @param {Array.<Object>} Result, like [{exist: ..., option: ...}, {}],
 *                          which order is the same as exists.
 * @return {Array.<Object>} The input.
 */


function makeIdAndName(mapResult) {
  // We use this id to hash component models and view instances
  // in echarts. id can be specified by user, or auto generated.
  // The id generation rule ensures new view instance are able
  // to mapped to old instance when setOption are called in
  // no-merge mode. So we generate model id by name and plus
  // type in view id.
  // name can be duplicated among components, which is convenient
  // to specify multi components (like series) by one name.
  // Ensure that each id is distinct.
  var idMap = zrUtil.createHashMap();
  each(mapResult, function (item, index) {
    var existCpt = item.exist;
    existCpt && idMap.set(existCpt.id, item);
  });
  each(mapResult, function (item, index) {
    var opt = item.option;
    zrUtil.assert(!opt || opt.id == null || !idMap.get(opt.id) || idMap.get(opt.id) === item, 'id duplicates: ' + (opt && opt.id));
    opt && opt.id != null && idMap.set(opt.id, item);
    !item.keyInfo && (item.keyInfo = {});
  }); // Make name and id.

  each(mapResult, function (item, index) {
    var existCpt = item.exist;
    var opt = item.option;
    var keyInfo = item.keyInfo;

    if (!isObject(opt)) {
      return;
    } // name can be overwitten. Consider case: axis.name = '20km'.
    // But id generated by name will not be changed, which affect
    // only in that case: setOption with 'not merge mode' and view
    // instance will be recreated, which can be accepted.


    keyInfo.name = opt.name != null ? opt.name + '' : existCpt ? existCpt.name // Avoid diffferent series has the same name,
    // because name may be used like in color pallet.
    : DUMMY_COMPONENT_NAME_PREFIX + index;

    if (existCpt) {
      keyInfo.id = existCpt.id;
    } else if (opt.id != null) {
      keyInfo.id = opt.id + '';
    } else {
      // Consider this situatoin:
      //  optionA: [{name: 'a'}, {name: 'a'}, {..}]
      //  optionB [{..}, {name: 'a'}, {name: 'a'}]
      // Series with the same name between optionA and optionB
      // should be mapped.
      var idNum = 0;

      do {
        keyInfo.id = '\0' + keyInfo.name + '\0' + idNum++;
      } while (idMap.get(keyInfo.id));
    }

    idMap.set(keyInfo.id, item);
  });
}

function isNameSpecified(componentModel) {
  var name = componentModel.name; // Is specified when `indexOf` get -1 or > 0.

  return !!(name && name.indexOf(DUMMY_COMPONENT_NAME_PREFIX));
}
/**
 * @public
 * @param {Object} cptOption
 * @return {boolean}
 */


function isIdInner(cptOption) {
  return isObject(cptOption) && cptOption.id && (cptOption.id + '').indexOf('\0_ec_\0') === 0;
}
/**
 * A helper for removing duplicate items between batchA and batchB,
 * and in themselves, and categorize by series.
 *
 * @param {Array.<Object>} batchA Like: [{seriesId: 2, dataIndex: [32, 4, 5]}, ...]
 * @param {Array.<Object>} batchB Like: [{seriesId: 2, dataIndex: [32, 4, 5]}, ...]
 * @return {Array.<Array.<Object>, Array.<Object>>} result: [resultBatchA, resultBatchB]
 */


function compressBatches(batchA, batchB) {
  var mapA = {};
  var mapB = {};
  makeMap(batchA || [], mapA);
  makeMap(batchB || [], mapB, mapA);
  return [mapToArray(mapA), mapToArray(mapB)];

  function makeMap(sourceBatch, map, otherMap) {
    for (var i = 0, len = sourceBatch.length; i < len; i++) {
      var seriesId = sourceBatch[i].seriesId;
      var dataIndices = normalizeToArray(sourceBatch[i].dataIndex);
      var otherDataIndices = otherMap && otherMap[seriesId];

      for (var j = 0, lenj = dataIndices.length; j < lenj; j++) {
        var dataIndex = dataIndices[j];

        if (otherDataIndices && otherDataIndices[dataIndex]) {
          otherDataIndices[dataIndex] = null;
        } else {
          (map[seriesId] || (map[seriesId] = {}))[dataIndex] = 1;
        }
      }
    }
  }

  function mapToArray(map, isData) {
    var result = [];

    for (var i in map) {
      if (map.hasOwnProperty(i) && map[i] != null) {
        if (isData) {
          result.push(+i);
        } else {
          var dataIndices = mapToArray(map[i], true);
          dataIndices.length && result.push({
            seriesId: i,
            dataIndex: dataIndices
          });
        }
      }
    }

    return result;
  }
}
/**
 * @param {module:echarts/data/List} data
 * @param {Object} payload Contains dataIndex (means rawIndex) / dataIndexInside / name
 *                         each of which can be Array or primary type.
 * @return {number|Array.<number>} dataIndex If not found, return undefined/null.
 */


function queryDataIndex(data, payload) {
  if (payload.dataIndexInside != null) {
    return payload.dataIndexInside;
  } else if (payload.dataIndex != null) {
    return zrUtil.isArray(payload.dataIndex) ? zrUtil.map(payload.dataIndex, function (value) {
      return data.indexOfRawIndex(value);
    }) : data.indexOfRawIndex(payload.dataIndex);
  } else if (payload.name != null) {
    return zrUtil.isArray(payload.name) ? zrUtil.map(payload.name, function (value) {
      return data.indexOfName(value);
    }) : data.indexOfName(payload.name);
  }
}
/**
 * Enable property storage to any host object.
 * Notice: Serialization is not supported.
 *
 * For example:
 * var inner = zrUitl.makeInner();
 *
 * function some1(hostObj) {
 *      inner(hostObj).someProperty = 1212;
 *      ...
 * }
 * function some2() {
 *      var fields = inner(this);
 *      fields.someProperty1 = 1212;
 *      fields.someProperty2 = 'xx';
 *      ...
 * }
 *
 * @return {Function}
 */


function makeInner() {
  // Consider different scope by es module import.
  var key = '__\0ec_inner_' + innerUniqueIndex++ + '_' + Math.random().toFixed(5);
  return function (hostObj) {
    return hostObj[key] || (hostObj[key] = {});
  };
}

var innerUniqueIndex = 0;
/**
 * @param {module:echarts/model/Global} ecModel
 * @param {string|Object} finder
 *        If string, e.g., 'geo', means {geoIndex: 0}.
 *        If Object, could contain some of these properties below:
 *        {
 *            seriesIndex, seriesId, seriesName,
 *            geoIndex, geoId, geoName,
 *            bmapIndex, bmapId, bmapName,
 *            xAxisIndex, xAxisId, xAxisName,
 *            yAxisIndex, yAxisId, yAxisName,
 *            gridIndex, gridId, gridName,
 *            ... (can be extended)
 *        }
 *        Each properties can be number|string|Array.<number>|Array.<string>
 *        For example, a finder could be
 *        {
 *            seriesIndex: 3,
 *            geoId: ['aa', 'cc'],
 *            gridName: ['xx', 'rr']
 *        }
 *        xxxIndex can be set as 'all' (means all xxx) or 'none' (means not specify)
 *        If nothing or null/undefined specified, return nothing.
 * @param {Object} [opt]
 * @param {string} [opt.defaultMainType]
 * @param {Array.<string>} [opt.includeMainTypes]
 * @return {Object} result like:
 *        {
 *            seriesModels: [seriesModel1, seriesModel2],
 *            seriesModel: seriesModel1, // The first model
 *            geoModels: [geoModel1, geoModel2],
 *            geoModel: geoModel1, // The first model
 *            ...
 *        }
 */

function parseFinder(ecModel, finder, opt) {
  if (zrUtil.isString(finder)) {
    var obj = {};
    obj[finder + 'Index'] = 0;
    finder = obj;
  }

  var defaultMainType = opt && opt.defaultMainType;

  if (defaultMainType && !has(finder, defaultMainType + 'Index') && !has(finder, defaultMainType + 'Id') && !has(finder, defaultMainType + 'Name')) {
    finder[defaultMainType + 'Index'] = 0;
  }

  var result = {};
  each(finder, function (value, key) {
    var value = finder[key]; // Exclude 'dataIndex' and other illgal keys.

    if (key === 'dataIndex' || key === 'dataIndexInside') {
      result[key] = value;
      return;
    }

    var parsedKey = key.match(/^(\w+)(Index|Id|Name)$/) || [];
    var mainType = parsedKey[1];
    var queryType = (parsedKey[2] || '').toLowerCase();

    if (!mainType || !queryType || value == null || queryType === 'index' && value === 'none' || opt && opt.includeMainTypes && zrUtil.indexOf(opt.includeMainTypes, mainType) < 0) {
      return;
    }

    var queryParam = {
      mainType: mainType
    };

    if (queryType !== 'index' || value !== 'all') {
      queryParam[queryType] = value;
    }

    var models = ecModel.queryComponents(queryParam);
    result[mainType + 'Models'] = models;
    result[mainType + 'Model'] = models[0];
  });
  return result;
}

function has(obj, prop) {
  return obj && obj.hasOwnProperty(prop);
}

function setAttribute(dom, key, value) {
  dom.setAttribute ? dom.setAttribute(key, value) : dom[key] = value;
}

function getAttribute(dom, key) {
  return dom.getAttribute ? dom.getAttribute(key) : dom[key];
}

function getTooltipRenderMode(renderModeOption) {
  if (renderModeOption === 'auto') {
    // Using html when `document` exists, use richText otherwise
    return env.domSupported ? 'html' : 'richText';
  } else {
    return renderModeOption || 'html';
  }
}
/**
 * Group a list by key.
 *
 * @param {Array} array
 * @param {Function} getKey
 *        param {*} Array item
 *        return {string} key
 * @return {Object} Result
 *        {Array}: keys,
 *        {module:zrender/core/util/HashMap} buckets: {key -> Array}
 */


function groupData(array, getKey) {
  var buckets = zrUtil.createHashMap();
  var keys = [];
  zrUtil.each(array, function (item) {
    var key = getKey(item);
    (buckets.get(key) || (keys.push(key), buckets.set(key, []))).push(item);
  });
  return {
    keys: keys,
    buckets: buckets
  };
}

exports.normalizeToArray = normalizeToArray;
exports.defaultEmphasis = defaultEmphasis;
exports.TEXT_STYLE_OPTIONS = TEXT_STYLE_OPTIONS;
exports.getDataItemValue = getDataItemValue;
exports.isDataItemOption = isDataItemOption;
exports.mappingToExists = mappingToExists;
exports.makeIdAndName = makeIdAndName;
exports.isNameSpecified = isNameSpecified;
exports.isIdInner = isIdInner;
exports.compressBatches = compressBatches;
exports.queryDataIndex = queryDataIndex;
exports.makeInner = makeInner;
exports.parseFinder = parseFinder;
exports.setAttribute = setAttribute;
exports.getAttribute = getAttribute;
exports.getTooltipRenderMode = getTooltipRenderMode;
exports.groupData = groupData;

/***/ }),

/***/ "e0d8":
/***/ (function(module, exports, __webpack_require__) {


/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

var clazzUtil = __webpack_require__("625e");

/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

/**
 * // Scale class management
 * @module echarts/scale/Scale
 */

/**
 * @param {Object} [setting]
 */
function Scale(setting) {
  this._setting = setting || {};
  /**
   * Extent
   * @type {Array.<number>}
   * @protected
   */

  this._extent = [Infinity, -Infinity];
  /**
   * Step is calculated in adjustExtent
   * @type {Array.<number>}
   * @protected
   */

  this._interval = 0;
  this.init && this.init.apply(this, arguments);
}
/**
 * Parse input val to valid inner number.
 * @param {*} val
 * @return {number}
 */


Scale.prototype.parse = function (val) {
  // Notice: This would be a trap here, If the implementation
  // of this method depends on extent, and this method is used
  // before extent set (like in dataZoom), it would be wrong.
  // Nevertheless, parse does not depend on extent generally.
  return val;
};

Scale.prototype.getSetting = function (name) {
  return this._setting[name];
};

Scale.prototype.contain = function (val) {
  var extent = this._extent;
  return val >= extent[0] && val <= extent[1];
};
/**
 * Normalize value to linear [0, 1], return 0.5 if extent span is 0
 * @param {number} val
 * @return {number}
 */


Scale.prototype.normalize = function (val) {
  var extent = this._extent;

  if (extent[1] === extent[0]) {
    return 0.5;
  }

  return (val - extent[0]) / (extent[1] - extent[0]);
};
/**
 * Scale normalized value
 * @param {number} val
 * @return {number}
 */


Scale.prototype.scale = function (val) {
  var extent = this._extent;
  return val * (extent[1] - extent[0]) + extent[0];
};
/**
 * Set extent from data
 * @param {Array.<number>} other
 */


Scale.prototype.unionExtent = function (other) {
  var extent = this._extent;
  other[0] < extent[0] && (extent[0] = other[0]);
  other[1] > extent[1] && (extent[1] = other[1]); // not setExtent because in log axis it may transformed to power
  // this.setExtent(extent[0], extent[1]);
};
/**
 * Set extent from data
 * @param {module:echarts/data/List} data
 * @param {string} dim
 */


Scale.prototype.unionExtentFromData = function (data, dim) {
  this.unionExtent(data.getApproximateExtent(dim));
};
/**
 * Get extent
 * @return {Array.<number>}
 */


Scale.prototype.getExtent = function () {
  return this._extent.slice();
};
/**
 * Set extent
 * @param {number} start
 * @param {number} end
 */


Scale.prototype.setExtent = function (start, end) {
  var thisExtent = this._extent;

  if (!isNaN(start)) {
    thisExtent[0] = start;
  }

  if (!isNaN(end)) {
    thisExtent[1] = end;
  }
};
/**
 * When axis extent depends on data and no data exists,
 * axis ticks should not be drawn, which is named 'blank'.
 */


Scale.prototype.isBlank = function () {
  return this._isBlank;
},
/**
 * When axis extent depends on data and no data exists,
 * axis ticks should not be drawn, which is named 'blank'.
 */
Scale.prototype.setBlank = function (isBlank) {
  this._isBlank = isBlank;
};
/**
 * @abstract
 * @param {*} tick
 * @return {string} label of the tick.
 */

Scale.prototype.getLabel = null;
clazzUtil.enableClassExtend(Scale);
clazzUtil.enableClassManagement(Scale, {
  registerWhenExtend: true
});
var _default = Scale;
module.exports = _default;

/***/ }),

/***/ "e47b":
/***/ (function(module, exports, __webpack_require__) {


/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

var _model = __webpack_require__("e0d3");

var makeInner = _model.makeInner;
var normalizeToArray = _model.normalizeToArray;

/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/
var inner = makeInner();

function getNearestColorPalette(colors, requestColorNum) {
  var paletteNum = colors.length; // TODO colors must be in order

  for (var i = 0; i < paletteNum; i++) {
    if (colors[i].length > requestColorNum) {
      return colors[i];
    }
  }

  return colors[paletteNum - 1];
}

var _default = {
  clearColorPalette: function () {
    inner(this).colorIdx = 0;
    inner(this).colorNameMap = {};
  },

  /**
   * @param {string} name MUST NOT be null/undefined. Otherwise call this function
   *                 twise with the same parameters will get different result.
   * @param {Object} [scope=this]
   * @param {Object} [requestColorNum]
   * @return {string} color string.
   */
  getColorFromPalette: function (name, scope, requestColorNum) {
    scope = scope || this;
    var scopeFields = inner(scope);
    var colorIdx = scopeFields.colorIdx || 0;
    var colorNameMap = scopeFields.colorNameMap = scopeFields.colorNameMap || {}; // Use `hasOwnProperty` to avoid conflict with Object.prototype.

    if (colorNameMap.hasOwnProperty(name)) {
      return colorNameMap[name];
    }

    var defaultColorPalette = normalizeToArray(this.get('color', true));
    var layeredColorPalette = this.get('colorLayer', true);
    var colorPalette = requestColorNum == null || !layeredColorPalette ? defaultColorPalette : getNearestColorPalette(layeredColorPalette, requestColorNum); // In case can't find in layered color palette.

    colorPalette = colorPalette || defaultColorPalette;

    if (!colorPalette || !colorPalette.length) {
      return;
    }

    var color = colorPalette[colorIdx];

    if (name) {
      colorNameMap[name] = color;
    }

    scopeFields.colorIdx = (colorIdx + 1) % colorPalette.length;
    return color;
  }
};
module.exports = _default;

/***/ }),

/***/ "e6cd":
/***/ (function(module, exports, __webpack_require__) {


/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

var zrUtil = __webpack_require__("6d8b");

/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

/**
 * @param {number} [time=500] Time in ms
 * @param {string} [easing='linear']
 * @param {number} [delay=0]
 * @param {Function} [callback]
 *
 * @example
 *  // Animate position
 *  animation
 *      .createWrap()
 *      .add(el1, {position: [10, 10]})
 *      .add(el2, {shape: {width: 500}, style: {fill: 'red'}}, 400)
 *      .done(function () { // done })
 *      .start('cubicOut');
 */
function createWrap() {
  var storage = [];
  var elExistsMap = {};
  var doneCallback;
  return {
    /**
     * Caution: a el can only be added once, otherwise 'done'
     * might not be called. This method checks this (by el.id),
     * suppresses adding and returns false when existing el found.
     *
     * @param {modele:zrender/Element} el
     * @param {Object} target
     * @param {number} [time=500]
     * @param {number} [delay=0]
     * @param {string} [easing='linear']
     * @return {boolean} Whether adding succeeded.
     *
     * @example
     *     add(el, target, time, delay, easing);
     *     add(el, target, time, easing);
     *     add(el, target, time);
     *     add(el, target);
     */
    add: function (el, target, time, delay, easing) {
      if (zrUtil.isString(delay)) {
        easing = delay;
        delay = 0;
      }

      if (elExistsMap[el.id]) {
        return false;
      }

      elExistsMap[el.id] = 1;
      storage.push({
        el: el,
        target: target,
        time: time,
        delay: delay,
        easing: easing
      });
      return true;
    },

    /**
     * Only execute when animation finished. Will not execute when any
     * of 'stop' or 'stopAnimation' called.
     *
     * @param {Function} callback
     */
    done: function (callback) {
      doneCallback = callback;
      return this;
    },

    /**
     * Will stop exist animation firstly.
     */
    start: function () {
      var count = storage.length;

      for (var i = 0, len = storage.length; i < len; i++) {
        var item = storage[i];
        item.el.animateTo(item.target, item.time, item.delay, item.easing, done);
      }

      return this;

      function done() {
        count--;

        if (!count) {
          storage.length = 0;
          elExistsMap = {};
          doneCallback && doneCallback();
        }
      }
    }
  };
}

exports.createWrap = createWrap;

/***/ }),

/***/ "e887":
/***/ (function(module, exports, __webpack_require__) {


/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

var _util = __webpack_require__("6d8b");

var each = _util.each;

var Group = __webpack_require__("e1fc");

var componentUtil = __webpack_require__("8918");

var clazzUtil = __webpack_require__("625e");

var modelUtil = __webpack_require__("e0d3");

var graphicUtil = __webpack_require__("2306");

var _task = __webpack_require__("f47d");

var createTask = _task.createTask;

var createRenderPlanner = __webpack_require__("cccd");

/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/
var inner = modelUtil.makeInner();
var renderPlanner = createRenderPlanner();

function Chart() {
  /**
   * @type {module:zrender/container/Group}
   * @readOnly
   */
  this.group = new Group();
  /**
   * @type {string}
   * @readOnly
   */

  this.uid = componentUtil.getUID('viewChart');
  this.renderTask = createTask({
    plan: renderTaskPlan,
    reset: renderTaskReset
  });
  this.renderTask.context = {
    view: this
  };
}

Chart.prototype = {
  type: 'chart',

  /**
   * Init the chart.
   * @param  {module:echarts/model/Global} ecModel
   * @param  {module:echarts/ExtensionAPI} api
   */
  init: function (ecModel, api) {},

  /**
   * Render the chart.
   * @param  {module:echarts/model/Series} seriesModel
   * @param  {module:echarts/model/Global} ecModel
   * @param  {module:echarts/ExtensionAPI} api
   * @param  {Object} payload
   */
  render: function (seriesModel, ecModel, api, payload) {},

  /**
   * Highlight series or specified data item.
   * @param  {module:echarts/model/Series} seriesModel
   * @param  {module:echarts/model/Global} ecModel
   * @param  {module:echarts/ExtensionAPI} api
   * @param  {Object} payload
   */
  highlight: function (seriesModel, ecModel, api, payload) {
    toggleHighlight(seriesModel.getData(), payload, 'emphasis');
  },

  /**
   * Downplay series or specified data item.
   * @param  {module:echarts/model/Series} seriesModel
   * @param  {module:echarts/model/Global} ecModel
   * @param  {module:echarts/ExtensionAPI} api
   * @param  {Object} payload
   */
  downplay: function (seriesModel, ecModel, api, payload) {
    toggleHighlight(seriesModel.getData(), payload, 'normal');
  },

  /**
   * Remove self.
   * @param  {module:echarts/model/Global} ecModel
   * @param  {module:echarts/ExtensionAPI} api
   */
  remove: function (ecModel, api) {
    this.group.removeAll();
  },

  /**
   * Dispose self.
   * @param  {module:echarts/model/Global} ecModel
   * @param  {module:echarts/ExtensionAPI} api
   */
  dispose: function () {},

  /**
   * Rendering preparation in progressive mode.
   * @param  {module:echarts/model/Series} seriesModel
   * @param  {module:echarts/model/Global} ecModel
   * @param  {module:echarts/ExtensionAPI} api
   * @param  {Object} payload
   */
  incrementalPrepareRender: null,

  /**
   * Render in progressive mode.
   * @param  {Object} params See taskParams in `stream/task.js`
   * @param  {module:echarts/model/Series} seriesModel
   * @param  {module:echarts/model/Global} ecModel
   * @param  {module:echarts/ExtensionAPI} api
   * @param  {Object} payload
   */
  incrementalRender: null,

  /**
   * Update transform directly.
   * @param  {module:echarts/model/Series} seriesModel
   * @param  {module:echarts/model/Global} ecModel
   * @param  {module:echarts/ExtensionAPI} api
   * @param  {Object} payload
   * @return {Object} {update: true}
   */
  updateTransform: null,

  /**
   * The view contains the given point.
   * @interface
   * @param {Array.<number>} point
   * @return {boolean}
   */
  // containPoint: function () {}

  /**
   * @param {string} eventType
   * @param {Object} query
   * @param {module:zrender/Element} targetEl
   * @param {Object} packedEvent
   * @return {boolen} Pass only when return `true`.
   */
  filterForExposedEvent: null
};
var chartProto = Chart.prototype;

chartProto.updateView = chartProto.updateLayout = chartProto.updateVisual = function (seriesModel, ecModel, api, payload) {
  this.render(seriesModel, ecModel, api, payload);
};
/**
 * Set state of single element
 * @param {module:zrender/Element} el
 * @param {string} state 'normal'|'emphasis'
 * @param {number} highlightDigit
 */


function elSetState(el, state, highlightDigit) {
  if (el) {
    el.trigger(state, highlightDigit);

    if (el.isGroup // Simple optimize.
    && !graphicUtil.isHighDownDispatcher(el)) {
      for (var i = 0, len = el.childCount(); i < len; i++) {
        elSetState(el.childAt(i), state, highlightDigit);
      }
    }
  }
}
/**
 * @param {module:echarts/data/List} data
 * @param {Object} payload
 * @param {string} state 'normal'|'emphasis'
 */


function toggleHighlight(data, payload, state) {
  var dataIndex = modelUtil.queryDataIndex(data, payload);
  var highlightDigit = payload && payload.highlightKey != null ? graphicUtil.getHighlightDigit(payload.highlightKey) : null;

  if (dataIndex != null) {
    each(modelUtil.normalizeToArray(dataIndex), function (dataIdx) {
      elSetState(data.getItemGraphicEl(dataIdx), state, highlightDigit);
    });
  } else {
    data.eachItemGraphicEl(function (el) {
      elSetState(el, state, highlightDigit);
    });
  }
} // Enable Chart.extend.


clazzUtil.enableClassExtend(Chart, ['dispose']); // Add capability of registerClass, getClass, hasClass, registerSubTypeDefaulter and so on.

clazzUtil.enableClassManagement(Chart, {
  registerWhenExtend: true
});

Chart.markUpdateMethod = function (payload, methodName) {
  inner(payload).updateMethod = methodName;
};

function renderTaskPlan(context) {
  return renderPlanner(context.model);
}

function renderTaskReset(context) {
  var seriesModel = context.model;
  var ecModel = context.ecModel;
  var api = context.api;
  var payload = context.payload; // ???! remove updateView updateVisual

  var progressiveRender = seriesModel.pipelineContext.progressiveRender;
  var view = context.view;
  var updateMethod = payload && inner(payload).updateMethod;
  var methodName = progressiveRender ? 'incrementalPrepareRender' : updateMethod && view[updateMethod] ? updateMethod // `appendData` is also supported when data amount
  // is less than progressive threshold.
  : 'render';

  if (methodName !== 'render') {
    view[methodName](seriesModel, ecModel, api, payload);
  }

  return progressMethodMap[methodName];
}

var progressMethodMap = {
  incrementalPrepareRender: {
    progress: function (params, context) {
      context.view.incrementalRender(params, context.model, context.ecModel, context.api, context.payload);
    }
  },
  render: {
    // Put view.render in `progress` to support appendData. But in this case
    // view.render should not be called in reset, otherwise it will be called
    // twise. Use `forceFirstProgress` to make sure that view.render is called
    // in any cases.
    forceFirstProgress: true,
    progress: function (params, context) {
      context.view.render(context.model, context.ecModel, context.api, context.payload);
    }
  }
};
var _default = Chart;
module.exports = _default;

/***/ }),

/***/ "eda2":
/***/ (function(module, exports, __webpack_require__) {


/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

var zrUtil = __webpack_require__("6d8b");

var textContain = __webpack_require__("e86a");

var numberUtil = __webpack_require__("3842");

/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/
// import Text from 'zrender/src/graphic/Text';

/**
 * 每三位默认加,格式化
 * @param {string|number} x
 * @return {string}
 */
function addCommas(x) {
  if (isNaN(x)) {
    return '-';
  }

  x = (x + '').split('.');
  return x[0].replace(/(\d{1,3})(?=(?:\d{3})+(?!\d))/g, '$1,') + (x.length > 1 ? '.' + x[1] : '');
}
/**
 * @param {string} str
 * @param {boolean} [upperCaseFirst=false]
 * @return {string} str
 */


function toCamelCase(str, upperCaseFirst) {
  str = (str || '').toLowerCase().replace(/-(.)/g, function (match, group1) {
    return group1.toUpperCase();
  });

  if (upperCaseFirst && str) {
    str = str.charAt(0).toUpperCase() + str.slice(1);
  }

  return str;
}

var normalizeCssArray = zrUtil.normalizeCssArray;
var replaceReg = /([&<>"'])/g;
var replaceMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  '\'': '&#39;'
};

function encodeHTML(source) {
  return source == null ? '' : (source + '').replace(replaceReg, function (str, c) {
    return replaceMap[c];
  });
}

var TPL_VAR_ALIAS = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];

var wrapVar = function (varName, seriesIdx) {
  return '{' + varName + (seriesIdx == null ? '' : seriesIdx) + '}';
};
/**
 * Template formatter
 * @param {string} tpl
 * @param {Array.<Object>|Object} paramsList
 * @param {boolean} [encode=false]
 * @return {string}
 */


function formatTpl(tpl, paramsList, encode) {
  if (!zrUtil.isArray(paramsList)) {
    paramsList = [paramsList];
  }

  var seriesLen = paramsList.length;

  if (!seriesLen) {
    return '';
  }

  var $vars = paramsList[0].$vars || [];

  for (var i = 0; i < $vars.length; i++) {
    var alias = TPL_VAR_ALIAS[i];
    tpl = tpl.replace(wrapVar(alias), wrapVar(alias, 0));
  }

  for (var seriesIdx = 0; seriesIdx < seriesLen; seriesIdx++) {
    for (var k = 0; k < $vars.length; k++) {
      var val = paramsList[seriesIdx][$vars[k]];
      tpl = tpl.replace(wrapVar(TPL_VAR_ALIAS[k], seriesIdx), encode ? encodeHTML(val) : val);
    }
  }

  return tpl;
}
/**
 * simple Template formatter
 *
 * @param {string} tpl
 * @param {Object} param
 * @param {boolean} [encode=false]
 * @return {string}
 */


function formatTplSimple(tpl, param, encode) {
  zrUtil.each(param, function (value, key) {
    tpl = tpl.replace('{' + key + '}', encode ? encodeHTML(value) : value);
  });
  return tpl;
}
/**
 * @param {Object|string} [opt] If string, means color.
 * @param {string} [opt.color]
 * @param {string} [opt.extraCssText]
 * @param {string} [opt.type='item'] 'item' or 'subItem'
 * @param {string} [opt.renderMode='html'] render mode of tooltip, 'html' or 'richText'
 * @param {string} [opt.markerId='X'] id name for marker. If only one marker is in a rich text, this can be omitted.
 * @return {string}
 */


function getTooltipMarker(opt, extraCssText) {
  opt = zrUtil.isString(opt) ? {
    color: opt,
    extraCssText: extraCssText
  } : opt || {};
  var color = opt.color;
  var type = opt.type;
  var extraCssText = opt.extraCssText;
  var renderMode = opt.renderMode || 'html';
  var markerId = opt.markerId || 'X';

  if (!color) {
    return '';
  }

  if (renderMode === 'html') {
    return type === 'subItem' ? '<span style="display:inline-block;vertical-align:middle;margin-right:8px;margin-left:3px;' + 'border-radius:4px;width:4px;height:4px;background-color:' + encodeHTML(color) + ';' + (extraCssText || '') + '"></span>' : '<span style="display:inline-block;margin-right:5px;' + 'border-radius:10px;width:10px;height:10px;background-color:' + encodeHTML(color) + ';' + (extraCssText || '') + '"></span>';
  } else {
    // Space for rich element marker
    return {
      renderMode: renderMode,
      content: '{marker' + markerId + '|}  ',
      style: {
        color: color
      }
    };
  }
}

function pad(str, len) {
  str += '';
  return '0000'.substr(0, len - str.length) + str;
}
/**
 * ISO Date format
 * @param {string} tpl
 * @param {number} value
 * @param {boolean} [isUTC=false] Default in local time.
 *           see `module:echarts/scale/Time`
 *           and `module:echarts/util/number#parseDate`.
 * @inner
 */


function formatTime(tpl, value, isUTC) {
  if (tpl === 'week' || tpl === 'month' || tpl === 'quarter' || tpl === 'half-year' || tpl === 'year') {
    tpl = 'MM-dd\nyyyy';
  }

  var date = numberUtil.parseDate(value);
  var utc = isUTC ? 'UTC' : '';
  var y = date['get' + utc + 'FullYear']();
  var M = date['get' + utc + 'Month']() + 1;
  var d = date['get' + utc + 'Date']();
  var h = date['get' + utc + 'Hours']();
  var m = date['get' + utc + 'Minutes']();
  var s = date['get' + utc + 'Seconds']();
  var S = date['get' + utc + 'Milliseconds']();
  tpl = tpl.replace('MM', pad(M, 2)).replace('M', M).replace('yyyy', y).replace('yy', y % 100).replace('dd', pad(d, 2)).replace('d', d).replace('hh', pad(h, 2)).replace('h', h).replace('mm', pad(m, 2)).replace('m', m).replace('ss', pad(s, 2)).replace('s', s).replace('SSS', pad(S, 3));
  return tpl;
}
/**
 * Capital first
 * @param {string} str
 * @return {string}
 */


function capitalFirst(str) {
  return str ? str.charAt(0).toUpperCase() + str.substr(1) : str;
}

var truncateText = textContain.truncateText;
/**
 * @public
 * @param {Object} opt
 * @param {string} opt.text
 * @param {string} opt.font
 * @param {string} [opt.textAlign='left']
 * @param {string} [opt.textVerticalAlign='top']
 * @param {Array.<number>} [opt.textPadding]
 * @param {number} [opt.textLineHeight]
 * @param {Object} [opt.rich]
 * @param {Object} [opt.truncate]
 * @return {Object} {x, y, width, height, lineHeight}
 */

function getTextBoundingRect(opt) {
  return textContain.getBoundingRect(opt.text, opt.font, opt.textAlign, opt.textVerticalAlign, opt.textPadding, opt.textLineHeight, opt.rich, opt.truncate);
}
/**
 * @deprecated
 * the `textLineHeight` was added later.
 * For backward compatiblility, put it as the last parameter.
 * But deprecated this interface. Please use `getTextBoundingRect` instead.
 */


function getTextRect(text, font, textAlign, textVerticalAlign, textPadding, rich, truncate, textLineHeight) {
  return textContain.getBoundingRect(text, font, textAlign, textVerticalAlign, textPadding, textLineHeight, rich, truncate);
}

exports.addCommas = addCommas;
exports.toCamelCase = toCamelCase;
exports.normalizeCssArray = normalizeCssArray;
exports.encodeHTML = encodeHTML;
exports.formatTpl = formatTpl;
exports.formatTplSimple = formatTplSimple;
exports.getTooltipMarker = getTooltipMarker;
exports.formatTime = formatTime;
exports.capitalFirst = capitalFirst;
exports.truncateText = truncateText;
exports.getTextBoundingRect = getTextBoundingRect;
exports.getTextRect = getTextRect;

/***/ }),

/***/ "f219":
/***/ (function(module, exports) {


/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/
var contrastColor = '#eee';

var axisCommon = function () {
  return {
    axisLine: {
      lineStyle: {
        color: contrastColor
      }
    },
    axisTick: {
      lineStyle: {
        color: contrastColor
      }
    },
    axisLabel: {
      textStyle: {
        color: contrastColor
      }
    },
    splitLine: {
      lineStyle: {
        type: 'dashed',
        color: '#aaa'
      }
    },
    splitArea: {
      areaStyle: {
        color: contrastColor
      }
    }
  };
};

var colorPalette = ['#dd6b66', '#759aa0', '#e69d87', '#8dc1a9', '#ea7e53', '#eedd78', '#73a373', '#73b9bc', '#7289ab', '#91ca8c', '#f49f42'];
var theme = {
  color: colorPalette,
  backgroundColor: '#333',
  tooltip: {
    axisPointer: {
      lineStyle: {
        color: contrastColor
      },
      crossStyle: {
        color: contrastColor
      },
      label: {
        color: '#000'
      }
    }
  },
  legend: {
    textStyle: {
      color: contrastColor
    }
  },
  textStyle: {
    color: contrastColor
  },
  title: {
    textStyle: {
      color: contrastColor
    }
  },
  toolbox: {
    iconStyle: {
      normal: {
        borderColor: contrastColor
      }
    }
  },
  dataZoom: {
    textStyle: {
      color: contrastColor
    }
  },
  visualMap: {
    textStyle: {
      color: contrastColor
    }
  },
  timeline: {
    lineStyle: {
      color: contrastColor
    },
    itemStyle: {
      normal: {
        color: colorPalette[1]
      }
    },
    label: {
      normal: {
        textStyle: {
          color: contrastColor
        }
      }
    },
    controlStyle: {
      normal: {
        color: contrastColor,
        borderColor: contrastColor
      }
    }
  },
  timeAxis: axisCommon(),
  logAxis: axisCommon(),
  valueAxis: axisCommon(),
  categoryAxis: axisCommon(),
  line: {
    symbol: 'circle'
  },
  graph: {
    color: colorPalette
  },
  gauge: {
    title: {
      textStyle: {
        color: contrastColor
      }
    }
  },
  candlestick: {
    itemStyle: {
      normal: {
        color: '#FD1050',
        color0: '#0CF49B',
        borderColor: '#FD1050',
        borderColor0: '#0CF49B'
      }
    }
  }
};
theme.categoryAxis.splitLine.show = false;
var _default = theme;
module.exports = _default;

/***/ }),

/***/ "f47d":
/***/ (function(module, exports, __webpack_require__) {


/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

var _util = __webpack_require__("6d8b");

var assert = _util.assert;
var isArray = _util.isArray;

var _config = __webpack_require__("4e08");

var __DEV__ = _config.__DEV__;

/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

/**
 * @param {Object} define
 * @return See the return of `createTask`.
 */
function createTask(define) {
  return new Task(define);
}
/**
 * @constructor
 * @param {Object} define
 * @param {Function} define.reset Custom reset
 * @param {Function} [define.plan] Returns 'reset' indicate reset immediately.
 * @param {Function} [define.count] count is used to determin data task.
 * @param {Function} [define.onDirty] count is used to determin data task.
 */


function Task(define) {
  define = define || {};
  this._reset = define.reset;
  this._plan = define.plan;
  this._count = define.count;
  this._onDirty = define.onDirty;
  this._dirty = true; // Context must be specified implicitly, to
  // avoid miss update context when model changed.

  this.context;
}

var taskProto = Task.prototype;
/**
 * @param {Object} performArgs
 * @param {number} [performArgs.step] Specified step.
 * @param {number} [performArgs.skip] Skip customer perform call.
 * @param {number} [performArgs.modBy] Sampling window size.
 * @param {number} [performArgs.modDataCount] Sampling count.
 */

taskProto.perform = function (performArgs) {
  var upTask = this._upstream;
  var skip = performArgs && performArgs.skip; // TODO some refactor.
  // Pull data. Must pull data each time, because context.data
  // may be updated by Series.setData.

  if (this._dirty && upTask) {
    var context = this.context;
    context.data = context.outputData = upTask.context.outputData;
  }

  if (this.__pipeline) {
    this.__pipeline.currentTask = this;
  }

  var planResult;

  if (this._plan && !skip) {
    planResult = this._plan(this.context);
  } // Support sharding by mod, which changes the render sequence and makes the rendered graphic
  // elements uniformed distributed when progress, especially when moving or zooming.


  var lastModBy = normalizeModBy(this._modBy);
  var lastModDataCount = this._modDataCount || 0;
  var modBy = normalizeModBy(performArgs && performArgs.modBy);
  var modDataCount = performArgs && performArgs.modDataCount || 0;

  if (lastModBy !== modBy || lastModDataCount !== modDataCount) {
    planResult = 'reset';
  }

  function normalizeModBy(val) {
    !(val >= 1) && (val = 1); // jshint ignore:line

    return val;
  }

  var forceFirstProgress;

  if (this._dirty || planResult === 'reset') {
    this._dirty = false;
    forceFirstProgress = reset(this, skip);
  }

  this._modBy = modBy;
  this._modDataCount = modDataCount;
  var step = performArgs && performArgs.step;

  if (upTask) {
    this._dueEnd = upTask._outputDueEnd;
  } // DataTask or overallTask
  else {
      this._dueEnd = this._count ? this._count(this.context) : Infinity;
    } // Note: Stubs, that its host overall task let it has progress, has progress.
  // If no progress, pass index from upstream to downstream each time plan called.


  if (this._progress) {
    var start = this._dueIndex;
    var end = Math.min(step != null ? this._dueIndex + step : Infinity, this._dueEnd);

    if (!skip && (forceFirstProgress || start < end)) {
      var progress = this._progress;

      if (isArray(progress)) {
        for (var i = 0; i < progress.length; i++) {
          doProgress(this, progress[i], start, end, modBy, modDataCount);
        }
      } else {
        doProgress(this, progress, start, end, modBy, modDataCount);
      }
    }

    this._dueIndex = end; // If no `outputDueEnd`, assume that output data and
    // input data is the same, so use `dueIndex` as `outputDueEnd`.

    var outputDueEnd = this._settedOutputEnd != null ? this._settedOutputEnd : end;
    this._outputDueEnd = outputDueEnd;
  } else {
    // (1) Some overall task has no progress.
    // (2) Stubs, that its host overall task do not let it has progress, has no progress.
    // This should always be performed so it can be passed to downstream.
    this._dueIndex = this._outputDueEnd = this._settedOutputEnd != null ? this._settedOutputEnd : this._dueEnd;
  }

  return this.unfinished();
};

var iterator = function () {
  var end;
  var current;
  var modBy;
  var modDataCount;
  var winCount;
  var it = {
    reset: function (s, e, sStep, sCount) {
      current = s;
      end = e;
      modBy = sStep;
      modDataCount = sCount;
      winCount = Math.ceil(modDataCount / modBy);
      it.next = modBy > 1 && modDataCount > 0 ? modNext : sequentialNext;
    }
  };
  return it;

  function sequentialNext() {
    return current < end ? current++ : null;
  }

  function modNext() {
    var dataIndex = current % winCount * modBy + Math.ceil(current / winCount);
    var result = current >= end ? null : dataIndex < modDataCount ? dataIndex // If modDataCount is smaller than data.count() (consider `appendData` case),
    // Use normal linear rendering mode.
    : current;
    current++;
    return result;
  }
}();

taskProto.dirty = function () {
  this._dirty = true;
  this._onDirty && this._onDirty(this.context);
};

function doProgress(taskIns, progress, start, end, modBy, modDataCount) {
  iterator.reset(start, end, modBy, modDataCount);
  taskIns._callingProgress = progress;

  taskIns._callingProgress({
    start: start,
    end: end,
    count: end - start,
    next: iterator.next
  }, taskIns.context);
}

function reset(taskIns, skip) {
  taskIns._dueIndex = taskIns._outputDueEnd = taskIns._dueEnd = 0;
  taskIns._settedOutputEnd = null;
  var progress;
  var forceFirstProgress;

  if (!skip && taskIns._reset) {
    progress = taskIns._reset(taskIns.context);

    if (progress && progress.progress) {
      forceFirstProgress = progress.forceFirstProgress;
      progress = progress.progress;
    } // To simplify no progress checking, array must has item.


    if (isArray(progress) && !progress.length) {
      progress = null;
    }
  }

  taskIns._progress = progress;
  taskIns._modBy = taskIns._modDataCount = null;
  var downstream = taskIns._downstream;
  downstream && downstream.dirty();
  return forceFirstProgress;
}
/**
 * @return {boolean}
 */


taskProto.unfinished = function () {
  return this._progress && this._dueIndex < this._dueEnd;
};
/**
 * @param {Object} downTask The downstream task.
 * @return {Object} The downstream task.
 */


taskProto.pipe = function (downTask) {
  // If already downstream, do not dirty downTask.
  if (this._downstream !== downTask || this._dirty) {
    this._downstream = downTask;
    downTask._upstream = this;
    downTask.dirty();
  }
};

taskProto.dispose = function () {
  if (this._disposed) {
    return;
  }

  this._upstream && (this._upstream._downstream = null);
  this._downstream && (this._downstream._upstream = null);
  this._dirty = false;
  this._disposed = true;
};

taskProto.getUpstream = function () {
  return this._upstream;
};

taskProto.getDownstream = function () {
  return this._downstream;
};

taskProto.setOutputEnd = function (end) {
  // This only happend in dataTask, dataZoom, map, currently.
  // where dataZoom do not set end each time, but only set
  // when reset. So we should record the setted end, in case
  // that the stub of dataZoom perform again and earse the
  // setted end by upstream.
  this._outputDueEnd = this._settedOutputEnd = end;
}; ///////////////////////////////////////////////////////////
// For stream debug (Should be commented out after used!)
// Usage: printTask(this, 'begin');
// Usage: printTask(this, null, {someExtraProp});
// function printTask(task, prefix, extra) {
//     window.ecTaskUID == null && (window.ecTaskUID = 0);
//     task.uidDebug == null && (task.uidDebug = `task_${window.ecTaskUID++}`);
//     task.agent && task.agent.uidDebug == null && (task.agent.uidDebug = `task_${window.ecTaskUID++}`);
//     var props = [];
//     if (task.__pipeline) {
//         var val = `${task.__idxInPipeline}/${task.__pipeline.tail.__idxInPipeline} ${task.agent ? '(stub)' : ''}`;
//         props.push({text: 'idx', value: val});
//     } else {
//         var stubCount = 0;
//         task.agentStubMap.each(() => stubCount++);
//         props.push({text: 'idx', value: `overall (stubs: ${stubCount})`});
//     }
//     props.push({text: 'uid', value: task.uidDebug});
//     if (task.__pipeline) {
//         props.push({text: 'pid', value: task.__pipeline.id});
//         task.agent && props.push(
//             {text: 'stubFor', value: task.agent.uidDebug}
//         );
//     }
//     props.push(
//         {text: 'dirty', value: task._dirty},
//         {text: 'dueIndex', value: task._dueIndex},
//         {text: 'dueEnd', value: task._dueEnd},
//         {text: 'outputDueEnd', value: task._outputDueEnd}
//     );
//     if (extra) {
//         Object.keys(extra).forEach(key => {
//             props.push({text: key, value: extra[key]});
//         });
//     }
//     var args = ['color: blue'];
//     var msg = `%c[${prefix || 'T'}] %c` + props.map(item => (
//         args.push('color: black', 'color: red'),
//         `${item.text}: %c${item.value}`
//     )).join('%c, ');
//     console.log.apply(console, [msg].concat(args));
//     // console.log(this);
// }


exports.createTask = createTask;

/***/ }),

/***/ "f934":
/***/ (function(module, exports, __webpack_require__) {


/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

var zrUtil = __webpack_require__("6d8b");

var BoundingRect = __webpack_require__("9850");

var _number = __webpack_require__("3842");

var parsePercent = _number.parsePercent;

var formatUtil = __webpack_require__("eda2");

/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/
// Layout helpers for each component positioning
var each = zrUtil.each;
/**
 * @public
 */

var LOCATION_PARAMS = ['left', 'right', 'top', 'bottom', 'width', 'height'];
/**
 * @public
 */

var HV_NAMES = [['width', 'left', 'right'], ['height', 'top', 'bottom']];

function boxLayout(orient, group, gap, maxWidth, maxHeight) {
  var x = 0;
  var y = 0;

  if (maxWidth == null) {
    maxWidth = Infinity;
  }

  if (maxHeight == null) {
    maxHeight = Infinity;
  }

  var currentLineMaxSize = 0;
  group.eachChild(function (child, idx) {
    var position = child.position;
    var rect = child.getBoundingRect();
    var nextChild = group.childAt(idx + 1);
    var nextChildRect = nextChild && nextChild.getBoundingRect();
    var nextX;
    var nextY;

    if (orient === 'horizontal') {
      var moveX = rect.width + (nextChildRect ? -nextChildRect.x + rect.x : 0);
      nextX = x + moveX; // Wrap when width exceeds maxWidth or meet a `newline` group
      // FIXME compare before adding gap?

      if (nextX > maxWidth || child.newline) {
        x = 0;
        nextX = moveX;
        y += currentLineMaxSize + gap;
        currentLineMaxSize = rect.height;
      } else {
        // FIXME: consider rect.y is not `0`?
        currentLineMaxSize = Math.max(currentLineMaxSize, rect.height);
      }
    } else {
      var moveY = rect.height + (nextChildRect ? -nextChildRect.y + rect.y : 0);
      nextY = y + moveY; // Wrap when width exceeds maxHeight or meet a `newline` group

      if (nextY > maxHeight || child.newline) {
        x += currentLineMaxSize + gap;
        y = 0;
        nextY = moveY;
        currentLineMaxSize = rect.width;
      } else {
        currentLineMaxSize = Math.max(currentLineMaxSize, rect.width);
      }
    }

    if (child.newline) {
      return;
    }

    position[0] = x;
    position[1] = y;
    orient === 'horizontal' ? x = nextX + gap : y = nextY + gap;
  });
}
/**
 * VBox or HBox layouting
 * @param {string} orient
 * @param {module:zrender/container/Group} group
 * @param {number} gap
 * @param {number} [width=Infinity]
 * @param {number} [height=Infinity]
 */


var box = boxLayout;
/**
 * VBox layouting
 * @param {module:zrender/container/Group} group
 * @param {number} gap
 * @param {number} [width=Infinity]
 * @param {number} [height=Infinity]
 */

var vbox = zrUtil.curry(boxLayout, 'vertical');
/**
 * HBox layouting
 * @param {module:zrender/container/Group} group
 * @param {number} gap
 * @param {number} [width=Infinity]
 * @param {number} [height=Infinity]
 */

var hbox = zrUtil.curry(boxLayout, 'horizontal');
/**
 * If x or x2 is not specified or 'center' 'left' 'right',
 * the width would be as long as possible.
 * If y or y2 is not specified or 'middle' 'top' 'bottom',
 * the height would be as long as possible.
 *
 * @param {Object} positionInfo
 * @param {number|string} [positionInfo.x]
 * @param {number|string} [positionInfo.y]
 * @param {number|string} [positionInfo.x2]
 * @param {number|string} [positionInfo.y2]
 * @param {Object} containerRect {width, height}
 * @param {string|number} margin
 * @return {Object} {width, height}
 */

function getAvailableSize(positionInfo, containerRect, margin) {
  var containerWidth = containerRect.width;
  var containerHeight = containerRect.height;
  var x = parsePercent(positionInfo.x, containerWidth);
  var y = parsePercent(positionInfo.y, containerHeight);
  var x2 = parsePercent(positionInfo.x2, containerWidth);
  var y2 = parsePercent(positionInfo.y2, containerHeight);
  (isNaN(x) || isNaN(parseFloat(positionInfo.x))) && (x = 0);
  (isNaN(x2) || isNaN(parseFloat(positionInfo.x2))) && (x2 = containerWidth);
  (isNaN(y) || isNaN(parseFloat(positionInfo.y))) && (y = 0);
  (isNaN(y2) || isNaN(parseFloat(positionInfo.y2))) && (y2 = containerHeight);
  margin = formatUtil.normalizeCssArray(margin || 0);
  return {
    width: Math.max(x2 - x - margin[1] - margin[3], 0),
    height: Math.max(y2 - y - margin[0] - margin[2], 0)
  };
}
/**
 * Parse position info.
 *
 * @param {Object} positionInfo
 * @param {number|string} [positionInfo.left]
 * @param {number|string} [positionInfo.top]
 * @param {number|string} [positionInfo.right]
 * @param {number|string} [positionInfo.bottom]
 * @param {number|string} [positionInfo.width]
 * @param {number|string} [positionInfo.height]
 * @param {number|string} [positionInfo.aspect] Aspect is width / height
 * @param {Object} containerRect
 * @param {string|number} [margin]
 *
 * @return {module:zrender/core/BoundingRect}
 */


function getLayoutRect(positionInfo, containerRect, margin) {
  margin = formatUtil.normalizeCssArray(margin || 0);
  var containerWidth = containerRect.width;
  var containerHeight = containerRect.height;
  var left = parsePercent(positionInfo.left, containerWidth);
  var top = parsePercent(positionInfo.top, containerHeight);
  var right = parsePercent(positionInfo.right, containerWidth);
  var bottom = parsePercent(positionInfo.bottom, containerHeight);
  var width = parsePercent(positionInfo.width, containerWidth);
  var height = parsePercent(positionInfo.height, containerHeight);
  var verticalMargin = margin[2] + margin[0];
  var horizontalMargin = margin[1] + margin[3];
  var aspect = positionInfo.aspect; // If width is not specified, calculate width from left and right

  if (isNaN(width)) {
    width = containerWidth - right - horizontalMargin - left;
  }

  if (isNaN(height)) {
    height = containerHeight - bottom - verticalMargin - top;
  }

  if (aspect != null) {
    // If width and height are not given
    // 1. Graph should not exceeds the container
    // 2. Aspect must be keeped
    // 3. Graph should take the space as more as possible
    // FIXME
    // Margin is not considered, because there is no case that both
    // using margin and aspect so far.
    if (isNaN(width) && isNaN(height)) {
      if (aspect > containerWidth / containerHeight) {
        width = containerWidth * 0.8;
      } else {
        height = containerHeight * 0.8;
      }
    } // Calculate width or height with given aspect


    if (isNaN(width)) {
      width = aspect * height;
    }

    if (isNaN(height)) {
      height = width / aspect;
    }
  } // If left is not specified, calculate left from right and width


  if (isNaN(left)) {
    left = containerWidth - right - width - horizontalMargin;
  }

  if (isNaN(top)) {
    top = containerHeight - bottom - height - verticalMargin;
  } // Align left and top


  switch (positionInfo.left || positionInfo.right) {
    case 'center':
      left = containerWidth / 2 - width / 2 - margin[3];
      break;

    case 'right':
      left = containerWidth - width - horizontalMargin;
      break;
  }

  switch (positionInfo.top || positionInfo.bottom) {
    case 'middle':
    case 'center':
      top = containerHeight / 2 - height / 2 - margin[0];
      break;

    case 'bottom':
      top = containerHeight - height - verticalMargin;
      break;
  } // If something is wrong and left, top, width, height are calculated as NaN


  left = left || 0;
  top = top || 0;

  if (isNaN(width)) {
    // Width may be NaN if only one value is given except width
    width = containerWidth - horizontalMargin - left - (right || 0);
  }

  if (isNaN(height)) {
    // Height may be NaN if only one value is given except height
    height = containerHeight - verticalMargin - top - (bottom || 0);
  }

  var rect = new BoundingRect(left + margin[3], top + margin[0], width, height);
  rect.margin = margin;
  return rect;
}
/**
 * Position a zr element in viewport
 *  Group position is specified by either
 *  {left, top}, {right, bottom}
 *  If all properties exists, right and bottom will be igonred.
 *
 * Logic:
 *     1. Scale (against origin point in parent coord)
 *     2. Rotate (against origin point in parent coord)
 *     3. Traslate (with el.position by this method)
 * So this method only fixes the last step 'Traslate', which does not affect
 * scaling and rotating.
 *
 * If be called repeatly with the same input el, the same result will be gotten.
 *
 * @param {module:zrender/Element} el Should have `getBoundingRect` method.
 * @param {Object} positionInfo
 * @param {number|string} [positionInfo.left]
 * @param {number|string} [positionInfo.top]
 * @param {number|string} [positionInfo.right]
 * @param {number|string} [positionInfo.bottom]
 * @param {number|string} [positionInfo.width] Only for opt.boundingModel: 'raw'
 * @param {number|string} [positionInfo.height] Only for opt.boundingModel: 'raw'
 * @param {Object} containerRect
 * @param {string|number} margin
 * @param {Object} [opt]
 * @param {Array.<number>} [opt.hv=[1,1]] Only horizontal or only vertical.
 * @param {Array.<number>} [opt.boundingMode='all']
 *        Specify how to calculate boundingRect when locating.
 *        'all': Position the boundingRect that is transformed and uioned
 *               both itself and its descendants.
 *               This mode simplies confine the elements in the bounding
 *               of their container (e.g., using 'right: 0').
 *        'raw': Position the boundingRect that is not transformed and only itself.
 *               This mode is useful when you want a element can overflow its
 *               container. (Consider a rotated circle needs to be located in a corner.)
 *               In this mode positionInfo.width/height can only be number.
 */


function positionElement(el, positionInfo, containerRect, margin, opt) {
  var h = !opt || !opt.hv || opt.hv[0];
  var v = !opt || !opt.hv || opt.hv[1];
  var boundingMode = opt && opt.boundingMode || 'all';

  if (!h && !v) {
    return;
  }

  var rect;

  if (boundingMode === 'raw') {
    rect = el.type === 'group' ? new BoundingRect(0, 0, +positionInfo.width || 0, +positionInfo.height || 0) : el.getBoundingRect();
  } else {
    rect = el.getBoundingRect();

    if (el.needLocalTransform()) {
      var transform = el.getLocalTransform(); // Notice: raw rect may be inner object of el,
      // which should not be modified.

      rect = rect.clone();
      rect.applyTransform(transform);
    }
  } // The real width and height can not be specified but calculated by the given el.


  positionInfo = getLayoutRect(zrUtil.defaults({
    width: rect.width,
    height: rect.height
  }, positionInfo), containerRect, margin); // Because 'tranlate' is the last step in transform
  // (see zrender/core/Transformable#getLocalTransform),
  // we can just only modify el.position to get final result.

  var elPos = el.position;
  var dx = h ? positionInfo.x - rect.x : 0;
  var dy = v ? positionInfo.y - rect.y : 0;
  el.attr('position', boundingMode === 'raw' ? [dx, dy] : [elPos[0] + dx, elPos[1] + dy]);
}
/**
 * @param {Object} option Contains some of the properties in HV_NAMES.
 * @param {number} hvIdx 0: horizontal; 1: vertical.
 */


function sizeCalculable(option, hvIdx) {
  return option[HV_NAMES[hvIdx][0]] != null || option[HV_NAMES[hvIdx][1]] != null && option[HV_NAMES[hvIdx][2]] != null;
}
/**
 * Consider Case:
 * When defulat option has {left: 0, width: 100}, and we set {right: 0}
 * through setOption or media query, using normal zrUtil.merge will cause
 * {right: 0} does not take effect.
 *
 * @example
 * ComponentModel.extend({
 *     init: function () {
 *         ...
 *         var inputPositionParams = layout.getLayoutParams(option);
 *         this.mergeOption(inputPositionParams);
 *     },
 *     mergeOption: function (newOption) {
 *         newOption && zrUtil.merge(thisOption, newOption, true);
 *         layout.mergeLayoutParam(thisOption, newOption);
 *     }
 * });
 *
 * @param {Object} targetOption
 * @param {Object} newOption
 * @param {Object|string} [opt]
 * @param {boolean|Array.<boolean>} [opt.ignoreSize=false] Used for the components
 *  that width (or height) should not be calculated by left and right (or top and bottom).
 */


function mergeLayoutParam(targetOption, newOption, opt) {
  !zrUtil.isObject(opt) && (opt = {});
  var ignoreSize = opt.ignoreSize;
  !zrUtil.isArray(ignoreSize) && (ignoreSize = [ignoreSize, ignoreSize]);
  var hResult = merge(HV_NAMES[0], 0);
  var vResult = merge(HV_NAMES[1], 1);
  copy(HV_NAMES[0], targetOption, hResult);
  copy(HV_NAMES[1], targetOption, vResult);

  function merge(names, hvIdx) {
    var newParams = {};
    var newValueCount = 0;
    var merged = {};
    var mergedValueCount = 0;
    var enoughParamNumber = 2;
    each(names, function (name) {
      merged[name] = targetOption[name];
    });
    each(names, function (name) {
      // Consider case: newOption.width is null, which is
      // set by user for removing width setting.
      hasProp(newOption, name) && (newParams[name] = merged[name] = newOption[name]);
      hasValue(newParams, name) && newValueCount++;
      hasValue(merged, name) && mergedValueCount++;
    });

    if (ignoreSize[hvIdx]) {
      // Only one of left/right is premitted to exist.
      if (hasValue(newOption, names[1])) {
        merged[names[2]] = null;
      } else if (hasValue(newOption, names[2])) {
        merged[names[1]] = null;
      }

      return merged;
    } // Case: newOption: {width: ..., right: ...},
    // or targetOption: {right: ...} and newOption: {width: ...},
    // There is no conflict when merged only has params count
    // little than enoughParamNumber.


    if (mergedValueCount === enoughParamNumber || !newValueCount) {
      return merged;
    } // Case: newOption: {width: ..., right: ...},
    // Than we can make sure user only want those two, and ignore
    // all origin params in targetOption.
    else if (newValueCount >= enoughParamNumber) {
        return newParams;
      } else {
        // Chose another param from targetOption by priority.
        for (var i = 0; i < names.length; i++) {
          var name = names[i];

          if (!hasProp(newParams, name) && hasProp(targetOption, name)) {
            newParams[name] = targetOption[name];
            break;
          }
        }

        return newParams;
      }
  }

  function hasProp(obj, name) {
    return obj.hasOwnProperty(name);
  }

  function hasValue(obj, name) {
    return obj[name] != null && obj[name] !== 'auto';
  }

  function copy(names, target, source) {
    each(names, function (name) {
      target[name] = source[name];
    });
  }
}
/**
 * Retrieve 'left', 'right', 'top', 'bottom', 'width', 'height' from object.
 * @param {Object} source
 * @return {Object} Result contains those props.
 */


function getLayoutParams(source) {
  return copyLayoutParams({}, source);
}
/**
 * Retrieve 'left', 'right', 'top', 'bottom', 'width', 'height' from object.
 * @param {Object} source
 * @return {Object} Result contains those props.
 */


function copyLayoutParams(target, source) {
  source && target && each(LOCATION_PARAMS, function (name) {
    source.hasOwnProperty(name) && (target[name] = source[name]);
  });
  return target;
}

exports.LOCATION_PARAMS = LOCATION_PARAMS;
exports.HV_NAMES = HV_NAMES;
exports.box = box;
exports.vbox = vbox;
exports.hbox = hbox;
exports.getAvailableSize = getAvailableSize;
exports.getLayoutRect = getLayoutRect;
exports.positionElement = positionElement;
exports.sizeCalculable = sizeCalculable;
exports.mergeLayoutParam = mergeLayoutParam;
exports.getLayoutParams = getLayoutParams;
exports.copyLayoutParams = copyLayoutParams;

/***/ }),

/***/ "fb05":
/***/ (function(module, exports, __webpack_require__) {


/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

var _util = __webpack_require__("6d8b");

var each = _util.each;
var isArray = _util.isArray;
var isObject = _util.isObject;

var compatStyle = __webpack_require__("26e1");

var _model = __webpack_require__("e0d3");

var normalizeToArray = _model.normalizeToArray;

/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/
// Compatitable with 2.0
function get(opt, path) {
  path = path.split(',');
  var obj = opt;

  for (var i = 0; i < path.length; i++) {
    obj = obj && obj[path[i]];

    if (obj == null) {
      break;
    }
  }

  return obj;
}

function set(opt, path, val, overwrite) {
  path = path.split(',');
  var obj = opt;
  var key;

  for (var i = 0; i < path.length - 1; i++) {
    key = path[i];

    if (obj[key] == null) {
      obj[key] = {};
    }

    obj = obj[key];
  }

  if (overwrite || obj[path[i]] == null) {
    obj[path[i]] = val;
  }
}

function compatLayoutProperties(option) {
  each(LAYOUT_PROPERTIES, function (prop) {
    if (prop[0] in option && !(prop[1] in option)) {
      option[prop[1]] = option[prop[0]];
    }
  });
}

var LAYOUT_PROPERTIES = [['x', 'left'], ['y', 'top'], ['x2', 'right'], ['y2', 'bottom']];
var COMPATITABLE_COMPONENTS = ['grid', 'geo', 'parallel', 'legend', 'toolbox', 'title', 'visualMap', 'dataZoom', 'timeline'];

function _default(option, isTheme) {
  compatStyle(option, isTheme); // Make sure series array for model initialization.

  option.series = normalizeToArray(option.series);
  each(option.series, function (seriesOpt) {
    if (!isObject(seriesOpt)) {
      return;
    }

    var seriesType = seriesOpt.type;

    if (seriesType === 'line') {
      if (seriesOpt.clipOverflow != null) {
        seriesOpt.clip = seriesOpt.clipOverflow;
      }
    } else if (seriesType === 'pie' || seriesType === 'gauge') {
      if (seriesOpt.clockWise != null) {
        seriesOpt.clockwise = seriesOpt.clockWise;
      }
    } else if (seriesType === 'gauge') {
      var pointerColor = get(seriesOpt, 'pointer.color');
      pointerColor != null && set(seriesOpt, 'itemStyle.color', pointerColor);
    }

    compatLayoutProperties(seriesOpt);
  }); // dataRange has changed to visualMap

  if (option.dataRange) {
    option.visualMap = option.dataRange;
  }

  each(COMPATITABLE_COMPONENTS, function (componentName) {
    var options = option[componentName];

    if (options) {
      if (!isArray(options)) {
        options = [options];
      }

      each(options, function (option) {
        compatLayoutProperties(option);
      });
    }
  });
}

module.exports = _default;

/***/ }),

/***/ "fd63":
/***/ (function(module, exports, __webpack_require__) {


/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

var Gradient = __webpack_require__("42e5");

var _util = __webpack_require__("6d8b");

var isFunction = _util.isFunction;

/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/
var _default = {
  createOnAllSeries: true,
  performRawSeries: true,
  reset: function (seriesModel, ecModel) {
    var data = seriesModel.getData();
    var colorAccessPath = (seriesModel.visualColorAccessPath || 'itemStyle.color').split('.'); // Set in itemStyle

    var color = seriesModel.get(colorAccessPath);
    var colorCallback = isFunction(color) && !(color instanceof Gradient) ? color : null; // Default color

    if (!color || colorCallback) {
      color = seriesModel.getColorFromPalette( // TODO series count changed.
      seriesModel.name, null, ecModel.getSeriesCount());
    }

    data.setVisual('color', color);
    var borderColorAccessPath = (seriesModel.visualBorderColorAccessPath || 'itemStyle.borderColor').split('.');
    var borderColor = seriesModel.get(borderColorAccessPath);
    data.setVisual('borderColor', borderColor); // Only visible series has each data be visual encoded

    if (!ecModel.isSeriesFiltered(seriesModel)) {
      if (colorCallback) {
        data.each(function (idx) {
          data.setItemVisual(idx, 'color', colorCallback(seriesModel.getDataParams(idx)));
        });
      } // itemStyle in each data item


      var dataEach = function (data, idx) {
        var itemModel = data.getItemModel(idx);
        var color = itemModel.get(colorAccessPath, true);
        var borderColor = itemModel.get(borderColorAccessPath, true);

        if (color != null) {
          data.setItemVisual(idx, 'color', color);
        }

        if (borderColor != null) {
          data.setItemVisual(idx, 'borderColor', borderColor);
        }
      };

      return {
        dataEach: data.hasItemOption ? dataEach : null
      };
    }
  }
};
module.exports = _default;

/***/ }),

/***/ "fdde":
/***/ (function(module, exports) {


/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/
var samplers = {
  average: function (frame) {
    var sum = 0;
    var count = 0;

    for (var i = 0; i < frame.length; i++) {
      if (!isNaN(frame[i])) {
        sum += frame[i];
        count++;
      }
    } // Return NaN if count is 0


    return count === 0 ? NaN : sum / count;
  },
  sum: function (frame) {
    var sum = 0;

    for (var i = 0; i < frame.length; i++) {
      // Ignore NaN
      sum += frame[i] || 0;
    }

    return sum;
  },
  max: function (frame) {
    var max = -Infinity;

    for (var i = 0; i < frame.length; i++) {
      frame[i] > max && (max = frame[i]);
    } // NaN will cause illegal axis extent.


    return isFinite(max) ? max : NaN;
  },
  min: function (frame) {
    var min = Infinity;

    for (var i = 0; i < frame.length; i++) {
      frame[i] < min && (min = frame[i]);
    } // NaN will cause illegal axis extent.


    return isFinite(min) ? min : NaN;
  },
  // TODO
  // Median
  nearest: function (frame) {
    return frame[0];
  }
};

var indexSampler = function (frame, value) {
  return Math.round(frame.length / 2);
};

function _default(seriesType) {
  return {
    seriesType: seriesType,
    modifyOutputEnd: true,
    reset: function (seriesModel, ecModel, api) {
      var data = seriesModel.getData();
      var sampling = seriesModel.get('sampling');
      var coordSys = seriesModel.coordinateSystem; // Only cartesian2d support down sampling

      if (coordSys.type === 'cartesian2d' && sampling) {
        var baseAxis = coordSys.getBaseAxis();
        var valueAxis = coordSys.getOtherAxis(baseAxis);
        var extent = baseAxis.getExtent(); // Coordinste system has been resized

        var size = extent[1] - extent[0];
        var rate = Math.round(data.count() / size);

        if (rate > 1) {
          var sampler;

          if (typeof sampling === 'string') {
            sampler = samplers[sampling];
          } else if (typeof sampling === 'function') {
            sampler = sampling;
          }

          if (sampler) {
            // Only support sample the first dim mapped from value axis.
            seriesModel.setData(data.downSample(data.mapDimension(valueAxis.dim), 1 / rate, sampler, indexSampler));
          }
        }
      }
    }
  };
}

module.exports = _default;

/***/ }),

/***/ "fe21":
/***/ (function(module, exports, __webpack_require__) {


/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

var textContain = __webpack_require__("e86a");

var graphicUtil = __webpack_require__("2306");

/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/
var PATH_COLOR = ['textStyle', 'color'];
var _default = {
  /**
   * Get color property or get color from option.textStyle.color
   * @param {boolean} [isEmphasis]
   * @return {string}
   */
  getTextColor: function (isEmphasis) {
    var ecModel = this.ecModel;
    return this.getShallow('color') || (!isEmphasis && ecModel ? ecModel.get(PATH_COLOR) : null);
  },

  /**
   * Create font string from fontStyle, fontWeight, fontSize, fontFamily
   * @return {string}
   */
  getFont: function () {
    return graphicUtil.getFont({
      fontStyle: this.getShallow('fontStyle'),
      fontWeight: this.getShallow('fontWeight'),
      fontSize: this.getShallow('fontSize'),
      fontFamily: this.getShallow('fontFamily')
    }, this.ecModel);
  },
  getTextRect: function (text) {
    return textContain.getBoundingRect(text, this.getFont(), this.getShallow('align'), this.getShallow('verticalAlign') || this.getShallow('baseline'), this.getShallow('padding'), this.getShallow('lineHeight'), this.getShallow('rich'), this.getShallow('truncateText'));
  }
};
module.exports = _default;

/***/ })

}]);
//# sourceMappingURL=chunk-vendors~ef4b7b69.2e096b9a.js.map