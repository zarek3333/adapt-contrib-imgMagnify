# adapt-narrativeStrip

**Narrative Strip** is a C&G Kineo *presentation component*.

An narrative component that displays images, split vertically into sections, with corresponding text and left and right navigation controls to progress through the narrative. The component resembles a childs flip book for heads, bodies and feet.

##Installation

Open the /src/components folder in a new terminal window on Mac OSX or right click the folder and select 'Git Bash Here' on Windows.

Git clone the component, making sure to delete the hidden .git folder from the adapt-narrativeStrip folder.

## Settings Overview

The attributes listed below are used in *components.json* to configure **Narrative Strip**, and are properly formatted as JSON in [*example.json*](https://github.com/cgkineo/adapt-narrativeStrip/blob/master/example.json).

### Attributes

**_id** (string): A unique identifier.

**_parentId** (string): An identifier that links the component to the parent block.

**_type** (string): The type of the particular item. Examples include block and component.	

**_component** (string): This value must be: `narrativeStrip`.

**_classes** (string): CSS class name to be applied to **Narrative Strip**’s containing div. The class must be predefined in one of the Less files. Separate multiple classes with a space.

**_layout** (string): This defines the horizontal position of the component in the block. Acceptable values are `full`, `left` or `right`.

**title** (string): The title of the particular item.	

**displayTitle** (string): This is the title that Adapt displays when viewing a course.	

**body** (string): The body text content of the particular item.	

**instruction** (string): This optional text appears above the component. It is frequently used to
guide the learner’s interaction with the component.

**_images** (array): Multiple images may be created. Each _image represents one element of the Narrative Strip component and contains values for **_id** and **src**.

>**_id** (number): A unique identifier for each supplied image.

>**src** (string): File name (including path) of the image. Path should be relative to the *src* folder (e.g., *course/en/images/narrative-strip.jpg*).

**_items** (array): Multiple items may be created. Each _item represents one vertical section of the supplied _image. Contains values for **_id**, **_initialItemIndex** and **_subItems**.

>**_id** (number): A unique identifier for each vertical section.

>**_initialItemIndex** (number): Defines which segment of the section displays on page load.

>**_subItems** (array): Multiple _subItems may be created. Each _subItem represents a segment of a section. Contains values for **_imageID** and **strapline**.

>>**_imageId** (number): A unique identifier for each _subItem image segment.

>>**strapline** (string): This text is overlaid on each segment.


### Accessibility
**Narrative Strip** is not currently accessible.


## Limitations

**Narrative Strip** is not currently supported on IE8, 9 or 10.


----------------------------
**Version number:**  2.0  
**Framework versions:** 2.0  
**Author / maintainer:** C&G Kineo  
**Accessibility support:** N/A  
**RTL support:** No  
**Cross-platform coverage:** To be confirmed
