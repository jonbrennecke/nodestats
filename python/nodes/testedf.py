import edf

data = edf.read( "../../testfile.edf" )

print data['header']

