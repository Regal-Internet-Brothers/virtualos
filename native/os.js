
var __appargs = [];
var __vfilesystem = {};
var __currentdir = "";

function __os_SetAppArgs(args)
{
	__appargs = args
	
	return;
}

function __toRemotePath(path)
{
	var loc = document.URL;
	
	var finalSlash = loc.lastIndexOf('/');
	
	if (!path.startsWith("/"))
	{
		finalSlash += 1;
	}
	
	return loc.substring(0, finalSlash) + path;
}

function HostOS()
{
	return "web";
}

function AppPath()
{
	return "/data/bin" + window.location.pathname;
}

function AppArgs()
{
	return [AppPath()].concat(__appargs);
}

function fixDir(f)
{
	//print("FIX DIR: " + f);
	
	var final = f;
	
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
	
	//print("//// FIXED DIR: " + final);
	
	return final;
}

function RealPath(f)
{
	if (!f.startsWith("/"))
	{
		f = __currentdir + "/" + f;
	}
	else
	{
		f = __currentdir + f;
	}
	
	var final = fixDir(f);
	
	return final;
}

function FileType(path)
{
	var FILETYPE_NONE = 0;
	var FILETYPE_FILE = 1;
	var FILETYPE_DIR = 2;
	
	var url = __toRemotePath(path);
	
	var http = new XMLHttpRequest();
	
	print("GET: " + url);
	print("FROM: " + path);
	
	http.open('GET', url, false); // 'HEAD'
	http.send();
	
	if (http.status == 200 || http.status == 0)
	{
		var lCasePath = path.toLowerCase();
		
		for (var i = 0; i < CFG_TEXT_FILES.length; i++)
		{
			if (lCasePath.endsWith(CFG_TEXT_FILES[i].toLowerCase()))
			{
				return FILETYPE_FILE;
			}
		}
		
		return FILETYPE_DIR;
	}
	
	/*
	print("{ CONTEXT : \"" + __currentdir + "\" }")
	print("{"+http.status+"}: Can't find \"" + url + "\".");
	print("{ ORIGINAL : \"" + path + "\" }");
	*/
	
	if (__dirs.indexOf(path) > -1)
	{
		return FILETYPE_DIR;
	}
	
	return FILETYPE_NONE;
}

function FileSize(path)
{
	alert("FILE SIZE: " + path);
	
	return 0;
}

function FileTime(path)
{
	alert("FILE TIME: " + path);
	
	return 0;
}

function CopyFile(src, dst)
{
	alert("COPY FILE: " + src + ", " + dst);
	
	return;
}

function DeleteFile(path)
{
	alert("DELETE FILE: " + path);
	
	return;
}

function LoadString(path)
{
	var xhr = new XMLHttpRequest();
	
	xhr.open("GET", __toRemotePath(path), false);
	
	xhr.send(null);
	
	if (xhr.status == 200 || xhr.status == 0)
	{
		return xhr.responseText;
	}
	
	return "";
}

function SaveString(str, path)
{
	document.writeln("WROTE FILE: \"" + path + "\"");
	//document.writeln(path + " : ");
	//document.write(str);
	
	return;
}

function LoadDir(path)
{
	switch (path)
	{
		case "/data/targets":
			return ["html5"]; break;
		case "/data/targets/html5":
			return ["modules", "template", "TARGET.MONKEY"]; break;
		default:
			document.writeln("Path: " + path);
			
			break;
	}
	
	return [];
}

function CreateDir(path)
{
	print("CREATE DIR: " + path);
	//return true;
	
	__dirs.push(path);
	
	return true;
}

function DeleteDir(path)
{
	print("DELETE DIR: " + path);
	//return true;
	
	var index = __dirs.indexOf(path);
	
	if (index <= -1)
	{
		return false;
	}
	
	__dirs.splice(index, 1);
	
	return true;
}

function ChangeDir(path)
{
	print("CHANGE DIR: " + path);
	print("PREV__CDIR: " + __currentdir);
	
	var first = __currentdir.indexOf("/");
	var second = __currentdir.lastIndexOf("/");
	
	if (first == 0 || second == __currentdir.length-1)
	{
		__currentdir = __currentdir.substring(first+1, (second != -1) ? second : __currentdir.length);
	}
	
	if (!__currentdir.startsWith("data"))
	{
		__currentdir = "data/" + __currentdir;
	}
	
	__currentdir = path;
	
	print("CHANGE__CDIR: " + __currentdir);
	
	return __currentdir;
}

function CurrentDir()
{
	//alert("CURRENT DIR.");
	
	return __currentdir;
}

function Execute(cmd)
{
	document.writeln("CMD: " + cmd);
	
	return;
}

function ExitApp(retCode)
{
	alert("EXIT: " + retCode);
	throw null;
	
	return;
}
