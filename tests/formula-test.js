
// Import what we're testing
import Formula from '../src/formula.js'

// Import other classes we need to do the testing
import { MathConcept } from '../src/math-concept.js'
import { LogicConcept } from '../src/logic-concept.js'
import { Symbol as LurchSymbol } from '../src/symbol.js'
import Matching from '../src/matching.js'

// Test suite begins here.

describe( 'Formulas', () => {

    it( 'Module should import successfully', () => {
        expect( Formula ).to.be.ok
    } )

    it( 'Should create formulas correctly from LCs in context', () => {
        // declare some variables we'll use repeatedly
        let context  // the "document" in which to look for declarations
        let target   // the LC we will convert to a formula
        let formula  // the copy of the target that is a formula

        // Consider a single expression with nothing declared;
        // every symbol in it should become a metavariable.
        context = LogicConcept.fromPutdown( ` {
            (this is irrelevant because it is not a declaration)
            (+ 3 (* -1 k))  // <-- target
        } ` )[0]
        target = context.child( 1 )
        // No metavariables in the target right now:
        expect( target.child( 0 ).isA( Matching.metavariable ) )
            .equals( false )
        expect( target.child( 1 ).isA( Matching.metavariable ) )
            .equals( false )
        expect( target.child( 2, 0 ).isA( Matching.metavariable ) )
            .equals( false )
        expect( target.child( 2, 1 ).isA( Matching.metavariable ) )
            .equals( false )
        expect( target.child( 2, 2 ).isA( Matching.metavariable ) )
            .equals( false )
        // But if we make a formula, everything becomes a metavariable:
        formula = Formula.from( target )
        expect( formula.child( 0 ).isA( Matching.metavariable ) )
            .equals( true )
        expect( formula.child( 1 ).isA( Matching.metavariable ) )
            .equals( true )
        expect( formula.child( 2, 0 ).isA( Matching.metavariable ) )
            .equals( true )
        expect( formula.child( 2, 1 ).isA( Matching.metavariable ) )
            .equals( true )
        expect( formula.child( 2, 2 ).isA( Matching.metavariable ) )
            .equals( true )

        // Consider a single expression with one symbol declared;
        // every other symbol in it should become a metavariable.
        context = LogicConcept.fromPutdown( ` {
            [i j k]
            (+ k (* -1 k))  // <-- target
        } ` )[0]
        target = context.child( 1 )
        // No metavariables in the target right now:
        expect( target.child( 0 ).isA( Matching.metavariable ) )
            .equals( false )
        expect( target.child( 1 ).isA( Matching.metavariable ) )
            .equals( false )
        expect( target.child( 2, 0 ).isA( Matching.metavariable ) )
            .equals( false )
        expect( target.child( 2, 1 ).isA( Matching.metavariable ) )
            .equals( false )
        expect( target.child( 2, 2 ).isA( Matching.metavariable ) )
            .equals( false )
        // But if we make a formula, everything except k becomes a metavar:
        formula = Formula.from( target )
        expect( formula.child( 0 ).isA( Matching.metavariable ) )
            .equals( true )
        expect( formula.child( 1 ).isA( Matching.metavariable ) )
            .equals( false )
        expect( formula.child( 2, 0 ).isA( Matching.metavariable ) )
            .equals( true )
        expect( formula.child( 2, 1 ).isA( Matching.metavariable ) )
            .equals( true )
        expect( formula.child( 2, 2 ).isA( Matching.metavariable ) )
            .equals( false )

        // Consider an environment with one symbol declared;
        // every other symbol in it should become a metavariable.
        context = LogicConcept.fromPutdown( ` {
            [i j k]
            { :(= i 1) (> n m) }  // <-- target
        } ` )[0]
        target = context.child( 1 )
        // No metavariables in the target right now:
        expect( target.child( 0, 0 ).isA( Matching.metavariable ) )
            .equals( false )
        expect( target.child( 0, 1 ).isA( Matching.metavariable ) )
            .equals( false )
        expect( target.child( 0, 2 ).isA( Matching.metavariable ) )
            .equals( false )
        expect( target.child( 1, 0 ).isA( Matching.metavariable ) )
            .equals( false )
        expect( target.child( 1, 1 ).isA( Matching.metavariable ) )
            .equals( false )
        expect( target.child( 1, 2 ).isA( Matching.metavariable ) )
            .equals( false )
        // But if we make a formula, everything except i becomes a metavar:
        formula = Formula.from( target )
        expect( formula.child( 0, 0 ).isA( Matching.metavariable ) )
            .equals( true )
        expect( formula.child( 0, 1 ).isA( Matching.metavariable ) )
            .equals( false )
        expect( formula.child( 0, 2 ).isA( Matching.metavariable ) )
            .equals( true )
        expect( formula.child( 1, 0 ).isA( Matching.metavariable ) )
            .equals( true )
        expect( formula.child( 1, 1 ).isA( Matching.metavariable ) )
            .equals( true )
        expect( formula.child( 1, 2 ).isA( Matching.metavariable ) )
            .equals( true )

        // Repeat the previous test, but now ensure that Binding Environments
        // also count as declaring variables.
        context = LogicConcept.fromPutdown( `(i j k) , {
            { :(= i 1) (> n m) }  // <-- target
        } ` )[0]
        target = context.child( 3, 0 )
        // No metavariables in the target right now:
        expect( target.child( 0, 0 ).isA( Matching.metavariable ) )
            .equals( false )
        expect( target.child( 0, 1 ).isA( Matching.metavariable ) )
            .equals( false )
        expect( target.child( 0, 2 ).isA( Matching.metavariable ) )
            .equals( false )
        expect( target.child( 1, 0 ).isA( Matching.metavariable ) )
            .equals( false )
        expect( target.child( 1, 1 ).isA( Matching.metavariable ) )
            .equals( false )
        expect( target.child( 1, 2 ).isA( Matching.metavariable ) )
            .equals( false )
        // But if we make a formula, everything except i becomes a metavar:
        formula = Formula.from( target )
        expect( formula.child( 0, 0 ).isA( Matching.metavariable ) )
            .equals( true )
        expect( formula.child( 0, 1 ).isA( Matching.metavariable ) )
            .equals( false )
        expect( formula.child( 0, 2 ).isA( Matching.metavariable ) )
            .equals( true )
        expect( formula.child( 1, 0 ).isA( Matching.metavariable ) )
            .equals( true )
        expect( formula.child( 1, 1 ).isA( Matching.metavariable ) )
            .equals( true )
        expect( formula.child( 1, 2 ).isA( Matching.metavariable ) )
            .equals( true )

        // Consider two nested environment with many symbols declared at
        // different points, so that some environments have a symbol declared
        // while earlier environments do not have that same symbol declared.
        context = LogicConcept.fromPutdown( ` {
            [= > < => <=]
            { :(= i 1) (surjective f) }           // <-- target 1
            {
                [injective surjective bijective]
                (=> (bijective f) (injective f))  // <-- target 2
            }
            { (just testing injective here) }     // <-- target 3
        } ` )[0]
        // First consider target #1, as marked above.
        target = context.child( 1 )
        // No metavariables in target 1 right now:
        expect( target.child( 0, 0 ).isA( Matching.metavariable ) )
            .equals( false )
        expect( target.child( 0, 1 ).isA( Matching.metavariable ) )
            .equals( false )
        expect( target.child( 0, 2 ).isA( Matching.metavariable ) )
            .equals( false )
        expect( target.child( 1, 0 ).isA( Matching.metavariable ) )
            .equals( false )
        expect( target.child( 1, 1 ).isA( Matching.metavariable ) )
            .equals( false )
        // But if we make a formula, everything except = becomes a metavar:
        formula = Formula.from( target )
        expect( formula.child( 0, 0 ).isA( Matching.metavariable ) )
            .equals( false )
        expect( formula.child( 0, 1 ).isA( Matching.metavariable ) )
            .equals( true )
        expect( formula.child( 0, 2 ).isA( Matching.metavariable ) )
            .equals( true )
        expect( formula.child( 1, 0 ).isA( Matching.metavariable ) )
            .equals( true )
        expect( formula.child( 1, 1 ).isA( Matching.metavariable ) )
            .equals( true )
        // Next consider target #2, as marked above.
        target = context.child( 2, 1 )
        // No metavariables in target 2 right now:
        expect( target.child( 0 ).isA( Matching.metavariable ) )
            .equals( false )
        expect( target.child( 1, 0 ).isA( Matching.metavariable ) )
            .equals( false )
        expect( target.child( 1, 1 ).isA( Matching.metavariable ) )
            .equals( false )
        expect( target.child( 2, 0 ).isA( Matching.metavariable ) )
            .equals( false )
        expect( target.child( 2, 1 ).isA( Matching.metavariable ) )
            .equals( false )
        // But if we make a formula, only f becomes a metavar:
        formula = Formula.from( target )
        expect( formula.child( 0 ).isA( Matching.metavariable ) )
            .equals( false )
        expect( formula.child( 1, 0 ).isA( Matching.metavariable ) )
            .equals( false )
        expect( formula.child( 1, 1 ).isA( Matching.metavariable ) )
            .equals( true )
        expect( formula.child( 2, 0 ).isA( Matching.metavariable ) )
            .equals( false )
        expect( formula.child( 2, 1 ).isA( Matching.metavariable ) )
            .equals( true )
        // Finally consider target #3, as marked above.
        target = context.child( 3, 0 )
        // No metavariables in target 3 right now:
        expect( target.child( 0 ).isA( Matching.metavariable ) )
            .equals( false )
        expect( target.child( 1 ).isA( Matching.metavariable ) )
            .equals( false )
        expect( target.child( 2 ).isA( Matching.metavariable ) )
            .equals( false )
        expect( target.child( 3 ).isA( Matching.metavariable ) )
            .equals( false )
        // But if we make a formula, everything becomes a metavar:
        formula = Formula.from( target )
        expect( formula.child( 0 ).isA( Matching.metavariable ) )
            .equals( true )
        expect( formula.child( 1 ).isA( Matching.metavariable ) )
            .equals( true )
        expect( formula.child( 2 ).isA( Matching.metavariable ) )
            .equals( true )
        expect( formula.child( 3 ).isA( Matching.metavariable ) )
            .equals( true )
    } )

    it( 'Should compute the correct domain of any formula', () => {
        let target
        let domain

        // An expression with no metavariables has an empty domain
        target = LogicConcept.fromPutdown( `
            (this (is an example expression) (with #s 1 2 3))
        ` )[0]
        domain = Formula.domain( target )
        expect( domain.equals( new Set ) ).equals( true )

        // An environment with no metavariables has an empty domain
        target = LogicConcept.fromPutdown( `
            {
                one
                (two 3)
                :(4 five , six)
                { seven }
            }
        ` )[0]
        domain = Formula.domain( target )
        expect( domain.equals( new Set ) ).equals( true )

        // An expression with 1 metavariable has a singleton domain
        target = LogicConcept.fromPutdown( `
            (this (is an example expression) (with #s 1 2 3))
        ` )[0]
        target.child( 1, 2 ).makeIntoA( Matching.metavariable )
        domain = Formula.domain( target )
        expect( domain.equals( new Set( [ 'example' ] ) ) ).equals( true )

        // Same as previous but with multiple occurrences of the symbol
        target = LogicConcept.fromPutdown( `
            (this (is an example example) (with example))
        ` )[0]
        target.child( 1, 2 ).makeIntoA( Matching.metavariable )
        target.child( 1, 3 ).makeIntoA( Matching.metavariable )
        target.child( 2, 1 ).makeIntoA( Matching.metavariable )
        domain = Formula.domain( target )
        expect( domain.equals( new Set( [ 'example' ] ) ) ).equals( true )

        // An expression may have a large domain
        target = LogicConcept.fromPutdown( `
            (this (is an example expression) (with #s 1 2 3))
        ` )[0]
        target.descendantsSatisfying( d => d instanceof LurchSymbol )
            .forEach( s => s.makeIntoA( Matching.metavariable ) )
        domain = Formula.domain( target )
        expect( domain.equals( new Set( [
            'this', 'is', 'an', 'example', 'expression',
            'with', '#s', '1', '2', '3'
        ] ) ) ).equals( true )

        // An environment may have a large domain
        // (here we also test some things being metavars and some not)
        target = LogicConcept.fromPutdown( `
            :{
                :(= a b)
                :("LDE EFA" P a)
                ("LDE EFA" P b)
            } +{"label":"equality elimination"}
        ` )[0]
        target.descendantsSatisfying( d => d instanceof LurchSymbol )
            .filter( s => !['=','LDE EFA'].includes( s.text() ) )
            .forEach( s => s.makeIntoA( Matching.metavariable ) )
        domain = Formula.domain( target )
        expect( domain.equals( new Set( [ 'a', 'b', 'P' ] ) ) ).equals( true )
    } )

    it( 'Should instantiate formulas from Objects', () => {
        let formula
        let instantiated
        let expected

        // Re-use an environment from an earlier test as the formula; it has
        // no metavariables, so any instantiation will be the same:
        formula = LogicConcept.fromPutdown( ` {
            one    (two 3)    :(4 five , six)    { seven }
        } ` )[0]
        instantiated = Formula.instantiate( formula, {
            'x' : LogicConcept.fromPutdown( 'testing' )[0],
            'y' : LogicConcept.fromPutdown( '{ a b c }' )[0],
            'z' : LogicConcept.fromPutdown( ':1' )[0]
        } )
        expect( formula.equals( instantiated ) ).equals( true )

        // Re-use an expression from an earlier test as the formula; it has 1
        // metavariable, so we will try instantiating it three ways:
        // Way #1: example -> 7
        formula = LogicConcept.fromPutdown( `
            (this (is an example expression) (with #s 1 2 3))
        ` )[0]
        formula.child( 1, 2 ).makeIntoA( Matching.metavariable )
        instantiated = Formula.instantiate( formula, {
            'example' : LogicConcept.fromPutdown( '7' )[0]
        } )
        expect( instantiated.equals( LogicConcept.fromPutdown(
            '(this (is an 7 expression) (with #s 1 2 3))'
        )[0] ) ).equals( true )
        // Way #2: example -> (some compound expression)
        formula = LogicConcept.fromPutdown( `
            (this (is an example expression) (with #s 1 2 3))
        ` )[0]
        formula.child( 1, 2 ).makeIntoA( Matching.metavariable )
        instantiated = Formula.instantiate( formula, {
            'example' : LogicConcept.fromPutdown(
                '(some compound expression)'
            )[0]
        } )
        expect( instantiated.equals( LogicConcept.fromPutdown(
            `(this (is an (some compound expression) expression)
                   (with #s 1 2 3))`
        )[0] ) ).equals( true )
        // Way #3: example -> { an env }, which is invalid
        formula = LogicConcept.fromPutdown( `
            (this (is an example expression) (with #s 1 2 3))
        ` )[0]
        formula.child( 1, 2 ).makeIntoA( Matching.metavariable )
        expect( () => Formula.instantiate( formula, {
            'example' : LogicConcept.fromPutdown( '{ some env }' )[0]
        } ) ).to.throw( /Cannot place a non-expression inside an expression/ )

        // Re-use an environment from an earlier test as the formula; it has 3
        // metavariables, and we will try instantiating it three ways:
        formula = LogicConcept.fromPutdown( `
            :{
                :(= a b)
                :("LDE EFA" P a)
                ("LDE EFA" P b)
            } +{"label":"equality elimination"}
        ` )[0]
        formula.descendantsSatisfying( d => d instanceof LurchSymbol )
            .filter( s => ['P','a','b'].includes( s.text() ) )
            .forEach( s => s.makeIntoA( Matching.metavariable ) )
        // Way #1: instantiate only a subset of the metavariables
        instantiated = Formula.instantiate( formula, {
            'P' : Matching.newEF( new LurchSymbol( 'v' ),
                LogicConcept.fromPutdown( '(> v 1)' )[0] )
        } )
        expected = LogicConcept.fromPutdown( `
            :{
                :(= a b)
                :(> a 1)
                (> b 1)
            } +{"label":"equality elimination"}
        ` )[0]
        expected.descendantsSatisfying( d => d instanceof LurchSymbol )
            .filter( s => ['P','a','b'].includes( s.text() ) )
            .forEach( s => s.makeIntoA( Matching.metavariable ) )
        expect( instantiated.equals( expected ) ).equals( true )
        // Way #2: try to instantiate the metavariables and some non-meta-
        // variables as well, which should not actually instantiate the
        // symbols in that latter category
        instantiated = Formula.instantiate( formula, {
            'P' : Matching.newEF( new LurchSymbol( 'v' ),
                LogicConcept.fromPutdown( '(> v 1)' )[0] ),
            'a' : new LurchSymbol( 'AAA' ),
            'b' : new LurchSymbol( 'BBB' ),
            'c' : LogicConcept.fromPutdown( '(this is unused)' )[0],
            'd' : LogicConcept.fromPutdown( '(this also)' )[0]
        } )
        expect( instantiated.equals( LogicConcept.fromPutdown( `
            :{
                :(= AAA BBB)
                :(> AAA 1)
                (> BBB 1)
            } +{"label":"equality elimination"}
        ` )[0] ) ).equals( true )
        // Way #3: instantiate exactly the symbols that are metavariables
        instantiated = Formula.instantiate( formula, {
            'P' : Matching.newEF( new LurchSymbol( 'v' ),
                LogicConcept.fromPutdown( '(> v 1)' )[0] ),
            'a' : LogicConcept.fromPutdown( '(first letter)' )[0],
            'b' : LogicConcept.fromPutdown( '(second letter)' )[0]
        } )
        expect( instantiated.equals( LogicConcept.fromPutdown( `
            :{
                :(= (first letter) (second letter))
                :(> (first letter) 1)
                (> (second letter) 1)
            } +{"label":"equality elimination"}
        ` )[0] ) ).equals( true )
    } )

    it( 'Should instantiate formulas from Maps', () => {
        // This test is literally just the exact same as the one above, except
        // we pass arguments to the instantiate() function as Map instances
        // rather than raw JS Objects.
        let formula
        let instantiated
        let expected
        let instantiation

        // Re-use an environment from an earlier test as the formula; it has
        // no metavariables, so any instantiation will be the same:
        formula = LogicConcept.fromPutdown( ` {
            one    (two 3)    :(4 five , six)    { seven }
        } ` )[0]
        instantiation = new Map()
        instantiation.set( 'x', LogicConcept.fromPutdown( 'testing' )[0] )
        instantiation.set( 'y', LogicConcept.fromPutdown( '{ a b c }' )[0] )
        instantiation.set( 'z', LogicConcept.fromPutdown( ':1' )[0] )
        instantiated = Formula.instantiate( formula, instantiation )
        expect( formula.equals( instantiated ) ).equals( true )

        // Re-use an expression from an earlier test as the formula; it has 1
        // metavariable, so we will try instantiating it three ways:
        // Way #1: example -> 7
        formula = LogicConcept.fromPutdown( `
            (this (is an example expression) (with #s 1 2 3))
        ` )[0]
        formula.child( 1, 2 ).makeIntoA( Matching.metavariable )
        instantiation = new Map()
        instantiation.set( 'example', LogicConcept.fromPutdown( '7' )[0] )
        instantiated = Formula.instantiate( formula, instantiation )
        expected = LogicConcept.fromPutdown(
            '(this (is an 7 expression) (with #s 1 2 3))'
        )[0]
        expect( instantiated.equals( expected ) ).equals( true )
        // Way #2: example -> (some compound expression)
        formula = LogicConcept.fromPutdown( `
            (this (is an example expression) (with #s 1 2 3))
        ` )[0]
        formula.child( 1, 2 ).makeIntoA( Matching.metavariable )
        instantiation = new Map()
        instantiation.set( 'example', LogicConcept.fromPutdown(
            '(some compound expression)'
        )[0] )
        instantiated = Formula.instantiate( formula, instantiation )
        expect( instantiated.equals( LogicConcept.fromPutdown(
            `(this (is an (some compound expression) expression)
                   (with #s 1 2 3))`
        )[0] ) ).equals( true )
        // Way #3: example -> { an env }, which is invalid
        formula = LogicConcept.fromPutdown( `
            (this (is an example expression) (with #s 1 2 3))
        ` )[0]
        formula.child( 1, 2 ).makeIntoA( Matching.metavariable )
        instantiation = new Map()
        instantiation.set( 'example',
            LogicConcept.fromPutdown( '{ some env }' )[0] )
        expect( () => Formula.instantiate( formula, instantiation ) )
            .to.throw( /Cannot place a non-expression inside an expression/ )

        // Re-use an environment from an earlier test as the formula; it has 3
        // metavariables, and we will try instantiating it three ways:
        formula = LogicConcept.fromPutdown( `
            :{
                :(= a b)
                :("LDE EFA" P a)
                ("LDE EFA" P b)
            } +{"label":"equality elimination"}
        ` )[0]
        formula.descendantsSatisfying( d => d instanceof LurchSymbol )
            .filter( s => ['P','a','b'].includes( s.text() ) )
            .forEach( s => s.makeIntoA( Matching.metavariable ) )
        // Way #1: instantiate only a subset of the metavariables
        instantiation = new Map()
        instantiation.set( 'P', Matching.newEF( new LurchSymbol( 'v' ),
            LogicConcept.fromPutdown( '(> v 1)' )[0] ) )
        instantiated = Formula.instantiate( formula, instantiation )
        expected = LogicConcept.fromPutdown( `
            :{
                :(= a b)
                :(> a 1)
                (> b 1)
            } +{"label":"equality elimination"}
        ` )[0]
        expected.descendantsSatisfying( d => d instanceof LurchSymbol )
            .filter( s => ['P','a','b'].includes( s.text() ) )
            .forEach( s => s.makeIntoA( Matching.metavariable ) )
        expect( instantiated.equals( expected ) ).equals( true )
        // Way #2: try to instantiate the metavariables and some non-meta-
        // variables as well, which should not actually instantiate the
        // symbols in that latter category
        instantiation = new Map()
        instantiation.set( 'P', Matching.newEF( new LurchSymbol( 'v' ),
            LogicConcept.fromPutdown( '(> v 1)' )[0] ) )
        instantiation.set( 'a', new LurchSymbol( 'AAA' ) )
        instantiation.set( 'b', new LurchSymbol( 'BBB' ) )
        instantiation.set( 'c',
            LogicConcept.fromPutdown( '(this is unused)' )[0] )
        instantiation.set( 'd', LogicConcept.fromPutdown( '(this also)' )[0] )
        instantiated = Formula.instantiate( formula, instantiation )
        expected = LogicConcept.fromPutdown( `
            :{
                :(= AAA BBB)
                :(> AAA 1)
                (> BBB 1)
            } +{"label":"equality elimination"}
        ` )[0]
        expect( instantiated.equals( expected ) ).equals( true )
        // Way #3: instantiate exactly the symbols that are metavariables
        instantiation = new Map()
        instantiation.set( 'P', Matching.newEF( new LurchSymbol( 'v' ),
            LogicConcept.fromPutdown( '(> v 1)' )[0] ) )
        instantiation.set( 'a', LogicConcept.fromPutdown(
            '(first letter)' )[0] )
        instantiation.set( 'b', LogicConcept.fromPutdown(
            '(second letter)' )[0] )
        instantiated = Formula.instantiate( formula, instantiation )
        expected = LogicConcept.fromPutdown( `
            :{
                :(= (first letter) (second letter))
                :(> (first letter) 1)
                (> (second letter) 1)
            } +{"label":"equality elimination"}
        ` )[0]
        expect( instantiated.equals( expected ) ).equals( true )
    } )

    it( 'Should instantiate formulas from Solutions', () => {
        // This test is almost the exact same as the one above, except
        // we pass arguments to the instantiate() function as Solution instances
        // rather than JS Map instances.  Small changes were made to accommodate
        // the limitations of Substitutions; they are noted below.
        let formula
        let instantiated
        let expected
        let instantiation

        // Re-use an environment from an earlier test as the formula; it has
        // no metavariables, so any instantiation will be the same:
        formula = LogicConcept.fromPutdown( ` {
            one    (two 3)    :(4 five , six)    { seven }
        } ` )[0]
        instantiation = new Matching.Solution( new Matching.Problem )
        instantiation.add( new Matching.Substitution(
            new LurchSymbol( 'x' ).makeIntoA( Matching.metavariable ),
            LogicConcept.fromPutdown( 'testing' )[0] ) )
        // the following replacement was changed because Substitutions can have
        // only Expressions in their image
        instantiation.add( new Matching.Substitution(
            new LurchSymbol( 'y' ).makeIntoA( Matching.metavariable ),
            LogicConcept.fromPutdown( '(a b c)' )[0] ) )
        instantiation.add( new Matching.Substitution(
            new LurchSymbol( 'z' ).makeIntoA( Matching.metavariable ),
            LogicConcept.fromPutdown( ':1' )[0] ) )
        instantiated = Formula.instantiate( formula, instantiation )
        expect( formula.equals( instantiated ) ).equals( true )

        // Re-use an expression from an earlier test as the formula; it has 1
        // metavariable, so we will try instantiating it three ways:
        // Way #1: example -> 7
        formula = LogicConcept.fromPutdown( `
            (this (is an example expression) (with #s 1 2 3))
        ` )[0]
        formula.child( 1, 2 ).makeIntoA( Matching.metavariable )
        instantiation = new Matching.Solution( new Matching.Problem )
        instantiation.add( new Matching.Substitution(
            new LurchSymbol( 'example' ).makeIntoA( Matching.metavariable ),
            LogicConcept.fromPutdown( '7' )[0] ) )
        instantiated = Formula.instantiate( formula, instantiation )
        expected = LogicConcept.fromPutdown(
            '(this (is an 7 expression) (with #s 1 2 3))'
        )[0]
        expect( instantiated.equals( expected ) ).equals( true )
        // Way #2: example -> (some compound expression)
        formula = LogicConcept.fromPutdown( `
            (this (is an example expression) (with #s 1 2 3))
        ` )[0]
        formula.child( 1, 2 ).makeIntoA( Matching.metavariable )
        instantiation = new Matching.Solution( new Matching.Problem )
        instantiation.add( new Matching.Substitution(
            new LurchSymbol( 'example' ).makeIntoA( Matching.metavariable ),
            LogicConcept.fromPutdown( '(some compound expression)' )[0] ) )
        instantiated = Formula.instantiate( formula, instantiation )
        expect( instantiated.equals( LogicConcept.fromPutdown(
            `(this (is an (some compound expression) expression)
                   (with #s 1 2 3))`
        )[0] ) ).equals( true )
        // Way #3: example -> { an env }, which is invalid LogicConcept
        // structure, but we cannot test this with Substitutions; we have
        // tested it in other tests; see above.

        // Re-use an environment from an earlier test as the formula; it has 3
        // metavariables, and we will try instantiating it three ways:
        formula = LogicConcept.fromPutdown( `
            :{
                :(= a b)
                :("LDE EFA" P a)
                ("LDE EFA" P b)
            } +{"label":"equality elimination"}
        ` )[0]
        formula.descendantsSatisfying( d => d instanceof LurchSymbol )
            .filter( s => ['P','a','b'].includes( s.text() ) )
            .forEach( s => s.makeIntoA( Matching.metavariable ) )
        // Way #1: instantiate only a subset of the metavariables
        instantiation = new Matching.Solution( new Matching.Problem )
        instantiation.add( new Matching.Substitution(
            new LurchSymbol( 'P' ).makeIntoA( Matching.metavariable ),
            Matching.newEF( new LurchSymbol( 'v' ),
                LogicConcept.fromPutdown( '(> v 1)' )[0] ) ) )
        instantiated = Formula.instantiate( formula, instantiation )
        expected = LogicConcept.fromPutdown( `
            :{
                :(= a b)
                :(> a 1)
                (> b 1)
            } +{"label":"equality elimination"}
        ` )[0]
        expected.descendantsSatisfying( d => d instanceof LurchSymbol )
            .filter( s => ['P','a','b'].includes( s.text() ) )
            .forEach( s => s.makeIntoA( Matching.metavariable ) )
        expect( instantiated.equals( expected ) ).equals( true )
        // Way #2: try to instantiate the metavariables and some non-meta-
        // variables as well, which should not actually instantiate the
        // symbols in that latter category
        instantiation = new Matching.Solution( new Matching.Problem )
        instantiation.add( new Matching.Substitution(
            new LurchSymbol( 'P' ).makeIntoA( Matching.metavariable ),
            Matching.newEF( new LurchSymbol( 'v' ),
                LogicConcept.fromPutdown( '(> v 1)' )[0] ) ) )
        instantiation.add( new Matching.Substitution(
            new LurchSymbol( 'a' ).makeIntoA( Matching.metavariable ),
            new LurchSymbol( 'AAA' ) ) )
        instantiation.add( new Matching.Substitution(
            new LurchSymbol( 'b' ).makeIntoA( Matching.metavariable ),
            new LurchSymbol( 'BBB' ) ) )
        instantiation.add( new Matching.Substitution(
            new LurchSymbol( 'c' ).makeIntoA( Matching.metavariable ),
            LogicConcept.fromPutdown( '(this is unused)' )[0] ) )
        instantiation.add( new Matching.Substitution(
            new LurchSymbol( 'd' ).makeIntoA( Matching.metavariable ),
            LogicConcept.fromPutdown( '(this also)' )[0] ) )
        instantiated = Formula.instantiate( formula, instantiation )
        expected = LogicConcept.fromPutdown( `
            :{
                :(= AAA BBB)
                :(> AAA 1)
                (> BBB 1)
            } +{"label":"equality elimination"}
        ` )[0]
        expect( instantiated.equals( expected ) ).equals( true )
        // Way #3: instantiate exactly the symbols that are metavariables
        instantiation = new Matching.Solution( new Matching.Problem )
        instantiation.add( new Matching.Substitution(
            new LurchSymbol( 'P' ).makeIntoA( Matching.metavariable ),
            Matching.newEF( new LurchSymbol( 'v' ),
                LogicConcept.fromPutdown( '(> v 1)' )[0] ) ) )
        instantiation.add( new Matching.Substitution( 
            new LurchSymbol( 'a' ).makeIntoA( Matching.metavariable ),
            LogicConcept.fromPutdown( '(first letter)' )[0] ) )
        instantiation.add( new Matching.Substitution(
            new LurchSymbol( 'b' ).makeIntoA( Matching.metavariable ),
            LogicConcept.fromPutdown( '(second letter)' )[0] ) )
        instantiated = Formula.instantiate( formula, instantiation )
        expected = LogicConcept.fromPutdown( `
            :{
                :(= (first letter) (second letter))
                :(> (first letter) 1)
                (> (second letter) 1)
            } +{"label":"equality elimination"}
        ` )[0]
        expect( instantiated.equals( expected ) ).equals( true )
    } )

    it( 'Should instantiate formulas from Substitutions', () => {
        // This test is literally just the exact same as the one above, except
        // we pass arguments to the instantiate() function as Substitution
        // instances rather than Solution instances.  This requires, in some
        // cases, multiple calls to instantiate().
        let formula
        let instantiated
        let expected

        // Re-use an environment from an earlier test as the formula; it has
        // no metavariables, so any instantiation will be the same:
        formula = LogicConcept.fromPutdown( ` {
            one    (two 3)    :(4 five , six)    { seven }
        } ` )[0]
        instantiated = Formula.instantiate( formula,
            new Matching.Substitution(
                new LurchSymbol( 'x' ).makeIntoA( Matching.metavariable ),
                LogicConcept.fromPutdown( 'testing' )[0] ) )
        instantiated = Formula.instantiate( instantiated,
            new Matching.Substitution(
                new LurchSymbol( 'y' ).makeIntoA( Matching.metavariable ),
                LogicConcept.fromPutdown( '(a b c)' )[0] ) )
        instantiated = Formula.instantiate( instantiated,
            new Matching.Substitution(
                new LurchSymbol( 'z' ).makeIntoA( Matching.metavariable ),
                LogicConcept.fromPutdown( ':1' )[0] ) )
        expect( formula.equals( instantiated ) ).equals( true )

        // Re-use an expression from an earlier test as the formula; it has 1
        // metavariable, so we will try instantiating it three ways:
        // Way #1: example -> 7
        formula = LogicConcept.fromPutdown( `
            (this (is an example expression) (with #s 1 2 3))
        ` )[0]
        formula.child( 1, 2 ).makeIntoA( Matching.metavariable )
        instantiated = Formula.instantiate( formula,
            new Matching.Substitution(
                new LurchSymbol( 'example' ).makeIntoA( Matching.metavariable ),
                LogicConcept.fromPutdown( '7' )[0] ) )
        expected = LogicConcept.fromPutdown(
            '(this (is an 7 expression) (with #s 1 2 3))'
        )[0]
        expect( instantiated.equals( expected ) ).equals( true )
        // Way #2: example -> (some compound expression)
        formula = LogicConcept.fromPutdown( `
            (this (is an example expression) (with #s 1 2 3))
        ` )[0]
        formula.child( 1, 2 ).makeIntoA( Matching.metavariable )
        instantiated = Formula.instantiate( formula,
            new Matching.Substitution(
                new LurchSymbol( 'example' ).makeIntoA( Matching.metavariable ),
                LogicConcept.fromPutdown( '(some compound expression)' )[0] ) )
        expect( instantiated.equals( LogicConcept.fromPutdown(
            `(this (is an (some compound expression) expression)
                   (with #s 1 2 3))`
        )[0] ) ).equals( true )
        // Way #3: example -> { an env }, which is invalid LogicConcept
        // structure, but we cannot test this with Substitutions; we have
        // tested it in other tests; see above.

        // Re-use an environment from an earlier test as the formula; it has 3
        // metavariables, and we will try instantiating it three ways:
        formula = LogicConcept.fromPutdown( `
            :{
                :(= a b)
                :("LDE EFA" P a)
                ("LDE EFA" P b)
            } +{"label":"equality elimination"}
        ` )[0]
        formula.descendantsSatisfying( d => d instanceof LurchSymbol )
            .filter( s => ['P','a','b'].includes( s.text() ) )
            .forEach( s => s.makeIntoA( Matching.metavariable ) )
        // Way #1: instantiate only a subset of the metavariables
        instantiated = Formula.instantiate( formula, 
            new Matching.Substitution(
                new LurchSymbol( 'P' ).makeIntoA( Matching.metavariable ),
                Matching.newEF( new LurchSymbol( 'v' ),
                    LogicConcept.fromPutdown( '(> v 1)' )[0] ) ) )
        expected = LogicConcept.fromPutdown( `
            :{
                :(= a b)
                :(> a 1)
                (> b 1)
            } +{"label":"equality elimination"}
        ` )[0]
        expected.descendantsSatisfying( d => d instanceof LurchSymbol )
            .filter( s => ['P','a','b'].includes( s.text() ) )
            .forEach( s => s.makeIntoA( Matching.metavariable ) )
        expect( instantiated.equals( expected ) ).equals( true )
        // Way #2: try to instantiate the metavariables and some non-meta-
        // variables as well, which should not actually instantiate the
        // symbols in that latter category
        instantiated = Formula.instantiate( formula,
            new Matching.Substitution(
                new LurchSymbol( 'P' ).makeIntoA( Matching.metavariable ),
                Matching.newEF( new LurchSymbol( 'v' ),
                    LogicConcept.fromPutdown( '(> v 1)' )[0] ) ) )
        instantiated = Formula.instantiate( instantiated,
            new Matching.Substitution(
                new LurchSymbol( 'a' ).makeIntoA( Matching.metavariable ),
                new LurchSymbol( 'AAA' ) ) )
        instantiated = Formula.instantiate( instantiated,
            new Matching.Substitution(
                new LurchSymbol( 'b' ).makeIntoA( Matching.metavariable ),
                new LurchSymbol( 'BBB' ) ) )
        instantiated = Formula.instantiate( instantiated,
            new Matching.Substitution(
                new LurchSymbol( 'c' ).makeIntoA( Matching.metavariable ),
                LogicConcept.fromPutdown( '(this is unused)' )[0] ) )
        instantiated = Formula.instantiate( instantiated,
            new Matching.Substitution(
                new LurchSymbol( 'd' ).makeIntoA( Matching.metavariable ),
                LogicConcept.fromPutdown( '(this also)' )[0] ) )
        expected = LogicConcept.fromPutdown( `
            :{
                :(= AAA BBB)
                :(> AAA 1)
                (> BBB 1)
            } +{"label":"equality elimination"}
        ` )[0]
        expect( instantiated.equals( expected ) ).equals( true )
        // Way #3: instantiate exactly the symbols that are metavariables
        instantiated = Formula.instantiate( formula,
            new Matching.Substitution(
                new LurchSymbol( 'P' ).makeIntoA( Matching.metavariable ),
                Matching.newEF( new LurchSymbol( 'v' ),
                    LogicConcept.fromPutdown( '(> v 1)' )[0] ) ) )
        instantiated = Formula.instantiate( instantiated,
            new Matching.Substitution( 
                new LurchSymbol( 'a' ).makeIntoA( Matching.metavariable ),
                LogicConcept.fromPutdown( '(first letter)' )[0] ) )
        instantiated = Formula.instantiate( instantiated,
            new Matching.Substitution(
                new LurchSymbol( 'b' ).makeIntoA( Matching.metavariable ),
                LogicConcept.fromPutdown( '(second letter)' )[0] ) )
        expected = LogicConcept.fromPutdown( `
            :{
                :(= (first letter) (second letter))
                :(> (first letter) 1)
                (> (second letter) 1)
            } +{"label":"equality elimination"}
        ` )[0]
        expect( instantiated.equals( expected ) ).equals( true )
    } )

    it( 'Should respect the "preserve" attribute to instantiate', () => {
        let formula
        let instantiated
        let expected

        // Repeat a portion of the first instantiation test above, for Objects,
        // but now we place some attributes on the metavariables that will be
        // substituted:
        formula = LogicConcept.fromPutdown( `
            :{
                :(= a b)
                :("LDE EFA" P a)
                ("LDE EFA" P b)
            } +{"label":"equality elimination"}
        ` )[0]

        // Here's where we mark P, a, and b as metavariables:
        formula.descendantsSatisfying( d => d instanceof LurchSymbol )
            .filter( s => ['P','a','b'].includes( s.text() ) )
            .forEach( s => s.makeIntoA( Matching.metavariable ) )
        // Here's where we give them some other attributes, too:
        // 1. Every P and a will be colored green.
        formula.descendantsSatisfying( d => d instanceof LurchSymbol )
            .filter( s => ['P','a'].includes( s.text() ) )
            .forEach( s => s.setAttribute( 'color', 'green' ) )
        // 2. Every P and b will be flavored bitter.
        formula.descendantsSatisfying( d => d instanceof LurchSymbol )
            .filter( s => ['P','b'].includes( s.text() ) )
            .forEach( s => s.setAttribute( 'flavor', 'bitter' ) )
        // 3. Every a and b will be have type "lower-case".
        formula.descendantsSatisfying( d => d instanceof LurchSymbol )
            .filter( s => ['a','b'].includes( s.text() ) )
            .forEach( s => s.makeIntoA( 'lower-case' ) )

        // Now we try instantiating without preserving any attributes.
        // We should get an output that retains none of the attributes that
        // were on the original metavariables.
        instantiated = Formula.instantiate( formula, {
            'P' : Matching.newEF( new LurchSymbol( 'v' ),
                LogicConcept.fromPutdown( '(> v 1)' )[0] ),
            'a' : new LurchSymbol( 'I was "a" before' ).makeIntoA( 'foo!' ),
            'b' : LogicConcept.fromPutdown( '(+ x 1)' )[0]
        } )
        expected = LogicConcept.fromPutdown( `
            :{
                :(= "I was \\"a\\" before" +{"_type_foo!":true}
                    (+ x 1))
                :(> "I was \\"a\\" before" +{"_type_foo!":true}
                    1)
                (> (+ x 1) 1)
            } +{"label":"equality elimination"}
        ` )[0]
        expect( instantiated.equals( expected ) ).equals( true )

        // Repeat the same test but preserve just the color attribute.
        // We should get an output that is the same as last time, except the
        // instantiation of "a" will have color green.  (Although P's
        // instantiation also had it, it was removed when P was beta-reduced.)
        instantiated = Formula.instantiate( formula, {
            'P' : Matching.newEF( new LurchSymbol( 'v' ),
                LogicConcept.fromPutdown( '(> v 1)' )[0] ),
            'a' : new LurchSymbol( 'I was "a" before' ).makeIntoA( 'foo!' ),
            'b' : LogicConcept.fromPutdown( '(+ x 1)' )[0]
        }, [ "color" ] )
        expected = LogicConcept.fromPutdown( `
            :{
                :(= "I was \\"a\\" before" +{"_type_foo!":true,"color":"green"}
                    (+ x 1))
                :(> "I was \\"a\\" before" +{"_type_foo!":true,"color":"green"}
                    1)
                (> (+ x 1) 1)
            } +{"label":"equality elimination"}
        ` )[0]
        expect( instantiated.equals( expected ) ).equals( true )

        // Repeat the same test but preserve just the flavor attribute.
        // We should get an output that is the same as the first time, except
        // instantiation of "b" will have flavor bitter.  (Although P's
        // instantiation also had it, it was removed when P was beta-reduced.)
        instantiated = Formula.instantiate( formula, {
            'P' : Matching.newEF( new LurchSymbol( 'v' ),
                LogicConcept.fromPutdown( '(> v 1)' )[0] ),
            'a' : new LurchSymbol( 'I was "a" before' ).makeIntoA( 'foo!' ),
            'b' : LogicConcept.fromPutdown( '(+ x 1)' )[0]
        }, [ "flavor" ] )
        expected = LogicConcept.fromPutdown( `
            :{
                :(= "I was \\"a\\" before" +{"_type_foo!":true}
                    (+ x 1) +{"flavor":"bitter"}
                    )
                :(> "I was \\"a\\" before" +{"_type_foo!":true}
                    1)
                (> (+ x 1) +{"flavor":"bitter"}
                    1)
            } +{"label":"equality elimination"}
        ` )[0]
        expect( instantiated.equals( expected ) ).equals( true )

        // Repeat the same test but preserve color, flavor, and lower-case
        // status.  We should get an output that retains every attribute except
        // those on P, for the reasons documented above.
        instantiated = Formula.instantiate( formula, {
            'P' : Matching.newEF( new LurchSymbol( 'v' ),
                LogicConcept.fromPutdown( '(> v 1)' )[0] ),
            'a' : new LurchSymbol( 'I was "a" before' ).makeIntoA( 'foo!' ),
            'b' : LogicConcept.fromPutdown( '(+ x 1)' )[0]
        }, [ "color", "flavor", MathConcept.typeAttributeKey( 'lower-case' ) ] )
        expected = LogicConcept.fromPutdown( `
            :{
                :(= "I was \\"a\\" before"
                        +{"_type_foo!":true,"color":"green"}
                        +{"_type_lower-case":true}
                    (+ x 1)
                        +{"flavor":"bitter"}
                        +{"_type_lower-case":true}
                    )
                :(> "I was \\"a\\" before"
                        +{"_type_foo!":true,"color":"green"}
                        +{"_type_lower-case":true}
                    1)
                (> (+ x 1)
                        +{"flavor":"bitter"}
                        +{"_type_lower-case":true}
                    1)
            } +{"label":"equality elimination"}
        ` )[0]
        expect( instantiated.equals( expected ) ).equals( true )
    } )

} )
