import Backbone from 'backbone';
import $ from 'jquery';
import _ from 'underscore';

// Collections
import GadgetronStreamConfigurationCollection from './collections/gadgetronStreamConfigurationCollection';

// Views
import GadgetronStreamConfigurationCollectionView from './views/gadgetronStreamConfiguration/collectionView';
import Login from './views/login';
import LoginDialog from './views/loginDialog';
import LogFilesView from './views/dashboard/logFilesView';

// Extra
import Router from './routes/router.js';
import RegionManager from './regionManager';
import GadgetronReader from './readGadgetronFiles'

Backbone.$ = $;

var combindedReaders;
var combindedWriters;

// get StreamConfiguration-Files from server
Backbone.ajax({
    url: "/api/gadgetronStreamConfiguration",
    success: function(data){
        GadgetronReader.parseGadgetronStreamConfigurationXml(data, 0, function(group){
            GadgetronReader.extractIos(group, 'writer', function(writers){
                combindedWriters = writers;
                GadgetronReader.extractIos(group, 'reader', function(readers){
                    combindedReaders = readers;
                    GadgetronReader.extractGadgets(group, function(gadgets){
                        init(group, gadgets, combindedReaders, combindedWriters);
                    });
                });
            });
        })
    }
});


function init(group, gadgets, readers, writers){
    var self = {} ;
    // load login in Navbar
    var login = new Login();
    login.render();

    // load logView
    self.logFilesView = new LogFilesView({ 
        title: 'Log-File'
    });

    // handle 403 Status-Code globally
    $.ajaxSetup({
        statusCode: {
            403: function(){
                var context = this;
                if(typeof self.loginDialog == 'undefined'){
                    self.loginDialog = new LoginDialog({login});
                    self.loginDialog.on('loggedin', function(){
                        // replay last unseccesuful request after login
                        $.ajax(context);
                    });
                }
                self.loginDialog.show();
            }
        }
    });

    // initalize
    var router = new Router({group, gadgets, readers, writers, logFilesView: self.logFilesView});
    Backbone.history.start();
}