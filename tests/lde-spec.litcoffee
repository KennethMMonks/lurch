
# Tests of the main module

Here we import the module we're about to test.

    LDE = require '../src/lde.litcoffee'
    Structure = LDE.Structure
    InputStructure = LDE.InputStructure

## LDE members

The LDE module is a wrapper that collects the functionality built
throughout this repository into a single API endpoint, and exposes it.
Here we just test to be sure that it exposes all the things it's supposed
to.

    describe 'LDE global object members', ->

Verfiy that all the API endpoints that should be exported by the module are
indeed exported.

        it 'should be defined', ->
            expect( LDE.Structure ).toBeTruthy()
            expect( LDE.InputStructure ).toBeTruthy()
            expect( LDE.getInputTree ).toBeTruthy()
            expect( LDE.insert ).toBeTruthy()
            expect( LDE.delete ).toBeTruthy()
            expect( LDE.replace ).toBeTruthy()
            expect( LDE.setAttribute ).toBeTruthy()

## Input Tree Editing API

The LDE provides a global Input Tree object that we can edit with the four
functions in the API (`insert`, `delete`, `replace`, and `setAttribute`).
We use those functions here to create and modify the Input Tree in several
ways, each time comparing the results to JSON structures of what they
should be.

    describe 'Input Tree editing API', ->

All of the tests below are going to modify the Input Tree.  We want to
ensure that after each such tests, we clear out all the changes it made, so
that tests that follow it start from a pristine state (an Input Tree with a
root only, no children).

        afterEach ->
            while LDE.getInputTree().children().length > 0
                toDelete = LDE.getInputTree().children()[0]
                toDelete.removeFromParent()
                toDelete.untrackIDs()

The LDE should begin life with an empty Input Tree, that is, a root with no
attributes and no children, and an instance of the `InputStructure` class.

        it 'should begin with an empty Input Tree with ID "root"', ->
            serialized = LDE.getInputTree().toJSON()
            expect( serialized.className ).toBe 'InputStructure'
            expect( serialized.children ).toEqual [ ]
            expect( serialized.attributes ).toEqual { id : 'root' }

In order for us to work with the Input Tree, we will need the root to have
an ID that we can pass to various editing functions.  Let's verify that it
has one, and that it is "root" as it should be.

        it 'should give the Input Tree root the ID "root"', ->
            expect( LDE.getInputTree().id() ).toBe 'root'

The first piece of the LDE API we test is that for inserting new children of
the root, or various descendants of that root.

        it 'should permit inserting serialized Input Structures', ->

Define some structures that we will want to insert.

            A = new InputStructure().attr text : 'some text', id : 'A'
            B = new InputStructure().attr reference : yes, id : 'B'
            C = new InputStructure().attr name : 'C', id : 'C'

Insert one and verify that it has been added and its ID tracked.

            expect( -> LDE.insert A.toJSON(), 'root', 0 ).not.toThrow()
            expect( LDE.getInputTree().children().length ).toBe 1
            insertedA = LDE.getInputTree().children()[0]
            expect( insertedA ).not.toBeUndefined()
            expect( insertedA.className ).toBe 'InputStructure'
            expect( insertedA.getAttribute 'text' ).toBe 'some text'
            expect( insertedA.id() ).toBe 'A'
            expect( insertedA.parent() ).toBe LDE.getInputTree()
            expect( Structure.instanceWithID 'A' ).toBe insertedA

Insert another as its sibling and do the same verifications.

            expect( -> LDE.insert B.toJSON(), 'root', 1 ).not.toThrow()
            expect( LDE.getInputTree().children().length ).toBe 2
            insertedB = LDE.getInputTree().children()[1]
            expect( insertedB ).not.toBeUndefined()
            expect( insertedB.className ).toBe 'InputStructure'
            expect( insertedB.getAttribute 'reference' )
                .toBeTruthy()
            expect( insertedB.id() ).toBe 'B'
            expect( insertedB.parent() ).toBe LDE.getInputTree()
            expect( insertedA.nextSibling() ).toBe insertedB
            expect( insertedB.previousSibling() ).toBe insertedA
            expect( Structure.instanceWithID 'B' ).toBe insertedB

