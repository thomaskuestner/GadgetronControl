A user interface for interacting with the <a href="https://github.com/gadgetron/gadgetron">Gadgetron Framework</a>. We hope it assissts you in your daily work and you are welcome to further enhance the system.

It is implemented with Node.js on the server-side and a Backbone on the client-side.

Prerequesits are the following tools. Please set the PATH variables so that the GadgetronControl can find them.

1. [siemens_to_ismrmrd](https://github.com/ismrmrd/siemens_to_ismrmrd)
2. [gadgetron](https://github.com/gadgetron/gadgetron)
3. [nodejs](https://nodejs.org/en/)
4. [npm](https://www.npmjs.com/)
5. [hdfview](https://support.hdfgroup.org/products/java/hdfview/) (allows you a local preview of the images)

For installation and startup you can use the following script. The UI is then reached under http://localhost:3000:

```bash
# start gadgetron in background and write pipeline
gadgetron > /var/log/gadgetron.log 2>&1 &
git clone https://github.com/thomaskuestner/GadgetronControl
cd GadgetronControl
npm install
npm start
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

--------------------------------------------------------
Please read LICENSE file for licensing details.

Further information can be found at:

https://sites.google.com/site/kspaceastronauts/gadgetron/gadgetroncontrol

