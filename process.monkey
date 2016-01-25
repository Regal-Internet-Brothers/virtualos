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
			#If VIRTUALOS_REAL_PROCESS
				Import brl.process
			#End
		#End
	#End
#Else
	'Import "native/process.js"
#End

#If VIRTUALOS_IMPLEMENTED
	' External bindings:
	Extern
	
	' Functions (External):
	
	' API:
	Function AppPath:String()
	Function AppArgs:String[]()
	
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
		Function __ExitApp:Int(RetCode:Int)="ExitApp"
	#End
	
	Public
	
	' Global variable(s) (Private):
	Private
	
	#If VIRTUALOS_MAP_ENV
		Global __OS_Env:= New StringMap<String>()
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
	
	' Debugging related:
	#If VIRTUALOS_DEBUG
		Function ExitApp:Int(RetCode:Int)
			DebugStop()
			
			__ExitApp(RetCode)
			
			Return 0
		End
	#End
#End