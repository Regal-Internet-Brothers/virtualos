Strict

Public

' Preprocessor related:

' Target checks:
#If LANG = "js" ' TARGET = "html5"
	#VIRTUALOS_JS_TARGET = True
#End

' Redirection behavior:

#Rem
	This is used to control native implementation lookups.
	
	If enabled, this module will only look for the source
	code found in "native", instead of using external modules.
	
	In the case of 'os' compatibility, disabling this
	would allow C++ targets to use BRL's 'os' module.
#End

#VIRTUALOS_LOCAL_ONLY = True

' Check the build environemnt:
#If VIRTUALOS_JS_TARGET
	' Set the implementation-flag to 'True'.
	#VIRTUALOS_IMPLEMENTED = True
	
	' JavaScript-specific configuration:
	
	' Environment:
	
	' For JS, we need the default file for integral code paths.
	#VIRTUALOS_DEFAULT_FILE = True
	
	' In addition, we are modular, so we need to stay "non-traditional".
	#VIRTUALOS_TRADITIONAL = False
	
	' Implementation details:
	
	' This states that environment variables are mapped from Monkey.
	#VIRTUALOS_MAP_ENV = True
	'#VIRTUALOS_MAP_FILETIMES = True
	
	' Extensions:
	
	' This enables "download extensions".
	#VIRTUALOS_EXTENSION_DL = True
	
	' This enables various virtual file-system extensions.
	#VIRTUALOS_EXTENSION_VFILE = True
	
	' This is an extension related to "VFILE", essentially,
	' it allows you to check for available storage types.
	#VIRTUALOS_EXTENSION_STORAGE_CAPABILITIES = True
	
	' This enables extensions that give Monkey programmers the
	' ability to convert from "real paths" to "remote paths".
	#VIRTUALOS_EXTENSION_REMOTEPATH = True
	
	' This extension allows the native implementation
	' to handle recursive behavior as it sees fit.
	#VIRTUALOS_EXTENSION_NATIVE_RECURSION = True
	
	' This extension allows the use of unmanaged array passage.
	' (Unsafe; required for some applications)
	#VIRTUALOS_EXTENSION_UNSAFE_LOADARRAY = True
	
	#If CONFIG = "debug"
		'#VIRTUALOS_DEBUG = True
	#End
#Elseif (LANG = "cpp" And Not VIRTUALOS_LOCAL_ONLY) And TARGET <> "win8" And TARGET <> "ios"
	#VIRTUALOS_REAL = True
	
	#VIRTUALOS_DEFAULT_FILE = False
	#VIRTUALOS_TRADITIONAL = False
#Else
	' This is a 'good-faith' situation.
	' In other words, this may or may not work:
	
	' Set the implementation-flag to 'True'.
	#VIRTUALOS_IMPLEMENTED = True
	
	#VIRTUALOS_DEFAULT_FILE = True
	#VIRTUALOS_TRADITIONAL = True
#End

' Please keep the 'VIRTUALOS_LOCAL_ONLY' and 'VIRTUALOS_TRADITIONAL' flags in mind when using this:
#If VIRTUALOS_REAL
	' Set this to 'True' in order to use 'brl' instead of 'os' as a fallback.
	'#VIRTUALOS_REAL_USE_BRL = True
	
	' These are used to toggle usage of individual 'brl' modules.
	' These are required to use 'VIRTUALOS_REAL_USE_BRL' effectively:
	
	'#VIRTUALOS_REAL_PROCESS = True
	'#VIRTUALOS_REAL_FILESYSTEM = True
	
	' For maximum compatibility, this is enabled by default.
	' If disabled, an internal implementation may be used.
	' In some situations, such a version may cause conflicts.
	#VIRTUALOS_REAL_FILEPATH = True
#End

' Global configuration for implemented 'virtualos' code:
#If VIRTUALOS_IMPLEMENTED
	#VIRTUALOS_STANDALONE = True
	
	' Enable this for 'os' compatibility with the preprocessor.
	'#VIRTUALOS_FLAG_OS = True
	
	' This is used by native implementations if necessary.
	' Disable this if you are sure the exact value
	' of 'FileSize' doesn't matter (Excluding 0).
	#VIRTUALOS_CARE_ABOUT_SIZES = True
#End

' If asked to do so, mark 'BRL_OS_IMPLEMENTED' (Compatibility):
#If VIRTUALOS_FLAG_OS
	#BRL_OS_IMPLEMENTED = True
#End