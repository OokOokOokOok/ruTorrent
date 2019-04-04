<?php
eval( getPluginConf( 'unpacknotify' ) );

class rUnpackNotify
{
	private static $notifyTypes = array('sonarr', 'radarr');

	public $hash = "unpacknotify.dat";
	public $enabled = 0;
	public $rows = array();

	static public function load()
	{
		$cache = new rCache();
		$upn = new rUnpackNotify();
		$cache->get( $upn );
		return($upn);
	}

	public function store()
	{
		$cache = new rCache();
		return($cache->set( $this ));
	}

	public function set()
	{
		$rows = array();
		$perRowDataSpecifications = array(
			array(
				'name' => 'label',
				'request_key' => 'unpacknotify_label_',
				'required' => true,
				'validation' => function ($val) {
					return (@preg_match($val, null) !== false);
				}
			),
			array(
				'name' => 'url',
				'request_key' => 'unpacknotify_url_',
				'required' => true,
				'validation' => function ($val) {
					return (bool)(filter_var($val, FILTER_VALIDATE_URL));
				}
			),
			array(
				'name' => 'apikey',
				'request_key' => 'unpacknotify_apikey_',
				'required' => true,
				'validation' => function ($val) {
					return (bool)(preg_match('/^[a-zA-Z0-9]+$/', $val));
				}
			),
			array(
				'name' => 'type',
				'request_key' => 'unpacknotify_type_',
				'required' => true,
				'validation' => function ($val) {
					return in_array($val, self::$notifyTypes);
				}
			),
		);
		foreach ($_REQUEST as $requestKey => $requestValue)
		{
			foreach ($perRowDataSpecifications as $rowDataSpecification)
			{
				if (strpos($requestKey, $rowDataSpecification['request_key']) === 0)
				{
					if (!is_callable($rowDataSpecification['validation']) || call_user_func($rowDataSpecification['validation'], $requestValue))
					{
						$key = (int) str_replace($rowDataSpecification['request_key'], '', $requestKey);
						$rows[$key][$rowDataSpecification['name']] = $requestValue;
					}
				}
			}
		}
		$this->rows = array();
		foreach ($rows as $row)
		{
			$valid = true;
			foreach ($perRowDataSpecifications as $rowDataSpecification)
			{
				if ($rowDataSpecification['required'] && !isset($row[$rowDataSpecification['name']]))
				{
					$valid = false;
				}
			}
			if ($valid)
			{
				$this->rows[] = $row;
			}
		}
		if(isset($_REQUEST['unpacknotify_enabled']))
		{
			$this->enabled = ($_REQUEST['unpacknotify_enabled'] == "1") ? "1" : "0";
		}
		$this->store();
	}

	public function get()
	{
		$data = array(
			'enabled' => $this->enabled,
			'types' => self::$notifyTypes,
			'rows' => $this->rows,
		);
		return("theWebUI.unpacknotifyData = " . json_encode($data) . ";\n");
	}

	public function processUnpackedNotification($hash, $dir)
	{
		if (!$this->enabled || empty($this->rows))
		{
			return;
		}
		$label = $this->getLabel($hash);
		if (!$label)
		{
			return;
		}
		foreach ($this->rows as $row)
		{
			if (preg_match($row['label'], $label))
			{
				$this->curlRequest($row, $hash, $dir);
			}
		}
	}

	private function getLabel($hash)
	{
		$req = new rXMLRPCRequest( array(
			new rXMLRPCCommand( "d.get_custom1", $hash ),
		) );
		$label = null;
		if($req->success())
		{
			$label = rawurldecode($req->val[0]);
		}
		return $label;
	}

	private function curlRequest($row, $hash, $dir)
	{
		// If your torrent client is fast enough, sonarr's API will not be aware of the DL before
		// it gets thrown at it by rutorrent. For real.
		sleep(5);
		$curl = curl_init();
		$curlOpts = array(
			CURLOPT_RETURNTRANSFER => 1,
			CURLOPT_URL => $row['url'],
			CURLOPT_USERAGENT => 'rutorrent',
			CURLOPT_TIMEOUT => 5,
			CURLOPT_CONNECTTIMEOUT => 5,
			CURLOPT_POST => 1,
			CURLOPT_FOLLOWLOCATION => true,
			CURLOPT_MAXREDIRS => 4,
			CURLOPT_POSTFIELDS => json_encode(array(
				'name' => ($row['type'] === 'radarr' ? 'DownloadedMoviesScan' : 'downloadedepisodesscan'), //@TODO allow better for more types?
				'path' => $dir,
				'downloadClientId' => $hash,
				'importMode' => 'Move',
			)),
			CURLOPT_HTTPHEADER => array(
				'X-Api-Key: ' . rawurlencode($row['apikey']),
				'Content-Type: application/json',
			),
		);
		if (defined('CURLOPT_POSTREDIR')) {
			$curlOpts[CURLOPT_POSTREDIR] = 0x1 | 0x2 | 0x4;
		}
		curl_setopt_array($curl, $curlOpts);
		$resp = curl_exec($curl);
		$httpcode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
		$curlError = curl_error($curl);
		curl_close($curl);
		if ($httpcode != 201) {
			toLog("Error calling ".$row['url'].", response code was '$httpcode', expected 201. Curl error: '$curlError'. Full response body: '$resp'");
			return false;
		}
		return true;
	}
}