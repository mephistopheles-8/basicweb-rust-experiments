// rollup.config.js
import * as fs from 'fs';
import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs'
import buble from '@rollup/plugin-buble'
import polyfill from 'rollup-plugin-polyfill'
import { terser } from 'rollup-plugin-terser';

const prod = process.env.TARGET === "min";
const project = "svelte_stripe";
const author  = "M. Bellaire";
const year    = "2020";
const banner=
`/**
  * ${project}
  * (C) ${year} ${author}
  * All rights Reserved
 */
`

const terser_comments = function terser_comments(node, comment) {
      var text = comment.value;
      var type = comment.type;
      var ret = false;
      if (type == "comment2") {
           return /all rights reserved/i.test(text);
      }
      return ret;
};

export default {
  input: 'src/main.js',
  output: {
    file: (prod) ? `dist/js/${project}.min.js` : `dist/js/${project}.js`,
    format: 'iife',
    name:  project,
    banner
  },
  plugins: [
    polyfill("src/main.js", ['whatwg-fetch', 'promise-polyfill']),
    resolve({
        jsnext: true,
        main: true,
        browser : true
    }),
    commonjs(),
    svelte({
         css: function (css) {
          //        console.log(css.code); // the concatenated CSS
          //console.log(css.map); // a sourcemap

        // creates `main.css` and `main.css.map` — pass `false`
        // as the second argument if you don't want the sourcemap
        css.write(`dist/css/${project}.css`);
      }
    }),
    buble({transforms : {dangerousForOf: true}}),
    prod && terser({
        output : {
            comments : terser_comments 
        }
    })
  ]
}
