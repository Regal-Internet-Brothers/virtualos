
/*
	META:
		Native 'Storage' format: Base64
		Native 'Storage' object: 'sessionStorage'
*/

// Constant variable(s):

// File-type macros:
var FILETYPE_NONE = 0;
var FILETYPE_FILE = 1;
var FILETYPE_DIR = 2;

// Internal:
var __os_filesystem_type_symbol = "||__os_filesystem_type||";
var __os_directory_symbol = "||DIR||"; // "//"
var __os_emptyFile_symbol = "||EMPTY||"; // "/|E"

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
var FILESYSTEM_ENCODING_DEFAULT = FILESYSTEM_ENCODING_ARRAYBUFFER; // FILESYSTEM_ENCODING_STRING; // FILESYSTEM_ENCODING_BASE64;

// Global variable(s):

// This is used to supply arguments to the application.
var __os_appargs = [];

// This is used to keep track of the current directory.
var __os_currentdir = "";

// This specifies the default storage.
var __os_storage = {}; // sessionStorage; // localStorage;

// This states if '__os_storage' is a known source (Global 'Storage' object).
var __os_storage_is_known_source = false; // true;

// This states if all known sources should be checked when performing abstract file-operations.
// This should only be enabled when using a known source for storage.
var __os_storage_all_sources = __os_storage_is_known_source; // true;

// This holds this document's loaded URIs. For details, see: '__os_allocateResource'.
var __os_resources = {};

// If enabled, this will keep track of invalid remote paths.
var __os_log_failed_remote_paths = true;

// This stores failed paths if '__os_log_failed_remote_paths' is enabled.
var __os_failed_remote_paths = [];

// This is used to force re-downloads of remote files. (Unfinished behavior)
var __os_badcache = false;

// This is used to generate handles to resources.
var __os_resource_generator = window.URL || window.webkitURL;

// Functions:

// Conversion and storage semantics:

// Changing this on normal runtime will result in horribly undefined behavior, usually leading to corruption.
// If you wish to change the internal storage mechanism, do it before anything else.
// Transferral of containers is unsupported, and will need to be handled by the caller.
function __os_setFileSystemContainer(container, disallowMultiSource)
{
	if (container == sessionStorage || container == localStorage)
	{
		__os_storage_is_known_source = true;
	}
	else
	{
		__os_storage_is_known_source = false;
	}
	
	if (disallowMultiSource)
	{
		__os_storage_all_sources = false;
	}
	else
	{
		__os_storage_all_sources = __os_storage_is_known_source;
	}
	
	__os_storage = container;
}

// This just returns '__os_storage'.
function __os_getFileSystemContainer()
{
	return __os_storage;
}

// This represents the native encoding scheme. (DO NOT MODIFY; see '__os_setFileSystemEncoding')
function __os_getFileSystemEncoding()
{
	if (__os_storage.hasOwnProperty(__os_filesystem_type_symbol))
	{
		// Unfortunately, everything is a string in 'Storage' objects.
		return Number(__os_storage[__os_filesystem_type_symbol]);
	}
	
	var type = FILESYSTEM_ENCODING_DEFAULT;
	
	__os_setFileSystemEncoding(type);
	
	return type;
}

// Changing this on normal runtime will result in horribly undefined behavior, usually leading to corruption.
// Similarly, do not change this if you're using persistent storage, like 'localStorage'.
// As a rule of thumb, if you're going to call this, do it before anything else.
// If this is not first called, it will be called internally using the default type.
function __os_setFileSystemEncoding(type)
{
	__os_storage[__os_filesystem_type_symbol] = type;
}

function __os_enableResponseLogging(clear)
{
	__os_log_failed_remote_paths = true;
	
	if (clear)
	{
		__os_clearLoggedResponses();
	}
}

function __os_disableResponseLogging(clear)
{
	__os_log_failed_remote_paths = false;
	
	if (clear)
	{
		__os_clearLoggedResponses();
	}
}

function __os_clearLoggedResponses()
{
	__os_failed_remote_paths = [];
}

// Implementation-level:
function __os_ArrayBuffer_To_String(rawData, chunk_size)
{
	if (rawData == null)
	{
		return null;
	}
	
	//return String.fromCharCode.apply(null, new Uint8Array(rawData));
	
	if (chunk_size == null)
	{
		chunk_size = 1024;
	}
	
	var content = new String();
	
	var bytesLeft = rawData.byteLength;
	var offset = 0;
	
	while (bytesLeft > 0)
	{
		var cycleSize = Math.min(bytesLeft, chunk_size);
		var dataView = new Uint8Array(rawData, offset, cycleSize);
		
		content += String.fromCharCode.apply(null, dataView);
		
		bytesLeft -= cycleSize;
		offset += cycleSize;
	}
	
	return content;
}

