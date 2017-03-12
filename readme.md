A user interface for interacting with the <a href="https://github.com/gadgetron/gadgetron">Gadgetron Framework</a>. We hope it assissts you in your daily work and you are welcome to further enhance the system.

It is implemented with Node.js on the server-side and a backbone on the client-side. There are two operation modes available:
- local: start a local GUI (wrapper around remote option)
- remote: run a server and connect to the server via webbrowser

# Quick start
Assuming you are running it inside the gadgetron docker image or having gadgetron set up properly.
```bash
sudo apt-get install npm nodejs-legacy
git clone https://github.com/thomaskuestner/GadgetronControl
cd GadgetronControl
npm install
npm start
```

# Installation
## Prerequesits 
Prerequisites are the following tools:<br/>
1. [siemens_to_ismrmrd](https://github.com/ismrmrd/siemens_to_ismrmrd)<br/>
2. [gadgetron](https://github.com/gadgetron/gadgetron)<br/>
3. [nodejs](https://nodejs.org/en/)<br/>
4. [npm](https://www.npmjs.com/)<br/>
5. (optional) [hdfview](https://support.hdfgroup.org/products/java/hdfview/)<br/>
6. (optional) [imagej](https://imagej.nih.gov/ij/download.html)<br/>

Please set the PATH variables so that the GadgetronControl can find them and install the required packages:
```bash
sudo apt-get install npm nodejs-legacy
export GADGETRON_HOME=/usr/local
export ISMRMRD_HOME=/usr/local
export PATH=$PATH:$GADGETRON_HOME/bin:$ISMRMRD_HOME/bin
export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:$GADGETRON_HOME/lib:$ISMRMRD_HOME/lib
```
## Installation script
For installation and startup you can use the following script. 
```bash
git clone https://github.com/thomaskuestner/GadgetronControl
cd GadgetronControl
# install GadgetronControl dependencies
npm install
```
## Configuration
The GadgetronControl can be configured in the "Settings"-Tab or directly in the "./config.json" file (requires GadgetronControl restart):
```
    "port": "3000",                                       // client-server communication port
    "hostname": "localhost",                              // server IP
    "config_dir": "/usr/local/share/gadgetron/config/",   // Gadgetron configuration dir (path with *.xml files)
    "upload_dir": "uploads",                              // data upload directory (relative to GadgetronControl root)
    "result_dir": "public/results",                       // results directory (relative to GadgetronControl root)
    "trash_dir": "trash",                                 // trash directory (relative to GadgetronControl root)
    "gadgetron_port": "9002",                             // Gadgetron port
    "gadgetron_relay_host": "localhost",                  // Gadgetron relay host
    "gadgetron_relay_port": "8002",                       // Gadgetron relay port
    "gadgetron_rest_port": "9080",                        // Gadgetron rest port
    "gadgetron_log": "/tmp/gadgetron.log",                // Gadgetron log file
    "readers_db": "db/readers.db",                        // database for reader gadgets (relative to GadgetronControl root)
    "gadgets_db": "db/gadgets.db",                        // database for Gadgetron gadgets (relative to GadgetronControl root)
    "writers_db": "db/writers.db",                        // database for writer gadgets (relative to GadgetronControl root)
    "admin_user": "admin",                                // admin user name
    "password": "admin",                                  // admin password
    "viewer": "hdfview"                                   // optional viewers: hdfview | imagej
```

# Usage
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

# Features
- run Gadgetron configurations (*.xml), bash scripts (*.sh) and python scripts (*.py)
- upload or locate data on server
- configure Gadgetron pipeline: visualize, add, delete, rearrange and parametrize gadgets
- upload/download and locate data on server
- display log output
- view results via hdfview or imagej

# Structure
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
|  backboneMain.js (jump in from backbone)
|  gadgetronBundleApp.js (babelified server code)
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
main.js (electron GUI)
index.js (node.js server)
package.json (npm packages)
readme.md (this file ;))
```
# Change log
- v0.1.0: initial release

--------------------------------------------------------
Please read LICENSE file for licensing details.

Further information can be found at:

https://sites.google.com/site/kspaceastronauts/gadgetron/gadgetroncontrol

