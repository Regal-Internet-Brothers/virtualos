
/*
	META:
		Native 'Storage' format: String
		Native 'Storage' object: 'localStorage'
*/

// Constant variable(s):

// File-type macros:
var FILETYPE_NONE = 0;
var FILETYPE_FILE = 1;
var FILETYPE_DIR = 2;

// File-time macro(s):
var FILETIME_NONE = 0; // -1

// Internal:

// Accessor symbols:
var __os_filesystem_type_symbol = "||__os_filesystem_type||";
var __os_filesystem_time_map_symbol = "||__os_filesystem_time_map||";
var __os_filesystem_time_map_toggle_symbol = "||__os_filesystem_time_map_toggle||"

// Content symbols:
var __os_directory_symbol = "||DIR||"; // "//"
var __os_remoteFile_symbol = "||REMOTE||"; // "/|E"

// File-system types:
var FILESYSTEM_ENCODING_STRING = 0;
var FILESYSTEM_ENCODING_BASE64 = 1;

/*
	Due to the limitations of 'Storage' objects, 'ArrayBuffer' objects
	may not be used with the file APIs. In other words, they can only
	be used with custom containers. Since this is the case, multi-session
	storage is unavailable for this representation.
*/

var FILESYSTEM_ENCODING_ARRAYBUFFER = 2;

// This acts as the default encoding scheme for file-systems.
var FILESYSTEM_ENCODING_DEFAULT = FILESYSTEM_ENCODING_STRING; // FILESYSTEM_ENCODING_ARRAYBUFFER // FILESYSTEM_ENCODING_BASE64;

// Global variable(s):

// This is used to force re-downloads of remote files.
var __os_badcache = false;

// This holds this document's loaded URIs. For details, see: '__os_allocateResource'.
var __os_resources = {};

// This is used to generate handles to resources.
var __os_resource_generator = window.URL || window.webkitURL;

// If enabled, this will keep track of invalid remote paths.
var __os_should_log_remote_file_responses = true;

// This stores remote file-responses if '__os_should_log_remote_file_responses' is enabled.
// This has no long-term storage guarantee.
var __os_remote_file_responses = {};

/*
	A path-map of known file-times.
	Ideally, this should be loaded before use.
	For details, see: '__os_load_filesystem_time_map'.
	
	When you want to store this map for
	storage-defined durations, use '__os_save_filesystem_time_map'.
*/

var __os_filesystem_time_map = {};

// Functions:

// Meta:

// If '__os_should_log_remote_file_responses' is true,
// this will mark 'url' with 'value' using '__os_remote_file_responses'.
function __os_mark_remote_file(url, value)
{
	if (__os_should_log_remote_file_responses)
	{
		__os_remote_file_responses[url] = value;
		
		return true;
	}
	
	// Return the default response.
	return false;
}

// Conversion and storage semantics:

// This retrieves the string-identifier for 'type'.
// These strings are extrapolated from the "FILESYSTEM_ENCODING" constants.
function __os_getEncodingString(type)
{
	switch (type)
	{
		case FILESYSTEM_ENCODING_STRING:
			return "text"; // break;
		case FILESYSTEM_ENCODING_BASE64:
			return ""; // break;
		case FILESYSTEM_ENCODING_ARRAYBUFFER:
			return "arraybuffer"; // break;
	}

	return "";
}

// This does not always produce the same result as
// the input from a call to '__os_getEncodingString'.
// In other words, something that's a string-based format,
// like base64, will be reported as 'FILESYSTEM_ENCODING_STRING'.
function __os_getEncodingTypeFromString(type_str)
{
	switch (type_str)
	{
		case "":
			//return FILESYSTEM_ENCODING_BASE64; // break;
		case "text":
			return FILESYSTEM_ENCODING_STRING; // break;
		case "arraybuffer":
			return FILESYSTEM_ENCODING_ARRAYBUFFER; // break;
	}
}

// This converts 'rawData' from 'inputType' to 'outputType'.
// The I/O types specified are prefixed with "FILESYSTEM_ENCODING".
function __os_smartConvert(rawData, inputType, outputType)
{
	switch (inputType)
	{
		case FILESYSTEM_ENCODING_STRING:
			switch (outputType)
			{
				case FILESYSTEM_ENCODING_STRING:
					return rawData; // break;
				case FILESYSTEM_ENCODING_BASE64:
					return __os_String_To_Base64(rawData); // break;
				case FILESYSTEM_ENCODING_ARRAYBUFFER:
					return __os_String_To_ArrayBuffer(rawData); // break;
			}
		case FILESYSTEM_ENCODING_BASE64:
			switch (outputType)
			{
				case FILESYSTEM_ENCODING_STRING:
					return __os_Base64_To_String(rawData); // break;
				case FILESYSTEM_ENCODING_BASE64:
					return rawData; // break;
				case FILESYSTEM_ENCODING_ARRAYBUFFER:
					return __os_Base64_To_ArrayBuffer(rawData); // break;
			}
		case FILESYSTEM_ENCODING_ARRAYBUFFER:
			switch (outputType)
			{
				case FILESYSTEM_ENCODING_STRING:
					return __os_ArrayBuffer_To_String(rawData); // break;
				case FILESYSTEM_ENCODING_BASE64:
					return __os_ArrayBuffer_To_Base64(rawData); // break;
				case FILESYSTEM_ENCODING_ARRAYBUFFER:
					return rawData; // break;
			}
	}

	return null;
}

