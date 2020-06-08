import { Exception } from "yfiles";

// Specific Exception types have been removed.
// Replace with Exception, pass type as name
throw new Exception("ohmygod", "InvalidOperationException");

const isInstance = e instanceof Exception;
