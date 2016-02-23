Strict

Public

#Rem
	This acts as a compatibility-layer with the official 'brl' implementation.
	
	This API intends to be as accurate as possible, allowing
	users to build consistent codebases between platforms.
#End

' Imports (Public):
Import brl.stream

' Imports (Private):
Private

Import regal.ioutil.publicdatastream

Import legend

Public

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
			Default
				Throw New FileStreamOpenException("Invalid file-mode detected.", Path, Self)
		End Select
		
		Return
	End
	
	Public
End

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