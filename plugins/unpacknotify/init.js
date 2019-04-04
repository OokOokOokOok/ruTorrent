plugin.loadLang();
plugin.loadMainCSS();

if(plugin.canChangeOptions())
{
	plugin.addAndShowSettings = theWebUI.addAndShowSettings;
	theWebUI.addAndShowSettings = function( arg )
	{
		var enabled = (theWebUI.unpacknotifyData.enabled == 1);
		$('#unpacknotify_enabled').prop('checked', enabled);
		$('#unpacknotify_rows').empty();
		for (var i = 0; i < theWebUI.unpacknotifyData.rows.length; i++)
		{
			var row = theWebUI.unpacknotifyData.rows[i];
			$('#unpacknotify_rows').append(plugin.getInputRow(row.label, row.url, row.apikey, row.type));
		}
		if (i == 0) {
			$('#unpacknotify_rows').append(plugin.getDefaultInputRow());
		}
		if (!enabled)
		{
			plugin.disable();
		}
		plugin.addAndShowSettings.call(theWebUI,arg);
	}

	theWebUI.unpackWasChanged = function()
	{
		return(
			($('#unpacknotify_enabled').prop('checked') != (theWebUI.unpacknotifyData.enabled == 1 ))
			|| plugin.rowsToPostString(plugin.domToRows()) != plugin.rowsToPostString(theWebUI.unpacknotifyData.rows)
		);
	}

	plugin.setSettings = theWebUI.setSettings;
	theWebUI.setSettings = function()
	{
		plugin.setSettings.call(this);
		if( plugin.enabled && this.unpackWasChanged() )
			this.request( "?action=setunpacknotify" );
	}

	rTorrentStub.prototype.setunpacknotify = function()
	{
		this.content = "cmd=set&unpacknotify_enabled=" + ( $('#unpacknotify_enabled').prop('checked') ? '1' : '0' );
		this.content += plugin.rowsToPostString(plugin.domToRows());
		this.contentType = "application/x-www-form-urlencoded";
		this.mountPoint = "plugins/unpacknotify/action.php";
		this.dataType = "script";
	}
}

plugin.onLangLoaded = function()
{
	plugin.rowCount = 0;
	var addButton = $('<button class="upnAdd">'+theUILang.unpacknotifyAdd+'</button>').click(function (e){
		e.preventDefault();
		$('#unpacknotify_rows').append(plugin.getDefaultInputRow());
	});
	var enableToggle = $('<input id="unpacknotify_enabled" type="checkbox"/>').change(function(e)
	{
		if ($(this).prop('checked'))
		{
			plugin.enable();
		}
		else
		{
			plugin.disable();
		}
	});

	var thesettingsdiv = $('<div/>').attr('id','st_unpacknotify');
	thesettingsdiv.append($('<div/>').
		append(enableToggle).
		append($('<label for="unpacknotify_enabled">'+theUILang.unpacknotifyEnabled+'</label>')).
		append($('<p>').text(theUILang.unpacknotifyHelp))
	);
	thesettingsdiv.append($('<div/>').attr('id', 'unpacknotify_dta').
		append($("<div/>").attr('id', 'unpacknotify_rows')).
		append($("<div/>").append(addButton)
	));

	plugin.attachPageToOptions( thesettingsdiv[0], theUILang.unpacknotifyPanelName );

	plugin.markLoaded();
}

plugin.onRemove = function()
{
	plugin.removePageFromOptions("st_unpacknotify");
}

plugin.langLoaded = function()
{
	if(plugin.enabled)
		plugin.onLangLoaded();
}

