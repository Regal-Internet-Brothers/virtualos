
// Conversion and storage semantics:

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
	
	var content = ""; // new String();
	
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

function __os_String_To_ArrayBuffer(str)
{
	if (str == null)
	{
		return null;
	}
	
	var buf = new ArrayBuffer(str.length);
	var bufView = new Uint8Array(buf);
	
	for (var i = 0, strLen = str.length; i < strLen; i++)
	{
		bufView[i] = (str.charCodeAt(i)); // [i] // & 0xFF;
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
