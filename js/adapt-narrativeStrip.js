define([ "coreJS/adapt", "coreViews/componentView" ], function(Adapt, ComponentView) {

    var Narrative = ComponentView.extend({

        events: {
            'click .ns-controls':'onNavigationClicked'
        },

        preRender: function () {
            this.listenTo(Adapt, 'device:resize', this.resizeControl, this);
            this.setDeviceSize();            
        },

        setDeviceSize: function() {
            if (Adapt.device.screenSize === 'large') {
                this.$el.addClass('desktop').removeClass('mobile');
                this.model.set('_isDesktop', true);
            } else {
                this.$el.addClass('mobile').removeClass('desktop');
                this.model.set('_isDesktop', false)
            }
        },

        postRender: function() {
            this.setupImages();
            this.setupNarrative();
        },

        setupImages: function() {
            var _items = this.model.get("_items");
            var _images = this.model.get("_images");

            var splitHeight = _items.length;
            var images = _images.length;
            var imagesSplit = 0;

            var thisHandle = this;

            var height = undefined;
            var width = undefined;

            var imagesToLoadCount = 0;
            var imagesLoadedCount = 0;

            _.each(_images, function(image) {
                var imageObj = new Image();
                $(imageObj).bind("load", function(event) {
                    imagesSplit++;

                    var imgHeight = imageObj.naturalHeight;
                    var imgWidth = imageObj.naturalWidth;

                    height = height || imageObj.naturalHeight;
                    width = width || imageObj.naturalWidth;

                    var finalHeight = height / splitHeight;

                    var offsetTop = 0;
                    var offsetLeft = 0;
                    var newHeight = height;

                    if (imgWidth != width) newHeight = (width/imgWidth) * imgHeight;

                    var canvas = document.createElement("canvas");
                    if (typeof G_vmlCanvasManager != 'undefined') G_vmlCanvasManager.initElement(canvas);
                    canvas.width = width; 
                    canvas.style.width = "100%"; 
                    canvas.height = finalHeight; 

                    var ctx = canvas.getContext("2d");

                    for (var s = 0; s < splitHeight; s++) {
                        ctx.drawImage(imageObj, 0, 0, imgWidth, imgHeight, 0 + offsetLeft, -(s * finalHeight) + offsetTop, width, newHeight);
                        var imageURL = canvas.toDataURL();

                        var img = document.createElement("img");
                        thisHandle.$('.item-'+s+'.ns-slide-container .i'+image._id).append(img);
                        imagesToLoadCount++;
                        $(img).bind("load", function() {
                            imagesLoadedCount++;

                            if (imagesToLoadCount == imagesLoadedCount) {
                                thisHandle.setReadyStatus();
                                $(window).resize();
                            }
                        });
                        img.src = imageURL;

                    }

                    if (imagesSplit == images) {
                        thisHandle.calculateWidths();
                    }

                });
                imageObj.src = image.src;
            });
        },

        setupNarrative: function() {

        	this.completionEvent = this.model.get('_setCompletionOn') || false; 

            if(this.completionEvent === 'inview'){
                this.$('.component-widget').on('inview', _.bind(this.inview, this));
            }

            this.setDeviceSize();
            
            var _items = this.model.get("_items");
            var thisHandle = this;
            _.each(_items, function(item, index) {
                item._itemCount = item._subItems.length;
                if (item._stage) {
                    thisHandle.setStage(index, item._stage, true);
                } else {
                    thisHandle.setStage(index, (item._initialItemIndex || 0) );
                }
            });
            
            this.model.set('_active', true);

        },

        calculateWidths: function() {
            //calc widths for each item
            var _items = this.model.get("_items");
            _.each(_items, function(item, index) {
                var slideWidth = this.$('.ns-slide-container').width();
                var slideCount = item._itemCount;
                var marginRight = this.$('.ns-slider-graphic').css('margin-right');

                var extraMargin = marginRight === "" ? 0 : parseInt(marginRight);
                var fullSlideWidth = (slideWidth + extraMargin) * slideCount;
                var iconWidth = this.$('.ns-popup-open').outerWidth();
                var $headerInner = this.$(".item-" + index)
                    .find(".ns-strapline-header-inner");

                this.$('.item-'+index+'.ns-slide-container .ns-slider-graphic').width(slideWidth)
                this.$('.ns-strapline-header').width(slideWidth);
                this.$('.ns-strapline-title').width(slideWidth);

                this.$('.item-'+index+'.ns-slide-container .ns-slider').width(fullSlideWidth);
                $headerInner.width(fullSlideWidth);

                var stage = item._stage;//this.model.get('_stage');
                var margin = -(stage * slideWidth);

                this.$('.item-'+index+'.ns-slide-container .ns-slider').css('margin-left', margin);
                $headerInner.css("margin-left", margin);

                item._finalItemLeft = fullSlideWidth - slideWidth;
            });

            _.each(this.$('.ns-slider-graphic'), function(item) {
                $(item).attr("height","").css("height","");
            });
        },

        resizeControl: function() {
            this.setDeviceSize();
            this.calculateWidths();
            var _items = this.model.get("_items");
            var thisHandle = this;
            _.each(_items, function(item, index) {
                thisHandle.evaluateNavigation(index);
            });
        },

        moveSliderToIndex: function(itemIndex, stage, animate) {
            var extraMargin = parseInt(this.$('.item-'+itemIndex+'.ns-slide-container .ns-slider-graphic').css('margin-right')),
                movementSize = this.$('.item-'+itemIndex+'.ns-slide-container').width()+extraMargin;

            if(animate) {
                this.$('.item-'+itemIndex+'.ns-slide-container .ns-slider').stop().animate({'margin-left': -(movementSize * stage)});
                this.$('.item-'+itemIndex+' .ns-strapline-header .ns-strapline-header-inner').stop(true, true).animate({'margin-left': -(movementSize * stage)});
            } else {
                this.$('.item-'+itemIndex+'.ns-slide-container .ns-slider').css({'margin-left': -(movementSize * stage)});
                this.$('.item-'+itemIndex+' .ns-strapline-header .ns-strapline-header-inner').css({'margin-left': -(movementSize * stage)});
            }
        },

        setStage: function(itemIndex, stage, initial) {
            var item = this.model.get('_items')[itemIndex];

            item._stage = stage;
            item._subItems[stage].isComplete = true;

            this.$('.ns-progress').removeClass('selected').eq(stage).addClass('selected');
            this.$('.item-'+itemIndex+'.ns-slide-container .ns-slider-graphic').children('.controls').attr('tabindex', -1);
            this.$('.item-'+itemIndex+'.ns-slide-container .ns-slider-graphic').eq(stage).children('.controls').attr('tabindex', 0);

            this.evaluateNavigation(itemIndex);
            this.evaluateCompletion();

            this.moveSliderToIndex(itemIndex, stage, !initial);
        },

        evaluateNavigation: function(itemIndex) {
            var item = this.model.get('_items')[itemIndex];
            var currentStage = item._stage;
            var itemCount = item._itemCount;

            if (currentStage == 0) {
                this.$('.item-'+itemIndex+'.ns-slide-container .ns-control-left').addClass('ns-hidden');

                if (itemCount > 1) {
                    this.$('.item-'+itemIndex+'.ns-slide-container .ns-control-right').removeClass('ns-hidden');
                }
            } else {
                this.$('.item-'+itemIndex+'.ns-slide-container .ns-control-left').removeClass('ns-hidden');

                if (currentStage == itemCount - 1) {
                    this.$('.item-'+itemIndex+'.ns-slide-container .ns-control-right').addClass('ns-hidden');
                } else {
                    this.$('.item-'+itemIndex+'.ns-slide-container .ns-control-right').removeClass('ns-hidden');
                }
            }
        },

        evaluateCompletion: function() {
            if(this.completionEvent === 'inview') return;

            var items = this.model.get('_items');
            var isComplete = true;

            for(var i=0,item=null;item=items[i];i++){

                for(var j=0,subItem=null;subItem=item._subItems[j];j++){
                    if(!subItem.isComplete){
                        isComplete = false;
                        break;
                    }
                }
                
                if(!isComplete) break;                
            }

            if(isComplete) this.setCompletionStatus();
        },

        onNavigationClicked: function(event) {
            event.preventDefault();

            var $target = $(event.currentTarget);

            if ($target.hasClass('disabled')) return;

            if (!this.model.get('_active')) return;

			var selectedItemIndex = $target.parent('.component-item').index();
            var selectedItemObject = this.model.get('_items')[selectedItemIndex];

            var stage = selectedItemObject._stage,
                numberOfItems = selectedItemObject._itemCount;

            if ($target.hasClass('ns-control-right')) {
                stage++;
                if (stage == numberOfItems-1) {
                    $('.ns-control-left').focus();
                }
            } else if ($target.hasClass('ns-control-left')) {
                stage--;
                if (stage == 0) {
                    $('.ns-control-right').focus();
                }
            }
            stage = (stage + numberOfItems) % numberOfItems;
            this.setStage(selectedItemIndex, stage);
        },

        inview: function(event, visible, visiblePartX, visiblePartY) {
            if (visible) {
                if (visiblePartY === 'top') {
                    this._isVisibleTop = true;
                } else if (visiblePartY === 'bottom') {
                    this._isVisibleBottom = true;
                } else {
                    this._isVisibleTop = true;
                    this._isVisibleBottom = true;
                }

                if (this._isVisibleTop && this._isVisibleBottom) {                    
                    this.$('.component-inner').off('inview');
                    this.setCompletionStatus();
                }
            }
        }

    });

    Adapt.register("narrativeStrip", Narrative);

    return Narrative;

});
