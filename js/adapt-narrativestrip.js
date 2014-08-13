/*
* adapt-contrib-narrative
* License - http://github.com/adaptlearning/adapt_framework/LICENSE
* Maintainers - Brian Quinn <brian@learningpool.com>, Daryl Heldey <darylhedley@hotmail.com>
*/
define(function(require) {

    var ComponentView = require("coreViews/componentView");
    var Adapt = require("coreJS/adapt");

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
                        thisHandle.$('#'+_items[s]._id+'.ns-slide-container .i'+image._id).append(img);
                        $(img).bind("load", function() {
                            $(img).attr("height","");
                        });
                        img.src = imageURL;

                    }

                    if (imagesSplit == images) {
                        thisHandle.setReadyStatus();
                        thisHandle.calculateWidths();
                    }

                });
                imageObj.src = image.src;
            });
        },

        setupNarrative: function() {
            this.setDeviceSize();
            
            var _items = this.model.get("_items");
            var thisHandle = this;
            _.each(_items, function(item) {
                item._itemCount = item._subItems.length;
                if (item._stage) {
                    thisHandle.setStage(item._id, item._stage, true);
                } else {
                    thisHandle.setStage(item._id, (item._initialItemIndex || 0) );
                }
            });
            
            this.model.set('_active', true);

        },

        calculateWidths: function() {
            //calc widths for each item
            var _items = this.model.get("_items");
            _.each(_items, function(item) {
                var slideWidth = this.$('.ns-slide-container').width();
                var slideCount = item._itemCount;
                var marginRight = this.$('.ns-slider-graphic').css('margin-right');

                var extraMargin = marginRight === "" ? 0 : parseInt(marginRight);
                var fullSlideWidth = (slideWidth + extraMargin) * slideCount;
                var iconWidth = this.$('.ns-popup-open').outerWidth();

                this.$('#'+item._id+'.ns-slide-container .ns-slider-graphic').width(slideWidth)
                this.$('.ns-strapline-header').width(slideWidth);
                this.$('.ns-strapline-title').width(slideWidth);

                this.$('#'+item._id+'.ns-slide-container .ns-slider').width(fullSlideWidth);
                this.$('.ns-strapline-header-inner').width(fullSlideWidth);

                var stage = item._stage;//this.model.get('_stage');
                var margin = -(stage * slideWidth);

                this.$('#'+item._id+'.ns-slide-container .ns-slider').css('margin-left', margin);
                this.$('.ns-strapline-header-inner').css('margin-left', margin);

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
            _.each(_items, function(item) {
                thisHandle.evaluateNavigation(item._id);
            });
        },

        moveSliderToIndex: function(itemId, itemIndex, animate) {
            var extraMargin = parseInt(this.$('#'+itemId+'.ns-slide-container .ns-slider-graphic').css('margin-right')),
                movementSize = this.$('#'+itemId+'.ns-slide-container').width()+extraMargin;

            if(animate) {
                this.$('#'+itemId+'.ns-slide-container .ns-slider').stop().animate({'margin-left': -(movementSize * itemIndex)});
                this.$('#'+itemId+'.ns-strapline-header .ns-strapline-header-inner').stop(true, true).animate({'margin-left': -(movementSize * itemIndex)});
            } else {
                this.$('#'+itemId+'.ns-slide-container .ns-slider').css({'margin-left': -(movementSize * itemIndex)});
                this.$('#'+itemId+'.ns-strapline-header .ns-strapline-header-inner').css({'margin-left': -(movementSize * itemIndex)});
            }
        },

        setStage: function(itemId, stage, initial) {
            var _items = this.model.get("_items");
            var item = _.findWhere(_items, { _id : itemId} );
            item._stage = stage;

            var currentItem = this.getCurrentItem(itemId);
            currentItem.visited = true;

            this.$('.ns-progress').removeClass('selected').eq(stage).addClass('selected');
            this.$('#'+itemId+'.ns-slide-container .ns-slider-graphic').children('.controls').attr('tabindex', -1);
            this.$('#'+itemId+'.ns-slide-container .ns-slider-graphic').eq(stage).children('.controls').attr('tabindex', 0);

            this.evaluateNavigation(itemId);
            this.evaluateCompletion();

            this.moveSliderToIndex(itemId, stage, !initial);
        },

        evaluateNavigation: function(itemId) {
            var _items = this.model.get('_items');
            var item = _.findWhere(_items, {_id: itemId });
            var currentStage = item._stage;
            var itemCount = item._itemCount;
            if (currentStage == 0) {
                this.$('#'+itemId+'.ns-slide-container .ns-control-left').addClass('ns-hidden');

                if (itemCount > 1) {
                    this.$('#'+itemId+'.ns-slide-container .ns-control-right').removeClass('ns-hidden');
                }
            } else {
                this.$('#'+itemId+'.ns-slide-container .ns-control-left').removeClass('ns-hidden');

                if (currentStage == itemCount - 1) {
                    this.$('#'+itemId+'.ns-slide-container .ns-control-right').addClass('ns-hidden');
                } else {
                    this.$('#'+itemId+'.ns-slide-container .ns-control-right').removeClass('ns-hidden');
                }
            }

        },

        getCurrentItem: function(itemId) {
            var _items = this.model.get('_items');
            var item = _.findWhere(_items, {_id: itemId });
            return item;
        },

        getVisitedItems: function() {
          return _.filter(this.model.get('_items'), function(item) {
                return item.visited;
          });
        },

        evaluateCompletion: function() {
            if (this.getVisitedItems().length == this.model.get('_items').length) {
                this.setCompletionStatus();
            }
        },

        onNavigationClicked: function(event) {
            event.preventDefault();

            if (!this.model.get('_active')) return;

            var itemId = $(event.currentTarget).attr("id");

            var _items = this.model.get('_items');
            var item = _.findWhere(_items, {_id: itemId });

            var stage = item._stage,
                numberOfItems = item._itemCount;

            if ($(event.currentTarget).hasClass('ns-control-right')) {
                stage++;
                if (stage == numberOfItems-1) {
                    $('.ns-control-left').focus();
                }
            } else if ($(event.currentTarget).hasClass('ns-control-left')) {
                stage--;
                if (stage == 0) {
                    $('.ns-control-right').focus();
                }
            }
            stage = (stage + numberOfItems) % numberOfItems;
            this.setStage(itemId, stage);
        }

    });

    Adapt.register("narrativestrip", Narrative);

    return Narrative;

});