Insert a grandchild and do similar verifications, but one level lower.

            expect( -> LDE.insert C.toJSON(), 'A', 0 ).not.toThrow()
            expect( LDE.getInputTree().children().length ).toBe 2
            expect( insertedA.children().length ).toBe 1
            insertedC = insertedA.children()[0]
            expect( insertedC ).not.toBeUndefined()
            expect( insertedC.className ).toBe 'InputStructure'
            expect( insertedC.getAttribute 'name' ).toBe 'C'
            expect( insertedC.id() ).toBe 'C'
            expect( insertedC.parent() ).toBe insertedA
            expect( Structure.instanceWithID 'C' ).toBe insertedC

Now we just verify that our process of clearing out the children of the LDE
Document after each test is working correctly.  This is just a repeat of the
test we did earlier to verify that the document starts out in a pristine
state.

        it 'should erase all Input Tree content after each test', ->
            serialized = LDE.getInputTree().toJSON()
            expect( serialized.className ).toBe 'InputStructure'
            expect( serialized.children ).toEqual [ ]
            expect( serialized.attributes ).toEqual { id : 'root' }

Next we verify that trying to insert non-`InputStructure` instances does
nothing.

        it 'should not permit inserting serialized non-Input Structures', ->

Define some structures that we will try to insert, but shouldn't work.

            A = new Structure().attr text : 'some text', id : 'A'
            B = new Structure().attr reference : yes, id : 'B'
            C = new Structure().attr name : 'C', id : 'C'

Insert each one and verify that nothing happened.

            expect( -> LDE.insert A.toJSON(), 'root', 0 ).not.toThrow()
            expect( LDE.getInputTree().children().length ).toBe 0
            expect( -> LDE.insert B.toJSON(), 'root', 0 ).not.toThrow()
            expect( LDE.getInputTree().children().length ).toBe 0
            expect( -> LDE.insert C.toJSON(), 'root', 0 ).not.toThrow()
            expect( LDE.getInputTree().children().length ).toBe 0


We now repeat the first test, but pass the actual `InputStructure` instances
rather than serialized versions, to verify that it supports this style.

        it 'should permit inserting non-serialized Input Structures', ->

Define some structures that we will want to insert.

            A = new InputStructure().attr text : 'some text', id : 'A'
            B = new InputStructure().attr reference : yes, id : 'B'
            C = new InputStructure().attr name : 'C', id : 'C'

Insert one and verify that it has been added and its ID tracked.

            expect( -> LDE.insert A, 'root', 0 ).not.toThrow()
            expect( LDE.getInputTree().children().length ).toBe 1
            insertedA = LDE.getInputTree().children()[0]
            expect( insertedA ).not.toBeUndefined()
            expect( insertedA.className ).toBe 'InputStructure'
            expect( insertedA.getAttribute 'text' ).toBe 'some text'
            expect( insertedA.id() ).toBe 'A'
            expect( insertedA.parent() ).toBe LDE.getInputTree()
            expect( Structure.instanceWithID 'A' ).toBe insertedA

Insert another as its sibling and do the same verifications.

            expect( -> LDE.insert B, 'root', 1 ).not.toThrow()
            expect( LDE.getInputTree().children().length ).toBe 2
            insertedB = LDE.getInputTree().children()[1]
            expect( insertedB ).not.toBeUndefined()
            expect( insertedB.className ).toBe 'InputStructure'
            expect( insertedB.getAttribute 'reference' )
                .toBeTruthy()
            expect( insertedB.id() ).toBe 'B'
            expect( insertedB.parent() ).toBe LDE.getInputTree()
            expect( insertedA.nextSibling() ).toBe insertedB
            expect( insertedB.previousSibling() ).toBe insertedA
            expect( Structure.instanceWithID 'B' ).toBe insertedB

