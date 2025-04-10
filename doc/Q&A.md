## common problem

#### Q. Why does the xxx shortcut key not work?

A. Some shortcut keys need to be focused on a specified area to take effect. For example, if the focus is on the thumbnail list on the left, you can use the shortcut keys for the operation page, and if the focus is on the canvas area, you can use the shortcut keys for the operation elements.

#### Q. Why does pasting have no effect?

A. Please note that the browser is allowed to access the system clipboard.

#### Q. Why are the PPTs I made before disappearing after refreshing or reopening the browser?

A. The link provided by the warehouse is for demonstration only, and the project is purely front-end deployed, with no backend and no data will be saved.

#### Q. How to adjust the order of slide pages?

A. Press and hold the left thumbnail to drag to adjust the order.

#### Q. Why does the operation freeze after inserting a picture?

A. Since this demonstration project does not rely on the backend, the actual reference of the local image inserted is Base64, resulting in a very large data volume. In a real production environment, the image address should be uploaded and then quoted, so that this situation will not occur.

#### Q. Why is there no effect after applying the preset theme?

A. The purpose of setting a preset theme is to apply theme styles to newly added elements and pages. It will not take effect on existing elements and pages. You can use the "Apply theme to all" function to apply the current theme to all pages. .

#### Q. Setting online fonts does not take effect?

A. When setting online fonts, the corresponding font file will be downloaded. The file is large and you need to wait for the download to complete before applying the new font.

#### Q. About importing and exporting PPTX files

A. As an online slide show application, exporting and importing PPTX files are very important functions. However, after investigation, it was found that the complexity of implementing this function far exceeded expectations. Due to limited personal ability and time, this part of the function can only be completed with the help of a third-party wheel.

Export: The current export function is mainly based on [PptxGenJS](https://github.com/gitbrent/PptxGenJS/), which can export most basic elements, but there are still many flaws that need to be improved a little bit. At the same time, you need to know that: 1. This function relies on PptxGenJS, and this project cannot do anything about the parts that the library itself cannot implement (such as animation); 2. The goal of the export function is only to [export elements with the same style as possible], not When restoring web pages to PPT one-to-one, some style differences are bound to exist.

Import: There is currently no suitable solution for the import function, and it is still under investigation and wait-and-see. If you have friends who are interested or have done related content, please feel free to discuss it in issues.

> PS. I did an experiment of [pptx to json](https://github.com/pipipi-pikachu/pptx2json). If you urgently need to implement the function of importing PPTX files, you can use this as a reference to implement it yourself.

At the same time, I would like to add that this project is not an exclusive online editor for office PPT and essentially has nothing to do with office PPT. [Import/export ppt files] is just a [function] of the project and not a [purpose].

#### Q. What formats are supported by the video element?

A. This project only provides the most basic video capabilities. Under normal conditions, the formats supported by the video tag itself can be played.

In addition, [hls.js](https://github.com/video-dev/hls.js) or [flv.js](https://github.com/Bilibili/flv.js) can be additionally introduced to support For the corresponding format (.m3u8 .flv), you only need to introduce the corresponding file (such as cdn) into the project, no other configuration is required.

#### Q. About importing JSON files

A. First of all, for security and other reasons, I personally do not recommend exposing this function directly to users on the front end, or users should not be exposed to the JSON format at all (even the original intention of exporting the JSON function is just to facilitate development ). If you really have relevant needs, please implement it on the server side yourself. The core is to verify the data, and the same is true for the front-end implementation.

#### Q. The print/export PDF style is different from the actual one.

A. Please pay attention to adjusting the relevant settings in the print window that pops up in the browser. Suggestion: Set margins to [Default], uncheck [Header and Footer], and check [Background Graphics]

#### Q. Why does the mobile terminal not support the xxx function?

A. The first thing that needs to be made clear is that no matter how you do it on the mobile side, the experience will definitely be inferior to that of the PC side. Therefore, I personally position the mobile terminal as an emergency use for simple temporary processing. True design/production of slideshows should be done on a computer using full functionality. If you really have special needs for the mobile terminal, you can try to open it in computer mode on the mobile terminal (of course, the experience will be worse), or the developer can perform secondary development by themselves.

#### Q. About compatibility?

A. This project is compatible with Chrome and Firefox first. There may be some compatibility issues under Safari. Not compatible with IE.

#### Q. Others

A. In addition, because there is no backend (no extra money to buy servers or cloud services), I deliberately cut off some functions, even though these functions are actually very basic, such as uploading audio and video, and customizing templates. There are also some functions that obviously have better implementation solutions, but I have no choice, such as exporting PDF. These need to be implemented and improved by the developers themselves.