function __os_String_To_ArrayBuffer(fileData)
{
	if (fileData == null)
	{
		return null;
	}
	
	var buf = new ArrayBuffer(fileData.length);
	var bufView = new Uint8Array(buf);
	
	for (var i = 0, strLen = fileData.length; i < strLen; i++)
	{
		bufView[i] = (fileData.charCodeAt(i)); // [i] // & 0xFF;
	}
	
	return buf;
}

function __os_Base64_To_String(base64)
{
	if (base64 == null)
	{
		return null;
	}
	
	var x = atob(base64);
	var y = escape(x);
	
	try
	{
		return decodeURIComponent(y); // window.atob(..);
	}
	catch (ex)
	{
		return x; // y;
	}
}

function __os_String_To_Base64(str)
{
	if (str == null)
	{
		return null;
	}
	
	try
	{
		return btoa(str); // window.btoa(..);
	}
	catch (ex)
	{
		var a = encodeURIComponent(str);
		var b = unescape(a);
		
		return btoa(b); // window.btoa(..);
	}
}

// Redirection-level:
function __os_Base64_To_ArrayBuffer(base64)
{
	if (base64 == null)
	{
		return null;
	}
	
	return __os_String_To_ArrayBuffer(__os_Base64_To_String(base64)); // atob(base64);
}

function __os_ArrayBuffer_To_Base64(rawData)
{
	if (rawData == null)
	{
		return null;
	}
	
	return __os_String_To_Base64(__os_ArrayBuffer_To_String(rawData));
}

// Abstraction layer:
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

// This "strips" the URI header (If present) from 'base64'.
function __os_stripURIHeader(base64)
{
	//return base64;
	
	var clipPoint = base64.indexOf(",");
	
	if (clipPoint != -1)
	{
		return base64.substring(clipPoint+1); // ..
	}
	
	return base64;
}

// Extensions:

// This copies the global 'os' context of the 'parent' environment.
function __os_inheritParent()
{
	//__os_appargs = parent.__os_appargs.slice();
	__os_currentdir = parent.__os_currentdir;
	__os_storage = parent.__os_storage;
	
	//__os_badcache = parent.__os_badcache;
}

function __os_setAppArgs(args)
{
	__os_appargs = args
}

// This DOES NOT call 'RealPath', please call that first.
// If 'RealPath' is not called first, please understand the effects (Invalid global directory).
function __os_toRemotePath(realPath)
{
	var url = window.location.href; // document.URL;
	
	var start = url.indexOf("//");
	
	if (start == -1)
	{
		start = 0;
	}
	else
	{
		start += 2;
	}
	
	var output = url.substring(0, url.indexOf("/", start));
	
	if (realPath.indexOf("/") != 0)
	{
		output += "/";
	}
	
	return (output + realPath);
}

/*
	// This is a hack, as we currently retrieve a string anyway, but this is future-proof:
	function __os_download_as_string(url)
	{
		var nativeData = __os_download(url);
		
		if (nativeData == null)
		{
			return null;
		}
		
		return __os_Native_To_String(nativeData);
	}
*/

// This downloads from 'url', and returns the file's data.
// If no file was found, the return-value is undefined.
function __os_download(url)
{
	var rawData = __os_download_as_string(url); // __os_download_raw(url);
	
	if (rawData == null)
	{
		return null;
	}
	
	return __os_String_To_Native(rawData);
}

function __os_download_as_string(url)
{
	return __os_download_raw(url);
}