// This represents the native encoding scheme for files.
// (DO NOT MODIFY; see '__os_setFileSystemEncoding')
function __os_getFileSystemEncoding()
{
	if (__os_hasFileSystemEncoding())
	{
		// Unfortunately, everything is a string in 'Storage' objects.
		return Number(__os_storage[__os_filesystem_type_symbol]);
	}
	
	var type = FILESYSTEM_ENCODING_DEFAULT;
	
	__os_setFileSystemEncoding(type);

	return type;
}

// This checks if '__os_storage' contains '__os_filesystem_type_symbol'.
function __os_hasFileSystemEncoding()
{
	return __os_storage.hasOwnProperty(__os_filesystem_type_symbol);
}

// Changing this on normal runtime will result in horribly undefined behavior, usually leading to corruption.
// Similarly, do not change this if you're using persistent storage, like 'localStorage'.
// As a rule of thumb, if you're going to call this, do it before anything else.
// If this is not first called, it will be called internally using the default type.
function __os_setFileSystemEncoding(type)
{
	/*
		if (__os_hasFileSystemEncoding())
		{
			return false;
		}
	*/
	
	__os_storage[__os_filesystem_type_symbol] = type;
	
	// Return the default response.
	return true;
}

// This is used to toggle logging of tile-times.
//var __os_log_file_times = true

// This toggles file-time logging with the file-system.
// The return-value indicates if the value was changed or not.
function __os_set_should_log_filesystem_times(value)
{
	__os_storage[__os_filesystem_time_map_toggle_symbol] = Number(value);
	
	return value;
}

// This states if the file-system should log file-times.
function __os_get_should_log_filesystem_times()
{
	if (__os_storage.hasOwnProperty(__os_filesystem_time_map_toggle_symbol))
	{
		return Number(__os_storage[__os_filesystem_time_map_toggle_symbol]);
	}
	
	// Return the default response.
	return true;
}

// This loads the file-system's file-time data from '__os_storage', if available.
function __os_load_filesystem_time_map(keepOnFailure)
{
	var entry = __os_storage[__os_filesystem_time_map_symbol];
	
	if (entry != null)
	{
		__os_filesystem_time_map = JSON.parse(entry);
		__os_set_should_log_filesystem_times(true);
		
		return true;
	}
	
	if (!keepOnFailure)
	{
		__os_filesystem_time_map = {};
	}
	
	return false;
}

// This saves the file-system's file-time data to '__os_storage'.
function __os_save_filesystem_time_map(clearOnSave) // clearOnSave=false
{
	if (Object.keys(__os_filesystem_time_map).length > 0)
	{
		__os_storage[__os_filesystem_time_map_symbol] = JSON.stringify(__os_filesystem_time_map);
		
		if (clearOnSave)
		{
			__os_filesystem_time_map = {};
		}
		
		return true;
	}
	
	// Return the default response.
	return false;
}

function __os_enableResponseLogging(clear)
{
	__os_should_log_remote_file_responses = true;
	
	if (clear)
	{
		__os_clearLoggedResponses();
	}
}

function __os_disableResponseLogging(clear)
{
	__os_should_log_remote_file_responses = false;
	
	if (clear)
	{
		__os_clearLoggedResponses();
	}
}

function __os_clearLoggedResponses()
{
	__os_remote_file_responses = {};
}

// Abstraction layer:
function __os_nativeSize(nativeData)
{
	switch (__os_getFileSystemEncoding())
	{
		case FILESYSTEM_ENCODING_STRING:
			return nativeData.length;
		case FILESYSTEM_ENCODING_ARRAYBUFFER:
			return nativeData.byteLength;
		case FILESYSTEM_ENCODING_BASE64:
			if (CFG_VIRTUALOS_CARE_ABOUT_SIZES !== undefined)
			{
				// This is horribly slow, but the only way to do this accurately.
				return __os_Native_To_String(nativeData).length;
			}
			
			return nativeData.length;
	}
}

