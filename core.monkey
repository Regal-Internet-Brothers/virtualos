Strict

Public

' Imports:
Import config

' Ensure the module is implemented, before continuing:
#If VIRTUALOS_IMPLEMENTED
	' Check if we're importing a main file:
	#If VIRTUALOS_DEFAULT_FILE
		Import "native/os.${LANG}"
	#End
	
	' For JavaScript, these are core modules (Must be imported):
	#If VIRTUALOS_JS_TARGET ' VIRTUALOS_TRADITIONAL
		Import "native/meta.${LANG}"
		Import "native/convert.${LANG}"
	#End
	
	' External bindings:
	Extern
	
	' Extensions:
	
	' Global variable(s) (External) (Private):
	Extern Private
	
	' If you are supporting these extensions, please provide '__OS_Storage'.
	#If VIRTUALOS_EXTENSION_VFILE
		#If VIRTUALOS_JS_TARGET
			' Modification of this variable will result in undefined behavior.
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
	#If VIRTUALOS_EXTENSION_REMOTEPATH
		Function __OS_ToRemotePath:String(RealPath:String)="__os_toRemotePath"
	#End
	
	#If VIRTUALOS_EXTENSION_STORAGE_CAPABILITIES
		' This states if storage is supported in some form. ('Storage' type for JavaScript)
		Function __OS_StorageSupported:Bool()="__os_storageSupported"
		
		Function __OS_LocalStorageAvailable:Bool()="__os_localStorageAvailable"
		Function __OS_SessionStorageAvailable:Bool()="__os_sessionStorageAvailable"
	#End
	
	Public
	
	' Functions (Public):
	
	' Extensions:
	
	' Fallbacks (May not represent implementation):
	#If Not VIRTUALOS_EXTENSION_STORAGE_CAPABILITIES
		Function __OS_LocalStorageAvailable:Bool()
			Return True
		End
		
		Function __OS_SessionStorageAvailable:Bool()
			Return False
		End
	#End
#End