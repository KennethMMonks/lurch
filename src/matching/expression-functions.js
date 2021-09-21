
/**
 * @file Defines functions for working with expression functions and their
 *   applications
 * 
 * Let $\mathcal{L}$ be the set of expressions in a language.  Here, we will
 * think of $\mathcal{L}$ as all possible {@link Expression Expressions}, in
 * the technical sense of that word (not just saying "expression" informally,
 * but now referring to instances of the {@link Expression Expressions} class).
 * 
 * An *Expression Function* (or EF for short) is a function whose signature is
 * $f:\mathcal{L}^n\to\mathcal{L}$ for some $n\in\mathbb{N}$.  We need a way to
 * represent Expression Functions as {@link LogicConcept LogicConcepts}.
 * This module provides functions that let us do so.
 * 
 * We will write an Expression Function using standard $\lambda$ notation, as in
 * $\lambda v_1,\ldots,v_n.B$, where each $v_i$ is a parameter to the function
 * (represented using a {@link Symbol Symbol} with the name `v_1`, `v_2`, etc.))
 * and the body $B$ is any {@link Expression Expression} that may contain free
 * instances of the $v_i$ that can be replaced with other
 * {@link Expression Expressions} when the function is applied to arguments.
 * For example, if $f=\lambda v_1,v_2.v_1+\cos(v_2+1)$, then we could apply $f$
 * to the {@link Expression Expressions} $3$ and $k$ to obtain the new
 * {@link Expression Expression} $3+\cos(k+1)$.
 * 
 * The above paragraph uses ordinary mathematical notation, but we will need to
 * be able to write expression functions in
 * {@link LogicConcept.fromPutdown putdown} notation so that we can express
 * them as {@link LogicConcept LogicConcepts}.  We define a constant in this
 * module to be `"LDE lambda"` so that we can express the $f$ from above as
 * `("LDE lambda" v_1 v_2 , (+ v_1 (cos (+ v_2 1))))`.
 * That constant may change in later versions of the LDE, so clients should not
 * hard-code that name into their code, but instead use
 * {@link module:ExpressionFunctions.newEF newEF()} and
 * {@link module:ExpressionFunctions.isAnEF isAnEF()}.
 * 
 * An *Expression Function Application* (or EFA for short) is an
 * {@link Expression Expression} expressing the idea that we are applying some
 * Expression Function to a list of arguments.  For example, the application
 * above was $f(3,k)$, but we cannot write this in
 * {@link LogicConcept#fromPutdown putdown notation} as `(f 3 k)` because that
 * would be indistinguishable from normal function application.  Thus we need a
 * new symbol.  We define a constant in this module to be `"LDE EFA"` so that we
 * can express $f(3,k)$ as `("LDE EFA" f 3 k)`.  That constant may change in
 * later versions of the LDE, so clients should not hard-code that name into
 * their code, but instead use {@link module:ExpressionFunctions.newEF newEFA()} and
 * {@link module:ExpressionFunctions.isAnEF isAnEFA()}.
 *
 * @module ExpressionFunctions
 */

import { Symbol } from "../symbol.js"
import { Binding } from "../binding.js"
import { Application } from "../application.js"
import { metavariable } from "./constraint.js"

// We use this symbol for encoding expression functions as LogicConcepts, as
// described above.
const expressionFunction = new Symbol( 'LDE lambda' )

/**
 * Creates a new expression function, encoded as a
 * {@link LogicConcept LogicConcept}, as described at the top of this file.
 * The arguments are not copied; if you do not wish them removed from their
 * existing contexts, pass copies to this function.
 * 
 * For example, if `x` and `y` are {@link Symbol Symbol} instances with the
 * names "x" and "y" and `B` is an Application, such as `(+ x y)`, then
 * `newEF(x,y,B)` will be the {@link Expression Expression}
 * `("LDE lambda" x y , (+ x y))`.
 * 
 * @param  {...Expression} args a list of {@link Expression Expressions} to use
 *   in forming the expression function, which must begin with one or more
 *   {@link Symbol Symbol} instances followed by exactly one
 *   {@link Expression Expression} of any type, representing the arguments
 *   and the body of the function, respectively
 * @returns {Binding} an Expression Function encoded as described in the
 *   documentation at the top of this file
 * 
 * @see {@link module:ExpressionFunctions.isAnEF isAnEF()}
 */
export const newEF = ( ...args ) =>
    new Binding( expressionFunction.copy(), ...args )

/**
 * Test whether the given {@link Expression Expression} encodes an Expression
 * Function, as defined by the encoding documented at the top of this file, and
 * as produced by the function {@link module:ExpressionFunctions.newEF newEF()}.
 * 
 * @param {Expression} expr the {@link Expression Expression} to test whether it
 *   encodes an Expression Function
 * @returns {boolean} true if and only if `expr` encodes an Expression Function
 * 
 * @see {@link module:ExpressionFunctions.newEF newEF()}
 */
export const isAnEF = expr =>
    expr instanceof Binding && expr.head().equals( expressionFunction )

/**
 * Compute the arity of a given expression function.  If `ef` is not an
 * expression function (as judged by
 * {@link module:ExpressionFunctions.isAnEF isAnEF()}) then an error is thrown.
 * Otherwise, a positive integer is returned representing the arity of the given
 * function, 1 for a unary function, 2 for a binary function, etc.
 * 
 * @param {Expression} ef the expression function whose arity is to be computed
 * @returns {integer} the arity of `ef`
 * 
 * @see {@link module:ExpressionFunctions.isAnEF isAnEF()}
 * @see {@link module:ExpressionFunctions.applyEF applyEF()}
 */
export const arityOfEF = ef => {
    if ( !isAnEF( ef ) )
        throw 'arityOfEF requires an expression function as first argument'
    return ef.boundVariables().length
}

