Strict

Public

' Preprocessor related:
#VIRTUALOS_FLAG_OS = True
#VIRTUALOS_STANDALONE = True

#If TARGET = "html5"
	#VIRTUALOS_JS_TARGET = True
#End

#If VIRTUALOS_JS_TARGET
	#VIRTUALOS_IMPLEMENTED = True
	
	#VIRTUALOS_MAP_ENV = True
	#VIRTUALOS_MAP_FILETIMES = True
	
	#VIRTUALOS_EXTENSION_DL = True
	#VIRTUALOS_EXTENSION_VFILE = True
	#VIRTUALOS_EXTENSION_REMOTEPATH = True
	#VIRTUALOS_EXTENSION_NATIVE_RECURSION = True
	
	#VIRTUALOS_EXTENSION_UNSAFE_LOADARRAY = True
	
	'#VIRTUALOS_REAL_FILEPATH = True
	
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
	#If Not VIRTUALOS_STANDALONE
		Import regal.stringutil
		
		#If VIRTUALOS_EXTENSION_DL And VIRTUALOS_EXTENSION_VFILE
			Import regal.ioutil.stringstream
		#End
	#Else
		Import brl.databuffer
		Import brl.datastream
	#End
	
	Import monkey.map
	
	#If VIRTUALOS_JS_TARGET
		'Import dom
	#End
#End

Public

