Strict

Public

' Preprocessor related:
#If TARGET = "html5"
	#VIRTUALOS_IMPLEMENTED = True
	#VIRTUALOS_MAP_ENV = True
	'#VIRTUALOS_REAL_FILEPATH = True
#Elseif LANG = "cpp" And TARGET <> "win8"
	#VIRTUALOS_REAL = True
#End

' Imports (Public):
#If Not VIRTUALOS_IMPLEMENTED
	#If VIRTUALOS_REAL
		Import os
	#End
#Else
	Import "native/os.${LANG}"
#End

#If VIRTUALOS_REAL_FILEPATH
	Import brl.filepath
#End

' Imports (Private):
Private

#If VIRTUALOS_IMPLEMENTED
	Import regal.stringutil
#End

Public

#If VIRTUALOS_IMPLEMENTED
	' Constant variable(s):
	Const FILETYPE_NONE:=		0
	Const FILETYPE_FILE:=		1
	Const FILETYPE_DIR:=		2
	
	' Functions (External):
	Extern
	
	Function HostOS:String()
	Function AppPath:String()
	Function AppArgs:String[]()
	Function RealPath:String(Path:String)
	Function FileType:Int(Path:String)
	Function FileSize:Int(Path:String)
	Function FileTime:Int(Path:String)
	Function CopyFile:Bool(Src:String, Dst:String)
	Function DeleteFile:Bool(Path:String)
	Function LoadString:String(Path:String)
	Function SaveString:Int(Str:String, Path:String)
	Function LoadDir:String[](Path:String)
	Function CreateDir:Bool(Path:String)
	Function DeleteDir:Bool(Path:String)
	Function ChangeDir:Int(Path:String)
	Function CurrentDir:String()
	
	#If Not VIRTUALOS_MAP_ENV
		Function SetEnv:Int(Name:String, Value:String)
		Function GetEnv:String(Name:String)
	#End
	
	Function Execute:Int(CMD:String)
	Function ExitApp:Int(RetCode:Int)
	
	Public
	
	' Global variable(s) (Private):
	Private
	
	Global __OS_Env:= New StringMap<String>()
	
	Public
	
	' Functions (Monkey):
	#If VIRTUALOS_MAP_ENV
		Function SetEnv:Void(name:String, value:String)
			__OS_Env.Set(name, value)
			
			Return
		End
		
		Function GetEnv:String(name:String)
			Return __OS_Env.Get(name)
		End
	#End
	
	Function LoadDir:String[](Path:String, Recursive:Bool, Hidden:Bool=False)
		Local Dirs:= New StringDeque()
		Local Files:= New StringDeque()
		
		' Add an initial value for safety.
		Dirs.PushFirst("")
		
		While (Not Dirs.IsEmpty)
			Local Dir:= Dirs.PopFirst()
			
			For Local F:= Eachin LoadDir(Path + "/" + Dir)
				If ((Not Hidden) And F.StartsWith(".")) Then
					Continue
				Endif
				
				If (Dir.Length > 0) Then
					F = Dir + "/" + F
				Endif
				
				Select (FileType(Path + "/" + F))
					Case FILETYPE_FILE
						Files.PushLast(F)
					Case FILETYPE_DIR
						If (Recursive) Then
							Dirs.PushLast(F)
						Else
							Files.PushLast(F)
						Endif
				End Select
			Next
		Wend
	
		Return Files.ToArray()
	End
	
	Function CopyDir:Bool(SourcePath:String, DestinationPath:String, Recursive:Bool=True, Hidden:Bool=False)
		If (FileType(SourcePath) <> FILETYPE_DIR) Then
			Return False
		Endif
		
		Local Files:= LoadDir(SourcePath)
		
		Select (FileType(DestinationPath))
			Case FILETYPE_NONE
				If (Not CreateDir(DestinationPath)) Then
					Return False
				Endif
			Case FILETYPE_FILE
				Return False
		End Select
		
		For Local F:= Eachin Files
			If ((Not Hidden) And F.StartsWith(".")) Then
				Continue
			Endif
			
			Local SrcP:= (SourcePath + "/" + F)
			Local DstP$= (DestinationPath + "/" + F)
			
			Select (FileType(SrcP))
				Case FILETYPE_FILE
					If (Not CopyFile(SrcP, DstP)) Then
						Return False
					Endif
				Case FILETYPE_DIR
					If (Recursive And (Not CopyDir(SrcP, DstP, Recursive, Hidden))) Then
						Return False
					Endif
			End Select
		Next
		
		' Return the default response.
		Return True
	End
	
	Function DeleteDir:Bool(Path$, Recursive:Bool)
		If (Not Recursive) Then
			Return DeleteDir(Path)
		Endif
		
		Select (FileType(Path))
			Case FILETYPE_NONE
				Return True
			Case FILETYPE_FILE
				Return False
		End Select
		
		For Local F:= Eachin LoadDir(Path)
			If (F = "." Or F = "..") Then
				Continue
			Endif
			
			Local FPath:= (Path + "/" + F)
	
			If (FileType(FPath) = FILETYPE_DIR) Then
				If (Not DeleteDir(FPath, True)) Then
					Return False
				Endif
			Else
				If (Not DeleteFile(FPath)) Then
					Return False
				Endif
			Endif
		Next
	
		Return DeleteDir(Path)
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