function __os_download_raw(url)
{
	if (__os_log_failed_remote_paths)
	{
		var urlPos = __os_failed_remote_paths.indexOf(url);
		
		if (urlPos != -1)
		{
			if (__os_badcache)
			{
				__os_failed_remote_paths.splice(urlPos, 1);
			}
			else
			{
				return null;
			}
		}
	}
	
	var xhr = new XMLHttpRequest();
	
	try
	{
		xhr.open("GET", url, false); // "HEAD"
		//xhr.responseType = "arraybuffer";
		
		// For now, we don't care about file updates.
		// This is something to look into later:
		//xhr.overrideMimeType('text/plain');
		//xhr.overrideMimeType("application/octet-stream");
		xhr.overrideMimeType("text/plain ; charset=x-user-defined");
		xhr.setRequestHeader("Cache-Control", "no-cache");
		xhr.setRequestHeader("Pragma", "no-cache");
		xhr.setRequestHeader("If-Modified-Since", "Sat, 1 Jan 2000 00:00:00 GMT");
		//xhr.setRequestHeader("Cache-Control", "must-revalidate");
		
		xhr.send(null);
		
		switch (xhr.status)
		{
			case 0:
			case 304:
			case 200:
				return xhr.responseText; // xhr.response;
				
				break;
		}
	}
	catch (ex)
	{
		// Nothing so far.
	}
	
	if (!__os_badcache && __os_log_failed_remote_paths)
	{
		__os_failed_remote_paths.push(url);
	}
}