function __os_nativeEmpty()
{
	switch (__os_getFileSystemEncoding())
	{
		case FILESYSTEM_ENCODING_ARRAYBUFFER:
			return null; // new ArrayBuffer();
		case FILESYSTEM_ENCODING_STRING:
		case FILESYSTEM_ENCODING_BASE64:
			return "";
	}
}

function __os_Native_To_String(nativeData)
{
	switch (__os_getFileSystemEncoding())
	{
		case FILESYSTEM_ENCODING_STRING:
			return nativeData;
		case FILESYSTEM_ENCODING_ARRAYBUFFER:
			return __os_ArrayBuffer_To_String(nativeData);
		case FILESYSTEM_ENCODING_BASE64:
			return __os_Base64_To_String(nativeData);
	}
}

function __os_Native_To_ArrayBuffer(nativeData)
{
	switch (__os_getFileSystemEncoding())
	{
		case FILESYSTEM_ENCODING_STRING:
			return __os_String_To_ArrayBuffer(nativeData);
		case FILESYSTEM_ENCODING_ARRAYBUFFER:
			return nativeData;
		case FILESYSTEM_ENCODING_BASE64:
			return __os_Base64_To_ArrayBuffer(nativeData);
	}
}

function __os_Native_To_Base64(nativeData)
{
	switch (__os_getFileSystemEncoding())
	{
		case FILESYSTEM_ENCODING_STRING:
			return __os_String_To_Base64(nativeData);
		case FILESYSTEM_ENCODING_ARRAYBUFFER:
			return __os_ArrayBuffer_To_Base64(nativeData);
		case FILESYSTEM_ENCODING_BASE64:
			return nativeData;
	}
}

function __os_String_To_Native(str)
{
	switch (__os_getFileSystemEncoding())
	{
		case FILESYSTEM_ENCODING_STRING:
			return str;
		case FILESYSTEM_ENCODING_ARRAYBUFFER:
			return __os_String_To_ArrayBuffer(str);
		case FILESYSTEM_ENCODING_BASE64:
			return __os_String_To_Base64(str);
	}
}

function __os_ArrayBuffer_To_Native(rawData)
{
	switch (__os_getFileSystemEncoding())
	{
		case FILESYSTEM_ENCODING_STRING:
			return __os_ArrayBuffer_To_String(rawData);
		case FILESYSTEM_ENCODING_ARRAYBUFFER:
			return rawData;
		case FILESYSTEM_ENCODING_BASE64:
			return __os_ArrayBuffer_To_Base64(rawData);
	}
}

function __os_Base64_To_Native(base64)
{
	// Make sure there's no URI header.
	base64 = __os_stripURIHeader(base64);
	
	switch (__os_getFileSystemEncoding())
	{
		case FILESYSTEM_ENCODING_STRING:
			return __os_Base64_To_String(base64);
		case FILESYSTEM_ENCODING_ARRAYBUFFER:
			return __os_Base64_To_ArrayBuffer(base64);
		case FILESYSTEM_ENCODING_BASE64:
			return base64;
	}
}

// Extensions:

function __os__filesystem_inheritParent(parentContext)
{
	__os_storage_is_known_source = parentContext.__os_storage_is_known_source;
	__os_storage_all_sources = parentContext.__os_storage_all_sources;
	
	__os_should_log_remote_file_responses = parentContext.__os_should_log_remote_file_responses;
	__os_remote_file_responses = parentContext.__os_remote_file_responses;
	
	__os_filesystem_time_map = parentContext.__os_filesystem_time_map;
	
	//__os_resource_generator = parentContext.__os_resource_generator;
	//__os_badcache = parentContext.__os_badcache;
}

// This gets the file-time of 'realPath'.
function __os_get_FileTime(realPath)
{
	if (__os_filesystem_time_map.hasOwnProperty(realPath))
	{
		return __os_filesystem_time_map[realPath];
	}
	
	// Return the default response.
	return FILETIME_NONE;
}

// This sets the file-time of 'realPath' using 'time'.
// If the operation could not be performed, and/or
// 'time' is 'FILETIME_NONE', this will return 'false'.
function __os_set_FileTime(realPath, time)
{
	if (time == FILETIME_NONE)
	{
		return false;
	}
	
	/*
		if (!fileTimesEnabled)
		{
			return false;
		}
	*/
	
	__os_filesystem_time_map[realPath] = time;
	
	// Return the default response.
	return true;
}

// This removes a time-data entry from the file-system. (Use at your own risk)
function __os_remove_FileTime(realPath)
{
	delete __os_filesystem_time_map[realPath];
}

