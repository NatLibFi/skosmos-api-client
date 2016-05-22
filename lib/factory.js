/**
*
* @licstart  The following is the entire license notice for the JavaScript code in this file. 
*
* Javascript client for accessing Skosmos-based services, like Finto
*
* MIT License
* Copyright (c) 2016 University Of Helsinki (The National Library Of Finland)
*
* Permission is hereby granted, free of charge, to any person obtaining
* a copy of this software and associated documentation files (the
* "Software"), to deal in the Software without restriction, including
* without limitation the rights to use, copy, modify, merge, publish,
* distribute, sublicense, and/or sell copies of the Software, and to
* permit persons to whom the Software is furnished to do so, subject to
* the following conditions:
* 
* The above copyright notice and this permission notice shall be included
* in all copies or substantial portions of the Software.
* 
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
* EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
* MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
* IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
* CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
* TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
* SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*
* @licend  The above is the entire license notice
* for the JavaScript code in this file.
*
**/

/* istanbul ignore next: umd wrapper */
(function (root, factory) {

  'use strict';

  if (typeof define === 'function' && define.amd) {
    define([
      'es6-polyfills/lib/polyfills/object',
      'jjv/lib/jjv',
      'jjve',
      'requirejs-plugins/src/json!../resources/options-schema.json'
    ], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory(
      require('es6-polyfills/lib/polyfills/object'),
      require('jjv'),
      require('jjve'),
      require('../resources/options-schema.json')
    );
  }

}(this, factory));

function factory(Object, jjv, jjve, schema)
{

  'use strict';

  return function(http_client)
  {
    return function(options)
    {
      
      function initializeOptions()
      {

        var errors,
        env = jjv(),
        je = jjve(env);

        options = typeof options === 'object' ? options : {};
        errors = env.validate(schema, options, {
          useDefault: true
        });

        if (errors) {
          throw new Error('Failed validating options: ' + JSON.stringify(je(schema, options, errors), undefined, 4));
        }

      }
      
      function handleResponse(response)
      {
        if (response.status !== 200) {
          throw new Error('Unhandled HTTP status code: ' + response.status);
        } else {
          return JSON.parse(response.body);
        }
      }
      
      function handleError(error) {
        if (typeof error === 'object' && typeof error.status === 'number' && typeof error.headers === 'object') {  
          
          throw Object.assign(new Error('HTTP status: ' + error.status), {
            status: error.status,
            headers: error.headers
          });
          
        } else {
          throw error;
        }
      }

      initializeOptions();
            
      return {
        vocabularies: function(lang)
        {
          return http_client.get(options.url + '/vocabularies?lang=' + lang)
            .then(handleResponse)
            .then(function(obj) {

              return obj.vocabularies;

            })
            .catch(handleError);
        },
        vocabulary: Object.assign(function(name, lang) {

          return http_client.get(options.url + '/' + name + '/' + (lang ? '?lang=' + lang : ''))
            .then(handleResponse)
            .then(function(obj) {
              
              return Object.keys(obj).reduce(function(result, key) {

                if (key !== '@context') {
                  result[key] = obj[key];
                }
                
                return result;

              }, {});

            })
            .catch(handleError);

        }, {
          lookup: function(name, label, lang)
          {
            return http_client.get(options.url + '/' + name + '/lookup?label=' + label + (lang ? '&lang=' + lang : ''))
              .then(handleResponse)
              .then(function(obj) {
                return obj.result;
              })
              .catch(handleError);
          }
        })
      };
      
    };
  };

}