Insert a grandchild and do similar verifications, but one level lower.

            expect( -> LDE.insert C, 'A', 0 ).not.toThrow()
            expect( LDE.getInputTree().children().length ).toBe 2
            expect( insertedA.children().length ).toBe 1
            insertedC = insertedA.children()[0]
            expect( insertedC ).not.toBeUndefined()
            expect( insertedC.className ).toBe 'InputStructure'
            expect( insertedC.getAttribute 'name' ).toBe 'C'
            expect( insertedC.id() ).toBe 'C'
            expect( insertedC.parent() ).toBe insertedA
            expect( Structure.instanceWithID 'C' ).toBe insertedC

Next we test the `delete` member of the API.  We re-populate the document
and then slowly delete pieces.

        it 'should permit deleting structures', ->

We can re-use the same structures (and insertion pattern) from an earlier
test.

            A = new InputStructure().attr text : 'some text', id : 'A'
            B = new InputStructure().attr reference : yes, id : 'B'
            C = new InputStructure().attr name : 'C', id : 'C'
            expect( -> LDE.insert A.toJSON(), 'root', 0 ).not.toThrow()
            insertedA = LDE.getInputTree().children()[0]
            expect( -> LDE.insert B.toJSON(), 'root', 1 ).not.toThrow()
            insertedB = LDE.getInputTree().children()[1]
            expect( -> LDE.insert C.toJSON(), 'A', 0 ).not.toThrow()
            insertedC = insertedA.children()[0]

First, let's delete them from the leaves up, to be sure we can do multiple
deletions, one after another.  After each call to the `delete` function, we
verify that the children and parent pointers are as expected, and the
various attributes as well.

First delete C.

            expect( -> LDE.delete 'C' ).not.toThrow()
            doc = LDE.getInputTree()
            expect( doc.children().length ).toBe 2
            expect( doc.children()[0].parent() ).toBe doc
            expect( doc.children()[0].children().length ).toBe 0
            expect( doc.children()[0].getAttribute 'text' )
                .toBe 'some text'
            expect( doc.children()[1].parent() ).toBe doc
            expect( doc.children()[1].children().length ).toBe 0
            expect( doc.children()[1].getAttribute 'reference' )
                .toBeTruthy()

Was its ID also released?

            expect( Structure.instanceWithID 'C' ).toBeUndefined()

Next delete A.

            expect( -> LDE.delete 'A' ).not.toThrow()
            expect( doc.children().length ).toBe 1
            expect( doc.children()[0].parent() ).toBe doc
            expect( doc.children()[0].children().length ).toBe 0
            expect( doc.children()[0].getAttribute 'reference' )
                .toBeTruthy()
            expect( Structure.instanceWithID 'A' ).toBeUndefined()

Finally, delete B.

            expect( -> LDE.delete 'B' ).not.toThrow()
            expect( doc.children().length ).toBe 0
            expect( Structure.instanceWithID 'B' ).toBeUndefined()

Next, let's re-add the same structures, but then delete them in a different
order, this time including a deletion of a nonatomic subtree.

            expect( -> LDE.insert A.toJSON(), 'root', 0 ).not.toThrow()
            insertedA = LDE.getInputTree().children()[0]
            expect( -> LDE.insert B.toJSON(), 'root', 1 ).not.toThrow()
            insertedB = LDE.getInputTree().children()[1]
            expect( -> LDE.insert C.toJSON(), 'A', 0 ).not.toThrow()
            insertedC = insertedA.children()[0]

First delete B.

            expect( -> LDE.delete 'B' ).not.toThrow()
            doc = LDE.getInputTree()
            expect( doc.children().length ).toBe 1
            insertedA = doc.children()[0]
            expect( insertedA.parent() ).toBe doc
            expect( insertedA.children().length ).toBe 1
            expect( insertedA.getAttribute 'text' ).toBe 'some text'
            insertedC = insertedA.children()[0]
            expect( insertedC.parent() ).toBe insertedA
            expect( insertedC.children().length ).toBe 0
            expect( insertedC.getAttribute 'name' ).toBe 'C'
            expect( Structure.instanceWithID 'B' ).toBeUndefined()

