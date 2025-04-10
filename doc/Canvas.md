## Canvas and elements

#### Basic structure of the editor

```
└──Editor
     ├── In the top menu
     ├── Left navigation bar
     ├── Right navigation bar
     ├── Upper middle insert/toolbar
     ├── Bottom input field
     └── Canvas
          ├── Visible area
          │ ├── Editable elements
          │ └── Mouse selection
          │
          └── Canvas Tools
               ├── Reference line
               ├── ruler
               ├── Element operation node layer (such as dragging and zooming points)
               ├── Snap alignment line
               └──Visible area background
```

#### Basic principles of canvas

We focus on the relatively complex [canvas] part. Each element in the canvas is described by a set of data, such as:

```typescript
interface PPTBaseElement {
  id: string;
  left: number;
  top: number;
  width: number;
  height: number;
}
```

As the name suggests, `left` represents the position of the element from the upper left corner of the canvas, `width` represents the width of the element, and so on.
The important thing to know is that the default visual area is based on a width of 1000 pixels and a height of 562.5 pixels. That is, no matter what the actual size of the canvas and the visual area is, an element with `{ width: 1000px, height: 562.5px, left: 0, top: 0 }` will definitely cover the entire visual area.
The specific implementation method is very simple: assuming the actual width of the visible area is 1200px, calculate the scaling ratio at this time to be 1200 / 1000 = 1.2, and then scale all elements in the visible area to 1.2 times.
In the same way, [Thumbnail] and [Show Page] are actually a smaller or larger visible area than the actual size.

#### Elements within the canvas

In addition to the above position and size information, more data can also be carried, taking a text element as an example:

```typescript
interfacePPTTextElement {
   type: 'text';
   id: string;
   left: number;
   top: number;
   lock?: boolean;
   groupId?: string;
   width: number;
   height: number;
   link?: string;
   content: string;
   rotate: number;
   defaultFontName: string;
   defaultColor: string;
   outline?: PPTElementOutline;
   fill?: string;
   lineHeight?: number;
   wordSpace?: number;
   opacity?: number;
   shadow?: PPTElementShadow;
}
```

You can define a `rotate` to represent the rotation angle of the text box, define an `opacity` to represent the transparency of the text box, etc. During implementation, you only need to render element components according to the data you define, and the essence of editing elements is to modify these data.
The above is the most basic composition of a canvas.
