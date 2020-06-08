import { FreeNodePortLocationModel } from "yfiles";
// "NodeScaledPortLocationModel has been replaced by FreeNodePortLocationModel that
// allows to specify the port location by a ratio of the node layout’s size and an additional offset."
FreeNodePortLocationModel.INSTANCE.createParameterForRatios(point.x + 0.5, point.y + 0.5);
