Strict

Public

' Preprocessor related:
#VIRTUALOS_FLAG_OS = True
#VIRTUALOS_STANDALONE = True

#If TARGET = "html5"
	#VIRTUALOS_JS_TARGET = True
#End

' This is used by native implementations if necessary.
' Disable this if you are sure the exact value
' of 'FileSize' doesn't matter (Excluding 0).
#VIRTUALOS_CARE_ABOUT_SIZES = True

' Redirection behavior:

' Set this to 'True' in order to use 'brl' instead of 'os' as a fallback.
'#VIRTUALOS_REAL_USE_BRL = True

' These are used to toggle usage of individual 'brl' modules.
' These are required to use 'VIRTUALOS_REAL_USE_BRL' effectively:

'#VIRTUALOS_REAL_FILEPATH = True
'#VIRTUALOS_REAL_PROCESS = True
'#VIRTUALOS_REAL_FILESYSTEM = True

' JavaScript-specific configuration:
#If VIRTUALOS_JS_TARGET
	#VIRTUALOS_IMPLEMENTED = True
	
	#VIRTUALOS_MAP_ENV = True
	'#VIRTUALOS_MAP_FILETIMES = True
	
	#VIRTUALOS_EXTENSION_DL = True
	#VIRTUALOS_EXTENSION_VFILE = True
	#VIRTUALOS_EXTENSION_REMOTEPATH = True
	#VIRTUALOS_EXTENSION_NATIVE_RECURSION = True
	
	#VIRTUALOS_EXTENSION_UNSAFE_LOADARRAY = True
	
	#If CONFIG = "debug"
		'#VIRTUALOS_DEBUG = True
	#End
#Elseif LANG = "cpp" And TARGET <> "win8" And TARGET <> "ios"
	#VIRTUALOS_REAL = True
#End

#If VIRTUALOS_IMPLEMENTED
	#If VIRTUALOS_FLAG_OS
		#BRL_OS_IMPLEMENTED = True
	#End
#End