/**
 * jPage v0.9 - A dynamic settings library with jQuery
 * Depends: jQuery >= 1.5
 * 
 * Copyright (C) 2013 Alex Scheel
 * All rights reserved.
 * Licensed under BSD 2 Clause License:
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * - Redistributions of source code must retain the above copyright notice,
 *   this list of conditions and the following disclaimer.
 * - Redistributions in binary form must reproduce the above copyright notice, 
 *   this list of conditions and the following disclaimer in the documentation 
 *   and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
**/

/**
 * Usage:
 *   var settings = new jSettings();
 *   settings.init('div-jsettings-id', '/path/to/settings/load.php');
 *   settings.setSettings(["Username", 'username', 'text', 'regular'], ['split'], ["Password", 'password', 'password', 'hex']]);
 *   settings.setSaveURI('/path/to/saveuri.php');
 *   settings.setSplit(':');
 *   settings.setSaveBehavior('both');
 *   settings.setLabels(true);
 *   settings.load();
 *   
 * API:
 *   Main:
 *     init(element, uri) - Set page element, settings loading uri
 *     
 *     load() - Starts jSettings, loads data, displays
 *     
 *   Config:
 *     setSettings(settings) - Set settings options from array.
 *     
 *     setSaveURI(suri) - Set saving uri
 *     
 *     setURLAppend(data) - GET options to append to queries
 *     
 *     setSplit(split) - Delimiter for data loading
 *     
 *     setSaveBehavior(button|automatic|both) - Set save behavior
 *     
 *     setSuccess(value) - Result of successful save
 *     
 *     setLabels(true|false) - Show labels?
 *     
 *   Internal:
 *     Data loading:
 *       getData()
 *       pushData()
 *       saveData()
 *       loadData()
 *       
 *     Events:
 *       eventTriggerSave(event)
 *       bindEvents()
 *       unbindEvents()
 *       
 *     Display:
 *       getSettings() 
 *       loadSettings()
 *     
 *     unhex(text)
**/

