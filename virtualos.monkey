Strict

Public

' Preprocessor related:
' Nothing so far.

' Imports:
Import config

#If VIRTUALOS_IMPLEMENTED
	Import "native/os.${LANG}"
#End

Import filepath
Import filesystem
Import process

#If VIRTUALOS_IMPLEMENTED
	' External bindings:
	Extern
	
	' Functions (External):
	
	' API:
	Function HostOS:String()
	Function LoadString:String(Path:String)
	Function SaveString:Int(Str:String, Path:String)
	
	' Extensions:
	#If VIRTUALOS_EXTENSION_UNSAFE_LOADARRAY
		' This provides an array of integers in a native format, which is ideally used like a normal array.
		' The resulting array is symbolic, and may or may not behave appropriately.
		' If you are unsure, use 'LoadString'. (Binary data may still need to use this extension)
		Function __OS_Unsafe__LoadArray:Int[](RealPath:String)="__os_LoadArray"
	#End
	
	Public
#End