// This function is highly unsafe, and should be avoided, unless you know exactly what you're doing.
function __os_clear_FileTimes()
{
	__os_filesystem_time_map = {}
}

// This configures 'xhr' ('XMLHttpRequest') to ensure a proper request is made.
function __os_download_configure_request(xhr, lastTime) // lastTime=null
{
	//xhr.overrideMimeType('text/plain');
	//xhr.overrideMimeType("application/octet-stream");
	xhr.overrideMimeType("text/plain ; charset=x-user-defined");
	
	if (lastTime != null && lastTime != FILETIME_NONE)
	{
		///*
		if (isNaN(lastTime))
		{
			xhr.setRequestHeader("If-None-Match", lastTime);
		}
		else
		//*/
		{
			var date = new Date(lastTime * 1000); // <-- May or may not actually be needed.
			var converted_date = date.toString();
			
			xhr.setRequestHeader("If-Modified-Since", converted_date);
		}
	}
	else
	{
		xhr.setRequestHeader("Cache-Control", "no-cache");
		xhr.setRequestHeader("Pragma", "no-cache");
		xhr.setRequestHeader("If-Modified-Since", "Sat, 1 Jan 2000 00:00:00 GMT");
	}
	
	//xhr.setRequestHeader("Cache-Control", "must-revalidate");
}

// This downloads from 'url', and returns the file's data.
// If no file was found, the return-value is undefined.
function __os_download(url, lastTime, out_ext) // lastTime=null, out_ext=null
{
	var rawData = __os_download_as_string(url, lastTime, out_ext); // __os_download_raw(url, lastTime);
	
	if (rawData == null)
	{
		return null;
	}
	
	return __os_String_To_Native(rawData);
}

function __os_download_as_string(url, lastTime, out_ext) // lastTime=null, out_ext=null
{
	return __os_download_raw(url, lastTime, out_ext);
}

// This returns 'true' if the file at 'url' should be requested.
function __os_download_checkResponse(url)
{
	if (__os_should_log_remote_file_responses)
	{
		if (__os_remote_file_responses.hasOwnProperty(url))
		{
			if (__os_badcache)
			{
				delete __os_remote_file_responses[url];
			}
			else
			{
				if (!__os_remote_file_responses[url])
				{
					return false;
				}
			}
		}
	}

	return true;
}

// This reads information from a finished 'XMLHttpRequest', and places it into 'out_ext'.
function __os_download_buildExtData(xhr, out_ext)
{
	var lastModified = xhr.getResponseHeader("Last-Modified");
	
	if (lastModified)
	{
		out_ext.push(Date.parse(lastModified));
	}
	else
	{
		var eTag = xhr.getResponseHeader("ETag");
		
		if (eTag)
		{
			var value = eTag.replace(/['"']+/g, "");
			
			if (isNaN(value))
			{
				out_ext.push(value);
			}
			else
			{
				var ivalue = Number(value);
				
				out_ext.push(ivalue);
			}
		}
		else
		{
			out_ext.push(FILETIME_NONE);
		}
	}
}

// This makes a request to download.
function __os_download_async(url, encodeType, callback, lastTime) // lastTime=null
{
	// Check if we should bother downloading:
	if (!__os_download_checkResponse(url))
	{
		callback(url, encodeType, null, null, null);

		return;
	}

	// This represents a string used to request data from a remote server. (String)
	// Basically, we're converting from the numeric format.
	var outputType = __os_getEncodingString(encodeType);

	// Allocate a request-object.
	var xhr = new XMLHttpRequest();

	// Start building an HTTP request:
	xhr.open("GET", url);

	// Configure our request appropriately.
	__os_download_configure_request(xhr, lastTime);

	// Set the type of response we want.
	xhr.responseType = outputType;

	// Set a function to handle the result:
	xhr.onreadystatechange = function ()
	{
		// Local variable(s):

		// This will act as a handle to our output-data.
		var data = null;

		// This is used to load extended data from the request.
		var out_ext = [];

		// Build 'out_ext' from the contents of 'xhr'.
		__os_download_buildExtData(xhr, out_ext);

		// Perform tasks based on the HTTP response-code:
		switch (xhr.status)
		{
			// Success:
			case 0:
			case 200:
				// Convert the output to the format we requested originally.
				data = __os_smartConvert(xhr.response, __os_getEncodingTypeFromString(outputType), encodeType);
			// Cache intervention / final behavior:
			case 304:
				// In all cases, make sure the remote file is marked.
				__os_mark_remote_file(url, true);

				break;
		}

		// Tell the caller what's going on.
		callback(url, encodeType, data, xhr, out_ext);
	}

	// Start the asynchronous request.
	xhr.send();
}

