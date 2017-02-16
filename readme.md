This a user interface for interacting with the Gadgetron-Framework. We hope it will help your daily work and your are welcome for improve the system.

It's implemented with Node.js on the server-side and Backbone on the client.

Prerequesits are the following tools. Please set the PATH variables for them so this software can find theme.

1. [siemens_to_ismrmrd](https://github.com/ismrmrd/siemens_to_ismrmrd)
2. [gadgetron_ismrmrd_client](https://github.com/gadgetron/gadgetron-python-ismrmrd-client)
3. [gadgetron](https://github.com/gadgetron/gadgetron)
4. [nodejs](https://nodejs.org/en/)
5. [npm](https://www.npmjs.com/)
6. [hdfview](https://support.hdfgroup.org/products/java/hdfview/) (than you can locally start hdfview from the UI)

For installation and startup you can use the following script. You can reach the UI then under http://localhost:3000:

```bash
# start gadgetron in background and write pipeline
gadgetron > /var/log/gadgetron.log 2>&1 &
git clone https://github.com/thomaskuestner/GadgetronControl
cd GadgetronControl
npm install
npm start
```
We implemented a litte authentification which is very insecure. It's just to make sure that a user get's a message if he is aware of deleting stuff. Username and password are both _admin_ by default but you are free to change them in the config.json.

The project is ordered in the following folders:
```
db (place for the databases)
api (APIs from the server side)
node_modules
public (backbone stuff)
+--css
|  +--libs (bootstrap, etc.)
|  +--... (place for new css files)
+--fonts
|  +--... (place for all needed fonts)
+--img
|  +--... (place for new images)
+--js
|  +--collections (all backbone colections)
|  +--libs (jquery, bootstrap, etc.)
|  +--models (all backbone models)
|  +--routes (all routes)
|  +--views (all views)
|  main.js (jump in from backbone)
|  regionManager.js (handels multiple views)
+--results (results of gadgetron for direct download)
trash (storage for the garbage)
uploads (storage for your data)
+--dat
+--h5
+--xsl
index.html (main page)
config.json (configuration variables)
Gruntfile.js (grunt script)
index.js (node.js server)
package.json (npm packages)
readme.md (this file ;))
```
