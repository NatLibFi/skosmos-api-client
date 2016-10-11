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

(function (root, factory) {

  'use strict';

  if (typeof define === 'function' && define.amd) {
    define([
      'chai/chai',
      'chai-as-promised',
      'es6-polyfills/lib/polyfills/object'
    ], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory(
      require('chai/chai'),
      require('chai-as-promised'),
      require('es6-polyfills/lib/polyfills/object')
    );
  }

}(this, factory));

function factory(chai, chaiAsPromised, Object)
{
  
  'use strict';

  var expect = chai.expect;

  chai.use(chaiAsPromised);

  return function(createFactory, http_mock)
  {

    describe('createFactory', function() {

      it('Should be a function', function() {
        expect(createFactory).to.be.a('function');
      });

      it('Should return the expected object', function() {

        var obj = createFactory({
          url: 'https://foo.bar'
        });

        expect(obj).to.be.an('object').and.to
          .respondTo('vocabularies').and.to
          .respondTo('vocabulary');

        expect(obj.vocabulary).itself.to.respondTo('lookup');

      });

      describe('object', function() {

        afterEach(http_mock.restore);

        describe('#vocabularies', function() {

          it('Should reject because the status code cannot be handled', function() {
            
            var obj = createFactory({
              url: 'https://foo.bar'
            });
            
            http_mock.create({
              url: 'https://foo.bar/vocabularies?lang=foobar',
              status: 302
            });
            
            return expect(obj.vocabularies('foobar')).to.be.rejectedWith(Error, /^Error: Unhandled HTTP status code: 302$/);

          });

          it('Should resolve as expected', function() {
            
            var obj = createFactory({
              url: 'https://foo.bar'
            }),
            body_response = {
              uri: '',
              vocabularies: [
                {
                  uri: 'afo',
                  id: 'afo',
                  title: 'AFO - Luonnonvara- ja ymp\\u00e4rist\\u00f6ontologia'
                },
                {
                  uri: 'allars',
                  id: 'allars',
                  title: 'All\\u00e4rs - Allm\\u00e4n tesaurus p\\u00e5 svenska'
                }
              ]
            };
            
            http_mock.create({
              url: 'https://foo.bar/vocabularies?lang=foobar',
              status: 200,
              body: JSON.stringify(body_response)
            });
            
            return expect(obj.vocabularies('foobar')).to.eventually.eql(body_response.vocabularies);

          });

        });

        describe('#vocabulary', function() {

          it('Should resolve as expected', function() {
            
            var obj = createFactory({
              url: 'https://foo.bar'
            }),
            body_response = {
              '@context': {},
              uri: '',
              id: 'foo',
              title: 'bar',
              defaultLanguage: 'fi',
              languages: [
                'en',
                'fi',
                'sv'
              ],
              conceptschemes: [{
                'label': 'foo',
                'title': 'bar',
                'uri': 'http://foo.bar',
                'type': 'skos:ConceptScheme'
              }]
            };
            
            http_mock.create({
              url: 'https://foo.bar/foobar/',
              status: 200,
              body: JSON.stringify(body_response)
            });
            
            return expect(obj.vocabulary('foobar')).to.eventually.eql(Object.keys(body_response).reduce(function(result, key) {

              if (key !== '@context') {
                result[key] = body_response[key];
              }
              
              return result;
              
            }, {}));

          });

          it('Should resolve as expected with language specified', function() {
            
            var obj = createFactory({
              url: 'https://foo.bar'
            }),
            body_response = {
              '@context': {},
              uri: '',
              id: 'foo',
              title: 'bar',
              defaultLanguage: 'fi',
              languages: [
                'en',
                'foo',
                'sv'
              ],
              conceptschemes: [{
                'label': 'foo',
                'title': 'bar',
                'uri': 'http://foo.bar',
                'type': 'skos:ConceptScheme'
              }]
            };
            
            http_mock.create({
              url: 'https://foo.bar/foobar/?lang=foo',
              status: 200,
              body: JSON.stringify(body_response)
            });
            
            return expect(obj.vocabulary('foobar', 'foo')).to.eventually.eql(Object.keys(body_response).reduce(function(result, key) {

              if (key !== '@context') {
                result[key] = body_response[key];
              }

              return result;

            }, {}));

          });

          describe('#lookup', function() {

            it('Should reject with HTTP 404 status code', function() {

              var obj = createFactory({
                url: 'https://foo.bar'
              });

              http_mock.create({
                url: 'https://foo.bar/foobar/lookup?label=foo',
                status: 404
              });

              return expect(obj.vocabulary.lookup('foobar', 'foo')).to.be.rejected.and.to.eventually.contain.all.keys({
                status: 404,
                headers: {}
              });

            });

            it('Should resolve as expected', function() {
              
              var obj = createFactory({
                url: 'https://foo.bar'
              }),
              body_response = {
                '@context': {},
                result: [{
                  uri: 'http:\\/\\/www.yso.fi\\/onto\\/foobar\\/p00000',
                  type: [
                    'skos:Concept'
                  ],
                  localname: 'p00000',
                  prefLabel: 'foo',
                  lang: 'en',
                  vocab: 'foobar'
                }]
              };
              
              http_mock.create({
                url: 'https://foo.bar/foobar/lookup?label=foo',
                status: 200,
                body: JSON.stringify(body_response)
              });

              return expect(obj.vocabulary.lookup('foobar', 'foo')).to.eventually.eql(body_response.result);

            });

            it('Should resolve as expected with language specified', function() {
              
              var obj = createFactory({
                url: 'https://foo.bar'
              }),
              body_response = {
                '@context': {},
                result: [{
                  uri: 'http:\\/\\/www.yso.fi\\/onto\\/foobar\\/p00000',
                  type: [
                    'skos:Concept'
                  ],
                  localname: 'p00000',
                  prefLabel: 'foo',
                  lang: 'bar',
                  vocab: 'foobar'
                }]
              };
              
              http_mock.create({
                url: 'https://foo.bar/foobar/lookup?label=foo&lang=bar',
                status: 200,
                body: JSON.stringify(body_response)
              });

              return expect(obj.vocabulary.lookup('foobar', 'foo', 'bar')).to.eventually.eql(body_response.result);

            });

          });

        });

      });

    });

  };
  
}