Then delete A, which also deletes C.

            expect( -> LDE.delete 'A' ).not.toThrow()
            expect( doc.children().length ).toBe 0
            expect( Structure.instanceWithID 'A' ).toBeUndefined()
            expect( Structure.instanceWithID 'C' ).toBeUndefined()

Next we test the `replace` member of the API.  We re-populate the document
and then replace some substructures with new ones.

        it 'should permit replacing structures with JSON', ->

We begin with the same structures (and insertion pattern) from an earlier
test.

            A = new InputStructure().attr text : 'some text', id : 'A'
            B = new InputStructure().attr reference : yes, id : 'B'
            C = new InputStructure().attr name : 'C', id : 'C'
            expect( -> LDE.insert A.toJSON(), 'root', 0 ).not.toThrow()
            insertedA = LDE.getInputTree().children()[0]
            expect( -> LDE.insert B.toJSON(), 'root', 1 ).not.toThrow()
            insertedB = LDE.getInputTree().children()[1]
            expect( -> LDE.insert C.toJSON(), 'A', 0 ).not.toThrow()
            insertedC = insertedA.children()[0]

Verify that it has the expected structure before we begin manipulating it.

            expect( insertedA.className ).toBe 'InputStructure'
            expect( insertedA.getAttribute 'text' ).toBe 'some text'
            expect( insertedA.id() ).toBe 'A'
            expect( Structure.instanceWithID 'A' ).toBe insertedA
            expect( insertedA.parent() ).toBe LDE.getInputTree()
            expect( insertedB.className ).toBe 'InputStructure'
            expect( insertedB.getAttribute 'reference' ).toBeTruthy()
            expect( insertedB.id() ).toBe 'B'
            expect( Structure.instanceWithID 'B' ).toBe insertedB
            expect( insertedB.parent() ).toBe LDE.getInputTree()
            expect( insertedA.nextSibling() ).toBe insertedB
            expect( insertedB.previousSibling() ).toBe insertedA
            expect( insertedC.className ).toBe 'InputStructure'
            expect( insertedC.getAttribute 'name' ).toBe 'C'
            expect( insertedC.id() ).toBe 'C'
            expect( Structure.instanceWithID 'C' ).toBe insertedC
            expect( insertedC.parent() ).toBe insertedA

Then we create some structures to use to replace those.

            D = new InputStructure().attr name : 'Dan', id : 'D'
            E = new InputStructure().attr name : 'Eli', id : 'E'

Replace a grandchild of the root, then verify that all structures are
positioned as expected with respect to one another.  This is the same test
as above, except that C has been replaced by D.

            expect( -> LDE.replace 'C', D.toJSON() ).not.toThrow()
            expect( insertedA.className ).toBe 'InputStructure'
            expect( insertedA.getAttribute 'text' ).toBe 'some text'
            expect( insertedA.id() ).toBe 'A'
            expect( insertedA.parent() ).toBe LDE.getInputTree()
            expect( insertedB.className ).toBe 'InputStructure'
            expect( insertedB.getAttribute 'reference' ).toBeTruthy()
            expect( insertedB.id() ).toBe 'B'
            expect( insertedB.parent() ).toBe LDE.getInputTree()
            expect( insertedA.nextSibling() ).toBe insertedB
            expect( insertedB.previousSibling() ).toBe insertedA
            shouldBeD = insertedA.children()[0]
            expect( shouldBeD ).not.toBe insertedC
            expect( shouldBeD.className ).toBe 'InputStructure'
            expect( shouldBeD.getAttribute 'name' ).toBe 'Dan'
            expect( shouldBeD.id() ).toBe 'D'
            expect( shouldBeD.parent() ).toBe insertedA

