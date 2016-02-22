Strict

Public

' Preprocessor related:
' Nothing so far.

' Imports (Internal):
Import core

Private

#If VIRTUALOS_EXTENSION_LOADBUFFER
	Import brl.databuffer
#End

Import filesystem

Public

' Imports (Other):
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
		Function __OS_Unsafe__LoadArray:Int[](RealPath:String)="__os_LoadArray" ' UNSAFE
	#End
	
	#If VIRTUALOS_EXTENSION_LOADBUFFER
		' This natively binds the file-data of 'RealPath' to 'Buffer'.
		' This data may or may not represent the native entry.
		' Mutation of this buffer will result in undefined behavior.
		Function __OS_LoadBufferTo:BBDataBuffer(RealPath:String, Buffer:BBDataBuffer)="__os_LoadBufferTo"
	#End
	
	#If VIRTUALOS_EXTENSION_SAVEBUFFER
		' This takes the contents of 'Buffer' and creates a file-system entry using 'RealPath'.
		' This will only override the contents of an existing file-entry if 'Override' is enabled.
		Function __OS_SaveBuffer:Bool(RealPath:String, Buffer:BBDataBuffer, Override:Bool=True)="__os_SaveBuffer"
	#End
	
	Public
	
	' Functions (Public):
	#If VIRTUALOS_EXTENSION_LOADBUFFER
		' This allocates a 'DataBuffer' using the file-data at 'RealPath'.
		' If the file does not exist, this will return 'Null'.
		' The output-buffer of this method should not be modified
		' unless 'VIRTUALOS_EXTENSION_LOADBUFFER_SAFE' is defined.
		Function __OS_LoadBuffer:DataBuffer(RealPath:String)
			Local B:= New DataBuffer()
			
			If (__OS_LoadBufferTo(RealPath, B) <> B) Then
				Return Null
			Endif
			
			' Apply safety behavior:
			#If VIRTUALOS_EXTENSION_LOADBUFFER_SAFE
				#If VIRTUALOS_EXTENSION_ENCODING_INFO
					If (__OS_GetFileSystemEncoding() <> FILESYSTEM_ENCODING_ARRAYBUFFER) Then
						Return B
					Endif
				#End
				
				Local Out:= New DataBuffer(B.Length)
				
				B.CopyBytes(0, Out, 0, Out.Length) ' B.Length
				
				Return Out
			#End
			
			Return B
		End
	#End
#End