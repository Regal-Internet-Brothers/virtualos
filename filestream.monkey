Strict

Public

#Rem
	This acts as a compatibility-layer with the official 'brl' implementation.
	
	This API intends to be as accurate as possible, allowing
	users to build consistent codebases between platforms.
	
	ATTENTION: This sub-module does not follow the "standalone" behavioral
	rules applied to the other modules.
	
	To use this sub-module, you must have the 'regal.ioutil.publicdatastream'
	module installed, and any dependencies it requires.
	
	In addition, this uses both the standard 'brl.stream' module,
	as well as the internal file-system modules/extensions.
#End

' Preprocessor related:
#If VIRTUALOS_CREATEFILE_IMPLEMENTED And (VIRTUALOS_EXTENSION_LOADBUFFER Or VIRTUALOS_EXTENSION_SAVEBUFFER)
	#VIRTUALOS_FILESTREAM_IMPLEMENTED = True
#End

#If VIRTUALOS_EXTENSION_LOADBUFFER
	#VIRTUALOS_FILESTREAM_CAN_LOAD = True
#End

#If VIRTUALOS_EXTENSION_SAVEBUFFER
	VIRTUALOS_FILESTREAM_CAN_SAVE = True
#End

' Imports (Public):
Import brl.stream

' Imports (Private):
Private

#If VIRTUALOS_FILESTREAM_IMPLEMENTED
	Import regal.ioutil.publicdatastream
	
	Import filesystem
	Import legend
#End

Public

#If VIRTUALOS_FILESTREAM_IMPLEMENTED
	' Classes:
	Class FileStream Extends PublicDataStream
		' Constant variable(s):
		
		' Defaults:
		Const Default_Size:= 4096 ' 4KB
		
		' Functions:
		Function Open:FileStream(Path:String, Mode:String)
			Try
				Return New FileStream(Path, Mode)
			Catch E:StreamError
				' Nothing so far.
			End
			
			Return Null
		End
		
		' Constructor(s) (Public):
		Method New(Path:String, Mode:String, Size:Int=Default_Size, FixByteOrder:Bool=Default_BigEndianStorage, SizeLimit:Int=NOLIMIT)
			Super.New(Size, FixByteOrder, True, SizeLimit)
			
			EstablishStream(Path, Mode)
		End
		
		' Constructor(s) (Protected):
		Protected
		
		Method EstablishStream:Void(Path:String, Mode:String)
			Select Mode
				Case "r", "u"
					ReadFileData(RealPath(Path), True)
				Case "a"
					ReadFileData(RealPath(Path), False)
				Case "w"
					CreateFile(Path)
				Default
					Throw New FileStreamOpenException("Invalid file-mode detected.", Path, Self)
			End Select
			
			Self.Path = Path
			Self.Mode = Mode
			
			Return
		End
		
		Public
		
		' Methods (Public):
		Method Close:Void()
			' Push data to the file-system.
			WriteFileData(RealPath(Self.Path))
			
			' Close the stream properly.
			Super.Close()
			
			Return
		End
		
		' Methods (Protected):
		Protected
		
		Method ReadFileData:DataBuffer(RealPath:String, ResetPosition:Bool=True)
			Local Contents:= __OS_LoadBuffer(RealPath)
			
			If (Contents = Null) Then
				Return Null
			Endif
			
			Local Position:= Self.Position
			
			WriteAll(Contents, 0, Contents.Length)
			
			If (ResetPosition) Then
				Seek(Position)
			Endif
			
			Return Contents
		End
		
		Method WriteFileData:Bool(RealPath:String)
			Local Output:= New DataBuffer(Self.Length)
			
			Self.Data.CopyBytes(Offset, Output, 0, Length)
			
			If (Not __OS_SaveBuffer(RealPath, Output)) Then
				Return False
			Endif
			
			'Output.Discard()
			
			' Return the default response.
			Return True
		End
		
		Public
		
		' Fields (Protected):
		Protected
		
		Field Path:String, Mode:String
		
		Public
	End
#End

' Exceptions:
Class FileStreamOpenException Extends StreamError
	' Constructor(s):
	Method New(Message:String, Path:String, FS:FileStream)
		Super.New(FS)
		
		Self.Message = Message
	End
	
	' Methods:
	Method ToString:String() ' Property
		Return Message
	End
	
	' Fields (Protected):
	Protected
	
	Field Message:String
	
	Public
End