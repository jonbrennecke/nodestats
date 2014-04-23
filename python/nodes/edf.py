from nodes import *
import struct


class EDFNode( NodeBase ) :

    """

    for interpreting EDF (European Data Format) files

    @see http://www.edfplus.info/specs/index.html

    @inputs raw - raw file data
    @outputs array - array of formatted data

    """

    def __init__( self, id ):
        super( EDFNode, self ).__init__( id )

        self.inputs = {
            'raw' : NodeLink( self )
        }

        self.fields = {
            "file" : { "type" : "open-file-dialog", "value" : None }
        }

        self.outputs = {
            'header' : NodeLink( self ),
            'records' : NodeLink( self, scope="data" )
        }


    def compute( self ) :
        
        """

        read the edf into a data structure

        """

        with open( self.fields['file']['value'], 'r' ) as fobj :
            data = self.read( fobj )

            # TODO really need a better way to do this that doesn't involve passing values
            self.outputs['header'].set( data['header'] )
            self.outputs['records'].set( data['records'] )

            return True



    def read( self, fileobj ) :

        """
        
        Parse EDF file information based on the EDF/EDF+ specs
        @see http://www.edfplus.info/specs/index.html

        TODO this is definitely a bit slow and could be a bottleneck in reading lots of 
        EDFs at once; consider ways to counteract that or possibly rewrite in C
        
        """

        print " >> reading EDF file from " + fileobj.name

        data = fileobj.read()
        header = {}
        records = []

        # the first part of the header contains basic information about the file (256 bytes)

        header['version'] = data[0:7].strip()
        header['patient_id'] = data[7:88].strip()
        header['rec_id'] = data[88:168].strip()
        header['startdate'] = data[168:176].strip()
        header['starttime'] = data[176:184].strip()
        header['header_bytes'] = int(data[184:192].strip())
        header['num_items'] = int(data[236:244].strip())
        header['data_duration'] = float(data[244:252].strip())
        header['num_signals'] = int(data[252:256].strip())

        # the second part of the header contains information about each of the individual signals (num_signals * 256 bytes)

        lengths = [ 16, 80, 8, 8, 8, 8, 8, 80, 8, 32 ]
        values = [ [] for x in lengths ] 

        start = 256
        for i, l in enumerate( lengths ) :
            for j in range( 1, header[ 'num_signals' ] + 1 ) : 
                value = data[ start : start + l ].split()
                values[i].append( value[0] if len( value ) > 0 else None )
                start += l 

        headerkeys = [ 'labels', 'transducer', 'dimension', 'phys_min', 'phys_max', 'dig_min', 'dig_max', 'prefiltering', 'num_samples' ]

        for i, key in enumerate( headerkeys ) :
            header[key] = values[i]

        # the data record begins at 256 * ( num_signals * 256 ) bytes and is stored as n records of 2 * num_samples bytes
        # values are stored as 2 byte ascii in 2's complement

        for i in range( 0, header['num_signals'] ) :
            size = int(header['num_samples'][i]) * 2
            binary = data[ start : start + size ]
            start += size

            # every 2 bytes is an integer (in little endian 2's complement hex)
            twoComp = [ a+b for a, b, in zip( binary[::2], binary[1::2] ) ]

            # unpack little endian  ascii into integers
            records.append( [ int(struct.unpack( '<H', b )[0]) for b in twoComp ] )

        return {'header': header, 'records': records}

