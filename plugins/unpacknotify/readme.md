# Unpack Notify
## Notify Sonarr/Radarr when your torrents are finished unpacking

This plugin is intended to be used with the unpack plugin in autounpack mode and sonarr/radarr.

When using sonarr/radarr together with rutorrent unpack and torrents containing rar/zip archived files,
you tend to run into a few problems:
- Sonarr does not handle rar/zip files
- You can use unpack in autounpacking mode to unpack to the torrent folder itself, and sonarr will pick up the file. But it has to leave the unpacked file lying around, creating a mess.
- Sonarr also has the unfortunate habit of importing the file before it is fully unpacked, leading to broken imports/weirdness.

This plugin solves that problem. You can autounpack into a temporary folder of your choice, enable unpacknotify, give it
the URL, API Key and label that your sonarr/radarr install uses, and once your download is fully unpacked, the plugin
will instruct sonarr/radarr via the API to __move__ the download from the temporary location.

Unpack should be set to extract files to a subdirectory named after the torrent name, or sonarr/radarr
may delete the directory above it, causing you some problems.

Unpack notify allows you to add as many sonarr/radarr instances to notify as you want, each with it's own URL, API key and label combination.

It should be pretty easy to extend this plugin to cover other things you might want to notify on a finished download via an HTTP API.