function jSettings() {
    this.settings = [];
    this.selement = "";
    this.loaduri = "";
    this.saveuri = "";
    this.storage = {};
    this.urlappend = "";
    this.datasplit = ",";
    this.behavior = "button";
    this.changed = [];
    this.success = 'success';
    this.labels = false;
    this.ledited = '';
    
    this.init = function(element, luri) {
        this.selement = element;
        this.loaduri = luri;
    }
    
    this.setSettings = function(settings) {
        this.settings = settings;
    }
    
    this.setSaveURI = function(suri) {
        this.saveuri = suri;
    }
    
    this.setURLAppend = function(data) {
        this.urlappend = data;
    }
    
    this.setSplit = function(delimiter) {
        this.datasplit = delimiter;
    }
    
    this.setSaveBehavior = function(type) {
        this.behavior = type;
    }
    
    this.setSuccess = function(value) {
        this.success = value;
    }
    
    this.setLabels = function(value) {
        this.labels = value;
    }
    
    this.hideSettings = function() {
        $('#' + this.selement).hide();
    }
    
    this.showSettings = function() {
        $('#' + this.selement).show();
    }
    
    this.getData = function() {
        for (var sid in this.settings) {
            var setting = this.settings[sid];
            if (setting[0] == 'split') {
                continue;
            }
            var ddata = '';
            $.ajaxSetup({async:false});
            $.get(this.loaduri + "?id=" + setting[1] + this.urlappend, function(data) {
                ddata = data;
            });
            $.ajaxSetup({async:true});
            
            if (ddata != 'error') {
                var keyvalue = ddata.split(this.datasplit, 2);
                
                if (setting[3] == 'hex') {
                    keyvalue[1] = this.unhex(keyvalue[1]);
                }
                
                this.storage[setting[1]] = keyvalue[1];
            } else {
                alert("Error loading setting: " + setting[1]);
                return;
            }
        }
        
        this.changed = [];
    }
    
    this.getSettings = function() {
        var result = "";
        
        for (var sid in this.settings) {
            var setting = this.settings[sid];
            var text = setting[0];
            if (text != 'split') {
                var id = setting[1];
                var type = setting[2];
                var handle = setting[3];
                
                if (this.labels) {
                    result += '<label id="' + this.selement + '-' + id + '-label" class="jsettings-label">' + text + '</label>';
                }
                
                if (type == 'image') {
                    result += '<img alt="' + id + '" id="' + this.selement + '-' + id + '" src="' + this.storage[id] + '" title="' + text + '" class="jsettings-image">';
                } else if (type == 'text-area') {
                    result += '<textarea id="' + this.selement + '-' + id + '" placeholder="' + text + '" title="' + text + '" class="jsettings-textarea"></textarea>';
                } else {
                    result += '<input id="' + this.selement + '-' + id + '" placeholder="' + text + '" type="' + type + '" title="' + text + '" class="jsettings-input">';
                }
                if (this.labels) {
                    result += "<br>";
                }
            } else {
                result += "<br>";
            }
        }

        if ((this.behavior == 'button') || (this.behavior == 'both')) {
            result += '<button class="jsettings-button" id="' + this.selement + '-submit">Save</button>';
        }
        
        result = '<span id="' + this.selement + '-saving" class="jsettings-saving"></span><br>' + result;
        
        return result;
    }
    
    this.loadSettings = function() {
        $('#' + this.selement).html(this.getSettings());
    }
    
    this.pushData = function() {
        for (var cid in this.changed) {
            var setting = this.settings[this.changed[cid]];
            if (setting[0] == 'split') {
                continue;
            }
            var nvalue = this.storage[setting[1]];
            $.ajaxSetup({async:false});
            $.get(this.saveuri + "?id=" + setting[1] + "&val=" + nvalue + this.urlappend, function(data) {
                ddata = data;
            });
            $.ajaxSetup({async:true});
            
            if (ddata != this.success) {
                alert("Error saving setting: " + setting[1] + ": " + ddata);
            }
        }
        
        this.changed = [];
    }
    
    this.saveData = function() {
        for (var sid in this.settings) {
            var setting = this.settings[sid];
            if (setting[0] == 'split') {
                continue;
            }
            
            if ($('#' + this.selement + "-" + setting[1]).val() != this.storage[setting[1]]) {
                this.changed.push(sid);
                this.storage[setting[1]] = $('#' + this.selement + "-" + setting[1]).val();
            }
        }
    }
    
    this.loadData = function() {
        for (var sid in this.settings) {
            var setting = this.settings[sid];
            if (setting[0] == 'split') {
                continue;
            }
            if (setting[2] != 'image') {
                $('#' + this.selement + '-' + setting[1]).val(this.storage[setting[1]]);
            }
        }
    }
    
    this.eventTriggerSave = function(event) {
        event.data.instance.saveData();
        if (event.data.instance.changed.length != 0) {
            $('#' + event.data.instance.selement + '-saving').html('Saving...');
            event.data.instance.ledited = event.data.element;
            event.data.instance.pushData();
            event.data.instance.load();
        }
    }
    
    this.bindEvents = function() {
        this.unbindEvents();
        if (this.behavior == 'button') {
            $(document).on('click', '#' + this.selement + '-submit', { instance: this }, this.eventTriggerSave);
        } else {
            if (this.behavior == 'both') {
                $(document).on('click', '#' + this.selement + '-submit', { instance: this }, this.eventTriggerSave);
            }
            
            for (var sid in this.settings) {
                var setting = this.settings[sid];
                if (setting[0] == 'split') {
                    continue;
                }
                
                $(document).on('focusout', '#' + this.selement + '-' + setting[1], { instance: this, element: '#' + this.selement + '-' + setting[1]}, this.eventTriggerSave);
            }
        }
    }
    
    this.unbindEvents = function() {
        if (this.behavior == 'button') {
            $(document).off('click', '#' + this.selement + '-submit');
        } else {
            if (this.behavior == 'both') {
                $(document).off('click', '#' + this.selement + '-submit');
            }
            
            for (var sid in this.settings) {
                var setting = this.settings[sid];
                if (setting[0] == 'split') {
                    continue;
                }
                
                $(document).off('focusout', '#' + this.selement + '-' + setting[1]);
            }
        }
    }
    
    this.unhex = function(text) {
        if (text.length % 2 != 0) {
            return;
        } else {
            var result = "";
            var stext = text.split('');
            for (var i = 0; i < text.length; i += 2) {
                result += String.fromCharCode(parseInt("0x" + stext[i] + '' + stext[i+1]));
            }
            return result;
        }
    }
    
    this.load = function() {
        this.unbindEvents();
        this.getData();
        this.hideSettings();
        this.loadSettings();
        this.loadData();
        this.showSettings();
        this.bindEvents();
        if (this.ledited != '') {
            $(this.ledited).focus();
        }
    }
}
