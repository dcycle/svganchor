import test from 'ava'

const my = require("/mycode/builder/js/builder.js")

test('function svgAnchorBuilder.state() test', t => {
  t.true(my.svgAnchorBuilder.state() == "init");
})

test('function svgAnchorBuilder.mapPoint() test', t => {
  [
    {
      point: {
        x: 0,
        y: 0,
        image_height: 100,
        image_width: 100
      },
      axis: "horizontal",
      max: 100,
      real: 100,
      svg_height: 100,
      svg_length: 100,
      img_topleft: {
        x: 0,
        y: 0,
        image_height: 100,
        image_width: 100
      },
      img_bottomright: {
        x: 100,
        y: 100,
        image_height: 100,
        image_width: 100
      },
      expected: {
        x: 0,
        y: 0
      }
    },
    {
      point: {
        x: 100,
        y: 100,
        image_height: 100,
        image_width: 100
      },
      axis: "horizontal",
      max: 100,
      real: 100,
      svg_height: 100,
      svg_length: 100,
      img_topleft: {
        x: 0,
        y: 0,
        image_height: 100,
        image_width: 100
      },
      img_bottomright: {
        x: 100,
        y: 100,
        image_height: 100,
        image_width: 100
      },
      expected: {
        x: 100,
        y: 100
      }
    },
    {
      point: {
        x: 0,
        y: 0,
        image_height: 100,
        image_width: 100
      },
      axis: "vertical",
      max: 100,
      real: 100,
      svg_height: 100,
      svg_length: 100,
      img_topleft: {
        x: 0,
        y: 0,
        image_height: 100,
        image_width: 100
      },
      img_bottomright: {
        x: 100,
        y: 100,
        image_height: 100,
        image_width: 100
      },
      expected: {
        y: 0,
        x: 0
      }
    },
    {
      point: {
        x: 50,
        y: 50,
        image_height: 100,
        image_width: 100
      },
      axis: "vertical",
      max: 100,
      real: 100,
      svg_height: 100,
      svg_length: 100,
      img_topleft: {
        x: 0,
        y: 0,
        image_height: 100,
        image_width: 100
      },
      img_bottomright: {
        x: 100,
        y: 100,
        image_height: 100,
        image_width: 100
      },
      expected: {
        y: 50,
        x: 50
      }
    },
    {
      point: {
        x: 10,
        y: 10,
        image_height: 100,
        image_width: 100
      },
      axis: "vertical",
      max: 100,
      real: 100,
      svg_height: 100,
      svg_length: 100,
      img_topleft: {
        x: 10,
        y: 10,
        image_height: 100,
        image_width: 100
      },
      img_bottomright: {
        x: 100,
        y: 100,
        image_height: 100,
        image_width: 100
      },
      expected: {
        y: 0,
        x: 10
      }
    },
    {
      point: {
        x: 10,
        y: 10,
        image_height: 100,
        image_width: 100
      },
      axis: "horizontal",
      max: 100,
      real: 50,
      svg_height: 100,
      svg_length: 100,
      img_topleft: {
        x: 10,
        y: 10,
        image_height: 100,
        image_width: 100
      },
      img_bottomright: {
        x: 100,
        y: 100,
        image_height: 100,
        image_width: 100
      },
      expected: {
        x: 25,
        y: 5,
      }
    },
    // {
    //   point: {
    //     x: 587,
    //     y: 207,
    //     image_height: 360,
    //     image_width: 640
    //   },
    //   axis: "horizontal",
    //   max: 529,
    //   real: 400,
    //   svg_height: 100,
    //   svg_length: 100,
    //   img_topleft: {
    //     x: 64,
    //     y: 43,
    //     image_height: 360,
    //     image_width: 640
    //   },
    //   img_bottomright: {
    //     x: 582,
    //     y: 317,
    //     image_height: 360,
    //     image_width: 640
    //   },
    //   expected: {
    //     x: 25,
    //     y: 5,
    //   }
    // },
  ].forEach(function(item, index) {
    item.real = my.svgAnchorBuilder.mapPoint(item.point, item.axis, item.max, item.real, item.svg_height, item.svg_length, item.img_topleft, item.img_bottomright);
    console.log(item);
    t.true(JSON.stringify(item.real) == JSON.stringify(item.expected));
  });
});
