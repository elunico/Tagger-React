# Tagger
`v0.0.1-alpha`

Program for tagging files in a directory with records local to that directory.

This is a work in progress.

## What does this program do?

This program presents you with a list of files in a directory on your computer and allows you to add tags to them so that you can organize and
search for files by tag.

Unfortunately, it is still in development and a little early so there are some....

## Caveats!!
-  Error handling is not very good. If you use this program (which you **probably should not** you should not expect the format of the saves to be consistent and it may occassionally require you to completely remove the roster.json file and start over. Plus if you have an old version or a conflicting file name it will totally crash your program)
-  ***The program will overwrite any `roster.json` and `.roster.json` file that it encounters when entering a directory so please watch out***
-  You currently cannot search subdirectories for tags. I want to be able to do this but it will be somewhat... tricky
-  Search works well, but the semantics behind the Boolean logic is a little... off. Also there is no precedence. I am working on that as well.

## Ok, I get that it might set my computer on fire and delete all my data, but I still want to use it for some reason
If this is true, then clone the repo, run `npm install`, and then run `npm start` and `node server.js`. You must have the backend server running in order to 
serve the data to the server. This app was made with `create-react-app`. 

I do not recommend doing this until the project is more correct and stable.

The front end runs on `3000` and the server runs on `5001`.

## Disclaimer and License

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
