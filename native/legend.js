
// Functions:

// API:

// Used internally; DO NOT change.
function HostOS()
{
	return "web";
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

function SaveString(str, path, safe) // safe=false
{
	if (!__os_createFileEntry(RealPath(path), __os_String_To_Native(str), false, !safe))
	{
		return -1;
	}
	
	// Return the default response.
	return 0;
}

// Extensions:

// These follow the naming-scheme and general behavior of 'SaveString':
function SaveArrayBuffer(rawData, path, safe) // safe=false
{
	if (!__os_createFileEntry(RealPath(path), __os_ArrayBuffer_To_Native(rawData), false, !safe))
	{
		return -1;
	}
	
	// Return the default response.
	return 0;
}

function SaveBase64(base64, path, safe) // safe=false
{
	if (!__os_createFileEntry(RealPath(path), __os_Base64_To_Native(base64), false, !safe))
	{
		return -1;
	}
	
	// Return the default response.
	return 0;
}

// This saves the contents of 'buf' to the file-system.
// This is similar to 'SaveString', but with 'BBDataBuffers'.
function __os_SaveBuffer(realPath, buf, force)
{
	if (!__os_createFileEntry(realPath, __os_ArrayBuffer_To_Native(buf.arrayBuffer), false, force))
	{
		return false;
	}
	
	// Return the default response.
	return true;
}

// This initializes 'buf' ('BBDataBuffer') using the file-data found at 'realPath'.
// If this operation succeeded, the return-value will be the output 'BBDataBuffer'.
function __os_LoadBufferTo(realPath, buf)
{
	if (buf == null)
	{
		return null;
	}
	
	var rawData = __os_Native_To_ArrayBuffer(__os_LoadNative(realPath));
	
	if (rawData == null)
	{
		return null;
	}
	
	buf._Init(rawData);
	
	return buf;
}

// This provides an array of (Signed) 8-bit integers ('Int8Array').
function __os_LoadArray(realPath)
{
	var rawData = __os_Native_To_ArrayBuffer(__os_LoadNative(realPath));
	
	if (rawData == null)
	{
		return null;
	}
	
	return new Int8Array(rawData);
}
