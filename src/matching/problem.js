
import { LogicConcept } from "../logic-concept.js"
import { Constraint } from "./constraint.js"

/**
 * A matching problem is a set of {@link Constraint Constraints} to be solved.
 * Some problems have just one solution and others have many.  Examples:
 * 
 *  * If we have a single constraint $(f(x,y),k+3)$, with $f,x,y$
 *    {@link Constraint.metavariable metavariables}, then there is a single
 *    solution: $f\mapsto +$, $x\mapsto k$, $y\mapsto 3$.
 *  * If we have a single constraint $(P(3),3=3)$, with $P$ a
 *    {@link Constraint.metavariable metavariable}, then there are four
 *    solutions, shown below.  Note that the dummy variable used in the
 *    $\lambda$ expression is irrelevant; it could be any symbol other than 3.
 *     * $P\mapsto\lambda x.{}3=3$
 *     * $P\mapsto\lambda x.{}x=3$
 *     * $P\mapsto\lambda x.{}3=x$
 *     * $P\mapsto\lambda x.{}x=x$
 *
 * With more than one constraint, solving the problem becomes more complex,
 * because all constraints must be satisfied at once, and there may be many
 * metavariables.  It is also important that any solution must avoid variable
 * capture, that is, we cannot assign a metavariable $X\mapsto y$ if performing
 * the substitution $X\mapsto y$ in some pattern would require replacing a free
 * $X$ at a location where $y$ is not free to replace that $X$.
 * 
 * This class expresses a matching problem, that is, a set of matching
 * {@link Constraint Constraints}, and includes an algorithm for solving them
 * simultaneously, producing a list of solutions (which may be empty).  Each
 * solution on the list is also a set of {@link Constraint Constraints}, but
 * each one will have a single metavariable as its pattern, that is, it will
 * pass the {@link Constraint#canBeApplied canBeApplied()} test, and thus it is
 * fully reduced, in the sense that there is no more "solving" work to be done.
 */
export class Problem {

    /**
     * Construct a new matching problem with no constraints in it.  Then, if any
     * argument are provided, they are passed directly to the
     * {@link Problem#add add()} function.  See its documentation for how they
     * are processed.
     * 
     * @param {...any} args constraints to add to this problem after its
     *   construction, in a wide variety of forms, as documented in this class's
     *   {@link Problem#add add()} function
     * 
     * @see {@link Problem#add add()}
     */
    constructor ( ...args ) {
        this.constraints = [ ]
        this.captureConstraints = [ ]
        this.add( ...args )
    }

    /**
     * Add constraints to this problem.  Arguments are accepted in any of the
     * following forms.
     * 
     *  * `p.add( p1, e1, p2, e2, ... )`, where `p1`,`p2`,... are patterns and
     *    `e1`,`e2`,... are expressions, as defined in the
     *    {@link Constraint Constraint} class, so that we might construct
     *    {@link Constraint Constraint} instances from them
     *  * `p.add( [ p1, e1, p2, e2, ... ] )`, same as the previous, but in array
     *    form rather than separate arguments
     *  * `p.add( [ [ p1, e1 ], [ p2, e2 ], ... ] )`, same as the previous, but
     *    as an array of pairs rather than flattened
     *  * `p.add( c1, c2, ... )`, where each of `c1`,`c2`,... is a
     *    {@link Constraint Constraint} instance
     *  * `p.add( [ c1, c2, ... ] )`, same as the previous, but in array form
     *    rather than separate arguments
     *  * `p.add( other )`, where `other` is another instance of the Problem
     *    class, and we are to add all of its constraints to `p`
     * 
     * No {@link Constraint Constraint} is added if it is already present, in
     * the sense of there being an {@link Constraint#equals equal Constraint}
     * already stored in this object.
     * 
     * {@link Constraint Constraints} are stored internally in increasing order
     * of {@link Constraint#complexity complexity()}, and this function
     * preserves that order when adding new constraints.  This makes it easy for
     * algorithms to find an easy constraint to process, by taking the first one
     * off the internal list.
     * 
     * @param  {...any} args constraints to add to this problem, in any of the
     *   forms given above
     */
    add ( ...args ) {
        // ensure there is an args[0] to ask questions about
        if ( args.length == 0 ) return
        // if args[0] looks like a pattern, build constraints and recur on them
        if ( args[0] instanceof LogicConcept ) {
            for ( let i = 0 ; i < args.length - 1 ; i += 2 )
                this.add( new Constraint( args[i], args[i+1] ) )
            return
        }
        // if args[0] is an array, there are many possibilities:
        if ( args[0] instanceof Array ) {
            // ensure non-empty
            if ( args[0].length == 0 ) return
            // if it looks like it might be p1,e1,..., or c1,c2,...,
            // handle via recursion
            if ( args[0][0] instanceof LogicConcept
              || args[0][0] instanceof Constraint ) {
                this.add( ...args[0] )
                return
            }
            // if it looks like it might be [p1,e1],..., also recur, flattening
            if ( args[0][0] instanceof Array ) {
                this.add( ...args[0].flat() )
                return
            }
            // else invalid arguments
            throw 'Cannot add this type of data to a Problem'
        }
        // all that's left is to add Constraint instances; this is the main
        // workhorse part of this function, to which all other cases devolve
        args.forEach( constraint => {
            // can add only constraints, and only if we don't already have it
            if ( !( constraint instanceof Constraint ) )
                throw 'Cannot add this type of data to a Problem'
            if ( this.constraints.some(
                    already => already.equals( constraint ) ) )
                return // no need to add two copies of a constraint
            // find location to insert that preserves increasing complexity
            const index = this.constraints.findIndex( already =>
                already.complexity() >= constraint.complexity() )
            if ( index == -1 ) index = this.constraints.length
            this.constraints.splice( index, 0, constraint )
        } )
    }

