//////////////////////////////////////////////////////////////////////////////
//
//                                Docify
//                prepare an LC for Global n-compact Validation 
//
//  (KEEP OUT!  Work in progress.)
//
//  This file is still under construction and subject to frequent change.
//
//  In the current implementation of global n-compact validation we currently
//  make many simplifying assumptions about the nature of a document.  But they
//  are hard to keep track of when just defined, but not codified.  So we
//  include here routines for the phase of processing that moves things around
//  and computes js attributes that are required for validation.

//////////////////////////////////////////////////////////////////////////////
//
// Imports
//
import fs from 'fs'
import { LogicConcept } from '../logic-concept.js'
import { Environment } from '../environment.js'
import { Symbol as LurchSymbol } from '../symbol.js'
import { lc , checkExtension, subscript } from './extensions.js'
import { processShorthands } from './parsing.js'

//////////////////////////////////////////////////////////////////////////////
//  docify
//
//  This takes a raw user's document as an LC environment and preprocesses it in
//  preparation for validation using all of the routines in this document. 
export const docify = (doc) => {
  processShorthands(doc)
  moveDeclaresToTop(doc)
  processTheorems(doc)
  processDeclarationBodies(doc)
  processLetEnvironments(doc)
  processBindings(doc)
  processRules(doc)
  assignProperNames(doc)
  markDeclaredSymbols(doc)
  return doc
}

//////////////////////////////////////////////////////////////////////////////
//
// Utilities
//
//////////////////////////////////////
//
// Structural Changing Utilities
//

// Move Declares to the top of the document.
export const moveDeclaresToTop = doc => {
  doc.Declares().reverse().forEach( dec => {
    if (dec.body()) throw new Error('Global constant declarations cannot have a body.')
    dec.remove()
    doc.unshiftChild(dec)
  })
  return doc
}

// Process the user's theorems 
//
// If a user specifies that a claim Environment is a Theorem, he is declaring
// that he wants to use it as a Rule after that (if we enable the option to
// allow users to enter Theorems... otherwise just let them enter them as
// ordinary claim environments like proofs that aren't marked asA 'Theorem' but
// can be formatted as such). But we want to mark his theorem as valid or
// invalid just like any other proof in addition to using it as a Rule.  To
// accomplish this, we make an invisible copy of the Theorem immediately
// following the theorem, make that a formula, and label it as a Rule for future
// use.  This does not have to be done if the Theorem has no metavariables as a
// Rule because it would be redundant. When a Rule copy of the user's Theorem is
// inserted it does not have to be marked as a given since it has no prop form,
// but its instantiations do.  We flag the inserted Rule version of the Theorem as
// .userThm to distinguish it from ordinary Rules.
//
// This has to be done after processing Shorthands and moving Declares to the
// top so the user's theorems are in the scope of declared constants in the
// library, which then prevents them from being metavariables. 
export const processTheorems = doc => {
  [ ...doc.descendantsSatisfyingIterator( x => x.isA('Theorem') ) ].forEach( 
    thm => {
      // to make this idempotent, check if the copy is already there
      if ( thm.nextSibling()?.userRule ) { return }
      // make a formula copy of the thm
      let thmrule = Formula.from(thm)
      // if it doesn't have any metavars there's no need for it
      if ( Formula.domain(thmrule).size === 0 ) { return }
      // if it does, change it from a Theorem to a Rule
      thmrule.unmakeIntoA('Theorem')
      thmrule.makeIntoA('Rule')
      // mark it for easy identification later
      thmrule.userRule = true
      // and insert it after the theorem
      thmrule.insertAfter(thm)
    })
  return doc
}

// Process Declaration Bodies
//
// Append the bodies of all declarations.
export const processDeclarationBodies = doc => {
  // get the declarations with a body (hence the 'true') that don't contain 
  // metavariables (do this before converting a Rule to a formula)
  const decs = doc.declarations(true).filter( dec => Formula.domain(dec).size===0)
  // insert a copy of the body after the declaration and mark where it came from
  // with the js attribute .bodyOf, unless it's already there
  decs.forEach( dec => {
    // if its already there, we're done
    if ( dec.nextSibling()?.bodyOf === dec ) { return } 
    let decbody = dec.body().copy()
    if (dec.isA('given')) decbody.makeIntoA('given')
    decbody.bodyOf = dec
    decbody.insertAfter(dec)
  })
  return doc
}  


