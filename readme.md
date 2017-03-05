A user interface for interacting with the <a href="https://github.com/gadgetron/gadgetron">Gadgetron Framework</a>. We hope it assissts you in your daily work and you are welcome to further enhance the system.

It is implemented with Node.js on the server-side and a Backbone on the client-side.

Prerequesits are the following tools. 

1. [siemens_to_ismrmrd](https://github.com/ismrmrd/siemens_to_ismrmrd)
2. [gadgetron](https://github.com/gadgetron/gadgetron)
3. [nodejs](https://nodejs.org/en/)
4. [npm](https://www.npmjs.com/)
5. [hdfview](https://support.hdfgroup.org/products/java/hdfview/) (allows you a local preview of the images)

Please set the PATH variables so that the GadgetronControl can find them and install the required packages:
```bash
apt-get install npm
export GADGETRON_HOME=/usr/local
export ISMRMRD_HOME=/usr/local
export PATH=$PATH:$GADGETRON_HOME/bin:$ISMRMRD_HOME/bin
export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:$GADGETRON_HOME/lib:$ISMRMRD_HOME/lib
```
For installation and startup you can use the following script. 

```bash
# start gadgetron in background and write pipeline
gadgetron > /tmp/gadgetron.log 2>&1 &
git clone https://github.com/thomaskuestner/GadgetronControl
cd GadgetronControl
# install GadgetronControl dependencies
npm install
```
The GadgetronControl can be configured in the "Settings"-Tab or directly in the "./config.json" file (requires GadgetronControl restart).

The UI is then started as a standalone GUI:
```bash
# start electron GUI
npm start
```
or via webbrowser under http://localhost:3000:
```bash
# start remote webserver
npm run remote
```

We implemented a small (but insecure) authentification to ensure a user message notification if anything is deleted. Username and password are both _admin_ by default but you are free to change them in the config.json.

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
|  +--models (all backbone models)
|  +--routes (all routes)
|  +--views (all views)
|  main.js (jump in from backbone)
|  regionManager.js (handels multiple views)
+--results (results of gadgetron for direct download)
+--index.html (main page)
+--load.html (loading page)
trash (storage for the garbage)
uploads (storage for your data)
+--dat
+--h5
+--xsl
config.json (configuration variables)
Gruntfile.js (grunt script)
index.js (node.js server)
package.json (npm packages)
readme.md (this file ;))
```

--------------------------------------------------------
Please read LICENSE file for licensing details.

Further information can be found at:

https://sites.google.com/site/kspaceastronauts/gadgetron/gadgetroncontrol

