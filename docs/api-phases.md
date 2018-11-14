
# API Documentation for the LDE's Phases

The LDE processes the Input Tree into the Output Tree and also does some
processing of the Output Tree as well.  This all happens in several phases
that proceed in sequence, each working with the output of the previous. We
document those phases below.

This documentation is not yet complete, because the phases have not yet all
been implemented.

## Modification

The modification phase is the briefest.  It is implemented in the LDE's
`runModification()` phase in its API, documented [here](https://github.com/lurchmath/lde/blob/master/src/lde.litcoffee#the-modification-phase).

That function loops through all `InputModifier` instances in the Input Tree
and calls the `updateConnections()` routine in each.  Each modifier should
take that opportunity to connect itself to the correct modification targets.
The reason for this is because those connections will govern, in the
subsequent interpretation phase, which expressions ask which modifiers to
embed data in the expressions.  In order for the expressions to make those
requests correctly, the modifiers need to decide in the modification phase
which expressions they should target.

## Interpretation

The interpretatin phase follows immediately after the modification phase;
indeed, the modification phase terminates by passing control directly to the
interpretation phase.

In this phase, the contents of the Input Tree (which can be thought of as a
generalized kind of syntax, representing anything the user wrote in the
client and the client passed on to the LDE) are *interpreted* into the
Output Tree (which can be thought of as the usable mathematical meaning of
the user's content).  Thus this phase is like a compiler in computer
science, or an interpretation function in model theory; it maps syntax to
(actionable) semantics.

It is implemented in the `runInterpretation()` method of the LDE's API,
documented [here](https://github.com/lurchmath/lde/blob/master/src/lde.litcoffee#the-modification-phase).

That function runs `recursiveInterpret()` on the root of the Input Tree, a
function implemented in [the InputStructure class](https://github.com/lurchmath/lde/blob/master/src/input-structure.litcoffee).
That function recursively traverses the Input Tree, runs the `interpret()`
function at each node, and assembles their results into the new Output Tree.

Some types of policing are done to ensure that `recursiveInterpret()` and
`interpret()` behave as they ought to, even if they are redefined in
subclasses not yet written.  For more information, see the errors that may
be generated as feedback, [documented here](api-lde.md#types-of-feedback).

## Validation

This phase is not yet implemented nor documented.
