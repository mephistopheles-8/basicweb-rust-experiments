// rollup.config.js
import * as fs from 'fs';
import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import buble from '@rollup/plugin-buble'
import polyfill from 'rollup-plugin-polyfill'
import { terser } from 'rollup-plugin-terser';

const install = process.env.TARGET === "install";
const min = install || process.env.TARGET === "min";

const install_js_path = "../static/root/js";
const debug_js_path = "dist/js";
const install_css_path = "../static/root/css";
const debug_css_path = "dist/css";


const js_dest_path 
      = install 
      ? install_js_path
      : debug_js_path;

const css_dest_path 
      = install 
      ? install_css_path
      : debug_css_path;

const project = "basicweb_events_client";
const author  = "M. Bellaire";
const year    = "2020";
const banner=
`/**
  * ${project}
  * (C) ${year} ${author}
  * All rights Reserved
 */
`;
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
    file: (min) 
      ? `${js_dest_path}/${project}.min.js` 
      : `${js_dest_path}/${project}.js`,
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
    json(),
    commonjs(),
    svelte({
         css: function (css) {
          //        console.log(css.code); // the concatenated CSS
          //console.log(css.map); // a sourcemap

        // creates `main.css` and `main.css.map` — pass `false`
        // as the second argument if you don't want the sourcemap
        css.write(`${css_dest_path}/${project}.css`);
      }
    }),
    buble({transforms : {dangerousForOf: true}}),
    min && terser({
        output : {
            comments : terser_comments 
        }
    })
  ]
}
