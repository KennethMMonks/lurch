
# Background Workers (Class Definition)

This file defines a class that encapsulates the functionality we need in the
background workers the [LDE](lde.litcoffee) will use.
 * This file is intended to be imported by anyone who wishes to create
   instance of the `Worker` class.
 * [A separate file](worker-internal.litcoffee) contains the code that will
   be loaded into the worker's background thread to give it the
   functionality with which this class interfaces.

## Import modules

Import the `Worker` class if it isn't already defined.  In the browser, it
should already be defined.  But in Node.js, we need to import the
`webworker-threads` package to define it.

Also, if we're in Node.js, then we assume (for now) that we are being run
as part of the unit tests of the LDE, from the root of the project
repository.  We therefore set a different path to the inner script the
workers need to load than we would set in the browser.

Later, we will want to support Node.js-based uses of this module other than
in the unit testing suite, and this will need to be made more flexible.

    if require? and not Worker?
        { Worker } = require 'webworker-threads'
        InnerScriptPath = 'release/worker-internal.js'
    else
        InnerScriptPath = 'worker-internal.js'

## Define the `LDEWorker` Class

We define a class that clients of this module can create and treat as the
encapsulation of a background thread.  We call it `LDEWorker` because of
course `Worker` is already taken in the browser namespace.

    class LDEWorker

We need a simple method for associating callbacks with tasks we send to the
worker, so we have the following functions that assign unique IDs to
callbacks when asked, retrieve such callbacks by their ID, and delete them
when we're done with them.

        saveCallback : ( callback ) ->
            nextFreeId = 0
            while @callbacks.hasOwnProperty nextFreeId then nextFreeId++
            @callbacks[nextFreeId] = callback
            nextFreeId
        runAndClearCallback : ( data ) ->
            callback = @callbacks[data.id]
            delete @callbacks[data.id]
            delete data.id
            callback? data

Constructing one creates an inner instance of a `Worker` to which we will
pass many of the tasks defined below, once it is correctly set up.

        constructor : ->
            @callbacks = { }
            @worker = new Worker InnerScriptPath

We install an event handler for all messages coming out of the worker.  We
guarantee, in the worker's code, that every response message that comes back
will contain the same ID that was given in the request for which it is the
response.  This allows us to look up and call the correct callback, then
uninstall that callback because the task is complete.

            @worker.addEventListener 'message', ( event ) =>
                @runAndClearCallback event.data

The following function abstracts the idea of sending a message to the worker
and associating a callback with it.

        dispatch : ( message, callback ) ->
            message.id = @saveCallback callback
            @worker.postMessage message

### Running code in a worker

The chief purpose of background threads is to run code and then notify you
when it's done, and what the result was.  We provide the following API for
doing so.  It is essentially a simple `eval` call in the worker, with all
the appropriate caveats that come with that.

        run : ( code, callback ) ->
            @dispatch type : 'run', code : code, callback

### Support installing scripts

`Worker` instances support installing scripts in the worker.  Simply call
the following method and the appropriate message is passed to the worker.
It knows how to respond by calling its built-in `importScripts` function.
The optional callback is called when the action completes, with an object
containing a few fields describing the action taken.

        installScript : ( filename, callback ) ->
            @dispatch type : 'install', filename : filename, callback

Now if this is being used in a Node.js context, export the class we defined.

    if exports? then exports.LDEWorker = LDEWorker
