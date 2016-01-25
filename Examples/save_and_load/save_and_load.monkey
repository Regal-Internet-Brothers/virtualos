Strict

Public

' Preprocessor related:
#If LANG = "js"
	#VIRTUALOS_DEMO_SAVEANDLOAD_JS_EXTS = True
#End

' Imports:
Import regal.virtualos.os

' External bindings:
Extern

#If VIRTUALOS_DEMO_SAVEANDLOAD_JS_EXTS
	Function Confirm:Bool(Message:String)="confirm"
	Function Alert:Void(Message:String)="alert"
#End

Public

' Functions:
Function Main:Int()
	' Constant variable(s):
	Const MessagePath:= "Thing.txt"
	
	' Local variable(s):
	Local Message:= "This is a test."
	
	Print("Loading a message from ~q" + MessagePath + "~q...")
	
	Local LoadedVersion:= LoadString(MessagePath)
	
	If (LoadedVersion.Length = 0) Then
		Print("Loading failed; creating file entry.")
		
		Print("Saving '" + Message + "' to ~q" + MessagePath + "~q...")
		
		Local SaveResponse:= SaveString(Message, MessagePath)
		
		Print("Response from 'SaveString': " + SaveResponse)
		
		If (SaveResponse = 0) Then
			Print("Done.")
			
			Alert("File entry created.")
		Else
			Print("Unable to create file entry.")
		Endif
	Else
		Print("Done; resulting message:")
		Print("'" + Message + "'")
		
		If (Confirm("Would you like to remove the entry?")) Then
			Print("Removing entry from file-system...")
			
			If (DeleteFile(MessagePath)) Then
				Print("File ~q" + MessagePath + "~q has been deleted.")
			Else
				Print("Failed to delete ~q" + MessagePath + "~q; internal error.")
			Endif
		Endif
	Endif
	
	Print("Operations finished, exiting.")
	
	' Return the default response.
	Return 0
End

#If Not VIRTUALOS_DEMO_SAVEANDLOAD_JS_EXTS
	Function Confirm:Bool(Message:String)
		Return True ' False
	End
	
	Function Alert:Void(Message:String)
		Print("{ALERT}: " + Message)
		
		Return
	End
#End