/*
	This requests a file from the remote server described in 'url'.

	This is completely synchronous, and will therefore halt execution.
	
	The 'lastTime' argument is used to represent a previous request.
	
	The 'out_ext' argument is an optional array that may
	be filled with information regarding file-versions.

	This is useful for secondary requests, as you can pass
	the result of 'out_ext' as 'lastTime'.
*/

function __os_download_raw(url, lastTime, out_ext) // lastTime=null, out_ext=null
{
	// Check if we should bother downloading:
	if (!__os_download_checkResponse(url))
	{
		return null;
	}
	
	// Allocate a request-object.
	var xhr = new XMLHttpRequest();
	
	try
	{
		// Initialize our request:
		xhr.open("GET", url, false); // "HEAD"
		
		// Configure our request appropriately.
		__os_download_configure_request(xhr, lastTime);
		
		// Send the request synchronously.
		xhr.send(null);
		
		// Check if 'out_ext' was provided:
		if (out_ext !== undefined)
		{
			__os_download_buildExtData(xhr, out_ext);
		}
		
		switch (xhr.status)
		{
			case 304:
				__os_mark_remote_file(url, true);
				
				return null;
			case 0:
			case 200:
				__os_mark_remote_file(url, true);
				
				return xhr.responseText; break; // xhr.response;
		}
	}
	catch (ex)
	{
		// Nothing so far.
	}
	
	// If this point was reached, the request was a total failure.

	// Check if our cache is valid:
	if (!__os_badcache)
	{
		// Log this failure for future optimization.
		__os_mark_remote_file(url, false);
	}
}

// This downloads a file from 'url' and represents it with 'rep'.
function __os_downloadFileUsingRep(storage, url, rep, isEmpty) // isEmpty=false
{
	var repValue = storage[rep];
	
	if
	(
		(((isEmpty || repValue == __os_remoteFile_symbol) || repValue == null) && __os_should_log_remote_file_responses && !__os_remote_file_responses.hasOwnProperty(url))
		||
		(__os_badcache)
	)
	{
		var fileTimesEnabled = __os_get_should_log_filesystem_times();
		
		var data;
		
		if (fileTimesEnabled)
		{
			var out = [];
			var currentFileTime = __os_get_FileTime(rep);
			
			data = __os_download(url, currentFileTime, out);
			
			if (data != null)
			{
				if (out.length > 0)
				{
					if (out[0] != FILETIME_NONE)
					{
						__os_set_FileTime(rep, out[0]);
					}
				}
			}
		}
		else
		{
			data = __os_download(url);
		}
		
		// Make sure we have data to work with:
		if (data != null)
		{
			// Build a file-entry for this element.
			if (__os_createFileEntryWith(storage, rep, data, true)) // false
			{
				// Return the raw data we loaded.
				return data;
			}
		}
	}
	
	return repValue;
}

// This converts 'realPath' into a url, and represents the enclosed data with 'realPath'. (Calls 'downloadFileFrom')
function __os_downloadFile(storage, realPath, isEmpty) // isEmpty=false
{
	return __os_downloadFileUsingRep(storage, __os_toRemotePath(realPath), realPath, isEmpty);
}

function __os_LoadNative(realPath)
{
	var out = __os_getFile(realPath);
	
	if (out == __os_directory_symbol)
	{
		return null;
	}
	
	return out;
}

// This checks if a file at 'realPath' could exist in the current virtual file-system.
function __os_fileCouldExist(realPath, checkType)
{
	// Since we don't have an entry, check this file's parent directory.
	// If it exists, then we know it could be a valid file.
	if (__os_storageLookup(realPath.substring(0, realPath.lastIndexOf("/"))) != null)
	{
		if (checkType)
		{
			if (!__os_testSupportedFiles(realPath.toLowerCase()))
			{
				return false;
			}
		}
		
		return true;
	}
	
	return false;
}

// This checks if any of the 'types' specified match 'lCasePath'. (Used internally)
function __os_supportedFile(lCasePath, data)
{
	var types = data.split("|");
	
	var extensionSeparator = ".";
	
	for (var i = 0; i < types.length; i++)
	{
		var fileType = types[i];
		var separatorPos = fileType.lastIndexOf(extensionSeparator);
		
		if (separatorPos == -1)
		{
			continue;
		}
		
		fileType = fileType.substring(separatorPos).toLowerCase(); // ..
		
		if (lCasePath.endsWith(fileType))
		{
			return fileType.substring(1); // .. // true;
		}
	}
	
	// Return the default response.
	return null; // false;
}

