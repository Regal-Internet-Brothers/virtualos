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
		#Else
			#If VIRTUALOS_REAL_FILESYSTEM
				Import brl.filesystem
			#End
		#End
	#End
#Else
	#If Not VIRTUALOS_TRADITIONAL
		Import "native/filesystem.js"
	#ENd
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
	Function RealPath:String(Path:String)
	Function FileType:Int(Path:String)
	Function FileSize:Int(Path:String)
	
	#If Not VIRTUALOS_MAP_FILETIMES
		Function FileTime:Int(Path:String)
		
		Function CopyFile:Bool(Src:String, Dst:String)
		Function DeleteFile:Bool(Path:String)
	#Else
		Function __CopyFile:Bool(Src:String, Dst:String)="CopyFile"
		Function __DeleteFile:Bool(Path:String)="DeleteFile"
	#End
	
	Function LoadDir:String[](Path:String)
	Function CreateDir:Bool(Path:String)
	
	Function DeleteDir:Bool(Path:String)
	
	#If VIRTUALOS_EXTENSION_NATIVE_RECURSION
		Function DeleteDir:Bool(Path:String, Recursive:Bool)
	#End
	
	' Extensions:
	#If VIRTUALOS_EXTENSION_REMOTEPATH
		Function __OS_ToRemotePath:String(RealPath:String)="__os_toRemotePath"
	#End
	
	#If VIRTUALOS_EXTENSION_CUSTOM_FILETIMES
		Function __OS_SetFileTime:Void(RealPath:String, Time:Int)="__os_set_FileTime"
		Function __OS_RemoveFileTime:Void(RealPath:String)="__os_remove_FileTime"
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
	
	#If VIRTUALOS_MAP_FILETIMES
		Global __OS_FileTimes:= New StringMap<Int>()
	#End
	
	Public
	
	' Functions (Monkey) (Public):
	
	' API:
	#If VIRTUALOS_MAP_FILETIMES
		Function FileTime:Int(Path:String)
			Return __OS_FileTimes.Get(RealPath(Path)) ' FILETIME_UNAVAILABLE
		End
		
		Function CopyFile:Bool(Src:String, Dst:String)
			Local Result:= __CopyFile(Src, Dst)
			
			If (Result) Then
				__OS_SetFileTime(RealPath(Dst), FileTime(Src)) ' ; Return True
			Endif
			
			Return Result ' False
		End
		
		Function DeleteFile:Bool(Path:String)
			Local Result:= __DeleteFile(Path)
			
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
			Local DstP:= (DestinationPath + "/" + F)
			
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
		Function DeleteDir:Bool(Path:String, Recursive:Bool)
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
	#Else
		#If Not VIRTUALOS_EXTENSION_CUSTOM_FILETIMES
			Function __OS_SetFileTime:Void(RealPath:String, Time:Int)
				Return
			End
			
			Function __OS_RemoveFileTime:Void(RealPath:String)
				Return
			End
		#End
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
		
		Function __OS_ParseFileSystem_CreateFileEntry:Void(Entry:String, IsFileDescriptor:Bool)
			If (IsFileDescriptor) Then
				__OS_CreateFileLink(RealPath(Entry)) ' __OS_DownloadFile(__OS_Storage, RealPath(Entry))
			Else
				CreateDir(Entry)
			Endif
			
			Return
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
						
						__OS_ParseFileSystem_CreateFileEntry(Processed_E, IsFileDescriptor)
						
						#If VIRTUALOS_MAP_FILETIMES
							Local Time_Second:= E.Find("]")
							
							If (Time_Second <> STRING_INVALID_LOCATION) Then
								Local FTime:= Int(E[Time_First+1..Time_Second])
								
								If (FTime <> FILETIME_UNAVAILABLE) Then
									__OS_SetFileTime(RealPath(Processed_E), FTime)
								Endif
							Endif
						#End
					Else
						__OS_ParseFileSystem_CreateFileEntry(E, IsFileDescriptor)
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