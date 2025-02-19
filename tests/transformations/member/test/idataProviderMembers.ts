import {DataProviderBase} from 'yfiles'

class myDataProvider extends DataProviderBase{

}

const dataProvider = new myDataProvider()
dataProvider.getInt({})