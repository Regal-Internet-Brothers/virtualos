
// Constant variable(s):

// All symbols must start with this prefix.
var __os_symbol_prefix = "||";

// Global variable(s):

// This is used when '__os_getVersion' assigns the internal version. (When one isn't found)
var __os_default_version = 4;

// Internal:

// Accessor symbols:
var __os_version_symbol = "||__os_version||";

// This is used internally when an unsafe operation is applied.
// If this is 'false', fallback behavior may be used implicitly.
var __os_safe = true; // false;

// This specifies the default storage.
var __os_storage = localStorage; // {}; // sessionStorage;

// This states if '__os_storage' is a known source (Global 'Storage' object).
var __os_storage_is_known_source = true; // false; // true;

// This states if all known sources should be checked when performing abstract file-operations.
// This should only be enabled when using a known source for storage.
var __os_storage_all_sources = false; // __os_storage_is_known_source; // true;

// Functions:

// API:
// Nothing so far.

// Extensions:

// This handles the transfer of the parent context's "meta" module.
function __os__meta_inheritParent(parentContext)
{
	__os_storage = parentContext.__os_storage;
	__os_safe = parentContext.__os_safe;
}

// This retrieves the internal version of this module.
// If a version number wasn't supplied, one will be assigned.
// To disable such behavior, set 'force_stop_assignment' to 'true'.
function __os_getVersion(force_stop_assignment) //force_stop_assignment=false
{
	if (__os_storage.hasOwnProperty(__os_version_symbol))
	{
		return Number(__os_storage[__os_version_symbol]);
	}
	
	if (!force_stop_assignment)
	{
		__os_setVersion(__os_default_version, false);
		
		return __os_default_version;
	}
	
	return __os_default_version; // OS_VERSION_NOT_FOUND;
}

// Please do not call this function. It will be handled automatically by '__os_getVersion'.
// The return value of this function indicates the success of the operation.
function __os_setVersion(versionNumber, safety) //safety=false
{
	if (safety && __os_storage.hasOwnProperty(__os_version_symbol))
	{
		return false;
	}
	
	__os_storage[__os_version_symbol] = versionNumber;
	
	// Return the default response.
	return true;
}

// Conversion and storage semantics:

// This just returns '__os_storage'.
function __os_getFileSystemContainer()
{
	return __os_storage;
}

// Changing this on normal runtime will result in horribly undefined behavior, usually leading to corruption.
// If you wish to change the internal storage mechanism, do it before anything else.
// Transferral of containers is unsupported, and will need to be handled by the caller.
// The internal file-system container handles both file I/O and configuration semantics.
function __os_set_FileSystemContainer(container, disallowMultiSource)
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

// This specifies if this browser supports the 'Storage' type.
function __os_storageSupported()
{
	return (typeof(Storage) !== "undefined"); // true;
}

// This specifies if 'localStorage' is a potential container.
function __os_localStorageAvailable()
{
	return (window.localStorage !== undefined);
}

// This specifies if 'sessionStorage' is a potential container.
function __os_sessionStorageAvailable()
{
	return (window.sessionStorage !== undefined);
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
	
	return page.substring(0, lastSlash);
}

/*
	This converts 'realPath' to a "remote path".
	
	This DOES NOT call the 'RealPath' function, please call that first.
	
	If 'RealPath' is not called first, please understand
	the effects of this command (Invalid global directory).
*/

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
