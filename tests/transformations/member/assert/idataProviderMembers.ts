import {DataProviderBase} from 'yfiles'

class myDataProvider extends DataProviderBase{

}

const dataProvider = new myDataProvider()
dataProvider./*TODO-Migration getInt has been removed. Use 'get', NOTE: Check the default return's type.*/getInt({})