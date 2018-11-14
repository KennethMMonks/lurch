
# Output Structures

The LDE module constructs, for its internal use, a hierarchy of
`OutputStructure` instances called the Output Tree.  The word "output" is
used because it is the output of an interpretation process defined
throughout the subclasses of `InputStructure`.

These have entirely different functionality than their cousins
`InputStructure` instances.  In short, these support validation while
`InputStructure`s support interpretation.  You can also think of the
difference as this:  `InputStructure`s represent the syntax of what the user
has expressed to the client, and `OutputStructure`s represent the semantics
into which we interpret that syntax.

## Import modules

Import the `Structure` class.  The following lines detect whether this
is being used in Node.js or a WebWorker, or a WebWorker-like background
thread within Node.js, and do the right thing in any case.

In the Worker cases, it is important not to call `importScripts` on the same
module more than once from different files, or all manner of confusing logic
errors manifest at runtime, hence the checks below.

    if require?
        { Structure } = require './structure'
        { InputStructure } = require './input-structure'
    else if WorkerGlobalScope?
        if not WorkerGlobalScope.Structure?
            importScripts 'structure.js'
            importScripts 'input-structure.js'
    else if self?.importScripts?
        if not self.Structure?
            importScripts 'release/structure.js'
            importScripts 'release/input-structure.js'

## Define the `OutputStructure` class

    class OutputStructure extends Structure

In order for a hierarchy of structures to be able to be serialized and
deserialized, we need to track the class of each structure in the hierarchy.
We do so for this class with the following line of code.

        className : Structure.addSubclass 'OutputStructure', OutputStructure

Marking an `OutputStructure` dirty, unlike with `InputStructure`s, does not
propagate up the ancestor chain.  Thus we define the following function
analogous to the one in the `InputStructure` class, but without the
recursive propagation.

        markDirty : ( yesOrNo = yes ) -> @dirty = yesOrNo

A newly constructed instance should be considered dirty (because it probably
just changed and thus may need to be validated).  It should also record the
`InputStructure` instance that gave rise to it, if indeed this construction
happend as part of interpretation.

        constructor : ->
            super arguments...
            @markDirty()
            IS = Structure::subclasses.InputStructure
            if len = IS::instancesBeingInterpreted?.length
                @origin = IS::instancesBeingInterpreted[len-1]

Similar to tracking origins for `OutputStructure` nodes, if a connection is
formed between `OutputStructure` instances, we will want to track its origin
in the sense of which `InputStructure` was being interpreted when the
connection was formed.

        addConnectionOrigin : ( source, target, data ) ->
            IS = Structure::subclasses.InputStructure
            if ( target instanceof OutputStructure ) and \
               ( len = IS::instancesBeingInterpreted?.length )
                data._origin = IS::instancesBeingInterpreted[len-1].id()

## Feedback

To give feedback about a particular `OutputStructure` instance, find the
`InputStructure` instance that created this `OutputStructure` and if there
is such a thing, call the `feedback` method in it.  (That will delegate the
work further, but that is not our concern here.)

        feedback : ( feedbackData ) -> @origin?.feedback feedbackData

## Labels

`OutputStructure`s can be labeled.  This is implemented by a function that
takes a string as input and returns true or false, whether the structure has
that label.  This permits a lot of freedom in how we match labels to
structures, including case sensitivity, punctuation sensitivity, multiple
labels, and so on.  By default, however, everything is unlabeled, so the
base implementation is as follows.

        hasLabel : ( label ) -> no

We can look back through a list of all the `OutputStructure`s accessible to
a given one, seeking the first one that admits to having a given label, by
use of the `hasLabel()` function on each accessible structure.  We implement
that generically with the following class method, then make a shortcut for
use by instances below.  Here we assume that the accessibles array is given
in the order in which the nodes appear in the tree
(`Structure.isEarlierThan()`).

        @lookupIn : ( label, accessibles ) ->
            for candidate in accessibles[...].reverse()
                return candidate if candidate.hasLabel label
            null

When an instance asks to look up the nearest accessible thing with a given
label, what it means is among those things accessible to that instance.

        lookup : ( label ) ->
            @firstAccessible ( candidate ) -> candidate.hasLabel label

Now if this is being used in a Node.js context, export the class we defined.

    if exports? then exports.OutputStructure = OutputStructure

## Other `OutputStructure` Subclasses

None yet.  More to come.
