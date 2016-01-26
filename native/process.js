
// Global variable(s):

// This is used to supply arguments to the application.
var __os_appargs = [];

// This is used to keep track of the current directory.
var __os_currentdir = "";

// Functions:

// Extensions:
function __os__process_inheritParent(parentContext)
{
	//__os_appargs = parentContext.__os_appargs.slice();
	__os_currentdir = parentContext.__os_currentdir;
}

// Capitalized to ensure association ('AppArgs' command):

// This simply returns '__os_appargs'.
// The return-value may be undefined.
function __os_get_AppArgs()
{
	return __os_appargs;
}

// This manually sets '__os_appargs'.
function __os_set_AppArgs(args)
{
	__os_appargs = args
}

// API:

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
}

// The 'AppPath' (Reserved), and any argument supplied by the user.
function AppArgs()
{
	return [AppPath()].concat(__os_appargs);
}

// I'm unsure if this is working 100%, but it helps get transcc running:
function ChangeDir(path)
{
	// For the sake of safety, process 'path'.
	path = __os_fixDir(path);

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
	return __os_call_if_exists(__exec, cmd); // return 1; // -1;
}

function ExitApp(retCode)
{
	var message = ("Program execution completed: " + retCode);

	alert(message);
	//alert("EXIT: " + retCode);
	
	throw new Error(message);

	// Just to remain consistent, return zero anyway.
	return 0;
}
