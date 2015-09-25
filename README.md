OUT OF DATE - TO BE WORKED ON

#adapt-narrativestrip

An narrative component that displays images, split into sections, with corresponding text and left and right navigation controls to progress through the narrative. Looks like a childs flip book for heads+bodies+feet.

##Settings overview

Will split the images automatically into x number of vertical segments. Supply full height images.

For example JSON format, see [example.json](https://github.com/cgkineo/adapt-narrativestrip/blob/master/example.json).

1. Supply full height images for each slide in _images: [1,2,3,4]
2. Use _items to define the number of vertical divisions [top, middle, bottom, etc]
3. Use _subItems to assign images to each vertical division's horizonal flip [top[4,2,3,1], middle[2,1,4,3], bottom[1,3,2,4]]
```
  loadImages: image1, image2, image3, image4

  divide accordingly:
  
    divisionTop: [image4, image2, image3, image1]  
    divisionMiddle: [image2, image1, image4, image3]
    divisionBottom: [image1, image3, image2, image4]  
    
  Using a human body as an example:
  
    In the first column image4's head will appear with image2's body and image1's legs.
    In the second column image2's head will appear with image1's body and image3's legs.
    In the last column image1's head will appear with image3's body and image4's legs.
    
    So selecting top column 2, moddile column 1 and bottom column 2 would draw image 2 in full.
  
```
