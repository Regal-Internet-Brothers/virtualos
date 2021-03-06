Strict

Public

' Preprocessor related:
' Nothing so far.

' Imports:
Import config ' core

#If ((Not VIRTUALOS_IMPLEMENTED) Or VIRTUALOS_REAL_FILEPATH)
	#If VIRTUALOS_REAL
		#If Not VIRTUALOS_REAL_USE_BRL
			Import os
		#Elseif VIRTUALOS_REAL_FILEPATH
			Import brl.filepath
		#End
	#End
#Else
	#If Not VIRTUALOS_TRADITIONAL
		'Import "native/filepath.js"
	#End
#End

#If VIRTUALOS_IMPLEMENTED
	' Constant variable(s) (Public):
	' Nothing so far.
	
	' Constant variable(s) (Private):
	Private
	
	#If VIRTUALOS_STANDALONE
		Const STRING_INVALID_LOCATION:= -1
	#End
	
	Public
	
	' Functions (Public):
	Function ResolveProtocolPath:String(Path:String)
		' Local variable(s):
		Local ProtocolPosition:= Path.Find(":/")
		
		If ((ProtocolPosition <> -1) And Path.Find("/") = (ProtocolPosition + 1)) Then
			Local Prefix:= Path[..ProtocolPosition]
			
			Select Prefix.ToLower()
				Case "monkey"
					' Give the path back without the protocol.
					Return Path[(ProtocolPosition+3)..]
			End Select
		Endif
		
		' We were unable to resolve the path
		' any further, give it back to the user.
		Return Path
	End
	
	#If Not VIRTUALOS_REAL_FILEPATH
		Function StripDir:String(Path:String)
			Local I:= Path.FindLast("/")
			
			If (I = STRING_INVALID_LOCATION) Then
				I = Path.FindLast( "\" )
			Endif
			
			If (I <> STRING_INVALID_LOCATION) Then
				Return Path[I+1..]
			Endif
			
			Return Path
		End
		
		Function ExtractDir:String(Path:String)
			Local I:= Path.FindLast("/")
			
			If (I = STRING_INVALID_LOCATION) Then
				I = Path.FindLast("\")
			Endif
			
			If (I <> STRING_INVALID_LOCATION) Then
				Return Path[..I]
			Endif
			
			Return ""
		End
		
		Function StripExt:String(Path:String)
			Local I:= Path.FindLast(".")
			Local SecondarySearchPos:= (I+1)
			
			If ((I <> STRING_INVALID_LOCATION) And (Path.Find("/", SecondarySearchPos) = STRING_INVALID_LOCATION) And (Path.Find("\", SecondarySearchPos)= STRING_INVALID_LOCATION)) Then
				Return Path[..I]
			Endif
			
			Return Path
		End
		
		Function ExtractExt:String(Path:String)
			Local I:= Path.FindLast(".")
			Local SecondarySearchPos:= (I+1)
			
			If ((I <> STRING_INVALID_LOCATION) And (Path.Find("/", SecondarySearchPos) = STRING_INVALID_LOCATION) And (Path.Find("\", SecondarySearchPos)= STRING_INVALID_LOCATION)) Then
				Return Path[SecondarySearchPos..]
			Endif
			
			Return ""
		End
		
		Function StripAll:String(Path:String)
			Return StripDir(StripExt(Path))
		End
	#End
#End