// This checks if any of the pre-defined supported file-types match 'lCasePath'. (Used internally)
function __os_testSupportedFiles(lCasePath)
{
	// Currently pre-determined types; may be changed later:
	if (__os_supportedFile(lCasePath, CFG_IMAGE_FILES)) return true;
	if (__os_supportedFile(lCasePath, CFG_TEXT_FILES)) return true;
	if (__os_supportedFile(lCasePath, CFG_BINARY_FILES)) return true;
	if (__os_supportedFile(lCasePath, CFG_SOUND_FILES)) return true;
	if (__os_supportedFile(lCasePath, CFG_MUSIC_FILES)) return true;
	
	// Return the default response.
	return false;
}

// This checks if the file at 'realPath' is stored or not.
function __os_storageLookup(realPath)
{
	var cs = __os_storage[realPath];
	
	if (cs != null)
	{
		return cs;
	}
	
	if (__os_storage_all_sources)
	{
		if (sessionStorage != __os_storage)
		{
			var ss = sessionStorage[realPath];
			
			if (ss != null)
			{
				return ss;
			}
		}
		
		if (localStorage != __os_storage)
		{
			var ls = localStorage[realPath];
			
			if (ls != null)
			{
				return ls;
			}
		}
	}
}

function __os_createFileEntryWith(storage, rep, data, force) //force=false
{
	var currentEntry = storage[rep];
	
	if (force || (!__os_safe || currentEntry == null || currentEntry == __os_remoteFile_symbol || currentEntry == __os_nativeEmpty()))
	{
		storage[rep] = data;
		
		return true;
	}
	
	// Return the default response.
	return false;
}

function __os_createFileEntry(rep, data, isDir, force)
{
	return __os_createFileEntryWith(__os_storage, rep, data, force);
}

// This creates a "file link". "File links" are basically 'to-be-loaded'
// symbols, that the file-system uses to reduce ahead-of-time requests.
// This command is abstract from the underlying storage system.
function __os_createFileLink(rep)
{
	return __os_createFileEntry(rep, __os_remoteFile_symbol, false);
}

// This gets a file using 'realPath' from a remote host.
// If this is already present in some kind of storage, it uses the cache.
function __os_getFile(realPath, isEmpty)
{
	var f = __os_storageLookup(realPath);
	
	if (f == null || isEmpty != null || (isEmpty = (f == __os_remoteFile_symbol))) // Set 'isEmpty', and check it.
	{
		return __os_downloadFile(__os_storage, realPath, isEmpty);
	}
	
	return f;
}

// This calls '__os_deleteFileEntries' with recursion enabled. (For safety)
function __os_safelyDeleteFileEntries(realPath, isDir)
{
	return __os_deleteFileEntries(realPath, isDir, true);
}

function __os_deleteFileEntries(realPath, isDir, recursive) // isDir=false, recursive=false
{
	var response = false;
	
	var cs = __os_storage[realPath];
	
	if (cs != null)
	{
		response |= __os_removeStorageEntry(__os_storage, realPath, isDir, recursive, cs);
	}
	
	if (__os_storage_all_sources)
	{
		if (sessionStorage != __os_storage)
		{
			// Test for 'realPath', and if found, remove the element(s):
			var ss = sessionStorage[realPath];
			
			if (ss != null)
			{
				response |= __os_removeStorageEntry(sessionStorage, realPath, isDir, recursive, ss); // =
			}
		}
		
		if (localStorage != __os_storage)
		{
			var ls = localStorage[realPath];
			
			if (ls != null)
			{
				response |= __os_removeStorageEntry(localStorage, realPath, isDir, recursive, ls);
			}
		}
	}
	
	return response;
}

// This is used to remove an entry from a specific source. For a properly abstracted routine, use '__os_deleteFileEntries'.
// This returns 'false' if this is not a directory, and the element could not be deleted (Doesn't exist).
function __os_removeStorageEntry(storage, realPath, isDir, recursive, value) // isDir=undefined, recursive=false, value=null
{
	var response = false;
	
	if (value === undefined)
	{
		value = storage[realPath];
	}
	
	if (value != null)
	{
		if (typeof storage.removeItem === "function")
		{
			storage.removeItem(realPath);
		}
		else
		{
			delete storage[realPath];
		}
		
		if (isDir === undefined && value == __os_directory_symbol)
		{
			isDir = true;
		}
		
		if (!isDir)
		{
			__os_remove_FileTime(realPath);
		}
		
		response = true;
	}
	
	if (isDir)
	{
		for (var e in storage)
		{
			if (e.indexOf(realPath) == 0)
			{
				var lastSlash = e.lastIndexOf("/");
				
				// Remove only what we need to: If we're doing this
				// recursively, delete everything, but if not,
				// make sure this isn't a sub-directory:
				if ((recursive || lastSlash < realPath.length))
				{
					__os_removeStorageEntry(storage, e, undefined, recursive); // 'isDir' may need to be calculated later.
				}
			}
		}
		
		response = true;
	}
	
	return response;
}

