(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", '@angular/core', './virtual-util', '../../config/config', '../content/content', '../../platform/dom-controller', '../../util/util', '../../platform/platform', '../../navigation/view-controller', './virtual-item'], factory);
    }
})(function (require, exports) {
    "use strict";
    var core_1 = require('@angular/core');
    var virtual_util_1 = require('./virtual-util');
    var config_1 = require('../../config/config');
    var content_1 = require('../content/content');
    var dom_controller_1 = require('../../platform/dom-controller');
    var util_1 = require('../../util/util');
    var platform_1 = require('../../platform/platform');
    var view_controller_1 = require('../../navigation/view-controller');
    var virtual_item_1 = require('./virtual-item');
    /**
     * \@name VirtualScroll
     * \@description
     * Virtual Scroll displays a virtual, "infinite" list. An array of records
     * is passed to the virtual scroll containing the data to create templates
     * for. The template created for each record, referred to as a cell, can
     * consist of items, headers, and footers.
     *
     * For performance reasons, not every record in the list is rendered at once;
     * instead a small subset of records (enough to fill the viewport) are rendered
     * and reused as the user scrolls.
     *
     * ### The Basics
     *
     * The array of records should be passed to the `virtualScroll` property.
     * The data given to the `virtualScroll` property must be an array. An item
     * template with the `*virtualItem` property is required in the `virtualScroll`.
     * The `virtualScroll` and `*virtualItem` properties can be added to any element.
     *
     * ```html
     * <ion-list [virtualScroll]="items">
     *
     *   <ion-item *virtualItem="let item">
     *     {% raw %}{{ item }}{% endraw %}
     *   </ion-item>
     *
     * </ion-list>
     * ```
     *
     *
     * ### Section Headers and Footers
     *
     * Section headers and footers are optional. They can be dynamically created
     * from developer-defined functions. For example, a large list of contacts
     * usually has a divider for each letter in the alphabet. Developers provide
     * their own custom function to be called on each record. The logic in the
     * custom function should determine whether to create the section template
     * and what data to provide to the template. The custom function should
     * return `null` if a template shouldn't be created.
     *
     * ```html
     * <ion-list [virtualScroll]="items" [headerFn]="myHeaderFn">
     *
     *   <ion-item-divider *virtualHeader="let header">
     *     Header: {% raw %}{{ header }}{% endraw %}
     *   </ion-item-divider>
     *
     *   <ion-item *virtualItem="let item">
     *     Item: {% raw %}{{ item }}{% endraw %}
     *   </ion-item>
     *
     * </ion-list>
     * ```
     *
     * Below is an example of a custom function called on every record. It
     * gets passed the individual record, the record's index number,
     * and the entire array of records. In this example, after every 20
     * records a header will be inserted. So between the 19th and 20th records,
     * between the 39th and 40th, and so on, a `<ion-item-divider>` will
     * be created and the template's data will come from the function's
     * returned data.
     *
     * ```ts
     * myHeaderFn(record, recordIndex, records) {
     *   if (recordIndex % 20 === 0) {
     *     return 'Header ' + recordIndex;
     *   }
     *   return null;
     * }
     * ```
     *
     *
     * ### Approximate Widths and Heights
     *
     * If the height of items in the virtual scroll are not close to the
     * default size of 40px, it is extremely important to provide an value for
     * approxItemHeight height. An exact pixel-perfect size is not necessary,
     * but without an estimate the virtual scroll will not render correctly.
     *
     * The approximate width and height of each template is used to help
     * determine how many cells should be created, and to help calculate
     * the height of the scrollable area. Note that the actual rendered size
     * of each cell comes from the app's CSS, whereas this approximation
     * is only used to help calculate initial dimensions.
     *
     * It's also important to know that Ionic's default item sizes have
     * slightly different heights between platforms, which is perfectly fine.
     *
     *
     * ### Images Within Virtual Scroll
     *
     * HTTP requests, image decoding, and image rendering can cause jank while
     * scrolling. In order to better control images, Ionic provides `<ion-img>`
     * to manage HTTP requests and image rendering. While scrolling through items
     * quickly, `<ion-img>` knows when and when not to make requests, when and
     * when not to render images, and only loads the images that are viewable
     * after scrolling. [Read more about `ion-img`.](../../img/Img/)
     *
     * It's also important for app developers to ensure image sizes are locked in,
     * and after images have fully loaded they do not change size and affect any
     * other element sizes. Simply put, to ensure rendering bugs are not introduced,
     * it's vital that elements within a virtual item does not dynamically change.
     *
     * For virtual scrolling, the natural effects of the `<img>` are not desirable
     * features. We recommend using the `<ion-img>` component over the native
     * `<img>` element because when an `<img>` element is added to the DOM, it
     * immediately makes a HTTP request for the image file. Additionally, `<img>`
     * renders whenever it wants which could be while the user is scrolling. However,
     * `<ion-img>` is governed by the containing `ion-content` and does not render
     * images while scrolling quickly.
     *
     * ```html
     * <ion-list [virtualScroll]="items">
     *
     *   <ion-item *virtualItem="let item">
     *     <ion-avatar item-left>
     *       <ion-img [src]="item.avatarUrl"></ion-img>
     *     </ion-avatar>
     *    {% raw %} {{ item.firstName }} {{ item.lastName }}{% endraw %}
     *   </ion-item>
     *
     * </ion-list>
     * ```
     *
     *
     * ### Custom Components
     *
     * If a custom component is going to be used within Virtual Scroll, it's best
     * to wrap it with a good old `<div>` to ensure the component is rendered
     * correctly. Since each custom component's implementation and internals can be
     * quite different, wrapping within a `<div>` is a safe way to make sure
     * dimensions are measured correctly.
     *
     * ```html
     * <ion-list [virtualScroll]="items">
     *
     *   <div *virtualItem="let item">
     *     <my-custom-item [item]="item">
     *       {% raw %} {{ item }}{% endraw %}
     *     </my-custom-item>
     *   </div>
     *
     * </ion-list>
     * ```
     *
     *
     * ## Virtual Scroll Performance Tips
     *
     * #### iOS Cordova WKWebView
     *
     * When deploying to iOS with Cordova, it's highly recommended to use the
     * [WKWebView plugin](http://blog.ionic.io/cordova-ios-performance-improvements-drop-in-speed-with-wkwebview/)
     * in order to take advantage of iOS's higher performimg webview. Additionally,
     * WKWebView is superior at scrolling efficiently in comparision to the older
     * UIWebView.
     *
     * #### Lock in element dimensions and locations
     *
     * In order for virtual scroll to efficiently size and locate every item, it's
     * very important every element within each virtual item does not dynamically
     * change its dimensions or location. The best way to ensure size and location
     * does not change, it's recommended each virtual item has locked in its size
     * via CSS.
     *
     * #### Use `ion-img` for images
     *
     * When including images within Virtual Scroll, be sure to use
     * [`ion-img`](../img/Img/) rather than the standard `<img>` HTML element.
     * With `ion-img`, images are lazy loaded so only the viewable ones are
     * rendered, and HTTP requests are efficiently controlled while scrolling.
     *
     * #### Set Approximate Widths and Heights
     *
     * As mentioned above, all elements should lock in their dimensions. However,
     * virtual scroll isn't aware of the dimensions until after they have been
     * rendered. For the initial render, virtual scroll still needs to set
     * how many items should be built. With "approx" property inputs, such as
     * `approxItemHeight`, we're able to give virtual sroll an approximate size,
     * therefore allowing virtual scroll to decide how many items should be
     * created.
     *
     * #### Changing dataset should use `virtualTrackBy`
     *
     * It is possible for the identities of elements in the iterator to change
     * while the data does not. This can happen, for example, if the iterator
     * produced from an RPC to the server, and that RPC is re-run. Even if the
     * "data" hasn't changed, the second response will produce objects with
     * different identities, and Ionic will tear down the entire DOM and rebuild
     * it. This is an expensive operation and should be avoided if possible.
     *
     * #### Efficient headers and footer functions
     *
     * Each virtual item must stay extremely efficient, but one way to really
     * kill its performance is to perform any DOM operations within section header
     * and footer functions. These functions are called for every record in the
     * dataset, so please make sure they're performant.
     *
     */
    var VirtualScroll = (function () {
        /**
         * @param {?} _iterableDiffers
         * @param {?} _elementRef
         * @param {?} _renderer
         * @param {?} _zone
         * @param {?} _cd
         * @param {?} _content
         * @param {?} _plt
         * @param {?} _ctrl
         * @param {?} _config
         * @param {?} _dom
         */
        function VirtualScroll(_iterableDiffers, _elementRef, _renderer, _zone, _cd, _content, _plt, _ctrl, _config, _dom) {
            var _this = this;
            this._iterableDiffers = _iterableDiffers;
            this._elementRef = _elementRef;
            this._renderer = _renderer;
            this._zone = _zone;
            this._cd = _cd;
            this._content = _content;
            this._plt = _plt;
            this._ctrl = _ctrl;
            this._config = _config;
            this._dom = _dom;
            this._init = false;
            this._records = [];
            this._cells = [];
            this._nodes = [];
            this._vHeight = 0;
            this._lastCheck = 0;
            this._data = {
                scrollTop: 0,
            };
            this._recordSize = 0;
            /**
             * @input {number} The buffer ratio is used to decide how many cells
             * should get created when initially rendered. The number is a
             * multiplier against the viewable area's height. For example, if it
             * takes `20` cells to fill up the height of the viewable area, then
             * with a buffer ratio of `3` it will create `60` cells that are
             * available for reuse while scrolling. For better performance, it's
             * better to have more cells than what are required to fill the
             * viewable area. Default is `3`.
             */
            this.bufferRatio = 3;
            /**
             * @input {string} The approximate width of each item template's cell.
             * This dimension is used to help determine how many cells should
             * be created when initialized, and to help calculate the height of
             * the scrollable area. This value can use either `px` or `%` units.
             * Note that the actual rendered size of each cell comes from the
             * app's CSS, whereas this approximation is used to help calculate
             * initial dimensions before the item has been rendered. Default is
             * `100%`.
             */
            this.approxItemWidth = '100%';
            /**
             * @input {string} The approximate width of each header template's cell.
             * This dimension is used to help determine how many cells should
             * be created when initialized, and to help calculate the height of
             * the scrollable area. This value can use either `px` or `%` units.
             * Note that the actual rendered size of each cell comes from the
             * app's CSS, whereas this approximation is used to help calculate
             * initial dimensions. Default is `100%`.
             */
            this.approxHeaderWidth = '100%';
            /**
             * @input {string} The approximate height of each header template's cell.
             * This dimension is used to help determine how many cells should
             * be created when initialized, and to help calculate the height of
             * the scrollable area. This height value can only use `px` units.
             * Note that the actual rendered size of each cell comes from the
             * app's CSS, whereas this approximation is used to help calculate
             * initial dimensions before the item has been rendered. Default is `40px`.
             */
            this.approxHeaderHeight = '40px';
            /**
             * @input {string} The approximate width of each footer template's cell.
             * This dimension is used to help determine how many cells should
             * be created when initialized, and to help calculate the height of
             * the scrollable area. This value can use either `px` or `%` units.
             * Note that the actual rendered size of each cell comes from the
             * app's CSS, whereas this approximation is used to help calculate
             * initial dimensions before the item has been rendered. Default is `100%`.
             */
            this.approxFooterWidth = '100%';
            /**
             * @input {string} The approximate height of each footer template's cell.
             * This dimension is used to help determine how many cells should
             * be created when initialized, and to help calculate the height of
             * the scrollable area. This height value can only use `px` units.
             * Note that the actual rendered size of each cell comes from the
             * app's CSS, whereas this approximation is used to help calculate
             * initial dimensions before the item has been rendered. Default is `40px`.
             */
            this.approxFooterHeight = '40px';
            // hide the virtual scroll element with opacity so we don't
            // see jank as it loads up, but we're still able to read
            // dimensions because it's still rendered and only opacity hidden
            this.setElementClass('virtual-loading', true);
            // wait for the content to be rendered and has readable dimensions
            _ctrl.readReady.subscribe(function () {
                _this._init = true;
                if (util_1.isPresent(_this._changes())) {
                    _this.readUpdate(true);
                    // wait for the content to be writable
                    var subscription = _ctrl.writeReady.subscribe(function () {
                        subscription.unsubscribe();
                        _this.writeUpdate(true);
                    });
                }
                _this._listeners();
            });
        }
        Object.defineProperty(VirtualScroll.prototype, "virtualScroll", {
            /**
             * \@input {array} The data that builds the templates within the virtual scroll.
             * This is the same data that you'd pass to `*ngFor`. It's important to note
             * that when this data has changed, then the entire virtual scroll is reset,
             * which is an expensive operation and should be avoided if possible.
             * @param {?} val
             * @return {?}
             */
            set: function (val) {
                this._records = val;
                if (util_1.isBlank(this._differ) && util_1.isPresent(val)) {
                    this._differ = this._iterableDiffers.find(val).create(this._cd, this.virtualTrackBy);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(VirtualScroll.prototype, "headerFn", {
            /**
             * \@input {function} Section headers and the data used within its given
             * template can be dynamically created by passing a function to `headerFn`.
             * For example, a large list of contacts usually has dividers between each
             * letter in the alphabet. App's can provide their own custom `headerFn`
             * which is called with each record within the dataset. The logic within
             * the header function can decide if the header template should be used,
             * and what data to give to the header template. The function must return
             * `null` if a header cell shouldn't be created.
             * @param {?} val
             * @return {?}
             */
            set: function (val) {
                if (util_1.isFunction(val)) {
                    this._hdrFn = val.bind((this._ctrl._cmp) || this);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(VirtualScroll.prototype, "footerFn", {
            /**
             * \@input {function} Section footers and the data used within its given
             * template can be dynamically created by passing a function to `footerFn`.
             * The logic within the footer function can decide if the footer template
             * should be used, and what data to give to the footer template. The function
             * must return `null` if a footer cell shouldn't be created.
             * @param {?} val
             * @return {?}
             */
            set: function (val) {
                if (util_1.isFunction(val)) {
                    this._ftrFn = val.bind((this._ctrl._cmp) || this);
                }
            },
            enumerable: true,
            configurable: true
        });
        /**
         * @return {?}
         */
        VirtualScroll.prototype.ngDoCheck = function () {
            var _this = this;
            // only continue if we've already initialized
            if (!this._init) {
                return;
            }
            // and if there actually are changes
            var /** @type {?} */ changes = this._changes();
            if (!util_1.isPresent(changes)) {
                return;
            }
            var /** @type {?} */ needClean = false;
            if (changes) {
                changes.forEachOperation(function (item, _, cindex) {
                    if (item.previousIndex != null || (cindex < _this._recordSize)) {
                        needClean = true;
                    }
                });
            }
            else {
                needClean = true;
            }
            this._recordSize = this._records.length;
            this.readUpdate(needClean);
            this.writeUpdate(needClean);
        };
        /**
         * @param {?} needClean
         * @return {?}
         */
        VirtualScroll.prototype.readUpdate = function (needClean) {
            if (needClean) {
                // reset everything
                (void 0) /* console.debug */;
                this._cells.length = 0;
                this._nodes.length = 0;
                this._itmTmp.viewContainer.clear();
                // ******** DOM READ ****************
                this.calcDimensions();
            }
            else {
                (void 0) /* console.debug */;
            }
        };
        /**
         * @param {?} needClean
         * @return {?}
         */
        VirtualScroll.prototype.writeUpdate = function (needClean) {
            (void 0) /* console.debug */;
            var /** @type {?} */ data = this._data;
            var /** @type {?} */ stopAtHeight = (data.scrollTop + data.renderHeight);
            data.scrollDiff = SCROLL_DIFFERENCE_MINIMUM + 1;
            virtual_util_1.processRecords(stopAtHeight, this._records, this._cells, this._hdrFn, this._ftrFn, this._data);
            // ******** DOM WRITE ****************
            this.renderVirtual(needClean);
        };
        /**
         * @return {?}
         */
        VirtualScroll.prototype.calcDimensions = function () {
            virtual_util_1.calcDimensions(this._data, this._elementRef.nativeElement, this.approxItemWidth, this.approxItemHeight, this.approxHeaderWidth, this.approxHeaderHeight, this.approxFooterWidth, this.approxFooterHeight, this.bufferRatio);
        };
        /**
         * @return {?}
         */
        VirtualScroll.prototype._changes = function () {
            if (util_1.isPresent(this._records) && util_1.isPresent(this._differ)) {
                return this._differ.diff(this._records);
            }
            return null;
        };
        /**
         * DOM WRITE
         * @param {?} needClean
         * @return {?}
         */
        VirtualScroll.prototype.renderVirtual = function (needClean) {
            var _this = this;
            var /** @type {?} */ nodes = this._nodes;
            var /** @type {?} */ cells = this._cells;
            var /** @type {?} */ data = this._data;
            var /** @type {?} */ records = this._records;
            if (needClean) {
                // ******** DOM WRITE ****************
                virtual_util_1.updateDimensions(this._plt, nodes, cells, data, true);
                data.topCell = 0;
                data.bottomCell = (cells.length - 1);
            }
            virtual_util_1.adjustRendered(cells, data);
            virtual_util_1.populateNodeData(data.topCell, data.bottomCell, data.viewWidth, true, cells, records, nodes, this._itmTmp.viewContainer, this._itmTmp.templateRef, this._hdrTmp && this._hdrTmp.templateRef, this._ftrTmp && this._ftrTmp.templateRef, needClean);
            if (needClean) {
                this._cd.detectChanges();
            }
            this._plt.raf(function () {
                // at this point, this fn was called from within another
                // requestAnimationFrame, so the next dom reads/writes within the next frame
                // wait a frame before trying to read and calculate the dimensions
                _this._dom.read(function () {
                    // ******** DOM READ ****************
                    virtual_util_1.initReadNodes(_this._plt, nodes, cells, data);
                });
                _this._dom.write(function () {
                    var /** @type {?} */ ele = _this._elementRef.nativeElement;
                    var /** @type {?} */ recordsLength = records.length;
                    var /** @type {?} */ renderer = _this._renderer;
                    // update the bound context for each node
                    virtual_util_1.updateNodeContext(nodes, cells, data);
                    // ******** DOM WRITE ****************
                    for (var /** @type {?} */ i = 0; i < nodes.length; i++) {
                        ((nodes[i].view)).detectChanges();
                    }
                    if (!_this._lastEle) {
                        // add an element at the end so :last-child css doesn't get messed up
                        // ******** DOM WRITE ****************
                        var /** @type {?} */ lastEle = renderer.createElement(ele, 'div');
                        lastEle.className = 'virtual-last';
                        _this._lastEle = true;
                    }
                    // ******** DOM WRITE ****************
                    _this.setElementClass('virtual-scroll', true);
                    // ******** DOM WRITE ****************
                    _this.setElementClass('virtual-loading', false);
                    // ******** DOM WRITE ****************
                    virtual_util_1.writeToNodes(_this._plt, nodes, cells, recordsLength);
                    // ******** DOM WRITE ****************
                    _this._setHeight(virtual_util_1.estimateHeight(recordsLength, cells[cells.length - 1], _this._vHeight, 0.25));
                    _this._content.imgsUpdate();
                });
            });
        };
        /**
         * @return {?}
         */
        VirtualScroll.prototype.resize = function () {
            // only continue if we've already initialized
            if (!this._init) {
                return;
            }
            (void 0) /* console.debug */;
            this.calcDimensions();
            this.writeUpdate(false);
        };
        /**
         * @param {?} ev
         * @return {?}
         */
        VirtualScroll.prototype.scrollUpdate = function (ev) {
            var _this = this;
            // there is a queue system so that we can
            // spread out the work over multiple frames
            var /** @type {?} */ data = this._data;
            var /** @type {?} */ cells = this._cells;
            var /** @type {?} */ nodes = this._nodes;
            // set the scroll top from the scroll event
            data.scrollTop = ev.scrollTop;
            if (this._queue === SCROLL_QUEUE_DOM_WRITE) {
                // there are DOM writes we need to take care of in this frame
                this._dom.write(function () {
                    var /** @type {?} */ recordsLength = _this._records.length;
                    // ******** DOM WRITE ****************
                    virtual_util_1.writeToNodes(_this._plt, nodes, cells, recordsLength);
                    // ******** DOM WRITE ****************
                    _this._setHeight(virtual_util_1.estimateHeight(recordsLength, cells[cells.length - 1], _this._vHeight, 0.25));
                    // we're done here, good work
                    _this._queue = SCROLL_QUEUE_NO_CHANGES;
                });
            }
            else if (this._queue === SCROLL_QUEUE_CHANGE_DETECTION) {
                // we need to do some change detection in this frame
                this._dom.write(function () {
                    // we've got work painting do, let's throw it in the
                    // domWrite callback so everyone plays nice
                    // ******** DOM WRITE ****************
                    for (var /** @type {?} */ i = 0; i < nodes.length; i++) {
                        if (nodes[i].hasChanges) {
                            ((nodes[i].view)).detectChanges();
                        }
                    }
                    // on the next frame we need write to the dom nodes manually
                    _this._queue = SCROLL_QUEUE_DOM_WRITE;
                });
            }
            else {
                // no dom writes or change detection to take care of
                // let's see if we've scroll far enough to require another check
                data.scrollDiff = (data.scrollTop - this._lastCheck);
                if (Math.abs(data.scrollDiff) > SCROLL_DIFFERENCE_MINIMUM) {
                    // don't bother updating if the scrollTop hasn't changed much
                    this._lastCheck = data.scrollTop;
                    if (data.scrollDiff > 0) {
                        // load data we may not have processed yet
                        var /** @type {?} */ stopAtHeight = (data.scrollTop + data.renderHeight);
                        virtual_util_1.processRecords(stopAtHeight, this._records, cells, this._hdrFn, this._ftrFn, data);
                    }
                    // ******** DOM READ ****************
                    virtual_util_1.updateDimensions(this._plt, nodes, cells, data, false);
                    virtual_util_1.adjustRendered(cells, data);
                    var /** @type {?} */ hasChanges = virtual_util_1.populateNodeData(data.topCell, data.bottomCell, data.viewWidth, data.scrollDiff > 0, cells, this._records, nodes, this._itmTmp.viewContainer, this._itmTmp.templateRef, this._hdrTmp && this._hdrTmp.templateRef, this._ftrTmp && this._ftrTmp.templateRef, false);
                    if (hasChanges) {
                        // queue making updates in the next frame
                        this._queue = SCROLL_QUEUE_CHANGE_DETECTION;
                        // update the bound context for each node
                        virtual_util_1.updateNodeContext(nodes, cells, data);
                    }
                }
            }
        };
        /**
         * DOM WRITE
         * @param {?} ev
         * @return {?}
         */
        VirtualScroll.prototype.scrollEnd = function (ev) {
            var _this = this;
            var /** @type {?} */ nodes = this._nodes;
            var /** @type {?} */ cells = this._cells;
            var /** @type {?} */ data = this._data;
            // ******** DOM READ ****************
            virtual_util_1.updateDimensions(this._plt, nodes, cells, data, false);
            virtual_util_1.adjustRendered(cells, data);
            // ******** DOM READS ABOVE / DOM WRITES BELOW ****************
            this._dom.write(function () {
                var /** @type {?} */ recordsLength = _this._records.length;
                // update the bound context for each node
                virtual_util_1.updateNodeContext(nodes, cells, data);
                // ******** DOM WRITE ****************
                for (var /** @type {?} */ i = 0; i < nodes.length; i++) {
                    ((nodes[i].view)).detectChanges();
                }
                // ******** DOM WRITE ****************
                virtual_util_1.writeToNodes(_this._plt, nodes, cells, recordsLength);
                // ******** DOM WRITE ****************
                _this._setHeight(virtual_util_1.estimateHeight(recordsLength, cells[cells.length - 1], _this._vHeight, 0.05));
                _this._queue = SCROLL_QUEUE_NO_CHANGES;
            });
        };
        /**
         * NO DOM
         * @return {?}
         */
        VirtualScroll.prototype._listeners = function () {
            if (!this._scrollSub) {
                this._resizeSub = this._plt.resize.subscribe(this.resize.bind(this));
                this._scrollSub = this._content.ionScroll.subscribe(this.scrollUpdate.bind(this));
                this._scrollEndSub = this._content.ionScrollEnd.subscribe(this.scrollEnd.bind(this));
                this._content.enableScrollListener();
            }
        };
        /**
         * DOM WRITE
         * @param {?} newVirtualHeight
         * @return {?}
         */
        VirtualScroll.prototype._setHeight = function (newVirtualHeight) {
            if (newVirtualHeight !== this._vHeight) {
                // ******** DOM WRITE ****************
                this._renderer.setElementStyle(this._elementRef.nativeElement, 'height', newVirtualHeight > 0 ? newVirtualHeight + 'px' : '');
                this._vHeight = newVirtualHeight;
                (void 0) /* console.debug */;
            }
        };
        /**
         * @return {?}
         */
        VirtualScroll.prototype.ngAfterContentInit = function () {
            if (!this._itmTmp) {
                throw 'virtualItem required within virtualScroll';
            }
            if (!this.approxItemHeight) {
                this.approxItemHeight = '40px';
                console.warn('Virtual Scroll: Please provide an "approxItemHeight" input to ensure proper virtual scroll rendering');
            }
        };
        /**
         * @param {?} className
         * @param {?} add
         * @return {?}
         */
        VirtualScroll.prototype.setElementClass = function (className, add) {
            this._renderer.setElementClass(this._elementRef.nativeElement, className, add);
        };
        /**
         * @return {?}
         */
        VirtualScroll.prototype.ngOnDestroy = function () {
            this._resizeSub && this._resizeSub.unsubscribe();
            this._scrollSub && this._scrollSub.unsubscribe();
            this._scrollEndSub && this._scrollEndSub.unsubscribe();
            this._scrollEndSub = this._scrollSub = null;
            this._hdrFn = this._ftrFn = this._records = this._cells = this._nodes = this._data = null;
        };
        VirtualScroll.decorators = [
            { type: core_1.Directive, args: [{
                        selector: '[virtualScroll]'
                    },] },
        ];
        /** @nocollapse */
        VirtualScroll.ctorParameters = function () { return [
            { type: core_1.IterableDiffers, },
            { type: core_1.ElementRef, },
            { type: core_1.Renderer, },
            { type: core_1.NgZone, },
            { type: core_1.ChangeDetectorRef, },
            { type: content_1.Content, },
            { type: platform_1.Platform, },
            { type: view_controller_1.ViewController, },
            { type: config_1.Config, },
            { type: dom_controller_1.DomController, },
        ]; };
        VirtualScroll.propDecorators = {
            '_itmTmp': [{ type: core_1.ContentChild, args: [virtual_item_1.VirtualItem,] },],
            '_hdrTmp': [{ type: core_1.ContentChild, args: [virtual_item_1.VirtualHeader,] },],
            '_ftrTmp': [{ type: core_1.ContentChild, args: [virtual_item_1.VirtualFooter,] },],
            'virtualScroll': [{ type: core_1.Input },],
            'bufferRatio': [{ type: core_1.Input },],
            'approxItemWidth': [{ type: core_1.Input },],
            'approxItemHeight': [{ type: core_1.Input },],
            'approxHeaderWidth': [{ type: core_1.Input },],
            'approxHeaderHeight': [{ type: core_1.Input },],
            'approxFooterWidth': [{ type: core_1.Input },],
            'approxFooterHeight': [{ type: core_1.Input },],
            'headerFn': [{ type: core_1.Input },],
            'footerFn': [{ type: core_1.Input },],
            'virtualTrackBy': [{ type: core_1.Input },],
        };
        return VirtualScroll;
    }());
    exports.VirtualScroll = VirtualScroll;
    function VirtualScroll_tsickle_Closure_declarations() {
        /** @type {?} */
        VirtualScroll.decorators;
        /**
         * @nocollapse
         * @type {?}
         */
        VirtualScroll.ctorParameters;
        /** @type {?} */
        VirtualScroll.propDecorators;
        /** @type {?} */
        VirtualScroll.prototype._differ;
        /** @type {?} */
        VirtualScroll.prototype._scrollSub;
        /** @type {?} */
        VirtualScroll.prototype._scrollEndSub;
        /** @type {?} */
        VirtualScroll.prototype._resizeSub;
        /** @type {?} */
        VirtualScroll.prototype._init;
        /** @type {?} */
        VirtualScroll.prototype._lastEle;
        /** @type {?} */
        VirtualScroll.prototype._hdrFn;
        /** @type {?} */
        VirtualScroll.prototype._ftrFn;
        /** @type {?} */
        VirtualScroll.prototype._records;
        /** @type {?} */
        VirtualScroll.prototype._cells;
        /** @type {?} */
        VirtualScroll.prototype._nodes;
        /** @type {?} */
        VirtualScroll.prototype._vHeight;
        /** @type {?} */
        VirtualScroll.prototype._lastCheck;
        /** @type {?} */
        VirtualScroll.prototype._data;
        /** @type {?} */
        VirtualScroll.prototype._queue;
        /** @type {?} */
        VirtualScroll.prototype._recordSize;
        /** @type {?} */
        VirtualScroll.prototype._itmTmp;
        /** @type {?} */
        VirtualScroll.prototype._hdrTmp;
        /** @type {?} */
        VirtualScroll.prototype._ftrTmp;
        /**
         * \@input {number} The buffer ratio is used to decide how many cells
         * should get created when initially rendered. The number is a
         * multiplier against the viewable area's height. For example, if it
         * takes `20` cells to fill up the height of the viewable area, then
         * with a buffer ratio of `3` it will create `60` cells that are
         * available for reuse while scrolling. For better performance, it's
         * better to have more cells than what are required to fill the
         * viewable area. Default is `3`.
         * @type {?}
         */
        VirtualScroll.prototype.bufferRatio;
        /**
         * \@input {string} The approximate width of each item template's cell.
         * This dimension is used to help determine how many cells should
         * be created when initialized, and to help calculate the height of
         * the scrollable area. This value can use either `px` or `%` units.
         * Note that the actual rendered size of each cell comes from the
         * app's CSS, whereas this approximation is used to help calculate
         * initial dimensions before the item has been rendered. Default is
         * `100%`.
         * @type {?}
         */
        VirtualScroll.prototype.approxItemWidth;
        /**
         * \@input {string} It is important to provide this
         * if virtual item height will be significantly larger than the default
         * The approximate height of each virtual item template's cell.
         * This dimension is used to help determine how many cells should
         * be created when initialized, and to help calculate the height of
         * the scrollable area. This height value can only use `px` units.
         * Note that the actual rendered size of each cell comes from the
         * app's CSS, whereas this approximation is used to help calculate
         * initial dimensions before the item has been rendered. Default is
         * `40px`.
         * @type {?}
         */
        VirtualScroll.prototype.approxItemHeight;
        /**
         * \@input {string} The approximate width of each header template's cell.
         * This dimension is used to help determine how many cells should
         * be created when initialized, and to help calculate the height of
         * the scrollable area. This value can use either `px` or `%` units.
         * Note that the actual rendered size of each cell comes from the
         * app's CSS, whereas this approximation is used to help calculate
         * initial dimensions. Default is `100%`.
         * @type {?}
         */
        VirtualScroll.prototype.approxHeaderWidth;
        /**
         * \@input {string} The approximate height of each header template's cell.
         * This dimension is used to help determine how many cells should
         * be created when initialized, and to help calculate the height of
         * the scrollable area. This height value can only use `px` units.
         * Note that the actual rendered size of each cell comes from the
         * app's CSS, whereas this approximation is used to help calculate
         * initial dimensions before the item has been rendered. Default is `40px`.
         * @type {?}
         */
        VirtualScroll.prototype.approxHeaderHeight;
        /**
         * \@input {string} The approximate width of each footer template's cell.
         * This dimension is used to help determine how many cells should
         * be created when initialized, and to help calculate the height of
         * the scrollable area. This value can use either `px` or `%` units.
         * Note that the actual rendered size of each cell comes from the
         * app's CSS, whereas this approximation is used to help calculate
         * initial dimensions before the item has been rendered. Default is `100%`.
         * @type {?}
         */
        VirtualScroll.prototype.approxFooterWidth;
        /**
         * \@input {string} The approximate height of each footer template's cell.
         * This dimension is used to help determine how many cells should
         * be created when initialized, and to help calculate the height of
         * the scrollable area. This height value can only use `px` units.
         * Note that the actual rendered size of each cell comes from the
         * app's CSS, whereas this approximation is used to help calculate
         * initial dimensions before the item has been rendered. Default is `40px`.
         * @type {?}
         */
        VirtualScroll.prototype.approxFooterHeight;
        /**
         * \@input {function} Same as `ngForTrackBy` which can be used on `ngFor`.
         * @type {?}
         */
        VirtualScroll.prototype.virtualTrackBy;
        /** @type {?} */
        VirtualScroll.prototype._iterableDiffers;
        /** @type {?} */
        VirtualScroll.prototype._elementRef;
        /** @type {?} */
        VirtualScroll.prototype._renderer;
        /** @type {?} */
        VirtualScroll.prototype._zone;
        /** @type {?} */
        VirtualScroll.prototype._cd;
        /** @type {?} */
        VirtualScroll.prototype._content;
        /** @type {?} */
        VirtualScroll.prototype._plt;
        /** @type {?} */
        VirtualScroll.prototype._ctrl;
        /** @type {?} */
        VirtualScroll.prototype._config;
        /** @type {?} */
        VirtualScroll.prototype._dom;
    }
    var /** @type {?} */ SCROLL_DIFFERENCE_MINIMUM = 40;
    var /** @type {?} */ SCROLL_QUEUE_NO_CHANGES = 1;
    var /** @type {?} */ SCROLL_QUEUE_CHANGE_DETECTION = 2;
    var /** @type {?} */ SCROLL_QUEUE_DOM_WRITE = 3;
});
//# sourceMappingURL=virtual-scroll.js.map