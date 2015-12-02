
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

// This is used to force re-downloads of remote files. (Unfinished behavior)
var __os_badcache = false;

// Functions:

// Extensions:
function __os_setAppArgs(args)
{
	__os_appargs = args
}

// This DOES NOT call 'RealPath', please call that first.
// If 'RealPath' is not called first, please understand the effects.
function __os_toRemotePath(path)
{
	var loc = document.URL;
	
	var finalSlash = loc.lastIndexOf('/');
	
	if (!path.startsWith("/"))
	{
		finalSlash += 1;
	}
	
	return loc.substring(0, finalSlash) + path;
}

// This downloads from 'url', and returns the file's data.
// If no file was found, the return-value is undefined.
function __os_download(url)
{
	var xhr = new XMLHttpRequest();
	
	try
	{
		xhr.open("GET", url, false); // "HEAD"
		xhr.send(null);
		
		if (xhr.status == 200 || xhr.status == 304 || xhr.status == 0)
		{
			return xhr.responseText;
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
function __os_storageLookup(realPath)
{
	var ls = localStorage.getItem(realPath);
	
	if (ls != null)
	{
		return ls;
	}
	
	var ss = sessionStorage.getItem(realPath);
	
	if (ss != null)
	{
		return ss;
	}
}

function __os_createFileEntryWith(storage, rep, data)
{
	storage.setItem(rep, data);
}

function __os_createFileEntry(rep, data)
{
	__os_createFileEntryWith(__os_storage, rep, data);
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

function __os_deleteFileEntries(realPath)
{
	var response = false;
	
	// Test for 'realPath', and if found, remove it:
	var ls = localStorage.getItem(realPath);
	
	if (ls != null)
	{
		localStorage.removeItem(realPath); // ls;
		
		response = true;
	}
	
	var ss = sessionStorage.getItem(realPath);
	
	if (ss != null)
	{
		sessionStorage.removeItem(realPath); // ss;
		
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
	return "data/bin" + window.location.pathname;
}

// The 'AppPath' (Reserved), and any argument supplied by the user.
function AppArgs()
{
	return [AppPath()].concat(__os_appargs);
}

// The "real" (Local) path of 'f'.
function RealPath(path)
{
	if (path.indexOf(__os_currentdir) != 0)
	{
		//if (!path.startsWith("/"))
		if (path.indexOf("/") != 0)
		{
			path = __os_currentdir + "/" + path; // <- Unsure if I should be doing this.
		}
		else
		{
			path = __os_currentdir + path;
		}
	}
	
	return __os_fixDir(path);
}

// This attempts to recognize the "file-type" of 'path'. (Uses supported files)
function FileType(path)
{
	var realPath = RealPath(path);
	var file = __os_getFile(realPath);
	
	if (file != null)
	{
		//if (__os_testSupportedFiles(realPath.toLowerCase()))
		if (realPath.indexOf(".") != -1 && file.indexOf(__os_directory_prefix) != 0)
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
	//print("WRITE FILE: \"" + path + "\"");
	
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
			
			return out; break;
	}
	
	return [];
}

function CreateDir(path)
{
	__os_createFileEntry(RealPath(path), "// " + path); // <-- Prefix added for debugging purposes.
	
	return true;
}

function DeleteDir(path)
{
	return __os_deleteFileEntries(RealPath(path));
}

// I'm unsure if this is working 100%, but it helps get transcc running:
function ChangeDir(path)
{
	var first = __os_currentdir.indexOf("/");
	var second = __os_currentdir.lastIndexOf("/");
	
	if (first == 0 || second == __os_currentdir.length-1)
	{
		__os_currentdir = __os_currentdir.substring(first+1, (second != -1) ? second : __os_currentdir.length);
	}
	
	if (!__os_currentdir.startsWith("data"))
	{
		__os_currentdir = "data/" + __os_currentdir;
	}
	
	__os_currentdir = path;
	
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