#If VIRTUALOS_IMPLEMENTED
	' Constant variable(s) (Public):
	
	' File-types (Must be the same across borders):
	Const FILETYPE_NONE:=		0
	Const FILETYPE_FILE:=		1
	Const FILETYPE_DIR:=		2
	
	Const FILETIME_UNAVAILABLE:= 0
	
	' Constant variable(s) (Private):
	Private
	
	#If VIRTUALOS_STANDALONE
		Const STRING_INVALID_LOCATION:= -1
	#End
	
	Public
	
	' External bindings:
	Extern
	
	' Global variable(s) (External) (Private):
	Extern Private
	
	' If you are supporting these extensions, please provide '__OS_Storage'.
	#If VIRTUALOS_EXTENSION_VFILE
		#If VIRTUALOS_JS_TARGET
			Global __OS_Storage:StorageHandle="__os_storage"
		#End
	#End
	
	Extern
	
	' Classes (External) (Private):
	Extern Private
	
	' API:
	' Nothing so far.
	
	' Extensions:
	#If VIRTUALOS_EXTENSION_VFILE
		#If VIRTUALOS_JS_TARGET
			Class StorageHandle = "Storage" ' Extends DOMObject
				' Methods:
				' Nothing so far.
			End
		#Else
			#Error "Unable to resolve type: 'StorageHandle'"
		#End
	#End
	
	Extern
	
	' Functions (External):
	
	' API:
	Function HostOS:String()
	Function AppPath:String()
	Function AppArgs:String[]()
	Function RealPath:String(Path:String)
	Function FileType:Int(Path:String)
	Function FileSize:Int(Path:String)
	
	#If Not VIRTUALOS_MAP_FILETIMES
		Function FileTime:Int(Path:String)
		
		Function CopyFile:Bool(Src:String, Dst:String)
		Function DeleteFile:Bool(Path:String)
	#Else
		Function _CopyFile:Bool(Src:String, Dst:String)="CopyFile"
		Function _DeleteFile:Bool(Path:String)="DeleteFile"
	#End
	
	Function LoadString:String(Path:String)
	
	#If VIRTUALOS_EXTENSION_UNSAFE_LOADARRAY
		' This provides an array of integers in a native format, which is ideally used like a normal array.
		' The resulting array is symbolic, and may or may not behave appropriately.
		' If you are unsure, use 'LoadString'. (Binary data may still need to use this extension)
		Function __OS_Unsafe__LoadArray:Int[](RealPath:String)="__os_LoadArray"
	#End
	
	Function SaveString:Int(Str:String, Path:String)
	Function LoadDir:String[](Path:String)
	Function CreateDir:Bool(Path:String)
	
	Function DeleteDir:Bool(Path:String)
	
	#If VIRTUALOS_EXTENSION_NATIVE_RECURSION
		Function DeleteDir:Bool(Path:String, Recursive:Bool)
	#End
	
	Function ChangeDir:Int(Path:String)
	Function CurrentDir:String()
	
	#If Not VIRTUALOS_MAP_ENV
		Function SetEnv:Int(Name:String, Value:String)
		Function GetEnv:String(Name:String)
	#End
	
	Function Execute:Int(CMD:String)
	
	#If Not VIRTUALOS_DEBUG
		Function ExitApp:Int(RetCode:Int)
	#Else
		Function _ExitApp:Int(RetCode:Int)="ExitApp"
	#End
	
	' Extensions:
	#If VIRTUALOS_EXTENSION_REMOTEPATH
		Function __OS_ToRemotePath:String(RealPath:String)="__os_toRemotePath"
	#End
	
	#If VIRTUALOS_EXTENSION_DL
		Function __OS_Download:String(URL:String)="__os_download_as_string"
		
		' Virtual file-system (JavaScript) extensions:
		#If VIRTUALOS_EXTENSION_VFILE ' VIRTUALOS_JS_TARGET
			Function __OS_DownloadFileUsingRep:String(Storage:StorageHandle, URL:String, Rep:String)="__os_downloadFileUsingRep"
			Function __OS_DownloadFile:Void(Storage:StorageHandle, RealPath:String)="__os_downloadFile"
		#End
	#End
	
	#If VIRTUALOS_EXTENSION_VFILE
		Function __OS_StorageSupported:Bool()="__os_storageSupported"
		Function __OS_CreateFileLink:Void(Rep:String)="__os_createFileLink"
	#End
	
	Public
	
	' Global variable(s) (Private):
	Private
	
	#If VIRTUALOS_MAP_ENV
		Global __OS_Env:= New StringMap<String>()
	#End
	
	#If VIRTUALOS_MAP_FILETIMES
		Global __OS_FileTimes:= New StringMap<Int>()
	#End
	
	Public
	
	' Functions (Monkey) (Public):
	
	' API:
	#If VIRTUALOS_MAP_ENV
		Function SetEnv:Void(Name:String, Value:String)
			__OS_Env.Set(Name, Value)
			
			Return
		End
		
		Function GetEnv:String(Name:String)
			Return __OS_Env.Get(Name)
		End
	#End
	
	#If VIRTUALOS_MAP_FILETIMES
		Function FileTime:Int(Path:String)
			Return __OS_FileTimes.Get(RealPath(Path)) ' FILETIME_UNAVAILABLE
		End
		
		Function CopyFile:Bool(Src:String, Dst:String)
			Local Result:= _CopyFile(Src, Dst)
			
			If (Result) Then
				__OS_SetFileTime(RealPath(Dst), FileTime(Src)) ' ; Return True
			Endif
			
			Return Result ' False
		End
		
		Function DeleteFile:Bool(Path:String)
			Local Result:= _DeleteFile(Path)
			
			If (Result) Then
				__OS_RemoveFileTime(RealPath(Path))
			Endif
			
			Return Result
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
	
	#If Not VIRTUALOS_EXTENSION_NATIVE_RECURSION
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
	#End
	
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
	
	' Debugging related:
	#If VIRTUALOS_DEBUG
		Function ExitApp:Int(RetCode:Int)
			DebugStop()
			
			_ExitApp(RetCode)
			
			Return 0
		End
	#End
	
	' Extensions:
	#If VIRTUALOS_MAP_FILETIMES
		Function __OS_SetFileTime:Void(RealPath:String, Time:Int)
			__OS_FileTimes.Set(RealPath, Time)
			
			Return
		End
		
		Function __OS_RemoveFileTime:Void(RealPath:String)
			__OS_FileTimes.Remove(RealPath)
			
			Return
		End
	#End
	
	#If VIRTUALOS_EXTENSION_VFILE
		#If VIRTUALOS_EXTENSION_DL
			Function __OS_AddFileSystem:Void(URL:String)
				Local FileData:= __OS_Download(URL)
				
				#If Not VIRTUALOS_STANDALONE
					Local SS:= New StringStream(FileData, ,,,, True)
				#Else
					Local Buf:= New DataBuffer(FileData.Length)
					
					Buf.PokeString(0, FileData)
					
					Local SS:= New DataStream(Buf)
				#End
				
				__OS_ParseFileSystem(SS)
				
				Return
			End
		#End
		
		Function __OS_ParseFileSystem:Void(S:Stream) ' StringStream
			__OS_ParseFileSystem(S, New StringStack())
			
			Return
		End
		
		Function __OS_ParseFileSystem_Update_ContextRep:String(Context:Stack<String>)
			Local Rep:String
			
			For Local Folder:= Eachin Context
				Rep += (Folder + "/")
			Next
			
			Return Rep
		End
		
		' A simple parser that takes each line of a 'Stream', and decodes a folder structure from the input.
		' The 'OpenPrefix' argument is used to toggle adding an extra slash before generated paths.
		Function __OS_ParseFileSystem:Void(S:Stream, Context:Stack<String>, OpenPrefix:Bool=True) ' StringStream
			' Constant variable(s):
			#If Not VIRTUALOS_STANDALONE
				Const DIVIDER:= ASCII_CHARACTER_SPACE
			#Else
				Const DIVIDER:= 32
			#End
			
			' Local variable(s):
			Local LastMasterPath:String
			
			Local Cache_Context:String
			
			While (Not S.Eof) ' Eof()
				Local Origin:= S.Position
				Local IsFileDescriptor:Bool
				
				' Not the best of methods:
				Local FirstChar:= S.ReadString(1) ' S.ReadByte() ' S.ReadChar()
				
				Select FirstChar
					Case "~n", "~r", "~t", " " ' 10, 13, 9, 32
						Continue
					Case "!" ' 33
						IsFileDescriptor = True
					Case "{" ' 123
						Context.Push(LastMasterPath)
						
						' Update the current context-cache.
						Cache_Context = __OS_ParseFileSystem_Update_ContextRep(Context)
						
						Continue
					Case "}" ' 125
						If (Not Context.IsEmpty) Then
							Context.Pop()
						Endif
						
						Cache_Context = __OS_ParseFileSystem_Update_ContextRep(Context)
						
						Continue
					Default
						IsFileDescriptor = False
						
						S.Seek(Origin)
				End Select
				
				Local Line:= S.ReadLine() ' Line.Replace("~t", "")
				
				Local Entries:String[] = Line.Split(",")
				
				If (Not IsFileDescriptor) Then
					LastMasterPath = Entries[Entries.Length-1]
				Endif
				
				' Not using 'EachIn' for performance reasons:
				For Local I:= 0 Until Entries.Length
					Local E:= Entries[I]
					Local E_Length:= E.Length
					
					E = Cache_Context + SmartClip(E, DIVIDER, E_Length)
					
					' Extensions:
					Local Time_First:= E.Find("[")
					
					If (Time_First <> STRING_INVALID_LOCATION) Then
						Local Processed_E:= E[..Time_First]
						
						#If VIRTUALOS_MAP_FILETIMES
							Local Time_Second:= E.Find("]")
							
							If (Time_Second <> STRING_INVALID_LOCATION) Then
								Local FTime:= Int(E[Time_First+1..Time_Second])
								
								If (FTime <> FILETIME_UNAVAILABLE) Then
									__OS_SetFileTime(RealPath(Processed_E), FTime)
								Endif
							Endif
						#End
						
						E = Processed_E
					Endif
					
					If (IsFileDescriptor) Then
						__OS_CreateFileLink(RealPath(E)) ' __OS_DownloadFile(__OS_Storage, RealPath(E))
					Else
						CreateDir(E)
					Endif
				Next
			Wend
			
			Return
		End
	#Else
		Function __OS_StorageSupported:Bool()
			Return False
		End
	#End
	
	' Functions (Monkey) (Private):
	Private
	
	#If VIRTUALOS_STANDALONE
		' Ripped from 'regal.stringutil':
		Function SmartClip:String(Input:String, Symbol:Int)
			Return SmartClip(Input, Symbol, Input.Length)
		End
		
		Function SmartClip:String(Input:String, Symbol:Int, Length:Int)
			' Local variable(s):
			Local FinalChar:= (Length - 1)
			
			Local XClip:Int
			Local YClip:Int
			
			If (Input[0] = Symbol) Then
				XClip = 1
			Else
				XClip = 0
			Endif
			
			If (Input[FinalChar] = Symbol) Then
				YClip = FinalChar
			Else
				YClip = Length
			Endif
			
			If (XClip <> 0 Or YClip <> 0) Then
				Return Input[XClip..YClip]
			Endif
			
			Return Input
		End
	#End
	
	Public
#End