Verify that C is no longer in the hierarchy, and that its ID has been
released.

            expect( insertedC.parent() ).toBeNull()
            expect( Structure.instanceWithID 'C' ).toBeUndefined()

Now replace a nonatomic subtree with an atomic subtree, then do the same
type of tests to verify the structure.

            expect( -> LDE.replace 'A', E.toJSON() ).not.toThrow()
            shouldBeE = LDE.getInputTree().children()[0]
            expect( shouldBeE ).not.toBe insertedA
            expect( shouldBeE.className ).toBe 'InputStructure'
            expect( shouldBeE.getAttribute 'name' ).toBe 'Eli'
            expect( shouldBeE.id() ).toBe 'E'
            expect( shouldBeE.parent() ).toBe LDE.getInputTree()
            expect( insertedB.className ).toBe 'InputStructure'
            expect( insertedB.getAttribute 'reference' ).toBeTruthy()
            expect( insertedB.id() ).toBe 'B'
            expect( insertedB.parent() ).toBe LDE.getInputTree()
            expect( shouldBeE.nextSibling() ).toBe insertedB
            expect( insertedB.previousSibling() ).toBe shouldBeE
            expect( insertedA.parent() ).toBeNull()
            expect( shouldBeD.parent() ).toBe insertedA
            expect( Structure.instanceWithID 'A' ).toBeUndefined()
            expect( Structure.instanceWithID 'D' ).toBeUndefined()

We repeat the previous test, but try to replace existing `InputStructure`
instances with non-`InputStructure` objects, then verify that nothing
happens.

        it 'should not permit replacing with non-InputStructures', ->

Same as previous test:

            A = new InputStructure().attr text : 'some text', id : 'A'
            B = new InputStructure().attr reference : yes, id : 'B'
            C = new InputStructure().attr name : 'C', id : 'C'
            expect( -> LDE.insert A.toJSON(), 'root', 0 ).not.toThrow()
            insertedA = LDE.getInputTree().children()[0]
            expect( -> LDE.insert B.toJSON(), 'root', 1 ).not.toThrow()
            insertedB = LDE.getInputTree().children()[1]
            expect( -> LDE.insert C.toJSON(), 'A', 0 ).not.toThrow()
            insertedC = insertedA.children()[0]
            expect( insertedA.className ).toBe 'InputStructure'
            expect( insertedA.getAttribute 'text' ).toBe 'some text'
            expect( insertedA.id() ).toBe 'A'
            expect( Structure.instanceWithID 'A' ).toBe insertedA
            expect( insertedA.parent() ).toBe LDE.getInputTree()
            expect( insertedB.className ).toBe 'InputStructure'
            expect( insertedB.getAttribute 'reference' ).toBeTruthy()
            expect( insertedB.id() ).toBe 'B'
            expect( Structure.instanceWithID 'B' ).toBe insertedB
            expect( insertedB.parent() ).toBe LDE.getInputTree()
            expect( insertedA.nextSibling() ).toBe insertedB
            expect( insertedB.previousSibling() ).toBe insertedA
            expect( insertedC.className ).toBe 'InputStructure'
            expect( insertedC.getAttribute 'name' ).toBe 'C'
            expect( insertedC.id() ).toBe 'C'
            expect( Structure.instanceWithID 'C' ).toBe insertedC
            expect( insertedC.parent() ).toBe insertedA

Not the same as the previous test; now we're making plain `Structure`
instances, not `InputStructure` instances.

            D = new Structure().attr name : 'Dan', id : 'D'
            E = new Structure().attr name : 'Eli', id : 'E'

