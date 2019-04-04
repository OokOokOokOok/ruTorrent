<?php

require_once( 'unpacknotify.php' );

class unpacknotifyHooks
{
	static public function OnTaskSuccess( $prm )
	{
		if (!self::isUnpackEvent($prm)) {
			return;
		}
		$class = rUnpackNotify::load();
		$class->processUnpackedNotification($prm['hash'], $prm['dir']);
	}

	static private function isUnpackEvent( $prm )
	{
		if (isset($prm['requester'])
			&& isset($prm['name'])
			&& $prm['requester'] == 'unpack'
			&& $prm['name'] == 'unpack'
			&& !empty($prm['hash'])
			&& !empty($prm['dir'])
		) {
			return true;
		}
		return false;
	}
}
