Strict

Public

' Preprocessor related:
' Nothing so far.

' Imports:
Import config

#If VIRTUALOS_IMPLEMENTED
	#If VIRTUALOS_DEFAULT_FILE
		Import "native/os.${LANG}"
	#End
#End

' When 'VIRTUALOS_IMPLEMENTED' is set to 'False',
' these modules may still act as import-redirects:
Import filepath
Import filesystem
Import process
Import legend