/**
 * Applies `ef` as an expression function to a list of arguments.  If `ef` is
 * not an expression function (as per
 * {@link module:ExpressionFunctions.isAnEF isAnEF()}) or the list of arguments
 * is the wrong length, an error is thrown.  Otherwise, a copy of the body of
 * `ef` is returned with all parameters substituted with arguments.
 * 
 * For example, if `ef` is an {@link Expression Expression} representing
 * $\lambda v_1,v_2.\sqrt{v_1^2+v_2^2}$ and `A` another representing $x-1$ and
 * `B` another representing $y+1$, then `applyEF(ef,A,B)` would be a newly
 * constructed {@link Expression Expression} instance (sharing no subtrees with
 * any of those already mentioned) representing $\sqrt{(x-1)^2+(y+1)^2}$.
 * 
 * No check is made regarding whether this might cause variable capture, and no
 * effort is made to do $\alpha$-substitution to avoid variable capture.  Thus
 * this routine is of limited value; it should be used only in situations where
 * the caller knows that no variable capture will take place.  For example, if
 * `ef` is $\lambda v.\sum_{i=1}^n i^v$ then `applyEF(ef,i)` is
 * $\sum_{i=1}^n i^i$.  No error is thrown; the capture simply happens.
 * 
 * @param {Expression} ef an {@link Expression Expression} representing an
 *   expression function, that is, one that would be judged to be an expression
 *   function by the {@link module:ExpressionFunctions.isAnEF isAnEF()} function
 * @param {...Expression} args the arguments to which to apply `ef`
 * @returns {Expression} a new {@link Expression Expression} instance
 *   representing the application of `ef` to the given `args`
 * 
 * @see {@link module:ExpressionFunctions.isAnEF isAnEF()}
 * @see {@link module:ExpressionFunctions.arityOfEF arityOfEF()}
 */
export const applyEF = ( ef, ...args ) => {
    // verify that all arguments are the way they are supposed to be
    if ( !isAnEF( ef ) )
        throw 'applyEF() requires an expression function as first argument'
    if ( args.length != arityOfEF( ef ) )
        throw 'Incorrect number of arguments given to expression function'
    // if it's a projection function, replaceWith() won't work correctly
    const parameters = ef.boundVariables().map( bv => bv.text() )
    if ( ef.body() instanceof Symbol ) {
        const paramIndex = parameters.indexOf( ef.body().text() )
        if ( paramIndex > -1 ) return args[paramIndex].copy()
    }
    // otherwise we actually have to do replacement within a copy of the body
    const result = ef.body().copy()
    result.descendantsSatisfying(
        d => ( d instanceof Symbol ) && d.isFree( result )
    ).forEach( sym => {
        const paramIndex = parameters.indexOf( sym.text() )
        if ( paramIndex > -1 ) sym.replaceWith( args[paramIndex].copy() )
    } )
    return result
}

// We use this symbol for encoding Expression Function Applications as
// LogicConcepts, as described above.
const expressionFunctionApplication = new Symbol( 'LDE EFA' )

/**
 * Creates a new Expression Function Application, encoded as an
 * {@link Expression Expression}, as described at the top of this file.
 * The arguments are not copied; if you do not wish them removed from their
 * existing contexts, pass copies to this function.
 * 
 * For example, if `F` is an {@link Expression Expression} representing an
 * Expression Function (or a metavariable that might later be instantiated as
 * one) and `x` and `y` are any other {@link Expression Expressions} (let's just
 * say the symbols "x" and "y" for this example) then `newEFA(F,x,y)` will be
 * the {@link Expression Expression} `("LDE EFA" F x y)`.
 * 
 * If the first argument is a metavariable then there must be one or more
 * additional arguments of any type.  If the first argument is an Expression
 * Function (as per {@link module:ExpressionFunctions.isAnEF isAnEF()}) then there must
 * be a number of arguments following it that are equal to its arity.  If these
 * rules are not followed, an error is thrown.
 * 
 * @param  {Expression} operator the {@link Expression Expression} to be used as
 *   the expression function in the result; this should be either an Expression
 *   Function (that is, it satisfies
 *   {@link module:ExpressionFunctions.isAnEF isAnEF()}) or a metavariable (that is,
 *   it satisfies `.isA( Constraint.metavariable )`, as defined in
 *   {@link Constraint#metavariable the Constraint class}), because no other
 *   type of {@link Expression Expression} can be applied as an Expression
 *   Function
 * @param {...Expression} operands the arguments to which `operator` will be
 *   applied
 * @returns {Application} an Expression Function Application encoded as
 *   described in the documentation at the top of this file
 * 
 * @see {@link module:ExpressionFunctions.isAnEFA isAnEFA()}
 */
export const newEFA = ( operator, ...operands ) => {
    if ( operator.isA( metavariable ) && operands.length == 0 )
        throw 'Expression Function Applications require at least one argument'
    if ( isAnEF( operator )
      && operands.length != operator.boundVariables().length )
        throw 'Expression Function applied to the wrong number of arguments'
    return new Application( expressionFunctionApplication.copy(),
        operator, ...operands )
}

/**
 * Test whether the given expression encodes an Expression Function Application,
 * as defined by the encoding documented at the top of this file, and as
 * produced by the function {@link module:ExpressionFunctions.newEFA newEFA()}.
 * 
 * @param {Expression} expr the expression to test whether it encodes an
 *   Expression Function Application
 * @returns {boolean} true if and only if `expr` encodes an Expression Function
 *   Application
 * 
 * @see {@link module:ExpressionFunctions.newEFA newEFA()}
 */
export const isAnEFA = expr =>
    expr instanceof Application && expr.numChildren() > 2
 && expr.firstChild().equals( expressionFunctionApplication )
