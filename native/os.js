
// Functions:

// Extensions:

// This takes 'fn', and if it exists, executes it, forwarding its response.
function __os_call_if_exists(fn)
{
	if (typeof fn == 'function')
	{
		var args = Array.prototype.splice.call(arguments, 1);

		return fn.apply(null, args);
	}
}

// This copies the global 'os' context of the 'parent' environment.
function __os_inheritParent()
{
	__os_call_if_exists(__os__meta_inheritParent, parent);
	__os_call_if_exists(__os__process_inheritParent, parent);
	__os_call_if_exists(__os__filesystem_inheritParent, parent);
}
