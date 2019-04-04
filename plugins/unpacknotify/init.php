<?php

eval(getPluginConf($plugin["name"]));
require_once( 'unpacknotify.php' );

$up = rUnpackNotify::load();
$jResult .= $up->get();
$theSettings->registerPlugin($plugin["name"],$pInfo["perms"]);
$theSettings->registerEventHook($plugin["name"], "TaskSuccess");