## Project directory and data structure

### Project directory structure

```
├── assets // static resources
│ ├── fonts // Online font files
│ └── styles // styles
│ ├── antd.scss // antd default style override
│ ├── font.scss // Online font definition
│ ├── global.scss // General global style
│ ├── mixin.scss //scss global mixin
│ ├── variable.scss // scss global variable
│ └── prosemirror.scss // ProseMirror rich text default style
├── components // Common components that have nothing to do with business logic
├── configs // Configuration files, such as: canvas size, font, animation configuration, shortcut key configuration, preset shapes, preset lines and other data.
├── hooks // Hooks method used by multiple components (modules)
├── mocks // mocks data
├── plugins // Customized Vue plugin
├── types // type definition file
├── store // Pinia store, reference: https://pinia.vuejs.org/
├── utils // Common tool methods
└── views // Business component directory, divided into two parts: `Editor` and `Player`.
     ├── components // Common business components
     ├── Editor // Editor module
     ├── Screen // player module
     └── Mobile // Mobile terminal module
```

### data

The slide data mainly consists of two parts: `slides` and `theme`.

> In other words, in an actual production environment, generally only these two pieces of data need to be stored.

- `slides` represents slide page data, including the ID of each page, element content, notes, background, animation, page cutting method and other information
- `theme` represents slide theme data, including background color, theme color, font color, font and other information

The definition of specific types can be found at: [https://github.com/pipipi-pikachu/Paperport/blob/master/src/types/slides.ts](https://github.com/pipipi-pikachu/Paperport/blob/ master/src/types/slides.ts)
