/*
 * PLUGIN UnpackNotify
 *
 * Slovak language file.
 *
 * Author: 
 */

theUILang.unpacknotifyEnabled = "Enable Unpack Notify for Sonarr/Radarr?";
theUILang.unpacknotifyHelp = "Add any number of rows mapping a label regex to a sonarr/radarr URL to notify when a torrent is sucessfully processed by unpack";
theUILang.unpacknotifyPanelName = "Unpack Notify";
theUILang.unpacknotifyLabelRexex = 'Label regex';
theUILang.unpacknotifyUrl = 'Sonarr URL';
theUILang.unpacknotifyAdd = 'Add URL to notify';
theUILang.unpacknotifyApiKey = 'API Key';
theUILang.unpacknotifyType = 'Type';
theUILang.unpacknotifyTypes = {
    'sonarr': 'Sonarr',
    'radarr': 'Radarr'
};
thePlugins.get("unpacknotify").langLoaded();