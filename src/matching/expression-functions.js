
/**
 * @file Defines functions for working with expression functions and their
 *   applications
 * @namespace ExpressionFunctions
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
 * $\lambda v1,\ldots,v_n.B$, where each $v_i$ is a parameter to the function
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
 * {@link LogicConcept#fromPutdown putdown notation} so that we can express
 * them as {@link LogicConcept LogicConcepts}.  We define a constant in this
 * module to be `"LDE lambda"` so that we can express the $f$ from above as
 * `("LDE lambda" v_1 v_2 , (+ v_1 (cos (+ v_2 1))))`.
 * That constant is not guaranteed to always have that name, so clients should
 * not hard-code that name into their code, but instead use
 * {@link ExpressionFunctions#newEF newEF()} and
 * {@link ExpressionFunctions#isAnEF isAnEF()}.
 * 
 * An *Expression Function Application* (or EFA for short) is an
 * {@link Expression Expression} expressing the idea that we are applying some
 * Expression Function to a list of arguments.  For example, the application
 * above was $f(3,k)$, but we cannot write this in
 * {@link LogicConcept#fromPutdown putdown notation} as `(f 3 k)` because that
 * would be indistinguishable from normal function application.  Thus we need a
 * new symbol.  We define a constant in this module to be `"LDE EFA"` so that we
 * can express $f(3,k)$ as `("LDE EFA" f 3 k)`.  That constant is not guaranteed
 * to always have that name, so clients should not hard-code that name into
 * their code, but instead use {@link ExpressionFunctions#newEF newEFA()} and
 * {@link ExpressionFunctions#isAnEF isAnEFA()}.
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
 * @namespace ExpressionFunctions
 * @see {@link ExpressionFunctions#isAnEF isAnEF()}
 */
export const newEF = ( ...args ) =>
    new Binding( expressionFunction.copy(), ...args )

/**
 * Test whether the given {@link Expression Expression} encodes an Expression
 * Function, as defined by the encoding documented at the top of this file, and
 * as produced by the function {@link ExpressionFunctions#newEF newEF()}.
 * 
 * @param {Expression} expr the {@link Expression Expression} to test whether it
 *   encodes an Expression Function
 * @returns {boolean} true if and only if `expr` encodes an Expression Function
 * 
 * @namespace ExpressionFunctions
 * @see {@link ExpressionFunctions#newEF newEF()}
 */
export const isAnEF = expr =>
    expr instanceof Binding && expr.head().equals( expressionFunction )

// We use this symbol for encoding Expression Function Applications as
// LogicConcepts, as described above.
const expressionFunctionApplication = new Symbol( 'LDE EFA' )

/**
 * Creates a new Expression Function Application, encoded as an
 * {@link Expression Expression}, as described at the top of this file.
 * 
 * For example, if `F` is an {@link Expression Expression} representing an
 * Expression Function (or a metavariable that might later be instantiated as
 * one) and `x` and `y` are any other {@link Expression Expressions} (let's just
 * say the symbols "x" and "y" for this example) then `newEFA(F,x,y)` will be
 * the {@link Expression Expression} `("LDE EFA" F x y)`.
 * 
 * If the first argument is a metavariable then there must be one or more
 * additional arguments of any type.  If the first argument is an Expression
 * Function (as per {@link ExpressionFunctions#isAnEF isAnEF()}) then there must
 * be a number of arguments following it that are equal to its arity.  If these
 * rules are not followed, an error is thrown.
 * 
 * @param  {Expression} operator the {@link Expression Expression} to be used as
 *   the expression function in the result; this should be either an Expression
 *   Function (that is, it satisfies
 *   {@link ExpressionFunctions#isAnEF isAnEF()}) or a metavariable (that is,
 *   it satisfies `.isA( Constraint.metavariable )`, as defined in
 *   {@link Constraint#metavariable the Constraint class}), because no other
 *   type of {@link Expression Expression} can be applied as an Expression
 *   Function
 * @param {...Expression} operands the arguments to which `operator` will be
 *   applied
 * @returns {Application} an Expression Function Application encoded as
 *   described in the documentation at the top of this file
 * 
 * @namespace ExpressionFunctions
 * @see {@link ExpressionFunctions#isAnEFA isAnEFA()}
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
 * produced by the function {@link ExpressionFunctions#newEFA newEFA()}.
 * 
 * @param {Expression} expr the expression to test whether it encodes an
 *   Expression Function Application
 * @returns {boolean} true if and only if `expr` encodes an Expression Function
 *   Application
 * 
 * @namespace ExpressionFunctions
 * @see {@link ExpressionFunctions#newEFA newEFA()}
 */
export const isAnEFA = expr =>
    expr instanceof Application
 && expr.firstChild().equals( expressionFunctionApplication )