//////////////////////////////////////////////////////////////////////////////
// Process Let Environments
//
// Get the Lets.  If they don't start an environment, wrap them to make a valid
// Let-environment. We make this restriction, so that a Let-env is a type of LC
// that can be used as a rule premise and can only be satisfied by another
// Let-env.  We don't upgrade that to a subclass for now.
// TODO: consider upgrading let-envs to a subclass of environment
export const processLetEnvironments = ( doc ) => {
  // Get all of the Let's whether or not they have bodies and make sure they are
  // the first child of their enclosing environment.  If not, wrap their scope
  // in an environment so that they are.
  doc.lets().forEach( dec => {
    const i = dec.indexInParent()
    const parent = dec.parent()
    if (i) parent.insertChild( new Environment(...parent.children().slice(i)) , i )
  })
}

//////////////////////////////////////////////////////////////
// Rename Bindings for Alpha Equivalence
//
// make all bindings canonical by assigning ProperNames x₀, x₁, ...
export const processBindings = doc => {
  doc.statements().forEach( expr => renameBindings( expr ))
  return doc
}

//////////////////////////////////////////////////////////////
// process Rules 
//
// Check and mark the Rules, make them into formulas, and replace
// and rename their bound variables
export const processRules = doc => {
  // get all of the Rules
  [...doc.descendantsSatisfyingIterator(x=>x.isA('Rule'))].forEach( f => {
    // check if f is not an Environment, or is a Let-environment, and throw
    // an error either way
    if (!f instanceof Environment || f.isALetEnvironment() )
      throw new Error('A rule must be an environment that is not a Let-environment.')
    // it's not, so convert it to a formula
    // the second arg specifies it should be done in place
    Formula.from(f,true)
    // if it has metavariables, ignore it as a proposition
    if (Formula.domain(f).size>0) f.ignore = true
    // // replace all bound variables with y₀, y₁, ... etc and rename them to
    // // ProperNames x₀, x₁, ... etc to make them canonical
    f.statements().forEach( expr => { 
      replaceBindings( expr , 'y' )
      // TODO: this might be redundate if we run the previous routine first
      renameBindings( expr )
      } )
  } )
}

//////////////////////////////////////////////////////////////////////////////
// Assign Proper Names
//
// Rename any symbol declared by a declartion with body by appending the putdown
// form of their body. Rename any symbol in the scope of a Let-without body by
// appending a tick mark.
//
// For bodies that have a binding we want to use the alpha-equivalent canonical
// form.
export const assignProperNames = doc => {
  
  const metavariable = "LDE MV"
  
  // get the declarations with a body (hence the 'true') which is an expression
  // TODO: we don't support environments as bodies yet.  Decide or upgrade.
  let declarations = doc.declarations(true).filter( x => 
    x.body() instanceof Expression)
  
  // rename all of the declared symbols with body that aren't metavars
  declarations.forEach( decl => {
    decl.symbols().filter(s=>!s.isA(metavariable)).forEach( c => {
      // Compute the new ProperName
      c.setAttribute('ProperName',
        c.text()+'#'+decl.body().toPutdown((L,S,A)=>S)) //.prop())
      // apply it to all c's in it's scope
      decl.scope().filter( x => x instanceof LurchSymbol && x.text()===c.text())
        .forEach(s => s.setAttribute('ProperName',c.getAttribute('ProperName')))
    })
  })

  // if it is an instantiation it is possible that some of the declarations
  // without bodies have been instantiated with ProperNames already (from the
  // user's expressions) that are not the correct ProperNames for the
  // instantiation, so we fix them.  
  // TODO: merge this with the code immediately above.
  declarations = doc.declarations().filter( x => x.body()===undefined )
  declarations.forEach( decl => {
    decl.symbols().filter(s=>!s.isA(metavariable)).forEach( c => {
      // Compute the new ProperName
      c.setAttribute('ProperName', c.text())
      // apply it to all c's in it's scope
      decl.scope().filter( x => x instanceof LurchSymbol && x.text()===c.text())
        .forEach(s => s.setAttribute('ProperName',c.getAttribute('ProperName')))
    })
  })

  // Now add tick marks for all symbols declared with Let's.
  doc.lets().forEach( decl => {
    decl.symbols().filter(s=>!s.isA(metavariable)).forEach( c => {
      // Compute the new ProperName
      let cname = c.properName()
      if (!cname.endsWith("'")) c.setAttribute( 'ProperName' , cname + "'" )
      c.declaredBy = decl
      // apply it to all c's in it's scope
      decl.scope().filter( x => x instanceof LurchSymbol && x.text()===c.text())
        .forEach( s => {
          s.declaredBy = decl
          s.setAttribute('ProperName',c.getAttribute('ProperName'))
      })
    })
  })

}