// This removes all elements in 'storage' that start with 'prefix'. (Use at your own risk)
function __os_eliminateByPrefix(storage, prefix)
{
	for (var e in storage)
	{
		if (e.indexOf(prefix) == 0)
		{
			var lastSlash = e.lastIndexOf("/");
			
			if (lastSlash < prefix.length)
			{
				__os_removeStorageEntry(storage, e, undefined, true);
			}
		}
	}
}

// This function removes all entries in '__os_storage'
// relating to the file-system and global symbols. This means
// local content will be removed forever, and may make behavior unstable.
// Only use this if you intend to wipe everything clean.
function __os_eliminateAll()
{
	// Safely remove the file-system instance (Including meta-symbols):
	__os_eliminateByPrefix(__os_storage, RealPath(""));
	__os_eliminateByPrefix(__os_storage, __os_symbol_prefix);
}

// This executes '__os_eliminateAll' if '__os_getVersion' is not compatible,
// or otherwise problematic. Use this function only if you intend to start
// a clean slate. This function reserves the right to patch
// '__os_storage', rather than clear it (When profitable).
function __os_eliminateAll_OnDifferentVersion()
{
	// For now, just check a difference in version number:
	if (__os_getVersion() != __os_default_version)
	{
		__os_eliminateAll();
	}
}

// This attempts to produce a valid MIME-type for 'path'.
function __os_get_MIMEType(realPath, fallback) //fallback=false
{
	var blobType;
	
	extPos = realPath.lastIndexOf(".");
	
	if (extPos != -1)
	{
		fullExt = realPath.substring(extPos).toLowerCase(); // ..
		ext = fullExt.substring(1); // ..
	}
	else // if (ext == null)
	{
		if (fallback)
		{
			// If nothing else could be done, assume PNG:
			fullExt = ".png";
			ext = "png"; // fullExt.substring(1); // ..
		}
		else
		{
			return null;
		}
	}
	
	if (__os_supportedFile(fullExt, CFG_IMAGE_FILES))
	{
		blobType = ("image/" + ext);
	}
	else
	{
		if (__os_supportedFile(fullExt, CFG_TEXT_FILES))
		{
			blobType = "text/plain ; charset=x-user-defined"; // "text/plain";
		}
		else
		{
			if (__os_supportedFile(fullExt, CFG_BINARY_FILES))
			{
				blobType = "text/plain ; charset=x-user-defined"; // "application/octet-stream";
			}
			else
			{
				if (__os_supportedFile(fullExt, CFG_SOUND_FILES) || __os_supportedFile(fullExt, CFG_MUSIC_FILES))
				{
					blobType = "audio/";
					
					switch (ext)
					{
						case "mp3":
						case "mpeg3":
							blobType += "mpeg3";
							
							break;
						//case "wav":
						//case "ogg":
						default:
							blobType += ext;
							
							break;
					}
				}
			}
		}
	}
	
	return blobType;
}

// This looks 'realPath' up internally, and if present, generates a URI for that resource.
// This is useful for frameworks like Mojo, which normally require server-side storage mechanics.
function __os_allocateResource(realPath, fallback) //fallback=false
{
	var f = __os_storageLookup(realPath);
	
	if (f == null)
	{
		return null;
	}
	
	if (__os_resources[realPath] != null)
	{
		return __os_resources[realPath];
	}
	
	// Resolve the file-extension:
	var extPos, fullExt, ext;
	
	// Build the resource:
	var blobType = __os_get_MIMEType(realPath, fallback);
	
	if (blobType == null)
	{
		return null;
	}
	
	var rawData = __os_Native_To_ArrayBuffer(f);
	var blob = new Blob([rawData], { type: blobType });
	
	var uri = __os_obtainResource(blob);
	
	__os_resources[realPath] = uri;
	
	//__os_deallocateResource(..);
	
	return uri;
}

// This command is considered unsafe, and should only be used under controlled environments.
// The behavior of the symbolized resource is undefined after calling this.
// The 'keepEntry' argument should only be 'true' when destructing all of '__os_resources'.
function __os_deallocateResource(realPath, keepEntry) // keepEntry=false
{
	var uri = __os_resources[realPath];
	__os_revokeResource(uri);
	
	if (!keepEntry)
	{
		delete __os_resources[realPath];
	}
	
	return true;
}

// These two commands obtain and revoke/release system-resources:

// Calling this is considered unsafe, and therefore should not be
// used in conjunction with automatic resource management.
// For that, you should use '__os_allocateResource', instead.
function __os_obtainResource(blob)
{
	return __os_resource_generator.createObjectURL(blob);
}

