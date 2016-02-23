Strict

Public

' Preprocessor related:
#If TARGET = "html5"
	#FILE_STREAMING_DEMO_VOS = True
#End

' Imports:
Import monkey.deque
Import brl.stream

#If FILE_STREAMING_DEMO_VOS
	Import regal.virtualos.filestream
	Import regal.virtualos.filesystem
#Else
	Import brl.filestream
	Import brl.filesystem
#End

' Functions:
Function Main:Int()
	' Constant variable(s):
	Const OutputFile:String = "output.txt"
	
	' Local variable(s):
	Local Failed:Bool = False
	
	Try
		Print("Writing information to the file-system...")
		
		WriteDemoFile(OutputFile)
		
		Print("Reading from the file-system...")
		
		Local Lines:= ReadDemoFile(OutputFile)
		
		Print("File contents loaded.")
		
		PrintLines(Lines, "Content:")
		
		Print("Cleaning up the file-entry.")
		
		' Remove the file we created.
		If (DeleteFile(OutputFile)) Then
			Print("File-entry destroyed.")
		Else
			Print("Insufficient file-permissions, continuing anyway...")
		Endif
	Catch E:StreamError
		Print("An error occurred while executing:")
		Print(E)
		
		Failed = True
	Catch E:Throwable
		Print("An unknown error occurred:")
		'Print(E)
		
		Failed = True
	End
	
	If (Failed) Then
		Print("Program execution stopped: Critical error.")
		
		Return -1
	Endif
	
	Print("Execution finished: No outstanding errors.")
	
	' Return the default response.
	Return 0
End

Function PrintLines:Void(Lines:Deque<String>, Prefix:String="")
	Local HasPrefix:Bool = (Prefix.Length > 0)
	
	If (HasPrefix) Then
		Print(Prefix)
	Endif
	
	For Local Line:= Eachin Lines
		Print("     * " + InSingleQuotes(Line)) ' "~t "
	Next
	
	If (HasPrefix) Then
		Print("")
	Endif
	
	Return
End

Function ReadDemoFile:StringDeque(Path:String)
	Local F:= FileStream.Open(Path, "r")
	
	If (F = Null Or F.Eof) Then
		Throw New StreamFailure("Unable to open input stream at " + InQuotes(Path), F)
	Endif
	
	Local Output:= New StringDeque()
	
	While (Not F.Eof)
		Output.PushLast(F.ReadLine())
	Wend
	
	F.Close()
	
	Return Output
End

Function WriteDemoFile:Void(Path:String, AppendTest:Bool=True)
	' Local variable(s):
	Local F:= FileStream.Open(Path, "w")
	
	If (F = Null) Then
		Throw New StreamFailure("Unable to open output stream at " + InQuotes(Path), F)
	Endif
	
	F.WriteLine("Hello world.")
	
	If (AppendTest) Then
		F.Close()
		
		F = New FileStream(Path, "a")
		
		If (F = Null) Then
			Throw New StreamFailure("Unable to reopen output stream at " + InQuotes(Path), F)
		Endif
	Endif
	
	#If FILE_STREAMING_DEMO_VOS
		F.WriteLine("This file was written with the 'regal.virtualos.filestream' module.")
	#Else
		F.WriteLine("This file was written with the 'brl.filestream' module.")
	#End
	
	F.Close()
	
	Return
End

Function InQuotes:String(Value:String)
	Return ("~q" + Value + "~q")
End

Function InSingleQuotes:String(Value:String)
	Return ("'" + Value + "'")
End

' Classes:
Class StreamFailure Extends StreamError
	' Constructor(s):
	Method New(Message:String, S:Stream=Null)
		Super.New(S)
		
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