Replace a grandchild of the root, then verify that nothing happened.

            expect( -> LDE.replace 'C', D.toJSON() ).not.toThrow()
            expect( insertedA.className ).toBe 'InputStructure'
            expect( insertedA.getAttribute 'text' ).toBe 'some text'
            expect( insertedA.id() ).toBe 'A'
            expect( insertedA.parent() ).toBe LDE.getInputTree()
            expect( insertedB.className ).toBe 'InputStructure'
            expect( insertedB.getAttribute 'reference' ).toBeTruthy()
            expect( insertedB.id() ).toBe 'B'
            expect( insertedB.parent() ).toBe LDE.getInputTree()
            expect( insertedA.nextSibling() ).toBe insertedB
            expect( insertedB.previousSibling() ).toBe insertedA
            shouldBeC = insertedA.children()[0]
            expect( shouldBeC ).toBe insertedC

Do it again.

            expect( -> LDE.replace 'C', E.toJSON() ).not.toThrow()
            expect( insertedA.className ).toBe 'InputStructure'
            expect( insertedA.getAttribute 'text' ).toBe 'some text'
            expect( insertedA.id() ).toBe 'A'
            expect( insertedA.parent() ).toBe LDE.getInputTree()
            expect( insertedB.className ).toBe 'InputStructure'
            expect( insertedB.getAttribute 'reference' ).toBeTruthy()
            expect( insertedB.id() ).toBe 'B'
            expect( insertedB.parent() ).toBe LDE.getInputTree()
            expect( insertedA.nextSibling() ).toBe insertedB
            expect( insertedB.previousSibling() ).toBe insertedA
            shouldBeC = insertedA.children()[0]
            expect( shouldBeC ).toBe insertedC

Repeat the first test of the `replace` member of the API, but now the
replacement nodes will be actual `InputStructure` instances rather than
serialized versions thereof.

        it 'should permit replacing structures with structures', ->

We begin with the same structures (and insertion pattern) from an earlier
test.

            A = new InputStructure().attr text : 'some text', id : 'A'
            B = new InputStructure().attr reference : yes, id : 'B'
            C = new InputStructure().attr name : 'C', id : 'C'
            expect( -> LDE.insert A.toJSON(), 'root', 0 ).not.toThrow()
            insertedA = LDE.getInputTree().children()[0]
            expect( -> LDE.insert B.toJSON(), 'root', 1 ).not.toThrow()
            insertedB = LDE.getInputTree().children()[1]
            expect( -> LDE.insert C.toJSON(), 'A', 0 ).not.toThrow()
            insertedC = insertedA.children()[0]

Verify that it has the expected structure before we begin manipulating it.

            expect( insertedA.className ).toBe 'InputStructure'
            expect( insertedA.getAttribute 'text' ).toBe 'some text'
            expect( insertedA.id() ).toBe 'A'
            expect( Structure.instanceWithID 'A' ).toBe insertedA
            expect( insertedA.parent() ).toBe LDE.getInputTree()
            expect( insertedB.className ).toBe 'InputStructure'
            expect( insertedB.getAttribute 'reference' ).toBeTruthy()
            expect( insertedB.id() ).toBe 'B'
            expect( Structure.instanceWithID 'B' ).toBe insertedB
            expect( insertedB.parent() ).toBe LDE.getInputTree()
            expect( insertedA.nextSibling() ).toBe insertedB
            expect( insertedB.previousSibling() ).toBe insertedA
            expect( insertedC.className ).toBe 'InputStructure'
            expect( insertedC.getAttribute 'name' ).toBe 'C'
            expect( insertedC.id() ).toBe 'C'
            expect( Structure.instanceWithID 'C' ).toBe insertedC
            expect( insertedC.parent() ).toBe insertedA

Then we create some structures to use to replace those.

            D = new InputStructure().attr name : 'Dan', id : 'D'
            E = new InputStructure().attr name : 'Eli', id : 'E'