//////////////////////////////////////////////////////////////////////////////
// Replace bound variables in formulas
//
// Matching checks if a match would violate variable capture, but
// Formula.instantiate does not.  So we need to turn all bound variables in
// formulas to a canonical form e.g. y₀, y₁, ... that cannot be entered by the
// user. Applying this to formulas before instantiating fixes that.  
//
// TODO: 
// * When making this permanent, just upgrade Formula.instantiate to respect
//   ProperNames so we can delete this routine and just use the previous one
//   instead. 
// * Also enforce the requirement that user's can't enter any of y₀, y₁, ... .
// * We might want to keep the user's original bound formula variable names
//   somewhere for feedback purposes, but the canonical ones aren't that bad for
//   now.
export const replaceBindings = ( expr , symb='y' ) => {
  const stack = new Map()
  const push = () => stack.forEach( value => value.push( value.last() ) )
  const pop = () => stack.forEach( ( value, key ) => {
      if ( value.length > 0 ) value.pop()
      else stack.delete( key )
  } )
  const get = name => stack.has( name ) ? stack.get( name ).last()
                                        : undefined
  const set = ( name, newname ) => {
      if ( stack.has( name ) ) {
          const array = stack.get( name )
          array[array.length-1] = newname
      } else {
          stack.set( name, [ newname ] )
      }
  }
  let counter = 0
  const solve = e => {
      if ( e instanceof LurchSymbol && stack.has(e.text()) ) 
          e.rename( get( e.text() ) )
      if ( e instanceof BindingExpression ) {
          push()
          e.boundSymbolNames().forEach( name => {
              counter++
              set( name, `${symb}${subscript(counter)}` ) 
          })
          e.children().forEach( c => solve(c) )
          pop()
      }
      if ( e instanceof Application)
          e.children().forEach( c => solve(c) )
  }
  solve( expr )
}

//////////////////////////////////////////////////////////////////////////////
// Rename bound variables for alpha equivalence
//
// We also need alpha equivalent statements to have the same propositional form.
// This assigns canonical names x₀ , x₁ , etc. as the ProperName attribute of
// bound variables, and that is what .prop uses to make the propositional form.
export const renameBindings = ( expr , symb='x' ) => {
  const stack = new Map()
  const push = () => stack.forEach( value => value.push( value.last() ) )
  const pop = () => stack.forEach( ( value, key ) => {
    value.pop()
    if ( value.length == 0 ) stack.delete( key )
  } )
  const get = name => stack.has( name ) ? stack.get( name ).last()
                                        : undefined
  const set = ( name, newname ) => {
    if ( stack.has( name ) ) {
      const array = stack.get( name )
      array[array.length-1] = newname
    } else {
      stack.set( name, [ newname ] )
    }
  }
  let counter = 0
  const solve = e => {
    if ( e instanceof LurchSymbol && stack.has(e.text()) ) 
      e.setAttribute( 'ProperName' , get( e.text() ) )
    if ( e instanceof BindingExpression ) {
      push()
      let savecounter = counter
      e.boundSymbolNames().forEach( name => {
        counter++
        set( name, `${symb}${subscript(counter)}` ) 
      })
      e.children().forEach( c => solve(c) )
      counter = savecounter
      pop()
    }
    if ( e instanceof Application)
      e.children().forEach( c => solve(c) )
  }
  solve( expr )
}

// We keep a list of js attribute names that are used by validation.  Since
// these are computed from the original content of the LC supplied by the user
// having this list lets us reset the entire LC by removing these attributes and
// recomputing them to revalidate it from scratch when we need to. 
export const computedAttributes = [
  'constant', 'properName'
] 

// Reset all of the attributes computed by these docify utilities.  
//
// NOTE: it might be faster to just rebuild and recompute the whole document
// from source, but we put this here just in case it's needed. 
export const resetComputedAttributes = doc => {
  [...doc.descendantsIterator()].forEach( x => {
    computedAttributes.forEach( a => delete x[a])
  })
  return doc
}

//////////////////////////////////////////////////////////////////////////////
// Mark Declared Symbols
//
// Mark explicitly declared symbols s, throughout an LC by setting
// s.constant=true
export const markDeclaredSymbols = doc => {
  // fetch all of the declarations
  let Declares = doc.Declares()
  // fetch all of the symbols
  let symbols = doc.descendantsSatisfying( x => x instanceof LurchSymbol )
  // for each one, see if it is in the scope of any Declare declaration of that symbol
  symbols.forEach( s => {
      if (Declares.some( d => 
        (d.isAccessibleTo(s) || (s.parent()===d)) && 
         d.symbols().map(x=>x.text()).includes(s.text())
      ))
      s.constant = true
    }
  )
  return doc
}
