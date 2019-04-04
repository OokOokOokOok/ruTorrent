<?php
require_once( 'unpacknotify.php' );

ignore_user_abort(true);
set_time_limit(0);
$ret = array();
if(isset($_REQUEST['cmd']))
{
	$cmd = $_REQUEST['cmd'];
	switch($cmd)
	{
		case "set":
		{
			$upn = rUnpackNotify::load();
			$upn->set();
			cachedEcho($upn->get(),"application/javascript");
			break;
		}
	}
}

cachedEcho(safe_json_encode($ret),"application/json");