// This downloads a file from 'url' and represents it with 'rep'.
function __os_downloadFileUsingRep(storage, url, rep, isEmpty) // isEmpty=false
{
	var repValue = storage[rep];
	
	if (isEmpty || repValue == null || __os_badcache || repValue == __os_emptyFile_symbol) // === undefined
	{
		var data = __os_download(url);
		
		if (data != null)
		{
			__os_createFileEntryWith(storage, rep, data);
		}
		
		return data;
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

// This provides an array of (Signed) 8-bit integers ('Int8Array').
function __os_LoadArray(realPath)
{
	var rawData = __os_Native_To_ArrayBuffer(__os_LoadNative(realPath));
	
	return new Int8Array(rawData);
}

// This specifies if this browser supports native file storage.
function __os_storageSupported()
{
	return (typeof(Storage) !== "undefined"); // true;
}

// This fixes uses of ".." in paths. (Partially unsafe)
function __os_fixDir(exactPath)
{
	var final = exactPath;
	
	while (true)
	{
		var index = final.indexOf("/..");
		
		if (index == -1)
		{
			break;
		}
		
		var x = final.substring(0, index);
		var y = final.substring(0, x.lastIndexOf("/", index));
		var z = y + final.substring(index+3)
		
		final = z;
	}
	
	return final;
}

function __os_globalDir()
{
	var page = window.location.pathname;
	
	var lastSlash = page.lastIndexOf("/");
	
	return page.substring(0, lastSlash); // "data"
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

function __os_createFileEntryWith(storage, rep, data)
{
	storage[rep] = data;
}

function __os_createFileEntry(rep, data, isDir)
{
	__os_createFileEntryWith(__os_storage, rep, data);
}

// This creates a "file link". "File links" are basically 'to-be-loaded'
// symbols, that the file-system uses to reduce ahead-of-time requests.
// This command is abstract from the underlying storage system.
function __os_createFileLink(rep)
{
	__os_createFileEntry(rep, __os_emptyFile_symbol, false);
}

// This gets a file using 'realPath' from a remote host.
// If this is already present in some kind of storage, it uses the cache.
function __os_getFile(realPath, isEmpty)
{
	var f = __os_storageLookup(realPath);
	
	if (f == null || isEmpty != null || (isEmpty = (f == __os_emptyFile_symbol))) // Set 'isEmpty', and check it.
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
		delete storage[realPath];
		
		if (isDir === undefined && value == __os_directory_symbol)
		{
			isDir = true;
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
				var ePath = e.substring(0, lastSlash-1);
				
				// Remove only what we need to: If we're doing this
				// recursively, delete everything, but if not,
				// make sure this isn't a sub-directory:
				if ((recursive || lastSlash < realPath.length))
				{
					__os_removeStorageEntry(storage, ePath, undefined, recursive, e); // 'isDir' may need to be calculated later.
				}
			}
		}
		
		response = true;
	}
	
	return response;
}

// This attempts to produce a valid MIME-type for 'path'.
function __os_getMIMEType(realPath) // ext=undefined
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
function __os_allocateResource(realPath, fallback)
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
	var blobType = __os_getMIMEType(realPath);
	
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
function __os_deallocateResource(realPath)
{
	var uri = __os_resources[realPath];
	__os_revokeResource(uri);
	
	delete __os_resources[realPath];
	
	return true;
}

// These two commands obtain and revoke/release system-resources:

// Calling this is considered unsafe, and therefore should not be used in conjunction with automatic resource management.
// For that, you should use '__os_allocateResource', instead.
function __os_obtainResource(blob)
{
	return __os_resource_generator.createObjectURL(blob);
}

// Calling this is considered unsafe, and therefore should not be used in conjunction with automatic resource management.
// For that, you should use '__os_deallocateResource', instead.
function __os_revokeResource(uri)
{
	__os_resource_generator.revokeObjectURL(uri);
}

// API:

// Used internally; DO NOT change.
function HostOS()
{
	return "web";
}

// The implied path of this program. (Compiler fix)
function AppPath()
{
	var page = window.location.pathname;
	
	var lastSlash = page.lastIndexOf("/");
	
	var x = page.substring(0, Math.max(lastSlash, 1));
	
	if (x != "/" && x.length != 0)
	{
		x += "/"
	}
	
	var result = x + "data/bin/" + page.substring(lastSlash+1);
	
	return result;
	
	//return RealPath("data/bin/MonkeyGame.html"); // window.location.pathname; // __os_globalDir();
}

// The 'AppPath' (Reserved), and any argument supplied by the user.
function AppArgs()
{
	return [AppPath()].concat(__os_appargs);
}

// The "real" (Local) path of 'f'.
function RealPath(path)
{
	if (path.indexOf("/") == 0)
	{
		// Nothing so far.
	}
	else
	{
		var x = __os_currentdir;
		
		if (x.indexOf("/") == 0) // if (!path.startsWith("/"))
		{
			x = __os_globalDir() + x;
		}
		else
		{
			x = __os_globalDir() + "/" + x;
		}
		
		if ((__os_currentdir.length != 0)) // && (x.lastIndexOf("/") != (__os_currentdir.length-1))
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
function FileType(path)
{
	var realPath = RealPath(path);
	
	// Grab the local entry, if any:
	var file = __os_storageLookup(realPath);
	
	var isEmpty;
	
	// Check if we don't have an entry to view:
	if (file == null || (isEmpty = (file == __os_emptyFile_symbol))) // Set 'isEmpty', and check it.
	{
		// Check if we could load this file using the current file-system:
		if (isEmpty || __os_fileCouldExist(realPath))
		{
			// Try to load our file from the server.
			file = __os_getFile(realPath, isEmpty);
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

function FileSize(path)
{
	var rpath = RealPath(path);
	var f = __os_downloadFile(__os_storage, rpath);
	
	if (f == null || f == __os_directory_symbol)
	{
		return 0; // -1;
	}
	
	return f.length;
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
	
	__os_createFileEntry(rdst, f);
	
	// Return the default response.
	return true;
}

function DeleteFile(path)
{
	return __os_deleteFileEntries(RealPath(path));
}

function LoadString(path)
{
	var nativeData = __os_LoadNative(RealPath(path));
	
	if (nativeData != null)
	{
		return __os_Native_To_String(nativeData);
	}
	
	return "";
}

function SaveString(str, path)
{
	__os_createFileEntry(RealPath(path), __os_String_To_Native(str));
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

function CreateDir(path)
{
	__os_createFileEntry(RealPath(path), __os_directory_symbol, true); // <-- Prefix added for debugging purposes.
	
	return true;
}

function DeleteDir(path, recursive) // recursive=false
{
	return __os_deleteFileEntries(RealPath(path), true, recursive);
}

// I'm unsure if this is working 100%, but it helps get transcc running:
function ChangeDir(path)
{
	var realPos = __os_globalDir();
	
	if (path.indexOf(realPos) == 0)
	{
		var newStart = realPos.length;
		
		if (path.indexOf("/") == newStart)
		{
			newStart += 1;
		}
		
		path = path.substring(newStart); // ..
	}
	
	__os_currentdir = path;
	
	var first = __os_currentdir.indexOf("/");
	var second = __os_currentdir.lastIndexOf("/");
	
	// Could be changed to boolean logic:
	if (first == 0)
	{
		first = 1;
	}
	else
	{
		first = 0;
	}
	
	if (second != __os_currentdir.length-1)
	{
		second = __os_currentdir.length;
	}
	
	__os_currentdir = __os_currentdir.substring(first, second);
	
	return __os_currentdir;
}

function CurrentDir()
{
	return __os_currentdir;
}

function Execute(cmd)
{
	if (typeof __exec == 'function')
	{
		__exec(cmd);
	}
}

function ExitApp(retCode)
{
	alert("EXIT: " + retCode);
	
	throw null;
}
