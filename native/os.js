
// Constant variable(s):

// File-type macros:
var FILETYPE_NONE = 0;
var FILETYPE_FILE = 1;
var FILETYPE_DIR = 2;

// Internal:
var __os_directory_prefix = "//";

// Global variable(s):

// This is used to supply arguments to the application.
var __os_appargs = [];

// This is used to keep track of the current directory.
var __os_currentdir = "";

// This specifies the default storage.
var __os_storage = sessionStorage; // localStorage;

// A collection of loaded directories in the virtual file-system.
var __os_directories = {};

// This is used to force re-downloads of remote files. (Unfinished behavior)
var __os_badcache = false;

// Functions:

// Extensions:
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
function __os_download(url, secondAttempt)
{
	var xhr = new XMLHttpRequest();
	
	try
	{
		xhr.open("GET", url, false); // "HEAD"
		
		if (secondAttempt)
		{
			//xhr.overrideMimeType('text/plain');
		}
		
		// For now, we don't care about file updates.
		// This is something to look into later:
		xhr.overrideMimeType('text/plain');
		xhr.setRequestHeader("Cache-Control", "no-cache");
		xhr.setRequestHeader("Pragma", "no-cache");
		xhr.setRequestHeader("If-Modified-Since", "Sat, 1 Jan 2000 00:00:00 GMT");
		//xhr.setRequestHeader("Cache-Control", "must-revalidate");
		
		xhr.send(null);
		
		switch (xhr.status)
		{
			case 304:
				if (!xhr.responseText && !secondAttempt)
				{
					return __os_download(url, true);
				}
				
				//return xhr.responseText; break;
			case 0:
			case 200:
				return xhr.responseText;
				
				break;
		}
	}
	catch (ex)
	{
		// Nothing so far.
	}
}

// This downloads a file from 'url' and represents it with 'rep'.
function __os_downloadFileUsingRep(storage, url, rep)
{
	var repValue = storage.getItem(rep);
	
	if (__os_badcache || repValue == null) // === undefined
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
function __os_downloadFile(storage, realPath)
{
	return __os_downloadFileUsingRep(storage, __os_toRemotePath(realPath), realPath);
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
function __os_supportedFile(lCasePath, types)
{
	for (var i = 0; i < types.length; i++)
	{
		if (lCasePath.endsWith(types[i].toLowerCase()))
		{
			return true;
		}
	}
	
	// Return the default response.
	return false;
}

// This checks if any of the pre-defined supported file-types match 'lCasePath'. (Used internally)
function __os_testSupportedFiles(lCasePath)
{
	// Currently pre-determined types; may be changed later:
	if (__os_supportedFile(lCasePath, CFG_TEXT_FILES)) return true;
	if (__os_supportedFile(lCasePath, CFG_BINARY_FILES)) return true;
	if (__os_supportedFile(lCasePath, CFG_MUSIC_FILES)) return true;
	if (__os_supportedFile(lCasePath, CFG_BINARY_FILES)) return true;
	
	// Return the default response.
	return false;
}

// This checks if the file at 'realPath' is stored or not.
function __os_storageLookup(realPath, isDir)
{
	if (__os_directories.hasOwnProperty(realPath))
	{
		return __os_directories[realPath];
	}
	
	if (isDir)
	{
		return;
	}
	
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
	if (isDir || data.indexOf(__os_directory_prefix) == 0)
	{
		__os_directories[rep] = data;
	}
	else
	{
		__os_createFileEntryWith(__os_storage, rep, data);
	}
}

// This gets a file using 'realPath' from a remote host.
// If this is already present in some kind of storage, it uses the cache.
function __os_getFile(realPath)
{
	var f = __os_storageLookup(realPath);
	
	if (f == null)
	{
		return __os_downloadFile(__os_storage, realPath);
	}
	
	return f;
}

function __os_deleteFileEntries(realPath, isDir)
{
	if (__os_directories.hasOwnProperty(realPath)) // isDir
	{
		delete __os_directories[realPath];
		
		return true;
	}
	
	if (isDir)
	{
		return false;
	}
	
	var response = false;
	
	var ss = sessionStorage.getItem(realPath);
	
	if (ss != null)
	{
		sessionStorage.removeItem(realPath); // ss;
		
		response = true;
	}
	
	// Test for 'realPath', and if found, remove it:
	var ls = localStorage.getItem(realPath);
	
	if (ls != null)
	{
		localStorage.removeItem(realPath); // ls;
		
		response = true;
	}
	
	return response;
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
	
	var x = page.substring(1, Math.max(lastSlash, 1));
	
	if (x.length != 0)
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
	if (path.indexOf("//") == 0)
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
	
	// Check if we don't have an entry to view:
	if (file == null)
	{
		// Check if we could load this file using the current file-system:
		if (__os_fileCouldExist(realPath))
		{
			// Try to load our file from the server.
			file = __os_getFile(realPath);
		}
	}
	
	if (file != null)
	{
		//if (__os_testSupportedFiles(realPath.toLowerCase()))
		if (file.indexOf(__os_directory_prefix) != 0)
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
	
	if (f == null)
	{
		return 0;
	}
	
	if (f.startsWith(__os_directory_prefix))
	{
		return 0;
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
	
	if (f == null)
	{
		// Currently not cached (To be changed):
		//var dl = __os_download(__os_toRemotePath(rpath));
		var dl = __os_downloadFile(__os_storage, rpath);
		
		if (dl != null)
		{
			return dl;
		}
	}
	else
	{
		return f;
	}
	
	return "";
}

function SaveString(str, path)
{
	__os_createFileEntry(RealPath(path), str);
}

function __os_loadStorage(realPath, storage, out)
{
	// for (var i in storage)
	for (var i = 0; i < storage.length; i++)
	{
		var key = storage.key(i);
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

function __os_loadDirectories(realPath, out)
{
	for (var folder in __os_directories)
	{
		if (folder == realPath)
		{
			continue;
		}
		
		var parentFolder = folder.indexOf(realPath);
		var cutoff = parentFolder + realPath.length + 1; // <-- Offset for future modification.
		
		if (parentFolder == 0 && folder.indexOf("/", cutoff) == -1)
		{
			var entry = folder.substring(cutoff);
			
			out.push(entry);
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
			__os_loadStorage(rp, localStorage, out);
			__os_loadStorage(rp, sessionStorage, out);
			
			__os_loadDirectories(rp, out);
			
			return out; break;
	}
	
	return [];
}

function CreateDir(path)
{
	__os_createFileEntry(RealPath(path), __os_directory_prefix + path, true); // <-- Prefix added for debugging purposes.
	
	return true;
}

function DeleteDir(path)
{
	return __os_deleteFileEntries(RealPath(path), true);
}

// I'm unsure if this is working 100%, but it helps get transcc running:
function ChangeDir(path)
{
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