Replace a grandchild of the root, then verify that all structures are
positioned as expected with respect to one another.  This is the same test
as above, except that C has been replaced by D.

            expect( -> LDE.replace 'C', D ).not.toThrow()
            expect( insertedA.className ).toBe 'InputStructure'
            expect( insertedA.getAttribute 'text' ).toBe 'some text'
            expect( insertedA.id() ).toBe 'A'
            expect( insertedA.parent() ).toBe LDE.getInputTree()
            expect( insertedB.className ).toBe 'InputStructure'
            expect( insertedB.getAttribute 'reference' ).toBeTruthy()
            expect( insertedB.id() ).toBe 'B'
            expect( insertedB.parent() ).toBe LDE.getInputTree()
            expect( insertedA.nextSibling() ).toBe insertedB
            expect( insertedB.previousSibling() ).toBe insertedA
            shouldBeD = insertedA.children()[0]
            expect( shouldBeD ).not.toBe insertedC
            expect( shouldBeD.className ).toBe 'InputStructure'
            expect( shouldBeD.getAttribute 'name' ).toBe 'Dan'
            expect( shouldBeD.id() ).toBe 'D'
            expect( shouldBeD.parent() ).toBe insertedA

Verify that C is no longer in the hierarchy, and that its ID has been
released.

            expect( insertedC.parent() ).toBeNull()
            expect( Structure.instanceWithID 'C' ).toBeUndefined()

Now replace a nonatomic subtree with an atomic subtree, then do the same
type of tests to verify the structure.

            expect( -> LDE.replace 'A', E ).not.toThrow()
            shouldBeE = LDE.getInputTree().children()[0]
            expect( shouldBeE ).not.toBe insertedA
            expect( shouldBeE.className ).toBe 'InputStructure'
            expect( shouldBeE.getAttribute 'name' ).toBe 'Eli'
            expect( shouldBeE.id() ).toBe 'E'
            expect( shouldBeE.parent() ).toBe LDE.getInputTree()
            expect( insertedB.className ).toBe 'InputStructure'
            expect( insertedB.getAttribute 'reference' ).toBeTruthy()
            expect( insertedB.id() ).toBe 'B'
            expect( insertedB.parent() ).toBe LDE.getInputTree()
            expect( shouldBeE.nextSibling() ).toBe insertedB
            expect( insertedB.previousSibling() ).toBe shouldBeE
            expect( insertedA.parent() ).toBeNull()
            expect( shouldBeD.parent() ).toBe insertedA
            expect( Structure.instanceWithID 'A' ).toBeUndefined()
            expect( Structure.instanceWithID 'D' ).toBeUndefined()

Finally we test the `setAttribute` member of the API.  We re-populate the
document and then replace some substructures with new ones.

        it 'should permit altering attributes', ->

We begin with the same structures (and insertion pattern) from an earlier
test.

            A = new InputStructure().attr text : 'some text', id : 'A'
            B = new InputStructure().attr reference : yes, id : 'B'
            C = new InputStructure().attr name : 'C', id : 'C'
            expect( -> LDE.insert A.toJSON(), 'root', 0 ).not.toThrow()
            insertedA = LDE.getInputTree().children()[0]
            expect( -> LDE.insert B.toJSON(), 'root', 1 ).not.toThrow()
            insertedB = LDE.getInputTree().children()[1]
            expect( -> LDE.insert C.toJSON(), 'A', 0 ).not.toThrow()
            insertedC = insertedA.children()[0]

We do not at this point test whether the structure looks the way we expect,
because we are re-using code from the previous test, which already checked
to be sure that it creates the structure as expected.

Let us add an attribute to each of the nodes, including the root, and verify
that they were successfully added.

            expect( -> LDE.setAttribute 'root',
                'test key 1', 'test value 1' ).not.toThrow()
            expect( -> LDE.setAttribute 'A',
                'test key 2', 'test value 2' ).not.toThrow()
            expect( -> LDE.setAttribute 'B',
                'test key 3', 'test value 3' ).not.toThrow()
            expect( -> LDE.setAttribute 'C',
                'test key 4', 'test value 4' ).not.toThrow()
            expect( LDE.getInputTree().getAttribute 'test key 1' )
                .toBe 'test value 1'
            expect( insertedA.getAttribute 'test key 2' )
                .toBe 'test value 2'
            expect( insertedB.getAttribute 'test key 3' )
                .toBe 'test value 3'
            expect( insertedC.getAttribute 'test key 4' )
                .toBe 'test value 4'

