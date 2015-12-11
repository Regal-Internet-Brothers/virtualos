
// Constant variable(s):

// File-type macros:
var FILETYPE_NONE = 0;
var FILETYPE_FILE = 1;
var FILETYPE_DIR = 2;

// Internal:
var __os_directory_Symbol = "||DIR||"; // "//"
var __os_emptyFile_Symbol = "||EMPTY||"; // "/|E"

// Global variable(s):

// This is used to supply arguments to the application.
var __os_appargs = [];

// This is used to keep track of the current directory.
var __os_currentdir = "";

// This specifies the default storage.
var __os_storage = sessionStorage; // localStorage;

// This holds this document's loaded URIs. For details, see: '__os_allocateResource'.
var __os_resources = {};

// This is used to force re-downloads of remote files. (Unfinished behavior)
var __os_badcache = false;

// Functions:

// Extensions:
function __os_ArrayBuffer_To_String(rawData)
{
	return String.fromCharCode.apply(null, new Uint8Array(rawData));
}

function __os_String_To_ArrayBuffer(fileData)
{
	var buf = new ArrayBuffer(fileData.length);
	var bufView = new Uint8Array(buf);
	
	// Truncate data to bytes:
	for (var i = 0, strLen = fileData.length; i < strLen; i++)
	{
		bufView[i] = fileData.charCodeAt(i) // [i] // & 0xFF;
	}
	
	return buf;
}

function __os_Native_To_String(nativeData)
{
	return nativeData;
}

function __os_Native_To_ArrayBuffer(nativeData)
{
	return __os_String_To_ArrayBuffer(nativeData);
}

function __os_String_To_Native(str)
{
	//return __os_String_To_ArrayBuffer(str);
	return str;
}

function __os_ArrayBuffer_To_Native(rawData)
{
	return __os_ArrayBuffer_To_String(rawData);
}

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

// This downloads from 'url', and returns the file's data.
// If no file was found, the return-value is undefined.
function __os_download(url)
{
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
				return xhr.responseText; // __os_ArrayBuffer_To_String(__os_String_To_ArrayBuffer(xhr.responseText)); // __os_String_To_ArrayBuffer(xhr.responseText); // xhr.response;
				
				break;
		}
	}
	catch (ex)
	{
		// Nothing so far.
	}
}

// This downloads a file from 'url' and represents it with 'rep'.
function __os_downloadFileUsingRep(storage, url, rep, isEmpty) // isEmpty=false
{
	var repValue = storage.getItem(rep);
	
	if (isEmpty || repValue == null || __os_badcache || repValue == __os_emptyFile_Symbol) // === undefined
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

// This specifies if this browser supports native file storage.
function __os_storageSupported()
{
	return (typeof(Storage) !== "undefined");
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
	var ss = sessionStorage.getItem(realPath);
	
	if (ss != null)
	{
		return ss;
	}
	
	var ls = localStorage.getItem(realPath);
	
	if (ls != null)
	{
		return ls;
	}
}

function __os_createFileEntryWith(storage, rep, data)
{
	storage.setItem(rep, data);
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
	__os_createFileEntry(rep, __os_emptyFile_Symbol, false);
}

// This gets a file using 'realPath' from a remote host.
// If this is already present in some kind of storage, it uses the cache.
function __os_getFile(realPath, isEmpty)
{
	var f = __os_storageLookup(realPath);
	
	if (f == null || isEmpty != null || (isEmpty = (f == __os_emptyFile_Symbol))) // Set 'isEmpty', and check it.
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
	
	// Test for 'realPath', and if found, remove the element(s):
	var ss = sessionStorage.getItem(realPath);
	
	if (ss != null)
	{
		response |= __os_removeStorageEntry(sessionStorage, realPath, isDir, recursive, ss); // =
	}
	
	var ls = localStorage.getItem(realPath);
	
	if (ls != null)
	{
		response |= __os_removeStorageEntry(localStorage, realPath, isDir, recursive, ls);
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
		value = storage.getItem(realPath);
	}
	
	if (value != null)
	{
		storage.removeItem(realPath);
		
		if (isDir === undefined && value == __os_directory_Symbol)
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
	
	var rawData = __os_Native_To_ArrayBuffer(f); // f;
	var bytes = new Uint8Array(rawData);
	var blob = new Blob([rawData], { type: blobType });

	var uriGenerator = window.URL || window.webkitURL;
	var uri = uriGenerator.createObjectURL(blob);

	__os_resources[realPath] = uri;

	//uriGenerator.revokeObjectURL(uri);
	
	return uri;
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
	if (file == null || (isEmpty = (file == __os_emptyFile_Symbol))) // Set 'isEmpty', and check it.
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
		if (file != __os_directory_Symbol)
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
	var storage = sessionStorage;
	
	var f = __os_downloadFile(storage, rpath);
	
	if (f == null || f == __os_directory_Symbol)
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
	var rpath = RealPath(path);
	var f = __os_storageLookup(rpath);
	var out = "";
	
	if (f == null)
	{
		// Currently not cached (To be changed):
		//var dl = __os_download(__os_toRemotePath(rpath));
		var dl = __os_downloadFile(__os_storage, rpath);
		
		if (dl != null)
		{
			out = dl;
		}
	}
	else
	{
		out = f;
	}
	
	return out;
}

function SaveString(str, path)
{
	__os_createFileEntry(RealPath(path), str);
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
			
			// Depends on these being the only storage options:
			__os_loadFileStructure(rp, localStorage, out);
			__os_loadFileStructure(rp, sessionStorage, out);
			
			return out; break;
	}
	
	return [];
}

function CreateDir(path)
{
	__os_createFileEntry(RealPath(path), __os_directory_Symbol, true); // <-- Prefix added for debugging purposes.
	
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
