Strict

Public

' Preprocessor related:
#If LANG = "js"
	#VIRTUALOS_DEMO_SAVEANDLOAD_JS_ASK = True
#End

' Imports:
Import regal.virtualos

' External bindings:
Extern

#If VIRTUALOS_DEMO_SAVEANDLOAD_JS_ASK
	Function Confirm:Bool(Message:String)="confirm"
#End

Public

' Functions:
Function Main:Int()
	' Constant variable(s):
	Const MessagePath:= "internal/Thing.txt"
	
	' Local variable(s):
	Local Message:= "This is a test."
	
	Print("Loading a message from ~q" + MessagePath + "~q...")
	
	Local LoadedVersion:= LoadString(MessagePath)
	
	If (LoadedVersion.Length = 0) Then
		Print("Loading failed; creating file entry.")
		
		Print("Saving '" + Message + "' to ~q" + MessagePath + "~q.")
		
		SaveString(Message, MessagePath)
		
		Print("Done.")
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

#If Not VIRTUALOS_DEMO_SAVEANDLOAD_JS_ASK
	Function Confirm:Bool(Message:String)
		Return True ' False
	End
#End