plugin.getInputRow = function(labelRegex, url, apikey, selectedType)
{
	var rowNumber = plugin.rowCount++;
	var removeButton = $('<button class="unpacknotify__delete-button">X</button>').click(function (e){
		e.preventDefault();
		$('#' + plugin.rowId(rowNumber)).remove();
	});
	var fieldset = $('<fieldset>').append(removeButton);
	var types = theWebUI.unpacknotifyData.types;
	var typeSelect = $('<select name="unpacknotify_type[]" id="unpacknotify_type_'+rowNumber+'" />');
	for (var i = 0; i < types.length; i++)
	{
		var option = $('<option>').attr('value', types[i]).text(theUILang.unpacknotifyTypes[types[i]]);
		if (types[i] == selectedType) {
			option.attr('selected', 'selected');
		}
		typeSelect.append(option);
	}
	fieldset.append($('<div/>').html(
		'<label for="unpacknotify_type_'+rowNumber+'">'+
			theUILang.unpacknotifyType+
		'</label>'
	).append(typeSelect));

	fieldset.append($('<div/>').html(
		'<label for="unpacknotify_label_'+rowNumber+'">'+
			theUILang.unpacknotifyLabelRexex+
		'</label>'+
		'<input type="text" name="unpacknotify_label[]" id="unpacknotify_label_'+rowNumber+'" value="'+labelRegex+'" />'
	));
	fieldset.append($('<div/>').html(
		'<label for="unpacknotify_url_'+rowNumber+'">'+
			theUILang.unpacknotifyUrl+
		'</label>'+
		'<input type="text" name="unpacknotify_url[]" id="unpacknotify_url_' + rowNumber + '" value="'+url+'" />'
	));
	fieldset.append($('<div/>').html(
		'<label for="unpacknotify_apikey_'+rowNumber+'">'+
		theUILang.unpacknotifyApiKey+
		'</label>'+
		'<input type="text" name="unpacknotify_apikey[]" id="unpacknotify_apikey_' + rowNumber + '" value="'+apikey+'" />'
	));
	return $("<div/>").attr("id", plugin.rowId(rowNumber)).attr('class', 'unpacknotify__row').append(fieldset);
}

plugin.getDefaultInputRow = function()
{
	return plugin.getInputRow('/.*/', 'http://localhost:8989/api/command', '', null);
}

plugin.disable = function()
{
	$('#unpacknotify_dta').find('input, button,select').attr('disabled', true);
	$('#unpacknotify_dta').find('label').addClass('disabled');
}

plugin.enable = function()
{
	$('#unpacknotify_dta').find('input,button,select').attr('disabled', false);
	$('#unpacknotify_dta').find('label').removeClass('disabled');
}

plugin.rowId= function(rowNumber)
{
	return 'unpacknotify_row_' + rowNumber;
}

plugin.domToRows = function()
{
	var types = [];
	$('#unpacknotify_rows').find('select[name="unpacknotify_type[]"]').each(function(e){
		types.push($(this).val());
	});
	var labels = [];
	$('#unpacknotify_rows').find('input[name="unpacknotify_label[]"]').each(function(e){
		labels.push($(this).val());
	});
	var urls = [];
	$('#unpacknotify_rows').find('input[name="unpacknotify_url[]"]').each(function(e){
		urls.push($(this).val());
	});
	var apikeys = [];
	$('#unpacknotify_rows').find('input[name="unpacknotify_apikey[]"]').each(function(e){
		apikeys.push($(this).val());
	});
	var rows = [];
	for (var i = 0; i < labels.length; i++) {
		if (labels[i] && urls[i] && apikeys[i] && types[i]) {
			rows.push({label: labels[i], url: urls[i], apikey: apikeys[i], type: types[i]});
		}
	}
	return rows;
}

plugin.rowsToPostString = function(rows)
{
	var postString = '';
	for (var i = 0; i < rows.length; i++) {
		postString += '&unpacknotify_label_' + i + '=' + encodeURIComponent(rows[i].label);
		postString += '&unpacknotify_url_' + i + '=' + encodeURIComponent(rows[i].url);
		postString += '&unpacknotify_apikey_' + i + '=' + encodeURIComponent(rows[i].apikey);
		postString += '&unpacknotify_type_' + i + '=' + encodeURIComponent(rows[i].type);
	}
	return postString;
}

