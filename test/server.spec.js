/* eslint-disable jest/valid-expect */
const mocha = require('mocha');
const { expect, assert } = require('chai');

const { getDirectoryData, recursiveSearch } = require('../server');
const { describe, it } = require('mocha');

const fs = require('fs');

describe('server.js', () => {
  beforeEach(() => {
    try { fs.rmSync('./test-dir/roster.json'); } catch (e) { }
    try { fs.rmSync('./test-dir/empty/roster.json'); } catch (e) { }
    try { fs.rmSync('./src/roster.json'); } catch (e) { }
  });

  describe('getDirectoryData', () => {
    describe('new file action', () => {
      after((done) => {
        fs.rmSync('./test-dir/new-file.txt');
        done();
      });
      it('should return new files when listing', (done) => {

        const data = getDirectoryData('./test-dir');
        fs.writeFileSync('./test-dir/new-file.txt', 'new file');
        const data2 = getDirectoryData('./test-dir');

        expect(data2).to.deep.equal({
          ...data,
          'new-file.txt': {
            kind: 'file',
            tags: [],
          }
        });
        done();

      });
    });


    it('should return an empty object for empty directory', (done) => {
      const data = getDirectoryData('./test-dir/empty');
      expect(data).to.deep.equal({});
      done();
    });

    it('should return list with files and directories', (done) => {
      const data = getDirectoryData('./test-dir');
      expect(data).to.deep.equal({
        'empty': {
          kind: 'directory',
          tags: [],
        },
        'file-a.txt': {
          kind: 'file',
          tags: [],
        },
        'file-b.json': {
          kind: 'file',
          tags: [],
        },

      });
      done();
    });
    it('should return src data', (done) => {

      const dirname = './src';

      const data = getDirectoryData(dirname);

      expect(data).to.deep.equal({
        'App.css': { 'kind': 'file', tags: [] },
        'App.js': { 'kind': 'file', tags: [] },
        'App.test.js': { 'kind': 'file', tags: [] },
        'DirectoryList.css': { 'kind': 'file', tags: [] },
        'DirectoryList.js': { 'kind': 'file', tags: [] },
        'SearchComponent.css': { 'kind': 'file', tags: [] },
        'SearchComponent.js': { 'kind': 'file', tags: [] },
        'index.css': { 'kind': 'file', tags: [] },
        'index.js': { 'kind': 'file', tags: [] },
        'logo.svg': { 'kind': 'file', tags: [] },
        'reportWebVitals.js': { 'kind': 'file', tags: [] },
        'setupTests.js': { 'kind': 'file', tags: [] },

      });

      done();

    });
  });
  describe('recursiveSearch', () => {
    it('should recursive search the src directory for files that contain \'a\'', async () => {
      let dir = 'test-dir';
      let allConditions = ['a'];

      const results = await recursiveSearch(dir, allConditions, [], []);
      expect(results).to.deep.equal({
        'test-dir/file-a.txt': { kind: 'file', tags: [] },
      });
      return Promise.resolve(results);

    });
    it('should return no results for searching src directory for does-not-exist', async () => {
      let dir = 'src';
      let allConditions = ['does-not-exist'];

      const results = await recursiveSearch(dir, allConditions, [], ['node_modules']);
      expect(results).to.deep.equal({});
      return Promise.resolve(results);

    });
    it('should return no results for searching an empty directory', async () => {
      let dir = 'test-dir/empty';
      let allConditions = ['a'];

      const results = await recursiveSearch(dir, allConditions, [], []);

      expect(results).to.deep.equal({});

      return Promise.resolve();
    });
    it ('should return results for app.js from Coding/', async function ()  {
      // this.timeout(2000);
      let dir = '../../Coding';
      let allConditions = ['app.js'];

      const result = await recursiveSearch(dir, allConditions, [], ['venv', 'node_modules']);
      expect(result).to.be.not.empty


      return Promise.resolve();
    });
    it ('should find all js files in project', async function ()  {
      // this.timeout(2000);
      let dir = '.';
      let allConditions = ['.js'];

      const result = await recursiveSearch(dir, allConditions, [], ['venv', 'node_modules']);
      expect(result).to.be.not.empty


      return Promise.resolve();
    });
  });
});
