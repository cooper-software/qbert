# qbert

This is a small javascript library for tile layout in the browser. Tiles are given a width and height where the units are multiples of a base square. Tiles are placed using a modified first-fit algorithm that attempts to fill top-to-bottom, left-to-right along rows of configurable height (also a multiple of the base square). The row is a guide but is not a rigid constraint, allowing the tiles to have tighter coverage.

You can see an example here: <http://cooper-software.github.io/qbert/>

# Usage

You'll need `qbert.js` (or `qbert.min.js`) and `qbert.css`. You can grab them from this repository. Alternatively get the files with bower:

```sh
bower install qbert
```

On the page, you'll need a container for qbert to look at as well as some elements in that container with specified widths and heights. Then you just call `qbert()` with the container element or selector.

```html
<!DOCTYPE html>
<html>
<head>
    <title>QBert</title>
    <link rel="stylesheet" type="text/css" href="qbert.css">
</head>
<body>
    <ul id="qbert-example">
        <li data-block-width="2" data-block-height="2">1</li>
        <li data-block-width="1" data-block-height="1">2</li>
        <li data-block-width="1" data-block-height="1">3</li>
        <li data-block-width="3" data-block-height="2">4</li>
        <li data-block-width="1" data-block-height="2">5</li>
        <li data-block-width="1" data-block-height="1">6</li>
    </ul>
    <script src="qbert.min.js"></script>
    <script>
        qbert('#qbert-example')
    </script>
</body>
</html>
```

# Some depth

Let's get some terminology defined before we proceed. In the previous example, the `<ul>` is the *container* and each of the `<li>`s are *blocks*. A block must have a width and height. These are specified in *qbert pixels*. A qbert pixel is a square with a configurable size in actual pixels. All the units in *qbert* are based on the *qbert pixel*.

## Configuration

You can set two options: the preferred size of the qbert pixel and the prefered height of a row. Both of these will be explained in more detail below. For now, think of the target pixel size as the dimensions of the smallest block. For the row height, imagine all the blocks being placed top-to-bottom until they hit the row height and then filling left-to-right. Here is how you set these options:

```js
qbert('#my-container', {
    target_pixel_size: 187, // in actual pixels
    target_row_height: 2 // in qbert pixels, or multiples of the target pixel size
})
```

## Stretchiness and tile order

You might be wondering why the pixel size and row height properties are prefixed with the word *target*. The reason is that they are not rigid constraints. Qbert will always try to place the tiles for maximum coverage. To do this it must be able to divide the parent element's width without a remainder and so it may nudge the pixel size a bit in either direction. It also means that it may not always place tiles so they are in neat rows. However, it will always fill top-to-bottom, left-to-right when possible so that blocks will stay close to their siblings.