Then we call `setAttribute` with no value, and ensure that this removes
attributes.

            expect( -> LDE.setAttribute 'root', 'test key 1' ).not.toThrow()
            expect( LDE.getInputTree().getAttribute 'test key 1' )
                .toBeUndefined()

## WebWorker Support

This section tests the same four functions as the previous section, but
through the interface of a WebWorker.  Actually, it simulates a WebWorker
using the Node module `webworker-threads`.  It does not do nearly as
thorough a test as the previous section did, because the main point of this
section is to test the message-passing API necessary for pushing work into a
background thread, not to re-test the same functionality as before.

    describe 'LDE WebWorker Support', ->

        { Worker } = require 'webworker-threads'
        worker = null
        beforeEach ->
            worker = new Worker 'release/lde.js'
            worker.onmessage = ( event ) -> worker.listener? event
        asyncTest = ( commandAndArgArray, testfunc ) ->
            worker.listener = ( result ) -> testfunc result.data
            worker.postMessage commandAndArgArray

### should allow querying the document

        it 'should allow querying the document', ( done ) ->
            asyncTest [ 'getInputTree' ], ( result ) ->
                expect( result ).toEqual {
                    className : 'InputStructure'
                    attributes : { id : 'root' }
                    children : [ ]
                }
                done()

### should allow inserting things

        it 'should allow inserting things', ( done ) ->
            A = new InputStructure().attr name : 'A', ID : 'foo'
            worker.postMessage [ 'insert', A.toJSON(), 'root', 0 ]
            asyncTest [ 'getInputTree' ], ( result ) ->
                expect( result ).toEqual {
                    className : 'InputStructure'
                    attributes : { id : 'root' }
                    children : [
                        className : 'InputStructure'
                        attributes : name : 'A', ID : 'foo'
                        children : [ ]
                    ]
                }
                done()

### should allow deleting things

        it 'should allow deleting things', ( done ) ->
            A = new InputStructure().attr name : 'A', id : 'foo'
            worker.postMessage [ 'insert', A.toJSON(), 'root', 0 ]
            worker.postMessage [ 'delete', 'foo' ]
            asyncTest [ 'getInputTree' ], ( result ) ->
                expect( result ).toEqual {
                    className : 'InputStructure'
                    attributes : { id : 'root' }
                    children : [ ]
                }
                done()

### should allow replacing things

        it 'should allow replacing things', ( done ) ->
            A = new InputStructure().attr name : 'A', id : 'foo'
            B = new InputStructure().attr name : 'B', id : 'bar'
            worker.postMessage [ 'insert', A.toJSON(), 'root', 0 ]
            worker.postMessage [ 'replace', 'foo', B.toJSON() ]
            asyncTest [ 'getInputTree' ], ( result ) ->
                expect( result ).toEqual {
                    className : 'InputStructure'
                    attributes : { id : 'root' }
                    children : [
                        className : 'InputStructure'
                        attributes : name : 'B', id : 'bar'
                        children : [ ]
                    ]
                }
                done()

### should allow setting attributes

        it 'should allow setting attributes', ( done ) ->
            A = new InputStructure().attr name : 'A', id : 'foo'
            worker.postMessage [ 'insert', A.toJSON(), 'root', 0 ]
            worker.postMessage [ 'setAttribute', 'foo', 'color', 'red' ]
            asyncTest [ 'getInputTree' ], ( result ) ->
                expect( result ).toEqual {
                    className : 'InputStructure'
                    attributes : { id : 'root' }
                    children : [
                        className : 'InputStructure'
                        attributes :
                            name : 'A'
                            id : 'foo'
                            color : 'red'
                        children : [ ]
                    ]
                }
                done()