    /**
     * Construct a new Problem just like this one, except with the given
     * {@link Constraint Constraints} added.  In other words, just call this
     * instance's {@link Problem#copy copy()} function, and then call
     * {@link Problem#add add()} in the copy, then return the new object.
     * 
     * @param  {...any} args the constraints to add to the problem, in any of
     *   the forms supported by the {@link Problem#add add()} function
     * @returns {Problem} a new problem instance equal to this one plus the new
     *   constraints specified as arguments
     */
    plus ( ...args ) {
        const result = this.copy()
        result.add( ...args )
        return result
    }

    /**
     * Most clients will not call this function; it is mostly for internal use,
     * because the internal ordering of the constraints is not published to the
     * clients, and they shouldn't have a need to know it.  But various
     * algorithms within this class occasionally need to remove a constraint,
     * and this function is used to do so.
     * 
     * @param {integer} index a non-negative integer indicating the index of the
     *   constraint to remove; it must be between 0 and this problem's length
     *   minus 1, inclusive
     * 
     * @see {@link Problem#add add()}
     * @see {@link Problem#empty empty()}
     */
    remove ( index ) {
        this.constraints.splice( index, 1 )
    }

    /**
     * Construct a new Problem just like this one, except with the constraint at
     * the given index removed.  In other words, just call this instance's
     * {@link Problem#copy copy()} function, and then call
     * {@link Problem#remove remove()} in the copy, then return the new object.
     * 
     * @param {integer} index a non-negative integer indicating the index of the
     *   constraint to remove; it must be between 0 and this problem's length
     *   minus 1, inclusive
     * @returns {Problem} a new problem instance equal to this one minus the
     *   constraint at the given index
     */
    without ( index ) {
        const result = this.copy()
        result.remove( index )
        return result
    }

    /**
     * The length of a problem is the number of constraints in it.  Note that
     * as a problem is solved, the algorithm successively removes constraints as
     * it satisfies them (sometimes replacing them with one or more simpler
     * ones), so this value may change over time, up or down.
     * 
     * @returns {integer} the number of constraints in this problem
     * 
     * @see {@link Problem#empty empty()}
     */
    get length () {
        return this.constraints.length
    }

    /**
     * Is this problem empty?  That is, does it have zero constraints?  Return
     * true if so, false otherwise
     * 
     * @returns {boolean} whether this problem is empty (no constraints)
     * 
     * @see {@link Problem#length length}
     */
    empty () {
        return this.constraints.length == 0
    }

    /**
     * Create a shallow copy of this object, paying attention only to its
     * constraint set.  Note that while a problem is being solved, various
     * information about it may be computed from the context in which that
     * problem arose, including variable binding constraints, solutions already
     * computed and cached, and more.  This function does not copy any of that
     * information; it copies only the constraint set.
     * 
     * @returns {Problem} a shallow copy of this object
     */
    copy () {
        const result = new Problem()
        result.constraints = this.constraints.slice()
        return result
    }

    /**
     * Equality of two problems is determined solely by the content of their
     * constraint sets.  Any other information computed as part of the solution
     * of the problem, such as variable capture constraints or cached solutions,
     * are not compared.  This function returns true if and only if the set of
     * constraints is the same in both problems.
     * 
     * @param {Problem} other another instance of the Problem class with which
     *   to compare this one
     * @returns {boolean} whether the two instances are equal
     */
    equals ( other ) {
        if ( this.constraints.length != other.constraints.length ) return false
        return this.constraints.every( c1 =>
            other.constraints.some( c2 => c1.equals( c2 ) ) )
    }

}