// Calling this is considered unsafe, and therefore should not be
// used in conjunction with automatic resource management.
// For that, you should use '__os_deallocateResource', instead.
function __os_revokeResource(uri)
{
	__os_resource_generator.revokeObjectURL(uri);
}

// This is considered highly unsafe, and should only
// be used when completely sure of the consequences.
function __os_destroyResources()
{
	for (var resource in __os_resources)
	{
		__os_deallocateResource(resource, true);
	}
	
	__os_resources = {};
}

// This loads all files and folders in 'realPath' specifically.
// In other words, this isn't recursive.
function __os_loadFileStructure(realPath, storage, out)
{
	for (var key in storage)
	{
		var parentPos = key.indexOf(realPath);
		
		//if (key.startsWith(..))
		if (parentPos == 0)
		{
			var subdir = key.lastIndexOf("/");
			
			if ((realPath.length) == subdir)
			{
				out.push(key.substring(subdir+1));
			}
		}
	}
}

// API:

// The "real" (Local) path of 'f'.
function RealPath(path)
{
	if (path.indexOf("/") == 0)
	{
		// Nothing so far.
	}
	else
	{
		var currentDirectory = CurrentDir();
		
		var x = currentDirectory;
		
		if (x.indexOf("/") == 0) // if (!path.startsWith("/"))
		{
			x = __os_globalDir() + x;
		}
		else
		{
			x = __os_globalDir() + "/" + x;
		}
		
		if ((currentDirectory.length != 0)) // && (x.lastIndexOf("/") != (currentDirectory.length-1))
		{
			x += "/";
		}
		
		if (path.indexOf(x) != 0)
		{
			path = (x + path);
		}
	}
	
	var result = __os_fixDir(path);
	
	return result;
}

// This attempts to recognize the "file-type" of 'path'. (Uses supported files)
function FileType(path, skip_request) //skip_request=false
{
	var realPath = RealPath(path);
	
	// Grab the local entry, if any:
	var file = __os_storageLookup(realPath);
	
	var isEmpty;
	
	if (!skip_request)
	{
		// Check if we don't have an entry to view:
		if (file == null || (isEmpty = (file == __os_remoteFile_symbol))) // Set 'isEmpty', and check it.
		{
			// Check if we could load this file using the current file-system:
			if (isEmpty || __os_fileCouldExist(realPath))
			{
				// Try to load our file from the server.
				file = __os_getFile(realPath, isEmpty);
			}
		}
	}
	
	if (file != null)
	{
		//if (__os_testSupportedFiles(realPath.toLowerCase()))
		if (file != __os_directory_symbol)
		{
			return FILETYPE_FILE;
		}
		else
		{
			return FILETYPE_DIR;
		}
	}
	
	return FILETYPE_NONE;
}

function FileTime(path)
{
	var rpath = RealPath(path);
	
	return __os_get_FileTime(rpath);
}

function FileSize(path)
{
	var rpath = RealPath(path);
	var f = __os_downloadFile(__os_storage, rpath);
	
	if (f == null || f == __os_directory_symbol)
	{
		return 0; // -1;
	}
	
	return __os_nativeSize(f);
}

function CopyFile(src, dst)
{
	var rsrc = RealPath(src);
	var f = __os_downloadFile(__os_storage, rsrc); //__os_storageLookup(rsrc);
	
	if (f == null)
	{
		return false;
	}
	
	var rdst = RealPath(dst);
	
	if (!__os_createFileEntry(rdst, f))
	{
		return false;
	}
	
	// Update this entry's file-time.
	__os_set_FileTime(rdst, __os_get_FileTime(rsrc));
	
	// Return the default response.
	return true;
}

function DeleteFile(path)
{
	return __os_deleteFileEntries(RealPath(path));
}

function LoadDir(path)
{
	switch (path)
	{
		default:
			var rp = RealPath(path);
			
			var out = [];
			
			__os_loadFileStructure(rp, __os_storage, out);
			
			if (__os_storage_all_sources)
			{
				if (sessionStorage != __os_storage)
				{
					__os_loadFileStructure(rp, localStorage, out);
				}
				
				if (localStorage != __os_storage)
				{
					__os_loadFileStructure(rp, sessionStorage, out);
				}
			}
			
			return out; break;
	}
	
	return [];
}

function CreateFile(path)
{
	return __os_createFileEntry(RealPath(path), __os_nativeEmpty());
}

function CreateDir(path)
{
	return __os_createFileEntry(RealPath(path), __os_directory_symbol, true);
}

function DeleteDir(path, recursive) // recursive=false
{
	return __os_deleteFileEntries(RealPath(path), true, recursive);
}
