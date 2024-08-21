
/*
 * @file durable/constants.ts
 * 
 */
// constructor for durable object
// state -> state specific to the object
// env -> binding associated with worker made
//

import { Jwt } from "hono/utils/jwt";

// worker fetch the object 
export class MyDurableObject {
  constructor(state: DurableObjectState, env: Env) {}
}

// Durable objects communicate via fetch using an id 
// we should have id of every object we are usign 
let id = OBJECT_NAMESPACE.newUniqueId();

// Parse previously-created IDs from strings 
// exception on ID wasnt originally created 
let id = OBJECT_NAMESPACE.idFromString(hexId);

// If the method fails with an uncaught exception, the exception will be thrown into the calling Worker that made the fetch() request.
//
//  Stub is used to send request to the remote durable
let response = await stub.fetch(request);

// http to communicate with durable
let response = await durableObjectStub.fetch(request);
// Alternatively, passing a URL directly:
let response = await durableObjectStub.fetch(url, options);


