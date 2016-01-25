Strict

Public

' Preprocessor related:
' Nothing so far.

' Imports:
Import config

#If Not VIRTUALOS_IMPLEMENTED
	#If VIRTUALOS_REAL
		#If Not VIRTUALOS_REAL_USE_BRL
			Import os
		#End
	#End
#Else
	#If Not VIRTUALOS_TRADITIONAL
		Import "native/legend.${LANG}"
	#End
#End

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