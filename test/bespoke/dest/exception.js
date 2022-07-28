import { Exception } from "yfiles";

// Specific Exception types have been removed.
// Replace with Exception, pass type as name
throw new Exception("ohmygod", "InvalidOperationException");

var isInstance = e instanceof Exception
